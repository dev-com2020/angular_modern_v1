import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '@helpdesk/shared';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
