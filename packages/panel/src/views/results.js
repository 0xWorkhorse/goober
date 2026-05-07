import { el, escapeHtml } from './chrome.js';
import { buildDashboard, monsterStage } from './dashboard.js';

/** RESULTS phase view — banner + MVP list + total damage. */
export function renderResults(root, ctx) {
  root.innerHTML = '';
  const m = ctx.state.monster;
  const r = ctx.lastResults || {};
  const isVictory = !!r.victory;

  const left = (() => {
    const w = el('div');
    w.innerHTML = '<h4>Top damage</h4>';
    for (const c of (r.mvpChatters || []).slice(0, 6)) {
      const row = el('div', 'stat-block');
      row.innerHTML = `<span style="color:var(--accent-3)">${escapeHtml(c.login)}</span><span class="val">${c.damageDealt || 0}</span>`;
      w.appendChild(row);
    }
    if (!r.mvpChatters?.length) {
      const empty = el('p');
      empty.style.cssText = 'font-family:var(--font-marker);color:var(--ink-2);font-size:13px;margin:0;';
      empty.textContent = 'no contenders this round';
      w.appendChild(empty);
    }
    return w;
  })();

  const right = (() => {
    const w = el('div');
    w.innerHTML = `
      <h4>Round summary</h4>
      <div class="stat-block"><span>duration</span><span class="val">${Math.round((r.durationMs || 0) / 100) / 10}s</span></div>
      <div class="stat-block"><span>total damage</span><span class="val">${r.totalDamage || 0}</span></div>
      <div class="stat-block"><span>monster level</span><span class="val">${r.monsterLevel ?? '—'}</span></div>
    `;
    const note = el('p');
    note.style.cssText = 'font-family:var(--font-marker);color:var(--ink-2);font-size:13px;margin:8px 0 0;';
    note.textContent = isVictory ? 'one for the graveyard 🪦' : 'next fight loading…';
    w.appendChild(note);
    return w;
  })();

  const { stage } = monsterStage(m?.appearance, { level: m?.level || 1, idle: false });
  const overlays = el('div');
  const banner = el('div');
  banner.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%, -90%);text-align:center;';
  banner.innerHTML = `<h1 class="banner big ${isVictory ? 'victory' : 'defeat'}">${isVictory ? 'Chat wins!' : 'Boss wins!'}</h1>`;
  overlays.appendChild(banner);

  root.appendChild(buildDashboard({ left, center: { stage, overlays }, right }));
}
