import { Signal } from '@angular/core';
import {
  applyEach,
  debounce,
  disabled,
  email,
  maxLength,
  minLength,
  required,
  schema,
  validate,
  validateHttp,
} from '@angular/forms/signals';
import { Ticket, TicketDraft, TicketPriority, TicketStatus } from '@helpdesk/shared';

/** Model formularza = zwykły obiekt. Wartości z <select>/<input type=date> trzymamy jako string. */
export interface TicketFormModel {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId: string; // '' = brak
  reporterEmail: string;
  dueDate: string; // '' = brak
  notifyReporter: boolean;
  tags: string[];
}

export function emptyTicketModel(): TicketFormModel {
  return { title: '', description: '', status: 'open', priority: 'medium', assigneeId: '', reporterEmail: '', dueDate: '', notifyReporter: true, tags: [] };
}

export function toFormModel(t: Ticket): TicketFormModel {
  return {
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    assigneeId: t.assigneeId ? String(t.assigneeId) : '',
    reporterEmail: t.reporterEmail,
    dueDate: t.dueDate ?? '',
    notifyReporter: true,
    tags: [...t.tags],
  };
}

export function toDraft(m: TicketFormModel): TicketDraft {
  return {
    title: m.title.trim(),
    description: m.description,
    status: m.status,
    priority: m.priority,
    assigneeId: m.assigneeId ? Number(m.assigneeId) : null,
    reporterEmail: m.reporterEmail,
    dueDate: m.dueDate || null,
    tags: m.tags.map((t) => t.trim()).filter(Boolean),
  };
}

/**
 * Cała logika walidacji w jednym miejscu, niezależnie od szablonu.
 * Odpowiedniki z legacy: Validators.*, DuplicateTitleValidator, criticalNeedsOwner, ręczne enable/disable.
 */
export function ticketSchema(excludeId: Signal<number | undefined>) {
  return schema<TicketFormModel>((p) => {
    required(p.title, { message: 'Tytuł jest wymagany' });
    minLength(p.title, 5, { message: 'Minimum 5 znaków' });
    maxLength(p.title, 80, { message: 'Maksimum 80 znaków' });
    debounce(p.title, 'blur');
    validateHttp(p.title, {
      request: ({ value }) =>
        value().trim().length >= 5
          ? { url: '/api/tickets/check-title', params: { title: value().trim(), excludeId: excludeId() ?? 0 } }
          : undefined,
      debounce: 400,
      onSuccess: (res: { duplicate: boolean }) =>
        res.duplicate ? { kind: 'duplicateTitle', message: 'Zgłoszenie o takim tytule już istnieje' } : undefined,
      onError: () => undefined,
    });

    required(p.description, { message: 'Opis jest wymagany' });
    minLength(p.description, 10, { message: 'Opis musi mieć co najmniej 10 znaków' });

    required(p.reporterEmail, { message: 'E-mail jest wymagany' });
    email(p.reporterEmail, { message: 'Podaj poprawny e-mail' });

    // Reguła dynamiczna zamiast valueChanges + enable()/disable().
    disabled(p.notifyReporter, { when: ({ valueOf }) => !valueOf(p.reporterEmail) });

    // Walidacja krzyżowa: krytyczne zgłoszenie wymaga osoby i terminu.
    validate(p.assigneeId, ({ value, valueOf }) =>
      valueOf(p.priority) === 'critical' && !value() ? { kind: 'criticalNeedsOwner', message: 'Krytyczne zgłoszenie wymaga osoby przypisanej' } : undefined,
    );
    validate(p.dueDate, ({ value, valueOf }) =>
      valueOf(p.priority) === 'critical' && !value() ? { kind: 'criticalNeedsDate', message: 'Krytyczne zgłoszenie wymaga terminu' } : undefined,
    );

    applyEach(p.tags, (tag) => {
      required(tag, { message: 'Tag nie może być pusty' });
    });
  });
}
