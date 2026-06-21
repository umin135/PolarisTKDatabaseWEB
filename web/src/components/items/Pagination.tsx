export function Pagination({ page, total, pageSize, onChange }: {
  page: number
  total: number
  pageSize: number
  onChange: (p: number) => void
}) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null
  const start = page * pageSize + 1
  const end = Math.min((page + 1) * pageSize, total)
  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 border-t text-xs text-slate-500 shrink-0"
      style={{ borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <span>{start}–{end} of {total.toLocaleString()}</span>
      <div className="flex items-center gap-1">
        <button disabled={page === 0} onClick={() => onChange(0)}
          className="px-2 py-1 rounded disabled:opacity-30 hover:bg-white/10 transition-colors">«</button>
        <button disabled={page === 0} onClick={() => onChange(page - 1)}
          className="px-2 py-1 rounded disabled:opacity-30 hover:bg-white/10 transition-colors">‹</button>
        <span className="px-3 py-1 rounded" style={{ background: 'rgba(255,255,255,0.07)' }}>
          {page + 1} / {totalPages}
        </span>
        <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}
          className="px-2 py-1 rounded disabled:opacity-30 hover:bg-white/10 transition-colors">›</button>
        <button disabled={page >= totalPages - 1} onClick={() => onChange(totalPages - 1)}
          className="px-2 py-1 rounded disabled:opacity-30 hover:bg-white/10 transition-colors">»</button>
      </div>
    </div>
  )
}
