import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from './auth.service';

// Guard klasowy. Do migracji na CanActivateFn.
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  canActivate(): boolean {
    // Demo: zawsze wpuszczamy, ale zachowujemy kształt typowego guarda.
    return !!this.auth.token;
  }
}
