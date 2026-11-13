import { Category, NewCategory } from '../models/category.model';
import { CategoryRepository } from '../repositories/category.repository';

export class AddCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  execute(category: NewCategory): readonly Category[] {
    const newCategory: Category = { ...category, id: crypto.randomUUID() };
    const categories = [...this.repository.getAll(), newCategory];
    this.repository.saveAll(categories);
    return categories;
  }
}
