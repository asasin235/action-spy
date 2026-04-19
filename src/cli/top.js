import { Table } from 'console-table-printer';
import { openDb } from '../db.js';

const TYPE_ALIASES = { zsh: 'zsh', app: 'app_focus', browser: 'browser' };

export async function run(typeArg, opts) {
  const type = TYPE_ALIASES[typeArg] || typeArg;
  const days = Number(opts.days) || 14;
  const limit = Number(opts.limit) || 30;
  const since = Math.floor(Date.now() / 1000) - days * 86400;

  const db = openDb();
  const rows = db.prepare(`
    SELECT subject,
           COUNT(*) AS n,
           MAX(detail) AS example,
           MAX(ts) AS last_ts
    FROM events
    WHERE type = ? AND ts >= ?
    GROUP BY subject
    ORDER BY n DESC
    LIMIT ?
  `).all(type, since, limit);

  if (opts.json) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  if (!rows.length) {
    console.log(`No events of type '${type}' in last ${days}d.`);
    return;
  }

  const table = new Table({
    columns: [
      { name: 'subject', alignment: 'left' },
      { name: 'n', alignment: 'right' },
      { name: 'example', alignment: 'left', maxLen: 60 },
      { name: 'last', alignment: 'left' },
    ],
  });
  for (const r of rows) {
    table.addRow({
      subject: r.subject ?? '',
      n: r.n,
      example: (r.example ?? '').slice(0, 60),
      last: new Date(r.last_ts * 1000).toISOString().replace('T', ' ').slice(0, 19),
    });
  }
  console.log(`\nTop '${type}' subjects in last ${days}d:`);
  table.printTable();
}
