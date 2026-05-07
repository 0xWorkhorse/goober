import {
  C2S, PALETTES, PART_SLOTS, PART_SLOT_NAMES, PHASE,
  STAT_DEFS, STAT_NAMES, deriveStats,
} from '@bossraid/shared';

import { el, escapeHtml } from './chrome.js';
import { buildDashboard, monsterStage, topBanner } from './dashboard.js';

/**
 * IDLE phase — streamer has an active monster and is between fights. The
 * dashboard shows current abilities + stats on the left, the monster centered
 * with inline slot-edit dots, and an "open lobby" CTA on the right.
 *
 * LOBBY phase — same shell, but left column shows joiners + minimum CTA,
 * right column shows the lobby countdown + extend/start-now controls.
 */
export function renderIdleOrLobby(root, ctx) {
  root.innerHTML = '';
  const m = ctx.state.monster;
  if (!m || m.status !== 'active') {
    // No monster yet — show an empty card with a "create one" prompt.
    const card = el('div');
    card.className = 'dash-single';
    card.innerHTML = `
      <h1 class="banner big">No monster yet.</h1>
      <p style="font-family:var(--font-marker);font-size:16px">Pick one to start fighting.</p>
    `;
    const btn = el('button', 'btn primary giant');
    btn.textContent = 'Pick a monster →';
    btn.addEventListener('click', () => ctx.send(C2S.START_NEW_MONSTER, {}));
    card.appendChild(btn);
    root.appendChild(card);
    return;
  }

  const isLobby = ctx.state.phase === PHASE.LOBBY;
  const stats = deriveStats(m.statPointsSpent || {});

  const left = isLobby ? buildLobbyJoiners(ctx) : buildIdleStats(m, stats);
  const right = isLobby ? buildLobbyControls(ctx) : buildIdleControls(ctx);

  const { stage } = monsterStage(m.appearance, { level: m.level || 1 });
  const overlays = el('div');
  overlays.appendChild(topBanner(`${m.name || 'monster'} · Lv ${m.level || 1} · ${m.wins || 0} wins`));

  if (!isLobby) {
    // Inline slot-edit dots and popover (open via slot click)
    overlays.appendChild(buildSlotDots(ctx, m));
    if (ctx.editingSlot) overlays.appendChild(buildSlotPopover(ctx, m));
    // Sticky note hint
    const note = el('div', 'sticky');
    note.style.cssText = 'position:absolute;bottom:24px;right:24px;';
    note.innerHTML = 'click any dot to<br>swap that part';
    overlays.appendChild(note);
  } else {
    // Lobby: show the lurker nudge near the monster
    const nudge = el('div', 'chat-nudge');
    nudge.style.cssText = 'position:absolute;bottom:24px;left:24px;';
    nudge.innerHTML = `chat: type <code>!join</code> in the next ${Math.ceil((ctx.state.timeLeftMs || 0) / 1000)}s`;
    overlays.appendChild(nudge);
  }

  root.appendChild(buildDashboard({ left, center: { stage, overlays }, right }));
}

function buildIdleStats(m, stats) {
  const wrap = el('div');
  const head = el('h4');
  head.textContent = 'Abilities';
  wrap.appendChild(head);
  for (const id of (m.abilityIds || [])) {
    const row = el('div', 'stat-block');
    row.innerHTML = `<span style="text-transform:capitalize">${id.replace('_', ' ')}</span><span class="val">⚔</span>`;
    wrap.appendChild(row);
  }
  const statsHead = el('h4');
  statsHead.style.marginTop = '10px';
  statsHead.textContent = 'Stats';
  wrap.appendChild(statsHead);
  for (const k of STAT_NAMES) {
    const row = el('div', 'stat-block');
    row.innerHTML = `<span>${shortStat(k)}</span><span class="val">${stats[k]}</span>`;
    wrap.appendChild(row);
  }
  return wrap;
}

function shortStat(k) {
  return ({ hp: 'HP', attack: 'ATK', defense: 'DEF', speed: 'SPD', crit: 'CRT', abilityPower: 'AP' }[k] || k.toUpperCase());
}

function buildIdleControls(ctx) {
  const wrap = el('div');
  wrap.innerHTML = `
    <h4>Lobby setup</h4>
    <div class="stat-block"><span>Lobby length</span><span class="val">30s</span></div>
    <div class="stat-block"><span>Fight length</span><span class="val">2:00</span></div>
    <div class="stat-block"><span>Min joiners</span><span class="val">5</span></div>
  `;
  const open = el('button', 'btn primary giant');
  open.style.cssText = 'margin-top:auto;align-self:stretch;';
  open.textContent = '⚔ Open lobby';
  open.addEventListener('click', () => ctx.send(C2S.START_LOBBY, {}));
  wrap.appendChild(open);
  const small = el('p');
  small.style.cssText = 'font-family:var(--font-marker);font-size:13px;color:var(--ink-2);text-align:center;margin:6px 0 0;';
  small.textContent = 'chat will see the join banner instantly';
  wrap.appendChild(small);
  // Secondary actions
  const actions = el('div');
  actions.style.cssText = 'display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;';
  const fresh = el('button', 'btn ghost tiny');
  fresh.textContent = '↻ pick a new monster';
  fresh.addEventListener('click', () => ctx.send(C2S.START_NEW_MONSTER, {}));
  actions.append(fresh);
  wrap.appendChild(actions);
  return wrap;
}

function buildLobbyJoiners(ctx) {
  const wrap = el('div');
  const count = ctx.state.chatters?.length || 0;
  wrap.innerHTML = `<h4>Joiners <span style="color:var(--accent)">· ${count}</span></h4>`;
  const list = el('div');
  list.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-content:flex-start;overflow:auto;max-height:380px;';
  for (const c of (ctx.state.chatters || []).slice(0, 28)) {
    const chip = el('span', 'pulse-msg');
    chip.style.cssText = 'padding:2px 10px;font-size:13px;';
    chip.innerHTML = `<span class="who">${escapeHtml(c.login)}</span>`;
    list.appendChild(chip);
  }
  if (count > 28) {
    const more = el('span', 'pulse-msg');
    more.style.cssText = 'padding:2px 10px;font-size:13px;background:var(--paper-2);';
    more.textContent = `+ ${count - 28} more`;
    list.appendChild(more);
  }
  wrap.appendChild(list);
  return wrap;
}

function buildLobbyControls(ctx) {
  const wrap = el('div');
  const time = formatTime(ctx.state.timeLeftMs || 0);
  wrap.innerHTML = `
    <h4>Time left</h4>
    <div style="display:flex;align-items:center;gap:14px;">
      <div>
        <div class="timer-label">LOBBY CLOSES IN</div>
        <div class="timer">${time}</div>
      </div>
    </div>
    <h4 style="margin-top:14px">Quick actions</h4>
  `;
  const startNow = el('button', 'btn');
  startNow.textContent = '⚔ start now';
  startNow.addEventListener('click', () => { /* no-op in demo / handled by server in prod */ });
  const cancel = el('button', 'btn ghost');
  cancel.textContent = 'cancel';
  cancel.addEventListener('click', () => ctx.send(C2S.END_FIGHT_FORCE, {}));
  wrap.append(startNow, cancel);

  const bonusHead = el('h4');
  bonusHead.style.marginTop = '14px';
  bonusHead.textContent = 'Bonuses unlocked';
  wrap.appendChild(bonusHead);
  const count = ctx.state.chatters?.length || 0;
  for (const [thr, label] of [[5, 'fight enabled'], [10, '+10% loot'], [25, 'rare drop'], [100, 'legendary']]) {
    const r = el('div', 'stat-block' + (count >= thr ? '' : ' muted'));
    r.innerHTML = `<span>${thr}+ joiners</span><span class="val">${count >= thr ? '✓ ' + label : '— ' + label}</span>`;
    wrap.appendChild(r);
  }
  return wrap;
}

function formatTime(ms) {
  if (!ms || ms < 0) return '0:00';
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ─── Slot-edit dots + popover ──────────────────────────────────────────────
const SLOT_POSITIONS = {
  horns: { top: '4%', left: '50%', transform: 'translateX(-50%)' },
  eyes: { top: '32%', left: '50%', transform: 'translateX(-50%)' },
  mouth: { top: '52%', left: '50%', transform: 'translateX(-50%)' },
  arms: { top: '50%', left: '4%' },
  feet: { bottom: '4%', left: '50%', transform: 'translateX(-50%)' },
  body: { top: '50%', right: '4%' },
};

function buildSlotDots(ctx, _monster) {
  const layer = el('div');
  layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
  // Center the dots on the inner sprite's bounding region.
  const inner = el('div');
  inner.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:min(72%, 460px);aspect-ratio:0.78;pointer-events:none;';
  for (const slot of PART_SLOT_NAMES) {
    const dot = el('div', 'slot-dot' + (ctx.editingSlot === slot ? ' active' : ''));
    dot.dataset.slot = slot;
    dot.title = slot;
    dot.textContent = '+';
    dot.style.pointerEvents = 'auto';
    Object.assign(dot.style, SLOT_POSITIONS[slot] || { top: '50%', left: '50%' });
    dot.addEventListener('click', () => {
      ctx.editingSlot = ctx.editingSlot === slot ? null : slot;
      ctx.rerender();
    });
    inner.appendChild(dot);
  }
  layer.appendChild(inner);
  return layer;
}

function buildSlotPopover(ctx, monster) {
  const slot = ctx.editingSlot;
  const choices = PART_SLOTS[slot] || [];
  const pop = el('div', 'slot-popover');
  pop.style.cssText = 'top:50%;left:60%;transform:translate(-10%, -50%);';
  const close = el('button', 'btn tiny ghost');
  close.style.cssText = 'position:absolute;top:6px;right:8px;';
  close.textContent = '✕';
  close.addEventListener('click', () => { ctx.editingSlot = null; ctx.rerender(); });

  if (slot === 'body') {
    // Body slot: edit body shape *and* palette (since palette tints accents).
    const t = el('div', 'title');
    t.textContent = 'BODY SHAPE';
    pop.append(close, t);
    const opts = el('div', 'opts');
    for (const c of choices) {
      const b = el('button', 'opt' + (monster.appearance?.body === c ? ' on' : ''));
      b.textContent = c;
      b.addEventListener('click', () => {
        ctx.send(C2S.PICK_APPEARANCE, { appearance: { ...monster.appearance, body: c } });
      });
      opts.appendChild(b);
    }
    pop.appendChild(opts);
    const palT = el('div', 'title');
    palT.style.marginTop = '6px';
    palT.textContent = 'ACCENT PALETTE';
    pop.appendChild(palT);
    const pal = el('div', 'palette');
    PALETTES.forEach((p, idx) => {
      const b = el('button', monster.appearance?.paletteIdx === idx ? 'on' : '');
      b.style.background = `linear-gradient(90deg, ${p.primary} 50%, ${p.accent} 50%)`;
      b.addEventListener('click', () => {
        ctx.send(C2S.PICK_APPEARANCE, { appearance: { ...monster.appearance, paletteIdx: idx } });
      });
      pal.appendChild(b);
    });
    pop.appendChild(pal);
  } else {
    const t = el('div', 'title');
    t.textContent = slot.toUpperCase();
    pop.append(close, t);
    const opts = el('div', 'opts');
    for (const c of choices) {
      const b = el('button', 'opt' + (monster.appearance?.[slot] === c ? ' on' : ''));
      b.textContent = c;
      b.addEventListener('click', () => {
        ctx.send(C2S.PICK_APPEARANCE, { appearance: { ...monster.appearance, [slot]: c } });
      });
      opts.appendChild(b);
    }
    pop.appendChild(opts);
  }
  return pop;
}

// Backwards-compat — app.js imports renderLobby
export const renderLobby = renderIdleOrLobby;
