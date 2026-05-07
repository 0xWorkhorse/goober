/**
 * The render-plan logic lives in the overlay package, but pickTier and
 * buildRenderPlan are pure functions over plain data and worth a unit spec.
 * We import directly from the overlay source.
 */

import { describe, expect, it } from 'vitest';

import {
  MOB_BUCKET_SIZE_CROWD,
  MOB_BUCKET_SIZE_HYBRID,
  RENDER_TIER_FULL_MAX,
  RENDER_TIER_HYBRID_MAX,
} from '@bossraid/shared';

import { buildRenderPlan, pickTier } from '../../overlay/src/render/mobs.js';

function fakeChatters(n) {
  return Array.from({ length: n }, (_, i) => ({
    login: 'u' + i,
    hp: 100, maxHp: 100,
    damageDealt: i,           // last user is "most active"
    blockedUntilMs: 0,
  }));
}

describe('pickTier', () => {
  it('uses full tier at and below RENDER_TIER_FULL_MAX', () => {
    expect(pickTier(0)).toBe('full');
    expect(pickTier(RENDER_TIER_FULL_MAX)).toBe('full');
  });

  it('uses hybrid tier between full and hybrid maxes', () => {
    expect(pickTier(RENDER_TIER_FULL_MAX + 1)).toBe('hybrid');
    expect(pickTier(RENDER_TIER_HYBRID_MAX)).toBe('hybrid');
  });

  it('uses crowd tier above hybrid max', () => {
    expect(pickTier(RENDER_TIER_HYBRID_MAX + 1)).toBe('crowd');
    expect(pickTier(2000)).toBe('crowd');
  });
});

describe('buildRenderPlan', () => {
  it('renders all individuals at full tier', () => {
    const plan = buildRenderPlan(fakeChatters(50), new Map());
    expect(plan.tier).toBe('full');
    expect(plan.individuals.length).toBe(50);
    expect(plan.mobs.length).toBe(0);
  });

  it('caps individuals at full-tier limit in hybrid tier', () => {
    const plan = buildRenderPlan(fakeChatters(150), new Map());
    expect(plan.tier).toBe('hybrid');
    expect(plan.individuals.length).toBe(RENDER_TIER_FULL_MAX);
    expect(plan.mobs.length).toBeGreaterThan(0);
    // Mobs bucketed at hybrid bucket size.
    expect(plan.mobs[0].count).toBeLessThanOrEqual(MOB_BUCKET_SIZE_HYBRID);
  });

  it('promotes spotlit chatters to individuals in crowd tier', () => {
    const chatters = fakeChatters(500);
    const future = Date.now() + 5000;
    const spotlights = new Map([['u17', future], ['u200', future]]);
    const plan = buildRenderPlan(chatters, spotlights);
    expect(plan.tier).toBe('crowd');
    expect(plan.individuals.map((c) => c.login)).toEqual(expect.arrayContaining(['u17', 'u200']));
    // Mobs bucketed at crowd bucket size, not hybrid.
    expect(plan.mobs[0].count).toBeLessThanOrEqual(MOB_BUCKET_SIZE_CROWD);
  });

  it('does not include the same login in both buckets', () => {
    const chatters = fakeChatters(220);
    const future = Date.now() + 5000;
    const spotlights = new Map([['u100', future]]);
    const plan = buildRenderPlan(chatters, spotlights);
    const individualLogins = new Set(plan.individuals.map((c) => c.login));
    for (const mob of plan.mobs) {
      for (const m of mob.members) {
        expect(individualLogins.has(m.login)).toBe(false);
      }
    }
  });
});
