import { useEffect, useState } from 'react'
import { loadData } from './useData'
import { useVersion } from '../contexts/VersionContext'
import { MOVELIST_ROSTER } from '../lib/movelist'
import type { MotbinFile } from '../lib/types'

export type MotbinCatalog = Record<string, MotbinFile>

export function useMotbinCatalog(enabled: boolean): {
  data: MotbinCatalog | null
  loading: boolean
  error: string | null
  loadedCount: number
} {
  const { version } = useVersion()
  const [data, setData] = useState<MotbinCatalog | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedCount, setLoadedCount] = useState(0)

  useEffect(() => {
    if (!enabled || !version) return

    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all(
      MOVELIST_ROSTER.map(async ch => {
        try {
          const file = await loadData<MotbinFile>(`${version}/motbin/${ch.code}`)
          return [ch.code, file] as const
        } catch {
          return [ch.code, null] as const
        }
      }),
    ).then(entries => {
      if (cancelled) return
      const catalog: MotbinCatalog = {}
      let count = 0
      for (const [code, file] of entries) {
        if (!file) continue
        catalog[code] = file
        count++
      }
      setLoadedCount(count)
      setData(catalog)
      setLoading(false)
      if (count === 0) setError('No movelist data for this version')
    }).catch((e: Error) => {
      if (cancelled) return
      setLoading(false)
      setError(e.message)
    })

    return () => { cancelled = true }
  }, [enabled, version])

  return { data, loading, error, loadedCount }
}
