import type { CustomizeItemUniqueEntry, LocDict } from '../../lib/types'
import { getPosCode } from '../../lib/common'

export function matchesUniqueSearch(
  e: CustomizeItemUniqueEntry,
  lq: string,
  loc: LocDict,
): boolean {
  if ((e.asset_name ?? '').toLowerCase().includes(lq)) return true
  if ((e.text_key ?? '').toLowerCase().includes(lq)) return true
  if (String(e.char_item_id ?? 0).includes(lq)) return true
  const key = e.text_key
  if (key) {
    const resolved = loc[key]
    if (resolved && resolved.toLowerCase().includes(lq)) return true
  }
  return false
}

export function filterUniqueEntries(
  entries: CustomizeItemUniqueEntry[],
  charHash: number | null,
  posFilter: string,
  lq: string,
  loc: LocDict,
): CustomizeItemUniqueEntry[] {
  if (!charHash && !posFilter && !lq) return entries

  const result: CustomizeItemUniqueEntry[] = []
  for (const e of entries) {
    if (charHash !== null && e.character_hash !== charHash) continue
    if (posFilter && getPosCode(e.hash_1) !== posFilter) continue
    if (lq && !matchesUniqueSearch(e, lq, loc)) continue
    result.push(e)
  }
  return result
}

export const UNIQUE_TABLE_COLUMNS = [
  'Item ID', 'AssetName', 'Character ID', 'ItemPosition ID',
  'Name Key', 'Extra Text Key 1', 'Extra Text Key 2',
  'IsDefault', 'unk_8', 'Visiblity', 'Rarity', 'Price', 'unk_12', 'unk_13',
  'hash_2', 'isColorable', 'unk_16', 'hash_3', 'unk_18', 'unk_19', 'unk_20', 'Game Version',
] as const
