import { ClearCategoryFromTasksUseCase } from '../../../tasks/domain/usecases/clear-category-from-tasks.usecase';
import { Category } from '../models/category.model';
import { CategoryRepository } from '../repositories/category.repository';

/**
 * Elimina una categoría preservando la integridad de los datos:
 * primero deja sin categoría las tareas que la usaban y luego borra la categoría.
 */
export class DeleteCategoryUseCase {
  constructor(
    private readonly repository: CategoryRepository,
    private readonly clearCategoryFromTasks: ClearCategoryFromTasksUseCase,
  ) {}

  execute(id: string): readonly Category[] {
    this.clearCategoryFromTasks.execute(id);
    const categories = this.repository.getAll().filter(c => c.id !== id);
    this.repository.saveAll(categories);
    return categories;
  }
}
