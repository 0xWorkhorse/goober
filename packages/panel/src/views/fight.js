import { ABILITY_BY_ID, C2S, PHASE } from '@bossraid/shared';

import { el, escapeHtml } from './chrome.js';
import { buildDashboard, monsterStage } from './dashboard.js';

/**
 * FIGHT phase view — left column: top-damage MVPs + chat pulse stats.
 * Center: monster + HP bar + floating damage numbers + lurker ribbon.
 * Right: 3 ability buttons (cooldown rings) + OBS preview tile.
 */
export function renderFight(root, ctx) {
  root.innerHTML = '';
  const m = ctx.state.monster;
  if (!m) return;

  const left = buildLeftMVPs(ctx);
  const right = buildAbilityPanel(ctx);

  const { stage } = monsterStage(m.appearance, { level: m.level || 1 });
  const overlays = buildFightOverlays(ctx);

  root.appendChild(buildDashboard({ left, center: { stage, overlays }, right }));
}

function buildLeftMVPs(ctx) {
  const wrap = el('div');
  wrap.innerHTML = `<h4>Top damage</h4>`;
  const sorted = [...(ctx.state.chatters || [])].sort((a, b) => b.damageDealt - a.damageDealt).slice(0, 6);
  for (const c of sorted) {
    const r = el('div', 'stat-block');
    r.innerHTML = `<span style="color:var(--accent-3)">${escapeHtml(c.login)}</span><span class="val">${c.damageDealt || 0}</span>`;
    wrap.appendChild(r);
  }
  if (!sorted.length) {
    const empty = el('p');
    empty.style.cssText = 'font-family:var(--font-marker);color:var(--ink-2);font-size:13px;margin:0;';
    empty.textContent = 'no damage yet — hold tight';
    wrap.appendChild(empty);
  }
  const pulseHead = el('h4');
  pulseHead.style.marginTop = '12px';
  pulseHead.textContent = 'Pulse';
  wrap.appendChild(pulseHead);
  const r1 = el('div', 'stat-block');
  r1.innerHTML = `<span>active joiners</span><span class="val">${ctx.state.chatters?.length || 0}</span>`;
  const r2 = el('div', 'stat-block');
  const totalDamage = (ctx.state.chatters || []).reduce((s, c) => s + (c.damageDealt || 0), 0);
  r2.innerHTML = `<span>damage taken</span><span class="val">${totalDamage}</span>`;
  wrap.append(r1, r2);
  return wrap;
}

function buildFightOverlays(ctx) {
  const layer = el('div');
  layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;';

  // HP bar pinned to the top
  const hpWrap = el('div');
  hpWrap.style.cssText = 'position:absolute;top:18px;left:6%;right:6%;';
  const hpHead = el('div');
  hpHead.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:6px;';
  const m = ctx.state.monster;
  hpHead.innerHTML = `
    <span style="font-family:var(--font-hand);font-size:24px">${escapeHtml(m?.name || '')}</span>
    <span class="lvl-badge">Lv ${m?.level || 1} · ${m?.wins || 0} wins</span>
  `;
  hpWrap.appendChild(hpHead);
  const bar = el('div', 'hpbar');
  const pct = ctx.state.maxBossHP > 0 ? (ctx.state.bossHP / ctx.state.maxBossHP) * 100 : 0;
  const fill = el('div', 'fill'); fill.style.width = pct + '%';
  const pips = el('div', 'pips');
  for (let i = 0; i < 10; i++) pips.appendChild(el('i'));
  const lbl = el('div', 'label');
  lbl.textContent = `${Math.round(ctx.state.bossHP || 0)} / ${Math.round(ctx.state.maxBossHP || 0)} HP`;
  bar.append(fill, pips, lbl);
  hpWrap.appendChild(bar);
  layer.appendChild(hpWrap);

  // Timer top-right
  const timer = el('div');
  timer.style.cssText = 'position:absolute;top:14px;right:14px;text-align:center;';
  timer.innerHTML = `
    <div class="timer-label">TIME LEFT</div>
    <div class="timer">${formatTime(ctx.state.timeLeftMs || 0)}</div>
  `;
  layer.appendChild(timer);

  // Floating damage numbers from the most recent state delta's events
  for (const [i, ev] of (ctx.state.events || []).slice(-4).entries()) {
    if (ev.kind === 'CHATTER_ATTACK' || ev.kind === 'BOSS_BASIC_ATTACK' || ev.kind === 'BOSS_CRIT' || ev.kind === 'BOSS_ABILITY') {
      const dmg = ev.dmg || ev.damageDealt;
      if (!dmg) continue;
      const isCrit = ev.kind === 'BOSS_CRIT';
      const isHit = ev.kind === 'CHATTER_ATTACK' || ev.kind === 'BOSS_ABILITY';
      const pos = randomFightPos(i);
      const num = el('div', 'flying-num');
      num.style.cssText = `top:${pos.top};left:${pos.left};font-size:${isCrit ? 44 : isHit ? 36 : 28}px;color:${isCrit ? 'var(--hp)' : isHit ? 'var(--accent)' : 'var(--ink)'};transform:rotate(${pos.rot}deg);`;
      num.textContent = isCrit ? `CRIT −${dmg}` : `−${dmg}`;
      layer.appendChild(num);
    }
  }

  // Lurker ribbon
  const ribbon = el('div', 'lurker-ribbon');
  ribbon.innerHTML = `type <span class="cmd-sample">!attack</span> to join · ${ctx.state.chatters?.length || 0} fighting`;
  layer.appendChild(ribbon);
  return layer;
}

function buildAbilityPanel(ctx) {
  const wrap = el('div');
  wrap.innerHTML = `
    <h4>Streamer cast</h4>
    <p style="font-family:var(--font-marker);font-size:13px;color:var(--ink-2);margin:0;">
      Hit your monster's specials — overlay reacts.
    </p>
  `;
  const grid = el('div', 'ability-grid');
  const m = ctx.state.monster;
  const ids = m?.abilityIds || [];
  for (let slot = 0; slot < 3; slot++) {
    const id = ids[slot];
    const ab = id ? ABILITY_BY_ID[id] : null;
    const cd = ctx.state.cooldowns?.[slot];
    const remaining = cd?.remainingMs || 0;
    const total = ab?.cooldownMs || 1;
    const pct = remaining > 0 ? (1 - remaining / total) : 1;
    const disabled = !ab || ctx.state.phase !== PHASE.FIGHT || remaining > 0 ? '1' : '0';
    const btn = el('div', 'ability');
    btn.dataset.disabled = disabled;
    btn.innerHTML = `
      ${cooldownRing(pct, remaining > 0 ? Math.ceil(remaining / 1000) + 's' : '✓')}
      <span class="name">${ab ? ab.id.replace('_', ' ') : '—'}</span>
      <span class="meta">${ab ? (ab.damage > 0 ? 'dmg ' + ab.damage : 'utility') : 'empty'}</span>
      <span class="key">${['Q', 'W', 'E'][slot]}</span>
    `;
    btn.addEventListener('click', () => {
      if (disabled === '1') return;
      ctx.send(C2S.CAST_ABILITY, { slot });
    });
    grid.appendChild(btn);
  }
  wrap.appendChild(grid);

  const obsHead = el('h4');
  obsHead.style.marginTop = '12px';
  obsHead.textContent = 'OBS preview';
  wrap.appendChild(obsHead);
  const obsCard = el('div');
  obsCard.style.cssText = 'background:transparent;border:2.4px dashed var(--ink-2);border-radius:8px;padding:10px;font-family:var(--font-marker);font-size:13px;color:var(--ink-2);';
  obsCard.innerHTML = `transparent · 1920×1080<br><span style="color:var(--accent-2)">● live</span> on Browser Source`;
  wrap.appendChild(obsCard);

  // Force-end button at the bottom
  const forceEnd = el('button', 'btn ghost tiny');
  forceEnd.style.marginTop = '8px';
  forceEnd.textContent = '⏹ force end fight';
  forceEnd.addEventListener('click', () => ctx.send(C2S.END_FIGHT_FORCE, {}));
  wrap.appendChild(forceEnd);
  return wrap;
}

function cooldownRing(pct, text) {
  const C = 2 * Math.PI * 18;
  return `<svg class="cooldown-ring" viewBox="0 0 44 44">
    <circle cx="22" cy="22" r="18" fill="none" stroke="#e5dfd0" stroke-width="4" />
    <circle cx="22" cy="22" r="18" fill="none" stroke="#d56a3e" stroke-width="4"
      stroke-linecap="round"
      stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"
      transform="rotate(-90 22 22)" />
    <text x="22" y="26" text-anchor="middle" font-family="Kalam, cursive" font-size="13" fill="#1a1614">${escapeHtml(text)}</text>
  </svg>`;
}

function randomFightPos(seed) {
  const positions = [
    { top: '24%', left: '32%', rot: -8 },
    { top: '40%', left: '70%', rot: 6 },
    { top: '60%', left: '24%', rot: -4 },
    { top: '32%', left: '60%', rot: 4 },
  ];
  return positions[seed % positions.length];
}

function formatTime(ms) {
  if (!ms || ms < 0) return '0:00';
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
