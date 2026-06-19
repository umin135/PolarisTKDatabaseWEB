import { useState, useMemo } from 'react'
import { useData } from '../hooks/useData'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState, ErrorState } from '../components/LoadingState'
import type { CustomizeItemCommonList } from '../lib/types'

const PAGE_SIZE = 100

export function ItemsPage() {
  const { data, loading, error } = useData<CustomizeItemCommonList>('customize_item_common_list')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const list = data?.data?.entries ?? []
    if (!q) return list
    const lq = q.toLowerCase()
    return list.filter(e =>
      (e.asset_name ?? '').toLowerCase().includes(lq) ||
      (e.text_key ?? '').toLowerCase().includes(lq) ||
      String(e.char_item_id).includes(lq)
    )
  }, [data, q])

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  if (loading) return <LoadingState message="Loading customize items (large dataset)..." />
  if (error)   return <ErrorState error={error} />

  const all = data?.data?.entries ?? []

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Customize Items" count={all.length} description="Common customize item catalog">
        <div className="w-64">
          <SearchBar value={q} onChange={setQ} placeholder="Search name, key, or ID..." />
        </div>
      </PageHeader>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse min-w-[700px]">
          <thead>
            <tr
              className="sticky top-0 text-left"
              style={{ background: 'rgba(15,15,22,0.95)', backdropFilter: 'blur(8px)' }}
            >
              {['ID', 'Asset Name', 'Text Key', 'Char Hash', 'Price', 'Enabled', 'Sort Group'].map(h => (
                <th key={h} className="px-3 py-2.5 font-medium text-slate-400 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((e) => (
              <tr
                key={e.char_item_id}
                className="hover:bg-white/5 transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <td className="px-3 py-2 font-mono text-violet-300">{e.char_item_id}</td>
                <td className="px-3 py-2 font-mono text-slate-300 max-w-[180px] truncate">{e.asset_name ?? '–'}</td>
                <td className="px-3 py-2 text-slate-400 max-w-[200px] truncate">{e.text_key ?? '–'}</td>
                <td className="px-3 py-2 font-mono text-slate-500">
                  {e.character_hash ? `0x${(e.character_hash >>> 0).toString(16).toUpperCase()}` : '–'}
                </td>
                <td className="px-3 py-2 text-slate-300">{e.price?.toLocaleString() ?? '–'}</td>
                <td className="px-3 py-2">
                  <span style={{ color: e.is_enabled ? '#34d399' : '#6b7280' }}>
                    {e.is_enabled ? '✓' : '–'}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-500">{e.sort_group ?? '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 rounded text-xs disabled:opacity-30 transition-colors hover:bg-white/10 text-slate-300"
            >
              ← Prev
            </button>
            <span className="text-xs text-slate-500">
              Page {page + 1} of {totalPages} ({filtered.length.toLocaleString()} items)
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 rounded text-xs disabled:opacity-30 transition-colors hover:bg-white/10 text-slate-300"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
