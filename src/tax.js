let CUR = ''
export const setCur = c => { CUR = c || '' }
export const money = n => (Math.abs(n % 1) > 0.004 ? n.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : Math.round(n).toLocaleString('ru-RU')) + (CUR ? ' ' + CUR : '')
export const calcTax = (inc, exp, rate, base) =>
  Math.max(0, base === 'income' ? inc : inc - exp) * rate / 100
const quarter = d => Math.floor(d.getMonth() / 3)
export const sameQuarter = (iso, now = new Date()) => {
  const d = new Date(iso)
  return d.getFullYear() === now.getFullYear() && quarter(d) === quarter(now)
}
export const deadline = (day, now = new Date()) =>
  new Date(now.getFullYear(), quarter(now) * 3 + 3, Number(day) || 25)
export const daysLeft = d => Math.ceil((d - new Date()) / 864e5)
const MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
const NUM = /\d{1,3}(?:[ \u00a0]\d{3})+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?/g
const toNum = x => parseFloat(x.replace(/[\s\u00a0]/g, '').replace(',', '.'))
export function parseText(text) {
  const now = new Date(); let date = now, t = text
  const dm = t.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4}|\d{2})/)
  if (dm) { const y = +dm[3] < 100 ? 2000 + +dm[3] : +dm[3], d = new Date(y, +dm[2] - 1, +dm[1]); if (!isNaN(d)) date = d; t = t.replace(dm[0], ' ') }
  else { const tm = t.match(new RegExp(`(\\d{1,2})\\s+(${MONTHS.join('|')})`, 'i')); if (tm) { date = new Date(now.getFullYear(), MONTHS.indexOf(tm[2].toLowerCase()), +tm[1]); t = t.replace(tm[0], ' ') } }
  t = t.replace(/\d{1,2}:\d{2}/g, ' ').replace(/№\s*\d+/g, ' ')
  const skip = /налич|получен|сдач|внесен|cash|change/i, lines = t.split('\n')
  const nums = l => (l.match(NUM) || []).map(toNum).filter(n => n > 0)
  let amount = null
  for (const l of lines) if (/итог|к оплате|всего|сумма|total/i.test(l) && !skip.test(l)) { const n = nums(l); if (n.length) { amount = n[n.length - 1]; break } }
  if (!amount) amount = Math.max(0, ...lines.filter(l => !skip.test(l)).flatMap(nums))
  if (!amount) return null
  const income = /от клиента|поступлен|зачислен|перевод от|доход|оплата за (логотип|услуг|работ|проект|сайт)/i.test(text)
  const store = /кассовый чек|магазин|спасибо за покупку|расход|купил|хостинг|аренд|покупк|подписк/i.test(text)
  const type = income ? 'income' : store ? 'expense' : 'income'
  const no = text.match(/чек\s*№\s*(\d+)/i)
  const desc = !income && /кассовый чек|магазин/i.test(text) ? 'Магазин, чек' + (no ? ' №' + no[1] : '') : text.replace(/\s+/g, ' ').trim().slice(0, 60)
  return { id: Date.now(), date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`, amount: Math.round(amount * 100) / 100, type, desc }
}
export const advice = ({ inc, exp, tax, rate, base, left }) => {
  const t = []
  if (!inc) return 'Пока нет доходов за квартал. Добавьте первую операцию — и я посчитаю налог.'
  t.push(`Налог за квартал — ${money(tax)}: ставка ${rate}% от ${base === 'income' ? 'доходов' : 'доходов минус расходы'}.`)
  if (base === 'income' && exp > inc * 0.5) t.push('Расходов много: возможно, выгоднее база «доходы минус расходы» — уточните у налоговой.')
  t.push(left < 0 ? 'Срок оплаты прошёл — проверьте, нет ли пени.' : left <= 7 ? `До срока ${left} дн. — оплатите заранее.` : `До срока ${left} дн., запас есть.`)
  return t.join(' ')
}

export const PRESETS = [{ n: 'Самозанятый (НПД), 6%', rate: 6, base: 'income' }, { n: 'УСН «Доходы», 6%', rate: 6, base: 'income' }, { n: 'УСН «Доходы − расходы», 15%', rate: 15, base: 'profit' }]
export const forecast = (inc, exp, rate, base, y, qi) => {
  const a = new Date(y, qi * 3, 1), b = new Date(y, qi * 3 + 3, 1), n = new Date()
  if (n < a || n >= b || !inc) return null
  const f = (n - a) / (b - a); return calcTax(inc / f, exp / f, rate, base)
}
