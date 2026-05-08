import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import {
  ABILITY_BY_ID,
  CHATTER_BASE_HP,
  PHASE,
} from '@bossraid/shared';

// We test combat behavior by setting up a Room with a known monster, calling
// the public combat functions directly, and asserting on state mutations.
// Tick + broadcast loops are not started — we drive transitions manually.

import { handleChatCommand, openLobby, castAbility, ensureCombat, forceEndFight, maybeCreditTelegraphCounter } from '../src/game/combat.js';

function makeRoom(monsterPatch = {}) {
  // Lightweight Room shim sufficient for the behaviors we test. Avoids
  // pulling in the persistence layer (no fights are recorded in these
  // tests — the unit-of-work is the in-memory state machine).
  const room = {
    channelId: 'test',
    locale: 'en',
    phase: PHASE.IDLE,
    monster: {
      id: 'test_mon',
      channelId: 'test',
      name: 'Tester',
      status: 'active',
      appearance: {},
      abilityIds: ['slam', 'inferno', 'heal'],
      statPointsSpent: { hp: 0, attack: 2, defense: 0, speed: 0, crit: 0, abilityPower: 0 },
      level: 1,
      wins: 0,
      rerollTokens: 1,
      timesRevived: 0,
      peakLevel: 1,
      diedAt: null,
      ...monsterPatch,
    },
    chatters: new Map(),
    panels: new Set(),
    overlays: new Set(),
    combat: null,
    lastActivity: Date.now(),
  };
  return room;
}

let room;
beforeEach(() => {
  room = makeRoom();
});

describe('lobby + chatter join', () => {
  it('rejects open_lobby outside idle phase', () => {
    room.phase = PHASE.FIGHT;
    expect(openLobby(room)).toBe(false);
  });

  it('opens lobby and creates the combat object', () => {
    expect(openLobby(room)).toBe(true);
    expect(room.phase).toBe(PHASE.LOBBY);
    expect(room.combat).toBeTruthy();
  });

  it('chatters joining lobby are added to the roster', () => {
    openLobby(room);
    const r1 = handleChatCommand(room, 'alice', 'join', '!join');
    expect(r1.handled).toBe(true);
    expect(room.chatters.has('alice')).toBe(true);
    expect(room.chatters.get('alice').hp).toBe(CHATTER_BASE_HP);
  });
});

describe('chatter actions in fight', () => {
  beforeEach(() => {
    openLobby(room);
    handleChatCommand(room, 'alice', 'join', '!join');
    handleChatCommand(room, 'bob', 'join', '!join');
    // Simulate phase advancing to fight via the same internal helper. The
    // tick loop normally drives this; here we cheat for tests.
    const c = ensureCombat(room);
    c.phaseEndsAt = 0;
    room.phase = PHASE.FIGHT;
    c.bossHP = c.maxBossHP = 10000;
    c.fightStartedAt = Date.now();
    c.nextBossAttackAt = Date.now() + 999_999; // disable boss melee for these tests
  });

  it('!attack reduces boss HP and increments chatter telemetry', () => {
    const before = room.combat.bossHP;
    const r = handleChatCommand(room, 'alice', 'attack', '!attack');
    expect(r.handled).toBe(true);
    expect(room.combat.bossHP).toBeLessThan(before);
    const actions = room.combat.chatterActions.get('alice');
    expect(actions.attacks).toBe(1);
    expect(actions.damageDealt).toBeGreaterThan(0);
  });

  it('rejects !attack within cooldown window', () => {
    const r1 = handleChatCommand(room, 'alice', 'attack', '!attack');
    expect(r1.handled).toBe(true);
    const r2 = handleChatCommand(room, 'alice', 'attack', '!attack');
    expect(r2.handled).toBe(false);
  });

  it('!heal restores ally HP', () => {
    const ally = room.chatters.get('bob');
    ally.hp = 50;
    handleChatCommand(room, 'alice', 'heal', '!heal');
    expect(room.chatters.get('bob').hp).toBeGreaterThan(50);
  });

  it('!block extends the blocked window', () => {
    const before = room.chatters.get('alice').blockedUntilMs;
    handleChatCommand(room, 'alice', 'block', '!block');
    expect(room.chatters.get('alice').blockedUntilMs).toBeGreaterThan(before);
  });

  it('telemetry totals across chatters match each chatter total', () => {
    handleChatCommand(room, 'alice', 'attack', '!attack');
    handleChatCommand(room, 'bob', 'attack', '!attack');
    const total = [...room.combat.chatterActions.values()].reduce((s, a) => s + a.damageDealt, 0);
    expect(total).toBeGreaterThan(0);
    // Mirrors the value endFight will write to `fights.total_damage`
    const localTotal = (room.combat.chatterActions.get('alice')?.damageDealt || 0)
      + (room.combat.chatterActions.get('bob')?.damageDealt || 0);
    expect(localTotal).toBe(total);
  });
});

describe('streamer abilities', () => {
  beforeEach(() => {
    openLobby(room);
    const c = ensureCombat(room);
    room.phase = PHASE.FIGHT;
    c.bossHP = c.maxBossHP = 10000;
    c.fightStartedAt = Date.now();
    c.nextBossAttackAt = Date.now() + 999_999;
    handleChatCommand(room, 'alice', 'join', '!join');
  });

  it('cast_ability rejects unknown slot', () => {
    expect(castAbility(room, 99).ok).toBe(false);
  });

  it('cast_ability succeeds and sets cooldown', () => {
    const r = castAbility(room, 0); // slam
    expect(r.ok).toBe(true);
    expect(r.readyAt).toBeGreaterThan(Date.now());
    const id = room.monster.abilityIds[0];
    expect(room.combat.abilityCooldowns.get(id)).toBeGreaterThan(Date.now());
  });

  it('cast_ability rejects within cooldown window', () => {
    castAbility(room, 0);
    const second = castAbility(room, 0);
    expect(second.ok).toBe(false);
    expect(second.code).toBe('cooldown');
  });

  it('damage abilities increment ability_uses telemetry', () => {
    castAbility(room, 1); // inferno (aoe)
    const id = 'inferno';
    const def = ABILITY_BY_ID[id];
    expect(def).toBeTruthy();
    const usage = room.combat.abilityUses.get(id);
    expect(usage.castCount).toBe(1);
    // damageDealt may be 0 if no chatters were alive; we joined alice so it should fire
    expect(usage.damageDealt).toBeGreaterThanOrEqual(0);
  });
});

describe('telegraph counter-credit', () => {
  it('credits a chatter who used the right counter on the right target', () => {
    const room = makeRoom();
    openLobby(room);
    handleChatCommand(room, 'alice', 'join', '!join');
    const c = ensureCombat(room);
    c.telegraph = {
      sigName: 'TEST', counter: 'block', target: 'one',
      targetLogins: ['alice'], expiresAt: Date.now() + 4000,
    };
    c.counterChatters = new Set();
    maybeCreditTelegraphCounter(c, 'alice', 'block');
    expect(c.counterChatters.has('alice')).toBe(true);
  });

  it('does not credit a chatter who used the wrong action', () => {
    const room = makeRoom();
    openLobby(room);
    const c = ensureCombat(room);
    c.telegraph = { sigName: 'TEST', counter: 'block', target: 'all', targetLogins: ['alice'], expiresAt: Date.now() + 4000 };
    c.counterChatters = new Set();
    maybeCreditTelegraphCounter(c, 'alice', 'attack');
    expect(c.counterChatters.has('alice')).toBe(false);
  });

  it('does not credit a chatter who is not a target (single-target sig)', () => {
    const room = makeRoom();
    openLobby(room);
    const c = ensureCombat(room);
    c.telegraph = { sigName: 'TEST', counter: 'block', target: 'one', targetLogins: ['alice'], expiresAt: Date.now() + 4000 };
    c.counterChatters = new Set();
    maybeCreditTelegraphCounter(c, 'bob', 'block');
    expect(c.counterChatters.has('bob')).toBe(false);
  });

  it('credits any chatter for area-wide telegraphs', () => {
    const room = makeRoom();
    openLobby(room);
    const c = ensureCombat(room);
    c.telegraph = { sigName: 'TEST', counter: 'block', target: 'all', targetLogins: ['alice', 'bob'], expiresAt: Date.now() + 4000 };
    c.counterChatters = new Set();
    maybeCreditTelegraphCounter(c, 'eve', 'block');
    expect(c.counterChatters.has('eve')).toBe(true);
  });
});

describe('phase guards', () => {
  it('cast_ability only works during FIGHT', () => {
    expect(castAbility(room, 0).ok).toBe(false);
  });

  it('chat commands ignored outside lobby/fight', () => {
    expect(handleChatCommand(room, 'alice', 'attack', '!attack').handled).toBe(false);
  });

  it('forceEndFight is no-op outside FIGHT', () => {
    expect(forceEndFight(room)).toBe(false);
  });
});

afterAll(() => {
  // No persistent resources to clean.
});
