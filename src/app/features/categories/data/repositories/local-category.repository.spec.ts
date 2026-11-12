import { TestBed } from '@angular/core/testing';
import { StorageService } from '../../../../core/infrastructure/storage.service';
import { makeCategory } from '../../domain/usecases/category.testing';
import { LocalCategoryRepository } from './local-category.repository';

describe('LocalCategoryRepository', () => {
  let repo: LocalCategoryRepository;
  let storage: { get: jest.Mock; set: jest.Mock };

  beforeEach(() => {
    storage = { get: jest.fn(), set: jest.fn() };
    TestBed.configureTestingModule({
      providers: [LocalCategoryRepository, { provide: StorageService, useValue: storage }],
    });
    repo = TestBed.inject(LocalCategoryRepository);
  });

  it('getAll lee la clave "categories"', () => {
    const categories = [makeCategory()];
    storage.get.mockReturnValue(categories);
    expect(repo.getAll()).toBe(categories);
    expect(storage.get).toHaveBeenCalledWith('categories');
  });

  it('getAll devuelve [] si no hay datos', () => {
    storage.get.mockReturnValue(null);
    expect(repo.getAll()).toEqual([]);
  });

  it('saveAll escribe en la clave "categories"', () => {
    const categories = [makeCategory()];
    repo.saveAll(categories);
    expect(storage.set).toHaveBeenCalledWith('categories', categories);
  });
});
