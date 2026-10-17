import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@helpdesk/shared';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  readonly isLoggedIn$ = this.currentUser$.pipe(map((u) => !!u));

  get token(): string {
    return 'demo-token';
  }

  get currentUserSnapshot(): User | null {
    return this.currentUserSubject.value;
  }

  loadCurrentUser(): void {
    this.http.get<User>('/api/me').subscribe((u) => this.currentUserSubject.next(u));
  }
}
