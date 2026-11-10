import { Category } from '../models/category.model';

/** Contrato de persistencia de categorías. La capa data lo implementa. */
export abstract class CategoryRepository {
  abstract getAll(): readonly Category[];
  abstract saveAll(categories: readonly Category[]): void;
}
