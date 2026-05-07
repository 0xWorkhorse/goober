/**
 * Gameplay constants. Single source of truth — no magic numbers in game logic.
 * Tuning these values is a balance question; instrument via fight_chatter_actions
 * and chat_events before changing.
 */

// ─── Timing ─────────────────────────────────────────────────────────────────
export const LOBBY_DURATION_MS = 30_000;
export const FIGHT_DURATION_MS = 120_000;
export const RESULTS_DURATION_MS = 8_000;
export const TICK_HZ = 30;
export const BROADCAST_HZ = 10;
export const TICK_MS = 1000 / TICK_HZ;
export const BROADCAST_MS = 1000 / BROADCAST_HZ;

// ─── Chatter throttling ─────────────────────────────────────────────────────
export const CHATTER_ACTION_COOLDOWN_MS = 3_000;
export const CHATTER_IDLE_PRUNE_MS = 60_000;

// ─── Monster appearance ─────────────────────────────────────────────────────
export const PART_SLOTS = Object.freeze({
  body: ['blob', 'lump', 'stack'],
  eyes: ['googly', 'beady', 'cyclops'],
  mouth: ['fangs', 'underbite', 'grin'],
  horns: ['nubs', 'curly', 'antennae'],
  arms: ['stubs', 'noodle', 'crab'],
  feet: ['paws', 'tentacles', 'wheels'],
});

export const PART_SLOT_NAMES = Object.freeze(Object.keys(PART_SLOTS));

/** 12 preset palettes — each pair is { primary, accent, outline }. */
export const PALETTES = Object.freeze([
  { primary: '#ff6b9d', accent: '#ffd166', outline: '#3a1c4a' },
  { primary: '#7ec4cf', accent: '#f6c453', outline: '#1d3557' },
  { primary: '#a3d977', accent: '#f25c54', outline: '#264653' },
  { primary: '#c490e4', accent: '#9bf6ff', outline: '#3d2c5e' },
  { primary: '#ffa07a', accent: '#3ddc97', outline: '#3b1c32' },
  { primary: '#74c0fc', accent: '#ff8cc6', outline: '#1b3a4b' },
  { primary: '#ffd166', accent: '#06d6a0', outline: '#3d2914' },
  { primary: '#ef476f', accent: '#ffd166', outline: '#2b1d2e' },
  { primary: '#8ac926', accent: '#1982c4', outline: '#1a2d12' },
  { primary: '#b8b8ff', accent: '#ffafcc', outline: '#2e1a47' },
  { primary: '#fb6f92', accent: '#ffe5ec', outline: '#3d1a2c' },
  { primary: '#9381ff', accent: '#fbff12', outline: '#1d1a3a' },
]);

// ─── Stats ──────────────────────────────────────────────────────────────────
export const STAT_DEFS = Object.freeze({
  hp: { base: 3000, perPoint: 200, label: 'health' },
  attack: { base: 25, perPoint: 3, label: 'attack power' },
  defense: { base: 0, perPoint: 2, label: 'defense' },
  speed: { base: 100, perPoint: 5, label: 'speed' },
  crit: { base: 5, perPoint: 2, label: 'crit chance' },
  abilityPower: { base: 100, perPoint: 8, label: 'ability power' },
});

export const STAT_NAMES = Object.freeze(Object.keys(STAT_DEFS));

export const STARTING_STAT_POINTS = 10;
export const STAT_POINTS_PER_LEVEL = 3;
export const STAT_POINT_HARD_CAP = 30;

export const DEFENSE_CAP_PCT = 50;
export const CRIT_CAP_PCT = 50;
export const CRIT_DAMAGE_MULTIPLIER = 2;

// ─── Boss melee cadence (ms between basic attacks at speed=100) ─────────────
export const BOSS_BASE_ATTACK_INTERVAL_MS = 4_500;

// ─── Abilities ──────────────────────────────────────────────────────────────
/**
 * Ability definitions, bucketed by archetype. Roll algorithm picks 2 from each
 * bucket (no duplicates) for the streamer's 6-option roster.
 *
 * `id` is the stable English-keyed identifier — never translated. Display name
 * comes from locale files keyed by id.
 */
export const ABILITY_POOL = Object.freeze({
  damage: [
    { id: 'slam', cooldownMs: 6_000, damage: 80, targets: 1, vfx: 'impact_amber' },
    { id: 'cleave', cooldownMs: 7_000, damage: 60, targets: 3, vfx: 'arc_red' },
    { id: 'pierce', cooldownMs: 5_000, damage: 100, targets: 1, vfx: 'spear_purple' },
    { id: 'stomp', cooldownMs: 8_000, damage: 50, targets: 5, vfx: 'shockwave_brown' },
  ],
  aoe: [
    { id: 'inferno', cooldownMs: 9_000, damage: 70, targets: 'all', vfx: 'fire_red' },
    {
      id: 'frost_nova',
      cooldownMs: 10_000,
      damage: 50,
      targets: 'all',
      effect: { kind: 'slow', durationMs: 2_000 },
      vfx: 'ice_blue',
    },
    { id: 'lightning', cooldownMs: 8_000, damage: 60, targets: 'all', vfx: 'bolt_yellow' },
    {
      id: 'poison_cloud',
      cooldownMs: 11_000,
      damage: 30,
      targets: 'all',
      effect: { kind: 'dot', durationMs: 5_000, tickDamage: 8 },
      vfx: 'cloud_green',
    },
  ],
  utility: [
    {
      id: 'roar',
      cooldownMs: 10_000,
      damage: 0,
      targets: 'self',
      effect: { kind: 'attack_buff', durationMs: 5_000, amount: 0.5 },
      vfx: 'roar_purple',
    },
    {
      id: 'heal',
      cooldownMs: 12_000,
      damage: 0,
      targets: 'self',
      effect: { kind: 'heal_pct', amount: 0.3 },
      vfx: 'heal_green',
    },
    {
      id: 'enrage',
      cooldownMs: 15_000,
      damage: 0,
      targets: 'self',
      effect: { kind: 'speed_buff', durationMs: 8_000, amount: 0.5 },
      vfx: 'rage_red',
    },
    {
      id: 'shield',
      cooldownMs: 14_000,
      damage: 0,
      targets: 'self',
      effect: { kind: 'shield', amount: 300 },
      vfx: 'shield_blue',
    },
  ],
});

/** Flat lookup by id. */
export const ABILITY_BY_ID = Object.freeze(
  Object.values(ABILITY_POOL)
    .flat()
    .reduce((acc, a) => {
      acc[a.id] = a;
      return acc;
    }, {}),
);

export const ABILITIES_PER_MONSTER = 3;
export const ABILITY_ROLL_SIZE = 6;
export const ABILITY_ROLL_PER_BUCKET = 2;

export const STARTING_REROLL_TOKENS = 1;
export const REROLL_TOKEN_PER_N_WINS = 3;

// ─── Run economy ────────────────────────────────────────────────────────────
export const REVIVE_BASE_COST = 5;
export const LEGACY_PER_WIN = 1;
export const LEGACY_DEATH_BONUS = 5;

/** Cost for the n-th revive (n >= 0). 5, 10, 20, 40, 80, ... */
export function reviveCost(timesRevived) {
  return REVIVE_BASE_COST * 2 ** timesRevived;
}

// ─── Chat scaling (unbounded chat support) ──────────────────────────────────
/** Chat damage multiplier from boss level (level 1 = 1.0x; level 10 = 2.35x). */
export const CHAT_DMG_LEVEL_SLOPE = 0.15;

/** Per-chatter damage softens past this count. Aligned with full-render tier. */
export const CHAT_DAMAGE_SOFTEN_BASELINE = 60;

/** Boss HP scales sub-linearly with crowd size past this baseline. */
export const BOSS_HP_CROWD_SCALE_BASELINE = 30;

// ─── Overlay rendering tiers (driven by chatter count) ──────────────────────
export const RENDER_TIER_FULL_MAX = 60;
export const RENDER_TIER_HYBRID_MAX = 200;
export const MOB_BUCKET_SIZE_HYBRID = 10;
export const MOB_BUCKET_SIZE_CROWD = 25;
export const HERO_SPOTLIGHT_DURATION_MS = 3_000;

// ─── Chat base damage (per-attack, before scaling) ──────────────────────────
export const CHATTER_BASE_ATTACK_DAMAGE = 25;
export const CHATTER_BASE_HEAL_AMOUNT = 50;
export const CHATTER_BLOCK_DR_PCT = 50;
export const CHATTER_BLOCK_DURATION_MS = 4_000;
export const CHATTER_BASE_HP = 100;

// ─── Locale ─────────────────────────────────────────────────────────────────
export const SUPPORTED_LOCALES = Object.freeze(['en', 'es', 'pt', 'ja', 'ko']);
export const DEFAULT_LOCALE = 'en';
