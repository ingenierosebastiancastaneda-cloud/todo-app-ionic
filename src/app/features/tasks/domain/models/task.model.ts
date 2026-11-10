export interface Task {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly categoryId: string | null;
  readonly createdAt: string;
}

export type TaskChanges = Partial<Pick<Task, 'title' | 'completed' | 'categoryId'>>;
