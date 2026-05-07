/**
 * 3-up onboarding pick — the "click 2" of the 2-click flow. Three random
 * preset monsters from the Goober Bestiary (Bean Guy, Box Head, Worry Egg…)
 * with their hand-drawn ink sprites and taglines. Click → fight.
 *
 * "↻ reroll all" rolls fresh candidates from the bestiary.
 * "＋ build from scratch" falls through to the legacy slot-by-slot creator.
 */

import {
  ABILITIES_PER_MONSTER, ABILITY_BY_ID, ABILITY_POOL, BESTIARY,
  C2S, PRESET_KEYS,
  STARTING_STAT_POINTS, STAT_DEFS,
} from '@bossraid/shared';
import { renderMonsterSVG } from '@bossraid/shared/monster';

import { el, escapeHtml } from './chrome.js';

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
    preview.innerHTML = renderMonsterSVG({ presetKey: c.presetKey, expr: c.expr, variant: c.variant }, { level: 1, anim: 'spawn' });
    const name = el('div', 'name');
    name.textContent = c.name;
    const tag = el('div');
    tag.style.cssText = 'font-family:var(--font-marker);font-size:13px;color:var(--ink-2);text-align:center;margin-top:-2px;font-style:italic;';
    tag.textContent = c.tagline;
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
    cta.textContent = `Fight with ${c.name.split(' ')[0]} →`;
    cta.addEventListener('click', () => commitCandidate(ctx, c));
    card.append(preview, name, tag, statRow, abilRow, cta);
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
  // Three distinct preset keys, three different stat profiles.
  const keys = shuffle([...PRESET_KEYS]).slice(0, 3);
  const profiles = [
    { hp: 6, attack: 1, defense: 0, speed: 1, crit: 1, abilityPower: 1 },
    { hp: 8, attack: 0, defense: 2, speed: 0, crit: 0, abilityPower: 0 },
    { hp: 4, attack: 3, defense: 0, speed: 1, crit: 2, abilityPower: 0 },
  ];
  return keys.map((k, i) => {
    const meta = BESTIARY[k];
    return {
      presetKey: k,
      name: meta.name,
      tagline: meta.tagline,
      expr: meta.defaultExpr,
      variant: 'normal',
      abilityIds: rollAbilities(),
      spent: profiles[i],
    };
  });
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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
  ctx.send(C2S.START_NEW_MONSTER, {});
  setTimeout(() => {
    // Send the preset key inside the appearance config. The server's existing
    // creator validates appearance, so we tunnel presetKey alongside whatever
    // legacy slot fields it expects (kept null).
    ctx.send(C2S.PICK_APPEARANCE, {
      appearance: {
        presetKey: candidate.presetKey,
        expr: candidate.expr,
        variant: candidate.variant,
        // Legacy slot fields included for back-compat with the validator.
        body: 'blob', eyes: 'googly', mouth: 'fangs', horns: 'antennae', arms: 'noodle', feet: 'tentacles', paletteIdx: 0,
      },
    });
    ctx.send(C2S.PICK_ABILITIES, { abilityIds: candidate.abilityIds });
    ctx.send(C2S.ALLOCATE_STARTING_STATS, { spent: padToBudget(candidate.spent) });
    ctx.send(C2S.CONFIRM_MONSTER, { name: candidate.name });
    ctx.pickUi = null;
  }, 60);
}

function padToBudget(spent) {
  const total = Object.values(spent).reduce((s, n) => s + (n || 0), 0);
  if (total === STARTING_STAT_POINTS) return spent;
  const next = { ...spent };
  next.hp = (next.hp || 0) + (STARTING_STAT_POINTS - total);
  return next;
}

void ABILITIES_PER_MONSTER;
void ABILITY_BY_ID;

// Compat re-export
export const renderCreator = renderOnboardingPick;
