import { Task } from '../models/task.model';
import { TaskRepository } from '../repositories/task.repository';

/** Utilidades SOLO para tests (excluidas del build y de la cobertura). */
export class InMemoryTaskRepository extends TaskRepository {
  saveCalls = 0;

  constructor(private items: readonly Task[] = []) {
    super();
  }

  getAll(): readonly Task[] {
    return this.items;
  }

  saveAll(tasks: readonly Task[]): void {
    this.saveCalls++;
    this.items = tasks;
  }
}

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't-1',
    title: 'Tarea',
    completed: false,
    categoryId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}
