export interface Category {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly icon: string;
}

export type NewCategory = Omit<Category, 'id'>;
export type CategoryChanges = Partial<NewCategory>;
