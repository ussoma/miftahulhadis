// Ёрдамчии AI барои забони арабӣ (Google Gemini, нақшаи ройгон).
// POST /api/ai  { initData, lang: 'tg'|'ru', voice: bool, messages: [{ role: 'user'|'model', text }], audio?: { mime, data(base64) } }
// → { reply, ar, left }   (ar — қисми арабии ҷавоб барои хондан бо овоз, дар реҷаи овозӣ)
// Ҳар корбари Telegram дар як рӯз AI_DAILY_LIMIT савол (пешфарз 10) дорад.
// Танзимот дар Vercel: GEMINI_API_KEY, BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// Ихтиёрӣ: GEMINI_MODEL (пешфарз gemini-flash-latest), AI_DAILY_LIMIT.
import { createHash } from 'node:crypto'
import { verifyTelegram } from './_lib/telegram.js'
import { createClient } from '@supabase/supabase-js'

const MAX_TURNS = 12
const MAX_TEXT = 1500
const MAX_AUDIO_B64 = 1_500_000 // ~1 MB, тақрибан 1 дақиқа

function systemPrompt(lang, voice) {
  const tongue = lang === 'ru' ? 'русском' : 'таджикском (кириллица)'
  const base = `Ты — терпеливый преподаватель арабского языка (фусха) в приложении «Мифтахуль-хадис» для мусульман из Таджикистана и России.
Отвечай на ${tongue} языке. Арабские слова и примеры всегда пиши арабским письмом с полными харакатами, затем перевод.
Помогаешь с переводом, грамматикой (сарф, нахв), словами, диалогами и исправлением ошибок. Отвечай кратко и понятно, без длинных вступлений.
Если вопрос не о языке, мягко верни разговор к изучению арабского. Не выдумывай хадисы и не давай фетв.`
  if (!voice) return base
  return `${base}
Сейчас режим устной беседы: пользователь говорит с тобой голосом и учится разговаривать.
Отвечай ОЧЕНЬ кратко в таком формате:
первая строка — 1–2 короткие фразы по-арабски с харакатами (твоя реплика в разговоре);
затем строка из трёх дефисов ---;
затем перевод и, если нужно, одно короткое исправление ошибки пользователя на ${tongue} языке.`
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }
  const apiKey = process.env.GEMINI_API_KEY
  const botToken = process.env.BOT_TOKEN
  if (!apiKey) return res.status(503).json({ error: 'ai_not_configured' })
  if (!botToken) return res.status(503).json({ error: 'bot_token_missing' })

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  body = body || {}

  const user = verifyTelegram(String(body.initData || ''), botToken)
  if (!user) return res.status(401).json({ error: 'telegram_only' })

  const lang = body.lang === 'ru' ? 'ru' : 'tg'
  const voice = !!body.voice
  const messages = (Array.isArray(body.messages) ? body.messages : []).slice(-MAX_TURNS)
    .map(m => ({ role: m && m.role === 'model' ? 'model' : 'user', text: String((m && m.text) || '').slice(0, MAX_TEXT) }))
    .filter(m => m.text)
  const audio = body.audio && typeof body.audio.data === 'string' ? body.audio : null
  if (audio && audio.data.length > MAX_AUDIO_B64) return res.status(413).json({ error: 'audio_too_long' })
  if (!messages.length && !audio) return res.status(400).json({ error: 'empty' })

  // --- маҳдудияти рӯзона ---
  const limit = Math.max(1, Number(process.env.AI_DAILY_LIMIT) || 10)
  const sbUrl = process.env.SUPABASE_URL
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const sb = sbUrl && sbKey ? createClient(sbUrl, sbKey, { auth: { persistSession: false, autoRefreshToken: false } }) : null
  const day = new Date().toISOString().slice(0, 10)
  const uid = createHash('sha256').update(`${botToken}|${user.id}`).digest('hex').slice(0, 24)
  const usagePath = `ai-usage/${day}/${uid}.json`
  let used = 0
  if (sb) {
    try {
      const { data } = await sb.storage.from('media').download(usagePath)
      if (data) used = Number(JSON.parse(await data.text()).n) || 0
    } catch { /* ҳанӯз нест */ }
    if (used >= limit) return res.status(429).json({ error: 'daily_limit', left: 0, limit })
  }

  // --- дархост ба Gemini ---
  const contents = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
  if (audio) {
    const mime = /^audio\/[\w.+-]+$/.test(String(audio.mime || '')) ? String(audio.mime).split(';')[0] : 'audio/webm'
    const parts = [{ inline_data: { mime_type: mime, data: audio.data } }]
    const last = contents[contents.length - 1]
    if (last && last.role === 'user') last.parts.push(...parts)
    else contents.push({ role: 'user', parts: [{ text: lang === 'ru' ? '(голосовое сообщение)' : '(паёми овозӣ)' }, ...parts] })
  }
  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest'
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt(lang, voice) }] },
        contents,
        generationConfig: { maxOutputTokens: voice ? 300 : 900, temperature: 0.6 }
      })
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) {
      console.error('Gemini error', r.status, JSON.stringify(j).slice(0, 500))
      return res.status(502).json({ error: r.status === 429 ? 'ai_busy' : 'ai_failed' })
    }
    const reply = ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || '').join('').trim()
    if (!reply) return res.status(502).json({ error: 'ai_empty' })

    let ar = ''
    if (voice) {
      const head = reply.split(/\n\s*-{3,}\s*\n?/)[0]
      ar = head.replace(/[^؀-ۿ\s.,!?؟،]/g, ' ').replace(/\s+/g, ' ').trim()
    }

    used += 1
    if (sb) {
      try {
        await sb.storage.from('media').upload(usagePath, Buffer.from(JSON.stringify({ n: used })), { contentType: 'application/json', upsert: true })
      } catch { /* ҳисоб нашуд — монеъ намешавем */ }
    }
    return res.status(200).json({ reply, ar, left: Math.max(0, limit - used), limit })
  } catch (e) {
    console.error('AI error', e)
    return res.status(500).json({ error: 'ai_error' })
  }
}
