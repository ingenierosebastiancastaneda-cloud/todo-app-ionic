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
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
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
