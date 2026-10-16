import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="toasts">
      <div *ngFor="let t of toastService.toasts" class="toast" [class.error]="t.kind === 'error'" (click)="toastService.dismiss(t.id)">
        {{ t.text }}
      </div>
    </div>
  `,
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
