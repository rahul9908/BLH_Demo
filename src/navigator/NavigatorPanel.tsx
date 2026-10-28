import { AlertTriangle, CheckCircle2, ChevronRight, Download, Minus, Phone, Plus, RotateCcw, Send, Sparkles, Star, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, SourceLink } from '../components/ui'
import { officialContact, programById } from '../data/programs'
import { AGE_BANDS, STORY_ORIGINAL, storyInquiry } from '../data/seed'
import { download } from '../lib/copilot'
import { inquiryFromDraft, uid, validateDraft } from '../lib/inquiry'
import { composeAnswer, detectEmergency, detectInjection, detectSensitive, improveText, inferCategories, matchPrograms } from '../lib/navigator'
import { addInquiry, emptyNav, nextSeq, setNav, updateInquiry, useDemo, type NavSession } from '../lib/store'
import { CATEGORIES, CONTACT_PREFS, URGENCIES, type Category, type ContactPref, type Draft, type Message, type Urgency } from '../lib/types'

const STARTERS: [string, Category[]][] = [
  ['Support for an older family member', ['Aging']],
  ['Disability services', ['Disability']],
  ['Housing assistance', ['Housing']],
  ['Transportation help', ['Transportation']],
  ['After a hospital discharge', ['Hospital discharge']],
  ['Not sure where to start', []],
]

const QUESTIONS: { key: keyof NavSession['answers']; text: string; options: string[] }[] = [
  { key: 'location', text: 'Which general area is this for? A city or county is plenty — no street address needed.', options: ["Prince George's County", 'Anne Arundel County', 'Montgomery County', 'Howard County', 'Baltimore area', 'Somewhere else in Maryland'] },
  { key: 'ageBand', text: 'Which age group best describes the person who needs support?', options: AGE_BANDS },
  { key: 'urgency', text: 'How soon would you like an administrative follow-up? (This is not for emergencies.)', options: [...URGENCIES] },
  { key: 'contactPref', text: 'How would you like us to get back to you?', options: CONTACT_PREFS.slice(0, 3) },
  { key: 'accessibility', text: 'Any accessibility or language needs for that follow-up?', options: ['None', 'Spanish-speaking staff', 'Interpreter', 'Large print or screen reader friendly'] },
]
const DRAFT_STEP = 99
const now = () => new Date().toISOString()
const msg = (from: Message['from'], text: string, extra: Partial<Message> = {}): Message => ({ id: uid(), from, text, at: now(), ...extra })

export default function NavigatorPanel({ open, onClose, contextProgramId }: { open: boolean; onClose: () => void; contextProgramId?: string }) {
  const { nav } = useDemo()
  const [input, setInput] = useState('')
  const [suggestion, setSuggestion] = useState<{ original: string; suggested: string } | null>(null)
  const [acceptedFrom, setAcceptedFrom] = useState<string>()
  const [warning, setWarning] = useState<string[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [scale, setScale] = useState(1.15) // larger default for older visitors
  const [showContact, setShowContact] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const contextProgram = contextProgramId ? programById(contextProgramId) : undefined

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => { if (nav.messages.length || nav.submittedId) scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }) }, [nav.messages.length, draft, nav.submittedId])

  // Rebuild the draft when the panel loads into draft stage (e.g. after a refresh).
  useEffect(() => { if (nav.step === DRAFT_STEP && !draft && !nav.submittedId) setDraft(buildDraft(nav)) }, [nav, draft])

  const matchReasons = useMemo(() => new Map(matchPrograms(nav.description ?? '', nav.categories, contextProgramId, 10).map((m) => [m.program.id, m.reasons])), [nav.description, nav.categories, contextProgramId])

  function send(text: string, categories: Category[] = []) {
    const clean = text.trim()
    if (!clean) return
    const sensitive = detectSensitive(clean)
    if (sensitive.length) { setWarning(sensitive); return }
    setWarning([])
    const visitor = msg('visitor', clean, acceptedFrom && clean !== acceptedFrom ? { improvedFrom: acceptedFrom } : {})
    setInput(''); setAcceptedFrom(undefined); setSuggestion(null)
    const messages = [...nav.messages, visitor]
    let next: NavSession = { ...nav, messages }

    if (detectInjection(clean)) {
      messages.push(msg('assistant', "I can only help with finding Beatrice Loving Heart programs and drafting a demo inquiry. I can't change how I work. What kind of support are you looking for?"))
      return setNav(next)
    }
    if (detectEmergency(clean)) {
      messages.push(msg('assistant', 'If this is an emergency or someone is in danger, please call 911 now. This navigator is a demo, is not monitored, and cannot send help.'))
    }

    if (nav.step === -1 || nav.step === DRAFT_STEP) {
      const cats = [...new Set([...nav.categories, ...categories, ...inferCategories(clean)])]
      if (!cats.length && clean.split(' ').length < 4 && nav.step === -1) {
        messages.push(msg('assistant', "That's okay — many people start here. In a sentence or two, what's going on? For example: who needs support and what feels hardest right now. Please leave out names and medical details."))
        return setNav(next)
      }
      const description = [nav.description, clean].filter(Boolean).join(' ')
      const matches = matchPrograms(description, cats, contextProgramId)
      messages.push(msg('assistant', composeAnswer(matches), { programIds: matches.map((m) => m.program.id) }))
      next = { ...next, description, categories: cats, programIds: matches.map((m) => m.program.id) }
      if (nav.step === -1) { messages.push(msg('assistant', QUESTIONS[0].text)); next.step = 0 }
      else if (draft) setDraft({ ...draft, summary: description, categories: cats as Category[], suggestedPrograms: next.programIds })
      return setNav(next)
    }

    // Guided question answers
    const q = QUESTIONS[nav.step]
    const value = clean === 'Skip' ? undefined : clean
    next.answers = { ...nav.answers, [q.key]: value }
    if (nav.step + 1 < QUESTIONS.length) {
      messages.push(msg('assistant', QUESTIONS[nav.step + 1].text))
      next.step = nav.step + 1
    } else {
      messages.push(msg('assistant', 'Thank you. I prepared a draft inquiry below. Review and edit anything — nothing is saved until you confirm.'))
      next.step = DRAFT_STEP
      setDraft(buildDraft(next))
    }
    setNav(next)
  }

  function submitDraft() {
    if (!draft) return
    const errs = validateDraft(draft)
    setErrors(errs)
    if (errs.length) return
    const inq = inquiryFromDraft(draft, nav.messages, nextSeq())
    addInquiry(inq)
    setNav({ ...nav, submittedId: inq.id })
    setDraft(null)
  }

  function sendSample() {
    const base = storyInquiry(Date.now() + 2 * 86400_000) // shift story so the transcript is "now"
    const id = `DEMO-${nextSeq()}`
    const at = now()
    addInquiry({ ...base, id, alias: 'Sam Carter (sample)', createdAt: at, updatedAt: at, status: 'New', assignee: undefined, approvedPrograms: [], tasks: [], notes: [], unread: true, rating: undefined, firstResponseAt: undefined, transcript: base.transcript.map((m) => ({ ...m, id: `${id}-${m.id}` })), activity: [{ id: uid(), at, actor: 'Visitor (demo)', text: 'One-click sample inquiry sent from Care Navigator' }] })
    setNav({ ...emptyNav(), submittedId: id })
  }

  function startOver() {
    setNav(emptyNav()); setDraft(null); setErrors([]); setSuggestion(null); setInput(''); setWarning([]); setConfirmReset(false); setShowContact(false)
    scroller.current?.scrollTo({ top: 0 })
  }
  // In-panel confirmation instead of window.confirm: native dialogs can be auto-dismissed
  // (embedded browsers, popup settings) and are confusing for older visitors.
  function reset() {
    if (!nav.messages.length || nav.submittedId) startOver()
    else setConfirmReset(true)
  }

  const summaryText = () => [
    'BLH Care Navigator — concept demo summary (synthetic, not sent anywhere)', '',
    `Needs: ${nav.description ?? '—'}`, `Categories: ${nav.categories.join(', ') || '—'}`,
    ...Object.entries(nav.answers).map(([k, v]) => `${k}: ${v ?? 'skipped'}`), '',
    'Programs to ask about:', ...nav.programIds.map((id) => `• ${programById(id)?.name} — ${programById(id)?.sourceUrl}`), '',
    `To talk to staff: ${officialContact.phone} · ${officialContact.email} (${officialContact.sourceUrl})`,
  ].join('\n')

  const activeQuestion = nav.step >= 0 && nav.step < QUESTIONS.length ? QUESTIONS[nav.step] : null

  return (
    <aside
      role="dialog" aria-modal="false" aria-labelledby="nav-title"
      className={`fixed inset-0 z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[480px] sm:border-l sm:border-ink/10 ${open ? 'translate-x-0' : 'invisible translate-x-full'}`}
    >
      <header className="flex items-center justify-between gap-2 border-b border-ink/10 bg-gradient-to-r from-leaf-700 to-leaf-500 px-4 py-3 text-white">
        <div>
          <h2 id="nav-title" className="text-lg font-bold">Care Navigator</h2>
          <p className="text-xs text-white/85">We're here to help you find support</p>
        </div>
        <div className="flex items-center gap-0.5">
          <span className="mr-1 hidden text-xs font-semibold sm:inline">Text size</span>
          <button className="rounded-lg p-2.5 hover:bg-white/15" aria-label="Smaller text" onClick={() => setScale((s) => Math.max(1, s - 0.1))}><Minus size={18} /></button>
          <button className="rounded-lg p-2.5 hover:bg-white/15" aria-label="Bigger text" onClick={() => setScale((s) => Math.min(1.5, s + 0.1))}><Plus size={18} /></button>
          <button className="rounded-lg p-2.5 hover:bg-white/15" aria-label="Start over" title="Start over" onClick={reset}><RotateCcw size={18} /></button>
          <button ref={closeRef} className="rounded-lg p-2.5 hover:bg-white/15" aria-label="Close" onClick={onClose}><X size={22} /></button>
        </div>
      </header>
      <p className="flex items-start gap-2 border-b border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-900">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden />
        <span><strong>Emergency? Call 911.</strong> Please don't type names or medical details.</span>
      </p>

      {confirmReset && (
        <div role="alertdialog" aria-labelledby="reset-q" className="border-b border-ink/10 bg-gold-100 px-4 py-3">
          <p id="reset-q" className="font-semibold">Start over? This clears this conversation.</p>
          <div className="mt-2 flex gap-2">
            <button className="btn-primary btn-sm text-sm" autoFocus onClick={startOver}>Yes, start over</button>
            <button className="btn-ghost btn-sm text-sm" onClick={() => setConfirmReset(false)}>No, keep going</button>
          </div>
        </div>
      )}
      <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" style={{ fontSize: `${scale}rem` }} aria-live="polite">
        {nav.messages.length === 0 && !nav.submittedId && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-leaf-50 p-4">
              <p className="text-[1.15em] font-bold">Hello! How can we help you today?</p>
              <p className="mt-1 text-ink/75">Tap a button below, or type in your own words. There are no wrong answers.</p>
            </div>
            {contextProgram && (
              <button className="chip w-full text-left" onClick={() => send(`I'd like to learn more about ${contextProgram.name}.`, contextProgram.categories.slice(0, 1))}>
                Ask about <strong>{contextProgram.name}</strong> (the page you're viewing)
              </button>
            )}
            <div className="grid gap-2">
              {STARTERS.map(([label, cats]) => <button key={label} className="big-choice" onClick={() => send(label, cats)}>{label}<ChevronRight size={20} aria-hidden className="shrink-0 text-leaf-700" /></button>)}
            </div>
            <button className="big-choice border-gold-400/60 bg-gold-100/60" onClick={() => setShowContact(true)}><span className="flex items-center gap-2"><Phone size={20} aria-hidden /> I'd rather talk to a person</span><ChevronRight size={20} aria-hidden /></button>
            <div className="rounded-xl border border-dashed border-ink/20 p-3 text-xs">
              <p className="font-semibold text-ink/60">For presenters</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="btn-ghost btn-sm" onClick={() => { setInput(STORY_ORIGINAL); inputRef.current?.focus() }}>Fill a sample story</button>
                <button className="btn-ghost btn-sm" onClick={sendSample}><Send size={12} aria-hidden /> Send demo inquiry to employee inbox</button>
              </div>
            </div>
          </div>
        )}

        {nav.messages.map((m) => (
          <div key={m.id} className={m.from === 'visitor' ? 'flex flex-col items-end' : ''}>
            <div className="mb-1"><Badge kind={m.from === 'visitor' ? 'Visitor message' : 'Simulated answer'} /></div>
            <div className={`max-w-[92%] whitespace-pre-wrap rounded-2xl px-4 py-3 leading-relaxed ${m.from === 'visitor' ? 'rounded-br-sm bg-ink text-white' : 'rounded-bl-sm bg-slate-100 text-ink'}`}>{m.text}</div>
            {m.improvedFrom && <p className="mt-1 text-xs text-ink/50">You chose the clearer wording.</p>}
            {m.programIds && m.programIds.length > 0 && (
              <ul className="mt-3 space-y-3">
                {m.programIds.map((id) => <ProgramCard key={id} id={id} reasons={matchReasons.get(id)} />)}
              </ul>
            )}
          </div>
        ))}

        {draft && !nav.submittedId && <DraftForm draft={draft} setDraft={setDraft} errors={errors} onSubmit={submitDraft} />}

        {nav.submittedId && (
          <div className="rounded-2xl border border-leaf-600/30 bg-leaf-50 p-4">
            <p className="flex items-center gap-2 text-[1.15em] font-bold text-leaf-700"><CheckCircle2 size={24} aria-hidden /> Thank you! Your request is ready.</p>
            <p className="mt-1 text-ink/75">Reference number: <strong>{nav.submittedId}</strong>. A team member would follow up the way you asked.</p>
            <p className="mt-1 text-xs text-ink/50">Demo: saved only in this browser. Open the employee portal on this device to see it.</p>
            <Link to={`/employee/inquiry/${nav.submittedId}`} className="btn-primary btn-sm mt-3" onClick={onClose}>Open in employee portal</Link>
            <fieldset className="mt-4">
              <legend className="font-semibold">Was this helpful? (optional)</legend>
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} aria-label={`${n} star${n > 1 ? 's' : ''}`} aria-pressed={nav.rating === n} onClick={() => { setNav({ ...nav, rating: n }); updateInquiry(nav.submittedId!, () => ({ rating: n })) }}>
                    <Star size={30} className={n <= (nav.rating ?? 0) ? 'fill-gold-400 text-gold-500' : 'text-ink/30'} />
                  </button>
                ))}
              </div>
            </fieldset>
            <button className="btn-ghost btn-sm mt-4" onClick={reset}>Start a new conversation</button>
          </div>
        )}

        {showContact && (
          <div className="rounded-2xl border border-ink/10 p-4 text-sm">
            <p className="text-[1.1em] font-bold">Talk to a person</p>
            <p className="mt-2 text-[1.3em] font-extrabold">{officialContact.phone}</p>
            <p>Toll free: <strong>{officialContact.tollFree}</strong></p>
            <p>Email: {officialContact.email}</p>
            <p className="mt-2"><SourceLink href={officialContact.sourceUrl} /></p>
          </div>
        )}
      </div>

      <div className="border-t border-ink/10 bg-white p-3">
        {activeQuestion && (
          <div className="mb-2 grid max-h-64 gap-1.5 overflow-y-auto" style={{ fontSize: `${scale}rem` }}>
            {activeQuestion.options.map((o) => <button key={o} className="big-choice py-2.5" onClick={() => send(o)}>{o}</button>)}
            <button className="py-2 text-sm font-medium text-ink/60 underline" onClick={() => send('Skip')}>Skip this question</button>
          </div>
        )}
        {suggestion && (
          <div className="mb-2 rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm" role="region" aria-label="Suggested rewrite">
            <p className="text-xs font-bold uppercase tracking-wider text-ink/50">What you wrote</p>
            <p className="mt-0.5 text-ink/80">{suggestion.original}</p>
            <p className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-800">Clearer version <Badge kind="AI suggestion" /></p>
            <p className="mt-0.5">{suggestion.suggested}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button className="btn-primary btn-sm" onClick={() => { setInput(suggestion.suggested); setAcceptedFrom(suggestion.original); setSuggestion(null) }}>Use suggestion</button>
              <button className="btn-ghost btn-sm" onClick={() => { setInput(suggestion.suggested); setAcceptedFrom(suggestion.original); setSuggestion(null); inputRef.current?.focus() }}>Edit</button>
              <button className="btn-ghost btn-sm" onClick={() => setSuggestion(null)}>Keep mine</button>
            </div>
          </div>
        )}
        {warning.length > 0 && (
          <p role="alert" className="mb-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">This looks like it includes {warning.join(', ')}. Please remove it — this demo must not contain real personal or health information.</p>
        )}
        <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex items-end gap-2">
          <label htmlFor="nav-input" className="sr-only">Describe what you need</label>
          <textarea
            id="nav-input" ref={inputRef} rows={2} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
            placeholder={activeQuestion ? 'Or type your answer here…' : 'Type here, in your own words…'} className="input resize-none text-base"
          />
          <button type="submit" className="btn-primary h-12 shrink-0 px-4" disabled={!input.trim()}><Send size={18} aria-hidden /> Send</button>
        </form>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {input.trim().length >= 8 && !suggestion && <button className="btn-ghost btn-sm text-sm" onClick={() => setSuggestion({ original: input, suggested: improveText(input) })}><Sparkles size={14} aria-hidden /> Help me describe this better</button>}
          <button className="btn-ghost btn-sm text-sm" onClick={() => setShowContact((v) => !v)} aria-expanded={showContact}><Phone size={14} aria-hidden /> Talk to a person</button>
          {nav.messages.length > 0 && <button className="btn-ghost btn-sm text-sm" onClick={() => download('my-care-summary.txt', summaryText())}><Download size={14} aria-hidden /> Save my summary</button>}
        </div>
      </div>
    </aside>
  )
}

function ProgramCard({ id, reasons }: { id: string; reasons?: string[] }) {
  const p = programById(id)
  if (!p) return null
  return (
    <li className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[1.05em] font-bold">{p.name}</h3>
        <Badge kind="AI suggestion">Suggested</Badge>
      </div>
      <p className="mt-1 text-ink/75">{p.tagline}.</p>
      <p className="mt-2"><span className="font-semibold">You could ask:</span> “{p.askStaff[0]}”</p>
      <details className="mt-2 text-[0.9em]">
        <summary className="cursor-pointer font-semibold text-leaf-700">More about this program</summary>
        <p className="mt-2 text-ink/75"><span className="font-semibold">Why this may help:</span> {p.description}{reasons?.length ? ` (${reasons[0]}.)` : ''}</p>
        <p className="mt-2 text-ink/75"><span className="font-semibold">Next step:</span> {p.contact}</p>
        <p className="mt-2 text-ink/75"><span className="font-semibold">Good to know:</span> {p.caveats[0]}</p>
      </details>
      <p className="mt-2"><SourceLink href={p.sourceUrl} label="Read the official page" /></p>
    </li>
  )
}

function buildDraft(nav: NavSession): Draft {
  const top = nav.programIds.map((id) => programById(id)).filter(Boolean)
  return {
    alias: '',
    summary: nav.description ?? '',
    categories: nav.categories,
    contactPref: (CONTACT_PREFS as readonly string[]).includes(nav.answers.contactPref ?? '') ? (nav.answers.contactPref as ContactPref) : 'Phone',
    urgency: (URGENCIES as readonly string[]).includes(nav.answers.urgency ?? '') ? (nav.answers.urgency as Urgency) : 'Just exploring',
    location: nav.answers.location,
    ageBand: nav.answers.ageBand,
    accessibility: nav.answers.accessibility === 'None' ? undefined : nav.answers.accessibility,
    suggestedPrograms: nav.programIds,
    openQuestions: top.slice(0, 2).map((p) => p!.askStaff[0]),
    nextSteps: ['Staff follow-up by my preferred method', 'Confirm which program fits'],
    consent: false,
  }
}

function DraftForm({ draft, setDraft, errors, onSubmit }: { draft: Draft; setDraft: (d: Draft) => void; errors: string[]; onSubmit: () => void }) {
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft({ ...draft, [k]: v })
  return (
    <form className="space-y-3 rounded-2xl border-2 border-leaf-600/30 bg-white p-4 text-sm" onSubmit={(e) => { e.preventDefault(); onSubmit() }} aria-labelledby="draft-title">
      <div className="flex items-center justify-between"><h3 id="draft-title" className="text-[1.1em] font-bold">Here is your request</h3><Badge kind="Synthetic demo data" /></div>
      <p className="text-ink/70">Please check it. Nothing is sent until you press the button at the bottom.</p>
      <div className="space-y-1 rounded-xl bg-leaf-50 p-3 text-[1rem]">
        <p><strong>What you need:</strong> {draft.summary || '—'}</p>
        {draft.location && <p><strong>Where:</strong> {draft.location}</p>}
        {draft.suggestedPrograms.length > 0 && <p><strong>Programs to ask about:</strong> {draft.suggestedPrograms.map((id) => programById(id)?.name).join(', ')}</p>}
      </div>

      <fieldset className="space-y-3 rounded-xl border border-ink/10 p-3 text-[1rem]">
        <legend className="px-1 text-[1.05em] font-bold">How can we reach you?</legend>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Best way to reach you">
          {CONTACT_PREFS.slice(0, 3).map((c) => (
            <button key={c} type="button" role="radio" aria-checked={draft.contactPref === c} onClick={() => set('contactPref', c)}
              className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold ${draft.contactPref === c ? 'border-leaf-600 bg-leaf-50 text-leaf-700' : 'border-ink/15 bg-white'}`}>
              {c === 'Either' ? 'Either one' : c}
            </button>
          ))}
        </div>
        <>
          {/* autoComplete off: keep Chrome from filling in a real saved name or number in this demo */}
          <label className="block"><span className="font-semibold">Your name</span>
            <input className="input mt-1 text-base" autoComplete="off" value={draft.alias} onChange={(e) => set('alias', e.target.value)} placeholder="First name is fine" />
          </label>
          <label className="block"><span className="font-semibold">Phone number</span>
            <input className="input mt-1 text-base" type="tel" inputMode="tel" autoComplete="off" value={draft.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="(301) 555-0123" />
          </label>
          {draft.contactPref !== 'Phone' && (
            <label className="block"><span className="font-semibold">Email</span>
              <input className="input mt-1 text-base" type="email" autoComplete="off" value={draft.email ?? ''} onChange={(e) => set('email', e.target.value)} placeholder="name@example.com" />
            </label>
          )}
          <p className="text-xs text-ink/55">Demo only: please use a made-up name and number, like (301) 555-0123.</p>
        </>
      </fieldset>

      <details>
        <summary className="cursor-pointer py-1 font-semibold text-leaf-700">Change details</summary>
        <div className="mt-2 space-y-3">
      <label className="block"><span className="font-semibold">Summary of needs</span><textarea className="input mt-1" rows={4} value={draft.summary} onChange={(e) => set('summary', e.target.value)} /></label>
      <fieldset>
        <legend className="font-semibold">Support needs</legend>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <label key={c} className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs ${draft.categories.includes(c) ? 'border-leaf-600 bg-leaf-50 text-leaf-700' : 'border-ink/15'}`}>
              <input type="checkbox" className="sr-only" checked={draft.categories.includes(c)} onChange={(e) => set('categories', e.target.checked ? [...draft.categories, c] : draft.categories.filter((x) => x !== c))} />{c}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-cols-2 gap-2">
        <label className="col-span-2 block"><span className="font-semibold">Timeframe</span><select className="input mt-1" value={draft.urgency} onChange={(e) => set('urgency', e.target.value as Urgency)}>{URGENCIES.map((c) => <option key={c}>{c}</option>)}</select></label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block"><span className="font-semibold">Area</span><input className="input mt-1" value={draft.location ?? ''} onChange={(e) => set('location', e.target.value || undefined)} /></label>
        <label className="block"><span className="font-semibold">Age group</span><input className="input mt-1" value={draft.ageBand ?? ''} onChange={(e) => set('ageBand', e.target.value || undefined)} /></label>
      </div>
      <div>
        <p className="font-semibold">Recommended programs <Badge kind="AI suggestion" /></p>
        <ul className="mt-1 space-y-1">
          {draft.suggestedPrograms.map((id) => (
            <li key={id} className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1">{programById(id)?.name}<button type="button" className="text-xs underline" onClick={() => set('suggestedPrograms', draft.suggestedPrograms.filter((x) => x !== id))}>Remove</button></li>
          ))}
          {!draft.suggestedPrograms.length && <li className="text-xs text-ink/60">None — staff will help identify a fit.</li>}
        </ul>
      </div>
      <label className="block"><span className="font-semibold">Unanswered questions (one per line)</span><textarea className="input mt-1" rows={2} value={draft.openQuestions.join('\n')} onChange={(e) => set('openQuestions', e.target.value.split('\n'))} /></label>
      <label className="block"><span className="font-semibold">Requested next steps (one per line)</span><textarea className="input mt-1" rows={2} value={draft.nextSteps.join('\n')} onChange={(e) => set('nextSteps', e.target.value.split('\n'))} /></label>
        </div>
      </details>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-amber-50 p-3 text-[0.95rem]">
        <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-leaf-700" checked={draft.consent} onChange={(e) => set('consent', e.target.checked)} />
        <span>I checked my request. I did not include real names or health details. (This demo saves it only on this device.)</span>
      </label>
      {errors.length > 0 && <ul role="alert" className="list-disc rounded-lg bg-red-50 p-2 pl-6 text-xs text-red-900">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
      <button type="submit" className="btn-primary w-full py-3.5 text-base"><Send size={18} aria-hidden /> Send my request</button>
    </form>
  )
}
