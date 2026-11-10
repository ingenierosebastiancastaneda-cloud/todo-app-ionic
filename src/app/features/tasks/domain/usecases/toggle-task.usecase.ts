import { Task } from '../models/task.model';
import { TaskRepository } from '../repositories/task.repository';

export class ToggleTaskUseCase {
  constructor(private readonly repository: TaskRepository) {}

  execute(id: string): readonly Task[] {
    const tasks = this.repository
      .getAll()
      .map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
    this.repository.saveAll(tasks);
    return tasks;
  }
}
