import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PRIORITIES, STATUSES, TicketStats } from '@helpdesk/shared';
import { TicketsApiService } from '../../core/tickets-api.service';
import { NgIf, NgFor } from '@angular/common';
import { PriorityBadgeComponent } from '../../shared/priority-badge.component';
import { StatusLabelPipe } from '../../shared/status-label.pipe';

@Component({
  selector: 'app-ticket-stats',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <h1>Statystyki</h1>
    <div class="card" *ngIf="stats; else loading">
      <h2>Wg statusu</h2>
      <div class="stats">
        <div class="stat" *ngFor="let s of statuses">
          <b>{{ stats.byStatus[s] }}</b
          >{{ s | statusLabel }}
        </div>
        <div class="stat">
          <b>{{ stats.overdue }}</b
          >Po terminie
        </div>
      </div>
      <h2 style="margin-top: 16px">Wg priorytetu</h2>
      <div class="stats">
        <div class="stat" *ngFor="let p of priorities">
          <b>{{ stats.byPriority[p] }}</b
          ><app-priority-badge [priority]="p"></app-priority-badge>
        </div>
      </div>
    </div>
    <ng-template #loading
      ><div class="card">
        <div class="skeleton"></div>
        <div class="skeleton"></div></div
    ></ng-template>
    <div class="card">
      <h2>Odświeżono</h2>
      <p #clock class="muted"></p>
    </div>
  `,
  imports: [NgIf, NgFor, PriorityBadgeComponent, StatusLabelPipe],
})
export class TicketStatsComponent implements OnInit, AfterViewInit {
  @ViewChild('clock') clock!: ElementRef<HTMLParagraphElement>;
  stats: TicketStats | null = null;
  statuses = STATUSES;
  priorities = PRIORITIES;

  constructor(private api: TicketsApiService) {}

  ngOnInit(): void {
    this.api.stats().subscribe((s) => (this.stats = s));
  }

  ngAfterViewInit(): void {
    this.clock.nativeElement.textContent = new Date().toLocaleTimeString('pl-PL');
  }
}
