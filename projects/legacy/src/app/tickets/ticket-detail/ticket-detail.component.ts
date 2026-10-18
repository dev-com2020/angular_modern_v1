import { Component, DOCUMENT, computed, effect, inject, input, numberAttribute, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { STATUSES, Ticket, TicketStatus, User } from '@helpdesk/shared';
import { TicketsApiService } from '../../core/tickets-api.service';
import { ToastService } from '../../core/toast.service';
import { PriorityBadgeComponent } from '../../shared/priority-badge.component';
import { StatusLabelPipe } from '../../shared/status-label.pipe';
import { CommentsPanelComponent } from '../comments-panel/comments-panel.component';

const TODAY = '2026-10-17';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  imports: [RouterLink, DatePipe, PriorityBadgeComponent, StatusLabelPipe, CommentsPanelComponent],
})
export class TicketDetailComponent {
  /** Ćw. 7: :id z routera jako signal input (withComponentInputBinding), zamiast resolvera i route.data.subscribe. */
  readonly id = input.required({ transform: numberAttribute });

  private api = inject(TicketsApiService);
  private toast = inject(ToastService);
  private document = inject(DOCUMENT);

  protected readonly statuses = STATUSES;
  protected readonly saving = signal(false);

  protected readonly ticket = httpResource<Ticket>(() => `/api/tickets/${this.id()}`);

  /** Zasób zależny: chain() przenosi stan (loading/error) ticketu na assignee. */
  protected readonly assignee = httpResource<User>(({ chain }) => {
    const t = chain(this.ticket);
    return t?.assigneeId ? `/api/users/${t.assigneeId}` : undefined;
  });

  /** Stan pochodny: liczony z sygnału, nie ustawiany ręcznie w subscribe. */
  protected readonly isOverdue = computed(() => {
    const t = this.ticket.hasValue() ? this.ticket.value() : undefined;
    return !!t?.dueDate && t.dueDate < TODAY && t.status !== 'resolved' && t.status !== 'closed';
  });

  constructor() {
    // Dobry przypadek dla effect(): synchronizacja sygnału ze światem poza Angularem (DOM, localStorage, logi).
    // Zły przypadek: ustawianie innego sygnału na podstawie tego (od tego jest computed/linkedSignal).
    effect(() => {
      if (this.ticket.hasValue()) {
        const t = this.ticket.value();
        this.document.title = `#${t.id} ${t.title} | Helpdesk`;
      }
    });
  }

  protected changeStatus(status: TicketStatus): void {
    if (!this.ticket.hasValue()) return;
    // Aktualizacja optymistyczna: nowy obiekt w zasobie, przy błędzie przeładowanie z serwera.
    const updated = { ...this.ticket.value(), status };
    this.ticket.set(updated);
    this.saving.set(true);
    this.api.update(updated.id, updated).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.show('Zmieniono status');
      },
      error: () => {
        this.saving.set(false);
        this.ticket.reload();
        this.toast.show('Nie udało się zapisać', 'error');
      },
    });
  }
}
