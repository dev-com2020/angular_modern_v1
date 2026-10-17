import { AfterViewInit, Component, ElementRef, Resource, WritableResource, input, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PRIORITIES, Page, STATUSES, Ticket, TicketStats } from '@helpdesk/shared';
import { PriorityBadgeComponent } from '../../shared/priority-badge.component';
import { StatusLabelPipe } from '../../shared/status-label.pipe';

/**
 * Ćw. 12: dane przychodzą z trasy (router resources), nie z komponentu.
 * Zobacz `resources` przy ścieżce 'stats' w tickets.routes.ts.
 */
@Component({
  selector: 'app-ticket-stats',
  imports: [PriorityBadgeComponent, StatusLabelPipe, RouterLink, DatePipe],
  template: `
    <h1>Statystyki</h1>
    <div class="card">
      <h2>Wg statusu</h2>
      <div class="stats">
        @for (s of statuses; track s) {
          <div class="stat"><b>{{ stats().byStatus[s] }}</b>{{ s | statusLabel }}</div>
        }
        <div class="stat"><b>{{ stats().overdue }}</b>Po terminie</div>
      </div>
    </div>
    <!-- Ćw. 2: sekcja mniej ważna, renderowana w czasie bezczynności (najpóźniej po 500 ms). -->
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
      <p #clock class="muted"></p>
    </div>
  `,
})
export class TicketStatsComponent implements AfterViewInit {
  /** Blokujący zasób trasy: komponent nigdy nie widzi stanu "ładuje się" ani błędu. */
  readonly stats = input.required<TicketStats>();
  /** Nieblokujący zasób trasy: komponent sam obsługuje loading/error. */
  readonly recent = input.required<Resource<Page<Ticket> | undefined> & Pick<WritableResource<unknown>, 'reload'>>();

  readonly clock = viewChild.required<ElementRef<HTMLParagraphElement>>('clock');
  protected readonly statuses = STATUSES;
  protected readonly priorities = PRIORITIES;

  ngAfterViewInit(): void {
    this.clock().nativeElement.textContent = new Date().toLocaleTimeString('pl-PL');
  }
}
