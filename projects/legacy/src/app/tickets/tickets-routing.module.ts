import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { TicketFormComponent } from './ticket-form/ticket-form.component';
import { TicketStatsComponent } from './ticket-stats/ticket-stats.component';
import { TicketResolver } from './ticket-detail/ticket.resolver';
import { UnsavedChangesGuard } from './ticket-form/unsaved-changes.guard';

const routes: Routes = [
  { path: '', component: TicketListComponent },
  { path: 'stats', component: TicketStatsComponent },
  { path: 'new', component: TicketFormComponent, canDeactivate: [UnsavedChangesGuard] },
  { path: ':id', component: TicketDetailComponent, resolve: { ticket: TicketResolver } },
  { path: ':id/edit', component: TicketFormComponent, canDeactivate: [UnsavedChangesGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TicketsRoutingModule {}
