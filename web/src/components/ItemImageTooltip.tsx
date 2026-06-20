import { useEffect, useState, type ReactNode } from 'react'
import { Tooltip } from './Tooltip'
import { canPreviewAsset, resolveItemImageSrc } from '../lib/itemImages'

const PREVIEW_SIZE = 64

function ItemTooltipImage({ assetName, charCode }: { assetName: string; charCode?: string }) {
  const [loaded, setLoaded] = useState(false)
  const [errCount, setErrCount] = useState(0)

  useEffect(() => {
    setLoaded(false)
    setErrCount(0)
  }, [assetName, charCode])

  const src = resolveItemImageSrc(assetName, charCode, errCount)

  return (
    <div
      className="relative overflow-hidden rounded"
      style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE, background: 'rgba(0,0,0,0.35)' }}
    >
      {!loaded && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400">
          Loading...
        </span>
      )}
      <img
        src={src}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-contain p-1"
        style={{ opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(false)
          setErrCount(c => Math.min(c + 1, 2))
        }}
      />
    </div>
  )
}

interface ItemImageTooltipProps {
  assetName: string | undefined | null
  charCode?: string
  children: ReactNode
}

export function ItemImageTooltip({ assetName, charCode, children }: ItemImageTooltipProps) {
  const disabled = !canPreviewAsset(assetName, charCode)

  return (
    <Tooltip
      disabled={disabled}
      variant="image"
      content={assetName ? <ItemTooltipImage assetName={assetName} charCode={charCode} /> : null}
    >
      {children}
    </Tooltip>
  )
}
