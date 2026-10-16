# Ćwiczenie 7: httpResource, chain() i koniec z N+1 (45 min) [podstawa]

## Cel
Odczyty danych jako zasoby (`httpResource`, stabilne od v22), zależności między nimi przez `chain()`, router podający `:id` jako input. Usunąć żądania w pętlach.

## Kroki
**A. N+1 na liście (15 min)**
1. Policz żądania przy wejściu na listę i przy zmianie strony (zapisane w ćwiczeniu 6).
2. Utwórz serwis `UsersStore` (`@Service()`), który raz pobiera `/api/users` przez `httpResource` i wystawia `byId = computed(() => new Map(...))`.
3. Na liście użyj `users.byId().get(t.assigneeId)?.name`. Usuń mapę `assignees` i pętlę `subscribe`.
4. To samo w panelu komentarzy: usuń `forkJoin` po autorach.
5. Policz żądania ponownie.

**B. Szczegóły zgłoszenia (20 min)**
6. W `provideRouter(...)` dodaj `withComponentInputBinding()`. Usuń resolver (po ćwiczeniu 1 funkcję `ticketResolver`) i `resolve` z trasy.
7. W `TicketDetailComponent`: `id = input.required({ transform: numberAttribute })`, `ticket = httpResource<Ticket>(() => \`/api/tickets/${this.id()}\`)`.
8. Przypisaną osobę pobierz zasobem zależnym:
   ```ts
   assignee = httpResource<User>(({ chain }) => {
     const t = chain(this.ticket);
     return t?.assigneeId ? `/api/users/${t.assigneeId}` : undefined;
   });
   ```
9. W szablonie obsłuż stany: `ticket.isLoading()`, `ticket.error()` z przyciskiem `ticket.reload()`, `ticket.hasValue()`. Pamiętaj: `value()` w stanie błędu rzuca wyjątek, czytaj ją za `hasValue()`.
10. Zmiana statusu: aktualizacja optymistyczna `this.ticket.set({...})`, przy błędzie `this.ticket.reload()`.
11. Panel komentarzy: `httpResource` zależny od `ticketId()` zamiast `effect`/`ngOnChanges` z ćwiczenia 4.

**C. Test odporności (10 min)**
12. Statystyki przepisz na `httpResource` z gałęzią `@if (stats.error())` i przyciskiem `stats.reload()`.
13. W konsoli `localStorage.setItem('fb.errorRate', '0.3')` (albo `'1'` dla pewności), odśwież i poklikaj listę, szczegóły i statystyki. Każdy z tych ekranów ma pokazać błąd i dać się ponowić. Na koniec `localStorage.clear()`.

## Kryteria ukończenia
- [ ] Lista: 3 żądania przy wejściu (me, users, tickets), 1 przy zmianie strony.
- [ ] Brak resolvera i `route.data.subscribe`.
- [ ] Przy `fb.errorRate=1` lista, szczegóły i statystyki pokazują komunikat z przyciskiem ponowienia (formularz edycji obsłużysz w ćwiczeniu 8).

## Dla chętnych
- Router resources (v22.2, developer preview): `resources: ctx => ({ ticket: httpResource(...) })` w definicji trasy i `withRouterResources()`. Blokujący vs `nonBlocking(...)`: kiedy który?
- `@boundary { ... } @error { ... }` (v22.2, developer preview) wokół panelu komentarzy. Rzuć wyjątek w szablonie panelu i zobacz fallback.
- Gdy backend nie ma endpointu "wszyscy użytkownicy": jak zrobić batch `/api/users?ids=1,2,3` z unikalnych id na stronie? (fake backend to obsługuje)

## Wzorzec
`projects/modern/src/app/core/users.ts`, `tickets/ticket-detail/ticket-detail.ts`, `tickets/comments-panel.ts`, `app.config.ts`.
