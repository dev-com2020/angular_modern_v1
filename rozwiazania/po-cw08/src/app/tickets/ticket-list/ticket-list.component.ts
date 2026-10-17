import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PRIORITIES, STATUSES } from '@helpdesk/shared';
import { UsersStore } from '../../core/users.store';
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
  /** Ćw. 7: jedno żądanie po użytkowników zamiast żądania na każdy wiersz. */
  protected readonly users = inject(UsersStore);
  private readonly fb = inject(FormBuilder);

  protected readonly statuses = STATUSES;
  protected readonly priorities = PRIORITIES;
  protected readonly filtersForm = this.fb.nonNullable.group({
    q: '',
    status: 'all' as TicketListFilters['status'],
    priority: 'all' as TicketListFilters['priority'],
  });

  constructor() {
    // Ćw. 6: takeUntilDestroyed() sam kończy subskrypcję przy niszczeniu komponentu.
    this.filtersForm.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => this.facade.setFilters(value));
  }
}
