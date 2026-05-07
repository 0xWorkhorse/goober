/**
 * Boss HP bar. Smooth interpolated fill — when the server publishes a new
 * value the bar animates over ~250ms via CSS transition.
 */

export function renderHpBar(container, { hp, maxHp, name, level }) {
  let root = container.querySelector('.hp-bar');
  if (!root) {
    root = document.createElement('div');
    root.className = 'hp-bar';
    root.innerHTML = `
      <div class="hp-bar-label">
        <span class="hp-bar-name"></span>
        <span class="hp-bar-level"></span>
        <span class="hp-bar-numbers"></span>
      </div>
      <div class="hp-bar-track"><div class="hp-bar-fill"></div></div>
    `;
    container.appendChild(root);
  }
  const pct = Math.max(0, Math.min(100, maxHp > 0 ? (hp / maxHp) * 100 : 0));
  root.querySelector('.hp-bar-name').textContent = name || '—';
  root.querySelector('.hp-bar-level').textContent = level != null ? `Lv ${level}` : '';
  root.querySelector('.hp-bar-numbers').textContent = `${Math.round(hp)} / ${Math.round(maxHp)}`;
  root.querySelector('.hp-bar-fill').style.width = `${pct}%`;
}
