import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '@helpdesk/shared';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: false,
  // Dodane przez migrację v22 (domyślnie jest teraz OnPush).
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="shell">
      <nav class="topbar">
        <span class="brand">Helpdesk</span>
        <a routerLink="/tickets" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Zgłoszenia</a>
        <a routerLink="/tickets/new" routerLinkActive="active">Nowe zgłoszenie</a>
        <a routerLink="/tickets/stats" routerLinkActive="active">Statystyki</a>
        <span class="spacer"></span>
        <span *ngIf="user$ | async as user">{{ user.name }}</span>
        <span class="flavor">legacy</span>
      </nav>
      <main><router-outlet></router-outlet></main>
    </div>
    <app-toast></app-toast>
  `,
})
export class AppComponent implements OnInit {
  user$!: Observable<User | null>;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.user$ = this.auth.currentUser$;
    this.auth.loadCurrentUser();
  }
}
