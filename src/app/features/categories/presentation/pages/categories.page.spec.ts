import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AlertController, ToastController, provideIonicAngular } from '@ionic/angular/standalone';
import { TaskRepository } from '../../../tasks/domain/repositories/task.repository';
import { InMemoryTaskRepository, makeTask } from '../../../tasks/domain/usecases/task.testing';
import { TASKS_PROVIDERS } from '../../../tasks/tasks.providers';
import { CATEGORIES_PROVIDERS } from '../../categories.providers';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { InMemoryCategoryRepository, makeCategory } from '../../domain/usecases/category.testing';
import { CategoryStore } from '../state/category.store';
import { CategoriesPage } from './categories.page';

interface AlertButton {
  text: string;
  role?: string;
  handler?: (data: Record<string, unknown>) => boolean | void;
}
interface AlertOptions {
  header: string;
  message?: string;
  inputs?: { name: string; value?: string }[];
  buttons: AlertButton[];
}

const flush = (): Promise<void> => new Promise(resolve => setTimeout(resolve));

describe('CategoriesPage', () => {
  let fixture: ComponentFixture<CategoriesPage>;
  let page: CategoriesPage;
  let store: CategoryStore;
  let alerts: AlertOptions[];
  let alertPresent: jest.Mock;
  let toastCreate: jest.Mock;
  let toastPresent: jest.Mock;

  const setup = (categories = [makeCategory({ id: 'a', name: 'Alpha' })]): void => {
    alerts = [];
    alertPresent = jest.fn().mockResolvedValue(undefined);
    toastPresent = jest.fn().mockResolvedValue(undefined);
    toastCreate = jest.fn().mockResolvedValue({ present: toastPresent });

    TestBed.configureTestingModule({
      imports: [CategoriesPage],
      providers: [
        provideIonicAngular(),
        provideRouter([]),
        ...TASKS_PROVIDERS,
        ...CATEGORIES_PROVIDERS,
        {
          provide: TaskRepository,
          useValue: new InMemoryTaskRepository([
            makeTask({ id: 't1', categoryId: 'a' }),
            makeTask({ id: 't2', categoryId: 'a' }),
          ]),
        },
        { provide: CategoryRepository, useValue: new InMemoryCategoryRepository(categories) },
        {
          provide: AlertController,
          useValue: {
            create: jest.fn(async (opts: AlertOptions) => {
              alerts.push(opts);
              return { present: alertPresent };
            }),
          },
        },
        { provide: ToastController, useValue: { create: toastCreate } },
      ],
    });
    fixture = TestBed.createComponent(CategoriesPage);
    page = fixture.componentInstance;
    store = TestBed.inject(CategoryStore);
    fixture.detectChanges();
  };

  const confirmButton = (alert: AlertOptions): AlertButton => alert.buttons[1] as AlertButton;

  describe('render', () => {
    it('lista las categorías con su cantidad de tareas', () => {
      setup();
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('Alpha');
      expect(text).toContain('2 tarea(s)');
      expect(fixture.debugElement.queryAll(By.css('ion-item-sliding'))).toHaveLength(1);
    });

    it('muestra el estado vacío si no hay categorías', () => {
      setup();
      store.remove('a');
      fixture.detectChanges();
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('No hay categorías');
      expect(fixture.debugElement.query(By.css('ion-list'))).toBeNull();
    });

    it('getTaskCount delega en TaskStore', () => {
      setup();
      expect(page.getTaskCount('a')).toBe(2);
      expect(page.getTaskCount('x')).toBe(0);
    });

    it('el FAB abre el diálogo de nueva categoría', async () => {
      setup();
      fixture.debugElement.query(By.css('ion-fab-button')).triggerEventHandler('click', {});
      await flush();
      expect(alerts[0]?.header).toBe('Nueva Categoría');
    });

    it('las acciones de deslizamiento abren editar y eliminar', async () => {
      setup();
      const [edit, del] = fixture.debugElement.queryAll(By.css('ion-item-option'));
      edit?.triggerEventHandler('click', {});
      del?.triggerEventHandler('click', {});
      await flush();
      expect(alerts.map(a => a.header)).toEqual(['Editar Categoría', 'Confirmar']);
    });
  });

  describe('openAddCategory', () => {
    it('presenta el diálogo con campo nombre y botón cancelar', async () => {
      setup();
      await page.openAddCategory();
      expect(alertPresent).toHaveBeenCalled();
      expect(alerts[0]?.buttons[0]).toEqual({ text: 'Cancelar', role: 'cancel' });
    });

    it.each([[''], ['   '], [undefined]])(
      'rechaza el nombre vacío (%p) con aviso y no cierra el diálogo',
      async name => {
        setup();
        await page.openAddCategory();
        const result = confirmButton(alerts[0] as AlertOptions).handler?.({ name });
        await flush();
        expect(result).toBe(false);
        expect(store.categoryCount()).toBe(1);
        expect(toastCreate).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'El nombre es requerido', color: 'warning' }),
        );
      },
    );

    it('crea la categoría con color e icono aleatorios válidos', async () => {
      setup();
      await page.openAddCategory();
      const result = confirmButton(alerts[0] as AlertOptions).handler?.({ name: '  Gym  ' });
      await flush();
      expect(result).toBe(true);
      expect(store.categoryCount()).toBe(2);
      const created = store.categories()[1];
      expect(created?.name).toBe('Gym');
      expect(created?.color).toMatch(/^#[0-9a-f]{6}$/);
      expect(created?.icon).toMatch(/-outline$/);
      expect(toastCreate).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Categoría creada', color: 'success' }),
      );
    });
  });

  describe('onEdit', () => {
    it('precarga el nombre actual', async () => {
      setup();
      await page.onEdit(store.categories()[0] as never);
      expect(alerts[0]?.inputs?.[0]?.value).toBe('Alpha');
    });

    it('rechaza el nombre vacío', async () => {
      setup();
      await page.onEdit(store.categories()[0] as never);
      const result = confirmButton(alerts[0] as AlertOptions).handler?.({ name: ' ' });
      await flush();
      expect(result).toBe(false);
      expect(store.getById('a')?.name).toBe('Alpha');
    });

    it('guarda el nuevo nombre', async () => {
      setup();
      await page.onEdit(store.categories()[0] as never);
      const result = confirmButton(alerts[0] as AlertOptions).handler?.({ name: ' Beta ' });
      await flush();
      expect(result).toBe(true);
      expect(store.getById('a')?.name).toBe('Beta');
      expect(toastCreate).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Categoría actualizada', color: 'success' }),
      );
    });
  });

  describe('onDelete', () => {
    it('advierte que las tareas quedarán sin categoría', async () => {
      setup();
      await page.onDelete(store.categories()[0] as never);
      expect(alerts[0]?.message).toBe('¿Eliminar "Alpha"? 2 tarea(s) quedarán sin categoría.');
    });

    it('no menciona tareas si la categoría está vacía', async () => {
      setup([makeCategory({ id: 'empty', name: 'Vacía' })]);
      await page.onDelete(store.categories()[0] as never);
      expect(alerts[0]?.message).toBe('¿Eliminar "Vacía"?');
    });

    it('elimina la categoría al confirmar', async () => {
      setup();
      await page.onDelete(store.categories()[0] as never);
      confirmButton(alerts[0] as AlertOptions).handler?.({});
      await flush();
      expect(store.categoryCount()).toBe(0);
      expect(toastCreate).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Categoría eliminada', color: 'danger' }),
      );
    });

    it('el botón de confirmar es destructivo', async () => {
      setup();
      await page.onDelete(store.categories()[0] as never);
      expect(confirmButton(alerts[0] as AlertOptions).role).toBe('destructive');
    });
  });
});
