import { test, expect, countBackendRequests } from './fixtures';

test.describe('Lista zgłoszeń', () => {
  test('pokazuje pierwszą stronę i pozwala przejść dalej', async ({ page }) => {
    await page.goto('/tickets');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(10);
    await expect(page.getByText('48 zgłoszeń')).toBeVisible();

    await page.getByRole('button', { name: 'Następna' }).click();
    await expect(page.getByText('2 / 5')).toBeVisible();
    await expect(rows.first()).toContainText('38');
  });

  test('wyszukiwarka filtruje po tytule', async ({ page }) => {
    await page.goto('/tickets');
    await expect(page.locator('tbody tr')).toHaveCount(10);
    await page.getByPlaceholder('Szukaj po tytule lub tagu').fill('vpn');
    await expect(page.locator('tbody tr')).toHaveCount(3);
    await expect(page.locator('tbody tr').first()).toContainText('VPN');
  });

  test('pokazuje osoby przypisane (dane z drugiego źródła)', async ({ page }) => {
    await page.goto('/tickets');
    await expect(page.locator('tbody tr').first()).toContainText('Marek Zając');
  });

  test('liczba żądań przy wejściu na listę', async ({ page }, info) => {
    const requests = await countBackendRequests(page, async () => {
      await page.goto('/tickets');
      await expect(page.locator('tbody tr').first()).toContainText('Marek Zając');
    });
    // Metryka z ćwiczeń: legacy na starcie 18 (N+1), po ćw. 7 i w modern 3, w modern z SSR 1.
    info.annotations.push({ type: 'żądania', description: String(requests) });
    console.log(`[${info.project.name}] żądania przy wejściu na listę: ${requests}`);
    if (info.project.name === 'modern') expect(requests).toBeLessThanOrEqual(3);
  });
});
