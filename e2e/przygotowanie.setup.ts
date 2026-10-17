import { test as setup } from '@playwright/test';

/**
 * Wzorzec "zaloguj się raz": krok wykonywany przed wszystkimi testami, który zapisuje stan przeglądarki
 * (ciasteczka + localStorage) do pliku. Testy startują z tym stanem (storageState w playwright.config.ts).
 * Przy SSO w tym miejscu jest logowanie przez stronę dostawcy tożsamości: e2e/przyklady/sso.setup.example.ts.
 * U nas zamiast logowania ustawiamy krótkie opóźnienie fake backendu, żeby testy szły szybciej.
 */
setup('ustaw szybki fake backend', async ({ page }) => {
  for (const origin of ['http://localhost:4200', 'http://localhost:4201']) {
    await page.goto(origin + '/tickets');
    await page.evaluate(() => localStorage.setItem('fb.latency', '50'));
  }
  await page.context().storageState({ path: 'e2e/.auth/stan.json' });
});
