import { inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withNavigationErrorHandler, withRouterResources } from '@angular/router';
import { fakeBackendInterceptor } from '@helpdesk/shared';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authTokenInterceptor } from './app/core/auth-token.interceptor';
import { ToastService } from './app/core/toast.service';

// Ćw. 5: brak zone.js i provideZoneChangeDetection, aplikacja jest zoneless (domyślnie od v21).
bootstrapApplication(AppComponent, {
  providers: [
    // Ćw. 7: parametry trasy (np. :id) trafiają do komponentów jako inputy.
    provideRouter(
      routes,
      withComponentInputBinding(),
      // Ćw. 12 (v22.2, developer preview): zasoby w definicji trasy, ładowane równolegle z nawigacją.
      withRouterResources(),
      // Błąd blokującego zasobu trasy anuluje nawigację: pokazujemy toast zamiast ciszy.
      withNavigationErrorHandler(() => inject(ToastService).show('Nie udało się otworzyć strony', 'error')),
    ),
    // Kolejność ma znaczenie: fake backend nie woła next(), więc musi być ostatni.
    provideHttpClient(withInterceptors([authTokenInterceptor, fakeBackendInterceptor])),
  ],
}).catch((err) => console.error(err));
