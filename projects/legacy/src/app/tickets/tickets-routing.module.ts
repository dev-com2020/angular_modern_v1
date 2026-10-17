import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { TicketFormComponent } from './ticket-form/ticket-form.component';
import { TicketStatsComponent } from './ticket-stats/ticket-stats.component';
import { ticketResolver } from './ticket-detail/ticket.resolver';
import { unsavedChangesGuard } from './ticket-form/unsaved-changes.guard';

const routes: Routes = [
  { path: '', component: TicketListComponent },
  { path: 'stats', component: TicketStatsComponent },
  { path: 'new', component: TicketFormComponent, canDeactivate: [unsavedChangesGuard] },
  { path: ':id', component: TicketDetailComponent, resolve: { ticket: ticketResolver } },
  { path: ':id/edit', component: TicketFormComponent, canDeactivate: [unsavedChangesGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TicketsRoutingModule {}
