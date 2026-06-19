import { useData } from '../hooks/useData'
import { PageHeader } from '../components/PageHeader'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { fmtHash } from '../lib/utils'
import type { RankList } from '../lib/types'

export function RanksPage() {
  const { data, loading, error } = useData<RankList>('rank_list')
  if (loading) return <LoadingState />
  if (error)   return <ErrorState error={error} />

  const groups = data?.data?.entries ?? []
  const totalRanks = groups.reduce((s, g) => s + (g.entries?.length ?? 0), 0)

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Ranks" count={totalRanks} description="Rank groups and tiers" />
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {groups.map(group => (
          <div key={group.group_id} className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              Group {group.group_id}
            </div>
            {(group.entries ?? []).map(r => (
              <div
                key={r.hash}
                className="flex items-center px-4 py-2.5 border-b hover:bg-white/5 transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <span className="w-8 text-xs text-slate-600">{r.rank}</span>
                <span className="font-mono text-xs text-slate-300 w-40 flex-shrink-0">{r.name || '–'}</span>
                <span className="text-xs text-slate-500 truncate">{r.text_key}</span>
                <span className="ml-auto text-[10px] font-mono text-slate-600">{fmtHash(r.hash)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
