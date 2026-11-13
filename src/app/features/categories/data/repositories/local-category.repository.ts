import { Injectable, inject } from '@angular/core';
import { StorageService } from '../../../../core/infrastructure/storage.service';
import { Category } from '../../domain/models/category.model';
import { CategoryRepository } from '../../domain/repositories/category.repository';

const STORAGE_KEY = 'categories';

@Injectable()
export class LocalCategoryRepository extends CategoryRepository {
  private readonly storage = inject(StorageService);

  getAll(): readonly Category[] {
    return this.storage.get<Category[]>(STORAGE_KEY) ?? [];
  }

  saveAll(categories: readonly Category[]): void {
    this.storage.set(STORAGE_KEY, categories);
  }
}
