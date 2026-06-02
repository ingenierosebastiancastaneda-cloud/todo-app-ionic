import { Injectable } from '@angular/core';

const STORAGE_PREFIX = 'todo_app_';

@Injectable({ providedIn: 'root' })
export class StorageService {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('StorageService: Failed to save data', error);
    }
  }

  remove(key: string): void {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  }
}
