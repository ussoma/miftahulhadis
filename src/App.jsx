import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  { slug: 'questions', title: 'Саволҳои Исломӣ', icon: '❔', description: 'Саволу ҷавобҳои исломӣ', sort_order: 11, is_active: true },
  { slug: 'arabic', title: 'Забони арабӣ', icon: 'ع', description: 'Сарф: тасрифи феъл ва грамматикаи арабӣ', sort_order: 12, is_active: true }
]

const SECTION_TRANSLATIONS = {
  arabic: {
    ru: ['Арабский язык', 'Сарф: спряжение глаголов и грамматика арабского'],
    ar: ['اللغة العربية', 'الصرف: تصريف الأفعال وقواعد اللغة']
  },
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

const SURAH_TG = [
  'Ал-Фотиҳа',
  'Ал-Бақара',
  'Оли Имрон',
  'Ан-Нисо',
  'Ал-Моида',
  'Ал-Анъом',
  'Ал-Аъроф',
  'Ал-Анфол',
  'Ат-Тавба',
  'Юнус',
  'Ҳуд',
  'Юсуф',
  'Ар-Раъд',
  'Иброҳим',
  'Ал-Ҳиҷр',
  'Ан-Наҳл',
  'Ал-Исро',
  'Ал-Каҳф',
  'Марям',
  'Тоҳо',
  'Ал-Анбиё',
  'Ал-Ҳаҷ',
  'Ал-Муъминун',
  'Ан-Нур',
  'Ал-Фурқон',
  'Аш-Шуаро',
  'Ан-Намл',
  'Ал-Қасас',
  'Ал-Анкабут',
  'Ар-Рум',
  'Луқмон',
  'Ас-Саҷда',
  'Ал-Аҳзоб',
  'Сабаъ',
  'Фотир',
  'Ёсин',
  'Ас-Соффот',
  'Сод',
  'Аз-Зумар',
  'Ғофир',
  'Фуссилат',
  'Аш-Шуро',
  'Аз-Зухруф',
  'Ад-Духон',
  'Ал-Ҷосия',
  'Ал-Аҳқоф',
  'Муҳаммад',
  'Ал-Фатҳ',
  'Ал-Ҳуҷурот',
  'Қоф',
  'Аз-Зориёт',
  'Ат-Тур',
  'Ан-Наҷм',
  'Ал-Қамар',
  'Ар-Раҳмон',
  'Ал-Воқиъа',
  'Ал-Ҳадид',
  'Ал-Муҷодала',
  'Ал-Ҳашр',
  'Ал-Мумтаҳина',
  'Ас-Соф',
  'Ал-Ҷумъа',
  'Ал-Мунофиқун',
  'Ат-Тағобун',
  'Ат-Талоқ',
  'Ат-Таҳрим',
  'Ал-Мулк',
  'Ал-Қалам',
  'Ал-Ҳоққа',
  'Ал-Маориҷ',
  'Нуҳ',
  'Ал-Ҷинн',
  'Ал-Музаммил',
  'Ал-Муддассир',
  'Ал-Қиёма',
  'Ал-Инсон',
  'Ал-Мурсалот',
  'Ан-Набаъ',
  'Ан-Нозиот',
  'Абаса',
  'Ат-Таквир',
  'Ал-Инфитор',
  'Ал-Мутаффифин',
  'Ал-Иншиқоқ',
  'Ал-Буруҷ',
  'Ат-Ториқ',
  'Ал-Аъло',
  'Ал-Ғошия',
  'Ал-Фаҷр',
  'Ал-Балад',
  'Аш-Шамс',
  'Ал-Лайл',
  'Аз-Зуҳо',
  'Аш-Шарҳ',
  'Ат-Тин',
  'Ал-Алақ',
  'Ал-Қадр',
  'Ал-Баййина',
  'Аз-Залзала',
  'Ал-Одиёт',
  'Ал-Қориа',
  'Ат-Такосур',
  'Ал-Аср',
  'Ал-Ҳумаза',
  'Ал-Фил',
  'Қурайш',
  'Ал-Моъун',
  'Ал-Кавсар',
  'Ал-Кофирун',
  'Ан-Наср',
  'Ал-Масад',
  'Ал-Ихлос',
  'Ал-Фалақ',
  'Ан-Нос'
]

const QURAN_API = 'https://api.alquran.cloud/v1'
const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
const RECITER_KEY = 'miftah_reciter_v1'
const QURAN_FAVORITES_KEY = 'miftah_quran_favorites_v1'

const FALLBACK_RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Alafasy' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary' },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq El-Minshawi' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)' }
]

async function quranFetch(path) {
  const response = await fetch(QURAN_API + path)
  if (!response.ok) throw new Error('API ' + response.status)
  const json = await response.json()
  return json.data
}

// Дар аввали оятҳои сураҳо (ғайр аз 1 ва 9) бисмиллоҳ дохил аст; онро алоҳида нишон медиҳем.
function stripBismillah(text, surahNumber, ayahIndex) {
  if (ayahIndex !== 0 || surahNumber === 1 || surahNumber === 9) return text
  const norm = word => String(word || '').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
  const words = String(text).split(/\s+/)
  if (words.length > 4 && norm(words[0]) === 'بسم' && norm(words[1]).endsWith('لله')) {
    return words.slice(4).join(' ')
  }
  return text
}

function loadReciter() {
  try {
    return window.localStorage.getItem(RECITER_KEY) || 'ar.alafasy'
  } catch {
    return 'ar.alafasy'
  }
}

function loadQuranFavorites() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(QURAN_FAVORITES_KEY) || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
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

// Санаи имрӯз (вақти маҳаллии дастгоҳ) дар шакли ГГГГ-ММ-РР.
function todayKey() {
  return new Date().toLocaleDateString('en-CA')
}

const ASK_TOKEN_KEY = 'miftah_ask_token_v1'
let memoryAskToken = ''

// Шиносаи махфии дастгоҳ барои саволҳои шахсӣ: фақат худи корбар саволу ҷавобҳои худро мебинад.
function getAskToken() {
  try {
    let token = window.localStorage.getItem(ASK_TOKEN_KEY)
    if (!token || token.length < 20) {
      token = makeToken()
      window.localStorage.setItem(ASK_TOKEN_KEY, token)
    }
    return token
  } catch {
    if (!memoryAskToken) memoryAskToken = makeToken()
    return memoryAskToken
  }
}

// Агар барнома дар Telegram кушода шавад, корбар аз рӯи Telegram ID шинохта мешавад.
function getTelegramUser() {
  try {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user
    if (!user?.id) return null
    return {
      id: String(user.id),
      name: [user.first_name, user.last_name].filter(Boolean).join(' '),
      username: user.username || ''
    }
  } catch {
    return null
  }
}

function currentUserKey() {
  const telegramUser = getTelegramUser()
  return telegramUser ? `tg:${telegramUser.id}` : `dev:${getAskToken()}`
}

function makeToken() {
  const bytes = new Uint8Array(24)
  window.crypto.getRandomValues(bytes)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
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

// Номи китобҳои «Саҳеҳи Бухорӣ» (97 китоб, тартиб мувофиқи sunnah.com).
const BUKHARI_CHAPTERS = [
  'Оғози ваҳй',
  'Имон',
  'Илм',
  'Тахорат (вузӯъ)',
  'Ғусл',
  'Ҳайз',
  'Таяммум',
  'Намоз',
  'Вақтҳои намоз',
  'Азон',
  'Намози ҷумъа',
  'Намози хавф',
  'Ду ид',
  'Намози витр',
  'Намози истисқо (талаби борон)',
  'Гирифтани офтоб ва моҳ',
  'Саҷдаҳои тиловати Қуръон',
  'Қасри намоз (кӯтоҳ кардани намоз)',
  'Намози шаб (таҳаҷҷуд)',
  'Фазилати намоз дар масҷиди Макка ва Мадина',
  'Корҳо дар намоз',
  'Саҳв дар намоз',
  'Ҷаноза',
  'Закот',
  'Ҳаҷ',
  'Умра',
  'Муҳсар (бозмондан аз анҷоми ҳаҷ)',
  'Ҷазои шикор дар эҳром',
  'Фазилатҳои Мадина',
  'Рӯза',
  'Намози тароветҳ',
  'Фазилати шаби қадр',
  'Эътикоф',
  'Савдо ва тиҷорат',
  'Салам (савдои пешакӣ)',
  'Шуфъа',
  'Иҷора',
  'Ҳавола (гузаронидани қарз)',
  'Кафолат',
  'Ваколат',
  'Кишоварзӣ',
  'Тақсими об',
  'Қарз, пардохти қарз ва маҳҷур',
  'Хусумот',
  'Луқата (чизи ёфтшуда)',
  'Мазолим (ситамҳо)',
  'Шарикӣ',
  'Раҳн (гарав)',
  'Озод кардани ғуломон',
  'Мукотаб',
  'Ҳадя',
  'Шаҳодатҳо (гувоҳӣ)',
  'Сулҳ',
  'Шартҳо',
  'Васиятҳо',
  'Ҷиҳод ва сиёр',
  'Хумс (панҷяки ғанимат)',
  'Ҷизя ва муовада',
  'Оғози офариниш',
  'Ҳадисҳои паёмбарон',
  'Фазилатҳо ва манокиби Паёмбар ﷺ',
  'Фазилатҳои асҳоби Паёмбар ﷺ',
  'Манокиби ансор',
  'Ғазавот (ҷангҳои Паёмбар ﷺ)',
  'Тафсири Қуръон',
  'Фазилатҳои Қуръон',
  'Никоҳ',
  'Талоқ',
  'Нафақа',
  'Хӯрокҳо',
  'Ақиқа',
  'Забҳ ва шикор',
  'Қурбонӣ',
  'Нӯшокиҳо',
  'Беморон',
  'Тиб (табобат)',
  'Либос',
  'Одоб',
  'Иҷозат пурсидан',
  'Дуоҳо',
  'Рақоиқ (нарм кардани дил)',
  'Тақдир',
  'Қасамҳо ва назрҳо',
  'Каффороти қасамҳо',
  'Фароиз (мерос)',
  'Ҳудуд',
  'Диёт (хунбаҳо)',
  'Иститоба (тавбаи муртаддон)',
  'Икроҳ (маҷбурӣ)',
  'Ҳилаҳо',
  'Таъбири хоб',
  'Фитнаҳо ва аломатҳои охири замон',
  'Аҳком (ҳукмҳо)',
  'Орзуҳо',
  'Қабули хабари шахси ростгӯ',
  'Чанг задан ба Китоб ва Суннат',
  'Тавҳид'
]

// Китобҳои такрорӣ (бо номҳои гуногун) ба як гурӯҳ муттаҳид мешаванд.
const BOOK_KEYWORDS = [
  ['sahih-al-bukhari', ['бухор', 'бухар', 'bukhar']],
  ['sahih-muslim', ['муслим', 'muslim']],
  ['sunan-abi-dawud', ['довуд', 'дауд', 'давуд', 'dawud', 'daud']],
  ['jami-at-tirmidhi', ['тирмиз', 'tirmi']],
  ['sunan-an-nasai', ['насоӣ', 'насои', 'насаи', 'насаий', 'nasai', 'nasa']],
  ['sunan-ibn-majah', ['моҷа', 'моча', 'маджа', 'мажа', 'majah', 'моҷ']],
  ['muwatta-imam-malik', ['молик', 'малик', 'муватт', 'malik', 'muwatta']],
  ['riyad-as-salihin', ['риёз', 'рияд', 'riyad']]
]

function bookKey(book) {
  const slug = String(book?.slug ?? '').trim().toLowerCase()
  if (BOOK_KEYWORDS.some(([key]) => key === slug)) return slug
  const name = String(book?.name ?? '').trim().toLowerCase()
  const found = BOOK_KEYWORDS.find(([, words]) => words.some(word => name.includes(word)))
  return found ? found[0] : `id-${book?.id}`
}

function numericValue(value) {
  const number = parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(number) ? number : Number.MAX_SAFE_INTEGER
}

// Тарҷумаи автоматии тоҷикӣ → русӣ (хидмати ройгони Google); матн қисм-қисм фиристода мешавад.
async function translateTgRu(text) {
  const source = String(text || '').trim()
  if (!source) return ''

  const parts = source.match(/[^.!?\n]+[.!?\n]*\s*/g) || [source]
  const chunks = []
  let current = ''

  for (const part of parts) {
    if (current && (current + part).length > 900) {
      chunks.push(current)
      current = part
    } else {
      current += part
    }
  }
  if (current) chunks.push(current)

  const result = []
  for (const chunk of chunks) {
    const response = await fetch(
      'https://translate.googleapis.com/translate_a/single?client=gtx&sl=tg&tl=ru&dt=t&q=' +
      encodeURIComponent(chunk.trim())
    )
    if (!response.ok) throw new Error('translate ' + response.status)
    const json = await response.json()
    result.push((json?.[0] || []).map(item => item?.[0] || '').join(''))
  }

  return result.join(' ').trim()
}

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
    hadithWord: 'ҳадиси',
    quranWord: 'Қуръони Карим',
    surahWord: 'Сураи',
    ayahsCount: 'оят',
    ayahWord: 'ояти',
    makki: 'Маккӣ',
    madani: 'Мадинӣ',
    playAyah: 'Шунидан',
    playFrom: 'То охир',
    playAll: 'Аз аввал то охир',
    stopAudio: 'Бас кардан',
    reciter: 'Қорӣ',
    surahFilter: 'Ҷустуҷӯи сура (ном ё рақам)...',
    surahLoading: 'Сура бор шуда истодааст...',
    surahError: 'Сураро бор кардан муяссар нашуд. Интернетро санҷед.',
    retry: 'Дубора кӯшиш кардан',
    quranSource: 'Матн ва аудио: api.alquran.cloud · Тарҷумаи тоҷикӣ: Абдулмуҳаммад Оятӣ · Русӣ: Э. Кулиев',
    extraMaterials: 'Маводҳои иловагӣ',
    audioUnavailable: 'Аудио барои ин оят дастрас нест.',
    noChapter: 'Бе боб',
    repeatAyah: 'Такрор',
    translationLabel: 'Тарҷума',
    playAllFailed: 'Файли яклухти сура ёфт нашуд — оятҳо пай дар пай мехонанд.',
    askTitle: 'Саволи худро нависед',
    askPrivacy: 'Савол ва пешниҳоди шумо танҳо барои мудир намоён аст. Ҷавоб ҳамин ҷо, дар «Саволҳои ман» меояд. Дигарон намебинанд.',
    askNameLabel: 'Ном (ихтиёрӣ)',
    askPlaceholder: 'Саволи худро нависед...',
    askSend: 'Фиристодан',
    askSent: 'Савол фиристода шуд. Ҷавобро дар поён мебинед.',
    askEmpty: 'Саволро нависед (ҳадди ақал 3 ҳарф).',
    myQuestions: 'Саволҳои ман',
    askPending: 'Интизори ҷавоб',
    askAnswerLabel: 'Ҷавоби мудир:',
    askRefresh: 'Навсозӣ',
    askNone: 'Шумо ҳоло савол надодаед.',
    askUnavailable: 'Хидмати савол ҳанӯз танзим нашудааст. Баъдтар кӯшиш кунед.',
    askOnThisDevice: 'Саволҳо дар ҳамин дастгоҳ нигоҳ дошта мешаванд.'
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
    hadithWord: 'хадис',
    quranWord: 'Священный Коран',
    surahWord: 'Сура',
    ayahsCount: 'аятов',
    ayahWord: 'аят',
    makki: 'Мекканская',
    madani: 'Мединская',
    playAyah: 'Слушать',
    playFrom: 'До конца',
    playAll: 'С начала до конца',
    stopAudio: 'Остановить',
    reciter: 'Чтец',
    surahFilter: 'Поиск суры (название или номер)...',
    surahLoading: 'Сура загружается...',
    surahError: 'Не удалось загрузить суру. Проверьте интернет.',
    retry: 'Повторить',
    quranSource: 'Текст и аудио: api.alquran.cloud · Перевод: Э. Кулиев · Таджикский: Абдулмухаммад Айати',
    extraMaterials: 'Дополнительные материалы',
    audioUnavailable: 'Аудио для этого аята недоступно.',
    noChapter: 'Без раздела',
    repeatAyah: 'Повтор',
    translationLabel: 'Перевод',
    playAllFailed: 'Файл целой суры не найден — аяты читаются по очереди.',
    askTitle: 'Напишите свой вопрос',
    askPrivacy: 'Ваш вопрос или предложение видит только администратор. Ответ придёт сюда, в «Мои вопросы». Другие пользователи его не видят.',
    askNameLabel: 'Имя (необязательно)',
    askPlaceholder: 'Напишите свой вопрос...',
    askSend: 'Отправить',
    askSent: 'Вопрос отправлен. Ответ появится ниже.',
    askEmpty: 'Напишите вопрос (минимум 3 символа).',
    myQuestions: 'Мои вопросы',
    askPending: 'Ожидает ответа',
    askAnswerLabel: 'Ответ администратора:',
    askRefresh: 'Обновить',
    askNone: 'Вы пока не задавали вопросов.',
    askUnavailable: 'Сервис вопросов ещё не настроен. Попробуйте позже.',
    askOnThisDevice: 'Вопросы хранятся на этом устройстве.'
  }
}

const EMPTY_HADITH = {
  book_id: '',
  chapter_id: '',
  daily_date: '',
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
  chapter_id: '',
  daily_date: '',
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

/* ===== Арабӣ: сарф (тасрифи феъл) — ҳосилкунандаи қоидавӣ ===== */

const A_ = 'َ', U_ = 'ُ', I_ = 'ِ', O_ = 'ْ', SH_ = 'ّ'
const TU_ = 'ٌ', TI_ = 'ٍ', TA_ = 'ً'
const VMARK = { a: A_, u: U_, i: I_ }
const MARK_SET = new Set([A_, U_, I_, O_, SH_, TU_, TI_, TA_])
const AR_WEAK = ch => ch === 'و' || ch === 'ي'

/* ---------- воҳидҳо: ҳарф + ҳаракатҳо ---------- */

function toUnits(str) {
  const units = []
  for (const ch of String(str)) {
    if (MARK_SET.has(ch)) {
      const u = units[units.length - 1]
      if (!u) continue
      if (ch === SH_) u.sh = true
      else if (ch === A_) u.v = 'a'
      else if (ch === U_) u.v = 'u'
      else if (ch === I_) u.v = 'i'
      else if (ch === O_) u.v = '0'
      else if (ch === TU_) u.tan = 'u'
      else if (ch === TI_) u.tan = 'i'
      else if (ch === TA_) u.tan = 'a'
    } else {
      units.push({ c: ch, v: '', sh: false, tan: '', h: ch === 'ء' })
    }
  }
  return units
}

function fromUnits(units) {
  return units.map(u =>
    u.c +
    (u.sh ? SH_ : '') +
    (u.v ? (u.v === '0' ? O_ : VMARK[u.v]) : '') +
    (u.tan ? { u: TU_, i: TI_, a: TA_ }[u.tan] : '')
  ).join('')
}

function prevKind(units, k) {
  const p = units[k - 1]
  const pp = units[k - 2]
  if (!p) return 'start'
  if (p.c === 'ا' && !p.v) return 'ā'
  if (p.c === 'ي' && !p.v && pp && pp.v === 'i') return 'ī'
  if (p.c === 'و' && !p.v && pp && pp.v === 'u') return 'ū'
  if (p.c === 'ي' && p.v === '0') return 'y0'
  if (p.c === 'و' && p.v === '0') return 'w0'
  if (p.v === 'a' || p.v === 'i' || p.v === 'u') return p.v
  return '0'
}

const RANK = { i: 3, u: 2, a: 1, '0': 0, '': 0 }

function hamzaSeat(kind, hv, isFinal) {
  if (kind === 'start') return hv === 'i' ? 'إ' : 'أ'

  if (isFinal) {
    if (kind === 'a') return 'أ'
    if (kind === 'u') return 'ؤ'
    if (kind === 'i') return 'ئ'
    return 'ء'
  }

  if (kind === 'ā' || kind === 'ū' || kind === 'w0') {
    return hv === 'u' ? 'ؤ' : hv === 'i' ? 'ئ' : 'ء'
  }
  if (kind === 'ī' || kind === 'y0') return 'ئ'
  if (kind === '0') return hv === 'u' ? 'ؤ' : hv === 'i' ? 'ئ' : 'أ'

  const strongest = Math.max(RANK[kind], RANK[hv])
  return strongest === 3 ? 'ئ' : strongest === 2 ? 'ؤ' : 'أ'
}

/** Ҳамаи ислоҳҳои имлоӣ: ҳамза, мадда, воу/йо-и дароз, идғом. */
function fixWord(str) {
  let units = toUnits(str)

  // ҳамзаи аввал + ҳамзаи соқин: آ / أُو / إِي
  if (units.length > 1 && units[0].c === 'ء' && units[1].c === 'ء' && units[1].v === '0') {
    if (units[0].v === 'a') {
      units[0] = { c: 'آ', v: '', sh: false, tan: '', h: false }
      units.splice(1, 1)
    } else if (units[0].v === 'u') {
      units[0].c = 'أ'; units[0].h = false
      units[1] = { c: 'و', v: '', sh: false, tan: '', h: false }
    } else if (units[0].v === 'i') {
      units[0].c = 'إ'; units[0].h = false
      units[1] = { c: 'ي', v: '', sh: false, tan: '', h: false }
    }
  }

  // курсии ҳамза
  for (let k = 0; k < units.length; k += 1) {
    if (units[k].c !== 'ء') continue
    const seat = hamzaSeat(prevKind(units, k), units[k].v, k === units.length - 1)
    units[k].c = seat
    units[k].h = true
  }

  // أَ + ا  →  آ
  for (let k = 0; k < units.length - 1; k += 1) {
    const u = units[k]
    const n = units[k + 1]
    if (u.h && u.c === 'أ' && u.v === 'a' && !u.sh && n.c === 'ا' && !n.v) {
      u.c = 'آ'; u.v = ''; u.h = false
      units.splice(k + 1, 1)
    }
  }

  // воу/йо-и дароз ва алифи соқин
  for (let k = 1; k < units.length; k += 1) {
    const u = units[k]
    const p = units[k - 1]
    if (u.c === 'و' && u.v === '0' && p.v === 'u') u.v = ''
    else if (u.c === 'ي' && u.v === '0' && p.v === 'i') u.v = ''
    else if (u.c === 'و' && u.v === '0' && p.v === 'i') { u.c = 'ي'; u.v = '' }
    else if (u.c === 'ي' && u.v === '0' && p.v === 'u') { u.c = 'و'; u.v = '' }
    if (u.c === 'ا' && u.v === '0') u.v = ''
  }

  // идғом: تْت → تّ ва نْن → نّ
  for (let k = 0; k < units.length - 1; k += 1) {
    const u = units[k]
    const n = units[k + 1]
    if ((u.c === 'ت' || u.c === 'ن') && u.v === '0' && !u.sh && n.c === u.c && !n.sh) {
      n.sh = true
      units.splice(k, 1)
      k -= 1
    }
  }

  return fromUnits(units)
}

function withTanwin(str, kind = 'u') {
  const units = toUnits(fixWord(str))
  const last = units[units.length - 1]
  if (!last) return str
  last.v = ''
  last.tan = kind
  return fromUnits(units)
}

/* ---------- ҷадвалҳои пасванд ---------- */

const PRE_LETTERS = ['ي', 'ي', 'ي', 'ت', 'ت', 'ي', 'ت', 'ت', 'ت', 'ت', 'ت', 'ت', 'ء', 'ن']
const prefixes = vowel => PRE_LETTERS.map(letter => letter + vowel)

const AAN = A_ + 'ا' + 'ن' + I_
const UUN = U_ + 'و' + 'ن' + A_
const IIN = I_ + 'ي' + 'ن' + A_
const NA = O_ + 'ن' + A_

const SFX = {
  rafi: [U_, AAN, UUN, U_, AAN, NA, U_, AAN, UUN, IIN, AAN, NA, U_, U_],
  nasb: [A_, A_ + 'ا', U_ + 'وا', A_, A_ + 'ا', NA, A_, A_ + 'ا', U_ + 'وا', I_ + 'ي', A_ + 'ا', NA, A_, A_],
  jazm: [O_, A_ + 'ا', U_ + 'وا', O_, A_ + 'ا', NA, O_, A_ + 'ا', U_ + 'وا', I_ + 'ي', A_ + 'ا', NA, O_, O_]
}

const PAST_SFX = [
  A_,
  A_ + 'ا',
  U_ + 'وا',
  A_ + 'ت' + O_,
  A_ + 'ت' + A_ + 'ا',
  O_ + 'ن' + A_,
  O_ + 'ت' + A_,
  O_ + 'ت' + U_ + 'م' + A_ + 'ا',
  O_ + 'ت' + U_ + 'م' + O_,
  O_ + 'ت' + I_,
  O_ + 'ت' + U_ + 'م' + A_ + 'ا',
  O_ + 'ت' + U_ + 'ن' + SH_ + A_,
  O_ + 'ت' + U_,
  O_ + 'ن' + A_ + 'ا'
]

const MOODS = ['rafi', 'nasb', 'jazm']
const SHORT_PERSONS = {
  rafi: new Set([5, 11]),
  nasb: new Set([5, 11]),
  jazm: new Set([0, 3, 5, 6, 11, 12, 13])
}

const range = n => Array.from({ length: n }, (_, k) => k)

/* ---------- тасниф ва тасҳеҳи реша ---------- */

function normalizeLetters(text) {
  return String(text || '')
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآؤئ]/g, 'ء')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ة')
    .replace(/\s+/g, '')
}

function classifyRoot(r) {
  const weak = r.map(AR_WEAK)
  const hamza = r.map(ch => ch === 'ء')
  if (weak[0] && weak[2]) return 'lafifMafruq'
  if (weak[1] && weak[2]) return 'lafifMaqrun'
  if (weak[2]) return 'naqis'
  if (weak[1]) return 'ajwaf'
  if (weak[0] && r[0] === 'و') return 'mithal'
  if (r[1] === r[2] && !hamza[1]) return 'mudaaf'
  if (hamza.some(Boolean)) return 'mahmuz'
  return 'sahih'
}

/* ---------- сохтани феъли сулосии муҷарад (шакли I) ---------- */

function pastSound(stemV, stemC) {
  return range(14).map(j => fixWord((j < 5 ? stemV : stemC) + PAST_SFX[j]))
}

function presentSound(pre, coreLong, coreShort, shortSet, jazmOverride) {
  const out = {}
  MOODS.forEach(mood => {
    out[mood] = range(14).map(j => {
      const useShort = coreShort && shortSet[mood].has(j)
      let sfx = SFX[mood][j]
      if (mood === 'jazm' && jazmOverride && jazmOverride.has(j)) sfx = A_
      return fixWord(pre[j] + (useShort ? coreShort : coreLong) + sfx)
    })
  })
  return out
}

/** Феъли нақис: ҷадвали пурра. */
function naqisPast(R, kind) {
  // R = ҳарфҳои аввал бо ҳаракат (масалан 'رَمَ'); kind: 'aY' | 'aW' | 'i'
  const y = 'ي'
  const w = 'و'
  if (kind === 'aY') {
    return [R + 'ى', R + y + A_ + 'ا', R + w + O_ + 'ا', R + 'ت' + O_, R + 'ت' + A_ + 'ا', R + y + O_ + 'ن' + A_,
      R + y + O_ + 'ت' + A_, R + y + O_ + 'ت' + U_ + 'م' + A_ + 'ا', R + y + O_ + 'ت' + U_ + 'م' + O_, R + y + O_ + 'ت' + I_,
      R + y + O_ + 'ت' + U_ + 'م' + A_ + 'ا', R + y + O_ + 'ت' + U_ + 'ن' + SH_ + A_, R + y + O_ + 'ت' + U_, R + y + O_ + 'ن' + A_ + 'ا']
  }
  if (kind === 'aW') {
    return [R + 'ا', R + w + A_ + 'ا', R + w + O_ + 'ا', R + 'ت' + O_, R + 'ت' + A_ + 'ا', R + w + O_ + 'ن' + A_,
      R + w + O_ + 'ت' + A_, R + w + O_ + 'ت' + U_ + 'م' + A_ + 'ا', R + w + O_ + 'ت' + U_ + 'م' + O_, R + w + O_ + 'ت' + I_,
      R + w + O_ + 'ت' + U_ + 'م' + A_ + 'ا', R + w + O_ + 'ت' + U_ + 'ن' + SH_ + A_, R + w + O_ + 'ت' + U_, R + w + O_ + 'ن' + A_ + 'ا']
  }
  // 'i': رَضِيَ — R бо касра тамом мешавад
  const Rd = R.slice(0, -1) + U_
  return [R + y + A_, R + y + A_ + 'ا', Rd + 'وا', R + y + A_ + 'ت' + O_, R + y + A_ + 'ت' + A_ + 'ا', R + y + 'ن' + A_,
    R + y + 'ت' + A_, R + y + 'ت' + U_ + 'م' + A_ + 'ا', R + y + 'ت' + U_ + 'م' + O_, R + y + 'ت' + I_,
    R + y + 'ت' + U_ + 'م' + A_ + 'ا', R + y + 'ت' + U_ + 'ن' + SH_ + A_, R + y + 'ت' + U_, R + y + 'ن' + A_ + 'ا'].map(s => s)
}

function naqisPresent(pre, S, family) {
  // S = асос бо ҳаракати охир (кастра/замма/фатҳа); family: 'I' | 'U' | 'A'
  const Sd = S.slice(0, -1) // бе ҳаракати охир
  const out = { rafi: [], nasb: [], jazm: [] }
  const dual = (mood) => (family === 'U' ? S + 'و' : family === 'I' ? S + 'ي' : S + 'ي')
  for (let j = 0; j < 14; j += 1) {
    const p = pre[j]
    const kindOfPerson = j === 1 || j === 4 || j === 7 || j === 10 ? 'dual'
      : j === 2 || j === 8 ? 'mp'
        : j === 5 || j === 11 ? 'fp'
          : j === 9 ? 'fs' : 'one'
    let rafi, nasb, jazm
    if (family === 'I') {
      if (kindOfPerson === 'one') { rafi = S + 'ي'; nasb = S + 'ي' + A_; jazm = S }
      else if (kindOfPerson === 'dual') { rafi = S + 'ي' + A_ + 'ا' + 'ن' + I_; nasb = S + 'ي' + A_ + 'ا'; jazm = nasb }
      else if (kindOfPerson === 'mp') { rafi = Sd + U_ + 'و' + 'ن' + A_; nasb = Sd + U_ + 'وا'; jazm = nasb }
      else if (kindOfPerson === 'fp') { rafi = S + 'ي' + 'ن' + A_; nasb = rafi; jazm = rafi }
      else { rafi = S + 'ي' + 'ن' + A_; nasb = S + 'ي'; jazm = nasb }
    } else if (family === 'U') {
      if (kindOfPerson === 'one') { rafi = S + 'و'; nasb = S + 'و' + A_; jazm = S }
      else if (kindOfPerson === 'dual') { rafi = S + 'و' + A_ + 'ا' + 'ن' + I_; nasb = S + 'و' + A_ + 'ا'; jazm = nasb }
      else if (kindOfPerson === 'mp') { rafi = S + 'و' + 'ن' + A_; nasb = S + 'وا'; jazm = nasb }
      else if (kindOfPerson === 'fp') { rafi = S + 'و' + 'ن' + A_; nasb = rafi; jazm = rafi }
      else { rafi = Sd + I_ + 'ي' + 'ن' + A_; nasb = Sd + I_ + 'ي'; jazm = nasb }
    } else {
      if (kindOfPerson === 'one') { rafi = S + 'ى'; nasb = S + 'ى'; jazm = S }
      else if (kindOfPerson === 'dual') { rafi = S + 'ي' + A_ + 'ا' + 'ن' + I_; nasb = S + 'ي' + A_ + 'ا'; jazm = nasb }
      else if (kindOfPerson === 'mp') { rafi = S + 'و' + O_ + 'ن' + A_; nasb = S + 'و' + O_ + 'ا'; jazm = nasb }
      else if (kindOfPerson === 'fp') { rafi = S + 'ي' + O_ + 'ن' + A_; nasb = rafi; jazm = rafi }
      else { rafi = S + 'ي' + O_ + 'ن' + A_; nasb = S + 'ي' + O_; jazm = nasb }
    }
    out.rafi.push(fixWord(p + rafi))
    out.nasb.push(fixWord(p + nasb))
    out.jazm.push(fixWord(p + jazm))
  }
  return out
}

const IRREGULAR_AMR = new Set(['ءكل', 'ءخذ', 'ءمر'])

/** Амр аз шаклҳои ҷазми шахси дуюм. */
function buildAmr(jazm2, waslKind, root, formI) {
  if (formI && IRREGULAR_AMR.has(root.join(''))) {
    const [, r2, r3] = root
    const core = r2 + U_ + r3
    const sfx = [O_, A_ + 'ا', U_ + 'وا', I_ + 'ي', A_ + 'ا', O_ + 'ن' + A_]
    return sfx.map(s => fixWord(core + s))
  }

  return jazm2.map(word => {
    const units = toUnits(word)
    units.shift() // префикси تَ / تُ
    if (!units.length) return word
    if (units[0].v === '0') {
      const wasl = waslKind === 'qat'
        ? { c: 'ء', v: 'a', sh: false, tan: '', h: true }
        : { c: 'ا', v: waslKind, sh: false, tan: '', h: false }
      units.unshift(wasl)
    }
    return fixWord(fromUnits(units))
  })
}

function formI(r, pv, mv) {
  const [r1, r2, r3] = r
  const cls = classifyRoot(r)
  const pvm = VMARK[pv]
  const mvv = mv === 'd' ? 'a' : mv
  const mvm = VMARK[mvv]
  const dropWaw = r1 === 'و' && (mv === 'i' || mv === 'd')
  const preA = prefixes(A_)
  const preU = prefixes(U_)
  const result = { cls, past: {}, pres: {}, amr: [], nahy: [] }

  if (cls === 'naqis' || cls === 'lafifMafruq' || cls === 'lafifMaqrun') {
    const family = r3 === 'و' && mvv === 'u' ? 'U' : mvv === 'a' ? 'A' : 'I'
    const pastKind = pv === 'i' ? 'i' : (r3 === 'و' ? 'aW' : 'aY')
    const dropFirst = cls === 'lafifMafruq' && dropWaw
    const isRaa = r.join('') === 'رءي'
    const stemAct = isRaa ? r1 + A_ : (dropFirst ? r2 : r1 + O_ + r2) + mvm
    const stemPas = isRaa ? r1 + A_ : r1 + O_ + r2 + A_

    result.past.act = naqisPast(r1 + A_ + r2 + (pastKind === 'i' ? I_ : A_), pastKind).map(fixWord)
    result.past.pas = naqisPast(r1 + U_ + r2 + I_, 'i').map(fixWord)
    result.pres.act = naqisPresent(preA, stemAct, family)
    result.pres.pas = naqisPresent(preU, stemPas, 'A')
    result.fail = withTanwin(r1 + A_ + 'ا' + r2, 'i')
    result.mafool = r3 === 'و'
      ? fixWord('م' + A_ + r1 + O_ + r2 + U_ + 'و' + SH_ + TU_)
      : fixWord('م' + A_ + r1 + O_ + r2 + I_ + 'ي' + SH_ + TU_)
    result.waslKind = mvv === 'u' ? 'u' : 'i'
  } else if (cls === 'ajwaf') {
    const longV = { u: U_ + 'و', i: I_ + 'ي', a: A_ + 'ا' }[mvv]
    const pastShort = pv === 'a' ? (r2 === 'و' ? U_ : I_) : (pv === 'i' ? I_ : U_)
    const stemV = r1 + A_ + 'ا' + r3
    const stemC = r1 + pastShort + r3
    result.past.act = pastSound(stemV, stemC)
    result.past.pas = pastSound(r1 + I_ + 'ي' + r3, r1 + I_ + r3)
    result.pres.act = presentSound(preA, r1 + longV + r3, r1 + mvm + r3, SHORT_PERSONS)
    result.pres.pas = presentSound(preU, r1 + A_ + 'ا' + r3, r1 + A_ + r3, SHORT_PERSONS)
    result.fail = r3 === 'ء'
      ? withTanwin(r1 + A_ + 'ا' + 'ء', 'i')
      : withTanwin(r1 + A_ + 'ا' + 'ء' + I_ + r3)
    result.mafool = r2 === 'و'
      ? withTanwin('م' + A_ + r1 + U_ + 'و' + r3)
      : withTanwin('م' + A_ + r1 + I_ + 'ي' + r3)
    result.waslKind = 'i'
  } else if (cls === 'mudaaf') {
    const stemV = r1 + A_ + r2 + SH_
    const stemC = r1 + A_ + r2 + pvm + r3
    result.past.act = pastSound(stemV, stemC)
    result.past.pas = pastSound(r1 + U_ + r2 + SH_, r1 + U_ + r2 + I_ + r3)
    const gem = new Set([0, 3, 6, 12, 13])
    result.pres.act = presentSound(preA, r1 + mvm + r2 + SH_, r1 + O_ + r2 + mvm + r3, SHORT_PERSONS_ALL_MOODS, gem)
    result.pres.pas = presentSound(preU, r1 + A_ + r2 + SH_, r1 + O_ + r2 + A_ + r3, SHORT_PERSONS_ALL_MOODS, gem)
    result.fail = withTanwin(r1 + A_ + 'ا' + r2 + SH_)
    result.mafool = withTanwin('م' + A_ + r1 + O_ + r2 + U_ + 'و' + r3)
    result.waslKind = mvv === 'u' ? 'u' : 'i'
  } else {
    // саҳеҳ, мисол, маҳмуз
    const stem = r1 + A_ + r2 + pvm + r3
    const core = dropWaw ? r2 + (mv === 'd' ? A_ : mvm) + r3 : r1 + O_ + r2 + mvm + r3
    result.past.act = pastSound(stem, stem)
    result.past.pas = pastSound(r1 + U_ + r2 + I_ + r3, r1 + U_ + r2 + I_ + r3)
    result.pres.act = presentSound(preA, core, null, SHORT_PERSONS)
    result.pres.pas = presentSound(preU, r1 + O_ + r2 + A_ + r3, null, SHORT_PERSONS)
    result.fail = withTanwin(r1 + A_ + 'ا' + r2 + I_ + r3)
    result.mafool = withTanwin('م' + A_ + r1 + O_ + r2 + U_ + 'و' + r3)
    result.waslKind = mvv === 'u' ? 'u' : 'i'
  }

  return result
}

const SHORT_PERSONS_ALL_MOODS = {
  rafi: new Set([5, 11]),
  nasb: new Set([5, 11]),
  jazm: new Set([5, 11])
}

/* ---------- феълҳои мазид (II–X), танҳо барои решаи саҳеҳ ---------- */

const DERIVED = {
  2: { past: 'فَعَّل', pastP: 'فُعِّل', pre: U_, core: 'فَعِّل', coreP: 'فَعَّل', fa: 'مُفَعِّل', ma: 'مُفَعَّل', ms: 'تَفْعِيل' },
  3: { past: 'فَاعَل', pastP: 'فُوعِل', pre: U_, core: 'فَاعِل', coreP: 'فَاعَل', fa: 'مُفَاعِل', ma: 'مُفَاعَل', ms: 'مُفَاعَلَة' },
  4: { past: 'أَفْعَل', pastP: 'أُفْعِل', pre: U_, core: 'فْعِل', coreP: 'فْعَل', fa: 'مُفْعِل', ma: 'مُفْعَل', ms: 'إِفْعَال', wasl: 'qat' },
  5: { past: 'تَفَعَّل', pastP: 'تُفُعِّل', pre: A_, core: 'تَفَعَّل', coreP: 'تَفَعَّل', fa: 'مُتَفَعِّل', ma: 'مُتَفَعَّل', ms: 'تَفَعُّل' },
  6: { past: 'تَفَاعَل', pastP: 'تُفُوعِل', pre: A_, core: 'تَفَاعَل', coreP: 'تَفَاعَل', fa: 'مُتَفَاعِل', ma: 'مُتَفَاعَل', ms: 'تَفَاعُل' },
  7: { past: 'اِنْفَعَل', pastP: 'اُنْفُعِل', pre: A_, core: 'نْفَعِل', coreP: 'نْفَعَل', fa: 'مُنْفَعِل', ma: 'مُنْفَعَل', ms: 'اِنْفِعَال', wasl: 'i' },
  8: { past: 'اِفْتَعَل', pastP: 'اُفْتُعِل', pre: A_, core: 'فْتَعِل', coreP: 'فْتَعَل', fa: 'مُفْتَعِل', ma: 'مُفْتَعَل', ms: 'اِفْتِعَال', wasl: 'i' },
  10: { past: 'اِسْتَفْعَل', pastP: 'اُسْتُفْعِل', pre: A_, core: 'سْتَفْعِل', coreP: 'سْتَفْعَل', fa: 'مُسْتَفْعِل', ma: 'مُسْتَفْعَل', ms: 'اِسْتِفْعَال', wasl: 'i' }
}

function fill(template, r) {
  return template.replace(/[فعل]/g, ch => ({ 'ف': r[0], 'ع': r[1], 'ل': r[2] }[ch]))
}

function derived(r, form) {
  const [r1, r2, r3] = r
  const result = { cls: classifyRoot(r), past: {}, pres: {}, amr: [], nahy: [] }

  if (form === 9) {
    const preA = prefixes(A_)
    const stemV = 'اِ' + r1 + O_ + r2 + A_ + r3 + SH_
    const stemC = 'اِ' + r1 + O_ + r2 + A_ + r3 + A_ + r3
    result.past.act = pastSound(stemV, stemC)
    result.past.pas = null
    result.pres.act = presentSound(preA, r1 + O_ + r2 + A_ + r3 + SH_, r1 + O_ + r2 + A_ + r3 + I_ + r3,
      SHORT_PERSONS_ALL_MOODS, new Set([0, 3, 6, 12, 13]))
    result.pres.pas = null
    result.fail = withTanwin('مُ' + r1 + O_ + r2 + A_ + r3 + SH_)
    result.mafool = ''
    result.masdar = withTanwin('اِ' + r1 + O_ + r2 + I_ + r3 + A_ + 'ا' + r3)
    result.waslKind = 'i'
    return result
  }

  const d = DERIVED[form]
  const stem = fill(d.past, r)
  const stemP = fill(d.pastP, r)
  result.past.act = pastSound(stem, stem)
  result.past.pas = pastSound(stemP, stemP)
  result.pres.act = presentSound(prefixes(d.pre), fill(d.core, r), null, SHORT_PERSONS)
  result.pres.pas = presentSound(prefixes(U_), fill(d.coreP, r), null, SHORT_PERSONS)
  result.fail = withTanwin(fill(d.fa, r))
  result.mafool = withTanwin(fill(d.ma, r))
  result.masdar = withTanwin(fill(d.ms, r))
  result.waslKind = d.wasl || 'i'
  return result
}

/* ---------- API-и асосӣ ---------- */

const FORM_NAMES = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X' }

function canConjugate(root, form) {
  const r = normalizeLetters(root).split('')
  if (r.length !== 3) return false
  if (form === 1) return true
  if (!DERIVED[form] && form !== 9) return false
  const cls = classifyRoot(r)
  return cls === 'sahih' || (cls === 'mahmuz' && r[0] !== 'ء')
}

function conjugate({ root, form = 1, pv = 'a', mv = 'u', masdar = '' }) {
  const r = normalizeLetters(root).split('')
  if (r.length !== 3 || !canConjugate(root, form)) return null

  const base = form === 1 ? formI(r, pv, mv) : derived(r, form)
  const act = base.pres.act
  const amrSource = act.jazm.slice(6, 12)

  const wasl = form === 1 ? base.waslKind : (base.waslKind || 'i')
  const amr = buildAmr(amrSource, wasl, r, form === 1)
  const nahy = amrSource.map(word => fixWord('لَا ' + word.replace(/\s+/g, '')))

  const hasTan = /[\u064B-\u064D]/.test(masdar || '')
  const masdarText = masdar ? (hasTan ? fixWord(masdar) : withTanwin(masdar)) : (base.masdar || '')

  return {
    root: r.join(''),
    form,
    cls: base.cls,
    past: base.past,
    pres: base.pres,
    amr,
    nahy,
    fail: base.fail || '',
    mafool: base.mafool || '',
    masdar: masdarText
  }
}

function fixText(text) {
  return fixWord(text)
}

/* ===== Арабӣ: луғати феълҳо, назария ва интерфейс ===== */

const ARB_BABS = [
  { id: 'a-u', pv: 'a', mv: 'u', label: 'فَعَلَ – يَفْعُلُ' },
  { id: 'a-i', pv: 'a', mv: 'i', label: 'فَعَلَ – يَفْعِلُ' },
  { id: 'a-a', pv: 'a', mv: 'a', label: 'فَعَلَ – يَفْعَلُ' },
  { id: 'i-a', pv: 'i', mv: 'a', label: 'فَعِلَ – يَفْعَلُ' },
  { id: 'u-u', pv: 'u', mv: 'u', label: 'فَعُلَ – يَفْعُلُ' },
  { id: 'i-i', pv: 'i', mv: 'i', label: 'فَعِلَ – يَفْعِلُ' },
  { id: 'a-d', pv: 'a', mv: 'd', label: 'فَعَلَ – يَفْعَلُ (وَعَدَ ↔ وَضَعَ)' }
]

const ARB_FORMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

/* [реша, шакл, боб, масдар, тоҷикӣ, русӣ] */
const ARB_SEED = [
  ['كتب', 1, 'a-u', 'كِتَابَة', 'навиштан', 'писать'],
  ['ضرب', 1, 'a-i', 'ضَرْب', 'задан', 'бить'],
  ['فتح', 1, 'a-a', 'فَتْح', 'кушодан', 'открывать'],
  ['نصر', 1, 'a-u', 'نَصْر', 'ёрӣ додан', 'помогать'],
  ['علم', 1, 'i-a', 'عِلْم', 'донистан', 'знать'],
  ['سمع', 1, 'i-a', 'سَمْع', 'шунидан', 'слышать'],
  ['شرب', 1, 'i-a', 'شُرْب', 'нӯшидан', 'пить'],
  ['ذهب', 1, 'a-a', 'ذَهَاب', 'рафтан', 'идти, уходить'],
  ['خرج', 1, 'a-u', 'خُرُوج', 'баромадан', 'выходить'],
  ['دخل', 1, 'a-u', 'دُخُول', 'даромадан', 'входить'],
  ['جلس', 1, 'a-i', 'جُلُوس', 'нишастан', 'сидеть'],
  ['قعد', 1, 'a-u', 'قُعُود', 'нишастан', 'сидеть'],
  ['فهم', 1, 'i-a', 'فَهْم', 'фаҳмидан', 'понимать'],
  ['حمل', 1, 'a-i', 'حَمْل', 'бардоштан', 'нести'],
  ['قتل', 1, 'a-u', 'قَتْل', 'куштан', 'убивать'],
  ['أكل', 1, 'a-u', 'أَكْل', 'хӯрдан', 'есть'],
  ['أخذ', 1, 'a-u', 'أَخْذ', 'гирифтан', 'брать'],
  ['أمر', 1, 'a-u', 'أَمْر', 'фармудан', 'приказывать'],
  ['سأل', 1, 'a-a', 'سُؤَال', 'пурсидан', 'спрашивать'],
  ['قرأ', 1, 'a-a', 'قِرَاءَة', 'хондан', 'читать'],
  ['بدأ', 1, 'a-a', 'بَدْء', 'оғоз кардан', 'начинать'],
  ['وصل', 1, 'a-i', 'وُصُول', 'расидан', 'прибывать, достигать'],
  ['وعد', 1, 'a-i', 'وَعْد', 'ваъда додан', 'обещать'],
  ['وجد', 1, 'a-i', 'وُجُود', 'ёфтан', 'находить'],
  ['وقف', 1, 'a-i', 'وُقُوف', 'истодан', 'стоять, останавливаться'],
  ['ولد', 1, 'a-i', 'وِلَادَة', 'зоидан', 'рождать'],
  ['وزن', 1, 'a-i', 'وَزْن', 'вазн кардан', 'взвешивать'],
  ['وضع', 1, 'a-d', 'وَضْع', 'гузоштан', 'класть'],
  ['وقع', 1, 'a-d', 'وُقُوع', 'афтодан, воқеъ шудан', 'падать, происходить'],
  ['وهب', 1, 'a-d', 'هِبَة', 'бахшидан', 'дарить'],
  ['وسع', 1, 'i-d', 'سَعَة', 'васеъ будан', 'вмещать, быть просторным'],
  ['قول', 1, 'a-u', 'قَوْل', 'гуфтан', 'говорить'],
  ['بيع', 1, 'a-i', 'بَيْع', 'фурӯхтан', 'продавать'],
  ['نوم', 1, 'i-a', 'نَوْم', 'хуфтан', 'спать'],
  ['خوف', 1, 'i-a', 'خَوْف', 'тарсидан', 'бояться'],
  ['كون', 1, 'a-u', 'كَوْن', 'будан', 'быть'],
  ['زور', 1, 'a-u', 'زِيَارَة', 'зиёрат кардан', 'посещать'],
  ['عود', 1, 'a-u', 'عَوْدَة', 'баргаштан', 'возвращаться'],
  ['قوم', 1, 'a-u', 'قِيَام', 'бархостан', 'вставать'],
  ['سير', 1, 'a-i', 'سَيْر', 'роҳ рафтан', 'идти, ехать'],
  ['جيء', 1, 'a-i', 'مَجِيء', 'омадан', 'приходить'],
  ['شيء', 1, 'a-i', 'مَشِيئَة', 'хостан', 'желать'],
  ['نيل', 1, 'i-a', 'نَيْل', 'ба даст овардан', 'достигать'],
  ['موت', 1, 'i-u', 'مَوْت', 'мурдан', 'умирать'],
  ['طوف', 1, 'a-u', 'طَوَاف', 'давр задан', 'обходить'],
  ['صوم', 1, 'a-u', 'صَوْم', 'рӯза доштан', 'поститься'],
  ['دعو', 1, 'a-u', 'دُعَاء', 'даъват кардан', 'звать, молиться'],
  ['غزو', 1, 'a-u', 'غَزْو', 'ғазо кардан', 'воевать'],
  ['تلو', 1, 'a-u', 'تِلَاوَة', 'тиловат кардан', 'читать (Коран)'],
  ['عفو', 1, 'a-u', 'عَفْو', 'бахшидан', 'прощать'],
  ['رمي', 1, 'a-i', 'رَمْي', 'партофтан', 'бросать'],
  ['بكي', 1, 'a-i', 'بُكَاء', 'гиристан', 'плакать'],
  ['مشي', 1, 'a-i', 'مَشْي', 'пиёда рафтан', 'ходить пешком'],
  ['بني', 1, 'a-i', 'بِنَاء', 'сохтан', 'строить'],
  ['هدي', 1, 'a-i', 'هِدَايَة', 'ҳидоят кардан', 'вести прямым путём'],
  ['نسي', 1, 'i-a', 'نِسْيَان', 'фаромӯш кардан', 'забывать'],
  ['رضي', 1, 'i-a', 'رِضًى', 'розӣ шудан', 'быть довольным'],
  ['بقي', 1, 'i-a', 'بَقَاء', 'мондан', 'оставаться'],
  ['سعي', 1, 'a-a', 'سَعْي', 'кӯшиш кардан', 'стараться'],
  ['رأي', 1, 'a-a', 'رُؤْيَة', 'дидан', 'видеть'],
  ['أتي', 1, 'a-i', 'إِتْيَان', 'омадан', 'приходить'],
  ['جري', 1, 'a-i', 'جَرْي', 'равон шудан', 'течь, бежать'],
  ['شكر', 1, 'a-u', 'شُكْر', 'ташаккур гуфтан', 'благодарить'],
  ['صبر', 1, 'a-i', 'صَبْر', 'сабр кардан', 'терпеть'],
  ['رزق', 1, 'a-i', 'رِزْق', 'рӯзӣ додан', 'наделять уделом'],
  ['خلق', 1, 'a-u', 'خَلْق', 'офаридан', 'создавать'],
  ['غفر', 1, 'a-i', 'مَغْفِرَة', 'омурзидан', 'прощать'],
  ['رحم', 1, 'i-a', 'رَحْمَة', 'марҳамат кардан', 'миловать'],
  ['حفظ', 1, 'i-a', 'حِفْظ', 'ҳифз кардан', 'хранить, заучивать'],
  ['حكم', 1, 'a-u', 'حُكْم', 'ҳукм кардан', 'судить, управлять'],
  ['عبد', 1, 'a-u', 'عِبَادَة', 'ибодат кардан', 'поклоняться'],
  ['سجد', 1, 'a-u', 'سُجُود', 'саҷда кардан', 'совершать земной поклон'],
  ['ركع', 1, 'a-a', 'رُكُوع', 'рукӯъ кардан', 'совершать поясной поклон'],
  ['ظلم', 1, 'a-i', 'ظُلْم', 'ситам кардан', 'притеснять'],
  ['جمع', 1, 'a-a', 'جَمْع', 'ҷамъ кардан', 'собирать'],
  ['منع', 1, 'a-a', 'مَنْع', 'манъ кардан', 'запрещать'],
  ['رفع', 1, 'a-a', 'رَفْع', 'боло бардоштан', 'поднимать'],
  ['نفع', 1, 'a-a', 'نَفْع', 'фоида расондан', 'приносить пользу'],
  ['قطع', 1, 'a-a', 'قَطْع', 'буридан', 'резать, прерывать'],
  ['بحث', 1, 'a-a', 'بَحْث', 'ҷустуҷӯ кардан', 'искать, исследовать'],
  ['زرع', 1, 'a-a', 'زَرْع', 'киштан', 'сеять'],
  ['لعب', 1, 'i-a', 'لَعِب', 'бозӣ кардан', 'играть'],
  ['عمل', 1, 'i-a', 'عَمَل', 'кор кардан', 'работать, делать'],
  ['حزن', 1, 'i-a', 'حُزْن', 'ғамгин шудан', 'печалиться'],
  ['فرح', 1, 'i-a', 'فَرَح', 'шод шудан', 'радоваться'],
  ['كرم', 1, 'u-u', 'كَرَم', 'саховатманд будан', 'быть щедрым'],
  ['حسن', 1, 'u-u', 'حُسْن', 'нек будан', 'быть красивым, хорошим'],
  ['صغر', 1, 'u-u', 'صِغَر', 'хурд будан', 'быть маленьким'],
  ['كبر', 1, 'i-u', 'كِبَر', 'калон будан', 'быть большим'],
  ['ملك', 1, 'i-i', 'مُلْك', 'молик будан', 'владеть'],
  ['حسب', 1, 'i-i', 'حِسَاب', 'ҳисоб кардан', 'считать'],
  ['طلب', 1, 'a-u', 'طَلَب', 'талаб кардан', 'просить, требовать'],
  ['بعث', 1, 'a-a', 'بَعْث', 'фиристодан', 'посылать'],
  ['ترك', 1, 'a-u', 'تَرْك', 'тарк кардан', 'оставлять'],
  ['سكن', 1, 'a-u', 'سُكُون', 'сокин шудан', 'жить, быть спокойным'],
  ['نزل', 1, 'a-i', 'نُزُول', 'фуромадан', 'спускаться'],
  ['رجع', 1, 'a-i', 'رُجُوع', 'баргаштан', 'возвращаться'],
  ['سرق', 1, 'a-i', 'سَرِقَة', 'дуздидан', 'красть'],
  ['هلك', 1, 'a-i', 'هَلَاك', 'ҳалок шудан', 'гибнуть'],
  ['صدق', 1, 'a-u', 'صِدْق', 'рост гуфтан', 'говорить правду'],
  ['كذب', 1, 'a-i', 'كَذِب', 'дурӯғ гуфтан', 'лгать'],
  ['ضحك', 1, 'i-a', 'ضَحِك', 'хандидан', 'смеяться'],
  ['جعل', 1, 'a-a', 'جَعْل', 'гардондан', 'делать, превращать'],
  ['فعل', 1, 'a-a', 'فِعْل', 'кардан', 'совершать'],
  ['ذكر', 1, 'a-u', 'ذِكْر', 'ёд кардан', 'вспоминать, поминать'],
  ['ذبح', 1, 'a-a', 'ذَبْح', 'забҳ кардан', 'резать (жертву)'],
  ['غلب', 1, 'a-i', 'غَلَبَة', 'ғолиб омадан', 'побеждать'],
  ['ربح', 1, 'i-a', 'رِبْح', 'фоида гирифтан', 'получать прибыль'],
  ['خسر', 1, 'i-a', 'خُسْر', 'зиён дидан', 'терпеть убыток'],
  ['نظر', 1, 'a-u', 'نَظَر', 'нигоҳ кардан', 'смотреть'],
  ['سلم', 1, 'i-a', 'سَلَامَة', 'саломат будан', 'быть невредимым'],
  ['قدر', 1, 'a-i', 'قُدْرَة', 'тавонистан', 'мочь'],
  ['مدد', 1, 'a-u', 'مَدّ', 'кашидан, дароз кардан', 'тянуть, протягивать'],
  ['ظنن', 1, 'a-u', 'ظَنّ', 'гумон кардан', 'думать, полагать'],
  ['حبب', 1, 'a-i', 'حُبّ', 'дӯст доштан', 'любить'],
  ['ردد', 1, 'a-u', 'رَدّ', 'бозгардондан, ҷавоб додан', 'возвращать, отвечать'],
  ['عدد', 1, 'a-u', 'عَدّ', 'шумурдан', 'считать'],
  ['شدد', 1, 'a-i', 'شَدّ', 'маҳкам кардан', 'затягивать'],
  ['ضلل', 1, 'a-i', 'ضَلَال', 'гумроҳ шудан', 'заблуждаться'],
  ['مرر', 1, 'a-u', 'مُرُور', 'гузаштан', 'проходить'],
  ['فرر', 1, 'a-i', 'فِرَار', 'гурехтан', 'убегать'],
  ['حجج', 1, 'a-u', 'حَجّ', 'ҳаҷ кардан', 'совершать хаджж'],
  ['مسس', 1, 'a-u', 'مَسّ', 'расидан, даст расондан', 'касаться'],
  ['علم', 2, '', 'تَعْلِيم', 'омӯзондан', 'обучать'],
  ['كسر', 2, '', 'تَكْسِير', 'шикастан (бисёр)', 'разбивать (многократно)'],
  ['قدم', 2, '', 'تَقْدِيم', 'пеш гузоштан, пешниҳод кардан', 'представлять, предлагать'],
  ['درس', 2, '', 'تَدْرِيس', 'дарс додан', 'преподавать'],
  ['حدث', 2, '', 'تَحْدِيث', 'нақл кардан', 'рассказывать'],
  ['حضر', 2, '', 'تَحْضِير', 'омода кардан', 'готовить'],
  ['قتل', 3, '', 'قِتَال', 'ҷангидан', 'сражаться'],
  ['سعد', 3, '', 'مُسَاعَدَة', 'кумак кардан', 'помогать'],
  ['كتب', 3, '', 'مُكَاتَبَة', 'мукотиба кардан', 'переписываться'],
  ['جهد', 3, '', 'جِهَاد', 'ҷиҳод кардан', 'усердствовать, вести джихад'],
  ['شهد', 3, '', 'مُشَاهَدَة', 'мушоҳида кардан', 'наблюдать'],
  ['كرم', 4, '', 'إِكْرَام', 'гиромӣ доштан', 'почитать'],
  ['رسل', 4, '', 'إِرْسَال', 'фиристодан', 'отправлять'],
  ['خرج', 4, '', 'إِخْرَاج', 'берун овардан', 'выводить'],
  ['نزل', 4, '', 'إِنْزَال', 'нозил кардан', 'ниспосылать'],
  ['سلم', 4, '', 'إِسْلَام', 'мусалмон шудан, таслим шудан', 'принимать ислам, покоряться'],
  ['علم', 4, '', 'إِعْلَام', 'хабар додан', 'сообщать'],
  ['حسن', 4, '', 'إِحْسَان', 'некӣ кардан', 'делать добро'],
  ['خبر', 4, '', 'إِخْبَار', 'хабар додан', 'извещать'],
  ['علم', 5, '', 'تَعَلُّم', 'омӯхтан', 'учиться'],
  ['كلم', 5, '', 'تَكَلُّم', 'сухан гуфтан', 'говорить'],
  ['قدم', 5, '', 'تَقَدُّم', 'пеш рафтан', 'продвигаться'],
  ['قتل', 6, '', 'تَقَاتُل', 'бо ҳам ҷангидан', 'сражаться друг с другом'],
  ['كتب', 6, '', 'تَكَاتُب', 'ҳамдигар навиштан', 'переписываться'],
  ['شرك', 6, '', 'تَشَارُك', 'ширкат варзидан', 'участвовать совместно'],
  ['كسر', 7, '', 'اِنْكِسَار', 'шикаста шудан', 'ломаться'],
  ['فتح', 7, '', 'اِنْفِتَاح', 'кушода шудан', 'открываться'],
  ['قطع', 7, '', 'اِنْقِطَاع', 'бурида шудан', 'прерываться'],
  ['جمع', 8, '', 'اِجْتِمَاع', 'ҷамъ шудан', 'собираться'],
  ['سمع', 8, '', 'اِسْتِمَاع', 'гӯш додан', 'слушать'],
  ['نظر', 8, '', 'اِنْتِظَار', 'мунтазир шудан', 'ждать'],
  ['قرب', 8, '', 'اِقْتِرَاب', 'наздик шудан', 'приближаться'],
  ['حمر', 9, '', 'اِحْمِرَار', 'сурх шудан', 'краснеть'],
  ['غفر', 10, '', 'اِسْتِغْفَار', 'омурзиш хостан', 'просить прощения'],
  ['خرج', 10, '', 'اِسْتِخْرَاج', 'берун кашидан', 'извлекать'],
  ['عمل', 10, '', 'اِسْتِعْمَال', 'истифода бурдан', 'использовать'],
  ['قبل', 10, '', 'اِسْتِقْبَال', 'истиқбол кардан', 'встречать'],
  ['فهم', 10, '', 'اِسْتِفْهَام', 'пурсидан', 'осведомляться'],
  ['كبر', 10, '', 'اِسْتِكْبَار', 'кибр кардан', 'возгордиться']
]

const ARB_PERSONS = [
  { ar: 'هُوَ', tg: 'ӯ (мард)', ru: 'он' },
  { ar: 'هُمَا', tg: 'онҳо (ду мард)', ru: 'они двое (м)' },
  { ar: 'هُمْ', tg: 'онҳо (мардон)', ru: 'они (м)' },
  { ar: 'هِيَ', tg: 'ӯ (зан)', ru: 'она' },
  { ar: 'هُمَا', tg: 'онҳо (ду зан)', ru: 'они двое (ж)' },
  { ar: 'هُنَّ', tg: 'онҳо (занон)', ru: 'они (ж)' },
  { ar: 'أَنْتَ', tg: 'ту (мард)', ru: 'ты (м)' },
  { ar: 'أَنْتُمَا', tg: 'шумо (ду нафар)', ru: 'вы двое (м)' },
  { ar: 'أَنْتُمْ', tg: 'шумо (мардон)', ru: 'вы (м)' },
  { ar: 'أَنْتِ', tg: 'ту (зан)', ru: 'ты (ж)' },
  { ar: 'أَنْتُمَا', tg: 'шумо (ду зан)', ru: 'вы двое (ж)' },
  { ar: 'أَنْتُنَّ', tg: 'шумо (занон)', ru: 'вы (ж)' },
  { ar: 'أَنَا', tg: 'ман', ru: 'я' },
  { ar: 'نَحْنُ', tg: 'мо', ru: 'мы' }
]

const ARB_T = {
  tg: {
    tabSarf: '🔎 Сарф',
    tabTheory: '📖 Тақсими калом',
    tabForms: '📚 Бобҳои феъл',
    searchPh: 'Калимаро нависед: ضَرَبَ، أَكَلَ، ذَهَبَ، ضربة...',
    search: 'Ҷустуҷӯ',
    clear: 'Тоза',
    results: 'Натиҷаҳо',
    notFound: 'Калима дар луғат ёфт нашуд. Агар решаи сеҳарфа бошад, бобро интихоб кунед:',
    notFoundRoot: 'Ин калима дар луғат нест ва решаи сеҳарфа ҳам нест. Решаро (масалан: ك ت ب) нависед.',
    chooseBab: 'Бобро интихоб кунед',
    allVerbs: 'Ҳамаи феълҳо',
    hideVerbs: 'Пинҳон кардан',
    form: 'Боб',
    meaning: 'Маъно',
    masdar: 'Масдар',
    voice: 'Ҳолат',
    active: 'Маълум',
    passive: 'Маҷҳул',
    past: 'Мозӣ',
    present: 'Музореъ',
    amr: 'Амр',
    nahy: 'Наҳӣ',
    names: 'Исмҳо',
    rafi: 'Марфӯъ',
    nasb: 'Мансуб',
    jazm: 'Маҷзум',
    person: 'Шахс',
    fail: 'Исми фоил',
    mafool: 'Исми мафъул',
    masdarName: 'Масдар',
    noPassive: 'Барои ин феъл шакли маҷҳул истифода намешавад.',
    saveVerb: '💾 Ба луғат илова кардан',
    edited: 'Ислоҳ шудааст',
    editCell: 'Ислоҳ',
    save: 'Захира',
    cancel: 'Бекор',
    reset: '↺ Бозгашт',
    adminHint: 'Админ: ҳар ҳуҷайраро пахш карда ислоҳ кунед.',
    machineNote: 'Шаклҳо бо қоидаҳои сарф ҳосил шудаанд; дар ҳолати хато, админ метавонад ислоҳ кунад.',
    unsupported: 'Барои ин боб ва ин реша шаклҳо худкор сохта намешаванд; админ метавонад ҳуҷайраҳоро дастӣ ворид кунад.',
    rootType: 'Навъи реша',
    types: {
      sahih: 'саҳеҳ', mithal: 'мисол (вов)', ajwaf: 'аҷвaф (миёна заиф)', naqis: 'нақис (охир заиф)',
      mudaaf: 'музоъаф', mahmuz: 'маҳмуз', lafifMafruq: 'лафиф маврук', lafifMaqrun: 'лафиф мақрун'
    },
    adm: {
      title: '🔤 Забони арабӣ — идоракунӣ',
      verbs: 'Феълҳо',
      theory: 'Назария (тақсими калом)',
      cells: 'Ислоҳҳои ҳуҷайраҳо',
      root: 'Реша (3 ҳарф, масалан: ك ت ب)',
      bab: 'Боби феъли сулосӣ (мозӣ – музореъ)',
      masdar: 'Масдар (бо ҳаракат)',
      tg: 'Маъно (тоҷикӣ)',
      ru: 'Маъно (русӣ)',
      add: 'Феъли нав илова кардан',
      editing: 'Таҳрири феъл',
      saveBtn: 'Захира',
      hide: 'Пинҳон / ҳазф',
      edit: 'Таҳрир',
      restore: 'Баргардонидан',
      hidden: 'пинҳон',
      mine: 'ислоҳшуда',
      filter: 'Ҷустуҷӯ дар луғат...',
      invalidRoot: 'Решаи сеҳарфа ворид кунед.',
      cannot: 'Барои ин реша ва боб шаклҳо худкор сохта намешаванд. Бобро ба I иваз кунед.',
      saved: 'Захира шуд.',
      deleted: 'Ҳазф шуд.',
      tTitle: 'Сарлавҳа (тоҷикӣ)',
      tBody: 'Матн (тоҷикӣ)',
      tTitleRu: 'Сарлавҳа (русӣ)',
      tBodyRu: 'Матн (русӣ)',
      addTheory: 'Корти нав илова кардан',
      noCells: 'Ислоҳи ҳуҷайра нест.'
    }
  },
  ru: {
    tabSarf: '🔎 Сарф',
    tabTheory: '📖 Части речи',
    tabForms: '📚 Породы глагола',
    searchPh: 'Введите слово: ضَرَبَ، أَكَلَ، ذَهَبَ، ضربة...',
    search: 'Поиск',
    clear: 'Очистить',
    results: 'Результаты',
    notFound: 'Слово не найдено в словаре. Если это трёхбуквенный корень, выберите породу:',
    notFoundRoot: 'Слова нет в словаре, и это не трёхбуквенный корень. Введите корень (например: ك ت ب).',
    chooseBab: 'Выберите породу',
    allVerbs: 'Все глаголы',
    hideVerbs: 'Скрыть',
    form: 'Порода',
    meaning: 'Значение',
    masdar: 'Масдар',
    voice: 'Залог',
    active: 'Действительный',
    passive: 'Страдательный',
    past: 'Прошедшее',
    present: 'Настоящее',
    amr: 'Повелительное',
    nahy: 'Запрет',
    names: 'Имена',
    rafi: 'Марфуʿ',
    nasb: 'Мансуб',
    jazm: 'Мажзум',
    person: 'Лицо',
    fail: 'Причастие деятеля',
    mafool: 'Причастие страдат.',
    masdarName: 'Масдар',
    noPassive: 'У этого глагола нет страдательного залога.',
    saveVerb: '💾 Добавить в словарь',
    edited: 'Исправлено',
    editCell: 'Исправить',
    save: 'Сохранить',
    cancel: 'Отмена',
    reset: '↺ Сбросить',
    adminHint: 'Админ: нажмите на ячейку, чтобы исправить.',
    machineNote: 'Формы строятся по правилам сарфа; при ошибке админ может исправить.',
    unsupported: 'Для этого корня и породы формы автоматически не строятся; админ может ввести ячейки вручную.',
    rootType: 'Тип корня',
    types: {
      sahih: 'сильный', mithal: 'мисаль (вав)', ajwaf: 'полый', naqis: 'недостаточный',
      mudaaf: 'удвоенный', mahmuz: 'хамзованный', lafifMafruq: 'лафиф мафрук', lafifMaqrun: 'лафиф макрун'
    },
    adm: {
      title: '🔤 Арабский язык — управление',
      verbs: 'Глаголы',
      theory: 'Теория (части речи)',
      cells: 'Исправления ячеек',
      root: 'Корень (3 буквы, например: ك ت ب)',
      bab: 'Порода трёхбуквенного глагола (прош. – наст.)',
      masdar: 'Масдар (с огласовками)',
      tg: 'Значение (таджикский)',
      ru: 'Значение (русский)',
      add: 'Добавить новый глагол',
      editing: 'Редактирование глагола',
      saveBtn: 'Сохранить',
      hide: 'Скрыть / удалить',
      edit: 'Изменить',
      restore: 'Вернуть',
      hidden: 'скрыт',
      mine: 'изменён',
      filter: 'Поиск по словарю...',
      invalidRoot: 'Введите трёхбуквенный корень.',
      cannot: 'Для этого корня и породы формы автоматически не строятся. Выберите породу I.',
      saved: 'Сохранено.',
      deleted: 'Удалено.',
      tTitle: 'Заголовок (таджикский)',
      tBody: 'Текст (таджикский)',
      tTitleRu: 'Заголовок (русский)',
      tBodyRu: 'Текст (русский)',
      addTheory: 'Добавить новую карточку',
      noCells: 'Исправлений ячеек нет.'
    }
  }
}

const ARB_THEORY = [
  {
    id: 'kalam',
    title: 'Тақсими калом — كَلَامٌ',
    titleRu: 'Деление речи — كَلَامٌ',
    body:
      'Калом (الْكَلَامُ) — суханест, ки маънои пурра дорад. Он аз се қисм иборат аст:\n' +
      '١. اِسْمٌ — ном: ҷонвар, ашё, мафҳумро мефаҳмонад ва бо замон алоқа надорад. Мисол: كِتَابٌ (китоб)، رَجُلٌ (мард)، عِلْمٌ (илм).\n' +
      '٢. فِعْلٌ — феъл: кор ё ҳолатро дар замони муайян мефаҳмонад. Мисол: كَتَبَ (навишт)، يَكْتُبُ (менависад)، اُكْتُبْ (бинавис).\n' +
      '٣. حَرْفٌ — ҳарф: худ маънои комил надорад, дар ҷумла маъно мегирад. Мисол: فِي (дар)، مِنْ (аз)، إِلَى (ба)، وَ (ва).',
    bodyRu:
      'Речь (الْكَلَامُ) — высказывание с законченным смыслом. Делится на три части:\n' +
      '١. اِسْمٌ — имя: обозначает существо, предмет, понятие без привязки ко времени. Пример: كِتَابٌ (книга)، رَجُلٌ (мужчина)، عِلْمٌ (знание).\n' +
      '٢. فِعْلٌ — глагол: действие или состояние во времени. Пример: كَتَبَ (написал)، يَكْتُبُ (пишет)، اُكْتُبْ (пиши).\n' +
      '٣. حَرْفٌ — частица: сама не имеет полного значения, смысл получает в предложении. Пример: فِي (в)، مِنْ (из)، إِلَى (к)، وَ (и).'
  },
  {
    id: 'ism',
    title: 'Қисмҳои ном — اَلِاسْمُ',
    titleRu: 'Виды имён — اَلِاسْمُ',
    body:
      '• Бо ҷинс: مُذَكَّرٌ (мардона) — طَالِبٌ؛ مُؤَنَّثٌ (занона) — طَالِبَةٌ.\n' +
      '• Бо шумора: مُفْرَدٌ (танҳо) — كِتَابٌ؛ مُثَنَّى (ду) — كِتَابَانِ؛ جَمْعٌ (бисёр) — كُتُبٌ.\n' +
      '• Бо ошкорӣ: نَكِرَةٌ (номуайян) — كِتَابٌ؛ مَعْرِفَةٌ (муайян) — اَلْكِتَابُ.\n' +
      '• Аз феъл сохта мешаванд: مَصْدَرٌ (масдар) — كِتَابَةٌ؛ اِسْمُ الْفَاعِلِ (иҷрокунанда) — كَاتِبٌ؛ اِسْمُ الْمَفْعُولِ (вокеъшаванда) — مَكْتُوبٌ.\n' +
      '• Ҳолатҳои охир: مَرْفُوعٌ (ـُ)، مَنْصُوبٌ (ـَ)، مَجْرُورٌ (ـِ).',
    bodyRu:
      '• По роду: مُذَكَّرٌ (муж.) — طَالِبٌ؛ مُؤَنَّثٌ (жен.) — طَالِبَةٌ.\n' +
      '• По числу: مُفْرَدٌ (ед.) — كِتَابٌ؛ مُثَنَّى (дв.) — كِتَابَانِ؛ جَمْعٌ (мн.) — كُتُبٌ.\n' +
      '• По определённости: نَكِرَةٌ (неопр.) — كِتَابٌ؛ مَعْرِفَةٌ (опр.) — اَلْكِتَابُ.\n' +
      '• Образуются от глагола: مَصْدَرٌ (масдар) — كِتَابَةٌ؛ اِسْمُ الْفَاعِلِ (причастие деятеля) — كَاتِبٌ؛ اِسْمُ الْمَفْعُولِ (страдательное причастие) — مَكْتُوبٌ.\n' +
      '• Падежи: مَرْفُوعٌ (ـُ)، مَنْصُوبٌ (ـَ)، مَجْرُورٌ (ـِ).'
  },
  {
    id: 'fil',
    title: 'Қисмҳои феъл — اَلْفِعْلُ',
    titleRu: 'Виды глагола — اَلْفِعْلُ',
    body:
      '١. اَلْمَاضِي (мозӣ) — кори анҷомёфта: كَتَبَ — навишт.\n' +
      '٢. اَلْمُضَارِعُ (музореъ) — кори ҳозира ё оянда: يَكْتُبُ — менависад. Се ҳолат дорад: مَرْفُوعٌ (يَكْتُبُ)، مَنْصُوبٌ (لَنْ يَكْتُبَ)، مَجْزُومٌ (لَمْ يَكْتُبْ).\n' +
      '٣. اَلْأَمْرُ (амр) — фармон: اُكْتُبْ — бинавис. Наҳӣ (манъ): لَا تَكْتُبْ — нанавис.\n' +
      'Ҳолат: مَعْلُومٌ (маълум, иҷрокунанда маълум) — كَتَبَ؛ مَجْهُولٌ (маҷҳул) — كُتِبَ.\n' +
      'Феъл 14 шахс дорад: ғоиб (ӯ، онҳо)، мухотаб (ту، шумо)، мутакаллим (ман، мо).',
    bodyRu:
      '١. اَلْمَاضِي (прошедшее) — завершённое действие: كَتَبَ — написал.\n' +
      '٢. اَلْمُضَارِعُ (настоящее-будущее) — يَكْتُبُ — пишет. Три наклонения: مَرْفُوعٌ (يَكْتُبُ)، مَنْصُوبٌ (لَنْ يَكْتُبَ)، مَجْزُومٌ (لَمْ يَكْتُبْ).\n' +
      '٣. اَلْأَمْرُ (повелительное) — اُكْتُبْ — пиши. Запрет: لَا تَكْتُبْ — не пиши.\n' +
      'Залог: مَعْلُومٌ (действительный) — كَتَبَ؛ مَجْهُولٌ (страдательный) — كُتِبَ.\n' +
      'У глагола 14 лиц: третье (он، они)، второе (ты، вы)، первое (я، мы).'
  },
  {
    id: 'harf',
    title: 'Қисмҳои ҳарф — اَلْحَرْفُ',
    titleRu: 'Виды частиц — اَلْحَرْفُ',
    body:
      '• حُرُوفُ الْجَرِّ (ҳарфҳои ҷарр): مِنْ، إِلَى، عَلَى، فِي، عَنْ، بِ، لِ، كَ.\n' +
      '• حُرُوفُ الْعَطْفِ (пайвандак): وَ، فَ، ثُمَّ، أَوْ.\n' +
      '• حُرُوفُ النَّصْبِ (ҳарфҳои насб): أَنْ، لَنْ، كَيْ.\n' +
      '• حُرُوفُ الْجَزْمِ (ҳарфҳои ҷазм): لَمْ، لَمَّا، لَا (наҳӣ)، لَامُ الْأَمْرِ.\n' +
      '• حُرُوفُ الِاسْتِفْهَامِ (пурсиш): هَلْ، أَ.\n' +
      '• حُرُوفُ النَّفْيِ (инкор): مَا، لَا، لَنْ، لَمْ.\n' +
      '• حُرُوفُ النِّدَاءِ (хитоб): يَا، أَيُّهَا.\n' +
      '• إِنَّ وَأَخَوَاتُهَا: إِنَّ، أَنَّ، كَأَنَّ، لَكِنَّ، لَيْتَ، لَعَلَّ.',
    bodyRu:
      '• حُرُوفُ الْجَرِّ (предлоги): مِنْ، إِلَى، عَلَى، فِي، عَنْ، بِ، لِ، كَ.\n' +
      '• حُرُوفُ الْعَطْفِ (союзы): وَ، فَ، ثُمَّ، أَوْ.\n' +
      '• حُرُوفُ النَّصْبِ (частицы насба): أَنْ، لَنْ، كَيْ.\n' +
      '• حُرُوفُ الْجَزْمِ (частицы джазма): لَمْ، لَمَّا، لَا (запрет)، لَامُ الْأَمْرِ.\n' +
      '• حُرُوفُ الِاسْتِفْهَامِ (вопрос): هَلْ، أَ.\n' +
      '• حُرُوفُ النَّفْيِ (отрицание): مَا، لَا، لَنْ، لَمْ.\n' +
      '• حُرُوفُ النِّدَاءِ (звательные): يَا، أَيُّهَا.\n' +
      '• إِنَّ وَأَخَوَاتُهَا: إِنَّ، أَنَّ، كَأَنَّ، لَكِنَّ، لَيْتَ، لَعَلَّ.'
  },
  {
    id: 'babs',
    title: 'Бобҳои феъли сулосии муҷаррад',
    titleRu: 'Породы простого трёхбуквенного глагола',
    body:
      'Феъли сесоҳарфа дар шакли аввал (I) шаш боб дорад — аз рӯи ҳаракати ҳарфи миёна дар мозӣ ва музореъ:\n' +
      '١. فَعَلَ – يَفْعُلُ: كَتَبَ – يَكْتُبُ\n' +
      '٢. فَعَلَ – يَفْعِلُ: ضَرَبَ – يَضْرِبُ\n' +
      '٣. فَعَلَ – يَفْعَلُ: فَتَحَ – يَفْتَحُ (одатан ҳарфи ҳалқӣ дорад)\n' +
      '٤. فَعِلَ – يَفْعَلُ: عَلِمَ – يَعْلَمُ\n' +
      '٥. فَعُلَ – يَفْعُلُ: كَرُمَ – يَكْرُمُ (сифатҳо)\n' +
      '٦. فَعِلَ – يَفْعِلُ: حَسِبَ – يَحْسِبُ (кам)',
    bodyRu:
      'У простого трёхбуквенного глагола (форма I) шесть пород — по огласовке второй коренной в прошедшем и настоящем:\n' +
      '١. فَعَلَ – يَفْعُلُ: كَتَبَ – يَكْتُبُ\n' +
      '٢. فَعَلَ – يَفْعِلُ: ضَرَبَ – يَضْرِبُ\n' +
      '٣. فَعَلَ – يَفْعَلُ: فَتَحَ – يَفْتَحُ (обычно с гортанной буквой)\n' +
      '٤. فَعِلَ – يَفْعَلُ: عَلِمَ – يَعْلَمُ\n' +
      '٥. فَعُلَ – يَفْعُلُ: كَرُمَ – يَكْرُمُ (качества)\n' +
      '٦. فَعِلَ – يَفْعِلُ: حَسِبَ – يَحْسِبُ (редко)'
  },
  {
    id: 'mazid',
    title: 'Феълҳои мазид (II–X)',
    titleRu: 'Производные породы (II–X)',
    body:
      'II فَعَّلَ – يُفَعِّلُ – تَفْعِيلٌ: интенсивӣ/гузаранда. عَلَّمَ (омӯзонд)\n' +
      'III فَاعَلَ – يُفَاعِلُ – مُفَاعَلَةٌ: ҳамкорӣ. قَاتَلَ (ҷангид)\n' +
      'IV أَفْعَلَ – يُفْعِلُ – إِفْعَالٌ: гузаранда. أَرْسَلَ (фиристод)\n' +
      'V تَفَعَّلَ – يَتَفَعَّلُ – تَفَعُّلٌ: худписанд аз II. تَعَلَّمَ (омӯхт)\n' +
      'VI تَفَاعَلَ – يَتَفَاعَلُ – تَفَاعُلٌ: ҳамдигар. تَقَاتَلَ\n' +
      'VII اِنْفَعَلَ – يَنْفَعِلُ – اِنْفِعَالٌ: худписанд. اِنْكَسَرَ (шикаст шуд)\n' +
      'VIII اِفْتَعَلَ – يَفْتَعِلُ – اِفْتِعَالٌ: اِجْتَمَعَ (ҷамъ шуд)\n' +
      'IX اِفْعَلَّ – يَفْعَلُّ – اِفْعِلَالٌ: рангу айб. اِحْمَرَّ (сурх шуд)\n' +
      'X اِسْتَفْعَلَ – يَسْتَفْعِلُ – اِسْتِفْعَالٌ: хостан. اِسْتَغْفَرَ (омурзиш хост)',
    bodyRu:
      'II فَعَّلَ – يُفَعِّلُ – تَفْعِيلٌ: усиление/переходность. عَلَّمَ (обучил)\n' +
      'III فَاعَلَ – يُفَاعِلُ – مُفَاعَلَةٌ: взаимодействие. قَاتَلَ (сражался)\n' +
      'IV أَفْعَلَ – يُفْعِلُ – إِفْعَالٌ: переходность. أَرْسَلَ (отправил)\n' +
      'V تَفَعَّلَ – يَتَفَعَّلُ – تَفَعُّلٌ: возвратная к II. تَعَلَّمَ (учился)\n' +
      'VI تَفَاعَلَ – يَتَفَاعَلُ – تَفَاعُلٌ: взаимность. تَقَاتَلَ\n' +
      'VII اِنْفَعَلَ – يَنْفَعِلُ – اِنْفِعَالٌ: страдательность. اِنْكَسَرَ (сломался)\n' +
      'VIII اِفْتَعَلَ – يَفْتَعِلُ – اِفْتِعَالٌ: اِجْتَمَعَ (собрался)\n' +
      'IX اِفْعَلَّ – يَفْعَلُّ – اِفْعِلَالٌ: цвета и дефекты. اِحْمَرَّ (покраснел)\n' +
      'X اِسْتَفْعَلَ – يَسْتَفْعِلُ – اِسْتِفْعَالٌ: просьба/оценка. اِسْتَغْفَرَ (попросил прощения)'
  }
]

/* ---------- ёрирасонҳо ---------- */

function arbSearchKey(text) {
  return String(text || '')
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/[ؤئ]/g, 'ء')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, '')
}

function arbVerbKey(root, form) {
  return `${normalizeLetters(root)}|${form}`
}

function arbBab(id) {
  return ARB_BABS.find(item => item.id === id) || ARB_BABS[0]
}

function arbConj(verb) {
  try {
    const bab = arbBab(verb.bab)
    return conjugate({ root: verb.root, form: Number(verb.form) || 1, pv: bab.pv, mv: bab.mv, masdar: verb.masdar || '' })
  } catch {
    return null
  }
}

function buildArabicData(rows) {
  const verbMap = new Map()

  ARB_SEED.forEach(([root, form, bab, masdar, tg, ru]) => {
    const key = arbVerbKey(root, form)
    verbMap.set(key, { key, root: normalizeLetters(root), form, bab: bab || 'a-u', masdar, tg, ru, src: 'seed', rowId: null, hidden: false })
  })

  const theoryMap = new Map()
  ARB_THEORY.forEach((item, index) => {
    theoryMap.set(item.id, { ...item, order: index, src: 'seed', rowId: null, hidden: false })
  })

  const cells = new Map()
  const cellRows = []

  ;(rows || []).forEach(row => {
    const meta = parseStoredNote(row.source_note).meta || {}
    if (meta.kind === 'verb') {
      const form = Number(meta.form) || 1
      const key = arbVerbKey(meta.root || row.title, form)
      const old = verbMap.get(key)
      verbMap.set(key, {
        key,
        root: normalizeLetters(meta.root || row.title),
        form,
        bab: meta.bab || (old && old.bab) || 'a-u',
        masdar: meta.masdar ?? (old ? old.masdar : ''),
        tg: meta.tg ?? (old ? old.tg : ''),
        ru: meta.ru ?? (old ? old.ru : ''),
        src: old ? 'seed' : 'db',
        edited: true,
        rowId: row.id,
        hidden: meta.hide === '1'
      })
    } else if (meta.kind === 'theory') {
      const tid = meta.tid || `t${row.id}`
      const old = theoryMap.get(tid)
      theoryMap.set(tid, {
        id: tid,
        title: row.title || (old && old.title) || '',
        titleRu: meta.title_ru || (old && old.titleRu) || '',
        body: row.content_text || (old && old.body) || '',
        bodyRu: meta.body_ru || (old && old.bodyRu) || '',
        order: Number(meta.order) || (old ? old.order : 100 + Number(row.id || 0)),
        src: old ? 'seed' : 'db',
        edited: true,
        rowId: row.id,
        hidden: meta.hide === '1'
      })
    } else if (meta.kind === 'cell') {
      cells.set(`${meta.vk}|${meta.cell}`, { value: row.content_text || meta.value || '', rowId: row.id })
      cellRows.push({ rowId: row.id, vk: meta.vk, cell: meta.cell, value: row.content_text || meta.value || '' })
    }
  })

  const verbs = [...verbMap.values()].sort((a, b) => a.form - b.form || a.root.localeCompare(b.root, 'ar'))
  const theory = [...theoryMap.values()].sort((a, b) => a.order - b.order)
  return { verbs, theory, cells, cellRows }
}

function arbCellValue(conj, path) {
  if (!conj) return ''
  const [a, b, c, d] = path.split('.')
  if (path === 'fail' || path === 'mafool' || path === 'masdar') return conj[path] || ''
  if (a === 'past') return (conj.past[b] || [])[Number(c)] || ''
  if (a === 'pres') return ((conj.pres[b] || {})[c] || [])[Number(d)] || ''
  if (a === 'amr') return conj.amr[Number(b)] || ''
  if (a === 'nahy') return conj.nahy[Number(b)] || ''
  return ''
}

function arbHasPassive(conj) {
  return !!(conj && conj.past.pas && conj.pres.pas)
}

/* ---------- Қисми оммавӣ ---------- */

function ArabicSection({ rows, lang, admin, db, notify, reload }) {
  const tt = ARB_T[lang] || ARB_T.tg
  const [tab, setTab] = useState('sarf')
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [current, setCurrent] = useState(null)
  const [voice, setVoice] = useState('act')
  const [tense, setTense] = useState('past')
  const [mood, setMood] = useState('rafi')
  const [editing, setEditing] = useState(null)
  const [editText, setEditText] = useState('')
  const [busy, setBusy] = useState(false)

  const data = useMemo(() => buildArabicData(rows), [rows])
  const activeVerbs = useMemo(() => data.verbs.filter(item => !item.hidden), [data.verbs])

  const index = useMemo(() => {
    const map = new Map()
    const add = (word, key) => {
      const k = arbSearchKey(word)
      if (!k) return
      if (!map.has(k)) map.set(k, new Set())
      map.get(k).add(key)
    }
    activeVerbs.forEach(verb => {
      const conj = arbConj(verb)
      add(verb.root, verb.key)
      if (!conj) return
      const push = list => (list || []).forEach(word => add(word, verb.key))
      push(conj.past.act)
      push(conj.past.pas)
      ;['act', 'pas'].forEach(v => {
        if (conj.pres[v]) MOODS.forEach(m => push(conj.pres[v][m]))
      })
      push(conj.amr)
      add(conj.fail, verb.key)
      add(conj.mafool, verb.key)
      add(conj.masdar, verb.key)
    })
    return map
  }, [activeVerbs])

  const verbByKey = useMemo(() => new Map(data.verbs.map(item => [item.key, item])), [data.verbs])

  const rootCandidate = useMemo(() => {
    const key = arbSearchKey(submitted)
    if (!key) return ''
    let letters = key.replace(/^ال/, '')
    if (letters.length === 4 && letters.endsWith('ه')) letters = letters.slice(0, 3)
    return letters.length === 3 ? normalizeLetters(letters) : ''
  }, [submitted])

  const results = useMemo(() => {
    const key = arbSearchKey(submitted)
    if (!key) return null
    let hit = index.get(key)
    if ((!hit || !hit.size) && rootCandidate) hit = index.get(arbSearchKey(rootCandidate))
    const found = hit ? [...hit].map(k => verbByKey.get(k)).filter(Boolean) : []
    return found.sort((a, b) => a.form - b.form)
  }, [submitted, index, verbByKey, rootCandidate])

  const conj = useMemo(() => (current ? arbConj(current) : null), [current])

  const cellOverride = (path) => (current ? data.cells.get(`${current.key}|${path}`) : null)
  const cellText = path => {
    const override = cellOverride(path)
    return override && override.value ? override.value : arbCellValue(conj, path)
  }

  const runSearch = event => {
    if (event) event.preventDefault()
    setSubmitted(query)
    setCurrent(null)
    setEditing(null)
  }

  const openVerb = verb => {
    setCurrent(verb)
    setVoice('act')
    setTense('past')
    setMood('rafi')
    setEditing(null)
  }

  const startEdit = (path, value) => {
    if (!admin) return
    setEditing(path)
    setEditText(value)
  }

  const saveCell = async path => {
    if (!db || !admin || busy || !current) return
    setBusy(true)
    try {
      const old = cellOverride(path)
      const text = String(editText || '').trim()
      if (!text || text === arbCellValue(conj, path)) {
        if (old) await db.from('content_items').delete().eq('id', old.rowId)
      } else {
        const payload = {
          section_slug: '__arabic',
          title: `${current.root} ${current.form}`,
          content_text: text,
          source_note: makeStoredNote('', { kind: 'cell', vk: current.key, cell: path, value: text }),
          is_published: true,
          updated_at: new Date().toISOString()
        }
        const result = old
          ? await db.from('content_items').update(payload).eq('id', old.rowId)
          : await db.from('content_items').insert(payload)
        if (result.error) throw result.error
      }
      setEditing(null)
      await reload()
    } catch (error) {
      notify(error.message || 'Хато', 'error')
    } finally {
      setBusy(false)
    }
  }

  const resetCell = async path => {
    const old = cellOverride(path)
    if (!db || !admin || !old || busy) return
    setBusy(true)
    try {
      const { error } = await db.from('content_items').delete().eq('id', old.rowId)
      if (error) throw error
      setEditing(null)
      await reload()
    } catch (error) {
      notify(error.message || 'Хато', 'error')
    } finally {
      setBusy(false)
    }
  }

  const saveToDictionary = async () => {
    if (!db || !admin || !current || busy) return
    setBusy(true)
    try {
      const payload = {
        section_slug: '__arabic',
        title: current.root,
        content_text: current.tg || '',
        source_note: makeStoredNote('', {
          kind: 'verb', root: current.root, form: String(current.form), bab: current.bab,
          masdar: current.masdar || '', tg: current.tg || '', ru: current.ru || '', hide: ''
        }),
        is_published: true,
        updated_at: new Date().toISOString()
      }
      const { error } = await db.from('content_items').insert(payload)
      if (error) throw error
      notify(tt.adm.saved)
      await reload()
    } catch (error) {
      notify(error.message || 'Хато', 'error')
    } finally {
      setBusy(false)
    }
  }

  const meaningOf = verb => (lang === 'ru' ? (verb.ru || verb.tg) : (verb.tg || verb.ru)) || ''

  const renderCell = (path, personIndex) => {
    const value = cellText(path)
    const edited = !!cellOverride(path)
    const isEditing = editing === path

    if (isEditing) {
      return (
        <div className="arb-edit">
          <input
            dir="rtl"
            className="arb-input"
            value={editText}
            onChange={event => setEditText(event.target.value)}
            autoFocus
          />
          <div className="arb-edit-actions">
            <button type="button" className="primary-button" disabled={busy} onClick={() => saveCell(path)}>{tt.save}</button>
            <button type="button" className="secondary-button" onClick={() => setEditing(null)}>{tt.cancel}</button>
            {edited && <button type="button" className="secondary-button" disabled={busy} onClick={() => resetCell(path)}>{tt.reset}</button>}
          </div>
        </div>
      )
    }

    return (
      <button
        type="button"
        className={`arb-cell${edited ? ' is-edited' : ''}${admin ? ' is-editable' : ''}`}
        dir="rtl"
        onClick={() => startEdit(path, value)}
        title={admin ? tt.editCell : undefined}
      >
        {value || '—'}
      </button>
    )
  }

  const personLabel = index2 => {
    const p = ARB_PERSONS[index2]
    return (
      <div className="arb-person">
        <span className="arb-person-ar" dir="rtl">{p.ar}</span>
        <span className="arb-person-tr">{lang === 'ru' ? p.ru : p.tg}</span>
      </div>
    )
  }

  const renderTable = () => {
    if (!conj) return <p className="arb-note">{tt.unsupported}</p>

    if (tense === 'past' || tense === 'present') {
      const sideVoice = voice === 'pas' ? 'pas' : 'act'
      if (sideVoice === 'pas' && !arbHasPassive(conj)) return <p className="arb-note">{tt.noPassive}</p>
      return (
        <div className="arb-table">
          {range(14).map(j => {
            const path = tense === 'past' ? `past.${sideVoice}.${j}` : `pres.${sideVoice}.${mood}.${j}`
            return (
              <div className="arb-row" key={j}>
                {personLabel(j)}
                {renderCell(path, j)}
              </div>
            )
          })}
        </div>
      )
    }

    if (tense === 'amr' || tense === 'nahy') {
      return (
        <div className="arb-table">
          {range(6).map(j => (
            <div className="arb-row" key={j}>
              {personLabel(6 + j)}
              {renderCell(`${tense}.${j}`, 6 + j)}
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="arb-table">
        {[['fail', tt.fail], ['mafool', tt.mafool], ['masdar', tt.masdarName]].map(([path, label]) => (
          <div className="arb-row" key={path}>
            <div className="arb-person"><span className="arb-person-tr">{label}</span></div>
            {renderCell(path, 0)}
          </div>
        ))}
      </div>
    )
  }

  const renderVerbHeader = () => {
    if (!current) return null
    const past = (conj && conj.past.act[0]) || current.root
    const pres = conj && conj.pres.act.rafi[0]
    return (
      <div className="arb-verb-card">
        <div className="arb-verb-main" dir="rtl">
          <span className="arb-verb-past">{cellOverride('past.act.0')?.value || past}</span>
          {pres && <span className="arb-verb-pres">{cellOverride('pres.act.rafi.0')?.value || pres}</span>}
        </div>
        <div className="arb-verb-meta">
          <span>{tt.form}: <b>{FORM_NAMES[current.form]}</b></span>
          {conj && <span>{tt.rootType}: <b>{tt.types[conj.cls] || conj.cls}</b></span>}
          {(cellOverride('masdar')?.value || (conj && conj.masdar)) && (
            <span>{tt.masdar}: <b dir="rtl">{cellOverride('masdar')?.value || conj.masdar}</b></span>
          )}
        </div>
        {meaningOf(current) && <p className="arb-meaning">{meaningOf(current)}</p>}
        {admin && current.src === 'temp' && (
          <button type="button" className="primary-button" disabled={busy} onClick={saveToDictionary}>{tt.saveVerb}</button>
        )}
      </div>
    )
  }

  const renderControls = () => (
    <div className="arb-controls">
      <div className="arb-seg">
        {['past', 'present', 'amr', 'nahy', 'names'].map(item => (
          <button
            key={item}
            type="button"
            className={tense === item ? 'active' : ''}
            onClick={() => { setTense(item); setEditing(null) }}
          >
            {tt[item]}
          </button>
        ))}
      </div>

      {(tense === 'past' || tense === 'present') && (
        <div className="arb-seg arb-seg-small">
          <button type="button" className={voice === 'act' ? 'active' : ''} onClick={() => { setVoice('act'); setEditing(null) }}>{tt.active}</button>
          <button type="button" className={voice === 'pas' ? 'active' : ''} onClick={() => { setVoice('pas'); setEditing(null) }}>{tt.passive}</button>
        </div>
      )}

      {tense === 'present' && (
        <div className="arb-seg arb-seg-small">
          {['rafi', 'nasb', 'jazm'].map(item => (
            <button key={item} type="button" className={mood === item ? 'active' : ''} onClick={() => { setMood(item); setEditing(null) }}>
              {tt[item]}
            </button>
          ))}
        </div>
      )}

      {admin && <p className="arb-note">{tt.adminHint}</p>}
    </div>
  )

  const renderSarf = () => (
    <>
      <form className="arb-search" onSubmit={runSearch}>
        <input
          dir="auto"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder={tt.searchPh}
          className="arb-search-input"
        />
        <button className="primary-button" type="submit">{tt.search}</button>
        {(query || submitted) && (
          <button
            className="secondary-button"
            type="button"
            onClick={() => { setQuery(''); setSubmitted(''); setCurrent(null) }}
          >
            {tt.clear}
          </button>
        )}
      </form>

      {current ? (
        <>
          <button className="secondary-button back-button" type="button" onClick={() => setCurrent(null)}>← {tt.results}</button>
          {renderVerbHeader()}
          {renderControls()}
          {renderTable()}
          <p className="arb-note">{tt.machineNote}</p>
        </>
      ) : (
        <>
          {results && results.length > 0 && (
            <div className="arb-results">
              <h4>{tt.results}</h4>
              {results.map(verb => {
                const c = arbConj(verb)
                return (
                  <button key={verb.key} type="button" className="arb-result" onClick={() => openVerb(verb)}>
                    <span className="arb-result-ar" dir="rtl">{c ? c.past.act[0] : verb.root}</span>
                    <span className="arb-result-meta">
                      {FORM_NAMES[verb.form]} · {meaningOf(verb)}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {results && results.length === 0 && (
            <div className="arb-results">
              {rootCandidate && canConjugate(rootCandidate, 1) ? (
                <>
                  <p className="arb-note">{tt.notFound}</p>
                  <div className="arb-babs">
                    {ARB_BABS.map(bab => (
                      <button
                        key={bab.id}
                        type="button"
                        className="arb-bab"
                        dir="rtl"
                        onClick={() => openVerb({
                          key: arbVerbKey(rootCandidate, 1), root: rootCandidate, form: 1, bab: bab.id,
                          masdar: '', tg: '', ru: '', src: 'temp'
                        })}
                      >
                        {bab.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="arb-note">{tt.notFoundRoot}</p>
              )}
            </div>
          )}

          <div className="arb-all">
            <button type="button" className="secondary-button" onClick={() => setShowAll(value => !value)}>
              {showAll ? tt.hideVerbs : `${tt.allVerbs} (${activeVerbs.length})`}
            </button>
            {showAll && (
              <div className="arb-chips">
                {activeVerbs.map(verb => {
                  const c = arbConj(verb)
                  return (
                    <button key={verb.key} type="button" className="arb-chip" onClick={() => openVerb(verb)}>
                      <span dir="rtl">{c ? c.past.act[0] : verb.root}</span>
                      <small>{FORM_NAMES[verb.form]}</small>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </>
  )

  const renderTheory = () => (
    <div className="arb-theory">
      {data.theory.filter(item => !item.hidden).map(item => (
        <article className="public-item arb-theory-card" key={item.id}>
          <h3>{lang === 'ru' ? (item.titleRu || item.title) : item.title}</h3>
          {String(lang === 'ru' ? (item.bodyRu || item.body) : item.body).split('\n').map((line, i) => (
            <p key={i} className="arb-line">{line}</p>
          ))}
        </article>
      ))}
    </div>
  )

  const renderForms = () => (
    <div className="arb-theory">
      {data.theory.filter(item => !item.hidden && (item.id === 'babs' || item.id === 'mazid')).map(item => (
        <article className="public-item arb-theory-card" key={item.id}>
          <h3>{lang === 'ru' ? (item.titleRu || item.title) : item.title}</h3>
          {String(lang === 'ru' ? (item.bodyRu || item.body) : item.body).split('\n').map((line, i) => (
            <p key={i} className="arb-line">{line}</p>
          ))}
        </article>
      ))}
    </div>
  )

  return (
    <div className="arb-wrap">
      <div className="arb-tabs">
        <button type="button" className={tab === 'sarf' ? 'active' : ''} onClick={() => setTab('sarf')}>{tt.tabSarf}</button>
        <button type="button" className={tab === 'theory' ? 'active' : ''} onClick={() => setTab('theory')}>{tt.tabTheory}</button>
        <button type="button" className={tab === 'forms' ? 'active' : ''} onClick={() => setTab('forms')}>{tt.tabForms}</button>
      </div>
      {tab === 'sarf' && renderSarf()}
      {tab === 'theory' && renderTheory()}
      {tab === 'forms' && renderForms()}
    </div>
  )
}

/* ---------- Панели админ ---------- */

const ARB_EMPTY_VERB = { root: '', form: '1', bab: 'a-u', masdar: '', tg: '', ru: '' }
const ARB_EMPTY_THEORY = { title: '', body: '', titleRu: '', bodyRu: '' }

function ArabicAdmin({ rows, lang, db, notify, reload }) {
  const tt = (ARB_T[lang] || ARB_T.tg).adm
  const [sub, setSub] = useState('verbs')
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState(ARB_EMPTY_VERB)
  const [editing, setEditing] = useState(null)
  const [tForm, setTForm] = useState(ARB_EMPTY_THEORY)
  const [tEditing, setTEditing] = useState(null)
  const [busy, setBusy] = useState(false)

  const data = useMemo(() => buildArabicData(rows), [rows])

  const visibleVerbs = useMemo(() => {
    const key = arbSearchKey(filter)
    return data.verbs.filter(verb => {
      if (!key) return true
      return arbSearchKey(verb.root).includes(key) || String(verb.tg || '').toLowerCase().includes(filter.toLowerCase()) ||
        String(verb.ru || '').toLowerCase().includes(filter.toLowerCase())
    })
  }, [data.verbs, filter])

  const run = async action => {
    if (!db || busy) return
    setBusy(true)
    try {
      await action()
      await reload()
    } catch (error) {
      notify(error.message || 'Хато', 'error')
    } finally {
      setBusy(false)
    }
  }

  const verbPayload = (values, hide) => ({
    section_slug: '__arabic',
    title: normalizeLetters(values.root),
    content_text: clean(values.tg),
    source_note: makeStoredNote('', {
      kind: 'verb',
      root: normalizeLetters(values.root),
      form: String(values.form),
      bab: values.bab,
      masdar: clean(values.masdar),
      tg: clean(values.tg),
      ru: clean(values.ru),
      hide: hide ? '1' : ''
    }),
    is_published: true,
    updated_at: new Date().toISOString()
  })

  const saveVerb = event => {
    event.preventDefault()
    const root = normalizeLetters(form.root)
    if (root.length !== 3) { notify(tt.invalidRoot, 'error'); return }
    if (!canConjugate(root, Number(form.form))) { notify(tt.cannot, 'error'); return }

    const key = arbVerbKey(root, Number(form.form))
    const existing = data.verbs.find(item => item.key === key)

    run(async () => {
      const payload = verbPayload(form, false)
      const result = existing && existing.rowId
        ? await db.from('content_items').update(payload).eq('id', existing.rowId)
        : await db.from('content_items').insert(payload)
      if (result.error) throw result.error
      setForm(ARB_EMPTY_VERB)
      setEditing(null)
      notify(tt.saved)
    })
  }

  const editVerb = verb => {
    setForm({ root: verb.root, form: String(verb.form), bab: verb.bab || 'a-u', masdar: verb.masdar || '', tg: verb.tg || '', ru: verb.ru || '' })
    setEditing(verb.key)
    setSub('verbs')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hideVerb = verb => run(async () => {
    const isSeed = verb.src === 'seed'
    if (verb.hidden) {
      // баргардонидан
      if (verb.rowId) {
        if (isSeed && !verb.edited) return
        const payload = verbPayload(verb, false)
        const { error } = await db.from('content_items').update(payload).eq('id', verb.rowId)
        if (error) throw error
      }
      return
    }
    if (verb.rowId && !isSeed) {
      const { error } = await db.from('content_items').delete().eq('id', verb.rowId)
      if (error) throw error
    } else {
      const payload = verbPayload(verb, true)
      const result = verb.rowId
        ? await db.from('content_items').update(payload).eq('id', verb.rowId)
        : await db.from('content_items').insert(payload)
      if (result.error) throw result.error
    }
    notify(tt.deleted)
  })

  const saveTheory = event => {
    event.preventDefault()
    if (!clean(tForm.title) || !clean(tForm.body)) return

    run(async () => {
      const tid = tEditing || `t${Date.now()}`
      const existing = data.theory.find(item => item.id === tid)
      const payload = {
        section_slug: '__arabic',
        title: clean(tForm.title),
        content_text: clean(tForm.body),
        source_note: makeStoredNote('', {
          kind: 'theory', tid, title_ru: clean(tForm.titleRu), body_ru: clean(tForm.bodyRu),
          order: String(existing ? existing.order + 1 : data.theory.length + 1), hide: ''
        }),
        is_published: true,
        updated_at: new Date().toISOString()
      }
      const result = existing && existing.rowId
        ? await db.from('content_items').update(payload).eq('id', existing.rowId)
        : await db.from('content_items').insert(payload)
      if (result.error) throw result.error
      setTForm(ARB_EMPTY_THEORY)
      setTEditing(null)
      notify(tt.saved)
    })
  }

  const editTheory = item => {
    setTForm({ title: item.title, body: item.body, titleRu: item.titleRu || '', bodyRu: item.bodyRu || '' })
    setTEditing(item.id)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hideTheory = item => run(async () => {
    if (item.src === 'seed') {
      const payload = {
        section_slug: '__arabic',
        title: item.title,
        content_text: item.body,
        source_note: makeStoredNote('', {
          kind: 'theory', tid: item.id, title_ru: item.titleRu || '', body_ru: item.bodyRu || '',
          order: String(item.order + 1), hide: item.hidden ? '' : '1'
        }),
        is_published: true,
        updated_at: new Date().toISOString()
      }
      const result = item.rowId
        ? await db.from('content_items').update(payload).eq('id', item.rowId)
        : await db.from('content_items').insert(payload)
      if (result.error) throw result.error
    } else if (item.rowId) {
      const { error } = await db.from('content_items').delete().eq('id', item.rowId)
      if (error) throw error
    }
    notify(tt.deleted)
  })

  const removeCell = cell => run(async () => {
    const { error } = await db.from('content_items').delete().eq('id', cell.rowId)
    if (error) throw error
  })

  return (
    <>
      <div className="arb-tabs">
        {[['verbs', tt.verbs], ['theory', tt.theory], ['cells', tt.cells]].map(([id, label]) => (
          <button key={id} type="button" className={sub === id ? 'active' : ''} onClick={() => setSub(id)}>{label}</button>
        ))}
      </div>

      {sub === 'verbs' && (
        <>
          <form className="admin-form" onSubmit={saveVerb}>
            <h3>{editing ? tt.editing : tt.add}</h3>

            <div className="form-group">
              <label>{tt.root}</label>
              <input dir="rtl" value={form.root} onChange={event => setForm({ ...form, root: event.target.value })} />
            </div>

            <div className="form-group">
              <label>{(ARB_T[lang] || ARB_T.tg).form}</label>
              <select value={form.form} onChange={event => setForm({ ...form, form: event.target.value })}>
                {ARB_FORMS.map(item => <option key={item} value={item}>{FORM_NAMES[item]}</option>)}
              </select>
            </div>

            {String(form.form) === '1' && (
              <div className="form-group">
                <label>{tt.bab}</label>
                <select value={form.bab} onChange={event => setForm({ ...form, bab: event.target.value })}>
                  {ARB_BABS.map(bab => <option key={bab.id} value={bab.id}>{bab.label}</option>)}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>{tt.masdar}</label>
              <input dir="rtl" value={form.masdar} onChange={event => setForm({ ...form, masdar: event.target.value })} />
            </div>

            <div className="form-group">
              <label>{tt.tg}</label>
              <input value={form.tg} onChange={event => setForm({ ...form, tg: event.target.value })} />
            </div>

            <div className="form-group">
              <label>{tt.ru}</label>
              <input value={form.ru} onChange={event => setForm({ ...form, ru: event.target.value })} />
            </div>

            <div className="arb-edit-actions">
              <button className="primary-button" type="submit" disabled={busy}>{tt.saveBtn}</button>
              {editing && (
                <button className="secondary-button" type="button" onClick={() => { setEditing(null); setForm(ARB_EMPTY_VERB) }}>
                  {(ARB_T[lang] || ARB_T.tg).cancel}
                </button>
              )}
            </div>
          </form>

          <div className="form-group">
            <input value={filter} onChange={event => setFilter(event.target.value)} placeholder={tt.filter} />
          </div>

          {visibleVerbs.map(verb => {
            const c = arbConj(verb)
            return (
              <article className={`public-item arb-admin-item${verb.hidden ? ' is-hidden' : ''}`} key={verb.key}>
                <h3 dir="rtl" className="arb-admin-ar">{c ? c.past.act[0] : verb.root}</h3>
                <p>
                  {FORM_NAMES[verb.form]} · {verb.tg} {verb.ru ? `/ ${verb.ru}` : ''}
                  {verb.hidden ? ` · ${tt.hidden}` : ''}{verb.edited ? ` · ${tt.mine}` : ''}
                </p>
                <div className="arb-edit-actions">
                  <button className="secondary-button" type="button" onClick={() => editVerb(verb)}>{tt.edit}</button>
                  <button className="danger-button" type="button" disabled={busy} onClick={() => hideVerb(verb)}>
                    {verb.hidden ? tt.restore : tt.hide}
                  </button>
                </div>
              </article>
            )
          })}
        </>
      )}

      {sub === 'theory' && (
        <>
          <form className="admin-form" onSubmit={saveTheory}>
            <h3>{tEditing ? tt.editing : tt.addTheory}</h3>
            <div className="form-group">
              <label>{tt.tTitle}</label>
              <input value={tForm.title} onChange={event => setTForm({ ...tForm, title: event.target.value })} />
            </div>
            <div className="form-group">
              <label>{tt.tBody}</label>
              <textarea rows={6} value={tForm.body} onChange={event => setTForm({ ...tForm, body: event.target.value })} />
            </div>
            <div className="form-group">
              <label>{tt.tTitleRu}</label>
              <input value={tForm.titleRu} onChange={event => setTForm({ ...tForm, titleRu: event.target.value })} />
            </div>
            <div className="form-group">
              <label>{tt.tBodyRu}</label>
              <textarea rows={6} value={tForm.bodyRu} onChange={event => setTForm({ ...tForm, bodyRu: event.target.value })} />
            </div>
            <div className="arb-edit-actions">
              <button className="primary-button" type="submit" disabled={busy}>{tt.saveBtn}</button>
              {tEditing && (
                <button className="secondary-button" type="button" onClick={() => { setTEditing(null); setTForm(ARB_EMPTY_THEORY) }}>
                  {(ARB_T[lang] || ARB_T.tg).cancel}
                </button>
              )}
            </div>
          </form>

          {data.theory.map(item => (
            <article className={`public-item arb-admin-item${item.hidden ? ' is-hidden' : ''}`} key={item.id}>
              <h3>{item.title}{item.hidden ? ` · ${tt.hidden}` : ''}</h3>
              <div className="arb-edit-actions">
                <button className="secondary-button" type="button" onClick={() => editTheory(item)}>{tt.edit}</button>
                <button className="danger-button" type="button" disabled={busy} onClick={() => hideTheory(item)}>
                  {item.hidden ? tt.restore : tt.hide}
                </button>
              </div>
            </article>
          ))}
        </>
      )}

      {sub === 'cells' && (
        <>
          {data.cellRows.length === 0 && <p className="arb-note">{tt.noCells}</p>}
          {data.cellRows.map(cell => (
            <article className="public-item arb-admin-item" key={cell.rowId}>
              <h3 dir="rtl" className="arb-admin-ar">{cell.value}</h3>
              <p>{cell.vk} · {cell.cell}</p>
              <div className="arb-edit-actions">
                <button className="danger-button" type="button" disabled={busy} onClick={() => removeCell(cell)}>{(ARB_T[lang] || ARB_T.tg).reset}</button>
              </div>
            </article>
          ))}
        </>
      )}
    </>
  )
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
  const [selectedSurah, setSelectedSurah] = useState(null)
  const [surahList, setSurahList] = useState(
    SURAH_TG.map((name, index) => ({ number: index + 1, name }))
  )
  const [surahFilter, setSurahFilter] = useState('')
  const [surahData, setSurahData] = useState(null)
  const [surahLoading, setSurahLoading] = useState(false)
  const [surahError, setSurahError] = useState(false)
  const [surahRetry, setSurahRetry] = useState(0)
  const [reciters, setReciters] = useState(FALLBACK_RECITERS)
  const [reciter, setReciter] = useState(loadReciter)
  const [playing, setPlaying] = useState({ index: -1, mode: 'idle' })
  const [quranFavs, setQuranFavs] = useState(loadQuranFavorites)
  const audioRef = useRef(null)
  const cancelRef = useRef(false)
  const [today, setToday] = useState(todayKey)
  const [uploading, setUploading] = useState({ audio: false, video: false })
  const [askForm, setAskForm] = useState({ name: '', question: '' })
  const [myQuestions, setMyQuestions] = useState([])
  const [askBusy, setAskBusy] = useState(false)
  const [askError, setAskError] = useState('')
  const [adminQuestions, setAdminQuestions] = useState([])
  const [questionsError, setQuestionsError] = useState('')
  const [answerDrafts, setAnswerDrafts] = useState({})
  const [dailyDate, setDailyDate] = useState(todayKey)
  const [blocked, setBlocked] = useState(false)
  const [adminUsers, setAdminUsers] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [usersError, setUsersError] = useState('')
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersLimit, setUsersLimit] = useState(50)
  const [userSearch, setUserSearch] = useState('')
  const [dailyPick, setDailyPick] = useState({ hadith: '', sunnah: '' })
  const [chapterRows, setChapterRows] = useState([])
  const [arabicRows, setArabicRows] = useState([])
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [chapterForm, setChapterForm] = useState({ parent: '', title: '', title_ru: '', order: '' })
  const [editingChapter, setEditingChapter] = useState(null)
  const [bulkText, setBulkText] = useState('')
  const [translation, setTranslation] = useState({ running: false, done: 0, total: 0, message: '' })
  const [arabicSize, setArabicSize] = useState(() => {
    try {
      return Number(window.localStorage.getItem('miftah_arabic_size') || 26) || 26
    } catch {
      return 26
    }
  })
  const [showTranslation, setShowTranslation] = useState(true)
  const quranCache = useRef({})

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

  // Китобҳои такрорӣ (ном/slug-и гуногун) дар намоиш як китоб мешаванд.
  const bookGroups = useMemo(() => {
    const map = new Map()

    books.forEach(book => {
      const key = bookKey(book)
      if (!map.has(key)) map.set(key, { key, items: [] })
      map.get(key).items.push(book)
    })

    return [...map.values()].map(group => {
      const sorted = [...group.items].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      const primary = group.items.find(book => String(book.slug || '').toLowerCase() === group.key) || sorted[0]
      const defaultBook = DEFAULT_BOOKS.find(item => item.slug === group.key)

      return {
        key: group.key,
        id: primary.id,
        ids: group.items.map(book => String(book.id)),
        items: group.items,
        slug: primary.slug,
        name: defaultBook ? defaultBook.name : primary.name,
        sort_order: Number(sorted[0]?.sort_order || 0) || 999,
        is_active: group.items.some(book => book.is_active !== false)
      }
    }).sort((a, b) => a.sort_order - b.sort_order)
  }, [books])

  const groupOfBook = useCallback(
    id => bookGroups.find(group => group.ids.includes(String(id))),
    [bookGroups]
  )

  const bookLabel = useCallback(group => {
    if (!group) return ''
    const translated = BOOK_TRANSLATIONS[group.key]
    return lang === 'ru' && translated ? translated[0] : group.name
  }, [lang])

  const getBookName = useCallback(id => bookLabel(groupOfBook(id)), [bookLabel, groupOfBook])

  // Бобҳо (китобҳои дохили коллексияҳо) дар ҷадвали content_items бо section_slug='__chapter' нигоҳ дошта мешаванд.
  const chapters = useMemo(() => chapterRows.map(row => {
    const meta = parseStoredNote(row.source_note).meta
    return {
      id: String(row.id),
      raw: row,
      title: row.title || '',
      titleRu: meta.title_ru || '',
      parentKind: meta.parent_kind || '',
      parent: meta.parent || '',
      order: Number(meta.order || 0),
      hidden: row.is_published === false
    }
  }).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)), [chapterRows])

  const chapterLabel = useCallback(
    chapter => (lang === 'ru' ? (chapter.titleRu || chapter.title) : chapter.title),
    [lang]
  )

  const applyContent = useCallback(rows => {
    setContentRows(rows.filter(item => item.section_slug !== '__chapter' && item.section_slug !== '__arabic'))
    setChapterRows(rows.filter(item => item.section_slug === '__chapter'))
    setArabicRows(rows.filter(item => item.section_slug === '__arabic'))
  }, [])

  // Маводи сабтшуда аз қадим ба нав: рақами 1 дар боло, навтарин дар поён.
  const sortByDate = rows => [...rows].sort((a, b) => {
    return new Date(a.created_at || 0).getTime() -
      new Date(b.created_at || 0).getTime() ||
      String(a.id).localeCompare(String(b.id), undefined, { numeric: true })
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

    // Агар админ барои имрӯз ҳадис интихоб карда бошад, ҳамон нишон дода мешавад (24 соат).
    const pinned = published
      .filter(item => parseStoredNote(item.source_note).meta.daily_date === todayKey())
      .sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())[0]

    if (pinned) {
      setDailyHadith(pinned)
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
        bookKey(book) === defaultBook.slug ||
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
      applyContent(loadedContent)
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
  }, [notify, refreshDaily, applyContent, t.error, t.supabaseMissing])

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
      applyContent(loadedContent)
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
  }, [admin, notify, refreshDaily, applyContent, t.error])

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
    const timer = setInterval(() => {
      setToday(todayKey())
      refreshDaily(hadithRows)
    }, 60000)
    return () => clearInterval(timer)
  }, [hadithRows, refreshDaily])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const openSection = section => {
    setSelectedSection(section)
    setSelectedBook(null)
    setSelectedSurah(null)
    setSelectedChapter(null)
    setPage('section')
    setSearch('')
    setSearchResults(null)
    setSunnahOpen(false)
    scrollToTop()
  }

  const openBook = book => {
    setSelectedBook(book)
    setSelectedChapter(null)
  }

  const goBackToBooks = () => {
    setSelectedBook(null)
    setSelectedChapter(null)
  }

  const goHome = () => {
    setPage('home')
    setSelectedSection(null)
    setSelectedBook(null)
    setSelectedChapter(null)
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
        chapter_id: clean(hadithForm.chapter_id),
        daily_date: clean(hadithForm.daily_date),
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
      chapter_id: stored.meta.chapter_id || '',
      daily_date: stored.meta.daily_date || '',
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

  const reloadAll = async () => {
    await loadAdminData()
    await loadPublicData()
  }

  // Ҳамаи сатрҳои як гурӯҳи китоб (аз ҷумла такрориҳо) якҷоя пинҳон/намоён мешаванд.
  const toggleBook = async group => {
    if (!db || !admin) return

    try {
      const nextActive = !group.is_active
      for (const book of group.items) {
        const { error } = await db.from('hadith_books')
          .update({ is_active: nextActive })
          .eq('id', book.id)
        if (error) throw error
      }

      await reloadAll()
      notify(t.saved)
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  // Китобҳои такрориро якҷоя мекунад: ҳадисҳо ба китоби асосӣ мегузаранд, сатри такрорӣ нест мешавад.
  const mergeDuplicateBooks = async group => {
    if (!db || !admin || group.items.length < 2) return
    if (!window.confirm('Китобҳои такрорӣ якҷоя шаванд? Ҳадисҳо нест намешаванд — ба китоби асосӣ мегузаранд.')) return

    try {
      const primaryId = group.id
      const duplicates = group.items.filter(book => String(book.id) !== String(primaryId))

      for (const book of duplicates) {
        const moved = await db.from('hadiths').update({ book_id: primaryId }).eq('book_id', book.id)
        if (moved.error) throw moved.error

        const removed = await db.from('hadith_books').delete().eq('id', book.id)
        if (removed.error) throw removed.error
      }

      await reloadAll()
      notify(t.saved)
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  /* ---------- Бобҳо ---------- */

  const parentOf = value => {
    const [kind, ...rest] = String(value || '').split(':')
    return { kind, key: rest.join(':') }
  }

  const chaptersOfParent = value => {
    const { kind, key } = parentOf(value)
    return chapters.filter(item => item.parentKind === kind && item.parent === key)
  }

  const nextChapterOrder = value =>
    chaptersOfParent(value).reduce((max, item) => Math.max(max, item.order), 0) + 1

  const chapterRow = (parent, title, titleRu, order) => {
    const { kind, key } = parentOf(parent)
    return {
      section_slug: '__chapter',
      title,
      content_text: title,
      source_note: makeStoredNote('', {
        parent_kind: kind,
        parent: key,
        order: String(order),
        title_ru: clean(titleRu)
      }),
      is_published: true,
      updated_at: new Date().toISOString()
    }
  }

  const resetChapterForm = () => {
    setChapterForm(current => ({ parent: current.parent, title: '', title_ru: '', order: '' }))
    setEditingChapter(null)
  }

  const saveChapter = async event => {
    event.preventDefault()
    if (!db || !admin || saving) return

    if (!chapterForm.parent) {
      notify('Аввал китоб ё бахшро интихоб кунед.', 'error')
      return
    }
    if (!clean(chapterForm.title)) {
      notify('Номи бобро ворид кунед.', 'error')
      return
    }

    setSaving(true)

    try {
      const order = Number(chapterForm.order) || nextChapterOrder(chapterForm.parent)
      const payload = chapterRow(chapterForm.parent, clean(chapterForm.title), chapterForm.title_ru, order)

      const result = editingChapter
        ? await db.from('content_items').update(payload).eq('id', editingChapter)
        : await db.from('content_items').insert(payload)

      if (result.error) throw result.error

      resetChapterForm()
      await reloadAll()
      notify(t.saved)
    } catch (error) {
      notify(t.error + error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const startEditChapter = chapter => {
    setEditingChapter(chapter.raw.id)
    setChapterForm({
      parent: `${chapter.parentKind}:${chapter.parent}`,
      title: chapter.title,
      title_ru: chapter.titleRu,
      order: String(chapter.order || '')
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteChapter = async chapter => {
    if (!db || !admin) return
    if (!window.confirm('Боб нест карда шавад? Ҳадис ва маводи дохили он нест намешавад — зери «Бе боб» мемонад.')) return

    try {
      const { error } = await db.from('content_items').delete().eq('id', chapter.raw.id)
      if (error) throw error

      await reloadAll()
      notify(t.saved)
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  const insertChapters = async (titles, parent) => {
    const base = nextChapterOrder(parent)
    const rows = titles.map((title, index) => chapterRow(parent, title, '', base + index))
    const { error } = await db.from('content_items').insert(rows)
    if (error) throw error
  }

  const addBulkChapters = async () => {
    if (!db || !admin || saving) return

    const titles = bulkText.split('\n').map(line => clean(line)).filter(Boolean)
    if (!chapterForm.parent || !titles.length) {
      notify('Китоб/бахшро интихоб кунед ва ҳадди ақал як сатр нависед.', 'error')
      return
    }

    setSaving(true)
    try {
      await insertChapters(titles, chapterForm.parent)
      setBulkText('')
      await reloadAll()
      notify(`${titles.length} боб илова шуд.`)
    } catch (error) {
      notify(t.error + error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Бобҳои стандартии Саҳеҳи Бухорӣ; бобҳои мавҷуда такрор намешаванд.
  const seedBukhariChapters = async () => {
    if (!db || !admin || saving) return

    const parent = 'book:sahih-al-bukhari'
    const existing = new Set(chaptersOfParent(parent).map(item => item.order))
    const rows = BUKHARI_CHAPTERS
      .map((title, index) => ({ title, order: index + 1 }))
      .filter(item => !existing.has(item.order))
      .map(item => chapterRow(parent, item.title, '', item.order))

    if (!rows.length) {
      notify('Ҳамаи 97 боб аллакай илова шудааст.')
      return
    }

    setSaving(true)
    try {
      const { error } = await db.from('content_items').insert(rows)
      if (error) throw error

      await reloadAll()
      notify(`${rows.length} боб илова шуд.`)
    } catch (error) {
      notify(t.error + error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  /* ---------- Тарҷумаи русии маводи сабтшуда ---------- */

  const collectTranslationJobs = () => {
    const jobs = []

    hadithRows.forEach(item => {
      const stored = parseStoredNote(item.source_note)
      const need = {}
      if (clean(item.tajik_text) && !clean(stored.meta.russian_text || item.russian_text)) need.russian_text = item.tajik_text
      const explanation = item.commentary || stored.meta.explanation_tg
      if (clean(explanation) && !clean(stored.meta.explanation_ru)) need.explanation_ru = explanation
      if (Object.keys(need).length) jobs.push({ table: 'hadiths', row: item, stored, need })
    })

    contentRows.forEach(item => {
      const stored = parseStoredNote(item.source_note)
      const need = {}
      if (clean(item.title) && !clean(stored.meta.title_ru)) need.title_ru = item.title
      const text = item.tajik_text || item.content_text
      if (clean(text) && !clean(stored.meta.russian_text || item.russian_text)) need.russian_text = text
      if (clean(stored.meta.explanation_tg) && !clean(stored.meta.explanation_ru)) need.explanation_ru = stored.meta.explanation_tg
      if (Object.keys(need).length) jobs.push({ table: 'content_items', row: item, stored, need })
    })

    chapters.forEach(item => {
      if (clean(item.title) && !clean(item.titleRu)) {
        jobs.push({
          table: 'content_items',
          row: item.raw,
          stored: parseStoredNote(item.raw.source_note),
          need: { title_ru: item.title }
        })
      }
    })

    return jobs
  }

  const runTranslation = async () => {
    if (!db || !admin || translation.running) return

    const jobs = collectTranslationJobs()
    if (!jobs.length) {
      setTranslation({ running: false, done: 0, total: 0, message: 'Ҳамаи маълумот аллакай тарҷума шудааст.' })
      return
    }

    if (!window.confirm(`${jobs.length} сатр тарҷума ва сабт карда мешавад. Давом диҳем?`)) return

    cancelRef.current = false
    setTranslation({ running: true, done: 0, total: jobs.length, message: '' })

    let done = 0
    try {
      for (const job of jobs) {
        if (cancelRef.current) break

        const meta = { ...job.stored.meta }
        for (const [field, text] of Object.entries(job.need)) {
          meta[field] = await translateTgRu(text)
        }

        const { error } = await db.from(job.table)
          .update({ source_note: makeStoredNote(job.stored.source, meta), updated_at: new Date().toISOString() })
          .eq('id', job.row.id)
        if (error) throw error

        done += 1
        setTranslation({ running: true, done, total: jobs.length, message: '' })
        await new Promise(resolve => setTimeout(resolve, 250))
      }

      setTranslation({
        running: false,
        done,
        total: jobs.length,
        message: cancelRef.current ? 'Қатъ карда шуд.' : 'Тайёр! Тарҷума сабт шуд.'
      })
    } catch (error) {
      console.error(error)
      setTranslation({
        running: false,
        done,
        total: jobs.length,
        message: 'Хато: ' + (error.message || 'хидмати тарҷума дастрас нест') + '. Метавонед дубора кӯшиш кунед — сабтшудаҳо нигоҳ дошта мешаванд.'
      })
    }

    await reloadAll()
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
        chapter_id: clean(contentForm.chapter_id),
        daily_date: contentForm.section_slug === 'sunnah' ? clean(contentForm.daily_date) : '',
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
      chapter_id: stored.meta.chapter_id || '',
      daily_date: stored.meta.daily_date || '',
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

  const contextRowsAll = useMemo(() => {
    if (!selectedSection) return []

    if (selectedSection.slug === 'hadith') {
      if (!selectedBook) return []

      return hadithRows
        .filter(item => selectedBook.ids.includes(String(item.book_id)))
        .map(item => ({ ...item, resultType: 'hadith' }))
        .sort((a, b) => numericValue(a.hadith_number) - numericValue(b.hadith_number))
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

  const contextChapters = useMemo(() => {
    if (!selectedSection || selectedSection.slug === 'quran') return []

    if (selectedSection.slug === 'hadith') {
      return selectedBook
        ? chapters.filter(item => item.parentKind === 'book' && item.parent === selectedBook.key && !item.hidden)
        : []
    }

    return chapters.filter(item => item.parentKind === 'section' && item.parent === selectedSection.slug && !item.hidden)
  }, [selectedSection, selectedBook, chapters])

  const dailySunnah = useMemo(() => {
    const latest = (a, b) =>
      new Date(b.updated_at || b.created_at || 0).getTime() -
      new Date(a.updated_at || a.created_at || 0).getTime()

    const sunnahItems = contentRows.filter(item => item.section_slug === 'sunnah')

    // Аввал: суннате, ки админ барои имрӯз интихоб кардааст; баъд: суннати бо аломат.
    const pinned = sunnahItems
      .filter(item => parseStoredNote(item.source_note).meta.daily_date === today)
      .sort(latest)[0]
    if (pinned) return pinned

    return sunnahItems
      .filter(item => parseStoredNote(item.source_note).meta.is_daily_sunnah === true)
      .sort(latest)[0] || null
  }, [contentRows, today])

  const chapterIdOf = item => String(parseStoredNote(item.source_note).meta.chapter_id || '')
  const validChapterIds = new Set(contextChapters.map(item => item.id))
  const uncategorizedRows = contextRowsAll.filter(item => !validChapterIds.has(chapterIdOf(item)))

  let publicContent = contextRowsAll
  if (contextChapters.length) {
    if (selectedChapter === null) publicContent = []
    else if (selectedChapter === '__none') publicContent = uncategorizedRows
    else publicContent = contextRowsAll.filter(item => chapterIdOf(item) === selectedChapter)
  }

  const favoriteHadiths = useMemo(
    () => hadithRows.filter(item => favorites.includes(String(item.id))),
    [hadithRows, favorites]
  )

  /* ---------- Қуръони Карим: ҳамаи 114 сура аз интернет ---------- */

  const stopAudio = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.loop = false
    }
    setPlaying({ index: -1, mode: 'idle' })
  }, [])

  // Рӯйхати сураҳо (шумораи оятҳо, номи арабӣ) ва рӯйхати қориҳо — як маротиба.
  useEffect(() => {
    let active = true

    quranFetch('/surah').then(list => {
      if (!active || !Array.isArray(list)) return
      setSurahList(current => current.map(item => {
        const found = list.find(row => row.number === item.number)
        return found
          ? { ...item, arabic: found.name, english: found.englishName, ayahs: found.numberOfAyahs, type: found.revelationType }
          : item
      }))
    }).catch(() => {})

    quranFetch('/edition?format=audio&language=ar&type=versebyverse').then(list => {
      if (!active || !Array.isArray(list) || !list.length) return
      const mapped = list.map(item => ({ id: item.identifier, name: item.englishName || item.name }))
      setReciters(mapped)
      setReciter(current => mapped.some(item => item.id === current) ? current : mapped[0].id)
    }).catch(() => {})

    return () => { active = false }
  }, [])

  // Боркунии сураи интихобшуда: матни арабӣ + тоҷикӣ + русӣ + аудиои қорӣ.
  useEffect(() => {
    if (!selectedSurah) {
      setSurahData(null)
      return undefined
    }

    let active = true
    setSurahLoading(true)
    setSurahError(false)

    const load = async () => {
      try {
        let text = quranCache.current[`t${selectedSurah}`]
        if (!text) {
          const data = await quranFetch(`/surah/${selectedSurah}/editions/quran-uthmani,tg.ayati,ru.kuliev`)
          const by = id => (data.find(item => item.edition?.identifier === id)?.ayahs) || []
          text = { arabic: by('quran-uthmani'), tajik: by('tg.ayati'), russian: by('ru.kuliev') }
          if (!text.arabic.length) throw new Error('empty')
          quranCache.current[`t${selectedSurah}`] = text
        }

        let audio = quranCache.current[`a${selectedSurah}:${reciter}`]
        if (!audio) {
          try {
            const data = await quranFetch(`/surah/${selectedSurah}/${reciter}`)
            audio = (data.ayahs || []).map(item => item.audio || '')
            quranCache.current[`a${selectedSurah}:${reciter}`] = audio
          } catch {
            audio = []
          }
        }

        if (!active) return

        setSurahData({
          number: selectedSurah,
          ayahs: text.arabic.map((ayah, index) => ({
            n: ayah.numberInSurah,
            arabic: stripBismillah(ayah.text, selectedSurah, index),
            tajik: text.tajik[index]?.text || '',
            russian: text.russian[index]?.text || '',
            audio: audio[index] || ''
          }))
        })
      } catch (error) {
        console.error('Quran load error:', error)
        if (active) setSurahError(true)
      } finally {
        if (active) setSurahLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [selectedSurah, reciter, surahRetry])

  // Аудио танҳо дар саҳифаи сура кор мекунад.
  useEffect(() => {
    if (page !== 'section' || !selectedSurah) stopAudio()
  }, [page, selectedSurah, stopAudio])

  useEffect(() => () => stopAudio(), [stopAudio])

  // Сураи пурра: як файли яклухт, бе танаффус (CDN-и alquran.cloud; захира: cdn.islamic.app).
  const surahSources = number => [
    `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${number}.mp3`,
    `https://cdn.islamic.app/quran/audio-surah/${reciter}/${number}.mp3`
  ]

  const playSurah = () => {
    const audio = audioRef.current
    if (!audio || !selectedSurah) return

    audio.loop = false
    audio.src = surahSources(selectedSurah)[0]
    audio.play().catch(() => {})
    setPlaying({ index: -1, mode: 'surah', file: 0 })
  }

  // mode: 'one' — як маротиба, 'loop' — такроран то бас кардан, 'chain' — захира: оят ба оят.
  const playAyah = (index, mode) => {
    const ayah = surahData?.ayahs?.[index]
    const audio = audioRef.current

    if (!audio) return
    if (!ayah?.audio) {
      notify(t.audioUnavailable, 'error')
      return
    }

    audio.loop = mode === 'loop'
    audio.src = ayah.audio
    audio.play().catch(() => notify(t.audioUnavailable, 'error'))
    setPlaying({ index, mode })

    setTimeout(() => {
      document.getElementById(`ayah-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
  }

  const handleAudioEnded = () => {
    const total = surahData?.ayahs?.length || 0
    if (playing.mode === 'chain' && playing.index < total - 1) {
      playAyah(playing.index + 1, 'chain')
    } else if (playing.mode !== 'loop') {
      setPlaying({ index: -1, mode: 'idle' })
    }
  }

  const handleAudioError = () => {
    const audio = audioRef.current
    if (!audio || playing.mode === 'idle') return

    if (playing.mode === 'surah') {
      const sources = surahSources(selectedSurah)
      if (playing.file < sources.length - 1) {
        audio.src = sources[playing.file + 1]
        audio.play().catch(() => {})
        setPlaying({ index: -1, mode: 'surah', file: playing.file + 1 })
      } else {
        notify(t.playAllFailed, 'error')
        playAyah(0, 'chain')
      }
      return
    }

    notify(t.audioUnavailable, 'error')
    setPlaying({ index: -1, mode: 'idle' })
  }

  const changeArabicSize = delta => {
    setArabicSize(current => {
      const next = Math.min(40, Math.max(20, current + delta))
      try {
        window.localStorage.setItem('miftah_arabic_size', String(next))
      } catch {
        // нигоҳдорӣ дастрас нест
      }
      return next
    })
  }

  const changeReciter = id => {
    stopAudio()
    setReciter(id)
    try {
      window.localStorage.setItem(RECITER_KEY, id)
    } catch {
      // нигоҳдорӣ дастрас нест
    }
  }

  const surahDisplayName = item => (lang === 'ru' ? (item.english || item.name) : item.name)

  const toggleAyahFavorite = item => {
    const key = `${item.surah}:${item.n}`
    setQuranFavs(current => {
      const next = { ...current }
      if (next[key]) delete next[key]
      else next[key] = {
        surah: item.surah,
        n: item.n,
        surahName: item.surahName,
        arabic: item.arabic,
        tajik: item.tajik,
        russian: item.russian
      }
      try {
        window.localStorage.setItem(QURAN_FAVORITES_KEY, JSON.stringify(next))
      } catch {
        // нигоҳдорӣ дастрас нест
      }
      return next
    })
  }

  const renderAyahCard = (item, index = -1, live = false) => {
    const key = `${item.surah}:${item.n}`
    const isFavorite = Boolean(quranFavs[key])
    const translationText = lang === 'ru'
      ? (item.russian || item.tajik)
      : (item.tajik || item.russian)
    const isCurrent = live && playing.index === index
    const plain = [
      item.arabic,
      translationText,
      `${t.quranWord}, ${t.surahWord} ${item.surahName}, ${t.ayahWord} ${item.n}`
    ].filter(Boolean).join('\n\n')

    return (
      <article
        className={`public-item ayah-card ${isCurrent ? 'is-playing' : ''}`}
        id={live ? `ayah-${index}` : undefined}
        key={key}
      >
        <div className="item-number">
          {t.surahWord} {item.surahName} · {t.ayahWord} {item.n}
        </div>

        <p className="arabic-text">{item.arabic}</p>
        {translationText && (showTranslation || !live) && <p className="ayah-translation">{translationText}</p>}

        {live && (
          <div className="ayah-audio">
            <button
              className={`play-chip ${isCurrent && playing.mode === 'one' ? 'is-on' : ''}`}
              type="button"
              onClick={() => (isCurrent && playing.mode === 'one' ? stopAudio() : playAyah(index, 'one'))}
            >
              <Icon name="play" filled />
              <span>{isCurrent && playing.mode === 'one' ? t.stopAudio : t.playAyah}</span>
            </button>

            <button
              className={`play-chip ${isCurrent && playing.mode === 'loop' ? 'is-on' : ''}`}
              type="button"
              onClick={() => (isCurrent && playing.mode === 'loop' ? stopAudio() : playAyah(index, 'loop'))}
            >
              <span aria-hidden="true">↻</span>
              <span>{isCurrent && playing.mode === 'loop' ? t.stopAudio : t.repeatAyah}</span>
            </button>
          </div>
        )}

        <div className="card-actions">
          <button className="action-button" type="button" onClick={() => copyText(plain)}>
            <Icon name="copy" />
            <span>{t.copy}</span>
          </button>

          <button
            className={`action-button ${isFavorite ? 'is-on' : ''}`}
            type="button"
            onClick={() => toggleAyahFavorite(item)}
            aria-pressed={isFavorite}
          >
            <Icon name="heart" />
            <span>{t.favorite}</span>
          </button>

          <button className="action-button" type="button" onClick={() => shareText(plain)}>
            <Icon name="share" />
            <span>{t.share}</span>
          </button>
        </div>
      </article>
    )
  }

  const renderQuran = () => {
    if (!selectedSurah) {
      const query = clean(surahFilter).toLowerCase()
      const list = surahList.filter(item =>
        !query ||
        String(item.number) === query ||
        item.name.toLowerCase().includes(query) ||
        (item.english || '').toLowerCase().includes(query) ||
        (item.arabic || '').includes(query)
      )
      const extras = contentRows.filter(item => item.section_slug === 'quran')

      return (
        <>
          <div className="surah-search">
            <input
              value={surahFilter}
              onChange={event => setSurahFilter(event.target.value)}
              placeholder={t.surahFilter}
            />
          </div>

          <div className="menu menu-list">
            {list.map(item => (
              <button
                className="menu-card"
                key={item.number}
                type="button"
                onClick={() => setSelectedSurah(item.number)}
              >
                <span className="surah-number">{item.number}</span>

                <span className="menu-card-body">
                  <h3>{surahDisplayName(item)}</h3>
                  <p>
                    {item.ayahs ? `${item.ayahs} ${t.ayahsCount}` : ''}
                    {item.type ? `${item.ayahs ? ' · ' : ''}${item.type === 'Meccan' ? t.makki : t.madani}` : ''}
                  </p>
                </span>

                {item.arabic && <span className="surah-arabic">{item.arabic}</span>}
              </button>
            ))}
          </div>

          {extras.length > 0 && (
            <>
              <h3 className="extras-title">{t.extraMaterials}</h3>
              <div className="public-list">{extras.map(item => renderContentCard(item))}</div>
            </>
          )}
        </>
      )
    }

    const current = surahList.find(item => item.number === selectedSurah) || { number: selectedSurah, name: '' }
    const surahName = surahDisplayName(current)
    const ayahs = surahData?.number === selectedSurah ? surahData.ayahs : []
    const fullPlaying = playing.mode === 'surah' || playing.mode === 'chain'

    return (
      <div className="quran-view" style={{ '--arabic-size': `${arabicSize}px` }}>
        <button className="secondary-button back-button" type="button" onClick={() => setSelectedSurah(null)}>
          ← {t.back}
        </button>

        <div className="section-intro">
          <h3>{t.surahWord} {surahName}</h3>
          <p>
            {current.arabic ? `${current.arabic} · ` : ''}
            {current.ayahs ? `${current.ayahs} ${t.ayahsCount}` : ''}
            {current.type ? ` · ${current.type === 'Meccan' ? t.makki : t.madani}` : ''}
          </p>
        </div>

        <div className="player-card">
          <label htmlFor="reciter-select">{t.reciter}</label>
          <select
            id="reciter-select"
            value={reciter}
            onChange={event => changeReciter(event.target.value)}
          >
            {reciters.map(item => (
              <option value={item.id} key={item.id}>{item.name}</option>
            ))}
          </select>

          <button
            className="primary-button"
            type="button"
            onClick={() => (fullPlaying ? stopAudio() : playSurah())}
          >
            {fullPlaying ? `■ ${t.stopAudio}` : `▶ ${t.playAll}`}
          </button>

          <audio
            ref={audioRef}
            className={`surah-audio ${playing.mode === 'surah' ? 'show' : ''}`}
            controls
            preload="none"
            onEnded={handleAudioEnded}
            onError={handleAudioError}
          />

          <div className="reader-tools">
            <button className="play-chip" type="button" onClick={() => changeArabicSize(-2)}>A−</button>
            <button className="play-chip" type="button" onClick={() => changeArabicSize(2)}>A+</button>
            <button
              className={`play-chip ${showTranslation ? 'is-on' : ''}`}
              type="button"
              onClick={() => setShowTranslation(value => !value)}
            >
              {t.translationLabel}
            </button>
          </div>
        </div>

        {surahLoading && !ayahs.length && <div className="empty-state">{t.surahLoading}</div>}

        {surahError && !ayahs.length && (
          <div className="empty-state">
            <p>{t.surahError}</p>
            <button className="secondary-button" type="button" onClick={() => setSurahRetry(value => value + 1)}>
              {t.retry}
            </button>
          </div>
        )}

        {ayahs.length > 0 && selectedSurah !== 1 && selectedSurah !== 9 && (
          <p className="bismillah arabic-text">{BISMILLAH}</p>
        )}

        <div className="public-list">
          {ayahs.map((ayah, index) => renderAyahCard({
            surah: selectedSurah,
            surahName,
            n: ayah.n,
            arabic: ayah.arabic,
            tajik: ayah.tajik,
            russian: ayah.russian
          }, index, true))}
        </div>

        {ayahs.length > 0 && <p className="quran-source">{t.quranSource}</p>}
      </div>
    )
  }

  /* ---------- Ҳадис/суннати рӯз: интихоби админ ---------- */

  const pinDaily = async (item, table) => {
    if (!db || !admin) return

    try {
      const stored = parseStoredNote(item.source_note)
      const isPinned = stored.meta.daily_date === todayKey()
      const meta = { ...stored.meta, daily_date: isPinned ? '' : todayKey() }

      const { error } = await db.from(table)
        .update({ source_note: makeStoredNote(stored.source, meta), updated_at: new Date().toISOString() })
        .eq('id', item.id)

      if (error) throw error

      await reloadAll()
      notify(isPinned ? 'Аз «имрӯз» гирифта шуд.' : 'Барои имрӯз гузошта шуд (24 соат).')
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  /* ---------- Боргирии аудио/видео аз дастгоҳ (Supabase Storage, bucket «media») ---------- */

  const uploadMedia = async (file, kind, onChange) => {
    if (!db || !admin) return

    if (!String(file.type).startsWith(`${kind}/`)) {
      notify(kind === 'audio' ? 'Танҳо файли аудио интихоб кунед.' : 'Танҳо файли видео интихоб кунед.', 'error')
      return
    }

    setUploading(current => ({ ...current, [kind]: true }))

    try {
      const ext = (file.name.split('.').pop() || kind).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || kind
      const path = `${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

      const { error } = await db.storage.from('media').upload(path, file, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false
      })
      if (error) throw error

      const { data } = db.storage.from('media').getPublicUrl(path)
      onChange(data.publicUrl)
      notify('Файл бор шуд. Ҳоло «Сабт кардан»-ро пахш кунед.')
    } catch (error) {
      console.error(error)
      notify(t.error + (error.message || 'боргирӣ нашуд') + ' — санҷед: bucket «media» сохта шудааст ва ҳаҷми файл аз ҳад зиёд нест?', 'error')
    } finally {
      setUploading(current => ({ ...current, [kind]: false }))
    }
  }

  const mediaField = (kind, label, value, onChange) => (
    <div className="form-group media-field">
      <label>{label}</label>

      {value ? (
        <div className="media-current">
          <span>{decodeURIComponent(String(value).split('/').pop() || '').slice(0, 48)}</span>
          <button type="button" className="danger-button" onClick={() => onChange('')}>
            Нест кардан
          </button>
        </div>
      ) : (
        <div className="media-empty">Файл интихоб нашудааст</div>
      )}

      <label className="upload-button">
        {uploading[kind]
          ? 'Бор шуда истодааст...'
          : (value
            ? 'Файли дигар интихоб кардан'
            : (kind === 'audio' ? '🎧 Аудиоро аз телефон ё файл интихоб кунед' : '🎬 Видеоро аз галерея ё файл интихоб кунед'))}
        <input
          type="file"
          accept={`${kind}/*`}
          hidden
          disabled={uploading[kind]}
          onChange={event => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) uploadMedia(file, kind, onChange)
          }}
        />
      </label>
    </div>
  )

  /* ---------- Саволу ҷавоби шахсӣ ---------- */

  const loadMyQuestions = useCallback(async () => {
    if (!db) return

    const { data, error } = await db.rpc('my_questions', { p_token: getAskToken() })
    if (error) {
      console.warn('my_questions failed:', error)
      setAskError(error.message || 'error')
      return
    }

    setAskError('')
    setMyQuestions(data || [])
  }, [])

  useEffect(() => {
    if (page === 'section' && selectedSection?.slug === 'questions') loadMyQuestions()
  }, [page, selectedSection, loadMyQuestions])

  const sendQuestion = async () => {
    if (!db || askBusy) return

    if (clean(askForm.question).length < 3) {
      notify(t.askEmpty, 'error')
      return
    }

    setAskBusy(true)

    try {
      const { error } = await db.rpc('ask_question', {
        p_token: getAskToken(),
        p_name: clean(askForm.name),
        p_question: clean(askForm.question),
        p_user_key: currentUserKey()
      })
      if (error) throw error

      setAskForm({ name: askForm.name, question: '' })
      await loadMyQuestions()
      notify(t.askSent)
    } catch (error) {
      console.error(error)
      notify(t.askUnavailable, 'error')
    } finally {
      setAskBusy(false)
    }
  }

  const loadAdminQuestions = useCallback(async () => {
    if (!db) return

    const { data, error } = await db.from('questions').select('*').order('created_at', { ascending: true })
    if (error) {
      setQuestionsError(error.message || 'error')
      return
    }

    setQuestionsError('')
    setAdminQuestions(data || [])
  }, [])

  useEffect(() => {
    if (admin) loadAdminQuestions()
  }, [admin, loadAdminQuestions])

  const answerQuestion = async question => {
    if (!db || !admin) return

    const text = clean(answerDrafts[question.id] ?? question.answer ?? '')
    if (!text) {
      notify('Ҷавобро нависед.', 'error')
      return
    }

    try {
      const { error } = await db.from('questions')
        .update({ answer: text, answered_at: new Date().toISOString() })
        .eq('id', question.id)
      if (error) throw error

      setAnswerDrafts(current => {
        const next = { ...current }
        delete next[question.id]
        return next
      })
      await loadAdminQuestions()
      notify('Ҷавоб ба корбар фиристода шуд.')
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  const deleteQuestion = async question => {
    if (!db || !admin || !window.confirm(t.confirm)) return

    try {
      const { error } = await db.from('questions').delete().eq('id', question.id)
      if (error) throw error

      await loadAdminQuestions()
      notify(t.saved)
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  const pendingQuestions = adminQuestions.filter(item => !clean(item.answer)).length

  const formatDate = value => {
    try {
      return new Date(value).toLocaleString(lang === 'ru' ? 'ru-RU' : 'tg-TJ', { dateStyle: 'medium', timeStyle: 'short' })
    } catch {
      return String(value || '')
    }
  }

  const renderAsk = () => {
    const extras = contentRows.filter(item => item.section_slug === 'questions')

    return (
      <>
        <div className="settings-card ask-card">
          <h3>{t.askTitle}</h3>
          <p className="ask-note">{t.askPrivacy}</p>

          <div className="form-group">
            <label>{t.askNameLabel}</label>
            <input
              value={askForm.name}
              onChange={event => setAskForm({ ...askForm, name: event.target.value })}
              maxLength={60}
            />
          </div>

          <div className="form-group">
            <textarea
              value={askForm.question}
              onChange={event => setAskForm({ ...askForm, question: event.target.value })}
              placeholder={t.askPlaceholder}
              maxLength={2000}
            />
          </div>

          <button className="primary-button" type="button" onClick={sendQuestion} disabled={askBusy}>
            {askBusy ? t.loading : t.askSend}
          </button>
        </div>

        <div className="block-heading">
          <h3 className="extras-title">{t.myQuestions}</h3>
          <button className="link-button" type="button" onClick={loadMyQuestions}>{t.askRefresh}</button>
        </div>

        {askError && <div className="empty-state">{t.askUnavailable}</div>}

        {!askError && !myQuestions.length && <div className="empty-state">{t.askNone}</div>}

        <div className="public-list">
          {myQuestions.map(item => (
            <article className="public-item" key={item.id}>
              <div className="item-number">{formatDate(item.created_at)}</div>
              <p>{item.question}</p>

              {clean(item.answer) ? (
                <div className="explanation">
                  <strong>{t.askAnswerLabel}</strong>
                  <p>{item.answer}</p>
                </div>
              ) : (
                <div className="source-note">⏳ {t.askPending}</div>
              )}
            </article>
          ))}
        </div>

        {myQuestions.length > 0 && <p className="quran-source">{t.askOnThisDevice}</p>}

        {extras.length > 0 && (
          <>
            <h3 className="extras-title">{t.extraMaterials}</h3>
            <div className="public-list">{extras.map(item => renderContentCard(item))}</div>
          </>
        )}
      </>
    )
  }

  const renderAdminQuestions = () => {
    const ordered = [...adminQuestions].sort((a, b) =>
      Number(Boolean(clean(a.answer))) - Number(Boolean(clean(b.answer))) ||
      new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    )

    return (
      <>
        {questionsError && (
          <div className="admin-form">
            <p className="admin-note">
              Ҷадвали «questions» ҳанӯз танзим нашудааст ({questionsError}). Файли supabase-setup.sql-ро
              дар Supabase → SQL Editor иҷро кунед.
            </p>
          </div>
        )}

        <div className="admin-list">
          {ordered.map(item => (
            <div className="admin-item" key={item.id}>
              <h4>{item.asker_name || 'Беном'} · {formatDate(item.created_at)}</h4>
              <p>{item.question}</p>

              <div className="admin-item-status">
                {clean(item.answer) ? '✓ Ҷавоб дода шудааст' : '⏳ Интизори ҷавоб'}
              </div>

              <div className="form-group">
                <textarea
                  value={answerDrafts[item.id] ?? item.answer ?? ''}
                  onChange={event => setAnswerDrafts({ ...answerDrafts, [item.id]: event.target.value })}
                  placeholder="Ҷавоби худро нависед — он ба корбар аз номи барнома мерасад..."
                />
              </div>

              <div className="admin-item-actions">
                <button className="primary-button" onClick={() => answerQuestion(item)}>
                  {clean(item.answer) ? 'Навсозии ҷавоб' : 'Ҷавоб фиристодан'}
                </button>

                <button className="danger-button" onClick={() => deleteQuestion(item)}>
                  {t.delete}
                </button>
              </div>
            </div>
          ))}

          {!ordered.length && !questionsError && <div className="empty-state">Ҳоло савол нест.</div>}
        </div>
      </>
    )
  }

  // Ҳадис/суннатро барои санаи дилхоҳ мегузорад (барои ҳамон сана танҳо як мавод: дигарон тоза мешаванд).
  const assignDaily = async (item, table, rows, date) => {
    if (!db || !admin || !item) return

    try {
      const writes = []

      if (date) {
        rows.forEach(row => {
          if (String(row.id) !== String(item.id) && parseStoredNote(row.source_note).meta.daily_date === date) {
            writes.push({ row, value: '' })
          }
        })
      }
      writes.push({ row: item, value: date })

      for (const write of writes) {
        const stored = parseStoredNote(write.row.source_note)
        const { error } = await db.from(table)
          .update({
            source_note: makeStoredNote(stored.source, { ...stored.meta, daily_date: write.value }),
            updated_at: new Date().toISOString()
          })
          .eq('id', write.row.id)
        if (error) throw error
      }

      await reloadAll()
      notify(date ? `Барои ${date} гузошта шуд.` : 'Аз рӯз гирифта шуд.')
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  const renderAdminDaily = () => {
    const sunnahRows = contentRows.filter(item => item.section_slug === 'sunnah')
    const dateOf = item => parseStoredNote(item.source_note).meta.daily_date || ''
    const upcoming = rows => rows.filter(item => dateOf(item) >= todayKey()).sort((a, b) => dateOf(a).localeCompare(dateOf(b)))

    const hadithLabel = item =>
      `${getBookName(item.book_id)} · № ${item.hadith_number} — ${clean(item.tajik_text || item.arabic_text).slice(0, 45)}`
    const sunnahLabel = item =>
      item.title || clean(item.tajik_text || item.content_text || item.arabic_text).slice(0, 50) || String(item.id)

    const block = (title, kind, rows, table, label) => {
      const selected = rows.find(item => String(item.id) === String(dailyPick[kind]))
      const scheduled = upcoming(rows)

      return (
        <div className="admin-form">
          <h3>{title}</h3>

          <div className="form-group">
            <label>Интихоб кунед</label>
            <select
              value={dailyPick[kind]}
              onChange={event => setDailyPick({ ...dailyPick, [kind]: event.target.value })}
            >
              <option value="">— аз рӯйхат интихоб кунед —</option>
              {rows.map(item => (
                <option value={item.id} key={item.id}>{label(item)}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Дар кадом сана (24 соат)</label>
            <input type="date" value={dailyDate} onChange={event => setDailyDate(event.target.value)} />
          </div>

          <div className="form-actions">
            <button
              className="primary-button"
              type="button"
              disabled={!selected || !dailyDate}
              onClick={() => assignDaily(selected, table, rows, dailyDate)}
            >
              Гузоштан барои ин сана
            </button>

            <button
              className="secondary-button"
              type="button"
              disabled={!selected}
              onClick={() => assignDaily(selected, table, rows, todayKey())}
            >
              Имрӯз гузоштан
            </button>
          </div>

          {!rows.length && <p className="admin-note">Ҳоло мавод нест — аввал дар ҷадвали дахлдор илова кунед.</p>}

          {scheduled.length > 0 && (
            <div className="admin-list" style={{ marginTop: 16 }}>
              {scheduled.map(item => (
                <div className="admin-item" key={item.id}>
                  <h4>📅 {dateOf(item)}{dateOf(item) === todayKey() ? ' (имрӯз)' : ''}</h4>
                  <p>{label(item)}</p>

                  <div className="admin-item-actions">
                    <button className="danger-button" onClick={() => assignDaily(item, table, rows, '')}>
                      Бекор кардан
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <>
        <p className="admin-note">
          Дар санаи интихобшуда (24 соат) ҳамон ҳадис ва суннат дар саҳифаи асосӣ нишон дода мешавад.
          Агар барои имрӯз чизе гузошта нашавад, барнома худаш интихоб мекунад.
        </p>

        {block('Ҳадиси рӯз', 'hadith', hadithRows, 'hadiths', hadithLabel)}
        {block('Суннати рӯз', 'sunnah', sunnahRows, 'content_items', sunnahLabel)}
      </>
    )
  }

  /* ---------- Омори корбарон ва блок (танҳо барои мудир) ---------- */

  // Ҳангоми кушодани барнома ташриф сабт мешавад ва маълум мешавад, ки корбар блок шудааст ё не.
  useEffect(() => {
    if (!db) return

    const telegramUser = getTelegramUser()

    db.rpc('register_visit', {
      p_key: currentUserKey(),
      p_name: telegramUser?.name || '',
      p_username: telegramUser?.username || '',
      p_lang: lang
    }).then(({ data, error }) => {
      if (!error && data === true) setBlocked(true)
    })
    // фақат як маротиба ҳангоми кушодани барнома
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUsers = useCallback(async (limit = 50) => {
    if (!db) return

    setUsersLoading(true)

    try {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      const day = startOfDay.toISOString()
      const week = new Date(Date.now() - 7 * 86400000).toISOString()
      const online = new Date(Date.now() - 5 * 60000).toISOString()

      const count = async build => {
        const result = await build(db.from('app_users').select('id', { count: 'exact', head: true }))
        if (result.error) throw result.error
        return result.count || 0
      }

      const [total, blockedCount, activeToday, newToday, activeWeek, activeNow, list] = await Promise.all([
        count(query => query),
        count(query => query.eq('blocked', true)),
        count(query => query.gte('last_seen', day)),
        count(query => query.gte('first_seen', day)),
        count(query => query.gte('last_seen', week)),
        count(query => query.gte('last_seen', online)),
        db.from('app_users').select('*').order('last_seen', { ascending: false }).limit(limit)
      ])

      if (list.error) throw list.error

      setUserStats({ total, blocked: blockedCount, activeToday, newToday, activeWeek, activeNow })
      setAdminUsers(list.data || [])
      setUsersError('')
    } catch (error) {
      setUsersError(error.message || 'error')
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (admin && adminTab === 'users') loadUsers(usersLimit)
  }, [admin, adminTab, usersLimit, loadUsers])

  const toggleBlockUser = async user => {
    if (!db || !admin) return

    const willBlock = !user.blocked
    const label = user.display_name || user.username || user.user_key
    const question = willBlock
      ? `«${label}» блок карда шавад? Ӯ дигар ба барнома дохил шуда наметавонад.`
      : `«${label}» аз блок бароварда шавад?`
    if (!window.confirm(question)) return

    try {
      const { error } = await db.from('app_users')
        .update({ blocked: willBlock, blocked_at: willBlock ? new Date().toISOString() : null })
        .eq('id', user.id)
      if (error) throw error

      await loadUsers(usersLimit)
      notify(willBlock ? 'Корбар блок шуд.' : 'Блок бардошта шуд.')
    } catch (error) {
      notify(t.error + error.message, 'error')
    }
  }

  const renderAdminUsers = () => {
    const query = clean(userSearch).toLowerCase()
    const shown = adminUsers.filter(user =>
      !query ||
      String(user.display_name || '').toLowerCase().includes(query) ||
      String(user.username || '').toLowerCase().includes(query) ||
      String(user.user_key || '').toLowerCase().includes(query)
    )

    const stats = userStats ? [
      ['Ҳамагӣ корбар', userStats.total],
      ['Ҳоло дар барнома (5 дақ.)', userStats.activeNow],
      ['Имрӯз фаъол', userStats.activeToday],
      ['Имрӯз нав', userStats.newToday],
      ['7 рӯзи охир', userStats.activeWeek],
      ['Блокшуда', userStats.blocked]
    ] : []

    return (
      <>
        {usersError && (
          <div className="admin-form">
            <p className="admin-note">
              Ҷадвали корбарон ҳанӯз танзим нашудааст ({usersError}). Файли supabase-users.sql-ро
              дар Supabase → SQL Editor иҷро кунед.
            </p>
          </div>
        )}

        {stats.length > 0 && (
          <div className="stats-grid">
            {stats.map(([label, value]) => (
              <div className="stat-card" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="form-group">
          <input
            value={userSearch}
            onChange={event => setUserSearch(event.target.value)}
            placeholder="Ҷустуҷӯ: ном, @username ё рамз..."
          />
        </div>

        <div className="admin-list">
          {shown.map(user => (
            <div className="admin-item" key={user.id}>
              <h4>
                {user.blocked ? '🚫 ' : ''}
                {user.display_name || 'Беном'}
                {user.username ? ` · @${user.username}` : ''}
              </h4>

              <p>
                {String(user.user_key).startsWith('tg:') ? 'Telegram' : 'Браузер/дастгоҳ'} · …{String(user.user_key).slice(-6)}
                {'\n'}Аввалин ташриф: {formatDate(user.first_seen)}
                {'\n'}Охирин ташриф: {formatDate(user.last_seen)} · ташрифҳо: {user.visits}
              </p>

              <div className="admin-item-actions">
                <button
                  className={user.blocked ? 'secondary-button' : 'danger-button'}
                  onClick={() => toggleBlockUser(user)}
                >
                  {user.blocked ? 'Аз блок баровардан' : 'Блок кардан'}
                </button>
              </div>
            </div>
          ))}

          {!shown.length && !usersError && (
            <div className="empty-state">{usersLoading ? t.loading : 'Корбар ёфт нашуд.'}</div>
          )}

          {adminUsers.length >= usersLimit && (
            <button className="secondary-button" type="button" onClick={() => setUsersLimit(value => value + 100)}>
              Бештар нишон додан
            </button>
          )}
        </div>
      </>
    )
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

        <div className="card-actions">
          <button
            className="action-button"
            type="button"
            onClick={() => copyText([
              item.title,
              item.arabic_text,
              localizedText,
              localizedExplanation,
              stored.source
            ].filter(Boolean).join('\n\n'))}
          >
            <Icon name="copy" />
            <span>{t.copy}</span>
          </button>

          <button
            className="action-button"
            type="button"
            onClick={() => shareText([
              item.title,
              item.arabic_text,
              localizedText,
              localizedExplanation,
              stored.source
            ].filter(Boolean).join('\n\n'))}
          >
            <Icon name="share" />
            <span>{t.share}</span>
          </button>
        </div>
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
            value={hadithForm.book_id ? String(groupOfBook(hadithForm.book_id)?.id ?? hadithForm.book_id) : ''}
            onChange={event => setHadithForm({ ...hadithForm, book_id: event.target.value, chapter_id: '' })}
            required
          >
            <option value="">{t.selectBook}</option>
            {bookGroups.map(group => (
              <option value={group.id} key={group.key}>{group.name}</option>
            ))}
          </select>
        </div>

        {(() => {
          const group = groupOfBook(hadithForm.book_id)
          const options = group
            ? chapters.filter(item => item.parentKind === 'book' && item.parent === group.key)
            : []
          if (!options.length) return null
          return (
            <div className="form-group">
              <label>Боб (китоби дохилӣ){editingHadith ? '' : ' *'}</label>
              <select
                value={hadithForm.chapter_id}
                onChange={event => setHadithForm({ ...hadithForm, chapter_id: event.target.value })}
                required={!editingHadith}
              >
                <option value="">— {t.noChapter} —</option>
                {options.map(item => (
                  <option value={item.id} key={item.id}>{item.order ? `${item.order}. ` : ''}{item.title}</option>
                ))}
              </select>
            </div>
          )
        })()}

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

        {mediaField('audio', 'Аудио', hadithForm.audio_url,
          value => setHadithForm(form => ({ ...form, audio_url: value })))}

        {mediaField('video', 'Видео', hadithForm.video_url,
          value => setHadithForm(form => ({ ...form, video_url: value })))}

        <div className="form-group">
          <label>Ҳадиси рӯз барои сана (ихтиёрӣ)</label>
          <input
            type="date"
            value={hadithForm.daily_date}
            onChange={event => setHadithForm({ ...hadithForm, daily_date: event.target.value })}
          />
        </div>

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

              <button className="secondary-button" onClick={() => pinDaily(item, 'hadiths')}>
                {parseStoredNote(item.source_note).meta.daily_date === todayKey() ? '✓ Ҳадиси имрӯз' : '📅 Ҳадиси имрӯз кардан'}
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
        {bookGroups.map(group => (
          <div className="admin-item" key={group.key}>
            <h4>{group.name}</h4>

            {group.items.length > 1 && (
              <div className="admin-item-status">
                Такрорӣ ёфт шуд: {group.items.length} сатр дар база. Дар барнома як китоб нишон дода мешавад.
              </div>
            )}

            <div className="admin-item-actions">
              <button className="secondary-button" onClick={() => {
                setEditingBook(group.id)
                setBookForm({ name: group.name || '' })
              }}>
                {t.edit}
              </button>

              <button className="secondary-button" onClick={() => toggleBook(group)}>
                {group.is_active ? t.hide : t.show}
              </button>

              {group.items.length > 1 && (
                <button className="danger-button" onClick={() => mergeDuplicateBooks(group)}>
                  Якҷоя кардани такрорӣ
                </button>
              )}
            </div>
          </div>
        ))}

        {!bookGroups.length && <div className="empty-state">{t.noBooks}</div>}
      </div>
    </>
  )

  const renderAdminChapters = () => {
    const parentOptions = [
      ...bookGroups.map(group => ({ value: `book:${group.key}`, label: `📚 ${group.name}` })),
      ...sections
        .filter(section => section.slug !== 'hadith' && section.slug !== 'quran')
        .map(section => ({ value: `section:${section.slug}`, label: `${section.icon || '📁'} ${section.title}` }))
    ]
    const current = chaptersOfParent(chapterForm.parent)

    return (
      <>
        <form className="admin-form" onSubmit={saveChapter}>
          <h3>{editingChapter ? 'Таҳрири боб' : 'Иловаи боб'}</h3>

          <div className="form-group">
            <label>Ба кадом китоб ё бахш тааллуқ дорад *</label>
            <select
              value={chapterForm.parent}
              onChange={event => {
                setEditingChapter(null)
                setChapterForm({ parent: event.target.value, title: '', title_ru: '', order: '' })
              }}
              required
            >
              <option value="">— интихоб кунед —</option>
              {parentOptions.map(option => (
                <option value={option.value} key={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {field('Номи боб (тоҷикӣ)', chapterForm.title,
            value => setChapterForm({ ...chapterForm, title: value }), 'Масалан: Азкори саҳар', true)}

          {field('Номи боб (русӣ, ихтиёрӣ)', chapterForm.title_ru,
            value => setChapterForm({ ...chapterForm, title_ru: value }))}

          {field('Рақами тартиб (ихтиёрӣ)', chapterForm.order,
            value => setChapterForm({ ...chapterForm, order: value }), `Худкор: ${chapterForm.parent ? nextChapterOrder(chapterForm.parent) : 1}`)}

          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? t.loading : t.save}
            </button>

            {editingChapter && (
              <button className="secondary-button" type="button" onClick={resetChapterForm}>
                {t.cancel}
              </button>
            )}
          </div>
        </form>

        {chapterForm.parent && (
          <div className="admin-form">
            <h3>Якчанд бобро якбора илова кардан</h3>
            <div className="form-group">
              <label>Ҳар сатр — як боб</label>
              <textarea
                value={bulkText}
                onChange={event => setBulkText(event.target.value)}
                placeholder={'Азкори саҳар\nАзкори бегоҳ\nАзкори пеш аз хоб'}
              />
            </div>

            <div className="form-actions">
              <button className="primary-button" type="button" onClick={addBulkChapters} disabled={saving}>
                Илова кардани рӯйхат
              </button>

              {chapterForm.parent === 'book:sahih-al-bukhari' && (
                <button className="secondary-button" type="button" onClick={seedBukhariChapters} disabled={saving}>
                  Ҳамаи 97 китоби Саҳеҳи Бухорӣ
                </button>
              )}
            </div>
          </div>
        )}

        <div className="admin-list">
          {chapterForm.parent && current.map(item => (
            <div className="admin-item" key={item.id}>
              <h4>{item.order ? `${item.order}. ` : ''}{item.title}</h4>
              {item.titleRu && <p>{item.titleRu}</p>}

              <div className="admin-item-actions">
                <button className="secondary-button" onClick={() => startEditChapter(item)}>
                  {t.edit}
                </button>

                <button className="danger-button" onClick={() => deleteChapter(item)}>
                  {t.delete}
                </button>
              </div>
            </div>
          ))}

          {chapterForm.parent && !current.length && (
            <div className="empty-state">Ҳоло боб илова нашудааст.</div>
          )}
        </div>
      </>
    )
  }

  const renderAdminTranslate = () => {
    const pending = collectTranslationJobs().length

    return (
      <div className="admin-form">
        <h3>Тарҷумаи русӣ (худкор)</h3>
        <p className="admin-note">
          Ҳамаи ҳадисҳо, маводҳо, шарҳҳо ва номи бобҳоеро, ки матни русӣ надоранд, аз тоҷикӣ ба русӣ тарҷума карда
          дар база сабт мекунад. Матни тоҷикии шумо тағйир намеёбад. Тарҷумаи мошинӣ ғалат шуда метавонад —
          матнҳои муҳимро баъд аз санҷиш дастӣ дуруст кунед (дар «Таҳрир» майдони «Матни русӣ»).
        </p>

        <div className="admin-item-status">
          Тарҷумаи интизор: {pending} сатр
          {translation.total > 0 && ` · иҷро шуд: ${translation.done}/${translation.total}`}
        </div>

        {translation.message && <div className="admin-note">{translation.message}</div>}

        <div className="form-actions">
          <button className="primary-button" type="button" onClick={runTranslation} disabled={translation.running || !pending}>
            {translation.running ? 'Тарҷума мешавад...' : 'Тарҷума ва сабт кардан'}
          </button>

          {translation.running && (
            <button className="secondary-button" type="button" onClick={() => { cancelRef.current = true }}>
              Қатъ кардан
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderAdminContent = () => (
    <>
      <form className="admin-form" onSubmit={saveContent}>
        <h3>{editingContent ? t.editContent : t.newContent}</h3>

        <div className="form-group">
          <label>{t.section} *</label>
          <select
            value={contentForm.section_slug}
            onChange={event => setContentForm({ ...contentForm, section_slug: event.target.value, chapter_id: '' })}
            required
          >
            {sections.filter(section => section.slug !== 'hadith').map(section => (
              <option value={section.slug} key={section.slug}>{section.title}</option>
            ))}
          </select>
        </div>

        {(() => {
          const options = chapters.filter(item => item.parentKind === 'section' && item.parent === contentForm.section_slug)
          if (!options.length) return null
          return (
            <div className="form-group">
              <label>Боб</label>
              <select
                value={contentForm.chapter_id}
                onChange={event => setContentForm({ ...contentForm, chapter_id: event.target.value })}
              >
                <option value="">— {t.noChapter} —</option>
                {options.map(item => (
                  <option value={item.id} key={item.id}>{item.order ? `${item.order}. ` : ''}{item.title}</option>
                ))}
              </select>
            </div>
          )
        })()}


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

        {contentForm.section_slug === 'sunnah' && (
          <div className="form-group">
            <label>Суннати рӯз барои сана (ихтиёрӣ) — дар он рӯз (24 соат) дар саҳифаи асосӣ нишон дода мешавад</label>
            <input
              type="date"
              value={contentForm.daily_date}
              onChange={event => setContentForm({ ...contentForm, daily_date: event.target.value })}
            />
          </div>
        )}

        {mediaField('audio', 'Аудио', contentForm.audio_url,
          value => setContentForm(form => ({ ...form, audio_url: value })))}

        {mediaField('video', 'Видео', contentForm.video_url,
          value => setContentForm(form => ({ ...form, video_url: value })))}

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

              {item.section_slug === 'sunnah' && (
                <button className="secondary-button" onClick={() => pinDaily(item, 'content_items')}>
                  {parseStoredNote(item.source_note).meta.daily_date === todayKey() ? '✓ Суннати имрӯз' : '📅 Суннати имрӯз кардан'}
                </button>
              )}

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

  if (blocked && !admin) {
    return (
      <div className="app theme-green" dir={direction}>
        <div className="blocked-screen">
          <h2>Дастрасӣ маҳдуд карда шудааст</h2>
          <p>Ҳисоби шумо аз тарафи мудири барнома блок шудааст.</p>
          <button className="link-button" type="button" onClick={() => setLoginOpen(true)}>
            Воридшавии мудир
          </button>
        </div>

        {loginOpen && (
          <div className="modal-overlay" onClick={() => setLoginOpen(false)}>
            <div className="login-page" onClick={event => event.stopPropagation()}>
              <form className="login-card" onSubmit={login}>
                <button type="button" className="modal-close" onClick={() => setLoginOpen(false)}>×</button>
                <h2>{t.login}</h2>
                <div className="form-group">
                  <label>{t.email}</label>
                  <input type="email" value={email} onChange={event => setEmail(event.target.value)} required />
                </div>
                <div className="form-group">
                  <label>{t.password}</label>
                  <input type="password" value={password} onChange={event => setPassword(event.target.value)} required />
                </div>
                <button className="primary-button" type="submit">{t.login}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

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

              {selectedSection.slug === 'quran' ? renderQuran() : selectedSection.slug === 'arabic' ? (
                <ArabicSection rows={arabicRows} lang={lang} admin={admin} db={db} notify={notify} reload={reloadAll} />
              ) : selectedSection.slug === 'questions' ? renderAsk() : selectedSection.slug === 'hadith' && !selectedBook ? (
                <div className="menu menu-list">
                  {bookGroups
                    .filter(book => book.is_active !== false)
                    .map(book => (
                      <button
                        className="menu-card"
                        key={book.key}
                        onClick={() => openBook(book)}
                      >
                        <span className="menu-card-icon"><Icon name="hadith" /></span>

                        <span className="menu-card-body">
                          <h3>{bookLabel(book)}</h3>
                          <p>
                            {lang === 'ru'
                              ? 'Открыть хадисы этого сборника'
                              : 'Дидани ҳадисҳои ин китоб'}
                          </p>
                        </span>

                        <span className="menu-arrow">‹</span>
                      </button>
                    ))}

                  {!bookGroups.some(book => book.is_active !== false) && (
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
                      <h3>📚 {bookLabel(selectedBook)}</h3>
                    </div>
                  )}

                  {contextChapters.length > 0 && selectedChapter === null ? (
                    <div className="menu menu-list">
                      {contextChapters.map(chapter => (
                        <button
                          className="menu-card"
                          key={chapter.id}
                          type="button"
                          onClick={() => setSelectedChapter(chapter.id)}
                        >
                          <span className="surah-number">{chapter.order || '•'}</span>

                          <span className="menu-card-body">
                            <h3>{chapterLabel(chapter)}</h3>
                          </span>

                          <span className="menu-arrow">‹</span>
                        </button>
                      ))}

                      {uncategorizedRows.length > 0 && (
                        <button className="menu-card" type="button" onClick={() => setSelectedChapter('__none')}>
                          <span className="surah-number">•</span>

                          <span className="menu-card-body">
                            <h3>{t.noChapter}</h3>
                          </span>

                          <span className="menu-arrow">‹</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {contextChapters.length > 0 && (
                        <div className="section-intro">
                          <button className="secondary-button back-button" onClick={() => setSelectedChapter(null)}>
                            ← {t.back}
                          </button>
                          <h3>
                            {selectedChapter === '__none'
                              ? t.noChapter
                              : chapterLabel(contextChapters.find(item => item.id === selectedChapter) || { title: '', titleRu: '' })}
                          </h3>
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
                {favoriteHadiths.map(item => renderHadithCard(item))}
                {Object.values(quranFavs).map(item => renderAyahCard(item))}
                {!favoriteHadiths.length && !Object.keys(quranFavs).length && (
                  <div className="empty-state">{t.favoritesEmpty}</div>
                )}
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

                <button className={adminTab === 'users' ? 'active' : ''} onClick={() => setAdminTab('users')}>
                  👥 Корбарон
                </button>

                <button className={adminTab === 'daily' ? 'active' : ''} onClick={() => setAdminTab('daily')}>
                  📅 Ҳадис ва суннати рӯз
                </button>

                <button className={adminTab === 'questions' ? 'active' : ''} onClick={() => { setAdminTab('questions'); loadAdminQuestions() }}>
                  ❓ Саволҳо{pendingQuestions ? ` (${pendingQuestions})` : ''}
                </button>

                <button className={adminTab === 'chapters' ? 'active' : ''} onClick={() => setAdminTab('chapters')}>
                  📑 Бобҳо
                </button>

                <button className={adminTab === 'translate' ? 'active' : ''} onClick={() => setAdminTab('translate')}>
                  🌐 Тарҷума
                </button>

                <button className={adminTab === 'arabic' ? 'active' : ''} onClick={() => setAdminTab('arabic')}>
                  🔤 Забони арабӣ
                </button>
              </div>

              {adminTab === 'hadith' && renderAdminHadith()}
              {adminTab === 'books' && renderAdminBooks()}
              {adminTab === 'content' && renderAdminContent()}
              {adminTab === 'sections' && renderAdminSections()}
              {adminTab === 'users' && renderAdminUsers()}
              {adminTab === 'daily' && renderAdminDaily()}
              {adminTab === 'questions' && renderAdminQuestions()}
              {adminTab === 'chapters' && renderAdminChapters()}
              {adminTab === 'translate' && renderAdminTranslate()}
              {adminTab === 'arabic' && (
                <ArabicAdmin rows={arabicRows} lang={lang} db={db} notify={notify} reload={reloadAll} />
              )}
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
