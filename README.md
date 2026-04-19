# action-spy

A personal macOS activity monitor. It passively tracks your repetitive actions — shell commands, app switches, URL visits — then ranks them so you can decide what deserves a button on your Stream Deck / macro pad.

Think JetBrains Key Promoter X ("you missed a shortcut"), but for the whole operating system.

## Status

**Milestone 1: zsh history collector** — working. App focus and browser collectors land in M2 and M3.

## Install

```bash
git clone git@github.com:asasin235/action-spy.git
cd action-spy
npm install
```

This project targets macOS (Ventura+) on Apple Silicon. Runtime is Node 20+.

One-time setup — enable zsh extended history so new commands get real timestamps (existing ones fall back to the file's mtime):

```bash
echo 'setopt EXTENDED_HISTORY' >> ~/.zshrc
```

## CLI

```
actionspy start [--foreground]   # start the daemon (default: supervised by pm2)
actionspy stop                   # stop the daemon (via pm2)
actionspy status                 # pm2 status + last-event timestamps per type
actionspy doctor                 # check permissions, deps, DB, history format
actionspy top zsh   [--days N] [--limit N] [--json]
actionspy top app   [--days N] [--limit N] [--json]
actionspy top browser [--days N] [--limit N] [--json]
actionspy report   [--days N] [--json]     # M4 — not implemented yet
actionspy suggest  [--days N] [--json]     # M4 — not implemented yet
```

### Running it

For a quick test without pm2:

```bash
node bin/actionspy start --foreground
```

Under pm2 (will auto-restart on crash):

```bash
node bin/actionspy start
pm2 save && pm2 startup   # one-time, for reboot survival
```

## How it works

- **Collectors**: pluggable modules that watch one source each — zsh history (file offset + dedup), app focus (AppleScript poll, change-detect), browser history (SQLite, copy-to-temp incremental scan).
- **Storage**: one `events` table in `data/actionspy.db` (SQLite via `better-sqlite3`) with a `type` discriminator and a pre-normalized `subject` column so `GROUP BY subject` stays fast.
- **Analysis**: runs on demand from the CLI. The daemon never runs analysis — it just collects.
- **Daemon**: single Node process, three timers, supervised by pm2.

## Project layout

```
bin/actionspy               entry shebang
src/cli/                    commander subcommands
src/daemon/                 main loop + scheduler
src/collectors/             zsh, app-focus (M2), browser (M3)
src/analysis/               normalization + scoring (M4)
src/db.js                   schema, migrations, insertEvent
src/config.js               paths, intervals, tunables
src/util/                   osascript wrapper, epoch conversions, sqlite copy
data/                       runtime (gitignored): DB, log, tmp
```

## Permissions

The daemon may need:

- **Full Disk Access** — to read Chrome/Safari/Arc history DBs.
- **Accessibility** — to let AppleScript query the frontmost app via System Events.

Grant them in System Settings → Privacy & Security. `actionspy doctor` will tell you which binaries to add (spoiler: your `node` from nvm, not `/usr/bin/node`).

## Data retention

Everything lives in `data/actionspy.db` and `data/actionspy.log` — both gitignored. Delete either any time; the collectors rebuild their cursors from the DB on next tick.

## License

Private / personal — not licensed for redistribution.
