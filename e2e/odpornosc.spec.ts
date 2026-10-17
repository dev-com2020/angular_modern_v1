import { test, expect, onlyFor } from './fixtures';

/**
 * Serwer API zwraca błąd na każde żądanie (fb.errorRate=1). Aplikacja ma pokazać komunikat i dać się ponowić.
 * Legacy zyskuje to dopiero w ćw. 7, dlatego test jest tylko dla modern.
 *
 * Uwaga SSR: przy pełnym przeładowaniu strony dane pobiera serwer (flaga w localStorage go nie dotyczy),
 * a przeglądarka dostaje je gotowe w HTML. Dlatego błędy wywołujemy przy nawigacji wewnątrz aplikacji,
 * kiedy żądania wysyła już przeglądarka.
 */
test.describe('Odporność na błędy serwera', () => {
  onlyFor('modern');

  test('lista pokazuje błąd i przycisk ponowienia', async ({ page }) => {
    await page.goto('/o-aplikacji');
    await page.evaluate(() => localStorage.setItem('fb.errorRate', '1'));
    await page.getByRole('link', { name: 'Zgłoszenia' }).click();
    await expect(page.getByText('Nie udało się pobrać zgłoszeń')).toBeVisible();

    await page.evaluate(() => localStorage.setItem('fb.errorRate', '0'));
    await page.getByRole('button', { name: 'Spróbuj ponownie' }).click();
    await expect(page.locator('tbody tr')).toHaveCount(10);
  });

  test('szczegóły pokazują błąd z przyciskiem Ponów', async ({ page }) => {
    await page.goto('/tickets');
    await expect(page.locator('tbody tr')).toHaveCount(10);
    await page.evaluate(() => localStorage.setItem('fb.errorRate', '1'));
    await page.locator('tbody tr a').first().click();
    await expect(page.getByText('Nie udało się wczytać zgłoszenia')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ponów' })).toBeVisible();
  });
});
