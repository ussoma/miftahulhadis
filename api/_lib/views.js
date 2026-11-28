// Намоишҳо (матн + тугмаҳо). Ҳамаи маълумот аз Supabase меояд.
import { esc } from './tg.js'
import { tr, BRAND, SECTION_LABELS } from './i18n.js'
import {
  parseNote, enc, dec, pick, mediaOf, getBooks, bookByAnyId, getSections, getChapters, chaptersOf,
  hadithPage, contentPage, getHadith, getContent, getMany, search, favList, isFav
} from './data.js'
import { SURAH_TG } from './surahs.js'

const WEB_APP_URL = () => process.env.WEB_APP_URL || 'https://miftahulhadis.vercel.app'
const BOT_USERNAME = () => process.env.BOT_USERNAME || 'Miftahulhadis_bot'
const PAGE = 8
const MAX = 3800

const btn = (text, data) => ({ text, callback_data: data })
const kb = rows => ({ inline_keyboard: rows.filter(row => row.length) })
const clean = v => String(v ?? '').trim()
const clip = (text, n) => {
  const s = clean(text).replace(/\s+/g, ' ')
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

const appRow = lang => [{ text: tr(lang, 'openMiftah'), web_app: { url: WEB_APP_URL() } }]

function pager(prefix, page, total, size) {
  const pages = Math.max(1, Math.ceil(total / size))
  if (pages <= 1) return []
  const row = []
  if (page > 0) row.push(btn('◀️', `${prefix}:${page - 1}`))
  row.push(btn(`${page + 1}/${pages}`, 'n'))
  if (page < pages - 1) row.push(btn('▶️', `${prefix}:${page + 1}`))
  return row
}

// Матни дароз ба порчаҳои ≤ n ҳарф (дар сарҳади сатр/ҷумла)
function chunkRaw(raw, n = 3000) {
  const text = clean(raw)
  if (text.length <= n) return text ? [text] : []
  const out = []
  let rest = text
  while (rest.length > n) {
    let cut = Math.max(rest.lastIndexOf('\n', n), rest.lastIndexOf('. ', n), rest.lastIndexOf(' ', n))
    if (cut < n * 0.5) cut = n
    out.push(rest.slice(0, cut + 1).trim())
    rest = rest.slice(cut + 1)
  }
  if (rest.trim()) out.push(rest.trim())
  return out
}

// Порчаҳои HTML-ро ба паёмҳои ≤ MAX мепайвандад
function pack(parts) {
  const out = []
  let cur = ''
  for (const part of parts) {
    if (!part) continue
    if (cur && (cur.length + part.length + 2) > MAX) { out.push(cur); cur = part }
    else cur = cur ? `${cur}\n\n${part}` : part
  }
  if (cur) out.push(cur)
  return out
}

const quote = raw => chunkRaw(raw).map(piece => `<blockquote>${esc(piece)}</blockquote>`)
const plain = raw => chunkRaw(raw).map(piece => esc(piece))

// ---------- меню ----------
export async function mainMenu(c, withWelcome, name) {
  const sections = await getSections(c.lang)
  const rows = []
  for (let i = 0; i < sections.length; i += 2) {
    rows.push(sections.slice(i, i + 2).map(item => btn(item.label, `s:${item.slug}:0`)))
  }
  rows.push([btn(tr(c.lang, 'search'), 'S'), btn(tr(c.lang, 'favorites'), 'F:0')])
  rows.push([btn(tr(c.lang, 'language'), 'L'), { text: tr(c.lang, 'openApp'), web_app: { url: WEB_APP_URL() } }])
  const head = withWelcome
    ? `<b>${esc(tr(c.lang, 'salam'))}</b> 🤍${name ? `\n${esc(name)}!` : ''}\n\n${esc(tr(c.lang, 'welcome'))}\n\n📖 <i>${c.lang === 'ru' ? 'Ищи знание. Действуй согласно ему.' : 'Илмро ҷустуҷӯ кун. Ба он амал намо.'}</i>\n\n${esc(tr(c.lang, 'menuTitle'))}`
    : `🕋 <b>${BRAND}</b>\n\n${esc(tr(c.lang, 'menuTitle'))}`
  return { html: [head], keyboard: kb(rows) }
}

export function languageView(c) {
  return {
    html: [esc(tr(c.lang, 'langTitle'))],
    keyboard: kb([[btn(`${c.lang === 'tg' ? '✅ ' : ''}Тоҷикӣ`, 'L:tg'), btn(`${c.lang === 'ru' ? '✅ ' : ''}Русский`, 'L:ru')], [btn(tr(c.lang, 'home'), 'm')]])
  }
}

export function searchPrompt(c) {
  return { html: [tr(c.lang, 'searchPrompt')], keyboard: kb([[btn(tr(c.lang, 'home'), 'm')]]) }
}

// ---------- рӯйхати умумӣ ----------
function listView(c, { title, entries, page, total, prefix, back, empty }) {
  const rows = entries.map(entry => [btn(entry.text, entry.data)])
  rows.push(pager(prefix, page, total, PAGE))
  rows.push([btn(tr(c.lang, 'back'), back), btn(tr(c.lang, 'home'), 'm')])
  const body = entries.length ? '' : `\n\n${esc(empty || tr(c.lang, 'empty'))}`
  return { html: [`${title}${body}`], keyboard: kb(rows) }
}

const chapterTitle = (c, ch) => (c.lang === 'ru' && ch.titleRu ? ch.titleRu : ch.title)

// Рӯйхати омехтаи бобҳо + маводи бе боб
async function mixed(chapters, fetchItems, page) {
  const chPart = chapters.slice(page * PAGE, page * PAGE + PAGE)
  const need = PAGE - chPart.length
  const offset = Math.max(0, page * PAGE - chapters.length)
  let res = await fetchItems(offset, Math.max(need, 1))
  if (!res.rows.length && offset > 0) {
    const first = await fetchItems(0, 1)
    res = { rows: [], total: first.total }
  }
  return { chPart, items: need > 0 ? res.rows.slice(0, need) : [], total: chapters.length + res.total }
}

function hadithEntry(c, row, bookName) {
  const meta = parseNote(row.source_note).meta
  const isPre = meta.is_preface === true || meta.is_preface === 'true' || String(row.hadith_number) === '0'
  const label = isPre ? `📖 ${tr(c.lang, 'preface')}` : `№${row.hadith_number}`
  const text = pick(c.lang, row.tajik_text, meta.russian_text || row.russian_text) || row.arabic_text
  return `${label} · ${clip(meta.title || text, 40)}`
}

// Матни асосии маводи content_items: тоҷикӣ -> content_text -> answer_text; русӣ: meta.russian_text -> ustuni russian_text
const contentBody = (c, row, meta) =>
  pick(c.lang, row.tajik_text || row.content_text || row.answer_text, meta.russian_text || row.russian_text)

function contentEntry(c, row) {
  const { meta } = parseNote(row.source_note)
  const isPre = meta.is_preface === true || meta.is_preface === 'true'
  const title = clean(row.question_text) || pick(c.lang, row.title, meta.title_ru) || clip(contentBody(c, row, meta) || row.arabic_text, 44)
  return `${isPre ? '📖 ' : '▫️ '}${clip(title, 52)}`
}

// ---------- бахши умумӣ (азкор, дуо, суннат ва ғ.) ----------
export async function sectionView(c, slug, page) {
  if (slug === 'hadith') return booksView(c, page)
  if (slug === 'quran') return quranListView(c, 0)

  const sections = await getSections(c.lang)
  const section = sections.find(item => item.slug === slug)
  if (!section) return { html: [esc(tr(c.lang, 'notFound'))], keyboard: kb([[btn(tr(c.lang, 'home'), 'm')]]) }

  const chapters = chaptersOf(await getChapters(), 'section', slug === 'adhkar' ? ['adhkar', 'duas'] : [slug])
  const { chPart, items, total } = await mixed(chapters, (off, lim) => contentPage(slug, '', off, lim), page)
  const entries = [
    ...chPart.map(ch => ({ text: `📁 ${clip(chapterTitle(c, ch), 52)}`, data: `ch:${enc(ch.id)}:0` })),
    ...items.map(row => ({ text: contentEntry(c, row), data: `ci:${enc(row.id)}:${page}` }))
  ]
  return listView(c, { title: `<b>${esc(section.label)}</b>`, entries, page, total, prefix: `s:${slug}`, back: 'm' })
}

// ---------- ҳадис ----------
export async function booksView(c, page) {
  const books = await getBooks()
  const slice = books.slice(page * PAGE, page * PAGE + PAGE)
  const entries = slice.map(book => ({ text: `📖 ${clip((c.lang === 'ru' && book.nameRu) || book.name, 54)}`, data: `hb:${enc(book.key)}:0` }))
  return listView(c, { title: `<b>${esc(SECTION_LABELS.hadith[c.lang === 'ru' ? 1 : 0])}</b>\n${esc(tr(c.lang, 'books'))}`, entries, page, total: books.length, prefix: 's:hadith', back: 'm' })
}

export async function bookView(c, bookCode, page) {
  const books = await getBooks()
  const book = bookByAnyId(books, dec(bookCode))
  if (!book) return { html: [esc(tr(c.lang, 'notFound'))], keyboard: kb([[btn(tr(c.lang, 'home'), 'm')]]) }
  const chapters = chaptersOf(await getChapters(), 'book', book.ids)
  const { chPart, items, total } = await mixed(chapters, (off, lim) => hadithPage(book.ids, '', off, lim), page)
  const entries = [
    ...chPart.map(ch => ({ text: `📁 ${clip(chapterTitle(c, ch), 52)}`, data: `ch:${enc(ch.id)}:0` })),
    ...items.map(row => ({ text: hadithEntry(c, row, book.name), data: `hd:${enc(row.id)}:${page}` }))
  ]
  return listView(c, { title: `📚 <b>${esc((c.lang === 'ru' && book.nameRu) || book.name)}</b>`, entries, page, total, prefix: `hb:${bookCode}`, back: 's:hadith:0' })
}

export async function chapterView(c, chapterCode, page) {
  const id = dec(chapterCode)
  const chapters = await getChapters()
  const chapter = chapters.find(item => item.id === id)
  if (!chapter) return { html: [esc(tr(c.lang, 'notFound'))], keyboard: kb([[btn(tr(c.lang, 'home'), 'm')]]) }
  const isBook = chapter.parentKind === 'book'
  let entries = []
  let total = 0
  let back = 'm'
  if (isBook) {
    const books = await getBooks()
    const book = bookByAnyId(books, chapter.parent)
    const res = await hadithPage(book ? book.ids : [chapter.parent], id, page * PAGE, PAGE)
    entries = res.rows.map(row => ({ text: hadithEntry(c, row), data: `hd:${enc(row.id)}:${page}` }))
    total = res.total
    back = book ? `hb:${enc(book.key)}:0` : 's:hadith:0'
  } else {
    const res = await contentPage(chapter.parent, id, page * PAGE, PAGE)
    entries = res.rows.map(row => ({ text: contentEntry(c, row), data: `ci:${enc(row.id)}:${page}` }))
    total = res.total
    back = `s:${chapter.parent}:0`
  }
  return listView(c, { title: `📁 <b>${esc(chapterTitle(c, chapter))}</b>`, entries, page, total, prefix: `ch:${chapterCode}`, back })
}

// ---------- корти мавод (ҳадис ё мазмун) ----------
function shareUrl(kind, id, snippet) {
  const link = `https://t.me/${BOT_USERNAME()}?start=${kind}_${enc(id)}`
  return `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(clip(snippet, 180))}`
}

function mediaButtons(c, kind, id, media) {
  return media.slice(0, 8).map((item, index) => {
    const same = media.filter(m => m.k === item.k).length > 1
    const n = same ? ` ${media.filter((m, i) => m.k === item.k && i <= index).length}` : ''
    return btn(`${tr(c.lang, item.k)}${n}`, `md:${kind}:${enc(id)}:${index}`)
  })
}

function itemKeyboard(c, { kind, id, fav, media, back, snippet }) {
  const rows = []
  const mrow = mediaButtons(c, kind, id, media)
  for (let i = 0; i < mrow.length; i += 3) rows.push(mrow.slice(i, i + 3))
  rows.push([
    btn(tr(c.lang, 'copy'), `cp:${kind}:${enc(id)}`),
    btn(fav ? tr(c.lang, 'favDel') : tr(c.lang, 'favAdd'), `fv:${kind}:${enc(id)}`)
  ])
  rows.push([{ text: tr(c.lang, 'share'), url: shareUrl(kind, id, snippet) }])
  rows.push([btn(tr(c.lang, 'back'), back), btn(tr(c.lang, 'home'), 'm')])
  rows.push(appRow(c.lang))
  return kb(rows)
}

function cardParts(c, { head, title, arabic, text, explanation, source }) {
  const parts = [head]
  if (title) parts.push(`<b>${esc(title)}</b>`)
  parts.push(...quote(arabic))
  parts.push(...plain(text))
  if (source) parts.push(`📌 <i>${esc(clip(source, 500))}</i>`)
  if (explanation) {
    const [first, ...rest] = chunkRaw(explanation)
    parts.push(`💡 <b>${esc(tr(c.lang, 'explanation'))}</b>\n<blockquote expandable>${esc(first)}</blockquote>`)
    rest.forEach(piece => parts.push(`<blockquote expandable>${esc(piece)}</blockquote>`))
  }
  parts.push(`<i>${esc(tr(c.lang, 'appPrompt'))}</i>`)
  return parts
}

export async function hadithView(c, code, page) {
  const id = dec(code)
  const row = await getHadith(id)
  if (!row) return { html: [esc(tr(c.lang, 'notFound'))], keyboard: kb([[btn(tr(c.lang, 'home'), 'm')]]) }
  const { source, meta } = parseNote(row.source_note)
  const books = await getBooks()
  const book = bookByAnyId(books, row.book_id)
  const bookName = book ? ((c.lang === 'ru' && book.nameRu) || book.name) : tr(c.lang, 'hadith')
  const isPre = meta.is_preface === true || meta.is_preface === 'true' || String(row.hadith_number) === '0'
  const num = isPre ? tr(c.lang, 'preface') : `№${row.hadith_number}`
  const text = pick(c.lang, row.tajik_text, meta.russian_text || row.russian_text)
  const explanation = pick(c.lang, meta.explanation_tg || row.commentary, meta.explanation_ru)
  const title = pick(c.lang, meta.title, meta.title_ru)
  const html = pack(cardParts(c, {
    head: `📚 <b>${esc(bookName)}</b> · ${esc(num)}`, title, arabic: row.arabic_text, text, explanation, source
  }))
  const chapterId = clean(meta.chapter_id)
  const back = chapterId ? `ch:${enc(chapterId)}:${page}` : (book ? `hb:${enc(book.key)}:${page}` : 's:hadith:0')
  const fav = c.tgId ? await isFav(c.tgId, 'hadith', id) : false
  return { html, keyboard: itemKeyboard(c, { kind: 'h', id, fav, media: mediaOf(meta), back, snippet: text || row.arabic_text }), multi: true }
}

export async function contentView(c, code, page) {
  const id = dec(code)
  const row = await getContent(id)
  if (!row) return { html: [esc(tr(c.lang, 'notFound'))], keyboard: kb([[btn(tr(c.lang, 'home'), 'm')]]) }
  const { source, meta } = parseNote(row.source_note)
  const sections = await getSections(c.lang)
  const slug = row.section_slug === 'duas' ? 'duas' : row.section_slug
  const section = sections.find(item => item.slug === slug) || sections.find(item => item.slug === 'adhkar' && slug === 'duas')
  const label = section ? section.label : SECTION_LABELS.adhkar[c.lang === 'ru' ? 1 : 0]
  const text = contentBody(c, row, meta)
  const explanation = pick(c.lang, meta.explanation_tg, meta.explanation_ru)
  const title = clean(row.question_text) || pick(c.lang, row.title, meta.title_ru)
  const html = pack(cardParts(c, { head: `<b>${esc(label)}</b>`, title, arabic: row.arabic_text, text, explanation, source }))
  const chapterId = clean(meta.chapter_id)
  const back = chapterId ? `ch:${enc(chapterId)}:${page}` : `s:${slug === 'duas' ? 'duas' : slug}:${page}`
  const fav = c.tgId ? await isFav(c.tgId, 'content', id) : false
  return { html, keyboard: itemKeyboard(c, { kind: 'c', id, fav, media: mediaOf(meta, row), back, snippet: title || text || row.arabic_text }), multi: true }
}

// Нусха: матн дар блоки моноширинӣ — бо пахш нусха мешавад
export async function copyText(c, kind, code) {
  const id = dec(code)
  if (kind === 'h') {
    const row = await getHadith(id)
    if (!row) return null
    const { source, meta } = parseNote(row.source_note)
    const text = pick(c.lang, row.tajik_text, meta.russian_text || row.russian_text)
    return [row.arabic_text, text, source && `${tr(c.lang, 'source')}: ${source}`].filter(Boolean).join('\n\n')
  }
  const row = await getContent(id)
  if (!row) return null
  const { source, meta } = parseNote(row.source_note)
  const text = contentBody(c, row, meta)
  return [clean(row.question_text) || pick(c.lang, row.title, meta.title_ru), row.arabic_text, text, source && `${tr(c.lang, 'source')}: ${source}`].filter(Boolean).join('\n\n')
}

export async function mediaOfItem(kind, code) {
  const id = dec(code)
  const row = kind === 'h' ? await getHadith(id) : await getContent(id)
  return row ? mediaOf(parseNote(row.source_note).meta, row) : []
}

// ---------- дӯстдоштаҳо ----------
export async function favoritesView(c, page) {
  const all = c.tgId ? await favList(c.tgId) : []
  const slice = all.slice(page * PAGE, page * PAGE + PAGE)
  const hIds = slice.filter(item => item.kind === 'hadith').map(item => item.item_id)
  const cIds = slice.filter(item => item.kind === 'content').map(item => item.item_id)
  const [hRows, cRows] = await Promise.all([getMany('hadiths', hIds), getMany('content_items', cIds)])
  const books = hRows.length ? await getBooks() : []
  const entries = []
  for (const fav of slice) {
    if (fav.kind === 'hadith') {
      const row = hRows.find(item => String(item.id) === String(fav.item_id))
      if (row) entries.push({ text: `📚 ${hadithEntry(c, row)}`, data: `hd:${enc(row.id)}:0` })
    } else {
      const row = cRows.find(item => String(item.id) === String(fav.item_id))
      if (row) entries.push({ text: contentEntry(c, row), data: `ci:${enc(row.id)}:0` })
    }
  }
  void books
  return listView(c, { title: `<b>${esc(tr(c.lang, 'favTitle'))}</b>`, entries, page, total: all.length, prefix: 'F', back: 'm', empty: tr(c.lang, 'favEmpty') })
}

// ---------- ҷустуҷӯ ----------
const norm = text => String(text || '').toLowerCase()
  .replace(/[ً-ٰٟـۖ-ۭ]/g, '')
  .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
  .replace(/ӣ/g, 'и').replace(/ӯ/g, 'у').replace(/ғ/g, 'г').replace(/қ/g, 'к').replace(/ҷ/g, 'ч').replace(/ҳ/g, 'х').replace(/ё/g, 'е')

export async function searchView(c, query, page) {
  const SIZE = 5
  const q = clean(query)
  let extra = []
  if (page === 0) {
    const nq = norm(q)
    const sections = await getSections(c.lang)
    extra = sections.filter(s => nq.length > 1 && (norm(s.label).includes(nq) || norm(SECTION_LABELS[s.slug] ? SECTION_LABELS[s.slug].join(' ') : '').includes(nq))).slice(0, 3)
  }
  const { rows, total } = await search(q, page * SIZE, SIZE, c.lang)
  const lines = []
  const buttons = []
  extra.forEach(s => { lines.push(`📂 <b>${esc(s.label)}</b>`); buttons.push(btn(`📂 ${clip(s.label, 24)}`, `s:${s.slug}:0`)) })
  rows.forEach((row, index) => {
    const icon = row.kind === 'book' ? '📖' : row.kind === 'hadith' ? '📚' : '▫️'
    lines.push(`<b>${page * SIZE + index + 1}.</b> ${icon} ${esc(clip(row.title, 80))}${row.snippet ? `\n<i>${esc(clip(row.snippet, 140))}</i>` : ''}`)
    const data = row.kind === 'book' ? `hb:${enc(row.id)}:0` : row.kind === 'hadith' ? `hd:${enc(row.id)}:0` : `ci:${enc(row.id)}:0`
    buttons.push(btn(`▶️ ${page * SIZE + index + 1}`, data))
  })
  if (!lines.length) {
    return { html: [`🔍 <b>${esc(clip(q, 60))}</b>\n\n${esc(tr(c.lang, 'searchNone'))}`], keyboard: kb([[btn(tr(c.lang, 'search'), 'S'), btn(tr(c.lang, 'home'), 'm')]]) }
  }
  const rowsKb = []
  for (let i = 0; i < buttons.length; i += 5) rowsKb.push(buttons.slice(i, i + 5))
  rowsKb.push(pager('q', page, total, SIZE))
  rowsKb.push([btn(tr(c.lang, 'search'), 'S'), btn(tr(c.lang, 'home'), 'm')])
  return {
    html: [`🔍 <b>${esc(clip(q, 60))}</b> — ${esc(tr(c.lang, 'searchResults'))} (${total})\n\n${lines.join('\n\n')}`],
    keyboard: kb(rowsKb)
  }
}

// ---------- Қуръон (матн аз api.alquran.cloud, мисли Mini App) ----------
const surahCache = new Map()

async function loadSurah(n) {
  if (surahCache.has(n)) return surahCache.get(n)
  const response = await fetch(`https://api.alquran.cloud/v1/surah/${n}/editions/quran-uthmani,tg.ayati,ru.kuliev`)
  if (!response.ok) throw new Error('quran api ' + response.status)
  const json = await response.json()
  const by = id => (json.data.find(item => item.edition && item.edition.identifier === id) || {}).ayahs || []
  const data = { ar: by('quran-uthmani'), tg: by('tg.ayati'), ru: by('ru.kuliev') }
  surahCache.set(n, data)
  return data
}

function stripBismillah(text, n, index) {
  if (index !== 0 || n === 1 || n === 9) return text
  const normW = w => String(w || '').replace(/[ً-ٰٟۖ-ۭ]/g, '')
  const words = String(text).split(/\s+/)
  if (words.length > 4 && normW(words[0]) === 'بسم' && normW(words[1]).endsWith('لله')) return words.slice(4).join(' ')
  return text
}

export function quranListView(c, page) {
  const SIZE = 12
  const slice = SURAH_TG.slice(page * SIZE, page * SIZE + SIZE)
  const rows = []
  for (let i = 0; i < slice.length; i += 2) {
    rows.push(slice.slice(i, i + 2).map((name, j) => btn(`${page * SIZE + i + j + 1}. ${name}`, `qs:${page * SIZE + i + j + 1}:0`)))
  }
  rows.push(pager('qr', page, SURAH_TG.length, SIZE))
  rows.push([btn(tr(c.lang, 'back'), 'm'), btn(tr(c.lang, 'home'), 'm')])
  return { html: [`<b>${esc(SECTION_LABELS.quran[c.lang === 'ru' ? 1 : 0])}</b>\n${esc(tr(c.lang, 'surahs'))}`], keyboard: kb(rows) }
}

export async function surahView(c, n, page) {
  const data = await loadSurah(n)
  const tl = c.lang === 'ru' ? data.ru : data.tg
  // Саҳифабандӣ аз рӯи ҳаҷми матн (ояти дароз ҷо мегирад)
  const blocks = data.ar.map((ayah, index) => {
    const arabic = stripBismillah(ayah.text, n, index)
    const tail = clean(tl[index] && tl[index].text)
    return `<blockquote>${esc(arabic)} ﴿${index + 1}﴾</blockquote>\n${esc(tail)}`
  })
  const pages = []
  let cur = []
  let len = 0
  for (const block of blocks) {
    if (cur.length && (len + block.length > 3200 || cur.length >= 6)) { pages.push(cur); cur = []; len = 0 }
    cur.push(block); len += block.length + 2
  }
  if (cur.length) pages.push(cur)
  const p = Math.min(Math.max(page, 0), Math.max(pages.length - 1, 0))
  const head = `📖 <b>${esc(tr(c.lang, 'surah'))} ${n} · ${esc(SURAH_TG[n - 1])}</b> (${data.ar.length} ${esc(tr(c.lang, 'ayahs'))})`
  const rows = []
  rows.push(pager(`qs:${n}`, p, pages.length, 1))
  rows.push([btn(tr(c.lang, 'qari'), `qa:${n}`)])
  const nav = []
  if (n > 1) nav.push(btn(tr(c.lang, 'prevSurah'), `qs:${n - 1}:0`))
  if (n < 114) nav.push(btn(tr(c.lang, 'nextSurah'), `qs:${n + 1}:0`))
  rows.push(nav)
  rows.push([btn(tr(c.lang, 'back'), `qr:${Math.floor((n - 1) / 12)}`), btn(tr(c.lang, 'home'), 'm')])
  rows.push(appRow(c.lang))
  const html = `${head}\n\n${(pages[p] || []).join('\n\n')}\n\n<i>${esc(tr(c.lang, 'appPrompt'))}</i>`
  return { html: [html], keyboard: kb(rows) }
}

export const surahAudioUrls = n => [
  `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${n}.mp3`,
  `https://cdn.islamic.app/quran/audio-surah/ar.alafasy/${n}.mp3`
]
