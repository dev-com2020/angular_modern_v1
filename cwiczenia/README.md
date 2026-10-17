# Ćwiczenia

Pracujemy na `projects/legacy` i krok po kroku doprowadzamy ją do stylu z `projects/modern`.
Ćwiczenia są ułożone tak, żeby zaległość w jednym nie blokowała kolejnego: każde dotyczy innego fragmentu aplikacji.

Oznaczenia: **[podstawa]** robi każdy, **[dla chętnych]** dla osób, które skończą wcześniej.

| # | Dzień | Temat | Czas | Plik |
|---|---|---|---|---|
| 0 | 1 | Setup i "polowanie na legacy" | 15 min | [00-setup.md](00-setup.md) |
| 1 | 1 | Standalone, `inject()`, schematics | 35 min | [01-standalone.md](01-standalone.md) |
| 2 | 1 | Control flow, `@let`, `@defer` | 35 min | [02-control-flow-defer.md](02-control-flow-defer.md) |
| 3 | 1 | Sygnały: `signal`, `computed`, `linkedSignal`, `effect` | 40 min | [03-sygnaly.md](03-sygnaly.md) |
| 4 | 1 | Signal inputs, `output()`, `model()`, `host` | 30 min | [04-inputs-outputs.md](04-inputs-outputs.md) |
| 5 | 1 | Zoneless i OnPush | 35 min | [05-zoneless.md](05-zoneless.md) |
| 6 | 2 | RxJS i sygnały razem | 40 min | [06-rxjs-interop.md](06-rxjs-interop.md) |
| 7 | 2 | `httpResource`, `chain()`, koniec z N+1 | 45 min | [07-resources.md](07-resources.md) |
| 8 | 2 | Signal Forms | 60 min | [08-signal-forms.md](08-signal-forms.md) |
| 9 | 2 | NgRx Signal Store | 30 min | [09-signal-store.md](09-signal-store.md) |
| 10 | 2 | Testy w Vitest (zoneless) | 30 min | [10-vitest.md](10-vitest.md) |
| 11 | 2 | Plan migracji Twojego projektu | 30 min | [11-plan-migracji.md](11-plan-migracji.md) |
| 12 | 2 | Nowości v22.2: `@boundary`, router resources (dla chętnych / pokaz) | 30 min | [12-nowosci-22-2.md](12-nowosci-22-2.md) |
| 13 | dodatek | SSR (branch `dodatki-ssr-e2e`) | 30 min | [13-ssr.md](13-ssr.md) |
| 14 | dodatek | Testy E2E w Playwright (branch `dodatki-ssr-e2e`) | 40 min | [14-e2e.md](14-e2e.md) |

Zasady:

1. Przed każdym ćwiczeniem: `git add -A && git commit -m "przed cw N"`.
2. Po każdym ćwiczeniu aplikacja ma się budować (`npx ng build legacy`) i działać w przeglądarce.
3. Konsola przeglądarki pokazuje każde żądanie `[fake-backend #N]`. Liczba żądań to dobra metryka postępu.
4. Rozwiązania wzorcowe: `projects/modern`. Zaglądaj śmiało, ale najpierw spróbuj sam.
5. Zaległości: w [`rozwiazania/`](../rozwiazania/README.md) jest stan `projects/legacy/src` po każdym ćwiczeniu (`po-cw01` ... `po-cw12`), z instrukcją przywracania.
