# Ćwiczenie 3: sygnały (40 min) [podstawa]

## Cel
Zamienić "zwykłe pola + mutacje" na sygnały i stan pochodny. Przygotować kod na zoneless (ćwiczenie 5).

## Kroki
1. **`ToastService`** (`core/toast.service.ts`): tablica `toasts` jako prywatny `signal<Toast[]>([])`, publicznie `asReadonly()`. `show()` i `dismiss()` przez `update()` z nową tablicą (bez `push`). Popraw `ToastComponent`.
2. **`TicketDetailComponent`**: pola `ticket`, `assignee`, `saving` jako sygnały. `changeStatus()` ma tworzyć nowy obiekt (`this.ticket.set({ ...t, status })`), a nie mutować `this.ticket.status`.
3. Dodaj `computed` `isOverdue` (termin minął i status nie jest `resolved`/`closed`) i pokaż w szablonie ostrzeżenie.
4. **`CommentsPanelComponent`**: `comments`, `authors`, `loading`, `draft` jako sygnały. `draft` podpięty przez `[value]` i `(input)`.
5. Dodaj w `TicketDetailComponent` `effect()`, który ustawia `document.title` na tytuł zgłoszenia. Zastanów się: czy to dobry przypadek dla `effect`? Co by było złym przypadkiem?
6. Uruchom aplikację z Angular DevTools i obejrzyj graf sygnałów komponentu szczegółów.

## Kryteria ukończenia
- [ ] W tych trzech plikach nie ma mutacji stanu wyświetlanego w szablonie (`push`, przypisania pól obiektów).
- [ ] Szablony czytają sygnały (`ticket()`, `saving()` itd.).
- [ ] `isOverdue` jest `computed`, nie polem liczonym w `subscribe`.

## Pułapki do omówienia
- `effect()` do synchronizacji sygnału z sygnałem to antywzorzec: użyj `computed` albo `linkedSignal`.
- Tablice i obiekty w sygnale porównywane są referencyjnie: mutacja w miejscu nie powiadomi konsumentów.
- `untracked()` w efekcie, gdy wołasz kod, który czyta inne sygnały.

## Dla chętnych
- W `CommentsPanelComponent` zrób listę komentarzy jako `linkedSignal`, która resetuje się po zmianie `ticketId`, ale pozwala lokalnie dopisać nowy komentarz (wzorzec w modern: `comments-panel.ts`).
- `linkedSignal` z własnym setterem (v22.1): kiedy miałby sens?

## Wzorzec
`projects/modern/src/app/core/toasts.ts`, `tickets/ticket-detail/ticket-detail.ts`, `tickets/comments-panel.ts`.
