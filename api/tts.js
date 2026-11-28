// Овози абрӣ барои забони арабӣ ва русӣ (Azure Speech, тарифи ройгони F0).
// GET /api/tts?lang=ar|ru&text=...  →  302 ба файли mp3 дар Supabase Storage (bucket «media», папкаи tts/).
// Ҳар матн танҳо як бор сохта мешавад; баъд ҳамаи корбарон ҳамон файлро мегиранд.
// Танзимот дар Vercel: AZURE_SPEECH_KEY, AZURE_SPEECH_REGION (масалан westeurope),
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. Ихтиёрӣ: AZURE_VOICE_AR, AZURE_VOICE_RU.
import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const VOICES = {
  ar: { lang: 'ar-SA', voice: process.env.AZURE_VOICE_AR || 'ar-SA-HamedNeural' },
  ru: { lang: 'ru-RU', voice: process.env.AZURE_VOICE_RU || 'ru-RU-DmitryNeural' }
}
const MAX_LEN = 600
const BUCKET = 'media'

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const key = process.env.AZURE_SPEECH_KEY
  const region = process.env.AZURE_SPEECH_REGION
  const sbUrl = process.env.SUPABASE_URL
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || !region) return res.status(503).json({ error: 'tts_not_configured' })

  const lang = String(req.query.lang || 'ar')
  const cfg = VOICES[lang]
  const text = String(req.query.text || '').replace(/\s+/g, ' ').trim()
  if (!cfg || !text) return res.status(400).json({ error: 'bad_request' })
  if (text.length > MAX_LEN) return res.status(413).json({ error: 'text_too_long' })

  const hash = createHash('sha1').update(`${cfg.voice}|${text}`).digest('hex')
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

    // 2) сохтан дар Azure
    const ssml = `<speak version="1.0" xml:lang="${cfg.lang}"><voice name="${cfg.voice}"><prosody rate="${lang === 'ar' ? '-10%' : '0%'}">${esc(text)}</prosody></voice></speak>`
    const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'miftahulhadis'
      },
      body: ssml
    })
    if (!r.ok) {
      console.error('Azure TTS error', r.status, await r.text().catch(() => ''))
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
