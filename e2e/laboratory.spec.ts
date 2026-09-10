import { test, expect, type Page } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
import { Simulation } from '../src/simulation/kernel';
import { defaultConfig } from '../src/simulation/config';
import type { ExperimentRun } from '../src/simulation/types';

async function english(page: Page) {
  await page.goto('/'); await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByTestId('tick-count')).toBeVisible();
}
async function pause(page: Page) {
  const button = page.getByRole('button', { name: 'Pause', exact: true });
  if (await button.isVisible()) await button.click();
  await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeVisible();
}
async function loadRun(page: Page, ticks = 3000, population = 160) {
  const config = defaultConfig(); config.population = population;
  const sim = new Simulation(config); sim.stepMany(ticks); const run = sim.exportRun();
  await page.getByLabel('Import run file', { exact: true }).setInputFiles({ name: 'replay.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(run)) });
  await expect(page.getByTestId('tick-count')).toHaveText(`${ticks} tick`);
  await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeVisible();
  return run;
}

test('live worker, pause, exact step and reset', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await english(page); await pause(page);
  await page.getByRole('checkbox', { name: 'Inspect signals & performance', exact: true }).check();
  await page.getByRole('button', { name: '20×', exact: true }).click();
  const tick = Number((await page.getByTestId('tick-count').innerText()).split(' ')[0]);
  await page.getByRole('button', { name: 'Step', exact: true }).click();
  await expect(page.getByTestId('tick-count')).toHaveText(`${tick + 1} tick`);
  await expect(page.getByTestId('worker-timing')).toContainText('ms / 1 paired tick');
  await page.getByRole('button', { name: 'Reset simulation', exact: true }).click();
  await expect(page.getByTestId('tick-count')).toHaveText('0 tick');
  await expect(page.getByTestId('food-collected')).toHaveText('0');
  await expect(page.getByTestId('worker-timing')).toHaveText('Worker timing: awaiting step');
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect.poll(async () => Number((await page.getByTestId('tick-count').innerText()).split(' ')[0])).toBeGreaterThan(0);
  await pause(page); expect(errors).toEqual([]);
});

test('scientific views, private memory and synchronized comparison', async ({ page }, testInfo) => {
  await english(page); const run = await loadRun(page);
  await expect(page.getByTestId('food-collected')).toHaveText(run.metrics.foodCollected.toLocaleString('en-GB', { maximumFractionDigits: 1 }));
  await page.getByRole('button', { name: 'Dance floor', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect a bee', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Private knowledge' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Encoded in this dance' })).toBeVisible();
  await page.getByRole('button', { name: 'Follow bee', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Following bee', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Communication', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Communication', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await mkdir('output/qa', { recursive: true });
  await page.screenshot({ path: `output/qa/${testInfo.project.name}-communication.png`, fullPage: true });
  await page.getByRole('button', { name: 'Close bee inspector' }).click();
  await page.getByRole('button', { name: 'Landscape', exact: true }).click();
  await page.getByRole('button', { name: 'Compare', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(2);
  await expect(page.getByText('Dance OFF · same seed & ticks')).toBeVisible();
  const baseline = defaultConfig(); baseline.behavior.recruitment = false;
  const control = new Simulation(baseline); control.stepMany(run.tickCount);
  await expect(page.locator('.compare-results')).toContainText(`${run.metrics.foodCollected.toFixed(1)} / ${control.metrics().foodCollected.toFixed(1)}`);
});

test('tick-stamped interventions export and replay exactly', async ({ page }) => {
  await english(page); await loadRun(page, 1400);
  await page.getByRole('button', { name: 'Remove source B' }).click();
  await expect(page.getByRole('button', { name: 'Restore source B' })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Dance recruitment', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Dance recruitment', exact: true })).not.toBeChecked();
  await page.getByRole('button', { name: 'Step', exact: true }).click();
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export run', exact: true }).click();
  const download = await downloadPromise; const run: ExperimentRun = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(run.tickCount).toBe(1401); expect(run.interventions).toEqual([
    { tick: 1400, type: 'patch', patchId: 'B', active: false }, { tick: 1400, type: 'behavior', recruitment: false },
  ]);
  await page.getByRole('button', { name: 'Reset simulation', exact: true }).click();
  await expect(page.getByTestId('tick-count')).toHaveText('0 tick');
  await page.getByLabel('Import run file').setInputFiles({ name: 'replay.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(run)) });
  await expect(page.getByTestId('tick-count')).toHaveText('1401 tick');
  await expect(page.getByRole('checkbox', { name: 'Dance recruitment', exact: true })).not.toBeChecked();
  await expect(page.getByTestId('food-collected')).toHaveText(run.metrics.foodCollected.toLocaleString('en-GB', { maximumFractionDigits: 1 }));
  await page.getByRole('button', { name: 'Local history (1)' }).click();
  await expect(page.getByRole('dialog')).toContainText('1401 tick');
  await page.getByRole('button', { name: /BEE-003 · Seed 518394/ }).click();
  await expect(page.getByTestId('tick-count')).toHaveText('1401 tick');
});

test('invalid inputs preserve the current run and prediction starts at tick zero', async ({ page }) => {
  await english(page); await loadRun(page, 1000);
  await page.getByLabel('Seed', { exact: true }).fill('-1'); await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert').filter({ hasText: 'Use an integer' })).toBeVisible(); await expect(page.getByTestId('tick-count')).toHaveText('1000 tick');
  await page.getByLabel('Import run file').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"schemaVersion":999}') });
  await expect(page.locator('.notice[role="status"]')).toContainText('unsupported'); await expect(page.getByTestId('tick-count')).toHaveText('1000 tick');
  await page.getByRole('radio', { name: 'The richer source' }).check();
  await expect(page.getByTestId('tick-count')).toHaveText('0 tick'); await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeVisible();
});

test('four experiments, bilingual evidence and modal keyboard dismissal', async ({ page }) => {
  await english(page); await pause(page);
  await page.getByRole('button', { name: 'Experiments', exact: true }).click();
  await expect(page.locator('.experiment-list button')).toHaveCount(4);
  await page.getByRole('button', { name: /BEE-001/ }).click();
  await expect(page.getByRole('heading', { name: 'It starts with a scout.' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Dance recruitment', exact: true })).not.toBeChecked();
  await page.getByRole('button', { name: 'Field notes', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('link')).toHaveCount(5);
  await expect(page.getByText('Observed biology', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'TR', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Bir keşifle başlar.' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
});

test('rendered layout, source art and accessible touch controls', async ({ page }, testInfo) => {
  await english(page); await loadRun(page, 420);
  const imageResponse = await page.request.get('/art/meadows-paper.png'); expect(imageResponse.ok()).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => undefined))));
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  if (testInfo.project.name === 'mobile') {
    for (const name of ['Run', 'Step', 'Compare', 'Inspect a bee']) {
      const box = await page.getByRole('button', { name, exact: true }).boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  }
  await mkdir('output/qa', { recursive: true });
  await page.screenshot({ path: `output/qa/${testInfo.project.name}-laboratory.png`, fullPage: true });
  await page.getByRole('button', { name: 'TR', exact: true }).click();
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: `output/qa/${testInfo.project.name}-turkish.png`, fullPage: true });
  if (testInfo.project.name === 'mobile') {
    await page.setViewportSize({ width: 320, height: 740 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const item of await page.getByRole('navigation').locator('button, a').all()) {
      expect((await item.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test('reduced motion starts paused, then explicit playback works', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await english(page);
  await expect(page.getByTestId('tick-count')).toHaveText('0 tick');
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect.poll(async () => Number((await page.getByTestId('tick-count').innerText()).split(' ')[0])).toBeGreaterThan(0);
});

test('reduced motion is respected when switching experiments', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await english(page);
  await page.getByRole('button', { name: 'Experiments', exact: true }).click();
  await page.getByRole('button', { name: /BEE-004/ }).click();
  await expect(page.getByRole('heading', { name: 'Explore or follow?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeVisible();
  await expect(page.getByTestId('tick-count')).toHaveText('0 tick');
});

test('seed errors follow language changes and clear on a new experiment', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await english(page);
  await page.getByLabel('Seed', { exact: true }).fill('-1');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.getByLabel('Seed', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'TR', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('tam sayı');
  await page.getByRole('button', { name: 'Deneyler', exact: true }).click();
  await page.getByRole('button', { name: /BEE-001/ }).click();
  await expect(page.getByRole('main').getByRole('alert')).toHaveCount(0);
  await expect(page.getByLabel('Seed', { exact: true })).toHaveAttribute('aria-invalid', 'false');
});

test('all supported scout proportions survive import and editing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await english(page);
  const config = defaultConfig(); config.behavior.scoutRatio = 0.85;
  const run = new Simulation(config).exportRun();
  await page.getByLabel('Import run file').setInputFiles({ name: 'scouts.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(run)) });
  await expect(page.locator('.notice[role="status"]')).toContainText('Recomputed tick 0');
  const slider = page.getByRole('slider', { name: 'Scout proportion', exact: true });
  await expect(slider).toHaveValue('0.85');
  await slider.focus(); await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('0.86');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export run', exact: true }).click();
  const download = await downloadPromise;
  const exported: ExperimentRun = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(exported.parameters.behavior.scoutRatio).toBe(0.86);
});

test('unsupported replay fields preserve the active experiment', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await english(page);
  const run = await loadRun(page, 40);
  await page.getByLabel('Import run file').setInputFiles({ name: 'unsupported.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...run, parameters: { ...run.parameters, wind: 10 } })) });
  await expect(page.locator('.notice[role="status"]')).toContainText('unsupported');
  await expect(page.getByTestId('tick-count')).toHaveText('40 tick');
  await expect(page.getByRole('heading', { name: 'Does better food win?' })).toBeVisible();
});

test('paused canvases do not repeatedly redraw, but camera changes still render', async ({ page }) => {
  await page.addInitScript(() => {
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    Object.assign(window, { beeDraws: 0 });
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      (window as unknown as { beeDraws: number }).beeDraws++;
      return clear.apply(this, args);
    };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' }); await english(page);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500); // Allow image loading and the final paused frame to settle.
  const draws = () => page.evaluate(() => (window as unknown as { beeDraws: number }).beeDraws);
  const before = await draws();
  await page.waitForTimeout(350); // A temporal assertion: no new frames while nothing changes.
  expect(await draws()).toBe(before);
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect.poll(draws).toBeGreaterThan(before);
  await expect(page.getByTestId('tick-count')).toHaveText('0 tick');
});

test('worker startup failure has a usable reset recovery', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    let first = true;
    window.Worker = class extends NativeWorker {
      constructor(url: string | URL, options?: WorkerOptions) {
        if (first) { first = false; throw new Error('Simulated startup failure'); }
        super(url, options);
      }
    };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/'); await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('could not complete');
  await page.getByRole('main').getByRole('alert').getByRole('button', { name: 'Reset experiment', exact: true }).click();
  await expect(page.getByTestId('tick-count')).toHaveText('0 tick');
  await expect(page.getByRole('main').getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Step', exact: true }).click();
  await expect(page.getByTestId('tick-count')).toHaveText('1 tick');
});

test('completed runs explain the limit and can still be exported', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await english(page);
  const config = defaultConfig(); config.population = 10;
  const run = new Simulation(config).exportRun(); run.tickCount = 36000;
  await page.getByLabel('Import run file').setInputFiles({ name: 'completed.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(run)) });
  await expect(page.getByTestId('tick-count')).toHaveText('36000 tick', { timeout: 20000 });
  await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Step', exact: true })).toBeDisabled();
  await expect(page.getByText('Run complete:', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export run', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Reset simulation', exact: true }).click();
  await expect(page.getByTestId('tick-count')).toHaveText('0 tick');
  await expect(page.getByRole('button', { name: 'Step', exact: true })).toBeEnabled();
});

test('reset notices do not resurrect an earlier import when the language changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await english(page);
  await loadRun(page, 25);
  await page.getByRole('button', { name: 'Reset simulation', exact: true }).click();
  await expect(page.getByTestId('tick-count')).toHaveText('0 tick');
  await page.getByRole('button', { name: 'TR', exact: true }).click();
  await expect(page.locator('.notice[role="status"]')).toHaveCount(0);
});
