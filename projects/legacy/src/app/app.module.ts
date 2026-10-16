import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { fakeBackendInterceptor } from '@helpdesk/shared';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToastComponent } from './core/toast.component';
import { AuthTokenInterceptor } from './core/auth-token.interceptor';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [AppComponent, ToastComponent],
  imports: [BrowserModule, AppRoutingModule, SharedModule],
  providers: [
    // Interceptor klasowy (DI) obok funkcyjnego fake backendu.
    provideHttpClient(withInterceptorsFromDi(), withInterceptors([fakeBackendInterceptor])),
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
