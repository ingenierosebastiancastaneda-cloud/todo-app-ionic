import { Task } from '../models/task.model';
import { TaskRepository } from '../repositories/task.repository';

export class GetTasksUseCase {
  constructor(private readonly repository: TaskRepository) {}

  execute(): readonly Task[] {
    return this.repository.getAll();
  }
}
