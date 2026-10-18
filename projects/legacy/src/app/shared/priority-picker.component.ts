import { ChangeDetectorRef, Component, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PRIORITIES, TicketPriority } from '@helpdesk/shared';

/**
 * Własna kontrolka formularza oparta o ControlValueAccessor.
 * Ćw. 5: działa bez zone.js, bo zmiany z zewnątrz (writeValue, setDisabledState) wołają markForCheck(),
 * a kliknięcie to zdarzenie z szablonu, które samo oznacza widok do odświeżenia.
 */
@Component({
  selector: 'app-priority-picker',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PriorityPickerComponent), multi: true }],
  template: `
    <div class="picker" role="radiogroup">
      @for (p of priorities; track p) {
        <button type="button" [class.selected]="p === value" [disabled]="disabled" (click)="select(p)" (blur)="onTouched()">
          {{ p }}
        </button>
      }
    </div>
  `,
})
export class PriorityPickerComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  priorities = PRIORITIES;
  value: TicketPriority | null = null;
  disabled = false;

  private onChange: (v: TicketPriority) => void = () => {};
  onTouched: () => void = () => {};

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
    this.cdr.markForCheck();
  }
}
