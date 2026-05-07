import { nanoid } from 'nanoid';

import { db } from './db.js';

const now = () => Date.now();

// ─── Channels ───────────────────────────────────────────────────────────────
export const channels = {
  upsert({ id, login, displayName = null, locale = 'en', token = null, refreshToken = null, tokenExpiresAt = null }) {
    db()
      .prepare(
        `INSERT INTO channels (id, login, display_name, locale, twitch_token, twitch_refresh_token, token_expires_at, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?)
         ON CONFLICT(id) DO UPDATE SET
           login = excluded.login,
           display_name = COALESCE(excluded.display_name, channels.display_name),
           twitch_token = COALESCE(excluded.twitch_token, channels.twitch_token),
           twitch_refresh_token = COALESCE(excluded.twitch_refresh_token, channels.twitch_refresh_token),
           token_expires_at = COALESCE(excluded.token_expires_at, channels.token_expires_at),
           updated_at = excluded.updated_at`,
      )
      .run(id, login, displayName, locale, token, refreshToken, tokenExpiresAt, now(), now());
    return channels.get(id);
  },

  get(id) {
    return db().prepare('SELECT * FROM channels WHERE id = ?').get(id) || null;
  },

  setLocale(id, locale) {
    db().prepare('UPDATE channels SET locale = ?, updated_at = ? WHERE id = ?').run(locale, now(), id);
  },

  setActiveMonster(channelId, monsterId) {
    db()
      .prepare('UPDATE channels SET active_monster_id = ?, updated_at = ? WHERE id = ?')
      .run(monsterId, now(), channelId);
  },

  addLegacyPoints(channelId, n) {
    db()
      .prepare('UPDATE channels SET legacy_points = legacy_points + ?, updated_at = ? WHERE id = ?')
      .run(n, now(), channelId);
  },

  /** Atomically deduct legacy points; returns true if successful. */
  spendLegacyPoints(channelId, n) {
    const result = db()
      .prepare(
        'UPDATE channels SET legacy_points = legacy_points - ?, updated_at = ? WHERE id = ? AND legacy_points >= ?',
      )
      .run(n, now(), channelId, n);
    return result.changes === 1;
  },

  setTokens(id, { token, refreshToken, expiresAt }) {
    db()
      .prepare(
        'UPDATE channels SET twitch_token = ?, twitch_refresh_token = ?, token_expires_at = ?, updated_at = ? WHERE id = ?',
      )
      .run(token, refreshToken, expiresAt, now(), id);
  },
};

// ─── Monsters ───────────────────────────────────────────────────────────────
function rowToMonster(row) {
  if (!row) return null;
  return {
    id: row.id,
    channelId: row.channel_id,
    name: row.name,
    status: row.status,
    appearance: JSON.parse(row.appearance_json),
    abilityIds: JSON.parse(row.ability_ids_json),
    statPointsSpent: JSON.parse(row.stat_points_json),
    level: row.level,
    wins: row.wins,
    rerollTokens: row.reroll_tokens,
    timesRevived: row.times_revived,
    peakLevel: row.peak_level,
    diedAt: row.died_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const monsters = {
  create({ channelId, name, appearance, abilityIds = [], statPointsSpent = {}, status = 'draft' }) {
    const id = `mon_${nanoid(10)}`;
    db()
      .prepare(
        `INSERT INTO monsters (id, channel_id, name, status, appearance_json, ability_ids_json, stat_points_json, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        id,
        channelId,
        name,
        status,
        JSON.stringify(appearance),
        JSON.stringify(abilityIds),
        JSON.stringify(statPointsSpent),
        now(),
        now(),
      );
    return monsters.get(id);
  },

  get(id) {
    return rowToMonster(db().prepare('SELECT * FROM monsters WHERE id = ?').get(id));
  },

  getActive(channelId) {
    const ch = channels.get(channelId);
    if (!ch || !ch.active_monster_id) return null;
    return monsters.get(ch.active_monster_id);
  },

  listForChannel(channelId, { status = null, limit = 50 } = {}) {
    const rows = status
      ? db()
          .prepare(
            'SELECT * FROM monsters WHERE channel_id = ? AND status = ? ORDER BY updated_at DESC LIMIT ?',
          )
          .all(channelId, status, limit)
      : db()
          .prepare('SELECT * FROM monsters WHERE channel_id = ? ORDER BY updated_at DESC LIMIT ?')
          .all(channelId, limit);
    return rows.map(rowToMonster);
  },

  update(id, patch) {
    const cols = [];
    const vals = [];
    for (const [k, v] of Object.entries(patch)) {
      switch (k) {
        case 'name': cols.push('name = ?'); vals.push(v); break;
        case 'status': cols.push('status = ?'); vals.push(v); break;
        case 'appearance': cols.push('appearance_json = ?'); vals.push(JSON.stringify(v)); break;
        case 'abilityIds': cols.push('ability_ids_json = ?'); vals.push(JSON.stringify(v)); break;
        case 'statPointsSpent': cols.push('stat_points_json = ?'); vals.push(JSON.stringify(v)); break;
        case 'level': cols.push('level = ?'); vals.push(v); break;
        case 'wins': cols.push('wins = ?'); vals.push(v); break;
        case 'rerollTokens': cols.push('reroll_tokens = ?'); vals.push(v); break;
        case 'timesRevived': cols.push('times_revived = ?'); vals.push(v); break;
        case 'peakLevel': cols.push('peak_level = ?'); vals.push(v); break;
        case 'diedAt': cols.push('died_at = ?'); vals.push(v); break;
        default: break;
      }
    }
    if (!cols.length) return monsters.get(id);
    cols.push('updated_at = ?');
    vals.push(now());
    vals.push(id);
    db().prepare(`UPDATE monsters SET ${cols.join(', ')} WHERE id = ?`).run(...vals);
    return monsters.get(id);
  },

  kill(id) {
    const m = monsters.get(id);
    if (!m) return null;
    monsters.update(id, { status: 'dead', diedAt: now() });
    channels.setActiveMonster(m.channelId, null);
    return monsters.get(id);
  },

  revive(id) {
    const m = monsters.get(id);
    if (!m) return null;
    return monsters.update(id, {
      status: 'active',
      timesRevived: m.timesRevived + 1,
      diedAt: null,
    });
  },
};

// ─── Fights & telemetry ─────────────────────────────────────────────────────
export const fights = {
  /**
   * Persist a completed fight + per-ability and per-chatter telemetry in a
   * single transaction.
   */
  record({
    channelId,
    monsterId,
    monsterLevelAtFight,
    victoryFor,
    durationMs,
    chatterCount,
    totalDamage,
    startedAt,
    endedAt,
    abilityUses = [],
    chatterActions = [],
  }) {
    const id = `fgt_${nanoid(10)}`;
    const tx = db().transaction(() => {
      db()
        .prepare(
          `INSERT INTO fights (id, channel_id, monster_id, monster_level_at_fight, victory_for, duration_ms, chatter_count, total_damage, started_at, ended_at)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          id,
          channelId,
          monsterId,
          monsterLevelAtFight,
          victoryFor,
          durationMs,
          chatterCount,
          totalDamage,
          startedAt,
          endedAt,
        );
      const insAbility = db().prepare(
        'INSERT INTO fight_ability_uses (fight_id, ability_id, cast_count, damage_dealt) VALUES (?,?,?,?)',
      );
      for (const a of abilityUses) {
        insAbility.run(id, a.abilityId, a.castCount || 0, a.damageDealt || 0);
      }
      const insChatter = db().prepare(
        'INSERT INTO fight_chatter_actions (fight_id, chatter_login, attacks, heals, blocks, damage_dealt) VALUES (?,?,?,?,?,?)',
      );
      for (const c of chatterActions) {
        insChatter.run(
          id,
          c.chatterLogin,
          c.attacks || 0,
          c.heals || 0,
          c.blocks || 0,
          c.damageDealt || 0,
        );
      }
    });
    tx();
    return id;
  },

  listForChannel(channelId, limit = 20) {
    return db()
      .prepare('SELECT * FROM fights WHERE channel_id = ? ORDER BY ended_at DESC LIMIT ?')
      .all(channelId, limit);
  },
};

// ─── Drops ──────────────────────────────────────────────────────────────────
export const drops = {
  record(fightId, chatterLogin, cosmeticKey) {
    const id = `drp_${nanoid(10)}`;
    db()
      .prepare(
        'INSERT INTO drops (id, fight_id, chatter_login, cosmetic_key, created_at) VALUES (?,?,?,?,?)',
      )
      .run(id, fightId, chatterLogin, cosmeticKey, now());
    return id;
  },

  listForChatter(login, limit = 100) {
    return db()
      .prepare('SELECT * FROM drops WHERE chatter_login = ? ORDER BY created_at DESC LIMIT ?')
      .all(login, limit);
  },
};

// ─── Raw chat events (feature-flagged in handler) ───────────────────────────
export const chatEvents = {
  record({ channelId, fightId, chatterLogin, action, rawMessage }) {
    db()
      .prepare(
        'INSERT INTO chat_events (channel_id, fight_id, chatter_login, action, raw_message, created_at) VALUES (?,?,?,?,?,?)',
      )
      .run(channelId, fightId, chatterLogin, action, rawMessage, now());
  },
};
