import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  disabled?: boolean
  variant?: 'text' | 'image'
}

const TOOLTIP_OFFSET = 8

export function Tooltip({ content, children, disabled, variant = 'text' }: TooltipProps) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const updatePosition = useCallback(() => {
    const el = anchorRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos({
      x: rect.left + rect.width / 2,
      y: rect.top - TOOLTIP_OFFSET,
    })
  }, [])

  const show = useCallback(() => {
    if (disabled || content == null || content === false) return
    updatePosition()
    setVisible(true)
  }, [content, disabled, updatePosition])

  const hide = useCallback(() => setVisible(false), [])

  useEffect(() => {
    if (!visible) return
    const onScroll = () => hide()
    window.addEventListener('scroll', onScroll, true)
    return () => window.removeEventListener('scroll', onScroll, true)
  }, [hide, visible])

  return (
    <>
      <div
        ref={anchorRef}
        className="min-w-0"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </div>

      {visible && createPortal(
        <div
          role="tooltip"
          className={
            variant === 'image'
              ? 'fixed z-50 pointer-events-none p-1 rounded-lg shadow-xl'
              : 'fixed z-50 pointer-events-none px-2.5 py-1.5 rounded-lg text-[11px] font-mono shadow-xl'
          }
          style={{
            left: pos.x,
            top: pos.y,
            transform: 'translate(-50%, -100%)',
            maxWidth: variant === 'image' ? undefined : 320,
            background: 'rgba(15,15,22,0.97)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(167,139,250,0.35)',
            color: '#e2e8f0',
            wordBreak: variant === 'image' ? undefined : 'break-all',
          }}
        >
          {content}
          <span
            aria-hidden
            className="absolute left-1/2 top-full -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid rgba(167,139,250,0.35)',
            }}
          />
        </div>,
        document.body,
      )}
    </>
  )
}
