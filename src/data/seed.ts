import { composeAnswer, improveText, matchPrograms } from '../lib/navigator'
import { programCatalog } from './programs'
import type { Category, Inquiry, Message, Status, Urgency, ContactPref, Task, Note, Activity } from '../lib/types'

// Everything in this file is fictional, generated sample data. No real people or cases.
export const STAFF = ['Jordan Ellis', 'Taylor Brooks', 'Marcus Bell', 'Ana Torres', 'Sam Whitfield']

const ALIASES = ['Denise W.', 'Harold P.', 'Keisha M.', 'Luis R.', 'Margaret O.', 'Tomas B.', 'Grace L.', 'Andre J.', 'Nadia K.', 'Wendell S.', 'Rosa C.', 'Imani T.', 'Victor H.', 'Lena F.', 'Omar D.', 'June A.', 'Carl N.', 'Brianna G.', 'Felix Q.', 'Hana Y.', 'Ruth E.', 'Desmond V.']
const LOCATIONS = ["Prince George's County", 'Anne Arundel County', 'Montgomery County', 'Howard County', 'Baltimore City', 'Charles County']
export const AGE_BANDS = ['Child or youth (under 18)', 'Adult (18–64)', 'Older adult (65+)']

const SCENARIOS: { text: string; cats: Category[]; age: number }[] = [
  { text: 'My mother is getting older and lives alone. She is missing appointments and I live two hours away. What kind of help is out there?', cats: ['Aging', 'Care coordination'], age: 2 },
  { text: 'We got a notice that our lease will not be renewed and I need help with housing applications for affordable apartments.', cats: ['Housing'], age: 1 },
  { text: 'My son is finishing high school and has an intellectual disability. We want to understand the transition to adult services and the DDA waiver waiting list.', cats: ['Disability'], age: 0 },
  { text: 'My father was discharged from the hospital and we are worried about getting him to follow-up appointments. He does not drive anymore.', cats: ['Hospital discharge', 'Transportation'], age: 2 },
  { text: 'I need help keeping my benefits. My recertification paperwork is confusing and I do not want a gap in coverage.', cats: ['Benefits'], age: 1 },
  { text: 'I am staying on a friend’s couch and need somewhere stable while I continue recovery support.', cats: ['Housing'], age: 1 },
  { text: 'My grandmother wants to stay in her home but she is lonely and needs help finding community resources and a caregiver plan for the family.', cats: ['Aging', 'Community resources'], age: 2 },
  { text: 'I use a wheelchair and want to live independently. I need help coordinating my providers and finding resources.', cats: ['Disability', 'Care coordination'], age: 1 },
  { text: 'Our daughter has complex medical needs and the school, doctors, and therapists are not talking to each other.', cats: ['Care coordination'], age: 0 },
  { text: 'Not sure where to start. My uncle has a lot going on with health and money and we need someone to help us understand our choices.', cats: ['Community resources'], age: 1 },
  { text: 'We want to switch our CCS provider for my brother who has a developmental disability. How long does a transfer take?', cats: ['Disability'], age: 1 },
  { text: 'My aunt came home from rehab after surgery and has trouble getting to the pharmacy and appointments.', cats: ['Hospital discharge', 'Transportation'], age: 2 },
  { text: 'An older neighbor of mine may be facing eviction and I want to know who could help with senior housing.', cats: ['Housing', 'Aging'], age: 2 },
  { text: 'I manage care for my husband and need help understanding his health plan and which providers are covered.', cats: ['Benefits', 'Care coordination'], age: 2 },
  { text: 'My sister uses a wheelchair and is moving out of a nursing facility. We need help planning housing and supports in the community.', cats: ['Housing', 'Disability'], age: 1 },
  { text: 'My father has trouble getting to the pharmacy and his doctors do not seem to share information. Who can help coordinate?', cats: ['Care coordination', 'Transportation', 'Aging'], age: 2 },
  { text: 'Our teenage son receives services at school and we are worried about what happens after graduation.', cats: ['Disability'], age: 0 },
  { text: 'I was recently released from the hospital and have no ride to my follow-up appointments.', cats: ['Hospital discharge', 'Transportation'], age: 1 },
  { text: 'My mother lives alone and has become isolated since retiring. We want to find community resources near her.', cats: ['Aging', 'Community resources'], age: 2 },
  { text: 'I lost my apartment and I am in a housing crisis. I am also in recovery and need a stable place.', cats: ['Housing'], age: 1 },
]

const ACCESS = [undefined, undefined, 'Prefers afternoon phone calls', 'Spanish-speaking staff preferred', 'Large print materials', 'Interpreter requested', 'Hard of hearing — email preferred']

// Status-aware staff notes make each case read like a real (synthetic) workflow.
const STATUS_NOTES: Record<Status, string[]> = {
  New: [],
  'Needs Review': ['Read the transcript. AI suggestions look reasonable; flagging for supervisor review before outreach.', 'Two programs suggested — need a second opinion on best fit.'],
  'Awaiting Information': ['Emailed (demo) asking for preferred call window and county. Waiting to hear back.', 'Visitor asked to check with family before scheduling. Will follow up if no reply in 3 days.'],
  'In Progress': ['Intro call completed (demo). Family wants to start with the first suggested program.', 'Shared official program page links. Next call scheduled.', 'Coordinating with intake team on next steps (demo).'],
  Closed: ['Connected visitor with the program intake line. Closing in demo.', 'Visitor confirmed they have what they need. Closed with thanks.'],
}
const NOTES = [
  'Left a demo voicemail introducing the program; will try again tomorrow.',
  'Family prefers afternoon calls. Shared official program page link.',
  'Confirmed preferred contact method. Waiting on availability questions from family.',
  'Reviewed AI suggestions — Housing & Community Planning is the better fit than Transitional Housing here.',
  'Discussed next steps with supervisor; follow-up scheduled.',
]
const TASKS = ['Introductory call with family', 'Send official program page links', 'Confirm preferred contact window', 'Check in after first conversation', 'Supervisor review of plan']
const URG: Urgency[] = ['Just exploring', 'Within a few weeks', 'This week']
const PREFS: ContactPref[] = ['Phone', 'Email', 'Either']

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const HOUR = 3600_000

// Fictional contact details only: 555-01xx is reserved for fiction; example.com never delivers.
const contactFor = (pref: ContactPref, n: number) => ({
  phone: pref === 'Email' ? undefined : `(301) 555-01${String(n % 100).padStart(2, '0')}`,
  email: pref === 'Phone' ? undefined : `visitor${n}@example.com`,
})
const iso = (ms: number) => new Date(ms).toISOString()

export const GUIDED_QUESTIONS = [
  'Which area is this for? A city or county is plenty.',
  'Which age group best describes the person who needs support?',
  'How soon would you like an administrative follow-up?',
  'How would you prefer staff follow up (demo only)?',
]

function transcriptFor(text: string, cats: Category[], answers: string[], start: number, id: string): Message[] {
  const matches = matchPrograms(text, cats)
  const msgs: Message[] = [
    { id: `${id}-v0`, from: 'visitor', text, at: iso(start) },
    { id: `${id}-a0`, from: 'assistant', text: composeAnswer(matches), at: iso(start + 20_000), programIds: matches.map((m) => m.program.id) },
  ]
  GUIDED_QUESTIONS.forEach((q, i) => {
    msgs.push({ id: `${id}-q${i}`, from: 'assistant', text: q, at: iso(start + (i + 1) * 60_000) })
    msgs.push({ id: `${id}-r${i}`, from: 'visitor', text: answers[i], at: iso(start + (i + 1) * 60_000 + 25_000) })
  })
  msgs.push({ id: `${id}-done`, from: 'assistant', text: 'Thanks. I prepared a draft inquiry for you to review before anything is saved.', at: iso(start + 6 * 60_000) })
  return msgs
}

export function generateInquiries(count: number, seed: number, now = Date.now(), startSeq = 1001): Inquiry[] {
  const r = rng(seed)
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)]
  const out: Inquiry[] = []
  for (let i = 0; i < count; i++) {
    const s = pick(SCENARIOS)
    const id = `DEMO-${startSeq + i}`
    const ageDays = Math.pow(r(), 1.15) * 34 // gentle upward trend in volume
    const created = now - ageDays * 24 * HOUR - r() * 8 * HOUR
    const status: Status = ageDays < 1.5 ? pick<Status>(['New', 'New', 'Needs Review']) : ageDays > 14 ? pick<Status>(['Closed', 'Closed', 'Closed', 'In Progress']) : pick<Status>(['Needs Review', 'Awaiting Information', 'In Progress', 'In Progress', 'Closed', 'Closed'])
    const assignee = status === 'New' ? undefined : pick(STAFF)
    const location = pick(LOCATIONS), ageBand = AGE_BANDS[s.age], urgency = pick(URG), contactPref = pick(PREFS), accessibility = pick(ACCESS)
    // ~30% of cases show the "Help me describe this better" flow: a rough original the visitor chose to improve.
    const rough = r() < 0.3 ? s.text.toLowerCase().replace(/[.,?]/g, '') : undefined
    const text = rough ? improveText(rough) : s.text
    const transcript = transcriptFor(text, s.cats, [location, ageBand, urgency, contactPref], created, id)
    if (rough) transcript[0].improvedFrom = rough
    const suggested = transcript[1].programIds ?? []
    const firstResponse = assignee ? Math.min(now - HOUR, created + (2 + r() * 46) * HOUR) : undefined
    const activity: Activity[] = [{ id: `${id}-act0`, at: iso(created), actor: 'Visitor (demo)', text: 'Inquiry submitted from Care Navigator after review and consent' }]
    const tasks: Task[] = []
    const notes: Note[] = []
    if (assignee && firstResponse) {
      activity.push({ id: `${id}-act1`, at: iso(firstResponse), actor: assignee, text: `Assigned to ${assignee}` })
      // Closed cases resolve 2–12 days after first reply, so "resolved" spreads across the timeline.
      const statusAt = status === 'Closed' ? firstResponse + (2 + r() * 10) * 24 * HOUR : firstResponse + HOUR
      activity.push({ id: `${id}-act2`, at: iso(Math.min(now - HOUR, statusAt)), actor: assignee, text: `Status changed to ${status}` })
      const sn = STATUS_NOTES[status]
      if (sn.length) notes.push({ id: `${id}-sn`, author: assignee, text: sn[i % sn.length], at: iso(Math.min(now, firstResponse + 2 * HOUR)) })
      // Open cases always carry at least one follow-up; every 4th is due today so the KPI is meaningful.
      if (status !== 'Closed' && i % 4 === 0) tasks.push({ id: `${id}-td`, title: 'Follow-up call (demo)', due: iso(now + 2 * HOUR), done: false, createdBy: assignee })
      for (let k = 0, n = 1 + Math.floor(r() * 2); k < n; k++) {
        const due = firstResponse + (k + 1) * (1 + r() * 5) * 24 * HOUR
        const done = status === 'Closed' || (due < now && r() > 0.15) // a few overdue, not a pile
        tasks.push({ id: `${id}-t${k}`, title: TASKS[(i + k) % TASKS.length], due: iso(due), done, createdBy: assignee, doneAt: done ? iso(Math.min(due, now)) : undefined })
      }
      for (let k = 0, n = Math.floor(r() * 2.5); k < n; k++)
        notes.push({ id: `${id}-n${k}`, author: assignee, text: NOTES[(i + k) % NOTES.length], at: iso(Math.min(now, firstResponse + (k + 1) * 3 * HOUR)) })
    }
    out.push({
      ...contactFor(contactPref, i), id, alias: pick(ALIASES), createdAt: iso(created), updatedAt: activity[activity.length - 1].at, status, urgency, categories: s.cats, location, ageBand, contactPref,
      summary: text, originalText: rough, improvedText: rough ? text : undefined, accessibility, suggestedPrograms: suggested, approvedPrograms: status === 'In Progress' || status === 'Closed' ? suggested.slice(0, 1) : [],
      openQuestions: suggested.slice(0, 2).map((pid) => programCatalog.find((p) => p.id === pid)!.askStaff[0]), nextSteps: ['Staff follow-up by preferred contact method'],
      transcript, assignee, unread: status === 'New', source: 'Seed data', tasks, notes, activity,
      rating: status === 'Closed' && r() > 0.4 ? 3 + Math.floor(r() * 3) : undefined, firstResponseAt: firstResponse ? iso(firstResponse) : undefined,
    })
  }
  return out
}

export const STORY_ORIGINAL = "my dad got out of the hospital last week and hes home but we dont know who to call, hes wheelchair bound and cant get to his appointments"

/** The end-to-end showcase story: vague request → improved → suggestions → reviewed → inbox → staff follow-up. */
export function storyInquiry(now = Date.now()): Inquiry {
  const start = now - 2 * 24 * HOUR
  const improved = improveText(STORY_ORIGINAL)
  const cats: Category[] = ['Hospital discharge', 'Transportation', 'Aging']
  const t = transcriptFor(improved, cats, ["Prince George's County", 'Older adult (65+)', 'This week', 'Phone'], start, 'DEMO-1000')
  t[0].improvedFrom = STORY_ORIGINAL
  const suggested = t[1].programIds ?? []
  const assignAt = start + 3 * HOUR
  return {
    id: 'DEMO-1000', alias: 'Harper family (story alias)', createdAt: iso(start), updatedAt: iso(assignAt + 26 * HOUR), status: 'In Progress', urgency: 'This week',
    categories: cats, location: "Prince George's County", ageBand: 'Older adult (65+)', contactPref: 'Phone', phone: '(301) 555-0199', accessibility: 'Prefers phone calls in the afternoon',
    summary: improved, originalText: STORY_ORIGINAL, improvedText: improved, suggestedPrograms: suggested, approvedPrograms: ['readmission', 'aging'],
    openQuestions: ['Is transportation support coordinated as part of the readmission program?', 'Can the family be included in planning calls?'],
    nextSteps: ['Call from a coordinator to talk through options', 'Share official program pages'],
    transcript: t, assignee: 'Taylor Brooks', unread: false, source: 'Care Navigator',
    tasks: [
      { id: 's-t1', title: 'Introductory call with the Harper family', due: iso(assignAt + 24 * HOUR), done: true, createdBy: 'Taylor Brooks', doneAt: iso(assignAt + 22 * HOUR) },
      { id: 's-t2', title: 'Send Aging & Health Services and Readmission program links', due: iso(now + 24 * HOUR), done: false, createdBy: 'Taylor Brooks' },
    ],
    notes: [{ id: 's-n1', author: 'Taylor Brooks', text: 'Reviewed AI suggestions. Approved Hospital Readmission Prevention and Aging & Health Services; family wants afternoon calls.', at: iso(assignAt + HOUR) }],
    activity: [
      { id: 's-a1', at: iso(start + 7 * 60_000), actor: 'Visitor (demo)', text: 'Accepted suggested rewrite, reviewed draft, consented, and submitted' },
      { id: 's-a2', at: iso(assignAt), actor: 'Marcus Bell', text: 'Assigned to Taylor Brooks' },
      { id: 's-a3', at: iso(assignAt + HOUR), actor: 'Taylor Brooks', text: 'Approved programs: Hospital Readmission Prevention, Aging & Health Services' },
      { id: 's-a4', at: iso(assignAt + 22 * HOUR), actor: 'Taylor Brooks', text: 'Completed task: Introductory call with the Harper family' },
      { id: 's-a5', at: iso(assignAt + 26 * HOUR), actor: 'Taylor Brooks', text: 'Status changed to In Progress' },
    ],
    firstResponseAt: iso(assignAt), rating: 5,
  }
}

export const seedInquiries = (now = Date.now()) => [storyInquiry(now), ...generateInquiries(55, 20261028, now)]
