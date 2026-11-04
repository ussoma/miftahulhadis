
import React, { useCallback, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import './index.css'

const SUPABASE_URL = String(import.meta.env.VITE_SUPABASE_URL || '').trim()
const SUPABASE_KEY = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

const db = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
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
  { slug: 'salihin', icon: '📜', tg: 'Суханони Солеҳин', ru: 'Слова праведных', ar: 'أقوال السلف الصالح' },
  { slug: 'duas', icon: '🤲', tg: 'Дуоҳо', ru: 'Дуа', ar: 'الأدعية' },
  { slug: 'adhkar', icon: '📿', tg: 'Азкор', ru: 'Азкары', ar: 'الأذكار' },
  { slug: 'prophets', icon: '🌙', tg: 'Қиссаи Паёмбарон عليهم السلام', ru: 'Истории пророков', ar: 'قصص الأنبياء' },
  { slug: 'seerah', icon: '🕌', tg: 'Сирати Расулуллоҳ ﷺ', ru: 'Жизнеописание Посланника Аллаха ﷺ', ar: 'سيرة رسول الله ﷺ' },
  { slug: 'companions', icon: '🤝', tg: 'Сирати саҳоба رضي الله عنهم', ru: 'Жизнеописание сподвижников', ar: 'سيرة الصحابة' },
  { slug: 'lessons', icon: '🎓', tg: 'Дарсҳои Исломӣ', ru: 'Исламские уроки', ar: 'الدروس الإسلامية' },
  { slug: 'questions', icon: '❔', tg: 'Саволҳои Исломӣ', ru: 'Исламские вопросы', ar: 'الأسئلة الإسلامية' }
]

const TEXT = {
  tg: {
    welcome: 'Китобхонаи донишҳои исломӣ',
    description: 'Сарчашмаҳои исломӣ барои омӯзиши дониш ва татбиқи он дар зиндагӣ.',
    sections: 'Бахшҳои исломӣ',
    search: 'Ҷустуҷӯ дар тамоми бахшҳо...',
    searchButton: 'Ҷустуҷӯ',
    back: 'Бозгашт',
    empty: 'Дар ин бахш ҳоло мавод нест.',
    noResults: 'Натиҷае ёфт нашуд.',
    admin: 'Панели админ',
    login: 'Воридшавии админ',
    email: 'Почтаи электронӣ',
    password: 'Парол',
    enter: 'Ворид шудан',
    logout: 'Баромадан',
    close: 'Бозгашт ба барнома',
    book: 'Китоб',
    number: 'Рақами ҳадис',
    text: 'Матни тоҷикӣ',
    title: 'Сарлавҳа',
    content: 'Матн',
    section: 'Бахш',
    add: 'Илова кардан',
    edit: 'Таҳрир',
    delete: 'Нест кардан',
    save: 'Сабт кардан',
    cancel: 'Бекор кардан',
    chooseBook: 'Китобро интихоб кунед',
    chooseSection: 'Бахшро интихоб кунед',
    items: 'Мавод',
    confirmDelete: 'Ин маводро нест мекунед?',
    loginError: 'Маълумоти воридшавӣ нодуруст аст ё ҳуқуқи админ надоред.',
    loadError: 'Ҳангоми гирифтани маълумот хато рӯй дод.',
    saveError: 'Сабт нашуд.',
    saved: 'Маълумот сабт шуд.',
    searchResults: 'Натиҷаҳои ҷустуҷӯ',
    language: 'Забон',
    contentTab: 'Маводи бахшҳо',
    hadithTab: 'Идораи ҳадисҳо',
    addHadith: 'Иловаи ҳадис',
    addContent: 'Иловаи мавод',
    publish: 'Нашр кардан',
    hide: 'Пинҳон кардан',
    published: 'Нашршуда',
    unpublished: 'Нашрнашуда',
    configError: 'Пайвасти Supabase танзим нашудааст.',
    light: 'Ранги сафед',
    dark: 'Сабзи торик',
    sound: 'Садо',
    loading: 'Бор шуда истодааст...',
    noHadith: 'Ҳоло ҳадиси нашршуда нест.',
    hadithRequired: 'Китоб, рақам ва матни ҳадисро пур кунед.',
    invalidNumber: 'Рақами ҳадис бояд адади мусбат бошад.',
    daily: 'Ҳадиси рӯз',
    source: 'Манбаъ',
    next: 'Баъдӣ',
    previous: 'Қаблӣ'
  },
  ru: {
    welcome: 'Библиотека исламских знаний',
    description: 'Исламские источники для изучения знаний и применения их в жизни.',
    sections: 'Исламские разделы',
    search: 'Поиск по всем разделам...',
    searchButton: 'Искать',
    back: 'Назад',
    empty: 'В этом разделе пока нет материалов.',
    noResults: 'Ничего не найдено.',
    admin: 'Панель администратора',
    login: 'Вход администратора',
    email: 'Электронная почта',
    password: 'Пароль',
    enter: 'Войти',
    logout: 'Выйти',
    close: 'Вернуться в приложение',
    book: 'Книга',
    number: 'Номер хадиса',
    text: 'Текст',
    title: 'Заголовок',
    content: 'Содержание',
    section: 'Раздел',
    add: 'Добавить',
    edit: 'Изменить',
    delete: 'Удалить',
    save: 'Сохранить',
    cancel: 'Отмена',
    chooseBook: 'Выберите книгу',
    chooseSection: 'Выберите раздел',
    items: 'Материалы',
    confirmDelete: 'Удалить этот материал?',
    loginError: 'Неверные данные или нет прав администратора.',
    loadError: 'Ошибка загрузки данных.',
    saveError: 'Не удалось сохранить.',
    saved: 'Данные сохранены.',
    searchResults: 'Результаты поиска',
    language: 'Язык',
    contentTab: 'Материалы разделов',
    hadithTab: 'Управление хадисами',
    addHadith: 'Добавить хадис',
    addContent: 'Добавить материал',
    publish: 'Опубликовать',
    hide: 'Скрыть',
    published: 'Опубликован',
    unpublished: 'Не опубликован',
    configError: 'Подключение Supabase не настроено.',
    light: 'Светлая тема',
    dark: 'Тёмно-зелёная тема',
    sound: 'Звук',
    loading: 'Загрузка...',
    noHadith: 'Опубликованных хадисов пока нет.',
    hadithRequired: 'Заполните книгу, номер и текст хадиса.',
    invalidNumber: 'Номер хадиса должен быть положительным числом.',
    daily: 'Хадис дня',
    source: 'Источник',
    next: 'Следующая',
    previous: 'Предыдущая'
  },
  ar: {
    welcome: 'مكتبة العلوم الإسلامية',
    description: 'مصادر إسلامية لطلب العلم والعمل به.',
    sections: 'الأقسام الإسلامية',
    search: 'البحث في جميع الأقسام...',
    searchButton: 'بحث',
    back: 'رجوع',
    empty: 'لا توجد مواد في هذا القسم حالياً.',
    noResults: 'لم يتم العثور على نتائج.',
    admin: 'لوحة الإدارة',
    login: 'دخول المسؤول',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    enter: 'دخول',
    logout: 'تسجيل الخروج',
    close: 'العودة إلى التطبيق',
    book: 'الكتاب',
    number: 'رقم الحديث',
    text: 'النص',
    title: 'العنوان',
    content: 'المحتوى',
    section: 'القسم',
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    chooseBook: 'اختر الكتاب',
    chooseSection: 'اختر القسم',
    items: 'المواد',
    confirmDelete: 'هل تريد حذف هذه المادة؟',
    loginError: 'بيانات الدخول غير صحيحة أو لا توجد صلاحية إدارة.',
    loadError: 'حدث خطأ أثناء تحميل البيانات.',
    saveError: 'تعذر الحفظ.',
    saved: 'تم حفظ البيانات.',
    searchResults: 'نتائج البحث',
    language: 'اللغة',
    contentTab: 'مواد الأقسام',
    hadithTab: 'إدارة الأحاديث',
    addHadith: 'إضافة حديث',
    addContent: 'إضافة مادة',
    publish: 'نشر',
    hide: 'إخفاء',
    published: 'منشور',
    unpublished: 'غير منشور',
    configError: 'لم يتم إعداد اتصال Supabase.',
    light: 'فاتح',
    dark: 'أخضر داكن',
    sound: 'الصوت',
    loading: 'جارٍ التحميل...',
    noHadith: 'لا توجد أحاديث منشورة حالياً.',
    hadithRequired: 'أدخل الكتاب ورقم الحديث والنص.',
    invalidNumber: 'يجب أن يكون رقم الحديث موجباً.',
    daily: 'حديث اليوم',
    source: 'المصدر',
    next: 'التالي',
    previous: 'السابق'
  }
}

const emptyHadith = { book_id: '', hadith_number: '', tajik_text: '' }
const emptyContent = { section_slug: 'salihin', title: '', content_text: '' }

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('miftah_lang') || 'tg')
  const [theme, setTheme] = useState('green')
  const [sound, setSound] = useState(true)

  const [page, setPage] = useState('home')
  const [selectedSection, setSelectedSection] = useState(null)

  const [books, setBooks] = useState([])
  const [hadithRows, setHadithRows] = useState([])
  const [contentRows, setContentRows] = useState([])
  const [dailyHadith, setDailyHadith] = useState(null)

  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const [admin, setAdmin] = useState(false)
  const [adminAccess, setAdminAccess] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [adminTab, setAdminTab] = useState('hadith')
  const [editingHadith, setEditingHadith] = useState(null)
  const [editingContent, setEditingContent] = useState(null)
  const [hadithForm, setHadithForm] = useState(emptyHadith)
  const [contentForm, setContentForm] = useState(emptyContent)

  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [noticeType, setNoticeType] = useState('info')

  const t = TEXT[lang] || TEXT.tg
  const rtl = lang === 'ar'

  const notify = (text, type = 'info') => {
    setNotice(text)
    setNoticeType(type)
  }

  useEffect(() => {
    localStorage.setItem('miftah_lang', lang)
  }, [lang])

  const loadPublicData = useCallback(async () => {
    if (!db) return

    const [b, h, c] = await Promise.all([
      db.from('books').select('*').order('sort_order', { ascending: true }),
      db.from('hadith').select('*').eq('is_published', true)
        .order('created_at', { ascending: false }).range(0, 99),
      db.from('content_items').select('*').eq('is_published', true)
        .order('sort_order', { ascending: true }).range(0, 199)
    ])

    if (b.data) setBooks(b.data)
    if (h.data) setHadithRows(h.data)
    if (c.data) setContentRows(c.data)

    const errors = [b.error, h.error, c.error].filter(Boolean)
    if (errors.length) notify(`${t.loadError} ${errors[0].message}`, 'error')

    // Ҳадиси рӯз танҳо аз ҷадвали hadith гирифта мешавад.
    const { count } = await db.from('hadith')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true)

    if (count > 0) {
      const date = new Date()
      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      const index = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0) % count

      const { data: daily } = await db.from('hadith')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true })
        .range(index, index)

      setDailyHadith(daily?.[0] || null)
    } else {
      setDailyHadith(null)
    }
  }, [t.loadError])

  const loadAdminData = useCallback(async () => {
    if (!db) return
    setLoading(true)

    const [b, h, c] = await Promise.all([
      db.from('books').select('*').order('sort_order', { ascending: true }),
      db.from('hadith').select('*').order('created_at', { ascending: false }).range(0, 499),
      db.from('content_items').select('*').order('sort_order', { ascending: true }).range(0, 499)
    ])

    if (b.data) setBooks(b.data)
    if (h.data) setHadithRows(h.data)
    if (c.data) setContentRows(c.data)

    const errors = [b.error, h.error, c.error].filter(Boolean)
    if (errors.length) notify(`${t.loadError} ${errors[0].message}`, 'error')

    setLoading(false)
  }, [t.loadError])

  const checkAdmin = useCallback(async () => {
    if (!db) return false

    const { data: session } = await db.auth.getSession()
    if (!session?.session?.user) {
      setAdmin(false)
      setAdminAccess(false)
      return false
    }

    const { data: profile } = await db.from('profiles')
      .select('role')
      .eq('id', session.session.user.id)
      .maybeSingle()

    const allowed = profile?.role === 'admin'
    setAdminAccess(allowed)
    setAdmin(allowed)
    return allowed
  }, [])

  useEffect(() => {
    loadPublicData()
  }, [loadPublicData])

  useEffect(() => {
    if (!db) return

    checkAdmin()

    const { data: listener } = db.auth.onAuthStateChange(() => {
      Promise.resolve().then(checkAdmin)
    })

    return () => listener.subscription.unsubscribe()
  }, [checkAdmin])

  useEffect(() => {
    if (admin && page === 'admin') loadAdminData()
  }, [admin, page, loadAdminData])

  const openAdmin = async () => {
    const allowed = await checkAdmin()
    if (allowed) {
      setPage('admin')
      setLoginOpen(false)
    } else {
      setLoginOpen(true)
    }
  }

  const loginAdmin = async event => {
    event.preventDefault()
    if (!db) return notify(t.configError, 'error')

    setLoading(true)
    const { data, error } = await db.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    if (error || !data?.user) {
      notify(t.loginError, 'error')
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await db.from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileError || profile?.role !== 'admin') {
      await db.auth.signOut()
      notify(t.loginError, 'error')
      setLoading(false)
      return
    }

    setAdmin(true)
    setAdminAccess(true)
    setLoginOpen(false)
    setPage('admin')
    setPassword('')
    notify('')
    setLoading(false)
  }

  const logout = async () => {
    if (db) await db.auth.signOut()
    setAdmin(false)
    setAdminAccess(false)
    setPage('home')
    setLoginOpen(false)
  }

  const openSection = section => {
    setSelectedSection(section)
    setPage('section')
    setSearch('')
    setSearchResults([])
  }

  const searchAll = async event => {
    event?.preventDefault()
    if (!db || !search.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    const term = search.trim().replace(/[%_,]/g, ' ')

    const [h, c] = await Promise.all([
      db.from('hadith').select('*').eq('is_published', true)
        .or(`tajik_text.ilike.%${term}%,arabic_text.ilike.%${term}%,source_note.ilike.%${term}%`)
        .range(0, 99),
      db.from('content_items').select('*').eq('is_published', true)
        .or(`title.ilike.%${term}%,content_text.ilike.%${term}%,tajik_text.ilike.%${term}%,arabic_text.ilike.%${term}%`)
        .range(0, 99)
    ])

    setSearchResults([
      ...(h.data || []).map(item => ({ ...item, resultType: 'hadith' })),
      ...(c.data || []).map(item => ({ ...item, resultType: 'content' }))
    ])

    if (h.error || c.error) notify(t.loadError, 'error')
    setSearching(false)
  }

  const saveHadith = async event => {
    event.preventDefault()

    const number = Number(hadithForm.hadith_number)
    if (!hadithForm.book_id || !hadithForm.tajik_text.trim() ||
        !Number.isInteger(number) || number < 1) {
      notify(t.hadithRequired, 'error')
      return
    }

    setLoading(true)

    const values = {
      book_id: hadithForm.book_id,
      hadith_number: number,
      tajik_text: hadithForm.tajik_text.trim(),
      updated_at: new Date().toISOString()
    }

    const result = editingHadith
      ? await db.from('hadith').update(values).eq('id', editingHadith)
      : await db.from('hadith').insert({ ...values, is_published: true })

    if (result.error) {
      notify(`${t.saveError} ${result.error.message}`, 'error')
    } else {
      notify(t.saved, 'success')
      setHadithForm(emptyHadith)
      setEditingHadith(null)
      await loadAdminData()
      await loadPublicData()
    }

    setLoading(false)
  }

  const saveContent = async event => {
    event.preventDefault()

    if (!contentForm.title.trim() || !contentForm.content_text.trim()) {
      notify(t.content, 'error')
      return
    }

    setLoading(true)

    const values = {
      section_slug: contentForm.section_slug,
      title: contentForm.title.trim(),
      content_text: contentForm.content_text.trim(),
      tajik_text: contentForm.content_text.trim(),
      updated_at: new Date().toISOString()
    }

    const result = editingContent
      ? await db.from('content_items').update(values).eq('id', editingContent)
      : await db.from('content_items').insert({ ...values, is_published: true })

    if (result.error) {
      notify(`${t.saveError} ${result.error.message}`, 'error')
    } else {
      notify(t.saved, 'success')
      setContentForm(emptyContent)
      setEditingContent(null)
      await loadAdminData()
      await loadPublicData()
    }

    setLoading(false)
  }

  const togglePublished = async (table, item) => {
    const { error } = await db.from(table).update({
      is_published: !item.is_published
    }).eq('id', item.id)

    if (error) notify(`${t.saveError} ${error.message}`, 'error')
    else {
      notify(t.saved, 'success')
      await loadAdminData()
      await loadPublicData()
    }
  }

  const removeItem = async (table, id) => {
    if (!window.confirm(t.confirmDelete)) return
    const { error } = await db.from(table).delete().eq('id', id)

    if (error) notify(`${t.saveError} ${error.message}`, 'error')
    else {
      notify(t.saved, 'success')
      await loadAdminData()
      await loadPublicData()
    }
  }

  const bookName = id => books.find(book => String(book.id) === String(id))?.name || ''

  const currentContent = contentRows.filter(
    item => item.section_slug === selectedSection?.slug
  )

  const openHadithEditor = item => {
    setHadithForm({
      book_id: item.book_id || '',
      hadith_number: item.hadith_number || '',
      tajik_text: item.tajik_text || ''
    })
    setEditingHadith(item.id)
    setAdminTab('hadith')
  }

  const openContentEditor = item => {
    setContentForm({
      section_slug: item.section_slug || 'salihin',
      title: item.title || '',
      content_text: item.content_text || item.tajik_text || ''
    })
    setEditingContent(item.id)
    setAdminTab('content')
  }

  return (
    <div className={`app theme-${theme}`} dir={rtl ? 'rtl' : 'ltr'}>
      {!loginOpen && page !== 'admin' && (
        <>
          <header className="site-header">
            <div className="brand">Miftahulhadis</div>
            <div className="header-arabic" dir="rtl">بَلِّغُوا عَنِّي وَلَوْ آيَةً</div>
            <p className="header-translation">Аз ман бирасонед, ҳарчанд як оят бошад.</p>
            <p className="header-subtitle">{t.welcome}</p>
            <small>📚 Саҳеҳ ал-Бухорӣ · ҳадиси № 3461</small>
          </header>

          <nav className="toolbar">
            <label>
              {t.language}
              <select value={lang} onChange={e => setLang(e.target.value)}>
                <option value="tg">Тоҷикӣ</option>
                <option value="ru">Русский</option>
                <option value="ar">العربية</option>
              </select>
            </label>

            <button className="small-button" onClick={() => setSound(!sound)}>
              {sound ? '🔊' : '🔇'}
            </button>

            <button className="small-button" onClick={() => setTheme(theme === 'green' ? 'white' : 'green')}>
              {theme === 'green' ? '☀️' : '🌿'}
            </button>

            {adminAccess && (
              <button className="small-button" onClick={() => setPage('admin')}>
                🔐 {t.admin}
              </button>
            )}
          </nav>
        </>
      )}

      {loginOpen && (
        <main className="page-wrap">
          <button className="secondary-button" onClick={() => setLoginOpen(false)}>
            ← {t.back}
          </button>

          <form className="panel form-panel" onSubmit={loginAdmin}>
            <h2>{t.login}</h2>
            <label>{t.email}
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </label>
            <label>{t.password}
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </label>
            {notice && <p className={`notice ${noticeType}`}>{notice}</p>}
            <button className="primary-button" disabled={loading}>{t.enter}</button>
          </form>
        </main>
      )}

      {page === 'home' && !loginOpen && (
        <main className="page-wrap">
          {!db && <p className="notice error">{t.configError}</p>}

          {dailyHadith && (
            <article className="daily-card">
              <h2>🌙 {t.daily}</h2>
              <h3>{bookName(dailyHadith.book_id)} — № {dailyHadith.hadith_number}</h3>
              {dailyHadith.arabic_text && <p className="arabic-text" dir="rtl">{dailyHadith.arabic_text}</p>}
              <p>{lang === 'ru' ? dailyHadith.russian_text || dailyHadith.tajik_text : dailyHadith.tajik_text}</p>
              {dailyHadith.source_note && <small>📚 {dailyHadith.source_note}</small>}
            </article>
          )}

          <form className="search-form" onSubmit={searchAll}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search} />
            <button className="primary-button">{t.searchButton}</button>
          </form>

          {search.trim() ? (
            <>
              <h2 className="section-heading">{t.searchResults}</h2>
              {searching && <p>{t.loading}</p>}
              {!searching && searchResults.length === 0 && <p className="empty">{t.noResults}</p>}
              <div className="content-list">
                {searchResults.map(item => (
                  <article className="content-card" key={`${item.resultType}-${item.id}`}>
                    <h3>{item.resultType === 'hadith' ? `${t.hadithTab} № ${item.hadith_number}` : item.title}</h3>
                    {item.resultType === 'hadith' && <small>{bookName(item.book_id)}</small>}
                    {item.arabic_text && <p className="arabic-text" dir="rtl">{item.arabic_text}</p>}
                    <p>{lang === 'ru' && item.russian_text ? item.russian_text : item.tajik_text || item.content_text}</p>
                    {item.source_note && <small>📚 {item.source_note}</small>}
                  </article>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="section-heading">{t.sections}</h2>

              <div className="section-grid">
                {SECTIONS.map(section => (
                  <button
                    key={section.slug}
                    className={`section-tile ${section.slug === 'hadith' ? 'hadith-tile' : ''}`}
                    onClick={() => openSection(section)}
                  >
                    <span className="tile-icon">{section.icon}</span>
                    <span className="tile-name">{section[lang] || section.tg}</span>
                    <span className="tile-arabic">{section.ar}</span>
                    <span className="tile-arrow">›</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </main>
      )}

      {page === 'section' && !loginOpen && (
        <main className="page-wrap">
          <button className="secondary-button" onClick={() => setPage('home')}>
            ← {t.back}
          </button>

          <section className="section-banner">
            <span>{selectedSection?.icon}</span>
            <h2>{selectedSection?.[lang] || selectedSection?.tg}</h2>
          </section>

          {selectedSection?.slug === 'hadith' ? (
            <HadithList
              db={db}
              books={books}
              language={lang}
              initialRows={hadithRows}
              t={t}
            />
          ) : currentContent.length === 0 ? (
            <p className="empty">{t.empty}</p>
          ) : (
            <div className="content-list">
              {currentContent.map(item => (
                <article className="content-card" key={item.id}>
                  <h3>{item.title}</h3>
                  {item.arabic_text && <p className="arabic-text" dir="rtl">{item.arabic_text}</p>}
                  <p>{lang === 'ru' && item.russian_text ? item.russian_text : item.tajik_text || item.content_text}</p>
                  {item.source_note && <small>📚 {item.source_note}</small>}
                  {item.media_url && <p><a href={item.media_url} target="_blank" rel="noreferrer">▶ Кушодани мавод</a></p>}
                </article>
              ))}
            </div>
          )}
        </main>
      )}

      {page === 'admin' && admin && (
        <main className="page-wrap admin-page">
          <div className="admin-heading">
            <h2>🔐 {t.admin}</h2>
            <button className="secondary-button" onClick={() => setPage('home')}>{t.close}</button>
          </div>

          <div className="admin-tabs">
            <button className={adminTab === 'hadith' ? 'selected' : ''} onClick={() => setAdminTab('hadith')}>
              {t.hadithTab}
            </button>
            <button className={adminTab === 'content' ? 'selected' : ''} onClick={() => setAdminTab('content')}>
              {t.contentTab}
            </button>
          </div>

          {notice && <p className={`notice ${noticeType}`}>{notice}</p>}
          {loading && <p>{t.loading}</p>}

          {adminTab === 'hadith' && (
            <>
              <form className="panel form-panel" onSubmit={saveHadith}>
                <h3>{editingHadith ? t.edit : t.addHadith}</h3>

                <label>{t.book}
                  <select value={hadithForm.book_id} onChange={e => setHadithForm({ ...hadithForm, book_id: e.target.value })} required>
                    <option value="">{t.chooseBook}</option>
                    {books.filter(book => book.is_active !== false).map(book => (
                      <option key={book.id} value={book.id}>{book.name}</option>
                    ))}
                  </select>
                </label>

                <label>{t.number}
                  <input type="number" min="1" step="1" value={hadithForm.hadith_number} onChange={e => setHadithForm({ ...hadithForm, hadith_number: e.target.value })} required />
                </label>

                <label>{t.text}
                  <textarea value={hadithForm.tajik_text} onChange={e => setHadithForm({ ...hadithForm, tajik_text: e.target.value })} required />
                </label>

                <div className="form-actions">
                  <button className="primary-button" disabled={loading}>{t.save}</button>
                  <button type="button" className="secondary-button" onClick={() => { setHadithForm(emptyHadith); setEditingHadith(null) }}>{t.cancel}</button>
                </div>
              </form>

              <h3>{t.items}: {hadithRows.length}</h3>
              <div className="admin-list">
                {hadithRows.map(item => (
                  <article className="admin-card" key={item.id}>
                    <h4>{bookName(item.book_id)} — № {item.hadith_number}</h4>
                    <p>{item.tajik_text}</p>
                    <small>{item.is_published ? t.published : t.unpublished}</small>
                    <div className="form-actions">
                      <button className="secondary-button" onClick={() => openHadithEditor(item)}>{t.edit}</button>
                      <button className="secondary-button" onClick={() => togglePublished('hadith', item)}>{item.is_published ? t.hide : t.publish}</button>
                      <button className="danger-button" onClick={() => removeItem('hadith', item.id)}>{t.delete}</button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {adminTab === 'content' && (
            <>
              <form className="panel form-panel" onSubmit={saveContent}>
                <h3>{editingContent ? t.edit : t.addContent}</h3>

                <label>{t.section}
                  <select value={contentForm.section_slug} onChange={e => setContentForm({ ...contentForm, section_slug: e.target.value })}>
                    {SECTIONS.filter(section => section.slug !== 'hadith').map(section => (
                      <option key={section.slug} value={section.slug}>{section.tg}</option>
                    ))}
                  </select>
                </label>

                <label>{t.title}
                  <input value={contentForm.title} onChange={e => setContentForm({ ...contentForm, title: e.target.value })} required />
                </label>

                <label>{t.content}
                  <textarea value={contentForm.content_text} onChange={e => setContentForm({ ...contentForm, content_text: e.target.value })} required />
                </label>

                <div className="form-actions">
                  <button className="primary-button" disabled={loading}>{t.save}</button>
                  <button type="button" className="secondary-button" onClick={() => { setContentForm(emptyContent); setEditingContent(null) }}>{t.cancel}</button>
                </div>
              </form>

              <h3>{t.items}: {contentRows.length}</h3>
              <div className="admin-list">
                {contentRows.map(item => (
                  <article className="admin-card" key={item.id}>
                    <h4>{item.title}</h4>
                    <p>{item.content_text || item.tajik_text}</p>
                    <small>{item.is_published ? t.published : t.unpublished}</small>
                    <div className="form-actions">
                      <button className="secondary-button" onClick={() => openContentEditor(item)}>{t.edit}</button>
                      <button className="secondary-button" onClick={() => togglePublished('content_items', item)}>{item.is_published ? t.hide : t.publish}</button>
                      <button className="danger-button" onClick={() => removeItem('content_items', item.id)}>{t.delete}</button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          <button className="danger-button logout-button" onClick={logout}>{t.logout}</button>
        </main>
      )}

      {!loginOpen && page !== 'admin' && (
        <footer className="site-footer">
          <strong>Miftahulhadis</strong>
          <p>{t.description}</p>
          <small>© Miftahulhadis</small>
        </footer>
      )}
    </div>
  )
}

function HadithList({ db, books, language, initialRows, t }) {
  const [rows, setRows] = useState(initialRows || [])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasNext, setHasNext] = useState(true)
  const PAGE_SIZE = 30

  useEffect(() => {
    setRows(initialRows || [])
    setPage(0)
  }, [initialRows])

  const loadPage = async nextPage => {
    if (!db || nextPage < 0) return

    setLoading(true)
    const start = nextPage * PAGE_SIZE

    const { data, error } = await db.from('hadith')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(start, start + PAGE_SIZE - 1)

    if (!error) {
      setRows(data || [])
      setPage(nextPage)
      setHasNext((data || []).length === PAGE_SIZE)
    }

    setLoading(false)
  }

  if (!rows.length && !loading) {
    return <p className="empty">{t.noHadith}</p>
  }

  return (
    <>
      <div className="content-list">
        {rows.map(item => {
          const book = books.find(b => String(b.id) === String(item.book_id))
          return (
            <article className="content-card hadith-card" key={item.id}>
              <h3>{book?.name || ''} — № {item.hadith_number}</h3>

              {item.arabic_text && (
                <p className="arabic-text" dir="rtl">{item.arabic_text}</p>
              )}

              <p>{language === 'ru' ? item.russian_text || item.tajik_text : item.tajik_text}</p>

              {item.source_note && <small>📚 {item.source_note}</small>}
              {item.commentary && <p className="commentary">{item.commentary}</p>}
            </article>
          )
        })}
      </div>

      <div className="pagination">
        <button disabled={page === 0 || loading} onClick={() => loadPage(page - 1)}>
          ← {t.previous}
        </button>
        <span>{page + 1}</span>
        <button disabled={!hasNext || loading} onClick={() => loadPage(page + 1)}>
          {t.next} →
        </button>
      </div>
      {loading && <p>{t.loading}</p>}
    </>
  )
}

export default App
