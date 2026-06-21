import type { CustomizeItemCommonEntry, LocDict } from '../../lib/types'
import { getPosCode } from '../../lib/common'
import { GroupedCommonRow } from './types'

export const COMMON_TABLE_COLUMNS = [
  'AssetName', 'ItemPosition ID',
  'Name Key', 'Extra Text Key 1', 'Extra Text Key 2',
  'isDefaultKey', 'shop_sort_id', 'Visiblity', 'Rarity', 'Price', 'unk_13',
  'category_no', 'hash_2', 'isColorable', 'unk_17',
  'hash_3', 'unk_19', 'unk_20', 'unk_21', 'unk_22', 'hash_4', 'unk_24', 'Game Version',
] as const

export function matchesCommonSearch(
  e: CustomizeItemCommonEntry,
  lq: string,
  loc: LocDict,
): boolean {
  if ((e.asset_name ?? '').toLowerCase().includes(lq)) return true
  if ((e.text_key ?? '').toLowerCase().includes(lq)) return true
  if (String(e.char_item_id).includes(lq)) return true
  if (String(e.base_id ?? 0).includes(lq)) return true
  const key = e.text_key
  if (key) {
    const resolved = loc[key]
    if (resolved && resolved.toLowerCase().includes(lq)) return true
  }
  return false
}

export function buildGroupedRows(data: CustomizeItemCommonEntry[]): GroupedCommonRow[] {
  const groups: GroupedCommonRow[] = []
  const indexByBaseId = new Map<number, number>()

  for (const e of data) {
    const key = e.base_id ?? 0
    const idx = indexByBaseId.get(key)
    if (idx === undefined) {
      indexByBaseId.set(key, groups.length)
      const characterHashes = new Set<number>()
      if (e.character_hash !== undefined) characterHashes.add(e.character_hash)
      groups.push({
        entry: e,
        variantCount: 1,
        characterHashes,
        posCode: getPosCode(e.hash_1),
      })
    } else {
      const group = groups[idx]
      group.variantCount += 1
      if (e.character_hash !== undefined) group.characterHashes.add(e.character_hash)
    }
  }

  return groups
}

export function filterUngroupedEntries(
  data: CustomizeItemCommonEntry[],
  charHash: number | null,
  posFilter: string,
  lq: string,
  loc: LocDict,
): CustomizeItemCommonEntry[] {
  if (!charHash && !posFilter && !lq) return data

  const result: CustomizeItemCommonEntry[] = []
  for (const e of data) {
    if (charHash !== null && e.character_hash !== charHash) continue
    if (posFilter && getPosCode(e.hash_1) !== posFilter) continue
    if (lq && !matchesCommonSearch(e, lq, loc)) continue
    result.push(e)
  }
  return result
}

export function filterGroupedRows(
  groups: GroupedCommonRow[],
  charHash: number | null,
  posFilter: string,
  lq: string,
  loc: LocDict,
): GroupedCommonRow[] {
  if (!charHash && !posFilter && !lq) return groups

  const result: GroupedCommonRow[] = []
  for (const g of groups) {
    if (charHash !== null && !g.characterHashes.has(charHash)) continue
    if (posFilter && g.posCode !== posFilter) continue
    if (lq && !matchesCommonSearch(g.entry, lq, loc)) continue
    result.push(g)
  }
  return result
}

export function getCommonTableColumns(groupByLocalId: boolean): string[] {
  if (groupByLocalId) {
    return ['Local Item ID', 'Variants', ...COMMON_TABLE_COLUMNS]
  }
  return [
    'Item ID', 'Local Item ID',
    ...COMMON_TABLE_COLUMNS.slice(0, 1),
    'Character ID',
    ...COMMON_TABLE_COLUMNS.slice(1),
  ]
}
