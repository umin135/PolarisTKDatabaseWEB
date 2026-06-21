import { useState, useMemo, useRef } from 'react'
import { useGameData } from '../hooks/useGameData'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { Tooltip } from '../components/Tooltip'
import { clsx } from '../lib/utils'
import type { LocDict, StageEntry, StageList } from '../lib/types'
import { hexStr } from '../lib/common'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function boolVal(v: boolean | undefined): string {
  return v ? 'True' : 'False'
}

function boolColor(v: boolean | undefined): string {
  return v === true ? '#34d399' : '#f87171'
}

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

function HashCell({ hash }: { hash: number | undefined }) {
  const hex = hexStr(hash)

  return (
    <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap" data-value={hex}>
      {hex}
    </td>
  )
}

function BoolCell({ value }: { value: boolean | undefined }) {
  return (
    <td
      className="px-3 py-2 whitespace-nowrap"
      style={{ color: boolColor(value) }}
      data-value={boolVal(value)}
    >
      {boolVal(value)}
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

const COLUMNS = [
  'Stage Code',
  'Stage Name',
  'Level Name',
  'Group ID',
  'Selectable',
  'Active',
  'Online',
  'Ranked',
  'Default Variant',
  'Stage Hash',
  'Variant Hash',
  'Parent Index',
  'Arena W',
  'Arena D',
  'Arena Param',
  'Stage Mode',
  'Sound Bank',
  'Wall A',
  'Wall B',
  'Has Weather',
  'Battle',
  'Infinite',
  'Balcony',
  'Ocean',
  'Interlocked',
] as const

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function StagesPage() {
  const [selectableOnly, setSelectableOnly] = useState(false)
  const { handleCellClick, copyText } = useCopyToast()

  const stageResult = useGameData<StageList>('fbsdata', 'stage_list')
  const locResult = useGameData<LocDict>('localize', 'loc_en')

  const entries = stageResult.data?.data?.entries ?? []
  const loc = locResult.data ?? {}

  const filtered = useMemo(() => {
    if (!selectableOnly) return entries
    return entries.filter(e => e.is_selectable === true)
  }, [entries, selectableOnly])

  const isLoading = stageResult.loading || locResult.loading
  const hasError = stageResult.error ?? locResult.error

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
          Stages
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}
          >
            {entries.length > 0 ? entries.length.toLocaleString() : '…'}
          </span>
        </h1>
      </div>

      {isLoading && <LoadingState message="Loading stages…" />}
      {hasError && <ErrorState error={hasError} />}

      {!isLoading && !hasError && (
        <>
          <div
            className="flex items-center gap-3 px-4 py-3 border-b flex-wrap shrink-0"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <label
              className={clsx(
                'flex items-center gap-2 text-xs cursor-pointer select-none rounded-lg px-3 py-1.5 transition-colors',
                selectableOnly ? 'text-violet-300' : 'text-slate-400',
              )}
              style={{
                background: '#16161f',
                border: selectableOnly
                  ? '1px solid rgba(124,58,237,0.35)'
                  : '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <input
                type="checkbox"
                checked={selectableOnly}
                onChange={e => setSelectableOnly(e.target.checked)}
                className="rounded accent-violet-500"
              />
              Is Selectable
            </label>

            <span className="text-xs text-slate-500">
              {filtered.length.toLocaleString()} stage{filtered.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex-1 overflow-auto">
            <table
              className="text-xs border-collapse w-full"
              style={{ minWidth: '2200px' }}
              onClick={handleCellClick}
            >
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
              <tbody style={{ cursor: 'pointer' }}>
                {filtered.map(e => (
                  <StageRow key={e.stage_code} entry={e} loc={loc} />
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center text-slate-600 py-16 text-sm">No stages match filters</div>
            )}
          </div>

          {copyText && <CopyToast text={copyText} />}
        </>
      )}
    </div>
  )
}

function StageRow({ entry: e, loc }: { entry: StageEntry; loc: LocDict }) {
  return (
    <tr className="hover:bg-white/3 transition-colors" style={ROW_STYLE}>
      <td
        className="px-3 py-2 font-mono text-violet-300 whitespace-nowrap"
        data-value={e.stage_code}
      >
        {e.stage_code}
      </td>
      <LocCell
        locKey={e.stage_name_key}
        loc={loc}
        className="px-3 py-2 whitespace-nowrap"
        resolvedClassName="text-slate-200"
        maxWidth={200}
      />
      <td
        className="px-3 py-2 font-mono text-slate-300 whitespace-nowrap"
        data-value={e.level_name ?? ''}
        style={{ maxWidth: 180 }}
      >
        <span className="block truncate">{e.level_name ?? '–'}</span>
      </td>
      <td className="px-3 py-2 font-mono text-slate-400 whitespace-nowrap" data-value={e.group_id ?? ''}>
        {e.group_id ?? '–'}
      </td>
      <BoolCell value={e.is_selectable} />
      <BoolCell value={e.is_active} />
      <BoolCell value={e.is_online_enabled} />
      <BoolCell value={e.is_ranked_enabled} />
      <BoolCell value={e.is_default_variant} />
      <HashCell hash={e.stage_hash} />
      <HashCell hash={e.variant_hash} />
      <td
        className="px-3 py-2 text-slate-500 whitespace-nowrap text-right"
        data-value={String(e.parent_stage_index ?? 0)}
      >
        {e.parent_stage_index ?? '–'}
      </td>
      <td
        className="px-3 py-2 text-slate-500 whitespace-nowrap text-right"
        data-value={String(e.arena_width ?? 0)}
      >
        {e.arena_width ?? '–'}
      </td>
      <td
        className="px-3 py-2 text-slate-500 whitespace-nowrap text-right"
        data-value={String(e.arena_depth ?? 0)}
      >
        {e.arena_depth ?? '–'}
      </td>
      <td
        className="px-3 py-2 text-slate-500 whitespace-nowrap text-right"
        data-value={String(e.arena_param ?? 0)}
      >
        {e.arena_param ?? '–'}
      </td>
      <td
        className="px-3 py-2 text-slate-500 whitespace-nowrap text-right"
        data-value={String(e.stage_mode ?? 0)}
      >
        {e.stage_mode ?? '–'}
      </td>
      <td
        className="px-3 py-2 font-mono text-slate-400 whitespace-nowrap"
        data-value={e.sound_bank ?? ''}
        style={{ maxWidth: 120 }}
      >
        <span className="block truncate">{e.sound_bank ?? '–'}</span>
      </td>
      <td
        className="px-3 py-2 text-slate-500 whitespace-nowrap text-right"
        data-value={String(e.wall_distance_a ?? 0)}
      >
        {e.wall_distance_a ?? '–'}
      </td>
      <td
        className="px-3 py-2 text-slate-500 whitespace-nowrap text-right"
        data-value={String(e.wall_distance_b ?? 0)}
      >
        {e.wall_distance_b ?? '–'}
      </td>
      <BoolCell value={e.has_weather} />
      <BoolCell value={e.flag_battle} />
      <BoolCell value={e.flag_infinite} />
      <BoolCell value={e.flag_balcony} />
      <BoolCell value={e.flag_ocean} />
      <BoolCell value={e.flag_interlocked} />
    </tr>
  )
}
