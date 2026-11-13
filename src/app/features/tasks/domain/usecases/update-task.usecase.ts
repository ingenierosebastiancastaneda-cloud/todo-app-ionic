import { Task, TaskChanges } from '../models/task.model';
import { TaskRepository } from '../repositories/task.repository';

export class UpdateTaskUseCase {
  constructor(private readonly repository: TaskRepository) {}

  execute(id: string, changes: TaskChanges): readonly Task[] {
    const tasks = this.repository
      .getAll()
      .map(t => (t.id === id ? { ...t, ...changes } : t));
    this.repository.saveAll(tasks);
    return tasks;
  }
}
