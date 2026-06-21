import { Link, useLocation } from 'react-router-dom'
import { Home, Shirt, Users, MapPin, Music, Trophy, ChevronRight } from 'lucide-react'
import { clsx } from '../lib/utils'
import { useVersion } from '../contexts/VersionContext'

const NAV = [
  { to: '/',           icon: Home,   label: 'Home' },
  { to: '/characters', icon: Users,  label: 'Characters' },
  { to: '/stages',     icon: MapPin, label: 'Stages' },
  { to: '/jukebox',    icon: Music,  label: 'Jukebox' },
  { to: '/ranks',      icon: Trophy, label: 'Ranks' },
  { to: '/items',      icon: Shirt,  label: 'Customize Items' },
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
  const { version, setVersion, versions } = useVersion()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f0f13' }}>
      <aside
        className="flex-shrink-0 flex flex-col border-r"
        style={{
          width: 'var(--sidebar-width)',
          background: 'rgba(15,15,22,0.98)',
          borderColor: 'rgba(255,255,255,0.07)',
        }}
      >
        <div className="px-4 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <img
              src={`${import.meta.env.BASE_URL}favicon.png`}
              alt="TKDB"
              style={{ width: 32, height: 32 }}
            />
            <p className="text-sm font-semibold text-slate-100">TKDatabase</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {NAV.map(item => <NavItem key={item.to} {...item} />)}
        </nav>

        {versions.length > 1 && (
          <div className="px-3 pb-3 border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] text-slate-600 mb-1.5 px-1">Game Version</p>
            <select
              value={version}
              onChange={e => setVersion(e.target.value)}
              className="w-full text-xs rounded-lg px-3 py-1.5 text-slate-300 outline-none cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              {versions.map(v => (
                <option key={v.id} value={v.id} style={{ background: '#1a1a24' }}>{v.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="px-4 py-3 border-t text-[10px] text-slate-600" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          Tekken 8 Game Data Viewer
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
