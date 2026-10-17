import { CanDeactivateFn } from '@angular/router';
import { TicketFormComponent } from './ticket-form.component';

export const unsavedChangesGuard: CanDeactivateFn<TicketFormComponent> = (component) =>
  !component.hasUnsavedChanges() || confirm('Masz niezapisane zmiany. Na pewno wyjść?');