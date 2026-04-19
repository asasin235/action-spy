import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import { Card, Skel } from '../components/Card'
import { TopTable } from '../components/TopTable'

export default function Browsers() {
  const [days, setDays] = useState(14)
  const q = useQuery({
    queryKey: ['top', 'browser', days, 30],
    queryFn: () => api.top('browser', days, 30),
    refetchInterval: 60_000,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Browsers</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Hostnames + path patterns visited across Chrome, Safari, and Arc. Numeric IDs in paths are collapsed to{' '}
          <code className="text-zinc-400 font-mono">:id</code>. Safari needs Full Disk Access.
        </p>
      </div>

      <Card
        title={`Top browser hosts (last ${days}d)`}
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
        {q.isLoading ? (
          <Skel className="h-32 w-full" />
        ) : q.data?.rows.length ? (
          <TopTable rows={q.data.rows} />
        ) : (
          <div className="text-sm text-zinc-500 py-4">No browser events yet — daemon scans every 3 minutes; Safari needs Full Disk Access.</div>
        )}
      </Card>
    </div>
  )
}
