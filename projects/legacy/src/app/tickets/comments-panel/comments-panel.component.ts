import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { TicketComment, User } from '@helpdesk/shared';
import { TicketsApiService } from '../../core/tickets-api.service';
import { UsersApiService } from '../../core/users-api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

/** Panel komentarzy. Udaje "ciężki" komponent (dużo kodu, osobne żądania). */
@Component({
  selector: 'app-comments-panel',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DatePipe],
  template: `
    <div class="card">
      <h2>Komentarze ({{ comments().length }})</h2>
      @if (loading()) {
        <div class="skeleton"></div>
      }
      @for (c of comments(); track c.id) {
        <div style="margin-bottom: 10px">
          <b>{{ authors()[c.authorId]?.name }}</b>
          <span class="muted"> · {{ c.createdAt | date: 'dd.MM.yyyy HH:mm' }}</span>
          <div>{{ c.body }}</div>
        </div>
      }
      <div class="row">
        <input class="grow" [value]="draft()" (input)="draft.set($any($event.target).value)" placeholder="Dodaj komentarz" />
        <button class="primary" [disabled]="!draft().trim()" (click)="add()">Dodaj</button>
      </div>
    </div>
  `,
})
export class CommentsPanelComponent {
  private api = inject(TicketsApiService);
  private usersApi = inject(UsersApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  readonly ticketId = input.required<number>();

  // Ćw. 3: stan wyświetlany w szablonie jako sygnały, aktualizacje przez nowe tablice/obiekty.
  protected readonly comments = signal<TicketComment[]>([]);
  protected readonly authors = signal<Record<number, User>>({});
  protected readonly loading = signal(false);
  protected readonly draft = signal('');

  constructor() {
    // Ćw. 4: zamiast ngOnChanges. Efekt śledzi tylko ticketId; load() czyta i zapisuje inne sygnały, więc untracked.
    effect(() => {
      const id = this.ticketId();
      untracked(() => this.load(id));
    });
  }

  private load(ticketId: number): void {
    this.loading.set(true);
    this.api.comments(ticketId).subscribe((comments) => {
      this.comments.set(comments);
      const ids = [...new Set(comments.map((c) => c.authorId))];
      if (ids.length === 0) {
        this.loading.set(false);
        return;
      }
      // forkJoin z N żądaniami: lepiej niż pętla subscribe, ale wciąż N+1.
      forkJoin(ids.map((id) => this.usersApi.getById(id))).subscribe((users) => {
        this.authors.update((map) => ({ ...map, ...Object.fromEntries(users.map((u) => [u.id, u])) }));
        this.loading.set(false);
      });
    });
  }

  protected add(): void {
    const me = this.auth.currentUserSnapshot;
    if (!me) return;
    this.api.addComment(this.ticketId(), me.id, this.draft()).subscribe((c) => {
      this.comments.update((list) => [...list, c]);
      this.authors.update((map) => ({ ...map, [me.id]: me }));
      this.draft.set('');
      this.toast.show('Dodano komentarz');
    });
  }
}
