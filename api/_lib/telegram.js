// Санҷиши имзои initData-и Telegram Mini App.
import { createHmac } from 'node:crypto'

export function verifyTelegram(initData, botToken) {
  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    if (!hash) return null
    params.delete('hash')
    const check = [...params.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n')
    const secret = createHmac('sha256', 'WebAppData').update(botToken).digest()
    const sign = createHmac('sha256', secret).update(check).digest('hex')
    if (sign !== hash) return null
    const authDate = Number(params.get('auth_date') || 0)
    if (!authDate || Date.now() / 1000 - authDate > 7 * 86400) return null
    const user = JSON.parse(params.get('user') || '{}')
    return user && user.id ? user : null
  } catch { return null }
}
