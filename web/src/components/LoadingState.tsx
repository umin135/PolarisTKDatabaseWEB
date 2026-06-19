export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <div
        className="w-8 h-8 rounded-full border-2 border-t-violet-500 animate-spin"
        style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#7c3aed' }}
      />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  )
}

export function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-2">
      <p className="text-red-400 font-medium">Failed to load data</p>
      <p className="text-xs text-slate-500">{error}</p>
    </div>
  )
}
