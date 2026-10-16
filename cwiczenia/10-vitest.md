# Ćwiczenie 10: testy w Vitest, bez zone.js (30 min) [podstawa / dla chętnych]

## Cel
Pisać testy komponentów i store pod zoneless: bez `fakeAsync`, z `setInput`, `whenStable` i `TestBed.tick()`.

## Kroki
1. Uruchom `npm run test:modern` i przeczytaj trzy specy: `priority-badge.spec.ts`, `tickets.store.spec.ts`, `ticket-form.model.spec.ts`.
2. Napisz test dla swojego `PriorityBadge` z ćwiczenia 4 w `projects/legacy`:
   - `TestBed.createComponent(...)` w `beforeEach`, potem `TestBed.getLastFixture()` (v22),
   - `fixture.componentRef.setInput('priority', 'HIGH')`, `await fixture.whenStable()`,
   - asercja na tekście i na `output` (subskrypcja `badgeClick`).
3. Napisz test swojego `TicketsStore` z ćwiczenia 9 z `provideHttpClientTesting()`:
   - `TestBed.tick()` uruchamia efekty i wysyła żądanie zasobu,
   - `http.expectOne(r => r.url === '/api/tickets')`, `req.flush(...)`,
   - `await TestBed.inject(ApplicationRef).whenStable()`, asercje na `tickets()`, `total()`.
4. Test debounce: trzy `setQuery` pod rząd, `http.expectNone(...)`, odczekaj 350 ms, `expectOne` z `q=vpn`.

## Kryteria ukończenia
- [ ] Minimum 2 nowe testy w `projects/legacy` przechodzą.
- [ ] Żaden test nie używa `fakeAsync`, `tick` z `@angular/core/testing` ani `detectChanges` jako "magicznego" odświeżenia.

## Migracja istniejących testów z Karma/Jasmine (informacyjnie)
```bash
ng update @angular/cli --name migrate-karma-to-vitest      # konfiguracja i zależności
ng g refactor-jasmine-vitest --add-imports --fake-async --include src/app/user   # treść testów, plik po pliku
```
Od v22 Vitest obsługuje też `fakeAsync`/`waitForAsync` przy zone.js (`zone.js/plugins/vitest-patch` w polyfills testów), więc migrację runnera i usuwanie zone.js z testów można rozdzielić.

## Dla chętnych
- `TestBed.createDirective(HighlightOverdue, { tagName: 'tr', bindings: [inputBinding(...)] })` (v22.2) dla dyrektywy z ćwiczenia 4.
- Vitest Browser Mode: uruchom testy w prawdziwej przeglądarce i porównaj z jsdom.

## Wzorzec
`projects/modern/src/app/**/*.spec.ts`.
