import { parseManifest, type ExperimentDefinition, type LessonDefinition } from '@aserdargun/lab-core';
import raw from '../../lab.manifest.json';
import rawExperiments from './experiments.json';
import { experiments as nativeExperiments, experimentConfig } from '../experiments/catalog';
import { lessons } from '../education/lessons';
export const manifest = parseManifest(raw);
export const experiments = rawExperiments as ExperimentDefinition<{ nativeExperimentId: string; experimentVersion: string }>[];
export const guidedLessons: LessonDefinition[] = manifest.lessons!.map((ref, i) => ({
  schemaVersion: '0.1', id: ref.id, title: ref.title, concepts: manifest.concepts,
  steps: lessons[nativeExperiments[i].id].steps.map((step, j) => ({
    id: `step-${j + 1}`, title: step.title, explanation: step.body,
    experimentId: experiments[i].id, completion: { kind: 'manual' },
  })),
}));
export function initialRoute(search: string) {
  const p = new URLSearchParams(search);
  const lesson = guidedLessons.find(l => l.id === p.get('lesson'));
  const experiment = experiments.find(e => e.id === (lesson?.steps[0].experimentId ?? p.get('experiment')));
  return {
    config: experimentConfig(experiment?.config?.nativeExperimentId ?? 'BEE-003'),
    locale: p.get('lang') === 'tr' ? 'tr' as const : p.get('lang') === 'en' ? 'en' as const : undefined,
  };
}
