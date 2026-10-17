# SSR w aplikacji modern (branch `dodatki-ssr-e2e`)

Aplikacja `modern` ma tu włączony Server-Side Rendering: serwer (Node.js + Express) wysyła gotowy HTML, a przeglądarka go "ożywia" (hydratacja).

## Uruchomienie

| Komenda | Co robi |
|---|---|
| `npm run modern` | Dev server z SSR (port 4201). Zmiany w kodzie przeładowują się jak zwykle |
| `npm run modern:ssr` | Build produkcyjny i serwer Node z `dist/modern/server/server.mjs` (port 4000) |

## Co zostało dodane

| Plik | Rola |
|---|---|
| `projects/modern/src/server.ts` | Serwer Express: pliki statyczne + renderowanie Angulara |
| `projects/modern/src/main.server.ts` | Start aplikacji po stronie serwera |
| `projects/modern/src/app/app.config.server.ts` | Providery tylko dla serwera (`provideServerRendering`) |
| `projects/modern/src/app/app.routes.server.ts` | **Tryb renderowania dla każdej trasy** |
| `projects/modern/src/app/about/about.ts` | Strona `/o-aplikacji`, prerenderowana przy buildzie |
| `app.config.ts` | `provideClientHydration(...)` + fake backend jako `HttpBackend` |
| `angular.json` | `server`, `ssr.entry`, `outputMode: "server"`, `security.allowedHosts` |

## Tryby renderowania (`app.routes.server.ts`)

| Trasa | Tryb | Dlaczego |
|---|---|---|
| `/o-aplikacji` | `Prerender` | Treść stała, HTML powstaje raz przy `ng build` |
| `/tickets`, `/tickets/:id`, `/tickets/stats` | `Server` | Aktualne dane przy każdym żądaniu, szybki pierwszy widok |
| `/tickets/new`, `/tickets/:id/edit` | `Client` | Formularze: brak zysku z SSR |

## Hydratacja przyrostowa
Panel komentarzy w szczegółach ma `@defer (on viewport; prefetch on idle; hydrate on viewport)`. Serwer renderuje panel w HTML (komentarze są widoczne od razu), a jego JavaScript ożywa dopiero, gdy użytkownik do niego przewinie. Od v22 hydratacja przyrostowa jest domyślna.

## Transfer cache: dane nie są pobierane dwa razy
Serwer, renderując stronę, pobiera dane. HttpClient zapisuje te odpowiedzi w HTML (`<script id="ng-state">`), a przeglądarka używa ich zamiast pytać API drugi raz. Efekt widać w konsoli:

| | Żądania w przeglądarce przy wejściu na `/tickets` |
|---|---|
| modern bez SSR (main) | 3 |
| modern z SSR (ten branch) | 1 (`/api/me`, celowo wykluczone, patrz niżej) |

## Pułapki, na które trafiliśmy (prawdziwe, nie wymyślone)

1. **`allowedHosts`.** Bez wpisu `security.allowedHosts` w `angular.json` serwer odpowiada `400 Bad Request` ("Header host ... is not allowed"). To ochrona przed SSRF. Na produkcji wpisz swoją domenę.
2. **Adresy na serwerze są pełne.** Po stronie serwera Angular zamienia `/api/tickets` na `http://localhost:4201/api/tickets`. Kod, który sprawdza `url.startsWith('/api/')`, przestaje działać (poprawione w fake backendzie).
3. **Transfer cache jest za interceptorami aplikacji.** Interceptor, który sam odpowiada i nie woła `next()` (jak nasz fake backend albo mocki), odcina cache. Dlatego na tym branchu fake backend jest podpięty jako `HttpBackend`, czyli tam, gdzie normalnie jest prawdziwy serwer.
4. **Nagłówek `Authorization` wyłącza cache.** Domyślnie Angular nie zapisuje w HTML odpowiedzi na żądania z tokenem (mogą zawierać dane konkretnego użytkownika). Tu świadomie włączamy `includeRequestsWithAuthHeaders: true`, ale wykluczamy `/api/me` filtrem, bo trafiłby też do strony prerenderowanej przy buildzie.
5. **`localStorage` nie istnieje na serwerze.** Flagi fake backendu (`fb.errorRate`, `fb.latency`) działają tylko w przeglądarce. Przy pełnym przeładowaniu strony dane pobiera serwer, więc "zepsuty serwer" widać dopiero przy nawigacji wewnątrz aplikacji.
6. **Stan po stronie serwera jest wspólny.** Fake backend na serwerze to jedna baza w pamięci procesu Node, a w przeglądarce osobna. Nowe zgłoszenie dodane w przeglądarce nie istnieje na serwerze, więc F5 na `/tickets/49` da 404. Z prawdziwym API tego problemu nie ma.
7. **Builder 22.2 i `computed()` w definicji trasy.** `computed()` wpisane bezpośrednio w obiekt trasy z `loadComponent` wywraca build SSR ("Cannot read properties of undefined (reading 'fileName')"). Obejście: funkcja `resources` w osobnym pliku (`ticket-stats.resources.ts`).
8. **`@defer` w trybie dev.** `ng serve` z HMR ładuje zależności bloków `@defer` od razu (komunikat NG0751). Żeby pokazać osobny plik JS dla `@defer`, użyj `ng serve --no-hmr` albo builda produkcyjnego.

## Jak sprawdzić SSR ręcznie
- Chrome, `Ctrl+U` (źródło strony) na `/tickets/2`: tytuł zgłoszenia i komentarze są w HTML.
- DevTools, ustawienia, "Disable JavaScript", odśwież `/tickets`: lista nadal jest widoczna.
- `/tickets/new` w źródle strony: pusty `<app-root>`, bo to `RenderMode.Client`.
- `npm run modern:ssr`, otwórz `http://localhost:4000/o-aplikacji` i odśwież kilka razy: godzina "Wygenerowano" się nie zmienia (prerender).
