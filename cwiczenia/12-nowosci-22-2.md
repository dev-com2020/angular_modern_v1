# Ćwiczenie 12: nowości z v22.2, @boundary i router resources (30 min) [dla chętnych / pokaz]

Oba API są w **developer preview** (wrzesień 2026): działają, ale mogą się jeszcze zmienić. Pokazujemy, jak wyglądają, nie wdrażamy na produkcję bez decyzji zespołu.
Pracujemy na `projects/legacy` po ćwiczeniu 7 (szczegóły i statystyki są już na `httpResource`).

## Część A: `@boundary`, czyli error boundary w szablonie (15 min)

### Problem
Jeśli komponent rzuci wyjątek podczas renderowania, Angular nie wyrenderuje jego poddrzewa i w konsoli pojawia się błąd. Fragment strony po prostu znika, a użytkownik nie wie dlaczego.

### Kroki
1. Skopiuj `projects/modern/src/app/tickets/ticket-detail/sla-widget.ts` do `projects/legacy/src/app/tickets/ticket-detail/`. Ten komponent rzuca wyjątek dla zgłoszeń bez terminu (#1, #4, #7...).
2. Wstaw go do szczegółów zgłoszenia **bez** `@boundary`: `<app-sla-widget [ticket]="t" />`. Otwórz `/tickets/2` (działa) i `/tickets/1` (błąd w konsoli, brak SLA). Zanotuj, co dokładnie widać na `/tickets/1`.
3. Owiń widget:
   ```html
   @boundary {
     <app-sla-widget [ticket]="t" />
   } @error (let err) {
     <div class="card error">
       SLA niedostępne: {{ err.message }}
       <button (click)="$reset()">Spróbuj ponownie</button>
     </div>
   }
   ```
4. Otwórz `/tickets/1`: zamiast dziury jest komunikat, reszta strony (nagłówek, komentarze) działa.

### Do zapamiętania
- `$error` (albo alias `let err`) to rzucony wyjątek, `$reset()` renderuje zawartość od nowa. Pomaga przy błędach przejściowych; jeśli dane się nie zmieniły, błąd wróci.
- Można mieć kilka bloków `@error (when ...)` dla różnych typów błędów.
- Błąd nadal trafia do `ErrorHandler` (widać go w konsoli i w monitoringu). `@boundary` ratuje UI, nie ukrywa problemu.
- Kiedy warto: komponenty zewnętrzne, wykresy, widgety, które nie są kluczowe dla strony.

## Część B: router resources, następca resolverów (15 min)

### Problem
Resolvery blokują nawigację i działają sekwencyjnie (rodzic, potem dziecko). Nie znają sygnałów ani zasobów.

### Kroki
1. W `provideRouter(...)` dodaj `withRouterResources()` (masz już `withComponentInputBinding()`). Dodaj też `withNavigationErrorHandler(() => inject(ToastService).show('Nie udało się otworzyć strony', 'error'))`.
2. W definicji trasy `stats` dodaj:
   ```ts
   resources: (ctx) => {
     const limit = computed(() => Number(ctx.queryParams()['limit'] ?? 5));
     return {
       stats: httpResource<TicketStats>(() => '/api/tickets/stats'),
       recent: nonBlocking(httpResource<Page<Ticket>>(() => ({ url: '/api/tickets', params: { pageSize: limit() } }))),
     };
   },
   ```
3. W komponencie statystyk usuń własne pobieranie, razem z gałęzią `stats.error()` z ćwiczenia 7: błąd blokującego zasobu anuluje nawigację i obsługuje go `withNavigationErrorHandler`. Dodaj inputy:
   - `stats = input.required<TicketStats>()`: **blokujący**, komponent dostaje gotową wartość, bez stanu ładowania,
   - `recent = input.required<Resource<Page<Ticket> | undefined> & Pick<WritableResource<unknown>, 'reload'>>()`: **nieblokujący**, komponent sam obsługuje `hasValue()`, `error()`, `reload()`.
4. Sprawdź:
   - kliknij "Statystyki": adres w pasku zmienia się dopiero, gdy statystyki są pobrane (nawigacja czeka),
   - sekcja "Najnowsze" może pokazać skeleton (nie blokuje),
   - `/tickets/stats?limit=3` pokazuje 3 najnowsze,
   - `localStorage.setItem('fb.errorRate','1')` i klik "Statystyki": zostajesz na liście, pojawia się toast. Na koniec `localStorage.clear()`.

### Do zapamiętania
| | Resolver | Router resource blokujący | Router resource `nonBlocking` |
|---|---|---|---|
| Czeka z nawigacją | tak | tak | nie |
| Rodzic i dziecko | po kolei | równolegle | równolegle |
| Komponent dostaje | wartość | wartość | zasób ze stanem |
| Reaguje na zmianę parametrów | przez `runGuardsAndResolvers` | sam (sygnały) | sam (sygnały) |

`computed` na parametrze (tu `limit`) jest ważny: zasób przeładuje się tylko, gdy zmieni się ten parametr, a nie przy każdej zmianie query params.

## Wzorzec
`projects/modern/src/app/app.config.ts`, `app.routes.ts` (trasa `stats`), `tickets/ticket-stats/ticket-stats.ts`, `tickets/ticket-detail/sla-widget.ts`, `tickets/ticket-detail/ticket-detail.html`.
