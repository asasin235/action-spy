import { Card } from '../components/Card'

export default function Apps() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Apps</h1>
        <p className="text-sm text-zinc-500 mt-1">App focus events will show up here once the M3 collector is wired in.</p>
      </div>
      <Card>
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="size-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 text-xl">
            ⏳
          </div>
          <h2 className="text-lg font-semibold">Coming in M3</h2>
          <p className="text-sm text-zinc-500 mt-2 max-w-md">
            The app-focus collector polls <code className="font-mono text-zinc-300">osascript</code> every 2.5s
            to detect which app is frontmost. Once it lands, this page will show your most-used apps and the
            transition pairs between them.
          </p>
        </div>
      </Card>
    </div>
  )
}
