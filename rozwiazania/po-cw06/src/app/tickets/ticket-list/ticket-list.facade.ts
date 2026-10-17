import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, debounceTime, switchMap, tap } from 'rxjs/operators';
import { Page, Ticket, TicketPriority, TicketStatus } from '@helpdesk/shared';
import { TicketsApiService } from '../../core/tickets-api.service';

export interface TicketListFilters {
  q: string;
  status: TicketStatus | 'all';
  priority: TicketPriority | 'all';
}

const INITIAL_FILTERS: TicketListFilters = { q: '', status: 'all', priority: 'all' };
const EMPTY_PAGE: Page<Ticket> = { items: [], total: 0, page: 1, pageSize: 10 };

/**
 * Ćw. 6: stan wejściowy i wynik jako sygnały, RxJS tylko w środku (debounce + anulowanie przez switchMap).
 * Bez subjectów i ręcznego sprzątania: toSignal sam kończy subskrypcję razem z komponentem.
 */
@Injectable()
export class TicketListFacade {
  private readonly api = inject(TicketsApiService);
  readonly pageSize = 10;

  readonly filters = signal<TicketListFilters>(INITIAL_FILTERS);
  readonly page = signal(1);
  private readonly _loading = signal(true);
  readonly loading = this._loading.asReadonly();

  private readonly result = toSignal(
    toObservable(computed(() => ({ filters: this.filters(), page: this.page() }))).pipe(
      debounceTime(300),
      tap(() => this._loading.set(true)),
      switchMap(({ filters, page }) =>
        // catchError WEWNĄTRZ switchMap: błąd jednego żądania nie zabija całego strumienia
        this.api.list({ ...filters, page, pageSize: this.pageSize }).pipe(catchError(() => of(EMPTY_PAGE))),
      ),
      tap(() => this._loading.set(false)),
    ),
    { initialValue: EMPTY_PAGE },
  );

  readonly tickets = computed(() => this.result().items);
  readonly total = computed(() => this.result().total);
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize)));

  setFilters(filters: Partial<TicketListFilters>): void {
    this.filters.update((current) => ({ ...current, ...filters }));
    this.page.set(1);
  }

  prevPage(): void {
    this.page.update((p) => Math.max(1, p - 1));
  }

  nextPage(): void {
    this.page.update((p) => Math.min(this.pageCount(), p + 1));
  }
}
