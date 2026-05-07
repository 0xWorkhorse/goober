#!/usr/bin/env node
/**
 * Build the overlay and panel, then copy their dist directories into the
 * server's public/ folder so the production deployment is one Node service.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const repoRoot = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const publicDir = path.join(repoRoot, 'packages', 'server', 'public');

function run(cmd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: repoRoot });
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const sp = path.join(src, entry.name);
    const dp = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(sp, dp);
    else fs.copyFileSync(sp, dp);
  }
}

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

// Build the frontends.
run('npm run build --workspace=packages/overlay');
run('npm run build --workspace=packages/panel');

// Copy dist into server/public.
rmrf(path.join(publicDir, 'overlay'));
rmrf(path.join(publicDir, 'panel'));
copyDir(path.join(repoRoot, 'packages', 'overlay', 'dist'), path.join(publicDir, 'overlay'));
copyDir(path.join(repoRoot, 'packages', 'panel', 'dist'), path.join(publicDir, 'panel'));

console.log('build-prod: server public/ updated.');
