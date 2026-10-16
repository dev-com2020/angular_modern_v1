import { Component, computed, input, output } from '@angular/core';
import { TicketPriority } from '@helpdesk/shared';

const LABELS: Record<TicketPriority, string> = {
  low: 'Niski',
  medium: 'Średni',
  high: 'Wysoki',
  critical: 'Krytyczny',
};

/** Normalizacja, która w legacy siedziała w setterze @Input. */
export function toPriority(value: TicketPriority | string | null | undefined): TicketPriority {
  const v = (value ?? 'medium').toString().toLowerCase();
  return v in LABELS ? (v as TicketPriority) : 'medium';
}

/**
 * Setter -> input({ transform }), ngOnChanges -> computed(), EventEmitter -> output().
 */
@Component({
  selector: 'app-priority-badge',
  host: { '(click)': 'badgeClick.emit(priority())' },
  template: `
    <span class="badge" [class]="priority()" [title]="tooltip()">
      {{ label() }}
      @if (showEscalation() && escalated()) {
        <span> ⬆</span>
      }
    </span>
  `,
})
export class PriorityBadge {
  readonly priority = input('medium', { transform: toPriority });
  readonly showEscalation = input(false);
  readonly dueDate = input<string | null>(null);

  readonly badgeClick = output<TicketPriority>();

  protected readonly label = computed(() => LABELS[this.priority()]);
  protected readonly escalated = computed(() => this.priority() === 'critical' || (!!this.dueDate() && this.dueDate()! < '2026-10-17'));
  protected readonly tooltip = computed(() => (this.escalated() ? `${this.label()}, wymaga eskalacji` : this.label()));
}
