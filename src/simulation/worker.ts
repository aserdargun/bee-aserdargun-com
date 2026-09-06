/// <reference lib="webworker" />
import { Simulation } from './kernel';
import { defaultConfig } from './config';
import { replayRun } from './run';
import { validateRun } from './validation';
import type { Intervention } from './types';
import type { WorkerRequest, WorkerResponse } from './protocol';

const scope = self as unknown as DedicatedWorkerGlobalScope;
let main = new Simulation(), control = new Simulation({ ...defaultConfig(), behavior: { ...defaultConfig().behavior, recruitment: false } });
let playing = false, speed: 1 | 5 | 20 = 5, workerMs = 0, workerTicks = 0;
const send = (message: WorkerResponse) => scope.postMessage(message);
const publish = () => send({ type: 'snapshot', world: main.snapshot(), control: control.snapshot(), playing, workerMs, workerTicks });
const controlCommand = (c: Intervention): Intervention => c.type === 'behavior' ? { ...c, recruitment: false } : c;
const advance = (ticks: number) => {
  const start = performance.now(); main.stepMany(ticks); control.stepMany(ticks);
  workerMs = performance.now() - start; workerTicks = ticks;
};

scope.onmessage = ({ data }: MessageEvent<WorkerRequest>) => {
  try {
    switch (data.type) {
      case 'init': {
        const next = new Simulation(data.config);
        const nextControl = new Simulation({ ...data.config, behavior: { ...data.config.behavior, recruitment: false } });
        main = next; control = nextControl; playing = data.playing; workerMs = 0; workerTicks = 0; publish(); break;
      }
      case 'play': playing = data.playing; publish(); break;
      case 'speed': if (![1, 5, 20].includes(data.speed)) throw new Error('Unsupported speed'); speed = data.speed; break;
      case 'step': playing = false; if (main.tickCount < 36000) advance(1); publish(); break;
      case 'intervene': {
        const tick = main.tickCount;
        const command = { ...data.command, tick } as Intervention;
        main.intervene(command); control.intervene(controlCommand(command)); publish(); break;
      }
      case 'export': send({ type: 'export', run: main.exportRun() }); break;
      case 'import': {
        validateRun(data.run);
        const next = replayRun(data.run);
        const controlRun = structuredClone(data.run);
        controlRun.parameters.behavior.recruitment = false;
        controlRun.interventions = controlRun.interventions.map(controlCommand);
        const nextControl = replayRun(controlRun);
        main = next; control = nextControl; playing = false; workerMs = 0; workerTicks = 0; publish(); send({ type: 'imported', tick: main.tickCount }); break;
      }
    }
  } catch (error) { send({ type: 'error', message: error instanceof Error ? error.message : 'Worker failure' }); }
};

// Completed fixed ticks define model time. Rendering and wall-clock delays never enter the kernel.
setInterval(() => {
  if (!playing) return;
  if (main.tickCount >= 36000) { playing = false; publish(); return; }
  const ticks = Math.min(speed, 36000 - main.tickCount);
  advance(ticks); publish();
}, 100);
