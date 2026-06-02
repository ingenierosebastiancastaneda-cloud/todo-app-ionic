import { Injectable, signal, computed } from '@angular/core';
import { Category } from '../models/category.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'categories';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Personal', color: '#4f46e5', icon: 'person-outline' },
  { id: 'cat-2', name: 'Trabajo', color: '#06b6d4', icon: 'briefcase-outline' },
  { id: 'cat-3', name: 'Compras', color: '#10b981', icon: 'cart-outline' },
];

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly _categories = signal<Category[]>([]);

  readonly categories = this._categories.asReadonly();
  readonly categoryCount = computed(() => this._categories().length);

  constructor(private readonly storage: StorageService) {
    this.loadFromStorage();
  }

  getById(id: string): Category | undefined {
    return this._categories().find(c => c.id === id);
  }

  add(category: Omit<Category, 'id'>): void {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
    };
    this._categories.update(cats => [...cats, newCategory]);
    this.persist();
  }

  update(id: string, changes: Partial<Omit<Category, 'id'>>): void {
    this._categories.update(cats =>
      cats.map(c => (c.id === id ? { ...c, ...changes } : c))
    );
    this.persist();
  }

  remove(id: string): void {
    this._categories.update(cats => cats.filter(c => c.id !== id));
    this.persist();
  }

  private loadFromStorage(): void {
    const stored = this.storage.get<Category[]>(STORAGE_KEY);
    if (stored && stored.length > 0) {
      this._categories.set(stored);
    } else {
      this._categories.set(DEFAULT_CATEGORIES);
      this.persist();
    }
  }

  private persist(): void {
    this.storage.set(STORAGE_KEY, this._categories());
  }
}
