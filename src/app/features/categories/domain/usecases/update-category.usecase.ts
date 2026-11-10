import { Category, CategoryChanges } from '../models/category.model';
import { CategoryRepository } from '../repositories/category.repository';

export class UpdateCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  execute(id: string, changes: CategoryChanges): readonly Category[] {
    const categories = this.repository
      .getAll()
      .map(c => (c.id === id ? { ...c, ...changes } : c));
    this.repository.saveAll(categories);
    return categories;
  }
}
