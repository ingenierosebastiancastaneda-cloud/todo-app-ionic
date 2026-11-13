import { Injectable, inject, signal, computed } from '@angular/core';
import { Category, CategoryChanges, NewCategory } from '../../domain/models/category.model';
import { GetCategoriesUseCase } from '../../domain/usecases/get-categories.usecase';
import { AddCategoryUseCase } from '../../domain/usecases/add-category.usecase';
import { UpdateCategoryUseCase } from '../../domain/usecases/update-category.usecase';
import { DeleteCategoryUseCase } from '../../domain/usecases/delete-category.usecase';
import { TaskStore } from '../../../tasks/presentation/state/task.store';

/** Estado reactivo (signals) de categorías. Delega toda la lógica en casos de uso. */
@Injectable({ providedIn: 'root' })
export class CategoryStore {
  private readonly getCategories = inject(GetCategoriesUseCase);
  private readonly addCategory = inject(AddCategoryUseCase);
  private readonly updateCategory = inject(UpdateCategoryUseCase);
  private readonly deleteCategory = inject(DeleteCategoryUseCase);
  private readonly taskStore = inject(TaskStore);

  private readonly _categories = signal<readonly Category[]>(this.getCategories.execute());

  readonly categories = this._categories.asReadonly();
  readonly categoryCount = computed(() => this._categories().length);

  getById(id: string): Category | undefined {
    return this._categories().find(c => c.id === id);
  }

  add(category: NewCategory): void {
    this._categories.set(this.addCategory.execute(category));
  }

  update(id: string, changes: CategoryChanges): void {
    this._categories.set(this.updateCategory.execute(id, changes));
  }

  /** Elimina la categoría y refresca las tareas que quedaron sin categoría. */
  remove(id: string): void {
    this._categories.set(this.deleteCategory.execute(id));
    this.taskStore.reload();
  }
}
