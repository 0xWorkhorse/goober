import path from 'node:path';
import fs from 'node:fs';

import express from 'express';

/**
 * Serve the overlay and panel as static assets in production. The build
 * script copies `packages/{overlay,panel}/dist` into `packages/server/public/{overlay,panel}`.
 *
 * The panel is also mounted at `/` for convenience; the overlay is at `/overlay`.
 * If the build directory is missing (dev mode without a build), we no-op.
 */
export function buildStaticRoutes() {
  const root = path.resolve(import.meta.dirname || process.cwd(), '..', '..', 'public');
  const router = express.Router();
  const overlayDir = path.join(root, 'overlay');
  const panelDir = path.join(root, 'panel');

  if (fs.existsSync(overlayDir)) {
    router.use('/overlay', express.static(overlayDir, { maxAge: '5m', index: 'index.html' }));
    // Vite multi-page: serve parts.html as well.
  }
  if (fs.existsSync(panelDir)) {
    router.use('/panel', express.static(panelDir, { maxAge: '5m', index: 'index.html' }));
    // Mount panel at root so streamers can just visit the bare URL.
    router.get('/', (_req, res) => res.redirect('/panel'));
  }
  return router;
}
