import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="toasts">
      <div
        *ngFor="let t of toastService.toasts"
        class="toast"
        [class.error]="t.kind === 'error'"
        (click)="toastService.dismiss(t.id)"
      >
        {{ t.text }}
      </div>
    </div>
  `,
  imports: [NgFor],
})
export class ToastComponent {
  toastService = inject(ToastService);
}
