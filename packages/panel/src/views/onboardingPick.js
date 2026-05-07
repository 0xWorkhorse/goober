/**
 * 3-up onboarding pick — the "click 2" of the 2-click flow. Auto-rolls 3
 * monster candidates server-side (random appearance + ability set + balanced
 * stats), shows them as cards, click → fight.
 *
 * The streamer can `↻ reroll all` to roll new candidates or
 * `＋ build from scratch` to fall through to the legacy slot-by-slot creator.
 */

import {
  ABILITIES_PER_MONSTER, ABILITY_BY_ID, ABILITY_POOL,
  C2S, PALETTES, PART_SLOTS, PART_SLOT_NAMES,
  STARTING_STAT_POINTS, STAT_DEFS,
} from '@bossraid/shared';
import { renderMonsterSVG } from '@bossraid/shared/monster';

import { el, escapeHtml } from './chrome.js';

// Picky pre-baked names for the 3 candidates. Designer's flavor.
const NAME_POOL = [
  'Borb', 'Wally', 'Yolkrid', 'Snoot', 'Brunch', 'Glubbins',
  'Cheese', 'Wiggle', 'Toastie', 'Pebble', 'Hex', 'Oink',
];

export function renderOnboardingPick(root, ctx) {
  if (!ctx.pickUi) ctx.pickUi = { candidates: rollCandidates(), seed: 1 };
  const ui = ctx.pickUi;

  root.innerHTML = '';
  const wrap = el('div', 'dash-single');

  const head = el('div');
  head.innerHTML = `
    <span class="banner-strip">step 2 of 2</span>
    <h2 style="font-family:var(--font-hand);font-weight:700;font-size:48px;margin:8px 0 0">Pick your fighter.</h2>
    <p style="font-family:var(--font-marker);font-size:16px;color:var(--ink-2);margin:4px 0 0;">
      Tweak parts and stats after your first run — see how chat reacts first.
    </p>
  `;
  wrap.appendChild(head);

  const grid = el('div', 'pick-grid');
  ui.candidates.forEach((c, i) => {
    const card = el('div', 'pick-card' + (i === 1 ? ' featured' : ''));
    const preview = el('div', 'preview');
    preview.innerHTML = renderMonsterSVG(c.appearance, { level: 1 });
    const name = el('div', 'name');
    name.textContent = c.name;
    const statRow = el('div', 'stat-row');
    statRow.innerHTML = `
      <span class="chip">HP ${derived(c, 'hp')}</span>
      <span class="chip">ATK ${derived(c, 'attack')}</span>
      <span class="chip">DEF ${derived(c, 'defense')}</span>
    `;
    const abilRow = el('div', 'stat-row');
    abilRow.innerHTML = c.abilityIds.map(
      (id) => `<span class="chip ability">${escapeHtml(id.replace('_', ' '))}</span>`,
    ).join('');
    const cta = el('button', 'btn primary lg');
    cta.style.cssText = 'margin-top:10px;align-self:stretch;';
    cta.textContent = `Fight with ${c.name} →`;
    cta.addEventListener('click', () => commitCandidate(ctx, c));
    card.append(preview, name, statRow, abilRow, cta);
    if (i === 1) {
      const note = el('div', 'sticky');
      note.style.cssText = 'position:absolute;top:-16px;right:-12px;font-size:15px;';
      note.innerHTML = 'chat seems to like<br>tanks 🛡';
      card.appendChild(note);
    }
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      commitCandidate(ctx, c);
    });
    grid.appendChild(card);
  });
  wrap.appendChild(grid);

  // Bottom action row
  const actions = el('div');
  actions.style.cssText = 'display:flex;gap:12px;align-items:center;flex-wrap:wrap;';
  const reroll = el('button', 'btn ghost');
  reroll.textContent = '↻ reroll all';
  reroll.addEventListener('click', () => {
    ui.candidates = rollCandidates();
    ui.seed++;
    ctx.rerender();
  });
  const fromScratch = el('button', 'btn ghost');
  fromScratch.textContent = '＋ build from scratch';
  fromScratch.addEventListener('click', () => {
    ctx.useFullCreator = true;
    ctx.rerender();
  });
  const tip = el('span');
  tip.style.cssText = 'margin-left:auto;font-family:var(--font-marker);font-size:14px;color:var(--ink-2);';
  tip.textContent = 'Tip: hit ⏎ to fight with the highlighted one';
  actions.append(reroll, fromScratch, tip);
  wrap.appendChild(actions);

  root.appendChild(wrap);
}

// ─── Candidate generation ──────────────────────────────────────────────────

function rollCandidates() {
  return [
    { name: pick(NAME_POOL) + ' ' + pick(['the Bean', 'Bean', 'Pup', 'Mk II']), appearance: rollAppearance(), abilityIds: rollAbilities(), spent: { hp: 6, attack: 1, defense: 0, speed: 1, crit: 1, abilityPower: 1 } },
    { name: pick(NAME_POOL) + ' Box', appearance: rollAppearance(), abilityIds: rollAbilities(), spent: { hp: 8, attack: 0, defense: 2, speed: 0, crit: 0, abilityPower: 0 } },
    { name: pick(NAME_POOL) + ' Egg', appearance: rollAppearance(), abilityIds: rollAbilities(), spent: { hp: 4, attack: 3, defense: 0, speed: 1, crit: 2, abilityPower: 0 } },
  ];
}

function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

function rollAppearance() {
  const a = {};
  for (const slot of PART_SLOT_NAMES) {
    const c = PART_SLOTS[slot];
    a[slot] = c[(Math.random() * c.length) | 0];
  }
  a.paletteIdx = (Math.random() * PALETTES.length) | 0;
  return a;
}

function rollAbilities() {
  return [
    pickFrom(ABILITY_POOL.damage),
    pickFrom(ABILITY_POOL.aoe),
    pickFrom(ABILITY_POOL.utility),
  ].map((a) => a.id);
}

function pickFrom(arr) { return arr[(Math.random() * arr.length) | 0]; }

function derived(c, stat) {
  const def = STAT_DEFS[stat];
  return def.base + (c.spent[stat] || 0) * def.perPoint;
}

// ─── Commit a candidate to the server ──────────────────────────────────────

function commitCandidate(ctx, candidate) {
  // The server side requires going through the full creator handshake. We
  // pipeline it: appearance → abilities → stats → confirm. For demo mode
  // these are all noops that resolve instantly via the fake WS client.
  ctx.send(C2S.START_NEW_MONSTER, {});
  // Wait one tick to give the server time to land in CREATION phase.
  setTimeout(() => {
    ctx.send(C2S.PICK_APPEARANCE, { appearance: candidate.appearance });
    ctx.send(C2S.PICK_ABILITIES, { abilityIds: candidate.abilityIds });
    ctx.send(C2S.ALLOCATE_STARTING_STATS, { spent: padToBudget(candidate.spent) });
    ctx.send(C2S.CONFIRM_MONSTER, { name: candidate.name });
    ctx.pickUi = null;
  }, 60);
}

function padToBudget(spent) {
  const total = Object.values(spent).reduce((s, n) => s + (n || 0), 0);
  if (total === STARTING_STAT_POINTS) return spent;
  // Pad/trim with HP to hit budget.
  const next = { ...spent };
  next.hp = (next.hp || 0) + (STARTING_STAT_POINTS - total);
  return next;
}

// Also export for the app shell to consume.
export const __for_test = { rollCandidates };

// Compat re-export for legacy import in app.js
export const renderCreator = renderOnboardingPick;
