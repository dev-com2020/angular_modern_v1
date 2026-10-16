import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { fakeBackendInterceptor } from '@helpdesk/shared';
import { routes } from './app.routes';
import { authTokenInterceptor } from './core/auth-token.interceptor';

// Brak zone.js i brak provideZoneChangeDetection: aplikacja jest zoneless (domyślnie od v21).
// OnPush jest domyślną strategią od v22, więc komponenty nie muszą jej deklarować.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authTokenInterceptor, fakeBackendInterceptor])),
  ],
};
