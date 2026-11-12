import { EnvironmentInjector, Type, createEnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy } from '@ionic/angular';
import { appConfig } from './app.config';
import { CategoryRepository } from './features/categories/domain/repositories/category.repository';
import { AddCategoryUseCase } from './features/categories/domain/usecases/add-category.usecase';
import { DeleteCategoryUseCase } from './features/categories/domain/usecases/delete-category.usecase';
import { GetCategoriesUseCase } from './features/categories/domain/usecases/get-categories.usecase';
import { UpdateCategoryUseCase } from './features/categories/domain/usecases/update-category.usecase';
import { LocalCategoryRepository } from './features/categories/data/repositories/local-category.repository';
import { FirebaseFeatureFlagRepository } from './features/feature-flags/data/repositories/firebase-feature-flag.repository';
import { FeatureFlagRepository } from './features/feature-flags/domain/repositories/feature-flag.repository';
import { GetCategoriesEnabledUseCase } from './features/feature-flags/domain/usecases/get-categories-enabled.usecase';
import { LocalTaskRepository } from './features/tasks/data/repositories/local-task.repository';
import { TaskRepository } from './features/tasks/domain/repositories/task.repository';
import { AddTaskUseCase } from './features/tasks/domain/usecases/add-task.usecase';
import { ClearCategoryFromTasksUseCase } from './features/tasks/domain/usecases/clear-category-from-tasks.usecase';
import { GetTasksUseCase } from './features/tasks/domain/usecases/get-tasks.usecase';
import { RemoveTaskUseCase } from './features/tasks/domain/usecases/remove-task.usecase';
import { ToggleTaskUseCase } from './features/tasks/domain/usecases/toggle-task.usecase';
import { UpdateTaskUseCase } from './features/tasks/domain/usecases/update-task.usecase';

describe('appConfig (composition root)', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = createEnvironmentInjector(
      appConfig.providers,
      TestBed.inject(EnvironmentInjector),
    );
  });

  afterEach(() => injector.destroy());

  it('enlaza los contratos con sus implementaciones concretas', () => {
    expect(injector.get(TaskRepository)).toBeInstanceOf(LocalTaskRepository);
    expect(injector.get(CategoryRepository)).toBeInstanceOf(LocalCategoryRepository);
    expect(injector.get(FeatureFlagRepository)).toBeInstanceOf(FirebaseFeatureFlagRepository);
  });

  it('resuelve todos los casos de uso', () => {
    const useCases: Type<unknown>[] = [
      GetTasksUseCase,
      AddTaskUseCase,
      ToggleTaskUseCase,
      RemoveTaskUseCase,
      UpdateTaskUseCase,
      ClearCategoryFromTasksUseCase,
      GetCategoriesUseCase,
      AddCategoryUseCase,
      UpdateCategoryUseCase,
      DeleteCategoryUseCase,
      GetCategoriesEnabledUseCase,
    ];
    for (const useCase of useCases) {
      expect(injector.get(useCase)).toBeInstanceOf(useCase);
    }
  });

  it('usa IonicRouteStrategy como estrategia de reutilización de rutas', () => {
    expect(injector.get(RouteReuseStrategy)).toBeInstanceOf(IonicRouteStrategy);
  });
});
