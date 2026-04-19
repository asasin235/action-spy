import { openDb } from '../db.js';

export function getAppTransitions({ days = 14, limit = 30, gapSeconds = 30 } = {}) {
  const db = openDb();
  const since = Math.floor(Date.now() / 1000) - Number(days) * 86400;
  return db
    .prepare(
      `
      WITH focus AS (
        SELECT subject AS app, ts,
               LAG(subject) OVER (ORDER BY ts) AS prev_app,
               LAG(ts)      OVER (ORDER BY ts) AS prev_ts
        FROM events WHERE type='app_focus' AND ts > ?
      )
      SELECT prev_app, app, COUNT(*) AS n, MAX(ts) AS last_ts
      FROM focus
      WHERE prev_app IS NOT NULL
        AND prev_app != app
        AND (ts - prev_ts) < ?
      GROUP BY prev_app, app
      ORDER BY n DESC
      LIMIT ?
    `,
    )
    .all(since, Number(gapSeconds), Number(limit));
}
