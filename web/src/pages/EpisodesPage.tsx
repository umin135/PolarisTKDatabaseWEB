import { useData } from '../hooks/useData'
import { PageHeader } from '../components/PageHeader'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { fmtHash } from '../lib/utils'
import type { EpisodeList } from '../lib/types'

export function EpisodesPage() {
  const { data, loading, error } = useData<EpisodeList>('character_episode_list')
  if (loading) return <LoadingState />
  if (error)   return <ErrorState error={error} />

  const records = (data?.data?.records ?? []).filter(r => r.battle_index && r.battle_index > 0)

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Episodes" count={records.length} description="Character episode battle records" />
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse min-w-[600px]">
          <thead>
            <tr className="sticky top-0" style={{ background: 'rgba(15,15,22,0.95)' }}>
              {['Player Hash', 'Battle #', 'Opponent Hash', 'Stage Hash'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-medium text-slate-400 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="hover:bg-white/5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td className="px-3 py-2 font-mono text-violet-300">
                  {r.player_character_hash !== undefined ? fmtHash(r.player_character_hash) : '–'}
                </td>
                <td className="px-3 py-2 text-slate-400">{r.battle_index ?? '–'}</td>
                <td className="px-3 py-2 font-mono text-blue-300">
                  {r.opponent_character_hash !== undefined ? fmtHash(r.opponent_character_hash) : '–'}
                </td>
                <td className="px-3 py-2 font-mono text-slate-500">
                  {r.episode_stage_hash !== undefined ? fmtHash(r.episode_stage_hash) : '–'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
