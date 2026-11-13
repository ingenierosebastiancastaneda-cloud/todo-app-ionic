import { Injectable, inject } from '@angular/core';
import { StorageService } from '../../../../core/infrastructure/storage.service';
import { Task } from '../../domain/models/task.model';
import { TaskRepository } from '../../domain/repositories/task.repository';

const STORAGE_KEY = 'tasks';

@Injectable()
export class LocalTaskRepository extends TaskRepository {
  private readonly storage = inject(StorageService);

  getAll(): readonly Task[] {
    return this.storage.get<Task[]>(STORAGE_KEY) ?? [];
  }

  saveAll(tasks: readonly Task[]): void {
    this.storage.set(STORAGE_KEY, tasks);
  }
}
