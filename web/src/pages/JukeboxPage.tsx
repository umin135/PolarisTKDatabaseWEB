import { useState, useMemo } from 'react'
import { useData } from '../hooks/useData'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { fmtHash } from '../lib/utils'
import type { JukeboxList } from '../lib/types'
import { Music2 } from 'lucide-react'

export function JukeboxPage() {
  const jukebox = useData<JukeboxList>('jukebox_list')
  const [q, setQ] = useState('')

  const entries = useMemo(() => {
    const list = jukebox.data?.data?.entries ?? []
    if (!q) return list
    const lq = q.toLowerCase()
    return list.filter(e =>
      (e.cue_name ?? '').toLowerCase().includes(lq) ||
      (e.display_text_key ?? '').toLowerCase().includes(lq)
    )
  }, [jukebox.data, q])

  if (jukebox.loading) return <LoadingState message="Loading jukebox..." />
  if (jukebox.error)   return <ErrorState error={jukebox.error} />

  const all = jukebox.data?.data?.entries ?? []

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Jukebox / BGM" count={all.length} description="Background music tracks">
        <div className="w-56">
          <SearchBar value={q} onChange={setQ} placeholder="Search cue name or key..." />
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-2">
          {entries.map((e, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors hover:bg-white/5"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderColor: 'rgba(255,255,255,0.07)',
              }}
            >
              <Music2 size={14} className="text-violet-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono text-slate-200 truncate">{e.cue_name ?? '–'}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{e.display_text_key ?? ''}</div>
              </div>
              <div className="text-right flex-shrink-0">
                {e.series_hash !== undefined && (
                  <div className="text-[10px] text-slate-600 font-mono">{fmtHash(e.series_hash)}</div>
                )}
                {e.arrangement && (
                  <div className="text-[10px] text-slate-500">{e.arrangement}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        {entries.length === 0 && (
          <p className="text-center text-slate-600 py-16">No tracks match "{q}"</p>
        )}
      </div>
    </div>
  )
}
