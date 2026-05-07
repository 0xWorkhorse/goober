import { PHASE } from '@bossraid/shared';

import { monsters as monstersRepo, channels as channelsRepo } from '../persistence/repos.js';

/**
 * One Room per Twitch channel. Owns the combat state, chatter roster, and
 * connected sockets. Combat tick + state machine wiring lands in step 5.
 *
 * Rooms are kept in a Map keyed by channel id; pruned by an idle timer once
 * the channel has had no activity for ROOM_IDLE_PRUNE_MS.
 */

export const ROOM_IDLE_PRUNE_MS = 5 * 60_000;

export function getOrCreateRoom(rooms, channelId) {
  if (!channelId) channelId = 'dev';
  let room = rooms.get(channelId);
  if (!room) {
    room = createRoom(channelId);
    rooms.set(channelId, room);
  }
  room.lastActivity = Date.now();
  return room;
}

function createRoom(channelId) {
  const channel = channelsRepo.get(channelId);
  const active = monstersRepo.getActive(channelId);
  return {
    channelId,
    locale: channel?.locale || 'en',
    phase: active ? PHASE.IDLE : PHASE.CREATION,
    monster: active,
    chatters: new Map(), // login → ChatterState
    panels: new Set(),
    overlays: new Set(),
    combat: null, // populated in step 5
    lastActivity: Date.now(),
  };
}

export function pruneIdleRooms(rooms, now = Date.now()) {
  for (const [id, room] of rooms) {
    if (room.panels.size > 0 || room.overlays.size > 0) continue;
    if (now - room.lastActivity > ROOM_IDLE_PRUNE_MS) rooms.delete(id);
  }
}
