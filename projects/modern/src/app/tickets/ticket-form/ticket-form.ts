import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { STATUSES, Ticket } from '@helpdesk/shared';
import { TicketsApi } from '../../core/tickets-api';
import { Toasts } from '../../core/toasts';
import { Users } from '../../core/users';
import { PriorityPicker } from '../../shared/priority-picker';
import { StatusLabelPipe } from '../../shared/status-label.pipe';
import { FieldErrors } from './field-errors';
import { emptyTicketModel, ticketSchema, toDraft, toFormModel } from './ticket-form.model';

function optionalNumber(v: unknown): number | undefined {
  return v === undefined || v === null || v === '' ? undefined : Number(v);
}

@Component({
  selector: 'app-ticket-form',
  imports: [RouterLink, FormField, FormRoot, PriorityPicker, StatusLabelPipe, FieldErrors],
  templateUrl: './ticket-form.html',
})
export class TicketForm {
  /** :id z routera; brak przy /tickets/new. */
  readonly id = input(undefined, { transform: optionalNumber });

  private readonly api = inject(TicketsApi);
  private readonly router = inject(Router);
  private readonly toasts = inject(Toasts);
  protected readonly users = inject(Users);
  protected readonly statuses = STATUSES;

  private readonly existing = httpResource<Ticket>(() => (this.id() ? `/api/tickets/${this.id()}` : undefined));

  /** Model resetuje się, gdy przyjdą dane z serwera (linkedSignal), a jednocześnie jest zapisywalny przez formularz. */
  protected readonly model = linkedSignal(() => (this.existing.hasValue() ? toFormModel(this.existing.value()) : emptyTicketModel()));

  private saved = false;

  protected readonly ticketForm = form(this.model, ticketSchema(this.id), {
    submission: {
      action: async (f) => {
        const { notifyReporter } = f().value();
        const draft = toDraft(f().value());
        const id = this.id();
        try {
          const ticket = await firstValueFrom(id ? this.api.update(id, draft) : this.api.create(draft));
          this.saved = true;
          this.toasts.show(notifyReporter ? 'Zapisano, wysłano powiadomienie' : 'Zapisano');
          await this.router.navigate(['/tickets', ticket.id]);
          return undefined;
        } catch {
          this.toasts.show('Błąd zapisu', 'error');
          return { kind: 'server', message: 'Serwer odrzucił zapis', fieldTree: f };
        }
      },
    },
  });

  protected readonly heading = computed(() => (this.id() ? `Edycja zgłoszenia #${this.id()}` : 'Nowe zgłoszenie'));

  protected addTag(): void {
    this.ticketForm.tags().value.update((tags) => [...tags, '']);
  }

  protected removeTag(index: number): void {
    this.ticketForm.tags().value.update((tags) => tags.filter((_, i) => i !== index));
  }

  hasUnsavedChanges(): boolean {
    return this.ticketForm().dirty() && !this.saved;
  }
}
