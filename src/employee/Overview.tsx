import { AlarmClock, ArrowRight, Hourglass, Inbox as InboxIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, fmtDate } from '../components/ui'
import { avgFirstResponseHours, byCategory, byStatus, inVsOut, kpis, periodChange, satisfaction, volumeByDay } from '../lib/analytics'
import { useDemo } from '../lib/store'
import { BarList, ChartCard, Donut, Kpi, StatusPill, TrendArea } from './charts'

export default function Overview() {
  const { inquiries, staff, audit } = useDemo()
  const k = kpis(inquiries)
  const received = periodChange(inquiries, (i) => i.createdAt)
  const resolved = periodChange(inquiries, (i) => (i.status === 'Closed' ? i.updatedAt : undefined))
  const latency = avgFirstResponseHours(inquiries)
  const sat = satisfaction(inquiries)
  const spark = volumeByDay(inquiries, 14)
  const waiting = inquiries.filter((i) => i.status === 'Awaiting Information').length
  const mine = inquiries.filter((i) => i.assignee === staff?.name && i.status !== 'Closed').slice(0, 6)
  const latestVisitor = inquiries.find((i) => i.source === 'Care Navigator' && i.status === 'New')
  const hour = new Date().getHours()

  const todo = [
    { n: k.newCount, label: 'New requests to review', to: '/employee/inbox?status=New', Icon: InboxIcon, tone: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200' },
    { n: k.followUpsDue, label: 'Follow-ups due today', to: '/employee/inbox?sort=due', Icon: AlarmClock, tone: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-200' },
    { n: waiting, label: 'Waiting on the family', to: '/employee/inbox?status=Awaiting+Information', Icon: Hourglass, tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Good {hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, {staff?.name.split(' ')[0]}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Here’s what needs your attention today. <Badge kind="Sample data" /></p>
        </div>
        <Link to="/employee/inbox" className="s-btn-primary px-4 py-2">Open inbox <ArrowRight size={14} aria-hidden /></Link>
      </div>

      {latestVisitor && (
        <Link to={`/employee/inquiry/${latestVisitor.id}`} className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm dark:border-indigo-800 dark:bg-indigo-950">
          <span className="relative flex h-2.5 w-2.5 shrink-0"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-600" /></span>
          <span className="min-w-0 flex-1 truncate"><strong>Just arrived from the Care Navigator:</strong> {latestVisitor.alias} — {latestVisitor.summary}</span>
          <span className="shrink-0 font-semibold text-indigo-700 dark:text-indigo-300">Review →</span>
        </Link>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {todo.map(({ n, label, to, Icon, tone }) => (
          <Link key={label} to={to} className="panel group flex items-center gap-4 p-4 transition hover:shadow-md">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={22} aria-hidden /></span>
            <span className="flex-1"><span className="block text-3xl font-bold tabular-nums">{n}</span><span className="text-sm text-slate-600 dark:text-slate-300">{label}</span></span>
            <ArrowRight size={18} className="text-slate-400 transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Requests this week" value={received.current} trend={received.pct} spark={spark} />
        <Kpi label="Resolved this week" value={resolved.current} trend={resolved.pct} />
        <Kpi label="Avg. first reply" value={latency === null ? '—' : `${latency}h`} hint="From request to first staff action" />
        <Kpi label="Family satisfaction" value={sat.avg === null ? '—' : `${sat.avg}★`} hint={`${sat.count} ratings`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Requests coming in vs. resolved" definition="Last 30 days. Hover to see each day.">
            <TrendArea data={inVsOut(inquiries)} keys={[{ key: 'received', name: 'Coming in' }, { key: 'resolved', name: 'Resolved' }]} />
          </ChartCard>
        </div>
        <ChartCard title="Where requests stand"><Donut data={byStatus(inquiries).filter((d) => d.value)} centerLabel="total" /></ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="What people need help with"><BarList data={byCategory(inquiries).slice(0, 6)} /></ChartCard>
        <section className="panel p-4">
          <h2 className="text-sm font-semibold">My open requests</h2>
          <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {mine.map((i) => (
              <li key={i.id}><Link to={`/employee/inquiry/${i.id}`} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:underline"><span className="truncate">{i.alias}</span><StatusPill status={i.status} /></Link></li>
            ))}
            {!mine.length && <li className="py-4 text-sm text-slate-500">Nothing assigned to you yet.</li>}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Demo story: <Link className="font-semibold text-indigo-600 underline dark:text-indigo-300" to="/employee/inquiry/DEMO-1000">Harper family (start to finish)</Link></p>
        </section>
        <section className="panel p-4">
          <h2 className="text-sm font-semibold">Recent activity</h2>
          <ul className="mt-3 space-y-2.5 text-sm">
            {audit.slice(0, 6).map((a) => <li key={a.id}><p>{a.text}</p><p className="text-xs text-slate-500">{a.actor.split(' (')[0]} · {fmtDate(a.at)}</p></li>)}
            {!audit.length && <li className="text-slate-500">No actions yet. Assign a request or add a note to see it here.</li>}
          </ul>
        </section>
      </div>
    </div>
  )
}
