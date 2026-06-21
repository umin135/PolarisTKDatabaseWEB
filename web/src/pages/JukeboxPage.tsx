import { useState, useMemo, useRef } from 'react'
import { useGameData } from '../hooks/useGameData'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { Tooltip } from '../components/Tooltip'
import { clsx } from '../lib/utils'
import type { JukeboxEntry, JukeboxList, LocDict } from '../lib/types'
import { hexStr } from '../lib/common'
import { SERIES_HASH } from '../lib/constants'

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

function altCue(value: string | undefined): string {
  if (!value || value === 'null') return '–'
  return value
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
const DERIVED_TH = 'px-3 py-2.5 text-left font-medium border-b whitespace-nowrap'
const DERIVED_TH_STYLE = {
  borderColor: 'rgba(255,255,255,0.07)',
  color: '#7dd3fc',
  background: 'rgba(56,189,248,0.06)',
}
const DERIVED_TD_STYLE = { background: 'rgba(56,189,248,0.04)' }
const DERIVED_TD_DIVIDER = { borderRight: '1px solid rgba(56,189,248,0.18)' }
const ROW_STYLE = { borderBottom: '1px solid rgba(255,255,255,0.04)' }

function SeriesCell({ hash, divider }: { hash: number; divider?: boolean }) {
  const hex = hexStr(hash)
  const code = SERIES_HASH[hash]
  const style = { ...DERIVED_TD_STYLE, ...(divider ? DERIVED_TD_DIVIDER : {}) }

  if (!code) {
    return (
      <td className="px-3 py-2 font-mono text-sky-200/40 whitespace-nowrap" style={style} data-value={hex}>
        {hex}
      </td>
    )
  }

  return (
    <td className="px-3 py-2 whitespace-nowrap" style={style} data-value={code}>
      <Tooltip content={hex}>
        <span
          className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium font-mono whitespace-nowrap"
          style={{
            background: 'rgba(56,189,248,0.15)',
            color: '#7dd3fc',
            border: '1px solid rgba(56,189,248,0.35)',
          }}
        >
          {code}
        </span>
      </Tooltip>
    </td>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function JukeboxPage() {
  const [seriesFilter, setSeriesFilter] = useState('')
  const { handleCellClick, copyText } = useCopyToast()

  const jukeboxResult = useGameData<JukeboxList>('fbsdata', 'jukebox_list')
  const locResult = useGameData<LocDict>('localize', 'loc_en')

  const entries = jukeboxResult.data?.data?.entries ?? []
  const loc = locResult.data ?? {}

  const seriesOptions = useMemo(() => {
    const hashes = new Set(entries.map(e => e.series_hash))
    return [...hashes].sort((a, b) =>
      (SERIES_HASH[a] ?? hexStr(a)).localeCompare(SERIES_HASH[b] ?? hexStr(b)),
    )
  }, [entries])

  const filtered = useMemo(() => {
    if (!seriesFilter) return entries
    const hash = Number(seriesFilter)
    return entries.filter(e => e.series_hash === hash)
  }, [entries, seriesFilter])

  const isLoading = jukeboxResult.loading || locResult.loading
  const hasError = jukeboxResult.error ?? locResult.error

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
          Jukebox
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}
          >
            {entries.length > 0 ? entries.length.toLocaleString() : '…'}
          </span>
        </h1>
      </div>

      {isLoading && <LoadingState message="Loading jukebox tracks…" />}
      {hasError && <ErrorState error={hasError} />}

      {!isLoading && !hasError && (
        <>
          <div
            className="flex items-center gap-3 px-4 py-3 border-b flex-wrap shrink-0"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <label className="flex items-center gap-2 text-xs text-slate-400">
              <span>Series</span>
              <select
                value={seriesFilter}
                onChange={e => setSeriesFilter(e.target.value)}
                className="text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                style={{
                  background: '#16161f',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: seriesFilter ? '#e2e8f0' : '#64748b',
                }}
              >
                <option value="">All Series</option>
                {seriesOptions.map(h => (
                  <option key={h} value={String(h)}>
                    {SERIES_HASH[h] ?? hexStr(h)}
                  </option>
                ))}
              </select>
            </label>

            <span className="text-xs text-slate-500">
              {filtered.length.toLocaleString()} track{filtered.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex-1 overflow-auto">
            <table
              className="text-xs border-collapse w-full"
              style={{ minWidth: '1400px' }}
              onClick={handleCellClick}
            >
              <thead>
                <tr
                  className="sticky top-0"
                  style={{ background: 'rgba(15,15,22,0.97)', backdropFilter: 'blur(8px)' }}
                >
                  {[
                    { label: 'Series', derived: true },
                    { label: 'Track Name', derived: false },
                    { label: 'Cue Name', derived: false },
                    { label: 'Arrangement', derived: false },
                    { label: 'BGM Hash', derived: false },
                    { label: 'Alt Cue 1', derived: false },
                    { label: 'Alt Cue 2', derived: false },
                    { label: 'Alt Cue 3', derived: false },
                  ].map((col, i) => (
                    <th
                      key={col.label}
                      className={col.derived ? DERIVED_TH : TH}
                      style={{
                        ...(col.derived ? DERIVED_TH_STYLE : TH_STYLE),
                        ...(col.derived && i === 0 ? DERIVED_TD_DIVIDER : {}),
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ cursor: 'pointer' }}>
                {filtered.map((e, i) => (
                  <JukeboxRow key={`${e.bgm_hash}-${i}`} entry={e} loc={loc} />
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center text-slate-600 py-16 text-sm">No tracks match filters</div>
            )}
          </div>

          {copyText && <CopyToast text={copyText} />}
        </>
      )}
    </div>
  )
}

function JukeboxRow({ entry: e, loc }: { entry: JukeboxEntry; loc: LocDict }) {
  return (
    <tr className="hover:bg-white/3 transition-colors" style={ROW_STYLE}>
      <SeriesCell hash={e.series_hash} divider />
      <LocCell
        locKey={e.display_text_key}
        loc={loc}
        className="px-3 py-2 whitespace-nowrap"
        resolvedClassName="text-slate-200"
        maxWidth={260}
      />
      <td
        className="px-3 py-2 font-mono text-violet-300 whitespace-nowrap"
        data-value={e.cue_name ?? ''}
      >
        {e.cue_name ?? '–'}
      </td>
      <td className="px-3 py-2 text-slate-400 whitespace-nowrap" data-value={e.arrangement ?? ''}>
        {e.arrangement ?? '–'}
      </td>
      <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap" data-value={hexStr(e.bgm_hash)}>
        {hexStr(e.bgm_hash)}
      </td>
      <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap" data-value={altCue(e.alt_cue_name_1)}>
        {altCue(e.alt_cue_name_1)}
      </td>
      <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap" data-value={altCue(e.alt_cue_name_2)}>
        {altCue(e.alt_cue_name_2)}
      </td>
      <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap" data-value={altCue(e.alt_cue_name_3)}>
        {altCue(e.alt_cue_name_3)}
      </td>
    </tr>
  )
}
