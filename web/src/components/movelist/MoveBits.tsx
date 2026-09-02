import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tooltip } from '../Tooltip'
import { HudPortrait } from '../HudPortrait'
import {
  unrestoredLabel,
  formatHash,
  MATCH_FIELD_LABEL,
  type MatchField,
  type MovelistChar,
} from '../../lib/movelist'

export function UnrestoredText({
  value,
  length,
}: {
  value: string | null
  length: number
}) {
  if (value) {
    return <span className="block truncate text-slate-200">{value}</span>
  }

  return (
    <span className="block truncate font-mono text-amber-400/90">
      {unrestoredLabel(length)}
    </span>
  )
}

export function MatchBadges({ fields }: { fields: MatchField[] }) {
  if (fields.length === 0) return null
  return (
    <span className="inline-flex flex-wrap gap-1">
      {fields.map(f => (
        <span
          key={f}
          className="text-[10px] font-mono px-1.5 py-0.5 rounded"
          style={{
            background: 'rgba(124,58,237,0.15)',
            color: '#c4b5fd',
            border: '1px solid rgba(124,58,237,0.3)',
          }}
        >
          {MATCH_FIELD_LABEL[f]}
        </span>
      ))}
    </span>
  )
}

export function CharacterChip({ ch }: { ch: MovelistChar }) {
  return (
    <Link
      to={`/movelist/${ch.code}`}
      className="inline-flex items-center gap-1.5 rounded-lg pl-0.5 pr-2 py-0.5 transition-colors hover:bg-white/10"
      style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
      title={ch.name}
    >
      <HudPortrait code={ch.code} alt={ch.name} size={22} />
      <span className="text-[11px] text-slate-300 whitespace-nowrap">{ch.name}</span>
    </Link>
  )
}

const CHIP_PREVIEW = 8

export function CharacterChipList({ characters }: { characters: MovelistChar[] }) {
  const [expanded, setExpanded] = useState(false)
  const collapsed = !expanded && characters.length > CHIP_PREVIEW
  const shown = collapsed ? characters.slice(0, CHIP_PREVIEW) : characters
  const hidden = characters.length - shown.length

  return (
    <div className="flex flex-wrap gap-1.5 mt-2.5">
      {shown.map(ch => (
        <CharacterChip key={ch.code} ch={ch} />
      ))}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-[11px] text-violet-300 px-2 py-0.5 rounded-lg hover:bg-white/10"
          style={{ border: '1px solid rgba(167,139,250,0.25)' }}
        >
          +{hidden} more
        </button>
      )}
    </div>
  )
}

export function HashCell({ value }: { value: number | null }) {
  const hex = formatHash(value)
  const dec = value == null ? '' : String(value >>> 0)
  return (
    <Tooltip content={dec ? `${hex}  (${dec})` : hex} disabled={!dec}>
      <span className="font-mono text-slate-400 whitespace-nowrap">{hex}</span>
    </Tooltip>
  )
}

export function ChipCount({ n }: { n: number }) {
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}
    >
      {n} character{n === 1 ? '' : 's'}
    </span>
  )
}
