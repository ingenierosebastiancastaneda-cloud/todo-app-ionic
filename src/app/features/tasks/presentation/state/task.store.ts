import { Injectable, inject, signal, computed } from '@angular/core';
import { Task, TaskChanges } from '../../domain/models/task.model';
import { GetTasksUseCase } from '../../domain/usecases/get-tasks.usecase';
import { AddTaskUseCase } from '../../domain/usecases/add-task.usecase';
import { ToggleTaskUseCase } from '../../domain/usecases/toggle-task.usecase';
import { RemoveTaskUseCase } from '../../domain/usecases/remove-task.usecase';
import { UpdateTaskUseCase } from '../../domain/usecases/update-task.usecase';

/** Estado reactivo (signals) de tareas. Delega toda la lógica en casos de uso. */
@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly getTasks = inject(GetTasksUseCase);
  private readonly addTask = inject(AddTaskUseCase);
  private readonly toggleTask = inject(ToggleTaskUseCase);
  private readonly removeTask = inject(RemoveTaskUseCase);
  private readonly updateTaskUseCase = inject(UpdateTaskUseCase);

  private readonly _tasks = signal<readonly Task[]>(this.getTasks.execute());
  private readonly _selectedCategoryId = signal<string | null>(null);

  readonly tasks = this._tasks.asReadonly();
  readonly selectedCategoryId = this._selectedCategoryId.asReadonly();

  readonly filteredTasks = computed(() => {
    const categoryId = this._selectedCategoryId();
    const tasks = this._tasks();
    return categoryId ? tasks.filter(t => t.categoryId === categoryId) : tasks;
  });

  readonly completedCount = computed(() => this.filteredTasks().filter(t => t.completed).length);
  readonly pendingCount = computed(() => this.filteredTasks().filter(t => !t.completed).length);
  readonly totalCount = computed(() => this._tasks().length);

  setFilter(categoryId: string | null): void {
    this._selectedCategoryId.set(categoryId);
  }

  add(title: string, categoryId: string | null = null): void {
    this._tasks.set(this.addTask.execute(title, categoryId));
  }

  toggle(id: string): void {
    this._tasks.set(this.toggleTask.execute(id));
  }

  remove(id: string): void {
    this._tasks.set(this.removeTask.execute(id));
  }

  updateTask(id: string, changes: TaskChanges): void {
    this._tasks.set(this.updateTaskUseCase.execute(id, changes));
  }

  /** Vuelve a leer las tareas del repositorio (p. ej. tras cambios hechos por otro feature). */
  reload(): void {
    this._tasks.set(this.getTasks.execute());
  }

  getTaskCountByCategory(categoryId: string): number {
    return this._tasks().filter(t => t.categoryId === categoryId).length;
  }
}
