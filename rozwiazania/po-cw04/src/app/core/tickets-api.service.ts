import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Page,
  Ticket,
  TicketComment,
  TicketDraft,
  TicketQuery,
  TicketStats,
} from '@helpdesk/shared';

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

  get(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`/api/tickets/${id}`);
  }

  create(draft: TicketDraft): Observable<Ticket> {
    return this.http.post<Ticket>('/api/tickets', draft);
  }

  update(id: number, draft: TicketDraft): Observable<Ticket> {
    return this.http.put<Ticket>(`/api/tickets/${id}`, draft);
  }

  checkTitle(title: string, excludeId?: number): Observable<{ duplicate: boolean }> {
    const params = new HttpParams().set('title', title).set('excludeId', String(excludeId ?? 0));
    return this.http.get<{ duplicate: boolean }>('/api/tickets/check-title', { params });
  }

  comments(ticketId: number): Observable<TicketComment[]> {
    return this.http.get<TicketComment[]>(`/api/tickets/${ticketId}/comments`);
  }

  addComment(ticketId: number, authorId: number, body: string): Observable<TicketComment> {
    return this.http.post<TicketComment>(`/api/tickets/${ticketId}/comments`, { authorId, body });
  }

  stats(): Observable<TicketStats> {
    return this.http.get<TicketStats>('/api/tickets/stats');
  }
}
