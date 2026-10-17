import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { fakeBackendInterceptor } from '@helpdesk/shared';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authTokenInterceptor } from './app/core/auth-token.interceptor';

// Ćw. 5: brak zone.js i provideZoneChangeDetection, aplikacja jest zoneless (domyślnie od v21).
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    // Kolejność ma znaczenie: fake backend nie woła next(), więc musi być ostatni.
    provideHttpClient(withInterceptors([authTokenInterceptor, fakeBackendInterceptor])),
  ],
}).catch((err) => console.error(err));
