import { useState, useMemo, useRef } from 'react'
import { useData } from '../hooks/useData'
import { SearchBar } from '../components/SearchBar'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { clsx } from '../lib/utils'
import type {
  CustomizeItemCommonList,
  CustomizeItemCommonEntry,
  CustomizeItemUniqueList,
  CustomizeItemUniqueEntry,
} from '../lib/types'

// ---------------------------------------------------------------------------
// Hash lookup tables
// ---------------------------------------------------------------------------

const CHAR_HASH: Record<number, string> = {
  26846036:   'ZBR', 97192667:   'CTR', 236224321:  'TTR', 310559474:  'HRS',
  731112246:  'KMD', 748126445:  'PGN', 761728323:  'WKZ', 823174094:  'CHT',
  840871906:  'LON', 1009826274: 'AML', 1066975102: 'KAL', 1230214467: 'SWL',
  1281269543: 'CRW', 1575337196: 'BEE', 1597287972: 'JLY', 1633518270: 'RBT',
  1791216549: 'ANT', 1806241895: 'OKM', 1862528861: 'LZD', 1870866276: 'HMS',
  1941891036: 'CML', 2046353711: 'BBN', 2172508408: 'MNT', 2262000005: 'GHP',
  2508721799: 'TGR', 2620373223: 'DER', 2691931401: 'CCN', 2802412287: 'GRF',
  3013172036: 'CBR', 3098177400: 'CAT', 3109625382: 'SNK', 3155198250: 'BSN',
  3269129674: 'GOT', 3283482507: 'GRL', 3302278637: 'KGR', 3480598787: 'WLF',
  3651497509: 'DOG', 3716978005: 'RAT', 3826916785: 'KLW', 3908942186: 'KNK',
  3909547504: 'PIG', 2897068730: 'DEK', 2492561663: 'CMN', 1489967222: 'XXA',
  1000005316: 'XXB', 3374534069: 'XXC', 1859904795: 'XXD', 2243376126: 'XXE',
  2887689737: 'XXF', 694498012:  'XXG', 3099443275: 'KER',
}

const ITEM_POS_HASH: Record<number, string> = {
  398673939:  'gla', 784860974:  'btm', 952745790:  'bdf', 1291920003: 'fac',
  1575090356: 'ex0', 2118278548: 'ex1', 2325958612: 'hed', 2562980590: 'ex2',
  2682927175: 'har', 2731567485: 'hef', 3083618261: 'eff', 3104230581: 'fah',
  3216997551: 'acc', 3672180440: 'ex3', 3859820991: 'bdu', 4277548013: 'ara',
  472135170:  'sho', 32350386:   'stn', 164982311:  'stg', 2086639496: 'lip',
  4136406133: 'eye', 2715668717: 'chk', 1208725833: 'fap', 2615564137: 'eym',
  2462554855: 'none', 3229833922: 'NONE',
}

export const SERIES_HASH: Record<number, string> = {
  2607418557: 'TK1', 1374241517: 'TK2', 1802801095: 'TK3', 2533226375: 'TTT',
  2337280880: 'TK4', 2080240599: 'TK5', 3084700453: 'TK6', 58512809:   'TTT2',
  2372343475: 'TKR', 1515707469: 'TK7', 2641885965: 'TK8',
}

// ---------------------------------------------------------------------------
// Display constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 100

const ITEM_POS_LABEL: Record<string, string> = {
  hed: 'Head',        har: 'Hair',         hef: 'Full-Face',
  fah: 'Face hair',   fac: 'Face',         fap: 'Face Paint',
  eye: 'Eyes',        eym: 'Eye makeup',   lip: 'Lips',
  chk: 'Cheeks',      bdu: 'Upper body',   bdf: 'Entire body',
  btm: 'Lower body',  gla: 'Glasses',      sho: 'Shoes',
  ara: 'Aura',        acc: 'Accessory',    eff: 'Hit Effect',
  stg: 'Stage',       stn: 'Suntan',
  ex0: 'Unique 1',     ex1: 'Unique 2',      ex2: 'Unique 3',   ex3: 'Unique 4',
  none: 'none',          NONE: 'NONE',
}

const ITEM_POS_COLORS: Record<string, string> = {
  hed: '#a78bfa', har: '#a78bfa', hef: '#a78bfa',
  fah: '#f9a8d4', fac: '#f9a8d4', fap: '#f9a8d4',
  eye: '#f9a8d4', eym: '#f9a8d4', lip: '#f9a8d4', chk: '#f9a8d4',
  bdu: '#60a5fa', bdf: '#60a5fa',
  btm: '#34d399', gla: '#34d399',
  sho: '#fb923c',
  ara: '#c084fc', acc: '#fbbf24', eff: '#fbbf24',
  stg: '#94a3b8', stn: '#94a3b8',
  ex0: '#64748b', ex1: '#64748b', ex2: '#64748b', ex3: '#64748b',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function posCode(hash1: number | undefined): string {
  if (hash1 === undefined || hash1 === null) return ''
  return ITEM_POS_HASH[hash1] ?? ''
}

function charLabel(h: number | undefined): string {
  if (h === undefined || h === null) return '0'
  return CHAR_HASH[h] ?? hexStr(h)
}

function hexStr(n: number | undefined | null): string {
  if (n === undefined || n === null) return '0'
  return `0x${(n >>> 0).toString(16).toUpperCase().padStart(8, '0')}`
}

function boolVal(v: boolean | undefined): string {
  return String(v ?? false)
}

function useCopyToast() {
  const [text, setText] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  function handleCellClick(e: React.MouseEvent<HTMLTableElement>) {
    const td = (e.target as HTMLElement).closest('td')
    if (!td) return
    const value = td.innerText.trim()
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

// Prefix → image mapping rules:
//   IP_/BMI_/ECI_/BEI_  →  {char}/T_UI_CUS_CH_item_{rest}.png
//   ACI_                 →  no thumbnail images exist
//   sho_f_ items         →  cmn/T_UI_CUS_CH_item_cf0_sho_f_{name}.png  (all female shoes shared)
//   sho_m_ items         →  cmn/T_UI_CUS_CH_item_cm0_sho_m_{name}.png  (all male shoes shared)
//   BEI_cmn_eye_*        →  aml/ folder (common eyes have per-char files; aml used as proxy)
//   acc items (IP_ only) →  try char folder first, fallback to cmn/ on 404
const CMN_PREFIXES = new Set(['cf0', 'cm0', 'cmn'])
// ACI_ (Aura) included — files exist as T_UI_CUS_CH_item_cmn_ara_*.png
const ASSET_PREFIXES = ['BMI_', 'ECI_', 'BEI_', 'ACI_', 'IP_'] as const

function stripPrefix(assetName: string): string | null {
  for (const p of ASSET_PREFIXES) {
    if (assetName.startsWith(p)) return assetName.slice(p.length)
  }
  return null
}

function imageUrl(assetName: string | undefined | null, charCode?: string): string | null {
  if (!assetName) return null

  // Suntan: no prefix, image is "{char}/T_UI_CUS_CH_item_{char}_suntan.png"
  if (assetName === 'Suntan') {
    const c = charCode?.toLowerCase()
    return c ? `${import.meta.env.BASE_URL}items/${c}/T_UI_CUS_CH_item_${c}_suntan.png` : null
  }

  const rest = stripPrefix(assetName)
  if (rest === null) return null

  const parts = rest.split('_')
  const char  = parts[0]
  const slot  = parts[1]

  // female shoes → cmn/cf0_sho_f_*, male shoes → cmn/cm0_sho_m_*
  if (slot === 'sho' && parts.length > 2) {
    const g = parts[2]
    if (g === 'f' || g === 'm') {
      const gChar = g === 'f' ? 'cf0' : 'cm0'
      return `${import.meta.env.BASE_URL}items/cmn/T_UI_CUS_CH_item_${gChar}_${parts.slice(1).join('_')}.png`
    }
  }

  // BEI_cmn_eye_* → per-char files only; use aml as representative
  if (assetName.startsWith('BEI_') && char === 'cmn') {
    return `${import.meta.env.BASE_URL}items/aml/T_UI_CUS_CH_item_aml_${parts.slice(1).join('_')}.png`
  }

  const folder = CMN_PREFIXES.has(char) ? 'cmn' : char
  // Stage files (stg slot) use capital 'I' in "Item"; all others use lowercase
  const fileTag = slot === 'stg' ? 'T_UI_CUS_CH_Item_' : 'T_UI_CUS_CH_item_'
  return `${import.meta.env.BASE_URL}items/${folder}/${fileTag}${rest}.png`
}

// acc fallback: shared 146 acc images live in cmn/ (e.g. cmn_acc_butterfly)
function imageAccFallback(assetName: string | undefined | null): string | null {
  if (!assetName) return null
  const rest = stripPrefix(assetName)
  if (rest === null) return null
  const parts = rest.split('_')
  if (parts.length < 3 || parts[1] !== 'acc' || CMN_PREFIXES.has(parts[0])) return null
  const name = parts.slice(2).join('_')
  return `${import.meta.env.BASE_URL}items/cmn/T_UI_CUS_CH_item_cmn_acc_${name}.png`
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
      className="flex items-center justify-between px-4 py-2.5 border-t text-xs text-slate-500 flex-shrink-0"
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

const ICON_BASE = `${import.meta.env.BASE_URL}icons/`
const ICON_BODY   = `${ICON_BASE}T_UI_CUS_CH_Icon_Body.png`
const ICON_REMOVE = `${ICON_BASE}T_UI_CUS_CH_Icon_StRemove.png`

const RARITY_COLORS = ['', 'Gray', 'Green', 'Blue', 'Purple', 'Gold'] as const
function rarityBgUrl(r: number)   { return r > 0 ? `${ICON_BASE}T_UI_CUS_CH_Rarity_${RARITY_COLORS[r]}.png`      : null }
function rarityIconUrl(r: number) { return r > 0 ? `${ICON_BASE}T_UI_CUS_CH_Rarity_Icon_${RARITY_COLORS[r]}.png` : null }

function ItemCard({ assetName, label, pos, charCode, rarity = 0 }: {
  assetName: string | undefined; label: string; pos: string; charCode?: string; rarity?: number
}) {
  const isRemove = assetName === 'REMOVE'
  const primary  = isRemove ? ICON_REMOVE : imageUrl(assetName, charCode)
  const fallback = isRemove ? null        : imageAccFallback(assetName)
  const color = ITEM_POS_COLORS[pos]
  const [errCount, setErrCount] = useState(0)

  const src = errCount === 0 ? primary
            : errCount === 1 ? (fallback ?? ICON_BODY)
            : ICON_BODY

  const bgUrl   = rarityBgUrl(rarity)
  const iconUrl = rarityIconUrl(rarity)

  return (
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

function CommonItemsTab({ data }: { data: CustomizeItemCommonEntry[] }) {
  const [charFilter, setCharFilter] = useState('')
  const [posFilter, setPosFilter] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [view, setView] = useState<ViewMode>('table')
  const { handleCellClick, copyText } = useCopyToast()

  const charOptions = useMemo(() => {
    const hashes = new Set(data.map(e => e.character_hash).filter((h): h is number => h !== undefined))
    return [...hashes].sort((a, b) => (CHAR_HASH[a] ?? 0).localeCompare(CHAR_HASH[b] ?? 0))
  }, [data])

  const posOptions = useMemo(() => {
    const codes = new Set(data.map(e => posCode(e.hash_1)).filter(Boolean))
    return [...codes].sort()
  }, [data])

  const filtered = useMemo(() => {
    const charHash = charFilter ? Number(charFilter) : null
    const lq = q.toLowerCase()
    return data.filter(e => {
      if (charHash !== null && e.character_hash !== charHash) return false
      if (posFilter && posCode(e.hash_1) !== posFilter) return false
      if (lq &&
        !(e.asset_name ?? '').toLowerCase().includes(lq) &&
        !(e.text_key ?? '').toLowerCase().includes(lq) &&
        !String(e.char_item_id).includes(lq)) return false
      return true
    })
  }, [data, charFilter, posFilter, q])

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleCharChange(v: string) { setCharFilter(v); setPage(0) }
  function handlePosChange(v: string)  { setPosFilter(v);  setPage(0) }
  function handleSearch(v: string)     { setQ(v);          setPage(0) }

  const GRID_PAGE_SIZE = 200

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3 border-b flex-wrap flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <FilterSelect value={charFilter} onChange={handleCharChange} placeholder="All Characters">
          {charOptions.map(h => (
            <option key={h} value={String(h)}>{CHAR_HASH[h] ?? hexStr(h)}</option>
          ))}
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
                const pos = posCode(e.hash_1)
                return (
                  <tr key={e.char_item_id} className="hover:bg-white/[0.03] transition-colors" style={ROW_STYLE}>
                    <td className="px-3 py-2 font-mono text-violet-300 whitespace-nowrap">{e.char_item_id}</td>
                    <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap text-right">{e.base_id ?? 0}</td>
                    <td className="px-3 py-2 font-mono text-slate-300 whitespace-nowrap" style={{ maxWidth: 220 }}>
                      <span className="block truncate">{e.asset_name ?? 0}</span>
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-300 whitespace-nowrap">{charLabel(e.character_hash)}</td>
                    <td className="px-3 py-2 whitespace-nowrap"><PosBadge pos={pos} /></td>
                    <td className="px-3 py-2 font-mono text-slate-400 whitespace-nowrap" style={{ maxWidth: 220 }}>
                      <span className="block truncate">{e.text_key ?? 0}</span>
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap" style={{ maxWidth: 200 }}>
                      <span className="block truncate">{e.extra_text_key_1 ?? 0}</span>
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap" style={{ maxWidth: 200 }}>
                      <span className="block truncate">{e.extra_text_key_2 ?? 0}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_8 ?? 0}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.shop_sort_id ?? 0}</td>
                    <td className="px-3 py-2 whitespace-nowrap" style={{ color: e.is_enabled === true ? '#34d399' : '#f87171' }}>
                      {boolVal(e.is_enabled)}
                    </td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_11 ?? 0}</td>
                    <td className="px-3 py-2 text-slate-300 whitespace-nowrap text-right">
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
                    <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap">{hexStr(e.hash_3)}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_19 ?? 0}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_20 ?? 0}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_21 ?? 0}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_22 ?? 0}</td>
                    <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap">{hexStr(e.hash_4)}</td>
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
            {filtered.slice(page * GRID_PAGE_SIZE, (page + 1) * GRID_PAGE_SIZE).map(e => (
              <ItemCard
                key={e.char_item_id}
                assetName={e.asset_name}
                label={e.asset_name?.replace(/^(?:IP|BMI|ECI|BEI|ACI)_/, '') ?? String(e.char_item_id)}
                pos={posCode(e.hash_1)}
                charCode={CHAR_HASH[e.character_hash ?? 0]}
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
        pageSize={view === 'table' ? PAGE_SIZE : GRID_PAGE_SIZE}
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
  entries, bodyEntries,
}: {
  entries: CustomizeItemUniqueEntry[]
  bodyEntries: { asset_name: string; char_item_id: number }[]
}) {
  const [charFilter, setCharFilter] = useState('')
  const [posFilter, setPosFilter] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [view, setView] = useState<ViewMode>('table')
  const { handleCellClick, copyText } = useCopyToast()

  const charOptions = useMemo(() => {
    const hashes = new Set(entries.map(e => e.character_hash).filter((h): h is number => h !== undefined))
    return [...hashes].sort((a, b) => (CHAR_HASH[a] ?? 0).localeCompare(CHAR_HASH[b] ?? 0))
  }, [entries])

  const posOptions = useMemo(() => {
    const codes = new Set(entries.map(e => posCode(e.hash_1)).filter(Boolean))
    return [...codes].sort()
  }, [entries])

  const filtered = useMemo(() => {
    const charHash = charFilter ? Number(charFilter) : null
    const lq = q.toLowerCase()
    return entries.filter(e => {
      if (charHash !== null && e.character_hash !== charHash) return false
      if (posFilter && posCode(e.hash_1) !== posFilter) return false
      if (lq &&
        !(e.asset_name ?? '').toLowerCase().includes(lq) &&
        !(e.text_key ?? '').toLowerCase().includes(lq) &&
        !String(e.char_item_id ?? 0).includes(lq)) return false
      return true
    })
  }, [entries, charFilter, posFilter, q])

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleCharChange(v: string) { setCharFilter(v); setPage(0) }
  function handlePosChange(v: string)  { setPosFilter(v);  setPage(0) }
  function handleSearch(v: string)     { setQ(v);          setPage(0) }

  const GRID_PAGE_SIZE = 200

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3 border-b flex-wrap flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <FilterSelect value={charFilter} onChange={handleCharChange} placeholder="All Characters">
          {charOptions.map(h => (
            <option key={h} value={String(h)}>{CHAR_HASH[h] ?? hexStr(h)}</option>
          ))}
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
                const pos = posCode(e.hash_1)
                return (
                  <tr key={e.char_item_id ?? i} className="hover:bg-white/[0.03] transition-colors" style={ROW_STYLE}>
                    <td className="px-3 py-2 font-mono text-violet-300 whitespace-nowrap">{e.char_item_id ?? 0}</td>
                    <td className="px-3 py-2 font-mono text-slate-300 whitespace-nowrap" style={{ maxWidth: 220 }}>
                      <span className="block truncate">{e.asset_name || ''}</span>
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-300 whitespace-nowrap">{charLabel(e.character_hash)}</td>
                    <td className="px-3 py-2 whitespace-nowrap"><PosBadge pos={pos} /></td>
                    <td className="px-3 py-2 font-mono text-slate-400 whitespace-nowrap" style={{ maxWidth: 220 }}>
                      <span className="block truncate">{e.text_key ?? 0}</span>
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap" style={{ maxWidth: 200 }}>
                      <span className="block truncate">{e.extra_text_key_1 ?? 0}</span>
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap" style={{ maxWidth: 200 }}>
                      <span className="block truncate">{e.extra_text_key_2 ?? 0}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.flag_7 ?? 0}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_8 ?? 0}</td>
                    <td className="px-3 py-2 whitespace-nowrap" style={{ color: e.flag_9 === true ? '#34d399' : '#f87171' }}>
                      {boolVal(e.flag_9)}
                    </td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_10 ?? 0}</td>
                    <td className="px-3 py-2 text-slate-300 whitespace-nowrap text-right">
                      {(e.price ?? 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_12 ?? 0}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_13 ?? 0}</td>
                    <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap">{hexStr(e.hash_2)}</td>
                    <td className="px-3 py-2 whitespace-nowrap" style={{ color: e.flag_15 === true ? '#34d399' : '#f87171' }}>
                      {boolVal(e.flag_15)}
                    </td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-right">{e.unk_16 ?? 0}</td>
                    <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap">{hexStr(e.hash_3)}</td>
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
            {filtered.slice(page * GRID_PAGE_SIZE, (page + 1) * GRID_PAGE_SIZE).map((e, i) => (
              <ItemCard
                key={e.char_item_id ?? i}
                assetName={e.asset_name}
                label={e.asset_name?.replace(/^(?:IP|BMI|ECI|BEI|ACI)_/, '') ?? String(e.char_item_id ?? i)}
                pos={posCode(e.hash_1)}
                charCode={CHAR_HASH[e.character_hash ?? 0]}
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
        <details className="border-t flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
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
        pageSize={view === 'table' ? PAGE_SIZE : GRID_PAGE_SIZE}
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

  const commonResult = useData<CustomizeItemCommonList>('customize_item_common_list')
  const uniqueResult = useData<CustomizeItemUniqueList>('customize_item_unique_list')

  const commonEntries = commonResult.data?.data?.entries ?? []
  const uniqueEntries = uniqueResult.data?.data?.entries ?? []
  const bodyEntries   = uniqueResult.data?.data?.body_entries ?? []

  const isLoading = tab === 'common' ? commonResult.loading : uniqueResult.loading
  const hasError  = tab === 'common' ? commonResult.error   : uniqueResult.error

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center border-b flex-shrink-0"
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
        <CommonItemsTab data={commonEntries} />
      )}
      {!isLoading && !hasError && tab === 'unique' && (
        <UniqueItemsTab entries={uniqueEntries} bodyEntries={bodyEntries} />
      )}
    </div>
  )
}
