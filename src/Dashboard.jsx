import { useEffect, useState } from 'react'
import Chart, { Num } from './Chart.jsx'
import { advice, calcTax, daysLeft, deadline, money, parseText, sameQuarter, PRESETS, forecast, setCur } from './tax.js'
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
export default function Dashboard() {
  const [ops, setOps] = useState(() => load('np_ops', []))
  const [cfg, setCfg] = useState(() => load('np_cfg', { rate: 6, base: 'income', day: 25 }))
  const [text, setText] = useState(''), [file, setFile] = useState(null), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false)
  const y = new Date().getFullYear(), [qi, setQi] = useState(Math.floor(new Date().getMonth() / 3))
  const [tip, setTip] = useState(''), [m, setM] = useState({ date: new Date().toISOString().slice(0, 10), amount: '', type: 'income', desc: '' })
  useEffect(() => localStorage.setItem('np_ops', JSON.stringify(ops)), [ops])
  useEffect(() => localStorage.setItem('np_cfg', JSON.stringify(cfg)), [cfg])
  setCur(cfg.cur)
  const q = ops.filter(o => { const d = new Date(o.date); return d.getFullYear() === y && Math.floor(d.getMonth() / 3) === qi })
  const inc = q.filter(o => o.type === 'income').reduce((s, o) => s + o.amount, 0)
  const exp = q.filter(o => o.type === 'expense').reduce((s, o) => s + o.amount, 0)
  const tax = calcTax(inc, exp, +cfg.rate, cfg.base)
  const dl = deadline(cfg.day, new Date(y, qi * 3, 1)), left = daysLeft(dl)
  const prep = async f => {
    try { const b = await createImageBitmap(f), k = Math.min(2, 1800 / b.width), c = document.createElement('canvas')
      c.width = b.width * k; c.height = b.height * k; const g = c.getContext('2d'); g.filter = 'grayscale(1) contrast(1.6)'; g.drawImage(b, 0, 0, c.width, c.height); return c } catch { return f } }
  const recognize = async () => {
    let t = text
    if (file) {
      setBusy(true); setMsg('Читаю фото… 0%')
      try {
        const { recognize: ocr } = await import('tesseract.js')
        const { data } = await ocr(await prep(file), 'rus+eng', { logger: m => m.status === 'recognizing text' && setMsg(`Читаю фото… ${Math.round(m.progress * 100)}%`) })
        t = data.text; setText(t)
      } catch { setBusy(false); return setMsg('Не удалось прочитать фото (нужен интернет). Вставьте текст или добавьте вручную.') }
      setBusy(false)
    }
    const r = parseText(t)
    if (!r) return setMsg('Сумма не найдена. Проверьте текст или добавьте вручную.')
    setOps([r, ...ops]); setText(''); setFile(null); setMsg(`Добавлено: ${money(r.amount)} (${r.type === 'income' ? 'доход' : 'расход'})`)
  }
  const fc = forecast(inc, exp, +cfg.rate, cfg.base, y, qi)
  const add = e => { e.preventDefault(); if (!+m.amount) return
    setOps([{ ...m, id: Date.now(), amount: +m.amount }, ...ops]); setM({ ...m, amount: '', desc: '' }) }
  const sc = k => e => setCfg({ ...cfg, [k]: e.target.value })
  const demo = () => { const d = (m, n) => new Date(y, m, n).toISOString().slice(0, 10), b = qi * 3
    setOps([{ id: 1, date: d(b, 5), amount: 85000, type: 'income', desc: 'Сайт для студии' }, { id: 2, date: d(b, 12), amount: 4800, type: 'expense', desc: 'Хостинг, год' },
      { id: 3, date: d(b + 1, 3), amount: 35000, type: 'income', desc: 'Логотип для кафе' }, { id: 4, date: d(b + 1, 20), amount: 9000, type: 'expense', desc: 'Подписка на сервисы' },
      { id: 5, date: d(b + 2, 8), amount: 120000, type: 'income', desc: 'Разработка лендинга' }, ...ops]) }
  const csv = () => { const t = 'Дата;Описание;Тип;Сумма\n' + ops.map(o => [o.date, '"' + (o.desc || '').replace(/"/g, '""') + '"', o.type === 'income' ? 'доход' : 'расход', o.amount].join(';')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + t], { type: 'text/csv' })); a.download = 'nalogpilot.csv'; a.click() }
  return (<main className="wrap app">
    <a className="muted small" href="#">← На главную</a>
    <h1 className="logo big2">НалогПилот</h1>
    <p className="muted">Вставьте текст чека — НалогПилот найдёт сумму и дату, а вы сразу увидите налог и срок оплаты.</p>
    <div className="tabs">{['I', 'II', 'III', 'IV'].map((t, i) => <button key={t} className={i === qi ? 'on' : ''} onClick={() => setQi(i)}>{t} квартал {y}</button>)}
      <span className="sp" /><button onClick={demo}>🎲 Демо-данные</button><button onClick={csv} disabled={!ops.length}>⬇ CSV</button></div>
    <div className="grid g4 kpi">
      <div className="card"><span className="muted small">Доход за квартал</span><b className="green"><Num v={inc} /></b></div>
      <div className="card"><span className="muted small">Расходы за квартал</span><b><Num v={exp} /></b></div>
      <div className="card"><span className="muted small">Налог к оплате</span><b className="orange"><Num v={tax} /></b></div>
      <div className="card"><span className="muted small">Оплатить до</span><b>{dl.toLocaleDateString('ru-RU')}</b><span className="muted small">Осталось дней: {left}</span></div></div>
    <div className="card"><h3>Доходы и расходы по месяцам <span className="muted small">● доход <span className="orange">● расход</span></span></h3><Chart ops={ops} qi={qi} y={y} />{fc != null && <p className="muted">Прогноз налога на конец квартала при текущем темпе: <b className="orange">{money(fc)}</b></p>}</div>
    <div className="grid g2">
      <div className="card"><h3>Добавить операцию</h3>
        <label>Текст чека, счёта или сообщения клиента<textarea rows="3" value={text} onChange={e => setText(e.target.value)} placeholder="Например: Оплата за логотип от ООО Рассвет, 35 000, 12 ноября" /></label>
        <label>или фото чека<input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} /></label>
        <button className="btn" onClick={recognize} disabled={busy}>✨ Распознать</button>{msg && <p className="muted small">{msg}</p>}
        <h3>Или вручную</h3>
        <form className="form2" onSubmit={add}>
          <label>Дата<input type="date" value={m.date} onChange={e => setM({ ...m, date: e.target.value })} /></label>
          <label>Сумма<input type="number" value={m.amount} onChange={e => setM({ ...m, amount: e.target.value })} /></label>
          <label>Тип<select value={m.type} onChange={e => setM({ ...m, type: e.target.value })}><option value="income">Доход</option><option value="expense">Расход</option></select></label>
          <label>Описание<input value={m.desc} onChange={e => setM({ ...m, desc: e.target.value })} /></label>
          <button className="btn ghost">Добавить</button></form></div>
      <div className="card"><h3>Налоговые настройки</h3>
        <label>Валюта<select value={cfg.cur || ''} onChange={sc('cur')}>{[['', 'Без валюты'], ['сом', 'Сом'], ['₽', 'Рубль ₽'], ['₸', 'Тенге ₸'], ['сўм', 'Сум'], ['$', 'Доллар $'], ['€', 'Евро €'], ['₴', 'Гривна ₴']].map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select></label>
        <label>Режим (пример)<select defaultValue="" onChange={e => { const p = PRESETS[e.target.value]; if (p) setCfg({ ...cfg, rate: p.rate, base: p.base }) }}><option value="">Выбрать пример…</option>{PRESETS.map((p, i) => <option key={i} value={i}>{p.n}</option>)}</select></label>
        <div className="form2"><label>Ставка, %<input type="number" value={cfg.rate} onChange={sc('rate')} /></label>
          <label>База<select value={cfg.base} onChange={sc('base')}><option value="income">Доходы</option><option value="profit">Доходы минус расходы</option></select></label></div>
        <label>Срок оплаты: день месяца после конца квартала<input type="number" min="1" max="31" value={cfg.day} onChange={sc('day')} /></label>
        <p className="muted small">Ставку, базу и срок вводите по правилам вашей страны и режима. Значения по умолчанию — только пример.</p>
        <button className="btn ghost" onClick={() => setTip(advice({ inc, exp, tax, rate: cfg.rate, base: cfg.base, left }))}>💬 Совет по моим цифрам</button>
        {tip && <p className="tip">{tip}</p>}</div></div>
    <div className="card"><h3>Операции</h3>
      {!ops.length ? <p className="muted">Пока пусто. Добавьте первую операцию.</p> :
        <div className="scroll"><table><thead><tr><th>Дата</th><th>Описание</th><th>Сумма</th><th></th></tr></thead><tbody>
          {ops.map(o => <tr key={o.id}><td>{new Date(o.date).toLocaleDateString('ru-RU')}</td><td>{o.desc || '—'}</td>
            <td className={o.type === 'income' ? 'green' : 'orange'}>{o.type === 'income' ? '+' : '−'}{money(o.amount)}</td>
            <td><button className="x" onClick={() => setOps(ops.filter(x => x.id !== o.id))}>✕</button></td></tr>)}</tbody></table></div>}</div>
  </main>)
}
