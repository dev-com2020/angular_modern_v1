import { Service, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { User } from '@helpdesk/shared';

/**
 * Jedno żądanie po wszystkich użytkowników + słownik id -> User.
 * Rozwiązuje problem "żądań w pętli" (N+1) z aplikacji legacy.
 */
@Service()
export class Users {
  private readonly resource = httpResource<User[]>(() => '/api/users', { defaultValue: [] });

  readonly all = computed(() => (this.resource.hasValue() ? this.resource.value() : []));
  readonly byId = computed(() => new Map(this.all().map((u) => [u.id, u])));
  readonly loading = this.resource.isLoading;
}
