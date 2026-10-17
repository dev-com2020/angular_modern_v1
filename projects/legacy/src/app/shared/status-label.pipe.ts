import { Pipe, PipeTransform } from '@angular/core';
import { TicketStatus } from '@helpdesk/shared';

const LABELS: Record<TicketStatus, string> = {
  open: 'Otwarte',
  in_progress: 'W toku',
  resolved: 'Rozwiązane',
  closed: 'Zamknięte',
};

@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  transform(value: TicketStatus | null | undefined): string {
    return value ? LABELS[value] : '';
  }
}
