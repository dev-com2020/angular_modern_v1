# Ćwiczenie 11: plan migracji Twojego projektu (30 min) [podstawa, warsztat]

## Cel
Wyjść ze szkolenia z jednostronicowym planem dla własnej aplikacji. Pracujemy w parach, osoba bardziej zaawansowana z mniej zaawansowaną.

## Kroki
1. Wypełnij "kartę projektu" (5 min):
   - wersja Angulara, czy jest AngularJS (hybryda `@angular/upgrade`?), liczba komponentów, NgModules tak/nie,
   - runner testów, biblioteka stanu, Nx tak/nie,
   - największy ból dziś (wydajność, formularze, czytelność, testy).
2. Ścieżka wersji (5 min). `ng update` przechodzi o jedną wersję główną naraz. Dla każdego skoku zapisz migracje, które się odpalą:
   - v17 → v18 → v19 (`standalone: true` domyślnie, migracja dopisuje `standalone: false`),
   - v19 → v20 (deprecjacja `*ngIf/*ngFor`, stabilne `effect`, `linkedSignal`, zoneless w developer preview),
   - v20 → v21 (nowe aplikacje zoneless, Vitest domyślny, Signal Forms eksperymentalnie),
   - v21 → v22 (OnPush domyślny + migracja dopisująca `Eager`, `strictTemplates` domyślnie, Fetch w `HttpClient`, TypeScript 6, Node 22+).
   Pomocnik: https://angular.dev/update-guide
3. Kolejność modernizacji (10 min). Ułóż kroki w kolejności dla swojego projektu. Propozycja startowa:
   1. podbijanie wersji do v22 bez zmian w kodzie (tylko migracje automatyczne),
   2. standalone + `inject()` + control flow (schematics: małe ryzyko, duży diff),
   3. nowy kod pisany od razu w modern style (reguła w code review),
   4. signal inputs/outputs, sygnały w stanie komponentów, usuwanie mutacji,
   5. odczyty na `httpResource`, usunięcie N+1,
   6. formularze na Signal Forms, formularz po formularzu,
   7. zoneless jako ostatni krok (dla hybrydy AngularJS: po usunięciu AngularJS).
4. Ryzyka i sposób weryfikacji (5 min): co sprawdza CI po każdym kroku (build, testy, e2e, budżety bundla)?
5. Prezentacja jednej pary na forum (5 min).

## LLM w migracji (dla osób planujących migrację z AI)
- `npx skills add https://github.com/angular/skills` instaluje oficjalne skille Angulara dla agentów (v22).
- `ng mcp` udostępnia agentowi narzędzia CLI (build, testy, dev server, dokumentacja).
- Zasada: najpierw schematics (deterministyczne), potem LLM na to, czego schematics nie robią (settery, `ngOnChanges`, formularze), zawsze z testami jako siatką bezpieczeństwa i małymi PR-ami.

## Kryteria ukończenia
- [ ] Jedna strona: karta projektu, ścieżka wersji, 5-7 kroków w kolejności, ryzyka.
