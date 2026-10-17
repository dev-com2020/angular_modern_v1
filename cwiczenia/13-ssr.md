# Ćwiczenie 13: SSR, oglądamy i rozumiemy (30 min) [dla chętnych / pokaz]

Branch `dodatki-ssr-e2e`: `git checkout dodatki-ssr-e2e`, potem `npm install`. Opis techniczny: [docs/SSR.md](../docs/SSR.md).

## Kroki
1. `npm run modern`. Otwórz `/tickets/2`, potem `Ctrl+U` (źródło strony). Znajdź w HTML tytuł zgłoszenia i komentarze. Porównaj z tym samym na branchu `main` (pusty `<app-root>`).
2. DevTools, `Ctrl+Shift+P`, "Disable JavaScript", odśwież `/tickets`. Lista jest widoczna. Kliknij "Następna": nic się nie dzieje (bez JS nie ma interakcji). Włącz JS z powrotem.
3. Konsola na `/tickets`: ile linii `[fake-backend]`? Porównaj z `main` (3). Dlaczego 1? Zajrzyj do `<script id="ng-state">` w źródle strony.
4. Otwórz `app.routes.server.ts`. Dla `/tickets/new` źródło strony nie ma formularza. Dlaczego? Zmień tryb na `RenderMode.Server` i sprawdź ponownie.
5. `npm run modern:ssr`, otwórz `http://localhost:4000/o-aplikacji`, odśwież kilka razy. Godzina "Wygenerowano" stoi w miejscu. Gdzie jest plik HTML tej strony? (`dist/modern/browser/o-aplikacji/index.html`)
6. W `ticket-detail.html` znajdź `hydrate on viewport`. Co zobaczy użytkownik przed przewinięciem, a co zmieni się po?

## Pytania do dyskusji
- Które ekrany w Twoim projekcie zyskałyby na SSR, a które nie?
- Gdzie Twój kod używa `window`, `document`, `localStorage` przy starcie? (na serwerze ich nie ma: `afterNextRender`, `inject(DOCUMENT)`)
- Czy Twoje API wymaga tokenu? Co z transfer cache (pułapka 4 w docs/SSR.md)?
