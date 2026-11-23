// Хондани маълумот аз Supabase (ҳамон ҷадвалҳои Mini App; танҳо маводи нашршуда).
import { select, rpc, upsert, remove } from './db.js'
import { SECTION_LABELS, STATIC_ORDER } from './i18n.js'

const META_PREFIX = '__MIFTAH_META_V1__:'

export function parseNote(value) {
  const text = String(value || '')
  if (!text.startsWith(META_PREFIX)) return { source: text, meta: {} }
  try {
    const parsed = JSON.parse(text.slice(META_PREFIX.length))
    return { source: parsed.source || '', meta: parsed.meta || {} }
  } catch {
    return { source: text, meta: {} }
  }
}

const clean = value => String(value ?? '').trim()

// ---------- шиносаи кӯтоҳ барои callback_data (≤ 64 байт) ----------
export function enc(id) {
  const s = String(id)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) {
    return 'u' + Buffer.from(s.replace(/-/g, ''), 'hex').toString('base64url')
  }
  if (/^\d+$/.test(s)) return 'n' + s
  return 'r' + s
}

export function dec(code) {
  const kind = code[0]
  const body = code.slice(1)
  if (kind === 'u') {
    const hex = Buffer.from(body, 'base64url').toString('hex')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }
  return body
}

// ---------- забони маводи шахсӣ ----------
export const pick = (lang, tg, ru) => (lang === 'ru' && clean(ru) ? clean(ru) : clean(tg))

// Намуди файл аз паси URL (барои content_items.media_url, ки навъ надорад)
export function kindOfUrl(url) {
  const u = clean(url).split('?')[0].toLowerCase()
  if (/\.(mp3|m4a|aac|ogg|oga|opus|wav|flac)$/.test(u)) return 'audio'
  if (/\.(mp4|mov|m4v|webm|mkv)$/.test(u)) return 'video'
  if (/\.(jpe?g|png|webp|gif)$/.test(u)) return 'image'
  if (/\.pdf$/.test(u)) return 'pdf'
  return /youtu\.?be/.test(u) ? 'video' : 'pdf' // номаълум -> ҳамчун ҳуҷҷат/пайванд фиристода мешавад
}

export function mediaOf(meta, row) {
  const list = []
  if (clean(meta.audio_url)) list.push({ k: 'audio', u: clean(meta.audio_url), n: '' })
  if (clean(meta.video_url)) list.push({ k: 'video', u: clean(meta.video_url), n: '' })
  if (clean(meta.image_url)) list.push({ k: 'image', u: clean(meta.image_url), n: '' })
  for (const f of Array.isArray(meta.files) ? meta.files : []) {
    if (f && clean(f.u) && ['audio', 'video', 'image', 'pdf'].includes(f.k)) list.push({ k: f.k, u: clean(f.u), n: clean(f.n) })
  }
  const direct = clean(row && row.media_url)
  if (/^https?:\/\//i.test(direct) && !list.some(item => item.u === direct)) list.push({ k: kindOfUrl(direct), u: direct, n: '' })
  return list
}

// ---------- китобҳо ----------
const normName = name => clean(name).toLowerCase().replace(/\s+/g, ' ')

export async function getBooks() {
  const rows = await select('hadith_books', 'select=*&order=sort_order.asc.nullslast')
  const groups = []
  const byName = new Map()
  for (const row of rows || []) {
    if (row.is_active === false) continue
    const name = clean(row.name || row.title)
    if (!name) continue
    const k = normName(name)
    if (byName.has(k)) byName.get(k).ids.push(String(row.id))
    else {
      const g = { key: String(row.id), ids: [String(row.id)], name, nameRu: clean(row.name_ru) }
      byName.set(k, g)
      groups.push(g)
    }
  }
  return groups
}

export const bookByAnyId = (books, id) => books.find(book => book.ids.includes(String(id)))

// ---------- бахшҳо ----------
export async function getSections(lang) {
  let rows = []
  try {
    rows = (await select('sections', 'select=*&order=sort_order.asc.nullslast')) || []
  } catch { /* ҷадвали sections набошад, бахшҳои стандартӣ кифоянд */ }
  const out = []
  const seen = new Set()
  for (const slug of STATIC_ORDER) {
    const row = rows.find(item => item.slug === slug)
    if (row && row.is_active === false) continue
    out.push({ slug, label: SECTION_LABELS[slug][lang === 'ru' ? 1 : 0] })
    seen.add(slug)
  }
  for (const row of rows) {
    const slug = clean(row.slug)
    if (!slug || seen.has(slug) || slug.startsWith('__') || slug === 'arabic' || row.is_active === false) continue
    seen.add(slug)
    out.push({ slug, label: `📂 ${clean(row.title || row.name) || slug}` })
  }
  return out
}

// ---------- бобҳо ----------
export async function getChapters() {
  const rows = await select('content_items', 'select=id,title,source_note&section_slug=eq.__chapter&is_published=eq.true&limit=3000')
  return (rows || []).map(row => {
    const { meta } = parseNote(row.source_note)
    return {
      id: String(row.id), title: clean(row.title), titleRu: clean(meta.title_ru),
      parentKind: clean(meta.parent_kind), parent: clean(meta.parent), order: Number(meta.order) || 0
    }
  })
}

export const chaptersOf = (chapters, kind, keys) =>
  chapters
    .filter(item => item.parentKind === kind && keys.includes(item.parent))
    .sort((a, b) => a.order - b.order)

// ---------- рӯйхати маводи саҳифабандишуда (дар SQL: тартиби рақамӣ ва муқаддима дар боло) ----------
export async function hadithPage(bookIds, chapter, offset, limit) {
  const rows = (await rpc('bot_hadith_list', { p_books: bookIds, p_chapter: chapter, p_off: offset, p_lim: limit })) || []
  return { rows, total: rows.length ? Number(rows[0].total) : 0 }
}

export async function contentPage(section, chapter, offset, limit) {
  const rows = (await rpc('bot_content_list', { p_section: section, p_chapter: chapter, p_off: offset, p_lim: limit })) || []
  return { rows, total: rows.length ? Number(rows[0].total) : 0 }
}

// Бахши ғайрифаъол (sections.is_active=false) ва китоби ғайрифаъол (hadith_books.is_active=false) дар бот нишон дода намешавад.
async function inactiveSlugs() {
  try {
    const rows = (await select('sections', 'select=slug,is_active')) || []
    const bySlug = new Map()
    for (const row of rows) bySlug.set(row.slug, (bySlug.get(row.slug) || false) || row.is_active !== false)
    return new Set([...bySlug].filter(([, active]) => !active).map(([slug]) => slug))
  } catch { return new Set() }
}

async function inactiveBookIds() {
  try {
    const rows = (await select('hadith_books', 'select=id,is_active')) || []
    return new Set(rows.filter(row => row.is_active === false).map(row => String(row.id)))
  } catch { return new Set() }
}

export async function getHadith(id) {
  const rows = await select('hadiths', `select=*&id=eq.${encodeURIComponent(id)}&is_published=eq.true&limit=1`)
  const row = rows && rows[0]
  if (!row) return null
  return (await inactiveBookIds()).has(String(row.book_id)) ? null : row
}

export async function getContent(id) {
  const rows = await select('content_items', `select=*&id=eq.${encodeURIComponent(id)}&is_published=eq.true&limit=1`)
  const row = rows && rows[0]
  if (!row || String(row.section_slug || '').startsWith('__')) return null
  return (await inactiveSlugs()).has(row.section_slug) ? null : row
}

export async function getMany(table, ids) {
  if (!ids.length) return []
  const list = ids.map(id => encodeURIComponent(id)).join(',')
  const rows = (await select(table, `select=*&id=in.(${list})&is_published=eq.true`)) || []
  if (table === 'content_items') {
    const off = await inactiveSlugs()
    return rows.filter(row => !off.has(row.section_slug))
  }
  if (table === 'hadiths') {
    const off = await inactiveBookIds()
    return rows.filter(row => !off.has(String(row.book_id)))
  }
  return rows
}

// ---------- ҷустуҷӯ ----------
export async function search(query, offset, limit, lang = 'tg') {
  const rows = (await rpc('bot_search', { p_q: query, p_off: offset, p_lim: limit, p_lang: lang === 'ru' ? 'ru' : 'tg' })) || []
  return { rows, total: rows.length ? Number(rows[0].total) : 0 }
}

// ---------- корбар: забон/ҳолат ----------
export async function getPrefs(tgId) {
  try {
    const rows = await select('bot_user_prefs', `select=*&tg_id=eq.${tgId}&limit=1`)
    return rows && rows[0] ? rows[0] : { tg_id: tgId, lang: 'tg', state: null, last_query: null }
  } catch {
    return { tg_id: tgId, lang: 'tg', state: null, last_query: null, broken: true }
  }
}

export async function setPrefs(tgId, patch) {
  await upsert('bot_user_prefs', { tg_id: tgId, ...patch, updated_at: new Date().toISOString() }, 'tg_id')
}

// ---------- дӯстдоштаҳо (танҳо барои худи корбар: tg_id-и Telegram) ----------
export async function favList(tgId) {
  return (await select('bot_favorites', `select=kind,item_id,created_at&tg_id=eq.${tgId}&order=created_at.desc&limit=500`)) || []
}

export async function isFav(tgId, kind, id) {
  const rows = await select('bot_favorites', `select=item_id&tg_id=eq.${tgId}&kind=eq.${kind}&item_id=eq.${encodeURIComponent(id)}&limit=1`)
  return Boolean(rows && rows.length)
}

export async function toggleFav(tgId, kind, id) {
  if (await isFav(tgId, kind, id)) {
    await remove('bot_favorites', `tg_id=eq.${tgId}&kind=eq.${kind}&item_id=eq.${encodeURIComponent(id)}`)
    return false
  }
  await upsert('bot_favorites', { tg_id: tgId, kind, item_id: String(id) }, 'tg_id,kind,item_id')
  return true
}
