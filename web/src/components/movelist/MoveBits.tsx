import {
  unrestoredLabel,
  formatHash,
  MATCH_FIELD_LABEL,
  type MatchField,
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

export function HashCell({ value }: { value: number | null }) {
  return (
    <span className="font-mono text-slate-400 whitespace-nowrap">{formatHash(value)}</span>
  )
}
