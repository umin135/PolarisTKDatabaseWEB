import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SearchBar } from '../components/SearchBar'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { Pagination } from '../components/items/Pagination'
import { HudPortrait } from '../components/HudPortrait'
import { CharacterChipList, ChipCount, HashCell, MatchBadges, UnrestoredText } from '../components/movelist/MoveBits'
import { useGameData } from '../hooks/useGameData'
import { useMotbinCatalog } from '../hooks/useMotbinCatalog'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import {
  MOVELIST_ROSTER,
  groupingForFields,
  groupId,
  matchMove,
  parseMoveQuery,
  type GroupKind,
  type MatchField,
  type MovelistChar,
} from '../lib/movelist'
import type { MotbinFile, MotbinMove } from '../lib/types'

const PAGE_SIZE = 25

interface SearchGroup {
  key: string
  kind: GroupKind
  id: number
  fields: MatchField[]
  move: MotbinMove
  characters: MovelistChar[]
}

function buildGroups(catalog: Record<string, MotbinFile>, query: ReturnType<typeof parseMoveQuery>): SearchGroup[] {
  const map = new Map<string, SearchGroup>()

  for (const ch of MOVELIST_ROSTER) {
    const file = catalog[ch.code]
    if (!file) continue
    const seen = new Set<string>()
    for (const move of file.moves) {
      const fields = matchMove(move, query)
      if (fields.length === 0) continue
      const kind = groupingForFields(fields)
      const id = groupId(move, kind)
      const key = `${kind}:${id}`
      let group = map.get(key)
      if (!group) {
        group = { key, kind, id, fields: [...fields], move, characters: [] }
        map.set(key, group)
      } else {
        for (const f of fields) {
          if (!group.fields.includes(f)) group.fields.push(f)
        }
      }
      if (!seen.has(key)) {
        seen.add(key)
        group.characters.push(ch)
      }
    }
  }

  for (const g of map.values()) {
    g.characters.sort((a, b) => a.fighterId - b.fighterId)
  }

  return [...map.values()].sort((a, b) => {
    if (b.characters.length !== a.characters.length) return b.characters.length - a.characters.length
    return a.characters[0].fighterId - b.characters[0].fighterId
  })
}

export function MovelistPage() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(() => params.get('q') ?? '')
  const debouncedQ = useDebouncedValue(q, 300)
  const query = useMemo(() => parseMoveQuery(debouncedQ), [debouncedQ])
  const probe = useGameData<MotbinFile>('motbin', MOVELIST_ROSTER[0]?.code ?? 'grf')
  const catalog = useMotbinCatalog(query.ready)
  const [page, setPage] = useState(0)

  useEffect(() => {
    setParams(debouncedQ ? { q: debouncedQ } : {}, { replace: true })
  }, [debouncedQ, setParams])

  useEffect(() => {
    setPage(0)
  }, [debouncedQ])

  const noData = !probe.loading && !!probe.error
  const groups = useMemo(() => {
    if (!query.ready || !catalog.data) return []
    return buildGroups(catalog.data, query)
  }, [catalog.data, query])

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
        <div className="max-w-xl">
          <SearchBar
            value={q}
            onChange={setQ}
            placeholder="Search name, anim, or hash (dec / 0x…)"
          />
        </div>
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
                {groups.length.toLocaleString()} result{groups.length === 1 ? '' : 's'}
                {' · '}
                searched {catalog.loadedCount} characters
                {searching && <span className="text-violet-400/80"> · updating…</span>}
              </div>
              {groups.length === 0 ? (
                <div className="text-center text-slate-600 py-16 text-sm">No moves match this search</div>
              ) : (
                <div className="flex-1 overflow-auto divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  {paged.map(g => (
                    <div key={g.key} className="px-5 py-3 hover:bg-white/2">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <MatchBadges fields={g.fields} />
                            <ChipCount n={g.characters.length} />
                          </div>
                          <UnrestoredText
                            value={g.kind === 'anim_name_key' || g.kind === 'anim_key' ? g.move.anim_name : g.move.name}
                            length={g.kind === 'anim_name_key' || g.kind === 'anim_key' ? g.move.anim_name_length : g.move.name_length}
                          />
                          {g.kind !== 'anim_key' && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              <UnrestoredText
                                value={g.kind === 'name_key' ? g.move.anim_name : g.move.name}
                                length={g.kind === 'name_key' ? g.move.anim_name_length : g.move.name_length}
                              />
                            </div>
                          )}
                          <div className="mt-1 text-[11px] font-mono text-slate-600 flex flex-wrap gap-x-3 gap-y-0.5">
                            <span>Name Key <HashCell value={g.move.name_key} /></span>
                            <span>Anim Name Key <HashCell value={g.move.anim_name_key} /></span>
                            <span>Anim Key <HashCell value={g.move.anim_key} /></span>
                          </div>
                        </div>
                      </div>
                      <CharacterChipList characters={g.characters} />
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
