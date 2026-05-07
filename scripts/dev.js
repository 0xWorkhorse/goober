#!/usr/bin/env node
/**
 * Spawns server (3000) + overlay (5173) + panel (5174) concurrently for local
 * development.
 */
import { spawn } from 'node:child_process';

const procs = [
  spawn('npm', ['run', 'dev', '--workspace=packages/server'], { stdio: 'inherit' }),
  spawn('npm', ['run', 'dev', '--workspace=packages/overlay'], { stdio: 'inherit' }),
  spawn('npm', ['run', 'dev', '--workspace=packages/panel'], { stdio: 'inherit' }),
];

function kill() {
  for (const p of procs) {
    try { p.kill('SIGTERM'); } catch { /* ignore */ }
  }
}
process.on('SIGINT', kill);
process.on('SIGTERM', kill);

let exited = 0;
for (const p of procs) {
  p.on('exit', (code) => {
    exited++;
    if (code !== 0) {
      console.error(`subprocess exited with code ${code}; tearing down others`);
      kill();
    }
    if (exited === procs.length) process.exit(0);
  });
}
