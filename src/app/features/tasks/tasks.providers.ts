import { Provider, inject } from '@angular/core';
import { TaskRepository } from './domain/repositories/task.repository';
import { LocalTaskRepository } from './data/repositories/local-task.repository';
import { GetTasksUseCase } from './domain/usecases/get-tasks.usecase';
import { AddTaskUseCase } from './domain/usecases/add-task.usecase';
import { ToggleTaskUseCase } from './domain/usecases/toggle-task.usecase';
import { RemoveTaskUseCase } from './domain/usecases/remove-task.usecase';
import { UpdateTaskUseCase } from './domain/usecases/update-task.usecase';
import { ClearCategoryFromTasksUseCase } from './domain/usecases/clear-category-from-tasks.usecase';

/** Composition root del feature tasks: enlaza contratos con implementaciones. */
export const TASKS_PROVIDERS: Provider[] = [
  { provide: TaskRepository, useClass: LocalTaskRepository },
  { provide: GetTasksUseCase, useFactory: () => new GetTasksUseCase(inject(TaskRepository)) },
  { provide: AddTaskUseCase, useFactory: () => new AddTaskUseCase(inject(TaskRepository)) },
  { provide: ToggleTaskUseCase, useFactory: () => new ToggleTaskUseCase(inject(TaskRepository)) },
  { provide: RemoveTaskUseCase, useFactory: () => new RemoveTaskUseCase(inject(TaskRepository)) },
  { provide: UpdateTaskUseCase, useFactory: () => new UpdateTaskUseCase(inject(TaskRepository)) },
  {
    provide: ClearCategoryFromTasksUseCase,
    useFactory: () => new ClearCategoryFromTasksUseCase(inject(TaskRepository)),
  },
];
