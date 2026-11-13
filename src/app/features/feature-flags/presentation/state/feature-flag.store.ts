import { Injectable, inject, signal } from '@angular/core';
import { GetCategoriesEnabledUseCase } from '../../domain/usecases/get-categories-enabled.usecase';

@Injectable({ providedIn: 'root' })
export class FeatureFlagStore {
  private readonly getCategoriesEnabled = inject(GetCategoriesEnabledUseCase);

  readonly categoriesEnabled = signal<boolean>(true);
  readonly initialized = signal<boolean>(false);

  async init(): Promise<void> {
    this.categoriesEnabled.set(await this.getCategoriesEnabled.execute());
    this.initialized.set(true);
  }
}
