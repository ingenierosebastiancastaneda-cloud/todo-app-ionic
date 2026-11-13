import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('guarda y lee con el prefijo todo_app_', () => {
    service.set('k', { a: 1 });
    expect(localStorage.getItem('todo_app_k')).toBe('{"a":1}');
    expect(service.get<{ a: number }>('k')).toEqual({ a: 1 });
  });

  it('get devuelve null si la clave no existe', () => {
    expect(service.get('missing')).toBeNull();
  });

  it('get devuelve null si el JSON es inválido', () => {
    localStorage.setItem('todo_app_bad', '{not json');
    expect(service.get('bad')).toBeNull();
  });

  it('set no lanza si el almacenamiento falla', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    expect(() => service.set('k', 1)).not.toThrow();
  });

  it('remove elimina la clave con prefijo', () => {
    service.set('k', 1);
    service.remove('k');
    expect(localStorage.getItem('todo_app_k')).toBeNull();
  });
});
