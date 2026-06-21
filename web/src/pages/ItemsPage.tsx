import { useState, useMemo, useRef } from 'react'
import { useGameData } from '../hooks/useGameData'
import { SearchBar } from '../components/SearchBar'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { Tooltip } from '../components/Tooltip'
import { ItemImageTooltip } from '../components/ItemImageTooltip'
import { clsx } from '../lib/utils'
import type {
  CustomizeItemCommonList,
  CustomizeItemCommonEntry,
  CustomizeItemUniqueList,
  CustomizeItemUniqueEntry,
  LocDict,
} from '../lib/types'
import { hexStr, getPosCode, getCharLabel } from '../lib/common'
import { ITEM_POS_COLORS, ITEM_POS_LABEL, CHARACTERS } from '../lib/constants'
import {
  ICON_BODY,
  rarityBgUrl,
  rarityIconUrl,
  resolveItemImageSrc,
} from '../lib/itemImages'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function boolVal(v: boolean | undefined): string {
  return v ? "True" : "False";
}

function resolveLoc(key: string | undefined | null, loc: LocDict): string {
  if (!key) return ''
  return loc[key] ?? key
}

function useCopyToast() {
  const [text, setText] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  function handleCellClick(e: React.MouseEvent<HTMLTableElement>) {
    const td = (e.target as HTMLElement).closest('td')
    if (!td) return
    const value = td.dataset.value ?? td.innerText.trim()
    navigator.clipboard.writeText(value)
    clearTimeout(timer.current)
    setText(value)
    timer.current = setTimeout(() => setText(null), 1600)
  }

  return { handleCellClick, copyText: text }
}

function CopyToast({ text }: { text: string }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm shadow-2xl pointer-events-none"
      style={{
        background: 'rgba(109,40,217,0.93)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(167,139,250,0.35)',
        color: '#ede9fe',
        animation: 'fadeSlideUp 0.15s ease-out',
      }}
    >
      <span className="text-violet-300 text-xs">Copied</span>
      <span className="font-mono text-xs text-white truncate" style={{ maxWidth: 260 }}>
        {text.length > 50 ? text.slice(0, 50) + '…' : text}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PosBadge({ pos }: { pos: string }) {
  if (!pos || pos === 'none' || pos === 'NONE')
    return <span className="text-slate-600">–</span>
  const color = ITEM_POS_COLORS[pos] ?? '#94a3b8'
  return (
    <span
      className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
      style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
    >
      {ITEM_POS_LABEL[pos] ?? pos}
    </span>
  )
}

function FilterSelect({
  value, onChange, children, placeholder,
}: {
  value: string; onChange: (v: string) => void; children: React.ReactNode; placeholder: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer"
      style={{
        background: '#16161f',
        border: '1px solid rgba(255,255,255,0.12)',
        color: value ? '#e2e8f0' : '#64748b',
      }}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  )
}

function Pagination({ page, total, pageSize, onChange }: {
  page: number; total: number; pageSize: number; onChange: (p: number) => void
}) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null
  const start = page * pageSize + 1
  const end = Math.min((page + 1) * pageSize, total)
  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 border-t text-xs text-slate-500 shrink-0"
      style={{ borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <span>{start}–{end} of {total.toLocaleString()}</span>
      <div className="flex items-center gap-1">
        <button disabled={page === 0} onClick={() => onChange(0)}
          className="px-2 py-1 rounded disabled:opacity-30 hover:bg-white/10 transition-colors">«</button>
        <button disabled={page === 0} onClick={() => onChange(page - 1)}
          className="px-2 py-1 rounded disabled:opacity-30 hover:bg-white/10 transition-colors">‹</button>
        <span className="px-3 py-1 rounded" style={{ background: 'rgba(255,255,255,0.07)' }}>
          {page + 1} / {totalPages}
        </span>
        <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}
          className="px-2 py-1 rounded disabled:opacity-30 hover:bg-white/10 transition-colors">›</button>
        <button disabled={page >= totalPages - 1} onClick={() => onChange(totalPages - 1)}
          className="px-2 py-1 rounded disabled:opacity-30 hover:bg-white/10 transition-colors">»</button>
      </div>
    </div>
  )
}

const TH = 'px-3 py-2.5 text-left font-medium text-slate-400 border-b whitespace-nowrap'
const TH_STYLE = { borderColor: 'rgba(255,255,255,0.07)' }
const ROW_STYLE = { borderBottom: '1px solid rgba(255,255,255,0.04)' }

// ---------------------------------------------------------------------------
// Grid card
// ---------------------------------------------------------------------------

function ItemCard({ assetName, label, pos, charCode, rarity = 0 }: {
  assetName: string | undefined; label: string; pos: string; charCode?: string; rarity?: number
}) {
  const color = ITEM_POS_COLORS[pos]
  const [errCount, setErrCount] = useState(0)

  const src = resolveItemImageSrc(assetName, charCode, errCount)

  const bgUrl   = rarityBgUrl(rarity)
  const iconUrl = rarityIconUrl(rarity)

  return (
    <Tooltip content={assetName ?? ''} disabled={!assetName}>
      <div
        className="flex flex-col overflow-hidden transition-all duration-150 hover:scale-[1.03] hover:shadow-lg"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="relative" style={{ background: 'rgba(0,0,0,0.3)', aspectRatio: '1' }}>
        {/* Rarity background */}
        {bgUrl && (
          <img src={bgUrl} aria-hidden className="absolute inset-0 w-full h-full object-cover" />
        )}

        {/* Item thumbnail */}
        <img
          src={src ?? ICON_BODY}
          alt={label}
          className="absolute inset-0 w-full h-full object-contain p-1"
          onError={() => setErrCount(c => Math.min(c + 1, 2))}
        />

        {/* Rarity icon — top-left */}
        {iconUrl && (
          <img src={iconUrl} aria-hidden className="absolute top-1 left-1 w-6 h-6 object-contain" />
        )}

        {/* Item position badge — top-right */}
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

type ViewMode = 'table' | 'grid'

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div
      className="flex rounded-md overflow-hidden text-xs"
      style={{ border: '1px solid rgba(255,255,255,0.12)' }}
    >
      {(['table', 'grid'] as ViewMode[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className="px-3 py-1.5 transition-colors"
          style={{
            background: mode === m ? 'rgba(124,58,237,0.25)' : 'transparent',
            color: mode === m ? '#a78bfa' : '#64748b',
          }}
        >
          {m === 'table' ? '≡ Table' : '⊞ Grid'}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Common Items Tab
// ---------------------------------------------------------------------------


function CommonItemsTab({ data, loc }: { data: CustomizeItemCommonEntry[]; loc: LocDict }) {
  const [charFilter, setCharFilter] = useState('')
  const [posFilter, setPosFilter] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [view, setView] = useState<ViewMode>('table')
  const [pageSize, setPageSize] = useState(100)
  const { handleCellClick, copyText } = useCopyToast()

  const charOptions = useMemo(() => {
    // Use CHARACTERS: Record<number, { code, fighterId?, name? }>
    const hashes = new Set(data.map(e => e.character_hash).filter((h): h is number => h !== undefined));
    return [...hashes].sort((a, b) => {
      const fa = CHARACTERS[a]?.fighterId ?? Number.MAX_SAFE_INTEGER;
      const fb = CHARACTERS[b]?.fighterId ?? Number.MAX_SAFE_INTEGER;
      return fa - fb;
    });
  }, [data]);

  const posOptions = useMemo(() => {
    const codes = new Set(data.map(e => getPosCode(e.hash_1)).filter(Boolean))
    return [...codes].sort()
  }, [data])

  const filtered = useMemo(() => {
    const charHash = charFilter ? Number(charFilter) : null
    const lq = q.toLowerCase()
    return data.filter(e => {
      if (charHash !== null && e.character_hash !== charHash) return false
      if (posFilter && getPosCode(e.hash_1) !== posFilter) return false
      if (lq &&
        !(e.asset_name ?? '').toLowerCase().includes(lq) &&
        !(e.text_key ?? '').toLowerCase().includes(lq) &&
        !resolveLoc(e.text_key, loc).toLowerCase().includes(lq) &&
        !String(e.char_item_id).includes(lq)) return false
      return true
    })
  }, [data, charFilter, posFilter, q, loc])

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

  function handleCharChange(v: string) { setCharFilter(v); setPage(0) }
  function handlePosChange(v: string)  { setPosFilter(v);  setPage(0) }
  function handleSearch(v: string)     { setQ(v);          setPage(0) }
  function handlePageSize(v: number)   { setPageSize(v);   setPage(0) }

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3 border-b flex-wrap shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <FilterSelect value={charFilter} onChange={handleCharChange} placeholder="All Characters">
          {charOptions.map(h => {
            const entry = CHARACTERS[h];
            const label = entry ? `${entry.name} (${entry.code})` : hexStr(h);
            return <option key={h} value={String(h)}>{label}</option>;
          })}
        </FilterSelect>

        <FilterSelect value={posFilter} onChange={handlePosChange} placeholder="All Item Positions">
          {posOptions.map(p => (
            <option key={p} value={p}>{ITEM_POS_LABEL[p] ?? p} ({p})</option>
          ))}
        </FilterSelect>

        <div className="flex-1 min-w-[180px] max-w-xs">
          <SearchBar value={q} onChange={handleSearch} placeholder="Search asset / key / ID…" />
        </div>

        <span className="text-xs text-slate-500">{filtered.length.toLocaleString()} items</span>
        <label className="flex items-center gap-1.5 text-xs text-slate-400"
          style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, background: '#16161f', padding: '0 10px' }}>
          <span>Show</span>
          <input
            type="number"
            min={1}
            defaultValue={pageSize}
            onBlur={e => handlePageSize(Math.max(1, Number(e.target.value) || 1))}
            onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
            className="text-xs py-1.5 outline-none w-14 text-center bg-transparent"
            style={{ color: '#e2e8f0' }}
          />
          <span>/ page</span>
        </label>
        <ViewToggle mode={view} onChange={v => { setView(v); setPage(0) }} />
      </div>

      {view === 'table' ? (
        <div className="flex-1 overflow-auto">
          <table className="text-xs border-collapse" style={{ minWidth: '2400px' }} onClick={handleCellClick}>
            <thead>
              <tr className="sticky top-0" style={{ background: 'rgba(15,15,22,0.97)', backdropFilter: 'blur(8px)' }}>
                {[
                  'Item ID', 'Local Item ID', 'AssetName', 'Character ID', 'ItemPosition ID',
                  'Name Key', 'Extra Text Key 1', 'Extra Text Key 2',
                  'isDefaultKey', 'shop_sort_id', 'Visiblity', 'Rarity', 'Price', 'unk_13',
                  'category_no', 'hash_2', 'isColorable', 'unk_17',
                  'hash_3', 'unk_19', 'unk_20', 'unk_21', 'unk_22', 'hash_4', 'unk_24', 'Game Version',
                ].map(h => (
                  <th key={h} className={TH} style={TH_STYLE}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ cursor: 'pointer' }}>
              {paged.map(e => {
                const pos = getPosCode(e.hash_1)
                return (
                  <tr key={e.char_item_id} className="hover:bg-white/3 transition-colors" style={ROW_STYLE}>
                    <td className="px-3 py-2 font-mono text-violet-300 whitespace-nowrap">{e.char_item_id}</td>
                    <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap text-right">{e.base_id ?? 0}</td>
                    <td className="px-3 py-2 font-mono text-slate-300 whitespace-nowrap" style={{ maxWidth: 220 }}>
                      <span className="block truncate">{e.asset_name ?? "-"}</span>
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-300 whitespace-nowrap" data-value={String(e.character_hash ?? 0)}>{getCharLabel(e.character_hash)}</td>
                    <td className="px-3 py-2 whitespace-nowrap" data-value={String(e.hash_1 ?? 0)}><PosBadge pos={pos} /></td>
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
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.sort_group ?? 0}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {paged.length === 0 && (
            <div className="text-center text-slate-600 py-16 text-sm">No items match filters</div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            {filtered.slice(page * pageSize, (page + 1) * pageSize).map(e => (
              <ItemCard
                key={e.char_item_id}
                assetName={e.asset_name}
                label={resolveLoc(e.text_key, loc) || e.asset_name?.replace(/^(?:IP|BMI|ECI|BEI|ACI)_/, '') || String(e.char_item_id)}
                pos={getPosCode(e.hash_1)}
                charCode={CHARACTERS[e.character_hash!].code}
                rarity={e.unk_11 ?? 0}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center text-slate-600 py-16 text-sm">No items match filters</div>
          )}
        </div>
      )}

      <Pagination
        page={page}
        total={filtered.length}
        pageSize={pageSize}
        onChange={setPage}
      />
      {copyText && <CopyToast text={copyText} />}
    </>
  )
}

// ---------------------------------------------------------------------------
// Unique Items Tab
// ---------------------------------------------------------------------------

function UniqueItemsTab({
  entries, bodyEntries, loc,
}: {
  entries: CustomizeItemUniqueEntry[]
  bodyEntries: { asset_name: string; char_item_id: number }[]
  loc: LocDict
}) {
  const [charFilter, setCharFilter] = useState('')
  const [posFilter, setPosFilter] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [view, setView] = useState<ViewMode>('table')
  const [pageSize, setPageSize] = useState(100)
  const { handleCellClick, copyText } = useCopyToast()

  const charOptions = useMemo(() => {
    // Use CHARACTERS: Record<number, { code, fighterId?, name? }>
    const hashes = new Set(entries.map(e => e.character_hash).filter((h): h is number => h !== undefined));
    return [...hashes].sort((a, b) => {
      const fa = CHARACTERS[a]?.fighterId ?? Number.MAX_SAFE_INTEGER;
      const fb = CHARACTERS[b]?.fighterId ?? Number.MAX_SAFE_INTEGER;
      return fa - fb;
    });
  }, [entries])

  const posOptions = useMemo(() => {
    const codes = new Set(entries.map(e => getPosCode(e.hash_1)).filter(Boolean))
    return [...codes].sort()
  }, [entries])

  const filtered = useMemo(() => {
    const charHash = charFilter ? Number(charFilter) : null
    const lq = q.toLowerCase()
    return entries.filter(e => {
      if (charHash !== null && e.character_hash !== charHash) return false
      if (posFilter && getPosCode(e.hash_1) !== posFilter) return false
      if (lq &&
        !(e.asset_name ?? '').toLowerCase().includes(lq) &&
        !(e.text_key ?? '').toLowerCase().includes(lq) &&
        !resolveLoc(e.text_key, loc).toLowerCase().includes(lq) &&
        !String(e.char_item_id ?? 0).includes(lq)) return false
      return true
    })
  }, [entries, charFilter, posFilter, q, loc])

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

  function handleCharChange(v: string) { setCharFilter(v); setPage(0) }
  function handlePosChange(v: string)  { setPosFilter(v);  setPage(0) }
  function handleSearch(v: string)     { setQ(v);          setPage(0) }
  function handlePageSize(v: number)   { setPageSize(v);   setPage(0) }

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3 border-b flex-wrap shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <FilterSelect value={charFilter} onChange={handleCharChange} placeholder="All Characters">
          {charOptions.map(h => {
            const entry = CHARACTERS[h];
            const label = entry ? `${entry.name} (${entry.code})` : hexStr(h);
            return <option key={h} value={String(h)}>{label}</option>;
          })}
        </FilterSelect>

        <FilterSelect value={posFilter} onChange={handlePosChange} placeholder="All Item Positions">
          {posOptions.map(p => (
            <option key={p} value={p}>{ITEM_POS_LABEL[p] ?? p} ({p})</option>
          ))}
        </FilterSelect>

        <div className="flex-1 min-w-[180px] max-w-xs">
          <SearchBar value={q} onChange={handleSearch} placeholder="Search asset / key / ID…" />
        </div>

        <span className="text-xs text-slate-500">{filtered.length.toLocaleString()} items</span>
        <label className="flex items-center gap-1.5 text-xs text-slate-400"
          style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, background: '#16161f', padding: '0 10px' }}>
          <span>Show</span>
          <input
            type="number"
            min={1}
            defaultValue={pageSize}
            onBlur={e => handlePageSize(Math.max(1, Number(e.target.value) || 1))}
            onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
            className="text-xs py-1.5 outline-none w-14 text-center bg-transparent"
            style={{ color: '#e2e8f0' }}
          />
          <span>/ page</span>
        </label>
        <ViewToggle mode={view} onChange={v => { setView(v); setPage(0) }} />
      </div>

      {view === 'table' ? (
        <div className="flex-1 overflow-auto">
          <table className="text-xs border-collapse" style={{ minWidth: '2200px' }} onClick={handleCellClick}>
            <thead>
              <tr className="sticky top-0" style={{ background: 'rgba(15,15,22,0.97)', backdropFilter: 'blur(8px)' }}>
                {[
                  'Item ID', 'AssetName', 'Character ID', 'ItemPosition ID',
                  'Name Key', 'Extra Text Key 1', 'Extra Text Key 2',
                  'IsDefault', 'unk_8', 'Visiblity', 'Rarity', 'Price', 'unk_12', 'unk_13',
                  'hash_2', 'isColorable', 'unk_16', 'hash_3', 'unk_18', 'unk_19', 'unk_20', 'Game Version',
                ].map(h => (
                  <th key={h} className={TH} style={TH_STYLE}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ cursor: 'pointer' }}>
              {paged.map((e, i) => {
                const pos = getPosCode(e.hash_1)
                return (
                  <tr key={e.char_item_id ?? i} className="hover:bg-white/3 transition-colors" style={ROW_STYLE}>
                    <td className="px-3 py-2 font-mono text-violet-300 whitespace-nowrap">{e.char_item_id ?? 0}</td>
                    <td className="px-3 py-2 font-mono text-slate-300 whitespace-nowrap" style={{ maxWidth: 220 }}>
                      <span className="block truncate">{e.asset_name || '-'}</span>
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-300 whitespace-nowrap" data-value={String(e.character_hash ?? 0)}>{getCharLabel(e.character_hash)}</td>
                    <td className="px-3 py-2 whitespace-nowrap" data-value={String(e.hash_1 ?? 0)}><PosBadge pos={pos} /></td>
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
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.flag_7 ?? 0}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_8 ?? 0}</td>
                    <td className="px-3 py-2 whitespace-nowrap" style={{ color: e.flag_9 === true ? '#34d399' : '#f87171' }}>
                      {boolVal(e.flag_9)}
                    </td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_10 ?? 0}</td>
                    <td className="px-3 py-2 text-slate-300 whitespace-nowrap text-right" data-value={String(e.price ?? 0)}>
                      {(e.price ?? 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_12 ?? 0}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_13 ?? 0}</td>
                    <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap" data-value={String(e.hash_2 ?? 0)}>{hexStr(e.hash_2)}</td>
                    <td className="px-3 py-2 whitespace-nowrap" style={{ color: e.flag_15 === true ? '#34d399' : '#f87171' }}>
                      {boolVal(e.flag_15)}
                    </td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_16 ?? 0}</td>
                    <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap" data-value={String(e.hash_3 ?? 0)}>{hexStr(e.hash_3)}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_18 ?? 0}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_19 ?? 0}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_20 ?? 0}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_21 ?? 0}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {paged.length === 0 && (
            <div className="text-center text-slate-600 py-16 text-sm">No items match filters</div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            {filtered.slice(page * pageSize, (page + 1) * pageSize).map((e, i) => (
              <ItemCard
                key={e.char_item_id ?? i}
                assetName={e.asset_name}
                label={resolveLoc(e.text_key, loc) || e.asset_name?.replace(/^(?:IP|BMI|ECI|BEI|ACI)_/, '') || String(e.char_item_id ?? i)}
                pos={getPosCode(e.hash_1)}
                charCode={CHARACTERS[e.character_hash!]?.code}
                rarity={e.unk_10 ?? 0}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center text-slate-600 py-16 text-sm">No items match filters</div>
          )}
        </div>
      )}

      {bodyEntries.length > 0 && view === 'table' && (
        <details className="border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <summary className="px-4 py-2.5 text-xs text-slate-400 cursor-pointer hover:text-slate-200 select-none">
            Body Entries ({bodyEntries.length})
          </summary>
          <div className="px-4 pb-4 grid grid-cols-2 gap-1.5 md:grid-cols-3 lg:grid-cols-4">
            {bodyEntries.map((b, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="font-mono text-[10px] text-violet-300">{b.char_item_id}</span>
                <span className="font-mono text-[10px] text-slate-400 truncate">{b.asset_name}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      <Pagination
        page={page}
        total={filtered.length}
        pageSize={pageSize}
        onChange={setPage}
      />
      {copyText && <CopyToast text={copyText} />}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

type Tab = 'common' | 'unique'

export function ItemsPage() {
  const [tab, setTab] = useState<Tab>('common')

  const commonResult = useGameData<CustomizeItemCommonList>('fbsdata', 'customize_item_common_list')
  const uniqueResult = useGameData<CustomizeItemUniqueList>('fbsdata', 'customize_item_unique_list')
  const locResult    = useGameData<LocDict>('localize', 'loc_en')

  const commonEntries = commonResult.data?.data?.entries ?? []
  const uniqueEntries = uniqueResult.data?.data?.entries ?? []
  const bodyEntries   = uniqueResult.data?.data?.body_entries ?? []
  const loc           = locResult.data ?? {}

  const isLoading = tab === 'common' ? commonResult.loading : uniqueResult.loading
  const hasError  = tab === 'common' ? commonResult.error   : uniqueResult.error

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center border-b shrink-0"
        style={{
          background: 'rgba(15,15,22,0.95)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(255,255,255,0.07)',
        }}
      >
        {([
          ['common', 'Common Items', commonEntries.length],
          ['unique', 'Unique Items', uniqueEntries.length],
        ] as [Tab, string, number][]).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              'flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all duration-150',
              tab === key
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-500 hover:text-slate-300',
            )}
          >
            {label}
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{
                background: tab === key ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                color: tab === key ? '#a78bfa' : '#64748b',
              }}
            >
              {count > 0 ? count.toLocaleString() : '…'}
            </span>
          </button>
        ))}
      </div>

      {isLoading && <LoadingState message={`Loading ${tab} items…`} />}
      {hasError  && <ErrorState error={hasError} />}

      {!isLoading && !hasError && tab === 'common' && (
        <CommonItemsTab data={commonEntries} loc={loc} />
      )}
      {!isLoading && !hasError && tab === 'unique' && (
        <UniqueItemsTab entries={uniqueEntries} bodyEntries={bodyEntries} loc={loc} />
      )}
    </div>
  )
}
