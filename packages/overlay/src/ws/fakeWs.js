/**
 * Scripted fake WebSocket client for the static overlay demo. Mirrors the
 * panel's fakeWs.js — both surfaces independently animate the same
 * canned run loop. They don't share a server, so timings can drift; that's
 * fine for a visual preview.
 */

import {
  ABILITY_BY_ID,
  ABILITY_POOL,
  PHASE,
  PROTOCOL_VERSION,
  S2C,
} from '@bossraid/shared';

const FAKE_CHATTERS = [
  'pog_lord', 'kappa_kween', 'lurker99', '5Head', 'ninja42', 'streamerfan',
  'EmoteGoblin', 'pizzaqueen', 'noscope', 'bitsby', 'glassoakapril', 'omegamax',
  'lily7000', 'darklurker', 'thirdtimer', 'speedrunBae', 'midnightdev',
  'happybatato', 'TwitchFartson', 'lazerlemur',
];

function randPick(arr) { return arr[(Math.random() * arr.length) | 0]; }

function demoPfp(login) {
  return `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(login)}&backgroundType=solid&backgroundColor=fdfaf3`;
}

function randomMonster() {
  const bodies = ['blob', 'lump', 'stack'];
  const eyes = ['googly', 'beady', 'cyclops'];
  const mouths = ['fangs', 'underbite', 'grin'];
  const horns = ['nubs', 'curly', 'antennae'];
  const arms = ['stubs', 'noodle', 'crab'];
  const feet = ['paws', 'tentacles', 'wheels'];
  return {
    id: 'demo_mon',
    channelId: 'demo',
    name: 'Bloop',
    status: 'active',
    appearance: {
      body: randPick(bodies), eyes: randPick(eyes), mouth: randPick(mouths),
      horns: randPick(horns), arms: randPick(arms), feet: randPick(feet),
      paletteIdx: (Math.random() * 12) | 0,
    },
    abilityIds: [
      randPick(ABILITY_POOL.damage).id,
      randPick(ABILITY_POOL.aoe).id,
      randPick(ABILITY_POOL.utility).id,
    ],
    statPointsSpent: { hp: 4, attack: 2, defense: 1, speed: 0, crit: 3, abilityPower: 0 },
    level: 1, wins: 0, rerollTokens: 1, timesRevived: 0, peakLevel: 1, diedAt: null,
  };
}

export function createFakeOverlayClient(_url, onMessage) {
  let monster = randomMonster();
  let chatters = [];
  let bossHP = 3000;
  let maxBossHP = 3000;
  let phase = PHASE.IDLE;
  let phaseEndsAt = 0;

  const T = { LOBBY: 4_000, FIGHT: 12_000, RESULTS: 2_500, IDLE: 1_500 };

  function deliver(type, payload) { setTimeout(() => onMessage({ v: PROTOCOL_VERSION, type, payload }), 0); }

  function broadcastDelta(events = []) {
    deliver(S2C.STATE_DELTA, {
      phase,
      timeLeftMs: Math.max(0, phaseEndsAt - Date.now()),
      bossHP, maxBossHP, bossShield: 0,
      chatters,
      cooldowns: {},
      events,
      monster,
    });
  }

  function setPhase(next, payload = {}) {
    phase = next;
    deliver(S2C.PHASE_CHANGE, { phase, ...payload });
    deliver(S2C.STATE_DELTA, { phase, monster, chatters, bossHP, maxBossHP, timeLeftMs: payload.durationMs || 0, events: [] });
  }

  function startLobby() {
    chatters = [];
    bossHP = maxBossHP;
    phaseEndsAt = Date.now() + T.LOBBY;
    setPhase(PHASE.LOBBY, { durationMs: T.LOBBY, timeLeftMs: T.LOBBY });
    let spawned = 0;
    const total = 8 + ((Math.random() * 6) | 0);
    const spawn = setInterval(() => {
      if (spawned >= total || phase !== PHASE.LOBBY) { clearInterval(spawn); return; }
      const login = FAKE_CHATTERS[spawned % FAKE_CHATTERS.length];
      chatters.push({ login, hp: 100, maxHp: 100, blockedUntilMs: 0, damageDealt: 0, pfpUrl: demoPfp(login) });
      broadcastDelta([{ kind: 'CHATTER_JOINED', chatterId: login }]);
      spawned++;
    }, 280);
    setTimeout(startFight, T.LOBBY);
  }

  function startFight() {
    phaseEndsAt = Date.now() + T.FIGHT;
    setPhase(PHASE.FIGHT, { durationMs: T.FIGHT, timeLeftMs: T.FIGHT });
    const tick = setInterval(() => {
      if (phase !== PHASE.FIGHT) { clearInterval(tick); return; }
      const events = [];
      for (const c of chatters) {
        if (c.hp <= 0) continue;
        if (Math.random() < 0.4) {
          const dmg = 25 + ((Math.random() * 15) | 0);
          bossHP = Math.max(0, bossHP - dmg);
          c.damageDealt += dmg;
          events.push({ kind: 'CHATTER_ATTACK', chatterId: c.login, dmg });
        }
      }
      if (Math.random() < 0.45) {
        const alive = chatters.filter((c) => c.hp > 0);
        if (alive.length) {
          const t = alive[(Math.random() * alive.length) | 0];
          const isCrit = Math.random() < 0.18;
          const dmg = (20 + ((Math.random() * 10) | 0)) * (isCrit ? 2 : 1);
          t.hp = Math.max(0, t.hp - dmg);
          events.push({ kind: isCrit ? 'BOSS_CRIT' : 'BOSS_BASIC_ATTACK', chatterId: t.login, dmg });
          if (t.hp <= 0) events.push({ kind: 'CHATTER_DOWN', chatterId: t.login });
        }
      }
      if (Math.random() < 0.08) {
        const id = monster.abilityIds[(Math.random() * monster.abilityIds.length) | 0];
        const def = ABILITY_BY_ID[id];
        if (def) events.push({ kind: 'BOSS_ABILITY', abilityId: id, vfx: def.vfx, isCrit: false, damageDealt: def.damage });
      }
      if (Math.random() < 0.06 && chatters.length) {
        const c = chatters[(Math.random() * chatters.length) | 0];
        events.push({ kind: 'HERO_SPOTLIGHT', chatterId: c.login, durationMs: 3000 });
      }
      broadcastDelta(events);
      if (bossHP <= 0 || Date.now() >= phaseEndsAt) { clearInterval(tick); endFight(); return; }
    }, 600);
  }

  function endFight() {
    const victory = bossHP <= 0;
    deliver(S2C.RESULTS, {
      victory, victoryFor: victory ? 'chat' : 'boss',
      mvpChatters: chatters.sort((a, b) => b.damageDealt - a.damageDealt).slice(0, 5).map((c) => ({ login: c.login, damageDealt: c.damageDealt })),
      durationMs: T.FIGHT, totalDamage: chatters.reduce((s, c) => s + c.damageDealt, 0),
      monsterLevel: monster.level,
    });
    phaseEndsAt = Date.now() + T.RESULTS;
    setPhase(PHASE.RESULTS, { durationMs: T.RESULTS, timeLeftMs: T.RESULTS });
    setTimeout(() => {
      // Re-roll the monster on each cycle so the demo shows variety.
      monster = randomMonster();
      monster.level = victory ? 1 : monster.level + 1;
      deliver(S2C.MONSTER_UPDATED, { monster });
      setPhase(PHASE.IDLE);
      setTimeout(startLobby, T.IDLE);
    }, T.RESULTS);
  }

  setTimeout(() => {
    deliver(S2C.WELCOME, { channelId: 'demo', phase, locale: 'en', monster, chatters: [], bossHP, maxBossHP });
    setTimeout(startLobby, 1500);
  }, 100);

  return { send: () => {}, close: () => {} };
}

export function isDemoBuild() {
  return import.meta.env?.VITE_DEMO === '1';
}
