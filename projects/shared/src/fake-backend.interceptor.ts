/**
 * Fake backend: przechwytuje żądania /api/* i odpowiada z pamięci (dane resetują się po F5).
 * Nie jest przedmiotem szkolenia, nie trzeba go modyfikować.
 *
 * Sterowanie z konsoli przeglądarki:
 *   localStorage.setItem('fb.latency', '1500')   // opóźnienie w ms (domyślnie losowe 250-700)
 *   localStorage.setItem('fb.errorRate', '0.3')  // 30% żądań kończy się błędem 500
 *   localStorage.clear()                         // powrót do ustawień domyślnych
 * Każde żądanie jest logowane w konsoli, co pozwala policzyć zapytania (np. N+1).
 */
import { Injectable } from '@angular/core';
import { HttpBackend, HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Page, Ticket, TicketComment, TicketDraft, TicketStats, PRIORITIES, STATUSES } from './models';
import { SEED_USERS, createSeedComments, createSeedTickets } from './seed';

const db = {
  tickets: createSeedTickets(),
  comments: createSeedComments(),
  users: SEED_USERS,
};

let requestCounter = 0;

function readNumber(key: string): number | null {
  try {
    const v = localStorage.getItem(key);
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
}

function latency(): number {
  return readNumber('fb.latency') ?? 250 + Math.round(Math.random() * 450);
}

function ok<T>(body: T, status = 200): Observable<HttpEvent<T>> {
  return of(new HttpResponse<T>({ status, body }));
}

function fail(status: number, message: string, url: string): Observable<never> {
  return throwError(() => new HttpErrorResponse({ status, statusText: message, error: { message }, url }));
}

function handle(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const url = new URL(req.urlWithParams, 'http://fake.local');
  const path = url.pathname;
  const p = url.searchParams;
  const m = req.method;
  let match: RegExpMatchArray | null;

  // --- tickets ---
  if (m === 'GET' && path === '/api/tickets') {
    const q = (p.get('q') ?? '').toLowerCase().trim();
    const status = p.get('status') ?? 'all';
    const priority = p.get('priority') ?? 'all';
    const page = Number(p.get('page') ?? 1);
    const pageSize = Number(p.get('pageSize') ?? 10);
    const filtered = db.tickets
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q)))
      .filter((t) => status === 'all' || t.status === status)
      .filter((t) => priority === 'all' || t.priority === priority)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const body: Page<Ticket> = {
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
    return ok(body);
  }
  if (m === 'GET' && path === '/api/tickets/check-title') {
    const title = (p.get('title') ?? '').toLowerCase().trim();
    const excludeId = Number(p.get('excludeId') ?? 0);
    const duplicate = db.tickets.some((t) => t.id !== excludeId && t.title.toLowerCase() === title);
    return ok({ duplicate });
  }
  if (m === 'GET' && path === '/api/tickets/stats') {
    const today = '2026-10-17';
    const stats: TicketStats = {
      byStatus: Object.fromEntries(STATUSES.map((s) => [s, db.tickets.filter((t) => t.status === s).length])) as TicketStats['byStatus'],
      byPriority: Object.fromEntries(PRIORITIES.map((pr) => [pr, db.tickets.filter((t) => t.priority === pr).length])) as TicketStats['byPriority'],
      overdue: db.tickets.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'closed' && t.status !== 'resolved').length,
    };
    return ok(stats);
  }
  if ((match = path.match(/^\/api\/tickets\/(\d+)$/))) {
    const id = Number(match[1]);
    const idx = db.tickets.findIndex((t) => t.id === id);
    if (idx < 0) return fail(404, `Zgłoszenie ${id} nie istnieje`, req.url);
    if (m === 'GET') return ok(db.tickets[idx]);
    if (m === 'PUT' || m === 'PATCH') {
      const updated: Ticket = { ...db.tickets[idx], ...(req.body as Partial<Ticket>), id, updatedAt: new Date().toISOString() };
      db.tickets[idx] = updated;
      return ok(updated);
    }
    if (m === 'DELETE') {
      db.tickets.splice(idx, 1);
      return ok(null, 204);
    }
  }
  if (m === 'POST' && path === '/api/tickets') {
    const draft = req.body as TicketDraft;
    if (!draft?.title?.trim()) return fail(422, 'Tytuł jest wymagany', req.url);
    const now = new Date().toISOString();
    const ticket: Ticket = { ...draft, id: Math.max(0, ...db.tickets.map((t) => t.id)) + 1, createdAt: now, updatedAt: now };
    db.tickets.unshift(ticket);
    return ok(ticket, 201);
  }
  if ((match = path.match(/^\/api\/tickets\/(\d+)\/comments$/))) {
    const ticketId = Number(match[1]);
    if (m === 'GET') return ok(db.comments.filter((c) => c.ticketId === ticketId));
    if (m === 'POST') {
      const body = req.body as Pick<TicketComment, 'authorId' | 'body'>;
      const comment: TicketComment = { ...body, id: db.comments.length + 1, ticketId, createdAt: new Date().toISOString() };
      db.comments.push(comment);
      return ok(comment, 201);
    }
  }

  // --- users ---
  if (m === 'GET' && path === '/api/users') {
    const ids = p.get('ids');
    if (ids) {
      const set = new Set(ids.split(',').map(Number));
      return ok(db.users.filter((u) => set.has(u.id)));
    }
    return ok(db.users);
  }
  if ((match = path.match(/^\/api\/users\/(\d+)$/)) && m === 'GET') {
    const user = db.users.find((u) => u.id === Number(match![1]));
    return user ? ok(user) : fail(404, 'Użytkownik nie istnieje', req.url);
  }
  if (m === 'GET' && path === '/api/me') {
    return ok(db.users[0]);
  }

  return fail(404, `Brak endpointu ${m} ${path}`, req.url);
}

export const fakeBackendInterceptor: HttpInterceptorFn = (req, next) => {
  // Na serwerze (SSR) Angular zamienia adresy względne na pełne (http://host/api/...), więc patrzymy na samą ścieżkę.
  if (!req.url.replace(/^https?:\/\/[^/]+/, '').startsWith('/api/')) return next(req);
  const n = ++requestCounter;
  const errorRate = readNumber('fb.errorRate') ?? 0;
  // eslint-disable-next-line no-console
  console.info(`[fake-backend #${n}] ${req.method} ${req.urlWithParams}`);
  return timer(latency()).pipe(
    mergeMap(() => (Math.random() < errorRate ? fail(500, 'Losowy błąd serwera (fb.errorRate)', req.url) : handle(req))),
  );
};

/** Liczba żądań od startu aplikacji (przydatne w ćwiczeniu o N+1 i w testach). */
export function fakeBackendRequestCount(): number {
  return requestCounter;
}

/**
 * Ten sam fake backend, ale jako HttpBackend (koniec łańcucha HttpClient) zamiast interceptora.
 * Potrzebny przy SSR: transfer cache Angulara jest interceptorem "root", który działa PO interceptorach aplikacji.
 * Interceptor, który nie woła next() (jak fakeBackendInterceptor), odcina go, więc odpowiedzi z serwera
 * nie trafiają do HTML i przeglądarka pobiera wszystko drugi raz. Jako HttpBackend stoi za cache, jak prawdziwy serwer.
 */
@Injectable()
export class FakeHttpBackend implements HttpBackend {
  handle(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    return fakeBackendInterceptor(req, (r) =>
      throwError(() => new HttpErrorResponse({ status: 0, statusText: 'Fake backend obsługuje tylko /api/*', url: r.url })),
    );
  }
}
