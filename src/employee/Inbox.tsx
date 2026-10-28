import { Download, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Badge, fmtDate, fmtDay } from '../components/ui'
import { programById, programCatalog } from '../data/programs'
import { STAFF } from '../data/seed'
import { download, toCsv } from '../lib/copilot'
import { canTransition } from '../lib/inquiry'
import { updateInquiry, useDemo } from '../lib/store'
import { STATUSES, URGENCIES, type Inquiry, type Status } from '../lib/types'
import { StatusPill } from './charts'

const URGENCY_RANK = { 'This week': 0, 'Within a few weeks': 1, 'Just exploring': 2 }
const nextDue = (i: Inquiry) => i.tasks.filter((t) => !t.done).map((t) => t.due).sort()[0]

export function nextAction(i: Inquiry): string {
  if (i.status === 'Closed') return '—'
  if (!i.assignee) return 'Review & assign an owner'
  const due = i.tasks.filter((t) => !t.done).sort((a, b) => a.due.localeCompare(b.due))[0]
  if (due) return `${due.title} (due ${fmtDay(due.due)})`
  if (i.status === 'Awaiting Information') return 'Waiting on visitor details'
  if (i.status === 'Needs Review') return 'Review AI suggestions'
  return 'Create a follow-up task'
}

export default function Inbox() {
  const { inquiries } = useDemo()
  const [params, setParams] = useSearchParams()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const get = (k: string) => params.get(k) ?? ''
  const set = (k: string, v: string) => { const p = new URLSearchParams(params); if (v) p.set(k, v); else p.delete(k); setParams(p, { replace: true }) }
  const dense = get('density') === 'compact'

  const list = useMemo(() => {
    const q = get('q').toLowerCase()
    const since = Number(get('days')) || 0
    const out = inquiries.filter((i) =>
      (!q || [i.id, i.alias, i.summary, i.location, ...i.transcript.map((m) => m.text), ...i.notes.map((n) => n.text)].join(' ').toLowerCase().includes(q)) &&
      (!get('status') || i.status === get('status')) &&
      (!get('program') || [...i.suggestedPrograms, ...i.approvedPrograms].includes(get('program'))) &&
      (!get('assignee') || (get('assignee') === 'Unassigned' ? !i.assignee : i.assignee === get('assignee'))) &&
      (!get('urgency') || i.urgency === get('urgency')) &&
      (!get('source') || i.source === get('source')) &&
      (!get('unread') || i.unread) &&
      (!since || Date.now() - Date.parse(i.createdAt) <= since * 86400_000))
    const sort = get('sort') || 'newest'
    return out.sort((a, b) =>
      sort === 'priority' ? URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] || b.createdAt.localeCompare(a.createdAt)
        : sort === 'due' ? (nextDue(a) ?? '9').localeCompare(nextDue(b) ?? '9')
          : b.createdAt.localeCompare(a.createdAt))
  }, [inquiries, params])

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const allSelected = list.length > 0 && list.every((i) => selected.has(i.id))

  function bulkStatus(to: Status) {
    let ok = 0, skipped = 0
    for (const id of selected) {
      const i = inquiries.find((x) => x.id === id)!
      if (canTransition(i.status, to)) { updateInquiry(id, () => ({ status: to }), `Status changed to ${to} (bulk)`); ok++ } else skipped++
    }
    setMessage(`Updated ${ok}${skipped ? `, skipped ${skipped} (transition not allowed)` : ''}.`)
    setSelected(new Set())
  }
  function bulkAssign(name: string) {
    for (const id of selected) updateInquiry(id, () => ({ assignee: name }), `Assigned to ${name} (bulk)`)
    setMessage(`Assigned ${selected.size} to ${name}.`)
    setSelected(new Set())
  }

  const exportRows = selected.size ? list.filter((i) => selected.has(i.id)) : list
  const filterSelect = (key: string, label: string, options: (string | [string, string])[]) => (
    <label className="text-xs"><span className="sr-only">{label}</span>
      <select className="s-input" value={get(key)} onChange={(e) => set(key, e.target.value)} aria-label={label}>
        <option value="">{label}: all</option>
        {options.map((o) => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>)}
      </select>
    </label>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inbox</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{list.length} of {inquiries.length} inquiries <Badge kind="Synthetic demo data" /></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="s-btn" onClick={() => set('density', dense ? '' : 'compact')} aria-pressed={dense}>{dense ? 'Comfortable' : 'Compact'} view</button>
          <button className="s-btn" onClick={() => download('demo-inquiries.csv', toCsv(exportRows), 'text/csv')}><Download size={14} aria-hidden /> CSV</button>
          <button className="s-btn" onClick={() => download('demo-inquiries.json', JSON.stringify({ notice: 'Synthetic demo data only', inquiries: exportRows }, null, 2), 'application/json')}><Download size={14} aria-hidden /> JSON</button>
        </div>
      </div>

      <div className="panel space-y-3 p-3">
        <label className="relative block">
          <span className="sr-only">Search inquiries</span>
          <Search size={16} className="absolute left-2.5 top-2 text-slate-400" aria-hidden />
          <input className="s-input py-2 pl-8 text-base" placeholder="Search by name, words in the request, or notes…" value={get('q')} onChange={(e) => set('q', e.target.value)} />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Show requests by status">
          {(['', ...STATUSES] as string[]).map((s) => {
            const n = s ? inquiries.filter((i) => i.status === s).length : inquiries.length
            const on = get('status') === s
            return <button key={s || 'all'} onClick={() => set('status', s)} aria-pressed={on} className={`rounded-full px-3 py-1.5 text-sm font-medium ${on ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'}`}>{s || 'All'} <span className="opacity-70">{n}</span></button>
          })}
        </div>
        <details>
          <summary className="cursor-pointer text-sm font-medium text-indigo-700 dark:text-indigo-300">More filters & sorting</summary>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {filterSelect('program', 'Program', programCatalog.map((p) => [p.id, p.name]))}
          {filterSelect('assignee', 'Owner', ['Unassigned', ...STAFF])}
          {filterSelect('urgency', 'Follow-up', [...URGENCIES])}
          {filterSelect('days', 'Date', [['1', 'Last 24 hours'], ['7', 'Last 7 days'], ['30', 'Last 30 days']])}
          {filterSelect('source', 'Source', ['Care Navigator', 'Seed data'])}
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!get('unread')} onChange={(e) => set('unread', e.target.checked ? '1' : '')} /> Unread only</label>
          <label className="text-xs"><span className="sr-only">Sort</span>
            <select className="s-input" value={get('sort') || 'newest'} onChange={(e) => set('sort', e.target.value)} aria-label="Sort">
              <option value="newest">Sort: newest</option><option value="priority">Sort: follow-up urgency</option><option value="due">Sort: follow-up due</option>
            </select>
          </label>
        </div>
        </details>
      </div>

      {selected.size > 0 && (
        <div className="panel flex flex-wrap items-center gap-2 p-3 text-sm" role="region" aria-label="Bulk actions">
          <strong>{selected.size} selected</strong>
          <select className="s-input w-auto" value="" onChange={(e) => e.target.value && bulkStatus(e.target.value as Status)} aria-label="Set status for selected"><option value="">Set status…</option>{STATUSES.filter((s) => s !== 'New').map((s) => <option key={s}>{s}</option>)}</select>
          <select className="s-input w-auto" value="" onChange={(e) => e.target.value && bulkAssign(e.target.value)} aria-label="Assign selected"><option value="">Assign to…</option>{STAFF.map((s) => <option key={s}>{s}</option>)}</select>
          <button className="s-btn" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}
      {message && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}

      <div className="panel overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700">
          <input type="checkbox" aria-label="Select all visible" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(list.map((i) => i.id)))} />
          <span>Inquiry</span>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {list.map((i) => (
            <li key={i.id} className={`flex gap-3 px-3 ${dense ? 'py-1.5' : 'py-3'} ${i.unread ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''}`}>
              <input type="checkbox" className="mt-1" aria-label={`Select ${i.id}`} checked={selected.has(i.id)} onChange={() => toggle(i.id)} />
              <Link to={`/employee/inquiry/${i.id}`} className="grid min-w-0 flex-1 gap-1 md:grid-cols-[160px_1fr_220px] md:gap-4">
                <div className="min-w-0">
                  <p className={`text-sm ${i.unread ? 'font-bold' : 'font-medium'}`}>{i.id}{i.unread && <span className="sr-only"> (unread)</span>}</p>
                  <p className="truncate text-xs text-slate-500">{i.alias}{i.phone && ` · ${i.phone}`}</p>
                  {!dense && <div className="mt-1 flex flex-wrap gap-1"><StatusPill status={i.status} />{i.urgency === 'This week' && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-800 dark:bg-rose-900/50 dark:text-rose-200">This week</span>}</div>}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm ${dense ? 'truncate' : 'line-clamp-2'}`}>{i.summary}</p>
                  {!dense && <p className="mt-1 truncate text-xs text-violet-700 dark:text-violet-300">AI match: {i.suggestedPrograms.map((id) => programById(id)?.name).join(' · ') || 'none'}</p>}
                </div>
                <div className="text-xs text-slate-500">
                  {dense && <StatusPill status={i.status} />}
                  <p className="truncate"><span className="font-medium text-slate-700 dark:text-slate-300">Next:</span> {nextAction(i)}</p>
                  {!dense && <p className="truncate">Latest: {i.activity.at(-1)?.text} · {fmtDate(i.updatedAt)}</p>}
                  {!dense && <p>{i.assignee ?? 'Unassigned'}</p>}
                </div>
              </Link>
            </li>
          ))}
          {!list.length && <li className="p-10 text-center text-sm text-slate-500">No inquiries match these filters. <button className="underline" onClick={() => setParams({})}>Clear filters</button></li>}
        </ul>
      </div>
    </div>
  )
}
