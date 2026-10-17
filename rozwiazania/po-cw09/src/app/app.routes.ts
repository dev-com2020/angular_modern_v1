import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tickets' },
  {
    path: 'tickets',
    canActivate: [authGuard],
    loadChildren: () => import('./tickets/tickets.routes').then((m) => m.TICKET_ROUTES),
  },
  { path: '**', redirectTo: 'tickets' },
];
