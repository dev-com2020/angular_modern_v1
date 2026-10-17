import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { STATUSES, Ticket, TicketStatus, User } from '@helpdesk/shared';
import { TicketsApiService } from '../../core/tickets-api.service';
import { UsersApiService } from '../../core/users-api.service';
import { ToastService } from '../../core/toast.service';
import { DatePipe } from '@angular/common';
import { PriorityBadgeComponent } from '../../shared/priority-badge.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommentsPanelComponent } from '../comments-panel/comments-panel.component';
import { StatusLabelPipe } from '../../shared/status-label.pipe';

@Component({
  selector: 'app-ticket-detail',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './ticket-detail.component.html',
  imports: [
    RouterLink,
    PriorityBadgeComponent,
    ReactiveFormsModule,
    CommentsPanelComponent,
    DatePipe,
    StatusLabelPipe,
  ],
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(TicketsApiService);
  private usersApi = inject(UsersApiService);
  private toast = inject(ToastService);

  ticket: Ticket | null = null;
  assignee: User | null = null;
  statuses = STATUSES;
  saving = false;
  private sub = new Subscription();

  ngOnInit(): void {
    // Zagnieżdżone subscribe: dane z resolvera, potem osobne żądanie po użytkownika.
    this.sub.add(
      this.route.data.subscribe((data) => {
        this.ticket = data['ticket'];
        this.assignee = null;
        if (this.ticket?.assigneeId) {
          this.sub.add(
            this.usersApi.getById(this.ticket.assigneeId).subscribe((u) => (this.assignee = u)),
          );
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
