import { Component } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { PRIORITIES, STATUSES, TicketStats } from '@helpdesk/shared';
import { PriorityBadge } from '../../shared/priority-badge';
import { StatusLabelPipe } from '../../shared/status-label.pipe';

@Component({
  selector: 'app-ticket-stats',
  imports: [PriorityBadge, StatusLabelPipe],
  template: `
    <h1>Statystyki</h1>
    @if (stats.error()) {
      <div class="card error">Nie udało się pobrać statystyk. <button (click)="stats.reload()">Ponów</button></div>
    } @else if (stats.hasValue()) {
      @let s = stats.value();
      <div class="card">
        <h2>Wg statusu</h2>
        <div class="stats">
          @for (st of statuses; track st) {
            <div class="stat"><b>{{ s.byStatus[st] }}</b>{{ st | statusLabel }}</div>
          }
          <div class="stat"><b>{{ s.overdue }}</b>Po terminie</div>
        </div>
      </div>
      @defer (on idle(500ms)) {
        <div class="card">
          <h2>Wg priorytetu</h2>
          <div class="stats">
            @for (p of priorities; track p) {
              <div class="stat"><b>{{ s.byPriority[p] }}</b><app-priority-badge [priority]="p" /></div>
            }
          </div>
        </div>
      } @placeholder {
        <div class="card"><div class="skeleton"></div></div>
      }
    } @else {
      <div class="card"><div class="skeleton"></div><div class="skeleton"></div></div>
    }
    <div class="card">
      <h2>Odświeżono</h2>
      <p class="muted">{{ refreshedAt }}</p>
    </div>
  `,
})
export class TicketStatsPage {
  protected readonly stats = httpResource<TicketStats>(() => '/api/tickets/stats');
  protected readonly statuses = STATUSES;
  protected readonly priorities = PRIORITIES;
  // Zamiast @ViewChild + nativeElement.textContent: zwykłe wiązanie.
  protected readonly refreshedAt = new Date().toLocaleTimeString('pl-PL');
}
