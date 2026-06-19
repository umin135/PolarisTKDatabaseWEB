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
  short_name_key?: string
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
  is_active?: boolean
  flag_balcony?: boolean
  flag_ocean?: boolean
  flag_infinite?: boolean
  flag_battle?: boolean
  is_online_enabled?: boolean
  is_ranked_enabled?: boolean
  arena_width?: number
  arena_depth?: number
  stage_name_key?: string
  level_name?: string
  sound_bank?: string
  group_id?: string
  extra_group?: string
  stage_mode?: number
  is_default_variant?: boolean
}

export interface StageList {
  version: number
  data: { entries: StageEntry[] }
}

// --- jukebox_list ---
export interface JukeboxEntry {
  bgm_hash: number
  series_hash?: number
  cue_name?: string
  arrangement?: string
  display_text_key?: string
}

export interface JukeboxList {
  version: number
  data: { entries: JukeboxEntry[] }
}

// --- series_list ---
export interface SeriesEntry {
  series_hash: number
  jacket_text_key?: string
  logo_text_key?: string
}

export interface SeriesList {
  version: number
  data: { entries: SeriesEntry[] }
}

// --- rank_list ---
export interface RankItem {
  hash: number
  text_key?: string
  name?: string
  rank?: number
}
export interface RankGroup {
  group_id: number
  entries?: RankItem[]
}
export interface RankList {
  version: number
  data: { entries: RankGroup[] }
}

// --- per_fighter_basic_info_list ---
export interface FighterBasicEntry {
  fighter_code_hash: number
  [key: string]: number
}
export interface FighterBasicList {
  version: number
  data: { entries: FighterBasicEntry[] }
}

// --- per_fighter_battle_info_list ---
export interface FighterBattleEntry {
  fighter_code_hash: number
  [key: string]: number
}
export interface FighterBattleList {
  version: number
  data: { entries: FighterBattleEntry[] }
}

// --- customize_item_common_list ---
export interface CustomizeItemEntry {
  char_item_id: number
  base_id?: number
  asset_name?: string
  character_hash?: number
  text_key?: string
  is_enabled?: boolean
  price?: number
  sort_group?: number
}
export interface CustomizeItemCommonList {
  version: number
  data: { entries: CustomizeItemEntry[] }
}

// --- gallery_illust_list ---
export interface GalleryIllustEntry {
  title_hash?: number
  illust_id?: number
  thumbnail_key?: string
  entry_index?: number
  unlock_price?: number
}
export interface GalleryIllustList {
  version: number
  data: { entries: GalleryIllustEntry[] }
}

// --- gallery_movie_list ---
export interface GalleryMovieEntry {
  title_hash?: number
  movie_id?: number
  thumbnail_key?: string
  text_key?: string
}
export interface GalleryMovieList {
  version: number
  data: { entries: GalleryMovieEntry[] }
}

// --- character_episode_list ---
export interface EpisodeRecord {
  player_character_hash?: number
  battle_index?: number
  episode_stage_hash?: number
  opponent_character_hash?: number
  battles_count?: number
}
export interface EpisodeTable {
  unk00?: number
  records?: EpisodeRecord[]
}
export interface EpisodeList {
  version: number
  data: EpisodeTable
}

// --- tam_mission_list ---
export interface MissionEntry {
  mission_id?: number
  [key: string]: number | undefined
}
export interface MissionList {
  version: number
  data: { entries: MissionEntry[] }
}
