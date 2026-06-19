import { useState, useMemo } from 'react'
import { useData } from '../hooks/useData'
import { PageHeader } from '../components/PageHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { fmtHash, fmtBool } from '../lib/utils'
import type { CharacterList, FighterBasicList, FighterBattleList } from '../lib/types'

export function CharactersPage() {
  const chars  = useData<CharacterList>('character_list')
  const basic  = useData<FighterBasicList>('per_fighter_basic_info_list')
  const battle = useData<FighterBattleList>('per_fighter_battle_info_list')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const entries = useMemo(() => {
    const list = chars.data?.data?.entries ?? []
    if (!q) return list
    const lq = q.toLowerCase()
    return list.filter(e =>
      e.character_code.toLowerCase().includes(lq) ||
      fmtHash(e.name_hash).toLowerCase().includes(lq)
    )
  }, [chars.data, q])

  if (chars.loading) return <LoadingState message="Loading character list..." />
  if (chars.error)   return <ErrorState error={chars.error} />

  const allEntries = chars.data?.data?.entries ?? []
  const selChar = selected ? allEntries.find(e => e.character_code === selected) : null
  const selBasic  = basic.data?.data?.entries?.find(e => e.fighter_code_hash === selChar?.name_hash)
  const selBattle = battle.data?.data?.entries?.find(e => e.fighter_code_hash === selChar?.name_hash)

  return (
    <div className="flex h-full">
      {/* List */}
      <div className="flex flex-col flex-shrink-0" style={{ width: 280, borderRight: '1px solid rgba(255,255,255,0.07)' }}>
        <PageHeader title="Characters" count={allEntries.length}>
          <div className="w-40">
            <SearchBar value={q} onChange={setQ} placeholder="Filter..." />
          </div>
        </PageHeader>

        <div className="flex-1 overflow-y-auto">
          {entries.map(e => (
            <button
              key={e.character_code}
              onClick={() => setSelected(e.character_code)}
              className="w-full text-left px-4 py-3 border-b transition-colors"
              style={{
                borderColor: 'rgba(255,255,255,0.05)',
                background: selected === e.character_code ? 'rgba(124,58,237,0.12)' : 'transparent',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: e.is_playable ? '#34d399' : e.is_enabled ? '#facc15' : '#6b7280' }}
                />
                <span className="text-sm font-mono text-slate-200">{e.character_code}</span>
                {e.group && (
                  <span className="text-[10px] text-slate-600 ml-auto">{e.group}</span>
                )}
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5 font-mono pl-4">
                {fmtHash(e.name_hash)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-y-auto">
        {!selChar ? (
          <div className="flex items-center justify-center h-full text-slate-600 text-sm">
            Select a character
          </div>
        ) : (
          <div className="p-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-100 font-mono mb-1">{selChar.character_code}</h2>
            <p className="text-sm text-slate-500 mb-6">name_hash: {fmtHash(selChar.name_hash)}</p>

            {/* Flags */}
            <Section title="Flags">
              <Row label="Enabled"    value={fmtBool(selChar.is_enabled ?? false)} />
              <Row label="Selectable" value={fmtBool(selChar.is_selectable ?? false)} />
              <Row label="Playable"   value={fmtBool(selChar.is_playable ?? false)} />
              {selChar.group && <Row label="Group" value={selChar.group} />}
              {selChar.sort_order !== undefined && <Row label="Sort Order" value={String(selChar.sort_order)} />}
            </Section>

            {/* Text Keys */}
            {(selChar.full_name_key || selChar.short_name_key) && (
              <Section title="Localization Keys">
                {selChar.full_name_key   && <Row label="Full Name Key"   value={selChar.full_name_key} mono />}
                {selChar.short_name_key  && <Row label="Short Name Key"  value={selChar.short_name_key} mono />}
                {selChar.fighting_style_key && <Row label="Fighting Style" value={selChar.fighting_style_key} mono />}
                {selChar.height_key      && <Row label="Height Key"      value={selChar.height_key} mono />}
                {selChar.weight_key      && <Row label="Weight Key"      value={selChar.weight_key} mono />}
              </Section>
            )}

            {/* Basic Info */}
            {selBasic && (
              <Section title="Basic Info">
                {Object.entries(selBasic)
                  .filter(([k]) => k !== 'fighter_code_hash')
                  .map(([k, v]) => <Row key={k} label={k} value={String(v)} />)
                }
              </Section>
            )}

            {/* Battle Info (first 20 values) */}
            {selBattle && (
              <Section title={`Battle Info (${Object.keys(selBattle).length - 1} values)`}>
                {Object.entries(selBattle)
                  .filter(([k]) => k !== 'fighter_code_hash')
                  .slice(0, 20)
                  .map(([k, v]) => <Row key={k} label={k} value={String(v)} />)
                }
                {Object.keys(selBattle).length > 21 && (
                  <p className="text-xs text-slate-600 mt-2">
                    + {Object.keys(selBattle).length - 21} more values in raw data
                  </p>
                )}
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">{title}</h3>
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div
      className="flex items-center px-3 py-2 text-sm"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <span className="text-slate-500 w-40 flex-shrink-0 text-xs">{label}</span>
      <span className={mono ? 'font-mono text-violet-300 text-xs' : 'text-slate-200 text-xs'}>
        {value}
      </span>
    </div>
  )
}
