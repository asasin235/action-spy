import { openDb } from '../db.js';
import { resolveType } from './queries.js';

export function getRecurrence({ type, days = 14, minDays = 2, limit = 50 } = {}) {
  const db = openDb();
  const resolved = resolveType(type);
  const since = Math.floor(Date.now() / 1000) - Number(days) * 86400;
  return db
    .prepare(
      `
      SELECT subject,
             COUNT(DISTINCT date(ts,'unixepoch','localtime')) AS days_seen,
             CAST(AVG(CAST(strftime('%H', ts,'unixepoch','localtime') AS INTEGER)) AS INTEGER) AS avg_hour,
             COUNT(*) AS total,
             MAX(detail) AS example,
             MAX(ts) AS last_ts
      FROM events
      WHERE type = ? AND ts > ?
      GROUP BY subject
      HAVING days_seen >= ?
      ORDER BY days_seen DESC, total DESC
      LIMIT ?
    `,
    )
    .all(resolved, since, Number(minDays), Number(limit));
}
