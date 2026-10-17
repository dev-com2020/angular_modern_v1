import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Page, Ticket } from '@helpdesk/shared';
import { TicketsStore } from './tickets.store';

function page(items: Partial<Ticket>[], total = items.length): Page<Ticket> {
  return { items: items as Ticket[], total, page: 1, pageSize: 10 };
}

// Ćw. 10: TestBed.tick() uruchamia efekty (żądanie zasobu), whenStable() czeka na odpowiedź.
describe('TicketsStore', () => {
  let store: InstanceType<typeof TicketsStore>;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TicketsStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(TicketsStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('pobiera pierwszą stronę z domyślnymi filtrami', async () => {
    TestBed.tick();
    const req = http.expectOne((r) => r.url === '/api/tickets');
    expect(req.request.params.get('status')).toBe('all');
    expect(req.request.params.get('page')).toBe('1');
    req.flush(page([{ id: 1, title: 'A' }], 25));
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.tickets().length).toBe(1);
    expect(store.total()).toBe(25);
    expect(store.pageCount()).toBe(3);
    expect(store.loading()).toBe(false);
  });

  it('zmiana statusu resetuje stronę i wysyła nowe żądanie', async () => {
    TestBed.tick();
    http.expectOne((r) => r.url === '/api/tickets').flush(page([], 30));
    await TestBed.inject(ApplicationRef).whenStable();

    store.nextPage();
    expect(store.page()).toBe(2);

    store.setStatus('open');
    expect(store.page()).toBe(1);
    TestBed.tick();
    const req = http.expectOne((r) => r.url === '/api/tickets');
    expect(req.request.params.get('status')).toBe('open');
    req.flush(page([]));
  });

  it('wyszukiwanie jest debounce-owane', async () => {
    TestBed.tick();
    http.expectOne((r) => r.url === '/api/tickets').flush(page([]));
    await TestBed.inject(ApplicationRef).whenStable();

    store.setQuery('v');
    store.setQuery('vp');
    store.setQuery('vpn');
    TestBed.tick();
    expect(store.typing()).toBe(true);
    http.expectNone((r) => r.url === '/api/tickets');

    await new Promise((r) => setTimeout(r, 350));
    TestBed.tick();
    const req = http.expectOne((r) => r.url === '/api/tickets');
    expect(req.request.params.get('q')).toBe('vpn');
    req.flush(page([]));
  });
});
