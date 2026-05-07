import { C2S, reviveCost } from '@bossraid/shared';

import { el, escapeHtml } from './chrome.js';
import { buildDashboard, monsterStage } from './dashboard.js';

/** DEATH phase view — revive (legacy points) or abandon (start fresh). */
export function renderDeath(root, ctx) {
  root.innerHTML = '';
  const m = ctx.state.monster;
  const cost = m ? reviveCost(m.timesRevived || 0) : 0;
  const legacy = ctx.legacyPoints ?? 0;

  const left = (() => {
    const w = el('div');
    w.innerHTML = `
      <h4>Run summary</h4>
      <div class="stat-block"><span>peak level</span><span class="val">${m?.peakLevel || m?.level || 1}</span></div>
      <div class="stat-block"><span>total wins</span><span class="val">${m?.wins || 0}</span></div>
      <div class="stat-block"><span>times revived</span><span class="val">${m?.timesRevived || 0}</span></div>
      <div class="stat-block"><span>legacy balance</span><span class="val">${legacy}</span></div>
    `;
    return w;
  })();

  const right = (() => {
    const w = el('div');
    w.innerHTML = `<h4>Choose your fate</h4>`;
    const note = el('p');
    note.style.cssText = 'font-family:var(--font-marker);font-size:13px;color:var(--ink-2);margin:0;';
    note.textContent = `Revive comes back at half max HP. Costs ${cost} legacy point${cost === 1 ? '' : 's'}.`;
    w.appendChild(note);

    const revive = el('button', 'btn primary giant');
    revive.style.cssText = 'align-self:stretch;margin-top:8px;';
    revive.textContent = `Revive (${cost})`;
    revive.disabled = legacy < cost;
    revive.addEventListener('click', () => ctx.send(C2S.REVIVE_MONSTER, {}));
    w.appendChild(revive);

    const fresh = el('button', 'btn danger');
    fresh.textContent = '✗ start a new monster';
    fresh.addEventListener('click', () => ctx.send(C2S.ABANDON_MONSTER, {}));
    w.appendChild(fresh);
    return w;
  })();

  const { stage } = monsterStage(m?.appearance, { level: m?.level || 1, anim: 'death' });
  const overlays = el('div');
  const banner = el('div');
  banner.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%, -90%);text-align:center;';
  banner.innerHTML = `<h1 class="banner big defeat">${escapeHtml(m?.name) || 'Your monster'} has fallen.</h1>`;
  overlays.appendChild(banner);

  root.appendChild(buildDashboard({ left, center: { stage, overlays }, right }));
}
