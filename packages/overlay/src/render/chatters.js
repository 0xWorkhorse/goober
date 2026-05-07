/**
 * Chatter sprite renderer. Deterministic appearance from username hash:
 *   4 body shapes × 4 hat styles × hue from hash → distinguishable but stable.
 *
 * At step 4 we render every chatter as an individual sprite. Step 14 adds
 * mob aggregation tiers for high-count fights.
 */

const BODY_SHAPES = ['round', 'oval', 'square', 'tall'];
const HATS = ['none', 'cap', 'crown', 'horn'];

function hashLogin(login) {
  let h = 5381;
  for (let i = 0; i < login.length; i++) h = ((h << 5) + h + login.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function chatterDesign(login) {
  const h = hashLogin(login);
  const body = BODY_SHAPES[h % BODY_SHAPES.length];
  const hat = HATS[(h >> 2) % HATS.length];
  const hue = (h >> 4) % 360;
  return { body, hat, hue };
}

/**
 * Render a single chatter sprite as inline SVG.
 * @param {{login:string, hp:number, maxHp:number, blockedUntilMs?:number}} chatter
 * @param {number} now
 */
export function renderChatterSVG(chatter, now = Date.now()) {
  const d = chatterDesign(chatter.login);
  const fill = `hsl(${d.hue} 70% 60%)`;
  const accent = `hsl(${(d.hue + 40) % 360} 70% 50%)`;
  const dim = chatter.hp <= 0 ? 0.28 : 1;
  const blocking = chatter.blockedUntilMs && chatter.blockedUntilMs > now;

  let bodyShape;
  switch (d.body) {
    case 'oval':   bodyShape = `<ellipse cx="40" cy="50" rx="22" ry="26" fill="${fill}" stroke="#1a1a2e" stroke-width="3"/>`; break;
    case 'square': bodyShape = `<rect x="18" y="26" width="44" height="48" rx="10" fill="${fill}" stroke="#1a1a2e" stroke-width="3"/>`; break;
    case 'tall':   bodyShape = `<rect x="22" y="20" width="36" height="58" rx="14" fill="${fill}" stroke="#1a1a2e" stroke-width="3"/>`; break;
    case 'round':
    default:       bodyShape = `<circle cx="40" cy="50" r="24" fill="${fill}" stroke="#1a1a2e" stroke-width="3"/>`;
  }

  let hatShape = '';
  switch (d.hat) {
    case 'cap':   hatShape = `<rect x="22" y="14" width="36" height="10" rx="3" fill="${accent}" stroke="#1a1a2e" stroke-width="2"/><rect x="46" y="22" width="14" height="4" rx="1" fill="${accent}" stroke="#1a1a2e" stroke-width="2"/>`; break;
    case 'crown': hatShape = `<polygon points="22,22 30,12 36,20 42,10 48,18 54,12 58,22" fill="#ffd166" stroke="#1a1a2e" stroke-width="2"/>`; break;
    case 'horn':  hatShape = `<polygon points="36,24 40,8 44,24" fill="${accent}" stroke="#1a1a2e" stroke-width="2"/>`; break;
    case 'none':
    default:      hatShape = '';
  }

  const blockRing = blocking
    ? `<circle cx="40" cy="50" r="34" fill="none" stroke="#74c0fc" stroke-width="3" stroke-dasharray="4 3" opacity="0.85"/>`
    : '';

  return `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg" style="opacity:${dim}">
    ${bodyShape}
    ${hatShape}
    <circle cx="32" cy="48" r="2.6" fill="#1a1a2e"/>
    <circle cx="48" cy="48" r="2.6" fill="#1a1a2e"/>
    <path d="M 32 60 Q 40 64 48 60" fill="none" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round"/>
    ${blockRing}
  </svg>`;
}

/**
 * Mount/update a list of chatter sprites into a container. Reuses existing DOM
 * nodes by login key. Only handles individual sprites — mob clusters are
 * rendered in parallel by mobs.js#syncMobSprites.
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
      const svgWrap = document.createElement('div');
      svgWrap.className = 'chatter-svg';
      el.appendChild(svgWrap);
      container.appendChild(el);
    }
    el.querySelector('.chatter-svg').innerHTML = renderChatterSVG(c, now);
    el.classList.toggle('chatter-down', c.hp <= 0);
  }
  // Remove individual sprites whose chatters are no longer in the roster
  // (they may have been demoted to a mob, or left entirely).
  for (const el of [...container.querySelectorAll('[data-chatter]')]) {
    if (!seen.has(el.dataset.chatter)) el.remove();
  }
}

function cssEscape(s) {
  return s.replace(/["\\]/g, '\\$&');
}
