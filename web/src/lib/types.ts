// --- localization ---
export type LocDict = Record<string, string>

// --- character_list ---
export interface CharacterEntry {
  character_code: string
  name_hash: number
  is_enabled?: boolean
  is_selectable?: boolean
  is_playable?: boolean
  group?: string
  sort_order?: number
}

export interface CharacterList {
  version: number
  data: { entries: CharacterEntry[] }
}

// --- customize_item_common_list ---
export interface CustomizeItemCommonEntry {
  char_item_id: number    // id: 0
  base_id?: number        // id: 1
  asset_name?: string     // id: 2
  character_hash?: number // id: 3
  hash_1?: number         // id: 4
  text_key?: string       // id: 5
  extra_text_key_1?: string // id: 6
  extra_text_key_2?: string // id: 7
  unk_8?: number          // id: 8
  shop_sort_id?: number   // id: 9
  is_enabled?: boolean    // id: 10
  unk_11?: number         // id: 11
  price?: number          // id: 12
  unk_13?: boolean        // id: 13
  unk_14?: number         // id: 14
  unk_15?: number         // id: 15
  unk_16?: boolean        // id: 16
  unk_17?: number         // id: 17
  hash_3?: number         // id: 18
  unk_19?: number         // id: 19
  unk_20?: number         // id: 20
  unk_21?: number         // id: 21
  unk_22?: number         // id: 22
  hash_4?: number         // id: 23
  unk_24?: number         // id: 24
  sort_group?: number     // id: 25
}

export interface CustomizeItemCommonList {
  version: number
  data: { entries: CustomizeItemCommonEntry[] }
}

// --- customize_item_unique_list ---
export interface CustomizeItemUniqueEntry {
  char_item_id?: number   // id: 0
  asset_name?: string     // id: 1
  character_hash?: number // id: 2
  hash_1?: number         // id: 3
  text_key?: string       // id: 4
  extra_text_key_1?: string // id: 5
  extra_text_key_2?: string // id: 6
  flag_7?: number         // id: 7
  unk_8?: number          // id: 8
  flag_9?: boolean        // id: 9
  unk_10?: number         // id: 10
  price?: number          // id: 11
  unk_12?: number         // id: 12
  unk_13?: number         // id: 13
  hash_2?: number         // id: 14
  flag_15?: boolean       // id: 15
  unk_16?: number         // id: 16
  hash_3?: number         // id: 17
  unk_18?: number         // id: 18
  unk_19?: number         // id: 19
  unk_20?: number         // id: 20
  unk_21?: number         // id: 21
}

export interface CustomizeItemUniqueBodyEntry {
  asset_name: string
  char_item_id: number
}

export interface CustomizeItemUniqueList {
  version: number
  data: {
    entries: CustomizeItemUniqueEntry[]
    body_entries?: CustomizeItemUniqueBodyEntry[]
  }
}
