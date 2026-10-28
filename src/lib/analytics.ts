import { programById } from '../data/programs'
import { STATUSES, type Inquiry } from './types'

const DAY = 86400_000
const dayKey = (d: Date) => d.toISOString().slice(0, 10)

export interface Kpis { newCount: number; needsReview: number; followUpsDue: number; assigned: number; resolved: number; total: number }

export function kpis(list: Inquiry[], now = new Date()): Kpis {
  const endOfToday = new Date(now); endOfToday.setHours(23, 59, 59, 999)
  return {
    total: list.length,
    newCount: list.filter((i) => i.status === 'New').length,
    needsReview: list.filter((i) => i.status === 'Needs Review').length,
    followUpsDue: list.reduce((n, i) => n + i.tasks.filter((t) => !t.done && new Date(t.due) <= endOfToday).length, 0),
    assigned: list.filter((i) => i.assignee && i.status !== 'Closed').length,
    resolved: list.filter((i) => i.status === 'Closed').length,
  }
}

/** Inquiry counts per calendar day (UTC) for the last `days` days, oldest first. */
export function volumeByDay(list: Inquiry[], days = 14, now = new Date()) {
  const buckets = new Map<string, number>()
  for (let d = days - 1; d >= 0; d--) buckets.set(dayKey(new Date(now.getTime() - d * DAY)), 0)
  for (const i of list) {
    const k = i.createdAt.slice(0, 10)
    if (buckets.has(k)) buckets.set(k, buckets.get(k)! + 1)
  }
  return [...buckets].map(([label, value]) => ({ label, value }))
}

export function volumeByWeek(list: Inquiry[], weeks = 6, now = new Date()) {
  return Array.from({ length: weeks }, (_, w) => {
    const end = now.getTime() - (weeks - 1 - w) * 7 * DAY
    const start = end - 7 * DAY
    return { label: `Wk of ${dayKey(new Date(start + DAY)).slice(5)}`, value: list.filter((i) => { const t = Date.parse(i.createdAt); return t > start && t <= end }).length }
  })
}

const countBy = (keys: string[]) => {
  const m = new Map<string, number>()
  keys.forEach((k) => m.set(k, (m.get(k) ?? 0) + 1))
  return [...m].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

export const byCategory = (list: Inquiry[]) => countBy(list.flatMap((i) => i.categories))
export const byStatus = (list: Inquiry[]) => STATUSES.map((s) => ({ label: s, value: list.filter((i) => i.status === s).length }))
/** Uses staff-approved programs when present, otherwise the AI suggestion's top match. */
export const byProgram = (list: Inquiry[]) =>
  countBy(list.flatMap((i) => (i.approvedPrograms.length ? i.approvedPrograms : i.suggestedPrograms.slice(0, 1))).map((id) => programById(id)?.name ?? id))
export const workload = (list: Inquiry[]) => countBy(list.filter((i) => i.status !== 'Closed').map((i) => i.assignee ?? 'Unassigned'))

/** Mean hours from submission to first staff action, over inquiries that have one. */
export function avgFirstResponseHours(list: Inquiry[]): number | null {
  const xs = list.filter((i) => i.firstResponseAt).map((i) => (Date.parse(i.firstResponseAt!) - Date.parse(i.createdAt)) / 3600_000)
  return xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null
}

/** This period vs the previous period of equal length, for "▲ 12% vs last week" style trends. */
export function periodChange(list: Inquiry[], pick: (i: Inquiry) => string | undefined, days = 7, now = new Date()) {
  const t = now.getTime()
  const inRange = (from: number, to: number) => list.filter((i) => { const v = pick(i); if (!v) return false; const x = Date.parse(v); return x > from && x <= to }).length
  const current = inRange(t - days * DAY, t)
  const previous = inRange(t - 2 * days * DAY, t - days * DAY)
  return { current, previous, pct: previous ? Math.round(((current - previous) / previous) * 100) : null }
}

/** Mean first-response hours per week (oldest first); null where a week has no responses. */
export function responseTimeByWeek(list: Inquiry[], weeks = 6, now = new Date()) {
  return Array.from({ length: weeks }, (_, w) => {
    const end = now.getTime() - (weeks - 1 - w) * 7 * DAY
    const start = end - 7 * DAY
    const xs = list.filter((i) => i.firstResponseAt && Date.parse(i.createdAt) > start && Date.parse(i.createdAt) <= end)
    return { label: `Wk of ${dayKey(new Date(start + DAY)).slice(5)}`, value: avgFirstResponseHours(xs) }
  })
}

/** Daily counts of new inquiries and closures, for the "coming in vs. resolved" trend. */
export function inVsOut(list: Inquiry[], days = 30, now = new Date()) {
  const rows = volumeByDay(list, days, now).map((d) => ({ label: d.label, received: d.value, resolved: 0 }))
  const idx = new Map(rows.map((r, n) => [r.label, n]))
  for (const i of list) {
    if (i.status !== 'Closed') continue
    const k = i.updatedAt.slice(0, 10)
    if (idx.has(k)) rows[idx.get(k)!].resolved++
  }
  return rows
}

export function satisfaction(list: Inquiry[]) {
  const r = list.filter((i) => i.rating).map((i) => i.rating!)
  return { count: r.length, avg: r.length ? Math.round((r.reduce((a, b) => a + b, 0) / r.length) * 10) / 10 : null }
}
