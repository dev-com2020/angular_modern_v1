# Ćwiczenie 0: setup i polowanie na legacy (15 min) [podstawa]

## Cel
Uruchomić obie aplikacje i zobaczyć różnicę "na żywo", zanim zaczniemy cokolwiek zmieniać.

## Kroki
1. Jeśli git nie ma Twojej tożsamości: `git config user.name "Imię Nazwisko"` i `git config user.email "ty@firma.pl"` (w tym repo). Potem `npm install`, potem w dwóch terminalach `npm run legacy` i `npm run modern`.
2. Otwórz obie aplikacje obok siebie. Otwórz konsolę przeglądarki w obu.
3. Na liście zgłoszeń policz żądania `[fake-backend #N]` po pierwszym wczytaniu. Zapisz obie liczby.
4. Wejdź w szczegóły zgłoszenia #2 i ponownie policz. Zobacz w zakładce Network, kiedy pobierany jest kod panelu komentarzy w każdej z aplikacji.
5. Przejrzyj `projects/legacy/src/app` i wypisz na kartce co najmniej 8 rzeczy, które Twoim zdaniem są dziś "legacy". Wskazówka: zajrzyj do `ticket-list.facade.ts`, `priority-badge.component.ts`, `ticket-form.component.ts`, `toast.service.ts`, `main.ts`.

## Kryteria ukończenia
- [ ] Obie aplikacje działają.
- [ ] Masz dwie liczby żądań dla listy (legacy vs modern) i wiesz, skąd bierze się różnica.
- [ ] Masz listę co najmniej 8 elementów legacy.

## Dla chętnych
Uruchom `npx ng test legacy` i `npx ng test modern`. Porównaj `priority-badge.component.spec.ts` z `priority-badge.spec.ts`. Co w teście legacy jest pułapką?
