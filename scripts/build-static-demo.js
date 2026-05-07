#!/usr/bin/env node
/**
 * Build the panel + overlay as a fully-static demo for GitHub Pages.
 *
 * - Sets VITE_DEMO=1 so the apps swap their real WebSocket clients for the
 *   scripted fake ones in src/ws/fakeWs.js.
 * - Sets VITE_BASE=/goober/<surface>/ so asset URLs resolve under the Pages
 *   path prefix.
 * - Copies dist outputs into `/docs/{panel,overlay}` and writes a small
 *   `/docs/index.html` landing page linking to both.
 * - Writes `/docs/.nojekyll` so Pages serves files starting with `_` raw.
 *
 * Run:
 *   npm run build:demo
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const repoRoot = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const docsDir = path.join(repoRoot, 'docs');

function rmrf(p) { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); }
function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }
function copyDir(src, dst) {
  mkdirp(dst);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const sp = path.join(src, entry.name);
    const dp = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(sp, dp);
    else fs.copyFileSync(sp, dp);
  }
}

function build(surface, base) {
  console.log(`\n→ building ${surface} (base=${base})`);
  execSync(`npm run build --workspace=packages/${surface}`, {
    stdio: 'inherit',
    cwd: repoRoot,
    env: { ...process.env, VITE_DEMO: '1', VITE_BASE: base },
  });
}

// ─── Wipe and rebuild docs/ ─────────────────────────────────────────────────
rmrf(docsDir);
mkdirp(docsDir);

build('overlay', '/goober/overlay/');
build('panel', '/goober/panel/');

copyDir(path.join(repoRoot, 'packages', 'overlay', 'dist'), path.join(docsDir, 'overlay'));
copyDir(path.join(repoRoot, 'packages', 'panel', 'dist'), path.join(docsDir, 'panel'));

// .nojekyll so Pages doesn't strip `_` files (vite emits assets prefixed `_`).
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');

// Landing page.
fs.writeFileSync(path.join(docsDir, 'index.html'), landingHtml());

console.log('\n✓ static demo built to docs/');

function landingHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>BossRaid — preview</title>
  <style>
    :root {
      --bg: #14141f; --card: #1f1f30; --border: #3d3d5c; --text: #e7e7f2;
      --dim: #b8b8d8; --accent: #ff6b9d; --accent2: #ffd166;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; background: var(--bg); color: var(--text);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased; min-height: 100vh; }
    main { max-width: 760px; margin: 0 auto; padding: 64px 24px; }
    .logo { font-size: 56px; line-height: 1; }
    h1 { font-size: 38px; margin: 12px 0 6px; }
    .tag { color: var(--dim); font-size: 17px; margin: 0 0 36px; line-height: 1.45; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }
    a.card {
      display: block; background: var(--card); border: 1px solid var(--border);
      border-radius: 14px; padding: 22px; text-decoration: none; color: var(--text);
      transition: transform 120ms ease, border-color 120ms ease;
    }
    a.card:hover { transform: translateY(-2px); border-color: var(--accent2); }
    a.card .label { color: var(--dim); font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; }
    a.card h2 { margin: 6px 0 4px; font-size: 22px; }
    a.card p { margin: 0; color: var(--dim); font-size: 14px; line-height: 1.5; }
    .pill { display: inline-block; padding: 3px 9px; border-radius: 999px;
      background: rgba(255,107,157,0.15); color: var(--accent); font-size: 11px;
      letter-spacing: 1.4px; text-transform: uppercase; margin-bottom: 14px; }
    .small { color: var(--dim); font-size: 13px; margin-top: 26px; line-height: 1.6; }
    a { color: var(--accent); }
  </style>
</head>
<body>
  <main>
    <div class="logo">👹</div>
    <span class="pill">Preview build · scripted demo</span>
    <h1>BossRaid</h1>
    <p class="tag">A Twitch chat boss-battle game. Streamers design a goofy
       monster, viewers fight it from chat. This page is a static preview —
       no real Twitch connection — so you can click through every screen
       and tell us what to fix.</p>

    <div class="grid">
      <a class="card" href="./panel/">
        <div class="label">Streamer view</div>
        <h2>Control panel →</h2>
        <p>What the streamer interacts with: monster creator, ability buttons,
           level-up, death + revive, graveyard.</p>
      </a>
      <a class="card" href="./overlay/">
        <div class="label">Viewer view</div>
        <h2>Stream overlay →</h2>
        <p>What viewers see — the monster fighting chat. In production this
           is added to OBS as a transparent browser source.</p>
      </a>
      <a class="card" href="./overlay/parts.html">
        <div class="label">Asset toy</div>
        <h2>Part picker →</h2>
        <p>Cycle every body / eyes / mouth / horns / arms / feet combination
           to see the 8,748 unique monsters from 18 SVG primitives.</p>
      </a>
      <a class="card" href="https://github.com/0xWorkhorse/goober">
        <div class="label">Source</div>
        <h2>GitHub repo →</h2>
        <p>Architecture, build instructions, and the full open spec.</p>
      </a>
    </div>

    <p class="small">This preview runs entirely client-side: each surface
       simulates the server with a scripted state machine, so the panel and
       overlay walk through their own canned fights in a loop. The real
       deployment uses a Node + WebSocket backend with Twitch OAuth and IRC.
    </p>
  </main>
</body>
</html>
`;
}
