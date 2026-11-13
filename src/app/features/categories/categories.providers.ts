import { Provider, inject } from '@angular/core';
import { CategoryRepository } from './domain/repositories/category.repository';
import { LocalCategoryRepository } from './data/repositories/local-category.repository';
import { GetCategoriesUseCase } from './domain/usecases/get-categories.usecase';
import { AddCategoryUseCase } from './domain/usecases/add-category.usecase';
import { UpdateCategoryUseCase } from './domain/usecases/update-category.usecase';
import { DeleteCategoryUseCase } from './domain/usecases/delete-category.usecase';
import { ClearCategoryFromTasksUseCase } from '../tasks/domain/usecases/clear-category-from-tasks.usecase';

/** Composition root del feature categories: enlaza contratos con implementaciones. */
export const CATEGORIES_PROVIDERS: Provider[] = [
  { provide: CategoryRepository, useClass: LocalCategoryRepository },
  {
    provide: GetCategoriesUseCase,
    useFactory: () => new GetCategoriesUseCase(inject(CategoryRepository)),
  },
  {
    provide: AddCategoryUseCase,
    useFactory: () => new AddCategoryUseCase(inject(CategoryRepository)),
  },
  {
    provide: UpdateCategoryUseCase,
    useFactory: () => new UpdateCategoryUseCase(inject(CategoryRepository)),
  },
  {
    provide: DeleteCategoryUseCase,
    useFactory: () =>
      new DeleteCategoryUseCase(
        inject(CategoryRepository),
        inject(ClearCategoryFromTasksUseCase),
      ),
  },
];
