import { useState } from 'react'
import { calcTax, money } from './tax.js'
const steps = [['Загрузите чек','Фото, скриншот перевода или текст сообщения от клиента.'],['ИИ разберёт сам','Находит дату и сумму, отличает доход от расхода и пишет в журнал.'],['Получите сумму и срок','Видите налог к оплате и сколько дней осталось до дедлайна.']]
const feats = [['📷','Распознавание чеков','Работает с фото и текстом, ничего не нужно переписывать вручную.'],['⏰','Напоминания о сроках','Обратный отсчёт до оплаты, чтобы не платить штрафы.'],['⚙️','Ваши правила','Ставка, база и день оплаты настраиваются под ваш режим.'],['💬','Совет простыми словами','Объясним цифры и подскажем, что сделать дальше.']]
const faq = [['Как ИИ читает чеки?','Вы загружаете фото или текст, а ИИ находит дату, сумму и тип операции. Результат можно поправить вручную.'],['Подходит ли для моей страны и режима?','Ставка, база и срок настраиваются вручную, поэтому подойдут разные режимы. Сверяйтесь с правилами вашей налоговой.'],['Где хранятся мои данные?','В этой версии операции хранятся только в вашем браузере.'],['Это заменяет бухгалтера?','Нет. Это быстрая оценка и порядок в учёте; сложные случаи лучше обсудить со специалистом.']]
export default function Landing() {
  const [c, setC] = useState({ inc: 250000, exp: 40000, rate: 6, base: 'income' })
  const set = k => e => setC({ ...c, [k]: e.target.value })
  const tax = calcTax(+c.inc, +c.exp, +c.rate, c.base)
  return (<>
    <header className="nav wrap"><b className="logo">НалогПилот</b>
      <nav><a href="#calc">Калькулятор</a><a href="#price">Тарифы</a><a href="#faq">Вопросы</a><a className="btn sm" href="#app">Войти</a></nav></header>
    <main className="wrap">
      <section className="hero">
        <div><h1>Сфотографируйте чек. <em>Мы скажем, сколько платить налога.</em></h1>
          <p className="muted">Забудьте про таблицы и страх пропустить срок. Загрузите чеки, а НалогПилот посчитает налог за квартал и напомнит, когда его оплатить.</p>
          <div className="row"><a className="btn" href="#app">Попробовать бесплатно</a><a className="btn ghost" href="#calc">Посчитать налог</a></div></div>
        <div className="receipt"><span className="tag">ИИ прочитал ✓</span>
          <pre>{`ЧЕК № 0417\nЛоготип для кафе  +35 000\nХостинг, год       −4 800\nСайт для студии   +60 000\n\nНалог за квартал    5 700`}</pre></div>
      </section>
      <section><h2>Три шага вместо бухгалтерии</h2><p className="muted">Всё, что обычно занимает вечер и нервы, делается за минуту.</p>
        <div className="grid g3">{steps.map(([t, d], i) => <div className="card" key={t}><span className="num">{i + 1}</span><h3>{t}</h3><p className="muted">{d}</p></div>)}</div></section>
      <section><h2>Для каждого, у кого есть доход</h2><p className="muted">Любая страна, любая валюта, любой режим: ставку и правила вы задаёте сами.</p>
        <div className="grid g4">{[['💻','Фрилансеры','Проекты от разных клиентов в одном журнале.'],['🏪','ИП и малый бизнес','Доходы, расходы и налог за квартал.'],['🧑‍🍳','Подработка и услуги','Репетиторы, мастера, курьеры, тату-мастера.'],['👨‍👩‍👧','Все остальные','Следите за доходами и знайте, сколько отложить.']].map(([i, t, d]) => <div className="card" key={t}><span className="ico">{i}</span><h3>{t}</h3><p className="muted">{d}</p></div>)}</div></section>
      <section><h2>Что внутри</h2><p className="muted">Только то, что нужно самозанятому человеку.</p>
        <div className="grid g4">{feats.map(([i, t, d]) => <div className="card" key={t}><span className="ico">{i}</span><h3>{t}</h3><p className="muted">{d}</p></div>)}</div></section>
      <section id="calc"><h2>Посчитайте за 10 секунд</h2><p className="muted">Введите свои цифры за квартал и ставку вашего режима.</p>
        <div className="card calc">
          <div className="form">
            <label>Доход за квартал<input type="number" value={c.inc} onChange={set('inc')} /></label>
            <label>Расходы за квартал<input type="number" value={c.exp} onChange={set('exp')} /></label>
            <label>Ставка налога, %<input type="number" value={c.rate} onChange={set('rate')} /></label>
            <label>База<select value={c.base} onChange={set('base')}><option value="income">С доходов</option><option value="profit">С доходов минус расходы</option></select></label></div>
          <div><p className="muted">Налог за квартал</p><div className="big">{money(tax)}</div>
            <p className="muted small">Расчёт примерный: ставку и правила уточняйте у налоговой или бухгалтера.</p></div></div></section>
      <section id="price"><h2>Тарифы</h2><p className="muted">Начните бесплатно. Платите, когда станет тесно.</p>
        <div className="grid g2">
          <div className="card"><b>Старт</b><div className="serif">Бесплатно</div><p className="muted">Для первых клиентов</p><ul><li>До 30 чеков в месяц</li><li>Расчёт налога за квартал</li><li>Напоминание о сроке</li></ul></div>
          <div className="card hl"><b>Про</b><div className="serif">Скоро</div><p className="muted">Для постоянной работы</p><ul><li>Без лимита чеков</li><li>Отчёты в PDF и Excel</li><li>Категории расходов</li><li>Прогноз налога на квартал</li></ul></div></div></section>
      <section id="faq"><h2>Частые вопросы</h2>{faq.map(([q, a]) => <details key={q}><summary>{q}</summary><p className="muted">{a}</p></details>)}</section>
      <section className="cta"><h2>Налоги не должны отнимать вечера</h2><p>Загрузите первый чек и увидите сумму сразу.</p><a className="btn dark" href="#app">Попробовать бесплатно</a></section>
    </main>
    <footer className="wrap muted small">© НалогПилот · Информация носит справочный характер и не является налоговой консультацией.</footer>
  </>)
}
