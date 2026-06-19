import { useState } from 'react'
import { useData } from '../hooks/useData'
import { PageHeader } from '../components/PageHeader'
import { LoadingState, ErrorState } from '../components/LoadingState'

const FILES = [
  'arcade_cpu_list', 'area_list', 'assist_input_list',
  'ball_property_list', 'ball_recommend_list', 'ball_setting_list',
  'battle_common_list', 'battle_cpu_list', 'battle_motion_list',
  'battle_subtitle_info', 'body_cylinder_data_list',
  'button_help_list', 'button_image_list',
  'character_episode_list', 'character_list', 'character_select_list',
  'chat_window_list', 'customize_item_acc_parameter_list',
  'customize_item_color_palette_list', 'customize_item_color_slot_list',
  'customize_item_common_list', 'customize_item_exclusive_list',
  'customize_item_prohibit_drama_list', 'customize_item_shop_camera_list',
  'customize_item_unique_list', 'customize_panel_list', 'customize_set_list',
  'customize_unique_exclusion_list', 'drama_player_start_list',
  'drama_voice_change_list', 'fate_drama_player_start_list',
  'gallery_illust_list', 'gallery_movie_list', 'gallery_title_list',
  'game_camera_data_list', 'jukebox_list',
  'per_fighter_basic_info_list', 'per_fighter_battle_info_list',
  'per_fighter_motion_info_list', 'per_fighter_voice_info_list',
  'rank_list', 'series_list', 'stage_list',
  'store_customize_item_exclusive_list', 'tam_mission_list',
]

function RawViewer({ name }: { name: string }) {
  const { data, loading, error } = useData<unknown>(name)
  if (loading) return <LoadingState message={`Loading ${name}...`} />
  if (error)   return <ErrorState error={error} />

  return (
    <pre
      className="text-[11px] font-mono text-slate-300 overflow-auto p-4 rounded-lg"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', maxHeight: '70vh' }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

export function RawDataPage() {
  const [selected, setSelected] = useState(FILES[0])

  return (
    <div className="flex h-full">
      {/* File List */}
      <div className="flex flex-col flex-shrink-0 border-r overflow-y-auto" style={{ width: 260, borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="px-4 py-3 border-b text-xs font-semibold text-slate-400 uppercase tracking-widest" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          JSON Files
        </div>
        {FILES.map(f => (
          <button
            key={f}
            onClick={() => setSelected(f)}
            className="w-full text-left px-4 py-2.5 text-xs font-mono transition-colors border-b hover:bg-white/5"
            style={{
              borderColor: 'rgba(255,255,255,0.04)',
              color: selected === f ? '#a78bfa' : '#94a3b8',
              background: selected === f ? 'rgba(124,58,237,0.1)' : 'transparent',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Raw JSON */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader title={selected} description="Raw parsed JSON data" />
        <div className="flex-1 overflow-auto p-4">
          <RawViewer name={selected} />
        </div>
      </div>
    </div>
  )
}
