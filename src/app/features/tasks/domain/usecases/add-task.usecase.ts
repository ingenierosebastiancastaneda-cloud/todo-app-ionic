import { Task } from '../models/task.model';
import { TaskRepository } from '../repositories/task.repository';

export class AddTaskUseCase {
  constructor(private readonly repository: TaskRepository) {}

  execute(title: string, categoryId: string | null = null): readonly Task[] {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      categoryId,
      createdAt: new Date().toISOString(),
    };
    const tasks = [newTask, ...this.repository.getAll()];
    this.repository.saveAll(tasks);
    return tasks;
  }
}
