import { Directive, computed, input, signal } from '@angular/core';

/** @HostBinding/@HostListener -> host: {}, @Input -> input(), stan -> sygnał. */
@Directive({
  selector: '[appHighlightOverdue]',
  host: {
    '[style.background]': 'background()',
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)',
  },
})
export class HighlightOverdue {
  readonly dueDate = input<string | null>(null, { alias: 'appHighlightOverdue' });
  readonly status = input('');
  protected readonly hovered = signal(false);

  protected readonly background = computed(() => {
    if (this.hovered()) return '#f2f4f7';
    const due = this.dueDate();
    const overdue = !!due && due < '2026-10-17' && this.status() !== 'resolved' && this.status() !== 'closed';
    return overdue ? '#fff6f6' : '';
  });
}
