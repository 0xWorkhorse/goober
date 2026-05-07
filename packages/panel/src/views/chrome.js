/**
 * Shared dashboard chrome — top bar with live status, ChatPulse strip with
 * a horizontally scrolling chat-message animation, and a couple of small
 * helpers re-used across phase views.
 *
 * Visual language adapted from the Claude Design hi-fi mock — paper bg,
 * ink lines, drop-shadow stamps.
 */

const PHASE_LABELS = {
  creation: 'Creation',
  idle: 'Idle',
  lobby: 'Lobby open',
  fight: 'Fight',
  results: 'Results',
  level_up: 'Victory — level up',
  death: 'Defeated',
};

export function renderTopBar({ phase, me, connected, ircStatus = 'connected', onGraveyard, onLogout }) {
  const wrap = el('div', 'topbar');
  wrap.innerHTML = `
    <div class="brand">BossRaid<small>v0.4</small></div>
    <span class="phase-chip"><span class="blip"></span>${(PHASE_LABELS[phase] || phase || '').toUpperCase()}</span>
    <span style="flex:1"></span>
    <span class="who">@${escapeHtml(me?.login || 'demo')}</span>
    <span class="conn-pill ${connected ? '' : 'bad'}"><span class="dot"></span>${connected ? 'live' : 'reconnecting…'}</span>
    <button class="btn tiny ghost" data-act="graveyard">🪦 graveyard</button>
    <button class="btn tiny ghost" data-act="logout">sign out</button>
  `;
  wrap.querySelector('[data-act="graveyard"]').addEventListener('click', () => onGraveyard?.());
  wrap.querySelector('[data-act="logout"]').addEventListener('click', () => onLogout?.());
  return wrap;
}

/**
 * Scrolling ChatPulse strip. Updates incrementally — incoming chat events
 * push to the buffer; old messages roll off as new ones come in.
 */
export class ChatPulse {
  constructor() {
    this.root = el('div', 'pulse-ribbon');
    this.row = el('div', 'pulse-row');
    this.root.appendChild(this.row);
    this.messages = [];
    this.cap = 32;
    this.seed();
  }

  seed() {
    // Seed with a few placeholder messages so the bar isn't empty.
    const placeholder = ['kelp_lord !attack', 'vapor !join', 'mr_jam !heal', 'linda44 !attack', 'glub !block'];
    for (const m of placeholder) {
      const [who, cmd] = m.split(' ');
      this.messages.push({ who, cmd });
    }
    this.render();
  }

  push({ login, action }) {
    if (!action) return;
    const cmd = '!' + action;
    this.messages.push({ who: login, cmd });
    if (this.messages.length > this.cap) this.messages.shift();
    this.render();
  }

  render() {
    const html = this.messages
      .concat(this.messages) // duplicate for seamless scroll
      .map(
        (m) =>
          `<span class="pulse-msg"><span class="who">${escapeHtml(m.who)}</span><span class="cmd">${escapeHtml(m.cmd)}</span></span>`,
      )
      .join('');
    this.row.innerHTML = html;
  }
}

export function el(tag, cls) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
