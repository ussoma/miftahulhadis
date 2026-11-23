// Telegram Bot API: хурд ва бе вобастагӣ
const BOT_TOKEN = () => process.env.BOT_TOKEN

export async function tgCall(method, payload) {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload)
  })
  return response.json()
}

export const esc = value =>
  String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Паёми нав. Агар тугмаи web_app қабул нашавад (масалан дар гурӯҳ), бо тугмаи URL такрор мешавад.
export async function sendMessage(chatId, html, keyboard) {
  const base = { chat_id: chatId, text: html, parse_mode: 'HTML', link_preview_options: { is_disabled: true } }
  let result = await tgCall('sendMessage', keyboard ? { ...base, reply_markup: keyboard } : base)
  if (!result.ok && keyboard && /BUTTON_TYPE_INVALID|web_app/i.test(result.description || '')) {
    result = await tgCall('sendMessage', { ...base, reply_markup: webAppToUrl(keyboard) })
  }
  return result
}

export async function editMessage(chatId, messageId, html, keyboard) {
  const base = {
    chat_id: chatId, message_id: messageId, text: html, parse_mode: 'HTML',
    link_preview_options: { is_disabled: true }
  }
  let result = await tgCall('editMessageText', keyboard ? { ...base, reply_markup: keyboard } : base)
  if (!result.ok && keyboard && /BUTTON_TYPE_INVALID|web_app/i.test(result.description || '')) {
    result = await tgCall('editMessageText', { ...base, reply_markup: webAppToUrl(keyboard) })
  }
  return result
}

function webAppToUrl(keyboard) {
  return {
    inline_keyboard: keyboard.inline_keyboard.map(row =>
      row.map(button => (button.web_app ? { text: button.text, url: button.web_app.url } : button))
    )
  }
}

export const answerCallback = (id, text, alert = false) =>
  tgCall('answerCallbackQuery', { callback_query_id: id, ...(text ? { text, show_alert: alert } : {}) })

export const editKeyboard = (chatId, messageId, keyboard) =>
  tgCall('editMessageReplyMarkup', { chat_id: chatId, message_id: messageId, reply_markup: keyboard })
