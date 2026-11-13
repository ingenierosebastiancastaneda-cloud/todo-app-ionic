import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { makeTask } from '../../../domain/usecases/task.testing';
import { TaskItemComponent } from './task-item.component';

describe('TaskItemComponent', () => {
  let fixture: ComponentFixture<TaskItemComponent>;
  let component: TaskItemComponent;

  const render = (inputs: Record<string, unknown> = {}): void => {
    fixture.componentRef.setInput('task', makeTask({ id: 'x1', title: 'Mi tarea' }));
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskItemComponent],
      providers: [provideIonicAngular()],
    });
    fixture = TestBed.createComponent(TaskItemComponent);
    component = fixture.componentInstance;
  });

  const text = (): string => (fixture.nativeElement as HTMLElement).textContent ?? '';

  it('muestra el título de la tarea', () => {
    render();
    expect(text()).toContain('Mi tarea');
  });

  it('no muestra el badge de categoría si no hay nombre', () => {
    render();
    expect(fixture.debugElement.query(By.css('ion-badge'))).toBeNull();
  });

  it('muestra el badge con el nombre de la categoría', () => {
    render({ categoryName: 'Trabajo', categoryColor: '#06b6d4' });
    const badge = fixture.debugElement.query(By.css('ion-badge'));
    expect(badge).not.toBeNull();
    expect((badge.nativeElement as HTMLElement).textContent).toContain('Trabajo');
  });

  it('marca el item y tacha el texto cuando está completada', () => {
    fixture.componentRef.setInput('task', makeTask({ completed: true }));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('ion-item.completed'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('ion-label.strike'))).not.toBeNull();
  });

  it('no aplica estilos de completada cuando está pendiente', () => {
    render();
    expect(fixture.debugElement.query(By.css('ion-item.completed'))).toBeNull();
  });

  it('emite toggled con el id al cambiar el checkbox', () => {
    render();
    const spy = jest.fn();
    component.toggled.subscribe(spy);
    // El value accessor de Ionic lee event.target.checked
    const checkbox = fixture.debugElement.query(By.css('ion-checkbox'));
    checkbox.triggerEventHandler('ionChange', { target: { checked: true } });
    expect(spy).toHaveBeenCalledWith('x1');
  });

  it('el click en el checkbox no propaga al item', () => {
    render();
    const event = { stopPropagation: jest.fn() };
    fixture.debugElement.query(By.css('ion-checkbox')).triggerEventHandler('click', event);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('emite edited al pulsar el item', () => {
    render();
    const spy = jest.fn();
    component.edited.subscribe(spy);
    fixture.debugElement.query(By.css('ion-item.task-card')).triggerEventHandler('click', {});
    expect(spy).toHaveBeenCalledWith('x1');
  });

  it('emite edited y deleted desde las acciones de deslizamiento', () => {
    render();
    const edited = jest.fn();
    const deleted = jest.fn();
    component.edited.subscribe(edited);
    component.deleted.subscribe(deleted);

    const [editOption, deleteOption] = fixture.debugElement.queryAll(By.css('ion-item-option'));
    editOption?.triggerEventHandler('click', {});
    deleteOption?.triggerEventHandler('click', {});

    expect(edited).toHaveBeenCalledWith('x1');
    expect(deleted).toHaveBeenCalledWith('x1');
  });
});
