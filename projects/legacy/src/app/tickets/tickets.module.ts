import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { TicketsRoutingModule } from './tickets-routing.module';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { TicketFormComponent } from './ticket-form/ticket-form.component';
import { CommentsPanelComponent } from './comments-panel/comments-panel.component';
import { TicketStatsComponent } from './ticket-stats/ticket-stats.component';

@NgModule({
  declarations: [TicketListComponent, TicketDetailComponent, TicketFormComponent, CommentsPanelComponent, TicketStatsComponent],
  imports: [SharedModule, ReactiveFormsModule, TicketsRoutingModule],
})
export class TicketsModule {}
