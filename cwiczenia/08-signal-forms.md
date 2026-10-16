# Ćwiczenie 8: Signal Forms (60 min) [podstawa]

## Cel
Przepisać formularz zgłoszenia z Reactive Forms na Signal Forms (stabilne od v22): model jako sygnał, walidacja jako schema, kontrolka własna jako `FormValueControl`.

Mapa pojęć:

| Reactive Forms (legacy) | Signal Forms |
|---|---|
| `FormBuilder.group({...})` | `form(signal<Model>(...), schema)` |
| `Validators.required`, `minLength`, `email` | `required(p.x)`, `minLength(p.x, 5)`, `email(p.x)` w `schema` |
| klasowy `AsyncValidator` + `timer(400)` | `validateHttp(p.title, { request, onSuccess, onError, debounce: 400 })` |
| walidator grupy `criticalNeedsOwner` | `validate(p.assigneeId, ({ value, valueOf }) => ...)` |
| `valueChanges` + `enable()/disable()` | `disabled(p.notifyReporter, { when: ... })` |
| `FormArray` + `FormControl` | tablica w modelu + `applyEach(p.tags, ...)` |
| `formControlName` | `[formField]="f.title"` |
| `(ngSubmit)` + `markAllAsTouched()` | `<form [formRoot]="f">` + `submission: { action }` |
| `ControlValueAccessor` | `FormValueControl<T>`: `value = model<T>()` |
| `patchValue()` po `subscribe` | `linkedSignal` z danych z `httpResource` |

## Kroki
1. Utwórz `ticket-form.model.ts` z interfejsem `TicketFormModel` (wartości z `select` i `input type=date` jako `string`), funkcjami `emptyTicketModel()`, `toFormModel(ticket)`, `toDraft(model)`.
2. Napisz `ticketSchema(excludeId: Signal<number | undefined>)` z regułami z tabeli. Komunikaty błędów jako `{ message: '...' }`.
3. W komponencie:
   - `id = input(undefined, { transform: ... })` (z routera, brak przy `/new`),
   - `existing = httpResource<Ticket>(() => this.id() ? \`/api/tickets/${this.id()}\` : undefined)`,
   - `model = linkedSignal(() => existing.hasValue() ? toFormModel(existing.value()) : emptyTicketModel())`,
   - `ticketForm = form(this.model, ticketSchema(this.id), { submission: { action: async (f) => {...} } })`.
4. Szablon: `[formField]` na każdym polu, `<form [formRoot]="ticketForm">`, przycisk `[disabled]="ticketForm().submitting() || ticketForm().pending()"`.
5. Zrób mały komponent `FieldErrors` z inputem `field: FieldTree<unknown>`, który pokazuje `pending()` i listę `errors()` po `touched()`. Użyj go pod każdym polem.
6. `PriorityPickerComponent` przerób na `FormValueControl<TicketPriority>`: `value = model()`, `disabled = input(false)`, `touch = output<void>()`. Usuń `NG_VALUE_ACCESSOR`.
7. Tagi: `@for (tag of ticketForm.tags; track $index)` + przyciski dodaj/usuń przez `ticketForm.tags().value.update(...)`.
8. Guard niezapisanych zmian: `ticketForm().dirty()`.

## Kryteria ukończenia
- [ ] W `ticket-form/` i `priority-picker` brak importów z `@angular/forms` poza `@angular/forms/signals` (filtry listy znikną w ćwiczeniu 9).
- [ ] Edycja przy błędzie wczytania (`fb.errorRate=1`) pokazuje komunikat zamiast pustego formularza, a zapis jest zablokowany.
- [ ] Pusty submit pokazuje błędy przy tytule, opisie, e-mailu.
- [ ] Tytuł "VPN rozłącza się co 10 minut" daje błąd duplikatu (po opuszczeniu pola).
- [ ] Priorytet `critical` bez osoby i terminu blokuje zapis.
- [ ] Checkbox "Powiadom" jest wyłączony, gdy e-mail jest pusty.
- [ ] Edycja `/tickets/5/edit` wypełnia formularz danymi.

## Wskazówki
- `debounce(p.title, 'blur')` (v22) aktualizuje model dopiero przy opuszczeniu pola, co ogranicza walidację HTTP.
- `getError('minLength')` (v22) zwraca błąd konkretnego typu z zawężonym typem, przydatne do komunikatów z parametrami.
- Kontrolka oparta o `ControlValueAccessor` działa w Signal Forms bez zmian, a `FormValueControl` działa z `formControlName`. Migrację można robić formularz po formularzu.

## Dla chętnych
- Przetestuj schemat bez DOM: `TestBed.runInInjectionContext(() => form(signal(emptyTicketModel()), ticketSchema(signal(undefined))))` i sprawdź `f.assigneeId().errors()` (wzorzec: `ticket-form.model.spec.ts`).
- `compatForm` z `@angular/forms/signals/compat`: jak osadzić istniejący `FormControl` w nowym formularzu? Kiedy to ma sens przy dużej migracji?

## Wzorzec
`projects/modern/src/app/tickets/ticket-form/` (cały folder), `shared/priority-picker.ts`.
