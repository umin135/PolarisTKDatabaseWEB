import { useState, useMemo } from 'react'
import { clsx } from '../../lib/utils'
import type { CustomizeItemCommonEntry, LocDict } from '../../lib/types'
import { getPosCode } from '../../lib/common'
import { getCharHashOptions, itemLabel, TH, TH_STYLE } from './helpers'
import { useCopyToast, CopyToast } from './useCopyToast'
import { ItemFilterBar } from './ItemFilterBar'
import { ItemCard } from './ItemCard'
import { Pagination } from './Pagination'
import { CommonItemRow } from './CommonItemRow'
import {
  buildGroupedRows,
  filterGroupedRows,
  filterUngroupedEntries,
  getCommonTableColumns,
} from './commonItemsLogic'
import type { CommonDisplayItem, ViewMode } from './types'
import { CHARACTERS } from '../../lib/constants'

interface CommonItemsTabProps {
  data: CustomizeItemCommonEntry[]
  loc: LocDict
}

export function CommonItemsTab({ data, loc }: CommonItemsTabProps) {
  const [charFilter, setCharFilter] = useState('')
  const [posFilter, setPosFilter] = useState('')
  const [groupByLocalId, setGroupByLocalId] = useState(false)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [view, setView] = useState<ViewMode>('table')
  const [pageSize, setPageSize] = useState(100)
  const { handleCellClick, copyText } = useCopyToast()

  const groupedRows = useMemo(() => buildGroupedRows(data), [data])

  const charOptions = useMemo(
    () => getCharHashOptions(data.map(e => e.character_hash)),
    [data],
  )

  const posOptions = useMemo(() => {
    const codes = new Set<string>()
    for (const g of groupedRows) {
      if (g.posCode) codes.add(g.posCode)
    }
    return [...codes].sort()
  }, [groupedRows])

  const charHash = charFilter ? Number(charFilter) : null
  const lq = q.toLowerCase()

  const filteredUngrouped = useMemo(
    () => groupByLocalId ? [] : filterUngroupedEntries(data, charHash, posFilter, lq, loc),
    [data, charHash, posFilter, lq, loc, groupByLocalId],
  )

  const filteredGrouped = useMemo(
    () => groupByLocalId ? filterGroupedRows(groupedRows, charHash, posFilter, lq, loc) : [],
    [groupedRows, charHash, posFilter, lq, loc, groupByLocalId],
  )

  const displayCount = groupByLocalId ? filteredGrouped.length : filteredUngrouped.length

  const groupedRowCount = useMemo(
    () => filteredGrouped.reduce((sum, g) => sum + g.variantCount, 0),
    [filteredGrouped],
  )

  const paged = useMemo((): CommonDisplayItem[] => {
    const start = page * pageSize
    const end = start + pageSize
    if (groupByLocalId) {
      return filteredGrouped.slice(start, end).map(g => ({
        entry: g.entry,
        variantCount: g.variantCount,
      }))
    }
    return filteredUngrouped.slice(start, end).map(e => ({
      entry: e,
      variantCount: 1,
    }))
  }, [groupByLocalId, filteredGrouped, filteredUngrouped, page, pageSize])

  const tableColumns = useMemo(() => getCommonTableColumns(groupByLocalId), [groupByLocalId])

  function handleCharChange(v: string) { setCharFilter(v); setPage(0) }
  function handlePosChange(v: string) { setPosFilter(v); setPage(0) }
  function handleSearch(v: string) { setQ(v); setPage(0) }
  function handlePageSize(v: number) { setPageSize(v); setPage(0) }
  function handleGroupByLocalId(v: boolean) { setGroupByLocalId(v); setPage(0) }

  const countLabel = (
    <>
      {displayCount.toLocaleString()} {groupByLocalId ? 'local items' : 'items'}
      {groupByLocalId && groupedRowCount !== displayCount && (
        <span className="text-slate-600"> ({groupedRowCount.toLocaleString()} rows)</span>
      )}
    </>
  )

  const groupByCheckbox = (
    <label
      className={clsx(
        'flex items-center gap-2 text-xs cursor-pointer select-none rounded-lg px-3 py-1.5 transition-colors',
        groupByLocalId ? 'text-violet-300' : 'text-slate-400',
      )}
      style={{
        background: '#16161f',
        border: groupByLocalId
          ? '1px solid rgba(124,58,237,0.35)'
          : '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <input
        type="checkbox"
        checked={groupByLocalId}
        onChange={e => handleGroupByLocalId(e.target.checked)}
        className="rounded accent-violet-500"
      />
      Group by Local Item ID
    </label>
  )

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
        countLabel={countLabel}
        onCharChange={handleCharChange}
        onPosChange={handlePosChange}
        onSearch={handleSearch}
        onPageSize={handlePageSize}
        onViewChange={v => { setView(v); setPage(0) }}
        extra={groupByCheckbox}
      />

      {view === 'table' ? (
        <div className="flex-1 overflow-auto">
          <table className="text-xs border-collapse" style={{ minWidth: '2400px' }} onClick={handleCellClick}>
            <thead>
              <tr className="sticky top-0" style={{ background: 'rgba(15,15,22,0.97)', backdropFilter: 'blur(8px)' }}>
                {tableColumns.map(h => (
                  <th key={h} className={TH} style={TH_STYLE}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ cursor: 'pointer' }}>
              {paged.map(({ entry, variantCount }) => (
                <CommonItemRow
                  key={groupByLocalId ? `base-${entry.base_id ?? 0}` : entry.char_item_id}
                  entry={entry}
                  variantCount={variantCount}
                  groupByLocalId={groupByLocalId}
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
            {paged.map(({ entry: e }) => (
              <ItemCard
                key={groupByLocalId ? `base-${e.base_id ?? 0}` : e.char_item_id}
                assetName={e.asset_name}
                label={itemLabel(e.text_key, e.asset_name, groupByLocalId ? e.base_id ?? 0 : e.char_item_id, loc)}
                pos={getPosCode(e.hash_1)}
                charCode={groupByLocalId ? "GRF" : CHARACTERS[e.character_hash!]?.code}
                rarity={e.unk_11 ?? 0}
              />
            ))}
          </div>
          {displayCount === 0 && (
            <div className="text-center text-slate-600 py-16 text-sm">No items match filters</div>
          )}
        </div>
      )}

      <Pagination page={page} total={displayCount} pageSize={pageSize} onChange={setPage} />
      {copyText && <CopyToast text={copyText} />}
    </>
  )
}
