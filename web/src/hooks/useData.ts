import { useState, useEffect } from 'react'

export type DataState<T> = { data: T | null; loading: boolean; error: string | null }

const cache = new Map<string, unknown>()

export function useData<T>(name: string): DataState<T> {
  const [state, setState] = useState<DataState<T>>({ data: null, loading: true, error: null })

  useEffect(() => {
    if (!name) return

    if (cache.has(name)) {
      setState({ data: cache.get(name) as T, loading: false, error: null })
      return
    }

    const base = import.meta.env.BASE_URL.replace(/\/$/, '')
    fetch(`${base}/data/${name}.json`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d: T) => {
        cache.set(name, d)
        setState({ data: d, loading: false, error: null })
      })
      .catch((e: Error) => setState({ data: null, loading: false, error: e.message }))
  }, [name])

  return state
}
