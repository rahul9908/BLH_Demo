import { programById } from '../data/programs'
import type { Inquiry } from './types'

// Deterministic "AI Copilot" for demo mode. Every output is a draft that staff must review.

export function draftResponse(i: Inquiry, staffName: string): string {
  const programs = (i.approvedPrograms.length ? i.approvedPrograms : i.suggestedPrograms).map((id) => programById(id)).filter(Boolean)
  const lines = [
    `Hello ${i.alias.replace(/\s*\(.*\)$/, '')},`,
    '',
    'Thank you for reaching out to us and for sharing what is going on. We understand this can feel like a lot, and we are glad to help you sort through the options.',
    '',
  ]
  if (programs.length) {
    lines.push('Based on what you shared, these programs may be worth discussing together:')
    programs.forEach((p) => lines.push(`• ${p!.name} — ${p!.sourceUrl}`))
    lines.push('', 'We cannot confirm eligibility or availability until we talk with you, but we can walk through each option and what it would involve.')
  }
  const pref = i.contactPref === 'Email' ? 'by email' : i.contactPref === 'Phone' ? 'by phone' : 'by phone or email'
  lines.push('', `Would it be okay if we followed up ${pref} to talk through next steps?`, '', 'Warmly,', `${staffName} (demo)`)
  return lines.join('\n')
}

export function summarize(i: Inquiry): string {
  const visitor = i.transcript.filter((m) => m.from === 'visitor')
  const first = visitor[0]?.text ?? i.summary
  const facts = [i.location && `Area: ${i.location}`, i.ageBand && `Age group: ${i.ageBand}`, `Follow-up: ${i.urgency.toLowerCase()} via ${i.contactPref.toLowerCase()}`, i.accessibility && `Accessibility: ${i.accessibility}`].filter(Boolean)
  const topProgram = i.suggestedPrograms.map((id) => programById(id)?.name).filter(Boolean).join(', ')
  return `Visitor's main request: “${first.length > 220 ? first.slice(0, 217) + '…' : first}”\n${facts.join(' · ')}\nAI-suggested programs: ${topProgram || 'none matched'}\n${visitor.length} visitor messages in transcript.`
}

export function missingDetails(i: Inquiry): string[] {
  const out: string[] = []
  if ((i.contactPref === 'Phone' || i.contactPref === 'Either') && !i.phone && !i.email) out.push('Phone number or email to reach them')
  if (!i.location) out.push('General area (city or county)')
  if (!i.ageBand) out.push('Age group of the person needing support')
  if (i.contactPref === 'No follow-up needed') out.push('Whether the visitor wants a follow-up at all')
  if (!i.categories.length) out.push('Type of support needed')
  if (!i.accessibility) out.push('Accessibility or language preferences for follow-up')
  if (!i.approvedPrograms.length) out.push('Staff-confirmed program fit')
  return out
}

export function nextQuestions(i: Inquiry): string[] {
  const q = ['What would a good outcome look like for you over the next month?']
  if (i.categories.includes('Housing')) q.push('Are there any upcoming dates (e.g. lease end) we should plan around?')
  if (i.categories.includes('Hospital discharge')) q.push('Who else is helping at home right now, and how can we include them?')
  if (i.categories.includes('Aging')) q.push('Would your family member like to join the conversation?')
  if (i.categories.includes('Disability')) q.push('Are you currently working with another coordinator or provider we should know about?')
  if (i.categories.includes('Transportation')) q.push('Which appointments or trips are hardest to get to right now?')
  if (i.categories.includes('Benefits')) q.push('Are there any renewal deadlines coming up?')
  q.push('What is the best time of day to reach you?')
  return q
}

// --- Export ------------------------------------------------------------------------------

const csvCell = (v: unknown) => {
  const s = String(v ?? '')
  // Neutralize spreadsheet formula injection, then quote.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
  return `"${safe.replace(/"/g, '""')}"`
}

export function toCsv(list: Inquiry[]): string {
  const head = ['id', 'alias', 'createdAt', 'status', 'urgency', 'assignee', 'categories', 'suggestedPrograms', 'approvedPrograms', 'openTasks', 'summary', 'dataOrigin']
  const rows = list.map((i) => [i.id, i.alias, i.createdAt, i.status, i.urgency, i.assignee ?? '', i.categories.join('; '), i.suggestedPrograms.join('; '), i.approvedPrograms.join('; '), i.tasks.filter((t) => !t.done).length, i.summary, 'Synthetic demo data'])
  return [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n')
}

export function download(filename: string, content: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}
