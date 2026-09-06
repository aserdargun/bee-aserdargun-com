import type { SimulationConfig } from './types';
export function defaultConfig(seed = 518394): SimulationConfig {
  return {
    seed, population: 160, experimentId: 'BEE-003',
    behavior: { recruitment: true, recruitmentStrength: 0.78, danceNoise: 0.12, memoryTicks: 1400, scoutRatio: 0.18 },
    patches: [
      { id: 'A', x: 270, y: 160, radius: 42, quality: 0.46, amount: 800, capacity: 800, regeneration: 0.16, active: true },
      { id: 'B', x: 795, y: 440, radius: 55, quality: 0.95, amount: 800, capacity: 800, regeneration: 0.16, active: true },
    ],
  };
}
