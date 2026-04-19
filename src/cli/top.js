import { Table } from 'console-table-printer';
import { getTop, resolveType } from '../analysis/queries.js';

export async function run(typeArg, opts) {
  const type = resolveType(typeArg);
  const days = Number(opts.days) || 14;
  const limit = Number(opts.limit) || 30;
  const rows = getTop({ type, days, limit });

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
