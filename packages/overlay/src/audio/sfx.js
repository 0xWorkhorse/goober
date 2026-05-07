/**
 * Synthesized sound effects + a music bed. Generated at runtime via the Web
 * Audio API so the overlay ships zero binary assets. Plays nothing until the
 * first user gesture (browser autoplay policy).
 *
 * Three SFX:
 *   - 'impact'      — short noisy thump for chatter hits and boss basics
 *   - 'ability'     — rising sweep for streamer abilities
 *   - 'death'       — falling tone + noise sweep for monster KO
 *
 * One music bed: a slow gentle 4-note loop that plays during the fight phase
 * only, ducked to ~12% volume. Extremely simple — fight juice, not a soundtrack.
 */

let actx = null;
let masterGain = null;
let musicGain = null;
let muted = false;
let musicNode = null;

function ensureCtx() {
  if (actx) return actx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  actx = new Ctx();
  masterGain = actx.createGain();
  masterGain.gain.value = 0.5;
  masterGain.connect(actx.destination);
  musicGain = actx.createGain();
  musicGain.gain.value = 0.12;
  musicGain.connect(masterGain);
  return actx;
}

/** Resume the AudioContext on first user gesture. */
export function unlockAudio() {
  ensureCtx();
  if (actx && actx.state === 'suspended') actx.resume().catch(() => {});
}

export function setMuted(v) { muted = !!v; if (masterGain) masterGain.gain.value = v ? 0 : 0.5; }
export function toggleMuted() { setMuted(!muted); return muted; }

function noiseBuffer(seconds = 0.6) {
  const ctx = ensureCtx();
  if (!ctx) return null;
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
  return buf;
}

function play(name) {
  const ctx = ensureCtx();
  if (!ctx || muted) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  switch (name) {
    case 'impact': {
      // Low oscillator thump + short noise burst.
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, t0);
      osc.frequency.exponentialRampToValueAtTime(60, t0 + 0.18);
      gain.gain.setValueAtTime(0.7, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
      osc.connect(gain).connect(masterGain);
      osc.start(t0); osc.stop(t0 + 0.24);

      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(0.18);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.45, t0);
      ng.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);
      const filt = ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 800;
      src.connect(filt).connect(ng).connect(masterGain);
      src.start(t0); src.stop(t0 + 0.2);
      break;
    }
    case 'ability': {
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, t0);
      osc.frequency.exponentialRampToValueAtTime(900, t0 + 0.35);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.4, t0 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
      const filt = ctx.createBiquadFilter();
      filt.type = 'bandpass'; filt.frequency.value = 1200; filt.Q.value = 2;
      osc.connect(filt).connect(gain).connect(masterGain);
      osc.start(t0); osc.stop(t0 + 0.42);
      break;
    }
    case 'death': {
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, t0);
      osc.frequency.exponentialRampToValueAtTime(60, t0 + 0.9);
      gain.gain.setValueAtTime(0.45, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.95);
      osc.connect(gain).connect(masterGain);
      osc.start(t0); osc.stop(t0 + 1.0);

      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(0.6);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.3, t0);
      ng.gain.exponentialRampToValueAtTime(0.001, t0 + 0.6);
      src.connect(ng).connect(masterGain);
      src.start(t0); src.stop(t0 + 0.62);
      break;
    }
  }
}

// ─── Music bed ──────────────────────────────────────────────────────────────
function startMusic() {
  const ctx = ensureCtx();
  if (!ctx || musicNode) return;
  // Two-oscillator drone with a slow LFO on a 4-note pattern.
  const root = 110; // A2
  const intervals = [0, 3, 7, 5]; // minor pentatonic-ish loop
  const beatMs = 800;

  const out = ctx.createGain();
  out.gain.value = 1;
  out.connect(musicGain);

  let i = 0;
  function step() {
    if (!musicNode) return;
    const t0 = ctx.currentTime;
    const f = root * Math.pow(2, intervals[i % intervals.length] / 12);
    i++;
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(f, t0);
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(f * 1.5, t0);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(0.4, t0 + 0.1);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + (beatMs - 50) / 1000);
    osc1.connect(env); osc2.connect(env); env.connect(out);
    osc1.start(t0); osc1.stop(t0 + beatMs / 1000);
    osc2.start(t0); osc2.stop(t0 + beatMs / 1000);
  }
  // Kick off and schedule loop.
  step();
  const interval = setInterval(step, beatMs);
  musicNode = { interval, out };
}

function stopMusic() {
  if (!musicNode) return;
  clearInterval(musicNode.interval);
  if (musicNode.out) musicNode.out.disconnect();
  musicNode = null;
}

/** Bind playback to phase changes. Music plays only during the fight phase. */
export function bindMusicToPhase(getPhase) {
  let lastPhase = null;
  return function onPhase(phase) {
    if (phase === lastPhase) return;
    lastPhase = phase;
    if (phase === 'fight') startMusic();
    else stopMusic();
  };
}

export const sfx = { play, unlock: unlockAudio, setMuted, toggleMuted };
