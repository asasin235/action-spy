import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

const DEBUG = process.env.DEBUG_ACTIONSPY === '1';
let stream = null;

function ensureStream() {
  if (stream) return stream;
  fs.mkdirSync(path.dirname(config.logPath), { recursive: true });
  stream = fs.createWriteStream(config.logPath, { flags: 'a' });
  return stream;
}

function write(level, msg, kv) {
  const ts = new Date().toISOString();
  const parts = [level, ts, msg];
  if (kv && typeof kv === 'object') {
    for (const [k, v] of Object.entries(kv)) {
      parts.push(`${k}=${JSON.stringify(v)}`);
    }
  }
  const line = parts.join(' ') + '\n';
  ensureStream().write(line);
  if (level === 'ERROR' || level === 'WARN' || process.env.ACTIONSPY_FOREGROUND === '1') {
    process.stdout.write(line);
  }
}

export const logger = {
  info:  (msg, kv) => write('INFO',  msg, kv),
  warn:  (msg, kv) => write('WARN',  msg, kv),
  error: (msg, kv) => write('ERROR', msg, kv),
  debug: (msg, kv) => { if (DEBUG) write('DEBUG', msg, kv); },
};
