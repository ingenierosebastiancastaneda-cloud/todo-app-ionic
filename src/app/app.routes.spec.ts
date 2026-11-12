import { Route } from '@angular/router';
import { routes } from './app.routes';

function findRoute(path: string): Route {
  const route = routes.find(r => r.path === path);
  if (!route) {
    throw new Error(`Ruta "${path}" no encontrada`);
  }
  return route;
}

describe('routes', () => {
  it('redirige la raíz a /tasks', () => {
    const root = findRoute('');
    expect(root.redirectTo).toBe('tasks');
    expect(root.pathMatch).toBe('full');
  });

  it('carga TasksPage de forma perezosa', async () => {
    const component = await (findRoute('tasks').loadComponent as () => Promise<unknown>)();
    expect((component as { name: string }).name).toBe('TasksPage');
  });

  it('carga CategoriesPage de forma perezosa', async () => {
    const component = await (findRoute('categories').loadComponent as () => Promise<unknown>)();
    expect((component as { name: string }).name).toBe('CategoriesPage');
  });
});
