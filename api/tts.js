// Овози абрӣ барои забони арабӣ ва русӣ: ElevenLabs (агар ELEVENLABS_API_KEY бошад) ё Azure Speech.
// GET /api/tts?lang=ar|ru&text=...  →  302 ба файли mp3 дар Supabase Storage (bucket «media», папкаи tts/).
// Ҳар матн танҳо як бор сохта мешавад; баъд ҳамаи корбарон ҳамон файлро мегиранд.
// Танзимот дар Vercel: ELEVENLABS_API_KEY  — ё —  AZURE_SPEECH_KEY + AZURE_SPEECH_REGION;
// ҳамчунин SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (барои нигоҳ доштани файлҳо).
// Ихтиёрӣ: ELEVENLABS_VOICE_AR, ELEVENLABS_VOICE_RU, ELEVENLABS_MODEL, AZURE_VOICE_AR, AZURE_VOICE_RU.
import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { verifyTelegram } from './_lib/telegram.js'

const VOICES = {
  ar: { lang: 'ar-SA', voice: process.env.AZURE_VOICE_AR || 'ar-SA-HamedNeural' },
  ru: { lang: 'ru-RU', voice: process.env.AZURE_VOICE_RU || 'ru-RU-DmitryNeural' }
}
const EL_VOICE_DEFAULT = 'JBFqnCBsd6RMkjVDRZzb' // «George», овози мардонаи бисёрзабона
const EL = {
  ar: process.env.ELEVENLABS_VOICE_AR || EL_VOICE_DEFAULT,
  ru: process.env.ELEVENLABS_VOICE_RU || EL_VOICE_DEFAULT
}
const EL_MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2'
const MAX_LEN = 600
const BUCKET = 'media'

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const elKey = process.env.ELEVENLABS_API_KEY
  const key = process.env.AZURE_SPEECH_KEY
  const region = process.env.AZURE_SPEECH_REGION
  const sbUrl = process.env.SUPABASE_URL
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!elKey && !(key && region)) return res.status(503).json({ error: 'tts_not_configured' })

  const lang = String(req.query.lang || 'ar')
  const cfg = VOICES[lang]
  const text = String(req.query.text || '').replace(/\s+/g, ' ').trim()
  if (!cfg || !text) return res.status(400).json({ error: 'bad_request' })
  if (text.length > MAX_LEN) return res.status(413).json({ error: 'text_too_long' })

  const voiceId = elKey ? `el:${EL[lang]}:${EL_MODEL}` : cfg.voice
  const hash = createHash('sha1').update(`${voiceId}|${text}`).digest('hex')
  const path = `tts/${lang}/${hash}.mp3`
  const sb = sbUrl && sbKey ? createClient(sbUrl, sbKey, { auth: { persistSession: false, autoRefreshToken: false } }) : null

  try {
    // 1) аллакай сохта шудааст?
    if (sb) {
      const { data } = sb.storage.from(BUCKET).getPublicUrl(path)
      const head = await fetch(data.publicUrl, { method: 'HEAD' })
      if (head.ok) {
        res.setHeader('Cache-Control', 'public, max-age=86400')
        return res.redirect(302, data.publicUrl)
      }
    }

    // 2) сохтан — танҳо барои корбарони Telegram (то касе аз берун лимити ройгонро сарф накунад)
    const botToken = process.env.BOT_TOKEN
    if (botToken && !verifyTelegram(String(req.query.tg || ''), botToken)) return res.status(401).json({ error: 'telegram_only' })
    let r
    if (elKey) {
      r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${EL[lang]}?output_format=mp3_44100_64`, {
        method: 'POST',
        headers: { 'xi-api-key': elKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify({ text, model_id: EL_MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: lang === 'ar' ? 0.9 : 1 } })
      })
    } else {
      const ssml = `<speak version="1.0" xml:lang="${cfg.lang}"><voice name="${cfg.voice}"><prosody rate="${lang === 'ar' ? '-10%' : '0%'}">${esc(text)}</prosody></voice></speak>`
      r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'miftahulhadis'
        },
        body: ssml
      })
    }
    if (!r.ok) {
      console.error('TTS provider error', r.status, (await r.text().catch(() => '')).slice(0, 300))
      return res.status(502).json({ error: 'tts_failed', status: r.status })
    }
    const audio = Buffer.from(await r.arrayBuffer())

    // 3) нигоҳ доштан ва фиристодан
    if (sb) {
      const { error } = await sb.storage.from(BUCKET).upload(path, audio, { contentType: 'audio/mpeg', cacheControl: '31536000', upsert: true })
      if (!error) {
        const { data } = sb.storage.from(BUCKET).getPublicUrl(path)
        res.setHeader('Cache-Control', 'public, max-age=86400')
        return res.redirect(302, data.publicUrl)
      }
      console.error('TTS upload error', error.message)
    }
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    return res.status(200).send(audio)
  } catch (e) {
    console.error('TTS error', e)
    return res.status(500).json({ error: 'tts_error' })
  }
}
