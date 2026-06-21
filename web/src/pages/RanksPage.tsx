import { useState, useRef } from 'react'
import { useGameData } from '../hooks/useGameData'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { Tooltip } from '../components/Tooltip'
import { clsx } from '../lib/utils'
import type { LocDict, RankGroup, RankItem, RankList } from '../lib/types'
import { hexStr } from '../lib/common'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveLoc(key: string | undefined | null, loc: LocDict): string {
  if (!key) return ''
  return loc[key] ?? key
}

function isLocResolved(key: string | undefined | null, loc: LocDict): boolean {
  return !!key && loc[key] !== undefined
}

function ResolvedText({
  locKey,
  loc,
  resolvedClassName = 'text-slate-200',
}: {
  locKey: string | undefined
  loc: LocDict
  resolvedClassName?: string
}) {
  if (!locKey) {
    return <span className="text-slate-600">–</span>
  }

  const resolved = isLocResolved(locKey, loc)
  const display = resolveLoc(locKey, loc)

  return (
    <Tooltip content={locKey}>
      <span
        className={clsx(
          'block truncate',
          resolved ? resolvedClassName : 'font-mono text-amber-400/90',
        )}
      >
        {display}
      </span>
    </Tooltip>
  )
}

function LocCell({
  locKey,
  loc,
  className,
  resolvedClassName,
  maxWidth,
}: {
  locKey: string | undefined
  loc: LocDict
  className: string
  resolvedClassName: string
  maxWidth?: number
}) {
  const display = locKey ? resolveLoc(locKey, loc) : ''

  return (
    <td
      className={className}
      data-value={display}
      style={maxWidth ? { maxWidth } : undefined}
    >
      <ResolvedText locKey={locKey} loc={loc} resolvedClassName={resolvedClassName} />
    </td>
  )
}

function useCopyToast() {
  const [text, setText] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  function handleCellClick(e: React.MouseEvent<HTMLTableElement>) {
    const td = (e.target as HTMLElement).closest('td')
    if (!td) return
    const value = td.dataset.value ?? td.innerText.trim()
    navigator.clipboard.writeText(value)
    clearTimeout(timer.current)
    setText(value)
    timer.current = setTimeout(() => setText(null), 1600)
  }

  return { handleCellClick, copyText: text }
}

function CopyToast({ text }: { text: string }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm shadow-2xl pointer-events-none"
      style={{
        background: 'rgba(109,40,217,0.93)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(167,139,250,0.35)',
        color: '#ede9fe',
        animation: 'fadeSlideUp 0.15s ease-out',
      }}
    >
      <span className="text-violet-300 text-xs">Copied</span>
      <span className="font-mono text-xs text-white truncate" style={{ maxWidth: 260 }}>
        {text.length > 50 ? text.slice(0, 50) + '…' : text}
      </span>
    </div>
  )
}

const TH = 'px-3 py-2.5 text-left font-medium text-slate-400 border-b whitespace-nowrap'
const TH_STYLE = { borderColor: 'rgba(255,255,255,0.07)' }
const ROW_STYLE = { borderBottom: '1px solid rgba(255,255,255,0.04)' }

// ---------------------------------------------------------------------------
// Tab content
// ---------------------------------------------------------------------------

function RankGroupTab({ group, loc }: { group: RankGroup; loc: LocDict }) {
  const { handleCellClick, copyText } = useCopyToast()
  const entries = group.entries

  return (
    <>
      <div
        className="flex items-center gap-3 px-4 py-3 border-b flex-wrap shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <span className="text-xs text-slate-500">
          {entries.length.toLocaleString()} rank{entries.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        <table
          className="text-xs border-collapse w-full"
          style={{ minWidth: '900px' }}
          onClick={handleCellClick}
        >
          <thead>
            <tr
              className="sticky top-0"
              style={{ background: 'rgba(15,15,22,0.97)', backdropFilter: 'blur(8px)' }}
            >
              {['Rank', 'Display Name', 'Internal Name', 'Hash'].map(h => (
                <th key={h} className={TH} style={TH_STYLE}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ cursor: 'pointer' }}>
            {entries.map((e, i) => (
              <RankRow key={`${e.hash}-${i}`} entry={e} loc={loc} />
            ))}
          </tbody>
        </table>
      </div>

      {copyText && <CopyToast text={copyText} />}
    </>
  )
}

function RankRow({ entry: e, loc }: { entry: RankItem; loc: LocDict }) {
  const rankDisplay = e.rank !== undefined ? String(e.rank) : '–'

  return (
    <tr className="hover:bg-white/3 transition-colors" style={ROW_STYLE}>
      <td
        className="px-3 py-2 font-mono text-violet-300 whitespace-nowrap text-right"
        data-value={rankDisplay}
      >
        {rankDisplay}
      </td>
      <LocCell
        locKey={e.text_key}
        loc={loc}
        className="px-3 py-2 whitespace-nowrap"
        resolvedClassName="text-slate-200"
        maxWidth={260}
      />
      <td
        className="px-3 py-2 font-mono text-slate-400 whitespace-nowrap"
        data-value={e.name ?? ''}
      >
        {e.name ?? '–'}
      </td>
      <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap" data-value={hexStr(e.hash)}>
        {hexStr(e.hash)}
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function RanksPage() {
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null)

  const rankResult = useGameData<RankList>('fbsdata', 'rank_list')
  const locResult = useGameData<LocDict>('localize', 'loc_en')

  const groups = rankResult.data?.data?.entries ?? []
  const loc = locResult.data ?? {}

  const selectedId = activeGroupId ?? groups[0]?.group_id ?? null
  const activeGroup = groups.find(g => g.group_id === selectedId)

  const totalRanks = groups.reduce((sum, g) => sum + g.entries.length, 0)

  const isLoading = rankResult.loading || locResult.loading
  const hasError = rankResult.error ?? locResult.error

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center border-b shrink-0 px-5 py-4"
        style={{
          background: 'rgba(15,15,22,0.95)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(255,255,255,0.07)',
        }}
      >
        <h1 className="text-sm font-medium text-violet-300 flex items-center gap-2">
          Ranks
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}
          >
            {totalRanks > 0 ? totalRanks.toLocaleString() : '…'}
          </span>
        </h1>
      </div>

      <div
        className="flex items-center border-b shrink-0"
        style={{
          background: 'rgba(15,15,22,0.95)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(255,255,255,0.07)',
        }}
      >
        {groups.map(g => (
          <button
            key={g.group_id}
            onClick={() => setActiveGroupId(g.group_id)}
            className={clsx(
              'flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all duration-150',
              selectedId === g.group_id
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-500 hover:text-slate-300',
            )}
          >
            Group {g.group_id}
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{
                background: selectedId === g.group_id ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                color: selectedId === g.group_id ? '#a78bfa' : '#64748b',
              }}
            >
              {g.entries.length}
            </span>
          </button>
        ))}
      </div>

      {isLoading && <LoadingState message="Loading ranks…" />}
      {hasError && <ErrorState error={hasError} />}

      {!isLoading && !hasError && activeGroup && (
        <div className="flex flex-col flex-1 min-h-0">
          <RankGroupTab group={activeGroup} loc={loc} />
        </div>
      )}
    </div>
  )
}
