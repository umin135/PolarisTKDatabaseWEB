import { useData } from './useData'
import { useVersion } from '../contexts/VersionContext'
import type { DataState } from './useData'

export function useGameData<T>(
  category: 'fbsdata' | 'localize' | 'motbin',
  name: string,
): DataState<T> {
  const { version } = useVersion()
  return useData<T>(version && name ? `${version}/${category}/${name}` : '')
}
