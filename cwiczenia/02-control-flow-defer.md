# Ćwiczenie 2: control flow, @let i @defer (35 min) [podstawa]

## Cel
Przejść na wbudowaną składnię szablonów i odłożyć ładowanie ciężkich fragmentów.

## Kroki
1. `npx ng g @angular/core:control-flow --path projects/legacy/src`, potem `npx ng g @angular/core:self-closing-tag --path projects/legacy/src`.
2. Przejrzyj diff `ticket-list.component.html`. Popraw ręcznie to, co migracja zrobiła mechanicznie:
   - `track trackById($index, t)` zamień na `track t.id` i usuń metodę `trackById`,
   - zagnieżdżone `@if` loading/empty zamień na `@if / @else if / @else` albo `@for ... @empty`,
   - `@switch (!!t.assigneeId)` zamień na zwykłe `@if`.
3. W `ticket-detail.component.html` użyj `@let t = ticket;` (albo `@let` na wynik `async`), żeby skrócić wyrażenia.
4. Panel komentarzy (`<app-comments-panel>`) owiń w `@defer (on viewport; prefetch on idle)` z blokami `@placeholder (minimum 300ms)`, `@loading (after 100ms; minimum 300ms)` i `@error`.
5. Sprawdź w zakładce Network: kod panelu pobierze się w tle (`prefetch on idle`), a żądanie `/comments` dopiero, gdy placeholder wjedzie w viewport. Na zwykłym oknie placeholder jest widoczny od razu, więc żeby to zobaczyć, zmniejsz wysokość okna (np. DevTools zadokowane na dole, poniżej 300 px) albo dodaj tymczasowo `<div style="height:1500px"></div>` przed panelem. W wynikach `ng build` powinien pojawić się osobny lazy chunk.
6. Na stronie statystyk odłóż sekcję "Wg priorytetu" przez `@defer (on idle(500ms))` (nowa opcja timeout z v22).

## Kryteria ukończenia
- [ ] Brak `*ngIf`, `*ngFor`, `ngSwitch` w szablonach (`grep -rE "\*ng(If|For)|ngSwitch" projects/legacy/src` pusty).
- [ ] `ng build legacy` pokazuje osobny chunk z panelem komentarzy.
- [ ] Z tymczasowym odstępem 1500 px żądanie `/comments` leci dopiero po przewinięciu.

## Dla chętnych
- `@switch` z `@default never;` (v21.2+) na statusie zgłoszenia: dodaj nowy status do typu `TicketStatus` i zobacz błąd kompilacji.
- Dlaczego komponent w bloku `@defer` nie może być importowany nigdzie indziej "eagerly"? Sprawdź, co się stanie, gdy go użyjesz poza `@defer` w tym samym komponencie.

## Wzorzec
`projects/modern/src/app/tickets/ticket-list/ticket-list.html`, `ticket-detail/ticket-detail.html`, `ticket-stats/ticket-stats.ts`.
