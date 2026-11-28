// «Ёрдамчӣ»: устоди AI барои забони арабӣ — чат бо матн, паёми овозӣ ва реҷаи гуфтугӯи овозӣ.
// Сервер: /api/ai (Gemini). Овоз: /api/tts (тавассути функсияҳое, ки аз App дода мешаванд).
import React, { useEffect, useRef, useState } from 'react'

const STORE = 'miftah_arb_ai_chat_v1'
const KEEP = 40

const T = {
  tg: {
    hello: 'Ассалому алайкум! Ман ёрдамчии шумо дар забони арабӣ ҳастам. Калима, ҷумла ё қоидаеро пурсед, ё 🎤-ро пахш карда бо ман арабӣ гап занед.',
    ph: 'Саволро нависед…', send: 'Фиристодан', voiceMode: 'Гуфтугӯи овозӣ', clear: 'Тоза кардан',
    rec: 'Сабт шуда истодааст… барои фиристодан боз пахш кунед', think: 'Фикр карда истодааст…',
    left: n => `Имрӯз ${n} савол монд`, voiceMsg: '🎤 Паёми овозӣ',
    hint: 'Дар реҷаи овозӣ ёрдамчӣ бо арабӣ ҷавоб медиҳад ва ҷавобашро бо овоз мехонад.',
    errs: {
      telegram_only: 'Ёрдамчӣ танҳо дар дохили Telegram кор мекунад.',
      daily_limit: 'Лимити имрӯза тамом шуд. Фардо боз пурсед.',
      ai_not_configured: 'Ёрдамчӣ ҳанӯз танзим нашудааст (GEMINI_API_KEY дар Vercel).',
      bot_token_missing: 'BOT_TOKEN дар Vercel гузошта нашудааст.',
      ai_busy: 'Сервер банд аст. Пас аз як дақиқа боз кӯшиш кунед.',
      audio_too_long: 'Паёми овозӣ хеле дароз аст (то 1 дақиқа).',
      mic: 'Микрофон дастрас нест. Иҷозати микрофонро диҳед.',
      net: 'Хатои шабака. Боз кӯшиш кунед.'
    }
  },
  ru: {
    hello: 'Ассаляму алейкум! Я ваш помощник по арабскому языку. Спросите слово, фразу или правило, или нажмите 🎤 и поговорите со мной по-арабски.',
    ph: 'Напишите вопрос…', send: 'Отправить', voiceMode: 'Устная беседа', clear: 'Очистить',
    rec: 'Идёт запись… нажмите ещё раз, чтобы отправить', think: 'Думаю…',
    left: n => `Сегодня осталось вопросов: ${n}`, voiceMsg: '🎤 Голосовое сообщение',
    hint: 'В режиме беседы помощник отвечает по-арабски и озвучивает ответ (арабский, затем русский).',
    errs: {
      telegram_only: 'Помощник работает только внутри Telegram.',
      daily_limit: 'Дневной лимит исчерпан. Попробуйте завтра.',
      ai_not_configured: 'Помощник ещё не настроен (GEMINI_API_KEY в Vercel).',
      bot_token_missing: 'В Vercel не задан BOT_TOKEN.',
      ai_busy: 'Сервер занят. Попробуйте через минуту.',
      audio_too_long: 'Голосовое сообщение слишком длинное (до 1 минуты).',
      mic: 'Нет доступа к микрофону. Разрешите микрофон.',
      net: 'Ошибка сети. Попробуйте ещё раз.'
    }
  }
}

const load = () => { try { const a = JSON.parse(localStorage.getItem(STORE) || '[]'); return Array.isArray(a) ? a : [] } catch { return [] } }
const save = list => { try { localStorage.setItem(STORE, JSON.stringify(list.slice(-KEEP))) } catch { /* ignore */ } }
const initData = () => { try { return (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || '' } catch { return '' } }
const toB64 = blob => new Promise((resolve, reject) => {
  const fr = new FileReader()
  fr.onload = () => resolve(String(fr.result).split(',')[1] || '')
  fr.onerror = reject
  fr.readAsDataURL(blob)
})
const arPart = text => String(text || '').split(/\n\s*-{3,}\s*\n?/)[0].replace(/[^؀-ۿ\s.,!?؟،]/g, ' ').replace(/\s+/g, ' ').trim()
const trPart = text => { const p = String(text || '').split(/\n\s*-{3,}\s*\n?/); return p.length > 1 ? p.slice(1).join(' ').trim() : '' }

export default function ArbAssistant({ lang, playAr, playRu, stopAll }) {
  const t = T[lang === 'ru' ? 'ru' : 'tg']
  const [list, setList] = useState(load)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [left, setLeft] = useState(null)
  const [voice, setVoice] = useState(() => { try { return localStorage.getItem(STORE + '_voice') === '1' } catch { return false } })
  const [recording, setRecording] = useState(false)
  const recRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => { save(list) }, [list])
  useEffect(() => { try { endRef.current && endRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' }) } catch { /* ignore */ } }, [list, busy])
  useEffect(() => { try { localStorage.setItem(STORE + '_voice', voice ? '1' : '0') } catch { /* ignore */ } }, [voice])
  useEffect(() => () => { try { recRef.current && recRef.current.stream.getTracks().forEach(x => x.stop()) } catch { /* ignore */ } }, [])

  const speakReply = async reply => {
    stopAll && stopAll()
    const ar = arPart(reply)
    if (ar && playAr) await playAr(ar)
    const tr = trPart(reply)
    if (lang === 'ru' && tr && playRu) await playRu(tr.replace(/[؀-ۿ]+/g, ' '))
  }

  const ask = async ({ userText, audio }) => {
    if (busy) return
    setErr('')
    const shown = userText || t.voiceMsg
    const next = [...list, { role: 'user', text: shown }]
    setList(next)
    setBusy(true)
    try {
      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: initData(),
          lang,
          voice,
          messages: next.map(m => ({ role: m.role, text: m.text })),
          audio
        })
      })
      const j = await r.json().catch(() => ({}))
      if (typeof j.left === 'number') setLeft(j.left)
      if (!r.ok || !j.reply) { setErr(t.errs[j.error] || t.errs.net); return }
      setList(l => [...l, { role: 'model', text: j.reply, voice }])
      if (voice) speakReply(j.reply)
    } catch {
      setErr(t.errs.net)
    } finally {
      setBusy(false)
    }
  }

  const submit = e => {
    e && e.preventDefault()
    const q = text.trim()
    if (!q) return
    setText('')
    ask({ userText: q })
  }

  const toggleRec = async () => {
    if (recording) {
      try { recRef.current && recRef.current.stop() } catch { /* ignore */ }
      return
    }
    setErr('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = ['audio/webm', 'audio/mp4', 'audio/ogg'].find(m => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || ''
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      const chunks = []
      rec.ondataavailable = ev => { if (ev.data && ev.data.size) chunks.push(ev.data) }
      rec.onstop = async () => {
        stream.getTracks().forEach(x => x.stop())
        setRecording(false)
        const blob = new Blob(chunks, { type: rec.mimeType || mime || 'audio/webm' })
        if (blob.size < 1500) return
        const data = await toB64(blob)
        ask({ audio: { mime: blob.type, data } })
      }
      recRef.current = rec
      rec.start()
      setRecording(true)
      stopAll && stopAll()
      setTimeout(() => { if (rec.state === 'recording') rec.stop() }, 60000)
    } catch {
      setErr(t.errs.mic)
    }
  }

  return (
    <div className="ai-wrap">
      <div className="ai-top">
        <label className="ai-switch">
          <input type="checkbox" checked={voice} onChange={e => setVoice(e.target.checked)} />
          <span>🗣️ {t.voiceMode}</span>
        </label>
        {list.length > 0 && <button type="button" className="ai-clear" onClick={() => { setList([]); setErr('') }}>{t.clear}</button>}
      </div>
      {voice && <p className="arb-note">{t.hint}</p>}

      <div className="ai-chat">
        <div className="ai-msg model"><div dir="auto">{t.hello}</div></div>
        {list.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role}`}>
            <div dir="auto" className="ai-text">{m.text}</div>
            {m.role === 'model' && arPart(m.text) && (
              <button type="button" className="mini-btn ai-speak" onClick={() => speakReply(m.text)} aria-label="🔊">🔊</button>
            )}
          </div>
        ))}
        {busy && <div className="ai-msg model ai-think">{t.think}</div>}
        <div ref={endRef} className="ai-end" />
      </div>

      {err && <p className="ai-err">{err}</p>}
      {recording && <p className="ai-rec">● {t.rec}</p>}
      {left !== null && <p className="arb-note ai-left">{t.left(left)}</p>}
      <p className="arb-note ai-credit">AI: Google Gemini · {lang === 'ru' ? 'Голос' : 'Овоз'}: ElevenLabs</p>

      <form className="ai-form" onSubmit={submit}>
        <button type="button" className={`ai-mic${recording ? ' on' : ''}`} onClick={toggleRec} disabled={busy} aria-label="mic">🎤</button>
        <input dir="auto" value={text} onChange={e => setText(e.target.value)} placeholder={t.ph} disabled={busy || recording} maxLength={1500} />
        <button type="submit" className="primary-button ai-send" disabled={busy || recording || !text.trim()}>{t.send}</button>
      </form>
    </div>
  )
}
