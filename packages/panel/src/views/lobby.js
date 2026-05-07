import { C2S, PHASE, STAT_DEFS, deriveStats, effectiveBossMaxHP } from '@bossraid/shared';

/**
 * Pre-fight idle view. Shows the active monster's stats and an "Open lobby"
 * button. Used for both the IDLE phase (before opening the lobby) and the
 * LOBBY phase (countdown to fight).
 */
export function renderLobby(root, { state, send }) {
  root.innerHTML = '';
  const m = state.monster;
  if (!m) {
    root.innerHTML = '<div class="card"><h2>No active monster.</h2><p>Create one to begin.</p></div>';
    return;
  }

  const wrap = document.createElement('div');
  wrap.className = 'col';

  const monsterCard = document.createElement('div');
  monsterCard.className = 'card';
  const stats = deriveStats(m.statPointsSpent);
  const maxHp = effectiveBossMaxHP(stats, 30);
  monsterCard.innerHTML = `
    <div class="row between">
      <div>
        <h2>${escapeHtml(m.name)} — Lv ${m.level}</h2>
        <div class="stat-name">Wins: ${m.wins} · Reroll tokens: ${m.rerollTokens} · Times revived: ${m.timesRevived}</div>
      </div>
      <span class="phase-chip">${state.phase}</span>
    </div>
    <div class="stat-grid" style="margin-top:14px">
      ${renderStat('HP', `${maxHp}`, `(${stats.hp} base @ 30 chatters)`)}
      ${renderStat(STAT_DEFS.attack.label, stats.attack, 'per hit')}
      ${renderStat(STAT_DEFS.defense.label, `${stats.defense}%`, 'damage taken −')}
      ${renderStat(STAT_DEFS.speed.label, stats.speed, 'attack rate')}
      ${renderStat(STAT_DEFS.crit.label, `${stats.crit}%`, '2× on crit')}
      ${renderStat(STAT_DEFS.abilityPower.label, `${stats.abilityPower}%`, 'ability scale')}
    </div>
    <div style="margin-top:14px">
      <h2 style="font-size:14px">Abilities</h2>
      <div class="row" style="flex-wrap:wrap;gap:8px;margin-top:6px">
        ${(m.abilityIds || []).map((id) => `<span class="phase-chip">${id.replace('_', ' ')}</span>`).join('')}
      </div>
    </div>
  `;
  wrap.appendChild(monsterCard);

  const ctl = document.createElement('div');
  ctl.className = 'card row between';
  const left = document.createElement('div');
  if (state.phase === PHASE.LOBBY) {
    left.innerHTML = `<b>Lobby open.</b> Chat can <code>!join</code>. Time left: <b>${formatTime(state.timeLeftMs)}</b>`;
  } else {
    left.innerHTML = '<span class="stat-name">Open the lobby when you and chat are ready.</span>';
  }
  const right = document.createElement('button');
  right.className = 'primary';
  right.textContent = state.phase === PHASE.LOBBY ? 'Lobby is open…' : 'Open lobby';
  right.disabled = state.phase === PHASE.LOBBY;
  right.addEventListener('click', () => send(C2S.START_LOBBY, {}));
  ctl.append(left, right);
  wrap.appendChild(ctl);

  if (state.phase === PHASE.LOBBY) {
    const roster = document.createElement('div');
    roster.className = 'card';
    roster.innerHTML = `<h2>${state.chatters?.length || 0} chatter${state.chatters?.length === 1 ? '' : 's'} ready</h2>`;
    wrap.appendChild(roster);
  }

  root.appendChild(wrap);
}

function renderStat(name, value, hint) {
  return `
    <div class="stat-item">
      <span class="stat-name">${name}<br><span style="font-size:11px;opacity:0.7">${hint}</span></span>
      <span class="stat-value">${value}</span>
    </div>
  `;
}
function formatTime(ms) {
  if (!ms || ms < 0) return '0:00';
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
