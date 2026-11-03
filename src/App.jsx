
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const URL = String(import.meta.env.VITE_SUPABASE_URL || '').trim()
const KEY = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

let db = null

if (URL && KEY) {
  try {
    db = createClient(URL, KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  } catch (error) {
    console.error('Supabase initialization error:', error)
  }
}

// 11 main sections
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

// Interface translations
const translations = {
  tg: {
    language: 'Забон',
    themeGreen: '🌙 Сабз',
    themeWhite: '☀️ Сафед',
    welcomeLabel: 'КИТОБХОНАИ ИСЛОМӢ',
    welcome: 'Илм биомӯз, ба он амал кун.',
    description: 'Қуръон, ҳадис, дуо ва азкор — дар як ҷо.',
    heading: 'Бахшҳои исломӣ',
    choose: 'Бахши дилхоҳро интихоб кунед',
    admin: 'Панели админ',
    back: 'Бозгашт',
    empty: 'Мундариҷаи ин бахш ҳоло омода нест.',
    loginTitle: 'Вуруди админ',
    email: 'Email',
    password: 'Парол',
    wait: 'Лутфан интизор шавед...',
    signIn: 'Ворид шудан',
    logout: 'Баромадан',
    adminTitle: 'Панели админ',
    adminDescription: 'Идоракунии маълумоти Miftahulhadis',
    sections: 'Бахшҳо',
    books: 'Китобҳо',
    hadith: 'Ҳадисҳо',
    prophets: 'Қиссаи паёмбарон',
    table: 'Ҷадвал',
    add: 'Иловаи сабти нав',
    noRecords: 'Дар ин ҷадвал ҳоло сабт нест.',
    edit: 'Таҳрири сабт',
    newRecord: 'Сабти нав',
    jsonInfo: 'Маълумотро дар формати JSON ворид кун:',
    saving: 'Нигоҳ дошта истодааст...',
    save: '💾 Нигоҳ доштан',
    delete: 'Нест кардан',
    confirmDelete: 'Ин сабтро нест мекунӣ?',
    saved: 'Сабт бомуваффақият нигоҳ дошта шуд.',
    deleted: 'Сабт нест карда шуд.',
    invalidJson: 'JSON бояд объект бошад.',
    jsonError: 'Хатои JSON: ',
    noConfig: 'Танзимоти Supabase дар Vercel пур карда нашудаанд.',
    noUrl: 'VITE_SUPABASE_URL ёфт нашуд.',
    noKey: 'VITE_SUPABASE_ANON_KEY ёфт нашуд.',
    noAdmin: 'Ин ҳисоб иҷозати админ надорад.',
    footer: 'Манбаи дониш ва омӯзиши исломӣ',
    count: 'бахш',
    databaseError: 'Хатои пойгоҳи маълумот: ',
    unknownError: 'Хатои номаълум рух дод.'
  },

  ru: {
    language: 'Язык',
    themeGreen: '🌙 Зелёная',
    themeWhite: '☀️ Белая',
    welcomeLabel: 'ИСЛАМСКАЯ БИБЛИОТЕКА',
    welcome: 'Изучай знания и следуй им.',
    description: 'Коран, хадисы, дуа и азкары — в одном месте.',
    heading: 'Исламские разделы',
    choose: 'Выберите нужный раздел',
    admin: 'Панель администратора',
    back: 'Назад',
    empty: 'Содержимое этого раздела пока не готово.',
    loginTitle: 'Вход администратора',
    email: 'Email',
    password: 'Пароль',
    wait: 'Пожалуйста, подождите...',
    signIn: 'Войти',
    logout: 'Выйти',
    adminTitle: 'Панель администратора',
    adminDescription: 'Управление данными Miftahulhadis',
    sections: 'Разделы',
    books: 'Книги',
    hadith: 'Хадисы',
    prophets: 'Истории пророков',
    table: 'Таблица',
    add: 'Добавить новую запись',
    noRecords: 'В этой таблице пока нет записей.',
    edit: 'Редактировать запись',
    newRecord: 'Новая запись',
    jsonInfo: 'Введите данные в формате JSON:',
    saving: 'Сохранение...',
    save: '💾 Сохранить',
    delete: 'Удалить',
    confirmDelete: 'Удалить эту запись?',
    saved: 'Запись успешно сохранена.',
    deleted: 'Запись удалена.',
    invalidJson: 'JSON должен быть объектом.',
    jsonError: 'Ошибка JSON: ',
    noConfig: 'Настройки Supabase не заполнены в Vercel.',
    noUrl: 'Не найдена VITE_SUPABASE_URL.',
    noKey: 'Не найдена VITE_SUPABASE_ANON_KEY.',
    noAdmin: 'У этой учётной записи нет прав администратора.',
    footer: 'Источник знаний и исламского обучения',
    count: 'разделов',
    databaseError: 'Ошибка базы данных: ',
    unknownError: 'Произошла неизвестная ошибка.'
  },

  ar: {
    language: 'اللغة',
    themeGreen: '🌙 أخضر',
    themeWhite: '☀️ أبيض',
    welcomeLabel: 'المكتبة الإسلامية',
    welcome: 'تعلّم العلم واعمل به.',
    description: 'القرآن والحديث والدعاء والأذكار في مكان واحد.',
    heading: 'الأقسام الإسلامية',
    choose: 'اختر القسم المناسب',
    admin: 'لوحة الإدارة',
    back: 'رجوع',
    empty: 'محتوى هذا القسم غير جاهز بعد.',
    loginTitle: 'دخول المسؤول',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    wait: 'يرجى الانتظار...',
    signIn: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    adminTitle: 'لوحة الإدارة',
    adminDescription: 'إدارة بيانات Miftahulhadis',
    sections: 'الأقسام',
    books: 'الكتب',
    hadith: 'الأحاديث',
    prophets: 'قصص الأنبياء',
    table: 'الجدول',
    add: 'إضافة سجل جديد',
    noRecords: 'لا توجد سجلات في هذا الجدول حاليًا.',
    edit: 'تعديل السجل',
    newRecord: 'سجل جديد',
    jsonInfo: 'أدخل البيانات بصيغة JSON:',
    saving: 'جارٍ الحفظ...',
    save: '💾 حفظ',
    delete: 'حذف',
    confirmDelete: 'هل تريد حذف هذا السجل؟',
    saved: 'تم حفظ السجل بنجاح.',
    deleted: 'تم حذف السجل.',
    invalidJson: 'يجب أن يكون JSON كائنًا.',
    jsonError: 'خطأ في JSON: ',
    noConfig: 'لم يتم إعداد Supabase في Vercel.',
    noUrl: 'لم يتم العثور على VITE_SUPABASE_URL.',
    noKey: 'لم يتم العثور على VITE_SUPABASE_ANON_KEY.',
    noAdmin: 'هذا الحساب لا يملك صلاحيات المسؤول.',
    footer: 'مصدر للعلم والتعلم الإسلامي',
    count: 'أقسام',
    databaseError: 'خطأ في قاعدة البيانات: ',
    unknownError: 'حدث خطأ غير معروف.'
  }
}

// Section names in each language
const sectionTranslations = {
  tg: {
    quran: 'Қуръони Карим',
    hadith: 'Ҳадисҳо',
    scholars: 'Суханони Солеҳин',
    duas: 'Дуоҳо',
    adhkar: 'Азкор',
    prophets: 'Қиссаи Паёмбарон',
    seerah: 'Сирати Расулуллоҳ ﷺ',
    companions: 'Сирати саҳоба',
    lessons: 'Дарсҳои Исломӣ',
    questions: 'Саволҳои Исломӣ',
    sunnah: 'Суннатҳо'
  },
  ru: {
    quran: 'Священный Коран',
    hadith: 'Хадисы',
    scholars: 'Слова праведных предшественников',
    duas: 'Дуа',
    adhkar: 'Азкары',
    prophets: 'Истории пророков',
    seerah: 'Жизнеописание Посланника Аллаха ﷺ',
    companions: 'Жизнеописание сподвижников',
    lessons: 'Исламские уроки',
    questions: 'Исламские вопросы',
    sunnah: 'Сунны'
  },
  ar: {
    quran: 'القرآن الكريم',
    hadith: 'الأحاديث النبوية',
    scholars: 'أقوال السلف الصالح',
    duas: 'الأدعية',
    adhkar: 'الأذكار',
    prophets: 'قصص الأنبياء',
    seerah: 'السيرة النبوية',
    companions: 'سيرة الصحابة',
    lessons: 'الدروس الإسلامية',
    questions: 'الأسئلة الإسلامية',
    sunnah: 'السُّنَن'
  }
}

// Tables available in the current Supabase database
const tableNames = {
  sections: 'sections',
  books: 'books',
  hadith: 'hadith',
  prophets: 'prophets'
}

// IMPORTANT: This array is used by the admin tabs.
const tables = Object.keys(tableNames).map(name => ({ name }))

export default function App() {
  const [page, setPage] = useState('home')
  const [active, setActive] = useState(null)

  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('miftahulhadis-language')
      return translations[saved] ? saved : 'tg'
    } catch {
      return 'tg'
    }
  })

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('miftahulhadis-theme')
      return saved === 'green' ? 'green' : 'white'
    } catch {
      return 'white'
    }
  })

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

  const tr = translations[language] || translations.tg
  const isArabic = language === 'ar'

  const tableTitles = {
    sections: tr.sections,
    books: tr.books,
    hadith: tr.hadith,
    prophets: tr.prophets
  }

  const currentSection = active
    ? sectionTranslations[language]?.[active.key] || active.title
    : ''

  // Set document language and direction
  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr'
  }, [language, isArabic])

  // Restore the current Supabase session and check admin permissions
  useEffect(() => {
    let mounted = true

    async function restoreSession() {
      if (!db) return

      try {
        const { data, error } = await db.auth.getSession()

        if (error || !data?.session?.user || !mounted) return

        const user = data.session.user

        const { data: profile, error: profileError } = await db
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        if (!mounted) return

        if (!profileError && profile?.role === 'admin') {
          setAdmin(true)
        }
      } catch (error) {
        console.error('Session restore error:', error)
      }
    }

    restoreSession()

    return () => {
      mounted = false
    }
  }, [])

  function getConfigError() {
    if (!URL) return tr.noUrl
    if (!KEY) return tr.noKey
    if (!db) return tr.noConfig
    return ''
  }

  // Administrator login
  async function signIn(e) {
    e.preventDefault()
    setMessage('')

    const configError = getConfigError()

    if (configError) {
      setMessage(configError)
      return
    }

    setBusy(true)

    try {
      const { data, error } = await db.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        setMessage(error.message)
        return
      }

      if (!data?.user) {
        setMessage(tr.noAdmin)
        return
      }

      const { data: profile, error: profileError } = await db
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

      if (profileError) {
        await db.auth.signOut()
        setMessage(tr.databaseError + profileError.message)
        return
      }

      if (profile?.role !== 'admin') {
        await db.auth.signOut()
        setMessage(tr.noAdmin)
        return
      }

      setAdmin(true)
      setLogin(false)
      setPage('admin')
      setMessage('')

      await loadRows(table)
    } catch (error) {
      setMessage(error?.message || tr.unknownError)
    } finally {
      setBusy(false)
    }
  }

  // Load records from a Supabase table
  async function loadRows(tableName = table) {
    if (!db) {
      setMessage(getConfigError())
      setRows([])
      return
    }

    if (!Object.prototype.hasOwnProperty.call(tableNames, tableName)) {
      setMessage(tr.unknownError)
      return
    }

    setBusy(true)
    setMessage('')

    try {
      const { data, error } = await db
        .from(tableNames[tableName])
        .select('*')
        .limit(200)

      if (error) {
        setMessage(tr.databaseError + error.message)
        setRows([])
      } else {
        setRows(data || [])
      }

      setSelected(null)
      setJson('{}')
    } catch (error) {
      setRows([])
      setMessage(error?.message || tr.unknownError)
    } finally {
      setBusy(false)
    }
  }

  // Save a new record or update an existing one
  async function saveRow() {
    if (!db || !admin) {
      setMessage(getConfigError() || tr.noAdmin)
      return
    }

    let value

    try {
      value = JSON.parse(json)

      if (
        !value ||
        Array.isArray(value) ||
        typeof value !== 'object'
      ) {
        throw new Error(tr.invalidJson)
      }
    } catch (error) {
      setMessage(tr.jsonError + error.message)
      return
    }

    setBusy(true)
    setMessage('')

    try {
      let result

      if (selected?.id) {
        const { id, ...updates } = value

        result = await db
          .from(tableNames[table])
          .update(updates)
          .eq('id', selected.id)
      } else {
        result = await db
          .from(tableNames[table])
          .insert(value)
      }

      if (result.error) {
        setMessage(tr.databaseError + result.error.message)
      } else {
        setMessage(tr.saved)
        await loadRows(table)
      }
    } catch (error) {
      setMessage(error?.message || tr.unknownError)
    } finally {
      setBusy(false)
    }
  }

  // Delete a record
  async function deleteRow(row) {
    if (!db || !admin || !row?.id) return

    if (!window.confirm(tr.confirmDelete)) return

    setBusy(true)
    setMessage('')

    try {
      const { error } = await db
        .from(tableNames[table])
        .delete()
        .eq('id', row.id)

      if (error) {
        setMessage(tr.databaseError + error.message)
      } else {
        setMessage(tr.deleted)
        await loadRows(table)
      }
    } catch (error) {
      setMessage(error?.message || tr.unknownError)
    } finally {
      setBusy(false)
    }
  }

  // Logout
  async function logout() {
    setBusy(true)

    try {
      if (db) {
        const { error } = await db.auth.signOut()
        if (error) console.error('Logout error:', error)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAdmin(false)
      setPage('home')
      setRows([])
      setSelected(null)
      setLogin(false)
      setPassword('')
      setMessage('')
      setBusy(false)
    }
  }

  // Change admin table
  function chooseTable(name) {
    if (!Object.prototype.hasOwnProperty.call(tableNames, name)) return

    setTable(name)
    setSelected(null)
    setJson('{}')
    setMessage('')
    loadRows(name)
  }

  // Select a record for editing
  function chooseRow(row) {
    setSelected(row)
    setJson(JSON.stringify(row, null, 2))
    setMessage('')
  }

  // Change interface language
  function changeLanguage(value) {
    if (!translations[value]) return

    setLanguage(value)

    try {
      localStorage.setItem('miftahulhadis-language', value)
    } catch (error) {
      console.warn('Could not save language:', error)
    }
  }

  // Change interface theme
  function changeTheme() {
    const value = theme === 'white' ? 'green' : 'white'

    setTheme(value)

    try {
      localStorage.setItem('miftahulhadis-theme', value)
    } catch (error) {
      console.warn('Could not save theme:', error)
    }
  }

  return (
    <main
      className={`app theme-${theme}`}
      dir={isArabic ? 'rtl' : 'ltr'}
      lang={language}
    >
      <header className="header">
        <div className="header-top">
          <div className="brand-icon">م</div>

          <div>
            <h1>Miftahulhadis</h1>
            <p className="arabic-title">مفتاح الحديث</p>
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={changeTheme}
          >
            {theme === 'white' ? tr.themeGreen : tr.themeWhite}
          </button>
        </div>

        <div className="header-welcome">
          <span className="welcome-label">{tr.welcomeLabel}</span>
          <h2>{tr.welcome}</h2>
          <p>{tr.description}</p>
        </div>
      </header>

      <div className="language-selector">
        <label htmlFor="language-select">{tr.language}: </label>

        <select
          id="language-select"
          className="language-select"
          value={language}
          onChange={e => changeLanguage(e.target.value)}
        >
          <option value="tg">Тоҷикӣ 🇹🇯</option>
          <option value="ru">Русский 🇷🇺</option>
          <option value="ar">العربية 🇸🇦</option>
        </select>
      </div>

      {/* Home page */}
      {page === 'home' && (
        <section className="main-content">
          <div className="section-heading">
            <div>
              <h2>{tr.heading}</h2>
              <p>{tr.choose}</p>
            </div>

            <span className="section-count">
              {language === 'ar' ? '١١' : '11'} {tr.count}
            </span>
          </div>

          <div className="menu">
            {sections.map(([key, icon, title, arabic], index) => (
              <button
                type="button"
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
                  <strong>
                    {sectionTranslations[language][key]}
                  </strong>
                  <small>{arabic}</small>
                </span>

                <span className="card-arrow">‹</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => {
              setLogin(true)
              setMessage('')
            }}
          >
            🔐 {tr.admin}
          </button>
        </section>
      )}

      {/* Section page */}
      {page === 'section' && active && (
        <section className="content-page">
          <button
            type="button"
            className="back-button"
            onClick={() => setPage('home')}
          >
            ← {tr.back}
          </button>

          <div className="section-intro">
            <div className="section-icon">{active.icon}</div>
            <h2>{currentSection}</h2>
            <p className="arabic-title">{active.arabic}</p>
            <p>{tr.empty}</p>
          </div>
        </section>
      )}

      {/* Admin login */}
      {login && !admin && (
        <section className="content-page">
          <button
            type="button"
            className="back-button"
            onClick={() => {
              setLogin(false)
              setMessage('')
            }}
          >
            ← {tr.back}
          </button>

          <div className="section-intro">
            <h2>🔐 {tr.loginTitle}</h2>

            <form onSubmit={signIn} className="admin-form">
              <input
                type="email"
                placeholder={tr.email}
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="username"
                required
              />

              <input
                type="password"
                placeholder={tr.password}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="submit"
                className="back-button"
                disabled={busy}
              >
                {busy ? tr.wait : tr.signIn}
              </button>
            </form>

            {message && (
              <p className="coming-soon" role="alert">
                {message}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Admin panel */}
      {page === 'admin' && admin && (
        <section className="content-page">
          <button
            type="button"
            className="back-button"
            onClick={logout}
            disabled={busy}
          >
            {tr.logout}
          </button>

          <div className="section-heading">
            <div>
              <h2>{tr.adminTitle}</h2>
              <p>{tr.adminDescription}</p>
            </div>
          </div>

          <div className="admin-tabs">
            {tables.map(item => (
              <button
                type="button"
                key={item.name}
                className="back-button"
                onClick={() => chooseTable(item.name)}
                disabled={busy}
              >
                {tableTitles[item.name]}
              </button>
            ))}
          </div>

          <h3>
            {tr.table}: {tableTitles[table]}
          </h3>

          <button
            type="button"
            className="back-button"
            disabled={busy}
            onClick={() => {
              setSelected(null)
              setJson('{}')
              setMessage('')
            }}
          >
            + {tr.add}
          </button>

          <div className="admin-records">
            {rows.map((row, index) => (
              <div
                className="admin-record"
                key={row.id || index}
              >
                <button
                  type="button"
                  className="record-select"
                  onClick={() => chooseRow(row)}
                  disabled={busy}
                >
                  {row.name ||
                    row.title ||
                    row.hadith_number ||
                    row.id ||
                    `${tr.newRecord} ${index + 1}`}
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteRow(row)}
                  disabled={busy}
                >
                  {tr.delete}
                </button>
              </div>
            ))}

            {!rows.length && (
              <p>{busy ? tr.wait : tr.noRecords}</p>
            )}
          </div>

          <h3>{selected ? tr.edit : tr.newRecord}</h3>
          <p>{tr.jsonInfo}</p>

          <textarea
            className="admin-json"
            value={json}
            onChange={e => setJson(e.target.value)}
            rows={12}
            spellCheck="false"
            dir="auto"
          />

          <button
            type="button"
            className="back-button"
            onClick={saveRow}
            disabled={busy}
          >
            {busy ? tr.saving : tr.save}
          </button>

          {message && (
            <p className="coming-soon" role="alert">
              {message}
            </p>
          )}
        </section>
      )}

      <footer className="footer">
        <div className="footer-brand">Miftahulhadis</div>
        <p>{tr.footer}</p>
        <small>© {new Date().getFullYear()} Miftahulhadis</small>
      </footer>
    </main>
  )
}
