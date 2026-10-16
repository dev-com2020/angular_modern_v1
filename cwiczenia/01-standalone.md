# Ćwiczenie 1: standalone, inject() i schematics (35 min) [podstawa]

## Cel
Pozbyć się NgModules i konstruktorowego DI narzędziami Angulara, a potem znaleźć to, czego narzędzia nie zrobią albo zrobią źle.

## Kroki
1. Commit stanu wyjściowego.
2. Migracja standalone, trzy przebiegi w tej kolejności (po każdym `npx ng build legacy` i commit):
   ```bash
   npx ng g @angular/core:standalone --path projects/legacy/src --mode convert-to-standalone
   npx ng g @angular/core:standalone --path projects/legacy/src --mode prune-ng-modules
   npx ng g @angular/core:standalone --path projects/legacy/src --mode standalone-bootstrap
   ```
3. Uruchom aplikację i przeklikaj: lista, szczegóły #2 (przypisany, komentarze), zmiana statusu (toast), statystyki. **Coś przestało działać.** Znajdź przyczynę, zanim spojrzysz na podpowiedź.
4. `npx ng g @angular/core:inject --path projects/legacy/src` i przejrzyj diff jednego komponentu. Uwaga: schematic przepuszcza pliki przez prettier, więc diff zawiera też zmiany formatowania.
5. Moduły routingu:
   - `AppRoutingModule` zamień na `app.routes.ts` + `provideRouter(routes)` w `main.ts` (usuń `importProvidersFrom(BrowserModule, AppRoutingModule)`, `BrowserModule` nie jest potrzebny),
   - `TicketsModule` + `TicketsRoutingModule` zamień na `tickets.routes.ts` z `Routes` i `loadChildren: () => import('./tickets/tickets.routes').then(m => m.TICKET_ROUTES)`.
   Usuń wszystkie trzy moduły.
6. Zamień `AuthGuard`, `UnsavedChangesGuard` i `TicketResolver` na funkcje (`CanActivateFn`, `CanDeactivateFn`, `ResolveFn`) z `inject()`.
7. Zamień `AuthTokenInterceptor` na `HttpInterceptorFn` i usuń `withInterceptorsFromDi()`. Kolejność ma znaczenie: `withInterceptors([authTokenInterceptor, fakeBackendInterceptor])`. Fake backend nie woła `next`, więc interceptor dopisany za nim po cichu się nie wykona.
8. Napraw test `priority-badge.component.spec.ts` (importował usunięty `SharedModule`).

## Kryteria ukończenia
- [ ] W `projects/legacy` nie ma żadnego `@NgModule` (`grep -r "@NgModule" projects/legacy/src` nic nie zwraca).
- [ ] `main.ts` używa `bootstrapApplication`, a aplikacja zachowuje się tak jak przed migracją.
- [ ] Brak klasowych guardów, resolverów i interceptorów.
- [ ] `npx ng test legacy` przechodzi.

## Podpowiedź do kroku 3
<details><summary>Rozwiń dopiero po własnej próbie</summary>

Migracja `standalone-bootstrap` przeniosła providery z `AppModule` do `bootstrapApplication`, ale zgubiła `provideZoneChangeDetection()`, który był przekazany w `applicationProviders` do `bootstrapModule()`. Od v21 `bootstrapApplication` bez tego providera startuje **zoneless**, mimo że zone.js nadal jest w polyfills. Komponenty mutujące pola po `subscribe` przestają się odświeżać. Na razie dopisz `provideZoneChangeDetection({ eventCoalescing: true })` do providerów w `main.ts`. Świadomie wyłączymy zone.js w ćwiczeniu 5.
</details>

## Dla chętnych
- `npx ng g @angular/core:route-lazy-loading --path projects/legacy/src` i porównaj z ręcznym `loadComponent` w `projects/modern/src/app/app.routes.ts`.
- `npx ng g @angular/core:service` (v22.1): które serwisy zostały przerobione na `@Service()`, a które pominięte i dlaczego?

## Wzorzec
`projects/modern/src/main.ts`, `app.config.ts`, `app.routes.ts`, `core/auth.guard.ts`, `core/auth-token.interceptor.ts`.
