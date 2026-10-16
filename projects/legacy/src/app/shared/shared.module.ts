import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PriorityBadgeComponent } from './priority-badge.component';
import { PriorityPickerComponent } from './priority-picker.component';
import { StatusLabelPipe } from './status-label.pipe';
import { HighlightOverdueDirective } from './highlight-overdue.directive';

@NgModule({
  declarations: [PriorityBadgeComponent, PriorityPickerComponent, StatusLabelPipe, HighlightOverdueDirective],
  imports: [CommonModule, RouterModule],
  exports: [CommonModule, RouterModule, PriorityBadgeComponent, PriorityPickerComponent, StatusLabelPipe, HighlightOverdueDirective],
})
export class SharedModule {}
