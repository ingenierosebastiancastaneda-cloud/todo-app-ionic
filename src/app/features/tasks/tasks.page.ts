import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList,
  IonFab, IonFabButton, IonIcon, IonNote, IonButton, IonButtons,
  IonChip, IonLabel, IonBadge,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, checkmarkDone, listOutline } from 'ionicons/icons';
import { TaskService } from '../../core/services/task.service';
import { CategoryService } from '../../core/services/category.service';
import { FeatureFlagService } from '../../core/services/feature-flag.service';
import { TaskItemComponent } from './components/task-item/task-item.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList,
    IonFab, IonFabButton, IonIcon, IonNote, IonButton, IonButtons,
    IonChip, IonLabel, IonBadge,
    TaskItemComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Mis Tareas</ion-title>
        <ion-buttons slot="end">
          @if (featureFlags.categoriesEnabled()) {
            <ion-button routerLink="/categories">
              <ion-icon slot="icon-only" name="list-outline"></ion-icon>
            </ion-button>
          }
        </ion-buttons>
      </ion-toolbar>

      @if (featureFlags.categoriesEnabled() && categoryService.categories().length > 0) {
        <ion-toolbar>
          <div class="category-filter">
            <ion-chip
              [color]="taskService.selectedCategoryId() === null ? 'primary' : 'medium'"
              (click)="filterByCategory(null)"
            >
              <ion-label>Todas</ion-label>
              <ion-badge color="primary">{{ taskService.totalCount() }}</ion-badge>
            </ion-chip>
            @for (category of categoryService.categories(); track category.id) {
              <ion-chip
                [color]="taskService.selectedCategoryId() === category.id ? 'primary' : 'medium'"
                (click)="filterByCategory(category.id)"
              >
                <ion-icon [name]="category.icon"></ion-icon>
                <ion-label>{{ category.name }}</ion-label>
              </ion-chip>
            }
          </div>
        </ion-toolbar>
      }
    </ion-header>

    <ion-content class="ion-padding">
      <div class="stats-bar">
        <ion-note>
          <strong>{{ taskService.pendingCount() }}</strong> pendientes ·
          <strong>{{ taskService.completedCount() }}</strong> completadas
        </ion-note>
      </div>

      @if (taskService.filteredTasks().length > 0) {
        <ion-list lines="none">
          @for (task of taskService.filteredTasks(); track task.id) {
            <app-task-item
              [task]="task"
              [categoryName]="task.categoryId ? categoryService.getById(task.categoryId)?.name ?? '' : ''"
              [categoryColor]="task.categoryId ? categoryService.getById(task.categoryId)?.color ?? '' : ''"
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
    .category-filter {
      display: flex;
      overflow-x: auto;
      padding: 4px 8px;
      gap: 4px;
      &::-webkit-scrollbar { display: none; }
      ion-chip { flex-shrink: 0; }
    }

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
      animation: fadeIn 400ms ease-out;

      ion-icon { font-size: 64px; margin-bottom: 16px; }
      h2 { color: var(--ion-color-medium); font-size: 1.2rem; margin: 0 0 8px; }
      p { color: var(--ion-color-medium); font-size: 0.9rem; margin: 0; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    ion-list { background: transparent; }
  `],
})
export class TasksPage implements OnInit {
  protected readonly taskService = inject(TaskService);
  protected readonly categoryService = inject(CategoryService);
  protected readonly featureFlags = inject(FeatureFlagService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  constructor() {
    addIcons({ add, checkmarkDone, listOutline });
  }

  ngOnInit(): void {
    this.featureFlags.init();
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
              this.showToast('El nombre es requerido', 'warning');
              return false;
            }
            const selectedCategory = this.taskService.selectedCategoryId();
            this.taskService.add(title, selectedCategory);
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

  filterByCategory(categoryId: string | null): void {
    this.taskService.setFilter(categoryId);
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message, duration: 2000, position: 'bottom', color,
    });
    await toast.present();
  }
}
