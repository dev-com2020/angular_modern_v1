import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { TicketComment } from '@helpdesk/shared';
import { Auth } from '../core/auth';
import { TicketsApi } from '../core/tickets-api';
import { Toasts } from '../core/toasts';
import { Users } from '../core/users';

@Component({
  selector: 'app-comments-panel',
  imports: [DatePipe],
  template: `
    <div class="card">
      <h2>Komentarze ({{ comments().length }})</h2>
      @if (resource.isLoading()) {
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
export class CommentsPanel {
  readonly ticketId = input.required<number>();

  protected readonly users = inject(Users); // autorzy ze słownika: zero dodatkowych żądań
  private readonly auth = inject(Auth);
  private readonly api = inject(TicketsApi);
  private readonly toasts = inject(Toasts);

  protected readonly resource = httpResource<TicketComment[]>(() => `/api/tickets/${this.ticketId()}/comments`, { defaultValue: [] });
  /** Lokalna, zapisywalna kopia listy, resetowana przy zmianie danych z serwera. */
  protected readonly comments = linkedSignal(() => (this.resource.hasValue() ? this.resource.value() : []));
  protected readonly draft = signal('');

  protected add(): void {
    const me = this.auth.currentUser.value();
    if (!me) return;
    this.api.addComment(this.ticketId(), me.id, this.draft()).subscribe((c) => {
      this.comments.update((list) => [...list, c]);
      this.draft.set('');
      this.toasts.show('Dodano komentarz');
    });
  }
}
