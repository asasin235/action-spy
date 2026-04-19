import { getTop } from './queries.js';
import { getRecurrence } from './recurrence.js';
import { getAppTransitions } from './transitions.js';

function scoreRow({ count, daysSeen, lastTs, now, windowDays }) {
  const dayFactor = Math.min(daysSeen, windowDays) / windowDays;
  const ageSec = Math.max(0, now - (lastTs || 0));
  const ageDays = ageSec / 86400;
  const recency = Math.max(0.2, 1 - Math.min(ageDays / windowDays, 1));
  const score = Math.log1p(count) * dayFactor * recency;
  return Number(score.toFixed(3));
}

export function buildSuggestions({ days = 14, limit = 20 } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const windowDays = Number(days) || 14;

  const zshTop = getTop({ type: 'zsh', days: windowDays, limit: 50 });
  const zshRec = getRecurrence({ type: 'zsh', days: windowDays, minDays: 2, limit: 50 });
  const zshDaysBySubject = new Map(zshRec.map((r) => [r.subject, r.days_seen]));

  const browserTop = getTop({ type: 'browser', days: windowDays, limit: 50 });
  const browserRec = getRecurrence({ type: 'browser', days: windowDays, minDays: 2, limit: 50 });
  const browserDaysBySubject = new Map(browserRec.map((r) => [r.subject, r.days_seen]));

  const transitions = getAppTransitions({ days: windowDays, limit: 30 });

  const rows = [];

  for (const r of zshTop) {
    const daysSeen = zshDaysBySubject.get(r.subject) ?? 1;
    rows.push({
      kind: 'command',
      what: r.subject,
      count: r.n,
      days: daysSeen,
      example: r.example,
      last_ts: r.last_ts,
      score: scoreRow({ count: r.n, daysSeen, lastTs: r.last_ts, now, windowDays }),
    });
  }

  for (const r of browserTop) {
    const daysSeen = browserDaysBySubject.get(r.subject) ?? 1;
    rows.push({
      kind: 'url',
      what: r.subject + (r.example || ''),
      count: r.n,
      days: daysSeen,
      example: r.example,
      last_ts: r.last_ts,
      score: scoreRow({ count: r.n, daysSeen, lastTs: r.last_ts, now, windowDays }),
    });
  }

  for (const r of transitions) {
    rows.push({
      kind: 'app-pair',
      what: `${r.prev_app} → ${r.app}`,
      count: r.n,
      days: 1,
      example: `${r.prev_app} → ${r.app}`,
      last_ts: r.last_ts,
      score: scoreRow({ count: r.n, daysSeen: 1, lastTs: r.last_ts, now, windowDays }),
    });
  }

  rows.sort((a, b) => b.score - a.score);
  return rows.slice(0, Number(limit) || 20);
}
