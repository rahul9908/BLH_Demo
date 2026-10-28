import type { ReactNode } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '../components/ui'

export interface Datum { label: string; value: number }

// Validated reference palette (dataviz skill): fixed categorical order, never cycled.
export const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300']

/** Hero number + plain-language trend ("▲ 12% vs last week") + tiny sparkline. */
export function Kpi({ label, value, hint, trend, goodWhenUp = true, spark }: { label: string; value: ReactNode; hint?: string; trend?: number | null; goodWhenUp?: boolean; spark?: Datum[] }) {
  const up = (trend ?? 0) > 0
  const good = trend === 0 || trend == null ? null : up === goodWhenUp
  return (
    <div className="panel flex flex-col p-4">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className="text-3xl font-bold tabular-nums">{value}</p>
        {spark && (
          <div className="h-9 w-20" aria-hidden>
            <ResponsiveContainer><AreaChart data={spark} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}><Area dataKey="value" stroke={SERIES[0]} strokeWidth={2} fill={SERIES[0]} fillOpacity={0.12} isAnimationActive={false} dot={false} /></AreaChart></ResponsiveContainer>
          </div>
        )}
      </div>
      {trend != null && (
        <p className={`mt-1 text-xs font-semibold ${good === null ? 'text-slate-500' : good ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
          {trend === 0 ? '■ Same as' : up ? `▲ ${trend}% more than` : `▼ ${Math.abs(trend)}% less than`} last week
        </p>
      )}
      {hint && <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  )
}

const tooltipStyle = { borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 8px 24px rgba(15,23,42,.12)' }
const axis = { fontSize: 11, fill: '#64748b' }
const short = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

/** Two series over time with crosshair tooltip and legend. */
export function TrendArea({ data, keys }: { data: Record<string, string | number>[]; keys: { key: string; name: string }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>{keys.map((k, n) => <linearGradient key={k.key} id={`g-${k.key}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={SERIES[n]} stopOpacity={0.25} /><stop offset="1" stopColor={SERIES[n]} stopOpacity={0} /></linearGradient>)}</defs>
          <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="label" tickFormatter={short} tick={axis} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => short(String(l))} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          {keys.map((k, n) => <Area key={k.key} type="monotone" dataKey={k.key} name={k.name} stroke={SERIES[n]} strokeWidth={2} fill={`url(#g-${k.key})`} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />)}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Share of a whole: donut with the total in the middle and a labeled legend (identity never color-only). */
export function Donut({ data, centerLabel }: { data: Datum[]; centerLabel: string }) {
  const total = data.reduce((n, d) => n + d.value, 0)
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius="64%" outerRadius="100%" paddingAngle={2} stroke="none" isAnimationActive={false}>
              {data.map((d, n) => <Cell key={d.label} fill={SERIES[n % SERIES.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-bold tabular-nums">{total}</span><span className="text-[11px] text-slate-500">{centerLabel}</span></div>
      </div>
      <ul className="w-full space-y-1.5 text-sm">
        {data.map((d, n) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SERIES[n % SERIES.length] }} aria-hidden />
            <span className="flex-1">{d.label}</span>
            <span className="font-semibold tabular-nums">{d.value}</span>
            <span className="w-10 text-right text-xs text-slate-500">{total ? Math.round((d.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Vertical bars over time with hover tooltip (single series). */
export function TimeBars({ data, name, unit = '' }: { data: { label: string; value: number | null }[]; name: string; unit?: string }) {
  return (
    <div className="h-56">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(42,120,214,.08)' }} formatter={(v) => [`${v ?? '—'}${unit}`, name]} />
          <Bar dataKey="value" name={name} fill={SERIES[0]} radius={[4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ChartCard({ title, children, definition }: { title: string; children: ReactNode; definition?: string }) {
  return (
    <section className="panel p-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Badge kind="Sample data" />
      </div>
      {definition && <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{definition}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function BarList({ data, color = SERIES[0] }: { data: Datum[]; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  if (!data.length) return <p className="text-sm text-slate-500">No data yet.</p>
  return (
    <ul className="space-y-2">
      {data.map((d) => (
        <li key={d.label} className="text-sm">
          <div className="flex justify-between"><span>{d.label}</span><span className="font-semibold tabular-nums">{d.value}</span></div>
          <div className="mt-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden><div className="h-2.5 rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: color }} /></div>
        </li>
      ))}
    </ul>
  )
}

export function Columns({ data, label }: { data: Datum[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <figure>
      <div className="flex h-40 items-end gap-1" role="img" aria-label={`${label}: ${data.map((d) => `${d.label} ${d.value}`).join(', ')}`}>
        {data.map((d) => (
          <div key={d.label} className="group relative flex flex-1 flex-col items-center justify-end" title={`${d.label}: ${d.value}`}>
            <span className="mb-0.5 text-[10px] tabular-nums text-slate-500 opacity-0 group-hover:opacity-100">{d.value}</span>
            <div className="w-full rounded-t bg-indigo-500" style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 2 : 0 }} />
          </div>
        ))}
      </div>
      <figcaption className="mt-1 flex justify-between text-[10px] text-slate-500"><span>{data[0]?.label}</span><span>{data.at(-1)?.label}</span></figcaption>
    </figure>
  )
}

export function DataTable({ data, head }: { data: Datum[]; head: [string, string] }) {
  return (
    <table className="w-full text-left text-xs">
      <thead><tr className="border-b border-slate-200 dark:border-slate-700"><th className="py-1 font-semibold">{head[0]}</th><th className="py-1 text-right font-semibold">{head[1]}</th></tr></thead>
      <tbody>{data.map((d) => <tr key={d.label} className="border-b border-slate-100 dark:border-slate-800"><td className="py-1">{d.label}</td><td className="py-1 text-right tabular-nums">{d.value}</td></tr>)}</tbody>
    </table>
  )
}

const STATUS_STYLE: Record<string, string> = {
  New: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
  'Needs Review': 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  'Awaiting Information': 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
  'In Progress': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  Closed: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
}

export function StatusPill({ status }: { status: string }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[status]}`}>{status}</span>
}
