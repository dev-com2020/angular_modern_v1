# Rozwiązania wzorcowe ćwiczeń

Ten folder pozwala nadrobić zaległości. Każdy podfolder `po-cwNN` zawiera kompletny katalog `projects/legacy/src` w stanie **po** wykonaniu ćwiczenia NN (części "podstawa"; w ćwiczeniu 12 części A i B). Ćwiczenia były wykonywane po kolei, więc `po-cw07` zawiera też wszystko z ćwiczeń 1-6.

Najpierw spróbuj sam. Z rozwiązań korzystaj, gdy utkniesz albo chcesz zacząć kolejne ćwiczenie od czystego stanu.

| Folder | Co zawiera |
|---|---|
| `po-cw01` | Standalone bez NgModules, `inject()`, `app.routes.ts` + `tickets.routes.ts`, funkcyjne guardy, resolver i interceptor, przywrócony `provideZoneChangeDetection` w `main.ts` |
| `po-cw02` | Control flow (`@if`, `@for`, `@empty`), `@let`, panel komentarzy w `@defer (on viewport; prefetch on idle)`, statystyki "Wg priorytetu" w `@defer (on idle(500ms))` |
| `po-cw03` | Sygnały: `ToastService`, szczegóły zgłoszenia (`ticket`, `assignee`, `saving`, `computed` `isOverdue`, `effect` na `document.title`), panel komentarzy |
| `po-cw04` | `input()` z `transform`, `computed` zamiast `ngOnChanges`, `output()`, dyrektywa z `host: {}`, `effect` + `untracked` w panelu komentarzy, test badge z `setInput` |
| `po-cw05` | Zoneless: bez `provideZoneChangeDetection` i bez `ChangeDetectionStrategy.Eager`, poprawki sygnałami (lista, formularz, statystyki), test z `whenStable()` |
| `po-cw06` | Fasada listy na sygnałach (`toObservable` + `debounceTime` + `switchMap` + `toSignal`), `takeUntilDestroyed()`, pętla N+1 w `effect` z `untracked` |
| `po-cw07` | `httpResource`, `UsersStore` (`@Service()`), `withComponentInputBinding()`, szczegóły bez resolvera, `chain()`, błędy z przyciskiem ponowienia; lista: 3 żądania przy wejściu, 1 przy zmianie strony |
| `po-cw08` | Signal Forms: `ticket-form.model.ts` (model + schema), `FieldErrorsComponent`, picker jako `FormValueControl`, komunikat zamiast pustego formularza przy błędzie wczytania |
| `po-cw09` | `TicketsStore` (NgRx Signal Store) zamiast fasady, filtry bez `FormGroup` |
| `po-cw10` | Testy Vitest: `PriorityBadgeComponent` (`setInput`, `whenStable`, `output`) i `TicketsStore` (`HttpTestingController`, debounce) |
| `po-cw12` | `@boundary` z widgetem SLA w szczegółach, router resources na statystykach (`stats` blokujący, `recent` z `nonBlocking`), `withNavigationErrorHandler` |

Ćwiczenie 11 (plan migracji) nie zmienia kodu, dlatego nie ma folderu `po-cw11`.

## Jak przywrócić stan po ćwiczeniu (PowerShell, z katalogu głównego repozytorium)

Najpierw zapisz swoją pracę (`git add -A; git commit -m "moja wersja"`), potem podmień katalog `src`:

```powershell
Remove-Item -Recurse -Force projects\legacy\src
Copy-Item -Recurse rozwiazania\po-cw05\src projects\legacy\src
```

Sprawdzenie:

```powershell
npx ng build legacy
npx ng test legacy --watch=false
npm run legacy
```

## Uwaga: zone.js od `po-cw05`

Foldery zawierają tylko `src`, a `angular.json` w repozytorium ma dla `legacy` polyfill `"zone.js"` (stan startowy).

- `po-cw01` do `po-cw04`: nic nie zmieniaj, te wersje potrzebują zone.js (`main.ts` ma `provideZoneChangeDetection`).
- `po-cw05` i dalej: `main.ts` nie ma `provideZoneChangeDetection`, więc **aplikacja** działa zoneless także wtedy, gdy polyfill został (zone.js jest tylko niepotrzebnie ładowany, około 90 kB). **Testy** wymagają jednak usunięcia polyfillu: przy załadowanym zone.js TestBed pracuje w trybie zone i `await fixture.whenStable()` nie odświeża widoku (testy badge nie przejdą). Usuń polyfill poleceniem:

  ```powershell
  npx ng config projects.legacy.architect.build.options.polyfills "[]"
  ```

  albo ręcznie usuń wpis `"polyfills": ["zone.js"]` z `projects.legacy.architect.build.options` w `angular.json`.
- Powrót do wersji z zone.js (np. przy przywracaniu `po-cw03`): `git checkout -- angular.json`.

## Jak porównać dwa etapy

```powershell
git diff --no-index rozwiazania\po-cw03\src rozwiazania\po-cw04\src
```

Tak samo możesz porównać swoją wersję z rozwiązaniem:

```powershell
git diff --no-index rozwiazania\po-cw04\src projects\legacy\src
```
