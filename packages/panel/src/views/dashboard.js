/**
 * Persistent dashboard layout shared by every fight-loop phase. Plus a
 * `monsterStage()` helper that picks the right Goober Bestiary animation
 * class for the current phase (idle / walk / hurt / attack / death).
 */

import { PHASE } from '@bossraid/shared';
import { renderMonsterSVG, DEFAULT_APPEARANCE } from '@bossraid/shared/monster';

import { el } from './chrome.js';

export function buildDashboard({ left, center, right }) {
  const dash = el('div', 'dash');
  const lc = el('div', 'dash-col');
  lc.appendChild(left);
  const cc = el('div', 'dash-col center');
  cc.appendChild(center.stage);
  if (center.overlays) cc.appendChild(center.overlays);
  const rc = el('div', 'dash-col');
  rc.appendChild(right);
  dash.append(lc, cc, rc);
  return dash;
}

/**
 * Build a monster-stage container with the inline SVG plus an overlay slot.
 * `anim` is auto-picked from the room phase if not explicitly provided.
 */
export function monsterStage(appearance, opts = {}) {
  const stage = el('div');
  stage.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;position:relative;width:100%;';
  const inner = el('div');
  inner.style.cssText = 'width: min(72%, 460px); aspect-ratio: 0.78; position: relative;';
  inner.innerHTML = renderMonsterSVG(appearance || DEFAULT_APPEARANCE, opts);
  const first = inner.firstElementChild;
  if (first) first.style.cssText = 'width:100%;height:100%;display:block;';
  stage.appendChild(inner);
  return { stage, sprite: inner };
}

/** Pick the right animation class given the room phase + monster status. */
export function animForPhase(phase, monster) {
  if (!monster || monster.status === 'dead') return 'death';
  switch (phase) {
    case PHASE.LOBBY: return 'walk';
    case PHASE.FIGHT: return 'idle';
    case PHASE.RESULTS: return 'idle';
    case PHASE.LEVEL_UP: return 'idle';
    case PHASE.DEATH: return 'death';
    case PHASE.CREATION: return 'spawn';
    case PHASE.IDLE:
    default: return 'idle';
  }
}

/** Center-aligned banner strip pinned to the top of the stage. */
export function topBanner(text, opts = {}) {
  const b = el('div', 'banner-strip');
  b.style.cssText = `position:absolute;top:18px;left:50%;transform:translateX(-50%) rotate(-0.6deg);${opts.style || ''}`;
  b.textContent = text;
  return b;
}
