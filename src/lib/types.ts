export const STATUSES = ['New', 'Needs Review', 'Awaiting Information', 'In Progress', 'Closed'] as const
export type Status = (typeof STATUSES)[number]

export const ROLES = ['Case Coordinator', 'Supervisor', 'Administrator'] as const
export type Role = (typeof ROLES)[number]

// Urgency of *administrative follow-up* only — never clinical priority.
export const URGENCIES = ['Just exploring', 'Within a few weeks', 'This week'] as const
export type Urgency = (typeof URGENCIES)[number]

export const CONTACT_PREFS = ['Phone', 'Email', 'Either', 'No follow-up needed'] as const
export type ContactPref = (typeof CONTACT_PREFS)[number]

export const CATEGORIES = ['Aging', 'Disability', 'Housing', 'Transportation', 'Hospital discharge', 'Benefits', 'Care coordination', 'Community resources'] as const
export type Category = (typeof CATEGORIES)[number]

export interface Message {
  id: string
  from: 'visitor' | 'assistant'
  text: string
  at: string
  programIds?: string[]
  improvedFrom?: string // set when the visitor accepted a suggested rewrite
}

export interface Task { id: string; title: string; due: string; done: boolean; createdBy: string; doneAt?: string }
export interface Note { id: string; author: string; text: string; at: string }
export interface Activity { id: string; at: string; actor: string; text: string }

export interface Inquiry {
  id: string
  alias: string
  createdAt: string
  updatedAt: string
  status: Status
  urgency: Urgency
  categories: Category[]
  location?: string
  ageBand?: string
  contactPref: ContactPref
  phone?: string // demo: made-up numbers only
  email?: string
  accessibility?: string
  summary: string
  originalText?: string
  improvedText?: string
  suggestedPrograms: string[] // AI suggestion
  approvedPrograms: string[] // staff-reviewed
  openQuestions: string[]
  nextSteps: string[]
  transcript: Message[]
  assignee?: string
  unread: boolean
  source: 'Care Navigator' | 'Seed data'
  tasks: Task[]
  notes: Note[]
  activity: Activity[]
  rating?: number
  firstResponseAt?: string
}

export interface Draft {
  alias: string
  summary: string
  categories: Category[]
  contactPref: ContactPref
  phone?: string
  email?: string
  urgency: Urgency
  location?: string
  ageBand?: string
  accessibility?: string
  suggestedPrograms: string[]
  openQuestions: string[]
  nextSteps: string[]
  consent: boolean
}
