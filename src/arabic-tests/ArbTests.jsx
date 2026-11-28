// «Тестҳо»-и бахши забони арабӣ: машқҳо ва «Саволу ҷавоб» аз рӯи китобҳо.
// Маълумот дар drills.js, nahw.js, verbs.js, review.js, review2.js; ҳамааш дар худи барнома кор мекунад.
import React, { useEffect, useState } from 'react'

const PER = 30
const BOOK_ORDER = ['Амсила', 'Бидон', 'Муқаддимотӣ', 'Мутавассита']
const REVIEW_GROUP = 'Саволу ҷавоб аз китобҳо'
const REVIEW_NOTE = 'Саволҳо аз дарсҳои ҳамин китоб. Ҳар бор 30 саволи тасодуфӣ.'
const MARKS = [['َ', 'фатҳа'], ['ُ', 'замма'], ['ِ', 'касра'], ['ْ', 'сукун'], ['ً', 'танвини насб'], ['ٌ', 'танвини рафъ'], ['ٍ', 'танвини ҷарр']]

const unIso = x => String(x || '').replace(/[⁦-⁩]/g, '')
const isAr = s => /[؀-ۿ]/.test(s || '')
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

let dataPromise = null
const loadData = () => {
  if (!dataPromise) dataPromise = Promise.all([import('./drills.js'), import('./review.js')]).then(([drills, review]) => ({ drills, review: review.REVIEW }))
  return dataPromise
}

function reviewBooks(REVIEW) {
  const names = [...BOOK_ORDER.filter(b => REVIEW[b]), ...Object.keys(REVIEW).filter(b => !BOOK_ORDER.includes(b))]
  return names.map(book => {
    const lessons = Object.keys(REVIEW[book]).map(Number).sort((a, b) => a - b).map(n => ({ n, count: REVIEW[book][n].length }))
    return { book, lessons, count: lessons.reduce((s, l) => s + l.count, 0) }
  })
}

function reviewSet(REVIEW, book, lesson) {
  const pool = []
  Object.entries(REVIEW[book] || {}).forEach(([n, qs]) => {
    if (lesson && Number(n) !== lesson) return
    qs.forEach(([text, opts, exp]) => pool.push({ text, opts, exp, n }))
  })
  const questions = shuffle(pool).slice(0, PER).map(q => {
    const order = shuffle(q.opts.map((_, k) => k))
    return { text: q.text, options: order.map(k => q.opts[k]), correct: order.indexOf(0), explanation: `${q.exp ? q.exp + ' ' : ''}(Дарси ${q.n})` }
  })
  return { id: `review|${book}|${lesson || ''}`, title: lesson ? `${book} · Дарси ${lesson}` : `Саволу ҷавоб: ${book}`, book: REVIEW_GROUP, rule: REVIEW_NOTE, questions }
}

function Choice({ q, done, onAnswer }) {
  const [picked, setPicked] = useState(-1)
  useEffect(() => setPicked(-1), [q])
  return (
    <div className="arb-babs">
      {q.options.map((o, k) => (
        <button
          key={k}
          type="button"
          dir="auto"
          className={`arb-bab arb-t-opt${isAr(o) ? ' is-ar' : ''}${done ? (k === q.correct ? ' is-right' : k === picked ? ' is-wrong' : '') : ''}`}
          onClick={() => { if (done) return; setPicked(k); onAnswer(k === q.correct) }}
        >{unIso(o)}</button>
      ))}
    </div>
  )
}

function Build({ q, done, onAnswer }) {
  const tiles = q.tiles.map(unIso)
  const answer = q.answer.map(unIso)
  const [pick, setPick] = useState([])
  useEffect(() => setPick([]), [q])
  const word = pick.map(k => tiles[k]).join(q.sep || '')
  const ok = pick.map(k => tiles[k]).join('\u0001') === answer.join('\u0001')
  return (
    <>
      <div className={`arb-t-ans${done ? (ok ? ' is-right' : ' is-wrong') : ''}`} dir="rtl">
        {pick.length ? pick.map((k, j) => (
          <button key={j} type="button" className="arb-t-tile" onClick={() => !done && setPick(p => p.filter((_, i) => i !== j))}>{tiles[k]}</button>
        )) : <span className="arb-note">Ҳарфҳо / калимаҳоро аз поён интихоб кунед</span>}
      </div>
      {pick.length > 0 && !q.sep && <div className="arb-t-big" dir="rtl">{word}</div>}
      {!done && (
        <>
          <div className="arb-t-row" dir="rtl">
            {tiles.map((t, k) => (
              <button key={k} type="button" disabled={pick.includes(k)} className="arb-t-tile" onClick={() => setPick(p => [...p, k])}>{t}</button>
            ))}
          </div>
          <button type="button" className="primary-button arb-t-check" disabled={!pick.length} onClick={() => onAnswer(ok)}>Санҷидан</button>
        </>
      )}
    </>
  )
}

function Tashkil({ q, done, onAnswer }) {
  const init = () => q.units.map(u => ({ b: unIso(u.b), a: unIso(u.a), t: unIso(u.t), e: !!u.e, v: '', sh: false }))
  const [units, setUnits] = useState(init)
  const [sel, setSel] = useState(() => q.units.findIndex(u => u.e))
  const [result, setResult] = useState(null)
  useEffect(() => { setUnits(init()); setSel(q.units.findIndex(u => u.e)); setResult(null) }, [q])
  const cur = u => (u.e ? u.b + (u.sh ? 'ّ' : '') + u.v + (u.t || '') : u.b)
  const setMark = m => {
    if (sel < 0) return
    const next = units.map((u, k) => (k === sel ? { ...u, v: m } : u))
    setUnits(next)
    const nx = next.findIndex((x, k) => k > sel && x.e && !x.v)
    if (nx >= 0) setSel(nx)
  }
  const toggleShadda = () => sel >= 0 && setUnits(units.map((u, k) => (k === sel ? { ...u, sh: !u.sh } : u)))
  const check = () => {
    const res = units.map(u => !u.e || (u.sh ? 'ّ' : '') + u.v === u.a)
    setResult(res)
    onAnswer(res.every(Boolean))
  }
  const missing = units.some(u => u.e && !u.v)
  return (
    <>
      <div className="arb-t-big" dir="rtl">{units.map(cur).join(q.sep || '')}</div>
      <div className="arb-t-row" dir="rtl">
        {units.map((u, k) => (
          <button
            key={k}
            type="button"
            className={`arb-t-tile${u.e ? '' : ' is-fixed'}${!done && k === sel ? ' is-sel' : ''}${done && result && u.e ? (result[k] ? ' is-right' : ' is-wrong') : ''}`}
            onClick={() => !done && u.e && setSel(k)}
          >{u.e ? cur(u) : (u.b.trim() || '·')}</button>
        ))}
      </div>
      {!done && (
        <>
          <div className="arb-t-pal">
            {MARKS.map(([m, name]) => <button key={m} type="button" onClick={() => setMark(m)}><span dir="rtl">ـ{m}</span><small>{name}</small></button>)}
            <button type="button" className={units[sel] && units[sel].sh ? 'active' : ''} onClick={toggleShadda}><span dir="rtl">ـّ</span><small>шадда</small></button>
          </div>
          <button type="button" className="primary-button arb-t-check" disabled={missing} onClick={check}>Санҷидан</button>
        </>
      )}
    </>
  )
}

function Player({ set, onAgain, onBack, sound }) {
  const [i, setI] = useState(0)
  const [right, setRight] = useState(0)
  const [done, setDone] = useState(false)
  const [ok, setOk] = useState(false)
  useEffect(() => { setI(0); setRight(0); setDone(false) }, [set])
  const n = set.questions.length
  if (!n) return <div className="arb-verb-card"><p className="arb-note">Савол ёфт нашуд.</p><button type="button" className="primary-button" onClick={onBack}>Ба рӯйхат</button></div>
  if (i >= n) {
    return (
      <div className="arb-verb-card arb-t-result">
        <div className="arb-t-emoji">{right >= n * 0.8 ? '🎉' : '📖'}</div>
        <h4 className="arb-group">Натиҷа: {right} аз {n}</h4>
        <button type="button" className="primary-button" onClick={onAgain}>Боз саволҳои нав</button>
        <button type="button" className="arb-t-link" onClick={onBack}>Ба рӯйхати тестҳо</button>
      </div>
    )
  }
  const q = set.questions[i]
  const answer = good => { if (done) return; setDone(true); setOk(good); if (good) setRight(r => r + 1); sound && sound(good ? 'ok' : 'bad') }
  const next = () => { setDone(false); setI(i + 1); try { window.scrollTo(0, 0) } catch (_) {} }
  const Body = q.kind === 'build' ? Build : q.kind === 'tashkil' ? Tashkil : Choice
  return (
    <div className="arb-t-player">
      {set.rule && <p className="arb-note arb-t-rule">📌 {unIso(set.rule)}</p>}
      <div className="arb-t-prog"><i style={{ width: `${(i / n) * 100}%` }} /></div>
      <div className="arb-verb-card">
        <p className="arb-note">Саволи {i + 1} аз {n} · дуруст: {right}</p>
        <h4 className="arb-t-q" dir="auto">{unIso(q.text)}</h4>
        {q.ar && <div className="arb-t-big" dir="rtl">{unIso(q.ar)}</div>}
        <Body q={q} done={done} onAnswer={answer} />
        {done && (
          <div className="arb-t-exp">
            <b>{ok ? '✅ Дуруст!' : '❌ Нодуруст.'}</b>
            {(q.kind === 'build' || (q.kind === 'tashkil' && !ok)) && <> Ҷавоби дуруст: <span className="arb-t-ar" dir="rtl">{unIso(q.full || q.answer)}</span></>}
            {q.explanation && <div>{unIso(q.explanation)}</div>}
          </div>
        )}
        {done && <button type="button" className="primary-button" onClick={next}>{i + 1 < n ? 'Саволи навбатӣ' : 'Натиҷа'}</button>}
      </div>
    </div>
  )
}

export default function ArbTests({ sound }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [view, setView] = useState({ name: 'list' })
  useEffect(() => { loadData().then(setData).catch(e => setError(String(e && e.message || e))) }, [])
  if (error) return <p className="arb-note">Хато: {error}</p>
  if (!data) return <p className="arb-note">Бор шуда истодааст…</p>

  const startDrill = id => { const make = () => data.drills.drill(id, PER); setView({ name: 'play', make, set: make() }) }
  const back = () => setView(view.from || { name: 'list' })

  if (view.name === 'play') {
    return (
      <div className="arb-tests">
        <button type="button" className="arb-t-link" onClick={back}>← Ба рӯйхат</button>
        <h4 className="arb-group">{unIso(view.set.title)}</h4>
        <Player set={view.set} sound={sound} onBack={back} onAgain={() => setView({ ...view, set: view.make() })} />
      </div>
    )
  }

  if (view.name === 'book') {
    const b = reviewBooks(data.review).find(x => x.book === view.book)
    const from = view
    return (
      <div className="arb-tests">
        <button type="button" className="arb-t-link" onClick={() => setView({ name: 'list' })}>← Ба рӯйхат</button>
        <h4 className="arb-group">📝 {b.book}</h4>
        <div className="arb-t-list">
          <button type="button" className="arb-t-item" onClick={() => { const make = () => reviewSet(data.review, b.book); setView({ name: 'play', make, set: make(), from }) }}>
            <b>Ҳамаи дарсҳо (омехта)</b><small>{b.count} савол · ҳар бор {PER}-тои нав</small>
          </button>
          {b.lessons.map(l => (
            <button key={l.n} type="button" className="arb-t-item" onClick={() => { const make = () => reviewSet(data.review, b.book, l.n); setView({ name: 'play', make, set: make(), from }) }}>
              <b>Дарси {l.n}</b><small>{l.count} савол</small>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const groups = {}
  data.drills.drillList().forEach(d => { (groups[d.book] = groups[d.book] || []).push(d) })
  return (
    <div className="arb-tests">
      <p className="arb-note">Ҷавоб фавран санҷида мешавад. Ҳар бор саволҳои нав меоянд.</p>
      <h4 className="arb-group">📝 {REVIEW_GROUP}</h4>
      <div className="arb-t-list">
        {reviewBooks(data.review).map(b => (
          <button key={b.book} type="button" className="arb-t-item" onClick={() => setView({ name: 'book', book: b.book })}>
            <b>{b.book}</b><small>{b.lessons.length} дарс · {b.count} савол</small>
          </button>
        ))}
      </div>
      {Object.entries(groups).map(([book, list]) => (
        <React.Fragment key={book}>
          <h4 className="arb-group">✍️ {book}</h4>
          <div className="arb-t-list">
            {list.map(d => (
              <button key={d.id} type="button" className="arb-t-item" onClick={() => startDrill(d.id)}>
                <b>{unIso(d.title)}</b><small>{unIso(d.info)}</small>
              </button>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}
