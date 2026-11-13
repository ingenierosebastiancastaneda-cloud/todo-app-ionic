import { Task } from '../models/task.model';

/** Contrato de persistencia de tareas. La capa data lo implementa. */
export abstract class TaskRepository {
  abstract getAll(): readonly Task[];
  abstract saveAll(tasks: readonly Task[]): void;
}
