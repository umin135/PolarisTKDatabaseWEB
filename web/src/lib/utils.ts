export function fmtHash(n: number): string {
  return `0x${(n >>> 0).toString(16).padStart(8, '0').toUpperCase()}`
}

export function fmtBool(v: boolean): string {
  return v ? '✓' : '–'
}

export function clsx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function pluralize(n: number, word: string): string {
  return `${n.toLocaleString()} ${word}${n !== 1 ? 's' : ''}`
}
