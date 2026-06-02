import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList,
  IonFab, IonFabButton, IonIcon, IonNote,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, checkmarkDone } from 'ionicons/icons';
import { TaskService } from '../../core/services/task.service';
import { TaskItemComponent } from './components/task-item/task-item.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonList,
    IonFab, IonFabButton, IonIcon, IonNote,
    TaskItemComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Mis Tareas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="stats-bar">
        <ion-note>
          <strong>{{ taskService.pendingCount() }}</strong> pendientes ·
          <strong>{{ taskService.completedCount() }}</strong> completadas
        </ion-note>
      </div>

      @if (taskService.tasks().length > 0) {
        <ion-list lines="none">
          @for (task of taskService.tasks(); track task.id) {
            <app-task-item
              [task]="task"
              (toggled)="onToggle($event)"
              (deleted)="onDelete($event)"
            />
          }
        </ion-list>
      } @else {
        <div class="empty-state">
          <ion-icon name="checkmark-done" color="medium"></ion-icon>
          <h2>No hay tareas</h2>
          <p>Pulsa el botón + para agregar una nueva tarea</p>
        </div>
      }
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button (click)="openAddTask()">
        <ion-icon name="add"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  `,
  styles: [`
    .stats-bar {
      display: flex;
      justify-content: center;
      padding: 8px 0 16px;
      ion-note { font-size: 0.85rem; }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 32px;
      text-align: center;

      ion-icon { font-size: 64px; margin-bottom: 16px; }
      h2 { color: var(--ion-color-medium); font-size: 1.2rem; margin: 0 0 8px; }
      p { color: var(--ion-color-medium); font-size: 0.9rem; margin: 0; }
    }

    ion-list { background: transparent; }
  `],
})
export class TasksPage {
  protected readonly taskService = inject(TaskService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  constructor() {
    addIcons({ add, checkmarkDone });
  }

  async openAddTask(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Nueva Tarea',
      inputs: [
        { name: 'title', type: 'text', placeholder: '¿Qué necesitas hacer?' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Agregar',
          handler: (data) => {
            const title = data.title?.trim();
            if (!title) {
              this.showToast('El nombre de la tarea es requerido', 'warning');
              return false;
            }
            this.taskService.add(title);
            this.showToast('Tarea agregada', 'success');
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  onToggle(taskId: string): void {
    this.taskService.toggle(taskId);
  }

  async onDelete(taskId: string): Promise<void> {
    this.taskService.remove(taskId);
    await this.showToast('Tarea eliminada', 'danger');
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message, duration: 2000, position: 'bottom', color,
    });
    await toast.present();
  }
}
