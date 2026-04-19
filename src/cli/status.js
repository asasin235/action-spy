import { execSync } from 'node:child_process';
import { openDb } from '../db.js';

export async function run() {
  let pm2Info = null;
  try {
    const out = execSync(`pm2 jlist`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    const all = JSON.parse(out);
    if (Array.isArray(all)) pm2Info = all.find((p) => p.name === 'actionspy') || null;
  } catch {
    /* pm2 not installed or not running */
  }

  if (pm2Info) {
    const status = pm2Info.pm2_env?.status || 'unknown';
    const uptime = pm2Info.pm2_env?.pm_uptime
      ? Math.floor((Date.now() - pm2Info.pm2_env.pm_uptime) / 1000) + 's'
      : '?';
    console.log(`pm2: status=${status} uptime=${uptime} restarts=${pm2Info.pm2_env?.restart_time ?? 0}`);
  } else {
    console.log('pm2: not registered');
  }

  const db = openDb();
  const lastByType = db.prepare(`
    SELECT type, COUNT(*) n, MAX(ts) last_ts
    FROM events GROUP BY type ORDER BY type
  `).all();

  if (!lastByType.length) {
    console.log('events: none yet');
    return;
  }
  console.log('\nevents:');
  for (const row of lastByType) {
    const last = row.last_ts ? new Date(row.last_ts * 1000).toISOString() : 'never';
    console.log(`  ${row.type.padEnd(12)} n=${String(row.n).padStart(6)}  last=${last}`);
  }
}
