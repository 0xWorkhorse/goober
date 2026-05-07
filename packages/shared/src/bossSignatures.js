/**
 * Boss signature mechanics + phase transitions.
 *
 * Every preset monster has a *signature* attack: a telegraphed wind-up that
 * the overlay broadcasts loudly so chat has time to react with `!block` (or
 * `!heal` / `!attack`, depending on the kind). Resolution happens server-side
 * after the wind-up window expires.
 *
 * On top of that, every fight goes through three phases gated by the boss's
 * remaining HP — the cadence of signatures + basic attacks accelerates each
 * phase, turning the back half of every fight into a real moment.
 */

// ─── Phase config ──────────────────────────────────────────────────────────

export const BOSS_PHASES = Object.freeze([
  {
    id: 'p1',
    label: 'opening',
    hpRangeMin: 0.5, // active while bossHP/maxBossHP > 0.5
    signatureIntervalMs: 28_000,
    basicAttackMultiplier: 1.0,
  },
  {
    id: 'p2',
    label: 'enraged',
    hpRangeMin: 0.2,
    signatureIntervalMs: 16_000,
    basicAttackMultiplier: 0.7, // attacks come 30% faster
  },
  {
    id: 'p3',
    label: 'desperation',
    hpRangeMin: 0,
    signatureIntervalMs: 9_000,
    basicAttackMultiplier: 0.55,
  },
]);

/** Pick the right phase config given current HP ratio (0–1). */
export function bossPhaseFor(hpRatio) {
  for (const p of BOSS_PHASES) {
    if (hpRatio > p.hpRangeMin) return p;
  }
  return BOSS_PHASES[BOSS_PHASES.length - 1];
}

// ─── Signature kinds ───────────────────────────────────────────────────────
// Each kind describes how the wind-up resolves and which chat verb mitigates it.
//
//   target: 'all' | 'one' | 'half' | 'self_buff' | 'utility'
//   counter: 'block' | 'heal' | 'attack' | null
//   counterReductionPct: how much damage gets reduced if the chatter used the counter during the wind-up
//   damageMultiplier: scale of the boss `attack` stat
//   windUpMs: how long chat has to react

const SIG_DEFAULTS = {
  windUpMs: 4_000,
  damageMultiplier: 4,
  counter: 'block',
  counterReductionPct: 80,
};

/**
 * Per-preset signature registry. The slot-composer fallback uses a generic
 * 'big_swing' so non-preset monsters still get telegraphs.
 */
export const SIGNATURES = Object.freeze({
  bean: {
    name: 'BEAN SLAM',
    flavor: 'Borb is winding up a haymaker',
    target: 'one',
    damageMultiplier: 5,
    windUpMs: 4_000,
    counter: 'block',
    counterReductionPct: 85,
    vfx: 'impact_amber',
  },
  box: {
    name: 'BOX THROW',
    flavor: 'Wally locks on, ready to throw',
    target: 'one',
    damageMultiplier: 7,
    windUpMs: 4_500,
    counter: 'block',
    counterReductionPct: 90,
    vfx: 'spear_purple',
  },
  egg: {
    name: 'YOLK SPLASH',
    flavor: 'The yolk is cracking — heal, fast',
    target: 'all',
    damageMultiplier: 2,
    windUpMs: 3_500,
    counter: 'heal',
    counterReductionPct: 70,
    vfx: 'cloud_green',
  },
  cloud: {
    name: 'WHIRL STORM',
    flavor: 'Cloud Moss spins up a tempest',
    target: 'all',
    damageMultiplier: 1.6,
    windUpMs: 3_000,
    counter: 'block',
    counterReductionPct: 80,
    vfx: 'frost_nova',
  },
  spike: {
    name: 'SPIKE CHARGE',
    flavor: 'Spike Pup is winding up a lance',
    target: 'one',
    damageMultiplier: 8,
    windUpMs: 5_000,
    counter: 'block',
    counterReductionPct: 90,
    vfx: 'spear_purple',
  },
  slug: {
    name: 'SLIME TRAIL',
    flavor: 'Slug Nub oozes out a slowing slick',
    target: 'utility',
    damageMultiplier: 0,
    windUpMs: 4_000,
    counter: 'attack',
    counterReductionPct: 100, // attacking it cancels the slime entirely
    vfx: 'cloud_green',
    effect: { kind: 'cooldown_extend', ms: 5_000 },
  },
  lanky: {
    name: 'TALL SMASH',
    flavor: 'Lanky Larry winds up a long arc',
    target: 'half',
    damageMultiplier: 3,
    windUpMs: 4_000,
    counter: 'block',
    counterReductionPct: 80,
    vfx: 'shockwave_brown',
  },
  gloop: {
    name: 'EYE BEAM',
    flavor: 'Gloop locks one eye — duck',
    target: 'one',
    damageMultiplier: 9,
    windUpMs: 5_000,
    counter: 'block',
    counterReductionPct: 70,
    vfx: 'bolt_yellow',
  },
});

/** Generic signature for slot-composed (legacy) monsters with no preset. */
export const GENERIC_SIGNATURE = Object.freeze({
  name: 'BIG SWING',
  flavor: 'The monster is winding up',
  target: 'one',
  ...SIG_DEFAULTS,
  vfx: 'impact_amber',
});

export function getSignature(presetKey) {
  return SIGNATURES[presetKey] || GENERIC_SIGNATURE;
}
