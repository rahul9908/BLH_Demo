import type { Category } from '../lib/types'

export interface Program {
  id: string
  name: string
  tagline: string
  sourceUrl: string
  lastVerified: string // ISO date the public page was reviewed
  description: string // plain-language paraphrase, not a copy of site text
  supportAreas: string[]
  caveats: string[]
  askStaff: string[]
  contact: string
  categories: Category[]
  keywords: string[]
  core: boolean
}

const SITE = 'https://www.blhnurses.com'
const VERIFIED = '2026-10-28'
const MAIN_CONTACT = 'Main line (301) 951-0105 ext. 504 · Toll free 1-855-653-3502 · care@blhnurses.com (from the public contact page)'
const GENERAL_CAVEAT = 'Eligibility, availability, and enrollment are decided by BLH staff and partner agencies — this demo cannot confirm whether anyone qualifies.'

export const officialContact = {
  address: '4201 Mitchellville Road, Suite 300, Bowie, MD 20714',
  phone: '(301) 951-0105 ext. 504',
  tollFree: '1-855-653-3502',
  email: 'care@blhnurses.com',
  housingPhone: '(301) 804-0039',
  sourceUrl: `${SITE}/contact.html`,
}

export const programCatalog: Program[] = [
  {
    id: 'care-coordination',
    name: 'Community Care Coordination',
    tagline: 'One coordinated team around the person',
    sourceUrl: `${SITE}/programs-care-coordination.html`,
    lastVerified: VERIFIED,
    description: 'A coordinator acts as the connecting thread between doctors, behavioral health providers, pharmacists, hospitals, and community services so everyone works from the same plan.',
    supportAreas: ['Tracking referrals and care transitions', 'Linking to food, housing and transportation supports', 'Information on health and community resources', 'Help with essential items during transitions between care settings'],
    caveats: [GENERAL_CAVEAT, 'Transportation is listed among community supports; the page does not describe a ride service.'],
    askStaff: ['Is care coordination available where my family member lives?', 'How are referrals tracked after a hospital or clinic visit?'],
    contact: MAIN_CONTACT,
    categories: ['Care coordination', 'Transportation', 'Hospital discharge'],
    keywords: ['coordinat', 'doctor', 'provider', 'appointment', 'referral', 'pharmac', 'medication', 'specialist', 'clinic', 'team', 'transition', 'transport', ' ride', 'food'],
    core: true,
  },
  {
    id: 'managed-care',
    name: 'Managed Care Case Management',
    tagline: 'Navigating benefits, providers and plans',
    sourceUrl: `${SITE}/programs.html`,
    lastVerified: VERIFIED,
    description: 'Case management within managed care that helps people navigate benefits, providers, and health plans to reach the right support at the right time.',
    supportAreas: ['Understanding plan benefits', 'Finding and coordinating providers', 'Working across health plans'],
    caveats: [GENERAL_CAVEAT, 'The public site summarizes this program on the Programs overview page; details should be confirmed with staff.'],
    askStaff: ['Does my health plan work with BLH for case management?', 'What information should I have ready when I call?'],
    contact: MAIN_CONTACT,
    categories: ['Benefits', 'Care coordination'],
    keywords: ['managed care', 'health plan', 'mco', 'medicaid', 'medicare', 'insurance', 'benefit', 'coverage'],
    core: true,
  },
  {
    id: 'housing',
    name: 'Housing & Community Planning',
    tagline: 'Finding and keeping a stable home',
    sourceUrl: `${SITE}/programs-housing.html`,
    lastVerified: VERIFIED,
    description: 'Help with subsidized and affordable housing applications, identifying barriers, independent living plans, placement assistance, and ongoing coordination.',
    supportAreas: ['Housing application guidance', 'Independent living plans', 'Connections to financial assistance programs', 'Placement assistance and follow-up'],
    caveats: [GENERAL_CAVEAT, 'Housing availability and subsidy approval are not guaranteed and are decided outside this tool.'],
    askStaff: ['What documents are usually needed for housing applications?', 'Can the Housing Initiative Department help with an application already in progress?'],
    contact: 'Housing Initiative Department (301) 804-0039 · care@blhnurses.com (from the public housing page)',
    categories: ['Housing'],
    keywords: ['housing', 'apartment', ' rent', 'evict', 'landlord', ' move', 'home', ' lease', 'section 8', 'voucher', 'live independently'],
    core: true,
  },
  {
    id: 'community-care',
    name: 'Community Care Resources',
    tagline: 'Staying independent and connected at home',
    sourceUrl: `${SITE}/programs-community-care.html`,
    lastVerified: VERIFIED,
    description: 'Support for people with complex health, social, and disability needs to live independently at home, avoid isolation, and connect to community resources and education.',
    supportAreas: ['Individualized planning for complex needs', 'Check-ins to support living at home', 'Education for individuals and families', 'Links to community resources'],
    caveats: [GENERAL_CAVEAT],
    askStaff: ['Which community resources are available in my county?', 'How do check-ins work for someone living alone?'],
    contact: `Community Resource line (301) 804-0039 · ${MAIN_CONTACT}`,
    categories: ['Community resources', 'Aging', 'Disability'],
    keywords: ['resource', 'independent', 'alone', 'isolat', 'lonely', 'family', 'help at home', 'community', 'education'],
    core: true,
  },
  {
    id: 'aging',
    name: 'Aging & Health Services',
    tagline: 'Aging well on each person’s own terms',
    sourceUrl: `${SITE}/programs-aging.html`,
    lastVerified: VERIFIED,
    description: 'Person-centered planning for older adults who want to stay in their communities, including caregiver support, resource connection, and help for seniors facing housing displacement.',
    supportAreas: ['Community-based care planning with families', 'Family and caregiver guidance', 'Housing help for displaced seniors', 'Follow-up to help avoid institutional readmission'],
    caveats: [GENERAL_CAVEAT],
    askStaff: ['How does BLH involve family caregivers in planning?', 'What is the first step for an older adult who wants to stay at home?'],
    contact: MAIN_CONTACT,
    categories: ['Aging'],
    keywords: ['senior', ' older', 'elder', ' aging', ' mom', 'mother', 'dad', 'father', 'grand', 'parent', 'caregiver', 'retire', 'memory'],
    core: true,
  },
  {
    id: 'supported-care',
    name: 'Supported Care Case Management',
    tagline: 'Intensive case management across all ages',
    sourceUrl: `${SITE}/programs-supported-care.html`,
    lastVerified: VERIFIED,
    description: 'Intensive case management with individualized care plans for children, adults, and seniors, including outreach, partner referrals, and help with insurance applications and recertification.',
    supportAreas: ['Outreach and engagement', 'Community partner referrals', 'Benefits applications and recertification', 'Individualized care planning'],
    caveats: [GENERAL_CAVEAT, 'The public page refers to “eligible participants”; staff confirm eligibility.'],
    askStaff: ['Who is eligible for supported care case management?', 'Can you help with a benefits recertification?'],
    contact: MAIN_CONTACT,
    categories: ['Benefits', 'Care coordination', 'Disability'],
    keywords: ['case manag', 'recertif', 'renew', 'application', 'chronic', 'child', 'youth', 'kid', ' son ', 'daughter', 'paperwork'],
    core: false,
  },
  {
    id: 'dda',
    name: 'Developmental Disabilities Administration (DDA)',
    tagline: 'Coordination of Community Services (CCS)',
    sourceUrl: `${SITE}/programs-dda.html`,
    lastVerified: VERIFIED,
    description: 'In partnership with Maryland DDA, Coordination of Community Services for people with intellectual and developmental disabilities: planning, waiver waiting-list support, and youth transition help.',
    supportAreas: ['Person-centered planning', 'Support while on a DDA waiver waiting list', 'Youth transition from school to adult services', 'Coordinating equipment, employment, and caregiver supports'],
    caveats: [GENERAL_CAVEAT, 'DDA eligibility is determined with the Maryland DDA, not by BLH or this tool.', 'The public page notes transfers to BLH as a CCS provider take roughly 30–60 days.'],
    askStaff: ['How does switching CCS providers to BLH work?', 'What support is available while on the waiver waiting list?'],
    contact: MAIN_CONTACT,
    categories: ['Disability'],
    keywords: ['dda', 'developmental', 'intellectual', 'disabilit', 'waiver', 'ccs', 'special needs', 'school', 'graduat', 'transition to adult', 'assistive', 'equipment'],
    core: false,
  },
  {
    id: 'readmission',
    name: 'Hospital Readmission Prevention',
    tagline: 'Getting home safely — and staying well',
    sourceUrl: `${SITE}/programs-readmission.html`,
    lastVerified: VERIFIED,
    description: 'Coordinated teams that address social risk factors such as housing instability, limited transportation, and lack of primary care access after a hospital stay.',
    supportAreas: ['Multidisciplinary care teams', 'Support for social risk factors', 'Culturally and linguistically responsive communication', 'Coordination with community organizations'],
    caveats: [GENERAL_CAVEAT, 'This program supports transitions; it does not replace discharge instructions from the care team.'],
    askStaff: ['Can BLH help coordinate supports after a recent hospital discharge?', 'Is language access available for follow-up conversations?'],
    contact: MAIN_CONTACT,
    categories: ['Hospital discharge', 'Transportation'],
    keywords: ['hospital', 'discharg', 'readmi', 'came home', 'released', 'emergency room', 'surgery', 'rehab', 'nursing facility', 'transport'],
    core: false,
  },
  {
    id: 'transitional-housing',
    name: 'Transitional Housing',
    tagline: 'A bridge to stable housing',
    sourceUrl: `${SITE}/programs-transitional-housing.html`,
    lastVerified: VERIFIED,
    description: 'Supportive housing referrals, case management, and care coordination for people with serious medical, mental, or behavioral health conditions who are in a housing crisis. Stays range from about two weeks to 24 months.',
    supportAreas: ['Housing referrals', 'Case and care management during the stay', 'Treatment and placement coordination'],
    caveats: [GENERAL_CAVEAT, 'Placement depends on availability and staff assessment.'],
    askStaff: ['Is transitional housing a fit for my situation?', 'What happens after a transitional stay ends?'],
    contact: MAIN_CONTACT,
    categories: ['Housing'],
    keywords: ['homeless', 'shelter', 'nowhere to', 'crisis', 'transitional', 'couch', 'unhoused', 'substance', 'recovery', 'kicked out'],
    core: false,
  },
  {
    id: 'population-health',
    name: 'Population Health Initiative',
    tagline: 'Partnerships with plans, hospitals and practices',
    sourceUrl: `${SITE}/programs-population-health.html`,
    lastVerified: VERIFIED,
    description: 'System-level partnerships with managed care organizations, hospitals, and physician practices to coordinate support for at-risk populations. Aimed at organizations rather than individual visitors.',
    supportAreas: ['MCO partnerships', 'Hospital and health system collaboration', 'Physician practice outreach and follow-up'],
    caveats: ['This program is for partner organizations; individuals should start with another program or the main line.'],
    askStaff: ['Who should a partner organization contact about collaboration?'],
    contact: MAIN_CONTACT,
    categories: ['Care coordination'],
    keywords: ['partner', 'our practice', 'our clinic', 'organization', 'population', 'mco', 'health system', 'collaborat'],
    core: false,
  },
]

export const programById = (id: string) => programCatalog.find((p) => p.id === id)
