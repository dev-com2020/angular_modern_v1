import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { TicketComment } from '@helpdesk/shared';
import { TicketsApiService } from '../../core/tickets-api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { UsersStore } from '../../core/users.store';

/** Panel komentarzy. Udaje "ciężki" komponent (dużo kodu, osobne żądania). */
@Component({
  selector: 'app-comments-panel',
  imports: [DatePipe],
  template: `
    <div class="card">
      <h2>Komentarze ({{ comments().length }})</h2>
      @if (resource.error()) {
        <p class="error">Nie udało się pobrać komentarzy. <button (click)="resource.reload()">Ponów</button></p>
      } @else if (resource.isLoading()) {
        <div class="skeleton"></div>
      }
      @for (c of comments(); track c.id) {
        <div style="margin-bottom: 10px">
          <b>{{ users.byId().get(c.authorId)?.name }}</b>
          <span class="muted"> · {{ c.createdAt | date: 'dd.MM.yyyy HH:mm' }}</span>
          <div>{{ c.body }}</div>
        </div>
      }
      <div class="row">
        <input class="grow" [value]="draft()" (input)="draft.set($any($event.target).value)" placeholder="Dodaj komentarz" />
        <button class="primary" [disabled]="!draft().trim()" (click)="add()">Dodaj</button>
      </div>
    </div>
  `,
})
export class CommentsPanelComponent {
  private api = inject(TicketsApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  /** Ćw. 7: autorzy ze słownika użytkowników, zero dodatkowych żądań. */
  protected readonly users = inject(UsersStore);

  readonly ticketId = input.required<number>();

  /** Ćw. 7: zasób zależny od ticketId zamiast effect + subscribe. */
  protected readonly resource = httpResource<TicketComment[]>(() => `/api/tickets/${this.ticketId()}/comments`, { defaultValue: [] });
  /** Lokalna, zapisywalna kopia listy, resetowana przy nowych danych z serwera. */
  protected readonly comments = linkedSignal(() => (this.resource.hasValue() ? this.resource.value() : []));
  protected readonly draft = signal('');

  protected add(): void {
    const me = this.auth.currentUserSnapshot;
    if (!me) return;
    this.api.addComment(this.ticketId(), me.id, this.draft()).subscribe((c) => {
      this.comments.update((list) => [...list, c]);
      this.draft.set('');
      this.toast.show('Dodano komentarz');
    });
  }
}
