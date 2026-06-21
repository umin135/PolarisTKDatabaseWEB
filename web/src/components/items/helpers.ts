import type { LocDict } from '../../lib/types'
import { CHARACTERS } from '../../lib/constants'

export const TH = 'px-3 py-2.5 text-left font-medium text-slate-400 border-b whitespace-nowrap'
export const TH_STYLE = { borderColor: 'rgba(255,255,255,0.07)' }
export const ROW_STYLE = { borderBottom: '1px solid rgba(255,255,255,0.04)' }

export function boolVal(v: boolean | undefined): string {
  return v ? 'True' : 'False'
}

export function boolColor(v: boolean | undefined): string {
  return v === true ? '#34d399' : '#f87171'
}

export function resolveLoc(key: string | undefined | null, loc: LocDict): string {
  if (!key) return ''
  return loc[key] ?? key
}

export function getGameVersion(version?: number): string {
  if (!version) return '–'
  if (version === 100) return '1.00.00'
  const str = version.toString().padStart(5, '0')
  const major = Number(str[0])
  const minor = str.slice(1, 3)
  const patch = str.slice(3, 5)
  return `${major}.${minor}.${patch}`
}

export function getCharHashOptions(hashes: Iterable<number | undefined>): number[] {
  const set = new Set<number>()
  for (const h of hashes) {
    if (h !== undefined) set.add(h)
  }
  return [...set].sort((a, b) => {
    const fa = CHARACTERS[a]?.fighterId ?? Number.MAX_SAFE_INTEGER
    const fb = CHARACTERS[b]?.fighterId ?? Number.MAX_SAFE_INTEGER
    return fa - fb
  })
}

export function itemLabel(
  textKey: string | undefined,
  assetName: string | undefined,
  fallback: string | number,
  loc: LocDict,
): string {
  return (
    resolveLoc(textKey, loc)
    || assetName?.replace(/^(?:IP|BMI|ECI|BEI|ACI)_/, '')
    || String(fallback)
  )
}
