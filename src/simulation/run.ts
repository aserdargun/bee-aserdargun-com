import { Simulation } from './kernel';
import { validateRun } from './validation';

/** Replay recomputes metrics and PRNG states. Imported metrics are never trusted. */
export function replayRun(input: unknown): Simulation {
  validateRun(input);
  const sim = new Simulation(input.parameters);
  let tick = 0;
  for (const command of input.interventions) {
    sim.stepMany(command.tick - tick); sim.intervene(command); tick = command.tick;
  }
  sim.stepMany(input.tickCount - tick);
  return sim;
}
