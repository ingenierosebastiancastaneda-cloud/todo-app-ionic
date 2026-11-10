import { Category } from '../models/category.model';
import { CategoryRepository } from '../repositories/category.repository';

export class RemoveCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  execute(id: string): readonly Category[] {
    const categories = this.repository.getAll().filter(c => c.id !== id);
    this.repository.saveAll(categories);
    return categories;
  }
}
