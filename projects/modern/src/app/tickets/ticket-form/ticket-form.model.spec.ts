import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { form } from '@angular/forms/signals';
import { emptyTicketModel, ticketSchema, toDraft } from './ticket-form.model';

// Logikę formularza testujemy bez DOM: model + schema.
describe('ticketSchema', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const model = signal(emptyTicketModel());
    const f = TestBed.runInInjectionContext(() => form(model, ticketSchema(signal(undefined))));
    return { model, f };
  }

  it('pusty formularz jest niepoprawny', () => {
    const { f } = setup();
    expect(f().valid()).toBe(false);
    expect(f.title().errors().map((e) => e.kind)).toContain('required');
  });

  it('krytyczne zgłoszenie wymaga osoby i terminu', () => {
    const { f } = setup();
    f.priority().value.set('critical');
    expect(f.assigneeId().errors().map((e) => e.kind)).toContain('criticalNeedsOwner');
    expect(f.dueDate().errors().map((e) => e.kind)).toContain('criticalNeedsDate');

    f.assigneeId().value.set('3');
    f.dueDate().value.set('2026-10-30');
    expect(f.assigneeId().errors()).toEqual([]);
    expect(f.dueDate().errors()).toEqual([]);
  });

  it('powiadomienie jest wyłączone bez e-maila', () => {
    const { f } = setup();
    expect(f.notifyReporter().disabled()).toBe(true);
    f.reporterEmail().value.set('jan@klient.pl');
    expect(f.notifyReporter().disabled()).toBe(false);
  });

  it('toDraft konwertuje stringi z formularza', () => {
    const draft = toDraft({ ...emptyTicketModel(), title: '  Tytuł  ', assigneeId: '4', dueDate: '', tags: ['a', ' ', 'b '] });
    expect(draft).toMatchObject({ title: 'Tytuł', assigneeId: 4, dueDate: null, tags: ['a', 'b'] });
  });
});
