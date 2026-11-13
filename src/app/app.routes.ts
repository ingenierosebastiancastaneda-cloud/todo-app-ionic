import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },
  {
    path: 'tasks',
    loadComponent: () => import('./features/tasks/presentation/pages/tasks.page').then(m => m.TasksPage),
  },
  {
    path: 'categories',
    loadComponent: () => import('./features/categories/presentation/pages/categories.page').then(m => m.CategoriesPage),
  },
];
