import type { TimelineBucket } from '../api'

export function TimelineHeatmap({ buckets, days = 7 }: { buckets: TimelineBucket[]; days?: number }) {
  const byKey = new Map<string, number>()
  for (const b of buckets) byKey.set(b.bucket, b.n)

  const now = new Date()
  const cells: Array<{ key: string; label: string; n: number; date: Date }> = []
  for (let d = days - 1; d >= 0; d--) {
    for (let h = 0; h < 24; h++) {
      const dt = new Date(now)
      dt.setHours(h, 0, 0, 0)
      dt.setDate(dt.getDate() - d)
      const key =
        dt.getFullYear() +
        '-' + String(dt.getMonth() + 1).padStart(2, '0') +
        '-' + String(dt.getDate()).padStart(2, '0') +
        ' ' + String(dt.getHours()).padStart(2, '0') + ':00'
      cells.push({ key, label: key, n: byKey.get(key) ?? 0, date: new Date(dt) })
    }
  }

  const max = Math.max(1, ...cells.map((c) => c.n))
  const shade = (n: number) => {
    if (n === 0) return 'bg-zinc-900/60'
    const pct = n / max
    if (pct < 0.1) return 'bg-emerald-900/40'
    if (pct < 0.25) return 'bg-emerald-800/60'
    if (pct < 0.5) return 'bg-emerald-700/80'
    if (pct < 0.75) return 'bg-emerald-600'
    return 'bg-emerald-500'
  }

  const dayLabels: string[] = []
  for (let d = days - 1; d >= 0; d--) {
    const dt = new Date(now)
    dt.setDate(dt.getDate() - d)
    dayLabels.push(dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }))
  }

  return (
    <div>
      <div className="flex items-start gap-2 overflow-x-auto pb-2">
        <div className="flex flex-col gap-1 pt-6 text-[10px] font-mono text-zinc-500 pr-2">
          {dayLabels.map((l) => (
            <div key={l} className="h-3 flex items-center">{l}</div>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex gap-[3px] text-[10px] font-mono text-zinc-600 mb-1">
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="flex-1 text-center" style={{ minWidth: 12 }}>
                {h % 6 === 0 ? String(h).padStart(2, '0') : ''}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {Array.from({ length: days }).map((_, di) => (
              <div key={di} className="flex gap-[3px]">
                {Array.from({ length: 24 }).map((_, hi) => {
                  const c = cells[di * 24 + hi]
                  return (
                    <div
                      key={hi}
                      title={`${c.label}: ${c.n} events`}
                      className={`flex-1 h-3 rounded-sm ${shade(c.n)}`}
                      style={{ minWidth: 12 }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-[10px] font-mono text-zinc-500">
        <span>less</span>
        <div className="size-3 rounded-sm bg-zinc-900/60" />
        <div className="size-3 rounded-sm bg-emerald-900/40" />
        <div className="size-3 rounded-sm bg-emerald-700/80" />
        <div className="size-3 rounded-sm bg-emerald-600" />
        <div className="size-3 rounded-sm bg-emerald-500" />
        <span>more</span>
      </div>
    </div>
  )
}
