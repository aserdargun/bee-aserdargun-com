import { describe, expect, it } from 'vitest';
import { terms } from './terms';
import { defaultConfig } from '../simulation/config';
import { Simulation } from '../simulation/kernel';
import { WORLD } from '../simulation/types';

// The glossary teaches this lab by stating concrete facts about the model: the
// seed a reader can reuse, the scout arithmetic, the length of a tick, the
// width of the throughput window and how far the chart reaches. Every one of
// those is a number the code also owns, and none of them was checked against
// it. A default that moved, or a window that was retuned, would leave the
// published copy confidently wrong while every existing test stayed green.
//
// Each assertion therefore reads the number out of the visible copy and compares
// it with the implementation, so editing either side without the other fails.

/** First integer the reader would see in a piece of published copy. */
const firstNumber = (text: string, ...labels: string[]): number => {
  const match = text.match(/-?\d+(?:\.\d+)?/);
  expect(match, `no number found in copy: ${labels.join(' ')}`).not.toBeNull();
  return Number(match![0]);
};

describe('the glossary describes the model that actually runs', () => {
  it('quotes the default seed a reader is told to reuse', () => {
    for (const locale of ['en', 'tr'] as const) {
      const quoted = firstNumber(terms.seed.example[locale], 'seed example');
      expect(quoted, `seed example (${locale})`).toBe(defaultConfig().seed);
    }
  });

  it('reproduces the scout arithmetic it spells out', () => {
    const config = defaultConfig();
    const scouts = Math.round(
      config.population * config.behavior.scoutRatio,
    );
    for (const locale of ['en', 'tr'] as const) {
      // Turkish states the population before the percentage and English after
      // it, so each figure is identified by what it equals rather than by the
      // position it happens to occupy in that language.
      const numbers = terms.scouts.example[locale].match(/\d+/g)!.map(Number);
      expect(new Set(numbers).size, `scouts example (${locale})`).toBe(3);
      expect(numbers, `ratio (${locale})`).toContain(
        Math.round(config.behavior.scoutRatio * 100),
      );
      expect(numbers, `population (${locale})`).toContain(config.population);
      expect(numbers, `rounded scouts (${locale})`).toContain(scouts);
    }
    // And the kernel really does assign that many scouts on a default run.
    expect(
      new Simulation().snapshot().bees.filter((b) => b.role === 'Scout').length,
    ).toBe(scouts);
  });

  it('keeps the tick length and the minute it is measured in', () => {
    for (const locale of ['en', 'tr'] as const) {
      const definition = terms.time.definition[locale];
      // "1 tick = 0.1 model seconds; 600 ticks = 1 model minute."
      const numbers = definition.match(/\d+(?:[.,]\d+)?/g)!.map((n) =>
        Number(n.replace(',', '.')),
      );
      const secondsPerTick = numbers[1];
      const ticksPerMinute = numbers[2];
      expect(secondsPerTick, `tick seconds (${locale})`).toBe(
        WORLD.tickSeconds,
      );
      // A minute is only a minute if the two published figures multiply to 60.
      expect(ticksPerMinute * secondsPerTick, `minute (${locale})`).toBe(60);
    }
  });

  it('measures throughput over the window the copy names', () => {
    for (const locale of ['en', 'tr'] as const) {
      // "the trailing 60 model seconds"
      const windowSeconds = firstNumber(
        terms.throughput.definition[locale],
        'throughput definition',
      );
      // The kernel keeps deliveries in ticks, so the published window has to
      // survive the conversion the reader is not shown.
      expect(windowSeconds / WORLD.tickSeconds).toBe(600);
    }
  });

  it('lets the chart reach as far as the copy says it does', () => {
    // "The chart shows about 600 model seconds of history." The kernel caps the
    // history and samples it on an interval, so the span a reader actually sees
    // is cap x interval x tick length — an emergent product, not a constant
    // anyone wrote down. If the cap, the sampling interval or the tick length
    // moved, this sentence would quietly start lying.
    const chartSeconds = firstNumber(
      terms.throughput.example.en,
      'throughput example',
    );
    const sim = new Simulation();
    sim.stepMany(6200);
    const history = sim.snapshot().history;
    expect(history.length).toBeGreaterThan(1);
    const interval = history[1].tick - history[0].tick;
    const spanSeconds =
      (history[history.length - 1].tick - history[0].tick) * WORLD.tickSeconds;
    // The history is saturated at this point, so it shows its full reach.
    expect(history.length).toBe(300);
    expect(interval).toBeGreaterThan(0);
    expect(spanSeconds).toBeCloseTo(chartSeconds, -2); // within ~10 model seconds
  });
});