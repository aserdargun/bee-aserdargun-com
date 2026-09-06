import type { BeeAction, BeeBrain, Bee, LocalObservation } from './types';

/** This policy cannot access the world, colony metrics, or unobserved food. */
export class RuleBasedBeeBrain implements BeeBrain {
  decide(observation: LocalObservation, bee: Readonly<Bee>, random: () => number): BeeAction {
    const memories = bee.memory.filter(m => m.expiresAt > observation.tick);
    if (bee.role === 'Scout' && (!memories.length || random() < 0.22)) return { type: 'explore' };
    if (memories.length && random() < 0.8) {
      return { type: 'visit', memory: memories[Math.floor(random() * memories.length)] };
    }
    if (observation.nearbySignals.length) {
      return { type: 'observe', signal: observation.nearbySignals[Math.floor(random() * observation.nearbySignals.length)] };
    }
    if (memories.length) return { type: 'visit', memory: memories[0] };
    return { type: 'wait' };
  }
}
