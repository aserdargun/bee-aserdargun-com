import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function startPaused(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByTestId('tick-count')).toHaveText('0 tick');
}

test('contextual help supports keyboard, dismissal and translation without changing a run', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await startPaused(page);
  await page.getByRole('button', { name: 'Adım', exact: true }).click();
  const seedHelp = page.getByRole('button', { name: 'Seed · rastgelelik tohumu hakkında bilgi', exact: true });
  await seedHelp.focus(); await page.keyboard.press('Enter');
  const seedNote = page.getByRole('note', { name: 'Seed · rastgelelik tohumu', exact: true });
  await expect(seedNote).toBeVisible();
  await expect(seedNote).toContainText('518394');
  const box = await seedNote.boundingBox();
  const viewport = page.viewportSize()!;
  expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
  await page.keyboard.press('Escape');
  await expect(seedNote).not.toBeVisible(); await expect(seedHelp).toBeFocused();
  await expect(page.getByTestId('tick-count')).toHaveText('1 tick');

  await page.getByRole('button', { name: 'Dansla katılım hakkında bilgi', exact: true }).click();
  await expect(page.getByRole('note', { name: 'Dansla katılım', exact: true })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Dansla katılım', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'İletişim gürültüsü hakkında bilgi', exact: true }).click();
  await expect(page.locator('.term-popover:popover-open')).toHaveCount(1);
  await expect(page.getByRole('note')).toContainText('%100');
  await page.getByRole('button', { name: 'Bilgi kutusunu kapat', exact: true }).click();
  await expect(page.locator('.term-popover:popover-open')).toHaveCount(0);

  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await page.getByRole('button', { name: 'About resource allocation', exact: true }).click();
  await expect(page.getByRole('note', { name: 'Resource allocation', exact: true })).toContainText('70%');
  await page.getByRole('heading', { name: 'The colony', exact: true }).click();
  await expect(page.locator('.term-popover:popover-open')).toHaveCount(0);
  await expect(page.getByTestId('tick-count')).toHaveText('1 tick');

  const downloadReady = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export run', exact: true }).click();
  const download = await downloadReady;
  const run = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(run.tickCount).toBe(1); expect(run.interventions).toEqual([]);
  expect(run.parameters.behavior.recruitment).toBe(true); expect(run.seed).toBe(518394);
  expect(errors).toEqual([]);
});

test('the learning guide teaches the current experiment and keeps quiz answers separate from predictions', async ({ page }) => {
  await startPaused(page);
  await page.getByRole('radio', { name: 'Zengin kaynak öne çıkar', exact: true }).check();
  await page.getByRole('link', { name: 'Öğrenme rehberi', exact: true }).click();
  await expect(page).toHaveURL(/#learning-guide$/);
  await expect(page.getByRole('heading', { name: 'Bir arıdan koloniye.', exact: true })).toBeVisible();
  await expect(page.locator('.experiment-instructions li')).toHaveCount(3);
  const check = page.getByRole('region', { name: 'Kendinizi sınayın', exact: true });
  await check.getByRole('radio', { name: 'Kolonideki bütün arıların %70’i B’dedir.', exact: true }).check();
  await expect(check.getByRole('status')).toContainText('Modelin kuralını yeniden düşünün.');
  await check.getByRole('radio', { name: 'Kaynağa yönelik seferlerin %70’i B’ye bağlıdır.', exact: true }).check();
  await expect(check.getByRole('status')).toContainText('Doğru. Nedeni şu:');
  await expect(page.getByRole('radio', { name: 'Zengin kaynak öne çıkar', exact: true })).toBeChecked();
  await expect(page.getByTestId('tick-count')).toHaveText('0 tick');

  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Check your understanding', exact: true }).getByRole('status')).toContainText('That’s right.');
  for (const [id, heading, question] of [
    ['BEE-001', 'A scout finds food', 'A scout found A.'],
    ['BEE-002', 'The waggle dance', 'A dance has started.'],
    ['BEE-004', 'Exploration vs recruitment', 'What happens to the bees’ knowledge'],
    ['BEE-003', 'Better food wins', 'Resource allocation shows B'],
  ]) {
    await page.getByRole('button', { name: 'Experiments', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: new RegExp(id) }).click();
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await expect(page.locator('.experiment-lesson')).toContainText(id);
    await expect(page.locator('.experiment-lesson').getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(page.locator('.knowledge-check legend')).toContainText(question);
    await expect(page.locator('.knowledge-check input:checked')).toHaveCount(0);
    await expect(page.locator('.check-feedback')).toHaveCount(0);
  }
});

test('the glossary searches both languages, handles no matches and fits touch screens', async ({ page }, testInfo) => {
  await startPaused(page);
  await page.getByRole('link', { name: 'Öğrenme rehberi', exact: true }).click();
  await page.locator('.glossary summary').click();
  await page.getByRole('searchbox', { name: 'Terim ara', exact: true }).fill('seed');
  await expect(page.locator('.glossary-grid')).toContainText('Seed · rastgelelik tohumu');
  await page.getByRole('searchbox', { name: 'Terim ara', exact: true }).fill('olmayan-terim-xyz');
  await expect(page.getByText('Eşleşen terim yok.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Aramayı temizle', exact: true }).click();
  await expect(page.locator('.glossary-count')).toHaveText('27 terimden 27 tanesi');
  await page.getByRole('searchbox', { name: 'Terim ara', exact: true }).fill('Enerji göstergesi');
  await expect(page.locator('.glossary-grid > div')).toHaveCount(1);
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('.glossary-grid dt')).toHaveText('Energy proxy');
  await expect(page.locator('.glossary-grid')).toContainText('does not constrain flight or decisions');
  await page.getByRole('searchbox', { name: 'Search terms', exact: true }).fill('duration code');
  await expect(page.locator('.glossary-grid')).toContainText('not calibrated from real waggle dances');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (testInfo.project.name === 'mobile') {
    const helpButtons = page.locator('.term-help-trigger');
    for (const button of await helpButtons.all()) {
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44); expect(box!.width).toBeGreaterThanOrEqual(44);
    }
  }
});
