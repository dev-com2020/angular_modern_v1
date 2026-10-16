import { computed, debounced } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { Page, Ticket, TicketPriority, TicketStatus } from '@helpdesk/shared';

export interface TicketsState {
  q: string;
  status: TicketStatus | 'all';
  priority: TicketPriority | 'all';
  page: number;
  pageSize: number;
}

const initialState: TicketsState = { q: '', status: 'all', priority: 'all', page: 1, pageSize: 10 };

/**
 * Odpowiednik TicketListFacade z legacy.
 * - stan filtrów: withState
 * - debounce wyszukiwania: debounced() zamiast debounceTime
 * - pobieranie: httpResource zamiast switchMap + subscribe (anulowanie poprzedniego żądania gratis)
 * Właściwości z prefiksem _ są prywatne dla store.
 */
export const TicketsStore = signalStore(
  withState(initialState),
  withProps((store) => {
    const debouncedQ = debounced(() => store.q(), 300);
    return {
      _debouncedQ: debouncedQ,
      _tickets: httpResource<Page<Ticket>>(() => ({
        url: '/api/tickets',
        params: {
          q: debouncedQ.value(),
          status: store.status(),
          priority: store.priority(),
          page: store.page(),
          pageSize: store.pageSize(),
        },
      })),
    };
  }),
  withComputed(({ _tickets, _debouncedQ, pageSize }) => ({
    tickets: computed(() => (_tickets.hasValue() ? _tickets.value().items : [])),
    total: computed(() => (_tickets.hasValue() ? _tickets.value().total : 0)),
    pageCount: computed(() => Math.max(1, Math.ceil((_tickets.hasValue() ? _tickets.value().total : 0) / pageSize()))),
    loading: computed(() => _tickets.isLoading()),
    typing: computed(() => _debouncedQ.isLoading()),
    error: computed(() => (_tickets.error() ? 'Nie udało się pobrać zgłoszeń' : null)),
  })),
  withMethods((store) => ({
    setQuery(q: string): void {
      patchState(store, { q, page: 1 });
    },
    setStatus(status: TicketsState['status']): void {
      patchState(store, { status, page: 1 });
    },
    setPriority(priority: TicketsState['priority']): void {
      patchState(store, { priority, page: 1 });
    },
    prevPage(): void {
      patchState(store, (s) => ({ page: Math.max(1, s.page - 1) }));
    },
    nextPage(): void {
      patchState(store, (s) => ({ page: Math.min(store.pageCount(), s.page + 1) }));
    },
    reload(): void {
      store._tickets.reload();
    },
  })),
);
