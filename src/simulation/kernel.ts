import { RuleBasedBeeBrain } from './brain';
import { randomFrom, seedFor } from './random';
import { defaultConfig } from './config';
import { WORLD, VERSIONS, type Bee, type BeeBrain, type DanceSignal, type ExperimentRun, type FoodPatch,
  type Intervention, type LocalObservation, type MetricPoint, type Metrics, type ResourceMemory,
  type SimulationConfig, type SimulationEvent, type Vec, type WorldSnapshot } from './types';
import { validateConfig, validateIntervention, validateRun } from './validation';

const distance = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y);
const clone = <T>(value: T): T => structuredClone(value);
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export class Simulation {
  private initial!: SimulationConfig;
  private config!: SimulationConfig;
  private bees: Bee[] = [];
  private patches: FoodPatch[] = [];
  private signals: DanceSignal[] = [];
  private events: SimulationEvent[] = [];
  private history: MetricPoint[] = [];
  private interventions: Intervention[] = [];
  private tick = 0;
  private nextSignalId = 1;
  private totalFood = 0;
  private deliveredByPatch = { A: 0, B: 0 };
  private recentDeliveries: { tick: number; value: number }[] = [];
  private firstDiscovery: number | null = null;
  private counters = { recruitments: 0, dances: 0, discoveries: 0, failedVisits: 0 };

  constructor(config = defaultConfig(), private brain: BeeBrain = new RuleBasedBeeBrain()) { this.reset(config); }

  get tickCount(): number { return this.tick; }

  reset(config = this.initial): void {
    validateConfig(config);
    this.initial = clone(config); this.config = clone(config); this.patches = clone(config.patches);
    this.tick = 0; this.nextSignalId = 1; this.totalFood = 0; this.firstDiscovery = null;
    this.signals = []; this.events = []; this.history = []; this.interventions = []; this.recentDeliveries = [];
    this.deliveredByPatch = { A: 0, B: 0 };
    this.counters = { recruitments: 0, dances: 0, discoveries: 0, failedVisits: 0 };
    this.bees = Array.from({ length: config.population }, (_, id) => {
      const bee: Bee = {
        id: id + 1, colonyId: 'colony-1', ...WORLD.hive, heading: 0, energy: 100,
        role: id < Math.max(1, Math.round(config.population * config.behavior.scoutRatio)) ? 'Scout' : 'Forager',
        state: 'Resting', memory: [], target: null, timer: 0, searchTicks: 0,
        cargo: 0, cargoPatch: null, cargoQuality: 0, randomState: seedFor(config.seed, id),
        observedDancer: null, observedSignal: null, experience: 0, recruited: false, delivered: 0, distanceFlown: 0,
      };
      bee.heading = this.random(bee) * Math.PI * 2;
      this.hivePosition(bee); bee.timer = Math.floor(this.random(bee) * 50);
      return bee;
    });
    this.recordHistory();
  }

  private random(bee: Bee): number {
    const [value, state] = randomFrom(bee.randomState); bee.randomState = state; return value;
  }

  private emit(event: Omit<SimulationEvent, 'tick'>): void {
    this.events.push({ tick: this.tick, ...event });
    if (this.events.length > 250) this.events.splice(0, this.events.length - 250);
  }

  /** Only a distance-limited sensor and hive contacts cross this boundary. */
  observationFor(beeId: number): LocalObservation {
    const bee = this.bees.find(b => b.id === beeId);
    if (!bee) throw new Error('Unknown bee');
    return clone(this.observe(bee, this.signals));
  }

  private observe(bee: Bee, signals: DanceSignal[]): LocalObservation {
    return {
      tick: this.tick,
      nearbyResources: this.patches.filter(p => p.active && p.amount > 0.01 && distance(bee, p) <= p.radius + WORLD.sensorRadius),
      nearbySignals: this.config.behavior.recruitment && distance(bee, WORLD.hive) < WORLD.hiveRadius * 2
        ? signals.filter(s => s.dancerId !== bee.id && s.expiresAt > this.tick && distance(bee, s.position) <= WORLD.contactRadius) : [],
    };
  }

  step(): void {
    this.tick++;
    this.signals = this.signals.filter(s => s.expiresAt > this.tick);
    const availableSignals = this.signals.slice(); // A dance cannot recruit another bee in its creation tick.
    for (const patch of this.patches) if (patch.active) patch.amount = Math.min(patch.capacity, patch.amount + patch.regeneration);
    for (const bee of this.bees) this.updateBee(bee, availableSignals);
    this.recentDeliveries = this.recentDeliveries.filter(d => d.tick > this.tick - 600);
    if (this.tick % 20 === 0) this.recordHistory();
  }

  stepMany(ticks: number): void {
    if (!Number.isInteger(ticks) || ticks < 0 || ticks > 100_000) throw new Error('Invalid tick count');
    for (let i = 0; i < ticks; i++) this.step();
  }

  private hivePosition(bee: Bee): void {
    const angle = this.random(bee) * Math.PI * 2, radius = Math.sqrt(this.random(bee)) * 27;
    bee.x = WORLD.hive.x + Math.cos(angle) * radius;
    bee.y = WORLD.hive.y + Math.sin(angle) * radius;
  }

  private move(bee: Bee, target: Vec): boolean {
    const d = distance(bee, target), step = Math.min(WORLD.speed, d);
    bee.heading = Math.atan2(target.y - bee.y, target.x - bee.x);
    bee.x += Math.cos(bee.heading) * step; bee.y += Math.sin(bee.heading) * step;
    bee.distanceFlown += step; bee.energy = Math.max(0, bee.energy - step * 0.013);
    return d <= WORLD.speed;
  }

  private remember(bee: Bee, memory: ResourceMemory): void {
    bee.memory = [...bee.memory.filter(m => m.patchId !== memory.patchId), clone(memory)];
  }

  private discover(bee: Bee, patch: Readonly<FoodPatch>): void {
    const previouslyVisited = bee.memory.some(m => m.patchId === patch.id && m.source === 'visit');
    const memory: ResourceMemory = { x: patch.x, y: patch.y, patchId: patch.id, quality: patch.quality,
      source: 'visit', learnedAt: this.tick, expiresAt: this.tick + this.config.behavior.memoryTicks };
    this.remember(bee, memory); bee.target = clone(memory); bee.state = 'Foraging'; bee.timer = 24;
    if (!previouslyVisited) {
      this.firstDiscovery ??= this.tick; this.counters.discoveries++;
      this.emit({ type: 'discovery', beeId: bee.id, patchId: patch.id });
    }
  }

  private updateBee(bee: Bee, signals: DanceSignal[]): void {
    bee.memory = bee.memory.filter(m => m.expiresAt > this.tick);
    if (bee.state === 'Resting') {
      bee.energy = Math.min(100, bee.energy + 0.8);
      if (--bee.timer > 0) return;
      const action = this.brain.decide(this.observe(bee, signals), bee, () => this.random(bee));
      if (action.type === 'explore') {
        bee.state = 'Searching'; bee.target = null; bee.searchTicks = 0; bee.recruited = false;
        bee.heading = this.random(bee) * Math.PI * 2;
      } else if (action.type === 'visit') {
        bee.target = clone(action.memory); bee.state = 'FlyingToResource'; bee.searchTicks = 0;
      } else if (action.type === 'observe') {
        bee.state = 'ObservingDance'; bee.timer = 12; bee.observedDancer = action.signal.dancerId;
        bee.observedSignal = clone(action.signal);
        this.emit({ type: 'observation', beeId: bee.id, otherBeeId: action.signal.dancerId, patchId: action.signal.patchId });
      } else { bee.timer = 12; this.hivePosition(bee); }
      return;
    }
    if (bee.state === 'ObservingDance') {
      if (--bee.timer > 0) return;
      const signal = bee.observedSignal;
      const probability = signal ? clamp(this.config.behavior.recruitmentStrength * signal.utility * signal.confidence, 0, 0.95) : 0;
      if (this.config.behavior.recruitment && signal && signal.expiresAt > this.tick && this.random(bee) < probability) {
        const noise = this.config.behavior.danceNoise;
        const angle = signal.direction + (this.random(bee) * 2 - 1) * noise * 0.65;
        const d = signal.distance * (1 + (this.random(bee) * 2 - 1) * noise * 0.35);
        const memory: ResourceMemory = { patchId: signal.patchId,
          x: clamp(WORLD.hive.x + Math.cos(angle) * d, 5, WORLD.width - 5),
          y: clamp(WORLD.hive.y + Math.sin(angle) * d, 5, WORLD.height - 5),
          quality: signal.quality, source: 'dance', learnedAt: this.tick,
          expiresAt: this.tick + this.config.behavior.memoryTicks };
        this.remember(bee, memory); bee.target = clone(memory); bee.state = 'FlyingToResource';
        bee.searchTicks = 0; bee.recruited = true; this.counters.recruitments++;
        this.emit({ type: 'recruitment', beeId: bee.id, otherBeeId: signal.dancerId, patchId: signal.patchId, value: probability });
      } else { bee.state = 'Resting'; bee.timer = 10; this.hivePosition(bee); }
      bee.observedSignal = null; return;
    }
    if (bee.state === 'Searching') {
      const observed = this.observe(bee, signals).nearbyResources;
      if (observed.length) { this.discover(bee, observed[0]); return; }
      bee.searchTicks++;
      if (bee.searchTicks > 420) {
        if (bee.target) {
          this.counters.failedVisits++;
          this.emit({ type: 'failedVisit', beeId: bee.id, patchId: bee.target.patchId });
          bee.memory = bee.memory.filter(m => m.patchId !== bee.target?.patchId);
        }
        bee.state = 'Returning'; bee.target = null; return;
      }
      if (bee.searchTicks % 18 === 0) bee.heading += (this.random(bee) - 0.5) * 1.7;
      if (bee.x < 24 || bee.x > WORLD.width - 24 || bee.y < 24 || bee.y > WORLD.height - 24) {
        bee.heading = Math.atan2(WORLD.hive.y - bee.y, WORLD.hive.x - bee.x) + (this.random(bee) - 0.5);
      }
      this.move(bee, { x: clamp(bee.x + Math.cos(bee.heading) * 10, 8, WORLD.width - 8),
        y: clamp(bee.y + Math.sin(bee.heading) * 10, 8, WORLD.height - 8) });
      return;
    }
    if (bee.state === 'FlyingToResource') {
      const resource = this.observe(bee, signals).nearbyResources.find(p => p.id === bee.target?.patchId);
      if (resource) { this.discover(bee, resource); return; }
      if (!bee.target || this.move(bee, bee.target)) { bee.state = 'Searching'; bee.searchTicks = 300; }
      return;
    }
    if (bee.state === 'Foraging') {
      if (--bee.timer > 0) return;
      const patch = this.observe(bee, signals).nearbyResources.find(p => p.id === bee.target?.patchId);
      if (patch) {
        const actual = this.patches.find(p => p.id === patch.id)!;
        bee.cargo = Math.min(1, actual.amount); actual.amount -= bee.cargo;
        bee.cargoPatch = patch.id; bee.cargoQuality = patch.quality;
        if (bee.target) { bee.target.quality = patch.quality; this.remember(bee, bee.target); }
      } else {
        this.counters.failedVisits++;
        this.emit({ type: 'failedVisit', beeId: bee.id, patchId: bee.target?.patchId });
        bee.memory = bee.memory.filter(m => m.patchId !== bee.target?.patchId); bee.target = null;
      }
      bee.state = 'Returning'; return;
    }
    if (bee.state === 'Returning') {
      if (!this.move(bee, WORLD.hive)) return;
      this.hivePosition(bee);
      if (bee.cargo > 0 && bee.cargoPatch) {
        const reward = bee.cargo * bee.cargoQuality;
        this.totalFood += reward; this.deliveredByPatch[bee.cargoPatch] += reward;
        this.recentDeliveries.push({ tick: this.tick, value: reward }); bee.delivered += reward; bee.experience++;
        this.emit({ type: 'delivery', beeId: bee.id, patchId: bee.cargoPatch, value: reward });
        const target = bee.target;
        const utility = target ? reward / (1 + 0.0015 * 2 * distance(WORLD.hive, target)) : 0;
        if (this.config.behavior.recruitment && target && this.random(bee) < clamp(utility * 1.8, 0, 0.9)) {
          const duration = Math.round(70 + 160 * utility);
          const d = distance(WORLD.hive, target);
          const signal: DanceSignal = {
            id: this.nextSignalId++, dancerId: bee.id, position: { x: bee.x, y: bee.y },
            patchId: target.patchId, target: { x: target.x, y: target.y },
            direction: Math.atan2(target.y - WORLD.hive.y, target.x - WORLD.hive.x), distance: d,
            quality: bee.cargoQuality, utility, confidence: 1 - this.config.behavior.danceNoise * 0.4,
            durationCode: d / 250, createdAt: this.tick, expiresAt: this.tick + duration,
          };
          this.signals.push(signal); bee.state = 'Dancing'; bee.timer = duration; this.counters.dances++;
          this.emit({ type: 'dance', beeId: bee.id, patchId: target.patchId, value: utility });
        } else { bee.state = 'Resting'; bee.timer = 20; }
      } else { bee.state = 'Resting'; bee.timer = 25; }
      bee.cargo = 0; bee.cargoPatch = null; return;
    }
    if (bee.state === 'Dancing' && --bee.timer <= 0) { bee.state = 'Resting'; bee.timer = 20; }
  }

  intervene(command: Intervention): void {
    validateIntervention(command, this.tick);
    if (this.interventions.length >= 200) throw new Error('The run has reached its 200 intervention limit. Start a new run.');
    if (command.tick !== this.tick) throw new Error('Intervention tick must match current tick');
    const next = clone(this.config);
    if (command.type === 'behavior') {
      if (command.recruitment !== undefined) next.behavior.recruitment = command.recruitment;
      if (command.danceNoise !== undefined) next.behavior.danceNoise = command.danceNoise;
      if (command.recruitmentStrength !== undefined) next.behavior.recruitmentStrength = command.recruitmentStrength;
    } else {
      const patch = next.patches.find(p => p.id === command.patchId);
      if (!patch) throw new Error('Unknown patch');
      if (command.active !== undefined) patch.active = command.active;
      if (command.quality !== undefined) patch.quality = command.quality;
    }
    validateConfig(next); this.config = next;
    if (command.type === 'patch') {
      const patch = this.patches.find(p => p.id === command.patchId)!;
      if (command.active !== undefined) patch.active = command.active;
      if (command.quality !== undefined) patch.quality = command.quality;
    }
    this.interventions.push(clone(command));
    this.emit({ type: 'intervention', patchId: command.type === 'patch' ? command.patchId : undefined });
  }

  metrics(): Metrics {
    const allocation = { A: 0, B: 0 };
    let activeScouts = 0, activeForagers = 0, insideHive = 0, recruitedForagers = 0;
    for (const bee of this.bees) {
      const inside = ['Resting', 'Dancing', 'ObservingDance'].includes(bee.state);
      if (inside) insideHive++; else if (bee.role === 'Scout') activeScouts++; else activeForagers++;
      if (!inside && bee.target && bee.state !== 'Searching') allocation[bee.target.patchId]++;
      if (!inside && bee.recruited) recruitedForagers++;
    }
    const minutes = Math.min(this.tick, 600) * WORLD.tickSeconds / 60;
    return {
      foodCollected: this.totalFood,
      throughput: minutes ? this.recentDeliveries.reduce((sum, d) => sum + d.value, 0) / minutes : 0,
      firstDiscoveryTick: this.firstDiscovery, activeScouts, activeForagers, insideHive, recruitedForagers,
      allocation, deliveredByPatch: clone(this.deliveredByPatch), ...this.counters,
      travelCost: this.bees.reduce((sum, b) => sum + b.distanceFlown, 0),
    };
  }

  private recordHistory(): void {
    const m = this.metrics(); this.history.push({ tick: this.tick, food: m.foodCollected, throughput: m.throughput,
      a: m.allocation.A, b: m.allocation.B });
    if (this.history.length > 300) this.history.shift();
  }

  snapshot(): WorldSnapshot {
    return clone({ tick: this.tick, config: this.config, hive: WORLD.hive, bees: this.bees, patches: this.patches,
      signals: this.signals, events: this.events, metrics: this.metrics(), history: this.history });
  }

  exportRun(): ExperimentRun {
    if (Object.getPrototypeOf(this.brain) !== RuleBasedBeeBrain.prototype || this.brain.decide !== RuleBasedBeeBrain.prototype.decide) {
      throw new Error('Custom behavior requires its own version and replay factory before export.');
    }
    const run: ExperimentRun = clone({ ...VERSIONS, schemaVersion: 1, lab: 'BEE', species: 'Apis mellifera', seed: this.initial.seed,
      tickCount: this.tick, parameters: this.initial, interventions: this.interventions, metrics: this.metrics() });
    validateRun(run);
    return run;
  }
}
