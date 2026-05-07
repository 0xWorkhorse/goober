/**
 * Scripted fake WebSocket client used by the static GitHub Pages demo.
 *
 * Same `{ send, close }` interface as `./client.js` so the rest of the panel
 * can't tell the difference. Drives the state machine through a full loop:
 *   idle → lobby → fight → results → level_up → idle → ...
 *
 * Outgoing C2S messages from the panel are interpreted locally and translated
 * into matching S2C events.
 */

import {
  ABILITY_BY_ID,
  ABILITY_POOL,
  PHASE,
  PROTOCOL_VERSION,
  S2C,
  STARTING_REROLL_TOKENS,
  STAT_NAMES,
} from '@bossraid/shared';

const FAKE_CHATTERS = [
  'pog_lord', 'kappa_kween', 'lurker99', '5Head', 'ninja42', 'streamerfan',
  'EmoteGoblin', 'pizzaqueen', 'noscope', 'bitsby', 'glassoakapril', 'omegamax',
  'lily7000', 'darklurker', 'thirdtimer', 'speedrunBae', 'midnightdev',
  'happybatato', 'TwitchFartson', 'lazerlemur',
];

function randPick(arr) { return arr[(Math.random() * arr.length) | 0]; }

function randomMonster() {
  const bodies = ['blob', 'lump', 'stack'];
  const eyes = ['googly', 'beady', 'cyclops'];
  const mouths = ['fangs', 'underbite', 'grin'];
  const horns = ['nubs', 'curly', 'antennae'];
  const arms = ['stubs', 'noodle', 'crab'];
  const feet = ['paws', 'tentacles', 'wheels'];
  return {
    body: randPick(bodies),
    eyes: randPick(eyes),
    mouth: randPick(mouths),
    horns: randPick(horns),
    arms: randPick(arms),
    feet: randPick(feet),
    paletteIdx: (Math.random() * 12) | 0,
  };
}

function makeMonster({ name = 'Bloop', level = 1, status = 'active' } = {}) {
  const damageAbilities = ABILITY_POOL.damage;
  const aoeAbilities = ABILITY_POOL.aoe;
  const utilityAbilities = ABILITY_POOL.utility;
  return {
    id: 'demo_mon_' + Math.random().toString(36).slice(2, 8),
    channelId: 'demo',
    name,
    status,
    appearance: randomMonster(),
    abilityIds: [randPick(damageAbilities).id, randPick(aoeAbilities).id, randPick(utilityAbilities).id],
    statPointsSpent: STAT_NAMES.reduce((a, k) => ((a[k] = 0), a), { hp: 4, attack: 2, defense: 1, speed: 0, crit: 3, abilityPower: 0 }),
    level,
    wins: level - 1,
    rerollTokens: STARTING_REROLL_TOKENS,
    timesRevived: 0,
    peakLevel: level,
    diedAt: null,
  };
}

/**
 * Build a fake WS client that replays a scripted run.
 *
 * @param {(msg: {type:string, payload:object}) => void} onMessage
 */
export function createFakeWsClient(_url, onMessage) {
  let monster = makeMonster();
  let chatters = []; // [{login, hp, maxHp, blockedUntilMs, damageDealt}]
  let bossHP = 3000;
  let maxBossHP = 3000;
  let phase = PHASE.IDLE;
  let phaseEndsAt = 0;
  let cooldowns = {};
  let lastResults = null;
  let legacyPoints = 0;
  let timer = null;

  function envelope(type, payload) { return { v: PROTOCOL_VERSION, type, payload }; }
  function deliver(type, payload) { setTimeout(() => onMessage(envelope(type, payload)), 0); }

  function snapshot() {
    return {
      channelId: 'demo',
      phase,
      locale: 'en',
      monster,
      chatters,
      bossHP,
      maxBossHP,
      cooldowns,
      legacyPoints,
      ircStatus: 'connected',
    };
  }

  function broadcastDelta(events = []) {
    deliver(S2C.STATE_DELTA, {
      phase,
      timeLeftMs: Math.max(0, phaseEndsAt - Date.now()),
      bossHP,
      maxBossHP,
      bossShield: 0,
      chatters,
      cooldowns,
      events,
      legacyPoints,
      monster,
    });
  }

  function setPhase(next, payload = {}) {
    phase = next;
    deliver(S2C.PHASE_CHANGE, { phase: next, ...payload });
    deliver(S2C.STATE_DELTA, { ...snapshot(), timeLeftMs: payload.durationMs || 0, events: [] });
  }

  // ── Scripted run loop ────────────────────────────────────────────────────
  // Times are short so the demo plays through quickly.
  const T = {
    LOBBY: 4_000,
    FIGHT: 12_000,
    RESULTS: 2_500,
    LEVEL_UP: 6_000,
  };

  function startLobby() {
    chatters = [];
    bossHP = maxBossHP;
    cooldowns = {};
    phaseEndsAt = Date.now() + T.LOBBY;
    setPhase(PHASE.LOBBY, { durationMs: T.LOBBY, timeLeftMs: T.LOBBY });
    // Spawn fake chatters every ~250ms.
    let spawned = 0;
    const total = 8 + ((Math.random() * 6) | 0);
    const spawn = setInterval(() => {
      if (spawned >= total || phase !== PHASE.LOBBY) { clearInterval(spawn); return; }
      const login = FAKE_CHATTERS[spawned % FAKE_CHATTERS.length];
      chatters.push({ login, hp: 100, maxHp: 100, blockedUntilMs: 0, damageDealt: 0 });
      broadcastDelta([{ kind: 'CHATTER_JOINED', chatterId: login }]);
      spawned++;
    }, 280);

    timer = setTimeout(startFight, T.LOBBY);
  }

  function startFight() {
    phaseEndsAt = Date.now() + T.FIGHT;
    setPhase(PHASE.FIGHT, { durationMs: T.FIGHT, timeLeftMs: T.FIGHT });
    // Combat tick: chatters attack, boss occasionally casts ability.
    const tick = setInterval(() => {
      if (phase !== PHASE.FIGHT) { clearInterval(tick); return; }
      const events = [];
      // Chatter attacks
      for (const c of chatters) {
        if (c.hp <= 0) continue;
        if (Math.random() < 0.35) {
          const dmg = 25 + ((Math.random() * 15) | 0);
          bossHP = Math.max(0, bossHP - dmg);
          c.damageDealt += dmg;
          events.push({ kind: 'CHATTER_ATTACK', chatterId: c.login, dmg });
        }
      }
      // Boss basic
      if (Math.random() < 0.4) {
        const target = chatters.filter((c) => c.hp > 0);
        if (target.length) {
          const t = target[(Math.random() * target.length) | 0];
          const dmg = 20 + ((Math.random() * 10) | 0);
          const isCrit = Math.random() < 0.15;
          const final = isCrit ? dmg * 2 : dmg;
          t.hp = Math.max(0, t.hp - final);
          events.push({ kind: isCrit ? 'BOSS_CRIT' : 'BOSS_BASIC_ATTACK', chatterId: t.login, dmg: final });
          if (t.hp <= 0) events.push({ kind: 'CHATTER_DOWN', chatterId: t.login });
        }
      }
      // Boss ability occasionally
      if (Math.random() < 0.07) {
        const id = monster.abilityIds[(Math.random() * monster.abilityIds.length) | 0];
        const def = ABILITY_BY_ID[id];
        if (def) {
          events.push({ kind: 'BOSS_ABILITY', abilityId: id, vfx: def.vfx, isCrit: false, damageDealt: def.damage });
          if (def.damage > 0) {
            for (const c of chatters) {
              if (c.hp > 0) {
                c.hp = Math.max(0, c.hp - def.damage);
                if (c.hp <= 0) events.push({ kind: 'CHATTER_DOWN', chatterId: c.login });
              }
            }
          }
        }
      }
      // Hero spotlight occasionally
      if (Math.random() < 0.05 && chatters.length) {
        const c = chatters[(Math.random() * chatters.length) | 0];
        events.push({ kind: 'HERO_SPOTLIGHT', chatterId: c.login, durationMs: 3000 });
      }
      broadcastDelta(events);
      // End conditions
      if (bossHP <= 0) { clearInterval(tick); endFight('chat'); return; }
      if (Date.now() >= phaseEndsAt) { clearInterval(tick); endFight(bossHP < maxBossHP * 0.3 ? 'chat' : 'boss'); return; }
    }, 600);
  }

  function endFight(victoryFor) {
    const sorted = [...chatters].sort((a, b) => b.damageDealt - a.damageDealt).slice(0, 5);
    lastResults = {
      fightId: 'demo_fight_' + Date.now(),
      victory: victoryFor === 'chat',
      victoryFor,
      mvpChatters: sorted.map((c) => ({ login: c.login, damageDealt: c.damageDealt })),
      durationMs: T.FIGHT,
      totalDamage: chatters.reduce((s, c) => s + c.damageDealt, 0),
      monsterLevel: monster.level,
    };
    deliver(S2C.RESULTS, lastResults);
    if (victoryFor === 'chat') {
      monster = { ...monster, status: 'dead', diedAt: Date.now() };
      legacyPoints += 5;
    } else {
      monster = { ...monster, level: monster.level + 1, wins: monster.wins + 1, peakLevel: Math.max(monster.peakLevel, monster.level + 1), rerollTokens: monster.rerollTokens + 1 };
      legacyPoints += 1;
    }
    deliver(S2C.MONSTER_UPDATED, { monster });
    phaseEndsAt = Date.now() + T.RESULTS;
    setPhase(PHASE.RESULTS, { durationMs: T.RESULTS, timeLeftMs: T.RESULTS });
    timer = setTimeout(() => {
      if (monster.status === 'dead') setPhase(PHASE.DEATH);
      else { phaseEndsAt = Date.now() + T.LEVEL_UP; setPhase(PHASE.LEVEL_UP, { points: 3 }); timer = setTimeout(advanceFromLevelUp, T.LEVEL_UP); }
    }, T.RESULTS);
  }

  function advanceFromLevelUp() {
    // Auto-allocate the 3 stat points if the panel didn't.
    monster.statPointsSpent = { ...monster.statPointsSpent, attack: (monster.statPointsSpent.attack || 0) + 3 };
    deliver(S2C.MONSTER_UPDATED, { monster });
    setPhase(PHASE.IDLE);
    timer = setTimeout(startLobby, 1500);
  }

  // ── Boot ─────────────────────────────────────────────────────────────────
  setTimeout(() => {
    deliver(S2C.WELCOME, snapshot());
    timer = setTimeout(startLobby, 2000);
  }, 100);

  // ── Public API matching the real WS client ───────────────────────────────
  function send(type, payload) {
    // Translate a few panel-driven actions so the demo feels interactive.
    switch (type) {
      case 'start_lobby': clearTimeout(timer); startLobby(); return;
      case 'cast_ability': {
        const slot = payload.slot;
        const id = monster.abilityIds[slot];
        const def = ABILITY_BY_ID[id];
        if (!def || phase !== PHASE.FIGHT) return;
        cooldowns = { ...cooldowns, [slot]: { abilityId: id, readyAt: Date.now() + def.cooldownMs, remainingMs: def.cooldownMs } };
        const events = [{ kind: 'BOSS_ABILITY', abilityId: id, vfx: def.vfx, isCrit: false, damageDealt: def.damage }];
        if (def.damage > 0) {
          for (const c of chatters) {
            if (c.hp > 0) {
              c.hp = Math.max(0, c.hp - def.damage);
              if (c.hp <= 0) events.push({ kind: 'CHATTER_DOWN', chatterId: c.login });
            }
          }
        }
        broadcastDelta(events);
        return;
      }
      case 'end_fight_force': clearTimeout(timer); endFight('aborted'); return;
      case 'confirm_level_up': clearTimeout(timer); advanceFromLevelUp(); return;
      case 'abandon_monster':
      case 'start_new_monster':
        monster = makeMonster();
        deliver(S2C.MONSTER_UPDATED, { monster });
        setPhase(PHASE.IDLE);
        timer = setTimeout(startLobby, 1500);
        return;
      case 'revive_monster':
        legacyPoints = Math.max(0, legacyPoints - 5);
        monster = { ...monster, status: 'active', timesRevived: monster.timesRevived + 1 };
        deliver(S2C.MONSTER_UPDATED, { monster });
        setPhase(PHASE.IDLE);
        timer = setTimeout(startLobby, 1500);
        return;
      default:
        return; // creator messages: noop in demo
    }
  }

  function close() {
    if (timer) clearTimeout(timer);
  }

  return { send, close };
}

/** True if the build was made with VITE_DEMO=1. */
export function isDemoBuild() {
  return import.meta.env?.VITE_DEMO === '1';
}
