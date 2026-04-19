import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import { Card, Skel } from '../components/Card'
import { TopTable } from '../components/TopTable'

export default function Commands() {
  const [days, setDays] = useState(14)
  const [limit, setLimit] = useState(30)
  const q = useQuery({
    queryKey: ['top', 'zsh', days, limit],
    queryFn: () => api.top('zsh', days, limit),
    refetchInterval: 30_000,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Commands</h1>
        <p className="text-sm text-zinc-500 mt-1">Ranked by command family. Click a row to see the exact command used.</p>
      </div>

      <Card
        right={
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-2 text-zinc-400">
              days
              <input
                type="number"
                value={days}
                min={1}
                max={365}
                onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))}
                className="w-16 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 font-mono text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </label>
            <label className="flex items-center gap-2 text-zinc-400">
              limit
              <input
                type="number"
                value={limit}
                min={1}
                max={500}
                onChange={(e) => setLimit(Math.max(1, Number(e.target.value) || 1))}
                className="w-16 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 font-mono text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </label>
          </div>
        }
        title={`Top command families (last ${days} days)`}
      >
        {q.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => <Skel key={i} className="h-8 w-full" />)}
          </div>
        ) : q.data ? (
          <TopTable rows={q.data.rows} />
        ) : (
          <div className="text-sm text-red-400">Failed to load.</div>
        )}
      </Card>
    </div>
  )
}
