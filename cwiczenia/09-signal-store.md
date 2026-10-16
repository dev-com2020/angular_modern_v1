# Ćwiczenie 9: NgRx Signal Store (30 min) [podstawa]

## Cel
Przenieść stan listy (filtry, strona, wynik) do `signalStore` i ocenić, kiedy store się opłaca.

## Kroki
1. `npm ls @ngrx/signals`: wersja 22.0.1 jest już zainstalowana, nic nie instaluj.
2. Utwórz `tickets.store.ts`:
   - `withState({ q, status, priority, page, pageSize })`,
   - `withProps(store => ({ _debouncedQ: debounced(() => store.q(), 300), _tickets: httpResource(...) }))`,
   - `withComputed`: `tickets`, `total`, `pageCount`, `loading`, `typing`, `error`,
   - `withMethods`: `setQuery`, `setStatus`, `setPriority`, `prevPage`, `nextPage`, `reload` przez `patchState`.
3. W komponencie listy `providers: [TicketsStore]` i `store = inject(TicketsStore)`. Usuń fasadę z ćwiczenia 6.
4. Filtry w szablonie: `[value]="store.q()"` i `(input)="store.setQuery(...)"`. Formularz `FormGroup` filtrów nie jest już potrzebny.
5. Sprawdź: zmiana filtra resetuje stronę na 1, szybkie pisanie wysyła jedno żądanie (zacznij od strony 1: na dalszej stronie reset strony leci od razu, a `q` dopiero po debounce, więc zobaczysz dwa żądania; dla chętnych: jak to naprawić?), `@if (store.typing())` pokazuje "czekam".

## Kryteria ukończenia
- [ ] Brak `TicketListFacade`.
- [ ] Komponent listy nie zawiera logiki poza delegacją do store.
- [ ] Właściwości z `_` nie są dostępne z komponentu (sprawdź podpowiedzi IDE).

## Do dyskusji: kiedy store, kiedy nie
| Sytuacja | Wybór |
|---|---|
| Stan jednego komponentu | sygnały w komponencie |
| Stan współdzielony przez kilka komponentów jednej funkcji | serwis z sygnałami albo `signalStore` na poziomie trasy |
| Ten sam wzorzec (lista + filtry + paginacja) w wielu miejscach | `signalStore` + własny `signalStoreFeature` (`withPagedList`) |
| Globalny stan z historią akcji, devtools, efekty między domenami | klasyczny NgRx Store albo `@ngrx/signals/events` (`withReducer`, `withEventHandlers`) |
| Nx monorepo | store jako biblioteka `data-access` per domena, bez importów między domenami |

## Dla chętnych
- Wyciągnij filtry i paginację do `signalStoreFeature` i użyj ich w drugim store (np. dla komentarzy).
- `withHooks({ onInit })` do synchronizacji filtrów z query params routera.

## Wzorzec
`projects/modern/src/app/tickets/tickets.store.ts`, `tickets/ticket-list/`.
