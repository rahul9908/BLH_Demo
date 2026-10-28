import { Download } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, fmtDate } from '../components/ui'
import { download } from '../lib/copilot'
import { audit, generateMore, getState, resetDemo, setState, STORAGE_KEY, useDemo } from '../lib/store'
import { ROLES, type Role } from '../lib/types'

const WALKTHROUGH = [
  ['Open the public site and click Care Navigator', '/'],
  ['Click “Fill a sample story”, then “Help me describe this better” → Use suggestion → send', '/'],
  ['Answer the guided questions (chips), review the draft, tick consent, send to the demo inbox', '/'],
  ['Open the new inquiry here: read the full transcript and AI provenance', '/employee/inbox?source=Care+Navigator'],
  ['Assign an owner, approve a program, add and complete a task', '/employee/inbox?status=New'],
  ['Watch KPIs and charts update on Overview and Analytics', '/employee/overview'],
] as const

export default function Settings() {
  const { staff, audit: log, inquiries, theme } = useDemo()
  const [armed, setArmed] = useState(false)
  const setRole = (role: Role) => {
    const s = getState()
    setState({ ...s, staff: { ...s.staff!, role }, audit: [audit(s.staff!.name, `Switched simulated role to ${role}`), ...s.audit] })
  }
  const bytes = (() => { try { return (localStorage.getItem(STORAGE_KEY) ?? '').length } catch { return 0 } })()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings, audit & demo tools</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel space-y-3 p-4">
          <h2 className="text-sm font-semibold">Simulated role</h2>
          <p className="text-xs text-slate-500">Role switching is simulated and not a security control. In this demo, roles only change a few UI permissions (e.g. re-verifying knowledge base entries).</p>
          <div className="flex flex-wrap gap-2">{ROLES.map((r) => <button key={r} className={staff?.role === r ? 's-btn-primary' : 's-btn'} onClick={() => setRole(r)} aria-pressed={staff?.role === r}>{r}</button>)}</div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={theme === 'dark'} onChange={(e) => setState({ ...getState(), theme: e.target.checked ? 'dark' : 'light' })} /> Dark mode</label>
        </section>

        <section className="panel space-y-3 p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">Demo data <Badge kind="Synthetic demo data" /></h2>
          <p className="text-xs text-slate-500">{inquiries.length} inquiries · ~{Math.round(bytes / 1024)} KB in this browser’s localStorage. Not shared with other browsers or devices; never transmitted.</p>
          <div className="flex flex-wrap gap-2">
            <button className="s-btn" onClick={() => generateMore(10)}>Generate 10 fresh synthetic cases</button>
            {/* Two-step confirm instead of window.confirm, which embedded browsers can auto-dismiss. */}
            <button className={armed ? 's-btn border-rose-400 bg-rose-50 text-rose-700' : 's-btn'} onClick={() => { if (armed) { resetDemo(); setArmed(false) } else setArmed(true) }} onBlur={() => setArmed(false)}>
              {armed ? 'Click again to reset everything' : 'Reset all demo data'}
            </button>
            <button className="s-btn" onClick={() => download('demo-audit-log.json', JSON.stringify({ notice: 'Synthetic demo data only', audit: log }, null, 2), 'application/json')}><Download size={14} aria-hidden /> Export audit log</button>
          </div>
        </section>
      </div>

      <section className="panel p-4">
        <h2 className="text-sm font-semibold">2-minute demo walkthrough</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {WALKTHROUGH.map(([text, to]) => <li key={text}><Link className="hover:underline" to={to}>{text}</Link></li>)}
        </ol>
      </section>

      <section className="panel p-4">
        <h2 className="text-sm font-semibold">Audit log (this browser)</h2>
        <p className="text-xs text-slate-500">Local demo log of workflow actions. A real system would write immutable server-side audit records.</p>
        <div className="mt-3 max-h-96 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-white dark:bg-slate-900"><tr className="border-b border-slate-200 dark:border-slate-700"><th className="py-1.5 pr-3">When</th><th className="pr-3">Actor</th><th>Action</th></tr></thead>
            <tbody>
              {log.map((a) => <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800"><td className="whitespace-nowrap py-1.5 pr-3 text-slate-500">{fmtDate(a.at)}</td><td className="pr-3">{a.actor}</td><td>{a.text}</td></tr>)}
              {!log.length && <tr><td colSpan={3} className="py-4 text-center text-slate-500">No actions recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
