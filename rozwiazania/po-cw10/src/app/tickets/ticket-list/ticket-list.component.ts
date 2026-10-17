import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PRIORITIES, STATUSES, TicketPriority, TicketStatus } from '@helpdesk/shared';
import { UsersStore } from '../../core/users.store';
import { HighlightOverdueDirective } from '../../shared/highlight-overdue.directive';
import { PriorityBadgeComponent } from '../../shared/priority-badge.component';
import { StatusLabelPipe } from '../../shared/status-label.pipe';
import { TicketsStore } from '../tickets.store';

/** Ćw. 9: cały stan listy w TicketsStore, komponent tylko deleguje. */
@Component({
  selector: 'app-ticket-list',
  providers: [TicketsStore],
  templateUrl: './ticket-list.component.html',
  imports: [HighlightOverdueDirective, RouterLink, PriorityBadgeComponent, DatePipe, StatusLabelPipe],
})
export class TicketListComponent {
  protected readonly store = inject(TicketsStore);
  protected readonly users = inject(UsersStore);
  protected readonly statuses = STATUSES;
  protected readonly priorities = PRIORITIES;

  protected onStatus(value: string): void {
    this.store.setStatus(value as TicketStatus | 'all');
  }

  protected onPriority(value: string): void {
    this.store.setPriority(value as TicketPriority | 'all');
  }
}
