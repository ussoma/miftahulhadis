import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
    title: '𝑴𝒊𝒇𝒕𝒂𝒉𝒖𝒍𝑯𝒂𝒅𝒊𝒔',
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
    tajik: 'Матни тоҷикӣ',
    titleField: 'Ном ё сарлавҳа',
    content: 'Матн',
    selectSection: 'Бахшро интихоб кунед',
    items: 'Мавод',
    confirmDelete: 'Ин маводро нест мекунед?',
    loginError: 'Почта ё парол нодуруст аст ё ин ҳисоб ҳуқуқи админ надорад.',
    loadError: 'Ҳангоми гирифтани маълумот хато рӯй дод.',
    saveError: 'Сабт нашуд.',
    saved: 'Маълумот сабт шуд.',
    searchResults: 'Натиҷаҳои ҷустуҷӯ',
    theme: 'Намуди зоҳирӣ',
    language: 'Забон',
    adminContent: 'Маводи бахшҳо',
    adminHadith: 'Идораи ҳадисҳо',
    addHadith: 'Иловаи ҳадис',
    addContent: 'Иловаи мавод',
    show: 'Нашр кардан',
    hide: 'Пинҳон кардан',
    chooseBook: 'Китобро интихоб кунед',
    hadithSeparate: 'Ҳадисҳо дар ҷадвали алоҳида нигоҳ дошта мешаванд.',
    quranInfo: 'Маводи Қуръонро дар ҳамин бахш илова кунед.',
    configError: 'Пайвасти Supabase танзим нашудааст.',
    light: 'Сафед',
    green: 'Сабзи торик',
    sound: 'Садо',
    settings: 'Танзимот',
    on: 'Фаъол',
    off: 'Хомӯш',
    loading: 'Маълумот бор шуда истодааст...',
    noHadith: 'Дар ин бахш ҳоло ҳадис нест.',
    hadithRequired: 'Китоб, рақам ва матни тоҷикӣ ҳатмист.',
    numberError: 'Рақами ҳадис бояд адади мусбат бошад.',
    titleRequired: 'Сарлавҳа ҳатмист.',
    contentRequired: 'Матнро ворид кунед.',
    hadithTranslation: 'Аз ман бирасонед, ҳарчанд як оят бошад.',
    library: 'китобхонаи донишҳои исломӣ'
  },
  ru: {
    title: '𝑴𝒊𝒇𝒕𝒂𝒉𝒖𝒍𝑯𝒂𝒅𝒊𝒔',
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
    tajik: 'Основной текст',
    titleField: 'Название или заголовок',
    content: 'Текст',
    selectSection: 'Выберите раздел',
    items: 'Материалы',
    confirmDelete: 'Удалить этот материал?',
    loginError: 'Неверная почта или пароль либо у аккаунта нет прав администратора.',
    loadError: 'Не удалось загрузить данные.',
    saveError: 'Не удалось сохранить.',
    saved: 'Данные сохранены.',
    searchResults: 'Результаты поиска',
    theme: 'Оформление',
    language: 'Язык',
    adminContent: 'Материалы разделов',
    adminHadith: 'Управление хадисами',
    addHadith: 'Добавить хадис',
    addContent: 'Добавить материал',
    show: 'Опубликовать',
    hide: 'Скрыть',
    chooseBook: 'Выберите книгу',
    hadithSeparate: 'Хадисы хранятся в отдельной таблице.',
    quranInfo: 'Материалы Корана добавляйте в этом разделе.',
    configError: 'Подключение Supabase не настроено.',
    light: 'Светлая',
    green: 'Тёмно-зелёная',
    sound: 'Звук',
    settings: 'Настройки',
    on: 'Включён',
    off: 'Выключен',
    loading: 'Загрузка данных...',
    noHadith: 'В этом разделе пока нет хадисов.',
    hadithRequired: 'Книга, номер и основной текст обязательны.',
    numberError: 'Номер хадиса должен быть положительным числом.',
    titleRequired: 'Заголовок обязателен.',
    contentRequired: 'Введите текст.',
    hadithTranslation: 'Передавайте от меня хотя бы один аят.',
    library: 'библиотека исламских знаний'
  },
  ar: {
    title: '𝑴𝒊𝒇𝒕𝒂𝒉𝒖𝒍𝑯𝒂𝒅𝒊𝒔',
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
    close: 'إغلاق اللوحة',
    hadith: 'حديث',
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    book: 'الكتاب',
    number: 'رقم الحديث',
    tajik: 'النص الأساسي',
    titleField: 'العنوان',
    content: 'النص',
    selectSection: 'اختر القسم',
    items: 'المواد',
    confirmDelete: 'هل تريد حذف هذه المادة؟',
    loginError: 'بيانات الدخول غير صحيحة أو لا توجد صلاحية إدارة.',
    loadError: 'حدث خطأ أثناء تحميل البيانات.',
    saveError: 'تعذر الحفظ.',
    saved: 'تم حفظ البيانات.',
    searchResults: 'نتائج البحث',
    theme: 'المظهر',
    language: 'اللغة',
    adminContent: 'مواد الأقسام',
    adminHadith: 'إدارة الأحاديث',
    addHadith: 'إضافة حديث',
    addContent: 'إضافة مادة',
    show: 'نشر',
    hide: 'إخفاء',
    chooseBook: 'اختر الكتاب',
    hadithSeparate: 'تُحفظ الأحاديث في جدول منفصل.',
    quranInfo: 'أضف مواد القرآن في هذا القسم.',
    configError: 'لم يتم إعداد اتصال Supabase.',
    light: 'فاتح',
    green: 'أخضر داكن',
    sound: 'الصوت',
    settings: 'الإعدادات',
    on: 'مفعل',
    off: 'متوقف',
    loading: 'جارٍ تحميل البيانات...',
    noHadith: 'لا توجد أحاديث في هذا القسم حالياً.',
    hadithRequired: 'الكتاب والرقم والنص الأساسي مطلوبة.',
    numberError: 'يجب أن يكون رقم الحديث عدداً موجباً.',
    titleRequired: 'العنوان مطلوب.',
    contentRequired: 'أدخل النص.',
    hadithTranslation: 'بلغوا عني ولو آية.',
    library: 'مكتبة العلوم الإسلامية'
  }
}

const emptyHadith = {
  book_id: '',
  hadith_number: '',
  tajik_text: ''
}

const emptyContent = {
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
  is_published: true,
  sort_order: 0
}

const fieldStyle = {
  display: 'block',
  marginBottom: 13,
  fontSize: 13,
  fontWeight: 700
}

const inputStyle = {
  width: '100%',
  padding: 12,
  border: '1px solid var(--border)',
  borderRadius: 10,
  fontSize: 14,
  color: 'var(--text)',
  background: 'var(--surface)',
  marginTop: 5,
  boxSizing: 'border-box'
}

function App() {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('miftah_lang')
    return ['tg', 'ru', 'ar'].includes(saved) ? saved : 'tg'
  })

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('miftah_theme') === 'white'
      ? 'white'
      : 'green'
  })

  const [sound, setSound] = useState(
    () => localStorage.getItem('miftah_sound') !== 'false'
  )

  const [page, setPage] = useState('home')
  const [selectedSection, setSelectedSection] = useState(null)

  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const [admin, setAdmin] = useState(false)
  const [login, setLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [loading, setLoading] = useState(false)

  const [books, setBooks] = useState([])
  const [hadithRows, setHadithRows] = useState([])
  const [contentRows, setContentRows] = useState([])

  const [adminTab, setAdminTab] = useState('content')
  const [editingHadith, setEditingHadith] = useState(null)
  const [editingContent, setEditingContent] = useState(null)

  const [hadithForm, setHadithForm] = useState(emptyHadith)
  const [contentForm, setContentForm] = useState(emptyContent)

  const tr = T[lang] || T.tg
  const isRTL = lang === 'ar'

  useEffect(() => {
    localStorage.setItem('miftah_lang', lang)
  }, [lang])

  useEffect(() => {
    localStorage.setItem('miftah_theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('miftah_sound', String(sound))
  }, [sound])

  const say = (text, type = 'info') => {
    setMessage(text)
    setMessageType(type)
  }

  const sectionName = section => section?.[lang] || section?.tg || ''

  const playClick = () => {
    if (!sound) return

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) return

      const audio = new AudioContextClass()
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(650, audio.currentTime)
      gain.gain.setValueAtTime(0.035, audio.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.045)

      oscillator.connect(gain)
      gain.connect(audio.destination)

      oscillator.start()
      oscillator.stop(audio.currentTime + 0.05)
      oscillator.onended = () => audio.close()
    } catch {
      // Садо дар браузер дастгирӣ намешавад.
    }
  }

  const toggleTheme = () => {
    setTheme(current => current === 'green' ? 'white' : 'green')
  }

  const loadPublicData = useCallback(async () => {
    if (!db) return

    const [booksRes, hadithRes, contentRes] = await Promise.all([
      db.from('books')
        .select('id,name,is_active,sort_order')
        .order('sort_order', { ascending: true }),

      db.from('hadith')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(0, 49),

      db.from('content_items')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .range(0, 99)
    ])

    if (booksRes.data) setBooks(booksRes.data)
    if (hadithRes.data) setHadithRows(hadithRes.data)
    if (contentRes.data) setContentRows(contentRes.data)
  }, [])

  const loadAdminData = useCallback(async () => {
    if (!db) return

    setLoading(true)

    const [bookRes, hadithRes, contentRes] = await Promise.all([
      db.from('books')
        .select('*')
        .order('sort_order', { ascending: true }),

      db.from('hadith')
        .select('*')
        .order('created_at', { ascending: false })
        .range(0, 99),

      db.from('content_items')
        .select('*')
        .order('sort_order', { ascending: true })
        .range(0, 199)
    ])

    const errors = [bookRes.error, hadithRes.error, contentRes.error].filter(Boolean)

    if (errors.length) {
      say(`${tr.loadError} ${errors.map(error => error.message).join(' | ')}`, 'error')
    } else {
      setBooks(bookRes.data || [])
      setHadithRows(hadithRes.data || [])
      setContentRows(contentRes.data || [])
    }

    setLoading(false)
  }, [tr.loadError])

  const verifyAdmin = useCallback(async () => {
    if (!db) {
      setAdmin(false)
      setLogin(true)
      return false
    }

    const { data: sessionData, error: sessionError } = await db.auth.getSession()

    if (sessionError || !sessionData?.session?.user) {
      setAdmin(false)
      setLogin(true)
      setPage('home')
      return false
    }

    const user = sessionData.session.user

    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || profile?.role !== 'admin') {
      setAdmin(false)
      setLogin(true)
      setPage('home')
      return false
    }

    setAdmin(true)
    setLogin(false)
    setPage('admin')
    return true
  }, [])

  const openAdmin = () => {
    window.location.hash = 'admin'
    verifyAdmin()
  }

  useEffect(() => {
    loadPublicData()
  }, [loadPublicData])

  useEffect(() => {
    if (!db) return

    let alive = true

    const { data: listener } = db.auth.onAuthStateChange((_event, session) => {
      if (!alive) return

      if (!session?.user) {
        setAdmin(false)
      }
    })

    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        verifyAdmin()
      } else {
        setLogin(false)
        setPage(current => current === 'admin' ? 'home' : current)
      }
    }

    if (window.location.hash === '#admin') {
      verifyAdmin()
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      alive = false
      listener.subscription.unsubscribe()
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [verifyAdmin])

  useEffect(() => {
    if (admin && page === 'admin') {
      loadAdminData()
    }
  }, [admin, page, loadAdminData])

  const doLogin = async event => {
    event.preventDefault()

    if (!db) {
      say(tr.configError, 'error')
      return
    }

    setLoading(true)
    say('')

    const { data, error } = await db.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    if (error || !data?.user) {
      say(tr.loginError, 'error')
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
      setAdmin(false)
      say(tr.loginError, 'error')
      setLoading(false)
      return
    }

    setAdmin(true)
    setLogin(false)
    setPage('admin')
    setPassword('')
    say('')
    setLoading(false)
  }

  const closeAdmin = () => {
    setPage('home')
    setLogin(false)
    setSelectedSection(null)
    say('')
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search
    )
  }

  const logout = async () => {
    if (db) await db.auth.signOut()

    setAdmin(false)
    setLogin(false)
    setPage('home')
    setPassword('')
    say('')

    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search
    )
  }

  const openSection = section => {
    setSelectedSection(section)
    setPage('section')
    setSearch('')
    setSearchResults([])
  }

  const runSearch = async value => {
    setSearch(value)

    if (!value.trim() || !db) {
      setSearchResults([])
      setSearching(false)
      return
    }

    setSearching(true)

    const term = value.trim().replace(/[%_,]/g, ' ')

    const [contentRes, hadithRes] = await Promise.all([
      db.from('content_items')
        .select('*')
        .eq('is_published', true)
        .or(`title.ilike.%${term}%,content_text.ilike.%${term}%,tajik_text.ilike.%${term}%,russian_text.ilike.%${term}%,arabic_text.ilike.%${term}%`)
        .range(0, 49),

      db.from('hadith')
        .select('*')
        .eq('is_published', true)
        .or(`tajik_text.ilike.%${term}%,arabic_text.ilike.%${term}%,source_note.ilike.%${term}%`)
        .range(0, 49)
    ])

    const found = [
      ...(hadithRes.data || []).map(item => ({
        ...item,
        resultType: 'hadith'
      })),
      ...(contentRes.data || []).map(item => ({
        ...item,
        resultType: 'content'
      }))
    ]

    setSearchResults(found)

    if (contentRes.error || hadithRes.error) {
      say(
        `${tr.loadError} ${(contentRes.error || hadithRes.error).message}`,
        'error'
      )
    }

    setSearching(false)
  }

  const submitSearch = event => {
    event.preventDefault()
    runSearch(search)
  }

  const highlight = text => {
    const value = String(text || '')

    if (!search.trim()) return value

    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    return value.split(new RegExp(`(${escaped})`, 'gi')).map((part, index) =>
      part.toLowerCase() === search.trim().toLowerCase()
        ? <mark key={index}>{part}</mark>
        : part
    )
  }

  const saveHadith = async event => {
    event.preventDefault()

    if (!db) {
      say(tr.configError, 'error')
      return
    }

    if (
      !hadithForm.book_id ||
      !String(hadithForm.hadith_number).trim() ||
      !String(hadithForm.tajik_text).trim()
    ) {
      say(tr.hadithRequired, 'error')
      return
    }

    const number = Number(hadithForm.hadith_number)

    if (!Number.isInteger(number) || number < 1) {
      say(tr.numberError, 'error')
      return
    }

    setLoading(true)
    say('')

    const payload = {
      book_id: hadithForm.book_id,
      hadith_number: number,
      tajik_text: hadithForm.tajik_text.trim(),
      arabic_text: '',
      source_note: '',
      commentary: '',
      is_published: true,
      updated_at: new Date().toISOString()
    }

    const result = editingHadith
      ? await db.from('hadith').update(payload).eq('id', editingHadith)
      : await db.from('hadith').insert(payload)

    if (result.error) {
      say(`${tr.saveError} ${result.error.message}`, 'error')
    } else {
      setHadithForm(emptyHadith)
      setEditingHadith(null)
      say(tr.saved, 'success')
      await loadAdminData()
      await loadPublicData()
    }

    setLoading(false)
  }

  const saveContent = async event => {
    event.preventDefault()

    if (!db) {
      say(tr.configError, 'error')
      return
    }

    if (contentForm.section_slug === 'hadith') {
      setAdminTab('hadith')
      say(tr.hadithSeparate, 'info')
      return
    }

    if (!contentForm.title.trim()) {
      say(tr.titleRequired, 'error')
      return
    }

    const mainText = String(
      contentForm.content_text ||
      contentForm.tajik_text ||
      contentForm.answer_text ||
      ''
    ).trim()

    if (!mainText) {
      say(tr.contentRequired, 'error')
      return
    }

    setLoading(true)
    say('')

    const payload = {
      section_slug: contentForm.section_slug,
      title: contentForm.title.trim(),
      content_text: mainText,
      question_text: contentForm.section_slug === 'questions'
        ? contentForm.title.trim()
        : '',
      answer_text: '',
      arabic_text: '',
      tajik_text: mainText,
      russian_text: '',
      source_note: '',
      commentary: '',
      media_url: '',
      is_published: true,
      sort_order: Number(contentForm.sort_order || 0),
      updated_at: new Date().toISOString()
    }

    const result = editingContent
      ? await db.from('content_items').update(payload).eq('id', editingContent)
      : await db.from('content_items').insert(payload)

    if (result.error) {
      say(`${tr.saveError} ${result.error.message}`, 'error')
    } else {
      setContentForm(emptyContent)
      setEditingContent(null)
      say(tr.saved, 'success')
      await loadAdminData()
      await loadPublicData()
    }

    setLoading(false)
  }

  const editHadith = item => {
    setHadithForm({
      book_id: item.book_id || '',
      hadith_number: item.hadith_number ?? '',
      tajik_text: item.tajik_text || ''
    })

    setEditingHadith(item.id)
    say('')
  }

  const editContent = item => {
    setContentForm({
      ...emptyContent,
      ...item,
      content_text: item.content_text || item.tajik_text || item.answer_text || ''
    })

    setEditingContent(item.id)
    say('')
  }

  const deleteItem = async (table, id) => {
    if (!db || !window.confirm(tr.confirmDelete)) return

    const { error } = await db.from(table).delete().eq('id', id)

    if (error) {
      say(`${tr.saveError} ${error.message}`, 'error')
    } else {
      say(tr.saved, 'success')
      await loadAdminData()
      await loadPublicData()
    }
  }

  const togglePublished = async (table, item) => {
    if (!db) return

    const { error } = await db.from(table).update({
      is_published: !item.is_published,
      updated_at: new Date().toISOString()
    }).eq('id', item.id)

    if (error) {
      say(`${tr.saveError} ${error.message}`, 'error')
    } else {
      say(tr.saved, 'success')
      await loadAdminData()
      await loadPublicData()
    }
  }

  const bookName = id =>
    books.find(book => String(book.id) === String(id))?.name || ''

  const selectedContent = useMemo(
    () => contentRows.filter(item => item.section_slug === selectedSection?.slug),
    [contentRows, selectedSection]
  )

  const renderSettings = () => (
    <section className="section-intro settings-panel">
      <h3>{tr.settings}</h3>

      <label style={fieldStyle}>
        {tr.language}
        <select
          style={inputStyle}
          value={lang}
          onChange={event => setLang(event.target.value)}
        >
          <option value="tg">Тоҷикӣ</option>
          <option value="ru">Русский</option>
          <option value="ar">العربية</option>
        </select>
      </label>

      <label style={fieldStyle}>
        {tr.theme}
        <select
          style={inputStyle}
          value={theme}
          onChange={event => setTheme(event.target.value)}
        >
          <option value="green">{tr.green}</option>
          <option value="white">{tr.light}</option>
        </select>
      </label>

      <label className="check-line">
        <input
          type="checkbox"
          checked={sound}
          onChange={event => setSound(event.target.checked)}
        />
        {tr.sound}: {sound ? tr.on : tr.off}
      </label>
    </section>
  )

  const renderLogin = () => (
    <main className="content-page login-page">
      <button
        className="back-button"
        onClick={() => {
          setLogin(false)
          setPage('home')
          say('')
          window.history.replaceState(
            null,
            '',
            window.location.pathname + window.location.search
          )
        }}
      >
        ‹ {tr.back}
      </button>

      <form onSubmit={doLogin} className="section-intro admin-form">
        <h2>{tr.login}</h2>

        <label style={fieldStyle}>
          {tr.email}
          <input
            style={inputStyle}
            type="email"
            autoComplete="username"
            value={email}
            onChange={event => setEmail(event.target.value)}
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
            onChange={event => setPassword(event.target.value)}
            required
          />
        </label>

        {message && (
          <p className={`notice ${messageType}`}>{message}</p>
        )}

        <button className="primary-button" disabled={loading}>
          {loading ? '...' : tr.enter}
        </button>
      </form>

      {renderSettings()}
    </main>
  )

  const renderHadithForm = () => (
    <form onSubmit={saveHadith} className="section-intro admin-form">
      <h3>{editingHadith ? tr.edit : tr.addHadith}</h3>

      <label style={fieldStyle}>
        {tr.book}
        <select
          style={inputStyle}
          value={hadithForm.book_id}
          onChange={event => setHadithForm({
            ...hadithForm,
            book_id: event.target.value
          })}
          required
        >
          <option value="">{tr.chooseBook}</option>

          {books
            .filter(book => book.is_active !== false)
            .map(book => (
              <option value={book.id} key={book.id}>
                {book.name}
              </option>
            ))}
        </select>
      </label>

      <label style={fieldStyle}>
        {tr.number}
        <input
          style={inputStyle}
          type="number"
          min="1"
          step="1"
          value={hadithForm.hadith_number}
          onChange={event => setHadithForm({
            ...hadithForm,
            hadith_number: event.target.value
          })}
          required
        />
      </label>

      <label style={fieldStyle}>
        {tr.tajik}
        <textarea
          style={{ ...inputStyle, minHeight: 150 }}
          value={hadithForm.tajik_text}
          onChange={event => setHadithForm({
            ...hadithForm,
            tajik_text: event.target.value
          })}
          required
        />
      </label>

      <div className="button-row">
        <button className="primary-button" disabled={loading}>
          {loading ? '...' : tr.save}
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setHadithForm(emptyHadith)
            setEditingHadith(null)
            say('')
          }}
        >
          {tr.cancel}
        </button>
      </div>
    </form>
  )

  const renderContentForm = () => (
    <form onSubmit={saveContent} className="section-intro admin-form">
      <h3>{editingContent ? tr.edit : tr.addContent}</h3>

      <label style={fieldStyle}>
        {tr.selectSection}
        <select
          style={inputStyle}
          value={contentForm.section_slug}
          onChange={event => setContentForm({
            ...contentForm,
            section_slug: event.target.value
          })}
        >
          {SECTIONS.map(section => (
            <option value={section.slug} key={section.slug}>
              {sectionName(section)}
            </option>
          ))}
        </select>
      </label>

      {contentForm.section_slug === 'hadith' && (
        <div className="notice info">
          {tr.hadithSeparate}
          <button
            type="button"
            className="secondary-button inline-action"
            onClick={() => {
              setAdminTab('hadith')
              setEditingContent(null)
            }}
          >
            {tr.adminHadith}
          </button>
        </div>
      )}

      {contentForm.section_slug === 'quran' && (
        <p className="notice info">{tr.quranInfo}</p>
      )}

      <label style={fieldStyle}>
        {tr.titleField}
        <input
          style={inputStyle}
          value={contentForm.title}
          onChange={event => setContentForm({
            ...contentForm,
            title: event.target.value
          })}
          required
        />
      </label>

      <label style={fieldStyle}>
        {tr.content}
        <textarea
          style={{ ...inputStyle, minHeight: 170 }}
          value={contentForm.content_text}
          onChange={event => setContentForm({
            ...contentForm,
            content_text: event.target.value
          })}
          required
        />
      </label>

      <div className="button-row">
        <button
          className="primary-button"
          disabled={loading || contentForm.section_slug === 'hadith'}
        >
          {loading ? '...' : tr.save}
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setContentForm(emptyContent)
            setEditingContent(null)
            say('')
          }}
        >
          {tr.cancel}
        </button>
      </div>
    </form>
  )

  const renderAdmin = () => (
    <main className="content-page admin-page">
      <div className="section-heading">
        <div>
          <h2>{tr.admin}</h2>
          <p>Miftahulhadis · 11 бахш</p>
        </div>

        <button className="secondary-button" onClick={closeAdmin}>
          {tr.close}
        </button>
      </div>

      {renderSettings()}

      <div className="button-row admin-tabs">
        <button
          className={adminTab === 'content' ? 'primary-button' : 'secondary-button'}
          onClick={() => {
            setAdminTab('content')
            say('')
          }}
        >
          {tr.adminContent}
        </button>

        <button
          className={adminTab === 'hadith' ? 'primary-button' : 'secondary-button'}
          onClick={() => {
            setAdminTab('hadith')
            say('')
          }}
        >
          {tr.adminHadith}
        </button>
      </div>

      {message && (
        <p className={`notice ${messageType}`}>{message}</p>
      )}

      {loading && (
        <p className="loading-line">{tr.loading}</p>
      )}

      {adminTab === 'content' && (
        <>
          <div className="button-row">
            <button
              className="primary-button"
              onClick={() => {
                setContentForm(emptyContent)
                setEditingContent(null)
                say('')
              }}
            >
              + {tr.addContent}
            </button>
          </div>

          {renderContentForm()}

          <h3>{tr.items} ({contentRows.length})</h3>

          {contentRows.map(item => (
            <article key={item.id} className="section-intro admin-item">
              <strong>{item.title || '(Бе сарлавҳа)'}</strong>
              <p>
                {sectionName(
                  SECTIONS.find(section => section.slug === item.section_slug)
                ) || item.section_slug}
              </p>

              <small>
                {item.is_published ? tr.show : tr.hide}
              </small>

              <div className="button-row">
                <button
                  className="secondary-button"
                  onClick={() => editContent(item)}
                >
                  {tr.edit}
                </button>

                <button
                  className="secondary-button"
                  onClick={() => togglePublished('content_items', item)}
                >
                  {item.is_published ? tr.hide : tr.show}
                </button>

                <button
                  className="secondary-button danger"
                  onClick={() => deleteItem('content_items', item.id)}
                >
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

          <h3>{tr.items} ({hadithRows.length})</h3>

          {hadithRows.map(item => (
            <article key={item.id} className="section-intro admin-item">
              <strong>
                {bookName(item.book_id)} — № {item.hadith_number}
              </strong>

              <p>{String(item.tajik_text || '').slice(0, 220)}</p>

              <small>
                {item.is_published ? tr.show : tr.hide}
              </small>

              <div className="button-row">
                <button
                  className="secondary-button"
                  onClick={() => editHadith(item)}
                >
                  {tr.edit}
                </button>

                <button
                  className="secondary-button"
                  onClick={() => togglePublished('hadith', item)}
                >
                  {item.is_published ? tr.hide : tr.show}
                </button>

                <button
                  className="secondary-button danger"
                  onClick={() => deleteItem('hadith', item.id)}
                >
                  {tr.delete}
                </button>
              </div>
            </article>
          ))}
        </>
      )}

      <button
        className="secondary-button logout-button"
        onClick={logout}
      >
        {tr.logout}
      </button>
    </main>
  )

  const renderSection = () => (
    <main className="content-page">
      <button
        className="back-button"
        onClick={() => {
          setPage('home')
          setSelectedSection(null)
        }}
      >
        ‹ {tr.back}
      </button>

      <div className="section-intro section-title-card">
        <div className="section-icon">{selectedSection?.icon}</div>
        <h2>{sectionName(selectedSection)}</h2>
      </div>

      <div className="section-body">
        {selectedSection?.slug === 'hadith' ? (
          <HadithPublic
            db={db}
            lang={lang}
            books={books}
            initialRows={hadithRows}
            tr={tr}
          />
        ) : selectedContent.length === 0 ? (
          <div className="empty-result">
            <span>📚</span>
            <p>{tr.empty}</p>
          </div>
        ) : (
          <div className="menu">
            {selectedContent.map(item => (
              <article
                className="section-intro public-item"
                key={item.id}
              >
                <h3>{item.title}</h3>

                {item.arabic_text && (
                  <p className="arabic-text" dir="rtl">
                    {item.arabic_text}
                  </p>
                )}

                <p>
                  {lang === 'ru' && item.russian_text
                    ? item.russian_text
                    : (
                      item.tajik_text ||
                      item.content_text ||
                      item.answer_text
                    )}
                </p>

                {item.source_note && (
                  <small>📚 {item.source_note}</small>
                )}

                {item.commentary && (
                  <p>{item.commentary}</p>
                )}

                {item.media_url && (
                  <p>
                    <a
                      href={item.media_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      ▶ Кушодани мавод
                    </a>
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )

  return (
    <div
      className={`app theme-${theme}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      onClickCapture={event => {
        if (event.target.closest('button')) playClick()
      }}
    >
      {!login && page !== 'admin' && (
        <>
          <header className="header">
            <div
              className="miftah-banner"
              style={{
                background: theme === 'green' ? '#102F25' : '#FFFFFF',
                color: theme === 'green' ? '#F2E8CF' : '#174C37',
                border: theme === 'green'
                  ? '1px solid #476B59'
                  : '1px solid #D9E4DC',
                borderRadius: 20,
                padding: '25px 18px 20px',
                margin: '12px 0 18px',
                textAlign: 'center',
                boxShadow: '0 5px 20px rgba(0,0,0,0.08)'
              }}
            >
              <h1
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(25px, 7vw, 34px)',
                  fontWeight: 700,
                  fontStyle: 'italic',
                  margin: '0 0 18px',
                  letterSpacing: '-1px'
                }}
              >
                𝑴𝒊𝒇𝒕𝒂𝒉𝒖𝒍𝑯𝒂𝒅𝒊𝒔
              </h1>

              <div
                style={{
                  height: 1,
                  background: theme === 'green' ? '#476B59' : '#D9E4DC',
                  marginBottom: 20
                }}
              />

              <p
                dir="rtl"
                style={{
                  fontFamily: 'serif',
                  fontSize: 'clamp(24px, 6vw, 31px)',
                  lineHeight: 1.9,
                  margin: '0 0 10px',
                  color: theme === 'green' ? '#FFFFFF' : '#174C37'
                }}
              >
                بَلِّغُوا عَنِّي وَلَوْ آيَةً
              </p>

              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.8,
                  margin: '0 0 8px',
                  color: theme === 'green' ? '#E4E9E5' : '#34483D'
                }}
              >
                Аз ман бирасонед, ҳарчанд як оят бошад.
              </p>

              <p
                style={{
                  fontSize: 11,
                  letterSpacing: '1px',
                  margin: '0 0 18px',
                  color: theme === 'green' ? '#B7C9BE' : '#718077'
                }}
              >
                {tr.library}
              </p>

              <div
                style={{
                  height: 1,
                  background: theme === 'green' ? '#476B59' : '#D9E4DC',
                  marginBottom: 13
                }}
              />

              <small
                style={{
                  fontSize: 11,
                  color: theme === 'green' ? '#D8CBAA' : '#66776C'
                }}
              >
                📚 Саҳеҳ ал-Бухорӣ · ҳадиси № 3461
              </small>
            </div>
          </header>

          <div className="language-selector app-toolbar">
            <label>
              {tr.language}:
              <select
                className="language-select"
                value={lang}
                onChange={event => setLang(event.target.value)}
              >
                <option value="tg">Тоҷикӣ</option>
                <option value="ru">Русский</option>
                <option value="ar">العربية</option>
              </select>
            </label>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setSound(current => !current)}
              title={tr.sound}
            >
              {sound ? '🔊' : '🔇'} {tr.sound}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={toggleTheme}
              title={tr.theme}
            >
              {theme === 'green' ? '☀️' : '🌿'} {theme === 'green' ? tr.light : tr.green}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setPage('settings')}
              title={tr.settings}
            >
              ⚙
            </button>
          </div>
        </>
      )}

      {login && renderLogin()}

      {page === 'settings' && (
        <main className="content-page">
          <button
            className="back-button"
            onClick={() => setPage('home')}
          >
            ‹ {tr.back}
          </button>

          {renderSettings()}
        </main>
      )}

      {page === 'admin' && admin && renderAdmin()}

      {page === 'section' && renderSection()}

      {page === 'home' && !login && (
        <>
          <main className="main-content">
            {!db && (
              <p className="notice error">{tr.configError}</p>
            )}

            <form className="search-box" onSubmit={submitSearch}>
              <span>⌕</span>

              <input
                value={search}
                onChange={event => runSearch(event.target.value)}
                placeholder={tr.search}
              />

              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => {
                    setSearch('')
                    setSearchResults([])
                  }}
                >
                  ×
                </button>
              )}

              <button type="submit" className="primary-button search-submit">
                {tr.searchButton}
              </button>
            </form>

            <div className="button-row home-admin-row">
              <button
                type="button"
                className="secondary-button admin-open-button"
                onClick={openAdmin}
              >
                🔐 {tr.admin}
              </button>
            </div>

            {search.trim() ? (
              <>
                <div className="section-heading">
                  <h2>{tr.searchResults}</h2>
                  <span className="section-count">
                    {searchResults.length}
                  </span>
                </div>

                {searching && <p>...</p>}

                {!searching && searchResults.length === 0 && (
                  <div className="empty-result">
                    <p>{tr.noResults}</p>
                  </div>
                )}

                <div className="menu">
                  {searchResults.map(item => (
                    <article
                      className="section-intro public-item"
                      key={`${item.resultType}-${item.id}`}
                    >
                      <strong>
                        {item.resultType === 'hadith'
                          ? `${tr.hadith} № ${item.hadith_number}`
                          : item.title}
                      </strong>

                      {item.resultType === 'hadith' && (
                        <small>{bookName(item.book_id)}</small>
                      )}

                      {item.arabic_text && (
                        <p className="arabic-text" dir="rtl">
                          {highlight(item.arabic_text)}
                        </p>
                      )}

                      <p>
                        {highlight(
                          item.tajik_text ||
                          item.content_text ||
                          item.question_text ||
                          ''
                        )}
                      </p>

                      {item.source_note && (
                        <small>{highlight(item.source_note)}</small>
                      )}
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="section-heading">
                  <h2>{tr.sections}</h2>
                  <span className="section-count">
                    {SECTIONS.length}
                  </span>
                </div>

                <div className="menu">
                  {SECTIONS.map((section, index) => (
                    <button
                      className="menu-card"
                      key={section.slug}
                      onClick={() => openSection(section)}
                    >
                      <span className="card-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className="card-icon">
                        {section.icon}
                      </span>

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

function HadithPublic({ db, lang, books, initialRows = [], tr }) {
  const [rows, setRows] = useState(initialRows)
  const [loading, setLoading] = useState(!initialRows.length)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const PAGE_SIZE = 30

  useEffect(() => {
    setRows(initialRows)
  }, [initialRows])

  const loadPage = async nextPage => {
    if (!db) return

    setLoading(true)

    const from = nextPage * PAGE_SIZE

    const { data, error } = await db
      .from('hadith')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (!error) {
      setRows(data || [])
      setPage(nextPage)
      setHasMore((data || []).length === PAGE_SIZE)
    }

    setLoading(false)
  }

  if (loading && !rows.length) {
    return <p className="loading-line">...</p>
  }

  if (!rows.length) {
    return (
      <div className="empty-result">
        <p>{tr?.noHadith || 'Дар ин бахш ҳоло ҳадис нест.'}</p>
      </div>
    )
  }

  return (
    <>
      <div className="menu">
        {rows.map(item => {
          const book = books.find(
            current => String(current.id) === String(item.book_id)
          )

          return (
            <article
              className="section-intro public-item"
              key={item.id}
            >
              <h3>
                {book?.name || ''} — № {item.hadith_number}
              </h3>

              {item.arabic_text && (
                <p className="arabic-text" dir="rtl">
                  {item.arabic_text}
                </p>
              )}

              <p>
                {lang === 'ru'
                  ? (item.russian_text || item.tajik_text)
                  : item.tajik_text}
              </p>

              {item.source_note && (
                <small>📚 {item.source_note}</small>
              )}

              {item.commentary && (
                <p>{item.commentary}</p>
              )}
            </article>
          )
        })}
      </div>

      <div className="pagination">
        <button
          className="secondary-button"
          disabled={page === 0 || loading}
          onClick={() => loadPage(page - 1)}
        >
          ←
        </button>

        <span>{page + 1}</span>

        <button
          className="secondary-button"
          disabled={!hasMore || loading}
          onClick={() => loadPage(page + 1)}
        >
          →
        </button>
      </div>
    </>
  )
}

export default App