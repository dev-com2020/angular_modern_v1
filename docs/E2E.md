# Testy E2E z Playwright (branch `dodatki-ssr-e2e`)

Te same scenariusze testują `legacy` i `modern`. Testujemy zachowanie, nie kod, więc migracja nie powinna wymagać zmian w testach. Sprawdzone: komplet przechodzi na legacy w stanie startowym, na legacy po wszystkich ćwiczeniach (`rozwiazania/po-cw12`) i na modern z SSR.

## Uruchomienie

```bash
npx playwright install chromium   # raz: pobiera przeglądarkę
npm run e2e                        # wszystkie testy, obie aplikacje
npm run e2e -- --project=legacy    # tylko legacy
npm run e2e:ui                     # tryb UI: oś czasu, podgląd kroków, "pick locator"
npx playwright show-report         # raport HTML po uruchomieniu
```
Playwright sam uruchamia `ng serve legacy` i `ng serve modern`. Jeśli już działają, używa istniejących.

## Struktura

| Plik | Co zawiera |
|---|---|
| `playwright.config.ts` | Projekty `przygotowanie`, `legacy`, `modern`, serwery, raporty |
| `e2e/przygotowanie.setup.ts` | Wzorzec "zaloguj się raz": zapis stanu przeglądarki do `e2e/.auth/stan.json` |
| `e2e/fixtures.ts` | Licznik żądań do fake backendu, `onlyFor('modern')` |
| `e2e/lista.spec.ts` | Lista, paginacja, wyszukiwarka, **liczba żądań** (legacy 18, modern z SSR 1) |
| `e2e/szczegoly.spec.ts` | Szczegóły, komentarze w `@defer`, zmiana statusu i toast, nawigacja |
| `e2e/formularz.spec.ts` | Walidacja, duplikat tytułu, reguła "krytyczne", zapis, edycja |
| `e2e/odpornosc.spec.ts` | Błędy serwera i przycisk "Ponów" (tylko modern) |
| `e2e/ssr.spec.ts` | Surowy HTML z serwera, strona bez JavaScriptu (tylko modern) |
| `e2e/przyklady/sso.setup.example.ts` | Przykład logowania SSO (Entra ID / MSAL), nie jest uruchamiany |

## Zasady, których się trzymamy
1. **Lokatory jak użytkownik:** `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`. Zero klas CSS tam, gdzie da się inaczej.
2. **Zero `waitForTimeout`.** `expect(...).toBeVisible()` samo czeka, aż element się pojawi.
3. **Kontrolowane dane.** Fake backend daje te same dane przy każdym uruchomieniu. W prawdziwym projekcie: `page.route()` albo baza testowa resetowana przed testami.
4. **Błędy też testujemy** (`odpornosc.spec.ts`).

## SSO w testach E2E
Problem: przekierowania na domenę dostawcy, MFA, captcha, wolne logowanie w każdym teście.

Rozwiązanie standardowe:
1. **Logowanie raz** w projekcie `setup` i zapis stanu (`storageState`), potem wszystkie testy startują zalogowane. U nas ten sam mechanizm zapisuje ustawienie fake backendu (`przygotowanie.setup.ts`).
2. **MSAL trzyma tokeny w `sessionStorage`**, którego `storageState` nie zapisuje. Albo w środowisku testowym `cacheLocation: 'localStorage'`, albo ręczny zapis i odtworzenie `sessionStorage` (przykład w `e2e/przyklady/sso.setup.example.ts`).
3. **MFA:** konto testowe bez MFA (polityka tylko z IP CI) albo TOTP generowany w teście (`otplib`). Push i SMS się nie automatyzują.
4. **Różne role:** osobny plik stanu na rolę (`admin.json`, `user.json`) i `test.use({ storageState })`.
5. **Docelowo:** codzienne testy na atrapie dostawcy tożsamości (np. Keycloak w Dockerze), jeden test dziennie na prawdziwym SSO.

## SSR a testy
Przy SSR dane przy pełnym przeładowaniu pobiera serwer, nie przeglądarka. `page.route()` i flagi w `localStorage` działają tylko na żądania z przeglądarki. Test błędów w `odpornosc.spec.ts` wywołuje je więc przy nawigacji wewnątrz aplikacji (kliknięcie linku), a nie przez `page.goto`.
