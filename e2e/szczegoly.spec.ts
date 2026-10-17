import { test, expect } from './fixtures';

test.describe('Szczegóły zgłoszenia', () => {
  test('pokazuje dane, osobę przypisaną i komentarze', async ({ page }) => {
    await page.goto('/tickets/2');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('#2 Raport miesięczny generuje pusty PDF');
    await expect(page.getByText('Przypisany: Marek Zając')).toBeVisible();
    // Panel komentarzy jest w @defer (on viewport): przewijamy, żeby się pojawił.
    await page.mouse.wheel(0, 3000);
    await expect(page.getByRole('heading', { name: 'Komentarze (2)' })).toBeVisible();
  });

  test('zmiana statusu pokazuje toast, który sam znika', async ({ page }) => {
    await page.goto('/tickets/2');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.getByLabel('Zmień status').selectOption('closed');
    const toast = page.locator('.toast', { hasText: 'Zmieniono status' });
    await expect(toast).toBeVisible();
    await expect(toast).toBeHidden({ timeout: 5_000 });
    await expect(page.locator('.status').first()).toHaveText('Zamknięte');
  });

  test('nawigacja z listy do szczegółów', async ({ page }) => {
    await page.goto('/tickets');
    await page.getByPlaceholder('Szukaj po tytule lub tagu').fill('vpn');
    await page.getByRole('link', { name: 'VPN rozłącza się co 10 minut', exact: true }).click();
    await expect(page).toHaveURL(/\/tickets\/7$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('VPN');
  });
});
