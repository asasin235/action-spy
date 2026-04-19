import { getFrontmost } from '../util/applescript.js';
import { insertEvent } from '../db.js';
import { logger } from '../logger.js';

let last = { app: null, title: null };

export async function runAppFocusCollector() {
  let cur;
  try {
    cur = await getFrontmost();
  } catch (err) {
    logger.warn('app-focus osascript failed', { err: err.message });
    return { changed: false };
  }

  if (!cur.app) return { changed: false };
  if (cur.app === last.app && cur.title === last.title) return { changed: false };

  insertEvent({
    ts: Math.floor(Date.now() / 1000),
    type: 'app_focus',
    source: null,
    subject: cur.app,
    detail: cur.title || null,
    payload: null,
  });

  logger.debug('app focus changed', { from: last.app, to: cur.app, title: cur.title });
  last = cur;
  return { changed: true, app: cur.app };
}
