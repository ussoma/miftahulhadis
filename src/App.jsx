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
  { slug: 'arabic', title: 'Забони арабӣ', icon: 'ع', description: 'Сарф, назария ва луғати феълҳои арабӣ', sort_order: 12, is_active: true }
]

const SECTION_TRANSLATIONS = {
  arabic: {
    ru: ['Арабский язык', 'Сарф, теория и словарь арабских глаголов'],
    ar: ['اللغة العربية', 'الصرف والنظرية ومعجم الأفعال']
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

/* =====================================================================
   Забони арабӣ (сарф) — муҳаррики тасриф ва луғати феълҳо
   ---------------------------------------------------------------------
   Муҳаррики тасриф: «mazini» (MIT, © forzagreen) — тарҷумаи TypeScript-и
   Module:ar-verb аз Wiktionary; бо 16 593 шакли китоби Дарғом/Даҳдоҳ санҷида шудааст.
   Луғати феълҳо: «جداول إحصاء الأفعال العربية» (Marwan al-Bawwab, Yahya Mir Alam;
   CC BY 4.0) — 24 188 феъл аз 7 626 реша.
   ===================================================================== */

const MZ = (() => {
var Mazini=(()=>{var er=Object.defineProperty;var bt=Object.getOwnPropertyDescriptor;var Et=Object.getOwnPropertyNames;var Ht=Object.prototype.hasOwnProperty;var at=(r,n,t)=>n in r?er(r,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[n]=t;var It=(r,n)=>{for(var t in n)er(r,t,{get:n[t],enumerable:!0})},wt=(r,n,t,s)=>{if(n&&typeof n=="object"||typeof n=="function")for(let o of Et(n))!Ht.call(r,o)&&o!==t&&er(r,o,{get:()=>n[o],enumerable:!(s=bt(n,o))||s.enumerable});return r};var Dt=r=>wt(er({},"__esModule",{value:!0}),r);var jn=(r,n,t)=>at(r,typeof n!="symbol"?n+"":n,t);var Ss={};It(Ss,{IMP_PERSON_NUMBERS:()=>w0,LEXICON_INFO:()=>as,MaziniError:()=>A,PERSON_NUMBERS:()=>c0,POTENTIAL_LEMMA_SLOTS:()=>Tr,SLOTS:()=>x0,UNSETTABLE_SLOTS:()=>gr,WAZNS:()=>P0,attestedWazns:()=>ws,classifyTriliteralVerb:()=>dr,conjugate:()=>Z1,getVerbType:()=>ds,isAttested:()=>Ds,lexiconPassive:()=>qs,lexiconRoots:()=>Is,loose:()=>B1,norm:()=>Hn,normalizeRoot:()=>u0,reducible:()=>is,transitivity:()=>hn});var xr=/[ءأإؤئ]/u;var mr="[\u064E\u0650\u064F\u064B\u064D\u064C\u0652\u0670]",_0="[\u064E\u0650\u064F]",Q0={a:"\u064E",i:"\u0650",u:"\u064F"},ur={"\u064E":"a","\u0650":"i","\u064F":"u","-":"-"},k="\u0627",E0="\u0649",H0="\u0622",cn="\u0629",C="\u062A",X="\u0646",p="\u0648",h="\u064A",yr="\u0633",M0="\u0645",a0="\u064E"+cn,j="\u064E"+k,h0="\u064E"+E0,kr=j+cn,T="\u0650"+h,g="\u064F"+p,J="\u064E"+h,lr="\u064E"+p,j0=J+"\u0652",fr=lr+"\u0652",N=X+"\u064E",qt=X+"\u0650",k0=j+X,ir=j+qt,T0=M0+"\u064E",Q=M0+"\u064F",R=C+"\u064E",I0=C+"\u064F",V=k+"\u0650",o0=k+"\u064F",c0=["1s","2ms","2fs","3ms","3fs","2d","3md","3fd","1p","2mp","2fp","3mp","3fp"],w0=c0.filter(r=>r.startsWith("2"));function e0(r){return c0.indexOf(r)}var Tr=["past_3ms","past_pass_3ms","ind_3ms","ind_pass_3ms","imp_2ms"],gr=["ap1","ap2","ap3","apcd","apan","pp2","vn2"],St=["past","ind","sub","juss"];function pt(){let r=["ap","pp","vn",...gr];for(let n of St)for(let t of["","_pass"])for(let s of c0)r.push(n+t+"_"+s);for(let n of w0)r.push("imp_"+n);return r}var x0=pt(),hs=new Set(x0),Ar=["vn","ap"];var Fr=new Set(["\u0621","\u0623","\u0625","\u0624","\u0626"]);function dr(r,n,t){let s=[Fr.has(r),Fr.has(n),Fr.has(t)],o=[r===p||r===h,n===p||n===h,t===p||t===h],e=o.filter(Boolean).length,l=n===t;if(e>0)if(e>=2){if(o[1]&&o[2])return l?n===p?"\u0645\u0639\u062A\u0644 \u0644\u0641\u064A\u0641 \u0645\u0642\u0631\u0648\u0646 \u0645\u064F\u0636\u0639\u064E\u0651\u0641 \u0648\u0627\u0648\u064A":"\u0645\u0639\u062A\u0644 \u0644\u0641\u064A\u0641 \u0645\u0642\u0631\u0648\u0646 \u0645\u064F\u0636\u0639\u064E\u0651\u0641 \u064A\u0627\u0626\u064A":s[0]?"\u0645\u0639\u062A\u0644 \u0644\u0641\u064A\u0641 \u0645\u0642\u0631\u0648\u0646 \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0641\u0627\u0621":"\u0645\u0639\u062A\u0644 \u0644\u0641\u064A\u0641 \u0645\u0642\u0631\u0648\u0646";if(o[0]&&o[1])return"\u0645\u0639\u062A\u0644 \u0644\u0641\u064A\u0641 \u0645\u0642\u0631\u0648\u0646";if(o[0]&&o[2])return s[1]?"\u0645\u0639\u062A\u0644 \u0644\u0641\u064A\u0641 \u0645\u0641\u0631\u0648\u0642 \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0639\u064A\u0646":"\u0645\u0639\u062A\u0644 \u0644\u0641\u064A\u0641 \u0645\u0641\u0631\u0648\u0642"}else{if(o[0])return r===p?s[2]?"\u0645\u0639\u062A\u0644 \u0645\u062B\u0627\u0644 \u0648\u0627\u0648\u064A \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0644\u0627\u0645":l?"\u0645\u0639\u062A\u0644 \u0645\u062B\u0627\u0644 \u0648\u0627\u0648\u064A \u0645\u064F\u0636\u0639\u064E\u0651\u0641":s[1]?"\u0645\u0639\u062A\u0644 \u0645\u062B\u0627\u0644 \u0648\u0627\u0648\u064A \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0639\u064A\u0646":"\u0645\u0639\u062A\u0644 \u0645\u062B\u0627\u0644 \u0648\u0627\u0648\u064A":l?"\u0645\u0639\u062A\u0644 \u0645\u062B\u0627\u0644 \u064A\u0627\u0626\u064A \u0645\u064F\u0636\u0639\u064E\u0651\u0641":s[1]?"\u0645\u0639\u062A\u0644 \u0645\u062B\u0627\u0644 \u064A\u0627\u0626\u064A \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0639\u064A\u0646":"\u0645\u0639\u062A\u0644 \u0645\u062B\u0627\u0644 \u064A\u0627\u0626\u064A";if(o[1])return n===p?s[2]?"\u0645\u0639\u062A\u0644 \u0623\u062C\u0648\u0641 \u0648\u0627\u0648\u064A \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0644\u0627\u0645":s[0]?"\u0645\u0639\u062A\u0644 \u0623\u062C\u0648\u0641 \u0648\u0627\u0648\u064A \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0641\u0627\u0621":"\u0645\u0639\u062A\u0644 \u0623\u062C\u0648\u0641 \u0648\u0627\u0648\u064A":s[2]?"\u0645\u0639\u062A\u0644 \u0623\u062C\u0648\u0641 \u064A\u0627\u0626\u064A \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0644\u0627\u0645":s[0]?"\u0645\u0639\u062A\u0644 \u0623\u062C\u0648\u0641 \u064A\u0627\u0626\u064A \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0641\u0627\u0621":"\u0645\u0639\u062A\u0644 \u0623\u062C\u0648\u0641 \u064A\u0627\u0626\u064A";if(o[2])return t===p?s[0]?"\u0645\u0639\u062A\u0644 \u0646\u0627\u0642\u0635 \u0648\u0627\u0648\u064A \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0641\u0627\u0621":s[1]?"\u0645\u0639\u062A\u0644 \u0646\u0627\u0642\u0635 \u0648\u0627\u0648\u064A \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0639\u064A\u0646":"\u0645\u0639\u062A\u0644 \u0646\u0627\u0642\u0635 \u0648\u0627\u0648\u064A":s[0]?"\u0645\u0639\u062A\u0644 \u0646\u0627\u0642\u0635 \u064A\u0627\u0626\u064A \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0641\u0627\u0621":s[1]?"\u0645\u0639\u062A\u0644 \u0646\u0627\u0642\u0635 \u064A\u0627\u0626\u064A \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0639\u064A\u0646":"\u0645\u0639\u062A\u0644 \u0646\u0627\u0642\u0635 \u064A\u0627\u0626\u064A"}else return s[0]||s[1]||s[2]?s[0]&&s[2]?"\u0635\u062D\u064A\u062D \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0641\u0627\u0621 \u0648\u0627\u0644\u0644\u0627\u0645":s[0]?l?"\u0635\u062D\u064A\u062D \u0645\u064F\u0636\u0639\u064E\u0651\u0641 \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0641\u0627\u0621":"\u0635\u062D\u064A\u062D \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0641\u0627\u0621":s[1]?"\u0635\u062D\u064A\u062D \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0639\u064A\u0646":"\u0635\u062D\u064A\u062D \u0645\u0647\u0645\u0648\u0632 \u0627\u0644\u0644\u0627\u0645":l?"\u0635\u062D\u064A\u062D \u0645\u064F\u0636\u0639\u064E\u0651\u0641":"\u0635\u062D\u064A\u062D \u0633\u0627\u0644\u0645";return"\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"}function ht(r){return typeof r=="object"&&r!==null&&!Array.isArray(r)}function xn(r,n){if(!r&&!n)return;if(!r)return n;if(!n)return r;let t=[...r];for(let s of n)t.includes(s)||t.push(s);return t}function g0(r,n,t){let s=typeof n=="string"?[n]:n;if(!s&&t===void 0)return r;if(typeof r=="string")return{form:t!=null?t:r,footnotes:s};let o={...r};return t!==void 0&&(o.form=t),s&&(o.footnotes=xn(o.footnotes,s)),o}function L0(r,n){let t=typeof n=="string"?[n]:n;return typeof r=="string"?[{form:r,footnotes:t}]:ht(r)?[g0(r,t)]:r.map(s=>typeof s=="string"?{form:s,footnotes:t}:g0(s,t))}function jt(r,n){if(!(!n||n.form===void 0||n.form===null)){for(let t of r)if(t.form===n.form)return;r.push(n)}}function f0(r,n,t){!t||t.form===void 0||(r[n]||(r[n]=[]),jt(r[n],t))}function br(r,n,t){if(t)for(let s of t)f0(r,n,s)}function $r(r,n,t){return r==="?"||n==="?"?"?":t(r,n)}function Er(r,n,t,s,o,e){if(t===void 0||s===void 0)return;if(typeof t=="string"&&typeof s=="string"){f0(r,n,{form:$r(t,s,o),footnotes:e});return}if(typeof t=="string"&&Array.isArray(s)&&s.every(i=>typeof i=="string")){for(let i of s)f0(r,n,{form:$r(t,i,o),footnotes:e});return}let l=L0(t),f=L0(s,e);for(let i of l)for(let E of f){let a;if(i.footnotes&&E.footnotes){let H=[...i.footnotes];for(let w of E.footnotes)H.includes(w)||H.push(w);a=H}else i.footnotes?a=i.footnotes:E.footnotes&&(a=E.footnotes);f0(r,n,{form:$r(i.form,E.form,o),footnotes:a})}}function un(r,n,t,s,o){if(t.length===0)return;if(t.length===1){if(t[0]===void 0)return;br(r,n,L0(t[0],o));return}if(t.length===2){Er(r,n,t[0],t[1],s,o);return}let e=t[0];for(let l=1;l<t.length;l++){let f={};Er(f,n,e,t[l],s,l===t.length-1?o:void 0),e=f[n]}br(r,n,e)}function m(...r){let n=!0;for(let o=0;o<r.length;o++){if(r[o]===void 0||r[o]===null)throw new Error("Internal error: Saw nil at index "+(o+1)+" in q()");typeof r[o]!="string"&&(n=!1)}if(n)return r.join("");let t="",s;for(let o of r)typeof o=="string"?t+=o:(t+=o.form,s=xn(s,o.footnotes));return{form:t,footnotes:s}}function A0(r){return typeof r=="string"?r:r.form}function D(r,n){return r!==void 0&&A0(r)===n}function F0(r,n){return typeof r=="string"?n(r):{form:n(r.form),footnotes:r.footnotes}}function yn(r,n,t,s){return{lemma:r,verbForm:n,conjVowels:t,groupedConjVowels:[],passive:s.passive===!0?"pass":s.passive||void 0,passiveUncertain:!1,passiveDefaulted:!1,reduced:!!s.reduced,altgem:!1,nopast:!1,noimp:!1,noNonpast:!1,nocat:!1,quadlit:n.endsWith("q"),irregular:!1,forms:{},slotUncertain:{},orth:{}}}function D0(r,n){let t=n.includes("_pass");return!!(r.passive==="nopass"&&(n==="pp"||t)||r.passive==="onlypass"&&n!=="pp"&&n!=="vn"&&!t||r.passive==="ipass"&&t&&!n.includes("3ms")||r.passive==="onlypass-impers"&&n!=="pp"&&n!=="vn"&&(!t||t&&!n.includes("3ms"))||r.nopast&&n.startsWith("past_")||r.noimp&&n.startsWith("imp_")||r.noNonpast&&(n.startsWith("ind_")||n.startsWith("sub_")||n.startsWith("juss")))}var ct=(r,n)=>r+n;function kn(r,n,t,s,o){if(!D0(r,n))if(typeof t=="string"){let e=t;Er(r.forms,n,s,o,(l,f)=>e+l+f)}else un(r.forms,n,[t,s,o],ct)}function u(r,n,t,s){if(D0(r,n))return;if(typeof t=="string"){let e={form:t};s&&(e.uncertain=!0),f0(r.forms,n,e);return}let o=L0(t);if(s)for(let e of o)e.uncertain=!0;br(r.forms,n,o)}function $0(r,n){u(r,"ap2",n),u(r,"pp2",typeof n=="string"?n:{...n})}function M(r){return r===void 0?[]:r}var A=class extends Error{constructor(t,s){super(s);jn(this,"code");this.name="MaziniError",this.code=t}};function q0(r){throw new A("internal","Internal error: "+r)}var Tn="[\u064E\u0650\u064F]",zr="\u0651?"+mr+"?";function gn(r){return r==="\u0650"?"\u0626":r==="\u064F"?"\u0624":"\u0623"}var xt=[[new RegExp("^\uFFF0([\u0650"+h+"])","u"),"\u0625$1"],[new RegExp(" \uFFF0([\u0650"+h+"])","gu")," \u0625$1"],[new RegExp("^\uFFF0","u"),"\u0623"],[new RegExp(" \uFFF0","gu")," \u0623"],[new RegExp("("+Tn+")("+"\uFFF0"+")("+zr+")$","u"),(r,n,t,s)=>n+gn(n)+s],[new RegExp("("+Tn+")("+"\uFFF0"+")("+zr+" )","gu"),(r,n,t,s)=>n+gn(n)+s],[new RegExp("\uFFF0("+zr+")$","u"),"\u0621$1"],[new RegExp("(["+H0+k+p+h+"]"+"\u0652"+"?)("+"\uFFF0"+")("+"\u0651"+"?)([^ ])","gu"),(r,n,t,s,o)=>{let e=o==="\u0650"||o===h?"\u0626":o==="\u064F"||o===p?"\u0624":n.includes(h)?"\u0626":"\u0621";return n+e+s+o}],[new RegExp("([^ ])(\uFFF0)(\u0651?)(\u064B?[^ ])","gu"),(r,n,t,s,o)=>{let e=n==="\u0650"||o==="\u0650"||o===h?"\u0626":n==="\u064F"||o==="\u064F"||o===p?"\u0624":o==="\u064B"+k?"\u0621":"\u0623";return n+e+s+o}],[new RegExp("\u0623\u064E?"+k,"gu"),H0],[new RegExp("\uFFF0","gu"),"\u0621"]],Gr=p+"\u0624\u064F\u0648",An=h+"\u0624\u064F\u0648",Fn=k+"\u0624\u064F\u0648";function vr(r){for(let[n,t]of xt)r=r.replace(n,t);return r.includes(Gr)?[r.replaceAll(Gr,p+"\u0626\u064F\u0648"),r.replaceAll(Gr,p+"\u0621\u064F\u0648")]:r.includes(An)?[r.replaceAll(An,h+"\u0626\u064F\u0648"),r]:r.includes(Fn)?[r.replaceAll(Fn,k+"\u0626\u064F\u0648"),r]:[r]}var ut=new RegExp("\u0651("+mr+")","gu");function Nn(r){return r.replace(ut,"$1\u0651")}var yt=[[new RegExp("("+_0+")"+"\u0651","gu"),"\u0651$1"],[new RegExp("(.)\u0652\\1","gu"),"$1\u0651"],["\u0650"+p+"\u0652",T],["\u0650"+h+"\u0652",T],["\u064F"+p+"\u0652",g],["\u064F"+h+"\u0652",g],[new RegExp("("+h+"\u0651"+"?"+"\u064E"+")"+E0,"gu"),"$1"+k],["\u0621\u064E\u0621\u0652","\u0621\u064E"+k],["\u0621\u0650\u0621\u0652","\u0621\u0650"+h],["\u0621\u064F\u0621\u0652","\u0621\u064F"+p]];function kt(r){for(let[n,t]of yt)r=typeof n=="string"?r.replaceAll(n,t):r.replace(n,t);return r}var Tt="\uFFF2"+k+"\u0650"+p+"\u0652",gt="\uFFF2"+k+"\u0650"+"\uFFF3"+"\u0652",At="\uFFF2\u0621\u064E\u0621\u0652",Ft="\uFFF2\u0621\u064E\uFFF4\u0652",$t="\u0621\u064E"+k+"\uFFF2",zt="\u0621\u064E"+E0+"\uFFF2",zn=p+"\u0621"+"\u064F"+p,Gt=new RegExp("\u0652\u0621("+_0+")"+"\uFFF2","gu"),vt=k+"\u0621"+"\u064E"+k+"\uFFF2",Kt=k+"\uFFF6"+"\u064E"+k+"\uFFF2",Vt=new RegExp("(["+H0+k+p+h+"])"+"\u0621"+"\u064E"+k,"gu"),Ot="\u0623\u0650",Nt="\u0625\u0650";function Gn(r,n,t){let s="\uFFF2"+r+"\uFFF2";return t&&(s=s.replaceAll(Tt,gt)),n.analytic_hamza&&(s=s.replaceAll(At,Ft)),s=kt(s),n.hamza_rad2_final_weak&&(s=s.replaceAll($t,zt)),s=s.replaceAll("\uFFF3",p),s=s.replaceAll("\uFFF4","\u0621"),s.replaceAll("\uFFF2","")}function vn(r,n){if(!r.includes("\u0621"))return[r];let t;if(r.includes(zn)){let o=r.replaceAll(zn,p+"\uFFF5"+"\u064F"+p);t=vr(o.replaceAll("\u0621","\uFFF0"))[0].replaceAll("\uFFF5","\u0624")}let s=vr(r.replaceAll("\u0621","\uFFF0"));if(t!==void 0&&s.push(t),n.hamza_rad2_final_weak)for(let o=0;o<s.length;o++){let e=("\uFFF2"+s[o]+"\uFFF2").replace(Gt,(l,f)=>"\u0652"+(f==="\u064F"?"\u0624":"\u0623")+f+"\uFFF2");s[o]=e.replaceAll("\uFFF2","")}for(let o=0;o<s.length;o++){let e="\uFFF2"+s[o]+"\uFFF2";e=e.replaceAll(vt,Kt),e=e.replace(Vt,"$1"+H0),e=e.replaceAll("\uFFF6","\u0621"),s[o]=e.replaceAll("\uFFF2","")}for(let o=0;o<s.length;o++)s[o]=s[o].replaceAll(Ot,Nt);return s}function Ct(r,n){if(r==="?")return"?";n=n!=null?n:{};let t=vn(Gn(r,n,n.keep_initial_w),n);if(n.keep_initial_w)for(let s of vn(Gn(r,n,!1),n))t.includes(s)||t.push(s);return t.length===1?t[0]:t}var ar=new RegExp("(.)\u0652"+h+"("+_0+")"+h+"("+_0+")","gu"),Jt="$1$2"+h+"\u0652"+h+"$3";function Cn(r){if(r.verbForm==="I")return;let n=[];for(let t of Object.keys(r.forms))for(let s of r.forms[t])ar.test(s.form)&&(ar.lastIndex=0,n.push([t,{form:s.form.replace(ar,Jt),footnotes:s.footnotes}])),ar.lastIndex=0;for(let[t,s]of n)f0(r.forms,t,s)}function Jn(r){for(let n of Object.keys(r.forms)){let t=r.forms[n],s=t.map(l=>Ct(l.form,r.orth));if(!s.some((l,f)=>l!==t[f].form))continue;let e={};t.forEach((l,f)=>{let i=s[f];for(let E of Array.isArray(i)?i:[i])f0(e,"temp",{form:E,footnotes:l.footnotes})}),r.forms[n]=e.temp}}var S0=["\u0652"+I0,"\u0652"+R,"\u0652\u062A\u0650","\u064E","\u064E\u062A\u0652","\u0652\u062A\u064F\u0645\u064E\u0627",j,"\u064E\u062A\u064E\u0627","\u0652\u0646\u064E\u0627","\u0652\u062A\u064F\u0645\u0652","\u0652\u062A\u064F\u0646\u0651\u064E",g+k,"\u0652\u0646\u064E"];function Pn(r,n){return[r+"\u0652"+I0,r+"\u0652"+R,r+"\u0652"+"\u062A\u0650",n,"\u064E\u062A\u0652",r+"\u0652"+"\u062A\u064F\u0645\u064E\u0627",r+j,"\u064E\u062A\u064E\u0627",r+"\u0652"+"\u0646\u064E\u0627",r+"\u0652"+"\u062A\u064F\u0645\u0652",r+"\u0652"+"\u062A\u064F\u0646"+"\u0651"+"\u064E",lr+"\u0652"+k,r+"\u0652"+"\u0646\u064E"]}var Bn=Pn(J,h0),_n=Pn(lr,j),Qn=[J+"\u0652"+I0,J+"\u0652"+R,J+"\u0652"+"\u062A\u0650",[],[],J+"\u0652"+"\u062A\u064F\u0645\u064E\u0627",[],[],J+"\u0652"+"\u0646\u064E\u0627",J+"\u0652"+"\u062A\u064F\u0645\u0652",J+"\u0652"+"\u062A\u064F\u0646"+"\u0651"+"\u064E",[],[]];function Mn(r){return[r+I0,r+R,r+"\u062A\u0650",r+"\u064E",r+"\u064E"+"\u062A\u0652",r+"\u062A\u064F\u0645\u064E\u0627",r+j,r+"\u064E"+"\u062A\u064E\u0627",r+"\u0646\u064E\u0627",r+"\u062A\u064F\u0645\u0652",r+"\u062A\u064F\u0646"+"\u0651"+"\u064E",g+k,r+"\u0646\u064E"]}var Ln=Mn(T),Rn=Mn(g),R0=["\u0621",C,C,h,C,C,h,C,X,C,C,h,h];function Y(r,n,t,s,o){return[r,r,n,r,r,t,t,t,r,s,o,s,o]}var Wn=Y("\u064F",T+N,ir,g+N,"\u0652"+N);function Kr(r){return Y(r,T,j,g+k,"\u0652"+N)}var Vr=Kr("\u064E"),Ir=Kr("\u0652"),Or=Vr,Nr=Kr("\u0650"),W0=Y(h0,j0+N,J+ir,fr+N,j0+N);function Zn(r){return Y(r,T+N,r+ir,g+N,r+N)}var Un=Zn(T),Xn=Zn(g),Z0=Y(h0,j0,J+j,fr+k,j0+N);function Yn(r){return Y(r+"\u064E",T,r+j,g+k,r+N)}var r1=Yn(T),n1=Yn(g),z0=Y("\u064E",j0,J+j,fr+k,j0+N);function t1(r,n){return Y(r,T,n+j,g+k,n+N)}var Cr=t1("\u0650",T),Jr=t1("\u064F",g);function G0(r){return w0.map(n=>r[e0(n)])}var s1=G0(Ir),o1=G0(Or),e1=G0(Nr),wr=G0(z0),m1=G0(Cr),l1=G0(Jr);function Dr(r,n,t){let s=[...r];return s[e0(n)]=t,s}function f1(r,n,t){let s=[...r];return s[w0.indexOf(n)]=t,s}function p0(r){return{allSame:r}}function Pr(r,n){return typeof r=="string"?r:Array.isArray(r)?r[n]:r.allSame}function Br(r,n,t,s){Array.isArray(t)&&t.length!==s&&q0(`For tense '${r}', '${n}' should have length ${s} but has length ${t.length}`)}function qr(r,n,t,s,o,e){t===void 0||s===void 0||o===void 0||(Br(n,"prefixes",t,e.length),Br(n,"stems",s,e.length),Br(n,"endings",o,e.length),e.forEach((l,f)=>{kn(r,n+"_"+l,Pr(t,f),Pr(s,f),Pr(o,f))}))}function r0(r,n,t,s,o){qr(r,n,t,s,o,c0)}function K0(r,n,t){qr(r,"imp","",n,t,w0)}function n0(r,n,t,s,o){let e=M(t),l=M(s);o!==void 0&&s!==void 0&&!Array.isArray(s)&&(l=g0(s,o));let f=M(s);r0(r,n,"",[l,l,l,e,e,l,e,e,l,l,l,e,f],S0)}function _r(r,n,t){n0(r,n,t,t)}function Z(r,n,t,s,o,e,l){let f=Q0[t],i=M(s===void 0?void 0:i1(f,s)),E=M(o===void 0?void 0:i1(f,o));e||(n.startsWith("ind")?e=Wn:n.startsWith("sub")?e=Vr:n.startsWith("juss")?(l=!0,e=Ir):q0("Unrecognized tense '"+n+"'")),l?r0(r,n,R0,[E,E,i,E,E,i,i,i,E,i,E,i,E],e):r0(r,n,R0,[i,i,i,i,i,i,i,i,i,i,E,i,E],e)}function i1(r,n){return Array.isArray(n)?n.map(t=>m(r,t)):m(r,n)}function $(r,n,t,s,o,e){Z(r,n,t,s,s,o,e)}function Qr(r,n,t,s,o){Z(r,n,t,s,o,Or),Z(r,n,t,s,o,Nr),Z(r,n,t,s,o,Ir,!0)}function v0(r,n,t,s,o){s=s!=null?s:s1;let e=M(n),l=M(t);o?K0(r,[e,e,e,e,l],s):K0(r,[l,e,e,e,l],s)}function U0(r,n){v0(r,n,n)}function d1(r,n,t){v0(r,n,t,o1,!0),v0(r,n,t,e1,!0),v0(r,n,t)}var Pt={"\u0648\u0637\u0621:ia":!0,"\u0648\u0628\u0621:aa":!1};function Sr(r){return D(r,"\u064E")?"a":D(r,"\u0650")?"i":D(r,"\u064F")?"u":"?"}function b1(r,n,t,s,o){if(r===void 0||n===void 0)return!0;if(t&&s&&o){let e=Pt[t+s+o+":"+Sr(r)+Sr(n)];if(e!==void 0)return e}return D(n,"\u0650")||D(n,"\u064E")&&D(r,"\u064E")}var Bt=new Set(["\u0647\u0645\u0645","\u0639\u0634\u0634","\u0641\u0643\u0643","\u0634\u0631\u0631","\u0644\u0628\u0628"]);function H1(r,n,t,s,o){return D(s,"\u064E")&&D(o,"\u064F")&&Bt.has(r+n+t)?o:s}function a1(r,n){return r==="\u016B"&&n==="\u016B"}var Mr=new Set(["IV:\u062E\u064A\u0644","IV:\u063A\u064A\u0644","IV:\u062D\u064A\u062C","IV:\u062D\u064A\u0646","IV:\u062E\u064A\u0641","IV:\u0631\u064A\u0641","IV:\u0632\u064A\u0646","IV:\u062B\u0648\u0628","IV:\u0646\u064A\u0621","VII:\u0633\u064A\u0621","VIII:\u0639\u0648\u0644","VIII:\u0632\u0648\u062C","X:\u062C\u0648\u0628","III:\u0639\u0644\u0644","III:\u0641\u0631\u0631","VI:\u0639\u062B\u062B","VI:\u063A\u0636\u0636"]),_t=new Set(["\u0647\u064A\u0621:uu","\u0621\u0648\u0628:ia"]),Qt=new Set(["\u0648\u0634\u064A"]);function I1(r){return r!=="XI"&&r!=="XV"&&r!=="IVq"}function w1(r){return["I","III","IV","VI","VII","VIII","X"].includes(r)}function Mt(r){return["I","IV","VII","VIII","X"].includes(r)}function D1(r,n){return r==="I"&&D(n,"\u0650")||r==="V"||r==="VI"||r==="X"||r==="IIq"}function q1(r){return r==="II"||r==="III"||r==="IV"||r==="Iq"}function pr(r,n){return r==="I"&&D(n,"\u064F")||["VII","IX","XI","XII","XIII","XIV","XV","IIIq","IVq"].includes(r)}function hr(r){return r==="II"||r==="III"||r==="IV"||r==="Iq"?"u":"a"}function Lr(r){return r==="V"||r==="VI"||r==="XV"||r==="IIq"}function jr(r){return r==="onlypass"||r==="onlypass-impers"}function t0(r){return D(r,p)||D(r,h)}function V0(r,n,t,s){return D(n,h)&&t0(t)?D(r,"\u062D")||s==="I"&&D(r,"\u0639"):!1}function S1(r,n,t,s,o,e,l){return r.endsWith("q")?t0(o)?"final-weak":"sound":t0(s)&&n===p&&r==="I"?b1(e,l,n,t,s)?"assimilated+final-weak":"final-weak":t0(s)&&I1(r)?"final-weak":t===s&&w1(r)?Mr.has(r+":"+n+t+s)?"sound":"geminate":t0(t)&&Mt(r)?Mr.has(r+":"+n+t+s)||r==="I"&&e!==void 0&&l!==void 0&&_t.has(n+t+s+":"+Sr(e)+Sr(l))?"sound":"hollow":n===p&&r==="I"&&b1(e,l,n,t,s)?"assimilated":"sound"}function p1(r,n,t){return r===p&&t!==void 0&&Qt.has(t)?p+"\u0652"+"\u062A":r===p||r===h||r==="\u062A"||r==="\u0621"&&n?"\u062A\u0651":r==="\u062F"?"\u062F\u0651":r==="\u062B"?"\u062B\u0651":r==="\u0630"?"\u0630\u0651":r==="\u0632"?"\u0632\u0652\u062F":r==="\u0635"?"\u0635\u0652\u0637":r==="\u0636"?"\u0636\u0652\u0637":r==="\u0637"?"\u0637\u0651":r==="\u0638"?"\u0638\u0651":r+"\u0652"+"\u062A"}function h1(r,n,t,s,o,e){let l=a=>{throw new A("invalid_radicals",a)},f=(a,H)=>{(H==="\u0623"||H==="\u0625"||H==="\u0624"||H==="\u0626")&&l("Radical "+a+" is "+H+" but should be \u0621 (hamza on the line)")},i=(a,H)=>{t0(H)||l("Radical "+a+" is "+H+" but should be \u0648 or \u064A")},E=(a,H)=>{t0(H)&&l("In a sound verb, radical "+a+" should not be \u0648 or \u064A")};f(1,t),f(2,s),f(3,o),f(4,e),(n==="assimilated"||n==="assimilated+final-weak")&&t!==p&&l("Radical 1 is "+t+" but should be \u0648"),n==="final-weak"||n==="assimilated+final-weak"?e!==void 0?i(4,e):i(3,o):I1(r)&&(e!==void 0?E(4,e):E(3,o)),n==="hollow"&&i(2,s),n==="geminate"?(e!==void 0&&l("Internal error: No geminate quadrilaterals, should not be seen"),s!==o&&l("Weakness is geminate; radical 3 is "+o+" but should be same as radical 2 "+s)):w1(r)&&(e!==void 0&&l("Internal error: No quadrilaterals should support geminate verbs"),s===o&&!t0(s)&&!Mr.has(r+":"+t+s+o)&&l("Weakness is '"+n+"'; radical 2 and 3 are same at "+s+" but should not be; consider making weakness 'geminate'"))}var Lt=/[ء-ي]/gu;function E1(r){if(r==="\u0623"||r==="\u0625"||r==="\u0624"||r==="\u0626")return"\u0621";if(r===E0)return h;if(r===k)throw new A("bad_root","Root contains alif (\u0627) which is not a valid root radical. For weak verbs, use \u0648 (waw) or \u064A (yaa) instead.");return r}function u0(r){if(r==null||r==="")throw new A("bad_root","Missing root");r=r.replaceAll(H0,"\u0621"+k).replaceAll(" ","_");let n;r.includes("_")?n=r.split("_").map(E1):n=[...r.matchAll(Lt)].map(t=>E1(t[0]));for(let t of n)if([...t].length!==1)throw new A("bad_root","Each radical must be one letter, saw '"+t+"'");if(n.length!==3&&n.length!==4)throw new A("bad_root","A root needs three or four radicals, saw "+n.length+" in '"+r+"'");return n}function i0(r,n){return n.weakness==="final-weak"||r.verbForm==="XV"}function Rr(r,n,t,s,o,e,l){_r(r,"past",n),_r(r,"past_pass",t),$(r,"ind",l,s),$(r,"sub",l,s),$(r,"juss",l,s),$(r,"ind_pass","u",o),$(r,"sub_pass","u",o),$(r,"juss_pass","u",o),U0(r,e)}function j1(r){return r==="ay"?Bn:r==="aw"?_n:r==="\u012B"?Ln:r==="\u016B"?Rn:q0("Unrecognized past final-weak vowel spec '"+r+"'")}function c1(r){return r==="\u0101"?[W0,Z0,z0,wr]:r==="\u012B"?[Un,r1,Cr,m1]:r==="\u016B"?[Xn,n1,Jr,l1]:q0("Unrecognized non-past final-weak vowel spec '"+r+"'")}function Wr(r,n,t,s,o,e,l,f,i,E){let a=j1(l),H=j1("\u012B"),[w,S,y,F]=c1(f),[G,K,_]=c1("\u0101");E&&(w=Dr(w,"2fs",g+T+"\u0646\u064E"),S=Dr(S,"2fs",g+T),y=Dr(y,"2fs",g+T),F=f1(F,"2fs",g+T)),r0(r,"past","",p0(M(n)),a),r0(r,"past_pass","",p0(M(t)),H),$(r,"ind",i,s,w),$(r,"sub",i,s,S),$(r,"juss",i,s,y),$(r,"ind_pass","u",o,G),$(r,"sub_pass","u",o,K),$(r,"juss_pass","u",o,_),K0(r,p0(M(e)),F)}function Rt(r,n,t,s,o,e,l,f){Wr(r,n,t,s,o,e,"ay",f?"\u0101":"\u012B",l)}function O0(r,n,t,s,o,e){u(r,"vn",e);let l=r.quadlit?n.rad4:n.rad3,f=i0(r,n),i=hr(r.verbForm),E=Lr(r.verbForm),a=f?"":m("\u064E",l),H=f?"":m("\u0650",l),w=m(t,a),S=m(s,E?a:H),y=m(s,H),F=m(o,H),G=m(s,a),K=m(t,E?a:H);f?Rt(r,w,F,S,G,K,i,E):Rr(r,w,F,S,G,K,i),f?(u(r,"ap",m(Q,y,"\u064D")),u(r,"pp",m(Q,G,"\u064B",E0))):(u(r,"ap",m(Q,y)),u(r,"pp",m(Q,G)))}function X0(r,n,t,s,o,e,l,f,i,E,a,H,w,S){n0(r,"past",t,s,S),n0(r,"past_pass",o,e),Z(r,"ind",w,l,f),Z(r,"sub",w,l,f),Z(r,"ind_pass","u",i,E),Z(r,"sub_pass","u",i,E),n?(Qr(r,"juss",w,l,f),Qr(r,"juss_pass","u",i,E),d1(r,a,H)):(Z(r,"juss",w,l,f),Z(r,"juss_pass","u",i,E),v0(r,a,H))}function Y0(r,n,t,s,o,e){u(r,"vn",e);let l=r.quadlit?n.rad4:n.rad3,f=r.verbForm==="IV"||r.verbForm==="X",i=hr(r.verbForm),E=m(j,l),a=m("\u064E",l),H=m(T,l),w=m("\u0650",l),S=m(t,E),y=m(t,a),F=m(s,f?H:E),G=m(s,f?w:a),K=m(o,H),_=m(o,w),O=m(s,E),L=m(s,a),s0=m(t,f?H:E),y0=m(t,f?w:a);X0(r,!1,S,y,K,_,F,G,O,L,s0,y0,i),u(r,"ap",m(Q,F)),u(r,"pp",m(Q,O))}function d0(r,n,t,s,o,e,l){u(r,"vn",e);let f=r.verbForm,i=r.quadlit?n.rad4:n.rad3,E=hr(f),a,H,w,S;f==="IV"||f==="X"||f==="IVq"?(a=m("\u064E",i,"\u0651"),H=m("\u0652",i,"\u064E",i),w=m("\u0650",i,"\u0651"),S=m("\u0652",i,"\u0650",i)):(a=m(i,"\u0651"),H=m(i,"\u064E",i),w=m(i,"\u0651"),S=m(i,"\u0650",i));let y=Lr(f),F=m(t,a),G=m(t,H),K=m(s,y?a:w),_=m(s,y?H:S),O=m(o,w),L=m(o,S),s0=m(s,a),y0=m(s,H),b0=m(t,y?a:w),dt=m(t,y?H:S);X0(r,!0,F,G,O,L,K,_,s0,y0,b0,dt,E,l),u(r,"ap",m(Q,K)),u(r,"pp",m(Q,s0))}function rr(r,n,t){return m(V,r,"\u0650",n,j,t)}function N0(r,n,t,s,o){let e=i0(r,n),l=rr(t,s,e?"\u0621":o),f=m(t,"\u064E",s),i=m(V,f),E=m("\u0627\u064F",t,"\u064F",s);O0(r,n,i,f,E,l)}function C0(r,n,t,s,o,e,l){N0(r,n,m(t,"\u0652",s),m(o,"\u0652",e),l)}var Wt="[used especially with a clitic such as {{m|ar|\u0641\u064E}} or {{m|ar|\u0648\u064E}}]";function Zr(r,n,t){return D(r,"\u0621")&&D(n,"\u062E")&&D(t,"\u0630")}function Zt(r,n,t){return Zr(r,n,t)||D(r,"\u0621")&&D(n,"\u0643")&&D(t,"\u0644")?"shortonly":D(r,"\u0621")&&D(n,"\u0645")&&D(t,"\u0631")?"shortlong":!1}function Ur(r,n,t){return D(r,"\u0631")&&D(n,"\u0621")&&t0(t)}function Ut(r,n,t){return D(r,"\u0633")&&D(n,"\u0621")&&D(t,"\u0644")}function Xt(r,n,t){return D(r,"\u0643")&&D(n,p)&&D(t,X)}function Yt(r,n,t){return D(r,"\u0633")&&D(n,p)&&D(t,"\u0644")}function nr(r){return[r.rad1,r.rad2,r.rad3,r.past,r.nonpast]}function Xr(r,n,t){let s=F0(n,e=>e==="\u064E"||e==="\u0650"?"\u0650":e==="\u064F"?"\u064F":(D0(r,"imp_2ms")||q0("Non-past vowel "+e+" isn't a, i, or u, should have been caught earlier"),"\u0650")),o=F0(s,e=>k+e);return m(o,t,"\u0652")}function Yr(r,n,t){let[s,o,e,l,f]=nr(n),i=m(s,"\u064E",o,l,e),E=t?m(o,f,e):m(s,"\u0652",o,f,e),a=m(s,"\u064F",o,"\u0650",e),H=m(s,"\u0652",o,"\u064E",e),w=Zt(s,o,e);w&&(r.irregular=!0);let S=m(o,f,e),y=Xr(r,f,s),F=m(t||w?"":y,S);!t&&D(s,p)&&(r.orth.keep_initial_w=!0),Rr(r,i,a,E,H,F,"a"),w==="shortlong"&&U0(r,g0(m(y,S),Wt)),Ut(s,o,e)&&(r.irregular=!0,$(r,"juss","a","\u0633\u064E\u0644"),$(r,"juss_pass","u","\u0633\u064E\u0644"),U0(r,"\u0633\u064E\u0644")),u(r,"ap1",m(s,j,o,"\u0650",e)),$0(r,m(s,"\u064E",o,T,e)),u(r,"ap3",m(s,"\u064E",o,"\u0650",e)),u(r,"apcd",m("\u0621","\u064E",s,"\u0652",o,"\u064E",e)),u(r,"apan",m(s,"\u064E",o,"\u0652",e,k0)),u(r,"pp",m(T0,s,"\u0652",o,g,e))}function rs(r,n){var _;r.irregular=!0;let[t,s,o]=nr(n),e=m(t,"\u064E",s,"\u0650",o),l=e,f=m(t,"\u064E",s,"\u0651"),i=m(t,"\u064E",s),E=m(t,"\u064F",s,"\u0650",o),a=E,H=m(t,"\u064F",s,"\u0651"),w=m(t,"\u064F",s),S=m(t,"\u0652",s),y=S,F=m(V,S);n0(r,"past",[],e),n0(r,"past_pass",[],E);let G=(_=n.variant)!=null?_:"both";(G==="short"||G==="both")&&(n0(r,"past",f,[]),n0(r,"past_pass",H,[]));let K=(O,L,s0)=>{qr(r,O,"",[L,L,L,L,s0],[S0[e0("3ms")],S0[e0("3fs")],S0[e0("3md")],S0[e0("3fd")],S0[e0("3mp")]],["3ms","3fs","3md","3fd","3mp"])};(G==="long"||G==="both")&&(K("past",l,i),K("past_pass",a,w)),$(r,"ind","a",S,W0),$(r,"sub","a",S,Z0),$(r,"juss","a",S,z0),$(r,"ind_pass","u",y,W0),$(r,"sub_pass","u",y,Z0),$(r,"juss_pass","u",y,z0),K0(r,p0(F),wr),u(r,"ap1",m(t,j,s,"\u064D")),$0(r,m(t,"\u064E",s,T,"\u0651")),u(r,"ap3",m(t,"\u064E",s,"\u064D")),u(r,"apcd",m("\u0621","\u064E",t,"\u0652",s,h0)),u(r,"apan",m(t,"\u064E",s,"\u0652",o,k0)),u(r,"pp",m(T0,t,"\u0652",s,D(o,h)?T:g,"\u0651"))}function rn(r,n,t){let[s,o,e,l,f]=nr(n);if(V0(s,o,e,"I")){rs(r,n);return}let i=m(s,"\u064E",o),E=m(s,"\u064F",o),a,H,w;Ur(s,o,e)?(r.irregular=!0,a=s,H=s,w=s):(H=m(s,"\u0652",o),t?(a=o,w=o):(a=H,w=m(Xr(r,f,s),o))),!t&&D(s,p)&&(r.orth.keep_initial_w=!0);let S=D(e,h)&&D(l,"\u064E")?"ay":D(e,p)&&D(l,"\u064E")?"aw":D(l,"\u0650")?"\u012B":"\u016B",y=D(f,"\u064E")?"\u0101":D(f,"\u0650")?"\u012B":"\u016B";Wr(r,i,E,a,H,w,S,y,"a",a1(S,y)),u(r,"ap1",m(s,j,o,"\u064D")),$0(r,m(s,"\u064E",o,T,"\u0651")),u(r,"ap3",m(s,"\u064E",o,"\u064D")),u(r,"apcd",m("\u0621","\u064E",s,"\u0652",o,h0)),u(r,"apan",m(s,"\u064E",o,"\u0652",e,k0)),u(r,"pp",m(T0,s,"\u0652",o,D(e,h)?T:g,"\u0651"))}function x1(r,n){let[t,s,o,e,l]=nr(n),f=e;D(f,"\u064E")&&(f=F0(f,()=>D(l,"\u064E")?"\u0650":A0(l)));let i=F0(l,O=>O==="\u064F"?g:O==="\u0650"?T:j),E=m(t,j,o),a=m(t,f,o),H=m(t,i,o),w=m(t,l,o),S=m(t,T,o),y=m(t,F0(f,O=>O==="\u0650"?"\u064F":"\u0650"),o),F=m(t,j,o),G=m(t,"\u064E",o);if(X0(r,!1,E,a,S,y,H,w,F,G,H,w,"a"),Xt(t,s,o)){let O=Y("\u064F",[],[],[],[]);r0(r,"juss",R0,m("\u064E",t),O),r.irregular=!0}Yt(t,s,o)&&D(l,"\u064E")&&(r.irregular=!0,n0(r,"past",E,m(t,"\u064E",o))),u(r,"ap1",D(o,"\u0621")?m(t,j,"\u0621","\u064D"):m(t,j,"\u0621","\u0650",o)),$0(r,m(t,"\u064E",h,"\u0651","\u0650",o)),u(r,"ap3",m(t,"\u064E",h,"\u0650",o)),u(r,"apcd",m("\u0621","\u064E",t,"\u0652",s,"\u064E",o)),u(r,"apan",m(t,"\u064E",s,"\u0652",o,k0)),u(r,"pp",m(T0,t,D(s,h)?T:g,o))}function u1(r,n){let[t,s,o,e,l]=nr(n),f=m(t,"\u064E",s,"\u0651"),i=m(t,"\u064E",s,H1(t,s,o,e,l),s),E=m(t,l,s,"\u0651"),a=m(t,"\u0652",s,l,s),H=m(t,"\u064F",s,"\u0651"),w=m(t,"\u064F",s,"\u0650",s),S=m(t,"\u064E",s,"\u0651"),y=m(t,"\u0652",s,"\u064E",s),F=m(t,l,s,"\u0651"),G=m(Xr(r,l,t),s,l,s);X0(r,!0,f,i,H,w,E,a,S,y,F,G,"a"),u(r,"ap1",m(t,j,s,"\u0651")),$0(r,m(t,"\u064E",s,T,s)),u(r,"ap3",m(t,"\u064E",s,"\u0651")),u(r,"apcd",m("\u0621","\u064E",t,"\u064E",s,"\u0651")),u(r,"apan",m(t,"\u064E",s,"\u0651",k0)),u(r,"pp",m(T0,t,"\u0652",s,g,s))}function z(r){return[r.rad1,r.rad2,r.rad3]}function nn(r){return[r.rad1,r.rad2,r.rad3,r.rad4]}function tn(r,n){let t=r.verbForm;return t==="V"||t==="VI"?r.reduced?[m(V,n,"\u0652"),m(n,"\u0652"),m(o0,n,"\u0652")]:[R,R,I0]:["","",""]}function tr(r,n){let[t,s,o]=z(n),e=i0(r,n),l=r.verbForm,[f,i,E]=tn(r,t),a=l==="V"?m(f,t,"\u064E",s,"\u0651",e?"\u064D":m("\u064F",o)):m(R,t,"\u0652",s,T,e?a0:o),H=m(f,t,"\u064E",s,"\u0651"),w=m(i,t,"\u064E",s,"\u0651"),S=m(E,t,"\u064F",s,"\u0651");O0(r,n,H,w,S,a)}function y1(r,n){let[t,s,o]=z(n),e=i0(r,n);u(r,"vn2",m(t,"\u0650",s,j,e?"\u0621":o))}function J0(r,n){let[t,s,o]=z(n),e=i0(r,n),l=r.verbForm,[f,i,E]=tn(r,t),a=l==="VI"?m(f,t,j,s,e?"\u064D":m("\u064F",o)):m(Q,t,j,s,e?kr:m("\u064E",o,a0)),H=m(f,t,j,s),w=m(i,t,j,s),S=m(E,t,g,s);O0(r,n,H,w,S,a),l==="III"&&y1(r,n)}function sn(r,n){var S;let[t,s]=z(n),o=r.verbForm,[e,l,f]=tn(r,t),i=o==="VI"?m(e,t,j,s,"\u0651"):m(Q,t,j,s,"\u0651",a0),E=m(e,t,j),a=m(l,t,j),H=m(f,t,g),w=(S=n.variant)!=null?S:"short";(w==="short"||w==="both")&&d0(r,n,E,a,H,i),w==="long"||w==="both"?J0(r,n):o==="III"&&y1(r,n)}function on(r,n){let[t,s,o]=z(n),e=i0(r,n),l,f=Ur(t,s,o);f?(r.irregular=!0,l=t):l=m(t,"\u0652",s);let i=f?m("\u0621","\u0650",l,j,"\u0621",a0):m("\u0621","\u0650",l,j,e?"\u0621":o),E=m("\u0621","\u064E",l),a=l,H=m("\u0621","\u064F",l);O0(r,n,E,a,H,i)}function k1(r,n){let[t,,s]=z(n),o=m("\u0621","\u0650",t,j,s,a0);Y0(r,n,m("\u0621","\u064E",t),t,m("\u0621","\u064F",t),o)}function T1(r,n){let[t,s]=z(n),o=m("\u0621","\u0650",t,"\u0652",s,j,s);d0(r,n,m("\u0621","\u064E",t),t,m("\u0621","\u064F",t),o)}function en(r,n){if(r.reduced){if(!D(n,M0))throw new A("reduced_not_applicable","Internal error: Form VII first radical "+A0(n)+" is not \u0645 but .reduced specified; should have been caught earlier");return M0+"\u0651"}return m("\u0646\u0652",n)}function mn(r,n){let[t,s,o]=z(n);N0(r,n,en(r,t),s,o)}function g1(r,n){let[t,,s]=z(n),o=en(r,t),e=rr(o,h,s),l=o;Y0(r,n,m(V,l),l,m(o0,o),e)}function A1(r,n){let[t,s]=z(n),o=en(r,t),e=rr(o,s,s),l=m(o,"\u064E");d0(r,n,m(V,l),l,m(o0,o,"\u064F"),e)}function F1(r,n,t,s){let o=i0(r,n);return[rr(n.formViiiAssim,t,o?"\u0621":s)]}function ln(r,n){let[t,s,o]=z(n);Zr(t,s,o)&&(r.irregular=!0),N0(r,n,n.formViiiAssim,s,o)}function $1(r,n){let[,,t]=z(n),s=F1(r,n,h,t),o=n.formViiiAssim;Y0(r,n,m(V,o),o,m(o0,o),s)}function z1(r,n){let[,t]=z(n),s=F1(r,n,t,t),o=m(n.formViiiAssim,"\u064E");d0(r,n,m(V,o),o,m(o0,n.formViiiAssim,"\u064F"),s)}function G1(r,n){let[t,s,o]=z(n),e=m(V,t,"\u0652",s,"\u0650",o,j,o),l=m(t,"\u0652",s,"\u064E");d0(r,n,m(V,l),l,m(o0,t,"\u0652",s,"\u064F"),e)}function v1(r,n){let[t,s,o]=z(n);N0(r,n,m(t,"\u0652",s),o,o)}function fn(r,n){var f;let[t,s,o]=z(n),e=V0(t,s,o),l=(f=n.variant)!=null?f:"both";(!e||l==="long"||l==="both")&&C0(r,n,yr,C,t,s,o),e&&(l==="short"||l==="both")&&(r.irregular=!0,N0(r,n,yr+"\u0652"+C,t,o))}function K1(r,n){let[t,,s]=z(n),o=m(r.reduced?"\u0627\u0650\u0633\u0652":"\u0627\u0650\u0633\u0652\u062A\u0650",t,j,s,a0),e=m(r.reduced?"\u0627\u0650\u0633\u0652":"\u0627\u0650\u0633\u0652\u062A\u064E",t),l=m(r.reduced?"\u0633\u0652":"\u0633\u0652\u062A\u064E",t),f=m(r.reduced?"\u0627\u064F\u0633\u0652":"\u0627\u064F\u0633\u0652\u062A\u064F",t);Y0(r,n,e,l,f,o)}function V1(r,n){let[t,s]=z(n),o=m("\u0627\u0650\u0633\u0652\u062A\u0650",t,"\u0652",s,j,s),e=m("\u0627\u0650\u0633\u0652\u062A\u064E",t),l=m("\u0633\u0652\u062A\u064E",t),f=m("\u0627\u064F\u0633\u0652\u062A\u064F",t);r.altgem&&r0(r,"past","",p0(m(e,"\u064E",s,"\u0651")),Qn),d0(r,n,e,l,f,o,r.altgem?"[uncommon]":void 0)}function O1(r,n){let[t,s,o]=z(n),e=m(V,t,"\u0652",s,T,o,j,o),l=m(t,"\u0652",s,j);d0(r,n,m(V,l),l,m(o0,t,"\u0652",s,g),e)}function dn(r,n){let[t,s,o]=z(n);C0(r,n,t,s,p,s,o)}function bn(r,n){let[t,s,o]=z(n);C0(r,n,t,s,p,p,o)}function cr(r,n){let[t,s,o]=z(n),e=r.verbForm==="XV"?h:o;C0(r,n,t,s,X,o,e)}function sr(r,n){let[t,s,o,e]=nn(n),l=i0(r,n),f=r.verbForm,i=f==="IIq"?m(R,t,"\u064E",s,"\u0652",o,l?"\u064D":m("\u064F",e)):m(t,"\u064E",s,"\u0652",o,l?kr:m("\u064E",e,a0)),E=f==="IIq"?R:"",a=f==="IIq"?I0:"",H=m(E,t,"\u064E",s,"\u0652",o),w=H,S=m(a,t,"\u064F",s,"\u0652",o);O0(r,n,H,w,S,i)}function ns(r,n){if(!r.reduced)return X;if(!(D(n,p)||D(n,h)))throw new A("reduced_not_applicable","Form IIIq .reduced assimilates the \u0646\u0648\u0646 into \u06441, which must be \u0648 or \u064A, but saw "+A0(n));return n}function En(r,n){let[t,s,o,e]=nn(n);C0(r,n,t,s,ns(r,o),o,e)}function N1(r,n){let[t,s,o,e]=nn(n),l=m(V,t,"\u0652",s,"\u0650",o,"\u0652",e,j,e),f=m(V,t,"\u0652",s,"\u064E",o),i=m(t,"\u0652",s,"\u064E",o),E=m(o0,t,"\u0652",s,"\u064F",o);d0(r,n,f,i,E,l)}var ts={"I-sound":(r,n)=>Yr(r,n,!1),"I-assimilated":(r,n)=>Yr(r,n,!0),"I-final-weak":(r,n)=>rn(r,n,!1),"I-assimilated+final-weak":(r,n)=>rn(r,n,!0),"I-hollow":x1,"I-geminate":u1,"II-sound":tr,"II-final-weak":tr,"III-sound":J0,"III-final-weak":J0,"III-geminate":sn,"IV-sound":on,"IV-final-weak":on,"IV-hollow":k1,"IV-geminate":T1,"V-sound":tr,"V-final-weak":tr,"VI-sound":J0,"VI-final-weak":J0,"VI-geminate":sn,"VII-sound":mn,"VII-final-weak":mn,"VII-hollow":g1,"VII-geminate":A1,"VIII-sound":ln,"VIII-final-weak":ln,"VIII-hollow":$1,"VIII-geminate":z1,"IX-sound":G1,"IX-final-weak":v1,"X-sound":fn,"X-final-weak":fn,"X-hollow":K1,"X-geminate":V1,"XI-sound":O1,"XII-sound":dn,"XII-final-weak":dn,"XIII-sound":bn,"XIII-final-weak":bn,"XIV-sound":cr,"XIV-final-weak":cr,"XV-sound":cr,"Iq-sound":sr,"Iq-final-weak":sr,"IIq-sound":sr,"IIq-final-weak":sr,"IIIq-sound":En,"IIIq-final-weak":En,"IVq-sound":N1};function C1(r){var n,t;r.orth=(n=r.orth)!=null?n:{};for(let s of r.conjVowels){let o=r.verbForm+"-"+s.weakness;r.verbForm==="VIII"&&s.rad1!==void 0&&xr.test(s.rad1)&&(r.orth.analytic_hamza=!0),((t=s.weakness)!=null?t:"").includes("final-weak")&&s.rad2!==void 0&&xr.test(s.rad2)&&(r.orth.hamza_rad2_final_weak=!0);let e=ts[o];if(!e)throw new A("unsupported_weakness","Unknown conjugation type '"+o+"'");e(r,s)}Cn(r),Jn(r),ss(r)}function ss(r){r.verbForm==="I"&&!r.forms.ap&&r.forms.ap1&&!D0(r,"ap")&&r.conjVowels.some(t=>D(t.past,"\u064E"))&&(r.forms.ap=r.forms.ap1,delete r.forms.ap1)}function J1(r,n,t,s){let o=r.join("_"),e=t?[{past:Q0[t.past],nonpast:Q0[t.nonpast]}]:[];return yn(o,n,e,s)}function P1(r){var s;r.conjVowels.length===0&&(r.conjVowels=[{past:"-",nonpast:"-"}]);let n=r.verbForm;r.quadlit=n.endsWith("q");let t=r.lemma.split("_");for(let o of r.conjVowels){let e,l,f,i;if(t.length===3&&t.every(w=>[...w].length===1))[e,l,f]=t;else if(t.length===4&&t.every(w=>[...w].length===1))[e,l,f,i]=t;else throw new A("bad_root","A root needs three or four single-letter radicals: "+r.lemma);if(!r.quadlit&&i!==void 0)throw new A("bad_root","A four-letter root cannot take a triliteral form ("+n+"): "+r.lemma);if(r.quadlit&&i===void 0)throw new A("bad_root","A quadriliteral form ("+n+") needs a four-letter root: "+r.lemma);let E=S1(n,e,l,f,i,o.past,o.nonpast);if(n==="VIII"&&(o.formViiiAssim=p1(e,r.reduced,e+l+f)),n==="I"&&!jr(r.passive)&&(o.past==="-"||o.nonpast==="-"))throw new A("unknown_wazn","Form I verb that isn't passive-only or final-weak must have past~non-past vowels specified");o.rad1=e,o.rad2=l,o.rad3=f,r.quadlit&&(o.rad4=i),o.weakness=E,h1(n,E,e,l,f,r.quadlit?i:void 0);let a=(n==="III"||n==="VI")&&l===f&&l!=="\u064A",H=V0(e,l,f,n)&&(n==="I"||n==="X");if(!(a||H)&&o.variant!==void 0)throw new A("internal","Variant value 'var:"+o.variant+"' not allowed in this context")}if(n==="I"){let o=[];for(let l of r.conjVowels){let f=ur[l.past],i=ur[l.nonpast],E=o.find(a=>a.past===f);E?E.nonpasts.includes(i)||E.nonpasts.push(i):o.push({past:f,nonpasts:[i]})}let e=[];for(let l of o){let f=e.find(i=>JSON.stringify(i.nonpasts)===JSON.stringify(l.nonpasts));f?f.pasts.includes(l.past)||f.pasts.push(l.past):e.push({pasts:[l.past],nonpasts:l.nonpasts})}r.groupedConjVowels=e}if(!r.passive)if(r.passiveDefaulted=!0,q1(n))r.passive="pass";else{r.passiveUncertain=!0;for(let o of r.conjVowels)if(pr(n,o.past)){r.passive="nopass";break}else if(D1(n,o.past)){r.passive="ipass";break}r.passive=(s=r.passive)!=null?s:"pass"}}var os=/[ً-ْٰ]/u;function Hn(r){return r?(r=r.replace(/\[\[[^|\]]*\|([^\]]*)\]\]/gu,"$1"),r=r.replace(/\[\[([^\]]*)\]\]/gu,"$1"),r=r.replace(/<[^>]+>/gu,""),r=r.normalize("NFC").replaceAll("\u0640",""),r.trim()):null}function B1(r){let n=Hn(r);return n===null?null:(n=n.replaceAll("\u0671","\u0627"),n=n.replace(new RegExp("^[\u0623\u0625]([\u064F\u0650\u064E])","u"),"\u0627$1"),n.slice(0,1)==="\u0625"&&!os.test(n.slice(1,2))&&(n="\u0627\u0650"+n.slice(1)),n=n.replace(new RegExp("^\u0627\u064F\u0624\u0652","u"),"\u0627\u064F\u0648"),n=n.replace(new RegExp("^\u0627\u0650\u0626\u0652","u"),"\u0627\u0650\u064A"),n=n.replace(new RegExp("\u064E(\u0651?)(\u0627)","gu"),"$1$2"),n=n.replace(new RegExp("\u064F(\u0651?)(\u0648)(\u0652?)","gu"),"$1$2"),n=n.replace(new RegExp("\u0650(\u0651?)(\u064A)(\u0652?)","gu"),"$1$2"),n=n.replace(new RegExp("\u0652$","u"),""),n)}var es=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","Iq","IIq","IIIq","IVq"],ms=[["\u0641\u0639\u064E\u0644 \u064A\u0641\u0639\u064F\u0644","I/a~u","\u0645\u064F\u062C\u0631\u064E\u0651\u062F"],["\u0641\u0639\u064E\u0644 \u064A\u0641\u0639\u0650\u0644","I/a~i","\u0645\u064F\u062C\u0631\u064E\u0651\u062F"],["\u0641\u0639\u064E\u0644 \u064A\u0641\u0639\u064E\u0644","I/a~a","\u0645\u064F\u062C\u0631\u064E\u0651\u062F"],["\u0641\u0639\u064F\u0644 \u064A\u0641\u0639\u064F\u0644","I/u~u","\u0645\u064F\u062C\u0631\u064E\u0651\u062F"],["\u0641\u0639\u0650\u0644 \u064A\u0641\u0639\u064E\u0644","I/i~a","\u0645\u064F\u062C\u0631\u064E\u0651\u062F"],["\u0641\u0639\u0650\u0644 \u064A\u0641\u0639\u0650\u0644","I/i~i","\u0645\u064F\u062C\u0631\u064E\u0651\u062F"],["\u0641\u0639\u0651\u0644","II","\u0645\u0632\u064A\u062F \u0628\u062D\u0631\u0641"],["\u0641\u0627\u0639\u0644","III","\u0645\u0632\u064A\u062F \u0628\u062D\u0631\u0641"],["\u0623\u0641\u0639\u0644","IV","\u0645\u0632\u064A\u062F \u0628\u062D\u0631\u0641"],["\u062A\u0641\u0639\u0651\u0644","V","\u0645\u0632\u064A\u062F \u0628\u062D\u0631\u0641\u064A\u0646"],["\u062A\u0641\u0627\u0639\u0644","VI","\u0645\u0632\u064A\u062F \u0628\u062D\u0631\u0641\u064A\u0646"],["\u0627\u0646\u0641\u0639\u0644","VII","\u0645\u0632\u064A\u062F \u0628\u062D\u0631\u0641\u064A\u0646"],["\u0627\u0641\u062A\u0639\u0644","VIII","\u0645\u0632\u064A\u062F \u0628\u062D\u0631\u0641\u064A\u0646"],["\u0627\u0641\u0639\u0644\u0651","IX","\u0645\u0632\u064A\u062F \u0628\u062D\u0631\u0641\u064A\u0646"],["\u0627\u0633\u062A\u0641\u0639\u0644","X","\u0645\u0632\u064A\u062F \u0628\u062B\u0644\u0627\u062B\u0629 \u0623\u062D\u0631\u0641"],["\u0627\u0641\u0639\u0627\u0644\u0651","XI","\u0645\u0632\u064A\u062F \u0628\u062B\u0644\u0627\u062B\u0629 \u0623\u062D\u0631\u0641"],["\u0627\u0641\u0639\u0648\u0639\u0644","XII","\u0645\u0632\u064A\u062F \u0628\u062B\u0644\u0627\u062B\u0629 \u0623\u062D\u0631\u0641"],["\u0627\u0641\u0639\u0648\u0651\u0644","XIII","\u0645\u0632\u064A\u062F \u0628\u062B\u0644\u0627\u062B\u0629 \u0623\u062D\u0631\u0641"],["\u0641\u0639\u0644\u0644","Iq","\u0645\u064F\u062C\u0631\u064E\u0651\u062F"],["\u062A\u0641\u0639\u0644\u0644","IIq","\u0645\u0632\u064A\u062F \u0628\u062D\u0631\u0641"],["\u0627\u0641\u0639\u0646\u0644\u0644","IIIq","\u0645\u0632\u064A\u062F \u0628\u062D\u0631\u0641\u064A\u0646"],["\u0627\u0641\u0639\u0644\u0644\u0651","IVq","\u0645\u0632\u064A\u062F \u0628\u062D\u0631\u0641\u064A\u0646"]];function an(r){let n=/^(I)\/([aiu])~([aiu])$/.exec(r);return n?{verbForm:"I",vowels:{past:n[2],nonpast:n[3]}}:es.includes(r)&&r!=="I"?{verbForm:r,vowels:null}:null}var P0=ms.map(([r,n,t])=>{let s=an(n);return{wazn:r,formCode:n,verbForm:s.verbForm,vowels:s.vowels,basicDeriv:t}}),B0=new Map(P0.map(r=>[r.wazn,r])),In=new Map(P0.map(r=>[r.formCode,r]));function wn(r){var n,t;return(t=(n=In.get(r))==null?void 0:n.wazn)!=null?t:null}function _1(r){let n={};for(let t of x0){let s=r.forms[t];s&&(n[t]=s.map(o=>({...o,form:Nn(o.form)})))}return n}function Q1(r,n){let t=[];for(let s of Ar)!r.forms[s]&&!D0(r,s)&&(r.slotUncertain[s]=!0);for(let s of Ar)!n[s]&&r.slotUncertain[s]&&(n[s]=[{form:"?"}]);for(let s of Object.keys(r.slotUncertain).sort())t.push(s);return t}function M1(r){let n=!1,t=!1;for(let s of Object.keys(r)){let o=/[123]/.test(s),e=s.includes("_pass");(s==="ap"||o&&!e)&&(n=!0),(s==="pp"||o&&e)&&(t=!0)}return{hasActive:n,hasPassive:t}}function L1(r){let n=[];if(r.nocat)return n;let t=s=>{s&&!n.includes(s)&&n.push(s)};if(t(wn(r.verbForm)),r.verbForm==="I"&&!jr(r.passive))for(let s of r.groupedConjVowels)for(let o of s.pasts)for(let e of s.nonpasts)t(wn(`I/${o}~${e}`));return n}function R1(r,n){var a;let t=r.conjVowels[0],s=t==null?void 0:t.rad1,o=t==null?void 0:t.rad2,e=t==null?void 0:t.rad3,l=t==null?void 0:t.rad4,f=n[0]?(a=B0.get(n[0]))==null?void 0:a.basicDeriv:void 0;if(!(s&&o&&e))return{rootDisplay:"",verbType:"\u0641\u0639\u0644",classification:null};if(l){let H="\u0641\u0639\u0644 \u0631\u0628\u0627\u0639\u064A";return f&&(H+=" "+f),{rootDisplay:[s,o,e,l].join(" "),verbType:H,classification:null}}let i="\u0641\u0639\u0644 \u062B\u0644\u0627\u062B\u064A",E=dr(s,o,e);return f&&(i+=" "+f,f==="\u0645\u064F\u062C\u0631\u064E\u0651\u062F"&&(i+=" "+E)),{rootDisplay:[s,o,e].join(" "),verbType:i,classification:E}}function W1(r,n){var o,e;let t=B0.get(r);if(t)return{verbForm:t.verbForm,vowels:t.vowels,formCode:t.formCode,waznName:t.wazn};let s=an(r);if(s){let l=r;return{verbForm:s.verbForm,vowels:s.vowels,formCode:l,waznName:(e=(o=P0.find(f=>f.formCode===l))==null?void 0:o.wazn)!=null?e:null}}if(r==="I"&&n.vowels){let l=`I/${n.vowels.past}~${n.vowels.nonpast}`,f=P0.find(i=>i.formCode===l);if(!f)throw new A("unknown_wazn","Unknown form-I vowels: "+l);return{verbForm:"I",vowels:f.vowels,formCode:l,waznName:f.wazn}}throw new A("unknown_wazn","Unknown morphological pattern (\u0648\u0632\u0646 \u0635\u0631\u0641\u064A): "+r)}function ls(r){let n={form:r.form,footnotes:r.footnotes?[...r.footnotes]:[]};return r.uncertain&&(n.uncertain=!0),n}function Z1(r,n,t={}){var L,s0,y0;if(typeof t.passive=="string"&&!["pass","ipass","nopass"].includes(t.passive))throw new A("bad_option",'passive must be a boolean, "pass", "ipass" or "nopass": '+t.passive);let s=u0(r),{verbForm:o,vowels:e,formCode:l,waznName:f}=W1(n,t),i=J1(s,o,e,{passive:t.passive,reduced:t.reduced});P1(i),C1(i);let E=_1(i),a=Q1(i,E),{hasActive:H,hasPassive:w}=M1(E),S=L1(i),{rootDisplay:y,verbType:F,classification:G}=R1(i,S),K={};for(let b0 of x0)E[b0]&&(K[b0]=E[b0].map(ls));let _=[];for(let b0 of Tr)if(K[b0]){_=K[b0];break}let O=i.conjVowels[0];return{slots:K,slotList:x0,lemma:_,verbForm:o,formCode:l,wazn:f,radicals:s,rootDisplay:y,weakness:O.weakness,quadriliteral:i.quadlit,vowels:{past:(L=e==null?void 0:e.past)!=null?L:null,nonpast:(s0=e==null?void 0:e.nonpast)!=null?s0:null},passive:i.passive,passiveUncertain:i.passiveUncertain,passiveDefaulted:i.passiveDefaulted,reduced:i.reduced,irregular:i.irregular,formViiiAssim:(y0=O.formViiiAssim)!=null?y0:null,orth:{...i.orth},morphPatterns:S,verbForms:i.nocat?[]:[o],hasActive:H,hasPassive:w,uncertainSlots:a,verbType:F,classification:G}}var fs="\u062A\u062B\u062F\u0630\u0632\u0633\u0634\u0635\u0636\u0637\u0638";function is(r,n,t={}){let s=u0(r);switch(W1(n,t).verbForm){case"V":case"VI":return fs.includes(s[0]);case"VII":return s[0]==="\u0645";case"VIII":return["\u0621\u062E\u0630","\u0621\u0632\u0631","\u0621\u062D\u062F"].includes(s.join(""));case"X":return s.join("")==="\u0637\u0648\u0639";case"IIIq":return s[2]==="\u0648"||s[2]==="\u064A";default:return!1}}function ds(r,n,t={}){return Z1(r,n,t).verbType}var U1="https://github.com/m-bakni/arabic-morphology",X1="e6e2497ee18cf025e96bdff511e460820b090395",Y1="2026-09-27";var rt="\u0621\u0628\u062A\u062B\u062C\u062D\u062E\u062F\u0630\u0631\u0632\u0633\u0634\u0635\u0636\u0637\u0638\u0639\u063A\u0641\u0642\u0643\u0644\u0645\u0646\u0647\u0648\u064A",nt="'btvjHxd*rzs$SDTZEgfqklmnhwy",Dn="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/",tt=["\u0641\u0639\u064E\u0644 \u064A\u0641\u0639\u064F\u0644","\u0641\u0639\u064E\u0644 \u064A\u0641\u0639\u0650\u0644","\u0641\u0639\u064E\u0644 \u064A\u0641\u0639\u064E\u0644","\u0641\u0639\u064F\u0644 \u064A\u0641\u0639\u064F\u0644","\u0641\u0639\u0650\u0644 \u064A\u0641\u0639\u064E\u0644","\u0641\u0639\u0650\u0644 \u064A\u0641\u0639\u0650\u0644","\u0641\u0639\u0651\u0644","\u0641\u0627\u0639\u0644","\u0623\u0641\u0639\u0644","\u062A\u0641\u0639\u0651\u0644","\u062A\u0641\u0627\u0639\u0644","\u0627\u0646\u0641\u0639\u0644","\u0627\u0641\u062A\u0639\u0644","\u0627\u0641\u0639\u0644\u0651","\u0627\u0633\u062A\u0641\u0639\u0644","\u0627\u0641\u0639\u0627\u0644\u0651","\u0627\u0641\u0639\u0648\u0639\u0644","\u0627\u0641\u0639\u0648\u0651\u0644"],st=["\u0641\u0639\u0644\u0644","\u062A\u0641\u0639\u0644\u0644","\u0627\u0641\u0639\u0646\u0644\u0644","\u0627\u0641\u0639\u0644\u0644\u0651"],ot=`
'b'004'bb193'bt08J'bv00I'bd09J'br19J'bz002'bs092'b$092'bS00I'bD08J'bT582'bq08J'bk00G'bl1DR'bn093
'bh0DK'bw491'by0CK'tb190'tt001'tr010'tl002'tm05I'tn442'th080'tw041'ty4D2'v'004'vv09J'vj400'vr5DJ
'vf0D2'vl09A'vm0DJ'vw001'vy1I2'j'004'jj1P3'jd041'jr563'jz400'jl4DJ'jm0DI'jn00R'HH001'Hd51G'Hn02K
'x*53P'xr490'xw0V1'db4DA'dd083'dr00G'dl002'dm55R'dw081'dy4T2'*j001'**001'*n4DH'*y0CG'rb4FQ'rv090
'rj09I'rx055'rr103'rz012'rs052'r$111'rD4DP'rT04H'rf030'rq1DG'rk15J'rm02I'rn06H'rw001'ry1DI'z'004
'zb08I'zj01J'zH082'zr1BI'zz183'zf0SI'zq48I'zl0C2'zm08I'zw001'zy0VI'sb040'sd4DI'sr48I'ss011'sf0CG
'sl098'sn0CJ'sw1R1'sy06I'$b19J'$H00G'$r51J'$$001'$n080'$y14I'St002'Sd051'Sr1I2'SS193'Sl4DP'Sw001
'Sy01G'DD123'Dm00G'Td010'Tr0f3'TT002'Tm1DI'ft002'fx002'fd41G'fr40I'fz002'fZ100'ff093'fq08I'fk1DI
'fl09J'fn08I'fy040'qT142'qy002'k'004'kd0D1'kr0A1'kf050'kk101'kl5VH'km410'ky002'lb09J'lt042'lx100
'ld080'lz00I'ls0A2'lf5VI'lq18I'lk403'll19J'lm0DG'lh49K'lw1D1'ly00G'mt012'mj00I'mH002'md09G'mr5VP
'mD00G'mE480'ml091'mm59H'mn55O'mh08H'mw499'nb110'nt002'nv0D8'nH002'ns4VQ'nD04A'nf5DJ'nq0DG'nk001
'nn092'nh002'ny4DI'hb090'hl5DJ'hh091'hy002'wb1RH'wx080'wd0vH'wr411'ws401'wf001'wq091'wl19H'wm011
'wn091'wh091'wy5T2'yb092'yd0B2'yr002'ys0DI'yD002'yk40G'ym192'yn002'yh010b'j014b'r144b's5SOb'$024
b'T080b'l008b'n080b'h004b'w001b'y004bt'004btt0j3btr0iHbtE0WMbtk0f3btl4fJbtw001bvv4t3bvr88PbvT00G
bvE09Gbvq0X1bvw001bjj1YHbjH1TKbjd011bjr8DHbjs0f3bjE0W4bjl05Pbjm012bHt028bHv5Q4bHH15KbHr4CKbHz004
bH$004bxt014bxx001bxr0DKbxz004bxs0P4bxS08KbxE01Kbxq0aKbxl4DObxn004bxw041bd'1D4bdH0O4bdx084bdd5VH
bdr1M1bds001bdE5DSbdg04Obdl4VHbdn039bdh1I4bdw1V1bdy00Gb*'0MSb*H08Kb*x0AHb**52Hb*r4h9b*E044b*l583
b*m048b*w069br'4VSbrt04Gbrv00Gbrj0DHbrH0FHbrx010brd5T9brr1VIbrz4VPbrs01Gbr$20GbrS0DGbrD1D3brE08P
brg00Gbrq05Hbrk5V1brm0jHbrh04Gbrw041bry1+2bzj0J1bzx0nKbzr091bzz101bzE088bzg111bzq041bzl5f1bzm1C3
bzn020bzw0SHbs'04Kbsr1F1bss0i1bsT1l9bsq0D1bsl5F9bsm182bsn040b$r5VPb$$0CGb$T050b$E4CGb$g040b$q002
b$k143b$m05Gb$w001bSr4VPbSS0D2bSE084bSq041bSl090bSm002bSw001bDD1DJbDE5l4bDk002bDm001bT'4V8bTH4j4
bTx0C0bTr04JbT$0E3bTT051bTg04GbTl0DPbTn5VPbTy040bZr01GbZZ041bZw001bEv1uKbEj4f4bEd5VObEr0FKbES084
bED0D4bET044bEE003bEq1f4bEk00KbEl4QKbEw445bEy002bgt024bgv00Gbgr00Lbgz004bg$004bgD0VPbgg001bgl098
bgm0A7bgw001bgy5+2bqt001bqv001bqr1fHbqT091bqE0fKbqq0b3bql1D1bqm09Gbqn040bqw001bqy4DIbk'04Sbkt011
bkr1FHbks001bk$001bkE014bkk0G1bkl191bkm08Obky4N2blt1aRblj9iJblH0V4blx08Gbld0VPblr080blz100bls0C0
blS0B0blT0t1blE1DKblg0V9blqRbPblk001bll5DJblm05Gblh1UGblw1M1blyG5Gbnt010bnj0b1bnH004bnd010bns050
bn$011bnq051bnk090bnn0D2bny5l2bh'14Sbht0JKbhv0G4bhj5VSbhrDk4bhz0E4bhs004bh$1O4bhS00GbhD044bhZ044
bhq00Gbhl5UKbhm4D0bhh00Gbhw1NTbw'4V1bwb091bwv5a1bwj1f1bwH441bwx041bw*001bwr1D1bwz001bws001bw$0x1
bwS4X1bwD001bwT001bwZ081bwE0f1bwg0C0bwq0f1bwk0Y1bwl4D1bwn001bwh40Hbwy092byb012byt4DIbyv442byH010
byd042byz002bys002by$050byDF72byZ002byE5s2byg0D2byn4V2byh002byy010t'r044t'z004t'q04Gt'm160t'n0O0
t'y004tbb453tbr05JtbE5VGtbl071tbn11Itbw001tjr161tHf140tHm251txx042tx*50Gtxm1MItrb0FHtrj01HtrH0DG
trx044trr05Jtrz04Itrs1D1tr$00GtrS058trE1DKtrf4DGtrk1IHtrh00Gtry042tsE046tsw020tTw001tEb04GtEr004
tEs04KtES00GtEE0a3tEl00GtEy404tgb04Ktgr00Ktgm040tgw001tgy002tf'00Gtfv01GtfH040tfr040tff010tfl04J
tfn002tfh04HtqE00Gtqn0D0tkk403tld05JtlS010tlE4SStlf0aGtll073tlh1DGtlw4VHtly0D2tmr0D1tm$001tmk043
tmm4T2tmh00Gtn'004tnt010tnx0FKtnm011tnn062thm1FGthn00Gthw001twb401twj091twH041twr061twz001twE001
twf001twq081twl001twn0G0twh051twy04ItyH042tyx012tyr040tyz0A2tys4NYtyE4V2tyk042tym152tyh052tyy010
v'b0OGv'j004v'd00Gv'r544v'T00Gv'n0G0v'y04Kvbb002vbt4F9vbj49Jvbr8JHvbT0DHvbq002vbn1C2vby012vtm0e1
vtn00Gvjj0W3vjr0XHvjl01Gvjm05Hvjw041vHj004vxx001vxn548vdg0W4vdq0W1vdm010vdn05Gvdw011vdy01Ivrb052
vrd15Hvrr013vrT002vrE00Gvrg00Gvrm0aIvrn00Gvrw04Hvry05IvT'00KvTT003vTE014vTw0WHvEb0W4vEr04GvET01G
vEE0W2vEl04GvEm084vgb084vgr344vgm06Gvgw041vf'004vfj001vfd010vfr452vfl0V1vfn06Ivfw0D1vfy002vqb0j9
vqr080vqf0RPvql4LPvkk002vkl04Gvkm00Hvlb03Ivlv053vlj04Jvlx09Kvld002vlT002vlE004vlg0X4vll1iHvlm0fI
vm'0W4vmj042vmdD4Jvmr451vmg0X4vml0DJvmm1f1vmn07Bvnt00GvnT001vnn050vnyLz2vht01Gvhw021vw'040vwb4D1
vwr4/1vwE041vwl2eHvwn0G0vwy0D2vyb090vyx002vyE002j'b004j'v0aKj'j004j'*004j'r00Kj'z04Gj'$004j'S004
j'f1X4j'l20Kj'w004j'yW4Kjb'04Kjbb5t1jbj001jbH004jbx004jb*1W2jbr5/1jbz009jbs090jb$002jbE010jbl0FJ
jbn1D9jbh11Kjbw001jby152jtt001jvv1W1jvT002jvl00Pjvm093jvw0N1jvy002jHH0a1jHd04KjHr1i4jHs024jH$024
jHZ0L4jHf1M4jHl014jHm0TSjHn05KjHw301jxx001jxr0DKjxf00Jjxw091jdb0FRjdv100jdH154jdd4FJjdr15Pjds001
jd$002jdE0NKjdf0D2jdl1/Jjdm0a1jdn040jdw571jdy042j*b1w3j**0f1j*r0a1j*E0K4j*f0i2j*l5KHj*m0jJj*wIU1
j*y0S2jr'598jrb05Gjrj01HjrH51Kjrx010jrd1fHjr*05Hjrr5d1jrz0MPjrs1j3jr$X13jrD04JjrTW0GjrE1DKjrf1j1
jrl04Gjrm1DQjrn151jrh090jrw040jry4N2jz'1DKjzH004jzr1y3jzz553jzE1jKjzf1A1jzl44Qjzm1f2jzy1M2js'004
jsd0DGjsr1L1jss181jsE004jsm098jsw02Hj$'194j$b00Pj$r09Hj$$14Hj$E0OGj$m0DGj$n00Gj$w100jSS1H2jDD011
jDm080jZZ041jEb0f4jEd098jEr0e4jEs084jEZ05KjEE001jEf1a4jEl5MKjEm0CKjEn040jEw0W1jf'1C4jft110jfx026
jfr5D3jfs00Gjf$002jfZ801jfE004jff19Jjfl0j3jfn0D1jfw5N1jfy102jqq002jkr040jl'004jlb5jJjlt102jlH03K
jlx214jld1VQjl*W00jlz092jls4V2jlT1g2jlZW00jlE0oKjlg024jlf1DHjlq0f2jll1T3jlm102jlh00KjlwL/1jly09I
jm'08GjmH0G4jmx0Y4jmd0F9jmr5D3jmz012jms009jm$013jmE5l4jml5F9jmm4DJjmy082jn'1MKjnb5VRjnv080jnH5D7
jnd090jnz012jns0R1jn$002jnS010jnf0MIjnq012jnn5T3jny1E2jhv004jhd5MKjhr1MSjhz0D4jh$04KjhD064jhf100
jhl5NGjhm1CSjhn001jhh001jhy0NGjwb5t1jwt020jwv00Gjwj001jwH151jwx091jwd4V1jwr5V1jwz5V1jws121jw$081
jwZ091jwE4D1jwf5DHjwq09Gjwl5/1jwm001jwn08Hjwh0D1jww030jwy57Gjy'072jyb1X2jyt020jyH002jyx002jyd00G
jyr01Gjy$492jyD032jyZ002jyf1f2jym010Hbb4VQHbj04IHbr0DHHbs1F2Hb$1D1HbD05IHbTG4IHbq052Hbk1D3Hbl1DH
Hbn04GHbw1F1Hby002Ht'044Htt0q1Htd01IHtr053Ht$111Htf002Htk082Htl00HHtm0i2Htn1MGHtw001Hty042Hvv5N1
Hvr0DGHvl04GHvm002Hvw541Hvy542Hj'08KHjb591Hjj5N1Hjr5D1Hjz1+JHjf1Y0Hjl05JHjm153Hjn1FIHjw5QHHjy040
Hd'00KHdbGTIHdv4V1Hdj052Hdd5V3Hdr0zRHds083HdqGL2Hdl0MIHdm1CIHdw1G1Hdy0DIH**001H*r9BGH*f112H*q0jI
H*l0CGH*m002H*w5M1H*y0KIHrb5NHHrt00HHrv153Hrj0DHHrH00KHrd0lIHrr4DJHrz5FPHrs1CJHr$1FIHrS19JHrD0NR
HrfH/BHrq1FJHrk19RHrm5DQHrn009Hry0C2Hz'G04Hzb0R1Hzr05BHzz1F1Hzq0j2Hzk102HzlB00HzmHDQHzn1TPHzwG81
Hzy0D2Hsb3VvHsd0L3Hsr4jRHss0iJHsf0jIHsk05GHsl191Hsm0W2Hsn4F9Hsw1V1Hsy11IH$'004H$b140H$d1T3H$r1f3
H$$543H$T001H$f4D2H$k0CJH$l001H$m1FJH$n0EGH$w1c1H$y0RGHS'04KHSb0TJHSd5CJHSr1cRHSS0/HHSf44PHSl0DH
HSm0W2HSn0D9HSw001HSy4DIHD'144HDb0CIHDj0X1HDr5F1HDD1J1HDl04GHDn149HDw001HT'004HTb54IHTr001HTT5b1
HTm0jIHTwG01HZb00JHZr151HZZ04GHZl04JHZw14HHf'104Hft001Hfd142Hfr5EIHfz1E2Hfs002Hf$0DIHfS002HfD011
HfZDFGHff553Hfl1B2Hfn10HHfw5UHHqb54GHqd1SIHqr5LQHqS001HqT00GHqfG01Hqq5/JHql16IHqn1C3Hqw18HHk'144
Hkd062Hkr1BIHk$001Hkk5VHHkl1C1Hkm5V9Hky162Hl'05KHlb5kJHlt002Hlj1U3Hlz1O1Hls6EJHlT14HHlf5NAHlq5DJ
HlkK0HHll5lJHlm1zPHlwLVPHly09IHm'04KHmt08QHmj010Hmd5TGHmrA5HHmz00AHmsHTQHm$5DRHmS1f1HmD4DPHmT012
Hmq4/OHmk00IHml5/2Hmm5FHHmw001HmyHVIHn'094Hnb09GHnv0DGHnj142Hn*442Hnr011Hns00GHn$052HnT4DJHnZ040
Hnf09QHnq05GHnk5D3Hnn4T3Hnw0j1Hny012Hwb4D1Hwt021Hwv440Hwj1D1Hwd031Hw*451Hwr6NHHwz5x1Hws4AHHw$5/1
HwS12HHwD511HwT5F1Hwf091Hwq151Hwk0C1HwlFFHHwm011Hwn080HwwW0GHwy192Hyj042Hyd032Hyr49GHyz082Hys012
Hy$082HyS0o2HyD492HyT002Hyf08IHyq162Hyk1S2Hyl002Hyn4F2Hyy4VGxb'1FKxbb15Hxbt041xbv4S9xbj001xbd200
xbr5FPxbz1eIxbs181xb$081xbS5f2xbT5C2xbE004xbq082xbl5DJxbn142xbw041xby4D0xt'104xtt04Jxtr09JxtE0W4
xtl1I3xtm1D2xtn1I3xtw141xvv110xvr0DPxvm01Gxvy042xj'0KKxjj141xjl15Gxjy05Ixdb08Jxdj053xdd0R1xdr1DH
xd$032xdE1/4xdf102xdl00Gxdm5D3xdn020xdy042x*'44Kx**041x*E094x*f0G2x*q003x*l1r1x*m1DIx*w001x*y44G
xr'00Gxrb4DHxrt001xrv00GxrjEVHxrd0CGxrr0a3xrz01Jxrs4THxr$1J2xrS1BJxrTbjJxrE1fSxrf17PxrqHzRxrk00G
xrm1fQxzb08Gxzj00Gxzr0HHxzz10HxzE1f4xzf002xzq1W2xzl1eIxzm0R2xzn54Pxzw001xzy46Gxs'0sKxsr15Ixss4LJ
xsf0a2xsq002xsl041xsn040xsw0N0x$bH92x$r00Ix$$1a1x$E1S4x$f0dJx$l09Hx$m0DIx$nKR8x$w001x$y0BGxSb14I
xSr1VGxSS5DHxSf15IxSl0N1xSm1MIxSy142xDbHDIxDj0i0xDd1jIxDrR7HxDD030xDEHFKxDf002xDlQ5GxDm15IxDn021
xT'4TKxTb1NPxTr0VBxTT111xTf1DIxTl0CGxTm112xTw1D1xZZ040xZw051xEE002xf'004xft0M2xfj0CIxfd04Hxfr4DJ
xfs0j2xf$01HxfD1fAxfE0a4xff4T2xfq153xfw00Hxfy5DIxqq442xl'024xlb57Jxlj1UJxld053xls1UIxlS4VHxlT5N2
xlE1/Cxlf5VPxlqHlPxll1V3xlm130xlw4V1xlyHa2xmj00Gxmd04Hxmr5VJxms053xm$093xmS0mPxmT08JxmE004xml1b1
xmm1C3xmn013xn'004xnb1CGxnv1jIxnz00Gxns1jJxnT002xnE054xnf00Ixnq1n1xnn44Jxnw001xny04Ixwb001xwt1h1
xwv00Gxwx040xwd090xw*0R0xwr4LHxwz001xws011xw$0B1xwS8VHxwD1V1xwT080xwE090xwf0FGxwq1jHxwl4DHxwm051
xwn591xwy15Ixyb0D2xyt102xyr5V2xyz002xys092xy$012xyS00IxyT19Ixyf1DGxyl5VGxym0D2d'b044d'v004d'S00G
d'D00Gd'Z004d'k0G4d'l024d'm0O4d'w001d'y004db'014dbb05Idbj011dbH0X0dbx010dbr4VHdbsA50db$002dbg0f7
dbq0DIdbl01Jdbh010dby052dvv003dvr1z1dvT001dvE004dvn010djj092djr0YGdjl011djm00HdjnG61djh010djwGE1
dHb004dHj004dHH0W1dHr0W4dHz004dHs044dHS004dHD0a4dHq0a4dHl06KdHm004dHn00GdHw205dHy0w4dxx00Hdxr14K
dxs04Ldx$00GdxS004dxD004dxl1VHdxm004dxn1DVdr'1+4drb0DGdrj4jHdrH00Kdrd04Gdrr44Jdrz00Hdrs1/BdrS00G
drE1jKdrq090drk5N0drm07Idrn04Gdrh094dry1E2dzr001dsj0W0dsr001dss0X1dsE104dsf040dsq04Gdsm0DJdsw091
d$$001d$n011d$w001dSq001dZZ001dEb0UKdEt004dEv0iKdEj00GdEr08KdEz004dEs074dES0k4dEZ004dEE041dEq044
dEk0IKdEl021dEm1H4dEn044dEw5/1dgt004dgr0eKdg$0M4dgS06Gdgf004dgl044dgm94Kdgn004df'5FOdfr04Hdfs040
dfE4x4dff4N3dfq4jJdfn1u2dfw4MHdqr00Gdqs001dqE04Gdqq4t3dql041dqm0aJdqn001dqy00Gdk'0I4dks1qHdkE004
dkk0nHdkl093dkm0n1dkn05Hdlv1e2dlj143dlH0G4dlx00GdlsAl0dlS0bHdlZ0Y2dlE1a5dlg004dlf0i2dlq4i1dlk0B1
dll5jJdlm80Gdlh09KdlwGF1dly00Gdmv01Odmj1/1dmH010dmx014dmr031dms1lJdm$05GdmS00HdmE04Kdmg055dmq0b3
dmk001dml1+Hdmm05Rdmn0DHdmhG0Gdmy45Gdn'0DSdnH014dnx014dnr090dns09GdnE04Kdnf04Gdnq013dnn05Idnw5VP
dhv004dhr024dhs84Odh$05KdhD040dhf044dhq154dhk004dhmADKdhn9FPdhw009dhy0FMdw'14Gdwj001dwH0j1dwx051
dwd05Gdwr4F1dws1b1dw$00HdwS010dwE001dwg001dwf041dwq0j1dwk0G1dwl4t1dwm4F1dwn091dwh090dwy1NGdyv092
dyj002dyH010dyx052dyd010dyr080dyS0W2dyf040dyq002dym010dyn5V2*'b4TS*'t004*'j0WK*'H004*'r06K*'T004
*'f0a4*'l0G4*'m044*'w001*'y004*bb053*bH1H4*br01J*bl0C9*jj001*jl001*Hj044*HH001*Hq004*Hw005*Hy002
*xr104*r'04K*rb05H*rH014*rr02H*rz00G*rE5/S*rf4HI*rq1DJ*rm001*rw4D1*ry002*Eb0e0*Et004*Ej004*Er0iK
*ET0W4*Ef0aK*Eq004*En04G*gg001*fr40G*fT002*ff473*qH080*qT082*qn03H*kr5VH*kw45P*lj001*lg0eK*lf00G
*lq4bP*ll4D2*lyGi4*m'004*mt002*mr0P1*mT002*ml013*mm4T3*mh04G*my44I*nb4V3*nn03I*hb05K*hr00G*hl0aK
*hn46S*hw001*wb451*wj001*wH011*wd051*wr041*wT04H*wE041*wf001*wq4S1*wl010*wn080*wy04I*y'090*yj022
*yH010*yx050*yr010*yT002*yE042*yl0T2*ym002*yn002r'b154r'd1OCr's1B4r'f4QSr'm0EKr'y5V4rb'174rbb1D1
rbt09IrbvB91rbj0C8rbH0FGrbx0CKrbdADHrb*04Grbz158rbs3D1rb$04GrbS081rbD0D3rbT1I3rbE5F7rbg04Srbq193
rbk90Hrbl1V3rbn1C0rbh040rbw1FHrt'044rtb0D1rtt04Grtj74Hrtx244rtE044rtq10Jrtk043rtl09Grtm1C2rtn001
rtw001rv'144rvv143rvd14HrvT0C1rvE00Grvm21Irvn090rvw001rvy49Irj'040rjb0DHrjj14HrjH1F7rjd051rjz1RH
rjs14RrjE5V2rjf541rjl1DHrjm5J1rjn15Hrjh040rjw1DHrHb0TOrHH00GrHD155rHl5V4rHm4POrHw091rHy002rxx143
rxs040rx$180rxS5D8rxf05Prxl080rxm15Trxw5NTrd'0SCrdj002rdH05Crdx004rdd5V1rds0A3rdE1P4rdg14Grdf5UH
rdm1D3rdn15Hrdh014rdy1VIr**041r*l44Pr*m04Jr*w04Grz'1HKrzb001rzH0L4rzx004rzz153rzE00Grzg560rzf052
rzq501rzm8F3rzn0Q9rzy042rsb049rsH04Grsx044rss1N1rsE01Krsg134rsf143rsl4VGrsm1D3rsn043rsw0E1r$'004
r$H5D4r$d45Hr$$4C1r$f1DJr$q0U9r$m15Hr$n001r$w5E1rSd1U1rSS1PHrSE1VKrSf1TPrSq140rSn059rSw041rDb0C1
rDH184rDx1U6rDd101rDD1D1rDE5MUrDf012rDk040rDm102rDn002rDw5VHrT'44KrTb0DPrTs203rTT440rTl471rTm1S1
rTn0I1rTw001rTy04GrEb154rEv19KrEj14KrEd1C5rEz024rEs1C4rE$15KrES1C4rED004rEZ0DKrEE001rEf54TrEq004
rEl45KrEm05CrEn04PrEw201rEy5F4rgb1LOrgv154rgdC4Orgz400rgs454rg$004rgf054rgl04Krgm0FTrgn044rgw1L1
rf'0N4rft283rfv0MPrfH010rfd5N2rfz002rfs003rf$05HrfS1O0rfD6D3rfE5RCrfg0COrff14Jrfq5UPrfl0DHrfh4DC
rfw0N1rq'044rqb1EHrqH194rqd6K1rqz002rq$19HrqS1D1rqTA9HrqE5FCrqq4T3rql040rqm01Hrqn5D1rqw001rqy5PI
rkb5VHrkH1C4rkd0K1rkz1D3rks1K1rkD1M1rkE0T4rkf100rkk553rkl0R1rkm1H1rkn0DTrkw1E1rm'044rmv45Irmj011
rmH0I4rmx040rmdA5Jrmz9PBrms163rm$04JrmS04HrmD1DJrmT002rmE0DKrmg014rmqAR1rmk641rml1D1rmm5D3rmh00G
rmy1U2rn'004rnH190rnx091rnE014rnf060rnq0DHrnm09Grnn452rnw0V1rhb4DGrhj040rhd01Crhz104rhs184rh$10G
rhS06KrhT114rhf04Crhq07Grhk104rhl0DGrhm040rhn5M4rhw1M1rw'0D0rwb051rwv001rwj091rwH5VHrwd571rwz031
rws501rw$01HrwS001rwD5N1rwT001rwE5DHrwg1V1rwf001rwq0VHrwl090rwm091rwn001rwh001rwy1FIry'030ryb5C2
ryv4D2ryx012ryr05Grys502ry$1D2ryT002ryE4D2ryg090ryf0E2ryq0D2ryl012rym012ryn042ryh092ryy010z'b104
z't004z'j004z'd004z'r0CMz'z080z'T004z'f044z'k0G4z'm15Kz'y044zbb1DHzbd1F3zbr0DBzbT002zbE080zbq0W3
zbl112zbn4w2zby1T2ztt091zjj15Hzjr1m1zjl02Hzjm001zjw1D1zHb004zHH001zHr0B6zHf1V4zHk0M4zHl8D4zHm1I4
zHn084zxx003zxr0A4zxf094zxm14KzdE004zdg080zdf040zdw041zr'040zrb2WHzrj001zrH00Kzrd1DJzrr0FJzrT002
zrE5E4zrf0bJzrqAaJzrk00Gzrm95Izry5E2zEb184zEj0aKzErA1KzET004zEf144zEq0aSzEl0CGzEm0UTzEw001zgbB5G
zgd0C4zgr104zgf104zgl044zgm080zft111zfd001zfr102zff54Jzfn002zfy042zqb0X1zqH004zqE004zqf181zqq011
zqm1D1zqn041zqw041zqy042zk'144zkb0W1zkt051zkr091zkk1C3zkm051zkn07Gzkw0DHzlb00Gzlj0jIzlH084zlx0DI
zlz00GzlE1CKzlg181zlf1D1zlq0jJzll45Izlm31Hzlh00Gzmt089zmj00HzmH010zmx084zmr49JzmE0DKzmq003zmk81H
zml1R3zmm1d3zmn06Gzmh00Gzn'054znb00Gznj0AGznH0B4znx09Jznd0DHznr091znT0G0znf08Gznq053znm05Hznn053
zny072zhb100zhd1TSzhrB5Szhf1iKzhq0c4zhk004zhl00Kzhm06Hzhw155zw'001zwb001zwj1V1zwH0a1zwd5D1zwrFTH
zwT210zwE091zwg061zwf0G1zwq010zwk0K1zwlE/1zwm001zwy0j2zyb080zyt552zyH0a2zyx0C2zyd5V2zyr012zyT002
zyg0T2zyf092zyq090zyk002zyl0/Izym08IzynBD2zyy190s'b00Ks't004s'd04Ks'r0SKs's00Gs'f0WSs'l0U4s'm04G
s'w041s'y044sb'1a4sbb5R1sbt0b3sbj080sbH054sbx0DKsbd051sbr143sbT05OsbE176sbg051sbq1N3sbk0f3sbl050
sbn040sby1O2str1h3stl1oHstn040sth00Ksjj001sjH0bKsjd0aHsjr0dHsjs01GsjE014sjf15Hsjl0t1sjm0b3sjn051
sjw0F1sHb0i4sHt054sHj0f4sHH0f3sHr1DKsHT0W4sHf044sHq0lSsHl0c4sHm05GsHn0A4sHw1b5sHy1b6sx'004sxx002
sxd010sxr49KsxT0CGsxf078sxl054sxm090sxn05Psxw0TPsxy004sdj0e1sdH0Z4sdx0W0sdd1j3sdr0iJsds053sdE004
sdf05Gsdk01Gsdl0jJsdm0XHsdn003sdw14Hsdy0D2sr'054srb0jHsrj45HsrH0fKsrd0DHsrr4VHsrs00GsrT1eHsrE0VO
srg00Gsrf04Hsrq1hIsrk0GGsrm090srw1jPsry1F2ssy020sT'004sTH0f4sTr151sTE01KsTm001sTn010sTw061sEb0f0
sEd4EKsEr1FKsET145sEf0FKsEl44HsEm014sEn0C0sEy4M4sgb04Hsgr004sgl00Gsgm054sft10GsfH0J4sfd4VIsfr4l3
sfT1D8sfE1BKsff14Jsfk0X3sfl1BPsfn01Jsfh0VTsfw06Hsfy142sqb0MGsqt00Gsqd052sqr041sqT4U1sqE114sqf0DH
sqq001sql00Gsqm05Osqy5V2skb0W1skt071skr0LHskE09Kskf0CGskk1eHskm001skn1V9skw020sl'104slb1jHslt1W3
slj18HslH0D4slx2fDsls05OslT09OslE0jKslg0WKslf5V1slq1j1slk0j1sll1i3slm5VIslw1jHsly15Ismt0R3smj418
smH0VCsmx004smdA51smrAVRsmT0j3smE5TGsmg010smq001smk5f1sml1D9smm0D1smn4DPsmh014smw5V1snt0F0snj011
snH4A4snx01Lsnd1V1snT00OsnE04Dsnf043snq04Gsnm1DGsnn5V1snh0AGsnw1FPsny0A2shb144shj004shd0DGshr06G
shf10Kshk00Kshl5V8shm1NCshw079sw'151swj011swx0C1swdBFHswr0R1sws1D1swT131swE061swg451swf171swq5/H
swk1T1swl09Gswm1V1sww1VGsy'090syb0j2syj010syH0b2syx042syr1V2sys00GsyE0j2syg042syf1/Isyl0L2$'z14K
$'s00G$'f40G$'m4VC$'n144$'w1I1$bb4D3$bv0AG$bj040$bH0fC$br0TJ$bS080$bE0DO$bq00G$bk1V2$bl041$bm01H
$bn001$bh1V0$bw041$tt4j2$tr0bI$tE00G$tg044$tl012$tm0QB$tn001$tw0F1$vr00G$vl00O$vn00O$jb0SH$jj03H
$j*040$jr1tH$jE0B8$jn0DP$jw0KH$Hb00D$Hj486$HH0IJ$H*0E4$Hr004$HS050$HT0DK$Hf004$Hk004$Hm05S$Hn0ML
$Hw0D1$Hy004$xb0W5$xt018$xx001$x*040$xr012$xz0G4$xs0M4$xS0DC$xl024$xmA5H$xn050$dH0W4$dx0f4$dd1V3
$df0KI$dq08G$dn041$dh1a4$dw041$*b093$**053$*r090$*w051$rb4FH$rv0WG$rj0/H$rH0X4$rx001$rd0D1$rr4NJ
$rz072$rs0MP$rT5VJ$rE154$rf5FP$rqKjH$rk1NG$rm0fI$rn00G$rh00G$ryLVI$zb0H9$zr4V3$zz002$zn09O$zw001
$sb00O$ss002$sE05K$sf019$Sb04H$Sr013$SS05I$Sw041$Sy00G$T'074$Tb0X1$TH004$Tr0B3$Ts001$TT173$TE00G
$Tf001$Tm001$Tn041$Ty0XG$ZZ051$Zf00P$Zy0jI$Eb0lK$Ev0fG$Er4VP$EE0a3$Ef00K$ElBDK$EnA4G$Ew04H$gb0Q4
$gr1U5$gz004$gg001$gf08K$gl1z4$gw05H$fr05H$fz002$fE494$ff5L3$fq05G$fn00I$fh024$fw00H$fy5F2$q'004
$qH0NS$q*06I$qr20O$qS010$qE004$qq5xH$ql0G1$qn049$qw06H$k'04K$kd453$kr1EH$kz001$ks0IO$kE04K$kk191
$kl5VH$km04H$kh0M0$kw1V1$lH010$lx004$lg004$lq181$ll0aH$lw541$mt1DG$mj011$mx0H4$m*102$mr0j3$mz081
$ms0VJ$mS0j1$mTA5I$mZ002$mE054$mq08G$ml1jJ$mm5VH$n'0GK$nb00G$nv00G$nj0jG$nx010$nr010$nS00H$nE4DS
$nf0DJ$nq0NJ$nm001$nn5T3$hbB5S$hd4FG$hr1N4$hq00M$hl2AG$hm00D$hw1FP$w'001$wb1X1$wH010$wd090$w*190
$wr5V1$ws0I1$w$0T0$wS0D1$wT091$wZ001$wE05H$wf5D1$wq1D1$wk05H$wl5t1$wn091$wh09H$wy1b2$y'0DG$yb052
$yH072$yx092$yd0D2$yr0G0$yz010$yS070$yT5D2$yZ0G2$yE1V2$yf010$yq002$yl002$ym1jI$yn012$yh002S'b04G
S'k02GS'l008S'm00KS'y0S4Sb'04CSbb1yJSbHDTSSbrDF3SbE004Sbg1D7Sbn1W2Sbw4VHSt'004Stt0I1StE084Stm090
Sth014Stw001Sjj001SHb5UKSHH4D2SHrA6KSHf0D0SHl00GSHm900SHn084SHw04HSxb1IGSxx043Sxd14KSxr04GSxf004
Sxm100Sxw00GSd'0DKSdH004Sdd1D3Sdr4F3SdE1f4Sdg0ADSdf0UJSdq0V1Sdm1I2Sdy0FGSrb95JSrj010SrH0lCSrx5S1
Srd05HSrr173SrE1R4Srf5l2Srm1/ASrw001Sry05ISEb4V8SEd1TGSEr2VGSEf040SEq04KSEl80GSEn240SEw004Sgr4LP
Sgg001Sgw04LSft080SfH4V4Sfd052SfrADQSfE0I4Sfg044Sff1N1Sfq1/ASfl040Sfn0J2Sfw5N9Sqb0MHSqr3D1SqE05K
Sqq002Sql02HSkk10HSkm001Skw001Slb5DBSlt0aBSlj0GHSlH5sDSlx2GGSld05ASlE0fGSlf0CISlq1C3Slk010Sll053
Slm112Slw05HSly1DISm'0W4Smt051SmH006Smx001Smd0V1Smr0DJSmE0fKSmg450Smq040Smk800Sml041Smm0rHSmy0c2
Snj011Snx00GSnE5FKSnf090Snq04GSnm01GSnn042Snw1C0ShbA5OShd004Shr9s4Shl0G6Shw06KShy004Swb4l1Swt0bH
SwH0f1Swx0a1Swr0jHSwE0j1Swg0W1Swf0DHSwq081Swk081Swl0J1Swm511Swn1O1Swy05ISy'012Syb042SyH0R2Syd3CI
Syr0j2SyS052SyE0i2Syg010Syf1F2Syq002Syk022Syl002D'd044D'z004D'T00GD'l1I8D'n040D'y004Db'144Dbb0DR
Dbv102Dbj001DbH0o4Dbd011Dbr052Dbs00HDbT0iJDbE57KDbk810Dbn14HDbw041Dby002Djj072Djr0CGDjE1/4Djm0GG
DHk4VGDHl004DHw5FLDxx0W5Dxz004Dxm098Dd'00GDdd0M1Ddn002Ddy06GDr'0W4Drb5VQDrj0j3DrH1c5Drr5V1Drs0VJ
DrT05IDrE4VSDrk008Drm5DGDrw45HDry002Dzz04GDzn0G3DEz004DET004DEE001DEf4VCDEw001Dgb004Dgv154DgT1s4
Dgg140Dgl004Dgm044Dgn1MGDgw0L1Dfd802Dfr0p2Dfz122Dfs002DfT0G9DfE004Dff0G1Dfq001Dfn1I2Dfw041Dkz001
Dkk001DlE5DSDll4TIDmj05GDmx2f4Dmd0DJDmr1j9Dmz013Dms002Dmg0a0Dmk800Dmm1s1Dmn0TGDmy00IDn'14KDnb002
DnT0YGDnk0C9Dnn10IDnw1kHDny002Dh'020Dhb034Dht004Dhj040Dhd144Dhz004Dhs004Dhl4C4Dhy06GDw'4D1Dwb001
Dwj0e1DwH010Dwr481Dwz001Dws001DwT0DGDwE0f1Dwk181Dwn001Dwy0aIDy'010Dyj002DyH092Dyr002Dyz002Dys002
DyT002DyE0D2Dyf4z2Dyq4V2Dyk002Dyl040Dym402Tbb4B3Tbj08GTbx1f5Tbr001Tbz001TbE0jKTbq0/GTbl011Tbn02I
Tbw101Tby14ITv'004Tvv001Tvr151Tvw001Tjn011THv004THH0a1THr046THz004THs004THl00KTHn0f4THw091THy006
Txx001Tx$00GTxf100Txm20CTxw041Tr'05CTrb4DGTrv010TrH1xKTrd5N1Trr053Trz09HTrs09ITr$0OGTrT00GTrf5DQ
Trq5/HTrm1CGTrwGDPTry00GTs'04KTss011TsE00KTsl011Tsm0aITsw001Tsy04IT$'040T$$043T$w080TEj004TEr004
TEz004TEs004TEE001TEl004TEm5VGTEn1I5Tgr004Tgm080Tgw041Tgy0LKTf'0bGTfH154Tf*002Tfr153Tfs01ITf$082
Tff453Tfq04GTfl0DPTfn001Tfw041Tqq002Tlb1FHTlv011TlH15LTlx200Tls0fQTlE5VLTlg004Tlf050Tlq5jRTll4SJ
Tlm011Tlh104TlwG41Tly1DITmv00JTmH054Tmr15JTms0f3TmE0DOTmg00GTml1aHTmm4D3Tmn0I0Tmw001Tmy002Tn'04K
Tnb0NGTnj080TnH00GTnx15GTnz0I3Tnf0DGTnn152Tny15GThr19DThs004Th$004Thf040Thq004Thl0CKThm090Thw045
Thy002Tw'0G1TwH0V1Twx001Twd0f1Twr091Tws091Tw$010TwT011TwE4/HTwf5D1Twq0D1Twl4V9Twy1jITyb4V2TyH0T2
Tyx092Tyr4/2Tys002Ty$042TyT00ITyf0D2Tym002Tyn002Z'b0I4Z't004Z'r564Z'f004Zby040Zjj002Zrb01GZrr041
Zrf4U8ZryG0IZEn144Zfr1LIZff401ZlE044Zlf07IZll4DIZlm1/IZly080Zm'0DGZmy05GZnn1C1Zhr5VKZwf001Zwy040
Zy'010Eb'114Ebb081Ebt002Ebv00IEbd5DPEbr55JEbs0DIEb$081EbT142Ebq09GEbk001Ebl04REbm008Ebn040Ebw111
Eby1H2Etb5V3Ett0A1Etd0D8Etr002Etf002Etq05BEtk002Etl0eJEtm4D3Etn043Eth08GEtw001Ety08GEvv1J1Evjm02
Evr0DREvq140Evl00HEvm15JEvn09HEvw00LEjb4DGEjj0DIEjr1AIEjz0FREjs092Ejf0DREjl4FGEjm4t9Ejn1CJEjh090
Ejw07HEdd5V1Edr10GEds022Edf182Edq05IEdk002Edl1tAEdm0aOEdn013Edw5VHE*bL5AE*r5F3E*f082E*q153E*l1P3
E*m04IE*n040E*w00PE*y400Erb4DQErt00JErj0zRErd05HErr5NJErz5VIErs1DJEr$XDJErS1DIErD5VRErT101ErfLTR
Erq5FJErkHMHErm1FRErn07RErw151EryLFGEzb0D3Ezj001Ezd002Ezr012Ezz5FBEzfGL3Ezq05JEzl1v2Ezm192Ezn040
Ezw181Ezy0PIEsb442Esj20IEsd002Esr5VREss101Esf1j2Esq08GEsk08GEsl413Esm14IEsn4DGEsw04HEsy00IE$bHDO
E$d002E$r1N3E$z002E$$1bHE$T002E$f040E$q09GE$m08GE$n1D1E$w5THESbHjIESd04JESr1l2ESS01GESf542ESl85H
ESm5aIESn040ESw17HESy5A2EDb0cQEDd5VJEDr001EDD0NGEDl4DJEDh05KEDw011ETb15HETr49GETs0H3ET$0FGETT1f1
ETf5v2ETl49GETn0jJETw4V1EZb01IEZr04IEZZ061EZl1RHEZm4T9EZn040EZw001EZy00IEft00IEfj08IEfd102Efr5xI
Efz020Efs1o2Ef$002EfS17IEfT002Eff5T2Efq1l2Efk00IEfl01HEfn0DIEfh004Efw5V1Eqb5VJEqd5/IEqr5/QEqS03I
Eqf0f2Eqq1c3Eql1VJEqm1VREqw151Eqy152Ekb19HEkd54IEkr1LHEkz09HEks1w2Ek$09IEkS08IEkZ0R2Ekf1B3Ekk063
Ekl14JEkm172Ekn090Ekw051Eky012Elb41JElv1BIElj5RHEldW0GElz04GEls112ElS130ElD002ElTXD3Elf5D2Elq1FH
Elk013Ell1V3Elm5VJEln57JElh00GElwLVHEly002Emt012Emj082Emd1jIEmr5DREms0NREm$4TIEmT101Emq1DOEml5VG
Emm5D1Emn05IEmh0HKEmy9TIEnb010Ent0DGEnj043End4MREnz5C1EnsG5JEn$1Q3EnS040EnT040Enf158Enq1VHEnk5D1
Enm050Enn1F3Enw041Eny1FIEhb00GEhd5UGEhr024Ehn003Ehw040Ewv091Ewj2fHEwd5V1Ew*4T1EwrFVHEwz24HEws00H
EwS17GEwD5V1EwT181Ewf081Ewq1D1Ewk1G1Ewl151Ewm071Ewn5N1Ewh0D1Ewy5p2Eyb092Eyv092Eyj002Eyr0V2Eys0C2
Ey$0V2EyT09IEyf1CIEyq012Eyk002Eyl0D2Eym14IEyn1FIEyh052Eyy4UGgb'004gbb153gbv20Igbj00Ggbr2DHgbsA4H
gb$0CIgbS02GgbD010gbT15Igbq193gbn1GJgbw0GGgtt111gtl00Ggtm14Hgvv5DIgvr84Hgvm00Hgvw001gvy04Igdd051
gdr5EJgdfH71gdqG4IgdnG8Ggdw1BHg**043g*r100g*m1CHg*w591grb5DPgrv01Ggrd4DGgrr5FJgrz15Igrs1a2grD1lQ
grf1iJgrqLFGgrl00Ggrm1DGgrn00Ggrw07Hgry002gzr478gzz1M1gzl1EIgzw151gsr081gss0W1gsf0a0gsq04Igsl5b2
gsm041gsn001gsw041gsy00Gg$$553g$m0G3g$n080g$w4DHg$y4DGgSb122gSS14HgSn052gDb4EGgDr18RgDD1rJgDf0jI
gDn0FJgDw001gDy0KGgTs0H2gT$8TIgTT1q3gTf00GgTl04HgTw091gTy1D2gfrDTIgfS020gff180gfq192gfl4T1gfw041
gfy0bIgqq002glbKRIglt18Hglv1CIglj082gls050glT0NGglZ4FAglf1DHglq4tIgll5jJglm14Hgln001glwLM1gly0DI
gmt00Igmj0GIgmd1DJgmr1lPgmz1N2gms1p2gm$08GgmS10IgmD1bBgmT1EIgmq00Pgml0iHgmm1sHgmn0W1gmw001gmy052
gnv08Ignj08GgnS00GgnD002gnZ002gnm1DGgnn05Ggny5TGghb14Ggwv451gwj081gwr5V1gwz011gws010gwS011gwT0z1
gwg0G0gwl1Q1gww4rGgyb1V2gyv0D2gyd0GGgyr1VIgys00GgyD0j2gyT002gyZ1F2gyf0D2gyq090gyl5D2gym0D2gyn05I
gyy0N0f't100f'd18Kf'r004f's004f'q08Kf'l1R0f'm0D4f'w0i1f'y0i4ft'00Kftt0f1ftH5x4ftx0DKftr4D3ft$012
ftg084ftq0jJftk0F3ftl1jIftn1L2ftw4V9fty00Gfv'0aKfvv1W1fvj051fvd010fvg004fvy040fj'16Kfjj1sHfjr1l1
fjs0C1fj$001fjE094fjl11Hfjm0eGfjn040fjw0m1fjy0bGfHv104fHj0jKfHH003fHr100fHs044fH$0T9fHS1A4fHD004
fHq0a0fHl5C4fHm15TfHw031fHy03Ifxt0f4fxj00Kfxx10Ifx*4B4fxr5VLfxz08Kfx$004fxl080fxm098fdH444fdx004
fdd012fdr0DIfds040fd$001fdE01Gfdg0W4fdk010fdm05Afdn010fdy1N2f**4C3frb010frt00Pfrv0jJfrj0jQfrH05G
frx45Gfrd4jPfrr1U3frz1N2frs1FQfr$1j3frS1V3frD15AfrT1/3frE5FKfrg5DTfrq1/Jfrk4lHfrm551frh45Pfrw110
fry1jIfzr0jHfzz5S3fzE0FKfs'0PKfsj051fsH0zCfsx0/Kfsd4r9fsr413fsq0XBfsl15Pfsw0G1f$'0C4f$j0f2f$H014
f$x094f$$0a1f$T0W0f$E004f$g0lKf$q0AHf$l1DHf$w0C1fSH0TCfSx004fSd1j2fSS5b2fSE1X4fSl1d3fSm0j2fSy0l2
fDj0e0fDH1NKfDx1a4fDD1j1fDE004fDg004fDl4VPfDw0C1fT'0MKfTH01KfTr1j3fTs01IfT$0W0fTm0q2fTn0BPfTh00G
fTw001fZZ14HfZE5DOfZy040fEr004fEl1m4fEmG5SfEw0D0fgr0i5fgg001fgm1/Kfgw041fgy00Gfq'1j4fqH0P4fqx004
fqd5S2fqr5TRfqs0v2fq$002fqS0f2fqT010fqE0zLfqq0W3fql040fqm0QPfqh0FOfqw001fkr1D3fkE00Kfkk5jPfkl100
fkn081fkh0VGfl'004flt1l2flj4lJflH4jKflx014fl*132fls05GflS1j0flT161flE0f4flg084flq1j2flk4DHfll5jJ
flm100flw151fly5TIfnH004fnx094fnd1FGfns002fn$010fnE00Gfnq0F2fnk07Hfnn5D1fny0MGfhd00Kfhr0D4fhq0iK
fhm4TGfhh05Gfhw041fwt1T1fwj451fwH0K1fwx041fwd4C1fwr051fwz0D1fwD0J0fwT010fwZ041fwE001fwg001fwf001
fwq5jHfwh4RHfy'4D2fyj042fyH05Ifyx052fyd4T2fy$0R2fyS442fyD4C2fyZ0C2fyq002fyl4B2fyn002q'b00Kq'm00G
q'y004qbb1DJqbv002qbH47Cqbr043qbs14QqbS1fIqbD1/2qbT012qbE1a4qblFVRqbn852qbw1f1qtb151qtt191qtd01G
qtr5TJqtE024qtl5V1qtm34Hqtn049qtw001qv'040qvv101qvd100qvr180qvm10Rqvw101qvy002qHb0B1qHv004qHH001
qHd444qHr004qHz094qHS054qHT05KqHf164qHl0EKqHm1j5qHw141qxr004qxw011qdH5J4qdd5f1qdr5/Jqds098qdE0+K
qdf001qdm5TPqdw1EPqdy042q*H0A0q**1D1q*r4DPq*E0F4q*f4o2q*l001q*m00Iq*n040q*y17Iqr'5F4qrb5VPqrt00H
qrv10HqrH1FKqrd0DIqrr5VJqrs05Iqr$1TJqrS0JHqrD5tIqrT09HqrZ0HIqrE5/Kqrf1FIqrq01Iqrm4DJqrn5NJqrh00G
qrwLC1qry5CIqzb00GqzH09Kqzz083qzE0DKqzl00Iqzm08Hqzn040qzw041qzy010qsb00AqsH164qsr182qss191qsT1DI
qsm5/Aqsn840qsw071q$b5DQq$d102q$r1fJq$$1j3q$T0f2q$E0iKq$f09Oq$m102q$w0D1qSb152qSd1jAqSr5TRqSS5V1
qSE09SqSf0zIqSl1i2qSm0iIqSw4FHqD'0CGqDb1j2qDD5jJqDE0e4qDf0W8qDm46IqDy5x2qTb452qTrET1qTT1XJqTEL/S
qTf15BqTl093qTm01IqTn01HqTwG81qEb010qEv1b4qEd1VHqEr0jCqEz004qEs0TKqE$0W4qES0cKqET1jKqEZ040qEE041
qEf1eKqEl140qEm04HqEn00GqEw14Hqf'10GqfH004qfx044qfd00Iqfr1DHqfz0PIqfs0OQqf$1W2qfS0TIqfT9G3qfE0fK
qff542qfl5jJqfn152qfw5T1qfy002qlb0jJqlt04GqlH09Gqlx014qldXT2qlz1D3qls092qlS0DIqlE5jKqlf1XJqlq04I
qll4V2qlm012qlwGQ1qly0OIqm'1ECqmH1lKqmx040qmd04Hqmr8VJqmz042qms0t3qm$193qmS0R3qmT0H3qmE1jKqmq080
qml0DGqmm1D1qmn0COqmh08Kqmw001qmy062qn'05Kqnb0D2qnt159qnH0D4qnd051qnz0C0qns040qn$010qnS182qnT05x
qnE5DKqnf45Gqnm04Gqnn511qnw1DHqny562qhb04Gqhd004qhr064qhz004qhl0iKqhm04Gqhh002qhw040qhy14Gqwb1f1
qwt5C1qwH0D1qwx001qwd5rHqwr3fHqwz190qws4FHqwD0f1qwE181qwf181qwq001qwl1V1qwm5V1qwn080qwh4H0qwy5VG
qy'4D2qyv080qyH0D2qyd092qyr110qys1/2qyS0e2qyD1x2qyZ1B2qyE002qyf090qyq002qyl5V2qym010qyn992k'b14G
k'j004k'd0O4k's100k'$004k'S004k'f040k'l004k'y044kbb0z1kbt1W2kbv01HkbH064kbd0BJkbr4VPkbs1fIkb$002
kbE014kbl1B2kbn043kbw1F1ktb5V3ktt1L3ktH004ktr040ktE0p1ktf0RIktl0hHktm5t1ktn05Gkth004ktw041ktyG00
kv'054kvb0d3kvv04Ikvj002kvH0P4kvr4V9kvE05Kkvf4H8kvm0kHkjj001kHb014kHv004kHH001kHS014kHl9DLkxx002
kxm004kd'01Kkdj001kdH194kdd5F1kdr2zPkds0P2kd$1C2kdE004kdf040kdm0M3kdn00Hkdh0D4kdw08Hkdy0D2k*b0V2
k**041krb9FHkrv1b3krj1DGkrd021krr09Jkrz03Ikrs0zGkr$49GkrS112krD042krZ001krE0DKkrf053krk050krm4V9
krh4TOkrw00Hkry5VIkzb00Gkzz141kzm0DJkzy002ks'004ksb5C2ksH12Kksd0a9ksr1h2kss08HksE184ksf0b2ksl4LG
ksm002ksw5EHk$'0DKk$b012k$H0hKk$x010k$d042k$r0BIk$$0G2k$T4e2k$E004k$f5/Ik$m10Hk$w001kSS1K2kSm002
kSy002kZb001kZr001kZZ1J1kZm00AkZw081kEb0D5kEt040kEr05GkEz004kEE042kEl098kEm024kEn040kEw011kf'5/4
kft1h2kfH0UKkfx004kfr1F3kfs0WGkff5v1kfl1VRkfn192kfy5A2kl'5FKklb5NHklt1W2klv0W0klHWF4kld092klz012
kls09IklE0CKklf8DGkll1j2klm0R2klwH0Gkly192km'0SKkmtA59kmH044kmx044kmd05Hkmr0JGkmz002kms001km$0jP
kmE164kml5TPkmm0D3kmn14Hkmh08Gkmy1j2knb04Jknt14Hknd003knr010knz183kns193kn$041knS010knZ083knE1DK
knf1F3knn5D1knh141knw001kny1D2khb80Okhd044khr004khf180khl1A0khm0DCkhn0BDkhh043khy16Gkw'041kwb11H
kwv010kwH0N1kwd01Hkw*010kwr5D1kwz181kws1T1kw$001kwE09Hkwf0f1kwl0u0kwm11Hkwn5P1kwh09Hkwy5F2ky'042
kyt010kyH04Ikyd1I2kyr1K2kys0F2kyS022kyE002kyf0f2kyl1R2kyn542kyh002l'T084l'Z004l'f004l'k440l'm5VC
l'y154lb'554lbb4DRlbt001lbv4DGlbj102lbH054lbx094lbd1DJlbz002lbs1FIlbS040lbT182lbq01Plbk1DHlbn5DJ
lby11Glt'004ltb1L1ltt041ltH00Kltd002ltz003ltm001lv'004lvv042lvd002lvg0GHlvq1DGlvm1RIlvy1CGlj'1DK
ljb01Oljj5VIlj*00Hljf09Iljm1D1ljn09HlHb11KlHt004lHj5FKlHH0CIlHd164lHz0OKlHs15KlHS11KlHT104lHZ0R4
lHf1F4lHq5MGlHk0MKlHm5MTlHn07KlHw161lHy1U6lxb025lxx1GJlxS05Klxf004lxm12Clxn00Glxw041lxy16Ildd1FH
lds011ldg044ldk00Gldm1D2ldn098ldy040l*j001l**5RGl*E184l*m04Gl*y00Glz'0D4lzb0GRlzj08GlzH080lzz1F1
lzq1NGlzm56Glzn0GHlsb04Ilsd00Ilss041lsE044lsm44Hlsn0FHl$w0I1lSb10GlSS19HlSg004lSf00JlSq1MGlSw001
lSy00IlDm002lDw001lT'00KlTv0G1lTH004lTx094lTs0I1lTT1C3lTE18KlTf4V9lTm1R2lTh004lTw001lTy08KlZZ0U1
lZy19GlEb4VKlEv00GlEj164lEz004lEs08KlES08GlED004lET044lEE0C0lEf0C0lEq15GlEn1R4lEw0C0lgb0DLlgd1A4
lg*020lgz071lgT054lgf0EKlgm1DKlgw46Hlf'14Klft19Ilfv400lfj440lfH004lfx004lfZ082lfE194lff1VHlfq0PI
lfm182lfw0L1lqb0R0lqv01HlqH5DGlqz001lqs0QJlqS10IlqT1A1lqE1A4lqf19Glqq001lqm1DHlqn0FGlqw001lqy5VG
lk'08Klkv00HlkH004lkd1AHlkz0I1lk$001lkE00Slkk101lkm1I1lkn0GGlky00Glm'1C4lmj091lmH174lmx0A4lmz0Q3
lms1E3lmS052lmT101lmZ3D1lmE1D4lmg100lmq081lmk091lml080lmm151lmw041lmy1DIlh'080lhb1DGlhv14Klhj85G
lhd054lhz014lhs024lhT044lhE00Glhf1DGlhq08Klhm5CGlhn0D0lhh001lhw5VHlwb051lwt041lwv1D1lwj011lwH5D1
lwx101lwd00Glw*061lwz011lws001lwS0V1lwT5F1lwZ101lwE151lwg001lwf001lwq01Hlwk041lwm5V1lwn290lwh081
lww1C0lwy5VIly'040lyt042lyv4B0lyz002lys0OGlyS042lyT1D2lyE042lyg082lyf012lyq552lyl060lyn4F2lyh002
m'j00Cm'd144m'r1MKm's00Km'$004m'q14Gm'l00Sm'n0J4m'w0C1m'y0E4mtt021mtH1D4mtx145mtd001mtr9q1mt$00I
mtE5DCmtk0A1mtl001mtn0N9mth0OKmtw0C1mty002mvv001mvj001mvd001mvE00Lmvl1VBmvn00Jmjj0bHmjH08Kmjd4V9
mjr06Gmjs090mjE1VTmjl0CHmjn0Q1mHt00CmHj024mHH04JmHz004mH$144mHS1j4mHD16SmHT174mHZ020mHq1f4mHk0UK
mHl0VSmHn114mHw1f1mHy006mxj084mxx1D0mxr585mx$080mxD5DNmxT1D5mxq00Gmxn001mxy1D0mdH3x4mdx1Q4mdd5V1
mdr15Hmds001md$15Hmdq001mdl080mdn091mdh084mdy0M0m*j090m*H0CGm*x080m*r0DGm*E084m*q1Y1m*lA4Pm*y072
mr'4DSmrt002mrv01Jmrj04HmrH05Gmrx0DLmrd09Pmr*041mrr5NHmrz121mrs1UHmr$101mrS08HmrD0VGmrT1lHmrE0iS
mrg0FKmrq1jJmrn0V1mrh00Gmry5U2mzj1J1mzH0N4mzr099mzz0RHmzE094mzq0h3mzn091mzw001mzy0T2ms'0C4msH1xK
msx1iCmsd001msr001mss0MGmsT001msg140msk5T3msl101msn001msw171msy1S2m$j001m$H04Gm$r1DHm$$1jHm$T11J
m$Z00Hm$E194m$g014m$q1UHm$l111m$n1H1m$w440m$y5V2mSt001mSH054mSx1i4mSd001mSr1j1mSS1CHmST001mSE1t4
mSl441mDH044mDr091mDD0NHmDg075mDw011mDy0D2mT'004mTH184mTx004mTr4S1mTs002mTT091mTE004mTq080mTl321
mTh004mTw1C1mZZ1M1mZE094mEt004mEj084mEd10KmEr0DGmEz4CKmEs184mES08GmED15GmET1eKmEE001mEq0CCmEk0BC
mEl144mEn0CSmEw0C1mgv024mgd04Kmgr0D4mgs004mgS0CGmgT1j5mgl04Lmgw001mgy084mqt0V9mqr34Hmqs1RHmqT193
mqE104mqq19Hmql1I1mqh00Gmqw001mqy002mkt401mkv0D9mkd001mkr1NHmks0I2mkk191mkl401mkn4DOmkw08Hml'5VS
mlv021mlj94HmlHFFUmlx1hCmld01Hml*10Hmlz1j1mls9jPml$001mlS1iHmlT1FPmlE1a4mlg0Q0mlq5jJmlk1V2mll5jJ
mlh040mlw4D1mn'004mnH5E6mnE1RCmnn1F1mnw0G1mny5F2mhj104mhd5D4mhr4F5mhz004mhS890mhq09Gmhk0zKmhl4j4
mhn16Dmhh00Gmhw149mhy542mw'041mwt4NHmwv0a1mwj081mwr1i1mw$001mwS011mwg001mwq5q1mwl4DHmwm010mwn091
mwh0DHmyv1j2myj002myH5R2myx082myd1S2myr1M2myz5z2mys0D2my$002myT4L2myE1i2myl4VImym010myn0G2myh012
n't004n'v044n'j004n'd004n'r004n'$1G4n'T080n'f00Kn'l004n'm086n'y1M4nb'4V4nbb0D2nbt0D1nbv5G1nbj1C1
nbH466nbx041nb*1V2nbr142nbz0H2nbs052nb$111nbS002nbD052nbT5D3nbE0C7nbg0D7nbq151nbk141nbl5V9nbh5DP
nbw0C1nby040nt'104ntt092ntj5S2ntH082ntx002ntr52Hnts002nt$042ntD041ntE043ntg143ntf1T2ntq143ntk002
ntl5G3ntm100ntn05Qntw4C1nvv0G3nvj402nvr5V3nvT011nvE240nvl5K3nvm102nvw0M1nvy042nj'184njb55Bnjv5P1
njj004njH4T4njx1G4njd4FRnj*0H1njr05Hnjz4VHnjs0DOnj$5G1njE5DMnjf551njl5KHnjm1D1njh184njw5V1nHb1J7
nHt10NnHH003nHd020nHr1J4nHz04SnHs5TSnHS004nHD12EnHT002nHf04OnHq090nHl1DTnHm106nHw1D5nHy1V6nxb54L
nxj406nxx443nx*080nxr0HNnxz004nxs0K5nx$08LnxS14LnxT101nxE18Knxf045nxl191nxm08Hnxw551nd'004ndb15P
ndH3A4ndx0C4ndd0N2ndr4K9nds0QHnd$001ndS44HndE040ndg174ndf052ndq100ndl18Hndm1VGndh504ndw5VHn*x044
n**002n*r1KJn*E004n*l008nz'004nzb0G2nzj001nzH146nzr0D9nzz072nzE5VInzg006nzf45Jnzq0NJnzk001nzl4VI
nzh49Snzw1D1ns'574nsb5U3nsj103nsH00Knsx5I4nsr593nss0D3nsE154nsg154nsf1S3nsq1V1nsk189nsl1K3nsm0BI
nsw001nsy0NIn$'4DCn$b1VGn$j002n$H104n$d4U3n$r5VJn$z0C3n$$003n$S5D3n$T5DJn$E144n$g5E4n$f1DJn$q5CG
n$l153n$m09Gn$w5DGnSb1VJnSt5C2nSH5U4nSr5R1nSS1J3nSE064nSf5V1nSl5T1nSw1U1nDb053nDj45GnDH5F6nDxBM6
nDd192nDr45PnDD4D2nDf14JnDl1UHnDw1D1nDy1C2nTb061nTH1I6nTr001nTs08GnTT003nTE584nTf0DJnTq5VAnTl111
nTw0I1nZr5V1nZf498nZm1T2nEb046nEt5SSnEv144nEj04HnEr05MnEs0K5nE$154nES144nED004nET040nEZ144nEE002
nEf160nEq006nEl1DKnEm0VRnEw001nEy4L4ngb007ngt004ngr0TMngz004ng$184ngS0TKngD4V3ngf00Gngq006ngl04O
ngm0B7ngy062nft0I2nfv003nfj5C3nfH1I4nfx19Hnfd5MGnf*0N1nfr4N3nfz0L2nfs0VPnf$1DJnfS162nfD5D1nfT0SI
nfE554nfg08Knff001nfq5F1nfl1D1nfh45Knfy1J2nqb1FPnqv191nqH1F4nqx104nqd1UHnq*4DHnqr1FHnqz153nqs13H
nq$1F1nqS5T9nqD9V3nqT091nqE544nqf1U1nqq042nql1VHnqm11Inqh54Knqw5DHnqy10Ink'104nkb19Hnkt111nkv1I3
nkH4K6nkx004nkd0VHnkr4VOnkz05Hnks191nk$103nkS113nkZ0DHnkE05Knkf5NHnkl05Jnkh40Mnky00Inmr0DHnms1lI
nm$05HnmS1DHnmT050nmg010nmq051nml0FHnmm003nmh00Gnmw001nmy1D2nh'04Snhb1MLnht002nhj54Snhd4VDnhr54K
nhz1M4nhs10Knh$106nhD5M4nhT004nhf004nhq0GNnhk14Snhl04Gnhm12Mnhw008nhy5LKnw'461nwb5N1nwt001nwj001
nwH4Q1nwx4D0nwd081nwr5F1nwz010nws0D1nw$1R1nwS571nwD051nwT551nwE491nwf051nwq49Hnwk44Gnwl4VHnwm4VG
nwn010nwh09Hnwy5F2ny'052nyb092nyt002nyH092nyr0N2nyS002nyD002nyT102nyE402nyf010nyq080nyk0G2nyl4KI
nyh00Ghbb5D3hbt002hbv001hbj09Ihbd182hb*162hbr14Hhbz002hb$19IhbS1WIhbT0j3hbE446hbg004hbk0W0hbl1DO
hbw0D1ht'08Khtt003htr4V2ht$102htE004htf012htk0h2htl002htm0TIhtn0G2htw021hvv001hvm002hvy022hj'0CK
hjb002hjj5B3hjd0D1hjr1V1hjz020hjs0w2hj$081hjE054hjf0WJhjl1F1hjm1/3hjn55Bhjw1V9hjy00Ghd'05Khdb1DI
hdj492hdd4vJhdrGL3hd$0W0hdg0W4hdf4a3hdk082hdl08Ihdm0zIhdn0/2hdy5V2h*'08Kh*b0F2h**101h*r05Jh*f002
h*l040h*m002h*w001h*y0M2hr'0DKhrb0LHhrt0LJhrj4rJhrd01Ihrr06Jhrz00Ghrs00Hhr$1RJhrS01GhrD011hrT0GI
hrE5DGhrf052hrqGL4hrm0LIhrw0B1hry0B2hz'4CKhzj0DGhzr002hzz191hzE1f4hzf002hzq04Ghzl07Jhzm5f2hzw001
hss003hsE004h$r001h$$51Jh$l150h$m1f2h$w020hSr1eIhSS013hSm002hSw021hDb542hDj010hDD1X1hDl042hDm1iI
hDw020hTr082hTE444hTf002hTl0O2hTw001hft0m2hff102hfk083hfw031hqE1eKhqf00Ghqq001hql080hqm08Ghqy042
hkb001hkd010hkr0CIhkE10Khkk0e1hkl0H0hkm490hkn080hkw020hlb1jIhlt0W2hlj042hld001hlz080hls1l2hlE00G
hlk5zIhll5l1hlm14Ghlw0A0hm'0i4hmt041hmj141hmd05Hhm*001hmr1Y3hmz0W2hms0I2hm$1RJhmS100hmT182hmE1C5
hmg0W4hmq010hmk8e1hml5a3hmm5jBhmy002hn'5DShnb00Ghnj080hnd011hnE40Khng024hnf0V0hnq04Ghnm020hnn042
hw'02Hhwt010hwj0CGhwd0B1hwr1f1hwz010hws09Hhw$0RHhwE09Hhwk0hGhwl7B1hwm090hwn4N1hwh080hwy5tIhy'0RI
hyb1DIhyt010hyv4Q2hyj1V2hyx010hyd012hyr090hys022hy$082hyS002hyD1f2hyT0I2hyE0eIhyg05Ghyf5EIhyq050
hyl0j2hym592hyn002hyh020w'b14Iw'd182w'r452w'S082w'T002w'l462w'm0N2w'y5G2wb'4DSwbx010wbd4CGwbr05I
wb$05GwbS05IwbT04QwbE010wbg002wbq44owbl42Awbh04Kwt'024wtb002wtH0DAwtx042wtd052wtr0V2wtg04Gwtm00G
wtn462wty040wv'04Kwvb0V2wvj448wvr41Awvg002wvf052wvq4Vewvl012wvm06Qwvn442wvy040wj'1D4wjb4VAwjj001
wjH056wjd0SYwj*060wjr1CIwjz4DAwjs0C2wjE0CKwjf442wjl06Pwjm002wjn092wjh1VAwjy0CIwHj04GwHd5DQwHr04m
wH$4DIwHS002wHf05QwHl5EIwHm09mwHn08IwHy4T2wxd002wxz002wx$058wxS040wxD002wxT002wxf552wxm5FQwxn080
wxy4B2wd'09Kwdj032wdH040wdd0QGwdr092wds0D2wdE5VCwdf482wdq44Qwdk01Owdl002wdn1DIwdh442wdy572w*'114
w*H00Gw*r01Iw*E004w*f002w*l080w*m05Gw*n080w*y042wr'4C4wrb03Gwrv0LWwrx4DGwrd4VAwr*002wrs05Iwr$01I
wrS052wrD012wrT4F2wrE0Fywrf052wrqCF2wrk0Rowrm0DWwrn0A0wrh08mwry4Vowz'094wzb042wzr5EIwzE5F6wzg052
wzf0N2wzk040wzm092wzn1NAwzy4M2wsb04Iwsj042wsx5DGwsd0D0wsT0DAwsE5DSwsf090wsq572wsl092wsm1BAwsn4CG
wsy442w$j0P2w$H190w$r502w$z080w$Z0I2w$E4D4w$g4D2w$q1LIw$k078w$l042w$m552w$n080w$y5D2wS'00GwSb0FI
wSd452wSS011wSE004wSf5UAwSl5V2wSm0P2wSy4N2wD'0BCwDH5DIwDx0M2wDr00GwDE5NSwDf042wDm4C2wDn1C2wT'5VS
wTH0G2wTx0G0wTd1D2wTs0G2wT$012wTT001wTf04IwTm00IwTn5F2wTy090wZb0I2wZf4B2wEb442wEv05OwEd1U2wEr4DQ
wEz052wEs062wEZ102wEf002wEq4DYwEk0C2wEl482wEm002wEn090wEy442wgb008wgd02Awgr0DIwgD010wgf042wgl4C2
wgm0SIwgn080wfd4V2wfr5TAwfz4E2wfD442wfq5VWwfl012wfh004wfy4V2wqb042wqt012wqH5TQwqd5D2wq*052wqr5DQ
wqs012wq$0D2wqS0TIwqT412wqZ002wqE5VKwqf5V2wql082wqm0D2wqn0C0wqh54Wwqy192wk'1U0wkb07Iwkt012wkv400
wkH442wkd0D2wkr1D2wkz092wks052wkZ0A2wkE56Swkf4VIwkl1V2wkm00Ywkn082wky442wlb0C2wlt002wlv002wlj1D2
wlH002wlx542wld5T2wl*002wls0M2wlE1DKwlg44swlf0M2wlq002wlm040wln080wlh1Dowly4VYwm'074wmd00Gwmz082
wms042wmD042wmq0QWwmn080wmh00GwnH020wnr010wnk002wnm002wny0LIwhb5M4wht0C2whv082whj0D2whd090whr492
whz092whs0Q2wh$080whS102whT0D2whf042whq0U2whl49Mwhm1Dowhn0FYwhy04Ywyl0P0y's55mybb010ybs17mytm0DQ
ytn052yjr0G0ydE050ydh400ydy07Iyrr00GyrE00Gysr5VQyss002ySS010yEr006yET070yfx004yfE0E4yqZ4DOyqq00G
yqn4CGyqh540yll00Gymm090ymn4VBynx040ynE044yht040yhr400yhm00Gywd010ywm020
`,et=`
'tmt1'qlm3'ksd3'wrb2b'b'3b'dl1b'*n1bv'j8bvbv1bjbj3bHbH3bHtr2bHtn1bHvr3bHvn2bHdl1
bH$l1bHZl1bHls2bHlq1bxbx3bxtr3bxvr3bxdn4bx*E1bxSl2bxDl3bxlS1bxnd8bxnq3b*b*1b*rq1
b*ErAb*qr8b*qT1b*lx1br'lBbrbr3brbs3brbS1brtk1brvT1brjm1brdE4br*E4br*n1brzq2brsm1
br$T1br$q5br$k1br$m1brTs1brTl3brTm7brES2brEm3brgv1brg$9brgl1brqH3brq$7brqT3brqE3
brql1brkE3brmj1brnt8brns3brnq1brhm1brhn3brwz1bzbz1bzEr2bzgr2bzmx1bsbs3bstr1bsml1
b$b$3b$rn1bSbS3bDbD1bTbT3bTrq2bZrm3bEbE1bEvr3bEvq2bE*r1bErS2bEzq3bESS2bEDD2bEkr1
bEns1bEnq4bgbg1bgvr3bgdd2bgzl2bgsl1bqbq1bkbk3bl'z1bl'S1blbl3bltE2blty1bljm1blHm1
blxS2bldH7bldk4bldm1blsm3blSq2blSm1blSy4blTj1blTH3blTm1blEk1blEm1blqE5blqq4blkE1
blmr1blhs1blhS3blhq1blwr3bnbn1bndq1bhbh3bhtr1bhdl1bhrj3bhrs2bhrm3bhSl3bhkn2bhls2
bhlS2bhlq3bhns3bydr1byTr1byqr1byhs2t't'1tbtb1tbrk1tHtH1txtx1trbs1trtr3trjm1trqy1
trms1tEtE3tgtg1tftf1tqtq3tktk1tl'b8tltl1tlfz1tlfn1tlm*3tm'r8tm'l8tmtm1tmhl9tnbl1
tntl1tntn1thth3twbl1twd'1v'v'3v'll3vb'j8vb'r8vbvb1vbjr8vjvj3vHvH1vrbj4vrty4vrvr1
vrdy4vrT'4vrTl1vrTm1vrmd1vrmTDvrml1vTEm2vEvE3vEjr5vErr1vElb3vgvg1vfvq1vfrq2vqvq1
vkvk1vlvl3vlmT1vm'd8vmtl1vmvm3vmEd8vmlT1vnvn1vhvh1vytl1j'bz1j'j'3j'll1jbjb1jv'l8
jvjv3jHjb1jHjH1jHdr3jHdl3jH$$4jHZm1jHfl3jHmZ1jxjx3jxdb1jdwl1j*'r8j*j*1jr'$8jrb*1
jrbz1jrbl2jrby6jrvl1jrvm7jrvy2jrjb1jrjr3jrjm3jrdb1jrdH1jrdl1jrdm1jr*m1jrsm1jr$b1
jr$m5jrEb9jrfx1jrfs1jrmz3jzmr1js'n8j$j$1jEbr1jEbl1jEby3jEvr1jEvm2jEvn2jEjE3jEdr1
jEDr1jEfd1jEfq1jEfl1jEmr1jf'Z8jfjf3jlbb3jljl3jlHb9jlHm9jlxb8jlxd8jlxy4jlT'4jlTy4
jlZ'4jlZy4jlEb8jlEd9jlfT1jlfZ1jlfE4jlfn1jlmd2jlmq1jlhz1jlhq1jlwz1jmjm3jmrk1jmzr1
jmEr1jmEl1jmhr3jnb*1jndr1jndl1jnfs1jhj'1jhjh3jhDm2jhmz1jhwr1jwrb3H'H'1Hb'n8HbjrE
HbHb1Hbrm1HbT'4HbTy4Hbkr3Ht'm8HtHt3Htr$2Htfl1HvHv1Hvrb1Hvrf3Hvyl1HjHj3Hdrj1Hdql1
H*'r8H*fr1H*lq3H*lm3Hrb'4HrbS1HrbZ1Hrbq1Hrby4Hrjl1Hrjm5Hrzq1Hrzm1Hr$f2Hr$m4Hrfz4
Hrf$4HrfS2HrqS1Hrqf1Hrkv1Hrkl1Hrmd1HrmzBHz'l1HzHz2Hzrq1Hzfr1Hzmr1Hsbl1HsHs3Hskk1
Hskl1H$'n8H$H$3H$rj3HSHS3HSrb1HSrm3HDjr1HDrb1HDrm1HTHT1HTmr1HZrb3HZlb1HfHf1HqHq1
Hlbs1HlHl3Hlqf4Hlqm5HmHm3Hmdl1HmTr1HmZl1Hmlj1Hmlq1Hmyr2Hnb$1HnbS1Hnbl3Hnjr1Hnjl3
Hnds2Hn*y1HnTr3HnZl1HnZy3Hnkl1Hwjl1HwHy1HwSl5Hwfz1Hwfl1Hwql3Hwlq1Hwml1HyHy1HyEl1
Hyfs2xb'n8xbtl1xbxb3xbdd4xbdy4xbrE1xbrq1xbEv8xbEl1xtrb1xtrf1xtrm1xtEr1xtEl1xtlE1
xtlm1xvrm1xvEj1xvEm3xvlm1xjxj1xdrE1xdfr1x*rE1x*rf3x*rq1x*Eb1x*El1x*lb1x*lj2x*lm1
xrb$1xrbS1xrbT3xrbq5xrvm1xrxr3xrdl1xr$b1xr$f1xr$m5xrTm5xrfj5xrf$1xrfq5xrql1xrmsC
xrm$1xrmSCxrmq8xrml2xrnf1xrnq1xzbz2xzrb1xzrj1xzrf1xzEl1xzlb1xzlj2x$x$3x$rb1x$rm1
xSxS1xD'l8xDxD3xDrb1xDrE3xDrm3xDEb2xDlb2xDlf1xTxT3xTrf3xfxf1xqxq1xlbs1xlbS3xljn1
xlxl3xmxm1xnbs1xnbS3xnjl1xnxn1xndf1xndq3xndl1xn**2xn*y3xnzj1xnzr1xn$l1xnTv1xnZy3
xnEj1xnEq1xnfr1xnfs1xnkr1xwzl1xwEl1xyEl3d'd'3d'dd1dbdb1dbkl1dblj1djdj3dHby1dHdr3
dHrj3dHqb1dHql1dHlT1dHlq1dHlm3dHmr1dHms1dHml1dxdx3dxdr1dxrS1dxmr1dxms1drb'2drbj1
drbH1drbx1drbs2drbS1drbk3drby3drjb1drjl1drHb1drdb1drdj1drdr3drd$1dr$q1drEb8drE$8
drEf8drg$8drfs1drfq5drfl1drqE5drql1drmj9drms1drmS1drmk1drhm9drw$2d$d$1dEbs1dEvr1
dEdE3dErm1dEsj1dEsr1dEsq1dEkr4dEks3dEkl1dElj1dElq1dEmS1dEmZ1dgbj1dgdg1dgrq1dgfq1
dgmr1dgm$1dgw$1dfTs1dqdq1dkdk3dl'm8dlbH1dldl3dlZy6dlEf8dlgf8dlmz3dlms8dlmS3dlhv1
dlhm8dmHq1dmHl1dmxq1dmdm3dm$q3dmkl1dmlj1dmlH1dmlq1dmlk3dndn1dnf$1dnqr1dnqs1dnq$1
dnqE1dnks1dhbl1dhdr1dhdE1dhdq1dhdm3dhdh3dhdy3dhsm1dh$r1dhf$1dhq$1dhql1dhqn3dhkr2
dhkl1dhkm2dhlq1dhmj1dhms1dhmq1dhnj1dhwr3dwzn1dwql1dwml1dyks1*'*'3*b*b3*H*H1*Hlm3
*Hml1*r*r1*rT'1*rTy1*rEf8*rfq4*rqT1*rml1*E*E3*Elb2*Elf1*EmT1*f*f1*fTs1*l*l2*lEb8
*lgf8*mHl1*m*m1*mlq1r'bl3r'r'1rb'v8rbrb1rtrt1rvEn8rjHn8rjrj3rjEn8rHrH3rdEf8rz'm8
rzrz1rsrs1rsml1r$r$3rSrS1rDrD3rEbl3rEdd3rErE3rgrg1rgld8rf'n8rfrf3rqrq3rkrk3rm'd8
rm'z8rmrm3rmEl8rmgl8rmgn8rmhz8rhbl1rhdn1rhrh3rhsm1rh$$2rhms1rhwk3rhy'3rwdk1rwdn1
z'br1z'bq1z'z'3zb'r8zbtr2zbrj1zbrq1zbzb1zbEr2zbgl8zHzH3zHlfBzHlq3zHmr1zHwl3zxrf3
zxzx1zxwr2zr'm8zrbq1zrdb1zrdm1zrzr3zrfq1zrfn1zrqf5zrql1zrk$1zrnq3zEbq3zEbl1zEzE3
zEfr3zEnf1zgbr1zgdb1zgrd1zgzg3zgfl1zgll1zfzf3zqzq1zqfl1zkzk3zl'm8zlHb2zlHfBzldb1
zlzl3zlEb8zlgb8zlqm1zm't8zm'j8zm'r8zm'k8zmjrBzmxrBzmzr1zmzm3zmlq1zmhr9zmhlAzntr2
znjr1znxr1zndq2znfl1znhr1zhrf1zhzq1zhlj3zhlf1zhlq3zhmj1zhmq1zhml1zhnE3zhwT1zhwk2
zwbr1zwrq2zwzk1zwzy1zwql1zy'n8s's'3sb'r8sbHl1sbHn1sbrt1sbrj1sbrd1sbsb3sbTr8sbgl8
sbkr8sjhr8sHbl1sHtn1sHjl1sHsH2sHTr4sHfr4sHkk4srbx1srbT1srbl3srjn1srdj1srdH1srdq1
srdk3srdy4srsr3srTE1srTl1srTm1srTn3srEf3srqn1srmT2srhj1srhd1srhf1srwl3sEbb2sEsE3
sgbl3sgsg3sftj1sfsT1sfsf3sfsq1sflt1sfnj1sqsq1sqlb1skbj1sksk2slHb8slHd8slsl3slT'4
slTH4slTE4slTn3slEf1slEn1slgb8slgz1slgf1slfE1slqd1slqE5slqy7slhb8slhm8sm'd8sm'l9
smjr1smdr8smrj1smsr1smsm1smEd8smET8smgd8smkr1smlj1smlk1smhj1smhd8smhr9snbx1snbs1
snbk1snbl1snjl1sndr1sndl1snsn1snTl1snfr1shjr1shwk3swjr1swdl1swTr1swnd1syTr3$'$'3
$br*1$brq1$b$b1$H'n8$H$H1$xbT1$x$x1$xSn1$r'b8$rbq1$rjE1$rHfA$r*m2$rsf1$r$r1$rEb1
$rnf1$rnq3$rhf1$ryf1$$ql1$Ty'1$Z$Z1$E'l8$Eb*1$E$E3$ESb1$Ew*1$EwT1$gbr2$grb1$grn1
$gzb3$g$g1$ftr9$f$f3$fSl1$q$q1$qlb1$l$l3$m'z8$mjr1$mxr9$mrj1$mrx1$mr*1$mSr1$mEd8
$mET8$mEl9$mll1$mhd1$mhl8$nbv1$nbl1$ntr1$ndx1$n$n1$nZr1$hbr1$hjb3$wb$1$w$r1$wSl1
$wql1$yTn3$yZm2S'S'3SbSb3Stqr8SHSH1SdSd1Sr'b8SrSr1STqr8SEtr1SErrFSESE3SEfr7SEfq1
SElk3SEnb1Sgbl1Sftt2SfSf1SqEr9Slxd8Slxm8SlSl3SlTH5SlfH1SlqH1SlqE1Slqm1SlmH1SlmE1
Slhb8Slhm8Sm'k8Sm'l8Smxd8SmdH1SmSm1SmEd8Smqr9Smhl8Snbr1SnbE1Sndq1Sndl3Snfr1Shrj1
ShSh1Shmm2Shyn1Swqr1SwqE1SwmE1Swml1Sydl1SyTr2D'D'1DbDb1DjHr9DHDH3DrgT8Drgm3DrfT3
Drhz8DEDE3DgDg1Df'd8DfdE1DkDk3DlfE1Dm'k9DmHl8DmHn8Dmrz1DmDm1DhDb1Dhy'1Dhyl1DwD'1
DwDy1DwkE3Dyzn2DyTn1T'T'3TbTb3TvTv1THrb1THrm1THTH3THlb1THmr1TxTx3Trvv2Trvm1Trxm8
Trds1TrsE1Trsm1Tr$H1Tr$m1TrTb1TrTr1TrT$1Trg$9Trgm8Trfs9Trf$3TrmH1Trm*1Trms9Trm$1
Trhm8Trym3Tryn1TErb1TEsq1Tf'n8TfTf1TqTq1TlHb8TlHn1Tlxm8Tlxn1Tlsm1TlTl1Tlf'4TlfH1
TlmsBTlys2Tm'nBTmHr9Tmrs1Tmsl1TmTm1Tmls1Tnbl1Tnvr3TnTn1Tnfs1Tnf$1Thfl1Thlb1Thls2
Thml2Thyl1Tysl1Tyls2Z'Z'1ZbZb1Ebdd2Eb$m2EbEb3Ebqr1Ebqs2Ebqy4Ebhl1Etrs1Etrf3EtEt3
Etwr2Evjr1EvEv1Evkl3Evlb3Ejrf2Ejrm1EjEj1Ejld2Ejlz1Ejhn2Edrs1EdEd1Edhr1E*fr2E*lj1
E*lq2E*yT1Erbd1Erbn1Ertn1Erjj4Erjn1Erds1Erzm4ErSf1ErTz1ErTs1ErTl1ErEr3Erfz4ErfS1
ErfT4Erqb3Erql3Erks5Erms1ErmD1Erw$3Ezrn2EzEz1Esjr1EsHr1EsTl1EsTm1EsEs3Esqb1Esqf1
Eskr3Eslb1Eslj1E$j*1E$rq1E$nT2ESfr3ESlb1ESlj1ESwd3ED'l8EDbr1ET'l8ETrd1ETET1ETls1
EZ'l8EZEZ3EZlm2Efjj4Efrt2Efrs1EfDj1EfTl1EfEf1Efqs5EflT1Efn$1Eqbl2Eqrb3EqEq1Eqfr7
Eqfz1Ekbs3Ekb$3Ekrd1Ekr$1Ek$b1Elby5Eldy4ElsT1ElTs1ElEl2ElfS1ElfT1Elqm1Elks5Elkk4
Elmn3Elhj1Elhd1Elhs1ElhS1ElhD1Elwd1ElwT2Elwn1EmrT1EmEm1Emls1Emlq1Enbs3Entt1Entr3
Entl1Enjd1Enjr1Endl1En*y1Enzq1En$T3EnSr1EnZl1EnZy1EnEn1Enf$1EnfS2Enqd3Enq$3Enkv2
Enkr1Enk$3Enwn1EhEh1Ewdq1EwEy1Ewlm1Ewmr1Ewhb1Ewhq1Eyvr1Eydn1Eyzr1EyEy1Eyhr3Eyhl1
Eyhm1g'g'1gbgb1gtrf3gvgv1gvlb1gvmr1gdfl1g*rf2g*rm3g*g*3g*mr3grbl1grbn2grdq1grdy4
gr$m4grgr3grq'1grql1grnq1gzgz1gsgs1gsnb1g$bl1g$rm2g$mr3gSlj1gSlq1gD'l8gDgD3gDfr1
gDwr1gT'l8gTrs3gTr$3gTrf3gTgT3gTm$3gTmT3gqgq1glty4glvy4glSm1glgl3glfq1gmjr1gm*r1
gmgm3gnvr3gndr2gydq1gyTl1gyfq1gyhq1f'f'1fbrk1ftrS1ftft3fjEn2fjfj1fHfH1fxfx1fdgm1
fdfd1f*f*1f*lk3frbj5frtx1frtk1frtn1frvd1frjl1frjm4frjn1frds1frzE2frzl1frzn2frsH1
frsx7fr$H3fr$d1fr$T1frSm1frSn1frTH1frTs1frT$1frTm1frEn3frfr1frfT1frqE7frml1frn'1
frnj3frns1frnq2frhd3frwz1fzrq1fzfz1fsft1fsfs1fskl1f$f$1fSfS3fDfD3fTfT1fEfE3fEml1
fqHl1fqfq1fltr1flHs2flsf3flTH3flTs2flfl3flqH3flqT1fnjl1fnxr1fnds1fnd$1fn$x3fn$l1
fn$y1fnfn1fhrs1fhfh1fwl*1fyjs2fyHs2fyHq3fysj2fylq2fylm2fyhr3fyhq2qb'n8qbqb3qtrd1
qvqv1qHvr1qHdm2qH*m3qHzl3qHzm3qHTb1qHTr1qHfz1qHfl1qHlz3qHlf1qdHr8q*Er8q*El8q*q*3
qrbE4qrvE3qrdH5qrds1qrdE1qrzl1qrzm1qrsm1qr$H1qr$E4qr$m1qrSb1qrSE7qrSf6qrSm1qrSn1
qrDb1qrDm1qrTb3qrTs3qrTq3qrTm1qrEb8qrEv2qrEfAqrfS3qrfT5qrfE6qrfl1qrqr1qrqs3qrq$1
qrqS1qrqE1qrqf3qrqm3qrmd1qrmz1qrm$1qrmS3qrmTFqrml1qrns1qrnS1qrny1qzbr1qzqz1qs'n8
qsbr1qsTr1qsqs3qswr1q$ErBq$q$3q$wr1qS'l8qSbl1qSdr1qSEl8qSfl1qSqS3qSml1qDqD3qTrb3
qTrn1qTEr8qTqT3qE'l8qEbl1qEby4qEvr1qEvl2qEdd4qErT1qEsb1qEsr1qEss4qESr4qEDb1qETb1
qETr9qETl1qETn8qEfz7qEqE3qEms1qEmS1qEml1qEns3qEw$3qEwT3qftl1qf$$4qfTl1qfElAqfqf3
qflT1qlHm8qlzm3qlsy3qlEvAqlEd8qlET8qlEf8qlEm8qlfH1qlql3qlmE1qlns3qmjr1qmrS1qmTr9
qmEd8qmET8qmEl1qmqm3qmhd8qnbl1qnvl1qnds1qndl1qnsr3qnTv1qnTr3qnf*2qnf$3qnfE2qnfl1
qhbl1qhqr3qhqE1qhqh1qhmz1qhws3qwzE1qwSr2qwEs2qwEl1qwq'1qwqs3qwqE2qwql1qwlb3k'k'3
k'wd8k'wl8kb'n8kbrt1kbkb3kt'n8ktrm1ktkt3kvkv1kHkH1kdkd3krbj1krbd1krbs3krb$3krbE3
krbl1krtb2krtH3krtE3krtm1krv'3krdH3krds3krdm3krzm1krsE1krsf2krsm1krSm1krDm1krf'3
krfs3krkb3krkr3krks3krm$3krnb1krnv2krnf1krhf8kzEm1kzkz1kzml1k$k$1k$mr1kSkS1kDkD1
kZkZ3kEbr3kEbs1kEb$3kEtr1kEvb2kEvr1kErm1kEsb1kEsm1kEDl1kETl1kEZl1kEkE3kEmr1kEmz2
kEn$2kfkf3kfhr8kl'z8klb$1klvm1klHb1kldd4kldy4klsm1kl$m1klSm1klms1klm$1klmS1klhs1
kmsr1kmEr1kmkm3kmhlBknbt3knb$2knt'1knv'1knvr2knEv1knEr1knf$1knkn1knhf1kh'b8khrb3
khkh3khms1kw'd8kw'l8kwvr2kwd'1kwdn1kwsj3kwEr1kwkb1kwky1kwhdAl'l'3lblb1lvlv3ljlj3
lHlH3lHwj1lxbT3lxlx3l*l*1lzlz2lsls1lSlS1lDlD1lZlZ3lEvm3lEZm1lElE3lEmZ1lg*m2lglg1
lgws1lflf3lqlq3lmlm3lhjm2lh*m3lhzm1lhsm1lhl'2lhlh3lhmj2lhms1lhwj3lhwq3lhyE2lwlb3
m'm'1mtmt1mvmv3mjmj3mHls3mHmH3mHwr3mxrq1mxTr3mxmx3mdrE3mdmd1mdyn3m*'l2m*Hj1m*rq1
m*qrAm*m*1m*hb3mr'y2mrjH3mrjl3mrHb1mrHl3mrxd8mrTl1mrqE2mrkz3mrks2mrmr3mrmg3mrhm3
mzmz3mzhl8msHr2msxr3msTr3mskn2mslm3msmr1msms1m$m$1m$wr3m$yx3mSTk1mSmS3mDHl8mDHn8
mDmD3mTmT3mTwH3mZhr3mEdd2mEzz2mEmE1mgmg3mgnT3mqHs2mqmq3mkmk3mknn1ml'j8mlml3mndl3
mnTq3mnhj1mhjr2mhmz3mhmh3mwDE3mwTn3mykn1n'ml1n'n'3nb*r1nbnb1ntrj1ntnt1nvnv1njnj3
nHnH3nxrb1nxnx3nrfz1nznz1nsns1n$n$3n$wr1nSnS1nDnD3nTnT3nEvl1nEdl1nEZl1nEnE2ngbq2
nfrj1nqrd1nqr$1nqnq1nknk1nmrd3nmnm1nhbl1nhtr1nhrj1nhsr1nh$l1nhms1nhnh2nhhl3nwd'1
nwdl1nwrj1nwrz1nyrb1nyrj1nysb1h'h'1hbrj1hbrs3hbrm3hbqE4hbhb3htlm1htmr1html1htmn1
htht1hvmr1hvhv1hjhj3hdrj1hdkr3hdml1hdhd3h*xr3h*rb1h*rf1h*rm1h*kr2h*lb1hrb*1hrjb1
hrjl1hrdb1hrdl1hr$fBhrTm1hrmz1hrms1hrmT1hrmE8hrml1hrnf1hrhr3hrwz3hrwl1hzbr1hzbl1
hzrq1hzlj1hzmr1hzhz3hshs3h$h$3hShS1hDhD1hTrs2hTl'2hTls3hThT1hfhf3hqhq1hkhk3hlqm1
hlhl3hlws1hlwE1hm'k8hmrj1hmlj1hmlT1hmhm1hnbt1hnbs3hnbS1hnbE1hnbg1hnbl1hntb1hndz1
hnds3hndm3hw'n8hwbr1hwjl1hw*l1hyEr3hykl1hyll1hymn1hynm1w'w'1wHwH3w*w*1wrn$1wrwr1
wzwz1wsws1w$w$3wSwS1wTwT3wEwE1wqwq1wkwk3wlwl3whwh1y'y'1yrn'1yEyE1yhyh1
`,mt=`
H0060BJ3LO1KC06O6KMPBDK846C0KLL11BQPC8CCK010EM3OEQCO0I1IN65G6F82F5N8IJKQ69Q26J4I3KK2OICC836CDKFI
936L80382K2JQ2572L9N1QI6DB0CIJ34D2L3361B5O241901266L03K3FD5MK8ILKK8284QIO1NJ0CJ2O19264FO1HELQFO5
CK00D21QNEN798O87206Q7JLCE3KE908OL8FFLILIKF60L3OQIB10D1B04DJ000L3KP9I03QJ040GKICBJ40LC12431A1QQ0
6PJ88C571BEF7DAO0I9I13CJ97OO0H1F6022Q282HNI0NJ32O0K06O823F0NH1N30LC76N7P3K05BQIJC5IJF00IN1I03EPJ
B2H00K58I4M97297904L4510OIDA9F60E01O2JM19P7K98KND689D06QBJIDFI5FIKKO11AQ0N2HMN8O2M3996I05067I57N
O4NFKK1I0F5054IHLOJ192Q22EKO3AI34I2964CK1D3O2O2IE2QK7ONI7K7D8L2206I829LN6CQEMF9EQI2C408H6G1OPJBJ
5P7DCI84D1DACBO143OHMO0E70O6E0E9K30099D1AOC6CO07I016AM27FODO9QI904020J0A143IPCJDL2C860G0D820262F
86696C6JO21350M2169DAQJQN1363JI31030D60FLDQOK4EE7IBC386HL1HOI9MB6433EKLQP88H9CE68I20483D09I0QH21
00KCF83QP0I85DIQ3AA82AAH7FJ2MMB9KO8QP87M2I2P88038187EJFO8JALI8408IMPJNJO568031AI2O4091LFC6I9EN8I
9QIQO99GNLB21QM31FOH8Q2JLBFF52H2QL47AG1I9N83K0GCB05409068CFGK66OD1QI1AIAPII7FDBQ82GBP35IKIP1L3Q1
3IG2QQD8H2J7276N8O20DPI77KQ860662HO8N8GA965QJIKQB86IOA07GPACB15KN1L7DBNP5I8HQPII414N6PI70MA7NGGA
D16IFI42F8854CQ7IIKBM78OG92F05QIFB632EM731PEDIL5D6POO92A0NB698N6OJI1F5Q7KQIO2Q009B242ECKEM0BMPAC
N0BMNOK6IQFL4940OMPJKIQ55I0CE209BOQ8LN2JP9O99119380IL3MH6DBIO2QK4IQ0I5JMHGGBL0D0KP30J4PE1JCJO1OO
86BICFP69K66JKG9MK87QNC9KHIJI7A09282I14H66KC214M5LQPM2852KL621A92QH2IFE70H0PGON0O2492FAH5KQI49H5
K20H1OLI0OEKF6I6MO5A3L2QO3O6BC0950O02IF7I68HKON0OA3721BKJBC1IF32PB568O400D20HFJF5C1F9HB7K8KN9NOH
0NOI05O1A88I9605HO07O4IMDH4K22K7EN3EDO0KNKJBFAHE9Q31C71G8K08123I5FBIOQ9JIDMF5BMP913FKQI6HI9JOI4I
60P4580P8JHOO63352GO7OIIF96A5FH10MFI4GB02NF5EKCN5LK9L2IIA3I412H21E887KQC3ELFI1232BE0E4K6F2NE7Q64
KOQKQQC2CEIF8030OCQO2J0L82PI6FK0P74OHO8A59NJGKON0O8OQ1H6QH7EQKFK2QQ3HJCI297IQDG66F3OC1PJ93332566
GOLEPP868H8QNL925O2P9Q47PFFON6K8IQIQQF77E2I4F6QKI4D24433OK2OO0Q10N1FAKLLJ3OL10EK0JLJ020O0K241998
BACA3Q77QI96KELD61LC3J4J0CI04DN1ALAG9OCKE062CQO0E097K5Q0OC20LH277IOO9530134A9A030LLI6LL72L71M682
018F05D028Q4O1FJDHCOC0O3AI2F160I90IK02O1G033DEEC21O274II32C2NPC02E964FBOJ07I68C9CMIQ1Q5JFHK4Q6O8
5653PE85H0INLB6Q30NKAC9B3990Q2F44QE2PI21J5400O355054E261JKLKG1NNMFC7E047H9K9EQ029I04MMCQM8GLD900
N02006CEI2NOQ7HHO2EG00010KHHN1K007923O5K2OO0B6HDQNI8PII19708QQOFHQIFFFP9O1D7H782LOJ0OC1BBA05I3I6
DM2NLL01QBHQ6FQ5OI9L07MQCH9537NQ0J1IJ5NB8L12O2MPHFPOQHO4DE5202GQH462P9O30A4B4KLJAF88KPFEDHF82J9G
AJ6ABLJ2621J0472A9O3J26B1KHP7KN9LGCCB6NOKJQKI09HFNQ3FOI6N82O0IC1KK82E7JEL203I5162403Q8KQ08OPMICI
3P0FP6409JM19056IK6JL882K08CO6E4JI1HL09Q2LO8KQ09L2I0IP9QN9J0OHJ8HIC7KJI07K8QOPHMF61NI6F2H26M550K
EPOILA1IN68100E263HA005BM1KKHB550ODP1DACJB2I8A5P7F09419Q70348K0CDDF4AF16OOI25BFEP392PIIBIH012BPO
DG9MPI1EGGCAMJAKO6FF828JFF6AIP8AIJE4120860OD3J9QG6HJ15F06IF0H3A18H1JF5082838HOI5O71F3N3977997N09
F0C29BP2M19O9AC01F09JB09079NGID92L0N68MC0EH8QQM9FIDC0F0B006K96LGPINJBN82Q9I2618IH2L3DDJDJ9JKFCGI
1O71IM280O9D3FG423N2H96L6MK15LEK4A061Q4K1641PQD9QODL9J9KF4H4K3L1J0AEFKMCBBJ4E485E9296D7E0HCF4F8A
OB90HDKO4OCK3F06E0D90H5M4830513F68O2KIM1F77OQN2A2P9C80P9L4I2OKQ7B956N9IOJPIPBEP08O008OBPGIOK1HP5
6F41IE1IHI4PKK6L67FQ2L5NHGKE1G028OOQ0I96O8D219N5L0CB26H0ML6O7564806IL00A798N0K9DD33LI0J17OO04656
II20KN8QAC56FQ5IAN2K542I072Q0300C6G6HONNI6D0C2B1C4Q12JF6Q94OOO0QIJ06H203FC61I24JJPJJ6B9K9OF7LBG0
728IQ67ILK6F000P2N017C02LJOLPFHD2N0O1I40H40J3NC1B6933JLON03C8H7D26NK9NK8L00L296F6I7Q2GP4F0931282
CQN820350JKGQ0343DDO222N2L62O70EBKCQQ8076PFP9OK6N4OQ02QIEKO49399K9781I0QO0QQ205QQB3C4F7585292IJ1
50215222PJL0A242M7912I3FP0988KFD0M95403JJH8QOH06909FKK8D4C2I64M9K8K8H4JFFQ0IJ42H609B01I62203KI4K
DKPNO8PM9IOK187KON63H7IK0031H200FPI9OF06E89K730FN63682IPCM929HH0JF30OF8672H6CFKB3AHB9B80K4I02O11
35J522O6E97ANIJAL6Q2O0421OPAD4LBMH90656CKC7N0IL1E1K6C0A9850F2P0M2PB020A00F0HCGQJ38I0F74720K0LF1K
QK7I0EP64IPJ98I0JE4334D2MBIIN300CNKP3DLK8G3I0IQE8I200401Q0J03I4E8G2P2219CMCQ67KKF8624M2KII9MNNFQ
1I880CO6I82H4Q92IJ5I200701C3QI9G39502Q02FLILOIJH180HOQ2J08F6O82F210OOAQ10F5204QBECN2IJH0192PKO5A
NMK8QP7Q84N3H02A9QH7C47ONC0Q7906400502JH664KO60I8Q8IOPQJC8I66DEII6J05891IQ8ON56H6KHHD0M052IO080I
85KOQ0882KK9982Q8HIQ857Q692IMQICNG82KKDON0O0LBF88F69Q0Q2F8QK6086OQ000I5PI6ON521ON7J0KJP0IJ6IK06C
P0ICFLBBQ78B3C71044J9GILIOO7HI4MO20AKJJ32KI6D0CDBFQM0LBAIPKHHQPJF264I6AG258KHQ9D8KQI1O31IJP0O12L
8C6BI8C2578KHJI01J4DDNO2QQDQFPHDP0H0PQ8HIJFQ2KG1NB8D1AM95Q6000C31HQ0OP0OOPA0EBQ8O18E2QEJMPPOCK0Q
NCF2QQB6K09DFO24PIQ2IM2689NE0QCI490729Q0Q7Q0Q68OI9K009J4FDPFHM098A06O98520O206C8KNQ10O69KIP8KPAI
N1C3KFF796HBQLA35HK00Q016AD65QQQDK31IOII0262K9270F1L30OQ25JJQLMA152403D0IID0N7415ION2C9810LAEADI
P2JKQ04C2IC20J250JCK0EDAKI6152Q0MAP05K41M0F96N08I4C0K3Q004Q82L19JA093L7G8A2Q2LO98F6F2CLE16J51ALF
O2Q2ID0C0962KI19029CFF0O72H005F9E0O34D92IAAKDHQI02AOII19L2IOF74D2HHO7GDFQQHKKHQKCQKF0G91300MJ9FC
695PJ506O24B0F8DOA1C000660JQ6A0IP22L0P4OKC494B09965C6F56Q6FJPIFA00C457L9IC4389OD0870F1D4O8K60D1O
I10IC7E9I0I94040AF8BF200ED593CC3L020991GN41JLNI0L06O15003IMBM2C6632AP17N96H22F8Q055JPKIIIM2952JD
3CDC5J1M94G52EK338JEGCH8IAP9I003E5IGI102HE5OICPOLF8BD188976J988O61I17AKQMFN50JFMKFQI336N886QOQ5Q
K246DKLK5KO2QN6219OH06E6NK6O1I35371EF2MJBKI4OF1DA0Q04260BD1QKI82INEBF8J062J24QNF1I6592K8B4QGI3IB
IQILOHD6F28FIEJKIF96AB80CK69K75B3G99I2282K3908QIPEQGN50JQNNH0H6IAOGJ78NQE9M25CLOI1KH18H1CIN8BQJ0
2NIN2NJHK07GC1DO1HO092OQAHF1FO0IOO5KP0JOQN61BE42PCMCQFNOAFOM1054N962E17OCPFPL0I8H08I33DD4L8IOI5D
KQMIQH7GA9C6L3F7G75968502IAFO83LF16MK01J72L7I90L84892OIK8H0KH1E004QB55O63HO6O0BF6MDK1JCL9A5HFC6M
19IM1KNCN5MJCF0B66JO23C0IGBI1I00J41NI7P1B9HN07I8KDKLG1KHP5039Q1ACI3MIO7E0378395K543IO731948OI7O7
00OCQ9EDKIPHMK4HC08K0J00I0AO37FJQ2OP9F3F03BF13D0Q9P60MKAFP235DB5O60BQ0QCLF0ILO8GO63531K02H3FAE6C
19Q920406138OGC6H5HAO07K0DN8BF6HPIPECQ2QGBD0MF0AE34BH8IEBBJ1MKO87B927C1C7G0GE8GFNJ0J0I52J6KCLKHK
1F7C118030N07A91IIM4I26DEDN2MQ4K4CE358JQJC2O64D9N50D63PE9QDENEGHK63CHCF6C082BND8FDDCKFKKJ42BI305
03N4PQ9I04DL9N0A7Q78I328OL73P7JODDI22I8E22J00NDOAPA9D30E72322IIN7I5M6I3JI4E7B0IHI67OM60OKF0G02C0
633L0GQI374EE01I0HAD98M4PCQ00QK76DIK97QBBDKM7LFKQ47L068Q7GD56MJB14JO7H40P0N240O66E882N98INL0CJOB
7KC7QC86N2I2QF9QI0HNG0IB6J3P6KQN48PGF7I1MA7OKGDMI873OCDH7J9Q2G8E2AD5PK3OB261B0K6JBB204KN3HL20I6D
176C2LGBN940421BLK92O0IN0PPAIQ0B1JAK4JI90II08JIL8NK7EN8OO5ME3CC2MG8HQ72HNJ9MJ68IH4Q7PIKFP0L5FI6J
HG8OM269L72MKC07BK09FQ2FN5KO80M6D212K7I8E2H2LFIPPQHF1058327IL2I13782OO9F62IL2Q80I222N8E070CC75MG
5QHQ8AIO8KCJOEA2B1OQJPFKQ0MPIO2IQP5C612O6OH12KD9QFPN0L3OA0LJL3212I04C2B72Q942CK45644FQ63D0IPO70C
A20Q6C76FQHH7QE54OC329MJP07Q4MGOPL0Q5JG620Q27PMC55N26MNG7BNLBM4OHKOFKHQQQDBQQQ4A22MKD9870HNQPO5H
8J7H80P01BIGPEQCM8GNDDC3L984IDKDPPE43H6I31GA0696P4663IAQOQQ7HQOO20K9P63030992QKH201KGFQOJA8QQ429
NH21993KQQ6579I32QDJE5NJDKBQHMBEH4BFQ88QKG36G3N8BAM4HKN1D8BFE0MBFQIP16LJOMHOLOI66O0K698D0K88F65P
G68Q1BFOQPHQCM00JFQ36O5HMP9L7Q2NKOB4ND8HHG2131ONP7F56PN1E0AE000BLBM7M3E036JO0PF098K531MI36D0A91Q
N4OI6OQK596J02PQD095M4CI4A108M1O93686392N0QIQ2Q809846F1JABKI6Q560603I83ID044DDQ0IQ29384P2AJOA1E4
I7150F366D022019E6B2P008081AIF46F3J927I6140H0FP773N0GB0A909889K7G980K0453377I6970472N10EOMO719D4
8KM97LN8FB009301C1I059M3FJC6824AB600O393JI13HBNQ0BF8AC23GD1C1F164LKF30OOD56GBNIM1HA7I3IF5I10I96J
98I2H3KJPJIDA7EK7AF306DKHO01CFK8971C0PB91GJ9KEO1602D9I7IQL0IN2J067IH0J9HEJ0I0LJLPI03C1Q7OQ2BE017
ICDO5O22KJIJ401F6N20K8I53CQL0C8FLC1INOIQQ8MCLHQ4NC3OI9NMBJCE9HG81PQF929O3KP3OF2O691F840A98QIMBQA
7I307FMF82N0K9ION9QF17Q00MK20QPKEP22B21IJH5H6B565M797I6O6LHJ1B01BEQI30I4I4227KC645E480BE1N0465Q4
I52411F0F856E22OO00591B8O0QI07019
`,lt=`
C9I1KII020990BI301466D56I000IJ23A6F031J90IA09F0O1JC02021940360IB06100JKB62782003J02060F610609200
602LICO3904IHBB0151439I3IJ61000JA3B3M4AIG00I3F2309IID1702L30Q60I66E4022059I600003I00I1101280OC1I
I293J2103016J60I08J1900I000003I41J313ODK00ACO300H6K0DI20H4H980I00946JM92IKLA5DIJNOO0KA9134I16006
61L76260II0026IJ7I40B1439D09N36A0IFI09C100050000G54C02B02O01903D9C0A3M9K6K1J060A0G100320DI0F03A0
22I1407FG0614B20FI400LD00000O3K96I3L023N50000341401009B83079026GKL09K300B0006AOF21000600010F02K6
0310CC933Q622OF200900F60A3A0I39511F14H490890461023JNA090M2IK86IMEM60K0100FQI054I0092053007C57I40
078K003A23084390000C73E9900140E05N0A0303K03ME0HD4L9J45H09033ID6IO33A30BL00FFB0502280I0000100C00Q
0J6K06K200K6I69BI120006093900OK000010000066O431B0FJ0J1D8EF326B33A10063A9A23A0A13LAI6132J2Q23A3J3
B3BKQ5Q8FI06I9EB0KII0I0KJ0I0I00JJ6I10CJ4220508F004300001QK20030
`;var qn=["intransitive","transitive","both"],as={sourceUrl:U1,sourceCommit:X1,sourceDate:Y1,roots:7626,verbs:24188};function ft(r,n,t,s,o){let e=Math.ceil(s.length/6),l=r.replace(/\n/g,""),f=t+e,i=[];for(let a of n.replace(/\n/g,"")){let H=Dn.indexOf(a);i.push(qn[Math.floor(H/9)],qn[Math.floor(H/3)%3],qn[H%3])}let E=0;for(let a=0;a<l.length;a+=f){let H="";for(let y=0;y<t;y++)H+=rt[nt.indexOf(l[a+y])];let w=0;for(let y=t;y<f;y++)w=w<<6|Dn.indexOf(l[a+y]);let S=s.filter((y,F)=>w>>F&1);o.set(H,{wazns:S,marks:i.slice(E,E+S.length)}),E+=S.length}}var or=null;function pn(){return or||(or=new Map,ft(ot,mt,3,tt,or),ft(et,lt,4,st,or)),or}function it(r){var t;let n=(t=B0.get(r))!=null?t:In.get(r);if(!n)throw new A("unknown_wazn","Unknown morphological pattern (\u0648\u0632\u0646 \u0635\u0631\u0641\u064A): "+r);return n}var Sn=null;function Is(){return Sn||(Sn=[...pn().keys()]),Sn}function ws(r){var n,t;return[...(t=(n=pn().get(u0(r).join("")))==null?void 0:n.wazns)!=null?t:[]]}function Ds(r,n){return hn(r,n)!==null}function hn(r,n){let t=it(n),s=pn().get(u0(r).join("")),o=s?s.wazns.indexOf(t.wazn):-1;return o<0?null:s.marks[o]}function qs(r,n){let t=hn(r,n);if(t===null)return null;if(t!=="intransitive")return"pass";let{verbForm:s,vowels:o}=it(n);return pr(s,(o==null?void 0:o.past)==="u"?"\u064F":"")?"nopass":"ipass"}return Dt(Ss);})();
  return Mazini
})()

/* ---------- ёрирасонҳои матн ---------- */

function arbSafeRoot(text) {
  try { return MZ.normalizeRoot(text) } catch { return [] }
}

const ARB_MARKS_RE = /[ً-ٰٟـ]/g

function arbPlain(text) {
  return String(text || '').replace(ARB_MARKS_RE, '')
}

// калиди ҷустуҷӯ: бе ҳаракат, ҳамзаҳо ва алифҳо яксон
function arbKey(text) {
  return arbPlain(text)
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/[ؤئء]/g, 'ء')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, '')
}

const ARB_ALPHABET = 'ءبتثجحخدذرزسشصضطظعغفقكلمنهوي'.split('')

const ARB_WEAK = new Set(['و', 'ي'])

/* ---------- вазнҳо ва тавсифи тоҷикӣ ---------- */

const ARB_FORM_ORDER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'Iq', 'IIq', 'IIIq', 'IVq']

const ARB_ZAID = {
  tg: {
    I: 'ҳарфи зоид надорад (муҷаррад)',
    II: 'такрори ҳарфи миёна (шадда)',
    III: 'алиф баъд аз ҳарфи аввал',
    IV: 'ҳамза (أ) дар аввал',
    V: 'ت дар аввал + такрори ҳарфи миёна',
    VI: 'ت дар аввал + алиф баъд аз ҳарфи аввал',
    VII: 'ا + ن дар аввал',
    VIII: 'ا дар аввал + ت баъд аз ҳарфи аввал',
    IX: 'ا дар аввал + такрори ҳарфи охир',
    X: 'ا + س + ت дар аввал',
    XI: 'ا дар аввал + алиф + такрори ҳарфи охир',
    XII: 'ا дар аввал + و + такрори ҳарфи миёна',
    XIII: 'ا дар аввал + такрори ҳарфи миёна бо вов',
    Iq: 'рубоъӣ муҷаррад (4 ҳарфи асл)',
    IIq: 'ت дар аввал',
    IIIq: 'ا + ن дар аввал',
    IVq: 'ا дар аввал + такрори ҳарфи охир'
  },
  ru: {
    I: 'без добавочных букв (мухаррад)',
    II: 'удвоение второй коренной (шадда)',
    III: 'алиф после первой коренной',
    IV: 'хамза (أ) в начале',
    V: 'ت в начале + удвоение второй коренной',
    VI: 'ت в начале + алиф после первой коренной',
    VII: 'ا + ن в начале',
    VIII: 'ا в начале + ت после первой коренной',
    IX: 'ا в начале + удвоение последней коренной',
    X: 'ا + س + ت в начале',
    XI: 'ا в начале + алиф + удвоение последней',
    XII: 'ا в начале + و + удвоение второй коренной',
    XIII: 'ا в начале + удвоение второй коренной с вав',
    Iq: 'четырёхкоренной мухаррад',
    IIq: 'ت в начале',
    IIIq: 'ا + ن в начале',
    IVq: 'ا в начале + удвоение последней'
  }
}

const ARB_PERSONS = {
  '3ms': { ar: 'هُوَ', tg: 'ӯ (мард)', ru: 'он', g: 'g' },
  '3md': { ar: 'هُمَا', tg: 'онҳо (ду мард)', ru: 'они двое (м)', g: 'g' },
  '3mp': { ar: 'هُمْ', tg: 'онҳо (мардон)', ru: 'они (м)', g: 'g' },
  '3fs': { ar: 'هِيَ', tg: 'ӯ (зан)', ru: 'она', g: 'g' },
  '3fd': { ar: 'هُمَا', tg: 'онҳо (ду зан)', ru: 'они двое (ж)', g: 'g' },
  '3fp': { ar: 'هُنَّ', tg: 'онҳо (занон)', ru: 'они (ж)', g: 'g' },
  '2ms': { ar: 'أَنْتَ', tg: 'ту (мард)', ru: 'ты (м)', g: 'm' },
  '2d': { ar: 'أَنْتُمَا', tg: 'шумо (ду нафар)', ru: 'вы двое', g: 'm' },
  '2mp': { ar: 'أَنْتُمْ', tg: 'шумо (мардон)', ru: 'вы (м)', g: 'm' },
  '2fs': { ar: 'أَنْتِ', tg: 'ту (зан)', ru: 'ты (ж)', g: 'm' },
  '2fp': { ar: 'أَنْتُنَّ', tg: 'шумо (занон)', ru: 'вы (ж)', g: 'm' },
  '1s': { ar: 'أَنَا', tg: 'ман', ru: 'я', g: 'k' },
  '1p': { ar: 'نَحْنُ', tg: 'мо', ru: 'мы', g: 'k' }
}

const ARB_PERSON_ORDER = ['3ms', '3md', '3mp', '3fs', '3fd', '3fp', '2ms', '2d', '2mp', '2fs', '2fp', '1s', '1p']
const ARB_IMP_ORDER = ['2ms', '2d', '2mp', '2fs', '2fp']

const ARB_GROUP_TITLE = {
  tg: { g: 'Ғоиб — ғайбат', m: 'Мухотаб — шахси дуюм', k: 'Мутакаллим — шахси якум' },
  ru: { g: 'Третье лицо (ғоиб)', m: 'Второе лицо (мухотаб)', k: 'Первое лицо (мутакаллим)' }
}

/* ---------- тавсифи навъи реша ---------- */

function arbRootTypes(classification, lang) {
  const text = arbPlain(classification || '')
  const tags = []
  const add = (tg, ru) => tags.push(lang === 'ru' ? ru : tg)
  const sahih = text.includes('صحيح')

  add(sahih ? 'Саҳеҳ (бе ҳарфи иллат)' : 'Муътал (ҳарфи иллат дорад)', sahih ? 'Сильный (без слабых букв)' : 'Слабый (муталь)')
  if (text.includes('سالم')) add('Солим', 'Целый (салим)')
  if (text.includes('مضعف') || text.includes('مضعّف')) add('Музоъаф (ҳарфи 2 ва 3 якхела)', 'Удвоенный (музааф)')
  if (text.includes('مهموز الفاء')) add('Маҳмуз — ҳамза дар ҳарфи аввал', 'Хамзованный — хамза в 1-й коренной')
  if (text.includes('مهموز العين')) add('Маҳмуз — ҳамза дар ҳарфи миёна', 'Хамзованный — хамза во 2-й коренной')
  if (text.includes('مهموز اللام')) add('Маҳмуз — ҳамза дар ҳарфи охир', 'Хамзованный — хамза в 3-й коренной')
  if (text.includes('مثال')) add('Мисол (ҳарфи аввал иллат)', 'Мисаль (1-я коренная слабая)')
  if (text.includes('اجوف') || text.includes('أجوف')) add('Аҷвaф (ҳарфи миёна иллат)', 'Полый (аджваф)')
  if (text.includes('ناقص')) add('Нақис (ҳарфи охир иллат)', 'Недостаточный (накыс)')
  if (text.includes('لفيف مفروق')) add('Лафиф мафрӯқ (ҳарфи 1 ва 3 иллат)', 'Лафиф мафрук (1-я и 3-я слабые)')
  if (text.includes('لفيف مقرون')) add('Лафиф мақрун (ҳарфи 2 ва 3 иллат)', 'Лафиф макрун (2-я и 3-я слабые)')
  if (text.includes('واوي')) add('воӣ (бо вов)', 'вавное')
  if (text.includes('يائي')) add('ёӣ (бо йо)', 'яйное')
  return tags
}

function arbIllaLetters(root) {
  return (root || []).filter(ch => ch === 'و' || ch === 'ي')
}

/* ---------- транслитератсия (ёрирасон) ---------- */

const ARB_TR = {
  'ء': 'ъ', 'أ': 'ъ', 'إ': 'ъ', 'ؤ': 'ъ', 'ئ': 'ъ', 'ب': 'б', 'ت': 'т', 'ث': 'с', 'ج': 'ҷ', 'ح': 'ҳ', 'خ': 'х',
  'د': 'д', 'ذ': 'з', 'ر': 'р', 'ز': 'з', 'س': 'с', 'ش': 'ш', 'ص': 'с', 'ض': 'д', 'ط': 'т', 'ظ': 'з', 'ع': 'ъ',
  'غ': 'ғ', 'ف': 'ф', 'ق': 'қ', 'ك': 'к', 'ل': 'л', 'م': 'м', 'ن': 'н', 'ه': 'ҳ', 'و': 'в', 'ي': 'й'
}

function arbTranslit(text) {
  const src = Array.from(String(text || '').normalize('NFC'))
  const units = []
  for (const ch of src) {
    if (/[ً-ٰٟ]/.test(ch)) {
      const u = units[units.length - 1]
      if (!u) continue
      if (ch === 'ّ') u.sh = true
      else if (ch === 'َ') u.v = 'а'
      else if (ch === 'ُ') u.v = 'у'
      else if (ch === 'ِ') u.v = 'и'
      else if (ch === 'ْ') u.v = '0'
      else if (ch === 'ً') u.tan = 'ан'
      else if (ch === 'ٌ') u.tan = 'ун'
      else if (ch === 'ٍ') u.tan = 'ин'
      else if (ch === 'ٰ') u.long = true
    } else if (ch === ' ') {
      units.push({ c: ' ', v: '', sh: false })
    } else if (ch !== 'ـ') {
      units.push({ c: ch, v: '', sh: false, tan: '', long: false })
    }
  }

  let out = ''
  for (let i = 0; i < units.length; i += 1) {
    const u = units[i]
    const prev = units[i - 1]
    const next = units[i + 1]
    const atStart = !prev || prev.c === ' '

    if (u.c === ' ') { out += ' '; continue }

    if (u.c === 'ا' || u.c === 'ٱ') {
      if (u.v && u.v !== '0') { out += u.v; continue }
      if (prev && (prev.c === 'و' || prev.c === 'ي') && (!prev.v || prev.v === '0') && units[i - 2] && (units[i - 2].v === 'у' || units[i - 2].v === 'и')) continue
      if (prev && prev.v === 'а') { out += 'а'; continue }
      if (prev && (prev.v === 'и' || prev.v === 'у')) continue
      out += atStart ? '' : 'аа'
      continue
    }
    if (u.c === 'آ') { out += 'ъаа'; continue }
    if (u.c === 'ى') { out += prev && prev.tan ? '' : (prev && prev.v === 'а' ? 'а' : 'аа'); continue }
    if (u.c === 'ة') {
      if (u.v || u.tan) out += 'т' + (u.tan ? u.tan : (u.v && u.v !== '0' ? u.v : ''))
      else out += 'ҳ'
      continue
    }

    if ((u.c === 'و' || u.c === 'ي') && (!u.v || u.v === '0') && prev && !u.sh) {
      const longVowel = u.c === 'و' ? 'у' : 'и'
      if (prev.v === longVowel) { out += longVowel; continue }
      if (prev.v === 'а' && (u.v === '0' || !next || !u.v)) {
        out += u.c === 'و' ? 'в' : 'й'
        continue
      }
    }

    const hamza = 'ءأإؤئ'.includes(u.c)
    let letter = ARB_TR[u.c] || u.c
    if (hamza && atStart) letter = ''

    out += letter
    if (u.sh && letter) out += letter
    if (u.v && u.v !== '0') out += u.v
    else if (u.tan) out += u.tan
    else if (!u.v && prev && u.c && next && /[ا]/.test(next.c) === false && false) out += ''
  }

  out = out.replace(/\s+/g, ' ').trim()
  return out ? out.charAt(0).toUpperCase() + out.slice(1) : ''
}

/* ---------- ҷустуҷӯ бо ҳарфи лотинӣ/кириллӣ ---------- */

const ARB_TR_CLASS = {
  'б': 'ب', 'b': 'ب', 'п': 'بف', 'p': 'بف',
  'т': 'تط', 't': 'تط',
  'с': 'سصث', 's': 'سصث', 'ц': 'ص',
  'ҷ': 'ج', 'ж': 'ج', 'j': 'ج', 'ч': 'ج',
  'ҳ': 'هح', 'h': 'هح',
  'х': 'خحه', 'x': 'خ',
  'д': 'دض', 'd': 'دض',
  'з': 'زذظض', 'z': 'زذظض',
  'р': 'ر', 'r': 'ر',
  'ш': 'ش',
  'ғ': 'غ', 'г': 'غج', 'g': 'غج',
  'ф': 'ف', 'f': 'ف',
  'қ': 'ق', 'q': 'ق',
  'к': 'كق', 'k': 'كق',
  'л': 'ل', 'l': 'ل',
  'м': 'م', 'm': 'م',
  'н': 'ن', 'n': 'ن',
  'ъ': 'ءع', "'": 'ءع', 'ʼ': 'ءع', 'ʿ': 'ءع', 'ʾ': 'ءع', '’': 'ءع',
  'й': 'ي', 'y': 'ي',
  'в': 'و', 'w': 'و', 'v': 'و'
}

function arbTranslitTokens(query) {
  let text = String(query || '').toLowerCase().normalize('NFC')
  text = text.replace(/sh/g, 'ш').replace(/kh/g, 'х').replace(/gh/g, 'ғ').replace(/th/g, 'с').replace(/dh/g, 'з')
  const tokens = []
  for (const ch of text) {
    if (ARB_TR_CLASS[ch]) tokens.push(ARB_TR_CLASS[ch])
  }
  return tokens
}

function arbMatchRootByTokens(tokens, root) {
  for (let start = 0; start <= tokens.length; start += 1) {
    let idx = start
    let ok = true
    for (const letter of root) {
      if (idx < tokens.length && tokens[idx].includes(letter)) {
        idx += 1
      } else if (letter === 'و' || letter === 'ي' || letter === 'ء') {
        continue
      } else {
        ok = false
        break
      }
    }
    if (ok && idx > start && start + (tokens.length - idx) <= 3) {
      return start + (tokens.length - idx)
    }
  }
  return -1
}

/* ---------- ҷустуҷӯи арабӣ: номзадҳои реша ---------- */

function arbCandidateRoots(query, rootSet) {
  const letters = Array.from(arbPlain(query)).filter(ch => ch !== ' ')
  const options = letters.map(ch => {
    if (ch === 'ا') return ['و', 'ي']
    if (ch === 'ى') return ['ي', 'و']
    if ('أإآؤئء'.includes(ch) || ch === 'ٱ') return ['ء']
    if (ch === 'ة') return []
    return [ch]
  })

  const found = new Set()
  const n = letters.length
  const tryRoot = parts => {
    const root = parts.join('')
    if (rootSet.has(root)) found.add(root)
  }
  const pick = (count, callback) => {
    const walk = (start, chosen) => {
      if (chosen.length === count) { callback(chosen); return }
      for (let i = start; i < n; i += 1) {
        if (!options[i].length) continue
        walk(i + 1, [...chosen, i])
      }
    }
    walk(0, [])
  }
  const expand = (indexes, base) => {
    const parts = indexes.map(i => options[i])
    const go = (k, acc) => {
      if (k === parts.length) { base(acc); return }
      for (const opt of parts[k]) go(k + 1, [...acc, opt])
    }
    go(0, [])
  }

  if (n <= 14) {
    pick(3, indexes => expand(indexes, tryRoot))
    pick(4, indexes => expand(indexes, tryRoot))
    pick(2, indexes => expand(indexes, parts => {
      const [a, b] = parts
      tryRoot([a, b, b]) // музоъаф
      for (const weak of ['و', 'ي', 'ء']) {
        tryRoot([weak, a, b])
        tryRoot([a, weak, b])
        tryRoot([a, b, weak])
      }
    }))
  }

  return [...found]
}

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



/* ---------- луғат ва тасриф ---------- */

const ARB_BAB_TO_WAZN = {
  'a-u': 'فعَل يفعُل',
  'a-i': 'فعَل يفعِل',
  'a-a': 'فعَل يفعَل',
  'u-u': 'فعُل يفعُل',
  'i-a': 'فعِل يفعَل',
  'i-i': 'فعِل يفعِل'
}

const ARB_FORM_TO_WAZN = {
  2: 'فعّل', 3: 'فاعل', 4: 'أفعل', 5: 'تفعّل', 6: 'تفاعل', 7: 'انفعل', 8: 'افتعل', 9: 'افعلّ', 10: 'استفعل'
}

let arbSeedCache = null
function arbSeedMap() {
  if (arbSeedCache) return arbSeedCache
  const map = new Map()
  ARB_SEED.forEach(([rawRoot, form, bab, masdar, tg, ru]) => {
    const root = arbSafeRoot(rawRoot).join('')
    if (form === 1) {
      const wazn = ARB_BAB_TO_WAZN[bab] || null
      map.set(`${root}|F1`, { tg, ru, masdar: wazn ? masdar : '', wazn })
    } else {
      map.set(`${root}|${ARB_FORM_TO_WAZN[form]}`, { tg, ru, masdar: '', wazn: ARB_FORM_TO_WAZN[form] })
    }
  })
  arbSeedCache = map
  return map
}

function arbSeedFor(root, wazn) {
  const map = arbSeedMap()
  const info = MZ.WAZNS.find(item => item.wazn === wazn)
  if (!info) return null
  if (info.verbForm === 'I') {
    const seed = map.get(`${root}|F1`)
    if (!seed) return null
    return { ...seed, masdar: seed.wazn === wazn ? seed.masdar : '' }
  }
  return map.get(`${root}|${wazn}`) || null
}

let arbRootSetCache = null
function arbRootSet() {
  if (!arbRootSetCache) arbRootSetCache = new Set(MZ.lexiconRoots())
  return arbRootSetCache
}

function arbWaznInfo(wazn) {
  return MZ.WAZNS.find(item => item.wazn === wazn) || null
}

const arbConjCache = new Map()

function arbConjugate(root, wazn) {
  const key = `${root}|${wazn}`
  if (arbConjCache.has(key)) return arbConjCache.get(key)
  let result = null
  try {
    let passive
    try { passive = MZ.lexiconPassive(root, wazn) || undefined } catch { passive = undefined }
    result = MZ.conjugate(root, wazn, passive ? { passive } : {})
  } catch {
    try { result = MZ.conjugate(root, wazn) } catch { result = null }
  }
  arbConjCache.set(key, result)
  return result
}

function arbTransitivity(root, wazn) {
  try { return MZ.transitivity(root, wazn) } catch { return null }
}

function arbSlot(conj, slot) {
  return conj && conj.slots[slot] ? conj.slots[slot] : null
}

function arbFirst(conj, slot) {
  const list = arbSlot(conj, slot)
  return list && list[0] && list[0].form && list[0].form !== '?' ? list[0].form : ''
}

/* ---------- ранг додани қисмҳо: феъл ва фоил (замир) ---------- */

function arbUnits(text) {
  const units = []
  for (const ch of String(text || '')) {
    if (/[ً-ٰٟ]/.test(ch) && units.length) units[units.length - 1] += ch
    else units.push(ch)
  }
  return units
}

const ARB_PAST_SUFFIX = {
  '1s': ['ت'], '2ms': ['ت'], '2fs': ['ت'], '3fs': ['ت'], '2d': ['ت', 'م', 'ا'], '3md': ['ا'], '3fd': ['ت', 'ا'],
  '1p': ['ن', 'ا'], '2mp': ['ت', 'م'], '2fp': ['ت', 'ن'], '3mp': ['و', 'ا'], '3fp': ['ن']
}

function arbNonPastSuffixes(person, mood) {
  const withN = mood === 'ind'
  switch (person) {
    case '2fs': return withN ? [['ي', 'ن']] : [['ي']]
    case '2d': case '3md': case '3fd': return withN ? [['ا', 'ن']] : [['ا']]
    case '2mp': case '3mp': return withN ? [['و', 'ن']] : [['و', 'ا'], ['و']]
    case '2fp': case '3fp': return [['ن']]
    default: return []
  }
}

function arbSplit(form, kind, person, mood) {
  const units = arbUnits(form)
  const base = arbPlain
  const letters = units.map(unit => base(unit))
  let pre = 0
  let suf = 0

  const matchSuffix = candidate => {
    if (candidate.length >= units.length) return 0
    for (let k = 0; k < candidate.length; k += 1) {
      if (letters[units.length - candidate.length + k] !== candidate[k]) return 0
    }
    return candidate.length
  }

  if (kind === 'past') {
    const candidate = ARB_PAST_SUFFIX[person]
    if (candidate) suf = matchSuffix(candidate)
  } else {
    if (kind !== 'imp') pre = 1
    for (const candidate of arbNonPastSuffixes(person, mood)) {
      suf = matchSuffix(candidate)
      if (suf) break
    }
  }

  return {
    pre: units.slice(0, pre).join(''),
    stem: units.slice(pre, units.length - suf).join(''),
    suf: units.slice(units.length - suf).join('')
  }
}

/* ---------- исмҳои қоидавӣ: замон/макон ва тафзил (танҳо шакли I) ---------- */

function arbDerivedNouns(root, wazn, conj) {
  const info = arbWaznInfo(wazn)
  if (!info || !conj) return null

  if (info.verbForm !== 'I') {
    const pp = arbFirst(conj, 'pp')
    return pp ? { zamanMakan: pp, tafdil: '', tafdilFem: '', note: 'mazid' } : null
  }

  if (root.length !== 3) return null
  const [r1, r2, r3] = root
  const A = 'َ', I = 'ِ', U = 'ُ', SK = 'ْ', SH = 'ّ', AN = 'ً'
  const hasHamza = root.includes('ء')
  const type = arbPlain(conj.classification || '')
  const nonpast = info.vowels ? info.vowels.nonpast : 'u'
  const L = ch => (ch === 'ء' ? 'ء' : ch)

  let zamanMakan = ''
  let tafdil = ''
  let tafdilFem = ''

  if (hasHamza || type.includes('لفيف')) return null

  if (type.includes('مضعف')) {
    zamanMakan = 'م' + A + L(r1) + A + L(r2) + SH
    tafdil = 'أ' + A + L(r1) + A + L(r2) + SH
    tafdilFem = L(r1) + U + L(r2) + SH + A + 'ى'
  } else if (type.includes('أجوف') || type.includes('اجوف')) {
    const waw = type.includes('واوي')
    zamanMakan = 'م' + A + L(r1) + (waw ? A + 'ا' : I + 'ي') + L(r3)
    tafdil = 'أ' + A + L(r1) + SK + L(r2) + A + L(r3)
  } else if (type.includes('ناقص')) {
    zamanMakan = 'م' + A + L(r1) + SK + L(r2) + AN + 'ى'
    tafdil = 'أ' + A + L(r1) + SK + L(r2) + A + 'ى'
  } else if (type.includes('مثال')) {
    zamanMakan = 'م' + A + 'و' + SK + L(r2) + I + L(r3)
  } else if (type.includes('سالم')) {
    zamanMakan = 'م' + A + L(r1) + SK + L(r2) + (nonpast === 'i' ? I : A) + L(r3)
    tafdil = 'أ' + A + L(r1) + SK + L(r2) + A + L(r3)
    tafdilFem = L(r1) + U + L(r2) + SK + L(r3) + A + 'ى'
  }

  if (!zamanMakan && !tafdil) return null
  return { zamanMakan, tafdil, tafdilFem, note: 'rule' }
}

/* ---------- ҷустуҷӯ ---------- */

function arbMatchRank(conj, qKey, text) {
  if (!conj) return -1
  const exact = String(text || '').replace(/\s+/g, '').replace(/[أإآٱ]/g, 'ا')
  const hasMarks = ARB_MARKS_RE.test(exact)
  ARB_MARKS_RE.lastIndex = 0
  let best = -1
  const consider = (value, rank) => { if (best < 0 || rank < best) best = rank; void value }

  Object.entries(conj.slots).forEach(([slot, list]) => {
    list.forEach(item => {
      if (!item.form || item.form === '?') return
      if (arbKey(item.form) !== qKey) return
      if (hasMarks && String(item.form).replace(/[أإآٱ]/g, 'ا').replace(/\u0640/g, '') === exact) consider(slot, 0)
      else if (slot === 'past_3ms') consider(slot, 1)
      else if (/^ind_(?!pass)/.test(slot) || ['imp_2ms', 'ap', 'pp', 'vn'].includes(slot)) consider(slot, 2)
      else consider(slot, 3)
    })
  })
  return best
}

function arbWaznOrder(wazn) {
  const info = arbWaznInfo(wazn)
  return info ? ARB_FORM_ORDER.indexOf(info.verbForm) : 99
}

/** Натиҷаи ҷустуҷӯ: рӯйхати { root, wazns:[wazn], rank } */
function arbSearch(query) {
  const text = String(query || '').trim()
  if (!text) return []
  const rootSet = arbRootSet()
  const results = new Map()

  const put = (root, wazn, rank) => {
    const old = results.get(root)
    if (!old) results.set(root, { root, wazns: new Map([[wazn, rank]]), rank })
    else {
      old.wazns.set(wazn, Math.min(old.wazns.get(wazn) ?? 9, rank))
      old.rank = Math.min(old.rank, rank)
    }
  }

  const hasArabic = /[؀-ۿ]/.test(text)

  if (hasArabic) {
    const qKey = arbKey(text)
    const direct = arbSafeRoot(text.replace(/[\s_]+/g, '')).join('')

    // 1) худи реша
    const rootGuess = (() => {
      const compact = qKey.replace(/^ال/, '')
      if (rootSet.has(compact)) return compact
      const alt = arbSafeRoot(compact).join('')
      return rootSet.has(alt) ? alt : ''
    })()
    if (rootGuess) {
      MZ.attestedWazns(rootGuess).forEach(wazn => put(rootGuess, wazn, 1))
    }
    void direct

    // 2) шаклҳои тасрифшуда
    arbCandidateRoots(text, rootSet).forEach(root => {
      let wazns = []
      try { wazns = MZ.attestedWazns(root) } catch { wazns = [] }
      wazns.forEach(wazn => {
        const rank = arbMatchRank(arbConjugate(root, wazn), qKey, text)
        const info = arbWaznInfo(wazn)
        if (rank >= 0) put(root, wazn, rank === 0 ? 0 : rank + 1 + (info && info.verbForm !== 'I' ? 0.5 : 0))
      })
    })

    // 3) калимаи бо ة ё алиф (масалан ضربة، كتابة) — решаи эҳтимолӣ
    if (!results.size) {
      let letters = text.replace(/ة$/, '').replace(/ه$/, '')
      arbCandidateRoots(letters, rootSet).slice(0, 6).forEach(root => {
        MZ.attestedWazns(root).forEach(wazn => put(root, wazn, 6))
      })
    }
  } else {
    const tokens = arbTranslitTokens(text)
    if (tokens.length >= 2) {
      const scored = []
      rootSet.forEach(root => {
        const letters = Array.from(root)
        const score = arbMatchRootByTokens(tokens, letters)
        if (score >= 0) scored.push([root, score + (letters.length === 4 ? 1 : 0)])
      })
      scored.sort((a, b) => a[1] - b[1])
      scored.slice(0, 30).forEach(([root, score]) => {
        MZ.attestedWazns(root).forEach(wazn => put(root, wazn, 4 + score))
      })
    }
  }

  return [...results.values()]
    .map(item => ({
      root: item.root,
      rank: item.rank,
      wazns: [...item.wazns.entries()].sort((a, b) => a[1] - b[1] || arbWaznOrder(a[0]) - arbWaznOrder(b[0])).map(entry => entry[0])
    }))
    .sort((a, b) => a.rank - b.rank || b.wazns.length - a.wazns.length || a.root.localeCompare(b.root, 'ar'))
    .slice(0, 40)
}

/* ---------- тарҷумаи худкор (ar → tg/ru), бо кэши браузер ---------- */

const arbMtPending = new Map()

function arbReadCache(key) {
  try { return window.localStorage.getItem(key) || '' } catch { return '' }
}

function arbWriteCache(key, value) {
  try { window.localStorage.setItem(key, value) } catch { /* ignore */ }
}

async function arbAutoMeaning(text, target) {
  const source = String(text || '').trim()
  if (!source) return ''
  const cacheKey = `arb_mt2_${target}_${source}`
  const cached = arbReadCache(cacheKey)
  if (cached) return cached
  if (arbMtPending.has(cacheKey)) return arbMtPending.get(cacheKey)

  const job = (async () => {
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=${target}&dt=t&q=${encodeURIComponent(source)}`
      )
      if (!response.ok) return ''
      const json = await response.json()
      let value = (json?.[0] || []).map(item => item?.[0] || '').join('').trim()
      value = value.replace(/[.!؟?]+$/g, '')
      if (value) arbWriteCache(cacheKey, value)
      return value
    } catch {
      return ''
    } finally {
      arbMtPending.delete(cacheKey)
    }
  })()

  arbMtPending.set(cacheKey, job)
  return job
}

/* ---------- маълумоти маҳфуз дар content_items (section_slug='__arabic') ---------- */

function buildArabicData(rows) {
  const verbs = new Map() // vk -> { tg, ru, masdar, custom, hidden, rowId, root, wazn }
  const cells = new Map()
  const cellRows = []
  const theoryMap = new Map()

  ARB_THEORY.forEach((item, index) => {
    theoryMap.set(item.id, { ...item, order: index, src: 'seed', rowId: null, hidden: false })
  })

  ;(rows || []).forEach(row => {
    const meta = parseStoredNote(row.source_note).meta || {}

    if (meta.kind === 'verb') {
      const root = String(meta.root || '')
      const wazn = String(meta.wazn || '')
      if (!root || !wazn) return
      const vk = `${root}|${wazn}`
      verbs.set(vk, {
        vk, root, wazn,
        tg: meta.tg || '', ru: meta.ru || '', masdar: meta.masdar || '',
        custom: meta.custom === '1', hidden: meta.hide === '1', rowId: row.id
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
      const value = row.content_text || meta.value || ''
      cells.set(`${meta.vk}|${meta.cell}`, { value, rowId: row.id })
      cellRows.push({ rowId: row.id, vk: meta.vk, cell: meta.cell, value })
    }
  })

  const theory = [...theoryMap.values()].sort((a, b) => a.order - b.order)
  return { verbs, cells, cellRows, theory }
}

function arbVerbInfo(root, wazn, data) {
  const vk = `${root}|${wazn}`
  const stored = data.verbs.get(vk)
  const seed = arbSeedFor(root, wazn)
  return {
    vk,
    root,
    wazn,
    custom: !!(stored && stored.custom),
    hidden: !!(stored && stored.hidden),
    rowId: stored ? stored.rowId : null,
    tg: (stored && stored.tg) || (seed && seed.tg) || '',
    ru: (stored && stored.ru) || (seed && seed.ru) || '',
    masdar: (stored && stored.masdar) || (seed && seed.masdar) || '',
    manual: !!((stored && (stored.tg || stored.ru)) || seed)
  }
}


/* ---------- Назария: бобҳо (админ метавонад таҳрир, илова ва пинҳон кунад) ---------- */

const ARB_THEORY = [
  {
    id: 'kalam',
    title: '١. Тақсими калом — اَلْكَلَامُ',
    titleRu: '١. Деление речи — اَلْكَلَامُ',
    body:
      'Калом (اَلْكَلَامُ) дар забони араб бар се қисм аст: исм, феъл ва ҳарф.\n' +
      '١. اِسْمٌ — исм (ном). Мисол: رَجُلٌ (мард).\n' +
      '٢. فِعْلٌ — феъл (кор). Мисол: ضَرَبَ (зад).\n' +
      '٣. حَرْفٌ — ҳарф (пайвандак/пешоянд). Мисол: مِنْ (аз)، عَنْ (аз/дар бораи).\n' +
      'Ҳар калимаи арабӣ ё исм аст, ё феъл, ё ҳарф; қисми чорум вуҷуд надорад.\n' +
      'Таърифи ҳар қисм дар бобҳои зерин омадааст.',
    bodyRu:
      'Речь (اَلْكَلَامُ) в арабском языке делится на три части: имя, глагол и частицу.\n' +
      '١. اِسْمٌ — имя. Пример: رَجُلٌ (мужчина).\n' +
      '٢. فِعْلٌ — глагол. Пример: ضَرَبَ (ударил).\n' +
      '٣. حَرْفٌ — частица. Пример: مِنْ (из)، عَنْ (о/от).\n' +
      'Каждое арабское слово — либо имя, либо глагол, либо частица; четвёртого вида нет.\n' +
      'Определение каждой части — в следующих главах.'
  },
  {
    id: 'ism',
    title: '٢. Исм — اَلِاسْمُ',
    titleRu: '٢. Имя — اَلِاسْمُ',
    body:
      'Таъриф: исм калимаест, ки маънои мустақил дорад ва бо замон алоқаманд нест.\n' +
      'Мисол: رَجُلٌ (мард)، كِتَابٌ (китоб)، عِلْمٌ (илм).\n' +
      'Аломатҳои исм:\n' +
      '١. хафз (касра) — بِالْكِتَابِ\n' +
      '٢. танвин — كِتَابٌ\n' +
      '٣. дохил шудани اَلْ — اَلْكِتَابُ\n' +
      '٤. дохил шудани ҳарфи ҷарр — فِي الْبَيْتِ\n' +
      'Қисмҳо: مُذَكَّرٌ (мардона) / مُؤَنَّثٌ (занона); مُفْرَدٌ (ягона) / مُثَنَّى (дутоӣ) / جَمْعٌ (ҷамъ); نَكِرَةٌ (номуайян) / مَعْرِفَةٌ (муайян); аз феъл сохта мешавад: مَصْدَرٌ، اِسْمُ فَاعِلٍ، اِسْمُ مَفْعُولٍ.',
    bodyRu:
      'Определение: имя — слово, имеющее самостоятельное значение и не связанное со временем.\n' +
      'Пример: رَجُلٌ (мужчина)، كِتَابٌ (книга)، عِلْمٌ (знание).\n' +
      'Признаки имени:\n' +
      '١. кясра на конце (родительный падеж) — بِالْكِتَابِ\n' +
      '٢. танвин — كِتَابٌ\n' +
      '٣. артикль اَلْ — اَلْكِتَابُ\n' +
      '٤. предлог перед словом — فِي الْبَيْتِ\n' +
      'Виды: мужской / женский род; единственное / двойственное / множественное число; неопределённое / определённое; образуются от глагола: масдар, причастие деятеля, страдательное причастие.'
  },
  {
    id: 'fil',
    title: '٣. Феъл — اَلْفِعْلُ',
    titleRu: '٣. Глагол — اَلْفِعْلُ',
    body:
      'Таъриф: феъл калимаест, ки маънои мустақил дорад ва бо яке аз се замон пайваста аст.\n' +
      'Мисол: ضَرَبَ (зад)، يَضْرِبُ (мезанад)، اِضْرِبْ (бизан).\n' +
      'Аломатҳои феъл:\n' +
      '١. قَدْ — قَدْ ضَرَبَ\n' +
      '٢. سِينُ الِاسْتِقْبَالِ — سَيَضْرِبُ\n' +
      '٣. سَوْفَ — سَوْفَ يَضْرِبُ\n' +
      '٤. تَاءُ التَّأْنِيثِ السَّاكِنَةُ — ضَرَبَتْ\n' +
      'Се замон: ١. اَلْمَاضِي — гузашта (ضَرَبَ)؛ ٢. اَلْمُضَارِعُ — ҳозира/оянда (يَضْرِبُ)؛ ٣. اَلْأَمْرُ — фармон (اِضْرِبْ).\n' +
      'Ҳолат: مَعْلُومٌ (иҷрокунанда маълум) — ضَرَبَ زَيْدٌ؛ مَجْهُولٌ (иҷрокунанда номаълум) — ضُرِبَ زَيْدٌ.',
    bodyRu:
      'Определение: глагол — слово, имеющее самостоятельное значение и связанное с одним из трёх времён.\n' +
      'Пример: ضَرَبَ (ударил)، يَضْرِبُ (бьёт)، اِضْرِبْ (бей).\n' +
      'Признаки глагола:\n' +
      '١. قَدْ — قَدْ ضَرَبَ\n' +
      '٢. частица будущего سَ — سَيَضْرِبُ\n' +
      '٣. سَوْفَ — سَوْفَ يَضْرِبُ\n' +
      '٤. безогласная ташдид-та женского рода — ضَرَبَتْ\n' +
      'Три формы: ١. اَلْمَاضِي — прошедшее (ضَرَبَ)؛ ٢. اَلْمُضَارِعُ — настоящее/будущее (يَضْرِبُ)؛ ٣. اَلْأَمْرُ — повелительное (اِضْرِبْ).\n' +
      'Залог: مَعْلُومٌ (действительный) — ضَرَبَ زَيْدٌ؛ مَجْهُولٌ (страдательный) — ضُرِبَ زَيْدٌ.'
  },
  {
    id: 'harf',
    title: '٤. Ҳарф — اَلْحَرْفُ',
    titleRu: '٤. Частица — اَلْحَرْفُ',
    body:
      'Таъриф: ҳарф калимаест, ки маънои худро танҳо дар пайванд бо калимаи дигар мегирад ва аломати исм ва феълро қабул намекунад.\n' +
      'Мисол: مِنْ (аз)، عَنْ (аз/дар бораи)، فِي (дар)، إِلَى (ба)، عَلَى (бар).\n' +
      'Навъҳои асосӣ:\n' +
      '• حُرُوفُ الْجَرِّ: مِنْ، إِلَى، عَنْ، عَلَى، فِي، بِ، لِ، كَ\n' +
      '• حُرُوفُ الْعَطْفِ: وَ، فَ، ثُمَّ، أَوْ\n' +
      '• حُرُوفُ النَّصْبِ: أَنْ، لَنْ، كَيْ\n' +
      '• حُرُوفُ الْجَزْمِ: لَمْ، لَمَّا، لَا (наҳӣ)\n' +
      '• حُرُوفُ النَّفْيِ: مَا، لَا، لَنْ، لَمْ\n' +
      '• حُرُوفُ الِاسْتِفْهَامِ: هَلْ، أَ\n' +
      '• حُرُوفُ النِّدَاءِ: يَا\n' +
      '• إِنَّ وَأَخَوَاتُهَا: إِنَّ، أَنَّ، كَأَنَّ، لَكِنَّ، لَيْتَ، لَعَلَّ',
    bodyRu:
      'Определение: частица — слово, которое получает смысл лишь в сочетании с другим словом и не принимает признаков имени и глагола.\n' +
      'Пример: مِنْ (из)، عَنْ (о/от)، فِي (в)، إِلَى (к)، عَلَى (на).\n' +
      'Основные виды:\n' +
      '• حُرُوفُ الْجَرِّ (предлоги): مِنْ، إِلَى، عَنْ، عَلَى، فِي، بِ، لِ، كَ\n' +
      '• حُرُوفُ الْعَطْفِ (союзы): وَ، فَ، ثُمَّ، أَوْ\n' +
      '• حُرُوفُ النَّصْبِ: أَنْ، لَنْ، كَيْ\n' +
      '• حُرُوفُ الْجَزْمِ: لَمْ، لَمَّا، لَا (запрет)\n' +
      '• حُرُوفُ النَّفْيِ (отрицание): مَا، لَا، لَنْ، لَمْ\n' +
      '• حُرُوفُ الِاسْتِفْهَامِ (вопрос): هَلْ، أَ\n' +
      '• حُرُوفُ النِّدَاءِ (звательная): يَا\n' +
      '• إِنَّ وَأَخَوَاتُهَا: إِنَّ، أَنَّ، كَأَنَّ، لَكِنَّ، لَيْتَ، لَعَلَّ'
  },
  {
    id: 'types',
    title: '٥. Навъҳои феъл аз рӯи реша',
    titleRu: '٥. Виды глаголов по корню',
    body:
      'Решаи феъл одатан се ҳарф аст: ف ع ل (ҳарфи аввал، миёна، охир).\n' +
      'اَلصَّحِيحُ — саҳеҳ (бе ҳарфи иллат و ا ي):\n' +
      '• سَالِمٌ — солим: كَتَبَ\n' +
      '• مُضَعَّفٌ — музоъаф (ҳарфи 2 ва 3 як хел): مَدَّ\n' +
      '• مَهْمُوزٌ — маҳмуз (ҳамза дорад): أَكَلَ، سَأَلَ، قَرَأَ\n' +
      'اَلْمُعْتَلُّ — муътал (ҳарфи иллат дорад):\n' +
      '• مِثَالٌ — ҳарфи аввал иллат: وَعَدَ\n' +
      '• أَجْوَفُ — ҳарфи миёна иллат: قَالَ، بَاعَ\n' +
      '• نَاقِصٌ — ҳарфи охир иллат: رَمَى، دَعَا\n' +
      '• لَفِيفٌ — ду ҳарфи иллат: مَفْرُوقٌ (1 ва 3): وَقَى؛ مَقْرُونٌ (2 ва 3): طَوَى',
    bodyRu:
      'Корень глагола обычно трёхбуквенный: ف ع ل (первая, вторая, третья коренные).\n' +
      'اَلصَّحِيحُ — сильные (без слабых букв و ا ي):\n' +
      '• سَالِمٌ — целый: كَتَبَ\n' +
      '• مُضَعَّفٌ — удвоенный (2-я и 3-я одинаковы): مَدَّ\n' +
      '• مَهْمُوزٌ — хамзованный: أَكَلَ، سَأَلَ، قَرَأَ\n' +
      'اَلْمُعْتَلُّ — слабые:\n' +
      '• مِثَالٌ — 1-я слабая: وَعَدَ\n' +
      '• أَجْوَفُ — 2-я слабая (полый): قَالَ، بَاعَ\n' +
      '• نَاقِصٌ — 3-я слабая: رَمَى، دَعَا\n' +
      '• لَفِيفٌ — две слабые: مَفْرُوقٌ (1-я и 3-я): وَقَى؛ مَقْرُونٌ (2-я и 3-я): طَوَى'
  },
  {
    id: 'babs',
    title: '٦. Феъли сулосии муҷаррад — шаш боб',
    titleRu: '٦. Простой трёхкоренной глагол — шесть пород',
    body:
      'Феъли сесоҳарфаи муҷаррад (шакли I) шаш боб дорад — аз рӯи ҳаракати ҳарфи миёна дар мозӣ ва музореъ:\n' +
      '١. فَعَلَ – يَفْعُلُ: كَتَبَ – يَكْتُبُ\n' +
      '٢. فَعَلَ – يَفْعِلُ: ضَرَبَ – يَضْرِبُ\n' +
      '٣. فَعَلَ – يَفْعَلُ: فَتَحَ – يَفْتَحُ\n' +
      '٤. فَعِلَ – يَفْعَلُ: عَلِمَ – يَعْلَمُ\n' +
      '٥. فَعُلَ – يَفْعُلُ: كَرُمَ – يَكْرُمُ\n' +
      '٦. فَعِلَ – يَفْعِلُ: حَسِبَ – يَحْسِبُ\n' +
      'Боби феълро аз луғат бояд донист: онро қоида ҳал намекунад.',
    bodyRu:
      'У простого трёхкоренного глагола (форма I) шесть пород — по огласовке второй коренной в прошедшем и настоящем:\n' +
      '١. فَعَلَ – يَفْعُلُ: كَتَبَ – يَكْتُبُ\n' +
      '٢. فَعَلَ – يَفْعِلُ: ضَرَبَ – يَضْرِبُ\n' +
      '٣. فَعَلَ – يَفْعَلُ: فَتَحَ – يَفْتَحُ\n' +
      '٤. فَعِلَ – يَفْعَلُ: عَلِمَ – يَعْلَمُ\n' +
      '٥. فَعُلَ – يَفْعُلُ: كَرُمَ – يَكْرُمُ\n' +
      '٦. فَعِلَ – يَفْعِلُ: حَسِبَ – يَحْسِبُ\n' +
      'Породу глагола нужно знать из словаря: правило её не определяет.'
  },
  {
    id: 'mazid',
    title: '٧. Феълҳои мазид (шаклҳои II–XIII)',
    titleRu: '٧. Производные глаголы (формы II–XIII)',
    body:
      'Мазид — феъле, ки ба решаи худ ҳарфҳои иловагӣ гирифтааст:\n' +
      'Бо як ҳарф: II فَعَّلَ (عَلَّمَ)، III فَاعَلَ (قَاتَلَ)، IV أَفْعَلَ (أَرْسَلَ)\n' +
      'Бо ду ҳарф: V تَفَعَّلَ (تَعَلَّمَ)، VI تَفَاعَلَ (تَقَاتَلَ)، VII اِنْفَعَلَ (اِنْكَسَرَ)، VIII اِفْتَعَلَ (اِجْتَمَعَ)، IX اِفْعَلَّ (اِحْمَرَّ)\n' +
      'Бо се ҳарф: X اِسْتَفْعَلَ (اِسْتَغْفَرَ)، XI اِفْعَالَّ، XII اِفْعَوْعَلَ، XIII اِفْعَوَّلَ\n' +
      'Маънои маъмул: II — таъкид/гузаранда؛ III — ҳамкорӣ؛ IV — гузаранда؛ V — худписанд аз II؛ VI — ҳамдигар؛ VII — худписанд؛ VIII — худписанд/ихтиёр؛ IX — ранг ва айб؛ X — хостан.',
    bodyRu:
      'Производный глагол — это корень с добавочными буквами:\n' +
      'С одной буквой: II فَعَّلَ (عَلَّمَ)، III فَاعَلَ (قَاتَلَ)، IV أَفْعَلَ (أَرْسَلَ)\n' +
      'С двумя буквами: V تَفَعَّلَ (تَعَلَّمَ)، VI تَفَاعَلَ (تَقَاتَلَ)، VII اِنْفَعَلَ (اِنْكَسَرَ)، VIII اِفْتَعَلَ (اِجْتَمَعَ)، IX اِفْعَلَّ (اِحْمَرَّ)\n' +
      'С тремя буквами: X اِسْتَفْعَلَ (اِسْتَغْفَرَ)، XI اِفْعَالَّ، XII اِفْعَوْعَلَ، XIII اِفْعَوَّلَ\n' +
      'Обычные значения: II — усиление/переходность؛ III — взаимодействие؛ IV — переходность؛ V — возвратность к II؛ VI — взаимность؛ VII — страдательность؛ VIII — возвратность؛ IX — цвета и дефекты؛ X — просьба, оценка.'
  },
  {
    id: 'ruba',
    title: '٨. Феъли рубоъӣ (чорҳарфа)',
    titleRu: '٨. Четырёхкоренной глагол',
    body:
      'Феъли рубоъӣ чор ҳарфи асл дорад.\n' +
      'Муҷаррад: فَعْلَلَ — دَحْرَجَ (ғелонд)، تَرْجَمَ (тарҷума кард)\n' +
      'Мазид: تَفَعْلَلَ — تَدَحْرَجَ (ғелид)؛ اِفْعَنْلَلَ — اِحْرَنْجَمَ؛ اِفْعَلَلَّ — اِقْشَعَرَّ',
    bodyRu:
      'Четырёхкоренной глагол имеет четыре коренные буквы.\n' +
      'Мухаррад: فَعْلَلَ — دَحْرَجَ (покатил)، تَرْجَمَ (перевёл)\n' +
      'Производные: تَفَعْلَلَ — تَدَحْرَجَ (покатился)؛ اِفْعَنْلَلَ — اِحْرَنْجَمَ؛ اِفْعَلَلَّ — اِقْشَعَرَّ'
  },
  {
    id: 'voices',
    title: '٩. Маълум ва маҷҳул; лозим ва мутаъаддӣ',
    titleRu: '٩. Действительный и страдательный залог; непереходные и переходные',
    body:
      'مَعْلُومٌ (маълум) — иҷрокунанда маълум: كَتَبَ زَيْدٌ الدَّرْسَ.\n' +
      'مَجْهُولٌ (маҷҳул) — иҷрокунанда зикр намешавад: كُتِبَ الدَّرْسُ.\n' +
      'Сохтан: дар мозӣ ҳарфи аввал замма ва ҳарфи пеш аз охир касра мегирад (كُتِبَ)؛ дар музореъ ҳарфи пеш аз охир фатҳа мегирад (يُكْتَبُ).\n' +
      'لَازِمٌ — феъли гузаранда набуда (ҷалассa)؛ маҷҳули шахсӣ надорад, танҳо бо ҷор ва маҷрур: جُلِسَ فِي الْبَيْتِ.\n' +
      'مُتَعَدٍّ — гузаранда (كَتَبَ الدَّرْسَ) — маҷҳули пурра дорад.',
    bodyRu:
      'مَعْلُومٌ (действительный) — деятель известен: كَتَبَ زَيْدٌ الدَّرْسَ.\n' +
      'مَجْهُولٌ (страдательный) — деятель не называется: كُتِبَ الدَّرْسُ.\n' +
      'Образование: в прошедшем первая коренная получает дамму, предпоследняя — кясру (كُتِبَ)؛ в настоящем предпоследняя получает фатху (يُكْتَبُ).\n' +
      'لَازِمٌ — непереходный глагол؛ личного страдательного залога нет, только безличный с предлогом: جُلِسَ فِي الْبَيْتِ.\n' +
      'مُتَعَدٍّ — переходный (كَتَبَ الدَّرْسَ) — имеет полный страдательный залог.'
  },
  {
    id: 'moods',
    title: '١٠. Музореъ: марфӯъ، мансуб، маҷзум; амр ва наҳӣ',
    titleRu: '١٠. Настоящее: марфуʿ، мансуб، мажзум; повеление и запрет',
    body:
      'اَلْمُضَارِعُ се ҳолат дорад:\n' +
      '١. مَرْفُوعٌ — оддӣ: يَكْتُبُ (менависад)\n' +
      '٢. مَنْصُوبٌ — баъд аз أَنْ، لَنْ، كَيْ: لَنْ يَكْتُبَ\n' +
      '٣. مَجْزُومٌ — баъд аз لَمْ، لَا-и наҳӣ: لَمْ يَكْتُبْ\n' +
      'اَلْأَمْرُ (амр) — аз музореъи мансуби шахси дуюм сохта мешавад: تَكْتُبُ ← اُكْتُبْ.\n' +
      'اَلنَّهْيُ (наҳӣ) — لَا + музореъи маҷзум: لَا تَكْتُبْ.\n' +
      'Феъл дар арабӣ 13 сиға дорад: ғоиб (ӯ، онҳо) — 6؛ мухотаб (ту، шумо) — 5؛ мутакаллим (ман، мо) — 2.',
    bodyRu:
      'اَلْمُضَارِعُ имеет три наклонения:\n' +
      '١. مَرْفُوعٌ — обычное: يَكْتُبُ (пишет)\n' +
      '٢. مَنْصُوبٌ — после أَنْ، لَنْ، كَيْ: لَنْ يَكْتُبَ\n' +
      '٣. مَجْزُومٌ — после لَمْ и لَا запрета: لَمْ يَكْتُبْ\n' +
      'اَلْأَمْرُ (повелительное) — образуется от мансуб/мажзум второго лица: تَكْتُبُ ← اُكْتُبْ.\n' +
      'اَلنَّهْيُ (запрет) — لَا + мажзум: لَا تَكْتُبْ.\n' +
      'У глагола в арабском 13 форм лица: третье (он، они) — 6؛ второе (ты، вы) — 5؛ первое (я، мы) — 2.'
  }
]


/* ---------- матнҳои интерфейс ---------- */

const ARB_T = {
  tg: {
    tabSarf: '🔎 Ҷустуҷӯ ва сарф',
    tabTheory: '📖 Назария',
    tabLessons: '🎬 Дарсҳо ва медиа',
    searchPh: 'Калимаро нависед: ذَهَبَ، ضَرَبَ، أَكَلَ، ضربة... ё Заҳаба',
    search: 'Ҷустуҷӯ',
    clear: 'Тоза',
    hint: 'Ҳар феъл (мозӣ, музореъ, амр, масдар, исми фоил ва ғайра), реша ё транслитератсия (масалан: Заҳаба, qatala) навишта мешавад.',
    results: 'Натиҷаҳо',
    rootWord: 'Реша',
    notFound: 'Дар луғат ёфт нашуд. Агар решаи сеҳарфа ё чорҳарфа бошад, вазнро интихоб кунед:',
    notFoundText: 'Чизе ёфт нашуд. Калимаро бо ҳарфи арабӣ (бо ҳаракат ё бе ҳаракат), реша ё транслитератсия нависед.',
    pickWazn: 'Вазнро интихоб кунед',
    browse: 'Ҳамаи решаҳо (аз рӯи ҳарф)',
    browseHide: 'Пинҳон кардан',
    more: 'Боз нишон додан',
    verbsCount: 'феъл',
    back: 'Ба натиҷаҳо',
    meaning: 'Маъно',
    meaningAuto: 'тарҷумаи худкор — тақрибӣ',
    meaningManual: 'аз луғат',
    meaningNone: 'Маъно ҳанӯз ворид нашудааст',
    translating: 'Тарҷума мешавад...',
    masdar: 'Масдар',
    root: 'Реша',
    kind: 'Навъ',
    triliteral: 'Сулосӣ (3 ҳарф)',
    quadriliteral: 'Рубоъӣ (4 ҳарф)',
    mujarrad: 'муҷаррад',
    mazid: 'мазид',
    wazn: 'Боб / вазн',
    form: 'Шакл',
    rootType: 'Навъи реша',
    illa: 'Ҳарфи иллат',
    illaYes: 'ҳаст',
    illaNo: 'нест',
    zaid: 'Ҳарфи зоид',
    transitivity: 'Гузаранда будан',
    trans: { intransitive: 'лозим (гузаранда не)', transitive: 'мутаъаддӣ (гузаранда)', both: 'ҳам лозим, ҳам мутаъаддӣ' },
    voice: 'Ҳолат',
    active: 'Маълум',
    passive: 'Маҷҳул',
    past: 'Мозӣ',
    present: 'Музореъ',
    amr: 'Амр',
    nahy: 'Наҳӣ',
    names: 'Исмҳо',
    ind: 'Марфӯъ',
    sub: 'Мансуб',
    juss: 'Маҷзум',
    noPassive: 'Барои ин феъл шакли маҷҳул истифода намешавад.',
    passiveImpersonal: 'Феъли лозим: маҷҳули шахсӣ надорад, танҳо шакли беязамонӣ (ғоиб, мардона) бо ҷор ва маҷрур меояд.',
    legend: 'Рангҳо:',
    legendFa: 'фоил (замир / аломати шахс)',
    legendVerb: 'решаи феъл',
    nounsTitle: 'Исмҳои аз феъл сохташуда',
    fail: 'Исми фоил',
    mafool: 'Исми мафъул',
    masdarName: 'Масдар',
    ap1: 'Исми фоил (шакли дигар)',
    ap2: 'Исми фоил (шакли дигар)',
    ap3: 'Исми фоил (шакли дигар)',
    apcd: 'Сифат: ранг ва айб (أَفْعَل)',
    apan: 'Сифат (فَعْلَان)',
    pp2: 'Исми мафъул (шакли дигар)',
    vn2: 'Масдар (шакли дигар)',
    unknownSlot: 'аз луғат муайян нашудааст — админ метавонад ворид кунад',
    maybe: 'шакли эҳтимолӣ',
    zamanMakan: 'Исми замон ва макон',
    tafdil: 'Исми тафзил',
    tafdilFem: 'Тафзили занона',
    ruleNote: 'Ин исмҳо бо қоидаи грамматикӣ сохта шудаанд; на ҳар феъл онҳоро истифода мебарад. Админ метавонад ислоҳ кунад.',
    saveVerb: '💾 Ба луғат илова кардан',
    editVerb: '✏️ Таҳрири маъно ва масдар',
    hideVerb: '🙈 Пинҳон кардан',
    adminHint: 'Админ: ҳар шаклро пахш карда ислоҳ кунед.',
    save: 'Захира',
    cancel: 'Бекор',
    reset: '↺ Бозгашт',
    edited: 'ислоҳшуда',
    footer: 'Муҳаррики сарф: mazini (MIT). Луғат: «جداول إحصاء الأفعال العربية» (CC BY 4.0).',
    tr: 'Транслитератсия тақрибӣ аст.',
    persons: 'сиға',
    tgLabel: 'Маъно (тоҷикӣ)',
    ruLabel: 'Маъно (русӣ)',
    masdarLabel: 'Масдар (бо ҳаракат)',
    adm: {
      title: 'Забони арабӣ — идоракунӣ',
      verbs: 'Феълҳо',
      theory: 'Назария',
      cells: 'Ислоҳҳои шаклҳо',
      root: 'Реша (3 ё 4 ҳарф, масалан: ك ت ب)',
      wazn: 'Вазн (боб)',
      masdar: 'Масдар (бо ҳаракат)',
      tg: 'Маъно (тоҷикӣ)',
      ru: 'Маъно (русӣ)',
      add: 'Феъли нав илова кардан ё маънои феълро ислоҳ кардан',
      saveBtn: 'Захира',
      hide: 'Пинҳон',
      restore: 'Баргардонидан',
      del: 'Ҳазф',
      edit: 'Таҳрир',
      hidden: 'пинҳон',
      custom: 'иловагӣ',
      filter: 'Ҷустуҷӯ...',
      invalidRoot: 'Решаи 3 ё 4-ҳарфа ворид кунед.',
      cannot: 'Ин реша бо ин вазн сохта намешавад.',
      saved: 'Захира шуд.',
      deleted: 'Ҳазф шуд.',
      tTitle: 'Сарлавҳа (тоҷикӣ)',
      tBody: 'Матн (тоҷикӣ)',
      tTitleRu: 'Сарлавҳа (русӣ)',
      tBodyRu: 'Матн (русӣ)',
      addTheory: 'Боби нав / таҳрири боб',
      noCells: 'Ислоҳи шакл нест.',
      storedTitle: 'Феълҳои ислоҳшуда ва иловашуда',
      none: 'Ҳоло чизе нест.',
      mediaHint: 'Видео, аудио ва бобҳои иловагиро аз ҷадвалҳои «Мавод» ва «Бобҳо»-и панел илова кунед: бахши «Забони арабӣ»-ро интихоб кунед; онҳо дар ҷадвали «Дарсҳо ва медиа» пайдо мешаванд.'
    }
  },
  ru: {
    tabSarf: '🔎 Поиск и сарф',
    tabTheory: '📖 Теория',
    tabLessons: '🎬 Уроки и медиа',
    searchPh: 'Введите слово: ذَهَبَ، ضَرَبَ، أَكَلَ، ضربة... или Захаба',
    search: 'Поиск',
    clear: 'Очистить',
    hint: 'Можно искать любую форму глагола (прошедшее, настоящее, повелительное, масдар, причастие), корень или транслитерацию (например: Захаба, qatala).',
    results: 'Результаты',
    rootWord: 'Корень',
    notFound: 'В словаре не найдено. Если это трёх- или четырёхбуквенный корень, выберите породу:',
    notFoundText: 'Ничего не найдено. Введите слово арабскими буквами (с огласовками или без), корень или транслитерацию.',
    pickWazn: 'Выберите породу',
    browse: 'Все корни (по буквам)',
    browseHide: 'Скрыть',
    more: 'Показать ещё',
    verbsCount: 'глаголов',
    back: 'К результатам',
    meaning: 'Значение',
    meaningAuto: 'автоперевод — приблизительно',
    meaningManual: 'из словаря',
    meaningNone: 'Значение ещё не добавлено',
    translating: 'Переводится...',
    masdar: 'Масдар',
    root: 'Корень',
    kind: 'Вид',
    triliteral: 'Трёхкоренной',
    quadriliteral: 'Четырёхкоренной',
    mujarrad: 'мухаррад',
    mazid: 'мазид',
    wazn: 'Порода / вазн',
    form: 'Форма',
    rootType: 'Тип корня',
    illa: 'Слабые буквы',
    illaYes: 'есть',
    illaNo: 'нет',
    zaid: 'Добавочные буквы',
    transitivity: 'Переходность',
    trans: { intransitive: 'лазим (непереходный)', transitive: 'мутааддин (переходный)', both: 'и лазим, и мутааддин' },
    voice: 'Залог',
    active: 'Действительный',
    passive: 'Страдательный',
    past: 'Прошедшее',
    present: 'Настоящее',
    amr: 'Повелит.',
    nahy: 'Запрет',
    names: 'Имена',
    ind: 'Марфуʿ',
    sub: 'Мансуб',
    juss: 'Мажзум',
    noPassive: 'У этого глагола нет страдательного залога.',
    passiveImpersonal: 'Непереходный глагол: личного страдательного залога нет, только безличная форма (3 л. м. р.) с предлогом.',
    legend: 'Цвета:',
    legendFa: 'деятель (местоимение / признак лица)',
    legendVerb: 'основа глагола',
    nounsTitle: 'Имена от глагола',
    fail: 'Причастие деятеля',
    mafool: 'Страдательное причастие',
    masdarName: 'Масдар',
    ap1: 'Причастие деятеля (другая форма)',
    ap2: 'Причастие деятеля (другая форма)',
    ap3: 'Причастие деятеля (другая форма)',
    apcd: 'Прилагательное цвета/дефекта (أَفْعَل)',
    apan: 'Прилагательное (فَعْلَان)',
    pp2: 'Страдат. причастие (другая форма)',
    vn2: 'Масдар (другая форма)',
    unknownSlot: 'по словарю не определено — админ может ввести',
    zamanMakan: 'Имя места и времени',
    tafdil: 'Элатив (исм тафдиль)',
    tafdilFem: 'Элатив жен. р.',
    ruleNote: 'Эти формы построены по правилу; не у каждого глагола они есть. Админ может исправить.',
    saveVerb: '💾 Добавить в словарь',
    editVerb: '✏️ Изменить значение и масдар',
    hideVerb: '🙈 Скрыть',
    adminHint: 'Админ: нажмите на форму, чтобы исправить.',
    save: 'Сохранить',
    cancel: 'Отмена',
    reset: '↺ Сбросить',
    edited: 'исправлено',
    footer: 'Движок сарфа: mazini (MIT). Словарь: «جداول إحصاء الأفعال العربية» (CC BY 4.0).',
    tr: 'Транслитерация приблизительная.',
    persons: 'форм',
    tgLabel: 'Значение (таджикский)',
    ruLabel: 'Значение (русский)',
    masdarLabel: 'Масдар (с огласовками)',
    adm: {
      title: 'Арабский язык — управление',
      verbs: 'Глаголы',
      theory: 'Теория',
      cells: 'Исправления форм',
      root: 'Корень (3 или 4 буквы, например: ك ت ب)',
      wazn: 'Порода (вазн)',
      masdar: 'Масдар (с огласовками)',
      tg: 'Значение (таджикский)',
      ru: 'Значение (русский)',
      add: 'Добавить новый глагол или исправить значение',
      saveBtn: 'Сохранить',
      hide: 'Скрыть',
      restore: 'Вернуть',
      del: 'Удалить',
      edit: 'Изменить',
      hidden: 'скрыт',
      custom: 'добавлен',
      filter: 'Поиск...',
      invalidRoot: 'Введите корень из 3 или 4 букв.',
      cannot: 'Этот корень с этой породой не строится.',
      saved: 'Сохранено.',
      deleted: 'Удалено.',
      tTitle: 'Заголовок (таджикский)',
      tBody: 'Текст (таджикский)',
      tTitleRu: 'Заголовок (русский)',
      tBodyRu: 'Текст (русский)',
      addTheory: 'Новая глава / изменить главу',
      noCells: 'Исправлений форм нет.',
      storedTitle: 'Исправленные и добавленные глаголы',
      none: 'Пока ничего нет.',
      mediaHint: 'Видео, аудио и дополнительные главы добавляйте во вкладках «Материалы» и «Главы» панели: выберите раздел «Арабский язык»; они появятся во вкладке «Уроки и медиа».'
    }
  }
}

/* ---------- қисми оммавӣ ---------- */

function arbSlotKey(kind, voice, mood, person) {
  if (kind === 'past') return `${voice === 'pas' ? 'past_pass' : 'past'}_${person}`
  if (kind === 'imp') return `imp_${person}`
  return `${voice === 'pas' ? `${mood}_pass` : mood}_${person}`
}

function ArabicSection({ rows, lang, admin, db, notify, reload, lessons }) {
  const tt = ARB_T[lang] || ARB_T.tg
  const [tab, setTab] = useState('sarf')
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [hits, setHits] = useState(null)
  const [current, setCurrent] = useState(null)
  const [voice, setVoice] = useState('act')
  const [tense, setTense] = useState('past')
  const [mood, setMood] = useState('ind')
  const [editing, setEditing] = useState(null)
  const [editText, setEditText] = useState('')
  const [busy, setBusy] = useState(false)
  const [letter, setLetter] = useState('')
  const [letterLimit, setLetterLimit] = useState(120)
  const [showBrowse, setShowBrowse] = useState(false)
  const [metaEdit, setMetaEdit] = useState(null)
  const [mtTick, setMtTick] = useState(0)

  const data = useMemo(() => buildArabicData(rows), [rows])

  const infoOf = useCallback((root, wazn) => arbVerbInfo(root, wazn, data), [data])

  const meaningOf = useCallback((root, wazn) => {
    const info = infoOf(root, wazn)
    const manual = lang === 'ru' ? (info.ru || info.tg) : (info.tg || info.ru)
    if (manual) return { text: manual, auto: false }
    const conj = arbConjugate(root, wazn)
    const lemma = conj ? arbFirst(conj, 'past_3ms') : ''
    if (!lemma) return { text: '', auto: true }
    const cached = arbReadCache(`arb_mt2_${lang === 'ru' ? 'ru' : 'tg'}_${lemma}`)
    return { text: cached, auto: true, lemma }
  }, [infoOf, lang, mtTick]) // eslint-disable-line react-hooks/exhaustive-deps

  // тарҷумаи худкор барои феълҳои намоён
  useEffect(() => {
    let cancelled = false
    const want = []
    if (current) want.push([current.root, current.wazn])
    else if (hits) hits.slice(0, 4).forEach(hit => hit.wazns.slice(0, 3).forEach(w => want.push([hit.root, w])))

    ;(async () => {
      for (const [root, wazn] of want) {
        if (cancelled) return
        const m = meaningOf(root, wazn)
        if (m.auto && !m.text && m.lemma) {
          const target = lang === 'ru' ? 'ru' : 'tg'
          const value = await arbAutoMeaning(m.lemma, target)
          if (value && !cancelled) setMtTick(v => v + 1)
        }
      }
    })()

    return () => { cancelled = true }
  }, [current, hits, lang]) // eslint-disable-line react-hooks/exhaustive-deps

  const conj = useMemo(() => (current ? arbConjugate(current.root, current.wazn) : null), [current])
  const verbInfo = current ? infoOf(current.root, current.wazn) : null
  const waznInfo = current ? arbWaznInfo(current.wazn) : null

  const cellOverride = slot => (current ? data.cells.get(`${current.root}|${current.wazn}|${slot}`) : null)

  const runSearch = event => {
    if (event) event.preventDefault()
    const text = query.trim()
    setSubmitted(text)
    setCurrent(null)
    setEditing(null)
    setHits(text ? arbSearch(text) : null)
  }

  const clearSearch = () => {
    setQuery('')
    setSubmitted('')
    setHits(null)
    setCurrent(null)
  }

  const openVerb = (root, wazn) => {
    setCurrent({ root, wazn })
    setVoice('act')
    setTense('past')
    setMood('ind')
    setEditing(null)
    setMetaEdit(null)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openRoot = root => {
    setHits([{ root, rank: 1, wazns: MZ.attestedWazns(root).sort((a, b) => arbWaznOrder(a) - arbWaznOrder(b)) }])
    setSubmitted(root)
    setQuery(root)
    setCurrent(null)
    setShowBrowse(false)
  }

  /* ---- ҳуҷайраҳо ---- */

  const formsOf = slot => {
    const override = cellOverride(slot)
    if (override && override.value) return [{ form: override.value, edited: true }]
    const list = arbSlot(conj, slot)
    if (!list) return []
    return list.map(item => ({ form: item.form, uncertain: item.form === '?' }))
  }

  const nahyFormsOf = person => {
    const slot = `nahy_${person}`
    const override = cellOverride(slot)
    if (override && override.value) return [{ form: override.value, edited: true }]
    const list = arbSlot(conj, `juss_${person}`) || []
    return list.map(item => ({ form: `لَا ${item.form}`, base: item.form }))
  }

  const startEdit = (slot, value) => {
    if (!admin) return
    setEditing(slot)
    setEditText(value)
  }

  const saveCell = async (slot, original) => {
    if (!db || !admin || busy || !current) return
    setBusy(true)
    try {
      const old = cellOverride(slot)
      const text = String(editText || '').trim()
      if (!text || text === original) {
        if (old) await db.from('content_items').delete().eq('id', old.rowId)
      } else {
        const payload = {
          section_slug: '__arabic',
          title: `${current.root} ${slot}`,
          content_text: text,
          source_note: makeStoredNote('', { kind: 'cell', vk: `${current.root}|${current.wazn}`, cell: slot, value: text }),
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

  const resetCell = async slot => {
    const old = cellOverride(slot)
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

  const verbPayload = (values, hide) => ({
    section_slug: '__arabic',
    title: values.root,
    content_text: clean(values.tg),
    source_note: makeStoredNote('', {
      kind: 'verb',
      root: values.root,
      wazn: values.wazn,
      tg: clean(values.tg),
      ru: clean(values.ru),
      masdar: clean(values.masdar),
      custom: values.custom ? '1' : '',
      hide: hide ? '1' : ''
    }),
    is_published: true,
    updated_at: new Date().toISOString()
  })

  const saveVerbMeta = async (hide = false) => {
    if (!db || !admin || !current || busy) return
    setBusy(true)
    try {
      const values = metaEdit || { tg: verbInfo.tg, ru: verbInfo.ru, masdar: verbInfo.masdar }
      const attested = (() => { try { return MZ.isAttested(current.root, current.wazn) } catch { return false } })()
      const payload = verbPayload({ root: current.root, wazn: current.wazn, ...values, custom: !attested }, hide)
      const result = verbInfo.rowId
        ? await db.from('content_items').update(payload).eq('id', verbInfo.rowId)
        : await db.from('content_items').insert(payload)
      if (result.error) throw result.error
      setMetaEdit(null)
      notify(ARB_T.tg.adm.saved)
      await reload()
      if (hide) setCurrent(null)
    } catch (error) {
      notify(error.message || 'Хато', 'error')
    } finally {
      setBusy(false)
    }
  }

  /* ---- намоиши ҷадвал ---- */

  const renderForm = (item, kind, person, moodName, slot, key) => {
    const isEditing = editing === slot && key === 0
    const plain = item.form
    if (isEditing) {
      return (
        <div className="arb-edit" key={key}>
          <input dir="rtl" className="arb-input" value={editText} onChange={event => setEditText(event.target.value)} autoFocus />
          <div className="arb-edit-actions">
            <button type="button" className="primary-button" disabled={busy} onClick={() => saveCell(slot, item.edited ? '' : plain)}>{tt.save}</button>
            <button type="button" className="secondary-button" onClick={() => setEditing(null)}>{tt.cancel}</button>
            {cellOverride(slot) && <button type="button" className="secondary-button" disabled={busy} onClick={() => resetCell(slot)}>{tt.reset}</button>}
          </div>
        </div>
      )
    }

    if (item.uncertain) {
      return (
        <button type="button" className={`arb-cell arb-unknown${admin ? ' is-editable' : ''}`} key={key} onClick={() => startEdit(slot, '')}>
          —<small>{tt.unknownSlot}</small>
        </button>
      )
    }

    let pieces
    if (item.edited) {
      pieces = <span className="arb-vb">{plain}</span>
    } else if (kind === 'nahy') {
      const split = arbSplit(item.base, 'imp', person, 'juss')
      pieces = (
        <>
          <span className="arb-part">لَا </span>
          <span className="arb-fa">{split.pre}</span>
          <span className="arb-vb">{split.stem}</span>
          <span className="arb-fa">{split.suf}</span>
        </>
      )
    } else {
      const split = arbSplit(plain, kind, person, moodName)
      pieces = (
        <>
          <span className="arb-fa">{split.pre}</span>
          <span className="arb-vb">{split.stem}</span>
          <span className="arb-fa">{split.suf}</span>
        </>
      )
    }

    return (
      <button
        type="button"
        key={key}
        className={`arb-cell${item.edited ? ' is-edited' : ''}${admin ? ' is-editable' : ''}`}
        onClick={() => startEdit(slot, plain)}
      >
        <span className="arb-word" dir="rtl">{pieces}</span>
        <span className="arb-tr">{arbTranslit(plain)}</span>
      </button>
    )
  }

  const renderPersonRows = (order, kind, moodName) => {
    const groups = []
    order.forEach(person => {
      const info = ARB_PERSONS[person]
      let slot
      let list
      if (kind === 'nahy') {
        slot = `nahy_${person}`
        list = nahyFormsOf(person)
      } else {
        slot = arbSlotKey(kind, voice, moodName, person)
        list = formsOf(slot)
      }
      if (!list.length) return
      const last = groups[groups.length - 1]
      if (!last || last.g !== info.g) groups.push({ g: info.g, rows: [] })
      groups[groups.length - 1].rows.push({ person, info, slot, list })
    })

    return groups.map(group => (
      <div key={group.g}>
        {kind !== 'imp' && kind !== 'nahy' && <h4 className="arb-group">{ARB_GROUP_TITLE[lang === 'ru' ? 'ru' : 'tg'][group.g]}</h4>}
        <div className="arb-table">
          {group.rows.map(row => (
            <div className="arb-row" key={row.slot}>
              <div className="arb-person">
                <span className="arb-person-ar" dir="rtl">{row.info.ar}</span>
                <span className="arb-person-tr">{lang === 'ru' ? row.info.ru : row.info.tg}</span>
              </div>
              <div className="arb-forms">
                {row.list.map((item, index) => renderForm(item, kind, row.person, moodName, row.slot, index))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ))
  }

  const hasPassive = !!(conj && conj.hasPassive)
  const impersonal = !!(conj && conj.passive === 'ipass')

  const renderTable = () => {
    if (!conj) return <p className="arb-note">—</p>

    if (tense === 'past') {
      if (voice === 'pas' && !hasPassive) return <p className="arb-note">{tt.noPassive}</p>
      return (
        <>
          {voice === 'pas' && impersonal && <p className="arb-note">{tt.passiveImpersonal}</p>}
          {renderPersonRows(ARB_PERSON_ORDER, 'past')}
        </>
      )
    }

    if (tense === 'present') {
      if (voice === 'pas' && !hasPassive) return <p className="arb-note">{tt.noPassive}</p>
      return (
        <>
          {voice === 'pas' && impersonal && <p className="arb-note">{tt.passiveImpersonal}</p>}
          {renderPersonRows(ARB_PERSON_ORDER, mood, mood)}
        </>
      )
    }

    if (tense === 'amr') return renderPersonRows(ARB_IMP_ORDER, 'imp', 'juss')
    if (tense === 'nahy') return renderPersonRows(ARB_IMP_ORDER, 'nahy', 'juss')
    return renderNames()
  }

  const renderNameRow = (slot, label, extraValue) => {
    const list = formsOf(slot).filter(item => !item.uncertain)
    const override = cellOverride(slot)
    const original = arbFirst(conj, slot)
    let shown = list
    if (!shown.length && extraValue) shown = [{ form: extraValue, manual: true }]
    const unknown = !shown.length && (arbSlot(conj, slot) || []).some(item => item.form === '?')
    if (!shown.length && !unknown) return null

    return (
      <div className="arb-row" key={slot}>
        <div className="arb-person"><span className="arb-person-tr">{label}</span></div>
        <div className="arb-forms">
          {shown.length ? shown.map((item, index) => (
            editing === slot && index === 0 ? (
              <div className="arb-edit" key={index}>
                <input dir="rtl" className="arb-input" value={editText} onChange={event => setEditText(event.target.value)} autoFocus />
                <div className="arb-edit-actions">
                  <button type="button" className="primary-button" disabled={busy} onClick={() => saveCell(slot, original)}>{tt.save}</button>
                  <button type="button" className="secondary-button" onClick={() => setEditing(null)}>{tt.cancel}</button>
                  {override && <button type="button" className="secondary-button" disabled={busy} onClick={() => resetCell(slot)}>{tt.reset}</button>}
                </div>
              </div>
            ) : (
              <button type="button" key={index} className={`arb-cell${override ? ' is-edited' : ''}${admin ? ' is-editable' : ''}`} onClick={() => startEdit(slot, item.form)}>
                <span className="arb-word" dir="rtl"><span className="arb-vb">{item.form}</span></span>
                <span className="arb-tr">{arbTranslit(item.form)}</span>
              </button>
            )
          )) : (
            <button type="button" className={`arb-cell arb-unknown${admin ? ' is-editable' : ''}`} onClick={() => startEdit(slot, '')}>
              —<small>{tt.unknownSlot}</small>
            </button>
          )}
        </div>
      </div>
    )
  }

  function renderNames() {
    const nouns = waznInfo ? arbDerivedNouns(current.root, current.wazn, conj) : null
    const hasAp = !!arbFirst(conj, 'ap')
    const hasPp = !!arbFirst(conj, 'pp')
    const hasVn = !!(arbFirst(conj, 'vn') || (verbInfo && verbInfo.masdar))
    const slots = [
      ['ap', tt.fail],
      ...(hasAp ? [] : [['ap1', tt.ap1], ['ap2', tt.ap2], ['ap3', tt.ap3], ['apcd', tt.apcd], ['apan', tt.apan]]),
      ['pp', tt.mafool],
      ...(hasPp ? [] : [['pp2', tt.pp2]]),
      ['vn', tt.masdarName, verbInfo && verbInfo.masdar],
      ...(hasVn ? [] : [['vn2', tt.vn2]])
    ]

    return (
      <>
        <div className="arb-table">
          {slots.map(([slot, label, extra]) => renderNameRow(slot, label, extra))}
        </div>

        {nouns && (
          <>
            <h4 className="arb-group">{tt.nounsTitle}</h4>
            <div className="arb-table">
              {[['zamanMakan', tt.zamanMakan], ['tafdil', tt.tafdil], ['tafdilFem', tt.tafdilFem]].map(([field, label]) => (
                nouns[field] ? (
                  <div className="arb-row" key={field}>
                    <div className="arb-person"><span className="arb-person-tr">{label}</span></div>
                    <div className="arb-forms">
                      <div className="arb-cell">
                        <span className="arb-word" dir="rtl"><span className="arb-vb">{nouns[field]}</span></span>
                        <span className="arb-tr">{arbTranslit(nouns[field])}</span>
                      </div>
                    </div>
                  </div>
                ) : null
              ))}
            </div>
            {nouns.note === 'rule' && <p className="arb-note">{tt.ruleNote}</p>}
          </>
        )}
      </>
    )
  }

  /* ---- саҳифаи феъл ---- */

  const renderVerb = () => {
    if (!current || !conj) return null
    const form = waznInfo ? waznInfo.verbForm : ''
    const quad = conj.quadriliteral || (conj.radicals && conj.radicals.length === 4)
    const types = arbRootTypes(conj.classification, lang)
    const illa = arbIllaLetters(conj.radicals)
    const meaning = meaningOf(current.root, current.wazn)
    const transitivity = arbTransitivity(current.root, current.wazn)
    const past = formsOf('past_3ms')[0]
    const pres = formsOf('ind_3ms')[0]
    const masdar = verbInfo.masdar || arbFirst(conj, 'vn')
    const attested = (() => { try { return MZ.isAttested(current.root, current.wazn) } catch { return false } })()

    return (
      <>
        <button className="secondary-button back-button" type="button" onClick={() => setCurrent(null)}>← {tt.back}</button>

        <div className="arb-verb-card">
          <div className="arb-verb-main" dir="rtl">
            <span className="arb-verb-past">{past ? past.form : ''}</span>
            {pres && <span className="arb-verb-pres">{pres.form}</span>}
          </div>
          <div className="arb-verb-tr">{arbTranslit(past ? past.form : '')} · {arbTranslit(pres ? pres.form : '')}</div>

          <p className="arb-meaning">
            {meaning.text || (meaning.auto && meaning.lemma ? tt.translating : tt.meaningNone)}
            {meaning.text && <small>{meaning.auto ? tt.meaningAuto : tt.meaningManual}</small>}
          </p>

          <div className="arb-facts">
            <div><span>{tt.root}</span><b dir="rtl">{(conj.radicals || []).join(' ')}</b></div>
            <div><span>{tt.kind}</span><b>{quad ? tt.quadriliteral : tt.triliteral}, {waznInfo && arbPlain(waznInfo.basicDeriv) === 'مجرد' ? tt.mujarrad : tt.mazid}</b></div>
            <div><span>{tt.wazn}</span><b dir="rtl">{current.wazn}</b></div>
            <div><span>{tt.form}</span><b>{form}</b></div>
            <div><span>{tt.zaid}</span><b>{(ARB_ZAID[lang === 'ru' ? 'ru' : 'tg'] || ARB_ZAID.tg)[form] || '—'}</b></div>
            <div><span>{tt.rootType}</span><b>{types.join(' · ')}</b></div>
            <div><span>{tt.illa}</span><b dir="auto">{illa.length ? `${tt.illaYes}: ${illa.join(' ')}` : tt.illaNo}</b></div>
            {transitivity && <div><span>{tt.transitivity}</span><b>{tt.trans[transitivity]}</b></div>}
            {masdar && <div><span>{tt.masdar}</span><b dir="rtl">{masdar}</b></div>}
            {conj.classification && <div><span>{lang === 'ru' ? 'По-арабски' : 'Бо арабӣ'}</span><b dir="rtl">{conj.verbType}</b></div>}
          </div>

          {admin && (
            <div className="arb-edit-actions">
              {!attested && !verbInfo.rowId && (
                <button type="button" className="primary-button" disabled={busy} onClick={() => saveVerbMeta(false)}>{tt.saveVerb}</button>
              )}
              <button type="button" className="secondary-button" onClick={() => setMetaEdit({ tg: verbInfo.tg, ru: verbInfo.ru, masdar: verbInfo.masdar })}>{tt.editVerb}</button>
              <button type="button" className="danger-button" disabled={busy} onClick={() => saveVerbMeta(true)}>{tt.hideVerb}</button>
            </div>
          )}

          {admin && metaEdit && (
            <div className="arb-meta-edit">
              <div className="form-group">
                <label>{tt.tgLabel}</label>
                <input value={metaEdit.tg} onChange={event => setMetaEdit({ ...metaEdit, tg: event.target.value })} />
              </div>
              <div className="form-group">
                <label>{tt.ruLabel}</label>
                <input value={metaEdit.ru} onChange={event => setMetaEdit({ ...metaEdit, ru: event.target.value })} />
              </div>
              <div className="form-group">
                <label>{tt.masdarLabel}</label>
                <input dir="rtl" value={metaEdit.masdar} onChange={event => setMetaEdit({ ...metaEdit, masdar: event.target.value })} />
              </div>
              <div className="arb-edit-actions">
                <button type="button" className="primary-button" disabled={busy} onClick={() => saveVerbMeta(false)}>{tt.save}</button>
                <button type="button" className="secondary-button" onClick={() => setMetaEdit(null)}>{tt.cancel}</button>
              </div>
            </div>
          )}
        </div>

        <div className="arb-controls">
          <div className="arb-seg">
            {['past', 'present', 'amr', 'nahy', 'names'].map(item => (
              <button key={item} type="button" className={tense === item ? 'active' : ''} onClick={() => { setTense(item); setEditing(null) }}>
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
              {['ind', 'sub', 'juss'].map(item => (
                <button key={item} type="button" className={mood === item ? 'active' : ''} onClick={() => { setMood(item); setEditing(null) }}>{tt[item]}</button>
              ))}
            </div>
          )}

          {tense !== 'names' && (
            <p className="arb-legend">
              {tt.legend} <span className="arb-fa">● {tt.legendFa}</span> · <span className="arb-vb">● {tt.legendVerb}</span>
            </p>
          )}
          {admin && <p className="arb-note">{tt.adminHint}</p>}
        </div>

        {renderTable()}
        <p className="arb-note">{tt.tr} {tt.footer}</p>
      </>
    )
  }

  /* ---- натиҷаҳо ва ҷустуҷӯ ---- */

  const waznLabel = wazn => {
    const info = arbWaznInfo(wazn)
    return info ? `${info.verbForm} · ${wazn}` : wazn
  }

  const renderHits = () => {
    if (!hits) return null
    if (!hits.length) {
      const guess = (() => {
        const plain = arbKey(submitted).replace(/^ال/, '')
        const normalized = arbSafeRoot(plain).join('')
        return normalized.length === 3 || normalized.length === 4 ? normalized : ''
      })()
      return (
        <div className="arb-results">
          {guess && /[؀-ۿ]/.test(submitted) ? (
            <>
              <p className="arb-note">{tt.notFound}</p>
              <div className="arb-babs">
                {MZ.WAZNS.filter(item => (guess.length === 4) === /q$/.test(item.verbForm)).map(item => (
                  <button key={item.wazn} type="button" className="arb-bab" dir="rtl" onClick={() => openVerb(guess, item.wazn)}>
                    {item.verbForm} · {item.wazn}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="arb-note">{tt.notFoundText}</p>
          )}
        </div>
      )
    }

    return (
      <div className="arb-results">
        <h4>{tt.results}</h4>
        {hits.map(hit => (
          <div className="arb-root-card" key={hit.root}>
            <div className="arb-root-title">
              <span>{tt.rootWord}:</span>
              <b dir="rtl">{Array.from(hit.root).join(' ')}</b>
            </div>
            {hit.wazns.map(wazn => {
              const conjugation = arbConjugate(hit.root, wazn)
              const info = infoOf(hit.root, wazn)
              if (info.hidden) return null
              const meaning = meaningOf(hit.root, wazn)
              return (
                <button key={wazn} type="button" className="arb-result" onClick={() => openVerb(hit.root, wazn)}>
                  <span className="arb-result-ar" dir="rtl">
                    {conjugation ? arbFirst(conjugation, 'past_3ms') : hit.root}
                    <small>{conjugation ? arbFirst(conjugation, 'ind_3ms') : ''}</small>
                  </span>
                  <span className="arb-result-meta">
                    <b>{waznLabel(wazn)}</b>
                    <i>{meaning.text || (meaning.auto ? '…' : '')}</i>
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  const rootsByLetter = useMemo(() => {
    if (!letter || !showBrowse) return []
    return MZ.lexiconRoots().filter(root => root.startsWith(letter)).sort((a, b) => a.localeCompare(b, 'ar'))
  }, [letter, showBrowse])

  const renderBrowse = () => (
    <div className="arb-all">
      <button type="button" className="secondary-button" onClick={() => setShowBrowse(value => !value)}>
        {showBrowse ? tt.browseHide : `${tt.browse} · ${MZ.LEXICON_INFO.verbs} ${tt.verbsCount}`}
      </button>
      {showBrowse && (
        <>
          <div className="arb-letters" dir="rtl">
            {ARB_ALPHABET.map(item => (
              <button key={item} type="button" className={letter === item ? 'active' : ''} onClick={() => { setLetter(item); setLetterLimit(120) }}>{item}</button>
            ))}
          </div>
          <div className="arb-chips" dir="rtl">
            {rootsByLetter.slice(0, letterLimit).map(root => (
              <button key={root} type="button" className="arb-chip" onClick={() => openRoot(root)}>{Array.from(root).join(' ')}</button>
            ))}
          </div>
          {rootsByLetter.length > letterLimit && (
            <button type="button" className="secondary-button" onClick={() => setLetterLimit(value => value + 200)}>{tt.more}</button>
          )}
        </>
      )}
    </div>
  )

  const renderSarf = () => (
    <>
      {!current && (
        <>
          <form className="arb-search" onSubmit={runSearch}>
            <input
              dir="auto"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={tt.searchPh}
              className="arb-search-input"
              autoCapitalize="off"
              autoCorrect="off"
            />
            <button className="primary-button" type="submit">{tt.search}</button>
            {(query || hits) && (
              <button className="secondary-button" type="button" onClick={clearSearch}>{tt.clear}</button>
            )}
          </form>
          <p className="arb-note">{tt.hint}</p>
          {renderHits()}
          {renderBrowse()}
        </>
      )}
      {current && renderVerb()}
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

  return (
    <div className="arb-wrap">
      <div className="arb-tabs">
        <button type="button" className={tab === 'theory' ? 'active' : ''} onClick={() => setTab('theory')}>{tt.tabTheory}</button>
        <button type="button" className={tab === 'sarf' ? 'active' : ''} onClick={() => setTab('sarf')}>{tt.tabSarf}</button>
        <button type="button" className={tab === 'lessons' ? 'active' : ''} onClick={() => setTab('lessons')}>{tt.tabLessons}</button>
      </div>
      {tab === 'sarf' && renderSarf()}
      {tab === 'theory' && renderTheory()}
      {tab === 'lessons' && <div className="arb-lessons">{lessons}</div>}
    </div>
  )
}

/* ---------- Панели админ ---------- */

const ARB_EMPTY_VERB = { root: '', wazn: 'فعَل يفعُل', masdar: '', tg: '', ru: '' }
const ARB_EMPTY_THEORY = { title: '', body: '', titleRu: '', bodyRu: '' }

function ArabicAdmin({ rows, lang, db, notify, reload }) {
  const tt = (ARB_T[lang] || ARB_T.tg)
  const ta = tt.adm
  const [sub, setSub] = useState('verbs')
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState(ARB_EMPTY_VERB)
  const [tForm, setTForm] = useState(ARB_EMPTY_THEORY)
  const [tEditing, setTEditing] = useState(null)
  const [busy, setBusy] = useState(false)

  const data = useMemo(() => buildArabicData(rows), [rows])
  const stored = useMemo(() => {
    const key = filter.trim()
    return [...data.verbs.values()].filter(item => !key || item.root.includes(arbKey(key)) || String(item.tg).includes(key) || String(item.ru).includes(key))
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
    title: values.root,
    content_text: clean(values.tg),
    source_note: makeStoredNote('', {
      kind: 'verb', root: values.root, wazn: values.wazn,
      tg: clean(values.tg), ru: clean(values.ru), masdar: clean(values.masdar),
      custom: values.custom ? '1' : '', hide: hide ? '1' : ''
    }),
    is_published: true,
    updated_at: new Date().toISOString()
  })

  const saveVerb = event => {
    event.preventDefault()
    const root = arbSafeRoot(form.root).join('')
    if (root.length !== 3 && root.length !== 4) { notify(ta.invalidRoot, 'error'); return }
    if (!arbConjugate(root, form.wazn)) { notify(ta.cannot, 'error'); return }

    const attested = (() => { try { return MZ.isAttested(root, form.wazn) } catch { return false } })()
    const existing = data.verbs.get(`${root}|${form.wazn}`)

    run(async () => {
      const payload = verbPayload({ ...form, root, custom: !attested }, existing ? existing.hidden : false)
      const result = existing && existing.rowId
        ? await db.from('content_items').update(payload).eq('id', existing.rowId)
        : await db.from('content_items').insert(payload)
      if (result.error) throw result.error
      setForm(ARB_EMPTY_VERB)
      notify(ta.saved)
    })
  }

  const toggleHide = item => run(async () => {
    const payload = verbPayload(item, !item.hidden)
    const { error } = await db.from('content_items').update(payload).eq('id', item.rowId)
    if (error) throw error
  })

  const removeVerb = item => run(async () => {
    const { error } = await db.from('content_items').delete().eq('id', item.rowId)
    if (error) throw error
    notify(ta.deleted)
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
      notify(ta.saved)
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
    notify(ta.deleted)
  })

  const removeCell = cell => run(async () => {
    const { error } = await db.from('content_items').delete().eq('id', cell.rowId)
    if (error) throw error
  })

  return (
    <>
      <div className="arb-tabs">
        {[['verbs', ta.verbs], ['theory', ta.theory], ['cells', ta.cells]].map(([id, label]) => (
          <button key={id} type="button" className={sub === id ? 'active' : ''} onClick={() => setSub(id)}>{label}</button>
        ))}
      </div>
      <p className="arb-note">{ta.mediaHint}</p>

      {sub === 'verbs' && (
        <>
          <form className="admin-form" onSubmit={saveVerb}>
            <h3>{ta.add}</h3>

            <div className="form-group">
              <label>{ta.root}</label>
              <input dir="rtl" value={form.root} onChange={event => setForm({ ...form, root: event.target.value })} />
            </div>

            <div className="form-group">
              <label>{ta.wazn}</label>
              <select value={form.wazn} onChange={event => setForm({ ...form, wazn: event.target.value })}>
                {MZ.WAZNS.map(item => <option key={item.wazn} value={item.wazn}>{item.verbForm} · {item.wazn}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>{ta.masdar}</label>
              <input dir="rtl" value={form.masdar} onChange={event => setForm({ ...form, masdar: event.target.value })} />
            </div>

            <div className="form-group">
              <label>{ta.tg}</label>
              <input value={form.tg} onChange={event => setForm({ ...form, tg: event.target.value })} />
            </div>

            <div className="form-group">
              <label>{ta.ru}</label>
              <input value={form.ru} onChange={event => setForm({ ...form, ru: event.target.value })} />
            </div>

            <button className="primary-button" type="submit" disabled={busy}>{ta.saveBtn}</button>
          </form>

          <h4 className="arb-group">{ta.storedTitle}</h4>
          <div className="form-group">
            <input value={filter} onChange={event => setFilter(event.target.value)} placeholder={ta.filter} />
          </div>

          {stored.length === 0 && <p className="arb-note">{ta.none}</p>}
          {stored.map(item => {
            const conj = arbConjugate(item.root, item.wazn)
            return (
              <article className={`public-item arb-admin-item${item.hidden ? ' is-hidden' : ''}`} key={item.vk}>
                <h3 dir="rtl" className="arb-admin-ar">{conj ? arbFirst(conj, 'past_3ms') : item.root}</h3>
                <p>
                  {item.wazn} · {item.tg} {item.ru ? `/ ${item.ru}` : ''} {item.masdar ? `· ${item.masdar}` : ''}
                  {item.hidden ? ` · ${ta.hidden}` : ''}{item.custom ? ` · ${ta.custom}` : ''}
                </p>
                <div className="arb-edit-actions">
                  <button className="secondary-button" type="button" onClick={() => setForm({ root: item.root, wazn: item.wazn, masdar: item.masdar || '', tg: item.tg || '', ru: item.ru || '' })}>{ta.edit}</button>
                  <button className="secondary-button" type="button" disabled={busy} onClick={() => toggleHide(item)}>{item.hidden ? ta.restore : ta.hide}</button>
                  <button className="danger-button" type="button" disabled={busy} onClick={() => removeVerb(item)}>{ta.del}</button>
                </div>
              </article>
            )
          })}
        </>
      )}

      {sub === 'theory' && (
        <>
          <form className="admin-form" onSubmit={saveTheory}>
            <h3>{ta.addTheory}</h3>
            <div className="form-group">
              <label>{ta.tTitle}</label>
              <input value={tForm.title} onChange={event => setTForm({ ...tForm, title: event.target.value })} />
            </div>
            <div className="form-group">
              <label>{ta.tBody}</label>
              <textarea rows={8} value={tForm.body} onChange={event => setTForm({ ...tForm, body: event.target.value })} />
            </div>
            <div className="form-group">
              <label>{ta.tTitleRu}</label>
              <input value={tForm.titleRu} onChange={event => setTForm({ ...tForm, titleRu: event.target.value })} />
            </div>
            <div className="form-group">
              <label>{ta.tBodyRu}</label>
              <textarea rows={8} value={tForm.bodyRu} onChange={event => setTForm({ ...tForm, bodyRu: event.target.value })} />
            </div>
            <div className="arb-edit-actions">
              <button className="primary-button" type="submit" disabled={busy}>{ta.saveBtn}</button>
              {tEditing && (
                <button className="secondary-button" type="button" onClick={() => { setTEditing(null); setTForm(ARB_EMPTY_THEORY) }}>{tt.cancel}</button>
              )}
            </div>
          </form>

          {data.theory.map(item => (
            <article className={`public-item arb-admin-item${item.hidden ? ' is-hidden' : ''}`} key={item.id}>
              <h3>{item.title}{item.hidden ? ` · ${ta.hidden}` : ''}</h3>
              <div className="arb-edit-actions">
                <button className="secondary-button" type="button" onClick={() => editTheory(item)}>{ta.edit}</button>
                <button className="danger-button" type="button" disabled={busy} onClick={() => hideTheory(item)}>
                  {item.hidden ? ta.restore : (item.src === 'seed' ? ta.hide : ta.del)}
                </button>
              </div>
            </article>
          ))}
        </>
      )}

      {sub === 'cells' && (
        <>
          {data.cellRows.length === 0 && <p className="arb-note">{ta.noCells}</p>}
          {data.cellRows.map(cell => (
            <article className="public-item arb-admin-item" key={cell.rowId}>
              <h3 dir="rtl" className="arb-admin-ar">{cell.value}</h3>
              <p>{cell.vk} · {cell.cell}</p>
              <div className="arb-edit-actions">
                <button className="danger-button" type="button" disabled={busy} onClick={() => removeCell(cell)}>{tt.reset}</button>
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

  const renderGenericBody = () => (
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
  )

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
                <ArabicSection rows={arabicRows} lang={lang} admin={admin} db={db} notify={notify} reload={reloadAll} lessons={renderGenericBody()} />
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
                renderGenericBody()
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
