import { Link } from 'react-router-dom'
import { useData } from '../hooks/useData'
import type { CustomizeItemCommonList, CustomizeItemUniqueList } from '../lib/types'

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
  const common = useData<CustomizeItemCommonList>('customize_item_common_list')
  const unique = useData<CustomizeItemUniqueList>('customize_item_unique_list')

  const commonCount = common.data?.data?.entries?.length ?? '...'
  const uniqueCount = unique.data?.data?.entries?.length ?? '...'

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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Common Items" value={commonCount} to="/items" accent="#fb923c" />
          <StatCard label="Unique Items" value={uniqueCount} to="/items" accent="#f472b6" />
        </div>
      </section>

      {/* Data Sources */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Available Datasets</h2>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {[
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
