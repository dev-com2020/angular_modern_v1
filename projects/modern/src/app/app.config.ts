import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { HttpBackend, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideRouter,
  withComponentInputBinding,
  withNavigationErrorHandler,
  withRouterResources,
} from '@angular/router';
import { Toasts } from './core/toasts';
import { FakeHttpBackend } from '@helpdesk/shared';
import { routes } from './app.routes';
import { authTokenInterceptor } from './core/auth-token.interceptor';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';

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
      withNavigationErrorHandler(() =>
        inject(Toasts).show('Nie udało się otworzyć strony (błąd danych)', 'error'),
      ),
    ),
    provideHttpClient(withInterceptors([authTokenInterceptor])),
    // Branch SSR: fake backend jako HttpBackend (za transfer cache), a nie interceptor. Wyjaśnienie w projects/shared.
    { provide: HttpBackend, useClass: FakeHttpBackend },
    // SSR: przeglądarka "ożywia" HTML z serwera zamiast rysować go od nowa.
    // Od v22 domyślnie z hydratacją przyrostową (bloki @defer z triggerami hydrate ...).
    // HttpClient przekazuje odpowiedzi z serwera do przeglądarki (transfer cache), więc dane nie są pobierane drugi raz.
    provideClientHydration(
      // Nasze żądania mają nagłówek Authorization (authTokenInterceptor). Domyślnie takich odpowiedzi
      // Angular NIE wkłada do HTML (mogą zawierać dane konkretnego użytkownika). Tu świadomie włączamy:
      // HTML renderowany per żądanie, nie cache'owany na CDN. Dane zalogowanego użytkownika (/api/me)
      // wykluczamy filtrem, bo trafiłyby też do prerenderowanej strony /o-aplikacji (generowanej przy buildzie).
      withHttpTransferCacheOptions({
        includeRequestsWithAuthHeaders: true,
        filter: (req) => !req.url.endsWith('/api/me'),
      }),
    ),
  ],
};
