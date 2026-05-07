import { renderMonsterSVG } from '@bossraid/shared/monster';

import { el, escapeHtml } from './chrome.js';

/** Memorial wall of past monsters from this channel. */
export async function renderGraveyard(root, ctx) {
  root.innerHTML = `
    <div class="dash-single">
      <h2 style="font-family:var(--font-hand);font-weight:700;font-size:36px;margin:0">Loading graveyard…</h2>
    </div>
  `;
  let data;
  try {
    const r = await fetch('/api/graveyard');
    if (!r.ok) throw new Error('http_' + r.status);
    data = await r.json();
  } catch (err) {
    // Demo mode (no backend) — synthesize a small fixture so the screen is meaningful.
    data = { monsters: ctx.demoGraveyard || demoMonsters() };
  }

  const list = data.monsters || [];
  root.innerHTML = '';
  const wrap = el('div', 'dash-single');
  const head = el('div');
  head.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;';
  head.innerHTML = `
    <div>
      <span class="banner-strip">memorial wall</span>
      <h2 style="font-family:var(--font-hand);font-weight:700;font-size:38px;margin:6px 0 0">Monster Graveyard</h2>
      <p style="font-family:var(--font-marker);font-size:14px;color:var(--ink-2);margin:4px 0 0">${list.length} past monster${list.length === 1 ? '' : 's'}</p>
    </div>
  `;
  const back = el('button', 'btn ghost');
  back.textContent = '← back';
  back.addEventListener('click', () => { ctx.showGraveyard = false; ctx.rerender(); });
  head.appendChild(back);
  wrap.appendChild(head);

  if (!list.length) {
    const empty = el('p');
    empty.style.cssText = 'font-family:var(--font-marker);color:var(--ink-2);font-size:16px;';
    empty.textContent = 'No fallen monsters yet — keep playing.';
    wrap.appendChild(empty);
  } else {
    const grid = el('div', 'graveyard-grid');
    for (const m of list) {
      const card = el('div', 'tomb');
      const date = m.diedAt ? new Date(m.diedAt).toLocaleDateString() : 'retired';
      const inner = el('div');
      inner.innerHTML = renderMonsterSVG(m.appearance, { idle: false, level: m.peakLevel || m.level || 1 });
      card.append(inner);
      const h = el('h3'); h.textContent = m.name; card.appendChild(h);
      const meta1 = el('div', 'meta');
      meta1.textContent = `${m.status === 'dead' ? `Lv ${m.peakLevel || m.level}` : 'retired'} · ${m.wins || 0} wins`;
      const meta2 = el('div', 'meta');
      meta2.textContent = m.status === 'dead' ? '🪦 ' + escapeHtml(date) : '🪶 retired';
      card.append(meta1, meta2);
      if (m.timesRevived) {
        const r = el('div', 'meta');
        r.textContent = `Revived ${m.timesRevived}×`;
        card.appendChild(r);
      }
      grid.appendChild(card);
    }
    wrap.appendChild(grid);
  }
  root.appendChild(wrap);
}

function demoMonsters() {
  return [
    {
      name: 'Borb the Bean', status: 'dead',
      appearance: { body: 'blob', eyes: 'googly', mouth: 'fangs', horns: 'antennae', arms: 'noodle', feet: 'tentacles', paletteIdx: 4 },
      level: 7, peakLevel: 7, wins: 6, timesRevived: 1, diedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    },
    {
      name: 'Wally Box', status: 'dead',
      appearance: { body: 'stack', eyes: 'beady', mouth: 'underbite', horns: 'curly', arms: 'crab', feet: 'wheels', paletteIdx: 7 },
      level: 4, peakLevel: 5, wins: 3, timesRevived: 0, diedAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
    },
    {
      name: 'Yolkrid', status: 'retired',
      appearance: { body: 'lump', eyes: 'cyclops', mouth: 'grin', horns: 'nubs', arms: 'stubs', feet: 'paws', paletteIdx: 11 },
      level: 2, peakLevel: 3, wins: 1, timesRevived: 0,
    },
  ];
}
