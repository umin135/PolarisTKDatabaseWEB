import { useState, useMemo } from 'react'
import type { CustomizeItemUniqueEntry, LocDict } from '../../lib/types'
import { getPosCode } from '../../lib/common'
import { getCharHashOptions, itemLabel, TH, TH_STYLE } from './helpers'
import { useCopyToast, CopyToast } from './useCopyToast'
import { ItemFilterBar } from './ItemFilterBar'
import { ItemCard } from './ItemCard'
import { Pagination } from './Pagination'
import { UniqueItemRow } from './UniqueItemRow'
import { filterUniqueEntries, UNIQUE_TABLE_COLUMNS } from './uniqueItemsLogic'
import type { ViewMode } from './types'
import { CHARACTERS } from '../../lib/constants'

interface UniqueItemsTabProps {
  entries: CustomizeItemUniqueEntry[]
  bodyEntries: { asset_name: string; char_item_id: number }[]
  loc: LocDict
}

export function UniqueItemsTab({ entries, bodyEntries, loc }: UniqueItemsTabProps) {
  const [charFilter, setCharFilter] = useState('')
  const [posFilter, setPosFilter] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [view, setView] = useState<ViewMode>('table')
  const [pageSize, setPageSize] = useState(100)
  const { handleCellClick, copyText } = useCopyToast()

  const charOptions = useMemo(
    () => getCharHashOptions(entries.map(e => e.character_hash)),
    [entries],
  )

  const posOptions = useMemo(() => {
    const codes = new Set<string>()
    for (const e of entries) {
      const code = getPosCode(e.hash_1)
      if (code) codes.add(code)
    }
    return [...codes].sort()
  }, [entries])

  const charHash = charFilter ? Number(charFilter) : null
  const lq = q.toLowerCase()

  const filtered = useMemo(
    () => filterUniqueEntries(entries, charHash, posFilter, lq, loc),
    [entries, charHash, posFilter, lq, loc],
  )

  const paged = useMemo(
    () => filtered.slice(page * pageSize, (page + 1) * pageSize),
    [filtered, page, pageSize],
  )

  function handleCharChange(v: string) { setCharFilter(v); setPage(0) }
  function handlePosChange(v: string) { setPosFilter(v); setPage(0) }
  function handleSearch(v: string) { setQ(v); setPage(0) }
  function handlePageSize(v: number) { setPageSize(v); setPage(0) }

  return (
    <>
      <ItemFilterBar
        charFilter={charFilter}
        posFilter={posFilter}
        q={q}
        charOptions={charOptions}
        posOptions={posOptions}
        pageSize={pageSize}
        view={view}
        countLabel={<>{filtered.length.toLocaleString()} items</>}
        onCharChange={handleCharChange}
        onPosChange={handlePosChange}
        onSearch={handleSearch}
        onPageSize={handlePageSize}
        onViewChange={v => { setView(v); setPage(0) }}
      />

      {view === 'table' ? (
        <div className="flex-1 overflow-auto">
          <table className="text-xs border-collapse" style={{ minWidth: '2200px' }} onClick={handleCellClick}>
            <thead>
              <tr className="sticky top-0" style={{ background: 'rgba(15,15,22,0.97)', backdropFilter: 'blur(8px)' }}>
                {UNIQUE_TABLE_COLUMNS.map(h => (
                  <th key={h} className={TH} style={TH_STYLE}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ cursor: 'pointer' }}>
              {paged.map((e, i) => (
                <UniqueItemRow
                  key={e.char_item_id ?? i}
                  entry={e}
                  loc={loc}
                />
              ))}
            </tbody>
          </table>
          {paged.length === 0 && (
            <div className="text-center text-slate-600 py-16 text-sm">No items match filters</div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            {paged.map((e, i) => (
              <ItemCard
                key={e.char_item_id ?? i}
                assetName={e.asset_name}
                label={itemLabel(e.text_key, e.asset_name, e.char_item_id ?? i, loc)}
                pos={getPosCode(e.hash_1)}
                charCode={CHARACTERS[e.character_hash!]?.code}
                rarity={e.unk_10 ?? 0}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center text-slate-600 py-16 text-sm">No items match filters</div>
          )}
        </div>
      )}

      {bodyEntries.length > 0 && view === 'table' && (
        <details className="border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <summary className="px-4 py-2.5 text-xs text-slate-400 cursor-pointer hover:text-slate-200 select-none">
            Body Entries ({bodyEntries.length})
          </summary>
          <div className="px-4 pb-4 grid grid-cols-2 gap-1.5 md:grid-cols-3 lg:grid-cols-4">
            {bodyEntries.map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span className="font-mono text-[10px] text-violet-300">{b.char_item_id}</span>
                <span className="font-mono text-[10px] text-slate-400 truncate">{b.asset_name}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      <Pagination page={page} total={filtered.length} pageSize={pageSize} onChange={setPage} />
      {copyText && <CopyToast text={copyText} />}
    </>
  )
}
