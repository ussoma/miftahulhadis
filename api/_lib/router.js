// Роутери callback_query ва паёмҳо. Ҳар як тугма обработчик дорад.
import { sendMessage, editMessage, tgCall, answerCallback, editKeyboard, esc } from './tg.js'
import { tr } from './i18n.js'
import { getPrefs, setPrefs, toggleFav, dec } from './data.js'
import {
  mainMenu, languageView, searchPrompt, sectionView, bookView, chapterView, hadithView, contentView,
  copyText, mediaOfItem, favoritesView, searchView, quranListView, surahView, surahAudioUrls
} from './views.js'

const notModified = result => !result.ok && /not modified/i.test(result.description || '')

// Намоиш: паёми аввал таҳрир мешавад, боқӣ (агар матн дароз бошад) нав фиристода мешавад.
async function show(chatId, messageId, view) {
  const parts = view.html
  const kb = view.keyboard
  if (messageId) {
    const first = await editMessage(chatId, messageId, parts[0], parts.length === 1 ? kb : undefined)
    if (!first.ok && !notModified(first)) await sendMessage(chatId, parts[0], parts.length === 1 ? kb : undefined)
    for (let i = 1; i < parts.length; i += 1) await sendMessage(chatId, parts[i], i === parts.length - 1 ? kb : undefined)
    return
  }
  for (let i = 0; i < parts.length; i += 1) await sendMessage(chatId, parts[i], i === parts.length - 1 ? kb : undefined)
}

async function sendMedia(chatId, item, lang) {
  const link = `<a href="${esc(item.u)}">${esc(item.n || item.u)}</a>`
  if (/youtu\.?be/i.test(item.u)) return sendMessage(chatId, `🎬 ${link}`)
  const method = item.k === 'audio' ? 'sendAudio' : item.k === 'video' ? 'sendVideo' : item.k === 'image' ? 'sendPhoto' : 'sendDocument'
  const field = item.k === 'audio' ? 'audio' : item.k === 'video' ? 'video' : item.k === 'image' ? 'photo' : 'document'
  const result = await tgCall(method, { chat_id: chatId, [field]: item.u, ...(item.n ? { caption: item.n.slice(0, 200) } : {}) })
  if (!result.ok) await sendMessage(chatId, `${esc(tr(lang, 'linkMsg'))}\n${link}`)
}

async function openStartPayload(ctx, payload, chatId) {
  const m = /^([hc])_(.+)$/.exec(payload || '')
  if (!m) return false
  const view = m[1] === 'h' ? await hadithView(ctx, m[2], 0) : await contentView(ctx, m[2], 0)
  await show(chatId, null, view)
  return true
}

// /start (сабти корбар дар webhook.js анҷом ёфтааст)
export async function handleStart(message, payload) {
  const chatId = message.chat.id
  const user = message.from
  const prefs = await getPrefs(user.id)
  const ctx = { lang: prefs.lang || 'tg', tgId: user.id }
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ')
  if (await openStartPayload(ctx, payload, chatId).catch(() => false)) return
  await show(chatId, null, await mainMenu(ctx, true, name))
}

async function runSearch(ctx, chatId, messageId, query) {
  await setPrefs(ctx.tgId, { last_query: query.slice(0, 200), state: null }).catch(() => {})
  await show(chatId, messageId, await searchView(ctx, query, 0))
}

export async function handleMessage(message) {
  if (!message.from || message.chat.type !== 'private') return
  const chatId = message.chat.id
  const text = String(message.text || '').trim()
  if (!text) return
  const prefs = await getPrefs(message.from.id)
  const ctx = { lang: prefs.lang || 'tg', tgId: message.from.id }

  try {
    const command = /^\/(\w+)(?:@\w+)?(?:\s+([\s\S]*))?$/.exec(text)
    if (command) {
      const name = command[1].toLowerCase()
      if (name === 'search') {
        if (command[2]) return await runSearch(ctx, chatId, null, command[2])
        await setPrefs(ctx.tgId, { state: 'search' }).catch(() => {})
        return await show(chatId, null, searchPrompt(ctx))
      }
      if (name === 'favorites') return await show(chatId, null, await favoritesView(ctx, 0))
      if (name === 'lang') return await show(chatId, null, languageView(ctx))
      if (name === 'help') await sendMessage(chatId, esc(tr(ctx.lang, 'help')))
      return await show(chatId, null, await mainMenu(ctx, false))
    }
    // Ҳар матни оддӣ (бе фармон) — ҷустуҷӯ
    return await runSearch(ctx, chatId, null, text)
  } catch (error) {
    console.error('Message error:', error.message)
    const needSql = /bot_|PGRST20\d|42883|42P01/i.test(error.message)
    await sendMessage(chatId, esc(tr(ctx.lang, needSql ? 'notReady' : 'error'))).catch(() => {})
  }
}

export async function handleCallback(cb) {
  const chatId = cb.message && cb.message.chat.id
  const messageId = cb.message && cb.message.message_id
  const data = String(cb.data || '')
  if (!chatId) return answerCallback(cb.id)
  const prefs = await getPrefs(cb.from.id)
  const ctx = { lang: prefs.lang || 'tg', tgId: cb.from.id }
  const [cmd, a, b, c3] = data.split(':')

  try {
    switch (cmd) {
      case 'n': return await answerCallback(cb.id)
      case 'm': await answerCallback(cb.id); return await show(chatId, messageId, await mainMenu(ctx, false))
      case 'L': {
        if (a === 'tg' || a === 'ru') {
          await setPrefs(ctx.tgId, { lang: a })
          ctx.lang = a
          await answerCallback(cb.id, tr(a, 'langSet'))
          return await show(chatId, messageId, await mainMenu(ctx, false))
        }
        await answerCallback(cb.id)
        return await show(chatId, messageId, languageView(ctx))
      }
      case 'S':
        await setPrefs(ctx.tgId, { state: 'search' })
        await answerCallback(cb.id)
        return await show(chatId, messageId, searchPrompt(ctx))
      case 'q': {
        await answerCallback(cb.id)
        if (!prefs.last_query) return await show(chatId, messageId, searchPrompt(ctx))
        return await show(chatId, messageId, await searchView(ctx, prefs.last_query, Number(a) || 0))
      }
      case 'F': await answerCallback(cb.id); return await show(chatId, messageId, await favoritesView(ctx, Number(a) || 0))
      case 's': await answerCallback(cb.id); return await show(chatId, messageId, await sectionView(ctx, a, Number(b) || 0))
      case 'hb': await answerCallback(cb.id); return await show(chatId, messageId, await bookView(ctx, a, Number(b) || 0))
      case 'ch': await answerCallback(cb.id); return await show(chatId, messageId, await chapterView(ctx, a, Number(b) || 0))
      case 'hd': await answerCallback(cb.id); return await show(chatId, messageId, await hadithView(ctx, a, Number(b) || 0))
      case 'ci': await answerCallback(cb.id); return await show(chatId, messageId, await contentView(ctx, a, Number(b) || 0))
      case 'qr': await answerCallback(cb.id); return await show(chatId, messageId, quranListView(ctx, Number(a) || 0))
      case 'qs': await answerCallback(cb.id); return await show(chatId, messageId, await surahView(ctx, Number(a) || 1, Number(b) || 0))
      case 'qa': {
        await answerCallback(cb.id)
        const urls = surahAudioUrls(Number(a) || 1)
        const result = await tgCall('sendAudio', { chat_id: chatId, audio: urls[0], title: `Surah ${a}`, performer: 'Mishary Alafasy' })
        if (!result.ok) await sendMessage(chatId, `${esc(tr(ctx.lang, 'linkMsg'))}\n<a href="${urls[0]}">${urls[0]}</a>`)
        return undefined
      }
      case 'fv': {
        const added = await toggleFav(ctx.tgId, a === 'h' ? 'hadith' : 'content', dec(b))
        await answerCallback(cb.id, tr(ctx.lang, added ? 'favAdded' : 'favRemoved'))
        // Танҳо тугмаи ⭐ нав мешавад (матн аз нав фиристода намешавад)
        const rows = (cb.message.reply_markup && cb.message.reply_markup.inline_keyboard) || []
        const next = rows.map(row => row.map(button =>
          button.callback_data === data ? { ...button, text: tr(ctx.lang, added ? 'favDel' : 'favAdd') } : button))
        return await editKeyboard(chatId, messageId, { inline_keyboard: next })
      }
      case 'cp': {
        await answerCallback(cb.id)
        const raw = await copyText(ctx, a, b)
        if (!raw) return await sendMessage(chatId, esc(tr(ctx.lang, 'notFound')))
        return await sendMessage(chatId, `${esc(tr(ctx.lang, 'copyHint'))}\n\n<pre>${esc(raw.slice(0, 3800))}</pre>`)
      }
      case 'md': {
        await answerCallback(cb.id)
        const item = (await mediaOfItem(a, b))[Number(c3)]
        if (!item) return await sendMessage(chatId, esc(tr(ctx.lang, 'notFound')))
        return await sendMedia(chatId, item, ctx.lang)
      }
      default:
        return await answerCallback(cb.id)
    }
  } catch (error) {
    console.error('Callback error:', data, error.message)
    const needSql = /bot_|PGRST20\d|42883|42P01/i.test(error.message)
    await answerCallback(cb.id, tr(ctx.lang, needSql ? 'notReady' : 'error'), true).catch(() => {})
    return undefined
  }
}
