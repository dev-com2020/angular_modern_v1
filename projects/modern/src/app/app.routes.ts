import { computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Routes, nonBlocking } from '@angular/router';
import { Page, Ticket, TicketStats } from '@helpdesk/shared';
import { authGuard } from './core/auth.guard';
import { unsavedChangesGuard } from './tickets/ticket-form/unsaved-changes.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tickets' },
  {
    path: 'tickets',
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./tickets/ticket-list/ticket-list').then((m) => m.TicketList) },
      {
        path: 'stats',
        loadComponent: () => import('./tickets/ticket-stats/ticket-stats').then((m) => m.TicketStatsPage),
        // Router resources (v22.2, developer preview): następca resolverów.
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
      { path: 'new', canDeactivate: [unsavedChangesGuard], loadComponent: () => import('./tickets/ticket-form/ticket-form').then((m) => m.TicketForm) },
      { path: ':id', loadComponent: () => import('./tickets/ticket-detail/ticket-detail').then((m) => m.TicketDetail) },
      { path: ':id/edit', canDeactivate: [unsavedChangesGuard], loadComponent: () => import('./tickets/ticket-form/ticket-form').then((m) => m.TicketForm) },
    ],
  },
  { path: '**', redirectTo: 'tickets' },
];
