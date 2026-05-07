/**
 * Screen shake controller. Additive amplitude with exponential decay. Applied
 * as a CSS transform on the stage container.
 */

export function createShake(target) {
  let amp = 0;
  let decayPerSec = 6; // halves quickly
  let lastT = performance.now();
  let raf = 0;

  function add(amount) {
    amp = Math.min(40, amp + amount);
    if (!raf) tick();
  }

  function tick() {
    const now = performance.now();
    const dt = (now - lastT) / 1000;
    lastT = now;
    amp = Math.max(0, amp - amp * decayPerSec * dt);
    if (amp < 0.4) {
      target.style.transform = '';
      raf = 0;
      return;
    }
    const dx = (Math.random() - 0.5) * amp;
    const dy = (Math.random() - 0.5) * amp;
    target.style.transform = `translate(${dx}px, ${dy}px)`;
    raf = requestAnimationFrame(tick);
  }

  return { add };
}
