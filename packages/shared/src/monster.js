/**
 * Hand-drawn monster composition. The monster is built from six stacked
 * primitives (feet → body → arms → mouth → eyes → horns) plus level-bracket
 * decorators (scars at lv 3+, aura at lv 5+, crown at lv 7+, trophy at lv 10+).
 *
 * Visual language is "Goober Bestiary" — ballpoint ink lines on a paper card,
 * a tiny per-render wobble filter so every stroke feels alive. Inspired by the
 * BossRaid Streamer Panel hi-fi mock from Claude Design.
 *
 * 3 bodies × 3 eyes × 3 mouths × 3 horns × 3 arms × 3 feet × 12 palettes =
 * 8,748 unique monsters from 18 path strings + 12 accent colors.
 */

import { PALETTES } from './constants.js';
import { PRESET_KEYS, getPreset, renderPresetSVG } from './bestiary.js';

export { PRESET_KEYS, getPreset } from './bestiary.js';

export const VIEWBOX = '0 0 220 280';
export const VIEW_W = 220;
export const VIEW_H = 280;

export const INK = '#1a1614';
export const INK_2 = '#3a342f';
export const PAPER = '#fdfaf3';

// Stroke styles applied via inline attribs since we render to strings (no JSX).
const PEN = `fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"`;
const PEN_THIN = `fill="none" stroke="${INK_2}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
const FILLED = `fill="${PAPER}" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"`;

// SVG wobble filter — applied to body groups so every stroke trembles slightly.
function defs() {
  return `<defs>
    <filter id="brm-wobble" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" />
      <feDisplacementMap in="SourceGraphic" scale="1.6" />
    </filter>
    <filter id="brm-wobble-thin" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" />
      <feDisplacementMap in="SourceGraphic" scale="1.2" />
    </filter>
  </defs>`;
}

// ─── Bodies ─────────────────────────────────────────────────────────────────
// Each body: { render(palette), anchors: { eyes, mouth, horns, arms[2], feet } }

const BODIES = {
  blob: {
    anchors: {
      eyes: [110, 130],
      mouth: [110, 175],
      horns: [110, 70],
      arms: [[60, 150], [160, 150]],
      feet: [110, 240],
    },
    render: (p) => `
      <path d="M 60 90 C 40 70, 90 50, 110 80 C 130 50, 180 70, 170 110 C 195 150, 170 220, 110 215 C 60 220, 25 165, 60 90 Z" ${FILLED} />
      <ellipse cx="86" cy="135" rx="14" ry="9" fill="${p.accent}" opacity="0.32" />
    `,
  },
  lump: {
    anchors: {
      eyes: [110, 120],
      mouth: [110, 165],
      horns: [110, 60],
      arms: [[58, 160], [162, 160]],
      feet: [110, 240],
    },
    render: (p) => `
      <path d="M 110 60 C 70 60, 50 130, 60 195 C 65 230, 155 230, 160 195 C 170 130, 150 60, 110 60 Z" ${FILLED} />
      <path d="M 88 142 q 8 -4 18 0" ${PEN_THIN} />
      <ellipse cx="84" cy="155" rx="11" ry="7" fill="${p.accent}" opacity="0.32" />
    `,
  },
  stack: {
    anchors: {
      eyes: [110, 105],
      mouth: [110, 135],
      horns: [110, 50],
      arms: [[60, 200], [160, 200]],
      feet: [110, 245],
    },
    render: (p) => `
      <rect x="56" y="70" width="108" height="80" rx="14" ${FILLED} />
      <rect x="46" y="160" width="128" height="80" rx="14" ${FILLED} />
      <line x1="56" y1="150" x2="164" y2="150" ${PEN_THIN} />
      <ellipse cx="78" cy="195" rx="12" ry="7" fill="${p.accent}" opacity="0.32" />
    `,
  },
};

// ─── Eyes (centered on anchor) ──────────────────────────────────────────────
const EYES = {
  googly: (cx, cy) => `
    <g class="brm-eyes">
      <circle cx="${cx - 14}" cy="${cy}" r="8" ${PEN} />
      <circle cx="${cx + 14}" cy="${cy}" r="8" ${PEN} />
      <circle cx="${cx - 13}" cy="${cy + 1}" r="2.6" fill="${INK}" />
      <circle cx="${cx + 15}" cy="${cy + 1}" r="2.6" fill="${INK}" />
      <path d="M ${cx - 22} ${cy - 12} q 12 6 22 0" ${PEN} />
      <path d="M ${cx + 8} ${cy - 12} q 12 6 22 0" ${PEN} />
    </g>
  `,
  beady: (cx, cy) => `
    <g class="brm-eyes">
      <circle cx="${cx - 12}" cy="${cy}" r="3.2" fill="${INK}" />
      <circle cx="${cx + 12}" cy="${cy}" r="3.2" fill="${INK}" />
      <path d="M ${cx - 22} ${cy - 12} q 12 -4 22 0" ${PEN} />
      <path d="M ${cx + 8} ${cy - 12} q -12 -4 22 0" ${PEN} />
    </g>
  `,
  cyclops: (cx, cy) => `
    <g class="brm-eyes">
      <circle cx="${cx}" cy="${cy}" r="14" ${PEN} />
      <circle cx="${cx + 2}" cy="${cy + 1}" r="4" fill="${INK}" />
      <circle cx="${cx + 4}" cy="${cy - 2}" r="1.5" fill="${PAPER}" />
      <path d="M ${cx - 18} ${cy - 18} q 18 -4 36 0" ${PEN} />
    </g>
  `,
};

// ─── Mouths ─────────────────────────────────────────────────────────────────
const MOUTHS = {
  fangs: (cx, cy) => `
    <g class="brm-mouth">
      <path d="M ${cx - 22} ${cy} q 22 14 44 0 q -22 16 -44 0 z" fill="${INK}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" />
      <path d="M ${cx - 8} ${cy + 2} l 2 8 l 4 -8 z" fill="${PAPER}" stroke="${INK}" stroke-width="1.6" />
      <path d="M ${cx + 4} ${cy + 2} l 2 8 l 4 -8 z" fill="${PAPER}" stroke="${INK}" stroke-width="1.6" />
    </g>
  `,
  underbite: (cx, cy) => `
    <g class="brm-mouth">
      <path d="M ${cx - 22} ${cy} q 22 4 44 0" ${PEN} />
      <rect x="${cx - 9}" y="${cy + 1}" width="6" height="9" rx="1" fill="${PAPER}" stroke="${INK}" stroke-width="2" />
      <rect x="${cx + 3}" y="${cy + 1}" width="6" height="9" rx="1" fill="${PAPER}" stroke="${INK}" stroke-width="2" />
    </g>
  `,
  grin: (cx, cy) => `
    <g class="brm-mouth">
      <path d="M ${cx - 24} ${cy - 2} q 24 22 48 -2" ${PEN} />
      <path d="M ${cx - 16} ${cy + 6} q 16 6 32 0" ${PEN_THIN} />
    </g>
  `,
};

// ─── Horns ──────────────────────────────────────────────────────────────────
const HORNS = {
  nubs: (cx, cy) => `
    <g class="brm-horns">
      <path d="M ${cx - 18} ${cy + 6} q -3 -16 9 -18 q 8 0 8 14" ${PEN} />
      <path d="M ${cx + 18} ${cy + 6} q 3 -16 -9 -18 q -8 0 -8 14" ${PEN} />
    </g>
  `,
  curly: (cx, cy) => `
    <g class="brm-horns">
      <path d="M ${cx - 14} ${cy + 6} Q ${cx - 28} ${cy - 8}, ${cx - 22} ${cy - 22} Q ${cx - 12} ${cy - 28}, ${cx - 12} ${cy - 14}" ${PEN} />
      <path d="M ${cx + 14} ${cy + 6} Q ${cx + 28} ${cy - 8}, ${cx + 22} ${cy - 22} Q ${cx + 12} ${cy - 28}, ${cx + 12} ${cy - 14}" ${PEN} />
    </g>
  `,
  antennae: (cx, cy, p) => `
    <g class="brm-horns">
      <path d="M ${cx - 10} ${cy + 4} q -8 -16 -16 -32" ${PEN} />
      <path d="M ${cx + 10} ${cy + 4} q 8 -16 16 -32" ${PEN} />
      <circle cx="${cx - 26}" cy="${cy - 28}" r="5" fill="${p.accent}" stroke="${INK}" stroke-width="2.4" />
      <circle cx="${cx + 26}" cy="${cy - 28}" r="5" fill="${p.accent}" stroke="${INK}" stroke-width="2.4" />
    </g>
  `,
};

// ─── Arms (left+right pair from anchors[0,1]) ───────────────────────────────
const ARMS = {
  stubs: (anchors) => {
    const [[lx, ly], [rx, ry]] = anchors;
    return `
      <g class="brm-arms">
        <line x1="${lx}" y1="${ly}" x2="${lx - 22}" y2="${ly + 18}" ${PEN} />
        <line x1="${rx}" y1="${ry}" x2="${rx + 22}" y2="${ry + 18}" ${PEN} />
        <circle cx="${lx - 22}" cy="${ly + 18}" r="4" fill="${PAPER}" stroke="${INK}" stroke-width="2.4" />
        <circle cx="${rx + 22}" cy="${ry + 18}" r="4" fill="${PAPER}" stroke="${INK}" stroke-width="2.4" />
      </g>
    `;
  },
  noodle: (anchors) => {
    const [[lx, ly], [rx, ry]] = anchors;
    return `
      <g class="brm-arms">
        <path d="M ${lx} ${ly} q -22 14 -10 32 q 14 10 -4 26" ${PEN} />
        <path d="M ${rx} ${ry} q 22 14 10 32 q -14 10 4 26" ${PEN} />
        <circle cx="${lx - 14}" cy="${ly + 58}" r="4" fill="${PAPER}" stroke="${INK}" stroke-width="2.4" />
        <circle cx="${rx + 14}" cy="${ry + 58}" r="4" fill="${PAPER}" stroke="${INK}" stroke-width="2.4" />
      </g>
    `;
  },
  crab: (anchors) => {
    const [[lx, ly], [rx, ry]] = anchors;
    return `
      <g class="brm-arms">
        <line x1="${lx}" y1="${ly}" x2="${lx - 14}" y2="${ly + 16}" ${PEN} />
        <path d="M ${lx - 12} ${ly + 14} L ${lx - 26} ${ly + 10} L ${lx - 22} ${ly + 22} L ${lx - 28} ${ly + 22} L ${lx - 22} ${ly + 30} L ${lx - 12} ${ly + 26} Z" ${FILLED} />
        <line x1="${rx}" y1="${ry}" x2="${rx + 14}" y2="${ry + 16}" ${PEN} />
        <path d="M ${rx + 12} ${ry + 14} L ${rx + 26} ${ry + 10} L ${rx + 22} ${ry + 22} L ${rx + 28} ${ry + 22} L ${rx + 22} ${ry + 30} L ${rx + 12} ${ry + 26} Z" ${FILLED} />
      </g>
    `;
  },
};

// ─── Feet (centered on anchor) ──────────────────────────────────────────────
const FEET = {
  paws: (cx, cy) => `
    <g class="brm-feet">
      <line x1="${cx - 18}" y1="${cy - 30}" x2="${cx - 18}" y2="${cy - 4}" ${PEN} />
      <line x1="${cx + 18}" y1="${cy - 30}" x2="${cx + 18}" y2="${cy - 4}" ${PEN} />
      <ellipse cx="${cx - 18}" cy="${cy}" rx="13" ry="5" ${FILLED} />
      <ellipse cx="${cx + 18}" cy="${cy}" rx="13" ry="5" ${FILLED} />
    </g>
  `,
  tentacles: (cx, cy) => `
    <g class="brm-feet">
      <path d="M ${cx - 26} ${cy - 30} q -6 18 0 32 q 6 6 14 4" ${PEN} />
      <path d="M ${cx} ${cy - 30} q -6 22 4 36" ${PEN} />
      <path d="M ${cx + 26} ${cy - 30} q 6 18 0 32 q -6 6 -14 4" ${PEN} />
    </g>
  `,
  wheels: (cx, cy) => `
    <g class="brm-feet">
      <circle cx="${cx - 22}" cy="${cy - 4}" r="12" ${FILLED} />
      <circle cx="${cx + 22}" cy="${cy - 4}" r="12" ${FILLED} />
      <line x1="${cx - 32}" y1="${cy - 4}" x2="${cx - 12}" y2="${cy - 4}" ${PEN_THIN} />
      <line x1="${cx - 22}" y1="${cy - 14}" x2="${cx - 22}" y2="${cy + 6}" ${PEN_THIN} />
      <line x1="${cx + 12}" y1="${cy - 4}" x2="${cx + 32}" y2="${cy - 4}" ${PEN_THIN} />
      <line x1="${cx + 22}" y1="${cy - 14}" x2="${cx + 22}" y2="${cy + 6}" ${PEN_THIN} />
      <circle cx="${cx - 22}" cy="${cy - 4}" r="2.4" fill="${INK}" />
      <circle cx="${cx + 22}" cy="${cy - 4}" r="2.4" fill="${INK}" />
    </g>
  `,
};

// ─── Level-bracket evolution layers ────────────────────────────────────────
function aura(level, palette) {
  if (level < 5) return '';
  const intensity = Math.min(1, (level - 4) / 6);
  const accent = palette.accent || '#d56a3e';
  const sparks = level >= 8
    ? Array.from({ length: 6 }, (_, i) => {
        const cx = 110 + Math.cos(i * 1.04) * 95;
        const cy = 140 + Math.sin(i * 1.04) * 100;
        return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="3" fill="${accent}" opacity="0.75" />`;
      }).join('')
    : '';
  return `
    <g class="brm-aura" style="pointer-events:none">
      <ellipse cx="110" cy="140" rx="100" ry="110"
        fill="none" stroke="${accent}" stroke-width="${(2 + intensity * 2).toFixed(1)}"
        stroke-dasharray="4 8" opacity="${(0.55 + intensity * 0.3).toFixed(2)}">
        <animateTransform attributeName="transform" type="rotate"
          from="0 110 140" to="360 110 140" dur="20s" repeatCount="indefinite" />
      </ellipse>
      ${sparks}
    </g>
  `;
}

function scars(level) {
  if (level < 3) return '';
  return `
    <g class="brm-scars" filter="url(#brm-wobble-thin)">
      <path d="M 80 130 l 14 -8" ${PEN} />
      <path d="M 78 138 l 10 -2" ${PEN} />
      ${level >= 6 ? `<path d="M 145 120 l -8 14 M 140 122 l -4 10" ${PEN} />` : ''}
      ${level >= 9 ? `<path d="M 100 175 l 18 4" ${PEN} />` : ''}
    </g>
  `;
}

function accessories(level) {
  if (level < 4) return '';
  const crown = level >= 4 ? `
    <g class="brm-crown" filter="url(#brm-wobble)">
      <path d="M 80 50 L 90 30 L 100 45 L 110 25 L 120 45 L 130 30 L 140 50 Z"
        fill="${PAPER}" stroke="${INK}" stroke-width="3" stroke-linejoin="round" />
      <circle cx="110" cy="36" r="3" fill="#d56a3e" stroke="${INK}" stroke-width="1.6" />
    </g>
  ` : '';
  const cape = level >= 7 ? `
    <path class="brm-cape" d="M 60 80 q -20 60 -10 130 l 30 -8 q -8 -50 8 -110 z"
      fill="#c63d2f" stroke="${INK}" stroke-width="3" filter="url(#brm-wobble)" opacity="0.92" />
  ` : '';
  const trophy = level >= 10 ? `
    <g class="brm-trophy" transform="translate(150 130)">
      <path d="M -8 0 l 0 -8 l 16 0 l 0 8 a 8 8 0 0 1 -16 0 z" fill="#e8b347" stroke="${INK}" stroke-width="2" />
    </g>
  ` : '';
  return crown + cape + trophy;
}

// ─── Composer ───────────────────────────────────────────────────────────────
/**
 * Compose a full monster SVG string from an appearance config.
 *
 * If `appearance.presetKey` is set and registered in the bestiary, dispatches
 * to the preset renderer (Bean Guy / Box Head / etc. — full hand-drawn
 * characters). Otherwise falls back to the legacy 6-slot composer.
 *
 * @param {{body?:string, eyes?:string, mouth?:string, horns?:string, arms?:string, feet?:string, paletteIdx?:number, presetKey?:string, expr?:string, variant?:string}} appearance
 * @param {{className?:string, idle?:boolean, level?:number, anim?:string}} [opts]
 */
export function renderMonsterSVG(appearance = {}, opts = {}) {
  // Dispatch to bestiary preset if requested.
  if (appearance.presetKey && getPreset(appearance.presetKey)) {
    return renderPresetSVG(appearance.presetKey, {
      expr: appearance.expr,
      variant: appearance.variant,
      idle: opts.idle,
      anim: opts.anim,
      level: opts.level || 1,
    });
  }
  const palette = PALETTES[(appearance.paletteIdx || 0) % PALETTES.length] || PALETTES[0];
  const body = BODIES[appearance.body] || BODIES.blob;
  const className = opts.className ? ` class="${opts.className}"` : '';
  const idleClass = opts.idle === false ? '' : ' brm-idle';
  const level = opts.level || 1;

  const feet = FEET[appearance.feet]?.(...body.anchors.feet, palette) ?? '';
  const arms = ARMS[appearance.arms]?.(body.anchors.arms, palette) ?? '';
  const mouth = MOUTHS[appearance.mouth]?.(...body.anchors.mouth, palette) ?? '';
  const eyes = EYES[appearance.eyes]?.(...body.anchors.eyes, palette) ?? '';
  const horns = HORNS[appearance.horns]?.(...body.anchors.horns, palette) ?? '';

  return `<svg viewBox="${VIEWBOX}" xmlns="http://www.w3.org/2000/svg"${className}>
    ${defs()}
    ${aura(level, palette)}
    <g class="brm-monster${idleClass}" filter="url(#brm-wobble)">
      ${feet}
      ${body.render(palette)}
      ${arms}
      ${mouth}
      ${eyes}
      ${horns}
    </g>
    ${scars(level)}
    ${accessories(level)}
  </svg>`;
}

/** Default appearance — useful for placeholders and the seed test monster. */
export const DEFAULT_APPEARANCE = Object.freeze({
  body: 'blob',
  eyes: 'googly',
  mouth: 'fangs',
  horns: 'antennae',
  arms: 'noodle',
  feet: 'tentacles',
  paletteIdx: 4,
});

export const PART_RENDERERS = Object.freeze({
  bodies: Object.keys(BODIES),
  eyes: Object.keys(EYES),
  mouths: Object.keys(MOUTHS),
  horns: Object.keys(HORNS),
  arms: Object.keys(ARMS),
  feet: Object.keys(FEET),
});
