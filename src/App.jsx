
import React, { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

import './index.css'

const URL = String(import.meta.env.VITE_SUPABASE_URL || '').trim()
const KEY = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

const db = URL && KEY
  ? createClient(URL, KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null

const SECTIONS = [
  { slug: 'quran', icon: '📖', tg: 'Қуръони Карим', ru: 'Священный Коран', ar: 'القرآن الكريم' },
  { slug: 'hadith', icon: '📚', tg: 'Ҳадисҳо', ru: 'Хадисы', ar: 'الأحاديث' },
  { slug: 'sunnah', icon: '🌱', tg: 'Суннатҳо', ru: 'Сунны', ar: 'السنن' },
  { slug: 'seerah', icon: '🕌', tg: 'Сирати Расулуллоҳ ﷺ', ru: 'Жизнеописание Посланника Аллаха ﷺ', ar: 'سيرة رسول الله ﷺ' },
  { slug: 'prophets', icon: '🌙', tg: 'Қиссаи Паёмбарон عليهم السلام', ru: 'Истории пророков', ar: 'قصص الأنبياء' },
  { slug: 'companions', icon: '🤝', tg: 'Сирати саҳоба رضي الله عنهم', ru: 'Жизнеописание сподвижников', ar: 'سيرة الصحابة' },
  { slug: 'salihin', icon: '📜', tg: 'Суханони Солеҳин', ru: 'Слова праведных предшественников', ar: 'أقوال السلف الصالح' },
  { slug: 'duas', icon: '🤲', tg: 'Дуоҳо', ru: 'Дуа', ar: 'الأدعية' },
  { slug: 'adhkar', icon: '📿', tg: 'Азкор', ru: 'Азкары', ar: 'الأذكار' },
  { slug: 'lessons', icon: '🎓', tg: 'Дарсҳои исломӣ', ru: 'Исламские уроки', ar: 'الدروس الإسلامية' },
  { slug: 'questions', icon: '❔', tg: 'Саволҳои исломӣ', ru: 'Исламские вопросы', ar: 'الأسئلة الإسلامية' }
]

const T = {
  tg: {
    title: 'Miftahulhadis',
    welcome: 'Китобхонаи исломӣ',
    description: 'Сарчашмаҳои исломӣ барои омӯзиши илм ва амал ба он.',
    sections: 'Бахшҳои исломӣ',
    search: 'Ҷустуҷӯ дар тамоми бахшҳо...',
    back: 'Бозгашт',
    empty: 'Дар ин бахш ҳоло мавод нест.',
    noResults: 'Натиҷае ёфт нашуд.',
    admin: 'Панели админ',
    login: 'Воридшавии админ',
    email: 'Почтаи электронӣ',
    password: 'Парол',
    enter: 'Ворид шудан',
    logout: 'Баромадан аз ҳисоб',
    close: 'Пӯшидани панел',
    hadith: 'Ҳадис',
    add: 'Илова кардан',
    edit: 'Таҳрир кардан',
    delete: 'Нест кардан',
    save: 'Сабт кардан',
    cancel: 'Бекор кардан',
    book: 'Китоб',
    number: 'Рақами ҳадис',
    arabic: 'Матни арабӣ',
    tajik: 'Тарҷумаи тоҷикӣ',
    source: 'Манбаъ',
    commentary: 'Шарҳ',
    titleField: 'Ном ё сарлавҳа',
    content: 'Матн',
    russian: 'Тарҷумаи русӣ',
    published: 'Нашр шудааст',
    draft: 'Лоиҳа / нашр нашудааст',
    selectSection: 'Бахшро интихоб кунед',
    items: 'Мавод',
    confirmDelete: 'Ин маводро нест мекунед?',
    loginError: 'Почта ё парол нодуруст аст ё ин ҳисоб ҳуқуқи админ надорад.',
    loadError: 'Ҳангоми гирифтани маълумот хато рӯй дод.',
    saveError: 'Сабт нашуд. Лутфан маълумотро санҷед.',
    saved: 'Маълумот сабт шуд.',
    searchResults: 'Натиҷаҳои ҷустуҷӯ',
    daily: 'Маводи рӯз',
    noDaily: 'Маводи рӯз ҳоло интихоб нашудааст.',
    theme: 'Тағйир додани намуди зоҳирӣ',
    language: 'Забон',
    adminContent: 'Маводи бахшҳо',
    adminHadith: 'Идораи ҳадисҳо',
    addHadith: 'Иловаи ҳадис',
    addContent: 'Иловаи мавод',
    all: 'Ҳама',
    show: 'Намоиш',
    hide: 'Пинҳон кардан',
    chooseBook: 'Китобро интихоб кунед'
  },
  ru: {
    title: 'Miftahulhadis',
    welcome: 'Исламская библиотека',
    description: 'Исламские источники для изучения знаний и применения их в жизни.',
    sections: 'Исламские разделы',
    search: 'Поиск по всем разделам...',
    back: 'Назад',
    empty: 'В этом разделе пока нет материалов.',
    noResults: 'Ничего не найдено.',
    admin: 'Панель администратора',
    login: 'Вход администратора',
    email: 'Электронная почта',
    password: 'Пароль',
    enter: 'Войти',
    logout: 'Выйти из аккаунта',
    close: 'Закрыть панель',
    hadith: 'Хадис',
    add: 'Добавить',
    edit: 'Редактировать',
    delete: 'Удалить',
    save: 'Сохранить',
    cancel: 'Отмена',
    book: 'Книга',
    number: 'Номер хадиса',
    arabic: 'Арабский текст',
    tajik: 'Таджикский перевод',
    source: 'Источник',
    commentary: 'Комментарий',
    titleField: 'Название или заголовок',
    content: 'Текст',
    russian: 'Русский перевод',
    published: 'Опубликовано',
    draft: 'Черновик / не опубликовано',
    selectSection: 'Выберите раздел',
    items: 'Материалы',
    confirmDelete: 'Удалить этот материал?',
    loginError: 'Неверная почта или пароль либо у аккаунта нет прав администратора.',
    loadError: 'Не удалось загрузить данные.',
    saveError: 'Не удалось сохранить. Проверьте данные.',
    saved: 'Данные сохранены.',
    searchResults: 'Результаты поиска',
    daily: 'Материал дня',
    noDaily: 'Материал дня пока не выбран.',
    theme: 'Изменить оформление',
    language: 'Язык',
    adminContent: 'Материалы разделов',
    adminHadith: 'Управление хадисами',
    addHadith: 'Добавить хадис',
    addContent: 'Добавить материал',
    all: 'Все',
    show: 'Опубликовать',
    hide: 'Скрыть',
    chooseBook: 'Выберите книгу'
  },
  ar: {
    title: 'Miftahulhadis',
    welcome: 'المكتبة الإسلامية',
    description: 'مصادر إسلامية لطلب العلم والعمل به.',
    sections: 'الأقسام الإسلامية',
    search: 'البحث في جميع الأقسام...',
    back: 'رجوع',
    empty: 'لا توجد مواد في هذا القسم حالياً.',
    noResults: 'لم يتم العثور على نتائج.',
    admin: 'لوحة الإدارة',
    login: 'دخول المسؤول',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    enter: 'دخول',
    logout: 'تسجيل الخروج',
    close: 'إغلاق اللوحة',
    hadith: 'حديث',
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    book: 'الكتاب',
    number: 'رقم الحديث',
    arabic: 'النص العربي',
    tajik: 'الترجمة الطاجيكية',
    source: 'المصدر',
    commentary: 'الشرح',
    titleField: 'العنوان',
    content: 'النص',
    russian: 'الترجمة الروسية',
    published: 'منشور',
    draft: 'مسودة / غير منشور',
    selectSection: 'اختر القسم',
    items: 'المواد',
    confirmDelete: 'هل تريد حذف هذه المادة؟',
    loginError: 'البريد أو كلمة المرور غير صحيحة أو لا تملك صلاحية الإدارة.',
    loadError: 'حدث خطأ أثناء تحميل البيانات.',
    saveError: 'تعذر الحفظ. تحقق من البيانات.',
    saved: 'تم حفظ البيانات.',
    searchResults: 'نتائج البحث',
    daily: 'مادة اليوم',
    noDaily: 'لم يتم اختيار مادة اليوم بعد.',
    theme: 'تغيير المظهر',
    language: 'اللغة',
    adminContent: 'مواد الأقسام',
    adminHadith: 'إدارة الأحاديث',
    addHadith: 'إضافة حديث',
    addContent: 'إضافة مادة',
    all: 'الكل',
    show: 'نشر',
    hide: 'إخفاء',
    chooseBook: 'اختر الكتاب'
  }
}

const emptyHadith = {
  id: null,
  book_id: '',
  hadith_number: '',
  arabic_text: '',
  tajik_text: '',
  source_note: '',
  commentary: '',
  is_published: false
}

const emptyContent = {
  id: null,
  section_slug: 'sunnah',
  title: '',
  content_text: '',
  question_text: '',
  answer_text: '',
  arabic_text: '',
  tajik_text: '',
  russian_text: '',
  source_note: '',
  commentary: '',
  media_url: '',
  is_published: false,
  sort_order: 0
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #dce7df',
  borderRadius: '10px',
  fontSize: '14px',
  color: '#183b2b',
  background: '#fff',
  marginTop: '5px'
}

const fieldStyle = {
  display: 'block',
  marginBottom: '13px',
  fontSize: '13px',
  fontWeight: 700,
  color: '#183b2b'
}

const primaryButton = {
  padding: '11px 16px',
  border: 0,
  borderRadius: '10px',
  background: '#087a43',
  color: '#fff',
  fontWeight: 800,
  cursor: 'pointer'
}

const secondaryButton = {
  padding: '10px 14px',
  border: '1px solid #dce7df',
  borderRadius: '10px',
  background: '#fff',
  color: '#183b2b',
  fontWeight: 700,
  cursor: 'pointer'
}

function App() {
  const [lang, setLang] = useState('tg')
  const [theme, setTheme] = useState('white')
  const [page, setPage] = useState('home')
  const [selectedSection, setSelectedSection] = useState(null)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const [admin, setAdmin] = useState(false)
  const [login, setLogin] = useState(window.location.hash === '#admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [books, setBooks] = useState([])
  const [hadithRows, setHadithRows] = useState([])
  const [contentRows, setContentRows] = useState([])
  const [adminTab, setAdminTab] = useState('content')
  const [editingHadith, setEditingHadith] = useState(null)
  const [editingContent, setEditingContent] = useState(null)
  const [hadithForm, setHadithForm] = useState(emptyHadith)
  const [contentForm, setContentForm] = useState(emptyContent)

  const tr = T[lang]
  const isRTL = lang === 'ar'

  const sectionName = (section) => section?.[lang] || section?.tg || ''

  useEffect(() => {
    if (!db) return

    let active = true

    const checkAdmin = async (user) => {
      if (!user || !active) {
        setAdmin(false)
        return
      }

      const { data, error } = await db
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (!active) return

      if (!error && data?.role === 'admin') {
        setAdmin(true)
        setLogin(false)
        setPage('admin')
      } else {
        setAdmin(false)
      }
    }

    db.auth.getSession().then(({ data }) => {
      if (active && data?.session?.user) {
        checkAdmin(data.session.user)
      }
    })

    const { data: listener } = db.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkAdmin(session.user)
      } else {
        setAdmin(false)
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (admin) loadAdminData()
  }, [admin])

  const loadAdminData = async () => {
    if (!db) return

    setLoading(true)

    const [bookResult, hadithResult, contentResult] = await Promise.all([
      db.from('books').select('*').order('sort_order', { ascending: true }),
      db.from('hadith').select('*').order('created_at', { ascending: false }),
      db.from('content_items').select('*').order('sort_order', { ascending: true })
    ])

    if (bookResult.error || hadithResult.error || contentResult.error) {
      setMessage(tr.loadError)
    } else {
      setBooks(bookResult.data || [])
      setHadithRows(hadithResult.data || [])
      setContentRows(contentResult.data || [])
    }

    setLoading(false)
  }

  const loadPublicData = async () => {
    if (!db) return

    const [hadithResult, contentResult] = await Promise.all([
      db.from('hadith')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(500),
      db.from('content_items')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .limit(1000)
    ])

    return {
      hadith: hadithResult.data || [],
      content: contentResult.data || []
    }
  }

  const doLogin = async (event) => {
    event.preventDefault()
    if (!db) {
      setMessage('Supabase танзим нашудааст.')
      return
    }

    setLoading(true)
    setMessage('')

    const { data, error } = await db.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    if (error || !data?.user) {
      setMessage(tr.loginError)
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileError || profile?.role !== 'admin') {
      await db.auth.signOut()
      setMessage(tr.loginError)
      setLoading(false)
      return
    }

    setAdmin(true)
    setLogin(false)
    setPage('admin')
    setMessage('')
    setLoading(false)
  }

  const closeAdmin = () => {
    setPage('home')
    setLogin(false)
    setMessage('')
    // Сессия намеренно нигоҳ дошта мешавад.
  }

  const logout = async () => {
    if (!db) return
    await db.auth.signOut()
    setAdmin(false)
    setLogin(false)
    setPage('home')
    setMessage('')
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }

  const openSection = (section) => {
    setSelectedSection(section)
    setPage('section')
    setSearch('')
    setSearchResults([])
  }

  const runSearch = async (value) => {
    setSearch(value)

    if (!value.trim() || !db) {
      setSearchResults([])
      return
    }

    setSearching(true)

    const [contentResult, hadithResult] = await Promise.all([
      db.from('content_items')
        .select('*')
        .eq('is_published', true)
        .limit(1000),
      db.from('hadith')
        .select('*')
        .eq('is_published', true)
        .limit(1000)
    ])

    const term = value.trim().toLocaleLowerCase()

    const contentMatches = (contentResult.data || [])
      .filter((item) => [
        item.title,
        item.content_text,
        item.question_text,
        item.answer_text,
        item.arabic_text,
        item.tajik_text,
        item.russian_text,
        item.source_note,
        item.commentary
      ].some((field) => String(field || '').toLocaleLowerCase().includes(term)))
      .map((item) => ({ ...item, resultType: 'content' }))

    const hadithMatches = (hadithResult.data || [])
      .filter((item) => [
        item.hadith_number,
        item.arabic_text,
        item.tajik_text,
        item.source_note,
        item.commentary
      ].some((field) => String(field || '').toLocaleLowerCase().includes(term)))
      .map((item) => ({ ...item, resultType: 'hadith' }))

    setSearchResults([...hadithMatches, ...contentMatches])
    setSearching(false)
  }

  const highlight = (text) => {
    const value = String(text || '')
    if (!search.trim()) return value

    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const parts = value.split(new RegExp(`(${escaped})`, 'gi'))

    return parts.map((part, index) =>
      part.toLocaleLowerCase() === search.trim().toLocaleLowerCase()
        ? <mark key={index}>{part}</mark>
        : part
    )
  }

  const saveHadith = async (event) => {
    event.preventDefault()
    if (!db) return

    if (!hadithForm.book_id || !hadithForm.hadith_number || !hadithForm.tajik_text.trim()) {
      setMessage(tr.saveError)
      return
    }

    setLoading(true)
    setMessage('')

    const payload = {
      book_id: hadithForm.book_id,
      hadith_number: Number(hadithForm.hadith_number),
      arabic_text: hadithForm.arabic_text,
      tajik_text: hadithForm.tajik_text,
      source_note: hadithForm.source_note,
      commentary: hadithForm.commentary,
      is_published: hadithForm.is_published,
      updated_at: new Date().toISOString()
    }

    const result = editingHadith
      ? await db.from('hadith').update(payload).eq('id', editingHadith)
      : await db.from('hadith').insert(payload)

    if (result.error) {
      setMessage(`${tr.saveError} ${result.error.message}`)
    } else {
      setMessage(tr.saved)
      setHadithForm(emptyHadith)
      setEditingHadith(null)
      await loadAdminData()
    }

    setLoading(false)
  }

  const saveContent = async (event) => {
    event.preventDefault()
    if (!db) return

    if (!contentForm.title.trim()) {
      setMessage(tr.saveError)
      return
    }

    setLoading(true)
    setMessage('')

    const payload = {
      section_slug: contentForm.section_slug,
      title: contentForm.title,
      content_text: contentForm.content_text,
      question_text: contentForm.question_text,
      answer_text: contentForm.answer_text,
      arabic_text: contentForm.arabic_text,
      tajik_text: contentForm.tajik_text,
      russian_text: contentForm.russian_text,
      source_note: contentForm.source_note,
      commentary: contentForm.commentary,
      media_url: contentForm.media_url,
      is_published: contentForm.is_published,
      sort_order: Number(contentForm.sort_order || 0),
      updated_at: new Date().toISOString()
    }

    const result = editingContent
      ? await db.from('content_items').update(payload).eq('id', editingContent)
      : await db.from('content_items').insert(payload)

    if (result.error) {
      setMessage(`${tr.saveError} ${result.error.message}`)
    } else {
      setMessage(tr.saved)
      setContentForm(emptyContent)
      setEditingContent(null)
      await loadAdminData()
    }

    setLoading(false)
  }

  const editHadith = (item) => {
    setHadithForm({
      id: item.id,
      book_id: item.book_id || '',
      hadith_number: item.hadith_number ?? '',
      arabic_text: item.arabic_text || '',
      tajik_text: item.tajik_text || '',
      source_note: item.source_note || '',
      commentary: item.commentary || '',
      is_published: Boolean(item.is_published)
    })
    setEditingHadith(item.id)
    setMessage('')
  }

  const editContent = (item) => {
    setContentForm({
      ...emptyContent,
      ...item
    })
    setEditingContent(item.id)
    setMessage('')
  }

  const deleteItem = async (table, id) => {
    if (!window.confirm(tr.confirmDelete)) return

    const { error } = await db.from(table).delete().eq('id', id)

    if (error) {
      setMessage(`${tr.saveError} ${error.message}`)
    } else {
      setMessage(tr.saved)
      await loadAdminData()
    }
  }

  const togglePublished = async (table, item) => {
    const { error } = await db
      .from(table)
      .update({
        is_published: !item.is_published,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id)

    if (error) setMessage(`${tr.saveError} ${error.message}`)
    else await loadAdminData()
  }

  const bookName = (bookId) =>
    books.find((book) => book.id === bookId)?.name || ''

  const selectedContent = useMemo(
    () => contentRows.filter((item) => item.section_slug === selectedSection?.slug),
    [contentRows, selectedSection]
  )

  const renderSearchResults = () => (
    <div className="content-page">
      <button className="back-button" onClick={() => {
        setSearch('')
        setSearchResults([])
        setPage('home')
      }}>
        <span>‹</span> {tr.back}
      </button>

      <div className="section-heading">
        <h2>{tr.searchResults}</h2>
        <span className="section-count">{searchResults.length}</span>
      </div>

      {searching && <p>{tr.search}...</p>}

      {!searching && searchResults.length === 0 && (
        <div className="empty-result">
          <span>🔎</span>
          <p>{tr.noResults}</p>
        </div>
      )}

      <div className="menu">
        {searchResults.map((item) => (
          <article className="section-intro" key={`${item.resultType}-${item.id}`}>
            <strong>
              {item.resultType === 'hadith'
                ? `${tr.hadith} № ${item.hadith_number}`
                : item.title}
            </strong>
            {item.resultType === 'hadith' && (
              <p>{bookName(item.book_id)}</p>
            )}
            {item.arabic_text && (
              <p dir="rtl" style={{ fontFamily: 'Noto Naskh Arabic', fontSize: 20 }}>
                {highlight(item.arabic_text)}
              </p>
            )}
            <p>{highlight(item.tajik_text || item.content_text || item.question_text || '')}</p>
            {item.source_note && <small>{highlight(item.source_note)}</small>}
          </article>
        ))}
      </div>
    </div>
  )

  const renderLogin = () => (
    <main className="content-page" style={{ maxWidth: 440, margin: '0 auto' }}>
      <button className="back-button" onClick={() => {
        setLogin(false)
        setPage('home')
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }}>
        <span>‹</span> {tr.back}
      </button>

      <form onSubmit={doLogin} className="section-intro" style={{ textAlign: 'left' }}>
        <h2>{tr.login}</h2>

        <label style={fieldStyle}>
          {tr.email}
          <input
            style={inputStyle}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label style={fieldStyle}>
          {tr.password}
          <input
            style={inputStyle}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {message && <p style={{ color: '#b42318' }}>{message}</p>}

        <button style={primaryButton} disabled={loading}>
          {loading ? '...' : tr.enter}
        </button>
      </form>
    </main>
  )

  const renderHadithForm = () => (
    <form onSubmit={saveHadith} className="section-intro" style={{ textAlign: 'left' }}>
      <h3>{editingHadith ? tr.edit : tr.addHadith}</h3>

      <label style={fieldStyle}>
        {tr.book}
        <select
          style={inputStyle}
          value={hadithForm.book_id}
          onChange={(event) => setHadithForm({ ...hadithForm, book_id: event.target.value })}
          required
        >
          <option value="">{tr.chooseBook}</option>
          {books.filter((book) => book.is_active !== false).map((book) => (
            <option value={book.id} key={book.id}>{book.name}</option>
          ))}
        </select>
      </label>

      <label style={fieldStyle}>
        {tr.number}
        <input
          style={inputStyle}
          type="number"
          min="1"
          value={hadithForm.hadith_number}
          onChange={(event) => setHadithForm({ ...hadithForm, hadith_number: event.target.value })}
          required
        />
      </label>

      <label style={fieldStyle}>
        {tr.arabic}
        <textarea
          style={{ ...inputStyle, minHeight: 110, direction: 'rtl', fontFamily: 'Noto Naskh Arabic', fontSize: 19 }}
          value={hadithForm.arabic_text}
          onChange={(event) => setHadithForm({ ...hadithForm, arabic_text: event.target.value })}
        />
      </label>

      <label style={fieldStyle}>
        {tr.tajik}
        <textarea
          style={{ ...inputStyle, minHeight: 130 }}
          value={hadithForm.tajik_text}
          onChange={(event) => setHadithForm({ ...hadithForm, tajik_text: event.target.value })}
          required
        />
      </label>

      <label style={fieldStyle}>
        {tr.source}
        <input
          style={inputStyle}
          value={hadithForm.source_note}
          onChange={(event) => setHadithForm({ ...hadithForm, source_note: event.target.value })}
        />
      </label>

      <label style={fieldStyle}>
        {tr.commentary}
        <textarea
          style={{ ...inputStyle, minHeight: 90 }}
          value={hadithForm.commentary}
          onChange={(event) => setHadithForm({ ...hadithForm, commentary: event.target.value })}
        />
      </label>

      <label style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: 9 }}>
        <input
          type="checkbox"
          checked={hadithForm.is_published}
          onChange={(event) => setHadithForm({ ...hadithForm, is_published: event.target.checked })}
        />
        {tr.published}
      </label>

      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
        <button style={primaryButton} disabled={loading}>{tr.save}</button>
        <button
          type="button"
          style={secondaryButton}
          onClick={() => {
            setHadithForm(emptyHadith)
            setEditingHadith(null)
          }}
        >
          {tr.cancel}
        </button>
      </div>
    </form>
  )

  const renderContentForm = () => (
    <form onSubmit={saveContent} className="section-intro" style={{ textAlign: 'left' }}>
      <h3>{editingContent ? tr.edit : tr.addContent}</h3>

      <label style={fieldStyle}>
        {tr.selectSection}
        <select
          style={inputStyle}
          value={contentForm.section_slug}
          onChange={(event) => setContentForm({ ...contentForm, section_slug: event.target.value })}
        >
          {SECTIONS.filter((section) => section.slug !== 'hadith' && section.slug !== 'quran').map((section) => (
            <option value={section.slug} key={section.slug}>{sectionName(section)}</option>
          ))}
        </select>
      </label>

      <label style={fieldStyle}>
        {tr.titleField}
        <input
          style={inputStyle}
          value={contentForm.title}
          onChange={(event) => setContentForm({ ...contentForm, title: event.target.value })}
          required
        />
      </label>

      {contentForm.section_slug === 'questions' && (
        <>
          <label style={fieldStyle}>
            Савол
            <textarea
              style={{ ...inputStyle, minHeight: 90 }}
              value={contentForm.question_text}
              onChange={(event) => setContentForm({ ...contentForm, question_text: event.target.value })}
            />
          </label>
          <label style={fieldStyle}>
            Ҷавоб
            <textarea
              style={{ ...inputStyle, minHeight: 120 }}
              value={contentForm.answer_text}
              onChange={(event) => setContentForm({ ...contentForm, answer_text: event.target.value })}
            />
          </label>
        </>
      )}

      <label style={fieldStyle}>
        {tr.arabic}
        <textarea
          style={{ ...inputStyle, minHeight: 100, direction: 'rtl', fontFamily: 'Noto Naskh Arabic', fontSize: 19 }}
          value={contentForm.arabic_text}
          onChange={(event) => setContentForm({ ...contentForm, arabic_text: event.target.value })}
        />
      </label>

      <label style={fieldStyle}>
        {tr.tajik}
        <textarea
          style={{ ...inputStyle, minHeight: 120 }}
          value={contentForm.tajik_text}
          onChange={(event) => setContentForm({ ...contentForm, tajik_text: event.target.value })}
        />
      </label>

      <label style={fieldStyle}>
        {tr.russian}
        <textarea
          style={{ ...inputStyle, minHeight: 100 }}
          value={contentForm.russian_text}
          onChange={(event) => setContentForm({ ...contentForm, russian_text: event.target.value })}
        />
      </label>

      <label style={fieldStyle}>
        {tr.content}
        <textarea
          style={{ ...inputStyle, minHeight: 130 }}
          value={contentForm.content_text}
          onChange={(event) => setContentForm({ ...contentForm, content_text: event.target.value })}
        />
      </label>

      <label style={fieldStyle}>
        {tr.source}
        <input
          style={inputStyle}
          value={contentForm.source_note}
          onChange={(event) => setContentForm({ ...contentForm, source_note: event.target.value })}
        />
      </label>

      <label style={fieldStyle}>
        {tr.commentary}
        <textarea
          style={{ ...inputStyle, minHeight: 90 }}
          value={contentForm.commentary}
          onChange={(event) => setContentForm({ ...contentForm, commentary: event.target.value })}
        />
      </label>

      <label style={fieldStyle}>
        Суроғаи аудио ё видео (ихтиёрӣ)
        <input
          style={inputStyle}
          value={contentForm.media_url}
          onChange={(event) => setContentForm({ ...contentForm, media_url: event.target.value })}
        />
      </label>

      <label style={fieldStyle}>
        Тартиб
        <input
          style={inputStyle}
          type="number"
          value={contentForm.sort_order}
          onChange={(event) => setContentForm({ ...contentForm, sort_order: event.target.value })}
        />
      </label>

      <label style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: 9 }}>
        <input
          type="checkbox"
          checked={contentForm.is_published}
          onChange={(event) => setContentForm({ ...contentForm, is_published: event.target.checked })}
        />
        {tr.published}
      </label>

      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
        <button style={primaryButton} disabled={loading}>{tr.save}</button>
        <button
          type="button"
          style={secondaryButton}
          onClick={() => {
            setContentForm(emptyContent)
            setEditingContent(null)
          }}
        >
          {tr.cancel}
        </button>
      </div>
    </form>
  )

  const renderAdmin = () => (
    <main className="content-page">
      <div className="section-heading">
        <div>
          <h2>{tr.admin}</h2>
          <p>Miftahulhadis</p>
        </div>
        <button style={secondaryButton} onClick={closeAdmin}>{tr.close}</button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        <button
          style={adminTab === 'content' ? primaryButton : secondaryButton}
          onClick={() => {
            setAdminTab('content')
            setMessage('')
          }}
        >
          {tr.adminContent}
        </button>
        <button
          style={adminTab === 'hadith' ? primaryButton : secondaryButton}
          onClick={() => {
            setAdminTab('hadith')
            setMessage('')
          }}
        >
          {tr.adminHadith}
        </button>
      </div>

      {message && (
        <p style={{
          padding: 12,
          background: '#edf7ef',
          borderRadius: 10,
          color: '#075b35',
          overflowWrap: 'anywhere'
        }}>
          {message}
        </p>
      )}

      {adminTab === 'content' && (
        <>
          {!editingContent && (
            <button
              style={{ ...primaryButton, marginBottom: 15 }}
              onClick={() => {
                setContentForm(emptyContent)
                setEditingContent(null)
              }}
            >
              + {tr.addContent}
            </button>
          )}

          {renderContentForm()}

          <h3>{tr.items}</h3>
          {contentRows.map((item) => (
            <article key={item.id} className="section-intro" style={{ textAlign: 'left', marginBottom: 10 }}>
              <strong>{item.title}</strong>
              <p>{SECTIONS.find((s) => s.slug === item.section_slug)?.[lang] || item.section_slug}</p>
              <small>{item.is_published ? tr.published : tr.draft}</small>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
                <button style={secondaryButton} onClick={() => editContent(item)}>{tr.edit}</button>
                <button style={secondaryButton} onClick={() => togglePublished('content_items', item)}>
                  {item.is_published ? tr.hide : tr.show}
                </button>
                <button style={{ ...secondaryButton, color: '#b42318' }} onClick={() => deleteItem('content_items', item.id)}>
                  {tr.delete}
                </button>
              </div>
            </article>
          ))}
        </>
      )}

      {adminTab === 'hadith' && (
        <>
          {renderHadithForm()}
          <h3>{tr.items}</h3>
          {hadithRows.map((item) => (
            <article key={item.id} className="section-intro" style={{ textAlign: 'left', marginBottom: 10 }}>
              <strong>{bookName(item.book_id)} — № {item.hadith_number}</strong>
              <p>{String(item.tajik_text || '').slice(0, 180)}</p>
              <small>{item.is_published ? tr.published : tr.draft}</small>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
                <button style={secondaryButton} onClick={() => editHadith(item)}>{tr.edit}</button>
                <button style={secondaryButton} onClick={() => togglePublished('hadith', item)}>
                  {item.is_published ? tr.hide : tr.show}
                </button>
                <button style={{ ...secondaryButton, color: '#b42318' }} onClick={() => deleteItem('hadith', item.id)}>
                  {tr.delete}
                </button>
              </div>
            </article>
          ))}
        </>
      )}

      <button style={{ ...secondaryButton, marginTop: 18 }} onClick={logout}>
        {tr.logout}
      </button>
    </main>
  )

  const renderHadithSection = async () => {}

  const renderSection = () => (
    <main className="content-page">
      <button className="back-button" onClick={() => {
        setPage('home')
        setSelectedSection(null)
      }}>
        <span>‹</span> {tr.back}
      </button>

      <div className="section-intro">
        <div className="section-icon">{selectedSection?.icon}</div>
        <h2>{sectionName(selectedSection)}</h2>
      </div>

      <div style={{ marginTop: 18 }}>
        {selectedSection?.slug === 'hadith' ? (
          <HadithPublic db={db} lang={lang} books={books} />
        ) : selectedSection?.slug === 'quran' ? (
          <div className="empty-result">
            <span>📖</span>
            <p>Қисми Қуръони Карим ҳоло ба пойгоҳи маълумот пайваст карда нашудааст.</p>
          </div>
        ) : selectedContent.length === 0 ? (
          <div className="empty-result">
            <span>📚</span>
            <p>{tr.empty}</p>
          </div>
        ) : (
          <div className="menu">
            {selectedContent.map((item) => (
              <article className="section-intro" key={item.id} style={{ textAlign: 'left' }}>
                <h3>{item.title}</h3>
                {item.arabic_text && (
                  <p dir="rtl" style={{ fontFamily: 'Noto Naskh Arabic', fontSize: 21, lineHeight: 2 }}>
                    {item.arabic_text}
                  </p>
                )}
                {(lang === 'ru' && item.russian_text) ? (
                  <p>{item.russian_text}</p>
                ) : (
                  <p>{item.tajik_text || item.content_text || item.answer_text}</p>
                )}
                {item.source_note && <small>{item.source_note}</small>}
                {item.commentary && <p>{item.commentary}</p>}
                {item.media_url && (
                  <p><a href={item.media_url} target="_blank" rel="noreferrer">▶ Кушодани мавод</a></p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )

  return (
    <div className={`app theme-${theme}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {!login && page !== 'admin' && (
        <>
          <header className="header">
            <div className="header-top">
              <div className="brand-icon">م</div>
              <div>
                <h1>{tr.title}</h1>
                <p className="arabic-title">مفتاح الحديث</p>
              </div>
            </div>

            <div className="header-welcome">
              <span className="welcome-label">MIFTAHULHADIS</span>
              <h2>{tr.welcome}</h2>
              <p>{tr.description}</p>
            </div>
          </header>

          <div className="language-selector">
            <span>{tr.language}:</span>
            <select className="language-select" value={lang} onChange={(event) => setLang(event.target.value)}>
              <option value="tg">Тоҷикӣ</option>
              <option value="ru">Русский</option>
              <option value="ar">العربية</option>
            </select>
            <button className="theme-toggle" onClick={() => setTheme(theme === 'white' ? 'green' : 'white')}>
              ◐
            </button>
          </div>
        </>
      )}

      {login && renderLogin()}
      {page === 'admin' && admin && renderAdmin()}
      {page === 'section' && renderSection()}
      {page === 'search' && renderSearchResults()}

      {page === 'home' && !login && (
        <>
          <main className="main-content">
            <div className="search-box">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => runSearch(event.target.value)}
                placeholder={tr.search}
              />
              {search && (
                <button className="clear-search" onClick={() => {
                  setSearch('')
                  setSearchResults([])
                }}>×</button>
              )}
            </div>

            {search.trim() ? (
              <div>
                <div className="section-heading">
                  <h2>{tr.searchResults}</h2>
                  <span className="section-count">{searchResults.length}</span>
                </div>
                {searching && <p>...</p>}
                {!searching && searchResults.length === 0 && (
                  <div className="empty-result"><p>{tr.noResults}</p></div>
                )}
                <div className="menu">
                  {searchResults.map((item) => (
                    <article className="section-intro" key={`${item.resultType}-${item.id}`}>
                      <strong>
                        {item.resultType === 'hadith'
                          ? `${tr.hadith} № ${item.hadith_number}`
                          : item.title}
                      </strong>
                      {item.arabic_text && (
                        <p dir="rtl" style={{ fontFamily: 'Noto Naskh Arabic', fontSize: 20 }}>
                          {highlight(item.arabic_text)}
                        </p>
                      )}
                      <p>{highlight(item.tajik_text || item.content_text || item.question_text || '')}</p>
                      {item.source_note && <small>{highlight(item.source_note)}</small>}
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="section-heading">
                  <h2>{tr.sections}</h2>
                  <span className="section-count">11</span>
                </div>

                <div className="menu">
                  {SECTIONS.map((section, index) => (
                    <button className="menu-card" key={section.slug} onClick={() => openSection(section)}>
                      <span className="card-number">{String(index + 1).padStart(2, '0')}</span>
                      <span className="card-icon">{section.icon}</span>
                      <span className="card-text">
                        <strong>{sectionName(section)}</strong>
                        <small>{section.ar}</small>
                      </span>
                      <span className="card-arrow">›</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </main>

          <footer className="footer">
            <div className="footer-brand">Miftahulhadis</div>
            <p>{tr.description}</p>
            <small>© Miftahulhadis</small>
          </footer>
        </>
      )}
    </div>
  )
}

function HadithPublic({ db, lang, books }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!db) {
        setLoading(false)
        return
      }

      const { data, error } = await db
        .from('hadith')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(500)

      if (active) {
        setRows(error ? [] : data || [])
        setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [db])

  if (loading) return <p>...</p>

  if (!rows.length) {
    return <div className="empty-result"><p>Дар ин бахш ҳоло ҳадис нест.</p></div>
  }

  return (
    <div className="menu">
      {rows.map((item) => {
        const book = books.find((b) => b.id === item.book_id)

        return (
          <article className="section-intro" key={item.id} style={{ textAlign: 'left' }}>
            <h3>{book?.name || ''} — № {item.hadith_number}</h3>
            {item.arabic_text && (
              <p
                dir="rtl"
                style={{
                  fontFamily: 'Noto Naskh Arabic',
                  fontSize: 22,
                  lineHeight: 2,
                  textAlign: 'right'
                }}
              >
                {item.arabic_text}
              </p>
            )}
            <p>{lang === 'ru' ? item.tajik_text : item.tajik_text}</p>
            {item.source_note && (
              <small style={{ display: 'block', marginTop: 10 }}>
                📚 {item.source_note}
              </small>
            )}
            {item.commentary && <p>{item.commentary}</p>}
          </article>
        )
      })}
    </div>
  )
}

export default App
