'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { defaultConfig } from '../simulation/config';
import type { ExperimentRun, SimulationConfig, WorldSnapshot } from '../simulation/types';
import type { WorkerRequest, WorkerResponse } from '../simulation/protocol';

export function useLaboratory() {
  const workerRef = useRef<Worker | null>(null);
  const failedRef = useRef(false);
  const initialRef = useRef<{ config: SimulationConfig; playing: boolean } | null>(null);
  const [generation, setGeneration] = useState(0);
  const [world, setWorld] = useState<WorldSnapshot | null>(null), [control, setControl] = useState<WorldSnapshot | null>(null);
  const [playing, setPlaying] = useState(true), [speed, setSpeed] = useState<1 | 5 | 20>(5);
  const [workerMs, setWorkerMs] = useState(0), [error, setError] = useState('');
  const [workerTicks, setWorkerTicks] = useState(0);
  const [exportedRun, setExportedRun] = useState<ExperimentRun | null>(null);
  const [imported, setImported] = useState<{ tick: number; config: SimulationConfig } | null>(null);
  const importingRef = useRef(false);
  const [importing, setImporting] = useState(false);
  useEffect(() => {
    const fail = () => {
      failedRef.current = true; importingRef.current = false; setImporting(false); setPlaying(false);
      setError('The simulation worker could not start.');
    };
    let worker: Worker;
    try { worker = new Worker(new URL('../simulation/worker.ts', import.meta.url)); }
    catch { fail(); return; }
    failedRef.current = false; workerRef.current = worker;
    worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      if (data.type === 'snapshot') { setWorld(data.world); setControl(data.control); setPlaying(data.playing); setWorkerMs(data.workerMs); setWorkerTicks(data.workerTicks); }
      if (data.type === 'export') setExportedRun(data.run);
      if (data.type === 'imported') { importingRef.current = false; setImporting(false); setImported({ tick: data.tick, config: data.config }); }
      if (data.type === 'error') { importingRef.current = false; setImporting(false); setError(data.message); }
    };
    worker.onerror = fail;
    worker.postMessage({ type: 'init', ...(initialRef.current ?? { config: defaultConfig(), playing: !window.matchMedia('(prefers-reduced-motion: reduce)').matches }) } satisfies WorkerRequest);
    return () => { worker.terminate(); workerRef.current = null; };
  }, [generation]);
  const send = useCallback((message: WorkerRequest) => {
    if (importingRef.current || !workerRef.current) return;
    setError('');
    if (message.type === 'import') { importingRef.current = true; setImporting(true); }
    workerRef.current.postMessage(message);
  }, []);
  const clearExport = useCallback(() => setExportedRun(null), []);
  const reset = useCallback((config: SimulationConfig, run = false) => {
    if (failedRef.current) {
      initialRef.current = { config, playing: run }; setSpeed(5); setError(''); setGeneration(current => current + 1);
    } else send({ type: 'init', config, playing: run });
  }, [send]);
  const changeSpeed = (value: 1 | 5 | 20) => { setSpeed(value); send({ type: 'speed', speed: value }); };
  return { world, control, playing, speed, workerMs, workerTicks, error, setError, exportedRun, imported, importing, clearExport, send, reset, changeSpeed };
}
