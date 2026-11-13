import { FeatureFlagRepository } from '../repositories/feature-flag.repository';
import { GetCategoriesEnabledUseCase } from './get-categories-enabled.usecase';

class FakeFlagRepository extends FeatureFlagRepository {
  constructor(private readonly impl: () => Promise<boolean>) {
    super();
  }

  isCategoriesEnabled(): Promise<boolean> {
    return this.impl();
  }
}

describe('GetCategoriesEnabledUseCase', () => {
  it.each([true, false])('devuelve el valor del repositorio (%s)', async value => {
    const useCase = new GetCategoriesEnabledUseCase(new FakeFlagRepository(async () => value));
    await expect(useCase.execute()).resolves.toBe(value);
  });

  it('es fail-safe: ante un error devuelve true', async () => {
    const useCase = new GetCategoriesEnabledUseCase(
      new FakeFlagRepository(() => Promise.reject(new Error('network'))),
    );
    await expect(useCase.execute()).resolves.toBe(true);
  });
});
