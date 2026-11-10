import { Task } from '../models/task.model';
import { TaskRepository } from '../repositories/task.repository';

export class RemoveTaskUseCase {
  constructor(private readonly repository: TaskRepository) {}

  execute(id: string): readonly Task[] {
    const tasks = this.repository.getAll().filter(t => t.id !== id);
    this.repository.saveAll(tasks);
    return tasks;
  }
}
