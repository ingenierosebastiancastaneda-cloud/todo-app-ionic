import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Feature Flag service using Firebase Remote Config.
 * Controls visibility of the categories feature via remote configuration.
 *
 * Remote Config parameter:
 *   - Key: "categories_enabled"
 *   - Type: Boolean
 *   - Default: true
 *
 * When Firebase is not configured (empty projectId), defaults are used.
 */
@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  readonly categoriesEnabled = signal<boolean>(true);
  readonly initialized = signal<boolean>(false);

  async init(): Promise<void> {
    if (!environment.firebase.projectId) {
      this.initialized.set(true);
      return;
    }

    try {
      const { initializeApp } = await import('firebase/app');
      const { getRemoteConfig, fetchAndActivate, getValue } = await import('firebase/remote-config');

      const app = initializeApp(environment.firebase);
      const remoteConfig = getRemoteConfig(app);

      remoteConfig.settings.minimumFetchIntervalMillis = environment.production ? 3600000 : 30000;
      remoteConfig.defaultConfig = {
        categories_enabled: 'true',
      };

      await fetchAndActivate(remoteConfig);
      const value = getValue(remoteConfig, 'categories_enabled');
      this.categoriesEnabled.set(value.asString() === 'true');
    } catch (error) {
      console.warn('Remote Config fetch failed, using defaults:', error);
    } finally {
      this.initialized.set(true);
    }
  }
}
