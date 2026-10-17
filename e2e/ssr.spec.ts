import { test, expect, onlyFor } from './fixtures';

/**
 * SSR (tylko modern): sprawdzamy surowy HTML z serwera, bez uruchamiania JavaScriptu.
 * To jest to, co widzi wyszukiwarka i użytkownik przed załadowaniem skryptów.
 */
test.describe('SSR', () => {
  onlyFor('modern');

  test('szczegóły zgłoszenia są w HTML z serwera', async ({ request }) => {
    const html = await (await request.get('/tickets/2')).text();
    expect(html).toContain('#2 Raport miesięczny generuje pusty PDF');
    expect(html).toContain('Marek Zając');
  });

  test('formularz jest renderowany tylko w przeglądarce (RenderMode.Client)', async ({ request }) => {
    const html = await (await request.get('/tickets/new')).text();
    expect(html).not.toContain('Nowe zgłoszenie');
  });

  test('strona bez JavaScriptu nadal pokazuje listę', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/tickets');
    await expect(page.locator('tbody tr')).toHaveCount(10);
    await context.close();
  });
});
