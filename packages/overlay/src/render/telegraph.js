/**
 * Boss telegraph banner — appears during a signature wind-up. The overlay
 * shouts the sig name, the chat verb that mitigates it, and a 4-second-ish
 * countdown ring so chat has clear visual urgency.
 */

const COUNTER_LABEL = {
  block: '!block',
  heal: '!heal',
  attack: '!attack',
  null: null,
};

const COUNTER_TONE = {
  block: '#74c0fc',
  heal: '#06d6a0',
  attack: '#ffd166',
};

/**
 * @param {HTMLElement} container
 * @param {{sigName, flavor, counter, target, targets, remainingMs, vfx}|null} telegraph
 */
export function renderTelegraph(container, telegraph) {
  if (!telegraph) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }
  container.style.display = '';
  const counterLabel = COUNTER_LABEL[telegraph.counter] || null;
  const tone = COUNTER_TONE[telegraph.counter] || '#fdfaf3';
  const seconds = Math.max(0, telegraph.remainingMs / 1000);
  const totalMs = telegraph._totalMs || telegraph.remainingMs || 1;
  const pct = Math.max(0, Math.min(1, seconds * 1000 / totalMs));
  const C = 2 * Math.PI * 22;
  const dashOffset = C * (1 - pct);

  let cta;
  if (telegraph.target === 'all') {
    cta = `EVERYONE — type <span class="cmd-pill" style="background:${tone}">${counterLabel || '!attack'}</span> now!`;
  } else if (telegraph.target === 'one') {
    const who = telegraph.targets?.[0] || '???';
    cta = `<span class="t-target">@${who}</span> — type <span class="cmd-pill" style="background:${tone}">${counterLabel || '!block'}</span>!`;
  } else if (telegraph.target === 'half') {
    cta = `HALF OF YOU — type <span class="cmd-pill" style="background:${tone}">${counterLabel || '!block'}</span>`;
  } else if (telegraph.target === 'utility') {
    cta = `Spam <span class="cmd-pill" style="background:${tone}">${counterLabel || '!attack'}</span> to cancel!`;
  } else {
    cta = '';
  }

  container.innerHTML = `
    <div class="telegraph-card">
      <svg class="t-ring" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="6" />
        <circle cx="28" cy="28" r="22" fill="none" stroke="${tone}" stroke-width="6"
          stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${dashOffset}"
          transform="rotate(-90 28 28)" />
        <text x="28" y="32" text-anchor="middle" font-family="Caveat, cursive" font-size="22" font-weight="700" fill="#1a1614">${seconds.toFixed(1)}</text>
      </svg>
      <div class="t-body">
        <div class="t-name">${escape(telegraph.sigName)}</div>
        <div class="t-flavor">${escape(telegraph.flavor || '')}</div>
        <div class="t-cta">${cta}</div>
      </div>
    </div>`;
}

function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Highlight the targeted chatter sprites with a danger ring. */
export function highlightTelegraphTargets(chatterStrip, targetLogins) {
  // Clear previous marks
  for (const el of chatterStrip.querySelectorAll('.chatter-sprite.t-targeted')) {
    el.classList.remove('t-targeted');
  }
  if (!targetLogins?.length) return;
  const set = new Set(targetLogins);
  for (const el of chatterStrip.querySelectorAll('[data-chatter]')) {
    if (set.has(el.dataset.chatter)) el.classList.add('t-targeted');
  }
}
