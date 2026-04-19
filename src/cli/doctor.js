import fs from 'node:fs';
import { execSync, execFileSync } from 'node:child_process';
import { config } from '../config.js';
import { openDb } from '../db.js';

function ok(msg, detail)    { console.log(`[OK]   ${msg.padEnd(32)} ${detail || ''}`); }
function warn(msg, detail)  { console.log(`[WARN] ${msg.padEnd(32)} ${detail || ''}`); }
function fail(msg, detail)  { console.log(`[FAIL] ${msg.padEnd(32)} ${detail || ''}`); }

export async function run() {
  try {
    fs.accessSync(config.zshHistoryPath, fs.constants.R_OK);
    ok('zsh history readable', config.zshHistoryPath);
  } catch {
    fail('zsh history readable', config.zshHistoryPath);
  }

  try {
    const text = fs.readFileSync(config.zshHistoryPath, 'utf8').split('\n').slice(-200);
    const extendedCount = text.filter(l => /^: \d+:\d+;/.test(l)).length;
    if (extendedCount > 0) {
      ok('EXTENDED_HISTORY enabled', `${extendedCount}/${text.length} recent lines have timestamps`);
    } else {
      warn('EXTENDED_HISTORY not detected', 'add `setopt EXTENDED_HISTORY` to ~/.zshrc for real timestamps');
    }
  } catch {
    /* already reported */
  }

  try {
    const started = Date.now();
    const out = execFileSync(
      'osascript',
      ['-e', 'tell application "System Events" to get name of first application process whose frontmost is true'],
      { timeout: 2000 }
    ).toString().trim();
    ok('AppleScript (Accessibility)', `frontmost='${out}' in ${Date.now() - started}ms`);
  } catch (err) {
    fail('AppleScript (Accessibility)', err.message);
  }

  try {
    const which = execSync('which pm2', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    ok('pm2 installed', which);
  } catch {
    warn('pm2 not installed', 'install with `npm i -g pm2` if you want supervised mode');
  }

  try {
    const db = openDb();
    const row = db.prepare(`SELECT value FROM meta WHERE key='schema_version'`).get();
    const count = db.prepare(`SELECT COUNT(*) c FROM events`).get().c;
    ok('SQLite DB', `${config.dbPath} (schema v${row?.value ?? '?'}, ${count} events)`);
  } catch (err) {
    fail('SQLite DB', err.message);
  }
}
