import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SearchBar } from '../components/SearchBar'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { Pagination } from '../components/items/Pagination'
import { HudPortrait } from '../components/HudPortrait'
import { HashCell, MatchBadges, UnrestoredText } from '../components/movelist/MoveBits'
import { useGameData } from '../hooks/useGameData'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import {
  getMovelistChar,
  isHiddenMovelistCode,
  matchMove,
  parseMoveQuery,
} from '../lib/movelist'
import type { MotbinFile } from '../lib/types'

const TH = 'px-3 py-2.5 text-left font-medium text-slate-400 border-b whitespace-nowrap'
const TH_STYLE = { borderColor: 'rgba(255,255,255,0.07)' }
const ROW_STYLE = { borderBottom: '1px solid rgba(255,255,255,0.04)' }
const PAGE_SIZE = 100
const COLUMNS = ['#', 'Move', 'name_key', 'Animation', 'anim_name_key', 'anim_key']

export function MovelistCharacterPage() {
  const { code = '' } = useParams()
  const [q, setQ] = useState('')
  const debouncedQ = useDebouncedValue(q, 300)
  const query = useMemo(() => parseMoveQuery(debouncedQ), [debouncedQ])
  const hidden = isHiddenMovelistCode(code)
  const ch = getMovelistChar(code)
  const result = useGameData<MotbinFile>('motbin', hidden ? '' : code.toLowerCase())
  const [page, setPage] = useState(0)

  const moves = result.data?.moves ?? []
  const filtered = useMemo(() => {
    if (!query.ready) return moves.map((move, i) => ({ move, i, fields: [] as ReturnType<typeof matchMove> }))
    return moves
      .map((move, i) => ({ move, i, fields: matchMove(move, query) }))
      .filter(row => row.fields.length > 0)
  }, [moves, query])

  useEffect(() => {
    setPage(0)
  }, [debouncedQ])

  const paged = useMemo(
    () => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filtered, page],
  )

  if (hidden || !ch) {
    return (
      <div className="flex flex-col h-full">
        <Header code={code} />
        <ErrorState error={hidden ? 'Dummy movelist is hidden' : `Unknown character “${code}”`} />
      </div>
    )
  }

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
        <Link
          to="/movelist"
          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-violet-300 mb-3"
        >
          <ArrowLeft size={12} />
          All characters
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <HudPortrait code={ch.code} alt={ch.name} size={52} />
          <div className="min-w-0">
            <h1 className="text-sm font-medium text-violet-300 flex items-center gap-2">
              {ch.name}
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
                style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}
              >
                {ch.displayCode}
              </span>
              {moves.length > 0 && (
                <span className="text-[10px] text-slate-500 font-normal">
                  {moves.length.toLocaleString()} moves
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-600 font-mono">fighter_id {ch.fighterId}</p>
          </div>
        </div>
        <div className="max-w-xl">
          <SearchBar
            value={q}
            onChange={setQ}
            placeholder="Filter name, anim, or hash (dec / 0x…)"
          />
        </div>
      </div>

      {result.loading && <LoadingState message={`Loading ${ch.name}…`} />}
      {result.error && <ErrorState error={result.error} />}

      {!result.loading && !result.error && (
        <div className="flex-1 flex flex-col min-h-0">
          {query.ready && (
            <div
              className="px-4 py-2 text-xs text-slate-500 border-b shrink-0"
              style={{ background: 'rgba(15,15,22,0.95)', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              {filtered.length.toLocaleString()} of {moves.length.toLocaleString()} moves
            </div>
          )}
          <div className="flex-1 overflow-auto">
            <table className="text-xs border-collapse w-full" style={{ minWidth: 1080 }}>
              <thead>
                <tr
                  className="sticky top-0"
                  style={{ background: 'rgba(15,15,22,0.97)', backdropFilter: 'blur(8px)' }}
                >
                  {COLUMNS.map(h => (
                    <th key={h} className={TH} style={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map(({ move, i, fields }) => (
                  <tr key={i} className="hover:bg-white/3 transition-colors" style={ROW_STYLE}>
                    <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap text-right">{i}</td>
                    <td className="px-3 py-2 max-w-70">
                      <UnrestoredText value={move.name} length={move.name_length} hash={move.name_key} />
                      {(fields.includes('name') || fields.includes('name_key')) && (
                        <div className="mt-1">
                          <MatchBadges fields={fields.filter(f => f === 'name' || f === 'name_key')} />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <HashCell value={move.name_key} />
                    </td>
                    <td className="px-3 py-2 max-w-70">
                      <UnrestoredText value={move.anim_name} length={move.anim_name_length} hash={move.anim_name_key} />
                      {(fields.includes('anim') || fields.includes('anim_name_key')) && (
                        <div className="mt-1">
                          <MatchBadges fields={fields.filter(f => f === 'anim' || f === 'anim_name_key')} />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <HashCell value={move.anim_name_key} />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <HashCell value={move.anim_key} />
                      {fields.includes('anim_key') && (
                        <div className="mt-1"><MatchBadges fields={['anim_key']} /></div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center text-slate-600 py-16 text-sm">No moves match this filter</div>
            )}
          </div>
          <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>
      )}
    </div>
  )
}

function Header({ code }: { code: string }) {
  return (
    <div
      className="shrink-0 px-5 py-4 border-b"
      style={{
        background: 'rgba(15,15,22,0.95)',
        borderColor: 'rgba(255,255,255,0.07)',
      }}
    >
      <Link
        to="/movelist"
        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-violet-300"
      >
        <ArrowLeft size={12} />
        All characters
      </Link>
      <h1 className="text-sm font-medium text-violet-300 mt-2">{code}</h1>
    </div>
  )
}
