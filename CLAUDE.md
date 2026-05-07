# Notes for Claude Code working on BossRaid

## Working agreement
- Read this file before starting any task.
- Make small, focused commits. One concern per PR/branch.
- Never introduce TypeScript. JS + JSDoc only.
- Never add a runtime dependency without flagging it explicitly with reasoning.
- Never hardcode user-facing strings — use i18n.t().
- Never compute combat outcomes on the client — server-authoritative.

## Hot zones (be extra careful here)
- packages/shared/src/constants.js — changing these affects gameplay balance.
- packages/shared/src/messages.js — protocol changes break all three surfaces. The envelope is versioned (`v: 1`); breaking changes bump the version and overlays should refuse mismatched versions.
- packages/server/src/game/combat.js — the state machine; behavior must match the plan in /root/.claude/plans/.
- packages/server/src/persistence/migrations/ — numbered SQL files applied on boot inside a transaction. Never edit a migration after it has been applied to a deployed environment; add a new one instead.

## Patterns to follow
- New WebSocket message: add constant to shared/messages.js, handler to server/ws/handlers.js, client send/receive in panel and overlay as needed.
- New locale string: add to en.json first, then mirror across es/pt/ja/ko. `npm run check:locales` validates parity.
- New visual effect: add a VFX_HANDLERS entry in overlay; trigger via server event in state delta.
- New gameplay constant: define in shared/src/constants.js, import everywhere. No magic numbers in game logic.

## Stack
- Node 20+, JS only. ES modules everywhere (`"type": "module"`).
- Prettier defaults except `singleQuote: true`, `printWidth: 100`.
- Functions over classes unless state encapsulation justifies a class (Room, particle pool).
- One responsibility per file. Split if a file passes ~250 lines.
- Imports ordered: stdlib → external → workspace → local. Blank line between groups.
