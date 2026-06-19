import { useData } from '../hooks/useData'
import { PageHeader } from '../components/PageHeader'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { fmtHash } from '../lib/utils'
import type { GalleryIllustList } from '../lib/types'

export function GalleryPage() {
  const { data, loading, error } = useData<GalleryIllustList>('gallery_illust_list')
  if (loading) return <LoadingState />
  if (error)   return <ErrorState error={error} />

  const entries = data?.data?.entries ?? []

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Gallery Illustrations" count={entries.length} />
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="sticky top-0" style={{ background: 'rgba(15,15,22,0.95)' }}>
              {['Index', 'Illust ID', 'Title Hash', 'Thumbnail Key', 'Price'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-medium text-slate-400 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i} className="hover:bg-white/5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td className="px-3 py-2 text-slate-500">{e.entry_index ?? i}</td>
                <td className="px-3 py-2 font-mono text-violet-300">{e.illust_id ?? '–'}</td>
                <td className="px-3 py-2 font-mono text-slate-500">
                  {e.title_hash !== undefined ? fmtHash(e.title_hash) : '–'}
                </td>
                <td className="px-3 py-2 text-slate-400 max-w-xs truncate">{e.thumbnail_key ?? '–'}</td>
                <td className="px-3 py-2 text-slate-300">{e.unlock_price?.toLocaleString() ?? '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
