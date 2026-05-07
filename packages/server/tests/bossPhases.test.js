import { describe, expect, it } from 'vitest';

import { BOSS_PHASES, bossPhaseFor, getSignature, SIGNATURES, GENERIC_SIGNATURE } from '@bossraid/shared';

describe('bossPhaseFor', () => {
  it('returns opening (p1) above 50% HP', () => {
    expect(bossPhaseFor(0.95).id).toBe('p1');
    expect(bossPhaseFor(0.51).id).toBe('p1');
  });

  it('returns enraged (p2) between 20% and 50% HP', () => {
    expect(bossPhaseFor(0.5).id).toBe('p2');
    expect(bossPhaseFor(0.4).id).toBe('p2');
    expect(bossPhaseFor(0.21).id).toBe('p2');
  });

  it('returns desperation (p3) at or below 20% HP', () => {
    expect(bossPhaseFor(0.2).id).toBe('p3');
    expect(bossPhaseFor(0.1).id).toBe('p3');
    expect(bossPhaseFor(0).id).toBe('p3');
  });

  it('signatures fire faster as phases progress', () => {
    expect(BOSS_PHASES[0].signatureIntervalMs).toBeGreaterThan(BOSS_PHASES[1].signatureIntervalMs);
    expect(BOSS_PHASES[1].signatureIntervalMs).toBeGreaterThan(BOSS_PHASES[2].signatureIntervalMs);
  });

  it('basic attacks accelerate as phases progress', () => {
    expect(BOSS_PHASES[0].basicAttackMultiplier).toBeGreaterThan(BOSS_PHASES[1].basicAttackMultiplier);
    expect(BOSS_PHASES[1].basicAttackMultiplier).toBeGreaterThan(BOSS_PHASES[2].basicAttackMultiplier);
  });
});

describe('getSignature', () => {
  it('returns the preset-specific signature for known presets', () => {
    expect(getSignature('bean')).toBe(SIGNATURES.bean);
    expect(getSignature('gloop').name).toBe('EYE BEAM');
  });

  it('falls back to GENERIC_SIGNATURE for unknown / null preset keys', () => {
    expect(getSignature(null)).toBe(GENERIC_SIGNATURE);
    expect(getSignature('not_a_preset')).toBe(GENERIC_SIGNATURE);
  });

  it('every preset signature defines a counter verb chat can use', () => {
    for (const key of Object.keys(SIGNATURES)) {
      const sig = SIGNATURES[key];
      expect(['block', 'heal', 'attack']).toContain(sig.counter);
      expect(sig.windUpMs).toBeGreaterThanOrEqual(3_000); // enough time for chat to react
      expect(sig.windUpMs).toBeLessThanOrEqual(6_000);
    }
  });
});
