import { SearchBar } from '../SearchBar'
import { hexStr } from '../../lib/common'
import { ITEM_POS_LABEL, CHARACTERS } from '../../lib/constants'
import type { ViewMode } from './types'

interface ItemFilterBarProps {
  charFilter: string
  posFilter: string
  q: string
  charOptions: number[]
  posOptions: string[]
  pageSize: number
  view: ViewMode
  countLabel: React.ReactNode
  onCharChange: (v: string) => void
  onPosChange: (v: string) => void
  onSearch: (v: string) => void
  onPageSize: (v: number) => void
  onViewChange: (v: ViewMode) => void
  extra?: React.ReactNode
}

function FilterSelect({
  value, onChange, children, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  placeholder: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer"
      style={{
        background: '#16161f',
        border: '1px solid rgba(255,255,255,0.12)',
        color: value ? '#e2e8f0' : '#64748b',
      }}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  )
}

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div
      className="flex rounded-md overflow-hidden text-xs"
      style={{ border: '1px solid rgba(255,255,255,0.12)' }}
    >
      {(['table', 'grid'] as ViewMode[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className="px-3 py-1.5 transition-colors"
          style={{
            background: mode === m ? 'rgba(124,58,237,0.25)' : 'transparent',
            color: mode === m ? '#a78bfa' : '#64748b',
          }}
        >
          {m === 'table' ? '≡ Table' : '⊞ Grid'}
        </button>
      ))}
    </div>
  )
}

export function ItemFilterBar({
  charFilter,
  posFilter,
  q,
  charOptions,
  posOptions,
  pageSize,
  view,
  countLabel,
  onCharChange,
  onPosChange,
  onSearch,
  onPageSize,
  onViewChange,
  extra,
}: ItemFilterBarProps) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-3 border-b flex-wrap shrink-0"
      style={{ borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <FilterSelect value={charFilter} onChange={onCharChange} placeholder="All Characters">
        {charOptions.map(h => {
          const entry = CHARACTERS[h]
          const label = entry ? `${entry.name} (${entry.code})` : hexStr(h)
          return <option key={h} value={String(h)}>{label}</option>
        })}
      </FilterSelect>

      <FilterSelect value={posFilter} onChange={onPosChange} placeholder="All Item Positions">
        {posOptions.map(p => (
          <option key={p} value={p}>{ITEM_POS_LABEL[p] ?? p} ({p})</option>
        ))}
      </FilterSelect>

      {extra}

      <div className="flex-1 min-w-[180px] max-w-xs">
        <SearchBar value={q} onChange={onSearch} placeholder="Search asset / key / ID…" />
      </div>

      <span className="text-xs text-slate-500">{countLabel}</span>

      <label
        className="flex items-center gap-1.5 text-xs text-slate-400"
        style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, background: '#16161f', padding: '0 10px' }}
      >
        <span>Show</span>
        <input
          type="number"
          min={1}
          defaultValue={pageSize}
          onBlur={e => onPageSize(Math.max(1, Number(e.target.value) || 1))}
          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
          className="text-xs py-1.5 outline-none w-14 text-center bg-transparent"
          style={{ color: '#e2e8f0' }}
        />
        <span>/ page</span>
      </label>

      <ViewToggle mode={view} onChange={onViewChange} />
    </div>
  )
}
