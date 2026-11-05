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
  { slug: 'duas', title: 'Дуоҳо', icon: '🤲', description: 'Дуоҳои Қуръонӣ ва набавӣ', sort_order: 4, is_active: true },
  { slug: 'adhkar', title: 'Азкор', icon: '📿', description: 'Азкори саҳару шом', sort_order: 5, is_active: true },
  { slug: 'sunnah', title: 'Суннатҳо', icon: '🌿', description: 'Суннатҳои Расулуллоҳ ﷺ', sort_order: 6, is_active: true },
  { slug: 'prophets', title: 'Қиссаи Паёмбарон عَلَيْهِمُ السَّلَامُ', icon: '🕌', description: 'Қиссаҳои паёмбарон', sort_order: 7, is_active: true },
  { slug: 'seerah', title: 'Сирати Расулуллоҳ ﷺ', icon: '🌙', description: 'Зиндагии Расулуллоҳ ﷺ', sort_order: 8, is_active: true },
  { slug: 'companions', title: 'Сирати саҳоба رضي الله عنهم', icon: '⭐', description: 'Зиндагии саҳоба', sort_order: 9, is_active: true },
  { slug: 'lessons', title: 'Дарсҳои Исломӣ', icon: '🎓', description: 'Дарсҳои фоидабахши исломӣ', sort_order: 10, is_active: true },
  { slug: 'questions', title: 'Саволҳои Исломӣ', icon: '❔', description: 'Саволу ҷавобҳои исломӣ', sort_order: 11, is_active: true }
]

const SECTION_TRANSLATIONS = {
  quran: {
    ru: ['Священный Коран', 'Суры и аяты Священного Корана'],
    ar: ['القرآن الكريم', 'سور وآيات القرآن الكريم']
  },
  hadith: {
    ru: ['Хадисы', 'Хадисы Посланника Аллаха ﷺ'],
    ar: ['الأحاديث', 'أحاديث رسول الله ﷺ']
  },
  salihin: {
    ru: ['Слова праведников', 'Изречения учёных и праведных людей'],
    ar: ['أقوال الصالحين', 'أقوال العلماء والصالحين']
  },
  duas: {
    ru: ['Дуа', 'Дуа из Корана и Сунны'],
    ar: ['الأدعية', 'أدعية من القرآن والسنة']
  },
  adhkar: {
    ru: ['Азкары', 'Утренние и вечерние поминания'],
    ar: ['الأذكار', 'أذكار الصباح والمساء']
  },
  sunnah: {
    ru: ['Сунна', 'Сунны Посланника Аллаха ﷺ'],
    ar: ['السنن', 'سنن رسول الله ﷺ']
  },
  prophets: {
    ru: ['Истории пророков', 'Истории пророков, мир им'],
    ar: ['قصص الأنبياء', 'قصص الأنبياء عليهم السلام']
  },
  seerah: {
    ru: ['Жизнеописание Посланника Аллаха ﷺ', 'Жизнь Посланника Аллаха ﷺ'],
    ar: ['سيرة رسول الله ﷺ', 'حياة رسول الله ﷺ']
  },
  companions: {
    ru: ['Жизнеописание сподвижников', 'Жизнь сподвижников رضي الله عنهم'],
    ar: ['سير الصحابة', 'حياة الصحابة رضي الله عنهم']
  },
  lessons: {
    ru: ['Исламские уроки', 'Полезные исламские уроки'],
    ar: ['دروس إسلامية', 'دروس إسلامية نافعة']
  },
  questions: {
    ru: ['Исламские вопросы', 'Вопросы и ответы по Исламу'],
    ar: ['أسئلة إسلامية', 'أسئلة وأجوبة إسلامية']
  }
}

function localizeSection(section, lang) {
  const translation = SECTION_TRANSLATIONS[section?.slug]?.[lang]
  if (!translation) return section
  return { ...section, title: translation[0], description: translation[1] }
}

// Номи кӯтоҳ барои плиткаҳои меню: ибораҳои арабии дуоӣ (عَلَيْهِمُ السَّلَامُ ва ғ.)
// дар плитка пинҳон мешаванд, аммо ﷺ мемонад. Дар саҳифаи бахш номи пурра нишон дода мешавад.
function tileTitle(title, lang) {
  const text = String(title || '')
  if (lang === 'ar') return text
  const short = text.replace(/[\u0600-\u06FF\u0750-\u077F]+/g, '').replace(/\s{2,}/g, ' ').trim()
  return short || text
}

/* ---------- Нишонаҳои хатӣ (SVG) ---------- */

const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`

const ICONS = {
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  heart: 'M12 20.5s-8-4.7-8-10.2A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 8 2.3c0 5.5-8 10.2-8 10.2z',
  settings: `M4 7h9M17 7h3M4 17h3M11 17h9${circ(15, 7, 2)}${circ(9, 17, 2)}`,
  quran: 'M12 6.5C10 5 7 4.5 3 5v13c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5zM12 6.5v13',
  hadith: 'M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3',
  salihin: 'M4 4h12v9H9l-4 3.5V13H4zM18 8h2v10l-3-2h-6v-2',
  duas: `M12 11s-4-2.3-4-5a2.2 2.2 0 0 1 4-1.2A2.2 2.2 0 0 1 16 6c0 2.7-4 5-4 5zM3 15l4-1 6 1.5c1 .3 1 1.7 0 2L9 18.5M7 14.5V20M13 16l5-2.5 3 1-6 5.5H9`,
  adhkar: 'M12 3v4M5.6 7.6l2.1 2.1M18.4 7.6l-2.1 2.1M7 17a5 5 0 0 1 10 0M3 17h18M5 21h14',
  sunnah: 'M12 20.5s-8-4.7-8-10.2A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 8 2.3c0 5.5-8 10.2-8 10.2z',
  prophets: 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM9 8h6M9 12h6M9 16h4',
  seerah: `M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z${circ(12, 10, 2.5)}M8 17c.5-2 2-3 4-3s3.5 1 4 3`,
  companions: 'M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.3M15.5 4.2a3.5 3.5 0 0 1 0 6.6',
  lessons: 'M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6',
  questions: `${circ(12, 12, 9)}M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01`,
  search: `${circ(11, 11, 7)}M20 20l-4-4`,
  copy: 'M11 9h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM5 15V6a2 2 0 0 1 2-2h9',
  share: `${circ(18, 5, 3)}${circ(6, 12, 3)}${circ(18, 19, 3)}M8.6 13.5l6.8 4M15.4 6.5l-6.8 4`,
  play: 'M8 5v14l11-7z',
  speaker: 'M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13',
  utensils: 'M6 3v7a2 2 0 0 0 4 0V3M8 3v18M17 3c-2 2-3 5-3 8h3v10'
}

function Icon({ name, filled = false }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name] || ICONS.grid} />
    </svg>
  )
}

const FAVORITES_KEY = 'miftah_favorites_v1'

function loadFavorites() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

function saveFavorites(list) {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(list))
  } catch {
    // нигоҳдорӣ дастрас нест — фаромӯш мекунем
  }
}

const LEGACY_DEFAULT_SECTION_ORDER = [
  'quran', 'hadith', 'salihin', 'prophets', 'seerah',
  'companions', 'duas', 'adhkar', 'lessons', 'questions'
]

function mergeDefaultSections(rows) {
  const databaseSections = (rows || []).map(normalizeSection)
  const merged = [...databaseSections]

  for (const defaultSection of DEFAULT_SECTIONS) {
    if (!merged.some(item => item.slug === defaultSection.slug)) {
      merged.push(defaultSection)
    }
  }

  const databaseDefaultOrder = databaseSections
    .filter(item => LEGACY_DEFAULT_SECTION_ORDER.includes(item.slug))
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .map(item => item.slug)
  const expectedLegacyOrder = LEGACY_DEFAULT_SECTION_ORDER
    .filter(slug => databaseSections.some(item => item.slug === slug))

  // Агар база ҳанӯз тартиби пешинаи пешфарзро дошта бошад,
  // танҳо тартиби намоишро ба нақшаи нав мутобиқ мекунем; база тағйир намеёбад.
  const isLegacyOrder = databaseDefaultOrder.length > 0 &&
    databaseDefaultOrder.every((slug, index) => slug === expectedLegacyOrder[index]) &&
    databaseDefaultOrder.length === expectedLegacyOrder.length

  if (isLegacyOrder) {
    const orderBySlug = new Map(DEFAULT_SECTIONS.map(item => [item.slug, item.sort_order]))
    return merged.map(item => orderBySlug.has(item.slug)
      ? { ...item, sort_order: orderBySlug.get(item.slug) }
      : item)
  }

  return merged
}

const BOOK_TRANSLATIONS = {
  'sahih-al-bukhari': ['Сахих аль-Бухари', 'صحيح البخاري'],
  'sahih-muslim': ['Сахих Муслим', 'صحيح مسلم'],
  'sunan-abi-dawud': ['Сунан Абу Дауд', 'سنن أبي داود'],
  'jami-at-tirmidhi': ['Джами ат-Тирмизи', 'جامع الترمذي'],
  'sunan-an-nasai': ['Сунан ан-Насаи', 'سنن النسائي'],
  'sunan-ibn-majah': ['Сунан Ибн Маджа', 'سنن ابن ماجه'],
  'muwatta-imam-malik': ['Муватта имама Малика', 'موطأ الإمام مالك'],
  'riyad-as-salihin': ['Рияд ас-Салихин', 'رياض الصالحين']
}

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
    searchPlaceholder: 'Ҳадис, дуо ё матнро ҷустуҷӯ кунед...',
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
    bannerTranslation: 'Аз номи ман бирасонед, ҳатто як оят бошад.',
    bannerSource: 'Саҳеҳ ал-Бухорӣ · ҳадиси 3461',
    heroTitle: 'Мифтаҳул Ҳадис',
    heroDescription: 'Манбаи омӯзиш ва мутолиаи Қуръон, ҳадис ва дигар илмҳои исломӣ.',
    copyright: 'Ҳамаи ҳуқуқҳо ҳифз шудаанд.',
    adminDescription: 'Идоракунии пурраи Miftahulhadis',
    loginDescription: 'Барои идоракунии барнома ба ҳисоби мудир ворид шавед.',
    dailyExplanation: 'Шарҳи ҳадис:',
    hadithLabel: 'Ҳадиси № ',
    headerSubtitle: 'Китобхонаи ҳадис ва зикр',
    heroLabel: 'КИТОБХОНАИ ИСЛОМӢ',
    heroTitle1: 'Илмро ҷустуҷӯ кун.',
    heroTitle2: 'Ба он амал намо.',
    heroTagline: 'Ҳадис, дуо ва азкор — дар як ҷо.',
    searchHint: 'Аз рӯи калима, ибора ё матни ҳадис',
    sectionsTitle: 'Бахшҳо',
    allSections: 'Ҳамаи бахшҳо',
    navHome: 'Асосӣ',
    navSections: 'Бахшҳо',
    favorite: 'Дӯстдошта',
    copy: 'Нусхабардорӣ',
    share: 'Мубодила',
    favoritesTitle: 'Дӯстдоштаҳо',
    favoritesEmpty: 'Ҳоло ҳадиси дӯстдошта нест. Тугмаи «Дӯстдошта»-ро дар зери ҳадис пахш кунед.',
    settings: 'Танзимот',
    language: 'Забон',
    copied: 'Нусха шуд.',
    copyFailed: 'Нусхабардорӣ муяссар нашуд.',
    sunnahDailyTitle: 'Суннатҳои рӯз',
    sunnahDailyDesc: 'Суннатҳоро бо матни арабӣ, тарҷума ва садо омӯзед.',
    sunnahTags: 'Матни арабӣ · Тарҷума · Аудио',
    sunnahMore: 'Суннатҳои дигар низ аз дохили бахш дастрас мешаванд.',
    explanationShort: 'Шарҳ:',
    hadithWord: 'ҳадиси'
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
    hadithLabel: 'Хадис № ',
    headerSubtitle: 'Библиотека хадисов и зикров',
    heroLabel: 'ИСЛАМСКАЯ БИБЛИОТЕКА',
    heroTitle1: 'Ищи знание.',
    heroTitle2: 'И действуй по нему.',
    heroTagline: 'Хадисы, дуа и азкары — в одном месте.',
    searchHint: 'По слову, фразе или тексту хадиса',
    sectionsTitle: 'Разделы',
    allSections: 'Все разделы',
    navHome: 'Главная',
    navSections: 'Разделы',
    favorite: 'Избранное',
    copy: 'Копировать',
    share: 'Поделиться',
    favoritesTitle: 'Избранное',
    favoritesEmpty: 'Избранных хадисов пока нет. Нажмите «Избранное» под хадисом.',
    settings: 'Настройки',
    language: 'Язык',
    copied: 'Скопировано.',
    copyFailed: 'Не удалось скопировать.',
    sunnahDailyTitle: 'Сунны дня',
    sunnahDailyDesc: 'Изучайте сунны с арабским текстом, переводом и аудио.',
    sunnahTags: 'Арабский текст · Перевод · Аудио',
    sunnahMore: 'Другие сунны доступны внутри раздела.',
    explanationShort: 'Пояснение:',
    hadithWord: 'хадис'
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
  russian_text: '',
  explanation_ru: '',
  audio_url: '',
  video_url: ''
}

const EMPTY_CONTENT = {
  section_slug: 'salihin',
  title: '',
  title_ru: '',
  tajik_text: '',
  arabic_text: '',
  explanation_tg: '',
  explanation_ar: '',
  russian_text: '',
  explanation_ru: '',
  is_daily_sunnah: false,
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

  const [favorites, setFavorites] = useState(loadFavorites)
  const [sunnahOpen, setSunnahOpen] = useState(false)
  const [quranForm, setQuranForm] = useState({ surah: '', from: '', to: '' })
  const [importing, setImporting] = useState(false)

  const t = LANG[lang] || LANG.tg
  const direction = lang === 'ar' ? 'rtl' : 'ltr'

  const notify = useCallback((message, type = 'success') => {
    setNotice(message)
    setNoticeType(type)
  }, [])

  // Паёми муваффақиятро пас аз чанд сония худкор пинҳон мекунем.
  useEffect(() => {
    if (!notice || noticeType === 'error') return
    const timer = setTimeout(() => setNotice(''), 3500)
    return () => clearTimeout(timer)
  }, [notice, noticeType])

  const getBookName = useCallback(id => {
    const book = books.find(item => String(item.id) === String(id))
    if (!book) return ''
    const translated = BOOK_TRANSLATIONS[book.slug]
    if (lang === 'ru' && translated) return translated[0]
    if (lang === 'ar' && translated) return translated[1]
    return book.name || ''
  }, [books, lang])

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

  // Китобҳои пешфарзро танҳо агар набошанд илова мекунад.
  // Китобҳои мавҷуда, ҳолати фаъолият ва тартиби онҳоро тағйир намедиҳад.
  const ensureDefaultBooks = async existingBooks => {
    let result = [...existingBooks]

    for (const defaultBook of DEFAULT_BOOKS) {
      const exists = result.some(book =>
        clean(book.slug).toLowerCase() === defaultBook.slug.toLowerCase() ||
        clean(book.name).toLowerCase() === defaultBook.name.toLowerCase()
      )

      if (exists) continue

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

    return result.sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
  }

  // Бахши «Суннатҳо»-ро танҳо дар сурати набудан илова мекунад.
  // Ҳеҷ бахши мавҷударо навсозӣ ё нест намекунад.
  const ensureSunnahSection = async existingRows => {
    const found = existingRows.some(row => {
      const fields = getSectionFields(row)
      return clean(row?.[fields.slug]).toLowerCase() === 'sunnah'
    })
    if (found) return existingRows

    const maxOrder = existingRows.reduce((max, row, index) => {
      const fields = getSectionFields(row)
      return Math.max(max, Number(row?.[fields.order] ?? index + 1))
    }, 0)

    const payload = {
      slug: 'sunnah',
      title: 'Суннатҳо',
      description: 'Суннатҳои Расулуллоҳ ﷺ',
      icon: '🌿',
      sort_order: maxOrder + 1,
      is_active: true
    }

    const { data, error } = await db.from('sections').insert(payload).select('*').single()
    if (error) {
      console.warn('Бахши Суннатҳо ба база илова нашуд; намоиши маҳаллӣ истифода мешавад:', error)
      return existingRows
    }
    return [...existingRows, data]
  }

  const loadPublicData = useCallback(async () => {
    if (!db) {
      setLoading(false)
      notify(t.supabaseMissing, 'error')
      return
    }

    // Меню аз аввал бо бахшҳои пешфарз дастрас мемонад;
    // хатои ягон ҷадвал набояд ҳамаи бахшҳоро аз экран нест кунад.
    setSections(DEFAULT_SECTIONS)
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

      // Қаторҳои база танзимоти админро нигоҳ медоранд, аммо набудани
      // бахшҳои стандартӣ дигар онҳоро аз меню нест намекунад.
      if (sectionsRes.error) {
        console.warn('Sections query failed; showing built-in sections:', sectionsRes.error)
      }
      setSections(
        mergeDefaultSections(sectionsRes.error ? [] : sectionsRes.data)
          .filter(item => item.is_active !== false)
          .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      )
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

      // Танҳо китобҳои набударо илова мекунем; китобҳои мавҷуда бетағйир мемонанд.
      const allBooks = await ensureDefaultBooks(booksRes.data || [])
      const allSectionRows = await ensureSunnahSection(sectionsRes.data || [])

      const loadedHadith = sortByDate(hadithRes.data || [])
      const loadedContent = sortByDate(contentRes.data || [])

      setBooks(allBooks)
      setHadithRows(loadedHadith)
      setContentRows(loadedContent)
      refreshDaily(loadedHadith)

      if (!sectionsRes.error) {
        setSectionRows(allSectionRows)
        setSections(
          mergeDefaultSections(allSectionRows)
            .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
        )
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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const openSection = section => {
    setSelectedSection(section)
    setSelectedBook(null)
    setPage('section')
    setSearch('')
    setSearchResults(null)
    setSunnahOpen(false)
    scrollToTop()
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
    scrollToTop()
  }

  // «Бахшҳо» дар навигатсияи поён: ба рӯйхати плиткаҳо мебарад.
  const goSections = () => {
    if (page !== 'home') goHome()
    setTimeout(() => {
      document.getElementById('sections')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  const openFavorites = () => {
    setPage('favorites')
    setSelectedSection(null)
    setSelectedBook(null)
    scrollToTop()
  }

  const openSettings = () => {
    setPage('settings')
    setSelectedSection(null)
    setSelectedBook(null)
    scrollToTop()
  }

  const toggleFavorite = item => {
    const id = String(item.id)
    setFavorites(current => {
      const next = current.includes(id)
        ? current.filter(value => value !== id)
        : [...current, id]
      saveFavorites(next)
      return next
    })
  }

  const translatedOf = item => {
    const stored = parseStoredNote(item.source_note)
    if (lang === 'ru') return stored.meta.russian_text || item.russian_text || item.tajik_text
    if (lang === 'ar') return item.arabic_text || item.tajik_text
    return item.tajik_text
  }

  const hadithSourceLine = item => {
    const book = getBookName(item.book_id)
    if (!book && !item.hadith_number) return ''
    return `${book}${item.hadith_number ? ` — ${t.hadithWord} ${item.hadith_number}` : ''}`
  }

  const hadithPlain = item => [
    item.arabic_text,
    translatedOf(item),
    hadithSourceLine(item)
  ].filter(Boolean).join('\n\n')

  const copyText = async text => {
    try {
      await navigator.clipboard.writeText(text)
      notify(t.copied)
    } catch {
      notify(t.copyFailed, 'error')
    }
  }

  const shareText = async text => {
    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {
        // истифодабаранда мубодиларо бекор кард
      }
      return
    }
    copyText(text)
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
        stored.meta.title_ru,
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
    scrollToTop()
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
      const previousMeta = editingHadith
        ? parseStoredNote(hadithRows.find(row => String(row.id) === String(editingHadith))?.source_note).meta
        : {}
      const meta = {
        ...previousMeta,
        explanation_tg: clean(hadithForm.explanation_tg),
        explanation_ar: clean(hadithForm.explanation_ar),
        russian_text: clean(hadithForm.russian_text),
        explanation_ru: clean(hadithForm.explanation_ru),
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
      russian_text: stored.meta.russian_text || item.russian_text || '',
      explanation_ru: stored.meta.explanation_ru || '',
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
      !clean(contentForm.russian_text) &&
      !clean(contentForm.audio_url) &&
      !clean(contentForm.video_url)
    ) {
      notify(t.contentRequired, 'error')
      return
    }

    setSaving(true)

    try {
      const previousMeta = editingContent
        ? parseStoredNote(contentRows.find(row => String(row.id) === String(editingContent))?.source_note).meta
        : {}
      const meta = {
        ...previousMeta,
        title_ru: clean(contentForm.title_ru),
        explanation_tg: clean(contentForm.explanation_tg),
        explanation_ar: clean(contentForm.explanation_ar),
        russian_text: clean(contentForm.russian_text),
        explanation_ru: clean(contentForm.explanation_ru),
        is_daily_sunnah: contentForm.section_slug === 'sunnah' && Boolean(contentForm.is_daily_sunnah),
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
      title_ru: stored.meta.title_ru || '',
      tajik_text: item.tajik_text || item.content_text || '',
      arabic_text: item.arabic_text || '',
      source_note: stored.source,
      explanation_tg: stored.meta.explanation_tg || '',
      explanation_ar: stored.meta.explanation_ar || '',
      russian_text: stored.meta.russian_text || item.russian_text || '',
      explanation_ru: stored.meta.explanation_ru || '',
      is_daily_sunnah: Boolean(stored.meta.is_daily_sunnah),
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

    const rows = contentRows
      .filter(item => item.section_slug === selectedSection.slug)
      .map(item => ({ ...item, resultType: 'content' }))

    // Қуръон: сураҳо аз рӯи рақам (1, 2, 3 ...) нишон дода мешаванд.
    if (selectedSection.slug === 'quran') {
      const suraOf = item => Number(parseStoredNote(item.source_note).meta.sura_number || 9999)
      rows.sort((a, b) => suraOf(a) - suraOf(b))
    }

    return rows
  }, [selectedSection, selectedBook, hadithRows, contentRows])

  const dailySunnah = useMemo(() => {
    const candidates = contentRows.filter(item => {
      const meta = parseStoredNote(item.source_note).meta
      return item.section_slug === 'sunnah' && meta.is_daily_sunnah === true
    })
    return candidates.sort((a, b) =>
      new Date(b.updated_at || b.created_at || 0).getTime() -
      new Date(a.updated_at || a.created_at || 0).getTime()
    )[0] || null
  }, [contentRows])

  const favoriteHadiths = useMemo(
    () => hadithRows.filter(item => favorites.includes(String(item.id))),
    [hadithRows, favorites]
  )

  // Воридоти худкори сураҳои Қуръон аз api.alquran.cloud (матни араб + русӣ + тоҷикӣ, агар дастрас бошад).
  const importSurah = async () => {
    if (!db || !admin || importing) return

    const number = Number(quranForm.surah)
    if (!Number.isInteger(number) || number < 1 || number > 114) {
      notify('Рақами сураро аз 1 то 114 ворид кунед.', 'error')
      return
    }

    const from = quranForm.from ? Number(quranForm.from) : null
    const to = quranForm.to ? Number(quranForm.to) : null
    const importKey = `${number}:${from || ''}-${to || ''}`

    const duplicate = contentRows.some(row =>
      row.section_slug === 'quran' &&
      parseStoredNote(row.source_note).meta.import_key === importKey
    )
    if (duplicate) {
      notify('Ин сура аллакай илова шудааст.', 'error')
      return
    }

    setImporting(true)

    try {
      const api = 'https://api.alquran.cloud/v1'
      const getData = async path => {
        const response = await fetch(api + path)
        if (!response.ok) throw new Error('API ' + response.status)
        const json = await response.json()
        return json.data
      }

      let tajikEdition = ''
      try {
        const editions = await getData('/edition?format=text&language=tg')
        tajikEdition = editions?.[0]?.identifier || ''
      } catch {
        tajikEdition = ''
      }

      const [arabic, russian, tajik] = await Promise.all([
        getData(`/surah/${number}/quran-uthmani`),
        getData(`/surah/${number}/ru.kuliev`),
        tajikEdition ? getData(`/surah/${number}/${tajikEdition}`) : Promise.resolve(null)
      ])

      const pick = data => (data?.ayahs || []).filter(ayah =>
        (!from || ayah.numberInSurah >= from) && (!to || ayah.numberInSurah <= to)
      )
      const numbered = ayahs => ayahs.map(ayah => `${ayah.numberInSurah}. ${ayah.text}`).join('\n')

      const arabicText = pick(arabic)
        .map(ayah => `${ayah.text} ﴿${ayah.numberInSurah}﴾`).join('\n')
      const tajikText = tajik ? numbered(pick(tajik)) : ''
      const russianText = numbered(pick(russian))

      if (!arabicText) throw new Error('Оятҳо ёфт нашуданд.')

      const range = (from || to)
        ? ` · оятҳои ${from || 1}–${to || arabic.numberOfAyahs}`
        : ''
      const name = arabic.englishName || `№ ${number}`

      const meta = {
        title_ru: `Сура ${name} (${number})${range.replace('оятҳои', 'аяты')}`,
        russian_text: russianText,
        sura_number: String(number),
        import_key: importKey
      }

      const { error } = await db.from('content_items').insert({
        section_slug: 'quran',
        title: `Сураи ${name} (${number})${range}`,
        tajik_text: tajikText || null,
        arabic_text: arabicText,
        content_text: tajikText || arabicText,
        source_note: makeStoredNote(`Қуръони Карим · ${arabic.name} · api.alquran.cloud`, meta),
        is_published: true,
        updated_at: new Date().toISOString()
      })

      if (error) throw error

      setQuranForm({ surah: '', from: '', to: '' })
      await loadAdminData()
      await loadPublicData()
      notify(tajikText
        ? t.saved
        : 'Сура илова шуд, аммо тарҷумаи тоҷикӣ дар API ёфт нашуд — онро дастӣ дар «Таҳрир» илова кунед.')
    } catch (error) {
      console.error(error)
      notify(t.error + error.message, 'error')
    } finally {
      setImporting(false)
    }
  }

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

  const renderActions = item => {
    const isFavorite = favorites.includes(String(item.id))

    return (
      <div className="card-actions">
        <button className="action-button" type="button" onClick={() => copyText(hadithPlain(item))}>
          <Icon name="copy" />
          <span>{t.copy}</span>
        </button>

        <button
          className={`action-button ${isFavorite ? 'is-on' : ''}`}
          type="button"
          onClick={() => toggleFavorite(item)}
          aria-pressed={isFavorite}
        >
          <Icon name="heart" />
          <span>{t.favorite}</span>
        </button>

        <button className="action-button" type="button" onClick={() => shareText(hadithPlain(item))}>
          <Icon name="share" />
          <span>{t.share}</span>
        </button>
      </div>
    )
  }

  const renderHadithCard = (item, query = '') => {
    const stored = parseStoredNote(item.source_note)
    const commentary = lang === 'ru'
      ? (stored.meta.explanation_ru || item.commentary || stored.meta.explanation_tg)
      : (item.commentary || stored.meta.explanation_tg)
    const translatedHadith = lang === 'ru'
      ? (stored.meta.russian_text || item.russian_text || item.tajik_text)
      : (lang === 'ar' ? (item.arabic_text || item.tajik_text) : item.tajik_text)

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

        {translatedHadith && (
          <p><HighlightText text={translatedHadith} query={query} /></p>
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

        {renderActions(item)}
      </article>
    )
  }

  const renderContentCard = (item, query = '') => {
    const stored = parseStoredNote(item.source_note)
    const localizedText = lang === 'ru'
      ? (stored.meta.russian_text || item.russian_text || item.tajik_text || item.content_text)
      : (lang === 'ar'
        ? (item.arabic_text || item.tajik_text || item.content_text)
        : (item.tajik_text || item.content_text))
    const localizedExplanation = lang === 'ru'
      ? (stored.meta.explanation_ru || stored.meta.explanation_tg)
      : stored.meta.explanation_tg

    return (
      <article className="public-item" key={`content-${item.id}`}>
        {(lang === 'ru' ? (stored.meta.title_ru || item.title) : item.title) && (
          <h3>
            <HighlightText
              text={lang === 'ru' ? (stored.meta.title_ru || item.title) : item.title}
              query={query}
            />
          </h3>
        )}

        {item.arabic_text && (
          <p className="arabic-text">
            <HighlightText text={item.arabic_text} query={query} />
          </p>
        )}

        {localizedText && (
          <p><HighlightText text={localizedText} query={query} /></p>
        )}

        {localizedExplanation && (
          <div className="explanation">
            <strong>{t.explanationShort}</strong>
            <p><HighlightText text={localizedExplanation} query={query} /></p>
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

        {textarea('Матни русӣ / Русский перевод', hadithForm.russian_text,
          value => setHadithForm({ ...hadithForm, russian_text: value }))}

        {textarea(t.arabic, hadithForm.arabic_text,
          value => setHadithForm({ ...hadithForm, arabic_text: value }),
          'النص العربي...', true)}

        {field(t.source, hadithForm.source_note,
          value => setHadithForm({ ...hadithForm, source_note: value }))}

        {textarea(t.explanationTg, hadithForm.explanation_tg,
          value => setHadithForm({ ...hadithForm, explanation_tg: value }))}

        {textarea('Шарҳи русӣ / Объяснение на русском', hadithForm.explanation_ru,
          value => setHadithForm({ ...hadithForm, explanation_ru: value }))}

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

        {contentForm.section_slug === 'quran' && !editingContent && (
          <div className="import-panel">
            <strong>Воридоти худкори Қуръон</strong>
            <p>Рақами сураро нависед — матни арабӣ, тарҷумаи русӣ ва (агар бошад) тоҷикӣ худкор илова мешавад. Оятҳо ихтиёрӣ.</p>
            <div className="import-row">
              <input
                type="number" min="1" max="114" inputMode="numeric"
                placeholder="Сура (1–114)"
                value={quranForm.surah}
                onChange={event => setQuranForm({ ...quranForm, surah: event.target.value })}
              />
              <input
                type="number" min="1" inputMode="numeric"
                placeholder="Аз ояти"
                value={quranForm.from}
                onChange={event => setQuranForm({ ...quranForm, from: event.target.value })}
              />
              <input
                type="number" min="1" inputMode="numeric"
                placeholder="То ояти"
                value={quranForm.to}
                onChange={event => setQuranForm({ ...quranForm, to: event.target.value })}
              />
            </div>
            <button className="primary-button" type="button" onClick={importSurah} disabled={importing}>
              {importing ? t.loading : 'Сураро ворид кардан'}
            </button>
          </div>
        )}

        {field(t.title, contentForm.title,
          value => setContentForm({ ...contentForm, title: value }))}

        {field('Сарлавҳаи русӣ / Название на русском', contentForm.title_ru,
          value => setContentForm({ ...contentForm, title_ru: value }))}

        {textarea(t.tajik, contentForm.tajik_text,
          value => setContentForm({ ...contentForm, tajik_text: value }))}

        {textarea('Матни русӣ / Русский текст', contentForm.russian_text,
          value => setContentForm({ ...contentForm, russian_text: value }))}

        {textarea(t.arabic, contentForm.arabic_text,
          value => setContentForm({ ...contentForm, arabic_text: value }), '', true)}

        {textarea(t.explanationTg, contentForm.explanation_tg,
          value => setContentForm({ ...contentForm, explanation_tg: value }))}

        {textarea('Шарҳи русӣ / Объяснение на русском', contentForm.explanation_ru,
          value => setContentForm({ ...contentForm, explanation_ru: value }))}

        {textarea(t.explanationAr, contentForm.explanation_ar,
          value => setContentForm({ ...contentForm, explanation_ar: value }), '', true)}

        {field(t.source, contentForm.source_note,
          value => setContentForm({ ...contentForm, source_note: value }))}

        {contentForm.section_slug === 'sunnah' && (
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={Boolean(contentForm.is_daily_sunnah)}
                onChange={event => setContentForm({ ...contentForm, is_daily_sunnah: event.target.checked })}
              />
              <span>Инро ҳамчун «Суннати рӯз» дар саҳифаи асосӣ нишон деҳ</span>
            </label>
          </div>
        )}

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

  const sunnahSection = sections.find(item => item.slug === 'sunnah')
  const sunnahStored = dailySunnah ? parseStoredNote(dailySunnah.source_note) : null
  const showSearch = page === 'home' || page === 'section' || page === 'search'
  const navActive = {
    home: page === 'home' || page === 'search',
    sections: page === 'section',
    favorites: page === 'favorites',
    settings: page === 'settings'
  }

  return (
    <div className="app theme-green" dir={direction}>
      <header className="header">
        <button className="brand-button" onClick={goHome}>
          <span className="brand-logo" aria-hidden="true">ه</span>
          <span className="brand-text">
            <span className="header-title">Miftahulhadis</span>
            <span className="header-subtitle">{t.headerSubtitle}</span>
          </span>
        </button>

        <div className="header-controls">
          <select
            className="language-selector"
            value={lang}
            onChange={event => setLang(event.target.value)}
            aria-label={t.language}
          >
            <option value="tg">TJ</option>
            <option value="ru">RU</option>
          </select>
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
          {page === 'home' && (
            <section className="miftah-banner">
              <span className="miftah-banner-label">{t.heroLabel}</span>
              <h1 className="miftah-banner-title">{t.heroTitle1}</h1>
              <h2 className="miftah-banner-title2">{t.heroTitle2}</h2>
              <p className="miftah-banner-tagline">{t.heroTagline}</p>

              <div className="miftah-banner-quote">
                <p className="miftah-banner-arabic">بَلِّغُوا عَنِّي وَلَوْ آيَةً</p>
                <p className="miftah-banner-translation">{t.bannerTranslation}</p>
                <p className="miftah-banner-subtitle">{t.bannerSource}</p>
              </div>
            </section>
          )}

          {showSearch && (
            <div className="search-box">
              <button
                className="search-icon-button"
                type="button"
                onClick={performSearch}
                aria-label={t.search}
              >
                <Icon name="search" />
              </button>

              <div className="search-field">
                <input
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Enter') performSearch()
                  }}
                  placeholder={t.searchPlaceholder}
                  enterKeyHint="search"
                />
                <span className="search-hint">{t.searchHint}</span>
              </div>
            </div>
          )}

          {page === 'home' && (
            <>
              <section className="sections-block" id="sections">
                <div className="block-heading">
                  <h2>{t.sectionsTitle}</h2>
                  <button className="link-button" type="button" onClick={goSections}>
                    {t.allSections}
                  </button>
                </div>

                <div className="menu">
                  <button className="menu-card is-active" type="button" onClick={goHome}>
                    <span className="menu-card-icon"><Icon name="grid" /></span>
                    <span className="menu-card-body"><h3>{t.sectionsTitle}</h3></span>
                  </button>

                  {sections.filter(section => section.is_active !== false).map(section => {
                    const displaySection = localizeSection(section, lang)
                    return (
                      <button
                        className="menu-card"
                        key={section.slug}
                        type="button"
                        onClick={() => openSection(section)}
                      >
                        <span className="menu-card-icon">
                          {ICONS[section.slug] ? <Icon name={section.slug} /> : section.icon}
                        </span>

                        <span className="menu-card-body">
                          <h3>{tileTitle(displaySection.title, lang)}</h3>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>

              {dailyHadith && (
                <section className="daily-card">
                  <div className="daily-heading">
                    <h2>{t.daily}</h2>
                    {dailyHadith.hadith_number && (
                      <span className="daily-badge">№ {dailyHadith.hadith_number}</span>
                    )}
                  </div>

                  {dailyHadith.arabic_text && (
                    <p className="arabic-text">{dailyHadith.arabic_text}</p>
                  )}

                  <p>{lang === 'ru'
                    ? (parseStoredNote(dailyHadith.source_note).meta.russian_text || dailyHadith.tajik_text)
                    : (lang === 'ar' ? (dailyHadith.arabic_text || dailyHadith.tajik_text) : dailyHadith.tajik_text)}</p>

                  {(dailyHadith.commentary || parseStoredNote(dailyHadith.source_note).meta.explanation_tg) && (
                    <div className="explanation">
                      <strong>{t.dailyExplanation}</strong>
                      <p>
                        {dailyHadith.commentary ||
                          parseStoredNote(dailyHadith.source_note).meta.explanation_tg}
                      </p>
                    </div>
                  )}

                  <div className="source-note">{hadithSourceLine(dailyHadith)}</div>

                  {renderActions(dailyHadith)}
                </section>
              )}

              {(dailySunnah || sunnahSection) && (
                <section className="daily-card sunnah-daily-card">
                  <div className="daily-heading">
                    <h2>{t.sunnahDailyTitle}</h2>
                    <span className="daily-heading-icon"><Icon name="speaker" /></span>
                  </div>

                  <p className="daily-desc">{t.sunnahDailyDesc}</p>

                  <button
                    className="sunnah-row"
                    type="button"
                    onClick={() => dailySunnah
                      ? setSunnahOpen(open => !open)
                      : openSection(sunnahSection)}
                  >
                    <span className="sunnah-row-icon"><Icon name="utensils" /></span>

                    <span className="sunnah-row-text">
                      <strong>
                        {dailySunnah
                          ? ((lang === 'ru' && sunnahStored?.meta.title_ru) || dailySunnah.title || clean(translatedOf(dailySunnah) || dailySunnah.content_text).slice(0, 40))
                          : localizeSection(sunnahSection, lang).title}
                      </strong>
                      <span>{t.sunnahTags}</span>
                    </span>

                    <span className="sunnah-play"><Icon name="play" filled /></span>
                  </button>

                  {dailySunnah && sunnahOpen && (
                    <div className="sunnah-details">
                      {dailySunnah.arabic_text && <p className="arabic-text">{dailySunnah.arabic_text}</p>}

                      <p>{lang === 'ru'
                        ? (sunnahStored.meta.russian_text || dailySunnah.tajik_text || dailySunnah.content_text)
                        : (lang === 'ar'
                          ? (dailySunnah.arabic_text || dailySunnah.tajik_text || dailySunnah.content_text)
                          : (dailySunnah.tajik_text || dailySunnah.content_text))}</p>

                      {sunnahStored.meta.explanation_tg && (
                        <div className="explanation">
                          <strong>{t.explanationShort}</strong>
                          <p>{lang === 'ru'
                            ? (sunnahStored.meta.explanation_ru || sunnahStored.meta.explanation_tg)
                            : sunnahStored.meta.explanation_tg}</p>
                        </div>
                      )}

                      {renderMedia(dailySunnah)}

                      {sunnahStored.source && (
                        <div className="source-note">{sunnahStored.source}</div>
                      )}
                    </div>
                  )}

                  <p className="daily-footnote">{t.sunnahMore}</p>
                </section>
              )}
            </>
          )}

          {page === 'section' && selectedSection && (
            <section className="content-page">
              <button className="secondary-button back-button" onClick={goHome}>
                ← {t.back}
              </button>

              <div className="section-intro">
                <h2>{selectedSection.icon} {localizeSection(selectedSection, lang).title}</h2>
                <p>{localizeSection(selectedSection, lang).description}</p>
              </div>

              {selectedSection.slug === 'hadith' && !selectedBook ? (
                <div className="menu menu-list">
                  {books
                    .filter(book => book.is_active !== false)
                    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
                    .map(book => (
                      <button
                        className="menu-card"
                        key={book.id}
                        onClick={() => openBook(book)}
                      >
                        <span className="menu-card-icon"><Icon name="hadith" /></span>

                        <span className="menu-card-body">
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

          {page === 'favorites' && (
            <section className="content-page">
              <div className="section-intro">
                <h2>{t.favoritesTitle}</h2>
              </div>

              <div className="public-list">
                {favoriteHadiths.length
                  ? favoriteHadiths.map(item => renderHadithCard(item))
                  : <div className="empty-state">{t.favoritesEmpty}</div>}
              </div>
            </section>
          )}

          {page === 'settings' && (
            <section className="content-page">
              <div className="section-intro">
                <h2>{t.settings}</h2>
              </div>

              <div className="public-list">
                <div className="settings-card">
                  <h3>{t.language}</h3>
                  <div className="lang-options">
                    {[['tg', 'Тоҷикӣ'], ['ru', 'Русский']].map(([code, label]) => (
                      <button
                        key={code}
                        type="button"
                        className={`lang-option ${lang === code ? 'active' : ''}`}
                        onClick={() => setLang(code)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-card">
                  <h3>{t.admin}</h3>
                  <div className="settings-actions">
                    {admin ? (
                      <>
                        <button className="primary-button" type="button" onClick={() => setPage('admin')}>
                          {t.admin}
                        </button>
                        <button className="secondary-button" type="button" onClick={logout}>
                          {t.logout}
                        </button>
                      </>
                    ) : (
                      <button className="primary-button" type="button" onClick={() => setLoginOpen(true)}>
                        {t.login}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          <footer className="footer">
            <strong>Miftahulhadis</strong>
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

      <nav className="bottom-nav" aria-label="Navigation">
        <button className={`nav-item ${navActive.home ? 'active' : ''}`} type="button" onClick={goHome}>
          <Icon name="home" />
          <span>{t.navHome}</span>
        </button>

        <button className={`nav-item ${navActive.sections ? 'active' : ''}`} type="button" onClick={goSections}>
          <Icon name="grid" />
          <span>{t.navSections}</span>
        </button>

        <button className={`nav-item ${navActive.favorites ? 'active' : ''}`} type="button" onClick={openFavorites}>
          <Icon name="heart" />
          <span>{t.favorite}</span>
        </button>

        <button className={`nav-item ${navActive.settings ? 'active' : ''}`} type="button" onClick={openSettings}>
          <Icon name="settings" />
          <span>{t.settings}</span>
        </button>
      </nav>

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
