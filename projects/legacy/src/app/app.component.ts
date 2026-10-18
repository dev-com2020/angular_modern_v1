import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '@helpdesk/shared';
import { AuthService } from './core/auth.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ToastComponent } from './core/toast.component';

@Component({
  selector: 'app-root',
  template: `
    <div class="shell">
      <nav class="topbar">
        <span class="brand">Helpdesk</span>
        <a
          routerLink="/tickets"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          >Zgłoszenia</a
        >
        <a routerLink="/tickets/new" routerLinkActive="active">Nowe zgłoszenie</a>
        <a routerLink="/tickets/stats" routerLinkActive="active">Statystyki</a>
        <span class="spacer"></span>
        @if (user$ | async; as user) {
          <span>{{ user.name }}</span>
        }
        <span class="flavor">legacy</span>
      </nav>
      <main><router-outlet /></main>
    </div>
    <app-toast />
  `,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, ToastComponent, AsyncPipe],
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);

  user$!: Observable<User | null>;

  ngOnInit(): void {
    this.user$ = this.auth.currentUser$;
    this.auth.loadCurrentUser();
  }
}
