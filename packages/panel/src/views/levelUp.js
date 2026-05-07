import {
  ABILITIES_PER_MONSTER, ABILITY_BY_ID, C2S,
  STAT_DEFS, STAT_NAMES, STAT_POINTS_PER_LEVEL, STAT_POINT_HARD_CAP,
} from '@bossraid/shared';

import { el } from './chrome.js';
import { buildDashboard, monsterStage } from './dashboard.js';

/**
 * LEVEL_UP phase view — left col allocates 3 stat points, center shows the
 * leveled-up monster with the evolution bracket legend, right col offers an
 * ability reroll + "next fight" CTA.
 */
export function renderLevelUp(root, ctx) {
  if (!ctx.levelUi) {
    ctx.levelUi = { delta: zeroSpend(), rerollSlot: null, rerollOptions: null };
  }
  const ui = ctx.levelUi;
  if (ctx.pendingAbilityRoll) {
    ui.rerollOptions = ctx.pendingAbilityRoll;
    ui.rerollSlot = ctx.pendingAbilityRollSlot ?? ui.rerollSlot;
    ctx.pendingAbilityRoll = null;
    ctx.pendingAbilityRollSlot = null;
  }

  root.innerHTML = '';
  const m = ctx.state.monster;
  if (!m) return;

  const left = buildAllocator(ctx, ui);
  const right = buildReroll(ctx, ui);

  const { stage } = monsterStage(m.appearance, { level: m.level || 1 });
  const overlays = el('div');
  const banner = el('div');
  banner.style.cssText = 'position:absolute;top:18px;left:50%;transform:translateX(-50%);';
  const evoLabel = m.level >= 10 ? 'TROPHY UNLOCKED' : m.level >= 7 ? 'CROWN + CAPE' : m.level >= 5 ? 'AURA UNLOCKED' : m.level >= 3 ? 'SCARS GAINED' : 'LEVEL UP';
  banner.innerHTML = `<span class="phase-chip victory"><span class="blip"></span>LEVEL ${m.level} — ${evoLabel}</span>`;
  overlays.appendChild(banner);

  const legend = el('div');
  legend.style.cssText = 'position:absolute;bottom:24px;left:24px;display:flex;flex-direction:column;gap:6px;';
  for (const [lv, what] of [[3, 'scars'], [5, 'glow aura'], [7, 'crown + cape'], [10, 'trophy pin']]) {
    const ok = m.level >= lv;
    const b = el('span', 'lvl-badge');
    b.style.cssText = `opacity:${ok ? 1 : 0.45};${ok ? 'background:#fff7c2;' : ''}`;
    b.textContent = `${ok ? '✓' : '—'} lv ${lv} · ${what}`;
    legend.appendChild(b);
  }
  overlays.appendChild(legend);

  const sticky = el('div', 'sticky');
  sticky.style.cssText = 'position:absolute;bottom:24px;right:24px;';
  sticky.innerHTML = "it's earning a<br>reputation 👑";
  overlays.appendChild(sticky);

  root.appendChild(buildDashboard({ left, center: { stage, overlays }, right }));
}

function buildAllocator(ctx, ui) {
  const wrap = el('div');
  const m = ctx.state.monster;
  const remaining = STAT_POINTS_PER_LEVEL - sumSpent(ui.delta);
  wrap.innerHTML = `<h4>+${STAT_POINTS_PER_LEVEL} stat points <span style="color:var(--accent)">· ${remaining} left</span></h4>`;

  for (const name of STAT_NAMES) {
    const def = STAT_DEFS[name];
    const totalSpent = (m?.statPointsSpent?.[name] || 0) + (ui.delta[name] || 0);
    const derived = def.base + totalSpent * def.perPoint;
    const row = el('div', 'alloc-row');
    const lbl = el('div');
    lbl.innerHTML = `
      <div class="alloc-label">${shortStat(name)}</div>
      <div style="font-size:11px;color:var(--ink-2);">+${def.perPoint}/pt</div>
    `;
    const val = el('span', 'alloc-derived');
    val.textContent = derived;
    const ctl = el('div', 'alloc-pts');
    const minus = el('button', 'btn tiny');
    minus.textContent = '−';
    minus.disabled = (ui.delta[name] || 0) === 0;
    minus.addEventListener('click', () => { ui.delta[name]--; ctx.rerender(); });
    const plus = el('button', 'btn tiny primary');
    plus.textContent = '+';
    plus.disabled = remaining === 0 || totalSpent >= STAT_POINT_HARD_CAP;
    plus.addEventListener('click', () => { ui.delta[name] = (ui.delta[name] || 0) + 1; ctx.rerender(); });
    ctl.append(minus, plus);
    row.append(lbl, val, ctl);
    wrap.appendChild(row);
  }

  const note = el('p');
  note.style.cssText = 'font-family:var(--font-marker);color:var(--ink-2);font-size:13px;margin:6px 0 0;';
  note.textContent = remaining === 0 ? 'allocation complete.' : `spend all ${STAT_POINTS_PER_LEVEL} points to continue.`;
  wrap.appendChild(note);
  return wrap;
}

function buildReroll(ctx, ui) {
  const wrap = el('div');
  const m = ctx.state.monster;
  wrap.innerHTML = `<h4>Reroll one ability · <span style="color:var(--accent)">${m?.rerollTokens || 0} token(s)</span></h4>`;

  for (let slot = 0; slot < ABILITIES_PER_MONSTER; slot++) {
    const id = m?.abilityIds?.[slot];
    const ab = id ? ABILITY_BY_ID[id] : null;
    const row = el('div', 'stat-block');
    const isRolling = ui.rerollSlot === slot;
    if (isRolling) row.style.outline = '2.4px solid var(--accent)';
    row.innerHTML = `<span style="text-transform:capitalize">${ab ? ab.id.replace('_', ' ') : '—'}${isRolling ? ' <em style="color:var(--accent)">· rerolling</em>' : ''}</span><span class="val">⚔</span>`;
    wrap.appendChild(row);
  }

  const rerollBtn = el('button', 'btn');
  rerollBtn.textContent = '↻ roll a new ability';
  rerollBtn.disabled = !((m?.rerollTokens || 0) > 0);
  rerollBtn.addEventListener('click', () => {
    const slot = (m.abilityIds || []).length > 0 ? 1 : 0;
    ctx.pendingAbilityRollSlot = slot;
    ctx.send(C2S.REROLL_ABILITY, { slot });
  });
  wrap.appendChild(rerollBtn);

  if (ui.rerollOptions && ui.rerollSlot != null) {
    const head = el('p');
    head.style.cssText = 'font-family:var(--font-marker);font-size:13px;margin:6px 0 0;';
    head.innerHTML = `Pick one to replace slot <b>${ui.rerollSlot + 1}</b>:`;
    wrap.appendChild(head);
    const grid = el('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;';
    for (const ability of ui.rerollOptions) {
      const card = el('div', 'stat-block');
      card.style.cssText = 'cursor:pointer;background:var(--paper);';
      card.innerHTML = `<span style="text-transform:capitalize">${ability.id.replace('_', ' ')}</span><span class="val">${ability.damage > 0 ? ability.damage : 'util'}</span>`;
      card.addEventListener('click', () => {
        ctx.send(C2S.REPLACE_ABILITY, { slot: ui.rerollSlot, abilityId: ability.id });
        ui.rerollSlot = null; ui.rerollOptions = null;
        ctx.rerender();
      });
      grid.appendChild(card);
    }
    wrap.appendChild(grid);
  }

  const next = el('button', 'btn primary giant');
  next.style.cssText = 'margin-top:auto;align-self:stretch;';
  next.textContent = '⚔ Next fight →';
  const remaining = STAT_POINTS_PER_LEVEL - sumSpent(ui.delta);
  next.disabled = remaining !== 0;
  next.addEventListener('click', () => {
    ctx.send(C2S.ALLOCATE_LEVEL_STATS, { spent: ui.delta });
    ctx.send(C2S.CONFIRM_LEVEL_UP, {});
    ctx.levelUi = null;
  });
  wrap.appendChild(next);
  return wrap;
}

function shortStat(k) {
  return ({ hp: 'HP', attack: 'ATK', defense: 'DEF', speed: 'SPD', crit: 'CRT', abilityPower: 'AP' }[k] || k.toUpperCase());
}
function zeroSpend() { return STAT_NAMES.reduce((a, k) => ((a[k] = 0), a), {}); }
function sumSpent(s) { return STAT_NAMES.reduce((acc, k) => acc + (s[k] || 0), 0); }
