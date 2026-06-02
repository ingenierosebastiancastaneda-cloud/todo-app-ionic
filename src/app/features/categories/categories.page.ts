import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonFab, IonFabButton, IonIcon, IonButtons,
  IonItemSliding, IonItemOptions, IonItemOption, IonBadge, IonBackButton,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, trash, create, colorPalette } from 'ionicons/icons';
import { CategoryService } from '../../core/services/category.service';
import { TaskService } from '../../core/services/task.service';
import { Category } from '../../core/models/category.model';

const AVAILABLE_ICONS = [
  'person-outline', 'briefcase-outline', 'cart-outline', 'school-outline',
  'fitness-outline', 'home-outline', 'airplane-outline', 'musical-notes-outline',
  'book-outline', 'heart-outline', 'star-outline', 'flash-outline',
];

const AVAILABLE_COLORS = [
  '#4f46e5', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
];

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
    IonLabel, IonFab, IonFabButton, IonIcon, IonButtons,
    IonItemSliding, IonItemOptions, IonItemOption, IonBadge, IonBackButton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tasks" text="Tareas"></ion-back-button>
        </ion-buttons>
        <ion-title>Categorías</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (categoryService.categories().length > 0) {
        <ion-list lines="none">
          @for (category of categoryService.categories(); track category.id) {
            <ion-item-sliding>
              <ion-item class="category-card">
                <ion-icon
                  [name]="category.icon"
                  slot="start"
                  [style.color]="category.color"
                  class="category-icon"
                ></ion-icon>
                <ion-label>
                  <h2>{{ category.name }}</h2>
                  <p>{{ getTaskCount(category.id) }} tarea(s)</p>
                </ion-label>
                <ion-badge slot="end" [style.--background]="category.color" class="count-badge">
                  {{ getTaskCount(category.id) }}
                </ion-badge>
              </ion-item>

              <ion-item-options side="start">
                <ion-item-option color="primary" (click)="onEdit(category)">
                  <ion-icon slot="icon-only" name="create"></ion-icon>
                </ion-item-option>
              </ion-item-options>

              <ion-item-options side="end">
                <ion-item-option color="danger" (click)="onDelete(category)">
                  <ion-icon slot="icon-only" name="trash"></ion-icon>
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          }
        </ion-list>
      } @else {
        <div class="empty-state">
          <ion-icon name="color-palette" color="medium"></ion-icon>
          <h2>No hay categorías</h2>
          <p>Crea categorías para organizar tus tareas</p>
        </div>
      }
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button (click)="openAddCategory()">
        <ion-icon name="add"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  `,
  styles: [`
    .category-card {
      --background: var(--ion-color-light);
      --border-radius: 12px;
      margin-bottom: 8px;
      --min-height: 64px;

      .category-icon { font-size: 28px; }

      ion-label {
        h2 { font-size: 1rem; font-weight: 600; }
        p { font-size: 0.8rem; color: var(--ion-color-medium); }
      }
    }

    .count-badge {
      color: #fff;
      border-radius: 12px;
      padding: 4px 10px;
      font-size: 0.8rem;
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
export class CategoriesPage {
  protected readonly categoryService = inject(CategoryService);
  protected readonly taskService = inject(TaskService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  constructor() {
    addIcons({ add, trash, create, colorPalette });
  }

  async openAddCategory(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Nueva Categoría',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nombre de la categoría' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: (data) => {
            const name = data.name?.trim();
            if (!name) {
              this.showToast('El nombre es requerido', 'warning');
              return false;
            }
            const randomColor = AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)];
            const randomIcon = AVAILABLE_ICONS[Math.floor(Math.random() * AVAILABLE_ICONS.length)];
            this.categoryService.add({ name, color: randomColor, icon: randomIcon });
            this.showToast('Categoría creada', 'success');
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async onEdit(category: Category): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Editar Categoría',
      inputs: [
        { name: 'name', type: 'text', value: category.name, placeholder: 'Nombre' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            const name = data.name?.trim();
            if (!name) {
              this.showToast('El nombre es requerido', 'warning');
              return false;
            }
            this.categoryService.update(category.id, { name });
            this.showToast('Categoría actualizada', 'success');
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async onDelete(category: Category): Promise<void> {
    const taskCount = this.taskService.getTaskCountByCategory(category.id);
    let message = `¿Eliminar "${category.name}"?`;
    if (taskCount > 0) {
      message += ` ${taskCount} tarea(s) quedarán sin categoría.`;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.taskService.clearCategoryFromTasks(category.id);
            this.categoryService.remove(category.id);
            this.showToast('Categoría eliminada', 'danger');
          },
        },
      ],
    });
    await alert.present();
  }

  getTaskCount(categoryId: string): number {
    return this.taskService.getTaskCountByCategory(categoryId);
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message, duration: 2000, position: 'bottom', color,
    });
    await toast.present();
  }
}
