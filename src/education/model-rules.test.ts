import { describe, expect, it } from 'vitest';
import { MODEL, WORLD } from '../simulation/types';
import { defaultConfig } from '../simulation/config';
import {
  communicationNote,
  educationalSimplification,
  modelRules,
  reproducibilityNote,
} from './model-rules';
import { terms } from './terms';

/**
 * The field notes and the glossary publish the model's own constants: the
 * throughput window, the journal limit, the duration code, the utility
 * formula, the recruitment ceiling, the sensor margin and the run limits.
 *
 * Each of those used to be a literal in the implementation and a second,
 * hand-written literal in the prose that states it, so a retune of the model
 * would leave the published rules describing a model that no longer exists —
 * with the suite still green. The constants are named in `MODEL` now, and
 * every number the published copy states is asserted against them here.
 *
 * The assertions read the number out of the copy rather than restating it, so
 * editing either side without the other fails.
 */

/**
 * Every number a piece of published copy states, in the order it states them.
 *
 * The two languages separate and group numbers differently: English writes
 * 36,000 and 0.1, Turkish writes 36.000 and 0,1. Each locale is therefore
 * parsed with its own separators, so "36.000" is thirty-six thousand in
 * Turkish and not thirty-six.
 */
const numbers = (text: string, locale: 'en' | 'tr'): number[] =>
  (text.match(/\d+(?:[.,]\d+)*/g) ?? []).map((raw) =>
    Number(locale === 'tr' ? raw.replace(/\./g, '').replace(',', '.') : raw.replace(/,/g, '')),
  );

/**
 * The published copy of one rule, in one language.
 *
 * The formula is not localised — it is the same mathematics in both
 * languages — so it is parsed with the English separators.
 */
const rule = (id: string, locale: 'en' | 'tr') => {
  const found = modelRules.find((r) => r.id === id);
  if (!found) throw new Error(`Unknown rule: ${id}`);
  return {
    prose: [found.definition?.[locale] ?? '', found.note?.[locale] ?? ''].join(' '),
    formula: found.formula ?? '',
  };
};

/** The numbers a formula states. A formula always writes a decimal point. */
const formulaNumbers = (formula: string): number[] =>
  (formula.match(/\d+(?:\.\d+)*/g) ?? []).map(Number);

describe('the published rules describe the model that actually runs', () => {
  it('states the throughput window the kernel measures over', () => {
    for (const locale of ['en', 'tr'] as const) {
      const published = numbers(rule('throughput', locale).prose, locale);
      // "the last 600 ticks" and "up to 1 min".
      expect(published[0], `throughput window (${locale})`).toBe(MODEL.throughputWindowTicks);
      expect(published[1], `throughput cap in minutes (${locale})`).toBe(
        MODEL.throughputWindowTicks * WORLD.tickSeconds / 60,
      );
    }
  });

  it('states the utility formula the kernel computes', () => {
    const published = formulaNumbers(rule('utility', 'en').formula);
    // "reward / (1 + 0.0015 × 2 × distance)".
    expect(published).toContain(MODEL.utilityDistanceDiscount);
    expect(published).toContain(2);
  });

  it('states the recruitment ceiling the kernel clamps to', () => {
    const published = formulaNumbers(rule('recruitment-probability', 'en').formula);
    // "min(0.95, strength × utility × confidence)".
    expect(published[0], 'recruitment ceiling').toBe(MODEL.recruitmentProbabilityCap);
  });

  it('states the run and import limits the laboratory enforces', () => {
    for (const locale of ['en', 'tr'] as const) {
      const published = numbers(reproducibilityNote[locale], locale);
      // "Tick limits: 36,000; imports: 2 MB, 200 interventions and 36 million
      // agent-ticks." The last one is stated in millions in both languages.
      expect(published[0], `tick limit (${locale})`).toBe(MODEL.maxTicks);
      expect(published[1], `import size (${locale})`).toBe(MODEL.maxImportBytes / 1_000_000);
      expect(published[2], `intervention limit (${locale})`).toBe(MODEL.maxInterventions);
      expect(published[3], `agent-tick limit (${locale})`).toBe(MODEL.maxAgentTicks / 1_000_000);
    }
  });

  it('states the journal, communication and sensor margins the views use', () => {
    for (const locale of ['en', 'tr'] as const) {
      const published = numbers(communicationNote[locale], locale);
      // "up to 30 model seconds ... journal limited to 250 events ... a 28-unit
      // sensor margin". Turkish states the journal first, so each figure is
      // identified by what it equals rather than by its position.
      expect(published, `communication note (${locale})`).toContain(
        MODEL.communicationHistoryTicks * WORLD.tickSeconds,
      );
      expect(published, `communication note (${locale})`).toContain(MODEL.eventJournalLimit);
      expect(published, `communication note (${locale})`).toContain(WORLD.sensorRadius);
    }
  });

  it('states the tick length the model runs on', () => {
    for (const locale of ['en', 'tr'] as const) {
      const published = numbers(educationalSimplification[locale], locale);
      expect(published[0], `tick length (${locale})`).toBe(WORLD.tickSeconds);
    }
  });
});

describe('the glossary states the same model the field notes do', () => {
  it('quotes the source qualities the default configuration carries', () => {
    const config = defaultConfig();
    for (const locale of ['en', 'tr'] as const) {
      const published = numbers(terms.quality.example[locale], locale);
      // "Default source A has quality 0.46; B has 0.95."
      expect(published, `quality example (${locale})`).toHaveLength(2);
      expect(published[0], `source A quality (${locale})`).toBe(config.patches[0].quality);
      expect(published[1], `source B quality (${locale})`).toBe(config.patches[1].quality);
    }
  });

  it('quotes the memory lifetime the default configuration carries', () => {
    const config = defaultConfig();
    for (const locale of ['en', 'tr'] as const) {
      const published = numbers(terms.memory.example[locale], locale);
      // "the default lifetime is 140 model seconds."
      expect(published, `memory example (${locale})`).toContain(
        config.behavior.memoryTicks * WORLD.tickSeconds,
      );
    }
  });

  it('quotes the duration code divisor the kernel uses', () => {
    for (const locale of ['en', 'tr'] as const) {
      const published = numbers(terms.duration.example[locale], locale);
      // "A distance of 250 u gives a 1-model-second code."
      expect(published[0], `duration divisor (${locale})`).toBe(MODEL.durationCodeDivisor);
      expect(published[1], `duration code scale (${locale})`).toBe(1);
    }
  });

  it('quotes the utility coefficient the kernel uses', () => {
    for (const locale of ['en', 'tr'] as const) {
      const published = numbers(terms.utility.definition[locale], locale);
      // "reward ÷ (1 + 0.003 × distance)" — the published coefficient is the
      // per-way discount counted for the round trip.
      expect(published, `utility coefficient (${locale})`).toContain(
        MODEL.utilityDistanceDiscount * 2,
      );
    }
  });

  it('quotes the communication window the view draws', () => {
    for (const locale of ['en', 'tr'] as const) {
      const published = numbers(terms.communication.example[locale], locale);
      // "at most 300 ticks (30 model seconds)".
      expect(published[0], `communication ticks (${locale})`).toBe(MODEL.communicationHistoryTicks);
      expect(published[1], `communication seconds (${locale})`).toBe(
        MODEL.communicationHistoryTicks * WORLD.tickSeconds,
      );
    }
  });
});
