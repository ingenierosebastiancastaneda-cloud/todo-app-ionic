import { Injectable, inject, signal, computed } from '@angular/core';
import { Task } from '../models/task.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'tasks';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly storage = inject(StorageService);
  private readonly _tasks = signal<Task[]>([]);
  private readonly _selectedCategoryId = signal<string | null>(null);

  readonly tasks = this._tasks.asReadonly();
  readonly selectedCategoryId = this._selectedCategoryId.asReadonly();

  readonly filteredTasks = computed(() => {
    const categoryId = this._selectedCategoryId();
    const tasks = this._tasks();
    if (!categoryId) {
      return tasks;
    }
    return tasks.filter(t => t.categoryId === categoryId);
  });

  readonly completedCount = computed(() =>
    this.filteredTasks().filter(t => t.completed).length
  );

  readonly pendingCount = computed(() =>
    this.filteredTasks().filter(t => !t.completed).length
  );

  readonly totalCount = computed(() => this._tasks().length);

  constructor() {
    this.loadFromStorage();
  }

  setFilter(categoryId: string | null): void {
    this._selectedCategoryId.set(categoryId);
  }

  add(title: string, categoryId: string | null = null): void {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      categoryId,
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

  updateTask(id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>): void {
    this._tasks.update(tasks =>
      tasks.map(t => (t.id === id ? { ...t, ...changes } : t))
    );
    this.persist();
  }

  getTaskCountByCategory(categoryId: string): number {
    return this._tasks().filter(t => t.categoryId === categoryId).length;
  }

  clearCategoryFromTasks(categoryId: string): void {
    this._tasks.update(tasks =>
      tasks.map(t => (t.categoryId === categoryId ? { ...t, categoryId: null } : t))
    );
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
