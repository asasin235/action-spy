import { Table } from 'console-table-printer';
import { getStatus, getTop } from '../analysis/queries.js';
import { getAppTransitions } from '../analysis/transitions.js';
import { buildSuggestions } from '../analysis/suggest.js';

function printSection(title, render) {
  console.log(`\n── ${title} ──────────────────────────────`);
  render();
}

export async function run(opts) {
  const days = Number(opts.days) || 14;

  const status = getStatus();
  const byType = status.events_by_type;

  if (opts.json) {
    const data = {
      status,
      top_zsh: getTop({ type: 'zsh', days, limit: 15 }),
      top_browser: getTop({ type: 'browser', days, limit: 15 }),
      top_apps: getTop({ type: 'app_focus', days, limit: 15 }),
      app_transitions: getAppTransitions({ days, limit: 15 }),
      suggestions: buildSuggestions({ days, limit: 20 }),
    };
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  console.log(`\nactionspy report — last ${days} days`);
  console.log(`Events: zsh=${byType.zsh ?? 0}  app=${byType.app_focus ?? 0}  browser=${byType.browser ?? 0}`);

  printSection('Top commands (zsh)', () => printTop(getTop({ type: 'zsh', days, limit: 15 })));
  printSection('Top apps (focus)', () => printTop(getTop({ type: 'app_focus', days, limit: 15 })));
  printSection('Top browser hosts', () => printTop(getTop({ type: 'browser', days, limit: 15 })));

  const trans = getAppTransitions({ days, limit: 15 });
  if (trans.length) {
    printSection('Frequent app-pair transitions', () => {
      const t = new Table({ columns: [
        { name: 'from', alignment: 'left' },
        { name: 'to', alignment: 'left' },
        { name: 'n', alignment: 'right' },
      ]});
      for (const r of trans) t.addRow({ from: r.prev_app, to: r.app, n: r.n });
      t.printTable();
    });
  }

  const sugg = buildSuggestions({ days, limit: 20 });
  printSection('Stream Deck candidates', () => {
    if (!sugg.length) {
      console.log('(Not enough data yet — let the daemon collect for a few days.)');
      return;
    }
    const t = new Table({ columns: [
      { name: 'kind', alignment: 'left' },
      { name: 'what', alignment: 'left' },
      { name: 'count', alignment: 'right' },
      { name: 'days', alignment: 'right' },
      { name: 'score', alignment: 'right' },
    ]});
    for (const r of sugg) t.addRow({ kind: r.kind, what: String(r.what).slice(0, 50), count: r.count, days: r.days, score: r.score });
    t.printTable();
  });
}

function printTop(rows) {
  if (!rows.length) {
    console.log('(no events)');
    return;
  }
  const t = new Table({ columns: [
    { name: 'subject', alignment: 'left' },
    { name: 'n', alignment: 'right' },
    { name: 'example', alignment: 'left', maxLen: 60 },
  ]});
  for (const r of rows) t.addRow({ subject: r.subject || '—', n: r.n, example: String(r.example || '').slice(0, 60) });
  t.printTable();
}
