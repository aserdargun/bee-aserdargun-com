import type { ExperimentRun, Intervention, SimulationConfig, WorldSnapshot } from './types';
export type WorkerRequest =
  | { type: 'init'; config: SimulationConfig; playing: boolean }
  | { type: 'play'; playing: boolean }
  | { type: 'speed'; speed: 1 | 5 | 20 }
  | { type: 'step' }
  | { type: 'intervene'; command: Omit<Extract<Intervention, { type: 'patch' }>, 'tick'> | Omit<Extract<Intervention, { type: 'behavior' }>, 'tick'> }
  | { type: 'export' }
  | { type: 'import'; run: unknown };
export type WorkerResponse =
  | { type: 'imported'; tick: number; config: SimulationConfig }
  | { type: 'snapshot'; world: WorldSnapshot; control: WorldSnapshot; playing: boolean; workerMs: number; workerTicks: number }
  | { type: 'export'; run: ExperimentRun }
  | { type: 'error'; message: string };
