import { renderMonsterSVG } from '@bossraid/shared/monster';

/**
 * Past monsters from this channel — a "memorial wall" for pets that fell.
 * Reads /api/graveyard once per mount; entries are sorted newest-first.
 */
export async function renderGraveyard(root, ctx) {
  root.innerHTML = '<div class="card"><h2>Loading graveyard…</h2></div>';
  let data;
  try {
    const r = await fetch('/api/graveyard');
    if (!r.ok) throw new Error('http_' + r.status);
    data = await r.json();
  } catch (err) {
    root.innerHTML = `<div class="card"><h2>Could not load graveyard.</h2><p>${err.message}</p></div>`;
    return;
  }

  const list = data.monsters || [];
  root.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'col';

  const header = document.createElement('div');
  header.className = 'card row between';
  header.innerHTML = `
    <h2>Monster Graveyard</h2>
    <span class="stat-name">${list.length} past monster(s)</span>
  `;
  const back = document.createElement('button');
  back.className = 'ghost';
  back.textContent = '← back';
  back.addEventListener('click', () => { ctx.showGraveyard = false; ctx.rerender(); });
  header.appendChild(back);
  wrap.appendChild(header);

  if (!list.length) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.innerHTML = '<p class="stat-name">No fallen monsters yet — keep playing.</p>';
    wrap.appendChild(empty);
  } else {
    const grid = document.createElement('div');
    grid.className = 'graveyard-grid';
    for (const m of list) {
      const card = document.createElement('div');
      card.className = 'tomb';
      const date = m.diedAt ? new Date(m.diedAt).toLocaleDateString() : 'retired';
      card.innerHTML = `
        ${renderMonsterSVG(m.appearance, { idle: false })}
        <h3>${escapeHtml(m.name)}</h3>
        <div class="meta">${m.status === 'dead' ? `Lv ${m.peakLevel || m.level}` : 'retired'} · ${m.wins} wins</div>
        <div class="meta">${m.status === 'dead' ? '🪦 ' + date : '🪶 retired'}</div>
        <div class="meta">${m.timesRevived ? `Revived ${m.timesRevived}×` : ''}</div>
      `;
      grid.appendChild(card);
    }
    wrap.appendChild(grid);
  }

  root.appendChild(wrap);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
