
import React, { useMemo, useState } from 'react'

const sections = [
  { id: 1, title: 'Қуръони Карим', subtitle: 'القرآن الكريم', description: 'Қуръони карим ва сураҳои муборак', icon: '📖' },
  { id: 2, title: 'Ҳадисҳо', subtitle: 'الأحاديث النبوية', description: 'Ҳадисҳои Расулуллоҳ ﷺ', icon: '📚' },
  { id: 3, title: 'Суханони Солеҳин', subtitle: 'أقوال السلف الصالح', description: 'Суханони донишмандон ва солеҳон', icon: '🌿' },
  { id: 4, title: 'Дуоҳо', subtitle: 'الأدعية', description: 'Дуоҳои Қуръон ва Суннат', icon: '🤲' },
  { id: 5, title: 'Азкор', subtitle: 'الأذكار', description: 'Азкорҳои субҳу шом ва дигар азкор', icon: '📿' },
  { id: 6, title: 'Қиссаи Паёмбарон عليهم السلام', subtitle: 'قصص الأنبياء', description: 'Қиссаҳои паёмбарон عليهم السلام', icon: '🕌' },
  { id: 7, title: 'Сирати Расулуллоҳ ﷺ', subtitle: 'السيرة النبوية', description: 'Зиндагии Расулуллоҳ ﷺ', icon: '🌙' },
  { id: 8, title: 'Сирати саҳоба رضي الله عنهم', subtitle: 'سيرة الصحابة', description: 'Зиндагии саҳоба رضي الله عنهم', icon: '⭐' },
  { id: 9, title: 'Дарсҳои Исломӣ', subtitle: 'الدروس الإسلامية', description: 'Дарсҳои аудиоӣ ва видеоӣ', icon: '🎧' },
  { id: 10, title: 'Саволҳои Исломӣ', subtitle: 'الأسئلة الإسلامية', description: 'Савол фиристед ва ҷавоб гиред', icon: '💬' }
]

export default function App() {
  const [activeSection, setActiveSection] = useState(null)
  const [search, setSearch] = useState('')

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('miftahulhadis-theme') || 'white'
    } catch {
      return 'white'
    }
  })

  const toggleTheme = () => {
    const nextTheme = theme === 'white' ? 'green' : 'white'
    setTheme(nextTheme)

    try {
      localStorage.setItem('miftahulhadis-theme', nextTheme)
    } catch {
      // Мавзӯъ то анҷоми истифодаи саҳифа фаъол мемонад.
    }
  }

  const filteredSections = useMemo(() => {
    const value = search.trim().toLowerCase()

    if (!value) return sections

    return sections.filter(section =>
      `${section.title} ${section.subtitle} ${section.description}`
        .toLowerCase()
        .includes(value)
    )
  }, [search])

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
    <main className={`app theme-${theme}`}>
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
            title="Тағйир додани ранг"
          >
            {theme === 'white' ? '🌙 Сабз' : '☀️ Сафед'}
          </button>
        </div>

        <div className="header-welcome">
          {activeSection ? (
            <>
              <span className="welcome-label">БАХШИ ИНТИХОБШУДА</span>
              <h2>{activeSection.title}</h2>
              <p>{activeSection.subtitle}</p>
            </>
          ) : (
            <>
              <span className="welcome-label">КИТОБХОНАИ ИСЛОМӢ</span>
              <h2>Илм биомӯз, ба он амал кун.</h2>
              <p>Қуръон, ҳадис, дуо ва азкор — дар як ҷо.</p>
            </>
          )}
        </div>
      </header>

      {activeSection ? (
        <section className="content-page">
          <button className="back-button" onClick={goHome}>
            <span>←</span> Бозгашт ба меню
          </button>

          <div className="section-intro">
            <div className="section-icon">{activeSection.icon}</div>
            <h2>{activeSection.title}</h2>
            <p className="arabic-title">{activeSection.subtitle}</p>
            <p>{activeSection.description}</p>
            <p className="coming-soon">
              Мундариҷаи ин бахш дар марҳилаи омодасозӣ қарор дорад.
            </p>
          </div>
        </section>
      ) : (
        <section className="main-content">
          <div className="section-heading">
            <div>
              <h2>Бахшҳои исломӣ</h2>
              <p>Бахши дилхоҳро интихоб кунед</p>
            </div>
            <span className="section-count">10 бахш</span>
          </div>

          <div className="search-box">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Ҷустуҷӯи бахш..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />

            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch('')}
                aria-label="Пок кардани ҷустуҷӯ"
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

                  <span className="card-icon">{section.icon}</span>

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
                <p>Ягон бахш ёфт нашуд.</p>
              </div>
            )}
          </section>
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
