import { describe, expect, it } from 'vitest';
import { Simulation } from '../simulation/kernel';
import { defaultConfig } from '../simulation/config';
import { VERSIONS } from '../simulation/types';
import { measuredPairs, measuredRows, measuredSeeds, measuredVersions, pairForSeed } from './measurements';

/**
 * `docs/validation/batch-results.json` is imported by measurements.ts and
 * rendered as the site's "What has been measured" table, so the file is a
 * published claim rather than a scratch artifact: it says these seeded outcomes
 * came out of this model. No other gate step re-derives it — `experiment:batch`
 * is a delivery-time command that CI never runs, and `verify-artifact` only
 * hashes whatever was already built. These checks re-run the same ten headless
 * pairs from the current kernel, so a behaviour, world, metric or version change
 * cannot leave the site publishing numbers this model no longer produces.
 *
 * `elapsedMs` and the recorded `runtime` are wall-clock readings of one machine
 * and are deliberately excluded, which is how measurements.ts labels them. Every
 * other recorded column is reproducible in the same model and runtime.
 */
describe('published measured results stay derivable from the kernel', () => {
  it('records the model versions the table prints', () => {
    expect(measuredVersions).toEqual(VERSIONS);
  });
  it('matches the seed count and tick budget the section states in prose', () => {
    // MeasuredResults reads "Five seeds, dance on and off, 6,000 ticks each".
    expect(measuredSeeds).toHaveLength(5);
    expect(new Set(measuredRows.map(row => row.ticks))).toEqual(new Set([6000]));
  });
  it('pairs every recorded seed with one dance-on and one dance-off row', () => {
    // MeasuredResults drops a missing half-pair with a filter instead of
    // reporting it, so an incomplete pair would render as a quieter table.
    expect(measuredRows).toHaveLength(measuredSeeds.length * 2);
    for (const seed of measuredSeeds) {
      const pair = pairForSeed(seed);
      expect(pair.dance?.recruitment, `seed ${seed} dance-on row`).toBe(true);
      expect(pair.control?.recruitment, `seed ${seed} dance-off row`).toBe(false);
    }
    expect(measuredPairs.map(pair => pair.seed)).toEqual(measuredSeeds);
  });
  it('re-derives every published seeded row from the current kernel', () => {
    for (const row of measuredRows) {
      const config = defaultConfig(row.seed);
      config.behavior.recruitment = row.recruitment;
      const sim = new Simulation(config);
      sim.stepMany(row.ticks);
      const metrics = sim.metrics();
      const label = `seed ${row.seed}, dance ${row.recruitment ? 'on' : 'off'}`;
      expect(row.food, label).toBe(+metrics.foodCollected.toFixed(3));
      expect(row.allocation, label).toEqual(metrics.allocation);
      expect(row.recruitments, label).toBe(metrics.recruitments);
      expect(row.firstDiscoveryTick, label).toBe(metrics.firstDiscoveryTick);
    }
  }, 30000);
});
