'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { defaultConfig } from '../simulation/config';
import type { ExperimentRun, SimulationConfig, WorldSnapshot } from '../simulation/types';
import type { WorkerRequest, WorkerResponse } from '../simulation/protocol';

export function useLaboratory() {
  const workerRef = useRef<Worker | null>(null);
  const [world, setWorld] = useState<WorldSnapshot | null>(null), [control, setControl] = useState<WorldSnapshot | null>(null);
  const [playing, setPlaying] = useState(true), [speed, setSpeed] = useState<1 | 5 | 20>(5);
  const [workerMs, setWorkerMs] = useState(0), [error, setError] = useState('');
  const [workerTicks, setWorkerTicks] = useState(0);
  const [exportedRun, setExportedRun] = useState<ExperimentRun | null>(null);
  const [imported, setImported] = useState<{ tick: number } | null>(null);
  useEffect(() => {
    const worker = new Worker(new URL('../simulation/worker.ts', import.meta.url)); workerRef.current = worker;
    worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      if (data.type === 'snapshot') { setWorld(data.world); setControl(data.control); setPlaying(data.playing); setWorkerMs(data.workerMs); setWorkerTicks(data.workerTicks); }
      if (data.type === 'export') setExportedRun(data.run);
      if (data.type === 'imported') setImported({ tick: data.tick });
      if (data.type === 'error') setError(data.message);
    };
    worker.onerror = () => setError('The simulation worker could not start.');
    worker.postMessage({ type: 'init', config: defaultConfig(), playing: !window.matchMedia('(prefers-reduced-motion: reduce)').matches } satisfies WorkerRequest);
    return () => { worker.terminate(); workerRef.current = null; };
  }, []);
  const send = useCallback((message: WorkerRequest) => { setError(''); workerRef.current?.postMessage(message); }, []);
  const reset = useCallback((config: SimulationConfig, run = false) => send({ type: 'init', config, playing: run }), [send]);
  const changeSpeed = (value: 1 | 5 | 20) => { setSpeed(value); send({ type: 'speed', speed: value }); };
  return { world, control, playing, speed, workerMs, workerTicks, error, setError, exportedRun, imported, clearExport: () => setExportedRun(null), send, reset, changeSpeed };
}
