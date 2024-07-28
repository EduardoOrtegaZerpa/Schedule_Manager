import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { AuthInterceptor, ResponseInterceptor, LoaderInterceptor } from './auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([AuthInterceptor, ResponseInterceptor, LoaderInterceptor])
    )
  ]
};

const debugApiUrl = '/api';
const productionApiUrl = 'https://scheduler.eduortza.com:3001/api';
export const apiUrl = debugApiUrl;
