import { useState } from 'react'
import { Badge } from '../components/ui'
import { avgFirstResponseHours, byCategory, byProgram, byStatus, inVsOut, periodChange, responseTimeByWeek, satisfaction, volumeByDay, volumeByWeek, workload } from '../lib/analytics'
import { useDemo } from '../lib/store'
import { BarList, ChartCard, DataTable, Donut, Kpi, SERIES, TimeBars, TrendArea, type Datum } from './charts'

export default function Analytics() {
  const { inquiries } = useDemo()
  const [asTable, setAsTable] = useState(false)
  const received = periodChange(inquiries, (i) => i.createdAt)
  const sat = satisfaction(inquiries)
  const latency = avgFirstResponseHours(inquiries)
  const open = byStatus(inquiries).filter((s) => s.label !== 'Closed')
  const weekly = volumeByWeek(inquiries, 5)
  const response = responseTimeByWeek(inquiries, 5)
  const programs = byProgram(inquiries)
  const topPrograms: Datum[] = [...programs.slice(0, 5), ...(programs.length > 5 ? [{ label: 'Other', value: programs.slice(5).reduce((n, d) => n + d.value, 0) }] : [])]
  const table = (data: Datum[] | { label: string; value: number | null }[], head: [string, string]) => <DataTable data={data.map((d) => ({ label: d.label, value: d.value ?? 0 }))} head={head} />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">How the team is doing, from {inquiries.length} sample requests. <Badge kind="Sample data" /></p>
        </div>
        <div className="flex rounded-lg border border-slate-300 p-0.5 text-sm dark:border-slate-600" role="group" aria-label="View as">
          <button className={`rounded-md px-3 py-1 ${!asTable ? 'bg-indigo-600 text-white' : ''}`} aria-pressed={!asTable} onClick={() => setAsTable(false)}>Charts</button>
          <button className={`rounded-md px-3 py-1 ${asTable ? 'bg-indigo-600 text-white' : ''}`} aria-pressed={asTable} onClick={() => setAsTable(true)}>Tables</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Requests this week" value={received.current} trend={received.pct} spark={volumeByDay(inquiries, 14)} />
        <Kpi label="Still open" value={open.reduce((n, s) => n + s.value, 0)} hint="Everything not yet closed" />
        <Kpi label="Avg. first reply" value={latency === null ? '—' : `${latency}h`} hint="Request → first staff action" />
        <Kpi label="Family satisfaction" value={sat.avg === null ? '—' : `${sat.avg} / 5`} hint={`${sat.count} ratings given`} />
      </div>

      <ChartCard title="Requests coming in vs. resolved — last 30 days" definition="A gap between the lines means the open list is growing.">
        {asTable ? <DataTable data={inVsOut(inquiries).map((d) => ({ label: d.label, value: d.received }))} head={['Day', 'Coming in']} /> : <TrendArea data={inVsOut(inquiries)} keys={[{ key: 'received', name: 'Coming in' }, { key: 'resolved', name: 'Resolved' }]} />}
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Requests per week" definition="Last 5 weeks, by date received.">{asTable ? table(weekly, ['Week', 'Requests']) : <TimeBars data={weekly} name="Requests" />}</ChartCard>
        <ChartCard title="How fast we reply (hours)" definition="Average hours to first staff action, by week received. Lower is better.">{asTable ? table(response, ['Week', 'Hours']) : <TimeBars data={response} name="Avg. first reply" unit="h" />}</ChartCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Programs people were matched to" definition="Staff-approved program, or the top suggestion if none approved yet.">{asTable ? table(programs, ['Program', 'Requests']) : <Donut data={topPrograms} centerLabel="matches" />}</ChartCard>
        <ChartCard title="What people need help with" definition="A request can mention more than one need.">{asTable ? table(byCategory(inquiries), ['Need', 'Requests']) : <BarList data={byCategory(inquiries)} />}</ChartCard>
        <ChartCard title="Open requests per team member" definition="Not yet closed.">{asTable ? table(workload(inquiries), ['Team member', 'Open']) : <BarList data={workload(inquiries)} color={SERIES[2]} />}</ChartCard>
      </div>

      <details className="panel p-4 text-sm text-slate-600 dark:text-slate-400">
        <summary className="cursor-pointer font-semibold text-slate-900 dark:text-slate-100">How these numbers are calculated</summary>
        <dl className="mt-3 grid gap-3 md:grid-cols-2">
          <div><dt className="font-semibold">First reply</dt><dd>Hours from when a request arrives to the first recorded staff action (assign, status change, note, or task).</dd></div>
          <div><dt className="font-semibold">Trends</dt><dd>“This week” is the last 7 days compared with the 7 days before.</dd></div>
          <div><dt className="font-semibold">Satisfaction</dt><dd>Only ratings a visitor actually gave. Unrated requests are left out.</dd></div>
          <div><dt className="font-semibold">Data</dt><dd>Synthetic sample data in this browser only. No outcome or savings claims.</dd></div>
        </dl>
      </details>
    </div>
  )
}
