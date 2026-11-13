import { ClearCategoryFromTasksUseCase } from '../../../tasks/domain/usecases/clear-category-from-tasks.usecase';
import {
  InMemoryTaskRepository,
  makeTask,
} from '../../../tasks/domain/usecases/task.testing';
import { AddCategoryUseCase } from './add-category.usecase';
import { DeleteCategoryUseCase } from './delete-category.usecase';
import { GetCategoriesUseCase } from './get-categories.usecase';
import { UpdateCategoryUseCase } from './update-category.usecase';
import { InMemoryCategoryRepository, makeCategory } from './category.testing';

describe('Category use cases', () => {
  describe('GetCategoriesUseCase', () => {
    it('devuelve las categorías almacenadas sin sembrar', () => {
      const stored = [makeCategory()];
      const repo = new InMemoryCategoryRepository(stored);
      expect(new GetCategoriesUseCase(repo).execute()).toBe(stored);
      expect(repo.saveCalls).toBe(0);
    });

    it('siembra y persiste las categorías por defecto si no hay ninguna', () => {
      const repo = new InMemoryCategoryRepository();
      const result = new GetCategoriesUseCase(repo).execute();
      expect(result.map(c => c.name)).toEqual(['Personal', 'Trabajo', 'Compras']);
      expect(repo.getAll()).toBe(result);
      expect(repo.saveCalls).toBe(1);
    });
  });

  describe('AddCategoryUseCase', () => {
    it('agrega al final con id generado y persiste', () => {
      const existing = makeCategory({ id: 'old' });
      const repo = new InMemoryCategoryRepository([existing]);

      const result = new AddCategoryUseCase(repo).execute({
        name: 'Gym',
        color: '#fff',
        icon: 'fitness-outline',
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toBe(existing);
      expect(result[1]).toEqual({
        id: expect.any(String),
        name: 'Gym',
        color: '#fff',
        icon: 'fitness-outline',
      });
      expect(repo.getAll()).toBe(result);
    });
  });

  describe('UpdateCategoryUseCase', () => {
    it('modifica solo la categoría indicada', () => {
      const repo = new InMemoryCategoryRepository([
        makeCategory({ id: 'a', name: 'A' }),
        makeCategory({ id: 'b', name: 'B' }),
      ]);
      const result = new UpdateCategoryUseCase(repo).execute('a', { name: 'Nuevo' });
      expect(result.map(c => c.name)).toEqual(['Nuevo', 'B']);
      expect(repo.saveCalls).toBe(1);
    });
  });

  describe('DeleteCategoryUseCase', () => {
    it('limpia la categoría de las tareas y luego la elimina', () => {
      const categoryRepo = new InMemoryCategoryRepository([
        makeCategory({ id: 'a' }),
        makeCategory({ id: 'b' }),
      ]);
      const taskRepo = new InMemoryTaskRepository([
        makeTask({ id: 't1', categoryId: 'a' }),
        makeTask({ id: 't2', categoryId: 'b' }),
      ]);
      const clear = new ClearCategoryFromTasksUseCase(taskRepo);
      const clearSpy = jest.spyOn(clear, 'execute');

      const result = new DeleteCategoryUseCase(categoryRepo, clear).execute('a');

      expect(clearSpy).toHaveBeenCalledWith('a');
      expect(result.map(c => c.id)).toEqual(['b']);
      expect(categoryRepo.getAll()).toBe(result);
      expect(taskRepo.getAll().map(t => t.categoryId)).toEqual([null, 'b']);
    });
  });
});
