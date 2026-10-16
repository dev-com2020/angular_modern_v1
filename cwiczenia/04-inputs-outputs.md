# Ćwiczenie 4: signal inputs, output(), model(), host (30 min) [podstawa]

## Cel
Zmigrować API komponentów. Zobaczyć, czego schematic nie ruszy (gettery/settery, `ngOnChanges`, `@HostBinding`).

## Kroki
1. `npx ng g @angular/core:signals --path projects/legacy/src` (łączy `signal-input-migration`, `output-migration`, `signal-queries-migration`). Przejrzyj diff.
2. Otwórz `priority-badge.component.ts`. Zauważ: `@Input() set priority(...)` z setterem **został**, a `ngOnChanges` dalej liczy `label`, `tooltip`, `escalated`.
3. Przepisz ręcznie:
   - setter z normalizacją → `input('medium', { transform: toPriority })`, gdzie `toPriority` to zwykła funkcja,
   - `ngOnChanges` → trzy `computed`,
   - usuń `OnChanges` i `SimpleChanges`.
4. `[ngClass]="priority"` zamień ręcznie na `[class]="priority()"`. Schematic `ngclass-to-class` tego nie zrobi: konwertuje tylko literały obiektów, nie wyrażenie zwracające string (sprawdzone, "Migrated 0").
5. `highlight-overdue.directive.ts`: `@HostBinding` i `@HostListener` zamień na `host: { '[style.background]': ..., '(mouseenter)': ... }`, stan `hovered` jako sygnał, `background` jako `computed`.
6. `CommentsPanelComponent`: `ticketId` jest już `input.required<number>()` (zrobił to schematic). Zastąp `ngOnChanges` przez `effect(() => { const id = this.ticketId(); untracked(() => this.load(id)); })`. W ćwiczeniu 7 zastąpi go `httpResource`.
7. Popraw test legacy `priority-badge.component.spec.ts`: zamiast przypisywać pola i wołać `ngOnChanges`, użyj `fixture.componentRef.setInput('priority', 'HIGH')`. W legacy (jeszcze z zone.js) po `setInput` wywołaj `fixture.detectChanges()`; samo `await fixture.whenStable()` wystarczy dopiero po ćwiczeniu 5.

## Kryteria ukończenia
- [ ] Brak `@Input`, `@Output`, `EventEmitter`, `@HostBinding`, `@HostListener`, `ngOnChanges` w `shared/`.
- [ ] Badge dalej normalizuje `'CRITICAL'` → `'critical'`.
- [ ] Test badge przechodzi bez ręcznego `ngOnChanges`.

## Dla chętnych
- `PriorityPickerComponent`: gdyby nie był kontrolką formularza, jak wyglądałby z `model<TicketPriority>()` i `[(priority)]` u rodzica? (Pełna migracja na `FormValueControl` w ćwiczeniu 8.)
- Kiedy `transform` w inpucie, a kiedy `computed` w środku? Napisz jedno zdanie zasady dla zespołu.

## Wzorzec
`projects/modern/src/app/shared/priority-badge.ts`, `shared/highlight-overdue.ts`, `shared/priority-badge.spec.ts`.
