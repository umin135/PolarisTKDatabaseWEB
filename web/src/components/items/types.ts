import type { CustomizeItemCommonEntry } from '../../lib/types'

export type ViewMode = 'table' | 'grid'

export interface GroupedCommonRow {
  entry: CustomizeItemCommonEntry
  variantCount: number
  characterHashes: Set<number>
  posCode: string
}

export interface CommonDisplayItem {
  entry: CustomizeItemCommonEntry
  variantCount: number
}
