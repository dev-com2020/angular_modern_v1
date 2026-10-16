import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { TicketFormComponent } from './ticket-form.component';

@Injectable({ providedIn: 'root' })
export class UnsavedChangesGuard implements CanDeactivate<TicketFormComponent> {
  canDeactivate(component: TicketFormComponent): boolean {
    return !component.hasUnsavedChanges() || confirm('Masz niezapisane zmiany. Na pewno wyjść?');
  }
}
