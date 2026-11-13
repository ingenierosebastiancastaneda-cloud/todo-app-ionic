import { Task } from '../models/task.model';
import { TaskRepository } from '../repositories/task.repository';

export class ClearCategoryFromTasksUseCase {
  constructor(private readonly repository: TaskRepository) {}

  execute(categoryId: string): readonly Task[] {
    const tasks = this.repository
      .getAll()
      .map(t => (t.categoryId === categoryId ? { ...t, categoryId: null } : t));
    this.repository.saveAll(tasks);
    return tasks;
  }
}
