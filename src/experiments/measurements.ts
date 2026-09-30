import batch from '../../docs/validation/batch-results.json';
import type { Localized } from './catalog';

/**
 * The measured batch is imported from `docs/validation/batch-results.json`, the
 * artifact `npm run experiment:batch` writes at delivery time. Nothing here is
 * transcribed by hand: the table on the site is the recorded file.
 *
 * Every row is a headless *model* run. `elapsedMs` is a wall-clock timing of
 * one machine, so it is shown as a machine-dependent reading and never as a
 * result. The seeded outcome columns (food, allocation, recruitments, first
 * discovery) are reproducible in the same model and runtime.
 */
export interface BatchRow {
  seed: number; recruitment: boolean; ticks: number; food: number;
  allocation: Record<string, number>; recruitments: number;
  firstDiscoveryTick: number; elapsedMs: number;
}
interface BatchResult {
  versions: Record<string, string>; runtime: string; units: string;
  rows: BatchRow[];
  performance: { population: number; ticks: number; elapsedMs: number; msPerTick: number }[];
}
const result = batch as BatchResult;

/** Headless runs, one row per seed and per dance condition, in file order. */
export const measuredRows: BatchRow[] = result.rows;
export const measuredVersions = result.versions;
export const measuredRuntime = result.runtime;
export const measuredUnits = result.units;

/** The five seeds, taken from the recorded rows rather than declared again. */
export const measuredSeeds: number[] = [...new Set(measuredRows.map(row => row.seed))];

/** Dance-on and dance-off rows for one seed, so a pair is never read across. */
export function pairForSeed(seed: number) {
  const rows = measuredRows.filter(row => row.seed === seed);
  return { seed, dance: rows.find(row => row.recruitment), control: rows.find(row => !row.recruitment) };
}
export const measuredPairs = measuredSeeds.map(pairForSeed);

export const measuredNote: Localized = {
  tr: 'Bu sayılar gerçek kovan ölçümü değildir. Başsız model koşularının kaydedilmiş çıktısıdır: aynı seed, aynı model ve aynı çalışma ortamında tekrarlanır. Süreler tek bir makinenin duvar saati ölçümüdür ve başka bir makinede farklı çıkar; model sonucu değildir.',
  en: 'These numbers are not real-hive measurements. They are recorded output from headless model runs: the same seed reproduces in the same model and runtime. Durations are one machine’s wall-clock reading and differ elsewhere; they are not a result.',
};

export const measuredSeedPinned: Localized = {
  tr: 'Seed’e sabitlenmiş çıktı',
  en: 'Seed-pinned output',
};
export const measuredMachineNote: Localized = {
  tr: 'Süreler makineye bağlıdır; seed’li model sonuçları tekrarlanabilir.',
  en: 'Durations depend on the machine; seeded model results are reproducible.',
};
