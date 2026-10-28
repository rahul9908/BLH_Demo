import { programCatalog, type Program } from '../data/programs'
import type { Category } from './types'

export interface Match { program: Program; score: number; reasons: string[] }

const CATEGORY_HINTS: Record<Category, string[]> = {
  Aging: ['senior', ' older', 'elder', ' aging', ' mom', 'mother', 'dad', 'father', 'grandm', 'grandf', 'parent'],
  Disability: ['disabilit', 'developmental', 'intellectual', 'special needs', 'dda', 'waiver'],
  Housing: ['housing', 'apartment', ' rent', 'evict', 'homeless', 'shelter', 'landlord', 'lease'],
  Transportation: ['transport', ' ride', ' bus ', 'drive', 'car ', 'get to appointments'],
  'Hospital discharge': ['hospital', 'discharg', 'readmi', 'surgery', 'rehab'],
  Benefits: ['benefit', 'insurance', 'medicaid', 'medicare', 'recertif', 'coverage', 'health plan'],
  'Care coordination': ['coordinat', 'doctor', 'appointment', 'provider', 'referral', 'medication'],
  'Community resources': ['resource', 'food', 'lonely', 'isolat', 'community', 'alone'],
}

const has = (text: string, needle: string) => text.includes(needle)
// Lowercase, punctuation → spaces, padded so ' son ' style keywords match whole words.
const norm = (text: string) => ` ${text.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ')} `

export function inferCategories(text: string): Category[] {
  const t = norm(text)
  return (Object.keys(CATEGORY_HINTS) as Category[]).filter((c) => CATEGORY_HINTS[c].some((k) => has(t, k)))
}

/** Curated, deterministic matching: category overlap + keyword hits (+ page context). */
export function matchPrograms(text: string, categories: Category[] = [], contextProgramId?: string, limit = 3): Match[] {
  const t = norm(text)
  const cats = new Set([...categories, ...inferCategories(text)])
  const scored = programCatalog.map((program) => {
    const reasons: string[] = []
    let score = 0
    // Primary category (first listed) is a strong signal; any secondary overlap adds a little, once.
    const [primary, ...secondary] = program.categories
    if (cats.has(primary)) { score += 4; reasons.push(`You mentioned ${primary.toLowerCase()} needs`) }
    const sec = secondary.find((c) => cats.has(c))
    if (sec) { score += 2; reasons.push(`Also related to ${sec.toLowerCase()}`) }
    const hits = program.keywords.filter((k) => has(t, k))
    if (hits.length) { score += hits.length; reasons.push(`Related words in your message: ${hits.map((h) => h.trim()).join(', ')}`) }
    if (program.id === contextProgramId) { score += 2; reasons.push('You were viewing this program page') }
    // Partner-facing program only surfaces on explicit keyword hits.
    if (program.id === 'population-health' && !hits.length) score = 0
    return { program, score, reasons }
  })
  return scored.filter((m) => m.score > 0).sort((a, b) => b.score - a.score || a.program.name.localeCompare(b.program.name)).slice(0, limit)
}

// Respectful-language swaps. Meaning is preserved; nothing is added about the person.
export const LANGUAGE_SWAPS: [RegExp, string][] = [
  [/\b(he|she)(?:'s|s| is) (?:wheelchair[- ]bound|confined to a wheelchair)\b/gi, '$1 uses a wheelchair'],
  [/\bwheelchair[- ]bound\b/gi, 'uses a wheelchair'],
  [/\bconfined to a wheelchair\b/gi, 'uses a wheelchair'],
  [/\bthe disabled\b/gi, 'people with disabilities'],
  [/\bthe elderly\b/gi, 'older adults'],
  [/\bsuffers from\b/gi, 'lives with'],
  [/\bhandicapped\b/gi, 'disabled'],
]

const TOPIC_PHRASE: Partial<Record<Category, string>> = {
  Aging: 'support for an older adult',
  Disability: 'disability services',
  Housing: 'housing',
  Transportation: 'getting to appointments',
  'Hospital discharge': 'support after a hospital stay',
  Benefits: 'understanding benefits',
  'Care coordination': 'coordinating care',
  'Community resources': 'community resources',
}

/**
 * Suggest a clearer version of what the visitor wrote. Non-destructive: returns a new string;
 * keeps every original sentence (light cleanup + respectful-language swaps) and only appends a
 * request built from topics the visitor already mentioned. Never invents facts.
 */
export function improveText(original: string): string {
  let body = original.trim().replace(/\s+/g, ' ')
  if (!body) return ''
  for (const [re, rep] of LANGUAGE_SWAPS) body = body.replace(re, rep)
  body = body.replace(/\bi\b/g, 'I').replace(/\bim\b/gi, "I'm").replace(/\bdont\b/gi, "don't").replace(/\bcant\b/gi, "can't").replace(/\b(he|she)s\b/gi, "$1's")
  body = body.replace(/(^|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase())
  if (!/[.!?]$/.test(body)) body += '.'
  const topics = inferCategories(original).map((c) => TOPIC_PHRASE[c]).filter(Boolean)
  const about = topics.length ? ` with ${topics.slice(0, 3).join(', ')}` : ''
  return `${body} I'd like to understand which programs may help${about}, what questions to ask staff, and what the next step would be.`
}

/** Conversational lead-in for program cards. Labeled as a simulated answer in the UI. */
export function composeAnswer(matches: Match[]): string {
  if (!matches.length)
    return "Thanks for sharing. I couldn't confidently match that to a specific BLH program. Many people start with Community Care Resources or a call to the main line — staff can help sort out the right fit."
  const names = matches.map((m) => m.program.name)
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]
  return `Thank you — that's helpful. Based on what you shared, ${list} may be worth asking about. I can't confirm eligibility or availability; BLH staff make those decisions. Each card below links to the official page.`
}

// --- Safety checks -------------------------------------------------------------------------

const SENSITIVE: [RegExp, string][] = [
  [/\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/, 'a number that looks like a Social Security number'],
  [/\b\d{1,2}[/-]\d{1,2}[/-](19|20)\d{2}\b/, 'a full date (such as a date of birth)'],
  [/\b(member|insurance|policy|medicaid|medicare)\s*(id|number|#)\b/i, 'an insurance or member ID'],
  [/\b\d{10,}\b/, 'a long ID-like number'],
  [/\b(diagnosed|diagnosis)\b/i, 'medical diagnosis details'],
]

/** Returns human-readable reasons if text appears to contain sensitive personal/health info. */
export function detectSensitive(text: string): string[] {
  return SENSITIVE.filter(([re]) => re.test(text)).map(([, label]) => label)
}

export function detectEmergency(text: string): boolean {
  return /\b(911|emergency|chest pain|can'?t breathe|not breathing|overdos|suicid|kill (my|him|her)self|unconscious|bleeding a lot|stroke)\b/i.test(text)
}

export function detectInjection(text: string): boolean {
  return /\b(ignore (all |the )?(previous|prior|above) (instructions|prompts)|system prompt|you are now|developer mode|jailbreak)\b/i.test(text)
}
