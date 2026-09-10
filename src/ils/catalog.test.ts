import { expect, it } from 'vitest';
import { validateCatalog } from '@aserdargun/lab-core';
import { manifest, experiments, guidedLessons, initialRoute } from './catalog';
import concepts from './concepts.json';
import { experiments as native, experimentConfig } from '../experiments/catalog';
import { lessons } from '../education/lessons';
it('maps all authored experiments and bilingual lesson steps without changing their semantics', () => {
  expect(validateCatalog(manifest, experiments, guidedLessons, concepts.map(c => c.id))).toEqual([]);
  expect(experiments.map(e => e.config?.nativeExperimentId)).toEqual(native.map(e => e.id));
  for (const [i, e] of native.entries()) {
    expect(experiments[i].config?.experimentVersion).toBe(e.version);
    expect(experiments[i].guidingQuestion).toEqual(e.question);
    expect(guidedLessons[i].steps.map(s => s.explanation)).toEqual(lessons[e.id].steps.map(s => s.body));
    expect(initialRoute(manifest.experiments[i].route!.replace('/', '')).config).toEqual(experimentConfig(e.id));
    expect(initialRoute(manifest.lessons![i].route!.replace('/', '').split('#')[0]).config).toEqual(experimentConfig(e.id));
  }
  expect(manifest.evidence.find(e => e.id === 'metrics')?.calculatedFrom).toEqual(['world']);
});
it('ignores unsupported context and unsafe route values while preserving default configuration', () => {
  expect(initialRoute('?experiment=constructor&lesson=__proto__&ils=bad').config).toEqual(experimentConfig('BEE-003'));
  expect(initialRoute('?experiment=bee-001&lang=en').config.behavior.recruitment).toBe(false);
  expect(initialRoute('?experiment=bee-001&lesson=bee-004-guide&lang=tr')).toEqual({config: experimentConfig('BEE-004'), locale: 'tr'});
});
