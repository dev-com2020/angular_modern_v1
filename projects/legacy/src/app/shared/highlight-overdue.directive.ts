import { Directive, computed, input, signal } from '@angular/core';

/** Ćw. 4: dekoratory hosta -> host: {}, dekorator wejścia -> input(), stan -> sygnał. */
@Directive({
  selector: '[appHighlightOverdue]',
  host: {
    '[style.background]': 'background()',
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)',
  },
})
export class HighlightOverdueDirective {
  readonly dueDate = input<string | null>(null, { alias: 'appHighlightOverdue' });
  readonly status = input('');

  protected readonly hovered = signal(false);

  protected readonly background = computed(() => {
    if (this.hovered()) return '#f2f4f7';
    const due = this.dueDate();
    const status = this.status();
    const overdue = !!due && due < '2026-10-17' && status !== 'resolved' && status !== 'closed';
    return overdue ? '#fff6f6' : '';
  });
}
