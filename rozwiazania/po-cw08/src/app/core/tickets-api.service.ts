import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, Ticket, TicketComment, TicketDraft, TicketQuery } from '@helpdesk/shared';

// Ćw. 7-8: odczyty przeszły na httpResource (komponenty, walidacja HTTP), tu zostają lista i zapisy.
@Injectable({ providedIn: 'root' })
export class TicketsApiService {
  private http = inject(HttpClient);

  list(query: TicketQuery): Observable<Page<Ticket>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<Page<Ticket>>('/api/tickets', { params });
  }

  create(draft: TicketDraft): Observable<Ticket> {
    return this.http.post<Ticket>('/api/tickets', draft);
  }

  update(id: number, draft: TicketDraft): Observable<Ticket> {
    return this.http.put<Ticket>(`/api/tickets/${id}`, draft);
  }

  addComment(ticketId: number, authorId: number, body: string): Observable<TicketComment> {
    return this.http.post<TicketComment>(`/api/tickets/${ticketId}/comments`, { authorId, body });
  }
}
