import { Component, inject } from '@angular/core';
import { Toasts } from './toasts';

@Component({
  selector: 'app-toast-outlet',
  template: `
    <div class="toasts">
      @for (t of toasts.items(); track t.id) {
        <div class="toast" [class.error]="t.kind === 'error'" (click)="toasts.dismiss(t.id)">{{ t.text }}</div>
      }
    </div>
  `,
})
export class ToastOutlet {
  protected readonly toasts = inject(Toasts);
}
