import { useState } from 'react'
import { useGameData } from '../hooks/useGameData'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { clsx } from '../lib/utils'
import type {
  CustomizeItemCommonList,
  CustomizeItemUniqueList,
  LocDict,
} from '../lib/types'
import { CommonItemsTab } from '../components/items/CommonItemsTab'
import { UniqueItemsTab } from '../components/items/UniqueItemsTab'

type Tab = 'common' | 'unique'

export function ItemsPage() {
  const [tab, setTab] = useState<Tab>('common')

  const commonResult = useGameData<CustomizeItemCommonList>('fbsdata', 'customize_item_common_list')
  const uniqueResult = useGameData<CustomizeItemUniqueList>('fbsdata', 'customize_item_unique_list')
  const locResult = useGameData<LocDict>('localize', 'loc_en')

  const commonEntries = commonResult.data?.data?.entries ?? []
  const uniqueEntries = uniqueResult.data?.data?.entries ?? []
  const bodyEntries = uniqueResult.data?.data?.body_entries ?? []
  const loc = locResult.data ?? {}

  const isLoading = tab === 'common' ? commonResult.loading : uniqueResult.loading
  const hasError = tab === 'common' ? commonResult.error : uniqueResult.error

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center border-b shrink-0"
        style={{
          background: 'rgba(15,15,22,0.95)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(255,255,255,0.07)',
        }}
      >
        {([
          ['common', 'Common Items', commonEntries.length],
          ['unique', 'Unique Items', uniqueEntries.length],
        ] as [Tab, string, number][]).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              'flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all duration-150',
              tab === key
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-500 hover:text-slate-300',
            )}
          >
            {label}
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{
                background: tab === key ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                color: tab === key ? '#a78bfa' : '#64748b',
              }}
            >
              {count > 0 ? count.toLocaleString() : '…'}
            </span>
          </button>
        ))}
      </div>

      {isLoading && <LoadingState message={`Loading ${tab} items…`} />}
      {hasError && <ErrorState error={hasError} />}

      {!isLoading && !hasError && tab === 'common' && (
        <CommonItemsTab data={commonEntries} loc={loc} />
      )}
      {!isLoading && !hasError && tab === 'unique' && (
        <UniqueItemsTab entries={uniqueEntries} bodyEntries={bodyEntries} loc={loc} />
      )}
    </div>
  )
}
