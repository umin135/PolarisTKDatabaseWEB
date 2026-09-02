import { CHARACTERS } from './constants'
import { hexStr } from './common'
import type { MotbinFile, MotbinMove } from './types'

const SKIP_CODES = new Set(['DEK', 'CMN', 'LAST'])
const HUD_CDN = 'https://cdn.jsdelivr.net/gh/umin135/PolarisTKDatabaseWEB@main/res/HUD_Character_Icon_L/'

export interface MovelistChar {
  code: string
  displayCode: string
  fighterId: number
  name: string
}

export const MOVELIST_ROSTER: MovelistChar[] = Object.values(CHARACTERS)
  .filter(c => c.fighterId !== undefined && !SKIP_CODES.has(c.code))
  .map(c => ({
    code: c.code.toLowerCase(),
    displayCode: c.code,
    fighterId: c.fighterId as number,
    name: c.name ?? c.code,
  }))
  .sort((a, b) => a.fighterId - b.fighterId)

const ROSTER_BY_CODE = new Map(MOVELIST_ROSTER.map(c => [c.code, c]))

export function getMovelistChar(code: string): MovelistChar | undefined {
  return ROSTER_BY_CODE.get(code.toLowerCase())
}

export function isHiddenMovelistCode(code: string): boolean {
  return SKIP_CODES.has(code.toUpperCase())
}

export function hudIconUrl(code: string): string {
  code = code === 'xxe' ? 'swl3' : code
  const file = `T_UI_HUD_Character_Icon_L_${code.toLowerCase()}.png`
  if (import.meta.env.PROD) return `${HUD_CDN}${file}`
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/hud/${file}`
}

export function unrestoredLabel(length: number): string {
  return `Unrestored string of length ${length}`
}

export type SearchField = 'move' | 'anim'
export type MatchField = 'name' | 'anim' | 'name_key' | 'anim_name_key' | 'anim_key'

export interface ParsedQuery {
  raw: string
  text: string
  hash: number | null
  ready: boolean
}

export function parseSearchField(v: string | null | undefined): SearchField {
  return v === 'move' ? 'move' : 'anim'
}

export function parseMoveQuery(raw: string): ParsedQuery {
  const trimmed = raw.trim()
  if (!trimmed) return { raw: trimmed, text: '', hash: null, ready: false }
  const hash = parseHashQuery(trimmed)
  const ready = hash !== null || trimmed.length >= 2
  return { raw: trimmed, text: trimmed, hash, ready }
}

function parseHashQuery(q: string): number | null {
  if (/^0x[0-9a-f]+$/i.test(q)) return toUint32(Number.parseInt(q, 16))
  if (/^\d+$/.test(q)) return toUint32(Number.parseInt(q, 10))
  if (/^[0-9a-f]+$/i.test(q) && /[a-f]/i.test(q) && q.length <= 8) {
    return toUint32(Number.parseInt(q, 16))
  }
  return null
}

function toUint32(n: number): number | null {
  if (!Number.isFinite(n)) return null
  return n >>> 0
}

function containsText(haystack: string | null, needle: string, caseSensitive: boolean): boolean {
  if (!haystack || !needle) return false
  if (caseSensitive) return haystack.includes(needle)
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

export function matchMove(
  move: MotbinMove,
  query: ParsedQuery,
  field: SearchField,
  caseSensitive: boolean,
): MatchField[] {
  if (!query.ready) return []
  const fields: MatchField[] = []

  if (field === 'move') {
    if (containsText(move.name, query.text, caseSensitive)) fields.push('name')
    if (query.hash !== null && u32(move.name_key) === query.hash) fields.push('name_key')
  } else {
    if (containsText(move.anim_name, query.text, caseSensitive)) fields.push('anim')
    if (query.hash !== null) {
      if (u32(move.anim_name_key) === query.hash) fields.push('anim_name_key')
      if (move.anim_key != null && u32(move.anim_key) === query.hash) fields.push('anim_key')
    }
  }

  return fields
}

function u32(n: number): number {
  return n >>> 0
}

export function identityKey(move: MotbinMove, field: SearchField): string {
  if (field === 'anim') {
    return move.anim_name ? `n:${move.anim_name}` : `k:${u32(move.anim_name_key)}`
  }
  return move.name ? `n:${move.name}` : `k:${u32(move.name_key)}`
}

export function identityMeta(move: MotbinMove, field: SearchField): {
  value: string | null
  length: number
  hash: number
} {
  if (field === 'anim') {
    return { value: move.anim_name, length: move.anim_name_length, hash: u32(move.anim_name_key) }
  }
  return { value: move.name, length: move.name_length, hash: u32(move.name_key) }
}

export interface UsageHit {
  ch: MovelistChar
  index: number
  move: MotbinMove
  fields: MatchField[]
}

export interface UsageGroup {
  key: string
  value: string | null
  length: number
  hash: number
  usages: UsageHit[]
  characterCount: number
}

export function collectUsageGroups(
  catalog: Record<string, MotbinFile>,
  query: ParsedQuery,
  field: SearchField,
  caseSensitive: boolean,
): UsageGroup[] {
  const map = new Map<string, UsageGroup>()

  for (const ch of MOVELIST_ROSTER) {
    const file = catalog[ch.code]
    if (!file) continue
    for (let i = 0; i < file.moves.length; i++) {
      const move = file.moves[i]
      const fields = matchMove(move, query, field, caseSensitive)
      if (fields.length === 0) continue
      const key = identityKey(move, field)
      let group = map.get(key)
      if (!group) {
        const meta = identityMeta(move, field)
        group = { key, ...meta, usages: [], characterCount: 0 }
        map.set(key, group)
      }
      group.usages.push({ ch, index: i, move, fields })
    }
  }

  for (const g of map.values()) {
    g.usages.sort((a, b) => {
      if (a.ch.fighterId !== b.ch.fighterId) return a.ch.fighterId - b.ch.fighterId
      return a.index - b.index
    })
    const seen = new Set<string>()
    for (const u of g.usages) seen.add(u.ch.code)
    g.characterCount = seen.size
  }

  return [...map.values()].sort((a, b) => {
    if (b.usages.length !== a.usages.length) return b.usages.length - a.usages.length
    return (a.value ?? '').localeCompare(b.value ?? '')
  })
}

export function formatHash(n: number | null | undefined): string {
  if (n === null || n === undefined) return '–'
  return hexStr(n)
}

export const MATCH_FIELD_LABEL: Record<MatchField, string> = {
  name: 'Name',
  anim: 'Anim',
  name_key: 'Name Key',
  anim_name_key: 'Anim Name Key',
  anim_key: 'Anim Key',
}
