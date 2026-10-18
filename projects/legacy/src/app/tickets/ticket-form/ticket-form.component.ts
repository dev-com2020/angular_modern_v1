import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { STATUSES, Ticket } from '@helpdesk/shared';
import { TicketsApiService } from '../../core/tickets-api.service';
import { ToastService } from '../../core/toast.service';
import { UsersStore } from '../../core/users.store';
import { PriorityPickerComponent } from '../../shared/priority-picker.component';
import { StatusLabelPipe } from '../../shared/status-label.pipe';
import { FieldErrorsComponent } from './field-errors.component';
import { emptyTicketModel, ticketSchema, toDraft, toFormModel } from './ticket-form.model';

function optionalNumber(v: unknown): number | undefined {
  return v === undefined || v === null || v === '' ? undefined : Number(v);
}

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  imports: [RouterLink, FormField, FormRoot, PriorityPickerComponent, StatusLabelPipe, FieldErrorsComponent],
})
export class TicketFormComponent {
  /** :id z routera; brak przy /tickets/new. */
  readonly id = input(undefined, { transform: optionalNumber });

  private readonly api = inject(TicketsApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly users = inject(UsersStore);
  protected readonly statuses = STATUSES;

  protected readonly existing = httpResource<Ticket>(() => (this.id() ? `/api/tickets/${this.id()}` : undefined));

  /** Ćw. 8: model resetuje się po wczytaniu danych (linkedSignal), a formularz może go zmieniać. Zamiast patchValue. */
  protected readonly model = linkedSignal(() => (this.existing.hasValue() ? toFormModel(this.existing.value()) : emptyTicketModel()));

  private saved = false;

  protected readonly ticketForm = form(this.model, ticketSchema(this.id), {
    submission: {
      action: async (f) => {
        const { notifyReporter } = f().value();
        const draft = toDraft(f().value());
        const id = this.id();
        // Nie zapisujemy edycji, jeśli dane zgłoszenia się nie wczytały (nadpisalibyśmy je pustym formularzem).
        if (id && !this.existing.hasValue()) return { kind: 'notLoaded', message: 'Dane zgłoszenia nie zostały wczytane', fieldTree: f };
        try {
          const ticket = await firstValueFrom(id ? this.api.update(id, draft) : this.api.create(draft));
          this.saved = true;
          this.toast.show(notifyReporter ? 'Zapisano, wysłano powiadomienie' : 'Zapisano');
          await this.router.navigate(['/tickets', ticket.id]);
          return undefined;
        } catch {
          this.toast.show('Błąd zapisu', 'error');
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
