import { programById } from '../data/programs'
import { detectSensitive } from './navigator'
import { CATEGORIES, CONTACT_PREFS, URGENCIES, type Draft, type Inquiry, type Message, type Status } from './types'

export const uid = () => Math.random().toString(36).slice(2, 10)

const TRANSITIONS: Record<Status, Status[]> = {
  New: ['Needs Review', 'Awaiting Information', 'In Progress', 'Closed'],
  'Needs Review': ['Awaiting Information', 'In Progress', 'Closed'],
  'Awaiting Information': ['Needs Review', 'In Progress', 'Closed'],
  'In Progress': ['Needs Review', 'Awaiting Information', 'Closed'],
  Closed: ['In Progress'], // reopen
}

export const allowedTransitions = (from: Status) => TRANSITIONS[from]
export const canTransition = (from: Status, to: Status) => TRANSITIONS[from].includes(to)

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Validates a visitor draft before it may be saved to the local demo inbox. */
export function validateDraft(d: Draft): string[] {
  const errors: string[] = []
  if (d.summary.trim().length < 10) errors.push('Please add a short summary (at least 10 characters).')
  if (!CONTACT_PREFS.includes(d.contactPref)) errors.push('Choose a follow-up preference.')
  if (!URGENCIES.includes(d.urgency)) errors.push('Choose a follow-up timeframe.')
  const digits = (d.phone ?? '').replace(/\D/g, '')
  if (d.alias.trim().length < 2) errors.push('Please add your name so we know who to ask for.')
  if (!(digits.length === 10 || (digits.length === 11 && digits[0] === '1'))) errors.push('Please add a 10-digit phone number so we can call you back.')
  if ((d.contactPref === 'Email' || d.email?.trim()) && !EMAIL.test(d.email?.trim() ?? '')) errors.push('Please add a valid email address so we can write back.')
  if (d.categories.some((c) => !CATEGORIES.includes(c))) errors.push('Unknown support category.')
  if (d.suggestedPrograms.some((id) => !programById(id))) errors.push('Unknown program reference.')
  const text = [d.alias, d.summary, d.location, d.accessibility, ...d.openQuestions, ...d.nextSteps].join(' ')
  const sensitive = detectSensitive(text)
  if (sensitive.length) errors.push(`Please remove ${sensitive.join(', ')}. This demo must not contain real personal or health information.`)
  if (!d.consent) errors.push('Please confirm the review and consent checkbox.')
  return errors
}

export function inquiryFromDraft(d: Draft, transcript: Message[], seq: number, now = new Date()): Inquiry {
  const at = now.toISOString()
  const improved = transcript.find((m) => m.improvedFrom)
  return {
    id: `DEMO-${seq}`,
    alias: d.alias.trim(),
    createdAt: at,
    updatedAt: at,
    status: 'New',
    urgency: d.urgency,
    categories: d.categories,
    location: d.location,
    ageBand: d.ageBand,
    contactPref: d.contactPref,
    phone: d.phone?.trim() || undefined,
    email: d.email?.trim() || undefined,
    accessibility: d.accessibility,
    summary: d.summary.trim(),
    originalText: improved?.improvedFrom,
    improvedText: improved?.text,
    suggestedPrograms: d.suggestedPrograms,
    approvedPrograms: [],
    openQuestions: d.openQuestions.filter(Boolean),
    nextSteps: d.nextSteps.filter(Boolean),
    transcript,
    unread: true,
    source: 'Care Navigator',
    tasks: [],
    notes: [],
    activity: [{ id: uid(), at, actor: 'Visitor (demo)', text: 'Inquiry submitted from Care Navigator after review and consent' }],
  }
}
