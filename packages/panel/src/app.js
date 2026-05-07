import { C2S, PHASE, S2C } from '@bossraid/shared';

import { resolveI18n } from './i18n/index.js';
import { renderCreator } from './views/creator.js';
import { renderDeath } from './views/death.js';
import { renderFight } from './views/fight.js';
import { renderGraveyard } from './views/graveyard.js';
import { renderLevelUp } from './views/levelUp.js';
import { renderLobby } from './views/lobby.js';
import { renderLogin } from './views/login.js';
import { renderResults } from './views/results.js';
import { createWsClient } from './ws/client.js';

/**
 * Panel app shell. Routes between login / lobby / fight / results based on
 * server-pushed phase. Step 10 adds the creator view; step 11 adds level-up
 * + death + graveyard.
 */
export async function startPanel(root) {
  const i18n = resolveI18n();

  // ── Auth check ──────────────────────────────────────────────────────────
  let me;
  try {
    const r = await fetch('/auth/me');
    if (r.ok) me = await r.json();
  } catch { /* ignore */ }
  if (!me) { renderLogin(root); return; }

  const state = {
    phase: PHASE.IDLE,
    monster: null,
    chatters: [],
    bossHP: 0,
    maxBossHP: 0,
    timeLeftMs: 0,
    cooldowns: {},
    connected: false,
  };
  let lastResults = null;
  const ctx = {
    state, me,
    send: null, rerender: null,
    creatorUi: null, levelUi: null,
    pendingAbilityRoll: null, pendingAbilityRollSlot: null,
    legacyPoints: 0,
  };

  // ── Header ──────────────────────────────────────────────────────────────
  root.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'header';
  header.innerHTML = `
    <h1>BossRaid</h1>
    <div class="row" style="gap:14px">
      <span class="who">@${escapeHtml(me.login)}</span>
      <span class="conn-pill" id="conn">connecting…</span>
      <button class="ghost" id="graveyard">Graveyard</button>
      <button class="ghost" id="logout">Sign out</button>
    </div>
  `;
  root.appendChild(header);

  const view = document.createElement('div');
  view.id = 'view';
  root.appendChild(view);

  document.getElementById('logout').addEventListener('click', async () => {
    await fetch('/auth/logout', { method: 'POST' });
    location.href = '/';
  });
  document.getElementById('graveyard').addEventListener('click', () => {
    ctx.showGraveyard = true;
    rerender();
  });

  // ── WebSocket ───────────────────────────────────────────────────────────
  const wsUrl = computeWsUrl();
  const client = createWsClient(wsUrl, (msg) => {
    handleServerMessage(msg);
    state.connected = true;
    updateConnPill();
    rerender();
  });
  client.send(C2S.HELLO_PANEL, { channelId: me.channelId });

  function handleServerMessage(msg) {
    switch (msg.type) {
      case S2C.WELCOME:
      case S2C.STATE_DELTA:
      case S2C.PHASE_CHANGE:
        Object.assign(state, msg.payload);
        if (msg.payload.legacyPoints != null) ctx.legacyPoints = msg.payload.legacyPoints;
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
    if (ctx.showGraveyard) {
      renderGraveyard(view, ctx);
      return;
    }
    switch (state.phase) {
      case PHASE.LOBBY:
      case PHASE.IDLE:
        renderLobby(view, { state, send, i18n });
        break;
      case PHASE.FIGHT:
        renderFight(view, { state, send, i18n });
        break;
      case PHASE.RESULTS:
        renderResults(view, { state, lastResults });
        break;
      case PHASE.CREATION:
        renderCreator(view, ctx);
        break;
      case PHASE.LEVEL_UP:
        renderLevelUp(view, ctx);
        break;
      case PHASE.DEATH:
        renderDeath(view, ctx);
        break;
      default:
        view.innerHTML = `<div class="card"><h2>State: ${state.phase}</h2></div>`;
    }
  }

  function updateConnPill() {
    const pill = document.getElementById('conn');
    if (!pill) return;
    pill.textContent = state.connected ? 'live' : 'reconnecting…';
    pill.classList.toggle('bad', !state.connected);
  }

  // First paint
  rerender();
}


function computeWsUrl() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
