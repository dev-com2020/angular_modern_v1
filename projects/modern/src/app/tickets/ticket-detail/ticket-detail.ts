import { Component, inject, input, numberAttribute, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { STATUSES, Ticket, TicketStatus, User } from '@helpdesk/shared';
import { TicketsApi } from '../../core/tickets-api';
import { Toasts } from '../../core/toasts';
import { PriorityBadge } from '../../shared/priority-badge';
import { StatusLabelPipe } from '../../shared/status-label.pipe';
import { CommentsPanel } from '../comments-panel';

@Component({
  selector: 'app-ticket-detail',
  imports: [RouterLink, DatePipe, PriorityBadge, StatusLabelPipe, CommentsPanel],
  templateUrl: './ticket-detail.html',
})
export class TicketDetail {
  /** Parametr :id z routera jako signal input (withComponentInputBinding). Zamiast resolvera i route.data.subscribe. */
  readonly id = input.required({ transform: numberAttribute });

  private readonly api = inject(TicketsApi);
  private readonly toasts = inject(Toasts);

  protected readonly statuses = STATUSES;
  protected readonly saving = signal(false);

  protected readonly ticket = httpResource<Ticket>(() => `/api/tickets/${this.id()}`);

  /** Zależny zasób: chain() przenosi stan (loading/error) ticketu na assignee. */
  protected readonly assignee = httpResource<User>(({ chain }) => {
    const ticket = chain(this.ticket);
    return ticket?.assigneeId ? `/api/users/${ticket.assigneeId}` : undefined;
  });

  protected changeStatus(status: TicketStatus): void {
    const current = this.ticket.value();
    if (!current) return;
    // Aktualizacja optymistyczna: nowy obiekt, nie mutacja (OnPush + sygnały).
    this.ticket.set({ ...current, status });
    this.saving.set(true);
    this.api.update(current.id, { status }).subscribe({
      next: () => {
        this.saving.set(false);
        this.toasts.show('Zmieniono status');
      },
      error: () => {
        this.saving.set(false);
        this.ticket.reload();
        this.toasts.show('Nie udało się zapisać', 'error');
      },
    });
  }
}
