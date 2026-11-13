/** Contrato de acceso a feature flags remotos. */
export abstract class FeatureFlagRepository {
  /** Indica si la funcionalidad de categorías está habilitada. Nunca debe lanzar. */
  abstract isCategoriesEnabled(): Promise<boolean>;
}
