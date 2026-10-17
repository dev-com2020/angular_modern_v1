import { ChangeDetectionStrategy, Component, DOCUMENT, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { STATUSES, Ticket, TicketStatus, User } from '@helpdesk/shared';
import { TicketsApiService } from '../../core/tickets-api.service';
import { UsersApiService } from '../../core/users-api.service';
import { ToastService } from '../../core/toast.service';
import { PriorityBadgeComponent } from '../../shared/priority-badge.component';
import { StatusLabelPipe } from '../../shared/status-label.pipe';
import { CommentsPanelComponent } from '../comments-panel/comments-panel.component';

const TODAY = '2026-10-17';

@Component({
  selector: 'app-ticket-detail',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './ticket-detail.component.html',
  imports: [RouterLink, DatePipe, PriorityBadgeComponent, StatusLabelPipe, CommentsPanelComponent],
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(TicketsApiService);
  private usersApi = inject(UsersApiService);
  private toast = inject(ToastService);
  private document = inject(DOCUMENT);

  // Ćw. 3: stan widoku jako sygnały.
  protected readonly ticket = signal<Ticket | null>(null);
  protected readonly assignee = signal<User | null>(null);
  protected readonly saving = signal(false);
  protected readonly statuses = STATUSES;

  /** Stan pochodny: liczony z sygnału, nie ustawiany ręcznie w subscribe. */
  protected readonly isOverdue = computed(() => {
    const t = this.ticket();
    return !!t?.dueDate && t.dueDate < TODAY && t.status !== 'resolved' && t.status !== 'closed';
  });

  private sub = new Subscription();

  constructor() {
    // Dobry przypadek dla effect(): synchronizacja sygnału ze światem poza Angularem (DOM, localStorage, logi).
    // Zły przypadek: ustawianie innego sygnału na podstawie tego (od tego jest computed/linkedSignal).
    effect(() => {
      const t = this.ticket();
      if (t) this.document.title = `#${t.id} ${t.title} | Helpdesk`;
    });
  }

  ngOnInit(): void {
    // Zagnieżdżone subscribe: dane z resolvera, potem osobne żądanie po użytkownika.
    this.sub.add(
      this.route.data.subscribe((data) => {
        const ticket: Ticket = data['ticket'];
        this.ticket.set(ticket);
        this.assignee.set(null);
        if (ticket.assigneeId) {
          this.sub.add(this.usersApi.getById(ticket.assigneeId).subscribe((u) => this.assignee.set(u)));
        }
      }),
    );
  }

  protected changeStatus(status: TicketStatus): void {
    const current = this.ticket();
    if (!current) return;
    // Nowy obiekt zamiast mutacji w miejscu.
    const updated = { ...current, status };
    this.ticket.set(updated);
    this.saving.set(true);
    this.api.update(current.id, updated).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.show('Zmieniono status');
      },
      error: () => {
        this.saving.set(false);
        this.ticket.set(current);
        this.toast.show('Nie udało się zapisać', 'error');
      },
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
