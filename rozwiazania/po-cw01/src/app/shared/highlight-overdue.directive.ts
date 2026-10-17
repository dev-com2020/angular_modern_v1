import { Directive, HostBinding, HostListener, Input } from '@angular/core';

/** Dyrektywa z @HostBinding/@HostListener, do migracji na `host: {}` i signal input. */
@Directive({ selector: '[appHighlightOverdue]' })
export class HighlightOverdueDirective {
  @Input('appHighlightOverdue') dueDate: string | null = null;
  @Input() status = '';

  private hovered = false;

  @HostBinding('style.background')
  get background(): string {
    if (this.hovered) return '#f2f4f7';
    const overdue =
      !!this.dueDate &&
      this.dueDate < '2026-10-17' &&
      this.status !== 'resolved' &&
      this.status !== 'closed';
    return overdue ? '#fff6f6' : '';
  }

  @HostListener('mouseenter') onEnter(): void {
    this.hovered = true;
  }
  @HostListener('mouseleave') onLeave(): void {
    this.hovered = false;
  }
}
