import { useData } from './useData'
import { useVersion } from '../contexts/VersionContext'
import type { DataState } from './useData'

export function useGameData<T>(
  category: 'fbsdata' | 'localize',
  name: string,
): DataState<T> {
  const { version } = useVersion()
  return useData<T>(version ? `${version}/${category}/${name}` : '')
}
