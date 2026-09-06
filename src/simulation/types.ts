export type Vec = { x: number; y: number };
export type BeeState = 'Resting' | 'Searching' | 'FlyingToResource' | 'Foraging' | 'Returning' | 'Dancing' | 'ObservingDance';
export type BeeRole = 'Scout' | 'Forager';
export type PatchId = 'A' | 'B';
export interface FoodPatch extends Vec {
  id: PatchId; radius: number; quality: number; amount: number; capacity: number;
  regeneration: number; active: boolean;
}
export interface ResourceMemory extends Vec {
  patchId: PatchId; quality: number; learnedAt: number; expiresAt: number;
  source: 'visit' | 'dance';
}
export interface Bee extends Vec {
  id: number; colonyId: string; heading: number; energy: number; role: BeeRole;
  state: BeeState; memory: ResourceMemory[]; target: ResourceMemory | null;
  timer: number; searchTicks: number; cargo: number; cargoPatch: PatchId | null;
  cargoQuality: number; randomState: number; observedDancer: number | null;
  observedSignal: DanceSignal | null; experience: number; recruited: boolean;
  delivered: number; distanceFlown: number;
}
export interface DanceSignal {
  id: number; dancerId: number; position: Vec; patchId: PatchId; target: Vec;
  direction: number; distance: number; quality: number; utility: number;
  confidence: number; durationCode: number; createdAt: number; expiresAt: number;
}
export type EventType = 'discovery' | 'delivery' | 'dance' | 'observation' | 'recruitment' | 'failedVisit' | 'intervention';
export interface SimulationEvent {
  tick: number; type: EventType; beeId?: number; otherBeeId?: number;
  patchId?: PatchId; value?: number;
}
export interface BehaviorConfig {
  recruitment: boolean; recruitmentStrength: number; danceNoise: number;
  memoryTicks: number; scoutRatio: number;
}
export interface SimulationConfig {
  seed: number; population: number; experimentId: string; behavior: BehaviorConfig;
  patches: FoodPatch[];
}
export type Intervention =
  | { tick: number; type: 'patch'; patchId: PatchId; active?: boolean; quality?: number }
  | { tick: number; type: 'behavior'; recruitment?: boolean; recruitmentStrength?: number; danceNoise?: number };
export interface Metrics {
  foodCollected: number; throughput: number; firstDiscoveryTick: number | null;
  activeScouts: number; activeForagers: number; insideHive: number;
  recruitedForagers: number; recruitments: number; dances: number; discoveries: number;
  allocation: Record<PatchId, number>; deliveredByPatch: Record<PatchId, number>;
  failedVisits: number; travelCost: number;
}
export interface MetricPoint { tick: number; food: number; throughput: number; a: number; b: number }
export interface WorldSnapshot {
  tick: number; config: SimulationConfig; hive: Vec; bees: Bee[]; patches: FoodPatch[];
  signals: DanceSignal[]; events: SimulationEvent[]; metrics: Metrics; history: MetricPoint[];
}
export interface Versions {
  simulationVersion: string; behaviorVersion: string; worldVersion: string;
  metricVersion: string; experimentVersion: string;
}
export interface ExperimentRun extends Versions {
  schemaVersion: 1; species: 'Apis mellifera'; lab: 'BEE';
  seed: number; tickCount: number; parameters: SimulationConfig;
  interventions: Intervention[]; metrics: Metrics;
}
export interface LocalObservation {
  tick: number; nearbyResources: ReadonlyArray<Readonly<FoodPatch>>;
  nearbySignals: ReadonlyArray<Readonly<DanceSignal>>;
}
export type BeeAction = { type: 'explore' } | { type: 'visit'; memory: ResourceMemory } | { type: 'observe'; signal: DanceSignal } | { type: 'wait' };
export interface BeeBrain {
  decide(observation: LocalObservation, bee: Readonly<Bee>, random: () => number): BeeAction;
}
export const VERSIONS: Versions = {
  simulationVersion: '0.1.0', behaviorVersion: '0.1.0', worldVersion: '0.1.0',
  metricVersion: '0.1.0', experimentVersion: '0.1.0',
};
export const WORLD = { width: 1000, height: 680, hive: { x: 470, y: 340 }, hiveRadius: 34,
  sensorRadius: 28, contactRadius: 30, speed: 3.2, tickSeconds: 0.1 } as const;
