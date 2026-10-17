import { computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Routes, nonBlocking } from '@angular/router';
import { Page, Ticket, TicketStats } from '@helpdesk/shared';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { TicketFormComponent } from './ticket-form/ticket-form.component';
import { TicketStatsComponent } from './ticket-stats/ticket-stats.component';
import { unsavedChangesGuard } from './ticket-form/unsaved-changes.guard';

export const TICKET_ROUTES: Routes = [
  { path: '', component: TicketListComponent },
  {
    path: 'stats',
    component: TicketStatsComponent,
    // Ćw. 12: router resources (v22.2, developer preview), następca resolverów.
    resources: (ctx) => {
      const limit = computed(() => Number(ctx.queryParams()['limit'] ?? 5));
      return {
        // blokujący: nawigacja czeka, komponent dostaje gotową wartość (input stats)
        stats: httpResource<TicketStats>(() => '/api/tickets/stats'),
        // nieblokujący: strona otwiera się od razu, komponent dostaje zasób ze stanem loading/error
        recent: nonBlocking(httpResource<Page<Ticket>>(() => ({ url: '/api/tickets', params: { pageSize: limit() } }))),
      };
    },
  },
  { path: 'new', component: TicketFormComponent, canDeactivate: [unsavedChangesGuard] },
  { path: ':id', component: TicketDetailComponent },
  { path: ':id/edit', component: TicketFormComponent, canDeactivate: [unsavedChangesGuard] },
];
