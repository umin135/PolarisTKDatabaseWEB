import { Link, useLocation } from 'react-router-dom'
import {
  Home, Users, Map, Music, Trophy, Shirt,
  Image, Film, BookOpen, Database, ChevronRight
} from 'lucide-react'
import { clsx } from '../lib/utils'

const NAV = [
  { to: '/',            icon: Home,     label: 'Home' },
  { to: '/characters',  icon: Users,    label: 'Characters' },
  { to: '/stages',      icon: Map,      label: 'Stages' },
  { to: '/items',       icon: Shirt,    label: 'Customize Items' },
  { to: '/jukebox',     icon: Music,    label: 'Jukebox / BGM' },
  { to: '/ranks',       icon: Trophy,   label: 'Ranks' },
  { to: '/gallery',     icon: Image,    label: 'Gallery Illust' },
  { to: '/movies',      icon: Film,     label: 'Gallery Movies' },
  { to: '/episodes',    icon: BookOpen, label: 'Episodes' },
  { to: '/raw',         icon: Database, label: 'Raw Data' },
]

function NavItem({ to, icon: Icon, label }: { to: string; icon: typeof Home; label: string }) {
  const { pathname } = useLocation()
  const active = pathname === to || (to !== '/' && pathname.startsWith(to))

  return (
    <Link
      to={to}
      className={clsx(
        'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
        active
          ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
      )}
    >
      <Icon size={16} />
      <span>{label}</span>
      {active && <ChevronRight size={12} className="ml-auto opacity-60" />}
    </Link>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f0f13' }}>
      {/* Sidebar */}
      <aside
        className="flex-shrink-0 flex flex-col border-r"
        style={{
          width: 'var(--sidebar-width)',
          background: 'rgba(15,15,22,0.98)',
          borderColor: 'rgba(255,255,255,0.07)',
        }}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
            >
              T8
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">Polaris TK</p>
              <p className="text-[10px] text-slate-500 leading-none">Database</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {NAV.map(item => <NavItem key={item.to} {...item} />)}
        </nav>

        <div className="px-4 py-3 border-t text-[10px] text-slate-600" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          Tekken 8 Game Data Viewer
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
