import { NavLink, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Commands from './pages/Commands'
import Apps from './pages/Apps'
import Browsers from './pages/Browsers'
import Suggest from './pages/Suggest'

function Nav() {
  const base = 'px-3 py-1.5 rounded-md text-sm font-medium transition-colors'
  const active = 'bg-zinc-800 text-zinc-100'
  const inactive = 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
  const cls = ({ isActive }: { isActive: boolean }) =>
    `${base} ${isActive ? active : inactive}`

  return (
    <nav className="flex items-center gap-1">
      <NavLink to="/" end className={cls}>Dashboard</NavLink>
      <NavLink to="/suggest" className={cls}>Suggest</NavLink>
      <NavLink to="/commands" className={cls}>Commands</NavLink>
      <NavLink to="/apps" className={cls}>Apps</NavLink>
      <NavLink to="/browsers" className={cls}>Browsers</NavLink>
    </nav>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 font-bold text-sm">A</div>
            <span className="font-semibold tracking-tight">action-spy</span>
            <span className="text-xs text-zinc-500 font-mono ml-1">localhost:3046</span>
          </div>
          <Nav />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/suggest" element={<Suggest />} />
          <Route path="/commands" element={<Commands />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/browsers" element={<Browsers />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}
