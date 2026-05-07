/**
 * WebSocket message contracts. The envelope is versioned so additive event
 * types can ship without desyncing overlays mid-deploy. Breaking changes bump
 * the version; overlays should refuse to render on mismatch.
 *
 * Wire format: { v: 1, type: <C2S|S2C constant>, payload: <object> }
 */

export const PROTOCOL_VERSION = 1;

/** Client → Server message types. */
export const C2S = Object.freeze({
  HELLO_PANEL: 'hello_panel',
  HELLO_OVERLAY: 'hello_overlay',

  START_NEW_MONSTER: 'start_new_monster',
  PICK_APPEARANCE: 'pick_appearance',
  REQUEST_ABILITY_ROLL: 'request_ability_roll',
  PICK_ABILITIES: 'pick_abilities',
  ALLOCATE_STARTING_STATS: 'allocate_starting_stats',
  CONFIRM_MONSTER: 'confirm_monster',

  START_LOBBY: 'start_lobby',
  CAST_ABILITY: 'cast_ability',
  END_FIGHT_FORCE: 'end_fight_force',

  ALLOCATE_LEVEL_STATS: 'allocate_level_stats',
  REROLL_ABILITY: 'reroll_ability',
  REPLACE_ABILITY: 'replace_ability',
  CONFIRM_LEVEL_UP: 'confirm_level_up',

  REVIVE_MONSTER: 'revive_monster',
  ABANDON_MONSTER: 'abandon_monster',

  SET_LOCALE: 'set_locale',
});

/** Server → Client message types. */
export const S2C = Object.freeze({
  WELCOME: 'welcome',
  STATE_DELTA: 'state_delta',
  PHASE_CHANGE: 'phase_change',

  ABILITY_ROLL: 'ability_roll',
  MONSTER_UPDATED: 'monster_updated',

  RESULTS: 'results',
  RUN_OVER: 'run_over',

  IRC_STATUS: 'irc_status',
  ERROR: 'error',
});

/** State-delta event kinds. The overlay's VFX_HANDLERS keys correspond to these. */
export const EVENTS = Object.freeze({
  CHATTER_JOINED: 'CHATTER_JOINED',
  CHATTER_ATTACK: 'CHATTER_ATTACK',
  CHATTER_HEAL: 'CHATTER_HEAL',
  CHATTER_BLOCK: 'CHATTER_BLOCK',
  CHATTER_DOWN: 'CHATTER_DOWN',
  BOSS_BASIC_ATTACK: 'BOSS_BASIC_ATTACK',
  BOSS_ABILITY: 'BOSS_ABILITY',
  BOSS_HIT: 'BOSS_HIT',
  BOSS_CRIT: 'BOSS_CRIT',
  HERO_SPOTLIGHT: 'HERO_SPOTLIGHT',
  // Telegraphed signature mechanic — the boss winds up a big move that
  // chat has a chance to react to.
  BOSS_TELEGRAPH_START: 'BOSS_TELEGRAPH_START',
  BOSS_TELEGRAPH_HIT: 'BOSS_TELEGRAPH_HIT',
  // Phase changes at HP thresholds — opening / enraged / desperation.
  BOSS_PHASE_CHANGE: 'BOSS_PHASE_CHANGE',
});

/** Phase identifiers — the combat state machine. */
export const PHASE = Object.freeze({
  CREATION: 'creation',
  IDLE: 'idle',
  LOBBY: 'lobby',
  FIGHT: 'fight',
  RESULTS: 'results',
  LEVEL_UP: 'level_up',
  DEATH: 'death',
});

/**
 * @param {string} type
 * @param {object} [payload]
 */
export function envelope(type, payload = {}) {
  return { v: PROTOCOL_VERSION, type, payload };
}
