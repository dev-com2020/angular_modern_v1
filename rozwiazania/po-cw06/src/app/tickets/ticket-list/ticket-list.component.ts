import { Component, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PRIORITIES, STATUSES, User } from '@helpdesk/shared';
import { UsersApiService } from '../../core/users-api.service';
import { HighlightOverdueDirective } from '../../shared/highlight-overdue.directive';
import { PriorityBadgeComponent } from '../../shared/priority-badge.component';
import { StatusLabelPipe } from '../../shared/status-label.pipe';
import { TicketListFacade, TicketListFilters } from './ticket-list.facade';

@Component({
  selector: 'app-ticket-list',
  providers: [TicketListFacade],
  templateUrl: './ticket-list.component.html',
  imports: [ReactiveFormsModule, HighlightOverdueDirective, RouterLink, PriorityBadgeComponent, DatePipe, StatusLabelPipe],
})
export class TicketListComponent {
  protected readonly facade = inject(TicketListFacade);
  private readonly usersApi = inject(UsersApiService);
  private readonly fb = inject(FormBuilder);

  protected readonly statuses = STATUSES;
  protected readonly priorities = PRIORITIES;
  protected readonly filtersForm = this.fb.nonNullable.group({
    q: '',
    status: 'all' as TicketListFilters['status'],
    priority: 'all' as TicketListFilters['priority'],
  });

  /** Mapa ticketId -> przypisany użytkownik. Wypełniana zapytaniem per wiersz (N+1). */
  protected readonly assignees = signal<Record<number, User>>({});

  constructor() {
    // Ćw. 6: takeUntilDestroyed() sam kończy subskrypcję przy niszczeniu komponentu.
    this.filtersForm.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => this.facade.setFilters(value));

    // ANTYWZORZEC (naprawiony w ćw. 7): żądanie HTTP w pętli, osobno dla każdego wiersza.
    // Efekt śledzi tylko tickets(); mapę czytamy w untracked, inaczej każdy dopisany użytkownik odpalałby efekt ponownie.
    effect(() => {
      const tickets = this.facade.tickets();
      untracked(() => {
        tickets.forEach((ticket) => {
          if (ticket.assigneeId && !this.assignees()[ticket.id]) {
            this.usersApi.getById(ticket.assigneeId).subscribe((user) => {
              this.assignees.update((map) => ({ ...map, [ticket.id]: user }));
            });
          }
        });
      });
    });
  }
}
