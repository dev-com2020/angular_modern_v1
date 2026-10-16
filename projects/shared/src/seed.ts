import { PRIORITIES, STATUSES, Ticket, TicketComment, User } from './models';

export const SEED_USERS: User[] = [
  { id: 1, name: 'Anna Kowalska', email: 'anna.kowalska@example.com', team: 'L1' },
  { id: 2, name: 'Piotr Nowak', email: 'piotr.nowak@example.com', team: 'L1' },
  { id: 3, name: 'Kasia Wiśniewska', email: 'kasia.wisniewska@example.com', team: 'L2' },
  { id: 4, name: 'Marek Zając', email: 'marek.zajac@example.com', team: 'L2' },
  { id: 5, name: 'Ola Lewandowska', email: 'ola.lewandowska@example.com', team: 'DevOps' },
  { id: 6, name: 'Tomek Wójcik', email: 'tomek.wojcik@example.com', team: 'DevOps' },
];

const TITLES = [
  'Nie działa logowanie przez SSO',
  'Raport miesięczny generuje pusty PDF',
  'Błąd 500 przy zapisie faktury',
  'Wolne ładowanie listy klientów',
  'Brak uprawnień do modułu HR',
  'Drukarka na 3 piętrze nie drukuje',
  'VPN rozłącza się co 10 minut',
  'Zmiana adresu e-mail w profilu',
  'Eksport do CSV ucina polskie znaki',
  'Certyfikat SSL wygasa za 7 dni',
  'Prośba o nowy laptop dla stażysty',
  'Powiadomienia push nie przychodzą',
  'Kalendarz pokazuje złą strefę czasową',
  'Nie można dodać załącznika powyżej 5 MB',
  'Dashboard sprzedaży liczy podwójnie',
  'Migracja skrzynki do nowej domeny',
  'Formularz zgłoszenia gubi dane po odświeżeniu',
  'Integracja z ERP zwraca timeout',
  'Hasło wygasło, brak maila resetującego',
  'Aplikacja mobilna crashuje na Androidzie 15',
];
const TAGS = ['sso', 'raporty', 'faktury', 'wydajność', 'uprawnienia', 'sprzęt', 'sieć', 'profil', 'eksport', 'bezpieczeństwo', 'mobile', 'erp'];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function isoDaysAgo(days: number): string {
  const d = new Date('2026-10-17T09:00:00Z');
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

export function createSeedTickets(): Ticket[] {
  const tickets: Ticket[] = [];
  for (let i = 0; i < 48; i++) {
    const created = isoDaysAgo(60 - i);
    tickets.push({
      id: i + 1,
      title: `${pick(TITLES, i)}${i >= TITLES.length ? ` (#${i + 1})` : ''}`,
      description: `Opis zgłoszenia numer ${i + 1}. Użytkownik zgłasza problem i prosi o pilny kontakt.`,
      status: pick(STATUSES, (i * 7) % 11),
      priority: pick(PRIORITIES, (i * 5) % 7),
      assigneeId: i % 5 === 0 ? null : ((i * 3) % SEED_USERS.length) + 1,
      reporterEmail: `zglaszajacy${i + 1}@klient.pl`,
      tags: [pick(TAGS, i), pick(TAGS, i + 3)].filter((t, idx, a) => a.indexOf(t) === idx),
      dueDate: i % 3 === 0 ? null : isoDaysAgo(30 - i).slice(0, 10),
      createdAt: created,
      updatedAt: created,
    });
  }
  return tickets;
}

export function createSeedComments(): TicketComment[] {
  const comments: TicketComment[] = [];
  let id = 1;
  for (let t = 1; t <= 48; t++) {
    const n = t % 4;
    for (let c = 0; c < n; c++) {
      comments.push({
        id: id++,
        ticketId: t,
        authorId: ((t + c) % SEED_USERS.length) + 1,
        body: c === 0 ? 'Przyjęte, analizuję.' : c === 1 ? 'Potrzebuję logów z dnia zdarzenia.' : 'Wdrożona poprawka, proszę o weryfikację.',
        createdAt: isoDaysAgo(40 - t - c),
      });
    }
  }
  return comments;
}
