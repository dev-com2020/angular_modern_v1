import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PRIORITIES, STATUSES, TicketPriority, TicketStatus } from '@helpdesk/shared';
import { Users } from '../../core/users';
import { PriorityBadge } from '../../shared/priority-badge';
import { StatusLabelPipe } from '../../shared/status-label.pipe';
import { HighlightOverdue } from '../../shared/highlight-overdue';
import { TicketsStore } from '../tickets.store';

@Component({
  selector: 'app-ticket-list',
  imports: [RouterLink, DatePipe, PriorityBadge, StatusLabelPipe, HighlightOverdue],
  providers: [TicketsStore],
  templateUrl: './ticket-list.html',
})
export class TicketList {
  protected readonly store = inject(TicketsStore);
  protected readonly users = inject(Users);
  protected readonly statuses = STATUSES;
  protected readonly priorities = PRIORITIES;

  protected onStatus(value: string): void {
    this.store.setStatus(value as TicketStatus | 'all');
  }

  protected onPriority(value: string): void {
    this.store.setPriority(value as TicketPriority | 'all');
  }
}
