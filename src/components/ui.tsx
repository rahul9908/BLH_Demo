import { ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'

export const DEMO_NOTICE = 'Unofficial concept demo — Not affiliated with Beatrice Loving Heart. Do not enter real patient information.'

/** Original mark (heart + leaf) — intentionally not the company's logo. */
export function Logo(_: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden>
        <defs><linearGradient id="lg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#e2a737" /><stop offset="1" stopColor="#00af4c" /></linearGradient></defs>
        <circle cx="17" cy="17" r="16" fill="url(#lg)" />
        <path d="M17 25s-7-4.3-7-9.2A3.8 3.8 0 0 1 17 13.6a3.8 3.8 0 0 1 7 2.2C24 20.7 17 25 17 25z" fill="#fff" />
      </svg>
      <span className="leading-tight">
        <span className="block whitespace-nowrap text-sm font-extrabold tracking-tight">BLH Care Navigator</span>
      </span>
    </span>
  )
}

const ORIGIN_STYLES = {
  'Visitor message': 'bg-sky-100 text-sky-900 dark:bg-sky-900/50 dark:text-sky-100',
  'AI suggestion': 'bg-violet-100 text-violet-900 dark:bg-violet-900/50 dark:text-violet-100',
  'Staff-reviewed': 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100',
  'Synthetic demo data': 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100',
  'Simulated answer': 'bg-violet-100 text-violet-900 dark:bg-violet-900/50 dark:text-violet-100',
  'Sample data': 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100',
} as const

export function Badge({ kind, children }: { kind: keyof typeof ORIGIN_STYLES; children?: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${ORIGIN_STYLES[kind]}`}>{children ?? kind}</span>
}

export function SourceLink({ href, label = 'Official source' }: { href: string; label?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-leaf-700 underline underline-offset-2 hover:text-leaf-600 dark:text-emerald-300">
      {label} <ExternalLink size={12} aria-hidden /><span className="sr-only">(opens official site in new tab)</span>
    </a>
  )
}

export const fmtDate = (iso: string) => new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
export const fmtDay = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
