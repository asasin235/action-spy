import { Card } from '../components/Card'

export default function Browsers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Browsers</h1>
        <p className="text-sm text-zinc-500 mt-1">Repeat URL visits from Chrome, Safari, and Arc land here in M4.</p>
      </div>
      <Card>
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="size-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 text-xl">
            ⏳
          </div>
          <h2 className="text-lg font-semibold">Coming in M4</h2>
          <p className="text-sm text-zinc-500 mt-2 max-w-md">
            The browser collector copies Chrome/Safari/Arc history SQLite files to a temp location (to avoid
            read locks) and scans for visits since the last checkpoint. Needs Full Disk Access.
          </p>
        </div>
      </Card>
    </div>
  )
}
