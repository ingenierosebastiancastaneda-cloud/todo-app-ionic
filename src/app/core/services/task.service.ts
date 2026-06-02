import { Injectable, signal, computed } from '@angular/core';
import { Task } from '../models/task.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'tasks';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly _tasks = signal<Task[]>([]);

  readonly tasks = this._tasks.asReadonly();

  readonly completedCount = computed(() =>
    this._tasks().filter(t => t.completed).length
  );

  readonly pendingCount = computed(() =>
    this._tasks().filter(t => !t.completed).length
  );

  readonly totalCount = computed(() => this._tasks().length);

  constructor(private readonly storage: StorageService) {
    this.loadFromStorage();
  }

  add(title: string): void {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      categoryId: null,
      createdAt: new Date().toISOString(),
    };
    this._tasks.update(tasks => [newTask, ...tasks]);
    this.persist();
  }

  toggle(id: string): void {
    this._tasks.update(tasks =>
      tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    this.persist();
  }

  remove(id: string): void {
    this._tasks.update(tasks => tasks.filter(t => t.id !== id));
    this.persist();
  }

  private loadFromStorage(): void {
    const stored = this.storage.get<Task[]>(STORAGE_KEY);
    if (stored) {
      this._tasks.set(stored);
    }
  }

  private persist(): void {
    this.storage.set(STORAGE_KEY, this._tasks());
  }
}
