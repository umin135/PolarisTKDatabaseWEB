import { useState, useEffect } from 'react'

export type DataState<T> = { data: T | null; loading: boolean; error: string | null }

const cache = new Map<string, unknown>()
const inflight = new Map<string, Promise<unknown>>()

function dataUrl(name: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/data/${name}.json`
}

export function loadData<T>(name: string): Promise<T> {
  if (cache.has(name)) return Promise.resolve(cache.get(name) as T)

  const existing = inflight.get(name)
  if (existing) return existing as Promise<T>

  const promise = fetch(dataUrl(name))
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    })
    .then((d: T) => {
      cache.set(name, d)
      inflight.delete(name)
      return d
    })
    .catch((err: Error) => {
      inflight.delete(name)
      throw err
    })

  inflight.set(name, promise)
  return promise
}

export function useData<T>(name: string): DataState<T> {
  const [state, setState] = useState<DataState<T>>({ data: null, loading: true, error: null })

  useEffect(() => {
    if (!name) return

    if (cache.has(name)) {
      setState({ data: cache.get(name) as T, loading: false, error: null })
      return
    }

    let cancelled = false
    setState({ data: null, loading: true, error: null })
    loadData<T>(name)
      .then(d => {
        if (!cancelled) setState({ data: d, loading: false, error: null })
      })
      .catch((e: Error) => {
        if (!cancelled) setState({ data: null, loading: false, error: e.message })
      })

    return () => { cancelled = true }
  }, [name])

  return state
}
