import { Menu, MessageCircleHeart, X } from 'lucide-react'
import { createContext, useContext, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import NavigatorPanel from '../navigator/NavigatorPanel'
import { officialContact } from '../data/programs'
import { DEMO_NOTICE, Logo } from './ui'

const NAV = [
  ['/', 'Home'], ['/about', 'About'], ['/programs', 'Programs'], ['/who-we-serve', 'Who We Serve'],
  ['/community', 'Community'], ['/careers', 'Careers'], ['/contact', 'Contact'], ['/faq', 'FAQ'],
] as const

const NavigatorCtx = createContext<(programId?: string) => void>(() => {})
export const useOpenNavigator = () => useContext(NavigatorCtx)

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  const [contextProgram, setContextProgram] = useState<string>()
  const [menu, setMenu] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => { setMenu(false); window.scrollTo(0, 0) }, [pathname])

  const openNavigator = (programId?: string) => { setContextProgram(programId); setOpen(true) }

  return (
    <NavigatorCtx.Provider value={openNavigator}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[60] focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" aria-label="BLH Care Navigator home"><Logo /></Link>
          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-0.5">
              {NAV.map(([to, label]) => (
                <li key={to}>
                  <NavLink to={to} end={to === '/'} className={({ isActive }) => `whitespace-nowrap rounded-full px-2.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] ${isActive ? 'text-ink underline decoration-gold-400 decoration-2 underline-offset-8' : 'text-ink/60 hover:text-ink'}`}>{label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/employee" className="hidden whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold text-ink/60 hover:text-ink 2xl:block">Employee portal</Link>
            <button className="btn-primary hidden sm:inline-flex" onClick={() => openNavigator()}><MessageCircleHeart size={16} aria-hidden /> Care Navigator</button>
            <button className="rounded-lg p-2 xl:hidden" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu(!menu)}>
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menu && (
          <nav id="mobile-menu" aria-label="Mobile" className="border-t border-ink/10 bg-cream px-4 pb-4 xl:hidden">
            <ul className="grid gap-1 pt-2">
              {[...NAV, ['/employee', 'Employee portal (demo)'] as const].map(([to, label]) => (
                <li key={to}><NavLink to={to} end={to === '/'} className={({ isActive }) => `block rounded-lg px-3 py-2.5 font-semibold ${isActive ? 'bg-leaf-50 text-leaf-700' : ''}`}>{label}</NavLink></li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main id="main" tabIndex={-1} className="min-h-[60vh] focus:outline-none">
        <Outlet />
      </main>

      <footer className="mt-24 border-t border-ink/10 bg-shell text-ink/70 [background-image:radial-gradient(circle_at_0%_0%,rgba(255,198,41,.14),transparent_384px)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-md text-sm">Helping people find the right support, and helping our team follow up quickly and warmly.</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">Explore</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {NAV.slice(1).map(([to, label]) => <li key={to}><Link className="hover:text-ink" to={to}>{label}</Link></li>)}
              <li><Link className="hover:text-ink" to="/demo-notice">Privacy & demo notice</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">Reach the real organization</h2>
            <p className="mt-3 text-sm">This demo cannot send messages. To contact Beatrice Loving Heart, use the official site:</p>
            <a className="mt-2 inline-block text-sm font-semibold text-ink underline" href={officialContact.sourceUrl} target="_blank" rel="noopener noreferrer">blhnurses.com/contact</a>
            <p className="mt-4 text-xs text-ink/50">In an emergency, call 911.</p>
          </div>
        </div>
        <p className="border-t border-ink/10 px-4 py-5 text-center text-xs text-ink/50">{DEMO_NOTICE} Synthetic data only · Not HIPAA-compliant.</p>
      </footer>

      {!open && (
        <button onClick={() => openNavigator()} className="btn-primary fixed bottom-5 right-5 z-40 px-5 py-3.5 shadow-lg shadow-leaf-700/30" aria-haspopup="dialog">
          <MessageCircleHeart size={20} aria-hidden /> <span>Care Navigator</span>
        </button>
      )}
      <NavigatorPanel open={open} onClose={() => setOpen(false)} contextProgramId={contextProgram} />
    </NavigatorCtx.Provider>
  )
}
