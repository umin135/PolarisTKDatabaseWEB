import { ITEM_POS_COLORS, ITEM_POS_LABEL } from '../../lib/constants'

export function PosBadge({ pos }: { pos: string }) {
  if (!pos || pos === 'none' || pos === 'NONE')
    return <span className="text-slate-600">–</span>
  const color = ITEM_POS_COLORS[pos] ?? '#94a3b8'
  return (
    <span
      className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
      style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
    >
      {ITEM_POS_LABEL[pos] ?? pos}
    </span>
  )
}
