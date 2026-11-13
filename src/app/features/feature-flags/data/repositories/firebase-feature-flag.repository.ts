import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { FeatureFlagRepository } from '../../domain/repositories/feature-flag.repository';

/**
 * Feature flags vía Firebase Remote Config (SDK cargado con dynamic import).
 *
 * Parámetro remoto:
 *   - Key: "categories_enabled"
 *   - Tipo: String ("true" / "false")
 *   - Default: "true"
 *
 * Si Firebase no está configurado (projectId vacío) devuelve el valor por defecto.
 */
@Injectable()
export class FirebaseFeatureFlagRepository extends FeatureFlagRepository {
  async isCategoriesEnabled(): Promise<boolean> {
    if (!environment.firebase.projectId) {
      return true;
    }

    const { initializeApp } = await import('firebase/app');
    const { getRemoteConfig, fetchAndActivate, getValue } = await import('firebase/remote-config');

    const app = initializeApp(environment.firebase);
    const remoteConfig = getRemoteConfig(app);

    remoteConfig.settings.minimumFetchIntervalMillis = environment.production ? 3600000 : 30000;
    remoteConfig.defaultConfig = { categories_enabled: 'true' };

    await fetchAndActivate(remoteConfig);
    return getValue(remoteConfig, 'categories_enabled').asString() === 'true';
  }
}
