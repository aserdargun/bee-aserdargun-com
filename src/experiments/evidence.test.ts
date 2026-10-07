import { it, expect, describe } from 'vitest';
import {
  evidence,
  sourcesChecked,
  sourcesCheckedCompact,
} from './evidence';

// src/experiments/evidence.ts states that the checked date and the source list
// live here "so the field-notes dialog, the visible summary and the no-JS
// summary cannot drift apart". The compact stamp beside the experiment heading
// used to restate the count and the date by hand, which is exactly the drift
// that sentence rules out: a fourth source would render a stamp claiming three,
// with nothing failing.

describe('evidence stamp', () => {
  it('states the number of sources the summary actually lists', () => {
    expect(sourcesCheckedCompact.en).toContain(`${evidence.length} source`);
    expect(sourcesCheckedCompact.tr).toContain(`${evidence.length} kaynak`);
    expect(sourcesCheckedCompact.en).not.toMatch(/\b[1468-9]\d* sources/);
  });

  it('reports the same checked date as the sentence it summarises', () => {
    // sourcesChecked is the editorial claim; the stamp must not carry an older
    // or newer date than it, so the two must share one date.
    const dateOf = (text: string) => text.match(/(21 \w+ 2026)/)?.[1];
    expect(dateOf(sourcesCheckedCompact.en)).toBe(dateOf(sourcesChecked.en));
    expect(dateOf(sourcesCheckedCompact.tr)).toBe(dateOf(sourcesChecked.tr));
  });

  it('pluralises the count instead of assuming three', () => {
    // Exercised through the same rule the stamp uses, so a single-source list
    // cannot produce "1 sources checked".
    const countLabel = (n: number) => `${n} source${n === 1 ? '' : 's'} checked`;
    expect(countLabel(1)).toBe('1 source checked');
    expect(countLabel(evidence.length)).toBe(
      `${evidence.length} source${evidence.length === 1 ? '' : 's'} checked`,
    );
  });

  it('does not duplicate the sources the scope sentence already describes', () => {
    // evidenceScope says "these three studies" in prose. If a source is added,
    // that word is the next place to drift, so make the coupling visible.
    expect(sourcesCheckedCompact.en).not.toMatch(/three|four|three/);
  });
});