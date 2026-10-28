import { useSyncExternalStore } from 'react'
import { generateInquiries, seedInquiries } from '../data/seed'
import { uid } from './inquiry'
import type { Activity, Category, Inquiry, Message, Role } from './types'

/** Visitor-side Care Navigator session (lives in this browser only). */
export interface NavSession {
  messages: Message[]
  step: number // -1 = not started; 0..n guided question index; 99 = draft stage
  categories: Category[]
  description?: string // the visitor's own description of their needs
  answers: { location?: string; ageBand?: string; urgency?: string; contactPref?: string; accessibility?: string }
  programIds: string[]
  submittedId?: string
  rating?: number
}

export interface DemoState {
  version: 1
  inquiries: Inquiry[]
  audit: Activity[]
  staff?: { name: string; role: Role }
  nav: NavSession
  theme: 'light' | 'dark'
  kbReviews?: Record<string, { status: string; by: string; at: string }>
}

export const STORAGE_KEY = 'blh-care-navigator-demo-v5'
export const emptyNav = (): NavSession => ({ messages: [], step: -1, categories: [], answers: {}, programIds: [] })
const fresh = (): DemoState => ({ version: 1, inquiries: seedInquiries(), audit: [], nav: emptyNav(), theme: 'light' })

function load(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState
      if (parsed.version === 1 && Array.isArray(parsed.inquiries)) return parsed
    }
  } catch { /* corrupted or unavailable storage → start fresh */ }
  return fresh()
}

let state: DemoState = load()
const listeners = new Set<() => void>()

export function setState(next: DemoState) {
  state = next
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* private mode: in-memory only */ }
  listeners.forEach((l) => l())
}
export const getState = () => state
const subscribe = (l: () => void) => (listeners.add(l), () => listeners.delete(l))
export const useDemo = () => useSyncExternalStore(subscribe, getState)

export const audit = (actor: string, text: string): Activity => ({ id: uid(), at: new Date().toISOString(), actor, text })
const actor = () => (state.staff ? `${state.staff.name} (${state.staff.role})` : 'Demo user')

/** Apply a change to one inquiry and record it in its timeline + the global audit log. */
export function updateInquiry(id: string, change: (i: Inquiry) => Partial<Inquiry>, log?: string) {
  const now = new Date().toISOString()
  const who = state.staff?.name ?? 'Demo user'
  setState({
    ...state,
    inquiries: state.inquiries.map((i) => {
      if (i.id !== id) return i
      const next = { ...i, ...change(i), updatedAt: now }
      if (log) next.activity = [...next.activity, { id: uid(), at: now, actor: who, text: log }]
      if (log && !next.firstResponseAt) next.firstResponseAt = now // first staff action = first response
      return next
    }),
    audit: log ? [audit(actor(), `${id}: ${log}`), ...state.audit].slice(0, 500) : state.audit,
  })
}

export const nextSeq = () => Math.max(1000, ...state.inquiries.map((i) => Number(i.id.split('-')[1]) || 0)) + 1

export function addInquiry(inq: Inquiry) {
  setState({ ...state, inquiries: [inq, ...state.inquiries], audit: [audit('Visitor (demo)', `${inq.id}: submitted from Care Navigator`), ...state.audit] })
}

export function generateMore(n = 10) {
  const more = generateInquiries(n, Date.now() % 100000, Date.now(), nextSeq())
  setState({ ...state, inquiries: [...more, ...state.inquiries], audit: [audit(actor(), `Generated ${n} synthetic cases`), ...state.audit] })
}

export const setNav = (nav: NavSession) => setState({ ...state, nav })
export const resetDemo = () => setState({ ...fresh(), staff: state.staff, theme: state.theme, audit: [audit(actor(), 'Reset all demo data')] })
