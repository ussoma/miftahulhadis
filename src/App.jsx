
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const db = URL && KEY ? createClient(URL, KEY) : null

const sections = [
  ['quran', '📖', 'Қуръони Карим', 'القرآن الكريم'],
  ['hadith', '📚', 'Ҳадисҳо', 'الأحاديث النبوية'],
  ['scholars', '🌿', 'Суханони Солеҳин', 'أقوال السلف الصالح'],
  ['duas', '🤲', 'Дуоҳо', 'الأدعية'],
  ['adhkar', '📿', 'Азкор', 'الأذكار'],
  ['prophets', '🕌', 'Қиссаи Паёмбарон', 'قصص الأنبياء'],
  ['seerah', '🌙', 'Сирати Расулуллоҳ ﷺ', 'السيرة النبوية'],
  ['companions', '⭐', 'Сирати саҳоба', 'سيرة الصحابة'],
  ['lessons', '🎧', 'Дарсҳои Исломӣ', 'الدروس الإسلامية'],
  ['questions', '💬', 'Саволҳои Исломӣ', 'الأسئلة الإسلامية'],
  ['sunnah', '🌱', 'Суннатҳо', 'السُّنَن']
]

const tables = [
  { name: 'sections', title: '11 бахш' },
  { name: 'books', title: 'Китобҳо' },
  { name: 'hadith', title: 'Ҳадисҳо' },
  { name: 'prophets', title: 'Қиссаи паёмбарон' }
]

export default function App() {
  const [page, setPage] = useState('home')
  const [active, setActive] = useState(null)
  const [language, setLanguage] = useState('tg')
  const [theme, setTheme] = useState('white')
  const [login, setLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [admin, setAdmin] = useState(false)
  const [table, setTable] = useState('sections')
  const [rows, setRows] = useState([])
  const [selected, setSelected] = useState(null)
  const [json, setJson] = useState('{}')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')

  const tr = {
    tg: {
      heading: 'Бахшҳои исломӣ',
      choose: 'Бахши дилхоҳро интихоб кунед',
      welcome: 'Илм биомӯз, ба он амал кун.',
      description: 'Қуръон, ҳадис, дуо ва азкор — дар як ҷо.',
      admin: 'Панели админ',
      back: 'Бозгашт',
      empty: 'Мундариҷаи ин бахш ҳоло омода нест.'
    },
    ru: {
      heading: 'Исламские разделы',
      choose: 'Выберите нужный раздел',
      welcome: 'Изучай знания и следуй им.',
      description: 'Коран, хадисы, дуа и азкары — в одном месте.',
      admin: 'Панель администратора',
      back: 'Назад',
      empty: 'Содержимое раздела пока не готово.'
    },
    ar: {
      heading: 'الأقسام الإسلامية',
      choose: 'اختر القسم المناسب',
      welcome: 'تعلّم العلم واعمل به.',
      description: 'القرآن والحديث والدعاء والأذكار في مكان واحد.',
      admin: 'لوحة الإدارة',
      back: 'رجوع',
      empty: 'المحتوى غير جاهز بعد.'
    }
  }[language]

  useEffect(() => {
    const savedLanguage = localStorage.getItem('miftahulhadis-language')
    const savedTheme = localStorage.getItem('miftahulhadis-theme')
    if (savedLanguage) setLanguage(savedLanguage)
    if (savedTheme) setTheme(savedTheme)
  }, [])

  async function signIn(e) {
    e.preventDefault()
    setMessage('')
    if (!db) {
      setMessage('Танзимоти Supabase дар Vercel пур карда нашудаанд.')
      return
    }

    setBusy(true)
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setMessage(error.message)
      setBusy(false)
      return
    }

    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileError || profile?.role !== 'admin') {
      await db.auth.signOut()
      setMessage('Ин ҳисоб иҷозати админ надорад.')
      setBusy(false)
      return
    }

    setAdmin(true)
    setLogin(false)
    setPage('admin')
    setMessage('')
    setBusy(false)
    loadRows(table)
  }

  async function loadRows(tableName = table) {
    if (!db || !admin) return
    setBusy(true)
    setMessage('')
    const { data, error } = await db
      .from(tableName)
      .select('*')
      .limit(200)

    if (error) {
      setMessage(error.message)
      setRows([])
    } else {
      setRows(data || [])
    }
    setSelected(null)
    setJson('{}')
    setBusy(false)
  }

  async function saveRow() {
    if (!db || !admin) return
    let value

    try {
      value = JSON.parse(json)
      if (!value || Array.isArray(value) || typeof value !== 'object') {
        throw new Error('JSON бояд объект бошад.')
      }
    } catch (error) {
      setMessage('Хатои JSON: ' + error.message)
      return
    }

    setBusy(true)
    setMessage('')

    let result

    if (selected?.id) {
      const { id, ...updates } = value
      result = await db.from(table).update(updates).eq('id', selected.id)
    } else {
      result = await db.from(table).insert(value)
    }

    if (result.error) {
      setMessage(result.error.message)
    } else {
      setMessage('Сабт бомуваффақият нигоҳ дошта шуд.')
      await loadRows(table)
    }

    setBusy(false)
  }

  async function deleteRow(row) {
    if (!db || !admin || !row?.id) return
    if (!window.confirm('Ин сабтро нест мекунӣ?')) return

    setBusy(true)
    const { error } = await db.from(table).delete().eq('id', row.id)

    if (error) setMessage(error.message)
    else {
      setMessage('Сабт нест карда шуд.')
      await loadRows(table)
    }
    setBusy(false)
  }

  async function logout() {
    if (db) await db.auth.signOut()
    setAdmin(false)
    setPage('home')
    setRows([])
    setSelected(null)
  }

  function chooseTable(name) {
    setTable(name)
    setSelected(null)
    setJson('{}')
    loadRows(name)
  }

  function chooseRow(row) {
    setSelected(row)
    setJson(JSON.stringify(row, null, 2))
  }

  function changeLanguage(value) {
    setLanguage(value)
    localStorage.setItem('miftahulhadis-language', value)
  }

  function changeTheme() {
    const value = theme === 'white' ? 'green' : 'white'
    setTheme(value)
    localStorage.setItem('miftahulhadis-theme', value)
  }

  return (
    <main className={`app theme-${theme}`}>
      <header className="header">
        <div className="header-top">
          <div className="brand-icon">م</div>
          <div>
            <h1>Miftahulhadis</h1>
            <p className="arabic-title">مفتاح الحديث</p>
          </div>
          <button className="theme-toggle" onClick={changeTheme}>
            {theme === 'white' ? '🌙 Сабз' : '☀️ Сафед'}
          </button>
        </div>

        <div className="header-welcome">
          <span className="welcome-label">КИТОБХОНАИ ИСЛОМӢ</span>
          <h2>{tr.welcome}</h2>
          <p>{tr.description}</p>
        </div>
      </header>

      <div className="language-selector">
        <label>Забон: </label>
        <select
          className="language-select"
          value={language}
          onChange={e => changeLanguage(e.target.value)}
        >
          <option value="tg">Тоҷикӣ 🇹🇯</option>
          <option value="ru">Русский 🇷🇺</option>
          <option value="ar">العربية 🇸🇦</option>
        </select>
      </div>

      {page === 'home' && (
        <section className="main-content">
          <div className="section-heading">
            <div>
              <h2>{tr.heading}</h2>
              <p>{tr.choose}</p>
            </div>
            <span className="section-count">11 бахш</span>
          </div>

          <div className="menu">
            {sections.map(([key, icon, title, arabic], index) => (
              <button
                className="menu-card"
                key={key}
                onClick={() => {
                  setActive({ key, icon, title, arabic })
                  setPage('section')
                }}
              >
                <span className="card-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="card-icon">{icon}</span>
                <span className="card-text">
                  <strong>{title}</strong>
                  <small>{arabic}</small>
                </span>
                <span className="card-arrow">‹</span>
              </button>
            ))}
          </div>

          <button className="back-button" onClick={() => setLogin(true)}>
            🔐 {tr.admin}
          </button>
        </section>
      )}

      {page === 'section' && active && (
        <section className="content-page">
          <button className="back-button" onClick={() => setPage('home')}>
            ← {tr.back}
          </button>
          <div className="section-intro">
            <div className="section-icon">{active.icon}</div>
            <h2>{active.title}</h2>
            <p className="arabic-title">{active.arabic}</p>
            <p>{tr.empty}</p>
          </div>
        </section>
      )}

      {login && !admin && (
        <section className="content-page">
          <button className="back-button" onClick={() => setLogin(false)}>
            ← {tr.back}
          </button>
          <div className="section-intro">
            <h2>🔐 Вуруди админ</h2>
            <form onSubmit={signIn} className="admin-form">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Парол"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button className="back-button" disabled={busy}>
                {busy ? 'Лутфан интизор шавед...' : 'Ворид шудан'}
              </button>
            </form>
            {message && <p className="coming-soon">{message}</p>}
          </div>
        </section>
      )}

      {page === 'admin' && admin && (
        <section className="content-page">
          <button className="back-button" onClick={logout}>
            Баромадан
          </button>

          <div className="section-heading">
            <div>
              <h2>Панели админ</h2>
              <p>Идоракунии маълумоти Miftahulhadis</p>
            </div>
          </div>

          <div className="admin-tabs">
            {tables.map(item => (
              <button
                key={item.name}
                className="back-button"
                onClick={() => chooseTable(item.name)}
              >
                {item.title}
              </button>
            ))}
          </div>

          <h3>Ҷадвал: {table}</h3>
          <button
            className="back-button"
            onClick={() => {
              setSelected(null)
              setJson('{}')
            }}
          >
            + Иловаи сабти нав
          </button>

          <div className="admin-records">
            {rows.map((row, index) => (
              <div className="admin-record" key={row.id || index}>
                <button
                  className="record-select"
                  onClick={() => chooseRow(row)}
                >
                  {row.name || row.title || row.hadith_number || row.id || `Сабт ${index + 1}`}
                </button>
                <button
                  className="delete-button"
                  onClick={() => deleteRow(row)}
                >
                  Нест кардан
                </button>
              </div>
            ))}
            {!rows.length && <p>Дар ин ҷадвал ҳоло сабт нест.</p>}
          </div>

          <h3>{selected ? 'Таҳрири сабт' : 'Сабти нав'}</h3>
          <p>Маълумотро дар формати JSON ворид кун:</p>
          <textarea
            className="admin-json"
            value={json}
            onChange={e => setJson(e.target.value)}
            rows={12}
            spellCheck="false"
          />
          <button
            className="back-button"
            onClick={saveRow}
            disabled={busy}
          >
            {busy ? 'Нигоҳ дошта истодааст...' : '💾 Нигоҳ доштан'}
          </button>

          {message && <p className="coming-soon">{message}</p>}
        </section>
      )}

      <footer className="footer">
        <div className="footer-brand">Miftahulhadis</div>
        <p>Манбаи дониш ва омӯзиши исломӣ</p>
        <small>© {new Date().getFullYear()} Miftahulhadis</small>
      </footer>
    </main>
  )
}
