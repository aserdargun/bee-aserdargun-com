import { defineConfig } from '@playwright/test';
const productionURL = process.env.BEE_BASE_URL;
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, timeout: 30000,
  expect: { timeout: 10000 }, reporter: 'list',
  use: { baseURL: productionURL || 'http://127.0.0.1:4017', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1536, height: 1024 } } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: productionURL ? undefined : { command: 'npm run preview', url: 'http://127.0.0.1:4017', reuseExistingServer: false, timeout: 15000 },
});
