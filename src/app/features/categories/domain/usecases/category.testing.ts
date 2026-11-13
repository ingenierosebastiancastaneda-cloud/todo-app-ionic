import { Category } from '../models/category.model';
import { CategoryRepository } from '../repositories/category.repository';

/** Utilidades SOLO para tests (excluidas del build y de la cobertura). */
export class InMemoryCategoryRepository extends CategoryRepository {
  saveCalls = 0;

  constructor(private items: readonly Category[] = []) {
    super();
  }

  getAll(): readonly Category[] {
    return this.items;
  }

  saveAll(categories: readonly Category[]): void {
    this.saveCalls++;
    this.items = categories;
  }
}

export function makeCategory(overrides: Partial<Category> = {}): Category {
  return { id: 'c-1', name: 'Personal', color: '#4f46e5', icon: 'person-outline', ...overrides };
}
