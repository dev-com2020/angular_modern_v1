import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { fakeBackendInterceptor } from '@helpdesk/shared';
import { authTokenInterceptor } from './app/core/auth-token.interceptor';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
    // Kolejność ma znaczenie: fake backend nie woła next(), więc musi być ostatni.
    provideHttpClient(withInterceptors([authTokenInterceptor, fakeBackendInterceptor])),
  ],
}).catch((err) => console.error(err));