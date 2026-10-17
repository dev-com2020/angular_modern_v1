import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PRIORITIES, TicketPriority } from '@helpdesk/shared';
import { NgFor } from '@angular/common';

/** Własna kontrolka formularza oparta o ControlValueAccessor. */
@Component({
  selector: 'app-priority-picker',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PriorityPickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="picker" role="radiogroup">
      <button
        type="button"
        *ngFor="let p of priorities"
        [class.selected]="p === value"
        [disabled]="disabled"
        (click)="select(p)"
        (blur)="onTouched()"
      >
        {{ p }}
      </button>
    </div>
  `,
  imports: [NgFor],
})
export class PriorityPickerComponent implements ControlValueAccessor {
  priorities = PRIORITIES;
  value: TicketPriority | null = null;
  disabled = false;

  private onChange: (v: TicketPriority) => void = () => {};
  onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  select(p: TicketPriority): void {
    this.value = p;
    this.onChange(p);
    this.onTouched();
  }

  writeValue(v: TicketPriority | null): void {
    this.value = v;
    this.cdr.markForCheck();
  }
  registerOnChange(fn: (v: TicketPriority) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
