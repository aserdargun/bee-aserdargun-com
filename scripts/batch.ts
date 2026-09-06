import { performance } from 'node:perf_hooks';
import { mkdir, writeFile } from 'node:fs/promises';
import { Simulation } from '../src/simulation/kernel';
import { defaultConfig } from '../src/simulation/config';
import { VERSIONS } from '../src/simulation/types';

const rows = [];
for (const seed of [518394, 718923, 42, 104, 2026]) {
  for (const recruitment of [true, false]) {
    const c = defaultConfig(seed); c.behavior.recruitment = recruitment;
    const sim = new Simulation(c), start = performance.now(); sim.stepMany(6000);
    const m = sim.metrics();
    rows.push({ seed, recruitment, ticks: 6000, food: +m.foodCollected.toFixed(3), allocation: m.allocation,
      recruitments: m.recruitments, firstDiscoveryTick: m.firstDiscoveryTick,
      elapsedMs: +(performance.now() - start).toFixed(1) });
  }
}
const performanceRows = [];
for (const population of [100, 1000]) {
  const c = defaultConfig(); c.population = population; const sim = new Simulation(c);
  sim.stepMany(1000); const start = performance.now(); sim.stepMany(1000);
  const elapsedMs = performance.now() - start;
  performanceRows.push({ population, ticks: 1000, elapsedMs: +elapsedMs.toFixed(1), msPerTick: +(elapsedMs / 1000).toFixed(3) });
}
const result = { versions: VERSIONS, runtime: process.version, units: 'Abstract model units; single-machine timings, not browser FPS.', rows, performance: performanceRows };
console.table(rows); console.table(performanceRows);
await mkdir('output', { recursive: true });
await writeFile('output/batch-results.json', JSON.stringify(result, null, 2));
