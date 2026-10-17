/**
 * PRZYKŁAD (nie jest uruchamiany: nazwa nie pasuje do testMatch). Logowanie przez SSO (Entra ID / MSAL) raz,
 * zapis stanu i użycie go we wszystkich testach. Szczegóły i pułapki: docs/E2E.md, sekcja SSO.
 *
 * W playwright.config.ts:
 *   { name: 'sso', testMatch: /sso\.setup\.ts/ },
 *   { name: 'app', use: { storageState: 'e2e/.auth/user.json' }, dependencies: ['sso'] },
 */
import { test as setup, expect } from '@playwright/test';
import fs from 'node:fs';

const authFile = 'e2e/.auth/user.json';
const sessionFile = 'e2e/.auth/session.json';

setup('logowanie przez SSO', async ({ page }) => {
  await page.goto('/');
  // Przekierowanie na stronę dostawcy (np. login.microsoftonline.com)
  await page.getByLabel(/email|e-mail|login/i).fill(process.env['E2E_USER']!);
  await page.getByRole('button', { name: /next|dalej/i }).click();
  await page.getByLabel(/password|hasło/i).fill(process.env['E2E_PASSWORD']!);
  await page.getByRole('button', { name: /sign in|zaloguj/i }).click();
  // "Stay signed in?" bywa, bywa nie
  await page.getByRole('button', { name: /yes|tak/i }).click({ timeout: 5_000 }).catch(() => {});

  await expect(page).toHaveURL(new RegExp(process.env['E2E_BASE_URL'] ?? 'localhost'));

  // Ciasteczka + localStorage (+ IndexedDB)
  await page.context().storageState({ path: authFile, indexedDB: true });

  // MSAL domyślnie trzyma tokeny w sessionStorage, którego storageState NIE zapisuje.
  // Albo w środowisku testowym ustaw MSAL cacheLocation: 'localStorage', albo zapisz sessionStorage ręcznie:
  const session = await page.evaluate(() => JSON.stringify(sessionStorage));
  fs.writeFileSync(sessionFile, session);
});

/*
 * W testach (fixture) odtworzenie sessionStorage przed wejściem na stronę:
 *
 *   await context.addInitScript((data) => {
 *     for (const [k, v] of Object.entries(JSON.parse(data))) sessionStorage.setItem(k, v as string);
 *   }, fs.readFileSync('e2e/.auth/session.json', 'utf8'));
 *
 * MFA: konto testowe bez MFA (polityka tylko z IP CI) albo TOTP:
 *   import { authenticator } from 'otplib';
 *   await page.getByLabel(/code|kod/i).fill(authenticator.generate(process.env['E2E_TOTP_SECRET']!));
 */
