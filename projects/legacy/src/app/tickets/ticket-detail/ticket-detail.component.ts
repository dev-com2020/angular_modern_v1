import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { STATUSES, Ticket, TicketStatus, User } from '@helpdesk/shared';
import { TicketsApiService } from '../../core/tickets-api.service';
import { UsersApiService } from '../../core/users-api.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './ticket-detail.component.html',
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  ticket: Ticket | null = null;
  assignee: User | null = null;
  statuses = STATUSES;
  saving = false;
  private sub = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private api: TicketsApiService,
    private usersApi: UsersApiService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    // Zagnieżdżone subscribe: dane z resolvera, potem osobne żądanie po użytkownika.
    this.sub.add(
      this.route.data.subscribe((data) => {
        this.ticket = data['ticket'];
        this.assignee = null;
        if (this.ticket?.assigneeId) {
          this.sub.add(this.usersApi.getById(this.ticket.assigneeId).subscribe((u) => (this.assignee = u)));
        }
      }),
    );
  }

  changeStatus(status: TicketStatus): void {
    if (!this.ticket) return;
    this.saving = true;
    // ANTYWZORZEC przy OnPush: mutacja obiektu w miejscu.
    this.ticket.status = status;
    this.api.update(this.ticket.id, this.ticket).subscribe({
      next: () => {
        this.saving = false;
        this.toast.show('Zmieniono status');
      },
      error: () => {
        this.saving = false;
        this.toast.show('Nie udało się zapisać', 'error');
      },
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
