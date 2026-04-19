import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { insertEvent, getCursor, setCursor } from '../db.js';
import { copyToTemp } from '../util/sqlite-copy.js';
import { toUnix, fromUnix } from '../util/time.js';
import { normalizeUrl } from '../analysis/normalize-url.js';

const CHROME_QUERY = `
  SELECT url, title, visit_count, last_visit_time AS ts
  FROM urls
  WHERE last_visit_time > ?
  ORDER BY last_visit_time ASC
  LIMIT 5000
`;

const SAFARI_QUERY = `
  SELECT hi.url AS url, hv.title AS title, hi.visit_count AS visit_count, hv.visit_time AS ts
  FROM history_visits hv
  JOIN history_items hi ON hv.history_item = hi.id
  WHERE hv.visit_time > ?
  ORDER BY hv.visit_time ASC
  LIMIT 5000
`;

function sources() {
  return [
    { name: 'chrome', path: config.browsers.chrome, epoch: 'chrome', query: CHROME_QUERY, requiredTable: 'urls' },
    { name: 'arc',    path: config.browsers.arc,    epoch: 'chrome', query: CHROME_QUERY, requiredTable: 'urls' },
    { name: 'safari', path: config.browsers.safari, epoch: 'safari', query: SAFARI_QUERY, requiredTable: 'history_visits' },
  ];
}

export async function runBrowserCollector() {
  const results = {};
  for (const src of sources()) {
    results[src.name] = await scanOne(src);
  }
  return results;
}

async function scanOne(src) {
  try {
    await fs.promises.access(src.path, fs.constants.R_OK);
  } catch {
    return { skipped: 'missing' };
  }

  const cursorKey = `browser:${src.name}`;
  const cursor = getCursor(cursorKey) || { unix_ts: 0 };
  const sinceNative = fromUnix(cursor.unix_ts, src.epoch);

  const tmp = path.join(config.tmpDir, `${src.name}.db`);
  try {
    await copyToTemp(src.path, tmp);
  } catch (err) {
    logger.warn('browser copy failed', { source: src.name, err: err.message });
    return { skipped: 'copy-failed', err: err.message };
  }

  let db;
  try {
    db = new Database(tmp, { readonly: true, fileMustExist: true });
  } catch (err) {
    logger.warn('browser open failed', { source: src.name, err: err.message });
    return { skipped: 'open-failed', err: err.message };
  }

  let inserted = 0;
  let maxUnix = cursor.unix_ts || 0;

  try {
    const hasTable = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
      .get(src.requiredTable);
    if (!hasTable) {
      return { skipped: 'empty-db' };
    }
    const stmt = db.prepare(src.query);
    if (src.epoch === 'chrome') stmt.safeIntegers(true);
    const rows = stmt.all(sinceNative);

    for (const r of rows) {
      const unix = toUnix(r.ts, src.epoch);
      if (!isFinite(unix) || unix <= 0) continue;

      const { subject, detail, fullHash } = normalizeUrl(r.url);
      insertEvent({
        ts: unix,
        type: 'browser',
        source: src.name,
        subject,
        detail,
        payload: { title: r.title || null, visit_count: Number(r.visit_count ?? 0), full_url_hash: fullHash },
      });
      inserted++;
      if (unix > maxUnix) maxUnix = unix;
    }
  } finally {
    db.close();
  }

  if (inserted > 0) {
    setCursor(cursorKey, { unix_ts: maxUnix, updated_at: Math.floor(Date.now() / 1000) });
  }

  return { inserted, maxUnix };
}
