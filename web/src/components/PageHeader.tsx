interface PageHeaderProps {
  title: string
  description?: string
  count?: number
  children?: React.ReactNode
}

export function PageHeader({ title, description, count, children }: PageHeaderProps) {
  return (
    <div
      className="sticky top-0 z-10 px-6 py-4 border-b flex items-center gap-4"
      style={{
        background: 'rgba(15,15,22,0.95)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span
              className="text-xs font-normal px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}
            >
              {count.toLocaleString()}
            </span>
          )}
        </h1>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}
