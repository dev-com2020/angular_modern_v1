import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  text: string;
  kind: 'info' | 'error';
}

/** Ćw. 3: sygnał zamiast mutowanej tablicy. Zapis do sygnału sam planuje odświeżenie widoku (także bez zone.js). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private nextId = 1;

  show(text: string, kind: Toast['kind'] = 'info'): void {
    const toast = { id: this.nextId++, text, kind };
    this._toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), 3000);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
