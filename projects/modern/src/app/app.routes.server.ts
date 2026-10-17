import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Tryb renderowania osobno dla każdej trasy:
 * - Prerender: HTML generowany raz, przy `ng build` (strona statyczna, zero pracy serwera),
 * - Server:    HTML generowany przy każdym żądaniu (aktualne dane, SEO, szybki pierwszy widok),
 * - Client:    serwer oddaje pusty szkielet, wszystko renderuje przeglądarka (jak bez SSR).
 * Kolejność ma znaczenie: pierwsza pasująca reguła wygrywa.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'o-aplikacji', renderMode: RenderMode.Prerender },
  // Formularze: brak korzyści z SSR, a walidacja HTTP i guard niezapisanych zmian i tak działają tylko w przeglądarce.
  { path: 'tickets/new', renderMode: RenderMode.Client },
  { path: 'tickets/:id/edit', renderMode: RenderMode.Client },
  { path: 'tickets/stats', renderMode: RenderMode.Server },
  { path: 'tickets/:id', renderMode: RenderMode.Server },
  { path: 'tickets', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server },
];
