import { ABILITY_BY_ID, C2S, PHASE } from '@bossraid/shared';

/**
 * Active-fight view: 3 ability buttons with cooldown rings, current monster
 * stats display, chat-roster count, boss HP readout. The streamer's eyes are
 * on chat and the overlay; this view stays minimal.
 */
export function renderFight(root, { state, send, i18n }) {
  root.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'col';
  wrap.style.gap = '20px';

  const status = document.createElement('div');
  status.className = 'card';
  status.appendChild(buildStatusBlock(state, i18n));
  wrap.appendChild(status);

  const abilityCard = document.createElement('div');
  abilityCard.className = 'card';
  abilityCard.appendChild(buildAbilityRow(state, send));
  wrap.appendChild(abilityCard);

  if (state.phase === PHASE.FIGHT) {
    const ctl = document.createElement('div');
    ctl.className = 'card row between';
    const left = document.createElement('div');
    left.innerHTML = `<span class="phase-chip">${phaseLabel(state.phase, i18n)}</span>
      <span style="margin-left:12px">Time left: <b>${formatTime(state.timeLeftMs)}</b></span>`;
    const right = document.createElement('button');
    right.className = 'danger';
    right.textContent = 'Force end fight';
    right.addEventListener('click', () => send(C2S.END_FIGHT_FORCE, {}));
    ctl.append(left, right);
    wrap.appendChild(ctl);
  }

  root.appendChild(wrap);
}

function buildStatusBlock(state, i18n) {
  const div = document.createElement('div');
  const m = state.monster;
  const bossPct = state.maxBossHP > 0 ? Math.round(100 * (state.bossHP / state.maxBossHP)) : 0;
  div.innerHTML = `
    <div class="row between">
      <h2>${m ? `${escapeHtml(m.name)} — Lv ${m.level}` : 'No active monster'}</h2>
      <span class="phase-chip">${phaseLabel(state.phase, i18n)}</span>
    </div>
    ${m ? `
      <div class="row" style="margin-top:8px;gap:24px">
        <div><b>${state.bossHP || 0}</b> / ${state.maxBossHP || 0} HP <span class="stat-name">(${bossPct}%)</span></div>
        <div><b>${state.chatters?.length || 0}</b> chatters</div>
      </div>
    ` : ''}
  `;
  return div;
}

function buildAbilityRow(state, send) {
  const div = document.createElement('div');
  div.className = 'ability-row';
  const ids = state.monster?.abilityIds || [];
  for (let slot = 0; slot < 3; slot++) {
    const id = ids[slot];
    const ab = id ? ABILITY_BY_ID[id] : null;
    const btn = document.createElement('div');
    btn.className = 'ability';
    if (!ab || state.phase !== PHASE.FIGHT) btn.setAttribute('disabled', '');
    if (!ab) {
      btn.innerHTML = `<div class="ability-name">—</div><div class="ability-meta">empty slot</div>`;
    } else {
      btn.innerHTML = `
        <div class="ability-name">${ab.id.replace('_', ' ')}</div>
        <div class="ability-meta">${ab.damage > 0 ? `dmg ${ab.damage}` : 'utility'} · cd ${ab.cooldownMs / 1000}s</div>
      `;
      const cdInfo = state.cooldowns?.[slot];
      const remaining = cdInfo?.remainingMs || 0;
      if (remaining > 0) {
        btn.setAttribute('disabled', '');
        const overlay = document.createElement('div');
        overlay.className = 'ability-cd-overlay';
        overlay.textContent = (remaining / 1000).toFixed(1);
        btn.appendChild(overlay);
        const bar = document.createElement('div');
        bar.className = 'ability-cd-bar';
        const pct = remaining / ab.cooldownMs;
        bar.style.width = `${pct * 100}%`;
        btn.appendChild(bar);
      }
      btn.addEventListener('click', () => {
        if (state.phase !== PHASE.FIGHT || remaining > 0) return;
        send(C2S.CAST_ABILITY, { slot });
      });
    }
    div.appendChild(btn);
  }
  return div;
}

function phaseLabel(phase) {
  return phase || 'idle';
}

function formatTime(ms) {
  if (!ms || ms < 0) return '0:00';
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
