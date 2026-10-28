import { useState } from 'react'
import { Badge, fmtDate, SourceLink } from '../components/ui'
import { programCatalog } from '../data/programs'
import { audit, getState, setState, useDemo } from '../lib/store'

export default function Knowledge() {
  const { kbReviews = {}, staff } = useDemo()
  const [q, setQ] = useState('')
  const list = programCatalog.filter((p) => !q || `${p.name} ${p.description} ${p.supportAreas.join(' ')}`.toLowerCase().includes(q.toLowerCase()))
  const review = (id: string, status: 'Review requested' | 'Re-verified (demo)') => {
    const s = getState()
    const who = staff ? `${staff.name} (${staff.role})` : 'Demo user'
    setState({ ...s, kbReviews: { ...kbReviews, [id]: { status, by: who, at: new Date().toISOString() } }, audit: [audit(who, `Knowledge base: ${status} for ${id}`), ...s.audit] })
  }
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Knowledge base</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">The curated program catalog that powers navigator matching. Content is paraphrased from public pages; edits go through a mock review workflow (no public edits).</p>
      </div>
      <label className="block max-w-md"><span className="sr-only">Search programs</span><input className="s-input" placeholder="Search programs…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      <ul className="grid gap-4 lg:grid-cols-2">
        {list.map((p) => {
          const r = kbReviews[p.id]
          const isAdminish = staff?.role !== 'Case Coordinator'
          return (
            <li key={p.id} className="panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-semibold">{p.name}</h2>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] dark:bg-slate-800">Source last verified {p.lastVerified}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{p.description}</p>
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer font-medium">Support areas, caveats & matching rules</summary>
                <ul className="mt-2 list-disc pl-4">{p.supportAreas.map((s) => <li key={s}>{s}</li>)}</ul>
                <p className="mt-2 font-medium">Caveats</p><ul className="list-disc pl-4">{p.caveats.map((s) => <li key={s}>{s}</li>)}</ul>
                <p className="mt-2"><span className="font-medium">Categories:</span> {p.categories.join(', ')}</p>
                <p><span className="font-medium">Keywords:</span> {p.keywords.map((k) => k.trim()).join(', ')}</p>
                <p className="mt-1"><span className="font-medium">Contact:</span> {p.contact}</p>
              </details>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <SourceLink href={p.sourceUrl} />
                {r && <Badge kind="Staff-reviewed">{r.status} · {r.by.split(' (')[0]} · {fmtDate(r.at)}</Badge>}
              </div>
              <div className="mt-3 flex gap-2">
                <button className="s-btn text-xs" onClick={() => review(p.id, 'Review requested')}>Request content review</button>
                <button className="s-btn text-xs" disabled={!isAdminish} title={isAdminish ? '' : 'Supervisor or Administrator role (simulated)'} onClick={() => review(p.id, 'Re-verified (demo)')}>Mark re-verified</button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
