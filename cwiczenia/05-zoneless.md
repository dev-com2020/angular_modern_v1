# Ćwiczenie 5: zoneless i OnPush (35 min) [podstawa]

## Cel
Wyłączyć zone.js, znaleźć wszystko, co działało "przypadkiem", i naprawić to sygnałami albo `markForCheck`.

## Kroki
1. W `main.ts` usuń `provideZoneChangeDetection(...)`. W `angular.json` usuń `"zone.js"` z `polyfills` projektu `legacy`. Odinstaluj nic: `zone.js` zostaje w `package.json` dla innych projektów.
2. Usuń wszystkie `changeDetection: ChangeDetectionStrategy.Eager` (od v22 domyślny jest `OnPush`).
3. Przeklikaj aplikację. Zrób listę tego, co się zepsuło. Spodziewaj się m.in.:
   - kolumna "Przypisany" na liście zostaje na `...` (mapa `assignees` mutowana w `subscribe`),
   - stan w komponentach, których nie przepisałeś w ćwiczeniu 3,
   - formularz: lista użytkowników w `select` po `subscribe`,
   - statystyki.
4. Każdy problem napraw na jeden z trzech sposobów i zapisz, który wybrałeś:
   - sygnał (preferowany),
   - `async` pipe / `toSignal` (ćwiczenie 6),
   - `ChangeDetectorRef.markForCheck()` (tylko jako most).
5. Sprawdź `PriorityPickerComponent`: dlaczego działa, mimo że nie ma sygnałów? (podpowiedź: `markForCheck` w `writeValue` i zdarzenia z szablonu)

## Kryteria ukończenia
- [ ] W bundlu nie ma zone.js (`npx ng build legacy` i porównaj rozmiar `polyfills`, powinno go nie być).
- [ ] Żaden komponent nie deklaruje `Eager`.
- [ ] Wszystkie ekrany działają jak przed zmianą.

## Co zapamiętać
Zoneless odświeża widok, gdy: zmieni się sygnał czytany w szablonie, przyjdzie zdarzenie z szablonu, `async` pipe dostanie wartość, ktoś zawoła `markForCheck()`, ustawi się input przez `setInput`. **Nie** odświeża po `setTimeout`, `subscribe` czy `Promise.then`, które tylko zmieniają pola.

## Dla chętnych
- Angular DevTools, zakładka Profiler i Change Detection analyzer (v22.2): porównaj liczbę przebiegów detekcji zmian na liście w legacy (przed) i teraz.
- Masz hybrydę AngularJS + Angular przez `@angular/upgrade`? `UpgradeModule` w v22 ma już ścieżkę dla zoneless (synchronizacja `$digest` po `afterTick`), ale sam kod Angulara zaznacza słabe pokrycie testami dla hybryd. Bezpieczna kolejność: zone.js zostaje do usunięcia ostatniego kawałka AngularJS, wcześniej przygotuj komponenty (sygnały, brak mutacji), żeby wyłączenie było formalnością.

## Wzorzec
`projects/modern/src/app/app.config.ts` (brak providera zone), `angular.json` (brak polyfills w `modern`).
