import { Link } from 'react-router-dom'
import { useData } from '../hooks/useData'
import type { CharacterList, StageList, JukeboxList, CustomizeItemCommonList } from '../lib/types'

interface StatCardProps {
  label: string
  value: number | string
  to: string
  accent: string
}

function StatCard({ label, value, to, accent }: StatCardProps) {
  return (
    <Link
      to={to}
      className="block rounded-xl p-5 border transition-all duration-200 hover:scale-[1.02] hover:border-violet-500/40 hover:shadow-lg"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <div className="text-3xl font-bold mb-1" style={{ color: accent }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-slate-400">{label}</div>
    </Link>
  )
}

export function HomePage() {
  const chars  = useData<CharacterList>('character_list')
  const stages = useData<StageList>('stage_list')
  const bgm    = useData<JukeboxList>('jukebox_list')
  const items  = useData<CustomizeItemCommonList>('customize_item_common_list')

  const charCount  = chars.data?.data?.entries?.length ?? '...'
  const stageCount = stages.data?.data?.entries?.length ?? '...'
  const bgmCount   = bgm.data?.data?.entries?.length ?? '...'
  const itemCount  = items.data?.data?.entries?.length ?? '...'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="mb-10 mt-4">
        <h1
          className="text-4xl font-bold mb-3"
          style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Polaris TK Database
        </h1>
        <p className="text-slate-400 text-base">
          Tekken 8 game data extracted from <code className="text-violet-400 bg-violet-500/10 px-1 rounded">tkdata.bin</code> and parsed from FlatBuffers binary format.
        </p>
      </div>

      {/* Stats Grid */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Data Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Characters"       value={charCount}  to="/characters" accent="#a78bfa" />
          <StatCard label="Stages"           value={stageCount} to="/stages"     accent="#60a5fa" />
          <StatCard label="BGM Tracks"       value={bgmCount}   to="/jukebox"    accent="#34d399" />
          <StatCard label="Customize Items"  value={itemCount}  to="/items"      accent="#fb923c" />
        </div>
      </section>

      {/* Data Sources */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Available Datasets</h2>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {[
            { name: 'Characters',         file: 'character_list',              to: '/characters' },
            { name: 'Stages',             file: 'stage_list',                  to: '/stages' },
            { name: 'Jukebox / BGM',      file: 'jukebox_list',                to: '/jukebox' },
            { name: 'Ranks',              file: 'rank_list',                   to: '/ranks' },
            { name: 'Customize Items',    file: 'customize_item_common_list',  to: '/items' },
            { name: 'Gallery Illusts',    file: 'gallery_illust_list',         to: '/gallery' },
            { name: 'Gallery Movies',     file: 'gallery_movie_list',          to: '/movies' },
            { name: 'Episodes',           file: 'character_episode_list',      to: '/episodes' },
            { name: 'Fighter Basic Info', file: 'per_fighter_basic_info_list', to: '/characters' },
            { name: 'Fighter Battle Info',file: 'per_fighter_battle_info_list',to: '/characters' },
          ].map((row, i) => (
            <Link
              key={row.file}
              to={row.to}
              className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/5"
              style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
            >
              <span className="text-sm text-slate-300">{row.name}</span>
              <span className="text-[11px] font-mono text-slate-600">{row.file}.json</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
