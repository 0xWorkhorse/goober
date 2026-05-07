-- Initial schema for BossRaid.
-- Status enum for monsters: 'draft' | 'active' | 'dead' | 'retired'.
-- Status enum for fights' victory_for: 'chat' | 'boss' | 'aborted'.

CREATE TABLE channels (
  id            TEXT PRIMARY KEY,           -- Twitch user ID
  login         TEXT NOT NULL,
  display_name  TEXT,
  locale        TEXT NOT NULL DEFAULT 'en',
  -- Encrypted-at-rest in production, plain in dev. The format is documented
  -- in twitch/auth.js (key-prefixed AES-GCM).
  twitch_token         TEXT,
  twitch_refresh_token TEXT,
  token_expires_at     INTEGER,
  legacy_points        INTEGER NOT NULL DEFAULT 0,
  active_monster_id    TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE monsters (
  id            TEXT PRIMARY KEY,
  channel_id    TEXT NOT NULL,
  name          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','dead','retired')),
  appearance_json   TEXT NOT NULL,
  ability_ids_json  TEXT NOT NULL DEFAULT '[]',
  stat_points_json  TEXT NOT NULL DEFAULT '{}',
  level         INTEGER NOT NULL DEFAULT 1,
  wins          INTEGER NOT NULL DEFAULT 0,
  reroll_tokens INTEGER NOT NULL DEFAULT 1,
  times_revived INTEGER NOT NULL DEFAULT 0,
  peak_level    INTEGER NOT NULL DEFAULT 1,
  died_at       INTEGER,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL,
  FOREIGN KEY (channel_id) REFERENCES channels(id)
);

CREATE TABLE fights (
  id                     TEXT PRIMARY KEY,
  channel_id             TEXT NOT NULL,
  monster_id             TEXT NOT NULL,
  monster_level_at_fight INTEGER NOT NULL,
  victory_for            TEXT NOT NULL CHECK (victory_for IN ('chat','boss','aborted')),
  duration_ms            INTEGER NOT NULL,
  chatter_count          INTEGER NOT NULL,
  total_damage           INTEGER NOT NULL DEFAULT 0,
  started_at             INTEGER NOT NULL,
  ended_at               INTEGER NOT NULL,
  FOREIGN KEY (monster_id) REFERENCES monsters(id),
  FOREIGN KEY (channel_id) REFERENCES channels(id)
);

CREATE TABLE fight_ability_uses (
  fight_id   TEXT NOT NULL,
  ability_id TEXT NOT NULL,
  cast_count INTEGER NOT NULL DEFAULT 0,
  damage_dealt INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (fight_id, ability_id),
  FOREIGN KEY (fight_id) REFERENCES fights(id)
);

CREATE TABLE fight_chatter_actions (
  fight_id      TEXT NOT NULL,
  chatter_login TEXT NOT NULL,
  attacks       INTEGER NOT NULL DEFAULT 0,
  heals         INTEGER NOT NULL DEFAULT 0,
  blocks        INTEGER NOT NULL DEFAULT 0,
  damage_dealt  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (fight_id, chatter_login),
  FOREIGN KEY (fight_id) REFERENCES fights(id)
);

CREATE TABLE drops (
  id            TEXT PRIMARY KEY,
  fight_id      TEXT NOT NULL,
  chatter_login TEXT NOT NULL,
  cosmetic_key  TEXT NOT NULL,
  created_at    INTEGER NOT NULL,
  FOREIGN KEY (fight_id) REFERENCES fights(id)
);

-- Append-only ground-truth log of parsed chat commands. Behind the
-- LOG_RAW_CHAT_EVENTS env flag — drop the flag once balance stabilizes.
CREATE TABLE chat_events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id    TEXT NOT NULL,
  fight_id      TEXT,
  chatter_login TEXT NOT NULL,
  action        TEXT NOT NULL,
  raw_message   TEXT,
  created_at    INTEGER NOT NULL
);

CREATE INDEX idx_monsters_channel        ON monsters(channel_id);
CREATE INDEX idx_monsters_status         ON monsters(channel_id, status);
CREATE INDEX idx_fights_channel          ON fights(channel_id);
CREATE INDEX idx_fights_monster          ON fights(monster_id);
CREATE INDEX idx_drops_chatter           ON drops(chatter_login);
CREATE INDEX idx_chat_events_channel     ON chat_events(channel_id, created_at);
CREATE INDEX idx_chat_events_fight       ON chat_events(fight_id);
