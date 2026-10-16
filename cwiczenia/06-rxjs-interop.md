# Ćwiczenie 6: RxJS i sygnały razem (40 min) [podstawa]

## Cel
Przepisać `TicketListFacade` (view model na `BehaviorSubject`) na sygnały, zostawiając RxJS tam, gdzie daje wartość: debounce, anulowanie poprzedniego żądania.

## Kroki
1. Stan wejściowy jako sygnały: `filters = signal<TicketListFilters>(...)`, `page = signal(1)`.
2. Pipeline zostaje w RxJS, ale startuje z sygnałów i kończy się sygnałem (zdefiniuj `const EMPTY_PAGE: Page<Ticket> = { items: [], total: 0, page: 1, pageSize: 10 }`):
   ```ts
   private readonly result = toSignal(
     toObservable(computed(() => ({ filters: this.filters(), page: this.page() }))).pipe(
       debounceTime(300),
       tap(() => this.loading.set(true)),
       switchMap(({ filters, page }) =>
         // catchError WEWNĄTRZ switchMap: błąd jednego żądania nie zabija całego strumienia
         this.api.list({ ...filters, page, pageSize: this.pageSize }).pipe(catchError(() => of(EMPTY_PAGE))),
       ),
       tap(() => this.loading.set(false)),
     ),
     { initialValue: EMPTY_PAGE },
   );
   ```
3. `vm$` zastąp osobnymi `computed`: `tickets`, `total`, `pageCount`. W szablonie usuń `async` i `@if (vm$ | async; as vm)`.
4. W komponencie listy `filtersForm.valueChanges.subscribe(...)` + `takeUntil(destroy$)` zamień na `takeUntilDestroyed()` albo na `toSignal(this.filtersForm.valueChanges)` + `effect`. Usuń `destroy$` i `ngOnDestroy`.
5. Usuń `ngOnDestroy` z fasady (`toSignal` sam sprząta subskrypcję).
6. Pętla po użytkownikach subskrybowała `vm$`, którego już nie ma. Przenieś ją do `effect(() => { const tickets = this.facade.tickets(); untracked(() => ...) })` i mapę `assignees` jako sygnał czytaj wyłącznie w `untracked()`. Bez `untracked` efekt odpala się po każdym dopisaniu użytkownika (sprawdzone: 41 żądań zamiast 10). Zapisz, ile żądań leci przy wejściu i przy zmianie strony; naprawimy to w ćwiczeniu 7.

## Kryteria ukończenia
- [ ] Fasada nie ma `BehaviorSubject` ani `combineLatest`.
- [ ] W komponencie listy nie ma `Subject`, `takeUntil`, `ngOnDestroy`.
- [ ] Szybkie pisanie w wyszukiwarce wysyła jedno żądanie (sprawdź w konsoli).

## Do dyskusji: kiedy RxJS zostaje
- strumienie zdarzeń w czasie: WebSocket, SSE, drag and drop, `fromEvent`,
- operatory czasu i współbieżności: `debounceTime`, `throttleTime`, `exhaustMap`, `concatMap`, `retry` z backoff,
- integracja z bibliotekami, które wystawiają `Observable`.
Stan do wyświetlenia trzymamy w sygnałach. Granica: `toSignal` / `toObservable` / `rxResource`.

## Dla chętnych
- `exhaustMap` vs `switchMap` przy przycisku "Zapisz": który wybrać i dlaczego?
- Zamień pipeline na `rxResource({ params: ..., stream: ({ params }) => this.api.list(params) })`. Co zyskujesz (status, `reload()`, `error()`), a co tracisz (debounce trzeba zrobić inaczej)?

## Wzorzec
Wersja "RxJS-owa" nie ma odpowiednika w modern celowo: modern idzie krok dalej (ćwiczenie 7 i 9). Porównaj z `projects/modern/src/app/tickets/tickets.store.ts`.
