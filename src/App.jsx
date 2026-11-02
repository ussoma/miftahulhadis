
import React, { useMemo, useState } from 'react'

const sections = [
  {
    id: 1,
    key: 'quran',
    subtitle: 'القرآن الكريم',
    icon: '📖'
  },
  {
    id: 2,
    key: 'hadith',
    subtitle: 'الأحاديث النبوية',
    icon: '📚'
  },
  {
    id: 3,
    key: 'scholars',
    subtitle: 'أقوال السلف الصالح',
    icon: '🌿'
  },
  {
    id: 4,
    key: 'duas',
    subtitle: 'الأدعية',
    icon: '🤲'
  },
  {
    id: 5,
    key: 'adhkar',
    subtitle: 'الأذكار',
    icon: '📿'
  },
  {
    id: 6,
    key: 'prophets',
    subtitle: 'قصص الأنبياء',
    icon: '🕌'
  },
  {
    id: 7,
    key: 'seerah',
    subtitle: 'السيرة النبوية',
    icon: '🌙'
  },
  {
    id: 8,
    key: 'companions',
    subtitle: 'سيرة الصحابة',
    icon: '⭐'
  },
  {
    id: 9,
    key: 'lessons',
    subtitle: 'الدروس الإسلامية',
    icon: '🎧'
  },
  {
    id: 10,
    key: 'questions',
    subtitle: 'الأسئلة الإسلامية',
    icon: '💬'
  },
  {
    id: 11,
    key: 'sunnah',
    subtitle: 'السُّنَن',
    icon: '🌱'
  }
]

const translations = {
  tg: {
    quran: 'Қуръони Карим',
    hadith: 'Ҳадисҳо',
    scholars: 'Суханони Солеҳин',
    duas: 'Дуоҳо',
    adhkar: 'Азкор',
    prophets: 'Қиссаи Паёмбарон عليهم السلام',
    seerah: 'Сирати Расулуллоҳ ﷺ',
    companions: 'Сирати саҳоба رضي الله عنهم',
    lessons: 'Дарсҳои Исломӣ',
    questions: 'Саволҳои Исломӣ',
    sunnah: 'Суннатҳо',

    quranDesc: 'Қуръони Карим, сураҳо ва оятҳо',
    hadithDesc: 'Ҳадисҳои Расулуллоҳ ﷺ',
    scholarsDesc: 'Суханони донишмандон ва солеҳон',
    duasDesc: 'Дуоҳои Қуръон ва Суннат',
    adhkarDesc: 'Азкорҳои субҳу шом ва дигар азкор',
    prophetsDesc: 'Қиссаҳои паёмбарон عليهم السلام',
    seerahDesc: 'Зиндагии Расулуллоҳ ﷺ',
    companionsDesc: 'Зиндагии саҳоба رضي الله عنهم',
    lessonsDesc: 'Дарсҳои аудиоӣ ва видеоӣ',
    questionsDesc: 'Савол фиристед ва ҷавоб гиред',
    sunnahDesc: 'Суннатҳои рӯзмарраи Расулуллоҳ ﷺ',

    welcomeLabel: 'КИТОБХОНАИ ИСЛОМӢ',
    welcomeTitle: 'Илм биомӯз, ба он амал кун.',
    welcomeText: 'Қуръон, ҳадис, дуо ва азкор — дар як ҷо.',
    selected: 'БАХШИ ИНТИХОБШУДА',
    heading: 'Бахшҳои исломӣ',
    choose: 'Бахши дилхоҳро интихоб кунед',
    search: 'Ҷустуҷӯи бахш...',
    back: 'Бозгашт ба меню',
    empty: 'Ягон бахш ёфт нашуд.',
    preparing: 'Мундариҷаи ин бахш дар марҳилаи омодасозӣ қарор дорад.',
    footer: 'Манбаи дониш ва омӯзиши исломӣ',
    green: '🌙 Сабз',
    white: '☀️ Сафед',
    count: 'бахш',
    language: 'Забон'
  },

  ru: {
    quran: 'Священный Коран',
    hadith: 'Хадисы',
    scholars: 'Слова праведных предшественников',
    duas: 'Дуа',
    adhkar: 'Азкары',
    prophets: 'Истории пророков عليهم السلام',
    seerah: 'Жизнеописание Посланника Аллаха ﷺ',
    companions: 'Жизнеописание сподвижников رضي الله عنهم',
    lessons: 'Исламские уроки',
    questions: 'Исламские вопросы',
    sunnah: 'Сунны',

    quranDesc: 'Священный Коран, суры и аяты',
    hadithDesc: 'Хадисы Посланника Аллаха ﷺ',
    scholarsDesc: 'Высказывания ученых и праведников',
    duasDesc: 'Дуа из Корана и Сунны',
    adhkarDesc: 'Утренние, вечерние и другие азкары',
    prophetsDesc: 'Истории пророков عليهم السلام',
    seerahDesc: 'Жизнь Посланника Аллаха ﷺ',
    companionsDesc: 'Жизнь сподвижников رضي الله عنهم',
    lessonsDesc: 'Аудио- и видеоуроки',
    questionsDesc: 'Задайте вопрос и получите ответ',
    sunnahDesc: 'Повседневные сунны Посланника Аллаха ﷺ',

    welcomeLabel: 'ИСЛАМСКАЯ БИБЛИОТЕКА',
    welcomeTitle: 'Изучай знания и следуй им.',
    welcomeText: 'Коран, хадисы, дуа и азкары — в одном месте.',
    selected: 'ВЫБРАННЫЙ РАЗДЕЛ',
    heading: 'Исламские разделы',
    choose: 'Выберите нужный раздел',
    search: 'Поиск раздела...',
    back: 'Вернуться в меню',
    empty: 'Разделы не найдены.',
    preparing: 'Содержимое этого раздела находится в стадии подготовки.',
    footer: 'Источник знаний и исламского обучения',
    green: '🌙 Зеленая',
    white: '☀️ Белая',
    count: 'разделов',
    language: 'Язык'
  },

  ar: {
    quran: 'القرآن الكريم',
    hadith: 'الأحاديث',
    scholars: 'أقوال السلف الصالح',
    duas: 'الأدعية',
    adhkar: 'الأذكار',
    prophets: 'قصص الأنبياء',
    seerah: 'السيرة النبوية',
    companions: 'سيرة الصحابة',
    lessons: 'الدروس الإسلامية',
    questions: 'الأسئلة الإسلامية',
    sunnah: 'السُّنَن',

    quranDesc: 'القرآن الكريم والسور والآيات',
    hadithDesc: 'أحاديث رسول الله ﷺ',
    scholarsDesc: 'أقوال العلماء والصالحين',
    duasDesc: 'أدعية القرآن والسنة',
    adhkarDesc: 'أذكار الصباح والمساء وغيرها',
    prophetsDesc: 'قصص الأنبياء عليهم السلام',
    seerahDesc: 'سيرة رسول الله ﷺ',
    companionsDesc: 'سيرة الصحابة رضي الله عنهم',
    lessonsDesc: 'دروس صوتية ومرئية',
    questionsDesc: 'أرسل سؤالك واحصل على إجابة',
    sunnahDesc: 'سنن رسول الله ﷺ اليومية',

    welcomeLabel: 'المكتبة الإسلامية',
    welcomeTitle: 'تعلّم العلم واعمل به.',
    welcomeText: 'القرآن والحديث والدعاء والأذكار في مكان واحد.',
    selected: 'القسم المختار',
    heading: 'الأقسام الإسلامية',
    choose: 'اختر القسم المناسب',
    search: 'البحث عن قسم...',
    back: 'العودة إلى القائمة',
    empty: 'لم يتم العثور على أقسام.',
    preparing: 'محتوى هذا القسم قيد الإعداد.',
    footer: 'مصدر للعلم والتعليم الإسلامي',
    green: '🌙 أخضر',
    white: '☀️ أبيض',
    count: 'أقسام',
    language: 'اللغة'
  }
}

export default function App() {
  const [activeSection, setActiveSection] = useState(null)
  const [search, setSearch] = useState('')

  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('miftahulhadis-language') || 'tg'
    } catch {
      return 'tg'
    }
  })

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('miftahulhadis-theme') || 'white'
    } catch {
      return 'white'
    }
  })

  const t = translations[language] || translations.tg

  const isArabic = language === 'ar'

  const toggleTheme = () => {
    const nextTheme = theme === 'white' ? 'green' : 'white'
    setTheme(nextTheme)

    try {
      localStorage.setItem('miftahulhadis-theme', nextTheme)
    } catch {}
  }

  const changeLanguage = event => {
    const nextLanguage = event.target.value
    setLanguage(nextLanguage)

    try {
      localStorage.setItem('miftahulhadis-language', nextLanguage)
    } catch {}
  }

  const translatedSections = useMemo(() => {
    return sections.map(section => ({
      ...section,
      title: t[section.key],
      description: t[section.key + 'Desc']
    }))
  }, [language])

  const filteredSections = useMemo(() => {
    const value = search.trim().toLowerCase()

    if (!value) return translatedSections

    return translatedSections.filter(section =>
      `${section.title} ${section.subtitle} ${section.description}`
        .toLowerCase()
        .includes(value)
    )
  }, [search, translatedSections])

  const openSection = section => {
    setActiveSection(section)
    setSearch('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goHome = () => {
    setActiveSection(null)
    setSearch('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main
      className={`app theme-${theme}`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <header className="header">
        <div className="header-top">
          <div className="brand-icon">م</div>

          <div>
            <h1>Miftahulhadis</h1>
            <p className="arabic-title">مفتاح الحديث</p>
          </div>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Тағйир додани мавзӯи ранг"
          >
            {theme === 'white' ? t.green : t.white}
          </button>
        </div>

        <div className="header-welcome">
          {activeSection ? (
            <>
              <span className="welcome-label">{t.selected}</span>
              <h2>{activeSection.title}</h2>
              <p className="arabic-title">
                {activeSection.subtitle}
              </p>
            </>
          ) : (
            <>
              <span className="welcome-label">
                {t.welcomeLabel}
              </span>
              <h2>{t.welcomeTitle}</h2>
              <p>{t.welcomeText}</p>
            </>
          )}
        </div>
      </header>

      <div className="language-selector">
        <label htmlFor="app-language">{t.language}:</label>

        <select
          id="app-language"
          className="language-select"
          value={language}
          onChange={changeLanguage}
        >
          <option value="tg">Тоҷикӣ 🇹🇯</option>
          <option value="ru">Русский 🇷🇺</option>
          <option value="ar">العربية 🇸🇦</option>
        </select>
      </div>

      {activeSection ? (
        <section className="content-page">
          <button className="back-button" onClick={goHome}>
            <span>←</span> {t.back}
          </button>

          <div className="section-intro">
            <div className="section-icon">
              {activeSection.icon}
            </div>

            <h2>{activeSection.title}</h2>

            <p className="arabic-title">
              {activeSection.subtitle}
            </p>

            <p>{activeSection.description}</p>

            {activeSection.key === 'quran' ? (
              <p className="coming-soon">
                {t.preparing}
              </p>
            ) : (
              <p className="coming-soon">
                {t.preparing}
              </p>
            )}
          </div>
        </section>
      ) : (
        <section className="main-content">
          <div className="section-heading">
            <div>
              <h2>{t.heading}</h2>
              <p>{t.choose}</p>
            </div>

            <span className="section-count">
              {sections.length} {t.count}
            </span>
          </div>

          <div className="search-box">
            <span>⌕</span>

            <input
              type="search"
              placeholder={t.search}
              value={search}
              onChange={event => setSearch(event.target.value)}
            />

            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <section className="menu">
            {filteredSections.length > 0 ? (
              filteredSections.map(section => (
                <button
                  className="menu-card"
                  key={section.id}
                  onClick={() => openSection(section)}
                >
                  <span className="card-number">
                    {String(section.id).padStart(2, '0')}
                  </span>

                  <span className="card-icon">
                    {section.icon}
                  </span>

                  <span className="card-text">
                    <strong>{section.title}</strong>
                    <small>{section.subtitle}</small>
                  </span>

                  <span className="card-arrow">‹</span>
                </button>
              ))
            ) : (
              <div className="empty-result">
                <span>🔎</span>
                <p>{t.empty}</p>
              </div>
            )}
          </section>
        </section>
      )}

      <footer className="footer">
        <div className="footer-brand">Miftahulhadis</div>
        <p>{t.footer}</p>
        <small>
          © {new Date().getFullYear()} Miftahulhadis
        </small>
      </footer>
    </main>
  )
}
