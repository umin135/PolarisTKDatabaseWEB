import { createContext, useContext, useState, useEffect } from 'react'
import { useData } from '../hooks/useData'
import type { GameVersion, GameVersions } from '../lib/types'

interface VersionCtx {
  version: string
  setVersion: (v: string) => void
  versions: GameVersion[]
}

const VersionContext = createContext<VersionCtx>({
  version: '',
  setVersion: () => {},
  versions: [],
})

export function useVersion(): VersionCtx {
  return useContext(VersionContext)
}

export function VersionProvider({ children }: { children: React.ReactNode }) {
  const { data } = useData<GameVersions>('GameVersions')
  const [version, setVersion] = useState('')

  useEffect(() => {
    if (data && !version) setVersion(data.latest)
  }, [data, version])

  return (
    <VersionContext.Provider value={{ version, setVersion, versions: data?.versions ?? [] }}>
      {children}
    </VersionContext.Provider>
  )
}
