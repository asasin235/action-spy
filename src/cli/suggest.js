import { Table } from 'console-table-printer';
import { buildSuggestions } from '../analysis/suggest.js';

export async function run(opts) {
  const days = Number(opts.days) || 14;
  const limit = Number(opts.limit) || 20;
  const rows = buildSuggestions({ days, limit });

  if (opts.json) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  if (!rows.length) {
    console.log('No suggestions yet. Let the daemon collect for a few days.');
    return;
  }

  const t = new Table({
    columns: [
      { name: 'kind',    alignment: 'left' },
      { name: 'what',    alignment: 'left' },
      { name: 'count',   alignment: 'right' },
      { name: 'days',    alignment: 'right' },
      { name: 'score',   alignment: 'right' },
      { name: 'example', alignment: 'left', maxLen: 60 },
    ],
  });
  for (const r of rows) {
    t.addRow({
      kind: r.kind,
      what: String(r.what || '').slice(0, 60),
      count: r.count,
      days: r.days,
      score: r.score,
      example: String(r.example || '').slice(0, 60),
    });
  }
  console.log(`\nStream Deck candidates (last ${days}d, top ${limit}):`);
  t.printTable();
}
