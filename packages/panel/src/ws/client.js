import { PROTOCOL_VERSION, envelope } from '@bossraid/shared';

/**
 * Reconnecting WebSocket client (mirrors overlay/ws/client.js). The panel
 * uses this to communicate combat-state with the server.
 */
export function createWsClient(url, onMessage) {
  let ws = null;
  let attempt = 0;
  let manualClose = false;
  const queue = [];
  const listeners = new Set();

  function connect() {
    ws = new WebSocket(url);
    ws.addEventListener('open', () => {
      attempt = 0;
      while (queue.length) ws.send(queue.shift());
      for (const l of listeners) l({ kind: 'open' });
    });
    ws.addEventListener('message', (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      if (!msg || msg.v !== PROTOCOL_VERSION) return;
      onMessage(msg);
    });
    ws.addEventListener('close', () => {
      for (const l of listeners) l({ kind: 'close' });
      if (manualClose) return;
      const delay = Math.min(15_000, 250 * 2 ** attempt) * (0.7 + Math.random() * 0.6);
      attempt = Math.min(attempt + 1, 8);
      setTimeout(connect, delay);
    });
    ws.addEventListener('error', () => { try { ws.close(); } catch { /* ignore */ } });
  }

  function send(type, payload) {
    const data = JSON.stringify(envelope(type, payload));
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(data);
    else queue.push(data);
  }

  function onState(listener) { listeners.add(listener); return () => listeners.delete(listener); }
  function close() { manualClose = true; if (ws) ws.close(); }

  connect();
  return { send, close, onState };
}
