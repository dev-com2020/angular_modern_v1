import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withNavigationErrorHandler, withRouterResources } from '@angular/router';
import { Toasts } from './core/toasts';
import { fakeBackendInterceptor } from '@helpdesk/shared';
import { routes } from './app.routes';
import { authTokenInterceptor } from './core/auth-token.interceptor';

// Brak zone.js i brak provideZoneChangeDetection: aplikacja jest zoneless (domyślnie od v21).
// OnPush jest domyślną strategią od v22, więc komponenty nie muszą jej deklarować.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      // v22.2 (developer preview): zasoby w definicji trasy, ładowane równolegle z nawigacją.
      withRouterResources(),
      // Błąd blokującego zasobu trasy anuluje nawigację: pokazujemy toast zamiast ciszy.
      withNavigationErrorHandler(() => inject(Toasts).show('Nie udało się otworzyć strony (błąd danych)', 'error')),
    ),
    provideHttpClient(withInterceptors([authTokenInterceptor, fakeBackendInterceptor])),
  ],
};
