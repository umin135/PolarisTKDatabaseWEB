// Prefix → image mapping rules:
//   IP_/BMI_/ECI_/BEI_  →  {char}/T_UI_CUS_CH_item_{rest}.png
//   ACI_                 →  files exist as T_UI_CUS_CH_item_cmn_ara_*.png
//   sho_f_ items         →  cmn/T_UI_CUS_CH_item_cf0_sho_f_{name}.png
//   sho_m_ items         →  cmn/T_UI_CUS_CH_item_cm0_sho_m_{name}.png
//   BEI_cmn_eye_*        →  {char}/ folder (asset_name has cmn but image files are per-character)
//   acc items (IP_ only) →  try char folder first, fallback to cmn/ on 404

const CMN_PREFIXES = new Set(['cf0', 'cm0', 'cmn'])
const ASSET_PREFIXES = ['BMI_', 'ECI_', 'BEI_', 'ACI_', 'IP_'] as const

const _CDN = 'https://cdn.jsdelivr.net/gh/umin135/PolarisTKDatabaseWEB@main/res/'
export const ITEMS_BASE = import.meta.env.PROD ? `${_CDN}CUS_CH_Item/` : `${import.meta.env.BASE_URL}items/`
export const ICON_BASE  = import.meta.env.PROD ? `${_CDN}CUS_CH/`      : `${import.meta.env.BASE_URL}icons/`
export const ICON_BODY   = `${ICON_BASE}T_UI_CUS_CH_Icon_Body.png`
export const ICON_REMOVE = `${ICON_BASE}T_UI_CUS_CH_Icon_StRemove.png`

const RARITY_COLORS = ['', 'Gray', 'Green', 'Blue', 'Purple', 'Gold'] as const
export function rarityBgUrl(r: number)   { return r > 0 ? `${ICON_BASE}T_UI_CUS_CH_Rarity_${RARITY_COLORS[r]}.png`      : null }
export function rarityIconUrl(r: number) { return r > 0 ? `${ICON_BASE}T_UI_CUS_CH_Rarity_Icon_${RARITY_COLORS[r]}.png` : null }

function stripPrefix(assetName: string): string | null {
  for (const p of ASSET_PREFIXES) {
    if (assetName.startsWith(p)) return assetName.slice(p.length)
  }
  return null
}

export function imageUrl(assetName: string | undefined | null, charCode?: string): string | null {
  if (!assetName) return null

  if (assetName === 'Suntan') {
    const c = charCode?.toLowerCase()
    return c ? `${ITEMS_BASE}${c}/T_UI_CUS_CH_item_${c}_suntan.png` : null
  }

  const rest = stripPrefix(assetName)
  if (rest === null) return null

  const parts = rest.split('_')
  const char  = parts[0]
  const slot  = parts[1]

  if (slot === 'sho' && parts.length > 2) {
    const g = parts[2]
    if (g === 'f' || g === 'm') {
      const gChar = g === 'f' ? 'cf0' : 'cm0'
      return `${ITEMS_BASE}cmn/T_UI_CUS_CH_item_${gChar}_${parts.slice(1).join('_')}.png`
    }
  }

  if (assetName.startsWith('BEI_') && char === 'cmn') {
    const c = charCode?.toLowerCase()
    if (!c) return null
    return `${ITEMS_BASE}${c}/T_UI_CUS_CH_item_${c}_${parts.slice(1).join('_')}.png`
  }

  const folder = CMN_PREFIXES.has(char) ? 'cmn' : char
  const fileTag = slot === 'stg' ? 'T_UI_CUS_CH_Item_' : 'T_UI_CUS_CH_item_'
  return `${ITEMS_BASE}${folder}/${fileTag}${rest}.png`
}

export function imageAccFallback(assetName: string | undefined | null): string | null {
  if (!assetName) return null
  const rest = stripPrefix(assetName)
  if (rest === null) return null
  const parts = rest.split('_')
  if (parts.length < 3 || parts[1] !== 'acc' || CMN_PREFIXES.has(parts[0])) return null
  const name = parts.slice(2).join('_')
  return `${ITEMS_BASE}cmn/T_UI_CUS_CH_item_cmn_acc_${name}.png`
}

export function canPreviewAsset(assetName: string | undefined | null, charCode?: string): boolean {
  if (!assetName) return false
  if (assetName === 'REMOVE') return true
  if (assetName === 'Suntan') return !!charCode
  return stripPrefix(assetName) !== null
}

export function resolveItemImageSrc(
  assetName: string | undefined | null,
  charCode: string | undefined,
  errCount: number,
): string {
  const isRemove = assetName === 'REMOVE'
  const primary  = isRemove ? ICON_REMOVE : imageUrl(assetName, charCode)
  const fallback = isRemove ? null        : imageAccFallback(assetName)
  if (errCount === 0) return primary ?? ICON_BODY
  if (errCount === 1) return fallback ?? ICON_BODY
  return ICON_BODY
}
