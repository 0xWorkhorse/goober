/**
 * Persistent dashboard layout shared by every fight-loop phase.
 *
 *   ┌──────────────┬───────────────────────┬────────────┐
 *   │ left column  │    monster stage      │  right col │
 *   │ chat-side    │    (center, no pad)   │  controls  │
 *   └──────────────┴───────────────────────┴────────────┘
 *   ┌──────────────────────────────────────────────────┐
 *   │ chat pulse strip                                 │
 *   └──────────────────────────────────────────────────┘
 *
 * Each phase passes in three element nodes for the columns + an optional
 * absolutely-positioned overlay layer that sits over the monster stage.
 */

import { renderMonsterSVG, DEFAULT_APPEARANCE } from '@bossraid/shared/monster';

import { el } from './chrome.js';

/**
 * @param {{ left: HTMLElement, center: { stage: HTMLElement, overlays?: HTMLElement }, right: HTMLElement }} parts
 */
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
 * Build a monster-stage container with the inline SVG plus an absolutely-
 * positioned overlay layer for badges, banners, slot dots, etc.
 *
 * @param {object} appearance
 * @param {{ level?: number, idle?: boolean }} [opts]
 */
export function monsterStage(appearance, opts = {}) {
  const stage = el('div');
  stage.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;position:relative;width:100%;';
  const inner = el('div');
  inner.style.cssText = 'width: min(72%, 460px); aspect-ratio: 0.78; position: relative;';
  inner.innerHTML = renderMonsterSVG(appearance || DEFAULT_APPEARANCE, opts);
  inner.firstElementChild.style.cssText = 'width:100%;height:100%;display:block;';
  stage.appendChild(inner);
  return { stage, sprite: inner };
}

/** Center-aligned banner strip pinned to the top of the stage. */
export function topBanner(text, opts = {}) {
  const b = el('div', 'banner-strip');
  b.style.cssText = `position:absolute;top:18px;left:50%;transform:translateX(-50%) rotate(-0.6deg);${opts.style || ''}`;
  b.textContent = text;
  return b;
}
