import { C2S, EVENTS, PHASE, S2C, STAT_DEFS } from '@bossraid/shared';

import { bindMusicToPhase, sfx } from './audio/sfx.js';
import { resolveI18n } from './i18n/index.js';
import { syncChatterSprites } from './render/chatters.js';
import { createDamageNumbers } from './render/damageNumbers.js';
import { createFlash } from './render/flash.js';
import { renderHpBar } from './render/hpBar.js';
import { DEFAULT_APPEARANCE, renderMonsterSVG } from '@bossraid/shared/monster';
import { buildRenderPlan, createSpotlightTracker, syncMobSprites } from './render/mobs.js';
import { createParticleSystem } from './render/particles.js';
import { createShake } from './render/shake.js';
import { buildVfxHandlers } from './render/vfx.js';
import { createFakeOverlayClient, isDemoBuild } from './ws/fakeWs.js';
import { createWsClient } from './ws/client.js';

/**
 * Top-level overlay app. Holds latest server state, drives a 60fps render
 * loop, dispatches state-delta events to the VFX_HANDLERS table.
 */
export function startOverlay({ stage, channelId }) {
  const i18n = resolveI18n();
  const state = {
    phase: PHASE.IDLE,
    monster: null,
    chatters: [],
    bossHP: 0,
    maxBossHP: 0,
    timeLeftMs: 0,
    connected: false,
    victory: false,
  };

  // ── DOM scaffolding ─────────────────────────────────────────────────────
  stage.innerHTML = '';
  const shakeWrap = make('div', 'shake-wrap');
  shakeWrap.style.cssText = 'position:absolute;inset:0;';
  const bossEl = make('div', 'boss');
  const phaseBanner = make('div', 'phase-banner');
  phaseBanner.style.display = 'none';
  const chatterStrip = make('div', 'chatter-strip');
  const lurkerRibbon = make('div', 'lurker-ribbon');
  lurkerRibbon.style.display = 'none';
  const connPill = make('div', 'conn-pill');
  connPill.textContent = 'connecting…';

  const fxCanvas = document.createElement('canvas');
  fxCanvas.className = 'fx-canvas';
  fxCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
  const dmgCanvas = document.createElement('canvas');
  dmgCanvas.className = 'dmg-canvas';
  dmgCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';

  shakeWrap.append(bossEl, phaseBanner, chatterStrip, lurkerRibbon, fxCanvas, dmgCanvas);
  stage.append(shakeWrap, connPill);

  // ── Subsystems ──────────────────────────────────────────────────────────
  const particles = createParticleSystem(fxCanvas);
  const damageNumbers = createDamageNumbers(dmgCanvas);
  const shake = createShake(shakeWrap);
  const flash = createFlash(bossEl);
  const spotlights = createSpotlightTracker();
  const onPhaseChange = bindMusicToPhase(() => state.phase);

  // Audio must be unlocked by a user gesture (browser autoplay policy).
  // OBS browser sources often allow autoplay; for local testing the user can
  // click the page once.
  ['click', 'keydown', 'touchstart'].forEach((ev) =>
    document.addEventListener(ev, () => sfx.unlock(), { once: true }),
  );

  // Chatter id → screen-space position cache, refreshed each frame from the
  // chatter strip's DOM. Used by VFX handlers.
  const chatterPosCache = new Map();
  function refreshChatterPositions() {
    chatterPosCache.clear();
    for (const el of chatterStrip.querySelectorAll('[data-chatter]')) {
      const r = el.getBoundingClientRect();
      chatterPosCache.set(el.dataset.chatter, [r.left + r.width / 2, r.top + r.height / 2]);
    }
  }
  function getChatterPos(login) { return chatterPosCache.get(login) || null; }
  function getBossPos() {
    const r = bossEl.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  }

  const vfx = buildVfxHandlers({
    getBossPos, getChatterPos, particles, damageNumbers, shake, flash, sfx,
  });

  // ── WebSocket ───────────────────────────────────────────────────────────
  const useDemo = isDemoBuild();
  const wsUrl = useDemo ? 'demo://' : computeWsUrl();
  const factory = useDemo ? createFakeOverlayClient : createWsClient;
  const client = factory(wsUrl, (msg) => {
    handleServerMessage(msg);
    state.connected = true;
    updateConnPill();
  });
  if (!useDemo) client.send(C2S.HELLO_OVERLAY, { channelId, lang: i18n.locale });

  function handleServerMessage(msg) {
    switch (msg.type) {
      case S2C.WELCOME: {
        Object.assign(state, msg.payload);
        if (state.monster) {
          state.bossHP = state.bossHP || derivedHP(state.monster);
          state.maxBossHP = state.maxBossHP || derivedHP(state.monster);
        }
        renderHud();
        return;
      }
      case S2C.STATE_DELTA: {
        const events = msg.payload.events || [];
        Object.assign(state, msg.payload);
        // Track spotlights pulled from events so the renderer keeps those
        // chatters as individual sprites for their highlight window.
        for (const e of events) {
          if (e.kind === 'HERO_SPOTLIGHT' && e.chatterId) spotlights.add(e.chatterId);
        }
        spotlights.sweep();
        renderHud();
        refreshChatterPositions();
        for (const e of events) {
          const handler = vfx[e.kind];
          if (handler) handler(e);
        }
        return;
      }
      case S2C.MONSTER_UPDATED: {
        state.monster = msg.payload.monster;
        renderHud();
        return;
      }
      case S2C.PHASE_CHANGE: {
        state.phase = msg.payload.phase;
        if (msg.payload.timeLeftMs != null) state.timeLeftMs = msg.payload.timeLeftMs;
        onPhaseChange(state.phase);
        if (state.phase === PHASE.RESULTS) sfx.play('death');
        renderHud();
        return;
      }
      case S2C.RESULTS: {
        state.victory = !!msg.payload.victory;
        renderHud();
        return;
      }
      default:
        return;
    }
  }

  function renderHud() {
    const appearance = state.monster?.appearance || DEFAULT_APPEARANCE;
    bossEl.innerHTML = renderMonsterSVG(appearance);

    if (state.monster) {
      const hp = state.bossHP || derivedHP(state.monster);
      const max = state.maxBossHP || derivedHP(state.monster);
      renderHpBar(stage, {
        hp, maxHp: max,
        name: state.monster.name,
        level: state.monster.level,
      });
    }

    // Phase banner
    phaseBanner.classList.remove('victory', 'defeat');
    if (state.phase === PHASE.LOBBY) {
      phaseBanner.style.display = '';
      const seconds = Math.max(0, Math.ceil((state.timeLeftMs || 0) / 1000));
      phaseBanner.textContent = i18n.t('lobby.countdown', { seconds });
    } else if (state.phase === PHASE.RESULTS) {
      phaseBanner.style.display = '';
      phaseBanner.classList.add(state.victory ? 'victory' : 'defeat');
      phaseBanner.textContent = i18n.t(state.victory ? 'fight.victory' : 'fight.defeat');
    } else if (state.phase === PHASE.IDLE || state.phase === PHASE.CREATION) {
      phaseBanner.style.display = '';
      phaseBanner.textContent = i18n.t('lobby.joining');
    } else {
      phaseBanner.style.display = 'none';
    }

    // Lurker CTA — only during fight phase, encourages new chatters in.
    if (state.phase === PHASE.FIGHT) {
      lurkerRibbon.style.display = '';
      const count = state.chatters?.length || 0;
      lurkerRibbon.innerHTML = `type <span class="cmd-sample">!attack</span> to join · ${count} fighting`;
    } else {
      lurkerRibbon.style.display = 'none';
    }

    // Tier-aware rendering: pick which chatters are individual vs mob-grouped.
    const plan = buildRenderPlan(state.chatters || [], spotlights.map);
    syncChatterSprites(chatterStrip, plan.individuals, Date.now());
    syncMobSprites(chatterStrip, plan.mobs);
  }

  function updateConnPill() {
    if (state.connected) {
      connPill.textContent = 'live';
      connPill.classList.remove('conn-bad');
    } else {
      connPill.textContent = 'reconnecting…';
      connPill.classList.add('conn-bad');
    }
  }

  // 60fps render loop for canvas-based effects (particles + damage numbers).
  let lastT = performance.now();
  function loop(now) {
    const dt = Math.min(64, now - lastT);
    lastT = now;
    particles.step(dt);
    damageNumbers.step(dt);
    particles.render();
    damageNumbers.render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  renderHud();

  void EVENTS; // imported for future panel-side handlers; not used here yet
}

function make(tag, cls) { const el = document.createElement(tag); if (cls) el.className = cls; return el; }
function computeWsUrl() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws`;
}
function derivedHP(monster) {
  const def = STAT_DEFS.hp;
  const spent = monster.statPointsSpent?.hp || 0;
  return def.base + spent * def.perPoint;
}
