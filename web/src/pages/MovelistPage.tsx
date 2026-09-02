import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { Pagination } from '../components/items/Pagination'
import { HudPortrait } from '../components/HudPortrait'
import { HashCell, UnrestoredText } from '../components/movelist/MoveBits'
import { MovelistSearchControls, searchPlaceholder } from '../components/movelist/MovelistSearchControls'
import { useGameData } from '../hooks/useGameData'
import { useMotbinCatalog } from '../hooks/useMotbinCatalog'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import {
  MOVELIST_ROSTER,
  collectUsageGroups,
  parseMoveQuery,
  parseSearchField,
  type SearchField,
} from '../lib/movelist'
import type { MotbinFile } from '../lib/types'

const PAGE_SIZE = 25

export function MovelistPage() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(() => params.get('q') ?? '')
  const [field, setField] = useState<SearchField>(() => parseSearchField(params.get('field')))
  const [caseSensitive, setCaseSensitive] = useState(() => params.get('case') === '1')
  const debouncedQ = useDebouncedValue(q, 300)
  const query = useMemo(() => parseMoveQuery(debouncedQ), [debouncedQ])
  const probe = useGameData<MotbinFile>('motbin', MOVELIST_ROSTER[0]?.code ?? 'grf')
  const catalog = useMotbinCatalog(query.ready)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const next: Record<string, string> = { field }
    if (debouncedQ) next.q = debouncedQ
    if (caseSensitive) next.case = '1'
    setParams(next, { replace: true })
  }, [debouncedQ, field, caseSensitive, setParams])

  useEffect(() => {
    setPage(0)
  }, [debouncedQ, field, caseSensitive])

  const noData = !probe.loading && !!probe.error
  const groups = useMemo(() => {
    if (!query.ready || !catalog.data) return []
    return collectUsageGroups(catalog.data, query, field, caseSensitive)
  }, [catalog.data, query, field, caseSensitive])

  const usageTotal = useMemo(
    () => groups.reduce((n, g) => n + g.usages.length, 0),
    [groups],
  )

  const paged = useMemo(
    () => groups.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [groups, page],
  )

  const searching = q.trim() !== debouncedQ.trim() && parseMoveQuery(q).ready

  return (
    <div className="flex flex-col h-full">
      <div
        className="shrink-0 px-5 py-4 border-b"
        style={{
          background: 'rgba(15,15,22,0.95)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-sm font-medium text-violet-300 flex items-center gap-2">
            Movelist
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}
            >
              {MOVELIST_ROSTER.length}
            </span>
          </h1>
        </div>
        <MovelistSearchControls
          q={q}
          onQuery={setQ}
          field={field}
          onField={setField}
          caseSensitive={caseSensitive}
          onCaseSensitive={setCaseSensitive}
          placeholder={searchPlaceholder(field)}
        />
      </div>

      {noData && (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <p className="text-slate-300 text-sm mb-1">No movelist data for this version</p>
          <p className="text-xs text-slate-600">
            Motbin JSON files are not present under this game version.
          </p>
        </div>
      )}

      {!noData && !query.ready && (
        <div className="flex-1 overflow-auto p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {MOVELIST_ROSTER.map(ch => (
              <Link
                key={ch.code}
                to={`/movelist/${ch.code}`}
                className="rounded-xl p-3 border transition-all duration-150 hover:scale-[1.02] hover:border-violet-500/40"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex justify-center mb-2">
                  <HudPortrait code={ch.code} alt={ch.name} size={96} />
                </div>
                <div className="text-sm text-slate-200 truncate text-center">{ch.name}</div>
                <div className="text-[11px] font-mono text-violet-400/80 text-center">{ch.displayCode}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {query.ready && !noData && (
        <div className="flex-1 flex flex-col min-h-0">
          {catalog.loading && <LoadingState message="Loading movelists…" />}
          {catalog.error && !catalog.loading && <ErrorState error={catalog.error} />}
          {!catalog.loading && !catalog.error && catalog.data && (
            <>
              <div
                className="px-5 py-2.5 text-xs text-slate-500 border-b shrink-0"
                style={{ background: 'rgba(15,15,22,0.95)', borderColor: 'rgba(255,255,255,0.07)' }}
              >
                {usageTotal.toLocaleString()} usage{usageTotal === 1 ? '' : 's'}
                {' across '}
                {groups.length.toLocaleString()} name{groups.length === 1 ? '' : 's'}
                {' · '}
                searched {catalog.loadedCount} characters
                {searching && <span className="text-violet-400/80"> · updating…</span>}
              </div>
              {groups.length === 0 ? (
                <div className="text-center text-slate-600 py-16 text-sm">No moves match this search</div>
              ) : (
                <div className="flex-1 overflow-auto divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  {paged.map(g => (
                    <div key={g.key} className="px-5 py-3">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <div className="min-w-0 font-medium">
                          <UnrestoredText value={g.value} length={g.length} />
                        </div>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap"
                          style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}
                        >
                          {g.usages.length} usage{g.usages.length === 1 ? '' : 's'}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap"
                          style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
                        >
                          {g.characterCount} character{g.characterCount === 1 ? '' : 's'}
                        </span>
                        {query.hash !== null && (
                          <span className="text-[11px] font-mono text-slate-600">
                            <HashCell value={g.hash} />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px]">
                        {g.usages.map(u => (
                          <div
                            key={`${u.ch.code}:${u.index}`}
                            className="flex items-baseline gap-3 py-0.5 hover:bg-white/3 rounded"
                          >
                            <Link
                              to={`/movelist/${u.ch.code}`}
                              className="w-28 shrink-0 truncate text-slate-300 hover:text-violet-300"
                              title={u.ch.displayCode}
                            >
                              {u.ch.name}
                            </Link>
                            <span className="w-10 shrink-0 text-right font-mono text-slate-600">
                              {u.index}
                            </span>
                            <div className="min-w-0 flex-1 text-slate-400">
                              <UnrestoredText
                                value={field === 'anim' ? u.move.name : u.move.anim_name}
                                length={field === 'anim' ? u.move.name_length : u.move.anim_name_length}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Pagination page={page} total={groups.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
