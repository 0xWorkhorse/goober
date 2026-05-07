/**
 * Mob aggregation rendering for high-count fights. Groups N chatters into a
 * single cluster sprite with a count badge. Mobs animate as a wobbling
 * cluster; their visual HP bar = sum of constituents.
 *
 * Tiering driven by total chatter count:
 *   ≤60        — every chatter individual (tier='full', no mobs)
 *   61–200     — top-N active individual + remainder bucketed into mobs of 10
 *   >200       — only hero-spotlights individual + everything else mobs of 25
 */

import {
  HERO_SPOTLIGHT_DURATION_MS,
  MOB_BUCKET_SIZE_CROWD,
  MOB_BUCKET_SIZE_HYBRID,
  RENDER_TIER_FULL_MAX,
  RENDER_TIER_HYBRID_MAX,
} from '@bossraid/shared';

import { renderChatterSVG } from './chatters.js';

export function pickTier(count) {
  if (count <= RENDER_TIER_FULL_MAX) return 'full';
  if (count <= RENDER_TIER_HYBRID_MAX) return 'hybrid';
  return 'crowd';
}

/**
 * Decide which chatters render as individuals vs in mobs.
 * @param {Array} chatters  current roster
 * @param {Map<string, number>} spotlights  login → expiresAtMs
 */
export function buildRenderPlan(chatters, spotlights, now = Date.now()) {
  const tier = pickTier(chatters.length);
  const spotlit = chatters.filter((c) => spotlights.get(c.login) > now);

  if (tier === 'full') {
    return { tier, individuals: chatters, mobs: [] };
  }

  if (tier === 'hybrid') {
    // Sort by recent activity (damageDealt as a proxy). Spotlights guaranteed in.
    const ranked = [...chatters].sort((a, b) => (b.damageDealt || 0) - (a.damageDealt || 0));
    const N = RENDER_TIER_FULL_MAX;
    const individuals = new Set([...spotlit, ...ranked.slice(0, N)].map((c) => c.login));
    const ind = chatters.filter((c) => individuals.has(c.login));
    const rest = chatters.filter((c) => !individuals.has(c.login));
    return { tier, individuals: ind, mobs: bucket(rest, MOB_BUCKET_SIZE_HYBRID) };
  }

  // Crowd
  const ind = spotlit;
  const indSet = new Set(ind.map((c) => c.login));
  const rest = chatters.filter((c) => !indSet.has(c.login));
  return { tier, individuals: ind, mobs: bucket(rest, MOB_BUCKET_SIZE_CROWD) };
}

function bucket(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    const members = arr.slice(i, i + size);
    out.push({
      id: 'mob_' + i,
      members,
      count: members.length,
      hp: members.reduce((s, m) => s + m.hp, 0),
      maxHp: members.reduce((s, m) => s + m.maxHp, 0),
    });
  }
  return out;
}

/** Track in-flight hero spotlights. */
export function createSpotlightTracker() {
  const map = new Map();
  return {
    add(login) { map.set(login, Date.now() + HERO_SPOTLIGHT_DURATION_MS); },
    sweep(now = Date.now()) { for (const [k, v] of map) if (v < now) map.delete(k); },
    map,
  };
}

/** SVG for a mob cluster — overlapping circles + count badge. */
export function renderMobSVG(mob) {
  const w = 80, h = 100;
  const dots = [];
  const max = Math.min(mob.count, 10); // cap visual density
  for (let i = 0; i < max; i++) {
    const angle = (Math.PI * 2 * i) / max;
    const radius = 18;
    const cx = w / 2 + Math.cos(angle) * radius * 0.7;
    const cy = h / 2 + Math.sin(angle) * radius * 0.6;
    const hue = (i * 67) % 360;
    dots.push(`<circle cx="${cx}" cy="${cy}" r="11" fill="hsl(${hue} 70% 60%)" stroke="#1a1a2e" stroke-width="2"/>`);
  }
  const dim = mob.hp <= 0 ? 0.35 : 1;
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="opacity:${dim}">
    ${dots.join('')}
    <g transform="translate(${w - 20}, 16)">
      <circle cx="0" cy="0" r="14" fill="#ffd166" stroke="#1a1a2e" stroke-width="2"/>
      <text x="0" y="4" text-anchor="middle" font-size="13" font-weight="700" fill="#1a1a2e">×${mob.count}</text>
    </g>
  </svg>`;
}

/** Sync mob DOM nodes alongside the existing individual chatter sprites. */
export function syncMobSprites(container, mobs) {
  const seen = new Set();
  for (const mob of mobs) {
    seen.add(mob.id);
    let el = container.querySelector(`[data-mob="${mob.id}"]`);
    if (!el) {
      el = document.createElement('div');
      el.className = 'chatter-sprite mob-sprite';
      el.dataset.mob = mob.id;
      const label = document.createElement('div');
      label.className = 'chatter-name';
      el.appendChild(label);
      const wrap = document.createElement('div');
      wrap.className = 'chatter-svg';
      el.appendChild(wrap);
      container.appendChild(el);
    }
    el.querySelector('.chatter-svg').innerHTML = renderMobSVG(mob);
    el.querySelector('.chatter-name').textContent = `${mob.count} fighters`;
  }
  for (const el of [...container.querySelectorAll('[data-mob]')]) {
    if (!seen.has(el.dataset.mob)) el.remove();
  }
}

/** Used for the test harness to compose a chatter sprite alongside mobs. */
export const __forTest = { renderChatterSVG };
