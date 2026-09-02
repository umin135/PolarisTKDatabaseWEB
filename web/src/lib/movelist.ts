import { CHARACTERS } from './constants'
import { hexStr } from './common'
import type { MotbinMove } from './types'

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
  code = code === 'xxe' ? 'swl3' : code;
  const file = `T_UI_HUD_Character_Icon_L_${code.toLowerCase()}.png`
  if (import.meta.env.PROD) return `${HUD_CDN}${file}`
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/hud/${file}`
}

export function unrestoredLabel(length: number): string {
  return `Unrestored string of length ${length}`
}

export type MatchField = 'name' | 'anim' | 'name_key' | 'anim_name_key' | 'anim_key'

export interface ParsedQuery {
  raw: string
  text: string
  hash: number | null
  ready: boolean
}

export function parseMoveQuery(raw: string): ParsedQuery {
  const trimmed = raw.trim()
  if (!trimmed) return { raw: trimmed, text: '', hash: null, ready: false }
  const hash = parseHashQuery(trimmed)
  const ready = hash !== null || trimmed.length >= 2
  return { raw: trimmed, text: trimmed.toLowerCase(), hash, ready }
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

export function matchMove(move: MotbinMove, query: ParsedQuery): MatchField[] {
  if (!query.ready) return []
  const fields: MatchField[] = []
  if (query.text) {
    if (move.name?.toLowerCase().includes(query.text)) fields.push('name')
    if (move.anim_name?.toLowerCase().includes(query.text)) fields.push('anim')
  }
  if (query.hash !== null) {
    if (u32(move.name_key) === query.hash) fields.push('name_key')
    if (u32(move.anim_name_key) === query.hash) fields.push('anim_name_key')
    if (move.anim_key != null && u32(move.anim_key) === query.hash) fields.push('anim_key')
  }
  return fields
}

function u32(n: number): number {
  return n >>> 0
}

export type GroupKind = 'name_key' | 'anim_name_key' | 'anim_key'

export function groupingForFields(fields: MatchField[]): GroupKind {
  if (fields.includes('anim_key')) return 'anim_key'
  if (fields.includes('name_key') || fields.includes('name')) return 'name_key'
  return 'anim_name_key'
}

export function groupId(move: MotbinMove, kind: GroupKind): number {
  if (kind === 'anim_key') return u32(move.anim_key ?? 0)
  if (kind === 'anim_name_key') return u32(move.anim_name_key)
  return u32(move.name_key)
}

export function formatHash(n: number | null | undefined): string {
  if (n === null || n === undefined) return '–'
  return hexStr(n)
}

export const MATCH_FIELD_LABEL: Record<MatchField, string> = {
  name: 'name',
  anim: 'anim',
  name_key: 'name_key',
  anim_name_key: 'anim_name_key',
  anim_key: 'anim_key',
}
