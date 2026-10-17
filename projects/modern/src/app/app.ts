import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from './core/auth';
import { ToastOutlet } from './core/toast-outlet';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastOutlet],
  template: `
    <div class="shell">
      <nav class="topbar">
        <span class="brand">Helpdesk</span>
        <a routerLink="/tickets" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Zgłoszenia</a>
        <a routerLink="/tickets/new" routerLinkActive="active">Nowe zgłoszenie</a>
        <a routerLink="/tickets/stats" routerLinkActive="active">Statystyki</a>
        <a routerLink="/o-aplikacji" routerLinkActive="active">O aplikacji</a>
        <span class="spacer"></span>
        @if (auth.currentUser.hasValue()) {
          <span>{{ auth.currentUser.value().name }}</span>
        }
        <span class="flavor">modern</span>
      </nav>
      <main><router-outlet /></main>
    </div>
    <app-toast-outlet />
  `,
})
export class App {
  protected readonly auth = inject(Auth);
}
