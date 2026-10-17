import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PRIORITIES, STATUSES, Ticket, User } from '@helpdesk/shared';
import { UsersApiService } from '../../core/users-api.service';
import { TicketListFacade, TicketListVm } from './ticket-list.facade';
import {
  NgFor,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  AsyncPipe,
  DatePipe,
} from '@angular/common';
import { HighlightOverdueDirective } from '../../shared/highlight-overdue.directive';
import { RouterLink } from '@angular/router';
import { PriorityBadgeComponent } from '../../shared/priority-badge.component';
import { StatusLabelPipe } from '../../shared/status-label.pipe';

@Component({
  selector: 'app-ticket-list',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [TicketListFacade],
  templateUrl: './ticket-list.component.html',
  imports: [
    ReactiveFormsModule,
    NgFor,
    NgIf,
    HighlightOverdueDirective,
    RouterLink,
    PriorityBadgeComponent,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    AsyncPipe,
    DatePipe,
    StatusLabelPipe,
  ],
})
export class TicketListComponent implements OnInit, OnDestroy {
  private facade = inject(TicketListFacade);
  private usersApi = inject(UsersApiService);
  private fb = inject(FormBuilder);

  vm$: Observable<TicketListVm>;
  statuses = STATUSES;
  priorities = PRIORITIES;
  filtersForm!: FormGroup;

  /** Mapa ticketId -> przypisany użytkownik. Wypełniana zapytaniem per wiersz (N+1). */
  assignees: { [ticketId: number]: User } = {};

  private destroy$ = new Subject<void>();

  constructor() {
    this.vm$ = this.facade.vm$;
  }

  ngOnInit(): void {
    this.filtersForm = this.fb.group({ q: [''], status: ['all'], priority: ['all'] });
    this.filtersForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => this.facade.setFilters(value));

    // ANTYWZORZEC: żądanie HTTP w pętli, osobno dla każdego wiersza.
    this.vm$.pipe(takeUntil(this.destroy$)).subscribe((vm) => {
      vm.tickets.forEach((ticket) => {
        if (ticket.assigneeId && !this.assignees[ticket.id]) {
          this.usersApi.getById(ticket.assigneeId).subscribe((user) => {
            this.assignees[ticket.id] = user;
          });
        }
      });
    });
  }

  trackById(_: number, ticket: Ticket): number {
    return ticket.id;
  }

  prev(vm: TicketListVm): void {
    if (vm.page > 1) this.facade.setPage(vm.page - 1);
  }

  next(vm: TicketListVm): void {
    if (vm.page < vm.pageCount) this.facade.setPage(vm.page + 1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
