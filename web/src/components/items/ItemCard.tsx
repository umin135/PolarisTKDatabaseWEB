import { useState } from 'react'
import { Tooltip } from '../Tooltip'
import { ITEM_POS_COLORS, ITEM_POS_LABEL } from '../../lib/constants'
import {
  ICON_BODY,
  rarityBgUrl,
  rarityIconUrl,
  resolveItemImageSrc,
} from '../../lib/itemImages'

export function ItemCard({ assetName, label, pos, charCode, rarity = 0 }: {
  assetName: string | undefined
  label: string
  pos: string
  charCode?: string
  rarity?: number
}) {
  const color = ITEM_POS_COLORS[pos]
  const [errCount, setErrCount] = useState(0)

  const src = resolveItemImageSrc(assetName, charCode, errCount)
  const bgUrl = rarityBgUrl(rarity)
  const iconUrl = rarityIconUrl(rarity)

  return (
    <Tooltip content={assetName ?? ''} disabled={!assetName}>
      <div
        className="flex flex-col overflow-hidden transition-all duration-150 hover:scale-[1.03] hover:shadow-lg"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="relative" style={{ background: 'rgba(0,0,0,0.3)', aspectRatio: '1' }}>
          {bgUrl && (
            <img src={bgUrl} aria-hidden className="absolute inset-0 w-full h-full object-cover" />
          )}
          <img
            src={src ?? ICON_BODY}
            alt={label}
            className="absolute inset-0 w-full h-full object-contain p-1"
            onError={() => setErrCount(c => Math.min(c + 1, 2))}
          />
          {iconUrl && (
            <img src={iconUrl} aria-hidden className="absolute top-1 left-1 w-6 h-6 object-contain" />
          )}
          {pos && pos !== 'none' && pos !== 'NONE' && (
            <span
              className="absolute top-1 right-1 text-[9px] px-1 py-0.5 rounded font-medium leading-none"
              style={{
                background: `${color ?? '#94a3b8'}28`,
                color: color ?? '#94a3b8',
                border: `1px solid ${color ?? '#94a3b8'}50`,
              }}
            >
              {ITEM_POS_LABEL[pos] ?? pos}
            </span>
          )}
        </div>
        <div className="px-2 py-1.5">
          <p className="text-[10px] font-mono text-slate-400 truncate leading-tight">{label}</p>
        </div>
      </div>
    </Tooltip>
  )
}
