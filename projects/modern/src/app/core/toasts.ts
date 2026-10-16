import { Service, signal } from '@angular/core';

export interface Toast {
  id: number;
  text: string;
  kind: 'info' | 'error';
}

/** Sygnał zamiast mutowanej tablicy: działa bez zone.js, bo zapis do sygnału planuje odświeżenie widoku. */
@Service()
export class Toasts {
  private readonly _items = signal<Toast[]>([]);
  readonly items = this._items.asReadonly();
  private nextId = 1;

  show(text: string, kind: Toast['kind'] = 'info'): void {
    const toast = { id: this.nextId++, text, kind };
    this._items.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), 3000);
  }

  dismiss(id: number): void {
    this._items.update((list) => list.filter((t) => t.id !== id));
  }
}
