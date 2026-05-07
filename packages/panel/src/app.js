import { C2S, PHASE, S2C } from '@bossraid/shared';

import { resolveI18n } from './i18n/index.js';
import { ChatPulse, renderTopBar, el } from './views/chrome.js';
import { renderDeath } from './views/death.js';
import { renderFight } from './views/fight.js';
import { renderGraveyard } from './views/graveyard.js';
import { renderLevelUp } from './views/levelUp.js';
import { renderIdleOrLobby } from './views/lobby.js';
import { renderLogin } from './views/login.js';
import { renderObsHandoff } from './views/obs.js';
import { renderOnboardingPick } from './views/onboardingPick.js';
import { renderResults } from './views/results.js';
import { createFakeWsClient, isDemoBuild } from './ws/fakeWs.js';
import { createWsClient } from './ws/client.js';

/**
 * Top-level panel shell. Persistent dashboard chrome (top bar + chat-pulse
 * strip) wraps every phase view. Phase-specific UIs render into the
 * `.brm-view` slot.
 */
export async function startPanel(root) {
  const i18n = resolveI18n();

  let me;
  if (isDemoBuild()) {
    me = { channelId: 'demo', login: 'demo_streamer', displayName: 'Demo Streamer', locale: 'en' };
  } else {
    try {
      const r = await fetch('/auth/me');
      if (r.ok) me = await r.json();
    } catch { /* ignore */ }
    if (!me) { renderLogin(root); return; }
  }

  const state = {
    phase: PHASE.IDLE,
    monster: null,
    chatters: [],
    bossHP: 0,
    maxBossHP: 0,
    timeLeftMs: 0,
    cooldowns: {},
    events: [],
    connected: false,
    victory: false,
  };
  let lastResults = null;
  const ctx = {
    state, me,
    send: null, rerender: null,
    pickUi: null, levelUi: null, editingSlot: null,
    pendingAbilityRoll: null, pendingAbilityRollSlot: null,
    legacyPoints: 0,
    showGraveyard: false,
    showObs: false,
    obsAcknowledged: false,
    useFullCreator: false,
  };

  // ── Mount the persistent shell ──────────────────────────────────────────
  root.innerHTML = '';
  const app = el('main', 'brm-app');
  const topbarSlot = el('div');
  const viewSlot = el('div', 'brm-view');
  const pulse = new ChatPulse();
  app.append(topbarSlot, viewSlot, pulse.root);
  root.appendChild(app);

  // ── WebSocket ───────────────────────────────────────────────────────────
  const useDemo = isDemoBuild();
  const wsUrl = useDemo ? 'demo://' : computeWsUrl();
  const factory = useDemo ? createFakeWsClient : createWsClient;
  const client = factory(wsUrl, (msg) => {
    handleServerMessage(msg);
    state.connected = true;
    rerender();
  });
  if (!useDemo) client.send(C2S.HELLO_PANEL, { channelId: me.channelId });

  function handleServerMessage(msg) {
    switch (msg.type) {
      case S2C.WELCOME:
      case S2C.STATE_DELTA:
      case S2C.PHASE_CHANGE:
        Object.assign(state, msg.payload);
        if (msg.payload.legacyPoints != null) ctx.legacyPoints = msg.payload.legacyPoints;
        // Push parsed chat events into ChatPulse if present.
        for (const ev of msg.payload.events || []) {
          if (ev.kind === 'CHATTER_JOINED') pulse.push({ login: ev.chatterId, action: 'join' });
          else if (ev.kind === 'CHATTER_ATTACK') pulse.push({ login: ev.chatterId, action: 'attack' });
          else if (ev.kind === 'CHATTER_HEAL') pulse.push({ login: ev.chatterId, action: 'heal' });
          else if (ev.kind === 'CHATTER_BLOCK') pulse.push({ login: ev.chatterId, action: 'block' });
        }
        return;
      case S2C.MONSTER_UPDATED:
        state.monster = msg.payload.monster;
        return;
      case S2C.RESULTS:
        lastResults = msg.payload;
        return;
      case S2C.ABILITY_ROLL:
        ctx.pendingAbilityRoll = msg.payload.options;
        if (msg.payload.slot != null) ctx.pendingAbilityRollSlot = msg.payload.slot;
        return;
      case S2C.ERROR:
        console.warn('server error:', msg.payload);
        return;
      default:
        return;
    }
  }

  function rerender() {
    const send = (t, p) => client.send(t, p);
    ctx.send = send;
    ctx.rerender = rerender;
    ctx.lastResults = lastResults;

    // Top bar
    topbarSlot.innerHTML = '';
    topbarSlot.appendChild(renderTopBar({
      phase: state.phase,
      me,
      connected: state.connected,
      onGraveyard: () => { ctx.showGraveyard = true; rerender(); },
      onLogout: async () => { await fetch('/auth/logout', { method: 'POST' }).catch(() => {}); location.href = '/'; },
    }));

    // Mini OBS prompt floating in the topbar zone — non-blocking.
    if (!ctx.obsAcknowledged && state.monster?.status === 'active') {
      mountObsBanner(topbarSlot, ctx);
    }

    // Body view
    if (ctx.showGraveyard) {
      renderGraveyard(viewSlot, ctx);
      return;
    }
    if (ctx.showObs) {
      renderObsHandoff(viewSlot, ctx);
      return;
    }
    switch (state.phase) {
      case PHASE.IDLE:
      case PHASE.LOBBY:
        renderIdleOrLobby(viewSlot, ctx);
        break;
      case PHASE.FIGHT:
        renderFight(viewSlot, ctx);
        break;
      case PHASE.RESULTS:
        renderResults(viewSlot, ctx);
        break;
      case PHASE.LEVEL_UP:
        renderLevelUp(viewSlot, ctx);
        break;
      case PHASE.DEATH:
        renderDeath(viewSlot, ctx);
        break;
      case PHASE.CREATION:
        renderOnboardingPick(viewSlot, ctx);
        break;
      default:
        viewSlot.innerHTML = `<div class="dash-single"><h2>State: ${state.phase}</h2></div>`;
    }
    void i18n;
  }

  rerender();
}

function mountObsBanner(slot, ctx) {
  const bar = el('div');
  bar.style.cssText = 'background:#fff7c2;border-bottom:2.4px solid var(--ink);padding:8px 18px;display:flex;align-items:center;gap:14px;font-family:var(--font-marker);font-size:14px;';
  bar.innerHTML = `
    <span>📺 First time? Add the overlay to OBS.</span>
    <button class="btn tiny" data-act="show-obs">Show me how</button>
    <button class="btn tiny ghost" data-act="dismiss">later</button>
  `;
  bar.querySelector('[data-act="show-obs"]').addEventListener('click', () => { ctx.showObs = true; ctx.rerender(); });
  bar.querySelector('[data-act="dismiss"]').addEventListener('click', () => { ctx.obsAcknowledged = true; ctx.rerender(); });
  slot.appendChild(bar);
}

function computeWsUrl() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws`;
}
