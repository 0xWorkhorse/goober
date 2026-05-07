import { C2S, reviveCost } from '@bossraid/shared';
import { renderMonsterSVG } from '@bossraid/shared/monster';

/** Death screen: revive (legacy points) or abandon (start fresh). */
export function renderDeath(root, ctx) {
  root.innerHTML = '';
  const m = ctx.state.monster;
  const channel = ctx.me;
  const cost = m ? reviveCost(m.timesRevived || 0) : 0;
  const legacy = ctx.legacyPoints ?? 0; // populated by /api/me below; fallback 0

  const wrap = document.createElement('div');
  wrap.className = 'col';

  const head = document.createElement('div');
  head.className = 'card';
  head.innerHTML = `
    <h1 class="banner defeat">${escapeHtml(m?.name) || 'Your monster'} has fallen.</h1>
    ${m ? `<p>Reached level <b>${m.level}</b> · won <b>${m.wins}</b> fights · revived <b>${m.timesRevived || 0}</b> time(s).</p>` : ''}
    <div class="row" style="gap:14px;align-items:center">
      ${m ? `<div style="width:140px">${renderMonsterSVG(m.appearance, { idle: false })}</div>` : ''}
      <p>Choose: come back at half HP for <b>${cost}</b> legacy point(s), or start a fresh monster.</p>
    </div>
    <p class="stat-name">You have <b>${legacy}</b> legacy point(s).</p>
  `;
  wrap.appendChild(head);

  const ctl = document.createElement('div');
  ctl.className = 'card row';
  ctl.style.gap = '10px';
  const revive = document.createElement('button');
  revive.className = 'primary';
  revive.textContent = `Revive (${cost} legacy)`;
  revive.disabled = legacy < cost;
  revive.addEventListener('click', () => ctx.send(C2S.REVIVE_MONSTER, {}));

  const abandon = document.createElement('button');
  abandon.className = 'danger';
  abandon.textContent = 'Start a new monster';
  abandon.addEventListener('click', () => ctx.send(C2S.ABANDON_MONSTER, {}));

  // Suppress unused-var warning for `channel`
  void channel;

  ctl.append(revive, abandon);
  wrap.appendChild(ctl);

  root.appendChild(wrap);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
