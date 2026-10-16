import { Service } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { User } from '@helpdesk/shared';

@Service()
export class Auth {
  readonly token = 'demo-token';
  /** Zamiast BehaviorSubject + loadCurrentUser(): zasób, który sam się ładuje. */
  readonly currentUser = httpResource<User>(() => '/api/me');
}
