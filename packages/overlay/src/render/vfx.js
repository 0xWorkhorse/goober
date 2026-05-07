/**
 * VFX dispatch table. Maps server-side event kinds to visual reactions on the
 * overlay. State holds *what is*; events describe *what just happened*.
 *
 * Adding a new effect: add the event to `EVENTS` in shared/messages.js, push
 * it from server combat code, then add a key here.
 */

import { EVENTS } from '@bossraid/shared';

export function buildVfxHandlers({ getBossPos, getChatterPos, particles, damageNumbers, shake, flash, sfx }) {
  return {
    [EVENTS.CHATTER_JOINED]: (_e) => {
      // No-op visual at step 6; chatter sprite mount handles the appearance.
    },
    [EVENTS.CHATTER_ATTACK]: (e) => {
      const [bx, by] = getBossPos();
      particles.burst(bx, by, { count: 10, color: '#ffd166', speed: 220, life: 500, size: 3 });
      damageNumbers.add(bx + (Math.random() - 0.5) * 60, by - 40, e.dmg, { color: '#ffd166', size: 22 });
      shake.add(2);
      flash.flash(70, 1.5);
      sfx.play('impact');
    },
    [EVENTS.CHATTER_HEAL]: (e) => {
      const pos = getChatterPos(e.target) || getBossPos();
      particles.burst(pos[0], pos[1] - 20, { count: 8, color: '#06d6a0', speed: 160, life: 700, size: 3 });
      damageNumbers.add(pos[0], pos[1] - 30, '+' + e.amount, { color: '#06d6a0', size: 18 });
    },
    [EVENTS.CHATTER_BLOCK]: (_e) => {
      // The block ring on the chatter sprite handles this visually.
    },
    [EVENTS.CHATTER_DOWN]: (e) => {
      const pos = getChatterPos(e.chatterId);
      if (!pos) return;
      particles.burst(pos[0], pos[1], { count: 16, color: '#ef476f', speed: 180, life: 800, size: 4 });
      shake.add(3);
    },
    [EVENTS.BOSS_BASIC_ATTACK]: (e) => {
      const pos = getChatterPos(e.chatterId);
      if (pos) {
        particles.burst(pos[0], pos[1], { count: 8, color: '#ef476f', speed: 200, life: 500 });
        damageNumbers.add(pos[0], pos[1] - 20, e.dmg, { color: '#ef476f', size: 18 });
      }
      shake.add(4);
    },
    [EVENTS.BOSS_CRIT]: (e) => {
      const pos = getChatterPos(e.chatterId);
      if (pos) {
        particles.burst(pos[0], pos[1], { count: 16, color: '#ffd166', speed: 280, life: 700, size: 5 });
        damageNumbers.add(pos[0], pos[1] - 24, e.dmg + '!', { color: '#ffd166', size: 26, bold: true });
      }
      shake.add(10);
    },
    [EVENTS.BOSS_ABILITY]: (e) => {
      const [bx, by] = getBossPos();
      particles.burst(bx, by, { count: 24, color: vfxToColor(e.vfx), speed: 320, life: 800, size: 5 });
      shake.add(12);
      flash.flash(140, 2.0);
      sfx.play('ability');
      if (e.damageDealt > 0) {
        damageNumbers.add(bx + (Math.random() - 0.5) * 80, by, e.damageDealt, {
          color: vfxToColor(e.vfx),
          size: 26,
          bold: !!e.isCrit,
        });
      }
    },
    [EVENTS.HERO_SPOTLIGHT]: (_e) => {
      // Step 14 will lift the chatter's sprite out of mob aggregation. For
      // step 6 we handle it as a small particle pop on the chatter.
    },
  };
}

function vfxToColor(tag = '') {
  // Map ability vfx tags to particle colors. Keep this small — tags are
  // descriptive (e.g. 'fire_red', 'ice_blue') so the mapping is obvious.
  if (tag.includes('red')) return '#ef476f';
  if (tag.includes('blue')) return '#74c0fc';
  if (tag.includes('green')) return '#06d6a0';
  if (tag.includes('amber') || tag.includes('yellow')) return '#ffd166';
  if (tag.includes('purple')) return '#c490e4';
  if (tag.includes('brown')) return '#b08a5a';
  return '#ffffff';
}
