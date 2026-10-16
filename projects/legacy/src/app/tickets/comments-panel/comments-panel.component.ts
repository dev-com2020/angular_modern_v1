import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { forkJoin } from 'rxjs';
import { TicketComment, User } from '@helpdesk/shared';
import { TicketsApiService } from '../../core/tickets-api.service';
import { UsersApiService } from '../../core/users-api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

/** Panel komentarzy. Udaje "ciężki" komponent (dużo kodu, osobne żądania). */
@Component({
  selector: 'app-comments-panel',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="card">
      <h2>Komentarze ({{ comments.length }})</h2>
      <div *ngIf="loading" class="skeleton"></div>
      <div *ngFor="let c of comments" style="margin-bottom: 10px">
        <b>{{ authors[c.authorId]?.name }}</b>
        <span class="muted"> · {{ c.createdAt | date: 'dd.MM.yyyy HH:mm' }}</span>
        <div>{{ c.body }}</div>
      </div>
      <div class="row">
        <input class="grow" [value]="draft" (input)="draft = $any($event.target).value" placeholder="Dodaj komentarz" />
        <button class="primary" [disabled]="!draft.trim()" (click)="add()">Dodaj</button>
      </div>
    </div>
  `,
})
export class CommentsPanelComponent implements OnChanges {
  @Input() ticketId!: number;
  comments: TicketComment[] = [];
  authors: { [id: number]: User } = {};
  loading = false;
  draft = '';

  constructor(
    private api: TicketsApiService,
    private usersApi: UsersApiService,
    private auth: AuthService,
    private toast: ToastService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticketId']) this.load();
  }

  load(): void {
    this.loading = true;
    this.api.comments(this.ticketId).subscribe((comments) => {
      this.comments = comments;
      const ids = [...new Set(comments.map((c) => c.authorId))];
      if (ids.length === 0) {
        this.loading = false;
        return;
      }
      // forkJoin z N żądaniami: lepiej niż pętla subscribe, ale wciąż N+1.
      forkJoin(ids.map((id) => this.usersApi.getById(id))).subscribe((users) => {
        users.forEach((u) => (this.authors[u.id] = u));
        this.loading = false;
      });
    });
  }

  add(): void {
    const me = this.auth.currentUserSnapshot;
    if (!me) return;
    this.api.addComment(this.ticketId, me.id, this.draft).subscribe((c) => {
      this.comments.push(c);
      this.authors[me.id] = me;
      this.draft = '';
      this.toast.show('Dodano komentarz');
    });
  }
}
