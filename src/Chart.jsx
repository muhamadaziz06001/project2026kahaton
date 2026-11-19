import { useEffect, useState } from 'react'
import { money } from './tax.js'
export function Num({ v }) {
  const [x, setX] = useState(0)
  useEffect(() => { let f, s = performance.now(), a = x
    const t = n => { const p = Math.min(1, (n - s) / 600); setX(a + (v - a) * (1 - Math.pow(1 - p, 3))); if (p < 1) f = requestAnimationFrame(t) }
    f = requestAnimationFrame(t); return () => cancelAnimationFrame(f) }, [v])
  return money(Math.round(x))
}
const M = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']
export default function Chart({ ops, qi, y }) {
  const ms = [0, 1, 2].map(i => qi * 3 + i)
  const d = ms.map(m => { const o = ops.filter(o => { const t = new Date(o.date); return t.getFullYear() === y && t.getMonth() === m })
    return { m, i: o.filter(x => x.type === 'income').reduce((s, x) => s + x.amount, 0), e: o.filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0) } })
  const mx = Math.max(1, ...d.flatMap(x => [x.i, x.e]))
  return (<svg viewBox="0 0 400 170" className="chart" role="img" aria-label="Доходы и расходы по месяцам">
    {d.map((x, k) => { const bx = 40 + k * 120, hi = x.i / mx * 110, he = x.e / mx * 110
      return <g key={x.m}>
        <rect className="bar" x={bx} y={130 - hi} width="34" height={hi} rx="5" fill="#5ce1a8" />
        <rect className="bar" x={bx + 40} y={130 - he} width="34" height={he} rx="5" fill="#f08a5d" />
        <text x={bx + 37} y="152" textAnchor="middle" fill="#8fa89a" fontSize="12">{M[x.m]}</text></g> })}
    <line x1="20" x2="380" y1="130" y2="130" stroke="#1e3a2e" />
  </svg>)
}
