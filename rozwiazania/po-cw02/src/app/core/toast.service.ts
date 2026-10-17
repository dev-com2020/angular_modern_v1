import { Injectable } from '@angular/core';

export interface Toast {
  id: number;
  text: string;
  kind: 'info' | 'error';
}

/**
 * Celowo "zone-dependent": zwykła tablica + setTimeout.
 * Działa tylko dzięki temu, że zone.js po setTimeout odpala change detection.
 * W ćwiczeniu o zoneless ten serwis przestaje działać poprawnie.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: Toast[] = [];
  private nextId = 1;

  show(text: string, kind: Toast['kind'] = 'info'): void {
    const toast = { id: this.nextId++, text, kind };
    this.toasts.push(toast);
    setTimeout(() => this.dismiss(toast.id), 3000);
  }

  dismiss(id: number): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }
}
