import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { unsavedChangesGuard } from './tickets/ticket-form/unsaved-changes.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tickets' },
  {
    path: 'tickets',
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./tickets/ticket-list/ticket-list').then((m) => m.TicketList) },
      { path: 'stats', loadComponent: () => import('./tickets/ticket-stats/ticket-stats').then((m) => m.TicketStatsPage) },
      { path: 'new', canDeactivate: [unsavedChangesGuard], loadComponent: () => import('./tickets/ticket-form/ticket-form').then((m) => m.TicketForm) },
      { path: ':id', loadComponent: () => import('./tickets/ticket-detail/ticket-detail').then((m) => m.TicketDetail) },
      { path: ':id/edit', canDeactivate: [unsavedChangesGuard], loadComponent: () => import('./tickets/ticket-form/ticket-form').then((m) => m.TicketForm) },
    ],
  },
  { path: '**', redirectTo: 'tickets' },
];
