import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { config } from './config.js';

const MIGRATIONS = [
  `
  CREATE TABLE events (
    id       INTEGER PRIMARY KEY,
    ts       INTEGER NOT NULL,
    type     TEXT    NOT NULL,
    source   TEXT,
    subject  TEXT,
    detail   TEXT,
    payload  TEXT
  );
  CREATE INDEX idx_events_type_ts      ON events(type, ts);
  CREATE INDEX idx_events_ts           ON events(ts);
  CREATE INDEX idx_events_type_subject ON events(type, subject);

  CREATE TABLE zsh_seen (
    ts       INTEGER NOT NULL,
    cmd_hash TEXT    NOT NULL,
    PRIMARY KEY (ts, cmd_hash)
  ) WITHOUT ROWID;

  CREATE TABLE cursors (
    name       TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  INSERT INTO meta(key, value) VALUES ('schema_version', '0');
  `,
];

let db = null;

export function openDb() {
  if (db) return db;
  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
  db = new Database(config.dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

function migrate(d) {
  const hasMeta = d.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='meta'`).get();
  let current = 0;
  if (hasMeta) {
    const row = d.prepare(`SELECT value FROM meta WHERE key='schema_version'`).get();
    current = row ? Number(row.value) : 0;
  }
  for (let v = current; v < MIGRATIONS.length; v++) {
    d.exec('BEGIN');
    try {
      d.exec(MIGRATIONS[v]);
      d.prepare(
        hasMeta || v > 0
          ? `UPDATE meta SET value=? WHERE key='schema_version'`
          : `UPDATE meta SET value=? WHERE key='schema_version'`
      ).run(String(v + 1));
      d.exec('COMMIT');
    } catch (err) {
      d.exec('ROLLBACK');
      throw err;
    }
  }
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

export function insertEvent({ ts, type, source = null, subject = null, detail = null, payload = null }) {
  const d = openDb();
  const stmt = d.prepare(
    `INSERT INTO events (ts, type, source, subject, detail, payload) VALUES (?, ?, ?, ?, ?, ?)`
  );
  return stmt.run(ts, type, source, subject, detail, payload ? JSON.stringify(payload) : null);
}

export function getCursor(name) {
  const d = openDb();
  const row = d.prepare(`SELECT value FROM cursors WHERE name=?`).get(name);
  return row ? JSON.parse(row.value) : null;
}

export function setCursor(name, value) {
  const d = openDb();
  d.prepare(
    `INSERT INTO cursors (name, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(name) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`
  ).run(name, JSON.stringify(value), Math.floor(Date.now() / 1000));
}

export function markZshSeen(ts, cmdHash) {
  const d = openDb();
  const res = d.prepare(`INSERT OR IGNORE INTO zsh_seen (ts, cmd_hash) VALUES (?, ?)`).run(ts, cmdHash);
  return res.changes === 1;
}
