import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Card, StatCard, Skel } from '../components/Card'
import { TopTable } from '../components/TopTable'
import { TimelineHeatmap } from '../components/TimelineHeatmap'

function formatUptime(seconds: number) {
  if (!seconds || seconds < 0) return '—'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${seconds % 60}s`
  return `${seconds}s`
}

function relTime(ts: number | null | undefined) {
  if (!ts) return 'never'
  const diff = Date.now() / 1000 - ts
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Dashboard() {
  const status = useQuery({ queryKey: ['status'], queryFn: api.status, refetchInterval: 5_000 })
  const top = useQuery({ queryKey: ['top', 'zsh', 14, 8], queryFn: () => api.top('zsh', 14, 8), refetchInterval: 30_000 })
  const timeline = useQuery({ queryKey: ['timeline', 'zsh', 7], queryFn: () => api.timeline('zsh', 7), refetchInterval: 30_000 })

  const totalZsh = status.data?.events_by_type['zsh'] ?? 0
  const lastZsh = status.data?.last_event_ts_by_type['zsh']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Passive activity monitor. Collects what you do so you can decide what deserves a Stream Deck button.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Daemon"
          value={
            status.isLoading ? (
              <Skel className="h-8 w-20" />
            ) : status.isError ? (
              <span className="inline-flex items-center gap-2 text-xl text-red-400">
                <span className="size-2 rounded-full bg-red-500" />offline
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-xl text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />online
              </span>
            )
          }
          hint={status.data ? `uptime ${formatUptime(status.data.uptime_seconds)}` : undefined}
        />
        <StatCard
          label="Zsh events"
          value={status.isLoading ? <Skel className="h-8 w-20" /> : totalZsh.toLocaleString()}
          hint={`last: ${relTime(lastZsh)}`}
        />
        <StatCard
          label="App events"
          value={status.data?.events_by_type['app_focus']?.toLocaleString() ?? '0'}
          hint="M3 — coming soon"
          accent="text-zinc-500"
        />
        <StatCard
          label="Browser events"
          value={status.data?.events_by_type['browser']?.toLocaleString() ?? '0'}
          hint="M4 — coming soon"
          accent="text-zinc-500"
        />
      </div>

      <Card title="Activity — last 7 days" right={<span className="text-xs text-zinc-500 font-mono">zsh</span>}>
        {timeline.isLoading ? (
          <Skel className="h-32 w-full" />
        ) : timeline.data ? (
          <TimelineHeatmap buckets={timeline.data.buckets} days={7} />
        ) : (
          <div className="text-sm text-red-400">Failed to load timeline.</div>
        )}
      </Card>

      <Card
        title="Top commands (last 14 days)"
        right={
          <Link to="/commands" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">View all →</Link>
        }
      >
        {top.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skel key={i} className="h-8 w-full" />)}
          </div>
        ) : top.data ? (
          <TopTable rows={top.data.rows} />
        ) : (
          <div className="text-sm text-red-400">Failed to load.</div>
        )}
      </Card>
    </div>
  )
}
