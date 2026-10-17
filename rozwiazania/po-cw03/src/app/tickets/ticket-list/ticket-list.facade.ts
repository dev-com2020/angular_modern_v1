import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Page, Ticket, TicketPriority, TicketStatus } from '@helpdesk/shared';
import { TicketsApiService } from '../../core/tickets-api.service';

export interface TicketListFilters {
  q: string;
  status: TicketStatus | 'all';
  priority: TicketPriority | 'all';
}

export interface TicketListVm {
  tickets: Ticket[];
  total: number;
  page: number;
  pageCount: number;
  loading: boolean;
  filters: TicketListFilters;
}

const INITIAL_FILTERS: TicketListFilters = { q: '', status: 'all', priority: 'all' };

/**
 * Wzorzec "view model na RxJS": BehaviorSubject-y + combineLatest + vm$ | async.
 * Do przepisania na sygnały (ćwiczenie 3) i na Signal Store (ćwiczenie 9).
 */
@Injectable()
export class TicketListFacade implements OnDestroy {
  private api = inject(TicketsApiService);

  private readonly filters$ = new BehaviorSubject<TicketListFilters>(INITIAL_FILTERS);
  private readonly page$ = new BehaviorSubject<number>(1);
  private readonly loading$ = new BehaviorSubject<boolean>(false);
  private readonly result$ = new BehaviorSubject<Page<Ticket>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
  });
  private readonly destroy$ = new Subject<void>();
  readonly pageSize = 10;

  readonly vm$: Observable<TicketListVm> = combineLatest([
    this.result$,
    this.loading$,
    this.filters$,
    this.page$,
  ]).pipe(
    map(([result, loading, filters, page]) => ({
      tickets: result.items,
      total: result.total,
      page,
      pageCount: Math.max(1, Math.ceil(result.total / this.pageSize)),
      loading,
      filters,
    })),
  );

  constructor() {
    combineLatest([
      this.filters$.pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      ),
      this.page$,
    ])
      .pipe(
        tap(() => this.loading$.next(true)),
        switchMap(([filters, page]) =>
          this.api.list({ ...filters, page, pageSize: this.pageSize }),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (result) => {
          this.result$.next(result);
          this.loading$.next(false);
        },
        error: () => this.loading$.next(false),
      });
  }

  setFilters(filters: Partial<TicketListFilters>): void {
    this.filters$.next({ ...this.filters$.value, ...filters });
    this.page$.next(1);
  }

  setPage(page: number): void {
    this.page$.next(page);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
