import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import Database from 'better-sqlite3';

import { config } from '../config.js';
import { log } from '../log.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

let _db = null;

export function db() {
  if (_db) return _db;
  fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });
  _db = new Database(config.databasePath);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  _db.pragma('synchronous = NORMAL');
  runMigrations(_db);
  return _db;
}

function runMigrations(handle) {
  handle.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    );
  `);
  const applied = new Set(
    handle.prepare('SELECT filename FROM _migrations').all().map((r) => r.filename),
  );
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    log.info({ migration: file }, 'applying migration');
    const apply = handle.transaction(() => {
      handle.exec(sql);
      handle.prepare('INSERT INTO _migrations (filename, applied_at) VALUES (?, ?)').run(
        file,
        Date.now(),
      );
    });
    apply();
  }
}

/** Flush WAL on shutdown. Critical for not losing fight writes during deploys. */
export function checkpointAndClose() {
  if (!_db) return;
  try {
    _db.pragma('wal_checkpoint(TRUNCATE)');
  } catch (err) {
    log.warn({ err }, 'wal_checkpoint failed during shutdown');
  }
  _db.close();
  _db = null;
}
