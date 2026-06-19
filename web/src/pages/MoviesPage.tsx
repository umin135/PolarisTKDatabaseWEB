import { useState, useMemo } from 'react'
import { useData } from '../hooks/useData'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState, ErrorState } from '../components/LoadingState'
import type { GalleryMovieList } from '../lib/types'
import { Film } from 'lucide-react'

export function MoviesPage() {
  const { data, loading, error } = useData<GalleryMovieList>('gallery_movie_list')
  const [q, setQ] = useState('')

  const entries = useMemo(() => {
    const list = data?.data?.entries ?? []
    if (!q) return list
    const lq = q.toLowerCase()
    return list.filter(e =>
      (e.text_key ?? '').toLowerCase().includes(lq) ||
      (e.thumbnail_key ?? '').toLowerCase().includes(lq)
    )
  }, [data, q])

  if (loading) return <LoadingState />
  if (error)   return <ErrorState error={error} />

  const all = data?.data?.entries ?? []

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Gallery Movies" count={all.length} description="Gallery video entries">
        <div className="w-52">
          <SearchBar value={q} onChange={setQ} placeholder="Search text key..." />
        </div>
      </PageHeader>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-2">
          {entries.map((e, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <Film size={14} className="text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono text-slate-300 truncate">{e.text_key ?? '–'}</div>
                <div className="text-[10px] text-slate-500 truncate">{e.thumbnail_key ?? ''}</div>
              </div>
              <div className="text-xs font-mono text-violet-300 flex-shrink-0">{e.movie_id ?? '–'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
