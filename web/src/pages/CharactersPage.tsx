import { useState, useMemo, useRef } from 'react'
import { useGameData } from '../hooks/useGameData'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { Tooltip } from '../components/Tooltip'
import { clsx } from '../lib/utils'
import type { CharacterEntry, CharacterList, LocDict } from '../lib/types'
import { hexStr } from '../lib/common'
import { CHAR_HASH, CHAR_HASH_TO_FIGHTER_NAME, FIGHTER_ID_TO_NAME } from '../lib/constants'

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

type SortMode = 'fighter-id' | 'sort-order'

function FilterSelect({
  value, onChange, children, label,
}: {
  value: string
  onChange: (v: SortMode) => void
  children: React.ReactNode
  label: string
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-400">
      <span>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value as SortMode)}
        className="text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer"
        style={{
          background: '#16161f',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#e2e8f0',
        }}
      >
        {children}
      </select>
    </label>
  )
}

function FighterIdCell({ hash, divider }: { hash: number; divider?: boolean }) {
  const fighterId = CHAR_HASH_TO_FIGHTER_NAME[hash]
  const style = { ...DERIVED_TD_STYLE, ...(divider ? DERIVED_TD_DIVIDER : {}) }

  if (fighterId === undefined) {
    return (
      <td className="px-3 py-2 text-sky-200/40 whitespace-nowrap" style={style} data-value="">
        –
      </td>
    )
  }

  return (
    <td
      className="px-3 py-2 font-mono text-sky-100 whitespace-nowrap text-right"
      style={style}
      data-value={String(fighterId)}
    >
      {fighterId}
    </td>
  )
}

function FighterCell({ hash, divider }: { hash: number; divider?: boolean }) {
  const fighterId = CHAR_HASH_TO_FIGHTER_NAME[hash]
  const name = fighterId !== undefined ? FIGHTER_ID_TO_NAME[fighterId] : undefined
  const style = { ...DERIVED_TD_STYLE, ...(divider ? DERIVED_TD_DIVIDER : {}) }

  if (!name) {
    return (
      <td className="px-3 py-2 text-sky-200/40 whitespace-nowrap" style={style} data-value="">
        –
      </td>
    )
  }

  return (
    <td className="px-3 py-2 text-sky-100 whitespace-nowrap" style={style} data-value={name}>
      {name}
    </td>
  )
}

function NameHashCell({ hash }: { hash: number }) {
  const hex = hexStr(hash)
  const code = CHAR_HASH[hash]

  if (!code) {
    return (
      <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap" data-value={hex}>
        {hex}
      </td>
    )
  }

  return (
    <td className="px-3 py-2 whitespace-nowrap" data-value={hex}>
      <Tooltip content={hex}>
        <span
          className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium font-mono whitespace-nowrap"
          style={{
            background: 'rgba(124,58,237,0.15)',
            color: '#a78bfa',
            border: '1px solid rgba(124,58,237,0.35)',
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

export function CharactersPage() {
  const [playableOnly, setPlayableOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortMode>('fighter-id')
  const { handleCellClick, copyText } = useCopyToast()

  const charResult = useGameData<CharacterList>('fbsdata', 'character_list')
  const locResult = useGameData<LocDict>('localize', 'loc_en')

  const entries = charResult.data?.data?.entries ?? []
  const loc = locResult.data ?? {}

  const filtered = useMemo(() => {
    let list = playableOnly ? entries.filter(e => e.is_playable === true) : entries
    list = [...list]

    if (sortBy === 'fighter-id') {
      list.sort((a, b) => {
        const fa = CHAR_HASH_TO_FIGHTER_NAME[a.name_hash]
        const fb = CHAR_HASH_TO_FIGHTER_NAME[b.name_hash]
        if (fa === undefined && fb === undefined) return 0
        if (fa === undefined) return 1
        if (fb === undefined) return -1
        return fa - fb
      })
    } else {
      list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    }

    return list
  }, [entries, playableOnly, sortBy])

  const isLoading = charResult.loading || locResult.loading
  const hasError = charResult.error ?? locResult.error

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
          Characters
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}
          >
            {entries.length > 0 ? entries.length.toLocaleString() : '…'}
          </span>
        </h1>
      </div>

      {isLoading && <LoadingState message="Loading characters…" />}
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
                playableOnly ? 'text-violet-300' : 'text-slate-400',
              )}
              style={{
                background: '#16161f',
                border: playableOnly
                  ? '1px solid rgba(124,58,237,0.35)'
                  : '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <input
                type="checkbox"
                checked={playableOnly}
                onChange={e => setPlayableOnly(e.target.checked)}
                className="rounded accent-violet-500"
              />
              Is Playable
            </label>

            <FilterSelect value={sortBy} onChange={setSortBy} label="Sort By">
              <option value="fighter-id">Fighter ID</option>
              <option value="sort-order">Sort Order</option>
            </FilterSelect>

            <span className="text-xs text-slate-500">
              {filtered.length.toLocaleString()} character{filtered.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex-1 overflow-auto">
            <table
              className="text-xs border-collapse w-full"
              style={{ minWidth: '1200px' }}
              onClick={handleCellClick}
            >
              <thead>
                <tr
                  className="sticky top-0"
                  style={{ background: 'rgba(15,15,22,0.97)', backdropFilter: 'blur(8px)' }}
                >
                  {[
                    'Fighter ID',
                    'Fighter',
                    'Character Code',
                    'Full Name',
                    'Short Name',
                    'Playable',
                    'Enabled',
                    'Selectable',
                    'Group',
                    'Sort Order',
                    'Name Hash',
                    'Origin',
                    'Fighting Style',
                    'Height',
                    'Weight',
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={i < 2 ? DERIVED_TH : TH}
                      style={{
                        ...(i < 2 ? DERIVED_TH_STYLE : TH_STYLE),
                        ...(i === 1 ? DERIVED_TD_DIVIDER : {}),
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ cursor: 'pointer' }}>
                {filtered.map(e => (
                  <CharacterRow key={e.character_code} entry={e} loc={loc} />
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center text-slate-600 py-16 text-sm">No characters match filters</div>
            )}
          </div>

          {copyText && <CopyToast text={copyText} />}
        </>
      )}
    </div>
  )
}

function CharacterRow({ entry: e, loc }: { entry: CharacterEntry; loc: LocDict }) {
  const group = e.group === 'NULL' ? '–' : (e.group ?? '–')

  return (
    <tr className="hover:bg-white/3 transition-colors" style={ROW_STYLE}>
      <FighterIdCell hash={e.name_hash} />
      <FighterCell hash={e.name_hash} divider />
      <td
        className="px-3 py-2 font-mono text-violet-300 whitespace-nowrap"
        data-value={e.character_code}
      >
        {e.character_code}
      </td>
      <LocCell
        locKey={e.full_name_key}
        loc={loc}
        className="px-3 py-2 whitespace-nowrap"
        resolvedClassName="text-slate-200"
        maxWidth={200}
      />
      <LocCell
        locKey={e.short_name_key}
        loc={loc}
        className="px-3 py-2 whitespace-nowrap"
        resolvedClassName="text-slate-300"
        maxWidth={140}
      />
      <td
        className="px-3 py-2 whitespace-nowrap"
        style={{ color: boolColor(e.is_playable) }}
        data-value={boolVal(e.is_playable)}
      >
        {boolVal(e.is_playable)}
      </td>
      <td
        className="px-3 py-2 whitespace-nowrap"
        style={{ color: boolColor(e.is_enabled) }}
        data-value={boolVal(e.is_enabled)}
      >
        {boolVal(e.is_enabled)}
      </td>
      <td
        className="px-3 py-2 whitespace-nowrap"
        style={{ color: boolColor(e.is_selectable) }}
        data-value={boolVal(e.is_selectable)}
      >
        {boolVal(e.is_selectable)}
      </td>
      <td className="px-3 py-2 text-slate-400 whitespace-nowrap" data-value={group}>
        {group}
      </td>
      <td
        className="px-3 py-2 text-slate-500 whitespace-nowrap text-right"
        data-value={String(e.sort_order ?? 0)}
      >
        {e.sort_order ?? 0}
      </td>
      <NameHashCell hash={e.name_hash} />
      <LocCell
        locKey={e.origin_key}
        loc={loc}
        className="px-3 py-2 whitespace-nowrap"
        resolvedClassName="text-slate-400"
        maxWidth={160}
      />
      <LocCell
        locKey={e.fighting_style_key}
        loc={loc}
        className="px-3 py-2 whitespace-nowrap"
        resolvedClassName="text-slate-400"
        maxWidth={160}
      />
      <LocCell
        locKey={e.height_key}
        loc={loc}
        className="px-3 py-2 whitespace-nowrap"
        resolvedClassName="text-slate-500"
        maxWidth={160}
      />
      <LocCell
        locKey={e.weight_key}
        loc={loc}
        className="px-3 py-2 whitespace-nowrap"
        resolvedClassName="text-slate-500"
        maxWidth={160}
      />
    </tr>
  )
}
