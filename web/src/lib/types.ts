// --- localization ---
export type LocDict = Record<string, string>

// --- game versions ---
export interface GameVersion {
  id: string
  label: string
}
export interface GameVersions {
  latest: string
  versions: GameVersion[]
}

// --- character_list ---
export interface CharacterEntry {
  character_code: string
  name_hash: number
  is_enabled?: boolean
  is_selectable?: boolean
  is_playable?: boolean
  group?: string
  camera_offset?: number
  sort_order?: number
  full_name_key?: string
  short_name_jp_key?: string
  short_name_key?: string
  origin_key?: string
  fighting_style_key?: string
  height_key?: string
  weight_key?: string
}

export interface CharacterList {
  version: number
  data: { entries: CharacterEntry[] }
}

// --- stage_list ---
export interface StageEntry {
  stage_code: string
  stage_hash: number
  is_selectable?: boolean
  camera_offset?: number
  parent_stage_index?: number
  variant_hash?: number
  has_weather?: boolean
  is_active?: boolean
  flag_interlocked?: boolean
  flag_ocean?: boolean
  flag_10?: boolean
  flag_infinite?: boolean
  flag_battle?: boolean
  flag_13?: boolean
  flag_balcony?: boolean
  flag_15?: boolean
  reserved_16?: boolean
  is_online_enabled?: boolean
  is_ranked_enabled?: boolean
  reserved_19?: boolean
  reserved_20?: boolean
  arena_width?: number
  arena_depth?: number
  reserved_23?: number
  arena_param?: number
  extra_width?: number
  extra_group?: string
  extra_depth?: number
  group_id?: string
  stage_name_key?: string
  level_name?: string
  sound_bank?: string
  wall_distance_a?: number
  wall_distance_b?: number
  stage_mode?: number
  reserved_35?: number
  is_default_variant?: boolean
}

export interface StageList {
  version: number
  data: { entries: StageEntry[] }
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
