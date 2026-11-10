import { Category } from '../models/category.model';
import { CategoryRepository } from '../repositories/category.repository';

const DEFAULT_CATEGORIES: readonly Category[] = [
  { id: 'cat-1', name: 'Personal', color: '#4f46e5', icon: 'person-outline' },
  { id: 'cat-2', name: 'Trabajo', color: '#06b6d4', icon: 'briefcase-outline' },
  { id: 'cat-3', name: 'Compras', color: '#10b981', icon: 'cart-outline' },
];

/** Devuelve las categorías; si no hay ninguna, siembra las predeterminadas. */
export class GetCategoriesUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  execute(): readonly Category[] {
    const stored = this.repository.getAll();
    if (stored.length > 0) {
      return stored;
    }
    this.repository.saveAll(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
}
