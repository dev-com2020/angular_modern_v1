import { Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/** Mały komponent do wyświetlania błędów pola: koniec z kopiowaniem *ngIf="ctrl.touched && ctrl.errors?.x". */
@Component({
  selector: 'app-field-errors',
  template: `
    @let state = field()();
    @if (state.pending()) {
      <div class="hint">Sprawdzam...</div>
    }
    @if (state.touched() && state.invalid()) {
      @for (e of state.errors(); track e.kind) {
        <div class="error">{{ e.message ?? e.kind }}</div>
      }
    }
  `,
})
export class FieldErrors {
  readonly field = input.required<FieldTree<unknown>>();
}
