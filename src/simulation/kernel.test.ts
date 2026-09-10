import { describe, expect, it } from 'vitest';
import { Simulation } from './kernel';
import { defaultConfig } from './config';
import { replayRun } from './run';
import { validateRun } from './validation';
import { RuleBasedBeeBrain } from './brain';
import { WORLD } from './types';

describe('mandatory first vertical slice A–H', () => {
  it('A: identical seed, parameters and ticks produce identical full state', () => {
    const a = new Simulation(), b = new Simulation();
    a.stepMany(2400); b.stepMany(800); b.stepMany(1600);
    expect(a.snapshot()).toEqual(b.snapshot());
    const c = new Simulation(defaultConfig(10)); c.stepMany(2400);
    expect(c.snapshot().bees).not.toEqual(a.snapshot().bees);
  });
  it('B: scouts discover unknown resources independently', () => {
    const c = defaultConfig(); c.behavior.recruitment = false;
    const sim = new Simulation(c);
    expect(sim.snapshot().bees.every(b => b.memory.length === 0)).toBe(true);
    sim.stepMany(2200);
    expect(sim.metrics().firstDiscoveryTick).toBeGreaterThan(0);
    expect(sim.snapshot().bees.some(b => b.role === 'Scout' && b.memory.some(m => m.source === 'visit'))).toBe(true);
    expect(sim.snapshot().bees.filter(b => b.role === 'Forager').every(b => b.memory.length === 0)).toBe(true);
  });
  it('C: discovered nectar returns to the hive and is counted once', () => {
    const sim = new Simulation(); sim.stepMany(2400);
    const s = sim.snapshot();
    expect(s.metrics.foodCollected).toBeGreaterThan(0);
    expect(s.bees.reduce((sum, b) => sum + b.delivered, 0)).toBeCloseTo(s.metrics.foodCollected, 8);
    expect(s.metrics.deliveredByPatch.A + s.metrics.deliveredByPatch.B).toBeCloseTo(s.metrics.foodCollected, 8);
  });
  it('D: successful return creates an expiring signal with inspectable encoded information', () => {
    const sim = new Simulation(); sim.stepMany(2400);
    expect(sim.metrics().dances).toBeGreaterThan(0);
    const signal = sim.snapshot().signals[0]; expect(signal).toBeDefined();
    expect(signal.expiresAt).toBeGreaterThan(signal.createdAt);
    expect(signal.distance).toBeCloseTo(Math.hypot(signal.target.x - WORLD.hive.x, signal.target.y - WORLD.hive.y));
  });
  it('E: observation is local; followers gain private reports probabilistically', () => {
    const sim = new Simulation();
    expect(sim.observationFor(160).nearbyResources).toEqual([]);
    expect(sim.observationFor(160).nearbySignals).toEqual([]);
    sim.stepMany(3000);
    const s = sim.snapshot();
    expect(s.metrics.recruitments).toBeGreaterThan(0);
    expect(s.bees.some(b => b.role === 'Forager' && b.observedDancer !== null)).toBe(true);
    for (const b of s.bees) for (const signal of sim.observationFor(b.id).nearbySignals) {
      expect(Math.hypot(b.x - signal.position.x, b.y - signal.position.y)).toBeLessThanOrEqual(WORLD.contactRadius);
    }
    const recruit = s.events.find(e => e.type === 'recruitment');
    expect(recruit?.value).toBeGreaterThan(0); expect(recruit?.value).toBeLessThan(1);
  });
  it('F: recruitment changes allocation across paired seeds, without a global target allocator', () => {
    let onTotal = 0, offTotal = 0;
    for (const seed of [518394, 718923, 42, 104, 2026]) {
      const config = defaultConfig(seed), a = new Simulation(config);
      config.behavior.recruitment = false; const b = new Simulation(config);
      a.stepMany(5000); b.stepMany(5000);
      onTotal += a.metrics().foodCollected; offTotal += b.metrics().foodCollected;
      expect(a.metrics().recruitments).toBeGreaterThan(0); expect(b.metrics().recruitments).toBe(0);
      expect(a.metrics().allocation).not.toEqual(b.metrics().allocation);
    }
    expect(onTotal).toBeGreaterThan(offTotal);
  }, 30000);
  it('G: removal leaves private knowledge stale, then failed visits alter allocation', () => {
    const sim = new Simulation(); sim.stepMany(5000);
    const before = sim.snapshot(); expect(before.metrics.deliveredByPatch.B).toBeGreaterThan(0);
    sim.intervene({ tick: 5000, type: 'patch', patchId: 'B', active: false });
    expect(sim.snapshot().bees).toEqual(before.bees); // no global notification to agents
    sim.stepMany(1500); const delivered = sim.metrics().deliveredByPatch.B;
    sim.stepMany(1800);
    expect(sim.metrics().deliveredByPatch.B).toBe(delivered);
    expect(sim.metrics().failedVisits).toBeGreaterThan(before.metrics.failedVisits);
    expect(sim.metrics().allocation.B).toBe(0);
    expect(sim.metrics().deliveredByPatch.A).toBeGreaterThan(before.metrics.deliveredByPatch.A);
  });
  it('H: headless operation needs neither React, DOM, nor unseeded randomness', () => {
    expect(typeof document).toBe('undefined');
    const savedRandom = Math.random;
    try {
      Math.random = () => { throw new Error('Unseeded randomness'); };
      const sim = new Simulation(); sim.stepMany(1000); expect(sim.metrics().discoveries).toBeGreaterThan(0);
    } finally { Math.random = savedRandom; }
  });
});

describe('scientific and replay boundaries', () => {
  it('preserves state across JSON roundtrip, parameter interventions and depletion', () => {
    const sim = new Simulation(); sim.stepMany(1400);
    sim.intervene({ tick: 1400, type: 'behavior', danceNoise: 0.7 }); sim.stepMany(300);
    sim.intervene({ tick: 1700, type: 'patch', patchId: 'B', active: false }); sim.stepMany(300);
    const run = JSON.parse(JSON.stringify(sim.exportRun())); run.metrics.foodCollected = -999;
    expect(replayRun(run).snapshot()).toEqual(sim.snapshot());
  });
  it('does not leak snapshot or config mutations into the kernel', () => {
    const config = defaultConfig(), sim = new Simulation(config); config.patches[0].quality = 0;
    const s = sim.snapshot(); s.bees[0].memory.push({ patchId: 'A', x: 2, y: 2, quality: 1, learnedAt: 0, expiresAt: 900, source: 'visit' });
    expect(sim.snapshot().bees[0].memory).toEqual([]); expect(sim.snapshot().config.patches[0].quality).toBe(0.46);
  });
  it('keeps physical quantities finite and bounded over a long noisy run', () => {
    const c = defaultConfig(0); c.behavior.danceNoise = 1;
    const sim = new Simulation(c); sim.stepMany(8000);
    for (const bee of sim.snapshot().bees) {
      expect(bee.x).toBeGreaterThanOrEqual(0); expect(bee.x).toBeLessThanOrEqual(WORLD.width);
      expect(bee.y).toBeGreaterThanOrEqual(0); expect(bee.y).toBeLessThanOrEqual(WORLD.height);
      expect(bee.energy).toBeGreaterThanOrEqual(0); expect(bee.energy).toBeLessThanOrEqual(100);
    }
    expect(sim.snapshot().patches.every(p => Number.isFinite(p.amount) && p.amount >= 0 && p.amount <= p.capacity)).toBe(true);
  });
  it('a policy with no personal memory and no local signal cannot choose an unseen patch', () => {
    const bee = new Simulation().snapshot().bees[159];
    const brain = new RuleBasedBeeBrain();
    for (const r of [0, 0.1, 0.5, 0.999]) expect(brain.decide({ tick: 1, nearbyResources: [], nearbySignals: [] }, bee, () => r)).toEqual({ type: 'wait' });
  });
  it('rejects invalid seeds, populations and non-finite values', () => {
    for (const seed of [-1, NaN, Infinity, 1.2, 4294967296]) expect(() => new Simulation(defaultConfig(seed))).toThrow();
    const c = defaultConfig(); c.population = 1000000; expect(() => new Simulation(c)).toThrow();
  });
  it('rejects unsupported versions, mismatched seeds and expensive replays', () => {
    const run = new Simulation().exportRun();
    expect(() => validateRun({ ...run, behaviorVersion: '9.0.0' })).toThrow();
    expect(() => validateRun({ ...run, seed: 0 })).toThrow();
    expect(() => validateRun({ ...run, tickCount: 999999 })).toThrow();
  });
  it('rejects unordered commands and restores default state on reset', () => {
    const sim = new Simulation(), initial = sim.snapshot(); sim.stepMany(20); sim.reset();
    expect(sim.snapshot()).toEqual(initial);
    const run = sim.exportRun(); run.tickCount = 20;
    run.interventions = [{ tick: 12, type: 'patch', patchId: 'A', active: false }, { tick: 3, type: 'patch', patchId: 'B', active: false }];
    expect(() => replayRun(run)).toThrow('Unordered');
  });
  it('a zero recruitment probability produces no recruits even with dances', () => {
    const c = defaultConfig(); c.behavior.recruitmentStrength = 0;
    const sim = new Simulation(c); sim.stepMany(3000);
    expect(sim.metrics().dances).toBeGreaterThan(0); expect(sim.metrics().recruitments).toBe(0);
  });
});

describe('portable run integrity', () => {
  it('rejects unimplemented fields instead of silently changing the meaning of a replay', () => {
    const run = new Simulation().exportRun();
    const invalid = [
      { ...run, migration: 'automatic' },
      { ...run, parameters: { ...run.parameters, wind: 1 } },
      { ...run, parameters: { ...run.parameters, behavior: { ...run.parameters.behavior, odor: true } } },
      { ...run, parameters: { ...run.parameters, patches: run.parameters.patches.map(p => ({ ...p, obstacle: true })) } },
      { ...run, parameters: { ...run.parameters, experimentId: ['BEE-003'] } },
      { ...run, parameters: { ...run.parameters, patches: run.parameters.patches.map(p => ({ ...p, id: [p.id] })) } },
      { ...run, interventions: [{ tick: 0, type: 'behavior', danceNoise: 0.2, memoryTicks: 100 }] },
      { ...run, interventions: [{ tick: 0, type: 'patch', patchId: 'A', active: false, amount: 0 }] },
    ];
    for (const value of invalid) expect(() => replayRun(value)).toThrow();
  });
  it('rejects a bad intervention atomically', () => {
    const sim = new Simulation(); sim.stepMany(10); const before = sim.snapshot();
    expect(() => sim.intervene({ tick: 10, type: 'behavior', danceNoise: NaN })).toThrow();
    expect(sim.snapshot()).toEqual(before);
    expect(sim.exportRun().interventions).toEqual([]);
  });
  it('preserves same-tick intervention order through replay', () => {
    const sim = new Simulation();
    sim.intervene({ tick: 0, type: 'patch', patchId: 'B', active: false });
    sim.intervene({ tick: 0, type: 'patch', patchId: 'B', active: true });
    sim.stepMany(100);
    expect(replayRun(sim.exportRun()).snapshot()).toEqual(sim.snapshot());
  });
  it('does not label custom policies as replayable standard behavior', () => {
    const sim = new Simulation(defaultConfig(), { decide: () => ({ type: 'wait' }) });
    sim.stepMany(50);
    expect(() => sim.exportRun()).toThrow('Custom behavior');
  });
  it('refuses to export headless runs beyond the portable replay limit', () => {
    const config = defaultConfig(); config.population = 10;
    const sim = new Simulation(config); sim.stepMany(36001);
    expect(sim.tickCount).toBe(36001);
    expect(() => sim.exportRun()).toThrow();
  });
  it('enforces the intervention limit without changing the last valid state', () => {
    const sim = new Simulation();
    for (let i = 0; i < 200; i++) sim.intervene({ tick: 0, type: 'behavior', danceNoise: i % 2 });
    const before = sim.snapshot();
    expect(() => sim.intervene({ tick: 0, type: 'behavior', recruitment: false })).toThrow('200 intervention limit');
    expect(sim.snapshot()).toEqual(before);
    expect(replayRun(sim.exportRun()).snapshot()).toEqual(before);
  });
});
