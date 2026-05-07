/**
 * Canvas particle pool. 500 preallocated particles, recycled. Render is one
 * call per frame; cost is bounded regardless of incoming events.
 */

const POOL_SIZE = 500;

function makeParticle() {
  return {
    alive: false,
    x: 0, y: 0, vx: 0, vy: 0,
    life: 0, maxLife: 1,
    size: 2, color: '#fff',
    gravity: 0,
    fade: true,
  };
}

export function createParticleSystem(canvas) {
  const ctx = canvas.getContext('2d');
  const pool = Array.from({ length: POOL_SIZE }, makeParticle);
  let dpr = window.devicePixelRatio || 1;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
  }
  window.addEventListener('resize', resize);
  resize();

  function spawn(opts) {
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      if (!p.alive) {
        p.alive = true;
        p.x = opts.x; p.y = opts.y;
        p.vx = opts.vx || 0; p.vy = opts.vy || 0;
        p.life = opts.life || 600;
        p.maxLife = p.life;
        p.size = opts.size || 3;
        p.color = opts.color || '#fff';
        p.gravity = opts.gravity || 0;
        p.fade = opts.fade !== false;
        return p;
      }
    }
    return null; // pool exhausted, drop silently
  }

  /**
   * Burst N particles outward from (x, y) with a rough color theme.
   */
  function burst(x, y, { count = 14, color = '#ffd166', speed = 250, life = 600, size = 4 } = {}) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const sp = speed * (0.6 + Math.random() * 0.6);
      spawn({
        x, y,
        vx: Math.cos(angle) * sp,
        vy: Math.sin(angle) * sp,
        life: life * (0.6 + Math.random() * 0.5),
        size: size * (0.7 + Math.random() * 0.6),
        color,
        gravity: 240,
      });
    }
  }

  function step(dt) {
    const dts = dt / 1000;
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      if (!p.alive) continue;
      p.life -= dt;
      if (p.life <= 0) { p.alive = false; continue; }
      p.vy += p.gravity * dts;
      p.x += p.vx * dts;
      p.y += p.vy * dts;
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      if (!p.alive) continue;
      const a = p.fade ? Math.max(0, p.life / p.maxLife) : 1;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x * dpr, p.y * dpr, p.size * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  return { burst, spawn, step, render, resize };
}
