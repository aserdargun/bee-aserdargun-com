import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Simulation } from './kernel';
import { defaultConfig } from './config';
import type { WorkerRequest, WorkerResponse } from './protocol';

describe('paired worker transactions', () => {
  let messages: WorkerResponse[];
  let scope: { postMessage: (message: WorkerResponse) => void; onmessage: (event: { data: WorkerRequest }) => void };
  const send = (data: WorkerRequest) => scope.onmessage({ data });
  const latest = () => {
    const response = messages.filter(m => m.type === 'snapshot').at(-1);
    if (!response || response.type !== 'snapshot') throw new Error('No snapshot');
    return response;
  };
  beforeEach(async () => {
    vi.useFakeTimers(); vi.resetModules(); messages = [];
    scope = { postMessage: message => messages.push(message), onmessage: () => {} };
    vi.stubGlobal('self', scope);
    await import('./worker');
    send({ type: 'init', config: defaultConfig(), playing: false });
  });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('steps both colonies exactly and keeps the control recruitment disabled', () => {
    send({ type: 'intervene', command: { type: 'behavior', recruitment: true, danceNoise: 0.5 } });
    send({ type: 'step' });
    const result = latest();
    expect(result.world.tick).toBe(1); expect(result.control.tick).toBe(1);
    expect(result.world.config.behavior.recruitment).toBe(true);
    expect(result.control.config.behavior.recruitment).toBe(false);
    expect(result.control.config.behavior.danceNoise).toBe(0.5);
    expect(result.playing).toBe(false);
  });
  it('replays environmental interventions into both colonies before acknowledging import', () => {
    const sim = new Simulation(); sim.stepMany(30);
    sim.intervene({ tick: 30, type: 'patch', patchId: 'B', active: false }); sim.stepMany(20);
    send({ type: 'import', run: sim.exportRun() });
    expect(latest().world).toEqual(sim.snapshot());
    expect(latest().control.tick).toBe(50);
    expect(latest().control.patches[1].active).toBe(false);
    expect(messages.at(-1)).toEqual({ type: 'imported', tick: 50, config: defaultConfig() });
  });
  it('keeps both colonies intact when an import is rejected', () => {
    send({ type: 'step' }); const before = latest();
    send({ type: 'import', run: { schemaVersion: 999 } });
    expect(messages.at(-1)?.type).toBe('error');
    send({ type: 'play', playing: false });
    expect(latest().world).toEqual(before.world); expect(latest().control).toEqual(before.control);
  });
  it('never schedules more ticks than the replay ceiling', () => {
    const config = defaultConfig(); config.population = 10;
    const run = new Simulation(config).exportRun(); run.tickCount = 35999;
    send({ type: 'import', run }); send({ type: 'speed', speed: 20 }); send({ type: 'play', playing: true });
    vi.advanceTimersByTime(200);
    expect(latest().world.tick).toBe(36000); expect(latest().control.tick).toBe(36000);
    expect(latest().playing).toBe(false);
    send({ type: 'step' }); expect(latest().world.tick).toBe(36000);
    send({ type: 'export' }); expect(messages.at(-1)?.type).toBe('export');
  }, 15000);
});
