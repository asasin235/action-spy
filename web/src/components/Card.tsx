import type { ReactNode } from 'react'

export function Card({ title, children, right, className = '' }: {
  title?: string
  right?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-xl border border-zinc-900 bg-zinc-950 ${className}`}>
      {title && (
        <header className="flex items-center justify-between px-5 py-3 border-b border-zinc-900">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-300">{title}</h2>
          {right}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

export function StatCard({ label, value, hint, accent = 'text-zinc-100' }: {
  label: string
  value: ReactNode
  hint?: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5">
      <div className="text-xs uppercase tracking-wider text-zinc-500 font-medium">{label}</div>
      <div className={`mt-2 text-3xl font-semibold font-mono tabular-nums ${accent}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
    </div>
  )
}

export function Skel({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-zinc-900 ${className}`} />
}
