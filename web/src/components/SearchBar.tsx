import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div className="relative flex items-center">
      <Search size={14} className="absolute left-3 text-slate-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-8 py-1.5 text-sm rounded-lg outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#e2e8f0',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}
