import { Provider, inject } from '@angular/core';
import { CategoryRepository } from './domain/repositories/category.repository';
import { LocalCategoryRepository } from './data/repositories/local-category.repository';
import { GetCategoriesUseCase } from './domain/usecases/get-categories.usecase';
import { AddCategoryUseCase } from './domain/usecases/add-category.usecase';
import { UpdateCategoryUseCase } from './domain/usecases/update-category.usecase';
import { RemoveCategoryUseCase } from './domain/usecases/remove-category.usecase';

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
    provide: RemoveCategoryUseCase,
    useFactory: () => new RemoveCategoryUseCase(inject(CategoryRepository)),
  },
];
