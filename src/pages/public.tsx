import { ArrowRight, CheckCircle2, ChevronRight, MessageCircleHeart, Phone, ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useOpenNavigator } from '../components/PublicLayout'
import { SourceLink } from '../components/ui'
import { officialContact, programById, programCatalog } from '../data/programs'

const SITE = 'https://www.blhnurses.com'
const VALUES = ['Dignity', 'Choice', 'Community', 'Independence', 'Respect']

function Hero({ eyebrow, title, children, source }: { eyebrow: string; title: string; children?: ReactNode; source?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-ink/10">
      <div aria-hidden className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-br from-gold-100 via-leaf-50 to-leaf-100 md:block [clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">{title}</h1>
        <div className="mt-6 max-w-2xl text-lg text-ink/70">{children}</div>
        {source && <p className="mt-4"><SourceLink href={source} label="Based on the public page" /></p>}
      </div>
    </section>
  )
}

function Section({ eyebrow, title, children, className = '' }: { eyebrow?: string; title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`mx-auto max-w-7xl px-4 py-16 sm:px-6 ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {title && <h2 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>}
      <div className="mt-8">{children}</div>
    </section>
  )
}

function ProgramGrid({ core }: { core?: boolean }) {
  const list = core === undefined ? programCatalog : programCatalog.filter((p) => p.core === core)
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p, i) => (
        <li key={p.id}>
          <Link to={`/programs/${p.id}`} className="card group flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="text-sm font-bold text-gold-500">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-2 text-lg font-bold">{p.name}</h3>
            <p className="mt-2 flex-1 text-sm text-ink/70">{p.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-leaf-700">Learn more <ArrowRight size={14} className="transition group-hover:translate-x-0.5" aria-hidden /></span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function Cta() {
  const open = useOpenNavigator()
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="rounded-3xl bg-gradient-to-r from-leaf-700 to-leaf-500 p-10 text-white md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold sm:text-3xl">Not sure which program fits?</h2>
          <p className="mt-2 max-w-xl text-white/85">The Care Navigator can help you describe your situation and point to official program pages. It’s a demo — it never sends anything to BLH.</p>
        </div>
        <button className="btn mt-6 bg-white text-leaf-700 hover:bg-gold-100 md:mt-0" onClick={() => open()}><MessageCircleHeart size={18} aria-hidden /> Open the Care Navigator</button>
      </div>
    </section>
  )
}

export function Home() {
  const open = useOpenNavigator()
  return (
    <>
      <Hero eyebrow="Person-centered planning · Person-centered supports" title="Support that meets people where they are." source={SITE}>
        <p>Our services help individuals thrive in their homes and communities of their choosing. Tell the Care Navigator what's going on, and it will point you to the programs worth asking about.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button className="btn-primary" onClick={() => open()}><MessageCircleHeart size={18} aria-hidden /> Start with the Care Navigator</button>
          <Link to="/programs" className="btn-ghost">Explore programs</Link>
        </div>
      </Hero>
      <div className="overflow-hidden border-b border-ink/10 bg-white py-4" aria-label="Values">
        <ul className="flex flex-wrap justify-center gap-x-10 gap-y-2 px-4 text-sm font-bold uppercase tracking-[0.25em] text-ink/50">
          {VALUES.map((v) => <li key={v}>{v}</li>)}
        </ul>
      </div>
      <div className="bg-ink text-[#fbfaf7] [&_.eyebrow]:text-gold-400 [&_a]:text-gold-400"><Section eyebrow="Mission" title="Understanding choices. Connecting resources.">
        <p className="max-w-3xl text-lg text-white/75">Beatrice Loving Heart provides case management that helps people understand their choices and connects them with resources in their communities, in ways that respect their dignity and rights.</p>
        <p className="mt-3"><SourceLink href={`${SITE}/about.html`} /></p>
      </Section></div>
      <Section eyebrow="Programs" title="Five core programs, one person-centered standard." className="pt-0">
        <ProgramGrid core />
        <p className="mt-6 text-sm text-ink/70">Also listed: <Link className="font-semibold underline" to="/programs/supported-care">Supported Care Case Management</Link> · <Link className="font-semibold underline" to="/programs/dda">DDA</Link> · <Link className="font-semibold underline" to="/programs/transitional-housing">Transitional Housing</Link> · <Link className="font-semibold underline" to="/programs">all programs</Link></p>
      </Section>
      <Section eyebrow="Who we serve & partners" title="Built with the people and systems around each person." className="pt-0">
        <ul className="flex flex-wrap gap-3">
          {['Families & individuals', 'Community providers', 'State agencies', 'Long-term services & supports', 'Medicaid & Medicare', 'Hospitals'].map((x) => <li key={x} className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-medium">{x}</li>)}
        </ul>
      </Section>
      <Section eyebrow="How it works" title="Two connected experiences." className="pt-0">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="card p-6"><h3 className="font-bold">For visitors</h3><p className="mt-2 text-sm text-ink/70">A guided assistant that asks a few simple questions, helps phrase the request clearly, shows sourced program cards, and drafts an inquiry for review.</p></div>
          <div className="card p-6"><h3 className="font-bold">For employees</h3><p className="mt-2 text-sm text-ink/70">A demo employee portal with an inbox, full transcripts, AI-drafted (never auto-sent) suggestions, tasks, and analytics. <Link className="font-semibold underline" to="/employee">Open the employee portal</Link>.</p></div>
        </div>
      </Section>
      <Cta />
    </>
  )
}

export function About() {
  return (
    <>
      <Hero eyebrow="About · Bowie, MD" title="Care that respects dignity, choice, and rights." source={`${SITE}/about.html`}>
        <p>The public About page describes more than 50 years of combined community service to Maryland families, connecting people of all ages and abilities to supports in the communities they choose.</p>
      </Hero>
      <Section eyebrow="Values" title="Six values described on the public site">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[['A holistic approach', 'Supporting physical, intellectual, and emotional wellbeing together.'], ['Person-centered planning', 'The plan follows the person.'], ['Participant focus', 'Participants are at the forefront of the work.'], ['A complete package', 'Coordination, referrals, and follow-up rather than one-time hand-offs.'], ['Commitment to independence', 'Helping participants maximize independence.'], ['Extensive experience', 'Experienced coordinators and clinical staff.']].map(([t, d], i) => (
            <li key={t} className="card p-6"><span className="text-sm font-bold text-gold-500">0{i + 1}</span><h3 className="mt-1 font-bold">{t}</h3><p className="mt-1 text-sm text-ink/70">{d}</p></li>
          ))}
        </ul>
      </Section>
      <Section eyebrow="Areas of expertise" title="Moving people toward the community of their choice." className="pt-0">
        <p className="max-w-3xl text-ink/70">The site describes programs that help people move from institutions, nursing facilities, and hospitals to homes in the community, plus targeted support services, employment and training, and care coordination with local agencies.</p>
      </Section>
      <Cta />
    </>
  )
}

export function Programs() {
  return (
    <>
      <Hero eyebrow="Programs · Person-centered case management" title="Coordinated support that follows the person." source={`${SITE}/programs.html`}>
        <p>Every program summary below is a short paraphrase of the public program page, with a link to the original and the date it was last reviewed for this demo.</p>
      </Hero>
      <Section eyebrow="Core programs" title="What BLH describes as its five core programs"><ProgramGrid core /></Section>
      <Section eyebrow="Also listed" title="Additional programs on the public site" className="pt-0"><ProgramGrid core={false} /></Section>
      <Cta />
    </>
  )
}

export function ProgramDetail() {
  const { id } = useParams()
  const p = programById(id ?? '')
  const open = useOpenNavigator()
  if (!p) return <NotFound />
  return (
    <>
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-6 text-sm text-ink/60 sm:px-6">
        <ol className="flex flex-wrap items-center gap-1"><li><Link to="/" className="hover:underline">Home</Link></li><ChevronRight size={14} aria-hidden /><li><Link to="/programs" className="hover:underline">Programs</Link></li><ChevronRight size={14} aria-hidden /><li aria-current="page" className="font-semibold text-ink">{p.name}</li></ol>
      </nav>
      <Hero eyebrow={p.tagline} title={p.name} source={p.sourceUrl}>
        <p>{p.description}</p>
        <button className="btn-primary mt-8" onClick={() => open(p.id)}><MessageCircleHeart size={18} aria-hidden /> Ask the Care Navigator about this program</button>
      </Hero>
      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-2">
            <h2 className="text-xl font-bold">Typical support areas</h2>
            <ul className="mt-4 space-y-3">{p.supportAreas.map((s) => <li key={s} className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-leaf-600" size={18} aria-hidden />{s}</li>)}</ul>
            <h2 className="mt-8 text-xl font-bold">Questions you might ask staff</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-ink/80">{p.askStaff.map((q) => <li key={q}>{q}</li>)}</ul>
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-gold-400/40 bg-gold-100/50 p-6">
              <h2 className="flex items-center gap-2 font-bold"><ShieldAlert size={18} aria-hidden /> Good to know</h2>
              <ul className="mt-3 space-y-2 text-sm text-ink/80">{p.caveats.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-bold"><Phone size={18} aria-hidden /> Contact (official)</h2>
              <p className="mt-2 text-sm text-ink/80">{p.contact}</p>
              <p className="mt-3"><SourceLink href={p.sourceUrl} /></p>
              <p className="mt-2 text-xs text-ink/50">Source last verified {p.lastVerified}</p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  )
}

export function WhoWeServe() {
  const groups = [
    ['Children & youth', 'Children and youth with special health care needs — coordinating services, schools, and supports with families.', ['supported-care', 'dda']],
    ['Adults', 'Working-age adults with disabilities and complex needs — supports planning, supported employment, and housing placement.', ['housing', 'community-care', 'dda']],
    ['Seniors', 'Older adults aging well at home — coordinating health, wellness, and everyday living.', ['aging', 'care-coordination']],
  ] as const
  return (
    <>
      <Hero eyebrow="Who we serve · All ages & abilities" title="Meeting each person where they are." source={`${SITE}/who-we-serve.html`}>
        <p>The public site describes three broad groups, all served with the same person-centered approach.</p>
      </Hero>
      <Section>
        <div className="grid gap-5 md:grid-cols-3">
          {groups.map(([t, d, ids], i) => (
            <div key={t} className="card p-6">
              <span className="text-sm font-bold text-gold-500">0{i + 1}</span>
              <h2 className="mt-1 text-xl font-bold">{t}</h2>
              <p className="mt-2 text-sm text-ink/70">{d}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink/50">Related programs</p>
              <ul className="mt-2 space-y-1">{ids.map((pid) => <li key={pid}><Link className="text-sm font-semibold text-leaf-700 underline" to={`/programs/${pid}`}>{programById(pid)!.name}</Link></li>)}</ul>
            </div>
          ))}
        </div>
      </Section>
      <Cta />
    </>
  )
}

export function Community() {
  return (
    <>
      <Hero eyebrow="Community & events" title="A visible presence in the community." source={`${SITE}/community.html`}>
        <p>The public site highlights community events such as a day of service with Beans & Bread, community tours, and “An Omelette Affair.” Photos are not reproduced in this demo.</p>
      </Hero>
      <Section>
        <ul className="grid gap-5 md:grid-cols-3">
          {[['Beans & Bread', 'A day of service'], ['BLH Tour', 'Out in the community'], ['An Omelette Affair', 'Community event']].map(([t, d]) => (
            <li key={t} className="card overflow-hidden"><div aria-hidden className="h-32 bg-gradient-to-br from-leaf-100 to-gold-100" /><div className="p-6"><h2 className="font-bold">{t}</h2><p className="text-sm text-ink/60">{d}</p></div></li>
          ))}
        </ul>
        <p className="mt-6"><SourceLink href={`${SITE}/community.html`} label="See events on the official site" /></p>
      </Section>
    </>
  )
}

export function Careers() {
  return (
    <>
      <Hero eyebrow="Careers" title="Work that changes how people live.">
        <p>BLH lists open roles across planning, coordination, administration, and support on its official careers site. This demo does not take applications.</p>
        <p className="mt-6"><a className="btn-primary" href="https://careers.blhnurses.com/careers" target="_blank" rel="noopener noreferrer">View official careers site <ArrowRight size={16} aria-hidden /></a></p>
      </Hero>
    </>
  )
}

export function Contact() {
  const open = useOpenNavigator()
  return (
    <>
      <Hero eyebrow="Contact · Talk to staff" title="Reach the real team directly." source={officialContact.sourceUrl}>
        <p>This site has no contact form and cannot send anything to BLH. Use the official contact details below (copied from the public contact page), or explore options first with the Care Navigator.</p>
      </Hero>
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          <dl className="card grid gap-4 p-6 text-sm">
            {[['Address', officialContact.address], ['Phone', officialContact.phone], ['Toll free', officialContact.tollFree], ['Email', officialContact.email]].map(([k, v]) => (
              <div key={k}><dt className="text-xs font-bold uppercase tracking-wider text-ink/50">{k}</dt><dd className="mt-1 font-medium">{v}</dd></div>
            ))}
            <p><SourceLink href={officialContact.sourceUrl} label="Official contact page" /></p>
          </dl>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="flex items-center gap-2 font-bold text-red-900"><ShieldAlert size={18} aria-hidden /> Emergencies</h2>
            <p className="mt-2 text-sm text-red-900">If someone is in immediate danger or having a medical emergency, call 911. The Care Navigator is not monitored and is not for emergencies.</p>
            <button className="btn-ghost mt-6" onClick={() => open()}><MessageCircleHeart size={16} aria-hidden /> Explore options with the Care Navigator</button>
          </div>
        </div>
      </Section>
    </>
  )
}

const FAQS: [string, string][] = [
  ['Is this the official Beatrice Loving Heart website?', 'No. It is an unofficial interview concept demo. It is not affiliated with or endorsed by Beatrice Loving Heart.'],
  ['Does the Care Navigator send my information to BLH?', 'No. Everything stays in this browser’s local storage as synthetic demo data. Nothing is transmitted. Please do not enter real personal or health information.'],
  ['Is the assistant a real AI?', 'In demo mode, answers come from deterministic, curated matching rules over a program catalog built from public pages. Answers are labeled “Simulated answer.” A real deployment would route model calls through a secure server.'],
  ['Can it tell me if I qualify for a program?', 'No. Only BLH staff and partner agencies can determine eligibility or availability. The navigator suggests programs to ask about.'],
  ['Will the employee portal see my inquiry?', 'Only in the same browser. The employee portal reads the same local storage, so a demo inquiry you send appears there on this device — not anywhere else.'],
  ['How do I clear my data?', 'Use “Reset conversation” in the Care Navigator, or “Reset all demo data” in the employee portal Settings page. Clearing site data in your browser also removes it.'],
]

export function Faq() {
  return (
    <>
      <Hero eyebrow="FAQ" title="Questions about this demo" />
      <Section>
        <div className="mx-auto max-w-3xl divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white">
          {FAQS.map(([q, a]) => (
            <details key={q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">{q}<ChevronRight className="transition group-open:rotate-90" size={18} aria-hidden /></summary>
              <p className="mt-3 text-sm text-ink/70">{a}</p>
            </details>
          ))}
        </div>
      </Section>
    </>
  )
}

export function DemoNotice() {
  return (
    <>
      <Hero eyebrow="Privacy & demo notice" title="What this demo is — and isn’t." />
      <Section>
        <div className="mx-auto max-w-3xl space-y-4 text-ink/80">
          <p><strong>Unofficial.</strong> Built for an interview demonstration. Not affiliated with Beatrice Loving Heart; trademarks belong to their owners.</p>
          <p><strong>Synthetic data only.</strong> All inbox records, names, and conversations are fictional. Do not enter real patient or personal information.</p>
          <p><strong>Local only.</strong> Data is stored in your browser’s localStorage. It is not shared between browsers or devices and is never transmitted.</p>
          <p><strong>Not HIPAA-compliant.</strong> This is not a secure system and does not provide medical advice, diagnosis, or eligibility decisions.</p>
          <p><strong>Demo login.</strong> The employee portal’s role selector is simulated and not a security control.</p>
          <p><strong>Sources.</strong> Program descriptions are short paraphrases of public pages on blhnurses.com, linked on every program card.</p>
        </div>
      </Section>
    </>
  )
}

export function NotFound() {
  return (
    <Section title="Page not found">
      <p className="text-ink/70">That page doesn’t exist in this demo. <Link to="/" className="font-semibold underline">Go home</Link>.</p>
    </Section>
  )
}
