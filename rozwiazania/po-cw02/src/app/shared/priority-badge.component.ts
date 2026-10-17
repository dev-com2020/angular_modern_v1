import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TicketPriority } from '@helpdesk/shared';
import { NgClass } from '@angular/common';

const LABELS: Record<TicketPriority, string> = {
  low: 'Niski',
  medium: 'Średni',
  high: 'Wysoki',
  critical: 'Krytyczny',
};

/**
 * Typowy "stary" komponent prezentacyjny:
 * - @Input z getterem i setterem (normalizacja wartości),
 * - ngOnChanges do wyliczania stanu pochodnego,
 * - @Output z EventEmitter.
 */
@Component({
  selector: 'app-priority-badge',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <span class="badge" [ngClass]="priority" [title]="tooltip" (click)="onClick()">
      {{ label }}
      @if (showEscalation && escalated) {
        <span> ⬆</span>
      }
    </span>
  `,
  imports: [NgClass],
})
export class PriorityBadgeComponent implements OnChanges {
  private _priority: TicketPriority = 'medium';

  @Input()
  set priority(value: TicketPriority | string | null | undefined) {
    // normalizacja: backend czasem zwraca wielkie litery albo null
    const v = (value ?? 'medium').toString().toLowerCase() as TicketPriority;
    this._priority = v in LABELS ? v : 'medium';
  }
  get priority(): TicketPriority {
    return this._priority;
  }

  @Input() showEscalation = false;
  @Input() dueDate: string | null = null;

  @Output() badgeClick = new EventEmitter<TicketPriority>();

  label = '';
  tooltip = '';
  escalated = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['priority'] || changes['dueDate']) {
      this.label = LABELS[this.priority];
      this.escalated =
        this.priority === 'critical' || (!!this.dueDate && this.dueDate < '2026-10-17');
      this.tooltip = this.escalated ? `${this.label}, wymaga eskalacji` : this.label;
    }
  }

  onClick(): void {
    this.badgeClick.emit(this.priority);
  }
}
