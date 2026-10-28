import { ArrowLeft, Bot, CheckSquare, Copy, Square } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, fmtDate, fmtDay, SourceLink } from '../components/ui'
import { programById, programCatalog } from '../data/programs'
import { STAFF } from '../data/seed'
import { draftResponse, missingDetails, nextQuestions, summarize } from '../lib/copilot'
import { allowedTransitions, uid } from '../lib/inquiry'
import { matchPrograms } from '../lib/navigator'
import { getState, setState, updateInquiry, useDemo } from '../lib/store'
import type { Inquiry, Status } from '../lib/types'
import { StatusPill } from './charts'
import { nextAction } from './Inbox'

type Tab = 'case' | 'conversation' | 'work'

export default function InquiryDetail() {
  const { id = '' } = useParams()
  const { inquiries } = useDemo()
  const inq = inquiries.find((i) => i.id === id)
  const [tab, setTab] = useState<Tab>('conversation')

  // Opening marks it read (view state only — not an audited workflow action).
  useEffect(() => {
    if (!inq?.unread) return
    const s = getState()
    setState({ ...s, inquiries: s.inquiries.map((i) => (i.id === id ? { ...i, unread: false } : i)) })
  }, [id, inq?.unread])

  if (!inq) return <div className="panel p-10 text-center"><p>Inquiry {id} not found in this browser’s demo data.</p><Link className="mt-3 inline-block text-indigo-600 underline" to="/employee/inbox">Back to inbox</Link></div>

  const col = (t: Tab) => `${tab === t ? 'block' : 'hidden'} xl:block`
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/employee/inbox" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:underline"><ArrowLeft size={14} aria-hidden /> Inbox</Link>
          <h1 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-bold">{inq.id} <StatusPill status={inq.status} /> <Badge kind="Synthetic demo data" /></h1>
          <p className="text-sm text-slate-500">{inq.alias} · submitted {fmtDate(inq.createdAt)} via {inq.source} · <span className="font-medium">Next: {nextAction(inq)}</span></p>
        </div>
      </div>
      <div role="tablist" aria-label="Inquiry sections" className="flex gap-1 rounded-lg bg-slate-200/60 p-1 text-sm dark:bg-slate-800 xl:hidden">
        {(['case', 'conversation', 'work'] as Tab[]).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`flex-1 rounded-md px-3 py-1.5 capitalize ${tab === t ? 'bg-white font-semibold shadow dark:bg-slate-900' : ''}`} onClick={() => setTab(t)}>{t === 'work' ? 'Tasks & notes' : t}</button>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[250px_minmax(0,1fr)_290px] 2xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        <div className={col('case')}><CaseInfo inq={inq} /></div>
        <div className={`${col('conversation')} space-y-4`}><Transcript inq={inq} /><Recommendations inq={inq} /><Copilot inq={inq} /></div>
        <div className={`${col('work')} space-y-4`}><Tasks inq={inq} /><Notes inq={inq} /><Timeline inq={inq} /></div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</dt><dd className="mt-0.5 text-sm">{children}</dd></div>
}

function CaseInfo({ inq }: { inq: Inquiry }) {
  return (
    <section className="panel space-y-4 p-4" aria-label="Case information">
      <h2 className="text-sm font-semibold">Case info</h2>
      <label className="block text-xs font-medium">Status
        <select className="s-input mt-1" value={inq.status} onChange={(e) => updateInquiry(inq.id, () => ({ status: e.target.value as Status }), `Status changed to ${e.target.value}`)}>
          <option value={inq.status}>{inq.status}</option>
          {allowedTransitions(inq.status).map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <label className="block text-xs font-medium">Owner
        <select className="s-input mt-1" value={inq.assignee ?? ''} onChange={(e) => updateInquiry(inq.id, () => ({ assignee: e.target.value || undefined }), e.target.value ? `Assigned to ${e.target.value}` : 'Unassigned')}>
          <option value="">Unassigned</option>{STAFF.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <dl className="grid gap-3">
        <Field label="Follow-up timeframe (administrative)">{inq.urgency}</Field>
        <Field label="Name">{inq.alias}</Field>
        <Field label="Best way to reach">{inq.contactPref}</Field>
        {inq.phone && <Field label="Phone"><a className="font-semibold text-indigo-700 underline dark:text-indigo-300" href={`tel:${inq.phone.replace(/[^\d+]/g, '')}`}>{inq.phone}</a></Field>}
        {inq.email && <Field label="Email"><a className="font-semibold text-indigo-700 underline dark:text-indigo-300" href={`mailto:${inq.email}`}>{inq.email}</a></Field>}
        <Field label="Area">{inq.location ?? '—'}</Field>
        <Field label="Age group">{inq.ageBand ?? '—'}</Field>
        <Field label="Accessibility">{inq.accessibility ?? '—'}</Field>
        <Field label="Support categories"><div className="flex flex-wrap gap-1">{inq.categories.map((c) => <span key={c} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">{c}</span>)}</div></Field>
      </dl>
      <fieldset>
        <legend className="flex items-center gap-2 text-xs font-medium">Program tags <Badge kind="Staff-reviewed" /></legend>
        <div className="mt-2 space-y-1">
          {programCatalog.map((p) => {
            const on = inq.approvedPrograms.includes(p.id)
            return (
              <label key={p.id} className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={on} onChange={() => updateInquiry(inq.id, (i) => ({ approvedPrograms: on ? i.approvedPrograms.filter((x) => x !== p.id) : [...i.approvedPrograms, p.id] }), `${on ? 'Removed' : 'Approved'} program: ${p.name}`)} />
                {p.name}{inq.suggestedPrograms.includes(p.id) && <span className="text-violet-600 dark:text-violet-300" title="Suggested by AI">•AI</span>}
              </label>
            )
          })}
        </div>
      </fieldset>
      {inq.openQuestions.length > 0 && <div><p className="text-xs font-medium">Visitor’s open questions <Badge kind="Visitor message" /></p><ul className="mt-1 list-disc pl-4 text-xs">{inq.openQuestions.map((q) => <li key={q}>{q}</li>)}</ul></div>}
      {inq.nextSteps.length > 0 && <div><p className="text-xs font-medium">Requested next steps</p><ul className="mt-1 list-disc pl-4 text-xs">{inq.nextSteps.map((q) => <li key={q}>{q}</li>)}</ul></div>}
    </section>
  )
}

function Transcript({ inq }: { inq: Inquiry }) {
  return (
    <section className="panel p-4" aria-label="Visitor conversation">
      <h2 className="text-sm font-semibold">Full Care Navigator conversation</h2>
      {inq.originalText && (
        <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs dark:border-violet-800 dark:bg-violet-950/40">
          <p className="font-semibold">Visitor used “Help me describe this better” and approved the rewrite.</p>
          <p className="mt-1"><Badge kind="Visitor message">Original</Badge> {inq.originalText}</p>
          {inq.improvedText && <p className="mt-1"><Badge kind="AI suggestion">Suggested → accepted</Badge> {inq.improvedText}</p>}
        </div>
      )}
      <ol className="mt-3 space-y-3">
        {inq.transcript.map((m) => (
          <li key={m.id} className={m.from === 'visitor' ? 'pl-6' : 'pr-6'}>
            <div className="flex items-center gap-2"><Badge kind={m.from === 'visitor' ? 'Visitor message' : 'AI suggestion'} /><span className="text-[11px] text-slate-500">{fmtDate(m.at)}</span></div>
            <p className={`mt-1 whitespace-pre-wrap rounded-lg p-2.5 text-sm ${m.from === 'visitor' ? 'bg-sky-50 dark:bg-sky-950/40' : 'bg-slate-100 dark:bg-slate-800'}`}>{m.text}</p>
            {m.programIds && m.programIds.length > 0 && <p className="mt-1 text-[11px] text-slate-500">Cards shown: {m.programIds.map((id) => programById(id)?.name).join(', ')}</p>}
          </li>
        ))}
      </ol>
    </section>
  )
}

function Recommendations({ inq }: { inq: Inquiry }) {
  const reasons = new Map(matchPrograms(inq.summary, inq.categories, undefined, 10).map((m) => [m.program.id, m.reasons]))
  return (
    <section className="panel p-4" aria-label="AI recommendations">
      <h2 className="flex items-center gap-2 text-sm font-semibold">AI program suggestions & provenance <Badge kind="AI suggestion" /></h2>
      <p className="mt-1 text-xs text-slate-500">Deterministic rule-based matching over the curated catalog. Suggestions are not eligibility decisions.</p>
      <ul className="mt-3 space-y-2">
        {inq.suggestedPrograms.map((id) => {
          const p = programById(id)
          if (!p) return null
          const approved = inq.approvedPrograms.includes(id)
          return (
            <li key={id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{p.name}</p>
                {approved ? <Badge kind="Staff-reviewed">Approved</Badge> : <button className="s-btn text-xs" onClick={() => updateInquiry(inq.id, (i) => ({ approvedPrograms: [...i.approvedPrograms, id] }), `Approved program: ${p.name}`)}>Approve</button>}
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Why: {(reasons.get(id) ?? ['Matched in the original conversation']).join('; ')}</p>
              <p className="mt-1 flex flex-wrap items-center gap-3 text-xs"><SourceLink href={p.sourceUrl} /><span className="text-slate-500">Source verified {p.lastVerified}</span></p>
            </li>
          )
        })}
        {!inq.suggestedPrograms.length && <li className="text-sm text-slate-500">No programs were suggested.</li>}
      </ul>
    </section>
  )
}

const COPILOT_ACTIONS = ['Draft empathetic response', 'Summarize transcript', 'Suggest next questions', 'Missing admin details', 'Relevant official pages'] as const

function Copilot({ inq }: { inq: Inquiry }) {
  const { staff } = useDemo()
  const [output, setOutput] = useState('')
  const [kind, setKind] = useState('')
  const run = (a: (typeof COPILOT_ACTIONS)[number]) => {
    setKind(a)
    setOutput(
      a === 'Draft empathetic response' ? draftResponse(inq, staff?.name ?? 'Staff')
        : a === 'Summarize transcript' ? summarize(inq)
          : a === 'Suggest next questions' ? nextQuestions(inq).map((q) => `• ${q}`).join('\n')
            : a === 'Missing admin details' ? (missingDetails(inq).map((d) => `• ${d}`).join('\n') || 'No obvious gaps.')
              : (inq.approvedPrograms.length ? inq.approvedPrograms : inq.suggestedPrograms).map((id) => `• ${programById(id)?.name}: ${programById(id)?.sourceUrl}`).join('\n'),
    )
  }
  return (
    <section className="panel p-4" aria-label="AI Copilot">
      <h2 className="flex items-center gap-2 text-sm font-semibold"><Bot size={16} aria-hidden /> AI Copilot <Badge kind="AI suggestion">Drafts only</Badge></h2>
      <p className="mt-1 text-xs text-slate-500">Simulated, deterministic outputs. Nothing is sent, assigned, or approved automatically — review and edit before using.</p>
      <div className="mt-3 flex flex-wrap gap-2">{COPILOT_ACTIONS.map((a) => <button key={a} className="s-btn text-xs" onClick={() => run(a)}>{a}</button>)}</div>
      {output && (
        <div className="mt-3">
          <label className="text-xs font-medium">{kind} — editable draft
            <textarea className="s-input mt-1 font-mono text-xs" rows={9} value={output} onChange={(e) => setOutput(e.target.value)} />
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <button className="s-btn-primary text-xs" onClick={() => { updateInquiry(inq.id, (i) => ({ notes: [...i.notes, { id: uid(), author: staff?.name ?? 'Staff', text: `[Reviewed copilot draft: ${kind}]\n${output}`, at: new Date().toISOString() }] }), `Saved reviewed copilot draft (${kind}) as note`); setOutput('') }}>Approve & save as internal note</button>
            <button className="s-btn text-xs" onClick={() => navigator.clipboard?.writeText(output).catch(() => {})}><Copy size={12} aria-hidden /> Copy</button>
            <button className="s-btn text-xs" onClick={() => setOutput('')}>Discard</button>
          </div>
        </div>
      )}
    </section>
  )
}

function Tasks({ inq }: { inq: Inquiry }) {
  const { staff } = useDemo()
  const tomorrow = new Date(Date.now() + 86400_000).toISOString().slice(0, 10)
  const [title, setTitle] = useState('')
  const [due, setDue] = useState(tomorrow)
  const add = () => {
    if (!title.trim()) return
    updateInquiry(inq.id, (i) => ({ tasks: [...i.tasks, { id: uid(), title: title.trim(), due: new Date(`${due}T17:00:00`).toISOString(), done: false, createdBy: staff?.name ?? 'Staff' }] }), `Created task: ${title.trim()} (due ${due})`)
    setTitle('')
  }
  const toggle = (tid: string) => {
    const t = inq.tasks.find((x) => x.id === tid)!
    updateInquiry(inq.id, (i) => ({ tasks: i.tasks.map((x) => (x.id === tid ? { ...x, done: !x.done, doneAt: x.done ? undefined : new Date().toISOString() } : x)) }), `${t.done ? 'Reopened' : 'Completed'} task: ${t.title}`)
  }
  return (
    <section className="panel p-4" aria-label="Follow-up tasks">
      <h2 className="text-sm font-semibold">Follow-up tasks</h2>
      <ul className="mt-2 space-y-1">
        {inq.tasks.map((t) => {
          const overdue = !t.done && new Date(t.due) < new Date()
          return (
            <li key={t.id}>
              <button className="flex w-full items-start gap-2 rounded p-1 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => toggle(t.id)} aria-pressed={t.done}>
                {t.done ? <CheckSquare size={16} className="mt-0.5 text-emerald-600" aria-hidden /> : <Square size={16} className="mt-0.5" aria-hidden />}
                <span className={t.done ? 'text-slate-400 line-through' : ''}>{t.title}<span className={`block text-[11px] ${overdue ? 'font-semibold text-rose-600' : 'text-slate-500'}`}>Due {fmtDay(t.due)}{overdue ? ' · overdue' : ''}</span></span>
              </button>
            </li>
          )
        })}
        {!inq.tasks.length && <li className="text-xs text-slate-500">No tasks yet.</li>}
      </ul>
      <form className="mt-3 grid gap-2" onSubmit={(e) => { e.preventDefault(); add() }}>
        <label className="text-xs"><span className="sr-only">Task title</span><input className="s-input" placeholder="New follow-up task…" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <div className="flex gap-2"><label className="flex-1 text-xs"><span className="sr-only">Due date</span><input type="date" className="s-input" value={due} onChange={(e) => setDue(e.target.value)} required /></label><button className="s-btn-primary" disabled={!title.trim()}>Add</button></div>
      </form>
    </section>
  )
}

function Notes({ inq }: { inq: Inquiry }) {
  const { staff } = useDemo()
  const [text, setText] = useState('')
  return (
    <section className="panel p-4" aria-label="Internal notes">
      <h2 className="flex items-center gap-2 text-sm font-semibold">Internal notes <Badge kind="Staff-reviewed" /></h2>
      <ul className="mt-2 space-y-2">
        {inq.notes.map((n) => <li key={n.id} className="rounded-lg bg-emerald-50/60 p-2 text-xs dark:bg-emerald-950/30"><p className="whitespace-pre-wrap">{n.text}</p><p className="mt-1 text-slate-500">{n.author} · {fmtDate(n.at)}</p></li>)}
        {!inq.notes.length && <li className="text-xs text-slate-500">No notes yet.</li>}
      </ul>
      <form className="mt-3" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; updateInquiry(inq.id, (i) => ({ notes: [...i.notes, { id: uid(), author: staff?.name ?? 'Staff', text: text.trim(), at: new Date().toISOString() }] }), 'Added internal note'); setText('') }}>
        <label className="text-xs"><span className="sr-only">New internal note</span><textarea className="s-input" rows={2} placeholder="Add an internal note (synthetic data only)…" value={text} onChange={(e) => setText(e.target.value)} /></label>
        <button className="s-btn mt-2" disabled={!text.trim()}>Add note</button>
      </form>
    </section>
  )
}

function Timeline({ inq }: { inq: Inquiry }) {
  return (
    <section className="panel p-4" aria-label="Activity timeline">
      <h2 className="text-sm font-semibold">Activity timeline</h2>
      <ol className="mt-2 space-y-2 border-l border-slate-200 pl-3 dark:border-slate-700">
        {[...inq.activity].reverse().map((a) => <li key={a.id} className="text-xs"><p>{a.text}</p><p className="text-slate-500">{a.actor} · {fmtDate(a.at)}</p></li>)}
      </ol>
    </section>
  )
}
