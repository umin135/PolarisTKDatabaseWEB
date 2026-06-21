import { useState, useRef } from 'react'

export function useCopyToast() {
  const [text, setText] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  function handleCellClick(e: React.MouseEvent<HTMLTableElement>) {
    const td = (e.target as HTMLElement).closest('td')
    if (!td) return
    const value = td.dataset.value ?? td.innerText.trim()
    navigator.clipboard.writeText(value)
    clearTimeout(timer.current)
    setText(value)
    timer.current = setTimeout(() => setText(null), 1600)
  }

  return { handleCellClick, copyText: text }
}

export function CopyToast({ text }: { text: string }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm shadow-2xl pointer-events-none"
      style={{
        background: 'rgba(109,40,217,0.93)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(167,139,250,0.35)',
        color: '#ede9fe',
        animation: 'fadeSlideUp 0.15s ease-out',
      }}
    >
      <span className="text-violet-300 text-xs">Copied</span>
      <span className="font-mono text-xs text-white truncate" style={{ maxWidth: 260 }}>
        {text.length > 50 ? text.slice(0, 50) + '…' : text}
      </span>
    </div>
  )
}
