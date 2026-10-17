import { defineConfig, devices } from '@playwright/test';

/**
 * Testy E2E dla obu aplikacji. Te same scenariusze przechodzą na legacy i na modern:
 * testujemy zachowanie, nie kod, więc migracja nie powinna ich zmieniać.
 *
 *   npx playwright install chromium   (raz, pobiera przeglądarkę)
 *   npm run e2e                        (wszystko)
 *   npm run e2e -- --project=modern    (jedna aplikacja)
 *   npm run e2e:ui                     (tryb podglądu z osią czasu)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env['CI'] ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    // "Zaloguj się raz, zapisz stan": tu tylko ustawiamy szybki fake backend w localStorage,
    // ale mechanizm (storageState) jest ten sam, którego używa się przy SSO. Zobacz e2e/przyklady/.
    { name: 'przygotowanie', testMatch: /przygotowanie\.setup\.ts/ },
    {
      name: 'legacy',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4200', storageState: 'e2e/.auth/stan.json' },
      dependencies: ['przygotowanie'],
    },
    {
      name: 'modern',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4201', storageState: 'e2e/.auth/stan.json' },
      dependencies: ['przygotowanie'],
    },
  ],
  // Playwright sam uruchomi aplikacje; jeśli już działają (npm run legacy / modern), użyje istniejących.
  webServer: [
    { command: 'npx ng serve legacy --port 4200', url: 'http://localhost:4200', reuseExistingServer: true, timeout: 180_000 },
    { command: 'npx ng serve modern --port 4201', url: 'http://localhost:4201', reuseExistingServer: true, timeout: 180_000 },
  ],
});
