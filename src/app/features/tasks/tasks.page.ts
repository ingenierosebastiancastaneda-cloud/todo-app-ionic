import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList,
  IonFab, IonFabButton, IonIcon, IonNote, IonButton, IonButtons,
  IonChip, IonLabel, IonBadge,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  add, checkmarkDone, listOutline,
  personOutline, briefcaseOutline, cartOutline, schoolOutline,
  fitnessOutline, homeOutline, airplaneOutline, musicalNotesOutline,
  bookOutline, heartOutline, starOutline, flashOutline,
} from 'ionicons/icons';
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
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
})
export class TasksPage implements OnInit {
  protected readonly taskService = inject(TaskService);
  protected readonly categoryService = inject(CategoryService);
  protected readonly featureFlags = inject(FeatureFlagService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  constructor() {
    addIcons({
      add, checkmarkDone, listOutline,
      personOutline, briefcaseOutline, cartOutline, schoolOutline,
      fitnessOutline, homeOutline, airplaneOutline, musicalNotesOutline,
      bookOutline, heartOutline, starOutline, flashOutline,
    });
  }

  ngOnInit(): void {
    this.featureFlags.init();
  }

  async openAddTask(): Promise<void> {
    const categories = this.categoryService.categories();
    const selectedCategoryId = this.taskService.selectedCategoryId();
    const categoriesEnabled = this.featureFlags.categoriesEnabled() && categories.length > 0;

    const alert = await this.alertCtrl.create({
      header: 'Nueva Tarea',
      inputs: [
        { name: 'title', type: 'text' as const, placeholder: '¿Qué necesitas hacer?' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: categoriesEnabled ? 'Siguiente' : 'Agregar',
          handler: (data) => {
            const title = data.title?.trim();
            if (!title) {
              this.showToast('El nombre de la tarea es requerido', 'warning');
              return false;
            }
            if (categoriesEnabled) {
              this.openCategoryPicker(title, selectedCategoryId);
            } else {
              this.taskService.add(title, selectedCategoryId);
              this.showToast('Tarea agregada', 'success');
            }
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private async openCategoryPicker(title: string, preselectedId: string | null): Promise<void> {
    const categories = this.categoryService.categories();

    const inputs = [
      { name: 'categoryId', type: 'radio' as const, label: 'Sin categoría', value: '', checked: !preselectedId },
      ...categories.map(cat => ({
        name: 'categoryId',
        type: 'radio' as const,
        label: cat.name,
        value: cat.id,
        checked: cat.id === preselectedId,
      })),
    ];

    const alert = await this.alertCtrl.create({
      header: 'Categoría',
      message: `Tarea: "${title}"`,
      inputs,
      buttons: [
        { text: 'Sin categoría', role: 'cancel', handler: () => {
          this.taskService.add(title, null);
          this.showToast('Tarea agregada', 'success');
        }},
        {
          text: 'Agregar',
          handler: (data) => {
            const categoryId = data || null;
            this.taskService.add(title, categoryId);
            this.showToast('Tarea agregada', 'success');
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async onEdit(taskId: string): Promise<void> {
    const task = this.taskService.tasks().find(t => t.id === taskId);
    if (!task) return;

    const categories = this.categoryService.categories();
    const categoriesEnabled = this.featureFlags.categoriesEnabled() && categories.length > 0;

    const alert = await this.alertCtrl.create({
      header: 'Editar Tarea',
      inputs: [
        { name: 'title', type: 'text' as const, value: task.title, placeholder: 'Nombre de la tarea' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: categoriesEnabled ? 'Siguiente' : 'Guardar',
          handler: (data) => {
            const title = data.title?.trim();
            if (!title) {
              this.showToast('El nombre es requerido', 'warning');
              return false;
            }
            if (categoriesEnabled) {
              this.openEditCategoryPicker(taskId, title, task.categoryId);
            } else {
              this.taskService.updateTask(taskId, { title });
              this.showToast('Tarea actualizada', 'success');
            }
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private async openEditCategoryPicker(taskId: string, title: string, currentCategoryId: string | null): Promise<void> {
    const categories = this.categoryService.categories();

    const inputs = [
      { name: 'categoryId', type: 'radio' as const, label: 'Sin categoría', value: '', checked: !currentCategoryId },
      ...categories.map(cat => ({
        name: 'categoryId',
        type: 'radio' as const,
        label: cat.name,
        value: cat.id,
        checked: cat.id === currentCategoryId,
      })),
    ];

    const alert = await this.alertCtrl.create({
      header: 'Categoría',
      message: `Tarea: "${title}"`,
      inputs,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            const categoryId = data || null;
            this.taskService.updateTask(taskId, { title, categoryId });
            this.showToast('Tarea actualizada', 'success');
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
