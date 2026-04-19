import fs from 'node:fs';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { openDb, insertEvent, getCursor, setCursor, markZshSeen } from '../db.js';
import { commandFamily } from '../analysis/normalize-cmd.js';
import { logger } from '../logger.js';

const EXTENDED_RE = /^: (\d+):(\d+);/;
const CURSOR_NAME = () => `zsh:${config.zshHistoryPath}`;

function sha1(s) {
  return crypto.createHash('sha1').update(s).digest('hex');
}

export function parseZshHistory(text, fallbackTs) {
  const lines = text.split('\n');
  const hasExtended = lines.some(l => EXTENDED_RE.test(l));
  const records = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line === '' && i === lines.length - 1) break;

    let ts = null;
    let elapsed = null;
    let body = line;

    if (hasExtended) {
      const m = EXTENDED_RE.exec(line);
      if (m) {
        ts = Number(m[1]);
        elapsed = Number(m[2]);
        body = line.slice(m[0].length);
      } else {
        i++;
        continue;
      }
    }

    let command = body;
    while (command.endsWith('\\') && i + 1 < lines.length) {
      command = command.slice(0, -1) + '\n' + lines[i + 1];
      i++;
    }

    command = command.trim();
    if (command) {
      records.push({
        ts: ts ?? fallbackTs,
        elapsed: elapsed ?? 0,
        command,
        approximate: ts === null,
      });
    }
    i++;
  }

  return records;
}

export async function runZshCollector() {
  const d = openDb();
  let stat;
  try {
    stat = await fs.promises.stat(config.zshHistoryPath);
  } catch (err) {
    logger.warn('zsh history not readable', { path: config.zshHistoryPath, err: err.message });
    return { inserted: 0, skipped: 0 };
  }

  const cursor = getCursor(CURSOR_NAME()) || { offset: 0, inode: 0, size: 0 };
  let startOffset = cursor.offset;

  if (stat.ino !== cursor.inode || stat.size < cursor.size) {
    startOffset = 0;
  }
  if (stat.size === startOffset) {
    setCursor(CURSOR_NAME(), { offset: stat.size, inode: stat.ino, size: stat.size });
    return { inserted: 0, skipped: 0 };
  }

  const fd = await fs.promises.open(config.zshHistoryPath, 'r');
  try {
    const len = stat.size - startOffset;
    const buf = Buffer.alloc(len);
    await fd.read(buf, 0, len, startOffset);
    const text = buf.toString('utf8');

    const fallbackTs = Math.floor(stat.mtime.getTime() / 1000);
    const records = parseZshHistory(text, fallbackTs);

    let inserted = 0;
    let skipped = 0;
    const tx = d.transaction(() => {
      for (const r of records) {
        const hash = sha1(r.command);
        if (markZshSeen(r.ts, hash)) {
          insertEvent({
            ts: r.ts,
            type: 'zsh',
            source: null,
            subject: commandFamily(r.command),
            detail: r.command,
            payload: { elapsed: r.elapsed, approximate: r.approximate },
          });
          inserted++;
        } else {
          skipped++;
        }
      }
    });
    tx();

    setCursor(CURSOR_NAME(), { offset: stat.size, inode: stat.ino, size: stat.size });
    logger.debug('zsh tick', { inserted, skipped, startOffset, size: stat.size });
    return { inserted, skipped };
  } finally {
    await fd.close();
  }
}
