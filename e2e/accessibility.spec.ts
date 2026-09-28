/**
 * Automated accessibility coverage for the BEE laboratory, across both
 * languages and both viewports (the config's `desktop` and `mobile` projects).
 *
 * The `color-contrast` expectations currently FAIL on one pre-existing element
 * (`.mechanism-number` in the learning guide, #6e8874 on #faf9f5 = 3.66:1).
 * The rule is not disabled, excluded or threshold-weakened here: correcting it
 * is a colour change in `src/app/education.css`, which is outside this
 * coverage change. Every interaction assertion in these specs passes.
 *
 * BEE's numbers are model outputs of an educational kernel, not biological
 * field measurements; nothing here asserts a measured or predicted quantity.
 */
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function wcagViolations(page: Page) {
  const scan = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  return scan.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target.join(' ')),
  }));
}

async function open(page: Page, locale: 'en' | 'tr') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: locale.toUpperCase(), exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await expect(page.getByTestId('tick-count')).toBeVisible();
}

for (const locale of ['en', 'tr'] as const) {
  test(`${locale} laboratory renders with zero WCAG A/AA violations`, async ({ page }) => {
    await open(page, locale);
    // The simulation canvas carries no text; it needs an accessible name.
    await expect(page.locator('canvas').first()).toHaveAttribute('aria-label', /.+/);
    expect(await wcagViolations(page), `locale ${locale}`).toEqual([]);
  });

  test(`${locale} scientific views stay accessible with a run loaded`, async ({ page }) => {
    await open(page, locale);
    await page.getByRole('button', { name: locale === 'tr' ? 'Dans alanı' : 'Dance floor', exact: true }).click();
    await page.getByRole('button', { name: locale === 'tr' ? 'Karşılaştır' : 'Compare', exact: true }).click();
    await expect(page.locator('canvas')).toHaveCount(2);
    // Both the experimental and control surfaces stay named.
    for (const canvas of await page.locator('canvas').all())
      await expect(canvas).toHaveAttribute('aria-label', /.+/);
    expect(await wcagViolations(page), `locale ${locale} / compare`).toEqual([]);
  });

  test(`${locale} contextual help opens by keyboard and stays accessible`, async ({ page }) => {
    await open(page, locale);
    const help = page.getByRole('button', {
      name: locale === 'tr' ? /hakkında bilgi/ : /^About /,
    }).first();
    await help.focus();
    await expect(help).toBeFocused();
    await page.keyboard.press('Enter');
    const popover = page.locator('.term-popover:popover-open');
    await expect(popover).toHaveCount(1);
    expect(await wcagViolations(page), `locale ${locale} / help`).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(popover).toHaveCount(0);
    await expect(help).toBeFocused();
  });

  test(`${locale} run controls are operable by keyboard alone`, async ({ page }) => {
    await open(page, locale);
    const step = page.getByRole('button', { name: locale === 'tr' ? 'Adım' : 'Step', exact: true });
    await step.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('tick-count')).toHaveText('1 tick');
    const reset = page.getByRole('button', { name: locale === 'tr' ? 'Simülasyonu sıfırla' : 'Reset simulation', exact: true });
    await reset.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('tick-count')).toHaveText('0 tick');
    expect(await wcagViolations(page), `locale ${locale} / controls`).toEqual([]);
  });
}
