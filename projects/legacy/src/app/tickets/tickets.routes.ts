import { Routes } from '@angular/router';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { TicketFormComponent } from './ticket-form/ticket-form.component';
import { TicketStatsComponent } from './ticket-stats/ticket-stats.component';
import { unsavedChangesGuard } from './ticket-form/unsaved-changes.guard';

export const TICKET_ROUTES: Routes = [
  { path: '', component: TicketListComponent },
  { path: 'stats', component: TicketStatsComponent },
  { path: 'new', component: TicketFormComponent, canDeactivate: [unsavedChangesGuard] },
  { path: ':id', component: TicketDetailComponent },
  { path: ':id/edit', component: TicketFormComponent, canDeactivate: [unsavedChangesGuard] },
];
