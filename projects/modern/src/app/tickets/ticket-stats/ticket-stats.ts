import { Component, Resource, WritableResource, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PRIORITIES, Page, STATUSES, Ticket, TicketStats } from '@helpdesk/shared';
import { PriorityBadge } from '../../shared/priority-badge';
import { StatusLabelPipe } from '../../shared/status-label.pipe';

/**
 * Dane przychodzą z trasy (router resources, v22.2), nie z komponentu.
 * Zobacz `resources` przy ścieżce 'stats' w app.routes.ts.
 */
@Component({
  selector: 'app-ticket-stats',
  imports: [PriorityBadge, StatusLabelPipe, RouterLink, DatePipe],
  template: `
    <h1>Statystyki</h1>
    <div class="card">
      <h2>Wg statusu</h2>
      <div class="stats">
        @for (st of statuses; track st) {
          <div class="stat"><b>{{ stats().byStatus[st] }}</b>{{ st | statusLabel }}</div>
        }
        <div class="stat"><b>{{ stats().overdue }}</b>Po terminie</div>
      </div>
    </div>
    @defer (on idle(500ms)) {
      <div class="card">
        <h2>Wg priorytetu</h2>
        <div class="stats">
          @for (p of priorities; track p) {
            <div class="stat"><b>{{ stats().byPriority[p] }}</b><app-priority-badge [priority]="p" /></div>
          }
        </div>
      </div>
    } @placeholder {
      <div class="card"><div class="skeleton"></div></div>
    }
    <div class="card">
      <h2>Najnowsze zgłoszenia</h2>
      @if (recent().error()) {
        <p class="error">Nie udało się pobrać najnowszych. <button (click)="recent().reload()">Ponów</button></p>
      } @else if (recent().hasValue()) {
        @for (t of recent().value()!.items; track t.id) {
          <div><a [routerLink]="['/tickets', t.id]">#{{ t.id }} {{ t.title }}</a> <span class="muted">{{ t.createdAt | date: 'dd.MM' }}</span></div>
        }
      } @else {
        <div class="skeleton"></div><div class="skeleton"></div>
      }
    </div>
    <div class="card">
      <h2>Odświeżono</h2>
      <p class="muted">{{ refreshedAt }}</p>
    </div>
  `,
})
export class TicketStatsPage {
  /** Blokujący zasób trasy: komponent nigdy nie widzi stanu "ładuje się". */
  readonly stats = input.required<TicketStats>();
  /** Nieblokujący zasób trasy: komponent sam obsługuje loading/error. */
  readonly recent = input.required<Resource<Page<Ticket> | undefined> & Pick<WritableResource<unknown>, 'reload'>>();

  protected readonly statuses = STATUSES;
  protected readonly priorities = PRIORITIES;
  protected readonly refreshedAt = new Date().toLocaleTimeString('pl-PL');
}
