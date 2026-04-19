import type { TopRow } from '../api'

export function TopTable({ rows, compact = false }: { rows: TopRow[]; compact?: boolean }) {
  if (!rows.length) {
    return <div className="text-sm text-zinc-500">No events yet.</div>
  }
  const max = rows[0]?.n || 1
  return (
    <div className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
            <th className="pb-3 font-medium">Subject</th>
            <th className="pb-3 font-medium text-right w-16">Count</th>
            {!compact && <th className="pb-3 pl-6 font-medium">Example</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-zinc-900">
              <td className="py-2.5 pr-3">
                <div className="flex items-center gap-3">
                  <code className="font-mono text-zinc-200 text-[13px]">{r.subject || '—'}</code>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-zinc-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500/80 to-emerald-400"
                    style={{ width: `${Math.max(4, (r.n / max) * 100)}%` }}
                  />
                </div>
              </td>
              <td className="py-2.5 text-right text-zinc-300 font-mono tabular-nums align-top">{r.n}</td>
              {!compact && (
                <td className="py-2.5 pl-6 align-top">
                  <code className="font-mono text-xs text-zinc-500 block truncate max-w-md" title={r.example || ''}>
                    {r.example || '—'}
                  </code>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
