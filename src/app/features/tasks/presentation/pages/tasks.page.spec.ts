import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AlertController, ToastController, provideIonicAngular } from '@ionic/angular/standalone';
import { CATEGORIES_PROVIDERS } from '../../../categories/categories.providers';
import { CategoryRepository } from '../../../categories/domain/repositories/category.repository';
import {
  InMemoryCategoryRepository,
  makeCategory,
} from '../../../categories/domain/usecases/category.testing';
import { CategoryStore } from '../../../categories/presentation/state/category.store';
import { FeatureFlagStore } from '../../../feature-flags/presentation/state/feature-flag.store';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { InMemoryTaskRepository, makeTask } from '../../domain/usecases/task.testing';
import { TASKS_PROVIDERS } from '../../tasks.providers';
import { TaskStore } from '../state/task.store';
import { TasksPage } from './tasks.page';

interface AlertInput {
  name: string;
  label?: string;
  value?: string;
  checked?: boolean;
}
interface AlertButton {
  text: string;
  role?: string;
  handler?: (data?: unknown) => boolean | void;
}
interface AlertOptions {
  header: string;
  message?: string;
  inputs: AlertInput[];
  buttons: AlertButton[];
}

const flush = (): Promise<void> => new Promise(resolve => setTimeout(resolve));

describe('TasksPage', () => {
  let fixture: ComponentFixture<TasksPage>;
  let page: TasksPage;
  let taskStore: TaskStore;
  let categoryStore: CategoryStore;
  let alerts: AlertOptions[];
  let toastCreate: jest.Mock;
  let flagInit: jest.Mock;
  let categoriesEnabled: ReturnType<typeof signal<boolean>>;

  const setup = (options: { tasks?: ReturnType<typeof makeTask>[]; flag?: boolean } = {}): void => {
    alerts = [];
    toastCreate = jest.fn().mockResolvedValue({ present: jest.fn().mockResolvedValue(undefined) });
    flagInit = jest.fn().mockResolvedValue(undefined);
    categoriesEnabled = signal(options.flag ?? true);

    TestBed.configureTestingModule({
      imports: [TasksPage],
      providers: [
        provideIonicAngular(),
        provideRouter([]),
        ...TASKS_PROVIDERS,
        ...CATEGORIES_PROVIDERS,
        {
          provide: TaskRepository,
          useValue: new InMemoryTaskRepository(
            options.tasks ?? [
              makeTask({ id: 't1', title: 'Uno', categoryId: 'c1' }),
              makeTask({ id: 't2', title: 'Dos', categoryId: null, completed: true }),
            ],
          ),
        },
        {
          provide: CategoryRepository,
          useValue: new InMemoryCategoryRepository([
            makeCategory({ id: 'c1', name: 'Alpha', color: '#111111' }),
            makeCategory({ id: 'c2', name: 'Beta' }),
          ]),
        },
        { provide: FeatureFlagStore, useValue: { categoriesEnabled, init: flagInit } },
        {
          provide: AlertController,
          useValue: {
            create: jest.fn(async (opts: AlertOptions) => {
              alerts.push(opts);
              return { present: jest.fn().mockResolvedValue(undefined) };
            }),
          },
        },
        { provide: ToastController, useValue: { create: toastCreate } },
      ],
    });
    fixture = TestBed.createComponent(TasksPage);
    page = fixture.componentInstance;
    taskStore = TestBed.inject(TaskStore);
    categoryStore = TestBed.inject(CategoryStore);
    fixture.detectChanges();
  };

  const text = (): string => (fixture.nativeElement as HTMLElement).textContent ?? '';
  const lastAlert = (): AlertOptions => alerts[alerts.length - 1] as AlertOptions;
  const button = (alert: AlertOptions, index: number): AlertButton => alert.buttons[index] as AlertButton;
  const toastMessages = (): string[] =>
    toastCreate.mock.calls.map(([opts]) => (opts as { message: string }).message);

  describe('ciclo de vida y render', () => {
    it('inicializa los feature flags en ngOnInit', () => {
      setup();
      expect(flagInit).toHaveBeenCalledTimes(1);
    });

    it('muestra tareas, estadísticas y chips de categorías', () => {
      setup();
      expect(text()).toContain('Uno');
      expect(text()).toContain('Dos');
      expect(text()).toContain('Alpha');
      expect(fixture.debugElement.queryAll(By.css('app-task-item'))).toHaveLength(2);
      expect(fixture.debugElement.queryAll(By.css('ion-chip'))).toHaveLength(3);
      expect(fixture.debugElement.query(By.css('ion-button'))).not.toBeNull();
    });

    it('pasa nombre y color de categoría a cada item', () => {
      setup();
      const items = fixture.debugElement.queryAll(By.css('app-task-item'));
      expect((items[0]?.nativeElement as HTMLElement).textContent).toContain('Alpha');
      expect((items[1]?.nativeElement as HTMLElement).textContent).not.toContain('Alpha');
    });

    it('oculta chips y botón de categorías cuando el flag está desactivado', () => {
      setup({ flag: false });
      expect(fixture.debugElement.queryAll(By.css('ion-chip'))).toHaveLength(0);
      expect(fixture.debugElement.query(By.css('ion-button'))).toBeNull();
      const items = fixture.debugElement.queryAll(By.css('app-task-item'));
      expect((items[0]?.nativeElement as HTMLElement).textContent).not.toContain('Alpha');
    });

    it('muestra el estado vacío sin tareas', () => {
      setup({ tasks: [] });
      expect(text()).toContain('No hay tareas');
      expect(fixture.debugElement.query(By.css('ion-list'))).toBeNull();
    });

    it('pulsar un chip filtra por categoría y "Todas" quita el filtro', () => {
      setup();
      const chips = fixture.debugElement.queryAll(By.css('ion-chip'));
      chips[1]?.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(taskStore.selectedCategoryId()).toBe('c1');
      expect(fixture.debugElement.queryAll(By.css('app-task-item'))).toHaveLength(1);

      chips[0]?.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(taskStore.selectedCategoryId()).toBeNull();
    });

    it('el FAB abre el diálogo de nueva tarea', async () => {
      setup();
      fixture.debugElement.query(By.css('ion-fab-button')).triggerEventHandler('click', {});
      await flush();
      expect(lastAlert().header).toBe('Nueva Tarea');
    });

    it('reacciona a los eventos del item (toggle, editar, eliminar)', async () => {
      setup();
      const item = fixture.debugElement.query(By.css('app-task-item'));
      item.triggerEventHandler('toggled', 't1');
      expect(taskStore.tasks().find(t => t.id === 't1')?.completed).toBe(true);

      item.triggerEventHandler('edited', 't1');
      await flush();
      expect(lastAlert().header).toBe('Editar Tarea');

      item.triggerEventHandler('deleted', 't1');
      await flush();
      expect(taskStore.tasks().some(t => t.id === 't1')).toBe(false);
    });
  });

  describe('onToggle / filterByCategory', () => {
    it('onToggle delega en el store', () => {
      setup();
      page.onToggle('t2');
      expect(taskStore.tasks().find(t => t.id === 't2')?.completed).toBe(false);
    });

    it('filterByCategory fija el filtro', () => {
      setup();
      page.filterByCategory('c2');
      expect(taskStore.selectedCategoryId()).toBe('c2');
    });
  });

  describe('onDelete', () => {
    it('elimina la tarea y avisa', async () => {
      setup();
      await page.onDelete('t1');
      expect(taskStore.tasks().map(t => t.id)).toEqual(['t2']);
      expect(toastCreate).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Tarea eliminada', color: 'danger' }),
      );
    });
  });

  describe('openAddTask con categorías habilitadas', () => {
    it('muestra el botón "Siguiente"', async () => {
      setup();
      await page.openAddTask();
      expect(button(lastAlert(), 1).text).toBe('Siguiente');
      expect(button(lastAlert(), 0)).toEqual({ text: 'Cancelar', role: 'cancel' });
    });

    it.each([[''], ['   '], [undefined]])('rechaza el título vacío (%p)', async title => {
      setup();
      await page.openAddTask();
      const result = button(lastAlert(), 1).handler?.({ title });
      await flush();
      expect(result).toBe(false);
      expect(alerts).toHaveLength(1);
      expect(taskStore.totalCount()).toBe(2);
      expect(toastMessages()).toContain('El nombre de la tarea es requerido');
    });

    it('abre el selector de categoría con la categoría del filtro preseleccionada', async () => {
      setup();
      taskStore.setFilter('c2');
      await page.openAddTask();
      const result = button(lastAlert(), 1).handler?.({ title: '  Nueva  ' });
      await flush();

      expect(result).toBe(true);
      const picker = lastAlert();
      expect(picker.header).toBe('Categoría');
      expect(picker.message).toBe('Tarea: "Nueva"');
      expect(picker.inputs.map(i => [i.label, i.checked])).toEqual([
        ['Sin categoría', false],
        ['Alpha', false],
        ['Beta', true],
      ]);
    });

    it('preselecciona "Sin categoría" cuando no hay filtro', async () => {
      setup();
      await page.openAddTask();
      button(lastAlert(), 1).handler?.({ title: 'X' });
      await flush();
      expect(lastAlert().inputs[0]?.checked).toBe(true);
    });

    it('"Agregar" crea la tarea con la categoría elegida', async () => {
      setup();
      await page.openAddTask();
      button(lastAlert(), 1).handler?.({ title: 'Nueva' });
      await flush();

      expect(button(lastAlert(), 1).handler?.('c1')).toBe(true);
      await flush();
      expect(taskStore.tasks()[0]).toEqual(
        expect.objectContaining({ title: 'Nueva', categoryId: 'c1' }),
      );
      expect(toastMessages()).toContain('Tarea agregada');
    });

    it('"Agregar" con valor vacío crea la tarea sin categoría', async () => {
      setup();
      await page.openAddTask();
      button(lastAlert(), 1).handler?.({ title: 'Nueva' });
      await flush();

      button(lastAlert(), 1).handler?.('');
      expect(taskStore.tasks()[0]?.categoryId).toBeNull();
    });

    it('"Sin categoría" crea la tarea sin categoría', async () => {
      setup();
      await page.openAddTask();
      button(lastAlert(), 1).handler?.({ title: 'Nueva' });
      await flush();

      expect(button(lastAlert(), 0).role).toBe('cancel');
      button(lastAlert(), 0).handler?.();
      await flush();
      expect(taskStore.tasks()[0]).toEqual(
        expect.objectContaining({ title: 'Nueva', categoryId: null }),
      );
      expect(toastMessages()).toContain('Tarea agregada');
    });
  });

  describe('openAddTask sin categorías', () => {
    it('con el flag desactivado agrega directamente usando el filtro activo', async () => {
      setup({ flag: false });
      taskStore.setFilter('c2');
      await page.openAddTask();
      expect(button(lastAlert(), 1).text).toBe('Agregar');

      const result = button(lastAlert(), 1).handler?.({ title: 'Directa' });
      await flush();
      expect(result).toBe(true);
      expect(alerts).toHaveLength(1);
      expect(taskStore.tasks()[0]).toEqual(
        expect.objectContaining({ title: 'Directa', categoryId: 'c2' }),
      );
      expect(toastMessages()).toContain('Tarea agregada');
    });

    it('sin categorías creadas también agrega directamente', async () => {
      setup();
      categoryStore.remove('c1');
      categoryStore.remove('c2');
      await page.openAddTask();
      expect(button(lastAlert(), 1).text).toBe('Agregar');
    });
  });

  describe('onEdit', () => {
    it('no hace nada si la tarea no existe', async () => {
      setup();
      await page.onEdit('nope');
      expect(alerts).toHaveLength(0);
    });

    it('precarga el título y ofrece "Siguiente" con categorías', async () => {
      setup();
      await page.onEdit('t1');
      expect(lastAlert().header).toBe('Editar Tarea');
      expect((lastAlert().inputs[0] as AlertInput).value).toBe('Uno');
      expect(button(lastAlert(), 1).text).toBe('Siguiente');
    });

    it.each([[''], [undefined]])('rechaza el título vacío (%p)', async title => {
      setup();
      await page.onEdit('t1');
      const result = button(lastAlert(), 1).handler?.({ title });
      await flush();
      expect(result).toBe(false);
      expect(toastMessages()).toContain('El nombre es requerido');
    });

    it('guarda título y categoría desde el selector', async () => {
      setup();
      await page.onEdit('t1');
      expect(button(lastAlert(), 1).handler?.({ title: ' Editada ' })).toBe(true);
      await flush();

      const picker = lastAlert();
      expect(picker.message).toBe('Tarea: "Editada"');
      expect(picker.inputs.map(i => i.checked)).toEqual([false, true, false]);
      expect(button(picker, 0)).toEqual({ text: 'Cancelar', role: 'cancel' });

      expect(button(picker, 1).handler?.('c2')).toBe(true);
      expect(taskStore.tasks().find(t => t.id === 't1')).toEqual(
        expect.objectContaining({ title: 'Editada', categoryId: 'c2' }),
      );
      expect(toastMessages()).toContain('Tarea actualizada');
    });

    it('permite quitar la categoría desde el selector', async () => {
      setup();
      await page.onEdit('t1');
      button(lastAlert(), 1).handler?.({ title: 'Uno' });
      await flush();
      button(lastAlert(), 1).handler?.('');
      expect(taskStore.tasks().find(t => t.id === 't1')?.categoryId).toBeNull();
    });

    it('preselecciona "Sin categoría" si la tarea no tiene categoría', async () => {
      setup();
      await page.onEdit('t2');
      button(lastAlert(), 1).handler?.({ title: 'Dos' });
      await flush();
      expect(lastAlert().inputs[0]?.checked).toBe(true);
    });

    it('con el flag desactivado actualiza solo el título', async () => {
      setup({ flag: false });
      await page.onEdit('t1');
      expect(button(lastAlert(), 1).text).toBe('Guardar');

      expect(button(lastAlert(), 1).handler?.({ title: 'Solo título' })).toBe(true);
      await flush();
      expect(alerts).toHaveLength(1);
      expect(taskStore.tasks().find(t => t.id === 't1')).toEqual(
        expect.objectContaining({ title: 'Solo título', categoryId: 'c1' }),
      );
      expect(toastMessages()).toContain('Tarea actualizada');
    });
  });
});
