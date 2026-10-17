import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { PRIORITIES, STATUSES, TicketStats } from '@helpdesk/shared';
import { TicketsApiService } from '../../core/tickets-api.service';

import { PriorityBadgeComponent } from '../../shared/priority-badge.component';
import { StatusLabelPipe } from '../../shared/status-label.pipe';

@Component({
  selector: 'app-ticket-stats',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <h1>Statystyki</h1>
    @if (stats) {
      <div class="card">
        <h2>Wg statusu</h2>
        <div class="stats">
          @for (s of statuses; track s) {
            <div class="stat">
              <b>{{ stats.byStatus[s] }}</b
              >{{ s | statusLabel }}
            </div>
          }
          <div class="stat">
            <b>{{ stats.overdue }}</b
            >Po terminie
          </div>
        </div>
        <h2 style="margin-top: 16px">Wg priorytetu</h2>
        <div class="stats">
          @for (p of priorities; track p) {
            <div class="stat">
              <b>{{ stats.byPriority[p] }}</b
              ><app-priority-badge [priority]="p"></app-priority-badge>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="card">
        <div class="skeleton"></div>
        <div class="skeleton"></div>
      </div>
    }
    <div class="card">
      <h2>Odświeżono</h2>
      <p #clock class="muted"></p>
    </div>
  `,
  imports: [PriorityBadgeComponent, StatusLabelPipe],
})
export class TicketStatsComponent implements OnInit, AfterViewInit {
  private api = inject(TicketsApiService);

  @ViewChild('clock') clock!: ElementRef<HTMLParagraphElement>;
  stats: TicketStats | null = null;
  statuses = STATUSES;
  priorities = PRIORITIES;

  ngOnInit(): void {
    this.api.stats().subscribe((s) => (this.stats = s));
  }

  ngAfterViewInit(): void {
    this.clock.nativeElement.textContent = new Date().toLocaleTimeString('pl-PL');
  }
}
