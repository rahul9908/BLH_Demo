import { BarChart3, BookOpen, Inbox, LayoutDashboard, LogOut, Moon, Settings, Sun } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Badge, Logo } from '../components/ui'
import { STAFF } from '../data/seed'
import { audit, getState, setState, useDemo } from '../lib/store'
import { ROLES, type Role } from '../lib/types'

const LINKS = [
  ['/employee/overview', 'Overview', LayoutDashboard],
  ['/employee/inbox', 'Inbox', Inbox],
  ['/employee/analytics', 'Reports', BarChart3],
  ['/employee/knowledge', 'Programs', BookOpen],
  ['/employee/settings', 'Settings', Settings],
] as const

export function StaffLogin() {
  const { staff } = useDemo()
  const [name, setName] = useState(STAFF[1])
  const [role, setRole] = useState<Role>('Case Coordinator')
  const navigate = useNavigate()
  if (staff) return <Navigate to="/employee/overview" replace />
  const enter = () => {
    const s = getState()
    setState({ ...s, staff: { name, role }, audit: [audit(`${name} (${role})`, 'Entered demo employee portal (simulated, no authentication)'), ...s.audit] })
    navigate('/employee/overview')
  }
  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto flex max-w-md flex-col px-4 py-16">
        <Link to="/" className="mb-8 self-center"><Logo /></Link>
        <div className="panel p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Demo access — employee portal</h1>
          <p className="mt-2 text-sm text-slate-600">This is <strong>not a real login</strong> and provides no security. Choose a synthetic staff persona and role to explore sample data stored in this browser.</p>
          <label className="mt-5 block text-sm font-medium text-slate-700">Demo persona
            <select className="s-input mt-1" value={name} onChange={(e) => setName(e.target.value)}>{STAFF.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
          <fieldset className="mt-4">
            <legend className="text-sm font-medium text-slate-700">Simulated role</legend>
            <div className="mt-2 grid gap-2">
              {ROLES.map((r) => (
                <label key={r} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${role === r ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}>
                  <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} />
                  <span><span className="font-medium text-slate-900">{r}</span><span className="block text-xs text-slate-500">{r === 'Case Coordinator' ? 'Works assigned inquiries' : r === 'Supervisor' ? 'Assigns and reviews team work' : 'Manages demo data and settings'}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
          <button className="s-btn-primary mt-6 w-full justify-center py-2" onClick={enter}>Enter demo employee portal</button>
          <p className="mt-4 text-xs text-slate-500">No password is collected. Role switching is simulated. A real deployment would require server-side authentication (see README).</p>
        </div>
      </main>
    </div>
  )
}

export function StaffLayout() {
  const { staff, theme, inquiries } = useDemo()
  if (!staff) return <Navigate to="/employee" replace />
  const unread = inquiries.filter((i) => i.unread).length
  const s = getState()
  const toggleTheme = () => setState({ ...s, theme: theme === 'dark' ? 'light' : 'dark' })
  const signOut = () => setState({ ...s, staff: undefined })

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="flex">
          <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:flex">
            <Link to="/" className="mb-1 dark:text-white" aria-label="Back to public demo site"><Logo compact /></Link>
            <p className="mb-6 text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Employee portal · demo</p>
            <nav aria-label="Staff" className="flex-1">
              <ul className="space-y-1">
                {LINKS.map(([to, label, Icon]) => (
                  <li key={to}>
                    <NavLink to={to} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                      <Icon size={16} aria-hidden /> {label}
                      {label === 'Inbox' && unread > 0 && <span className="ml-auto rounded-full bg-indigo-600 px-1.5 text-[11px] text-white">{unread}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-slate-200 pt-3 text-xs dark:border-slate-800">
              <p className="font-semibold">{staff.name}</p>
              <p className="text-slate-500">{staff.role} <Badge kind="Synthetic demo data">demo</Badge></p>
              <div className="mt-3 flex gap-2">
                <button className="s-btn px-2" onClick={toggleTheme} aria-label="Toggle dark mode">{theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}</button>
                <button className="s-btn px-2" onClick={signOut}><LogOut size={14} aria-hidden /> Exit</button>
              </div>
            </div>
          </aside>
          <div className="min-w-0 flex-1 pb-20 md:pb-0">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
              <Logo compact />
              <div className="flex gap-2">
                <button className="s-btn px-2" onClick={toggleTheme} aria-label="Toggle dark mode">{theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}</button>
                <button className="s-btn px-2" onClick={signOut} aria-label="Exit demo employee portal"><LogOut size={14} /></button>
              </div>
            </header>
            <main className="mx-auto max-w-[1600px] p-4 md:p-6"><Outlet /></main>
          </div>
        </div>
        <nav aria-label="Staff mobile" className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <ul className="grid grid-cols-5">
            {LINKS.map(([to, label, Icon]) => (
              <li key={to}><NavLink to={to} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[10px] ${isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500'}`}><Icon size={18} aria-hidden />{label.split(' ')[0]}</NavLink></li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
