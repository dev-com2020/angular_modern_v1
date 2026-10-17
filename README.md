# Modern Angular: projekt szkoleniowy "Helpdesk"

Szkolenie Modern Angular, 17-18.10.2026. Angular 22.2, TypeScript 6, Vitest 5.

Jedno repozytorium, dwie aplikacje z tą samą funkcjonalnością:

| Aplikacja | Port | Styl | Rola na szkoleniu |
|---|---|---|---|
| `projects/legacy` | 4200 | NgModules, `*ngIf/*ngFor`, `@Input/@Output`, konstruktorowe DI, view model na `BehaviorSubject`, Reactive Forms, `ControlValueAccessor`, zone.js | **To migrujemy w ćwiczeniach** |
| `projects/modern` | 4201 | standalone, control flow, `@defer`, sygnały, signal inputs, zoneless, OnPush (domyślny w v22), `httpResource`, Signal Forms, NgRx Signal Store, `@Service`, `@boundary` i router resources (v22.2) | Wzorzec docelowy, "ściąga" z rozwiązaniami |
| `projects/shared` | | model domeny + fake backend (interceptor HTTP) | Nie ruszamy |

## Start

Wymagany Node `^22.22.3`, `^24.15` lub `>=26`.

```bash
npm install
npm run legacy     # http://localhost:4200
npm run modern     # http://localhost:4201
npm run test:all   # Vitest, obie aplikacje
```

## Fake backend

Nie ma serwera. Żądania `/api/*` obsługuje interceptor `projects/shared/src/fake-backend.interceptor.ts`, dane siedzą w pamięci i resetują się po F5. Każde żądanie jest logowane w konsoli przeglądarki jako `[fake-backend #N]`, więc łatwo policzyć zapytania.

Sterowanie z konsoli przeglądarki:

```js
localStorage.setItem('fb.latency', '1500')   // stałe opóźnienie w ms
localStorage.setItem('fb.errorRate', '0.3')  // 30% żądań kończy się błędem 500
localStorage.clear()                         // ustawienia domyślne
```

Endpointy: `GET /api/tickets?q&status&priority&page&pageSize`, `GET|PUT|PATCH /api/tickets/:id`, `POST /api/tickets`, `GET|POST /api/tickets/:id/comments`, `GET /api/tickets/check-title?title&excludeId`, `GET /api/tickets/stats`, `GET /api/users`, `GET /api/users/:id`, `GET /api/me`.

## Ćwiczenia

Instrukcje są w folderze [`cwiczenia/`](cwiczenia/README.md). Pracujemy na `projects/legacy`. Przed każdym ćwiczeniem zrób commit, żeby móc wrócić (`git stash` / `git checkout .`).

Utknąłeś? Odpowiednik każdego fragmentu jest w `projects/modern`. Ścieżki podaje każde ćwiczenie.

Zostałeś w tyle? W [`rozwiazania/`](rozwiazania/README.md) jest stan `projects/legacy/src` po każdym ćwiczeniu, gotowy do skopiowania.
