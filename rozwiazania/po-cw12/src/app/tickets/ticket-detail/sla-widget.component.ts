import { Component, computed, input } from '@angular/core';
import { Ticket } from '@helpdesk/shared';

const TODAY = new Date('2026-10-17T00:00:00Z').getTime();
const DAY = 24 * 60 * 60 * 1000;

/**
 * Udaje komponent "z zewnątrz", który potrafi rzucić wyjątek w trakcie renderowania.
 * Dla zgłoszeń bez terminu (np. #1, #4, #7) rzuca błąd.
 * Bez @boundary taki błąd psuje cały widok rodzica; z @boundary pokazujemy fallback.
 */
@Component({
  selector: 'app-sla-widget',
  template: `
    <div class="card">
      <h2>SLA</h2>
      <p>
        @if (daysLeft() < 0) {
          <b class="error">Po terminie o {{ -daysLeft() }} dni</b>
        } @else {
          <b>Zostało {{ daysLeft() }} dni</b>
        }
      </p>
    </div>
  `,
})
export class SlaWidgetComponent {
  readonly ticket = input.required<Ticket>();

  protected readonly daysLeft = computed(() => {
    const due = this.ticket().dueDate;
    if (!due) {
      throw new Error(`Zgłoszenie #${this.ticket().id} nie ma terminu, nie da się policzyć SLA`);
    }
    return Math.round((new Date(due + 'T00:00:00Z').getTime() - TODAY) / DAY);
  });
}
