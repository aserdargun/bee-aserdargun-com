import { VERSIONS, WORLD, type ExperimentRun, type Intervention, type SimulationConfig } from './types';

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object');
  return value as Record<string, unknown>;
}
function number(value: unknown, min: number, max: number, integer = false): void {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
    throw new Error(`Expected ${integer ? 'integer' : 'number'} in [${min}, ${max}]`);
  }
}
function bool(value: unknown): void { if (typeof value !== 'boolean') throw new Error('Expected boolean'); }
export function validateConfig(value: unknown): asserts value is SimulationConfig {
  const c = record(value), b = record(c.behavior);
  number(c.seed, 0, 4294967295, true); number(c.population, 10, 1000, true);
  if (!['BEE-001', 'BEE-002', 'BEE-003', 'BEE-004'].includes(String(c.experimentId))) throw new Error('Unknown experiment');
  bool(b.recruitment); number(b.recruitmentStrength, 0, 1); number(b.danceNoise, 0, 1);
  number(b.scoutRatio, 0.01, 1); number(b.memoryTicks, 100, 10000, true);
  if (!Array.isArray(c.patches) || c.patches.length !== 2) throw new Error('Expected two patches');
  const ids = new Set();
  for (const item of c.patches) {
    const p = record(item);
    if (!['A', 'B'].includes(String(p.id)) || ids.has(p.id)) throw new Error('Invalid patch identifier');
    ids.add(p.id); number(p.radius, 10, 100); number(p.x, 110, WORLD.width - 110); number(p.y, 110, WORLD.height - 110);
    number(p.quality, 0, 1); number(p.capacity, 1, 100000); number(p.amount, 0, p.capacity as number);
    number(p.regeneration, 0, 10); bool(p.active);
  }
}
export function validateIntervention(value: unknown, maxTick: number): asserts value is Intervention {
  const c = record(value); number(c.tick, 0, maxTick, true);
  if (c.type === 'patch') {
    if (!['A', 'B'].includes(String(c.patchId))) throw new Error('Unknown patch');
    if (c.active !== undefined) bool(c.active);
    if (c.quality !== undefined) number(c.quality, 0, 1);
    if (c.active === undefined && c.quality === undefined) throw new Error('Empty intervention');
  } else if (c.type === 'behavior') {
    if (c.recruitment !== undefined) bool(c.recruitment);
    if (c.recruitmentStrength !== undefined) number(c.recruitmentStrength, 0, 1);
    if (c.danceNoise !== undefined) number(c.danceNoise, 0, 1);
    if (c.recruitment === undefined && c.recruitmentStrength === undefined && c.danceNoise === undefined) throw new Error('Empty intervention');
  } else throw new Error('Unknown intervention');
}
export function validateRun(value: unknown): asserts value is ExperimentRun {
  const run = record(value);
  if (run.schemaVersion !== 1 || run.lab !== 'BEE' || run.species !== 'Apis mellifera') throw new Error('Unsupported BEE run');
  for (const [key, version] of Object.entries(VERSIONS)) if (run[key] !== version) throw new Error(`Unsupported ${key}`);
  validateConfig(run.parameters);
  number(run.tickCount, 0, 36000, true);
  if (run.seed !== run.parameters.seed) throw new Error('Seed mismatch');
  if (run.parameters.population * (run.tickCount as number) > 36_000_000) throw new Error('Replay exceeds work limit');
  if (!Array.isArray(run.interventions) || run.interventions.length > 200) throw new Error('Invalid intervention log');
  let previous = 0;
  for (const command of run.interventions) {
    validateIntervention(command, run.tickCount as number);
    if (command.tick < previous) throw new Error('Unordered intervention log');
    previous = command.tick;
  }
}
