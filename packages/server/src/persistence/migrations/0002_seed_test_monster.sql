-- Seed a 'dev' channel with an active test monster. Used by /dev/simulate-chat
-- and the overlay during local development. Idempotent via INSERT OR IGNORE.

INSERT OR IGNORE INTO channels (id, login, display_name, locale, created_at, updated_at)
VALUES ('dev', 'devstreamer', 'Dev Streamer', 'en', strftime('%s','now')*1000, strftime('%s','now')*1000);

INSERT OR IGNORE INTO monsters (
  id, channel_id, name, status,
  appearance_json, ability_ids_json, stat_points_json,
  level, wins, reroll_tokens, peak_level,
  created_at, updated_at
) VALUES (
  'mon_dev_seed_01',
  'dev',
  'Bloop',
  'active',
  '{"body":"blob","eyes":"googly","mouth":"fangs","horns":"antennae","arms":"noodle","feet":"tentacles","paletteIdx":4}',
  '["cleave","inferno","heal"]',
  '{"hp":4,"attack":2,"defense":1,"speed":0,"crit":3,"abilityPower":0}',
  1, 0, 1, 1,
  strftime('%s','now')*1000, strftime('%s','now')*1000
);

UPDATE channels SET active_monster_id = 'mon_dev_seed_01' WHERE id = 'dev' AND active_monster_id IS NULL;
