import { FeatureFlagRepository } from '../repositories/feature-flag.repository';

/** Fail-safe: ante cualquier error, la funcionalidad queda habilitada. */
export class GetCategoriesEnabledUseCase {
  constructor(private readonly repository: FeatureFlagRepository) {}

  async execute(): Promise<boolean> {
    try {
      return await this.repository.isCategoriesEnabled();
    } catch {
      return true;
    }
  }
}
