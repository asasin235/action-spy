import { openDb } from '../db.js';

const TYPE_ALIASES = { zsh: 'zsh', app: 'app_focus', app_focus: 'app_focus', browser: 'browser' };

export function resolveType(t) {
  return TYPE_ALIASES[t] || t;
}

export function getStatus() {
  const db = openDb();
  const rows = db.prepare(`
    SELECT type, COUNT(*) AS n, MAX(ts) AS last_ts
    FROM events
    GROUP BY type
  `).all();

  const eventsByType = {};
  const lastEventByType = {};
  let total = 0;
  for (const r of rows) {
    eventsByType[r.type] = r.n;
    lastEventByType[r.type] = r.last_ts;
    total += r.n;
  }

  const schema = db.prepare(`SELECT value FROM meta WHERE key='schema_version'`).get();

  return {
    schema_version: schema ? Number(schema.value) : null,
    total_events: total,
    events_by_type: eventsByType,
    last_event_ts_by_type: lastEventByType,
  };
}

export function getTop({ type, days = 14, limit = 30 }) {
  const db = openDb();
  const resolved = resolveType(type);
  const since = Math.floor(Date.now() / 1000) - Number(days) * 86400;
  return db.prepare(`
    SELECT subject,
           COUNT(*) AS n,
           MAX(detail) AS example,
           MAX(ts) AS last_ts
    FROM events
    WHERE type = ? AND ts >= ?
    GROUP BY subject
    ORDER BY n DESC
    LIMIT ?
  `).all(resolved, since, Number(limit));
}

export function getTimeline({ type, days = 7 }) {
  const db = openDb();
  const resolved = resolveType(type);
  const since = Math.floor(Date.now() / 1000) - Number(days) * 86400;
  return db.prepare(`
    SELECT
      strftime('%Y-%m-%d %H:00', ts, 'unixepoch', 'localtime') AS bucket,
      COUNT(*) AS n
    FROM events
    WHERE type = ? AND ts >= ?
    GROUP BY bucket
    ORDER BY bucket ASC
  `).all(resolved, since);
}

export function getRecentEvents({ type, limit = 50 }) {
  const db = openDb();
  const resolved = resolveType(type);
  return db.prepare(`
    SELECT id, ts, type, source, subject, detail, payload
    FROM events
    WHERE type = ?
    ORDER BY ts DESC
    LIMIT ?
  `).all(resolved, Number(limit));
}

export function getSuggestions({ days = 14, limit = 20 } = {}) {
  return { suggestions: [], note: 'Coming in M5 (analysis + suggest).', days, limit };
}
