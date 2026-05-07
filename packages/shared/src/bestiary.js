/**
 * Goober Bestiary — preset monster library.
 *
 * Each preset is a hand-drawn character with named anchor points so the
 * shared expression atlas (Eyes / Brows / Mouth) can drop in. Sprites are
 * rigged with `data-part` SVG groups so animations.css transforms can
 * target individual limbs (idle bob, walk cycle, hurt squish, etc.).
 *
 * Visual language faithfully ported from the Goober Bestiary design package:
 *   - ballpoint pen INK strokes (#1a1614)
 *   - paper body fills (#fdfaf3) tintable per variant via CSS
 *   - SVG turbulence wobble filter for "drawn" feel
 *   - per-render jitter via animations.css
 *
 * Variants (normal / poison / fire / ice / shadow) are applied via the
 * [data-variant] attr on the `.sprite-stage` wrapper — see animations.css.
 */

const INK = '#1a1614';
const INK_LIGHT = '#3a342f';

const PEN = `fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"`;
const PEN_THIN = `fill="none" stroke="${INK_LIGHT}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
const FILL = `fill="#fdfaf3" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"`;
const FILL_LIGHT = `fill="#fdfaf3" stroke="${INK}" stroke-width="3.0" stroke-linejoin="round"`;

export const VIEWBOX = '0 0 220 280';

// ─── Shared SVG defs ────────────────────────────────────────────────────────
export function bestiaryDefs() {
  return `
    <filter id="sketchy" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="sketchy-alt" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="11" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  `;
}

// ─── Expression atlas — eyes, brows, mouths shared by every preset ──────────

function eyes(expr, cx, cy, gap = 18, size = 1) {
  const lx = cx - gap, rx = cx + gap;
  const r = 6 * size;
  const pupil = 2.2 * size;
  if (expr === 'defeated') {
    return `
      <g data-part="eyes">
        <path d="M${lx - r},${cy - r} l${r * 2},${r * 2} M${lx + r},${cy - r} l${-r * 2},${r * 2}" ${PEN} />
        <path d="M${rx - r},${cy - r} l${r * 2},${r * 2} M${rx + r},${cy - r} l${-r * 2},${r * 2}" ${PEN} />
      </g>`;
  }
  if (expr === 'happy') {
    return `
      <g data-part="eyes">
        <path d="M${lx - r},${cy + 1} q${r},-${r * 1.3} ${r * 2},0" ${PEN} />
        <path d="M${rx - r},${cy + 1} q${r},-${r * 1.3} ${r * 2},0" ${PEN} />
      </g>`;
  }
  if (expr === 'hurt') {
    return `
      <g data-part="eyes">
        <path d="M${lx - r},${cy - r * 0.7} l${r * 1.4},${r * 0.7} l${-r * 1.4},${r * 0.7}" ${PEN} />
        <path d="M${rx + r},${cy - r * 0.7} l${-r * 1.4},${r * 0.7} l${r * 1.4},${r * 0.7}" ${PEN} />
      </g>`;
  }
  // idle / angry / worry — circular eyes with pupils
  return `
    <g data-part="eyes">
      <g data-part="eye-left">
        <ellipse cx="${lx}" cy="${cy}" rx="${r}" ry="${r * 1.05}" ${PEN} filter="url(#sketchy)" />
        <circle cx="${lx + 0.6}" cy="${cy + 0.4}" r="${pupil}" fill="${INK}" />
      </g>
      <g data-part="eye-right">
        <ellipse cx="${rx}" cy="${cy}" rx="${r * 0.95}" ry="${r}" ${PEN} filter="url(#sketchy)" />
        <circle cx="${rx - 0.4}" cy="${cy + 0.6}" r="${pupil}" fill="${INK}" />
      </g>
    </g>`;
}

function brows(expr, cx, cy, gap = 18) {
  const lx = cx - gap, rx = cx + gap;
  if (expr === 'angry') {
    return `
      <g data-part="brows">
        <path d="M${lx - 8},${cy - 4} L${lx + 7},${cy + 3}" ${PEN} />
        <path d="M${rx + 8},${cy - 4} L${rx - 7},${cy + 3}" ${PEN} />
      </g>`;
  }
  if (expr === 'worry' || expr === 'hurt') {
    return `
      <g data-part="brows">
        <path d="M${lx - 7},${cy + 2} q7,-6 14,-1" ${PEN} />
        <path d="M${rx + 7},${cy + 2} q-7,-6 -14,-1" ${PEN} />
      </g>`;
  }
  return '';
}

function mouth(expr, cx, cy, w = 28) {
  if (expr === 'happy') {
    return `<g data-part="mouth"><path d="M${cx - w / 2},${cy} q${w / 2},${w * 0.5} ${w},0" ${PEN} filter="url(#sketchy)" /></g>`;
  }
  if (expr === 'hurt' || expr === 'worry') {
    return `<g data-part="mouth"><path d="M${cx - w / 2},${cy + 4} q${w / 2},-${w * 0.45} ${w},0" ${PEN} filter="url(#sketchy)" /></g>`;
  }
  if (expr === 'defeated') {
    return `<g data-part="mouth"><ellipse cx="${cx}" cy="${cy + 2}" rx="${w * 0.25}" ry="${w * 0.18}" ${PEN} /></g>`;
  }
  // angry / idle — zigzag teeth
  const teeth = 5;
  const dx = w / teeth;
  let d = `M${cx - w / 2},${cy}`;
  for (let i = 0; i < teeth; i++) d += ` l${dx / 2},-4 l${dx / 2},4`;
  return `
    <g data-part="mouth">
      <rect x="${cx - w / 2 - 2}" y="${cy - 6}" width="${w + 4}" height="12" rx="1.5" ${PEN} filter="url(#sketchy)" />
      <path d="${d}" ${PEN} />
    </g>`;
}

function frontFace(expr, { cx, ey, my, gap = 18, mw = 28, by = null }) {
  const browY = by != null ? by : ey - 13;
  return `
    <g data-part="head">
      ${brows(expr, cx, browY, gap)}
      ${eyes(expr, cx, ey, gap)}
      ${mouth(expr, cx, my, mw)}
    </g>`;
}

// ─── Limb primitives ────────────────────────────────────────────────────────
function stickArm(x, y, len, angle, side) {
  const rad = (angle * Math.PI) / 180;
  const ex = x + Math.sin(rad) * len;
  const ey = y + Math.cos(rad) * len;
  return `
    <g data-part="arm-${side}" style="transform-origin:${x}px ${y}px">
      <line x1="${x}" y1="${y}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" ${PEN} filter="url(#sketchy)" />
      <ellipse cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" rx="4.5" ry="3" ${PEN} />
    </g>`;
}

function stickLeg(x, y, len, angle, side) {
  const rad = (angle * Math.PI) / 180;
  const ex = x + Math.sin(rad) * len;
  const ey = y + Math.cos(rad) * len;
  const offset = side === 'l' ? -3 : 3;
  return `
    <g data-part="leg-${side}" style="transform-origin:${x}px ${y}px">
      <line x1="${x}" y1="${y}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" ${PEN} filter="url(#sketchy)" />
      <ellipse cx="${(ex + offset).toFixed(1)}" cy="${(ey + 2).toFixed(1)}" rx="8" ry="3.5" ${PEN} filter="url(#sketchy)" />
    </g>`;
}

function frontLegs(y = 208) {
  return `
    <g data-part="legs">
      ${stickLeg(92, y, 26, -15, 'l')}
      ${stickLeg(128, y, 26, 20, 'r')}
    </g>`;
}

// ─── Variant accent overlays (emitted as siblings of the body SVG) ──────────
function variantOverlay(variant) {
  if (!variant || variant === 'normal') return '';
  if (variant === 'poison') {
    return `
      <svg viewBox="0 0 220 280" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
        <g filter="url(#sketchy-alt)">
          <path d="M 70 220 q 2 10 0 18 q -2 -8 0 -18 z" fill="#9ec472" stroke="#1f3a14" stroke-width="2.0" />
          <path d="M 150 215 q 2 12 0 22 q -2 -10 0 -22 z" fill="#9ec472" stroke="#1f3a14" stroke-width="2.0" />
          <circle cx="60" cy="180" r="3" fill="none" stroke="#1f3a14" stroke-width="2.0" />
          <circle cx="170" cy="160" r="2.4" fill="none" stroke="#1f3a14" stroke-width="2.0" />
          <circle cx="180" cy="195" r="2" fill="none" stroke="#1f3a14" stroke-width="2.0" />
        </g>
      </svg>`;
  }
  if (variant === 'fire') {
    return `
      <svg viewBox="0 0 220 280" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
        <g style="animation:flame-flicker 0.4s steps(3) infinite" filter="url(#sketchy-alt)">
          <path d="M 80 50 q -4 -18 4 -26 q -1 12 7 16 q 5 -10 0 -20 q 10 10 5 26 z" fill="#ff8a3d" stroke="#5a1f10" stroke-width="2.2" />
          <path d="M 130 40 q -3 -14 3 -22 q -1 10 6 13 q 4 -8 0 -16 q 8 8 4 22 z" fill="#ffb066" stroke="#5a1f10" stroke-width="2.2" />
          <path d="M 110 30 q -2 -10 2 -16 q 0 8 4 10 q 2 -6 0 -12 q 6 6 2 16 z" fill="#ffd28a" stroke="#5a1f10" stroke-width="2.0" />
        </g>
      </svg>`;
  }
  if (variant === 'ice') {
    return `
      <svg viewBox="0 0 220 280" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
        <g filter="url(#sketchy-alt)">
          <g transform="translate(50 70)">
            <path d="M -8 0 L 8 0 M 0 -8 L 0 8 M -6 -6 L 6 6 M -6 6 L 6 -6" stroke="#143a4a" stroke-width="2.0" />
          </g>
          <g transform="translate(170 110)" style="animation:sparkle 1.6s ease-in-out infinite">
            <path d="M -6 0 L 6 0 M 0 -6 L 0 6" stroke="#143a4a" stroke-width="2.0" />
          </g>
          <path d="M 60 160 l 6 6 l -3 8 l 7 4" fill="none" stroke="#143a4a" stroke-width="2.0" />
          <path d="M 158 180 l -4 6 l 6 4 l -2 8" fill="none" stroke="#143a4a" stroke-width="2.0" />
        </g>
      </svg>`;
  }
  if (variant === 'shadow') {
    return `
      <svg viewBox="0 0 220 280" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
        <g style="animation:wisp 2.4s ease-in-out infinite" filter="url(#sketchy-alt)">
          <path d="M 60 60 q 6 -10 0 -20 q -10 10 0 20" fill="none" stroke="#7a6a90" stroke-width="2.4" />
          <path d="M 160 50 q 8 -8 2 -18 q -12 8 -2 18" fill="none" stroke="#9080a8" stroke-width="2.2" />
          <path d="M 100 30 q 4 -10 -2 -16 q -8 8 2 16" fill="none" stroke="#7a6a90" stroke-width="2.0" />
        </g>
      </svg>`;
  }
  return '';
}

// ─── Preset bodies (8 hero monsters, front-facing) ──────────────────────────
// Each preset is a function that returns the SVG body markup. Exposes
// optional `expr` so the same preset renders all 5 expressions.

const PRESETS = {
  bean: {
    name: 'Bean Guy', tagline: 'Grumpy little kidney', defaultExpr: 'angry',
    render(expr) {
      return `
        ${frontLegs(208)}
        <g data-part="body">
          <path d="M 70 90 C 55 60, 90 45, 110 50 C 125 53, 130 65, 138 60 C 155 50, 175 75, 168 110 C 165 130, 160 145, 165 165 C 170 195, 145 220, 110 218 C 75 220, 55 195, 60 165 C 65 140, 78 120, 70 90 Z" ${FILL} filter="url(#sketchy)" />
          <path d="M 105 178 l 5 6 l 5 -6" ${PEN_THIN} />
        </g>
        <g data-part="arms">
          ${stickArm(66, 140, 22, -10, 'l')}
          ${stickArm(170, 135, 22, 15, 'r')}
        </g>
        <g data-part="head">
          <g data-part="hair">
            <path d="M 92 55 l 4 -10 l 5 8 l 5 -10 l 5 9 l 5 -8 l 4 10" ${PEN} />
          </g>
          ${brows(expr, 110, 82, 16)}
          ${eyes(expr, 110, 95, 16)}
          ${mouth(expr, 112, 130, 32)}
        </g>`;
    },
  },
  box: {
    name: 'Box Head', tagline: 'Furious cardboard cryptid', defaultExpr: 'angry',
    render(expr) {
      return `
        ${frontLegs(214)}
        <g data-part="body">
          <rect x="55" y="60" width="115" height="160" rx="14" ${FILL} filter="url(#sketchy)" />
          <line x1="55" y1="105" x2="170" y2="105" ${PEN_THIN} />
        </g>
        <g data-part="arms">
          ${stickArm(58, 140, 22, -25, 'l')}
          ${stickArm(170, 140, 22, 25, 'r')}
        </g>
        ${frontFace(expr, { cx: 113, ey: 140, my: 175, gap: 20, mw: 32, by: 122 })}`;
    },
  },
  egg: {
    name: 'Worry Egg', tagline: 'Anxious about everything', defaultExpr: 'worry',
    render(expr) {
      return `
        ${frontLegs(210)}
        <g data-part="body">
          <path d="M 110 50 C 70 50, 40 130, 50 180 C 60 220, 160 220, 170 180 C 180 130, 150 50, 110 50 Z" ${FILL} filter="url(#sketchy)" />
          <path d="M 110 195 l 6 8 l -6 6 l 6 8" ${PEN_THIN} />
        </g>
        <g data-part="arms">
          ${stickArm(56, 150, 22, -15, 'l')}
          ${stickArm(164, 150, 22, 15, 'r')}
        </g>
        ${frontFace(expr, { cx: 110, ey: 130, my: 170, gap: 14, mw: 24, by: 115 })}`;
    },
  },
  cloud: {
    name: 'Cloud Moss', tagline: 'Soft. Mostly harmless.', defaultExpr: 'happy',
    render(expr) {
      return `
        <g data-part="legs">
          <line x1="100" y1="195" x2="92" y2="235" ${PEN} filter="url(#sketchy)" />
          <line x1="140" y1="195" x2="148" y2="235" ${PEN} filter="url(#sketchy)" />
          <ellipse cx="88" cy="238" rx="9" ry="3.5" ${PEN} filter="url(#sketchy)" />
          <ellipse cx="152" cy="238" rx="9" ry="3.5" ${PEN} filter="url(#sketchy)" />
        </g>
        <g data-part="body">
          <path d="M 50 130 C 35 110, 55 80, 80 90 C 85 65, 130 60, 140 85 C 165 70, 195 95, 185 125 C 210 130, 200 175, 175 180 C 165 210, 105 215, 80 195 C 50 195, 35 165, 50 130 Z" ${FILL} filter="url(#sketchy)" />
        </g>
        ${frontFace(expr, { cx: 120, ey: 138, my: 175, gap: 26, mw: 30, by: 120 })}`;
    },
  },
  spike: {
    name: 'Spike Pup', tagline: 'Stabby triangle goblin', defaultExpr: 'angry',
    render(expr) {
      return `
        ${frontLegs(210)}
        <g data-part="body">
          <path d="M 60 200 L 110 60 L 160 200 Z" ${FILL} filter="url(#sketchy)" />
          <line x1="60" y1="200" x2="160" y2="200" ${PEN} />
        </g>
        ${frontFace(expr, { cx: 110, ey: 150, my: 180, gap: 16, mw: 22, by: 135 })}`;
    },
  },
  slug: {
    name: 'Slug Nub', tagline: 'Slow but emotionally available', defaultExpr: 'worry',
    render(expr) {
      return `
        <g data-part="body">
          <path d="M 30 200 C 20 160, 40 120, 75 115 C 110 85, 165 95, 185 130 C 210 160, 200 215, 30 215 Z" ${FILL} filter="url(#sketchy)" />
          <path d="M 65 130 q 5 12 0 30" ${PEN_THIN} />
        </g>
        <g data-part="head">
          <line x1="78" y1="115" x2="70" y2="95" ${PEN} />
          <line x1="92" y1="113" x2="100" y2="93" ${PEN} />
          <circle cx="68" cy="92" r="3" fill="${INK}" />
          <circle cx="102" cy="91" r="3" fill="${INK}" />
          ${mouth(expr, 95, 165, 22)}
        </g>`;
    },
  },
  lanky: {
    name: 'Lanky Larry', tagline: 'Tall idiot, kind heart', defaultExpr: 'happy',
    render(expr) {
      return `
        <g data-part="legs">
          ${stickLeg(98, 220, 30, -8, 'l')}
          ${stickLeg(122, 220, 30, 8, 'r')}
        </g>
        <g data-part="body">
          <rect x="80" y="80" width="60" height="150" rx="20" ${FILL} filter="url(#sketchy)" />
        </g>
        <g data-part="arms">
          ${stickArm(82, 110, 30, -5, 'l')}
          ${stickArm(138, 110, 30, 5, 'r')}
        </g>
        ${frontFace(expr, { cx: 110, ey: 120, my: 165, gap: 14, mw: 22, by: 105 })}`;
    },
  },
  gloop: {
    name: 'Gloop', tagline: 'One-eyed potato man', defaultExpr: 'angry',
    render(expr) {
      return `
        ${frontLegs(212)}
        <g data-part="body">
          <path d="M 60 100 C 50 60, 100 50, 110 60 C 130 55, 175 80, 170 130 C 165 175, 145 215, 110 218 C 75 215, 50 175, 60 100 Z" ${FILL} filter="url(#sketchy)" />
        </g>
        <g data-part="arms">
          ${stickArm(60, 145, 22, -15, 'l')}
          ${stickArm(170, 140, 22, 18, 'r')}
        </g>
        <g data-part="head">
          ${expr === 'angry' ? `
            <path d="M 92 100 L 130 105" ${PEN} />
          ` : ''}
          <g data-part="eyes">
            <ellipse cx="113" cy="125" rx="20" ry="22" ${PEN} filter="url(#sketchy)" />
            <circle cx="115" cy="128" r="8" fill="${INK}" />
            <circle cx="118" cy="124" r="2.5" fill="#fdfaf3" />
          </g>
          ${mouth(expr, 113, 175, 30)}
        </g>`;
    },
  },
};

export const PRESET_KEYS = Object.freeze(Object.keys(PRESETS));

/**
 * Get the registry entry for a preset (name, tagline, default expression).
 */
export function getPreset(key) {
  return PRESETS[key] || null;
}

/**
 * Render a preset monster as a self-contained SVG string.
 *
 * @param {string} presetKey
 * @param {{ expr?: string, variant?: string, idle?: boolean, anim?: string, level?: number }} [opts]
 */
export function renderPresetSVG(presetKey, opts = {}) {
  const preset = PRESETS[presetKey];
  if (!preset) return '';
  const expr = opts.expr || preset.defaultExpr;
  const variant = opts.variant || 'normal';
  const animClass = opts.anim ? `anim-${opts.anim}` : (opts.idle === false ? '' : 'anim-idle anim-blink');
  const level = opts.level || 1;
  return `
    <div class="sprite-stage ${animClass}" data-variant="${variant}" data-preset="${presetKey}" style="position:relative;width:100%;height:100%;">
      <svg viewBox="${VIEWBOX}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;">
        <defs>${bestiaryDefs()}</defs>
        <g data-part="root">
          ${preset.render(expr)}
          ${levelDecorators(level)}
        </g>
      </svg>
      ${variantOverlay(variant)}
    </div>`;
}

// ─── Level-bracket decorators (carried over from PR #3) ─────────────────────
function levelDecorators(level) {
  let out = '';
  if (level >= 3) {
    out += `<g class="brm-scars" filter="url(#sketchy-alt)">
      <path d="M 78 130 l 14 -8" ${PEN} />
      <path d="M 76 138 l 10 -2" ${PEN} />
      ${level >= 6 ? `<path d="M 145 120 l -8 14 M 140 122 l -4 10" ${PEN} />` : ''}
    </g>`;
  }
  if (level >= 5) {
    const intensity = Math.min(1, (level - 4) / 6);
    out += `<g class="brm-aura" style="pointer-events:none">
      <ellipse cx="110" cy="140" rx="100" ry="110" fill="none" stroke="#d56a3e" stroke-width="${(2 + intensity * 2).toFixed(1)}" stroke-dasharray="4 8" opacity="${(0.55 + intensity * 0.3).toFixed(2)}">
        <animateTransform attributeName="transform" type="rotate" from="0 110 140" to="360 110 140" dur="20s" repeatCount="indefinite" />
      </ellipse>
    </g>`;
  }
  if (level >= 7) {
    out += `
      <g class="brm-crown" filter="url(#sketchy)">
        <path d="M 80 30 L 90 10 L 100 25 L 110 5 L 120 25 L 130 10 L 140 30 Z" fill="#fdfaf3" stroke="${INK}" stroke-width="3" stroke-linejoin="round" />
        <circle cx="110" cy="16" r="3" fill="#d56a3e" stroke="${INK}" stroke-width="1.6" />
      </g>
      <path class="brm-cape" d="M 50 70 q -20 60 -10 130 l 30 -8 q -8 -50 8 -110 z" fill="#c63d2f" stroke="${INK}" stroke-width="3" filter="url(#sketchy)" opacity="0.92" />`;
  }
  if (level >= 10) {
    out += `<g class="brm-trophy" transform="translate(155 130)">
      <path d="M -8 0 l 0 -8 l 16 0 l 0 8 a 8 8 0 0 1 -16 0 z" fill="#e8b347" stroke="${INK}" stroke-width="2" />
    </g>`;
  }
  return out;
}

export const BESTIARY = Object.freeze(
  Object.fromEntries(
    Object.entries(PRESETS).map(([k, v]) => [k, { name: v.name, tagline: v.tagline, defaultExpr: v.defaultExpr }]),
  ),
);
