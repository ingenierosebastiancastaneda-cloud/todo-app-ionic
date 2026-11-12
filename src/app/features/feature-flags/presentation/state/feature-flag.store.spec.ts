import { TestBed } from '@angular/core/testing';
import { GetCategoriesEnabledUseCase } from '../../domain/usecases/get-categories-enabled.usecase';
import { FeatureFlagStore } from './feature-flag.store';

function createStore(result: boolean): { store: FeatureFlagStore; execute: jest.Mock } {
  const execute = jest.fn().mockResolvedValue(result);
  TestBed.configureTestingModule({
    providers: [{ provide: GetCategoriesEnabledUseCase, useValue: { execute } }],
  });
  return { store: TestBed.inject(FeatureFlagStore), execute };
}

describe('FeatureFlagStore', () => {
  it('estado inicial: categorías habilitadas y sin inicializar', () => {
    const { store, execute } = createStore(false);
    expect(store.categoriesEnabled()).toBe(true);
    expect(store.initialized()).toBe(false);
    expect(execute).not.toHaveBeenCalled();
  });

  it('init deshabilita categorías cuando el flag remoto es false', async () => {
    const { store } = createStore(false);
    await store.init();
    expect(store.categoriesEnabled()).toBe(false);
    expect(store.initialized()).toBe(true);
  });

  it('init mantiene categorías habilitadas cuando el flag es true', async () => {
    const { store } = createStore(true);
    await store.init();
    expect(store.categoriesEnabled()).toBe(true);
    expect(store.initialized()).toBe(true);
  });
});
