import { Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/** Ćw. 8: błędy pola w jednym miejscu, zamiast kopiowania warunków touched && errors pod każdym polem. */
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
export class FieldErrorsComponent {
  readonly field = input.required<FieldTree<unknown>>();
}
