import { TestBed } from '@angular/core/testing';
import { StorageService } from '../../../../core/infrastructure/storage.service';
import { makeTask } from '../../domain/usecases/task.testing';
import { LocalTaskRepository } from './local-task.repository';

describe('LocalTaskRepository', () => {
  let repo: LocalTaskRepository;
  let storage: { get: jest.Mock; set: jest.Mock };

  beforeEach(() => {
    storage = { get: jest.fn(), set: jest.fn() };
    TestBed.configureTestingModule({
      providers: [LocalTaskRepository, { provide: StorageService, useValue: storage }],
    });
    repo = TestBed.inject(LocalTaskRepository);
  });

  it('getAll lee la clave "tasks"', () => {
    const tasks = [makeTask()];
    storage.get.mockReturnValue(tasks);
    expect(repo.getAll()).toBe(tasks);
    expect(storage.get).toHaveBeenCalledWith('tasks');
  });

  it('getAll devuelve [] si no hay datos', () => {
    storage.get.mockReturnValue(null);
    expect(repo.getAll()).toEqual([]);
  });

  it('saveAll escribe en la clave "tasks"', () => {
    const tasks = [makeTask()];
    repo.saveAll(tasks);
    expect(storage.set).toHaveBeenCalledWith('tasks', tasks);
  });
});
