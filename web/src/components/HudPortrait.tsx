import { useEffect, useState } from 'react'
import { hudIconUrl } from '../lib/movelist'
import { clsx } from '../lib/utils'

export function HudPortrait({
  code,
  alt,
  className,
  size = 64,
}: {
  code: string
  alt?: string
  className?: string
  size?: number
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [code])

  if (failed) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center rounded-lg font-mono font-semibold text-violet-300/80',
          className,
        )}
        style={{
          width: size,
          height: size,
          fontSize: Math.max(10, size * 0.22),
          background: 'rgba(124,58,237,0.12)',
          border: '1px solid rgba(124,58,237,0.25)',
        }}
      >
        {code.toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={hudIconUrl(code)}
      alt={alt ?? code}
      width={size}
      height={size}
      className={clsx('rounded-lg object-cover object-top', className)}
      style={{ width: size, height: size, background: 'rgba(255,255,255,0.04)' }}
      onError={() => setFailed(true)}
    />
  )
}
