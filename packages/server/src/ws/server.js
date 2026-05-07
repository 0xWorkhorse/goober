import { WebSocketServer } from 'ws';

import { PROTOCOL_VERSION, S2C, envelope } from '@bossraid/shared';

import { log } from '../log.js';
import { handleMessage } from './handlers.js';
import { scheduleAbandon } from '../twitch/irc.js';

/**
 * Send a typed message on a single socket.
 * @param {import('ws').WebSocket} ws
 */
export function send(ws, type, payload = {}) {
  if (ws.readyState !== ws.OPEN) return;
  ws.send(JSON.stringify(envelope(type, payload)));
}

/**
 * Broadcast to all sockets in a room. The room owns its socket sets.
 * @param {{panels:Set, overlays:Set}} room
 */
export function broadcastRoom(room, type, payload = {}) {
  const msg = JSON.stringify(envelope(type, payload));
  for (const ws of room.panels) if (ws.readyState === ws.OPEN) ws.send(msg);
  for (const ws of room.overlays) if (ws.readyState === ws.OPEN) ws.send(msg);
}

export function attachWsServer(httpServer, { rooms }) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    log.debug({ remote: req.socket.remoteAddress }, 'ws connection');

    ws.on('message', (data) => {
      let msg;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        send(ws, S2C.ERROR, { code: 'bad_json', message: 'invalid JSON' });
        return;
      }
      if (!msg || typeof msg !== 'object' || msg.v !== PROTOCOL_VERSION) {
        send(ws, S2C.ERROR, {
          code: 'protocol_version',
          message: `expected protocol v${PROTOCOL_VERSION}`,
        });
        return;
      }
      handleMessage(ws, msg, { rooms }).catch((err) => {
        log.error({ err, type: msg.type }, 'ws handler error');
        send(ws, S2C.ERROR, { code: 'handler_error', message: 'internal error' });
      });
    });

    ws.on('close', () => {
      if (ws._room) {
        ws._room.panels.delete(ws);
        ws._room.overlays.delete(ws);
        // If this was the last panel for the room, schedule IRC abandonment.
        if (ws._surface === 'panel' && ws._room.panels.size === 0) {
          scheduleAbandon(ws._room.channelId);
        }
      }
    });
  });

  // Liveness ping: terminate stale sockets every 30s.
  const interval = setInterval(() => {
    for (const ws of wss.clients) {
      if (ws.isAlive === false) { ws.terminate(); continue; }
      ws.isAlive = false;
      try { ws.ping(); } catch { /* ignore */ }
    }
  }, 30_000);
  wss.on('close', () => clearInterval(interval));

  return wss;
}
