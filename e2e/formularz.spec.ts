import { test, expect } from './fixtures';

test.describe('Formularz zgłoszenia', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tickets/new');
    await expect(page.getByRole('heading', { name: 'Nowe zgłoszenie' })).toBeVisible();
  });

  test('pusty formularz pokazuje błędy', async ({ page }) => {
    await page.getByRole('button', { name: 'Zapisz' }).click();
    await expect(page.getByText('Tytuł jest wymagany')).toBeVisible();
  });

  test('wykrywa duplikat tytułu (walidacja na serwerze)', async ({ page }) => {
    await page.getByLabel('Tytuł').fill('VPN rozłącza się co 10 minut');
    await page.getByLabel('Tytuł').blur();
    await expect(page.getByText('Zgłoszenie o takim tytule już istnieje')).toBeVisible();
  });

  test('krytyczne wymaga osoby i terminu, potem zapis działa', async ({ page }) => {
    await page.getByLabel('Tytuł').fill('Drukarka drukuje puste kartki');
    await page.getByLabel('Opis').fill('Od rana każdy wydruk jest pusty.');
    await page.getByLabel('E-mail zgłaszającego').fill('jan@klient.pl');
    await page.getByRole('button', { name: 'critical' }).click();
    await page.getByRole('button', { name: 'Zapisz' }).click();
    await expect(page.getByText(/Krytyczne zgłoszenie wymaga osoby/)).toBeVisible();

    await page.getByLabel('Przypisany').selectOption({ label: 'Kasia Wiśniewska (L2)' });
    await page.getByLabel('Termin').fill('2026-10-30');
    await page.getByRole('button', { name: 'Zapisz' }).click();

    await expect(page).toHaveURL(/\/tickets\/\d+$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Drukarka drukuje puste kartki');
  });

  test('edycja wypełnia formularz danymi', async ({ page }) => {
    await page.goto('/tickets/5/edit');
    await expect(page.getByLabel('Tytuł')).toHaveValue('Brak uprawnień do modułu HR');
  });
});
