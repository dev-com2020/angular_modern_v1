import { Component, input, model, output } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { PRIORITIES, TicketPriority } from '@helpdesk/shared';

/**
 * ControlValueAccessor -> FormValueControl.
 * Wystarczy model() o nazwie `value`; disabled i touch są opcjonalne.
 * Od v22 taka kontrolka działa też z formControlName i ngModel.
 */
@Component({
  selector: 'app-priority-picker',
  template: `
    <div class="picker" role="radiogroup">
      @for (p of priorities; track p) {
        <button type="button" [class.selected]="p === value()" [disabled]="disabled()" (click)="value.set(p)" (blur)="touch.emit()">
          {{ p }}
        </button>
      }
    </div>
  `,
})
export class PriorityPicker implements FormValueControl<TicketPriority> {
  readonly value = model<TicketPriority>('medium');
  readonly disabled = input(false);
  readonly touch = output<void>();
  protected readonly priorities = PRIORITIES;
}
