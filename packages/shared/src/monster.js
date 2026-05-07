/**
 * Monster SVG composition. The monster is built from six stacked primitives:
 *   feet → body → arms → mouth → eyes → horns
 *
 * Each body shape exposes named anchor points in the 200×300 viewBox where
 * subsequent parts attach. A part renderer takes (cx, cy, palette) and returns
 * an SVG fragment string.
 *
 * 3 bodies × 3 eyes × 3 mouths × 3 horns × 3 arms × 3 feet × 12 palettes =
 * 8,748 unique monsters from 18 path strings + 12 color pairs.
 */

import { PALETTES } from './constants.js';

export const VIEWBOX = '0 0 200 300';
export const VIEW_W = 200;
export const VIEW_H = 300;

// ─── Bodies ─────────────────────────────────────────────────────────────────
// Each body: { render(palette), anchors: { eyes, mouth, horns, arms[2], feet } }

const BODIES = {
  blob: {
    anchors: {
      eyes: [100, 145],
      mouth: [100, 185],
      horns: [100, 110],
      arms: [[55, 175], [145, 175]],
      feet: [100, 240],
    },
    render: (p) => `
      <ellipse cx="100" cy="180" rx="65" ry="60"
        fill="${p.primary}" stroke="${p.outline}" stroke-width="4"/>
      <ellipse cx="80" cy="165" rx="20" ry="14" fill="${p.accent}" opacity="0.45"/>
    `,
  },
  lump: {
    anchors: {
      eyes: [100, 130],
      mouth: [100, 175],
      horns: [100, 90],
      arms: [[50, 180], [150, 180]],
      feet: [100, 250],
    },
    render: (p) => `
      <path d="M 100 110
               C 60 110, 45 165, 50 215
               C 55 260, 145 260, 150 215
               C 155 165, 140 110, 100 110 Z"
            fill="${p.primary}" stroke="${p.outline}" stroke-width="4"/>
      <ellipse cx="82" cy="155" rx="18" ry="13" fill="${p.accent}" opacity="0.4"/>
    `,
  },
  stack: {
    anchors: {
      eyes: [100, 110],
      mouth: [100, 140],
      horns: [100, 70],
      arms: [[55, 200], [145, 200]],
      feet: [100, 250],
    },
    render: (p) => `
      <circle cx="100" cy="125" r="48" fill="${p.primary}" stroke="${p.outline}" stroke-width="4"/>
      <circle cx="100" cy="215" r="55" fill="${p.primary}" stroke="${p.outline}" stroke-width="4"/>
      <circle cx="85" cy="115" r="12" fill="${p.accent}" opacity="0.4"/>
    `,
  },
};

// ─── Eyes ───────────────────────────────────────────────────────────────────
const EYES = {
  googly: (cx, cy, p) => `
    <g class="brm-eyes">
      <circle cx="${cx - 15}" cy="${cy}" r="11" fill="#fff" stroke="${p.outline}" stroke-width="3"/>
      <circle cx="${cx + 15}" cy="${cy}" r="11" fill="#fff" stroke="${p.outline}" stroke-width="3"/>
      <circle cx="${cx - 13}" cy="${cy + 2}" r="5" fill="${p.outline}"/>
      <circle cx="${cx + 17}" cy="${cy + 1}" r="5" fill="${p.outline}"/>
    </g>
  `,
  beady: (cx, cy, p) => `
    <g class="brm-eyes">
      <circle cx="${cx - 13}" cy="${cy}" r="4" fill="${p.outline}"/>
      <circle cx="${cx + 13}" cy="${cy}" r="4" fill="${p.outline}"/>
      <circle cx="${cx - 11}" cy="${cy - 1}" r="1.2" fill="#fff"/>
      <circle cx="${cx + 15}" cy="${cy - 1}" r="1.2" fill="#fff"/>
    </g>
  `,
  cyclops: (cx, cy, p) => `
    <g class="brm-eyes">
      <circle cx="${cx}" cy="${cy}" r="18" fill="#fff" stroke="${p.outline}" stroke-width="3"/>
      <circle cx="${cx + 3}" cy="${cy + 1}" r="9" fill="${p.outline}"/>
      <circle cx="${cx + 6}" cy="${cy - 2}" r="2.5" fill="#fff"/>
    </g>
  `,
};

// ─── Mouths ─────────────────────────────────────────────────────────────────
const MOUTHS = {
  fangs: (cx, cy, p) => `
    <g class="brm-mouth">
      <path d="M ${cx - 22} ${cy} Q ${cx} ${cy + 14}, ${cx + 22} ${cy}"
            fill="none" stroke="${p.outline}" stroke-width="3" stroke-linecap="round"/>
      <polygon points="${cx - 10},${cy + 4} ${cx - 6},${cy + 4} ${cx - 8},${cy + 14}"
               fill="#fff" stroke="${p.outline}" stroke-width="2"/>
      <polygon points="${cx + 6},${cy + 4} ${cx + 10},${cy + 4} ${cx + 8},${cy + 14}"
               fill="#fff" stroke="${p.outline}" stroke-width="2"/>
    </g>
  `,
  underbite: (cx, cy, p) => `
    <g class="brm-mouth">
      <path d="M ${cx - 24} ${cy} Q ${cx} ${cy + 4}, ${cx + 24} ${cy}"
            fill="${p.outline}" stroke="${p.outline}" stroke-width="3"/>
      <rect x="${cx - 11}" y="${cy + 3}" width="6" height="8" fill="#fff" stroke="${p.outline}" stroke-width="2"/>
      <rect x="${cx + 5}" y="${cy + 3}" width="6" height="8" fill="#fff" stroke="${p.outline}" stroke-width="2"/>
    </g>
  `,
  grin: (cx, cy, p) => `
    <g class="brm-mouth">
      <path d="M ${cx - 26} ${cy - 2} Q ${cx} ${cy + 18}, ${cx + 26} ${cy - 2}"
            fill="${p.accent}" stroke="${p.outline}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M ${cx - 22} ${cy + 1} Q ${cx} ${cy + 13}, ${cx + 22} ${cy + 1}"
            fill="none" stroke="${p.outline}" stroke-width="2" opacity="0.6"/>
    </g>
  `,
};

// ─── Horns ──────────────────────────────────────────────────────────────────
const HORNS = {
  nubs: (cx, cy, p) => `
    <g class="brm-horns">
      <ellipse cx="${cx - 16}" cy="${cy + 8}" rx="9" ry="11" fill="${p.accent}" stroke="${p.outline}" stroke-width="3"/>
      <ellipse cx="${cx + 16}" cy="${cy + 8}" rx="9" ry="11" fill="${p.accent}" stroke="${p.outline}" stroke-width="3"/>
    </g>
  `,
  curly: (cx, cy, p) => `
    <g class="brm-horns" fill="none" stroke="${p.outline}" stroke-width="4" stroke-linecap="round">
      <path d="M ${cx - 18} ${cy + 12} Q ${cx - 30} ${cy - 4}, ${cx - 22} ${cy - 18} Q ${cx - 14} ${cy - 24}, ${cx - 14} ${cy - 12}"/>
      <path d="M ${cx + 18} ${cy + 12} Q ${cx + 30} ${cy - 4}, ${cx + 22} ${cy - 18} Q ${cx + 14} ${cy - 24}, ${cx + 14} ${cy - 12}"/>
    </g>
  `,
  antennae: (cx, cy, p) => `
    <g class="brm-horns">
      <line x1="${cx - 14}" y1="${cy + 10}" x2="${cx - 22}" y2="${cy - 22}"
            stroke="${p.outline}" stroke-width="3" stroke-linecap="round"/>
      <line x1="${cx + 14}" y1="${cy + 10}" x2="${cx + 22}" y2="${cy - 22}"
            stroke="${p.outline}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="${cx - 22}" cy="${cy - 24}" r="6" fill="${p.accent}" stroke="${p.outline}" stroke-width="3"/>
      <circle cx="${cx + 22}" cy="${cy - 24}" r="6" fill="${p.accent}" stroke="${p.outline}" stroke-width="3"/>
    </g>
  `,
};

// ─── Arms (rendered as a left+right pair from a single anchor pair) ─────────
const ARMS = {
  stubs: (anchors, p) => {
    const [[lx, ly], [rx, ry]] = anchors;
    return `
      <g class="brm-arms">
        <rect x="${lx - 10}" y="${ly - 6}" width="14" height="22" rx="6"
              fill="${p.primary}" stroke="${p.outline}" stroke-width="3"/>
        <rect x="${rx - 4}" y="${ry - 6}" width="14" height="22" rx="6"
              fill="${p.primary}" stroke="${p.outline}" stroke-width="3"/>
      </g>
    `;
  },
  noodle: (anchors, p) => {
    const [[lx, ly], [rx, ry]] = anchors;
    return `
      <g class="brm-arms" fill="none" stroke="${p.outline}" stroke-width="6" stroke-linecap="round">
        <path d="M ${lx + 4} ${ly} Q ${lx - 18} ${ly + 14}, ${lx - 4} ${ly + 32} Q ${lx + 8} ${ly + 44}, ${lx - 6} ${ly + 56}"/>
        <path d="M ${rx - 4} ${ry} Q ${rx + 18} ${ry + 14}, ${rx + 4} ${ry + 32} Q ${rx - 8} ${ry + 44}, ${rx + 6} ${ry + 56}"/>
      </g>
      <g fill="none" stroke="${p.primary}" stroke-width="3" stroke-linecap="round">
        <path d="M ${lx + 4} ${ly} Q ${lx - 18} ${ly + 14}, ${lx - 4} ${ly + 32} Q ${lx + 8} ${ly + 44}, ${lx - 6} ${ly + 56}"/>
        <path d="M ${rx - 4} ${ry} Q ${rx + 18} ${ry + 14}, ${rx + 4} ${ry + 32} Q ${rx - 8} ${ry + 44}, ${rx + 6} ${ry + 56}"/>
      </g>
    `;
  },
  crab: (anchors, p) => {
    const [[lx, ly], [rx, ry]] = anchors;
    return `
      <g class="brm-arms">
        <line x1="${lx + 6}" y1="${ly}" x2="${lx - 12}" y2="${ly + 18}" stroke="${p.outline}" stroke-width="6" stroke-linecap="round"/>
        <path d="M ${lx - 10} ${ly + 16} L ${lx - 22} ${ly + 12} L ${lx - 18} ${ly + 22} L ${lx - 24} ${ly + 22} L ${lx - 18} ${ly + 30} L ${lx - 10} ${ly + 28} Z"
              fill="${p.accent}" stroke="${p.outline}" stroke-width="3" stroke-linejoin="round"/>
        <line x1="${rx - 6}" y1="${ry}" x2="${rx + 12}" y2="${ry + 18}" stroke="${p.outline}" stroke-width="6" stroke-linecap="round"/>
        <path d="M ${rx + 10} ${ry + 16} L ${rx + 22} ${ry + 12} L ${rx + 18} ${ry + 22} L ${rx + 24} ${ry + 22} L ${rx + 18} ${ry + 30} L ${rx + 10} ${ry + 28} Z"
              fill="${p.accent}" stroke="${p.outline}" stroke-width="3" stroke-linejoin="round"/>
      </g>
    `;
  },
};

// ─── Feet (renders centered on anchor) ──────────────────────────────────────
const FEET = {
  paws: (cx, cy, p) => `
    <g class="brm-feet">
      <ellipse cx="${cx - 22}" cy="${cy}" rx="18" ry="10" fill="${p.primary}" stroke="${p.outline}" stroke-width="3"/>
      <ellipse cx="${cx + 22}" cy="${cy}" rx="18" ry="10" fill="${p.primary}" stroke="${p.outline}" stroke-width="3"/>
      <line x1="${cx - 30}" y1="${cy}" x2="${cx - 30}" y2="${cy + 6}" stroke="${p.outline}" stroke-width="2"/>
      <line x1="${cx - 22}" y1="${cy}" x2="${cx - 22}" y2="${cy + 6}" stroke="${p.outline}" stroke-width="2"/>
      <line x1="${cx - 14}" y1="${cy}" x2="${cx - 14}" y2="${cy + 6}" stroke="${p.outline}" stroke-width="2"/>
      <line x1="${cx + 14}" y1="${cy}" x2="${cx + 14}" y2="${cy + 6}" stroke="${p.outline}" stroke-width="2"/>
      <line x1="${cx + 22}" y1="${cy}" x2="${cx + 22}" y2="${cy + 6}" stroke="${p.outline}" stroke-width="2"/>
      <line x1="${cx + 30}" y1="${cy}" x2="${cx + 30}" y2="${cy + 6}" stroke="${p.outline}" stroke-width="2"/>
    </g>
  `,
  tentacles: (cx, cy, p) => `
    <g class="brm-feet" fill="none" stroke="${p.outline}" stroke-width="6" stroke-linecap="round">
      <path d="M ${cx - 30} ${cy - 6} Q ${cx - 36} ${cy + 12}, ${cx - 28} ${cy + 26}"/>
      <path d="M ${cx} ${cy - 6} Q ${cx - 6} ${cy + 14}, ${cx + 4} ${cy + 28}"/>
      <path d="M ${cx + 30} ${cy - 6} Q ${cx + 36} ${cy + 12}, ${cx + 28} ${cy + 26}"/>
    </g>
    <g fill="none" stroke="${p.primary}" stroke-width="3" stroke-linecap="round">
      <path d="M ${cx - 30} ${cy - 6} Q ${cx - 36} ${cy + 12}, ${cx - 28} ${cy + 26}"/>
      <path d="M ${cx} ${cy - 6} Q ${cx - 6} ${cy + 14}, ${cx + 4} ${cy + 28}"/>
      <path d="M ${cx + 30} ${cy - 6} Q ${cx + 36} ${cy + 12}, ${cx + 28} ${cy + 26}"/>
    </g>
  `,
  wheels: (cx, cy, p) => `
    <g class="brm-feet">
      <circle cx="${cx - 24}" cy="${cy + 6}" r="14" fill="${p.accent}" stroke="${p.outline}" stroke-width="3"/>
      <circle cx="${cx + 24}" cy="${cy + 6}" r="14" fill="${p.accent}" stroke="${p.outline}" stroke-width="3"/>
      <circle cx="${cx - 24}" cy="${cy + 6}" r="3" fill="${p.outline}"/>
      <circle cx="${cx + 24}" cy="${cy + 6}" r="3" fill="${p.outline}"/>
      <line x1="${cx - 36}" y1="${cy + 6}" x2="${cx - 12}" y2="${cy + 6}" stroke="${p.outline}" stroke-width="2"/>
      <line x1="${cx - 24}" y1="${cy - 6}" x2="${cx - 24}" y2="${cy + 18}" stroke="${p.outline}" stroke-width="2"/>
      <line x1="${cx + 12}" y1="${cy + 6}" x2="${cx + 36}" y2="${cy + 6}" stroke="${p.outline}" stroke-width="2"/>
      <line x1="${cx + 24}" y1="${cy - 6}" x2="${cx + 24}" y2="${cy + 18}" stroke="${p.outline}" stroke-width="2"/>
    </g>
  `,
};

// ─── Composer ───────────────────────────────────────────────────────────────
/**
 * Compose a full monster SVG string from an appearance config.
 * @param {{body:string, eyes:string, mouth:string, horns:string, arms:string, feet:string, paletteIdx:number}} appearance
 * @param {{className?:string, idle?:boolean}} [opts]
 */
export function renderMonsterSVG(appearance, opts = {}) {
  const palette = PALETTES[appearance.paletteIdx % PALETTES.length];
  const body = BODIES[appearance.body] || BODIES.blob;
  const className = opts.className ? ` class="${opts.className}"` : '';
  const idleClass = opts.idle === false ? '' : ' brm-idle';

  const feet = FEET[appearance.feet]?.(...body.anchors.feet, palette) ?? '';
  const arms = ARMS[appearance.arms]?.(body.anchors.arms, palette) ?? '';
  const mouth = MOUTHS[appearance.mouth]?.(...body.anchors.mouth, palette) ?? '';
  const eyes = EYES[appearance.eyes]?.(...body.anchors.eyes, palette) ?? '';
  const horns = HORNS[appearance.horns]?.(...body.anchors.horns, palette) ?? '';

  return `<svg viewBox="${VIEWBOX}" xmlns="http://www.w3.org/2000/svg"${className}>
    <g class="brm-monster${idleClass}">
      ${feet}
      ${body.render(palette)}
      ${arms}
      ${mouth}
      ${eyes}
      ${horns}
    </g>
  </svg>`;
}

/**
 * Default appearance — useful for placeholders and the seed test monster.
 */
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
