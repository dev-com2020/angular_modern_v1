import { Component, computed, input, output } from '@angular/core';
import { TicketPriority } from '@helpdesk/shared';

const LABELS: Record<TicketPriority, string> = {
  low: 'Niski',
  medium: 'Średni',
  high: 'Wysoki',
  critical: 'Krytyczny',
};

/** Normalizacja, która wcześniej siedziała w setterze inputu: backend czasem zwraca wielkie litery albo null. */
export function toPriority(value: TicketPriority | string | null | undefined): TicketPriority {
  const v = (value ?? 'medium').toString().toLowerCase();
  return v in LABELS ? (v as TicketPriority) : 'medium';
}

/**
 * Ćw. 4: setter -> input({ transform }), stan liczony w hooku zmian -> computed(), emiter -> output().
 */
@Component({
  selector: 'app-priority-badge',
  template: `
    <span class="badge" [class]="priority()" [title]="tooltip()" (click)="badgeClick.emit(priority())">
      {{ label() }}
      @if (showEscalation() && escalated()) {
        <span> ⬆</span>
      }
    </span>
  `,
})
export class PriorityBadgeComponent {
  readonly priority = input('medium', { transform: toPriority });
  readonly showEscalation = input(false);
  readonly dueDate = input<string | null>(null);

  readonly badgeClick = output<TicketPriority>();

  protected readonly label = computed(() => LABELS[this.priority()]);
  protected readonly escalated = computed(() => {
    const due = this.dueDate();
    return this.priority() === 'critical' || (!!due && due < '2026-10-17');
  });
  protected readonly tooltip = computed(() => (this.escalated() ? `${this.label()}, wymaga eskalacji` : this.label()));
}
