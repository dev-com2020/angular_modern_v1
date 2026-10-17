import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

// Demo: zawsze wpuszczamy, ale zachowujemy kształt typowego guarda.
export const authGuard: CanActivateFn = () => !!inject(AuthService).token;
