import {
  ABILITIES_PER_MONSTER,
  ABILITY_BY_ID,
  C2S,
  STAT_DEFS,
  STAT_NAMES,
  STAT_POINTS_PER_LEVEL,
  STAT_POINT_HARD_CAP,
} from '@bossraid/shared';

/**
 * Level-up: streamer allocates 3 stat points (delta on top of existing) and
 * optionally rerolls one ability slot using a reroll token.
 */
export function renderLevelUp(root, ctx) {
  if (!ctx.levelUi) {
    ctx.levelUi = {
      delta: zeroSpend(),
      rerollSlot: null,        // index 0..2 once a roll is in flight
      rerollOptions: null,     // ability roll for the active slot
    };
  }
  const ui = ctx.levelUi;
  if (ctx.pendingAbilityRoll) {
    ui.rerollOptions = ctx.pendingAbilityRoll;
    ui.rerollSlot = ctx.pendingAbilityRollSlot ?? ui.rerollSlot;
    ctx.pendingAbilityRoll = null;
    ctx.pendingAbilityRollSlot = null;
  }

  root.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'col';

  const m = ctx.state.monster;
  const head = document.createElement('div');
  head.className = 'card';
  head.innerHTML = `
    <h1 class="banner victory">${escapeHtml(m?.name)} levels up to ${m?.level}.</h1>
    <p>Allocate <b>${STAT_POINTS_PER_LEVEL} stat points</b> and (optionally) reroll one ability slot.</p>
  `;
  wrap.appendChild(head);

  // Stat allocator
  const statsCard = document.createElement('div');
  statsCard.className = 'card col';
  const remaining = STAT_POINTS_PER_LEVEL - sumSpent(ui.delta);
  const statsHead = document.createElement('h2');
  statsHead.textContent = `Spend ${STAT_POINTS_PER_LEVEL} stat points (${remaining} left)`;
  statsCard.appendChild(statsHead);

  for (const name of STAT_NAMES) {
    const def = STAT_DEFS[name];
    const totalSpent = (m?.statPointsSpent?.[name] || 0) + (ui.delta[name] || 0);
    const row = document.createElement('div');
    row.className = 'alloc-row';
    row.innerHTML = `
      <div>
        <div class="stat-name">${def.label}</div>
        <div style="font-size:11px;opacity:0.6">currently ${m?.statPointsSpent?.[name] || 0} pts · +${def.perPoint}/pt</div>
      </div>
      <div style="color:var(--accent-2);font-variant-numeric:tabular-nums">${def.base + totalSpent * def.perPoint}</div>
    `;
    const ctl = document.createElement('div');
    ctl.className = 'alloc-pts';
    const minus = document.createElement('button');
    minus.textContent = '−';
    minus.disabled = (ui.delta[name] || 0) === 0;
    minus.addEventListener('click', () => { ui.delta[name]--; ctx.rerender(); });
    const val = document.createElement('span');
    val.style.minWidth = '24px'; val.style.textAlign = 'center'; val.style.fontWeight = '700';
    val.textContent = ui.delta[name] || 0;
    const plus = document.createElement('button');
    plus.textContent = '+';
    plus.disabled = remaining === 0 || totalSpent >= STAT_POINT_HARD_CAP;
    plus.addEventListener('click', () => { ui.delta[name] = (ui.delta[name] || 0) + 1; ctx.rerender(); });
    ctl.append(minus, val, plus);
    row.appendChild(ctl);
    statsCard.appendChild(row);
  }
  wrap.appendChild(statsCard);

  // Ability reroll
  const abilityCard = document.createElement('div');
  abilityCard.className = 'card col';
  abilityCard.innerHTML = `<h2>Abilities · reroll tokens: <b>${m?.rerollTokens || 0}</b></h2>`;
  const abilityRow = document.createElement('div');
  abilityRow.className = 'ability-row';
  for (let slot = 0; slot < ABILITIES_PER_MONSTER; slot++) {
    const id = m?.abilityIds?.[slot];
    const ab = id ? ABILITY_BY_ID[id] : null;
    const cell = document.createElement('div');
    cell.className = 'ability';
    cell.innerHTML = ab ? `<div class="ability-name">${ab.id.replace('_', ' ')}</div>
      <div class="ability-meta">cd ${ab.cooldownMs / 1000}s</div>` : '';
    const btn = document.createElement('button');
    btn.style.marginTop = '8px';
    btn.textContent = (m?.rerollTokens || 0) > 0 ? 'Reroll' : 'No tokens';
    btn.disabled = !((m?.rerollTokens || 0) > 0);
    btn.addEventListener('click', () => {
      ctx.pendingAbilityRollSlot = slot;
      ctx.send(C2S.REROLL_ABILITY, { slot });
    });
    cell.appendChild(btn);
    abilityRow.appendChild(cell);
  }
  abilityCard.appendChild(abilityRow);

  if (ui.rerollOptions && ui.rerollSlot != null) {
    const reroll = document.createElement('div');
    reroll.className = 'col';
    reroll.style.marginTop = '12px';
    const head = document.createElement('p');
    head.innerHTML = `Pick one to replace slot <b>${ui.rerollSlot + 1}</b>, or close to keep the original.`;
    const grid = document.createElement('div');
    grid.className = 'ability-roll';
    for (const ability of ui.rerollOptions) {
      const card = document.createElement('div');
      card.className = 'ability-card';
      card.innerHTML = `
        <div class="ability-name">${ability.id.replace('_', ' ')}</div>
        <div class="ability-meta">${ability.damage > 0 ? `dmg ${ability.damage}` : 'utility'} · cd ${ability.cooldownMs / 1000}s</div>
      `;
      card.addEventListener('click', () => {
        ctx.send(C2S.REPLACE_ABILITY, { slot: ui.rerollSlot, abilityId: ability.id });
        ui.rerollSlot = null; ui.rerollOptions = null;
        ctx.rerender();
      });
      grid.appendChild(card);
    }
    const close = document.createElement('button');
    close.className = 'ghost';
    close.textContent = 'Keep original (token already spent)';
    close.addEventListener('click', () => {
      ui.rerollSlot = null; ui.rerollOptions = null; ctx.rerender();
    });
    reroll.append(head, grid, close);
    abilityCard.appendChild(reroll);
  }

  wrap.appendChild(abilityCard);

  // Confirm
  const ctl = document.createElement('div');
  ctl.className = 'card row between';
  ctl.innerHTML = `<span class="stat-name">${remaining === 0 ? 'Allocation complete.' : `Spend all ${STAT_POINTS_PER_LEVEL} points before continuing.`}</span>`;
  const next = document.createElement('button');
  next.className = 'primary';
  next.textContent = 'Continue to next fight →';
  next.disabled = remaining !== 0;
  next.addEventListener('click', () => {
    ctx.send(C2S.ALLOCATE_LEVEL_STATS, { spent: ui.delta });
    ctx.send(C2S.CONFIRM_LEVEL_UP, {});
    ctx.levelUi = null;
  });
  ctl.appendChild(next);
  wrap.appendChild(ctl);

  root.appendChild(wrap);
}

function zeroSpend() { return STAT_NAMES.reduce((a, k) => ((a[k] = 0), a), {}); }
function sumSpent(s) { return STAT_NAMES.reduce((acc, k) => acc + (s[k] || 0), 0); }
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
