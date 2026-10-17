import { provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { platformBrowser, BrowserModule, bootstrapApplication } from '@angular/platform-browser';

import {
  provideHttpClient,
  withInterceptorsFromDi,
  withInterceptors,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { fakeBackendInterceptor } from '@helpdesk/shared';
import { AuthTokenInterceptor } from './app/core/auth-token.interceptor';
import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';

// Aplikacja "legacy": NgModule + zone.js (polyfill w angular.json).
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule),
    provideZoneChangeDetection(),
    // Interceptor klasowy (DI) obok funkcyjnego fake backendu.
    provideHttpClient(withInterceptorsFromDi(), withInterceptors([fakeBackendInterceptor])),
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
  ],
}).catch((err) => console.error(err));
