/**
 * Floating damage number popups. Pool of 40, recycled. Each number animates
 * upward with a slight random horizontal drift, fading over its lifetime.
 */

const POOL_SIZE = 40;

function makePopup() {
  return { alive: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, text: '', color: '#fff', size: 18, bold: false };
}

export function createDamageNumbers(canvas) {
  const ctx = canvas.getContext('2d');
  const pool = Array.from({ length: POOL_SIZE }, makePopup);
  let dpr = window.devicePixelRatio || 1;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
  }
  window.addEventListener('resize', resize);
  resize();

  function add(x, y, text, { color = '#ffffff', size = 22, life = 1000, bold = false } = {}) {
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      if (!p.alive) {
        p.alive = true;
        p.x = x; p.y = y;
        p.vx = (Math.random() - 0.5) * 30;
        p.vy = -90;
        p.life = life;
        p.maxLife = life;
        p.text = String(text);
        p.color = color;
        p.size = size;
        p.bold = bold;
        return;
      }
    }
  }

  function step(dt) {
    const dts = dt / 1000;
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      if (!p.alive) continue;
      p.life -= dt;
      if (p.life <= 0) { p.alive = false; continue; }
      p.x += p.vx * dts;
      p.y += p.vy * dts;
      p.vy += 60 * dts; // slight gravity so they curve down at the end
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      if (!p.alive) continue;
      const a = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = a;
      ctx.font = `${p.bold ? '700 ' : '600 '}${p.size * dpr}px Inter, system-ui, sans-serif`;
      // Stroke first for outline.
      ctx.lineWidth = 4 * dpr;
      ctx.strokeStyle = '#1a1a2e';
      ctx.strokeText(p.text, p.x * dpr, p.y * dpr);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x * dpr, p.y * dpr);
    }
    ctx.globalAlpha = 1;
  }

  return { add, step, render, resize };
}
