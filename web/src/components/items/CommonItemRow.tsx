import { ItemImageTooltip } from '../ItemImageTooltip'
import type { CustomizeItemCommonEntry, LocDict } from '../../lib/types'
import { hexStr, getPosCode, getCharLabel } from '../../lib/common'
import { CHARACTERS } from '../../lib/constants'
import { PosBadge } from './PosBadge'
import { boolVal, getGameVersion, resolveLoc, ROW_STYLE } from './helpers'

interface CommonItemRowProps {
  entry: CustomizeItemCommonEntry
  variantCount: number
  groupByLocalId: boolean
  loc: LocDict
}

export function CommonItemRow({ entry: e, variantCount, groupByLocalId, loc }: CommonItemRowProps) {
  const pos = getPosCode(e.hash_1)

  return (
    <tr className="hover:bg-white/3 transition-colors" style={ROW_STYLE}>
      {!groupByLocalId && (
        <td className="px-3 py-2 font-mono text-violet-300 whitespace-nowrap">{e.char_item_id}</td>
      )}
      <td
        className="px-3 py-2 font-mono text-violet-300 whitespace-nowrap text-right"
        data-value={String(e.base_id ?? 0)}
      >
        {e.base_id ?? 0}
      </td>
      {groupByLocalId && (
        <td
          className="px-3 py-2 text-slate-400 whitespace-nowrap text-right"
          data-value={String(variantCount)}
        >
          {variantCount.toLocaleString()}
        </td>
      )}
      <td className="px-3 py-2 font-mono text-slate-300 whitespace-nowrap" style={{ maxWidth: 220 }}>
        <span className="block truncate">{e.asset_name ?? '-'}</span>
      </td>
      {!groupByLocalId && (
        <td
          className="px-3 py-2 font-mono text-slate-300 whitespace-nowrap"
          data-value={String(e.character_hash ?? 0)}
        >
          {getCharLabel(e.character_hash)}
        </td>
      )}
      <td className="px-3 py-2 whitespace-nowrap" data-value={String(e.hash_1 ?? 0)}>
        <PosBadge pos={pos} />
      </td>
      <td className="px-3 py-2 text-slate-300 whitespace-nowrap" data-value={e.text_key ?? ''} style={{ maxWidth: 220 }}>
        <ItemImageTooltip assetName={e.asset_name} charCode={CHARACTERS[e.character_hash!]?.code}>
          <span className="block truncate">{resolveLoc(e.text_key, loc)}</span>
        </ItemImageTooltip>
      </td>
      <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap" data-value={e.extra_text_key_1 ?? ''} style={{ maxWidth: 200 }}>
        <span className="block truncate">{resolveLoc(e.extra_text_key_1, loc) || (e.extra_text_key_1 ?? 0)}</span>
      </td>
      <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap" data-value={e.extra_text_key_2 ?? ''} style={{ maxWidth: 200 }}>
        <span className="block truncate">{resolveLoc(e.extra_text_key_2, loc) || (e.extra_text_key_2 ?? 0)}</span>
      </td>
      <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_8 ?? 0}</td>
      <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.shop_sort_id ?? 0}</td>
      <td className="px-3 py-2 whitespace-nowrap" style={{ color: e.is_enabled === true ? '#34d399' : '#f87171' }}>
        {boolVal(e.is_enabled)}
      </td>
      <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_11 ?? 0}</td>
      <td className="px-3 py-2 text-slate-300 whitespace-nowrap text-right" data-value={String(e.price ?? 0)}>
        {(e.price ?? 0).toLocaleString()}
      </td>
      <td className="px-3 py-2 whitespace-nowrap" style={{ color: e.unk_13 === true ? '#34d399' : '#f87171' }}>
        {boolVal(e.unk_13)}
      </td>
      <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_14 ?? 0}</td>
      <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_15 ?? 0}</td>
      <td className="px-3 py-2 whitespace-nowrap" style={{ color: e.unk_16 === true ? '#34d399' : '#f87171' }}>
        {boolVal(e.unk_16)}
      </td>
      <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_17 ?? 0}</td>
      <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap" data-value={String(e.hash_3 ?? 0)}>{hexStr(e.hash_3)}</td>
      <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_19 ?? 0}</td>
      <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_20 ?? 0}</td>
      <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_21 ?? 0}</td>
      <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_22 ?? 0}</td>
      <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap" data-value={String(e.hash_4 ?? 0)}>{hexStr(e.hash_4)}</td>
      <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_24 ?? 0}</td>
      <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{getGameVersion(e.sort_group)}</td>
    </tr>
  )
}
