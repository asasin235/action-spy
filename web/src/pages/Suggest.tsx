import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import { Card, Skel } from '../components/Card'
import type { SuggestRow } from '../api'

const KIND_COLOR: Record<SuggestRow['kind'], string> = {
  'command': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  'url':     'bg-sky-500/15     text-sky-300     border-sky-500/20',
  'app-pair':'bg-amber-500/15   text-amber-300   border-amber-500/20',
}

function KindPill({ kind }: { kind: SuggestRow['kind'] }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] uppercase font-mono tracking-wider ${KIND_COLOR[kind]}`}>
      {kind}
    </span>
  )
}

export default function Suggest() {
  const q = useQuery({ queryKey: ['suggest', 14, 25], queryFn: () => api.suggest(14, 25), refetchInterval: 60_000 })

  const maxScore = q.data?.rows[0]?.score ?? 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stream Deck candidates</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Ranked by frequency, persistence across days, and recency. The top rows are the actions most worth mapping
          to a physical button.
        </p>
      </div>

      <Card title="Ranked suggestions" right={<span className="text-xs text-zinc-500 font-mono">last 14 days</span>}>
        {q.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skel key={i} className="h-10 w-full" />)}
          </div>
        ) : !q.data || !q.data.rows.length ? (
          <div className="text-sm text-zinc-500 py-8 text-center">
            Not enough data yet — let the daemon collect for a few days and come back.
          </div>
        ) : (
          <div className="space-y-1.5">
            {q.data.rows.map((r, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-900/60 transition-colors">
                <span className="text-xs font-mono text-zinc-600 tabular-nums w-6 text-right">{String(i + 1).padStart(2, '0')}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <KindPill kind={r.kind} />
                    <code className="font-mono text-sm text-zinc-200 truncate">{r.what}</code>
                  </div>
                  {r.example && r.example !== r.what && (
                    <div className="mt-1 font-mono text-xs text-zinc-500 truncate" title={r.example}>
                      {r.example}
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-zinc-500 tabular-nums font-mono whitespace-nowrap">
                  {r.count}× · {r.days}d
                </div>
                <div className="w-20">
                  <div className="h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500/80 to-emerald-400"
                      style={{ width: `${Math.max(6, (r.score / maxScore) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] font-mono text-zinc-600 text-right tabular-nums">{r.score.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="text-xs text-zinc-600 leading-relaxed">
        <span className="font-mono">score = log1p(count) × min(days, 14)/14 × recency</span>. Commands are normalized to families
        (e.g. <code className="text-zinc-400 font-mono">docker restart *</code>). URLs are host + path pattern.
      </div>
    </div>
  )
}
