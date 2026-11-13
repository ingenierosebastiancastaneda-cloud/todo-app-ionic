import { AddTaskUseCase } from './add-task.usecase';
import { ClearCategoryFromTasksUseCase } from './clear-category-from-tasks.usecase';
import { GetTasksUseCase } from './get-tasks.usecase';
import { RemoveTaskUseCase } from './remove-task.usecase';
import { ToggleTaskUseCase } from './toggle-task.usecase';
import { UpdateTaskUseCase } from './update-task.usecase';
import { InMemoryTaskRepository, makeTask } from './task.testing';

describe('Task use cases', () => {
  describe('AddTaskUseCase', () => {
    it('agrega la tarea al inicio, recortando el título y persistiendo', () => {
      const existing = makeTask({ id: 'old' });
      const repo = new InMemoryTaskRepository([existing]);

      const result = new AddTaskUseCase(repo).execute('  Comprar pan  ', 'c-1');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          title: 'Comprar pan',
          completed: false,
          categoryId: 'c-1',
          id: expect.any(String),
          createdAt: expect.any(String),
        }),
      );
      expect(result[1]).toBe(existing);
      expect(repo.getAll()).toBe(result);
      expect(repo.saveCalls).toBe(1);
    });

    it('usa categoryId null por defecto', () => {
      const result = new AddTaskUseCase(new InMemoryTaskRepository()).execute('x');
      expect(result[0]?.categoryId).toBeNull();
    });

    it('genera ids distintos', () => {
      const useCase = new AddTaskUseCase(new InMemoryTaskRepository());
      const first = useCase.execute('a')[0];
      const second = useCase.execute('b')[0];
      expect(first?.id).not.toBe(second?.id);
    });
  });

  describe('GetTasksUseCase', () => {
    it('devuelve lo que hay en el repositorio sin persistir', () => {
      const tasks = [makeTask()];
      const repo = new InMemoryTaskRepository(tasks);
      expect(new GetTasksUseCase(repo).execute()).toBe(tasks);
      expect(repo.saveCalls).toBe(0);
    });
  });

  describe('ToggleTaskUseCase', () => {
    it('invierte solo la tarea indicada', () => {
      const repo = new InMemoryTaskRepository([
        makeTask({ id: 'a', completed: false }),
        makeTask({ id: 'b', completed: true }),
      ]);
      const useCase = new ToggleTaskUseCase(repo);

      const first = useCase.execute('a');
      expect(first.map(t => t.completed)).toEqual([true, true]);

      const second = useCase.execute('b');
      expect(second.map(t => t.completed)).toEqual([true, false]);
      expect(repo.saveCalls).toBe(2);
    });

    it('no cambia nada si el id no existe', () => {
      const repo = new InMemoryTaskRepository([makeTask({ id: 'a' })]);
      const result = new ToggleTaskUseCase(repo).execute('zzz');
      expect(result[0]?.completed).toBe(false);
    });
  });

  describe('RemoveTaskUseCase', () => {
    it('elimina la tarea y persiste', () => {
      const repo = new InMemoryTaskRepository([makeTask({ id: 'a' }), makeTask({ id: 'b' })]);
      const result = new RemoveTaskUseCase(repo).execute('a');
      expect(result.map(t => t.id)).toEqual(['b']);
      expect(repo.getAll()).toBe(result);
    });

    it('ignora ids inexistentes', () => {
      const repo = new InMemoryTaskRepository([makeTask({ id: 'a' })]);
      expect(new RemoveTaskUseCase(repo).execute('zzz')).toHaveLength(1);
    });
  });

  describe('UpdateTaskUseCase', () => {
    it('aplica los cambios solo a la tarea indicada', () => {
      const repo = new InMemoryTaskRepository([
        makeTask({ id: 'a', title: 'A' }),
        makeTask({ id: 'b', title: 'B' }),
      ]);
      const result = new UpdateTaskUseCase(repo).execute('a', { title: 'Nuevo', categoryId: 'c-9' });
      expect(result[0]).toEqual(expect.objectContaining({ title: 'Nuevo', categoryId: 'c-9' }));
      expect(result[1]?.title).toBe('B');
    });

    it('no muta el objeto original', () => {
      const original = makeTask({ id: 'a', title: 'A' });
      const repo = new InMemoryTaskRepository([original]);
      new UpdateTaskUseCase(repo).execute('a', { title: 'Z' });
      expect(original.title).toBe('A');
    });
  });

  describe('ClearCategoryFromTasksUseCase', () => {
    it('deja sin categoría solo las tareas de esa categoría', () => {
      const repo = new InMemoryTaskRepository([
        makeTask({ id: 'a', categoryId: 'c-1' }),
        makeTask({ id: 'b', categoryId: 'c-2' }),
        makeTask({ id: 'c', categoryId: null }),
      ]);
      const result = new ClearCategoryFromTasksUseCase(repo).execute('c-1');
      expect(result.map(t => t.categoryId)).toEqual([null, 'c-2', null]);
      expect(repo.getAll()).toBe(result);
    });
  });
});
