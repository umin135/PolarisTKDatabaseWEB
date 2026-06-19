import { useState, useMemo } from 'react'
import { useData } from '../hooks/useData'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { fmtHash, fmtBool } from '../lib/utils'
import type { StageList } from '../lib/types'

const FLAG_KEYS = [
  'is_selectable','is_active','is_online_enabled','is_ranked_enabled',
  'flag_balcony','flag_ocean','flag_infinite','flag_battle','flag_interlocked',
  'is_default_variant','has_weather',
] as const

export function StagesPage() {
  const { data, loading, error } = useData<StageList>('stage_list')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const entries = useMemo(() => {
    const list = data?.data?.entries ?? []
    if (!q) return list
    const lq = q.toLowerCase()
    return list.filter(e =>
      e.stage_code.toLowerCase().includes(lq) ||
      (e.level_name ?? '').toLowerCase().includes(lq) ||
      (e.group_id ?? '').toLowerCase().includes(lq)
    )
  }, [data, q])

  if (loading) return <LoadingState message="Loading stages..." />
  if (error)   return <ErrorState error={error} />

  const all = data?.data?.entries ?? []
  const sel = selected ? all.find(e => e.stage_code === selected) : null

  return (
    <div className="flex h-full">
      {/* List */}
      <div className="flex flex-col flex-shrink-0" style={{ width: 280, borderRight: '1px solid rgba(255,255,255,0.07)' }}>
        <PageHeader title="Stages" count={all.length}>
          <div className="w-36">
            <SearchBar value={q} onChange={setQ} placeholder="Filter..." />
          </div>
        </PageHeader>
        <div className="flex-1 overflow-y-auto">
          {entries.map(e => (
            <button
              key={e.stage_code}
              onClick={() => setSelected(e.stage_code)}
              className="w-full text-left px-4 py-3 border-b transition-colors"
              style={{
                borderColor: 'rgba(255,255,255,0.05)',
                background: selected === e.stage_code ? 'rgba(124,58,237,0.12)' : 'transparent',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: e.is_selectable ? '#34d399' : '#6b7280' }}
                />
                <span className="text-sm font-mono text-slate-200">{e.stage_code}</span>
              </div>
              {e.level_name && (
                <div className="text-[10px] text-slate-500 mt-0.5 pl-4">{e.level_name}</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-y-auto">
        {!sel ? (
          <div className="flex items-center justify-center h-full text-slate-600 text-sm">Select a stage</div>
        ) : (
          <div className="p-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-100 font-mono mb-1">{sel.stage_code}</h2>
            <p className="text-sm text-slate-500 mb-6">stage_hash: {fmtHash(sel.stage_hash)}</p>

            <InfoBlock title="Info">
              {sel.level_name   && <Row label="Level Name"   value={sel.level_name} />}
              {sel.group_id     && <Row label="Group ID"     value={sel.group_id} />}
              {sel.extra_group  && <Row label="Extra Group"  value={sel.extra_group} />}
              {sel.sound_bank   && <Row label="Sound Bank"   value={sel.sound_bank} />}
              {sel.stage_mode !== undefined && <Row label="Stage Mode" value={String(sel.stage_mode)} />}
            </InfoBlock>

            <InfoBlock title="Dimensions">
              {sel.arena_width  !== undefined && <Row label="Arena Width"  value={String(sel.arena_width)} />}
              {sel.arena_depth  !== undefined && <Row label="Arena Depth"  value={String(sel.arena_depth)} />}
            </InfoBlock>

            <InfoBlock title="Flags">
              {FLAG_KEYS.map(k => (
                <Row key={k} label={k} value={fmtBool(((sel as unknown) as Record<string,boolean>)[k] ?? false)} />
              ))}
            </InfoBlock>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">{title}</h3>
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center px-3 py-2 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="text-slate-500 w-44 flex-shrink-0">{label}</span>
      <span className="text-slate-200">{value}</span>
    </div>
  )
}
