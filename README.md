# BossRaid

Twitch chat boss-battle game. The streamer designs a goofy monster (part picker, ability roller, stat allocator), then opens a lobby where chat fights it via `!join` / `!attack` / `!heal` / `!block`. Wins level the same monster up across fights; losses end the run. The hook is persistent monster progression — a monster on a 10-fight win streak that finally gets taken down by chat is a real moment.

## Quick start (local dev)

```bash
nvm use            # uses .nvmrc → Node 20
npm install
cp .env.example .env  # fill in TWITCH_CLIENT_ID + TOKEN_ENCRYPTION_KEY for real auth
npm run dev        # spawns server (3000), overlay (5173), panel (5174) concurrently
```

Visit:
- `http://localhost:5174/` — streamer control panel
- `http://localhost:5173/?channelId=dev` — overlay (use `dev` channel for the seed monster, no Twitch auth needed)
- `http://localhost:5173/parts.html` — part-picker visual test harness
- `http://localhost:3000/dev/sim` — chat injection test harness

## Stack

- Node 20+, JS only (no TypeScript), ES modules everywhere.
- `express`, `ws`, `tmi.js`, `better-sqlite3`, `pino`. Vitest for tests.
- Vanilla JS + Vite for the two frontends. Zero runtime deps.
- Server-authoritative combat: 30Hz tick, 10Hz state broadcast.
- SQLite persistence with a numbered-migrations runner (`packages/server/src/persistence/migrations/`).

## Layout (npm workspaces)

```
packages/
  shared/    # WS contracts, gameplay constants, locale files, monster SVG composer
  server/    # Express + WebSocket + SQLite + Twitch IRC + OAuth
  overlay/   # OBS browser source: monster + chatters + VFX + audio
  panel/     # streamer control panel: login, creator, fight, level-up, graveyard
```

## Production deployment (Railway)

The repo deploys as a single Node service that serves both the panel and the overlay as static assets.

```bash
npm run build      # builds overlay + panel into packages/server/public/
npm start          # serves on $PORT
```

`railway.json` and `nixpacks.toml` configure the build. A persistent volume should be mounted at `/data` (point `DATABASE_PATH` there). The server runs `PRAGMA wal_checkpoint(TRUNCATE)` on SIGTERM so deploys don't lose recent fight writes.

## Environment

Required in production:
- `TWITCH_CLIENT_ID`, `TWITCH_REDIRECT_URI` — from a [Twitch dev app](https://dev.twitch.tv/console/apps)
- `TOKEN_ENCRYPTION_KEY` — Railway secret used to AES-GCM-encrypt OAuth tokens at rest
- `SESSION_SECRET` — opaque random string
- `DATABASE_PATH` — e.g. `/data/bossraid.db` on Railway

Optional:
- `LOG_LEVEL` — pino level, default `info`
- `LOG_RAW_CHAT_EVENTS` — `true` to record every parsed chat command into `chat_events` for balance ground-truth (drop after balance stabilizes)
- `FAST_TIMERS_FACTOR` — dev-only; divides phase durations for fast smoke tests

## Adding to OBS

Once deployed, add a Browser Source pointing at:

```
https://yourapp.up.railway.app/overlay/?channelId=<TWITCH_USER_ID>&lang=en
```

Width 1920, height 1080, transparent. Optional `?lang=` accepts `en`, `es`, `pt`, `ja`, `ko`.

## Tests

```bash
npm test                       # runs vitest specs (server combat math + locale parsers)
npm run check:locales          # verifies all 5 locale files have key parity
```

## Telemetry & balance

Every fight writes to:
- `fights` (outcome, duration, total damage, chatter count)
- `fight_ability_uses` (per-ability cast count + damage)
- `fight_chatter_actions` (per-chatter attacks/heals/blocks/damage)

Optional `chat_events` ground-truth log when `LOG_RAW_CHAT_EVENTS=true`. Aggregate via `GET /api/balance/export` (auth-gated).
