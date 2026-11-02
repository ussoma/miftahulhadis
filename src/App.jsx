import React from 'react'

const sections = [
  'Қуръони Карим',
  'Ҳадисҳо',
  'Суханони Солеҳин',
  'Дуоҳо',
  'Азкор',
  'Қиссаи Паёмбарон عليهم السلام',
  'Сирати Расулуллоҳ ﷺ',
  'Сирати саҳоба رضي الله عنهم',
  'Дарсҳои Исломӣ',
  'Саволҳои Исломӣ'
]

export default function App() {
  return (
    <main className="app">
      <header className="header">
        <h1>Miftahulhadis</h1>
        <p>مفتاح الحديث</p>
        <span>Хуш омадед!</span>
      </header>

      <h2>Бахшҳои исломӣ</h2>

      <section className="menu">
        {sections.map((item, index) => (
          <div className="menu-card" key={index}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{item}</h3>
            <b>›</b>
          </div>
        ))}
      </section>

      <footer>
        © Miftahulhadis
      </footer>
    </main>
  )
}