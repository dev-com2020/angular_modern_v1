import { provideZoneChangeDetection } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';

// Aplikacja "legacy": NgModule + zone.js (polyfill w angular.json).
platformBrowser()
  .bootstrapModule(AppModule, {
    applicationProviders: [provideZoneChangeDetection({ eventCoalescing: true })],
  })
  .catch((err) => console.error(err));
