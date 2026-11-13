import { Provider, inject } from '@angular/core';
import { FeatureFlagRepository } from './domain/repositories/feature-flag.repository';
import { FirebaseFeatureFlagRepository } from './data/repositories/firebase-feature-flag.repository';
import { GetCategoriesEnabledUseCase } from './domain/usecases/get-categories-enabled.usecase';

/** Composition root del feature feature-flags. */
export const FEATURE_FLAGS_PROVIDERS: Provider[] = [
  { provide: FeatureFlagRepository, useClass: FirebaseFeatureFlagRepository },
  {
    provide: GetCategoriesEnabledUseCase,
    useFactory: () => new GetCategoriesEnabledUseCase(inject(FeatureFlagRepository)),
  },
];
