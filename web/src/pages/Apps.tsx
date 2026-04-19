import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import { Card, Skel } from '../components/Card'
import { TopTable } from '../components/TopTable'

export default function Apps() {
  const [days, setDays] = useState(14)
  const top = useQuery({
    queryKey: ['top', 'app_focus', days, 30],
    queryFn: () => api.top('app_focus' as any, days, 30),
    refetchInterval: 30_000,
  })
  const trans = useQuery({
    queryKey: ['transitions', days, 20],
    queryFn: () => api.transitions(days, 20),
    refetchInterval: 60_000,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Apps</h1>
        <p className="text-sm text-zinc-500 mt-1">
          App focus events and frequent transitions (A → B within 30 seconds). Rapid switches are where integrated
          shortcuts pay off.
        </p>
      </div>

      <Card
        title={`Top apps (last ${days}d)`}
        right={
          <label className="text-xs text-zinc-400 flex items-center gap-2">
            days
            <input
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 font-mono text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </label>
        }
      >
        {top.isLoading ? (
          <Skel className="h-32 w-full" />
        ) : top.data?.rows.length ? (
          <TopTable rows={top.data.rows} compact />
        ) : (
          <div className="text-sm text-zinc-500 py-4">No app-focus events yet. Daemon polls every 2.5s.</div>
        )}
      </Card>

      <Card title="Frequent app-pair transitions" right={<span className="text-xs text-zinc-500 font-mono">&lt;30s gap</span>}>
        {trans.isLoading ? (
          <Skel className="h-32 w-full" />
        ) : trans.data?.rows.length ? (
          <div className="space-y-1.5">
            {trans.data.rows.map((r, i) => {
              const max = trans.data.rows[0]?.n || 1
              return (
                <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-2 py-2 rounded-lg hover:bg-zinc-900/60">
                  <span className="text-xs font-mono text-zinc-600 w-6 text-right tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <code className="font-mono text-sm text-zinc-200 truncate">{r.prev_app}</code>
                    <span className="text-zinc-600">→</span>
                    <code className="font-mono text-sm text-zinc-200 truncate">{r.app}</code>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500/80 to-amber-400" style={{ width: `${Math.max(6, (r.n / max) * 100)}%` }} />
                    </div>
                    <span className="text-sm font-mono tabular-nums text-zinc-300">{r.n}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-sm text-zinc-500 py-4">No rapid app-switches detected yet.</div>
        )}
      </Card>
    </div>
  )
}
