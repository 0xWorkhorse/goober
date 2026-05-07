import { PALETTES, PART_SLOTS, PART_SLOT_NAMES } from '@bossraid/shared';
import { DEFAULT_APPEARANCE, renderMonsterSVG } from '@bossraid/shared/monster';

const state = { ...DEFAULT_APPEARANCE };

function $(sel) { return document.querySelector(sel); }

function renderPreview() {
  $('#preview').innerHTML = renderMonsterSVG(state);
}

function renderControls() {
  const root = $('#controls');
  root.innerHTML = '';
  for (const slot of PART_SLOT_NAMES) {
    const fs = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = slot;
    fs.appendChild(legend);
    const opts = document.createElement('div');
    opts.className = 'opts';
    for (const choice of PART_SLOTS[slot]) {
      const b = document.createElement('button');
      b.textContent = choice;
      if (state[slot] === choice) b.classList.add('on');
      b.addEventListener('click', () => {
        state[slot] = choice;
        renderControls();
        renderPreview();
      });
      opts.appendChild(b);
    }
    fs.appendChild(opts);
    root.appendChild(fs);
  }
  // Palette
  const fs = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = 'palette';
  fs.appendChild(legend);
  const pal = document.createElement('div');
  pal.className = 'palette';
  PALETTES.forEach((p, idx) => {
    const b = document.createElement('button');
    b.style.background = `linear-gradient(90deg, ${p.primary} 50%, ${p.accent} 50%)`;
    if (state.paletteIdx === idx) b.classList.add('on');
    b.addEventListener('click', () => {
      state.paletteIdx = idx;
      renderControls();
      renderPreview();
    });
    pal.appendChild(b);
  });
  fs.appendChild(pal);
  root.appendChild(fs);
}

function randomAppearance() {
  const a = {};
  for (const slot of PART_SLOT_NAMES) {
    const choices = PART_SLOTS[slot];
    a[slot] = choices[Math.floor(Math.random() * choices.length)];
  }
  a.paletteIdx = Math.floor(Math.random() * PALETTES.length);
  return a;
}

document.getElementById('randomize').addEventListener('click', () => {
  Object.assign(state, randomAppearance());
  renderControls();
  renderPreview();
});

document.getElementById('cycle').addEventListener('click', () => {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  for (let i = 0; i < 60; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.innerHTML = renderMonsterSVG(randomAppearance());
    grid.appendChild(cell);
  }
});

renderControls();
renderPreview();
