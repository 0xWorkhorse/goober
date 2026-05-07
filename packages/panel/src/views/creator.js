import {
  ABILITIES_PER_MONSTER,
  ABILITY_BY_ID,
  C2S,
  PALETTES,
  PART_SLOTS,
  PART_SLOT_NAMES,
  S2C,
  STARTING_STAT_POINTS,
  STAT_DEFS,
  STAT_NAMES,
  STAT_POINT_HARD_CAP,
  deriveStats,
} from '@bossraid/shared';
import { DEFAULT_APPEARANCE, renderMonsterSVG } from '@bossraid/shared/monster';

/**
 * Monster creator view. The flow has three stages — appearance, abilities,
 * stats+name. Appearance changes broadcast to the overlay live so chat watches
 * the monster come together piece by piece.
 *
 * Local UI state is owned by the view; the canonical draft lives on the server.
 * We send messages eagerly and reconcile on incoming MONSTER_UPDATED.
 */
export function renderCreator(root, ctx) {
  // If the room transitioned to CREATION without a draft monster (fresh
  // streamer, just logged in), auto-fire START_NEW_MONSTER so the creator
  // has something to manipulate.
  const m = ctx.state.monster;
  if (!m || m.status !== 'draft') {
    ctx.send(C2S.START_NEW_MONSTER, {});
    root.innerHTML = '<div class="card"><h2>Building draft monster…</h2></div>';
    return;
  }
  // Owned UI state across rerenders.
  if (!ctx.creatorUi) {
    ctx.creatorUi = {
      stage: 'appearance', // 'appearance' | 'abilities' | 'stats'
      abilityOptions: null,
      pickedAbilityIds: [],
      spent: zeroSpend(),
      name: m.name === 'unnamed' ? '' : m.name || '',
    };
  }
  const ui = ctx.creatorUi;
  // The server returns ABILITY_ROLL options via a transient message. The
  // app shell shoves them onto ctx.creatorUi via the messageBus.
  if (ctx.pendingAbilityRoll) {
    ui.abilityOptions = ctx.pendingAbilityRoll;
    ctx.pendingAbilityRoll = null;
  }

  root.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'col';

  const header = document.createElement('div');
  header.className = 'card row between';
  header.innerHTML = `
    <h2>New monster — <span class="phase-chip">${stageLabel(ui.stage)}</span></h2>
    <div class="row" style="gap:6px">
      ${renderStageDot('appearance', ui.stage)}
      ${renderStageDot('abilities', ui.stage)}
      ${renderStageDot('stats', ui.stage)}
    </div>
  `;
  wrap.appendChild(header);

  if (ui.stage === 'appearance') wrap.appendChild(buildAppearanceStage(ctx));
  else if (ui.stage === 'abilities') wrap.appendChild(buildAbilityStage(ctx));
  else wrap.appendChild(buildStatsStage(ctx));

  root.appendChild(wrap);
}

// ─── Stage 1: appearance ────────────────────────────────────────────────────
function buildAppearanceStage(ctx) {
  const ui = ctx.creatorUi;
  const appearance = ctx.state.monster?.appearance || DEFAULT_APPEARANCE;

  const card = document.createElement('div');
  card.className = 'card creator-grid';

  const preview = document.createElement('div');
  preview.className = 'creator-preview';
  preview.innerHTML = renderMonsterSVG(appearance);

  const controls = document.createElement('div');
  controls.className = 'creator-controls';
  for (const slot of PART_SLOT_NAMES) {
    const row = document.createElement('div');
    row.className = 'slot-row';
    const name = document.createElement('div');
    name.className = 'slot-name';
    name.textContent = slot;
    row.appendChild(name);
    for (const choice of PART_SLOTS[slot]) {
      const b = document.createElement('button');
      b.textContent = choice;
      if (appearance[slot] === choice) b.classList.add('on');
      b.addEventListener('click', () => {
        const next = { ...appearance, [slot]: choice };
        ctx.send(C2S.PICK_APPEARANCE, { appearance: next });
      });
      row.appendChild(b);
    }
    controls.appendChild(row);
  }
  // Palette
  const palRow = document.createElement('div');
  palRow.className = 'palette-row';
  PALETTES.forEach((p, idx) => {
    const b = document.createElement('button');
    b.style.background = `linear-gradient(90deg, ${p.primary} 50%, ${p.accent} 50%)`;
    if (appearance.paletteIdx === idx) b.classList.add('on');
    b.addEventListener('click', () => {
      ctx.send(C2S.PICK_APPEARANCE, { appearance: { ...appearance, paletteIdx: idx } });
    });
    palRow.appendChild(b);
  });
  const palLabel = document.createElement('div');
  palLabel.className = 'slot-name';
  palLabel.textContent = 'palette';
  controls.appendChild(palLabel);
  controls.appendChild(palRow);

  // Random + next
  const actions = document.createElement('div');
  actions.className = 'row';
  actions.style.marginTop = '12px';
  actions.style.gap = '10px';
  const rand = document.createElement('button');
  rand.textContent = 'Randomize';
  rand.addEventListener('click', () => {
    const a = randomAppearance();
    ctx.send(C2S.PICK_APPEARANCE, { appearance: a });
  });
  const next = document.createElement('button');
  next.className = 'primary';
  next.textContent = 'Next: abilities →';
  next.addEventListener('click', () => {
    ui.stage = 'abilities';
    if (!ui.abilityOptions) ctx.send(C2S.REQUEST_ABILITY_ROLL, {});
    ctx.rerender();
  });
  actions.append(rand, next);
  controls.appendChild(actions);

  card.append(preview, controls);
  return card;
}

// ─── Stage 2: abilities ─────────────────────────────────────────────────────
function buildAbilityStage(ctx) {
  const ui = ctx.creatorUi;
  const card = document.createElement('div');
  card.className = 'card col';

  const desc = document.createElement('p');
  desc.innerHTML = 'Pick <b>3 of 6</b> abilities. Damage / AOE / utility — mix as you like.';
  card.appendChild(desc);

  if (!ui.abilityOptions) {
    const waiting = document.createElement('p');
    waiting.className = 'stat-name';
    waiting.textContent = 'Rolling abilities…';
    card.appendChild(waiting);
    return card;
  }

  const grid = document.createElement('div');
  grid.className = 'ability-roll';
  for (const ability of ui.abilityOptions) {
    const b = document.createElement('div');
    b.className = 'ability-card';
    if (ui.pickedAbilityIds.includes(ability.id)) b.classList.add('on');
    b.innerHTML = `
      <div class="ability-name">${ability.id.replace('_', ' ')}</div>
      <div class="ability-meta">${ability.damage > 0 ? `dmg ${ability.damage}` : 'utility'} · cd ${ability.cooldownMs / 1000}s</div>
    `;
    b.addEventListener('click', () => {
      const set = new Set(ui.pickedAbilityIds);
      if (set.has(ability.id)) set.delete(ability.id);
      else if (set.size < ABILITIES_PER_MONSTER) set.add(ability.id);
      ui.pickedAbilityIds = [...set];
      ctx.rerender();
    });
    grid.appendChild(b);
  }
  card.appendChild(grid);

  const actions = document.createElement('div');
  actions.className = 'row between';
  const back = document.createElement('button');
  back.className = 'ghost';
  back.textContent = '← back';
  back.addEventListener('click', () => { ui.stage = 'appearance'; ctx.rerender(); });
  const reroll = document.createElement('button');
  reroll.textContent = 'Reroll all 6';
  reroll.addEventListener('click', () => { ui.pickedAbilityIds = []; ctx.send(C2S.REQUEST_ABILITY_ROLL, {}); ui.abilityOptions = null; ctx.rerender(); });
  const next = document.createElement('button');
  next.className = 'primary';
  next.textContent = 'Next: stats →';
  next.disabled = ui.pickedAbilityIds.length !== ABILITIES_PER_MONSTER;
  next.addEventListener('click', () => {
    ctx.send(C2S.PICK_ABILITIES, { abilityIds: ui.pickedAbilityIds });
    ui.stage = 'stats';
    ctx.rerender();
  });
  actions.append(back, reroll, next);
  card.appendChild(actions);

  return card;
}

// ─── Stage 3: stats + name + confirm ────────────────────────────────────────
function buildStatsStage(ctx) {
  const ui = ctx.creatorUi;
  const card = document.createElement('div');
  card.className = 'card col';

  const remaining = STARTING_STAT_POINTS - sumSpent(ui.spent);

  const head = document.createElement('h2');
  head.textContent = `Allocate ${STARTING_STAT_POINTS} starting points (${remaining} left)`;
  card.appendChild(head);

  for (const name of STAT_NAMES) {
    const def = STAT_DEFS[name];
    const row = document.createElement('div');
    row.className = 'alloc-row';
    const label = document.createElement('div');
    label.innerHTML = `<div class="stat-name">${def.label}</div>
      <div style="font-size:11px;opacity:0.6">+${def.perPoint} per point</div>`;
    const derived = deriveStats({ ...zeroSpend(), [name]: ui.spent[name] });
    const preview = document.createElement('div');
    preview.style.color = 'var(--accent-2)';
    preview.style.fontVariantNumeric = 'tabular-nums';
    preview.textContent = `${derived[name]}`;
    const ctl = document.createElement('div');
    ctl.className = 'alloc-pts';
    const minus = document.createElement('button');
    minus.textContent = '−';
    minus.disabled = ui.spent[name] === 0;
    minus.addEventListener('click', () => { ui.spent[name]--; ctx.rerender(); });
    const val = document.createElement('span');
    val.style.minWidth = '24px';
    val.style.textAlign = 'center';
    val.style.fontWeight = '700';
    val.textContent = ui.spent[name];
    const plus = document.createElement('button');
    plus.textContent = '+';
    plus.disabled = remaining === 0 || ui.spent[name] >= STAT_POINT_HARD_CAP;
    plus.addEventListener('click', () => { ui.spent[name]++; ctx.rerender(); });
    ctl.append(minus, val, plus);
    row.append(label, preview, ctl);
    card.appendChild(row);
  }

  // Name + confirm
  const nameRow = document.createElement('div');
  nameRow.className = 'row';
  nameRow.style.marginTop = '12px';
  nameRow.style.gap = '10px';
  const input = document.createElement('input');
  input.placeholder = 'Name your monster';
  input.maxLength = 20;
  input.value = ui.name;
  input.style.cssText = 'flex:1;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--bg-card-hi);color:var(--text);font:inherit';
  input.addEventListener('input', () => { ui.name = input.value; });
  nameRow.appendChild(input);
  card.appendChild(nameRow);

  const actions = document.createElement('div');
  actions.className = 'row between';
  const back = document.createElement('button');
  back.className = 'ghost';
  back.textContent = '← back';
  back.addEventListener('click', () => { ui.stage = 'abilities'; ctx.rerender(); });
  const confirm = document.createElement('button');
  confirm.className = 'primary';
  confirm.textContent = 'Confirm and continue';
  confirm.disabled = remaining !== 0 || !ui.name.trim();
  confirm.addEventListener('click', () => {
    ctx.send(C2S.ALLOCATE_STARTING_STATS, { spent: ui.spent });
    ctx.send(C2S.CONFIRM_MONSTER, { name: ui.name.trim() });
    ctx.creatorUi = null;
  });
  actions.append(back, confirm);
  card.appendChild(actions);

  // Show the abilities they picked as a reminder.
  const ids = ui.pickedAbilityIds;
  if (ids?.length) {
    const ab = document.createElement('div');
    ab.className = 'row';
    ab.style.marginTop = '12px';
    ab.style.flexWrap = 'wrap';
    ab.innerHTML = ids
      .map((id) => `<span class="phase-chip">${ABILITY_BY_ID[id]?.id?.replace('_', ' ') || id}</span>`)
      .join('');
    card.appendChild(ab);
  }

  return card;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function stageLabel(s) { return s; }
function renderStageDot(name, current) {
  const filled = name === current ? 'background:var(--accent)' : 'background:var(--bg-card-hi)';
  return `<span style="width:10px;height:10px;border-radius:50%;${filled}"></span>`;
}
function zeroSpend() {
  return STAT_NAMES.reduce((a, k) => ((a[k] = 0), a), {});
}
function sumSpent(s) { return STAT_NAMES.reduce((acc, k) => acc + (s[k] || 0), 0); }
function randomAppearance() {
  const a = {};
  for (const slot of PART_SLOT_NAMES) {
    const c = PART_SLOTS[slot];
    a[slot] = c[(Math.random() * c.length) | 0];
  }
  a.paletteIdx = (Math.random() * PALETTES.length) | 0;
  return a;
}

// Suppress unused warning during MVP.
void S2C;
