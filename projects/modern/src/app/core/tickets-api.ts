import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket, TicketComment, TicketDraft } from '@helpdesk/shared';

/**
 * Odczyty robimy przez httpResource w komponentach/store,
 * zapisy (POST/PUT) zostają na HttpClient + Observable (albo firstValueFrom).
 */
@Service()
export class TicketsApi {
  private readonly http = inject(HttpClient);

  create(draft: TicketDraft): Observable<Ticket> {
    return this.http.post<Ticket>('/api/tickets', draft);
  }

  update(id: number, patch: Partial<TicketDraft>): Observable<Ticket> {
    return this.http.patch<Ticket>(`/api/tickets/${id}`, patch);
  }

  addComment(ticketId: number, authorId: number, body: string): Observable<TicketComment> {
    return this.http.post<TicketComment>(`/api/tickets/${ticketId}/comments`, { authorId, body });
  }
}
