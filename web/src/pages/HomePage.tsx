import { Link } from 'react-router-dom'
import { useGameData } from '../hooks/useGameData'
import type { CharacterList, CustomizeItemCommonList, CustomizeItemUniqueList, JukeboxList, RankList, StageList } from '../lib/types'

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
  const common = useGameData<CustomizeItemCommonList>('fbsdata', 'customize_item_common_list')
  const unique = useGameData<CustomizeItemUniqueList>('fbsdata', 'customize_item_unique_list')
  const chars  = useGameData<CharacterList>('fbsdata', 'character_list')
  const stages = useGameData<StageList>('fbsdata', 'stage_list')
  const jukebox = useGameData<JukeboxList>('fbsdata', 'jukebox_list')
  const ranks   = useGameData<RankList>('fbsdata', 'rank_list')

  const commonCount = common.data?.data?.entries?.length ?? '...'
  const uniqueCount = unique.data?.data?.entries?.length ?? '...'
  const charCount   = chars.data?.data?.entries?.length ?? '...'
  const stageCount  = stages.data?.data?.entries?.length ?? '...'
  const jukeboxCount = jukebox.data?.data?.entries?.length ?? '...'
  const rankCount = ranks.data?.data?.entries?.reduce((sum, g) => sum + g.entries.length, 0) ?? '...'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="mb-10 mt-4">
        <img
          src={`${import.meta.env.BASE_URL}title.png`}
          alt="Polaris TK Database"
          className="mb-3"
          style={{ height: 72, width: 'auto' }}
        />
        <p className="text-slate-400 text-base">
          Tekken 8 game data extracted from <code className="text-violet-400 bg-violet-500/10 px-1 rounded">tkdata.bin</code> and parsed from FlatBuffers binary format.
        </p>
      </div>

      {/* Stats Grid */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Data Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Characters" value={charCount} to="/characters" accent="#a78bfa" />
          <StatCard label="Stages" value={stageCount} to="/stages" accent="#38bdf8" />
          <StatCard label="Jukebox" value={jukeboxCount} to="/jukebox" accent="#34d399" />
          <StatCard label="Ranks" value={rankCount} to="/ranks" accent="#fbbf24" />
          <StatCard label="Common Items" value={commonCount} to="/items" accent="#fb923c" />
          <StatCard label="Unique Items" value={uniqueCount} to="/items" accent="#f472b6" />
        </div>
      </section>

      {/* Data Sources */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Available Datasets</h2>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {[
            { name: 'Characters', file: 'character_list', to: '/characters' },
            { name: 'Stages', file: 'stage_list', to: '/stages' },
            { name: 'Jukebox', file: 'jukebox_list', to: '/jukebox' },
            { name: 'Ranks', file: 'rank_list', to: '/ranks' },
            { name: 'Common Customize Items', file: 'customize_item_common_list', to: '/items' },
            { name: 'Unique Customize Items', file: 'customize_item_unique_list', to: '/items' },
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
