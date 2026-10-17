import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="toasts">
      @for (t of toastService.toasts; track t) {
        <div class="toast" [class.error]="t.kind === 'error'" (click)="toastService.dismiss(t.id)">
          {{ t.text }}
        </div>
      }
    </div>
  `,
  imports: [],
})
export class ToastComponent {
  toastService = inject(ToastService);
}
