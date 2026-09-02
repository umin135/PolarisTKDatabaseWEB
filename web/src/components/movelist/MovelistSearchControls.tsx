import { SearchBar } from '../SearchBar'
import type { SearchField } from '../../lib/movelist'

const SELECT_STYLE = {
  background: '#16161f',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#e2e8f0',
} as const

export function MovelistSearchControls({
  q,
  onQuery,
  field,
  onField,
  caseSensitive,
  onCaseSensitive,
  placeholder,
}: {
  q: string
  onQuery: (v: string) => void
  field: SearchField
  onField: (v: SearchField) => void
  caseSensitive: boolean
  onCaseSensitive: (v: boolean) => void
  placeholder: string
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={field}
        onChange={e => onField(e.target.value as SearchField)}
        className="text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer shrink-0"
        style={SELECT_STYLE}
        aria-label="Search field"
      >
        <option value="move">Move</option>
        <option value="anim">Animation</option>
      </select>
      <div className="flex-1 min-w-48 max-w-xl">
        <SearchBar value={q} onChange={onQuery} placeholder={placeholder} />
      </div>
      <label
        className={`flex items-center gap-2 text-xs cursor-pointer select-none rounded-lg px-3 py-1.5 transition-colors ${
          caseSensitive ? 'text-violet-300' : 'text-slate-400'
        }`}
        style={{
          background: '#16161f',
          border: caseSensitive
            ? '1px solid rgba(124,58,237,0.35)'
            : '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <input
          type="checkbox"
          checked={caseSensitive}
          onChange={e => onCaseSensitive(e.target.checked)}
          className="rounded accent-violet-500"
        />
        Match case
      </label>
    </div>
  )
}

export function searchPlaceholder(field: SearchField): string {
  return field === 'anim'
    ? 'Search animation name or hash (dec / 0x…)'
    : 'Search move name or hash (dec / 0x…)'
}
