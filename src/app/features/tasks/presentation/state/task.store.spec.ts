import { TestBed } from '@angular/core/testing';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { InMemoryTaskRepository, makeTask } from '../../domain/usecases/task.testing';
import { TASKS_PROVIDERS } from '../../tasks.providers';
import { TaskStore } from './task.store';

function createStore(initial = [
  makeTask({ id: 'a', categoryId: 'c-1', completed: true }),
  makeTask({ id: 'b', categoryId: 'c-2' }),
  makeTask({ id: 'c', categoryId: 'c-1' }),
]): { store: TaskStore; repo: InMemoryTaskRepository } {
  const repo = new InMemoryTaskRepository(initial);
  TestBed.configureTestingModule({
    providers: [...TASKS_PROVIDERS, { provide: TaskRepository, useValue: repo }],
  });
  return { store: TestBed.inject(TaskStore), repo };
}

describe('TaskStore', () => {
  it('carga las tareas del repositorio al crearse', () => {
    const { store } = createStore();
    expect(store.tasks().map(t => t.id)).toEqual(['a', 'b', 'c']);
    expect(store.totalCount()).toBe(3);
  });

  it('arranca sin filtro y calcula contadores', () => {
    const { store } = createStore();
    expect(store.selectedCategoryId()).toBeNull();
    expect(store.filteredTasks()).toHaveLength(3);
    expect(store.completedCount()).toBe(1);
    expect(store.pendingCount()).toBe(2);
  });

  it('setFilter filtra tareas y recalcula contadores filtrados, no el total', () => {
    const { store } = createStore();
    store.setFilter('c-1');
    expect(store.selectedCategoryId()).toBe('c-1');
    expect(store.filteredTasks().map(t => t.id)).toEqual(['a', 'c']);
    expect(store.completedCount()).toBe(1);
    expect(store.pendingCount()).toBe(1);
    expect(store.totalCount()).toBe(3);

    store.setFilter(null);
    expect(store.filteredTasks()).toHaveLength(3);
  });

  it('add inserta al inicio y persiste', () => {
    const { store, repo } = createStore([]);
    store.add('Nueva', 'c-1');
    expect(store.tasks()[0]).toEqual(
      expect.objectContaining({ title: 'Nueva', categoryId: 'c-1' }),
    );
    expect(repo.getAll()).toBe(store.tasks());
  });

  it('add usa categoryId null por defecto', () => {
    const { store } = createStore([]);
    store.add('Sin categoría');
    expect(store.tasks()[0]?.categoryId).toBeNull();
  });

  it('toggle invierte el estado completado', () => {
    const { store } = createStore();
    store.toggle('b');
    expect(store.tasks().find(t => t.id === 'b')?.completed).toBe(true);
  });

  it('remove elimina la tarea', () => {
    const { store } = createStore();
    store.remove('a');
    expect(store.tasks().map(t => t.id)).toEqual(['b', 'c']);
  });

  it('updateTask aplica los cambios', () => {
    const { store } = createStore();
    store.updateTask('b', { title: 'Editada', categoryId: null });
    expect(store.tasks().find(t => t.id === 'b')).toEqual(
      expect.objectContaining({ title: 'Editada', categoryId: null }),
    );
  });

  it('reload relee el repositorio (cambios hechos por otro feature)', () => {
    const { store, repo } = createStore();
    repo.saveAll([makeTask({ id: 'z' })]);
    expect(store.tasks()).toHaveLength(3);
    store.reload();
    expect(store.tasks().map(t => t.id)).toEqual(['z']);
  });

  it('getTaskCountByCategory cuenta por categoría', () => {
    const { store } = createStore();
    expect(store.getTaskCountByCategory('c-1')).toBe(2);
    expect(store.getTaskCountByCategory('c-2')).toBe(1);
    expect(store.getTaskCountByCategory('nope')).toBe(0);
  });
});
