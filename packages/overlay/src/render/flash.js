/**
 * Hit flash on the boss element. Toggled via a CSS filter that brightens the
 * SVG for ~80ms after each hit.
 */

export function createFlash(target) {
  let timer = null;

  function flash(durationMs = 80, intensity = 1.7) {
    if (timer) clearTimeout(timer);
    target.style.filter = `brightness(${intensity})`;
    timer = setTimeout(() => {
      target.style.filter = '';
      timer = null;
    }, durationMs);
  }

  return { flash };
}
