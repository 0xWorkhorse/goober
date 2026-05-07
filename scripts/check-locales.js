#!/usr/bin/env node
/**
 * Validates that all locale files have identical key structures to en.json.
 * Exits 0 if parity holds, 1 otherwise. Wired up via `npm run check:locales`.
 */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const LOCALES_DIR = path.resolve(__dirname, '..', 'packages', 'shared', 'src', 'locales');

function flatten(obj, prefix = '') {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...flatten(v, key));
    else out.push(key);
  }
  return out;
}

function loadLocale(file) {
  return JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, file), 'utf8'));
}

const files = fs
  .readdirSync(LOCALES_DIR)
  .filter((f) => f.endsWith('.json'))
  .sort();

if (!files.includes('en.json')) {
  console.error('check-locales: en.json not found');
  process.exit(1);
}

const enKeys = new Set(flatten(loadLocale('en.json')));
let ok = true;

for (const file of files) {
  if (file === 'en.json') continue;
  const keys = new Set(flatten(loadLocale(file)));
  const missing = [...enKeys].filter((k) => !keys.has(k)).sort();
  const extra = [...keys].filter((k) => !enKeys.has(k)).sort();
  if (missing.length || extra.length) {
    ok = false;
    console.error(`\n${file}:`);
    if (missing.length) console.error('  missing keys:', missing.join(', '));
    if (extra.length) console.error('  extra keys:  ', extra.join(', '));
  }
}

if (ok) {
  console.log(`check-locales: ${files.length} locale(s) in parity`);
  process.exit(0);
}
process.exit(1);
