import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { IonicRouteStrategy } from '@ionic/angular';
import { RouteReuseStrategy } from '@angular/router';
import { routes } from './app.routes';
import { TASKS_PROVIDERS } from './features/tasks/tasks.providers';
import { CATEGORIES_PROVIDERS } from './features/categories/categories.providers';
import { FEATURE_FLAGS_PROVIDERS } from './features/feature-flags/feature-flags.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideIonicAngular({ mode: 'md' }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ...TASKS_PROVIDERS,
    ...CATEGORIES_PROVIDERS,
    ...FEATURE_FLAGS_PROVIDERS,
  ],
};
