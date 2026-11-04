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

const DEFAULT_SECTIONS = [
  { slug: 'quran', title: 'Қуръони Карим', icon: '📗', description: 'Сураҳо ва оятҳои Қуръон', sort_order: 1, is_active: true },
  { slug: 'hadith', title: 'Ҳадисҳо', icon: '📚', description: 'Ҳадисҳои Расулуллоҳ ﷺ', sort_order: 2, is_active: true },
  { slug: 'salihin', title: 'Суханони Солеҳин', icon: '🌿', description: 'Суханони уламову солеҳон', sort_order: 3, is_active: true },
  { slug: 'prophets', title: 'Қиссаи Паёмбарон عَلَيْهِمُ السَّلَامُ', icon: '🕌', description: 'Қиссаҳои паёмбарон', sort_order: 4, is_active: true },
  { slug: 'seerah', title: 'Сирати Расулуллоҳ ﷺ', icon: '🌙', description: 'Зиндагии Расулуллоҳ ﷺ', sort_order: 5, is_active: true },
  { slug: 'companions', title: 'Сирати саҳоба رضي الله عنهم', icon: '⭐', description: 'Зиндагии саҳоба', sort_order: 6, is_active: true },
  { slug: 'duas', title: 'Дуоҳо', icon: '🤲', description: 'Дуоҳои Қуръонӣ ва набавӣ', sort_order: 7, is_active: true },
  { slug: 'adhkar', title: 'Азкор', icon: '📿', description: 'Азкори саҳару шом', sort_order: 8, is_active: true },
  { slug: 'lessons', title: 'Дарсҳои Исломӣ', icon: '🎓', description: 'Дарсҳои фоидабахши исломӣ', sort_order: 9, is_active: true },
  { slug: 'questions', title: 'Саволҳои Исломӣ', icon: '❔', description: 'Саволу ҷавобҳои исломӣ', sort_order: 10, is_active: true }
]

const DEFAULT_BOOKS = [
  { name: 'Саҳеҳи Бухорӣ', slug: 'sahih-al-bukhari', sort_order: 1 },
  { name: 'Саҳеҳи Муслим', slug: 'sahih-muslim', sort_order: 2 },
  { name: 'Сунани Абу Довуд', slug: 'sunan-abi-dawud', sort_order: 3 },
  { name: 'Ҷомеъи Тирмизӣ', slug: 'jami-at-tirmidhi', sort_order: 4 },
  { name: 'Сунани Насоӣ', slug: 'sunan-an-nasai', sort_order: 5 },
  { name: 'Сунани Ибни Моҷа', slug: 'sunan-ibn-majah', sort_order: 6 },
  { name: 'Муваттаи Имом Молик', slug: 'muwatta-imam-malik', sort_order: 7 },
  { name: 'Риёзус-Солиҳин', slug: 'riyad-as-salihin', sort_order: 8 }
]

const LANG = {
  tg: {
    admin: 'Панели идоракунӣ',
    login: 'Ворид шудан',
    logout: 'Баромадан',
    email: 'Почтаи электронӣ',
    password: 'Парол',
    home: 'Саҳифаи асосӣ',
    search: 'Ҷустуҷӯ',
    searchPlaceholder: 'Калима ё ибораро нависед...',
    daily: 'Ҳадиси рӯз',
    loading: 'Бор шуда истодааст...',
    noResults: 'Маълумот ёфт нашуд.',
    noHadiths: 'Ҳоло ҳадис илова нашудааст.',
    noContent: 'Дар ин бахш ҳоло мавод нест.',
    noBooks: 'Китобҳои ҳадис ҳоло илова нашудаанд.',
    chooseBook: 'Китобро интихоб кунед',
    back: 'Бозгашт',
    save: 'Сабт кардан',
    cancel: 'Бекор кардан',
    add: 'Илова кардан',
    edit: 'Таҳрир',
    delete: 'Нест кардан',
    hide: 'Пинҳон кардан',
    show: 'Намоён кардан',
    number: 'Рақами ҳадис',
    tajik: 'Матни тоҷикӣ',
    arabic: 'Матни арабӣ',
    source: 'Манбаъ',
    explanationTg: 'Шарҳи тоҷикӣ',
    explanationAr: 'Шарҳи арабӣ',
    audio: 'Пайванди аудио',
    video: 'Пайванди видео',
    title: 'Ном / сарлавҳа',
    section: 'Бахш',
    book: 'Китоби ҳадис',
    newHadith: 'Иловаи ҳадис',
    editHadith: 'Таҳрири ҳадис',
    newContent: 'Иловаи маводи нав',
    editContent: 'Таҳрири мавод',
    newBook: 'Иловаи китоб',
    newSection: 'Иловаи бахш',
    editSection: 'Таҳрири бахш',
    description: 'Тавсифи бахш',
    icon: 'Нишонаи бахш',
    confirm: 'Оё мутмаин ҳастед?',
    saved: 'Маълумот сабт шуд.',
    error: 'Хато: ',
    published: 'Нашршуда',
    hidden: 'Пинҳон',
    books: 'Китобҳо',
    hadiths: 'Ҳадисҳо',
    contents: 'Маводҳо',
    sections: 'Бахшҳо',
    required: 'Ин майдон ҳатмист.',
    adminOnly: 'Ин бахш танҳо барои мудир дастрас аст.',
    moveUp: 'Ба боло',
    moveDown: 'Ба поён',
    explanationHeading: 'Шарҳи ҳадис:',
    selectBook: 'Китобро интихоб кунед',
    exampleNumber: 'Масалан: 15',
    hadithTranslationPlaceholder: 'Тарҷумаи ҳадис...',
    sectionName: 'Номи бахш',
    sectionSlug: 'Slug / рамзи бахш',
    sectionSlugExample: 'Масалан: new-section',
    bookExample: 'Саҳеҳи Бухорӣ',
    bookNameRequired: 'Номи китобро навис.',
    sectionNameRequired: 'Номи бахшро ворид кунед.',
    hadithRequired: 'Рақами ҳадис ва матни тоҷикӣ ҳатмӣ мебошанд.',
    chooseHadithBook: 'Лутфан китоби ҳадисро интихоб кунед.',
    contentRequired: 'Барои мавод ҳадди ақал як матн ё пайванди аудио/видео ворид кунед.',
    deleteSectionConfirm: 'Бахш нест карда шавад? Маводҳои дохили он нест намешаванд.',
    sectionNotSaved: 'Ин бахш ҳоло дар ҷадвали sections сабт нашудааст.',
    activeColumnMissing: 'Дар ҷадвали sections сутуни is_active ё is_visible ёфт нашуд.',
    reorderNeedsSaved: 'Барои тағйири тартиб бахшҳо бояд дар Supabase сабт шуда бошанд.',
    orderColumnMissing: 'Сутуни sort_order ёфт нашуд.',
    userNotFound: 'Истифодабаранда ёфт нашуд.',
    notAdmin: 'Ин ҳисоб ҳуқуқи мудирро надорад.',
    supabaseMissing: 'Маълумоти Supabase дар Vercel танзим нашудааст.',
    browserNoAudio: 'Браузери шумо аудиоро дастгирӣ намекунад.',
    browserNoVideo: 'Браузери шумо видеоро дастгирӣ намекунад.',
    textMissing: 'Матн ворид нашудааст.',
    bannerTranslation: 'Аз номи ман бирасонед, ҳарчанд як оят бошад.',
    bannerSource: 'Саҳеҳи Бухорӣ · ҳадиси № 3461',
    heroTitle: 'Мифтаҳул Ҳадис',
    heroDescription: 'Манбаи омӯзиш ва мутолиаи Қуръон, ҳадис ва дигар илмҳои исломӣ.',
    copyright: 'Ҳамаи ҳуқуқҳо ҳифз шудаанд.',
    adminDescription: 'Идоракунии пурраи Miftahulhadis',
    loginDescription: 'Барои идоракунии барнома ба ҳисоби мудир ворид шавед.',
    dailyExplanation: 'Шарҳи ҳадис:',
    hadithLabel: 'Ҳадиси № '
  },

  ru: {
    admin: 'Панель управления',
    login: 'Войти',
    logout: 'Выйти',
    email: 'Электронная почта',
    password: 'Пароль',
    home: 'Главная',
    search: 'Поиск',
    searchPlaceholder: 'Введите слово или фразу...',
    daily: 'Хадис дня',
    loading: 'Загрузка...',
    noResults: 'Ничего не найдено.',
    noHadiths: 'Хадисы пока не добавлены.',
    noContent: 'В этом разделе пока нет материалов.',
    noBooks: 'Сборники хадисов пока не добавлены.',
    chooseBook: 'Выберите сборник',
    back: 'Назад',
    save: 'Сохранить',
    cancel: 'Отмена',
    add: 'Добавить',
    edit: 'Изменить',
    delete: 'Удалить',
    hide: 'Скрыть',
    show: 'Показать',
    number: 'Номер хадиса',
    tajik: 'Таджикский текст',
    arabic: 'Арабский текст',
    source: 'Источник',
    explanationTg: 'Объяснение на таджикском',
    explanationAr: 'Объяснение на арабском',
    audio: 'Ссылка на аудио',
    video: 'Ссылка на видео',
    title: 'Название',
    section: 'Раздел',
    book: 'Сборник хадисов',
    newHadith: 'Добавить хадис',
    editHadith: 'Изменить хадис',
    newContent: 'Добавить материал',
    editContent: 'Изменить материал',
    newBook: 'Добавить сборник',
    newSection: 'Добавить раздел',
    editSection: 'Изменить раздел',
    description: 'Описание раздела',
    icon: 'Значок раздела',
    confirm: 'Вы уверены?',
    saved: 'Данные сохранены.',
    error: 'Ошибка: ',
    published: 'Опубликовано',
    hidden: 'Скрыто',
    books: 'Книги',
    hadiths: 'Хадисы',
    contents: 'Материалы',
    sections: 'Разделы',
    required: 'Это поле обязательно.',
    adminOnly: 'Доступно только администратору.',
    moveUp: 'Вверх',
    moveDown: 'Вниз',
    explanationHeading: 'Объяснение хадиса:',
    selectBook: 'Выберите сборник',
    exampleNumber: 'Например: 15',
    hadithTranslationPlaceholder: 'Перевод хадиса...',
    sectionName: 'Название раздела',
    sectionSlug: 'Slug / код раздела',
    sectionSlugExample: 'Например: new-section',
    bookExample: 'Сахих аль-Бухари',
    bookNameRequired: 'Введите название сборника.',
    sectionNameRequired: 'Введите название раздела.',
    hadithRequired: 'Номер хадиса и таджикский текст обязательны.',
    chooseHadithBook: 'Пожалуйста, выберите сборник хадисов.',
    contentRequired: 'Добавьте хотя бы один текст или ссылку на аудио/видео.',
    deleteSectionConfirm: 'Удалить раздел? Материалы внутри него не будут удалены.',
    sectionNotSaved: 'Этот раздел ещё не сохранён в таблице sections.',
    activeColumnMissing: 'В таблице sections не найден столбец is_active или is_visible.',
    reorderNeedsSaved: 'Для изменения порядка разделы должны быть сохранены в Supabase.',
    orderColumnMissing: 'Столбец sort_order не найден.',
    userNotFound: 'Пользователь не найден.',
    notAdmin: 'У этой учётной записи нет прав администратора.',
    supabaseMissing: 'Настройки Supabase не заданы в Vercel.',
    browserNoAudio: 'Ваш браузер не поддерживает аудио.',
    browserNoVideo: 'Ваш браузер не поддерживает видео.',
    textMissing: 'Текст не введён.',
    bannerTranslation: 'Передавайте от меня хотя бы один аят.',
    bannerSource: 'Сахих аль-Бухари · хадис № 3461',
    heroTitle: 'Мифтахул Хадис',
    heroDescription: 'Источник для изучения Корана, хадисов и других исламских наук.',
    copyright: 'Все права защищены.',
    adminDescription: 'Полное управление Miftahulhadis',
    loginDescription: 'Войдите в учётную запись администратора для управления приложением.',
    dailyExplanation: 'Объяснение хадиса:',
    hadithLabel: 'Хадис № '
  },

  ar: {
    admin: 'لوحة الإدارة',
    login: 'دخول',
    logout: 'خروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    home: 'الرئيسية',
    search: 'بحث',
    searchPlaceholder: 'اكتب كلمة أو عبارة...',
    daily: 'حديث اليوم',
    loading: 'جار التحميل...',
    noResults: 'لم يتم العثور على نتائج.',
    noHadiths: 'لم تتم إضافة أحاديث بعد.',
    noContent: 'لا توجد مواد في هذا القسم.',
    noBooks: 'لم تتم إضافة كتب الحديث بعد.',
    chooseBook: 'اختر الكتاب',
    back: 'رجوع',
    save: 'حفظ',
    cancel: 'إلغاء',
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    hide: 'إخفاء',
    show: 'إظهار',
    number: 'رقم الحديث',
    tajik: 'النص الطاجيكي',
    arabic: 'النص العربي',
    source: 'المصدر',
    explanationTg: 'الشرح بالطاجيكية',
    explanationAr: 'الشرح بالعربية',
    audio: 'رابط الصوت',
    video: 'رابط الفيديو',
    title: 'العنوان',
    section: 'القسم',
    book: 'كتاب الحديث',
    newHadith: 'إضافة حديث',
    editHadith: 'تعديل الحديث',
    newContent: 'إضافة مادة',
    editContent: 'تعديل المادة',
    newBook: 'إضافة كتاب',
    newSection: 'إضافة قسم',
    editSection: 'تعديل القسم',
    description: 'وصف القسم',
    icon: 'أيقونة القسم',
    confirm: 'هل أنت متأكد؟',
    saved: 'تم الحفظ.',
    error: 'خطأ: ',
    published: 'منشور',
    hidden: 'مخفي',
    books: 'الكتب',
    hadiths: 'الأحاديث',
    contents: 'المواد',
    sections: 'الأقسام',
    required: 'هذا الحقل مطلوب.',
    adminOnly: 'متاح للمسؤول فقط.',
    moveUp: 'للأعلى',
    moveDown: 'للأسفل',
    explanationHeading: 'شرح الحديث:',
    selectBook: 'اختر الكتاب',
    exampleNumber: 'مثال: 15',
    hadithTranslationPlaceholder: 'ترجمة الحديث...',
    sectionName: 'اسم القسم',
    sectionSlug: 'رمز القسم',
    sectionSlugExample: 'مثال: new-section',
    bookExample: 'صحيح البخاري',
    bookNameRequired: 'اكتب اسم الكتاب.',
    sectionNameRequired: 'أدخل اسم القسم.',
    hadithRequired: 'رقم الحديث والنص الطاجيكي مطلوبان.',
    chooseHadithBook: 'يرجى اختيار كتاب الحديث.',
    contentRequired: 'أدخل نصاً واحداً على الأقل أو رابطاً للصوت أو الفيديو.',
    deleteSectionConfirm: 'هل تريد حذف القسم؟ لن يتم حذف المواد الموجودة بداخله.',
    sectionNotSaved: 'هذا القسم غير محفوظ في جدول sections.',
    activeColumnMissing: 'لم يتم العثور على عمود is_active أو is_visible في جدول sections.',
    reorderNeedsSaved: 'يجب حفظ الأقسام في Supabase لتغيير ترتيبها.',
    orderColumnMissing: 'لم يتم العثور على عمود sort_order.',
    userNotFound: 'لم يتم العثور على المستخدم.',
    notAdmin: 'هذا الحساب لا يملك صلاحيات المسؤول.',
    supabaseMissing: 'لم يتم إعداد Supabase في Vercel.',
    browserNoAudio: 'متصفحك لا يدعم الصوت.',
    browserNoVideo: 'متصفحك لا يدعم الفيديو.',
    textMissing: 'لم يتم إدخال النص.',
    bannerTranslation: 'بلّغوا عني ولو آية.',
    bannerSource: 'صحيح البخاري · الحديث رقم 3461',
    heroTitle: 'مفتاح الحديث',
    heroDescription: 'مصدر لتعلم القرآن والحديث والعلوم الإسلامية الأخرى.',
    copyright: 'جميع الحقوق محفوظة.',
    adminDescription: 'الإدارة الكاملة لتطبيق Miftahulhadis',
    loginDescription: 'سجّل الدخول بحساب المسؤول لإدارة التطبيق.',
    dailyExplanation: 'شرح الحديث:',
    hadithLabel: 'الحديث رقم '
  }
}

const EMPTY_HADITH = {
  book_id: '',
  hadith_number: '',
  tajik_text: '',
  arabic_text: '',
  source_note: '',
  explanation_tg: '',
  explanation_ar: '',
  audio_url: '',
  video_url: ''
}

const EMPTY_CONTENT = {
  section_slug: 'salihin',
  title: '',
  tajik_text: '',
  arabic_text: '',
  explanation_tg: '',
  explanation_ar: '',
  source_note: '',
  audio_url: '',
  video_url: ''
}

const META_PREFIX = '__MIFTAH_META_V1__:'

function clean(value) {
  return String(value ?? '').trim()
}

function parseStoredNote(value) {
  const text = String(value || '')

  if (!text.startsWith(META_PREFIX)) {
    return { source: text, meta: {} }
  }

  try {
    const parsed = JSON.parse(text.slice(META_PREFIX.length))
    return {
      source: parsed.source || '',
      meta: parsed.meta || {}
    }
  } catch {
    return { source: text, meta: {} }
  }
}

function makeStoredNote(source, meta) {
  const hasMeta = Object.values(meta || {}).some(value => clean(value))

  if (!hasMeta) return clean(source) || null

  return META_PREFIX + JSON.stringify({
    source: clean(source),
    meta
  })
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zа-яё0-9]+/gi, '-')
    .replace(/^-|-$/g, '') || `section-${Date.now()}`
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function HighlightText({ text, query }) {
  const value = String(text ?? '')
  const words = clean(query).split(/\s+/).filter(Boolean)

  if (!words.length || !value) return <>{value}</>

  const expression = new RegExp(
    `(${words.map(escapeRegExp).join('|')})`,
    'gi'
  )

  return (
    <>
      {value.split(expression).map((part, index) => {
        const matched = words.some(
          word => part.toLowerCase() === word.toLowerCase()
        )

        return matched
          ? <mark className="highlight" key={index}>{part}</mark>
          : <React.Fragment key={index}>{part}</React.Fragment>
      })}
    </>
  )
}

function getSectionFields(row) {
  const keys = Object.keys(row || {})
  const find = candidates => candidates.find(key => keys.includes(key))

  return {
    id: find(['id']),
    slug: find(['slug', 'section_slug', 'code']),
    title: find(['title', 'name', 'section_name']),
    description: find(['description', 'details']),
    icon: find(['icon', 'emoji']),
    order: find(['sort_order', 'order_index', 'position']),
    active: find(['is_active', 'is_visible', 'is_published'])
  }
}

function normalizeSection(row, index) {
  const fields = getSectionFields(row)

  return {
    ...row,
    slug: row?.[fields.slug] || `section-${index + 1}`,
    title: row?.[fields.title] || row?.name || 'Бахш',
    description: row?.[fields.description] || '',
    icon: row?.[fields.icon] || '📚',
    sort_order: Number(row?.[fields.order] ?? index + 1),
    is_active: fields.active ? row?.[fields.active] !== false : true
  }
}

function App() {
  const [lang, setLang] = useState('tg')
  const [page, setPage] = useState('home')
  const [selectedSection, setSelectedSection] = useState(null)
  const [selectedBook, setSelectedBook] = useState(null)

  const [sections, setSections] = useState(DEFAULT_SECTIONS)
  const [sectionRows, setSectionRows] = useState([])
  const [books, setBooks] = useState([])
  const [hadithRows, setHadithRows] = useState([])
  const [contentRows, setContentRows] = useState([])
  const [dailyHadith, setDailyHadith] = useState(null)

  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState(null)

  const [admin, setAdmin] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [adminTab, setAdminTab] = useState('hadith')
  const [hadithForm, setHadithForm] = useState(EMPTY_HADITH)
  const [contentForm, setContentForm] = useState(EMPTY_CONTENT)
  const [bookForm, setBookForm] = useState({ name: '' })
  const [sectionForm, setSectionForm] = useState({
    slug: '',
    title: '',
    description: '',
    icon: '📚'
  })

  const [editingHadith, setEditingHadith] = useState(null)
  const [editingContent, setEditingContent] = useState(null)
  const [editingBook, setEditingBook] = useState(null)
  const [editingSection, setEditingSection] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [noticeType, setNoticeType] = useState('success')

  const t = LANG[lang] || LANG.tg
  const direction = lang === 'ar' ? 'rtl' : 'ltr'

  const notify = useCallback((message, type = 'success') => {
    setNotice(message)
    setNoticeType(type)
  }, [])

  const getBookName = useCallback(id => {
    return books.find(book => String(book.id) === String(id))?.name || ''
  }, [books])

  const sortByDate = rows => [...rows].sort((a, b) => {
    return new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
  })

  // Ҳар рӯзи UTC як ҳадиси нашршуда интихоб мешавад.
  const refreshDaily = useCallback(rows => {
    const published = rows
      .filter(item => item.is_published === true)
      .sort((a, b) => String(a.id).localeCompare(String(b.id)))

    if (!published.length) {
      setDailyHadith(null)
      return
    }

    const dayNumber = Math.floor(Date.now() / 86400000)
    const index = dayNumber % published.length

    setDailyHadith(published[index])
  }, [])

  // 8 китоби пешфарзро бе такрор месозад.
  // Китобҳои мавҷударо фаъол мекунад ва китобҳои навро танҳо дар ҳолати набудан илова мекунад.
  const ensureDefaultBooks = async existingBooks => {
    let result = [...existingBooks]

    for (const defaultBook of DEFAULT_BOOKS) {
      const existing = result.find(book =>
        clean(book.slug).toLowerCase() === defaultBook.slug.toLowerCase() ||
        clean(book.name).toLowerCase() === defaultBook.name.toLowerCase()
      )

      if (existing) {
        if (
          existing.is_active === false ||
          Number(existing.sort_order) !== defaultBook.sort_order
        ) {
          const { data, error } = await db
            .from('hadith_books')
            .update({
              is_active: true,
              sort_order: defaultBook.sort_order
            })
            .eq('id', existing.id)
            .select('*')
            .maybeSingle()

          if (error) throw error

          if (data) {
            result = result.map(book =>
              String(book.id) === String(existing.id) ? data : book
            )
          }
        }
      } else {
        const { data, error } = await db
          .from('hadith_books')
          .insert({
            name: defaultBook.name,
            slug: defaultBook.slug,
            sort_order: defaultBook.sort_order,
            is_active: true
          })
          .select('*')
          .single()

        if (error) throw error

        if (data) result.push(data)
      }
    }

    return result.sort(
      (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
    )
  }

  const loadPublicData = useCallback(async () => {
    if (!db) {
      setLoading(false)
      notify(t.supabaseMissing, 'error')
      return
    }

    setLoading(true)

    try {
      const [booksRes, hadithRes, contentRes, sectionsRes] = await Promise.all([
        db.from('hadith_books').select('*'),
        db.from('hadiths').select('*').eq('is_published', true),
        db.from('content_items').select('*').eq('is_published', true),
        db.from('sections').select('*')
      ])

      if (booksRes.error) throw booksRes.error
      if (hadithRes.error) throw hadithRes.error
      if (contentRes.error) throw contentRes.error

      const loadedBooks = (booksRes.data || [])
        .filter(item => item.is_active !== false)
        .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))

      const loadedHadith = sortByDate(hadithRes.data || [])
      const loadedContent = sortByDate(contentRes.data || [])

      setBooks(loadedBooks)
      setHadithRows(loadedHadith)
      setContentRows(loadedContent)
      refreshDaily(loadedHadith)

      if (!sectionsRes.error && sectionsRes.data?.length) {
        const normalized = sectionsRes.data
          .map(normalizeSection)
          .filter(item => item.is_active)
          .sort((a, b) => a.sort_order - b.sort_order)

        setSections(normalized.length ? normalized : DEFAULT_SECTIONS)
      } else {
        setSections(DEFAULT_SECTIONS)
      }
    } catch (error) {
      console.error('Public data error:', error)
      notify(t.error + (error.message || 'Хатои боркунӣ'), 'error')
    } finally {
      setLoading(false)
    }
  }, [notify, refreshDaily, t.error, t.supabaseMissing])

  const loadAdminData = useCallback(async () => {
    if (!db || !admin) return

    try {
      const [booksRes, hadithRes, contentRes, sectionsRes] = await Promise.all([
        db.from('hadith_books').select('*'),
        db.from('hadiths').select('*'),
        db.from('content_items').select('*'),
        db.from('sections').select('*')
      ])

      if (booksRes.error) throw booksRes.error
      if (hadithRes.error) throw hadithRes.error
      if (contentRes.error) throw contentRes.error

      // Аввал 8 китоби пешфарзро таъмин мекунем.
      const allBooks = await ensureDefaultBooks(booksRes.data || [])

      const loadedHadith = sortByDate(hadithRes.data || [])
      const loadedContent = sortByDate(contentRes.data || [])

      setBooks(allBooks)
      setHadithRows(loadedHadith)
      setContentRows(loadedContent)
      refreshDaily(loadedHadith)

      if (!sectionsRes.error) {
        setSectionRows(sectionsRes.data || [])

        if (sectionsRes.data?.length) {
          setSections(
            sectionsRes.data
              .map(normalizeSection)
              .sort((a, b) => a.sort_order - b.sort_order)
          )
        }
      }
    } catch (error) {
      console.error('Admin data error:', error)
      notify(t.error + (error.message || 'Хатои боркунӣ'), 'error')
    }
  }, [admin, notify, refreshDaily, t.error])

  useEffect(() => {
    loadPublicData()
  }, [loadPublicData])

  useEffect(() => {
    if (admin) loadAdminData()
  }, [admin, loadAdminData])

  useEffect(() => {
    if (!db) return

    let active = true

    db.auth.getSession().then(async ({ data, error }) => {
      if (error || !active) return

      const user = data?.session?.user
      if (!user) return

      const { data: profile, error: profileError } = await db
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (active && !profileError && profile?.role === 'admin') {
        setAdmin(true)
      }
    })

    const { data: listener } = db.auth.onAuthStateChange(() => {
      if (active) loadPublicData()
    })

    return () => {
      active = false
      listener?.subscription?.unsubscribe()
    }
  }, [loadPublicData])

  useEffect(() => {
    const timer = setInterval(() => refreshDaily(hadithRows), 60000)
    return () => clearInterval(timer)
  }, [hadithRows, refreshDaily])

  const openSection = section => {
    setSelectedSection(section)
    setSelectedBook(null)
    setPage('section')
    setSearch('')
    setSearchResults(null)
  }

  const openBook = book => {
    setSelectedBook(book)
  }

  const goBackToBooks = () => {
    setSelectedBook(null)
  }

  const goHome = () => {
    setPage('home')
    setSelectedSection(null)
    setSelectedBook(null)
    setSearch('')
    setSearchResults(null)
  }

  const performSearch = () => {
    const query = clean(search)

    if (!query) {
      setSearchResults(null)
      return
    }

    const words = query.toLocaleLowerCase().split(/\s+/).filter(Boolean)

    const matches = fields => {
      const text = fields.map(value => String(value ?? '')).join(' ')
        .toLocaleLowerCase()

      return words.some(word => text.includes(word))
    }

    const hadithMatches = hadithRows.filter(item => {
      const stored = parseStoredNote(item.source_note)

      return matches([
        item.arabic_text,
        item.tajik_text,
        item.russian_text,
        item.hadith_number,
        getBookName(item.book_id),
        stored.source,
        item.commentary,
        stored.meta.explanation_tg,
        stored.meta.explanation_ar
      ])
    }).map(item => ({ ...item, resultType: 'hadith' }))

    const contentMatches = contentRows.filter(item => {
      const stored = parseStoredNote(item.source_note)

      return matches([
        item.title,
        item.arabic_text,
        item.tajik_text,
        item.russian_text,
        item.content_text,
        stored.source,
        stored.meta.explanation_tg,
        stored.meta.explanation_ar
      ])
    }).map(item => ({ ...item, resultType: 'content' }))

    setSearchResults([...hadithMatches, ...contentMatches])
    setPage('search')
  }

  const resetHadithForm = () => {
    setHadithForm(EMPTY_HADITH)
    setEditingHadith(null)
  }

  const resetContentForm = () => {
    setContentForm(EMPTY_CONTENT)
    setEditingContent(null)
  }

  const resetBookForm = () => {
    setBookForm({ name: '' })
    setEditingBook(null)
  }

  const resetSectionForm = () => {
    setSectionForm({ slug: '', title: '', description: '', icon: '📚' })
    setEditingSection(null)
  }

  const saveHadith = async event => {
    event.preventDefault()

    if (!db || !admin || saving) return

    if (!clean(hadithForm.hadith_number) || !clean(hadithForm.tajik_text)) {
      notify(t.hadithRequired, 'error')
      return
    }

    if (!hadithForm.book_id) {
      notify(t.chooseHadithBook, 'error')
      return
    }

    setSaving(true)

    try {
      const meta = {
        explanation_tg: clean(hadithForm.explanation_tg),
        explanation_ar: clean(hadithForm.explanation_ar),
        audio_url: clean(hadithForm.audio_url),
        video_url: clean(hadithForm.video_url)
      }

      const payload = {
        book_id: hadithForm.book_id,
        hadith_number: clean(hadithForm.hadith_number),
        tajik_text: clean(hadithForm.tajik_text),
        arabic_text: clean(hadithForm.arabic_text) || null,
        source_note: makeStoredNote(hadithForm.source_note, meta),
        commentary: clean(hadithForm.explanation_tg) || null,
        is_published: true,
        updated_at: new Date().toISOString()
      }

      const result = editingHadith
        ? await db.from('hadiths').update(payload).eq('id', editingHadith)
        : await db.from('hadiths').insert(payload)

      if (result.error) throw result.error

      resetHadithForm()
      await loadAdminData()
      await loadPublicData()
      notify(t.saved)
    } catch (error) {
      console.error(error)
      notify(t.error + error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const startEditHadith = item => {
    const stored = parseStoredNote(item.source_note)

    setEditingHadith(item.id)
    setHadithForm({
      book_id: item.book_id || '',
      hadith_number: item.hadith_number ?? '',
      tajik_text: item.tajik_text || '',
      arabic_text: item.arabic_text || '',
      source_note: stored.source,
      explanation_tg: item.commentary || stored.meta.explanation_tg || '',
      explanation_ar: stored.meta.explanation_ar || '',
      audio_url: stored.meta.audio_url || '',
      video_url: stored.meta.video_url || ''
    })

    setAdminTab('hadith')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleHadith = async item => {
    if (!db || !admin) return

    try {
      const { error } = await db.from('hadiths')
        .update({
          is_published: item.is_published === false,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)

      if (error) throw error

      await loadAdminData()
      await loadPublicData()
      notify(t.saved)
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  const deleteHadith = async item => {
    if (!db || !admin || !window.confirm(t.confirm)) return

    try {
      const { error } = await db.from('hadiths').delete().eq('id', item.id)

      if (error) throw error

      await loadAdminData()
      await loadPublicData()
      notify(t.saved)
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  const saveBook = async event => {
    event.preventDefault()

    if (!db || !admin || saving) return

    const name = clean(bookForm.name)

    if (!name) {
      notify(t.bookNameRequired, 'error')
      return
    }

    setSaving(true)

    try {
      const result = editingBook
        ? await db.from('hadith_books').update({ name }).eq('id', editingBook)
        : await db.from('hadith_books').insert({
            name,
            slug: slugify(name),
            is_active: true,
            sort_order: books.length + 1
          })

      if (result.error) throw result.error

      resetBookForm()
      await loadAdminData()
      await loadPublicData()
      notify(t.saved)
    } catch (error) {
      notify(t.error + error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const toggleBook = async book => {
    if (!db || !admin) return

    try {
      const { error } = await db.from('hadith_books')
        .update({ is_active: book.is_active === false })
        .eq('id', book.id)

      if (error) throw error

      await loadAdminData()
      await loadPublicData()
      notify(t.saved)
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  const saveContent = async event => {
    event.preventDefault()

    if (!db || !admin || saving) return

    if (
      !clean(contentForm.title) &&
      !clean(contentForm.tajik_text) &&
      !clean(contentForm.arabic_text) &&
      !clean(contentForm.audio_url) &&
      !clean(contentForm.video_url)
    ) {
      notify(t.contentRequired, 'error')
      return
    }

    setSaving(true)

    try {
      const meta = {
        explanation_tg: clean(contentForm.explanation_tg),
        explanation_ar: clean(contentForm.explanation_ar),
        audio_url: clean(contentForm.audio_url),
        video_url: clean(contentForm.video_url)
      }

      const tajik = clean(contentForm.tajik_text)
      const arabic = clean(contentForm.arabic_text)

      const payload = {
        section_slug: contentForm.section_slug,
        title: clean(contentForm.title) || null,
        tajik_text: tajik || null,
        arabic_text: arabic || null,
        content_text: tajik || arabic || null,
        source_note: makeStoredNote(contentForm.source_note, meta),
        is_published: true,
        updated_at: new Date().toISOString()
      }

      const result = editingContent
        ? await db.from('content_items').update(payload).eq('id', editingContent)
        : await db.from('content_items').insert(payload)

      if (result.error) throw result.error

      resetContentForm()
      await loadAdminData()
      await loadPublicData()
      notify(t.saved)
    } catch (error) {
      console.error(error)
      notify(t.error + error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const startEditContent = item => {
    const stored = parseStoredNote(item.source_note)

    setEditingContent(item.id)
    setContentForm({
      section_slug: item.section_slug || 'salihin',
      title: item.title || '',
      tajik_text: item.tajik_text || item.content_text || '',
      arabic_text: item.arabic_text || '',
      source_note: stored.source,
      explanation_tg: stored.meta.explanation_tg || '',
      explanation_ar: stored.meta.explanation_ar || '',
      audio_url: stored.meta.audio_url || '',
      video_url: stored.meta.video_url || ''
    })

    setAdminTab('content')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleContent = async item => {
    if (!db || !admin) return

    try {
      const { error } = await db.from('content_items')
        .update({
          is_published: item.is_published === false,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)

      if (error) throw error

      await loadAdminData()
      await loadPublicData()
      notify(t.saved)
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  const deleteContent = async item => {
    if (!db || !admin || !window.confirm(t.confirm)) return

    try {
      const { error } = await db.from('content_items')
        .delete().eq('id', item.id)

      if (error) throw error

      await loadAdminData()
      await loadPublicData()
      notify(t.saved)
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  const saveSection = async event => {
    event.preventDefault()

    if (!db || !admin || saving) return

    const title = clean(sectionForm.title)

    if (!title) {
      notify(t.sectionNameRequired, 'error')
      return
    }

    setSaving(true)

    try {
      const oldRow = editingSection
        ? sectionRows.find(row => String(row.id) === String(editingSection))
        : null

      const fields = getSectionFields(oldRow || sectionRows[0] || {})
      const slug = editingSection
        ? (oldRow?.[fields.slug] || sectionForm.slug || slugify(title))
        : slugify(sectionForm.slug || title)

      const payload = {}

      const setField = (fieldName, fallback, value) => {
        if (fieldName) payload[fieldName] = value
        else payload[fallback] = value
      }

      setField(fields.slug, 'slug', slug)
      setField(fields.title, 'title', title)
      setField(fields.description, 'description', clean(sectionForm.description))
      setField(fields.icon, 'icon', clean(sectionForm.icon) || '📚')
      setField(fields.order, 'sort_order', editingSection
        ? Number(oldRow?.[fields.order] || 1)
        : sections.length + 1)
      setField(fields.active, 'is_active', true)

      const result = editingSection
        ? await db.from('sections').update(payload).eq('id', editingSection)
        : await db.from('sections').insert(payload)

      if (result.error) throw result.error

      resetSectionForm()
      await loadAdminData()
      await loadPublicData()
      notify(t.saved)
    } catch (error) {
      notify(
        'Сабти бахш нашуд. Сохтори ҷадвали sections метавонад фарқ кунад: ' + error.message,
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const startEditSection = section => {
    setEditingSection(section.id)
    setSectionForm({
      slug: section.slug || '',
      title: section.title || '',
      description: section.description || '',
      icon: section.icon || '📚'
    })
    setAdminTab('sections')
  }

  const toggleSection = async section => {
    if (!db || !admin) return

    const row = sectionRows.find(item => String(item.id) === String(section.id))

    if (!row) {
      notify(t.sectionNotSaved, 'error')
      return
    }

    const fields = getSectionFields(row)

    if (!fields.active) {
      notify(t.activeColumnMissing, 'error')
      return
    }

    try {
      const { error } = await db.from('sections')
        .update({ [fields.active]: row[fields.active] === false })
        .eq('id', row.id)

      if (error) throw error

      await loadAdminData()
      await loadPublicData()
      notify(t.saved)
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  const moveSection = async (section, directionValue) => {
    if (!db || !admin) return

    const ordered = [...sections].sort((a, b) => a.sort_order - b.sort_order)
    const index = ordered.findIndex(item => item.slug === section.slug)
    const nextIndex = index + directionValue

    if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) return

    const current = ordered[index]
    const next = ordered[nextIndex]
    const currentRow = sectionRows.find(row => String(row.id) === String(current.id))
    const nextRow = sectionRows.find(row => String(row.id) === String(next.id))

    if (!currentRow || !nextRow) {
      notify(t.reorderNeedsSaved, 'error')
      return
    }

    const currentField = getSectionFields(currentRow).order
    const nextField = getSectionFields(nextRow).order

    if (!currentField || !nextField) {
      notify(t.orderColumnMissing, 'error')
      return
    }

    try {
      const first = await db.from('sections')
        .update({ [currentField]: next.sort_order })
        .eq('id', current.id)

      if (first.error) throw first.error

      const second = await db.from('sections')
        .update({ [nextField]: current.sort_order })
        .eq('id', next.id)

      if (second.error) throw second.error

      await loadAdminData()
      await loadPublicData()
      notify(t.saved)
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  const deleteSection = async section => {
    if (!db || !admin || !window.confirm(t.deleteSectionConfirm)) return

    const row = sectionRows.find(item => String(item.id) === String(section.id))

    if (!row) {
      notify(t.sectionNotSaved, 'error')
      return
    }

    try {
      const { error } = await db.from('sections').delete().eq('id', row.id)

      if (error) throw error

      await loadAdminData()
      await loadPublicData()
      notify(t.saved)
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  const login = async event => {
    event.preventDefault()

    if (!db) return

    try {
      const { data, error } = await db.auth.signInWithPassword({
        email: clean(email),
        password
      })

      if (error) throw error

      const userId = data?.user?.id

      if (!userId) throw new Error(t.userNotFound)

      const { data: profile, error: profileError } = await db
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) throw profileError

      if (profile?.role !== 'admin') {
        await db.auth.signOut()
        throw new Error(t.notAdmin)
      }

      setAdmin(true)
      setLoginOpen(false)
      setPage('admin')
      notify(t.saved)
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  const logout = async () => {
    if (db) await db.auth.signOut()

    setAdmin(false)
    setPage('home')
    setSelectedBook(null)
    notify(t.logout)
  }

  const publicContent = useMemo(() => {
    if (!selectedSection) return []

    if (selectedSection.slug === 'hadith') {
      if (!selectedBook) return []

      return hadithRows
        .filter(item => String(item.book_id) === String(selectedBook.id))
        .map(item => ({ ...item, resultType: 'hadith' }))
    }

    return contentRows
      .filter(item => item.section_slug === selectedSection.slug)
      .map(item => ({ ...item, resultType: 'content' }))
  }, [selectedSection, selectedBook, hadithRows, contentRows])

  const renderMedia = item => {
    const stored = parseStoredNote(item.source_note)
    const audio = stored.meta.audio_url
    const video = stored.meta.video_url

    return (
      <>
        {audio && (
          <div className="media-player">
            <audio controls preload="none" src={audio}>
              {t.browserNoAudio}
            </audio>
          </div>
        )}

        {video && (
          <div className="media-player">
            <video controls preload="metadata" src={video}>
              {t.browserNoVideo}
            </video>
          </div>
        )}
      </>
    )
  }

  const renderHadithCard = (item, query = '') => {
    const stored = parseStoredNote(item.source_note)
    const commentary = item.commentary || stored.meta.explanation_tg

    return (
      <article className="public-item" key={`hadith-${item.id}`}>
        <div className="item-number">
          {getBookName(item.book_id)}
          {item.hadith_number ? ` · ${t.hadithLabel}${item.hadith_number}` : ''}
        </div>

        {item.arabic_text && (
          <p className="arabic-text">
            <HighlightText text={item.arabic_text} query={query} />
          </p>
        )}

        {item.tajik_text && (
          <p>
            <HighlightText text={item.tajik_text} query={query} />
          </p>
        )}

        {commentary && (
          <div className="explanation">
            <strong>{t.explanationHeading}</strong>
            <p><HighlightText text={commentary} query={query} /></p>
          </div>
        )}

        {stored.meta.explanation_ar && (
          <div className="explanation" dir="rtl">
            <strong>شرح الحديث:</strong>
            <p className="arabic-text">
              <HighlightText text={stored.meta.explanation_ar} query={query} />
            </p>
          </div>
        )}

        {renderMedia(item)}

        {stored.source && (
          <div className="source-note">
            <HighlightText text={stored.source} query={query} />
          </div>
        )}
      </article>
    )
  }

  const renderContentCard = (item, query = '') => {
    const stored = parseStoredNote(item.source_note)

    return (
      <article className="public-item" key={`content-${item.id}`}>
        {item.title && (
          <h3><HighlightText text={item.title} query={query} /></h3>
        )}

        {item.arabic_text && (
          <p className="arabic-text">
            <HighlightText text={item.arabic_text} query={query} />
          </p>
        )}

        {(item.tajik_text || item.content_text) && (
          <p>
            <HighlightText
              text={item.tajik_text || item.content_text}
              query={query}
            />
          </p>
        )}

        {stored.meta.explanation_tg && (
          <div className="explanation">
            <strong>{lang === 'ru' ? 'Пояснение:' : lang === 'ar' ? 'الشرح:' : 'Шарҳ:'}</strong>
            <p><HighlightText text={stored.meta.explanation_tg} query={query} /></p>
          </div>
        )}

        {stored.meta.explanation_ar && (
          <div className="explanation" dir="rtl">
            <strong>الشرح:</strong>
            <p className="arabic-text">
              <HighlightText text={stored.meta.explanation_ar} query={query} />
            </p>
          </div>
        )}

        {renderMedia(item)}

        {stored.source && (
          <div className="source-note">
            <HighlightText text={stored.source} query={query} />
          </div>
        )}
      </article>
    )
  }

  const field = (label, value, onChange, placeholder = '', required = false) => (
    <div className="form-group">
      <label>{label}{required ? ' *' : ''}</label>
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  )

  const textarea = (label, value, onChange, placeholder = '', rtl = false) => (
    <div className="form-group">
      <label>{label}</label>
      <textarea
        dir={rtl ? 'rtl' : 'auto'}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  )

  const renderAdminHadith = () => (
    <>
      <form className="admin-form" onSubmit={saveHadith}>
        <h3>{editingHadith ? t.editHadith : t.newHadith}</h3>

        <div className="form-group">
          <label>{t.book} *</label>
          <select
            value={hadithForm.book_id}
            onChange={event => setHadithForm({ ...hadithForm, book_id: event.target.value })}
            required
          >
            <option value="">{t.selectBook}</option>
            {books.map(book => (
              <option value={book.id} key={book.id}>{book.name}</option>
            ))}
          </select>
        </div>

        {field(t.number, hadithForm.hadith_number,
          value => setHadithForm({ ...hadithForm, hadith_number: value }),
          t.exampleNumber, true)}

        {textarea(t.tajik, hadithForm.tajik_text,
          value => setHadithForm({ ...hadithForm, tajik_text: value }),
          t.hadithTranslationPlaceholder)}

        {textarea(t.arabic, hadithForm.arabic_text,
          value => setHadithForm({ ...hadithForm, arabic_text: value }),
          'النص العربي...', true)}

        {field(t.source, hadithForm.source_note,
          value => setHadithForm({ ...hadithForm, source_note: value }))}

        {textarea(t.explanationTg, hadithForm.explanation_tg,
          value => setHadithForm({ ...hadithForm, explanation_tg: value }))}

        {textarea(t.explanationAr, hadithForm.explanation_ar,
          value => setHadithForm({ ...hadithForm, explanation_ar: value }),
          '', true)}

        {field(t.audio, hadithForm.audio_url,
          value => setHadithForm({ ...hadithForm, audio_url: value }),
          'https://...')}

        {field(t.video, hadithForm.video_url,
          value => setHadithForm({ ...hadithForm, video_url: value }),
          'https://...')}

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? t.loading : t.save}
          </button>

          {editingHadith && (
            <button className="secondary-button" type="button" onClick={resetHadithForm}>
              {t.cancel}
            </button>
          )}
        </div>
      </form>

      <div className="admin-list">
        {hadithRows.map(item => (
          <div className="admin-item" key={item.id}>
            <h4>{getBookName(item.book_id)} · № {item.hadith_number}</h4>
            <p>{item.tajik_text || item.arabic_text || t.textMissing}</p>

            <div className="admin-item-status">
              {item.is_published === false ? t.hidden : t.published}
            </div>

            <div className="admin-item-actions">
              <button className="secondary-button" onClick={() => startEditHadith(item)}>
                {t.edit}
              </button>

              <button className="secondary-button" onClick={() => toggleHadith(item)}>
                {item.is_published === false ? t.show : t.hide}
              </button>

              <button className="danger-button" onClick={() => deleteHadith(item)}>
                {t.delete}
              </button>
            </div>
          </div>
        ))}

        {!hadithRows.length && <div className="empty-state">{t.noHadiths}</div>}
      </div>
    </>
  )

  const renderAdminBooks = () => (
    <>
      <form className="admin-form" onSubmit={saveBook}>
        <h3>{editingBook ? t.edit : t.newBook}</h3>

        {field(t.title, bookForm.name, value => setBookForm({ name: value }), t.bookExample, true)}

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={saving}>
            {t.save}
          </button>

          {editingBook && (
            <button className="secondary-button" type="button" onClick={resetBookForm}>
              {t.cancel}
            </button>
          )}
        </div>
      </form>

      <div className="admin-list">
        {books.map(book => (
          <div className="admin-item" key={book.id}>
            <h4>{book.name}</h4>

            <div className="admin-item-actions">
              <button className="secondary-button" onClick={() => {
                setEditingBook(book.id)
                setBookForm({ name: book.name || '' })
              }}>
                {t.edit}
              </button>

              <button className="secondary-button" onClick={() => toggleBook(book)}>
                {book.is_active === false ? t.show : t.hide}
              </button>
            </div>
          </div>
        ))}

        {!books.length && <div className="empty-state">{t.noBooks}</div>}
      </div>
    </>
  )

  const renderAdminContent = () => (
    <>
      <form className="admin-form" onSubmit={saveContent}>
        <h3>{editingContent ? t.editContent : t.newContent}</h3>

        <div className="form-group">
          <label>{t.section} *</label>
          <select
            value={contentForm.section_slug}
            onChange={event => setContentForm({ ...contentForm, section_slug: event.target.value })}
            required
          >
            {sections.filter(section => section.slug !== 'hadith').map(section => (
              <option value={section.slug} key={section.slug}>{section.title}</option>
            ))}
          </select>
        </div>

        {field(t.title, contentForm.title,
          value => setContentForm({ ...contentForm, title: value }))}

        {textarea(t.tajik, contentForm.tajik_text,
          value => setContentForm({ ...contentForm, tajik_text: value }))}

        {textarea(t.arabic, contentForm.arabic_text,
          value => setContentForm({ ...contentForm, arabic_text: value }), '', true)}

        {textarea(t.explanationTg, contentForm.explanation_tg,
          value => setContentForm({ ...contentForm, explanation_tg: value }))}

        {textarea(t.explanationAr, contentForm.explanation_ar,
          value => setContentForm({ ...contentForm, explanation_ar: value }), '', true)}

        {field(t.source, contentForm.source_note,
          value => setContentForm({ ...contentForm, source_note: value }))}

        {field(t.audio, contentForm.audio_url,
          value => setContentForm({ ...contentForm, audio_url: value }), 'https://...')}

        {field(t.video, contentForm.video_url,
          value => setContentForm({ ...contentForm, video_url: value }), 'https://...')}

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? t.loading : t.save}
          </button>

          {editingContent && (
            <button className="secondary-button" type="button" onClick={resetContentForm}>
              {t.cancel}
            </button>
          )}
        </div>
      </form>

      <div className="admin-list">
        {contentRows.map(item => (
          <div className="admin-item" key={item.id}>
            <h4>{item.title || item.section_slug}</h4>
            <p>{item.tajik_text || item.content_text || item.arabic_text || ''}</p>

            <div className="admin-item-status">
              {item.section_slug} · {item.is_published === false ? t.hidden : t.published}
            </div>

            <div className="admin-item-actions">
              <button className="secondary-button" onClick={() => startEditContent(item)}>
                {t.edit}
              </button>

              <button className="secondary-button" onClick={() => toggleContent(item)}>
                {item.is_published === false ? t.show : t.hide}
              </button>

              <button className="danger-button" onClick={() => deleteContent(item)}>
                {t.delete}
              </button>
            </div>
          </div>
        ))}

        {!contentRows.length && <div className="empty-state">{t.noContent}</div>}
      </div>
    </>
  )

  const renderAdminSections = () => (
    <>
      <form className="admin-form" onSubmit={saveSection}>
        <h3>{editingSection ? t.editSection : t.newSection}</h3>

        {field(t.title, sectionForm.title,
          value => setSectionForm({ ...sectionForm, title: value }),
          t.sectionName, true)}

        {field(t.sectionSlug, sectionForm.slug,
          value => setSectionForm({ ...sectionForm, slug: value }),
          t.sectionSlugExample)}

        {field(t.icon, sectionForm.icon,
          value => setSectionForm({ ...sectionForm, icon: value }), '📚')}

        {/* Хатои синтаксис дар ҳамин қисми textarea ислоҳ шуд */}
        {textarea(
          t.description,
          sectionForm.description,
          value => setSectionForm({ ...sectionForm, description: value })
        )}

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? t.loading : t.save}
          </button>

          {editingSection && (
            <button className="secondary-button" type="button" onClick={resetSectionForm}>
              {t.cancel}
            </button>
          )}
        </div>
      </form>

      <div className="admin-list">
        {[...sections].sort((a, b) => a.sort_order - b.sort_order).map((section, index) => (
          <div className="admin-item" key={section.slug}>
            <h4>{section.icon} {section.title}</h4>
            <p>{section.description}</p>

            <div className="admin-item-actions">
              <button className="secondary-button" onClick={() => moveSection(section, -1)} disabled={index === 0}>
                ↑ {t.moveUp}
              </button>

              <button className="secondary-button" onClick={() => moveSection(section, 1)} disabled={index === sections.length - 1}>
                ↓ {t.moveDown}
              </button>

              <button className="secondary-button" onClick={() => startEditSection(section)}>
                {t.edit}
              </button>

              <button className="secondary-button" onClick={() => toggleSection(section)}>
                {t.hide}
              </button>

              <button className="danger-button" onClick={() => deleteSection(section)}>
                {t.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )

  if (loading) {
    return (
      <div className="app theme-green" dir={direction}>
        <div className="loading">{t.loading}</div>
      </div>
    )
  }

  return (
    <div className="app theme-green" dir={direction}>
      <header className="header">
        <button className="brand-button" onClick={goHome}>
          <span className="header-title">𝑴𝒊𝒇𝒕𝒂𝒉𝒖𝒍𝒉𝒂𝒅𝒊𝒔</span>
          <span className="header-subtitle">Мифтаҳул Ҳадис</span>
        </button>

        <div className="header-controls">
          <select
            className="language-selector"
            value={lang}
            onChange={event => setLang(event.target.value)}
            aria-label="Language"
          >
            <option value="tg">Тоҷикӣ</option>
            <option value="ru">Русский</option>
            <option value="ar">العربية</option>
          </select>

          {admin ? (
            <>
              <button className="header-action" onClick={() => setPage('admin')}>
                {t.admin}
              </button>

              <button className="header-action" onClick={logout}>
                {t.logout}
              </button>
            </>
          ) : (
            <button className="header-action" onClick={() => setLoginOpen(true)}>
              {t.admin}
            </button>
          )}
        </div>
      </header>

      {notice && (
        <div className={`notice ${noticeType === 'error' ? 'error' : ''}`}>
          <span>{notice}</span>
          <button className="notice-close" onClick={() => setNotice('')}>×</button>
        </div>
      )}

      {page !== 'admin' && (
        <main className="main-content">
          <section className="miftah-banner">
            <h1 className="miftah-banner-title">𝑴𝒊𝒇𝒕𝒂𝒉𝒖𝒍𝒉𝒂𝒅𝒊𝒔</h1>
            <p className="miftah-banner-arabic">بَلِّغُوا عَنِّي وَلَوْ آيَةً</p>
            <p className="miftah-banner-translation">{t.bannerTranslation}</p>
            <p className="miftah-banner-subtitle">{t.bannerSource}</p>
          </section>

          {dailyHadith && (
            <section className="daily-card">
              <div className="daily-heading">
                <span>🌙</span>
                <h2>{t.daily}</h2>
              </div>

              {dailyHadith.arabic_text && (
                <p className="arabic-text">{dailyHadith.arabic_text}</p>
              )}

              <p>{dailyHadith.tajik_text}</p>

              {(dailyHadith.commentary || parseStoredNote(dailyHadith.source_note).meta.explanation_tg) && (
                <div className="explanation">
                  <strong>{t.dailyExplanation}</strong>
                  <p>
                    {dailyHadith.commentary ||
                      parseStoredNote(dailyHadith.source_note).meta.explanation_tg}
                  </p>
                </div>
              )}

              <div className="source-note">
                {getBookName(dailyHadith.book_id)}
                {dailyHadith.hadith_number
                  ? ` · ${t.hadithLabel}${dailyHadith.hadith_number}`
                  : ''}
              </div>
            </section>
          )}

          <div className="search-box">
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') performSearch()
              }}
              placeholder={t.searchPlaceholder}
            />

            <button className="primary-button" onClick={performSearch}>
              <span>⌕</span> {t.search}
            </button>
          </div>

          {page === 'home' && (
            <>
              <section className="hero">
                <h2>{t.heroTitle}</h2>
                <p>{t.heroDescription}</p>
              </section>

              <div className="menu">
                {sections.filter(section => section.is_active !== false).map(section => (
                  <button
                    className="menu-card"
                    key={section.slug}
                    onClick={() => openSection(section)}
                  >
                    <span className="menu-card-icon">{section.icon}</span>

                    <span>
                      <h3>{section.title}</h3>
                      <p>{section.description}</p>
                    </span>

                    <span className="menu-arrow">‹</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {page === 'section' && selectedSection && (
            <section className="content-page">
              <button className="secondary-button back-button" onClick={goHome}>
                ← {t.back}
              </button>

              <div className="section-intro">
                <h2>{selectedSection.icon} {selectedSection.title}</h2>
                <p>{selectedSection.description}</p>
              </div>

              {selectedSection.slug === 'hadith' && !selectedBook ? (
                <div className="menu">
                  {books
                    .filter(book => book.is_active !== false)
                    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
                    .map(book => (
                      <button
                        className="menu-card"
                        key={book.id}
                        onClick={() => openBook(book)}
                      >
                        <span className="menu-card-icon">📚</span>

                        <span>
                          <h3>{book.name}</h3>
                          <p>
                            {lang === 'ru'
                              ? 'Открыть хадисы этого сборника'
                              : lang === 'ar'
                                ? 'عرض أحاديث هذا الكتاب'
                                : 'Дидани ҳадисҳои ин китоб'}
                          </p>
                        </span>

                        <span className="menu-arrow">‹</span>
                      </button>
                    ))}

                  {!books.some(book => book.is_active !== false) && (
                    <div className="empty-state">{t.noBooks}</div>
                  )}
                </div>
              ) : (
                <>
                  {selectedSection.slug === 'hadith' && selectedBook && (
                    <div className="section-intro">
                      <button className="secondary-button back-button" onClick={goBackToBooks}>
                        ← {t.back}
                      </button>
                      <h3>📚 {selectedBook.name}</h3>
                    </div>
                  )}

                  <div className="public-list">
                    {publicContent.length ? (
                      publicContent.map(item =>
                        item.resultType === 'hadith'
                          ? renderHadithCard(item)
                          : renderContentCard(item)
                      )
                    ) : (
                      <div className="empty-state">
                        {selectedSection.slug === 'hadith' ? t.noHadiths : t.noContent}
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          )}

          {page === 'search' && (
            <section className="content-page">
              <button className="secondary-button back-button" onClick={goHome}>
                ← {t.back}
              </button>

              <div className="section-intro">
                <h2>{t.search}</h2>
                <p>{search}</p>
              </div>

              <div className="public-list">
                {searchResults?.length ? (
                  searchResults.map(item =>
                    item.resultType === 'hadith'
                      ? renderHadithCard(item, search)
                      : renderContentCard(item, search)
                  )
                ) : (
                  <div className="empty-state">{t.noResults}</div>
                )}
              </div>
            </section>
          )}

          <footer className="footer">
            <strong>𝑴𝒊𝒇𝒕𝒂𝒉𝒖𝒍𝒉𝒂𝒅𝒊𝒔</strong>
            <p>© {new Date().getFullYear()} · {t.copyright}</p>
          </footer>
        </main>
      )}

      {page === 'admin' && (
        <main className="admin-page">
          {!admin ? (
            <div className="empty-state">{t.adminOnly}</div>
          ) : (
            <>
              <div className="admin-header">
                <div>
                  <h2>{t.admin}</h2>
                  <p>{t.adminDescription}</p>
                </div>

                <button className="secondary-button" onClick={goHome}>
                  ← {t.back}
                </button>
              </div>

              <div className="admin-tabs">
                <button className={adminTab === 'hadith' ? 'active' : ''} onClick={() => setAdminTab('hadith')}>
                  📚 {t.hadiths}
                </button>

                <button className={adminTab === 'books' ? 'active' : ''} onClick={() => setAdminTab('books')}>
                  📖 {t.books}
                </button>

                <button className={adminTab === 'content' ? 'active' : ''} onClick={() => setAdminTab('content')}>
                  📝 {t.contents}
                </button>

                <button className={adminTab === 'sections' ? 'active' : ''} onClick={() => setAdminTab('sections')}>
                  ⚙️ {t.sections}
                </button>
              </div>

              {adminTab === 'hadith' && renderAdminHadith()}
              {adminTab === 'books' && renderAdminBooks()}
              {adminTab === 'content' && renderAdminContent()}
              {adminTab === 'sections' && renderAdminSections()}
            </>
          )}
        </main>
      )}

      {loginOpen && (
        <div className="modal-overlay" onClick={() => setLoginOpen(false)}>
          <div className="login-page" onClick={event => event.stopPropagation()}>
            <form className="login-card" onSubmit={login}>
              <button type="button" className="modal-close" onClick={() => setLoginOpen(false)}>
                ×
              </button>

              <h2>{t.login}</h2>
              <p>{t.loginDescription}</p>

              <div className="form-group">
                <label>{t.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.password}</label>
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  required
                />
              </div>

              <button className="primary-button" type="submit">
                {t.login}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App