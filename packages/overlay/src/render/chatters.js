/**
 * Chatter sprite renderer — paper-card framed PFP. The chatter's Twitch
 * profile picture sits inside a hand-drawn ink-stroked card with a small
 * drop shadow. When no PFP URL is available yet (cache cold), falls back to
 * a deterministic dicebear avatar so the slot is never empty.
 *
 * Block ring + downed state are still rendered as overlay strokes.
 */

const INK = '#1a1614';

function fallbackPfp(login) {
  return `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(login)}&backgroundType=solid&backgroundColor=fdfaf3`;
}

function escapeAttr(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/**
 * Render a single chatter sprite as HTML. Composes a circular paper card
 * around an `<img>` of the PFP plus optional block / downed overlays.
 */
export function renderChatterSprite(chatter, now = Date.now()) {
  const url = chatter.pfpUrl || fallbackPfp(chatter.login);
  const downed = chatter.hp <= 0;
  const blocking = chatter.blockedUntilMs && chatter.blockedUntilMs > now;
  const dim = downed ? 0.35 : 1;
  return `
    <div class="pfp-card" style="opacity:${dim}">
      <img class="pfp-img" src="${escapeAttr(url)}" alt="" loading="lazy" decoding="async"
           onerror="this.onerror=null;this.src='${escapeAttr(fallbackPfp(chatter.login))}'" />
      ${blocking ? `<svg class="pfp-block" viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" fill="none" stroke="#74c0fc" stroke-width="3" stroke-dasharray="4 3" opacity="0.85"/></svg>` : ''}
      ${downed ? `<svg class="pfp-x" viewBox="0 0 80 80"><path d="M 18 18 L 62 62 M 62 18 L 18 62" stroke="${INK}" stroke-width="4" stroke-linecap="round" /></svg>` : ''}
    </div>`;
}

/**
 * Mount/update a list of chatter sprites into a container. Reuses existing
 * DOM nodes by login so the PFP `<img>` doesn't reload on every state delta.
 */
export function syncChatterSprites(container, chatters, now = Date.now()) {
  const seen = new Set();
  for (const c of chatters) {
    seen.add(c.login);
    let el = container.querySelector(`[data-chatter="${cssEscape(c.login)}"]`);
    if (!el) {
      el = document.createElement('div');
      el.className = 'chatter-sprite';
      el.dataset.chatter = c.login;
      const label = document.createElement('div');
      label.className = 'chatter-name';
      label.textContent = c.login;
      el.appendChild(label);
      const wrap = document.createElement('div');
      wrap.className = 'chatter-pfp';
      el.appendChild(wrap);
      container.appendChild(el);
    }
    const wrap = el.querySelector('.chatter-pfp');
    const newHtml = renderChatterSprite(c, now);
    // Avoid replacing innerHTML if nothing relevant changed — keeps the <img>
    // stable so it doesn't refetch.
    const sig = `${c.pfpUrl || ''}|${c.hp <= 0}|${(c.blockedUntilMs && c.blockedUntilMs > now) ? 1 : 0}`;
    if (wrap.dataset.sig !== sig) {
      wrap.innerHTML = newHtml;
      wrap.dataset.sig = sig;
    }
    el.classList.toggle('chatter-down', c.hp <= 0);
  }
  for (const el of [...container.querySelectorAll('[data-chatter]')]) {
    if (!seen.has(el.dataset.chatter)) el.remove();
  }
}

function cssEscape(s) {
  return s.replace(/["\\]/g, '\\$&');
}
