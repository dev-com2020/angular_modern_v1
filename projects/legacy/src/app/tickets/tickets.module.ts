import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { TicketsRoutingModule } from './tickets-routing.module';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { TicketFormComponent } from './ticket-form/ticket-form.component';
import { CommentsPanelComponent } from './comments-panel/comments-panel.component';
import { TicketStatsComponent } from './ticket-stats/ticket-stats.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    TicketsRoutingModule,
    TicketListComponent,
    TicketDetailComponent,
    TicketFormComponent,
    CommentsPanelComponent,
    TicketStatsComponent,
  ],
})
export class TicketsModule {}
