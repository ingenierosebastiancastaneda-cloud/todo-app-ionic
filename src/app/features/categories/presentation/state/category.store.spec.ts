import { TestBed } from '@angular/core/testing';
import { TaskRepository } from '../../../tasks/domain/repositories/task.repository';
import { InMemoryTaskRepository, makeTask } from '../../../tasks/domain/usecases/task.testing';
import { TASKS_PROVIDERS } from '../../../tasks/tasks.providers';
import { TaskStore } from '../../../tasks/presentation/state/task.store';
import { CATEGORIES_PROVIDERS } from '../../categories.providers';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { InMemoryCategoryRepository, makeCategory } from '../../domain/usecases/category.testing';
import { CategoryStore } from './category.store';

function createStore(categories = [makeCategory({ id: 'a' }), makeCategory({ id: 'b' })]): {
  store: CategoryStore;
  taskStore: TaskStore;
  categoryRepo: InMemoryCategoryRepository;
  taskRepo: InMemoryTaskRepository;
} {
  const categoryRepo = new InMemoryCategoryRepository(categories);
  const taskRepo = new InMemoryTaskRepository([
    makeTask({ id: 't1', categoryId: 'a' }),
    makeTask({ id: 't2', categoryId: 'b' }),
  ]);
  TestBed.configureTestingModule({
    providers: [
      ...TASKS_PROVIDERS,
      ...CATEGORIES_PROVIDERS,
      { provide: TaskRepository, useValue: taskRepo },
      { provide: CategoryRepository, useValue: categoryRepo },
    ],
  });
  return {
    store: TestBed.inject(CategoryStore),
    taskStore: TestBed.inject(TaskStore),
    categoryRepo,
    taskRepo,
  };
}

describe('CategoryStore', () => {
  it('carga las categorías y expone el contador', () => {
    const { store } = createStore();
    expect(store.categories().map(c => c.id)).toEqual(['a', 'b']);
    expect(store.categoryCount()).toBe(2);
  });

  it('siembra las categorías por defecto si el repositorio está vacío', () => {
    const { store } = createStore([]);
    expect(store.categoryCount()).toBe(3);
  });

  it('getById devuelve la categoría o undefined', () => {
    const { store } = createStore();
    expect(store.getById('a')?.id).toBe('a');
    expect(store.getById('zzz')).toBeUndefined();
  });

  it('add agrega y persiste', () => {
    const { store, categoryRepo } = createStore();
    store.add({ name: 'Nueva', color: '#000', icon: 'star-outline' });
    expect(store.categoryCount()).toBe(3);
    expect(store.categories()[2]?.name).toBe('Nueva');
    expect(categoryRepo.getAll()).toBe(store.categories());
  });

  it('update modifica la categoría', () => {
    const { store } = createStore();
    store.update('a', { name: 'Renombrada' });
    expect(store.getById('a')?.name).toBe('Renombrada');
  });

  it('remove elimina la categoría, limpia las tareas y recarga el TaskStore', () => {
    const { store, taskStore } = createStore();
    expect(taskStore.getTaskCountByCategory('a')).toBe(1);

    store.remove('a');

    expect(store.categories().map(c => c.id)).toEqual(['b']);
    expect(taskStore.getTaskCountByCategory('a')).toBe(0);
    expect(taskStore.tasks().find(t => t.id === 't1')?.categoryId).toBeNull();
    expect(taskStore.getTaskCountByCategory('b')).toBe(1);
  });
});
