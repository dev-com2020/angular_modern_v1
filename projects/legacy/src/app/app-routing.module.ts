import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tickets' },
  {
    path: 'tickets',
    canActivate: [authGuard],
    loadChildren: () => import('./tickets/tickets.module').then((m) => m.TicketsModule),
  },
  { path: '**', redirectTo: 'tickets' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
