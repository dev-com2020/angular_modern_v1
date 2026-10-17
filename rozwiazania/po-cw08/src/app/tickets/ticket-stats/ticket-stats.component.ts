import { AfterViewInit, Component, ElementRef, viewChild } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { PRIORITIES, STATUSES, TicketStats } from '@helpdesk/shared';
import { PriorityBadgeComponent } from '../../shared/priority-badge.component';
import { StatusLabelPipe } from '../../shared/status-label.pipe';

@Component({
  selector: 'app-ticket-stats',
  imports: [PriorityBadgeComponent, StatusLabelPipe],
  template: `
    <h1>Statystyki</h1>
    @if (stats.error()) {
      <div class="card error">Nie udało się pobrać statystyk. <button (click)="stats.reload()">Ponów</button></div>
    } @else if (stats.hasValue()) {
      @let data = stats.value();
      <div class="card">
        <h2>Wg statusu</h2>
        <div class="stats">
          @for (s of statuses; track s) {
            <div class="stat"><b>{{ data.byStatus[s] }}</b>{{ s | statusLabel }}</div>
          }
          <div class="stat"><b>{{ data.overdue }}</b>Po terminie</div>
        </div>
      </div>
      <!-- Ćw. 2: sekcja mniej ważna, renderowana w czasie bezczynności (najpóźniej po 500 ms). -->
      @defer (on idle(500ms)) {
        <div class="card">
          <h2>Wg priorytetu</h2>
          <div class="stats">
            @for (p of priorities; track p) {
              <div class="stat"><b>{{ data.byPriority[p] }}</b><app-priority-badge [priority]="p" /></div>
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
      <p #clock class="muted"></p>
    </div>
  `,
})
export class TicketStatsComponent implements AfterViewInit {
  readonly clock = viewChild.required<ElementRef<HTMLParagraphElement>>('clock');

  /** Ćw. 7: zasób ze stanem loading/error i reload() zamiast subscribe. */
  protected readonly stats = httpResource<TicketStats>(() => '/api/tickets/stats');
  protected readonly statuses = STATUSES;
  protected readonly priorities = PRIORITIES;

  ngAfterViewInit(): void {
    this.clock().nativeElement.textContent = new Date().toLocaleTimeString('pl-PL');
  }
}
