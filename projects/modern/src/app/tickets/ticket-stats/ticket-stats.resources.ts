import { computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ResourceContext, nonBlocking } from '@angular/router';
import { Page, Ticket, TicketStats } from '@helpdesk/shared';

/**
 * Router resources (v22.2, developer preview) dla trasy /tickets/stats.
 * Trzymane w osobnym pliku, nie wpisane w definicję trasy: przy włączonym SSR builder Angulara 22.2
 * wywraca się na computed() wpisanym bezpośrednio w obiekt trasy z loadComponent
 * ("Cannot read properties of undefined (reading 'fileName')").
 */
export function ticketStatsResources(ctx: ResourceContext) {
  const limit = computed(() => Number(ctx.queryParams()['limit'] ?? 5));
  return {
    // blokujący: nawigacja czeka, komponent dostaje gotową wartość (input stats)
    stats: httpResource<TicketStats>(() => '/api/tickets/stats'),
    // nieblokujący: strona otwiera się od razu, komponent dostaje zasób ze stanem loading/error
    recent: nonBlocking(httpResource<Page<Ticket>>(() => ({ url: '/api/tickets', params: { pageSize: limit() } }))),
  };
}
