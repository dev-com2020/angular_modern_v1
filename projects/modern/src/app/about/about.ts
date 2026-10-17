import { Component } from '@angular/core';
import { VERSION } from '@angular/core';

/**
 * Strona prerenderowana (RenderMode.Prerender w app.routes.server.ts).
 * Data "wygenerowano" ustawia się przy `ng build`, nie przy wejściu na stronę:
 * odśwież stronę kilka razy w wersji produkcyjnej (`npm run serve:ssr:modern`), a godzina się nie zmieni.
 */
@Component({
  selector: 'app-about',
  template: `
    <h1>O aplikacji</h1>
    <div class="card">
      <p>Helpdesk szkoleniowy, Angular {{ version }}.</p>
      <p>Ta strona jest <b>prerenderowana</b>: gotowy plik HTML powstaje podczas budowania aplikacji.</p>
      <p class="muted">Wygenerowano: {{ generatedAt }}</p>
    </div>
    <div class="card">
      <h2>Tryby renderowania w tej aplikacji</h2>
      <table>
        <thead><tr><th>Trasa</th><th>Tryb</th><th>Dlaczego</th></tr></thead>
        <tbody>
          <tr><td>/o-aplikacji</td><td>Prerender</td><td>Treść się nie zmienia</td></tr>
          <tr><td>/tickets, /tickets/:id, /tickets/stats</td><td>Server</td><td>Aktualne dane, szybki pierwszy widok</td></tr>
          <tr><td>/tickets/new, /tickets/:id/edit</td><td>Client</td><td>Formularze, brak zysku z SSR</td></tr>
        </tbody>
      </table>
    </div>
  `,
})
export class About {
  protected readonly version = VERSION.full;
  protected readonly generatedAt = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
}
