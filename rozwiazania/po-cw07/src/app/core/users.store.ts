import { Service, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { User } from '@helpdesk/shared';

/**
 * Ćw. 7: jedno żądanie po wszystkich użytkowników + słownik id -> User.
 * Zastępuje żądania w pętli (N+1) na liście i w panelu komentarzy.
 */
@Service()
export class UsersStore {
  private readonly resource = httpResource<User[]>(() => '/api/users', { defaultValue: [] });

  readonly all = computed(() => (this.resource.hasValue() ? this.resource.value() : []));
  readonly byId = computed(() => new Map(this.all().map((u) => [u.id, u])));
  readonly error = computed(() => !!this.resource.error());

  reload(): void {
    this.resource.reload();
  }
}
