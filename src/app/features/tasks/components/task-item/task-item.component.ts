import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonItem, IonLabel, IonCheckbox, IonItemSliding,
  IonItemOptions, IonItemOption, IonIcon, IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash } from 'ionicons/icons';
import { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [
    DatePipe,
    IonItem, IonLabel, IonCheckbox, IonItemSliding,
    IonItemOptions, IonItemOption, IonIcon, IonNote,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-item-sliding>
      <ion-item [class.completed]="task().completed" lines="none" class="task-card">
        <ion-checkbox
          slot="start"
          [checked]="task().completed"
          (ionChange)="onCheck()"
          aria-label="Marcar tarea como completada"
        ></ion-checkbox>
        <ion-label [class.strike]="task().completed">
          <h3>{{ task().title }}</h3>
        </ion-label>
        <ion-note slot="end" class="date-note">
          {{ task().createdAt | date:'shortDate' }}
        </ion-note>
      </ion-item>

      <ion-item-options side="end">
        <ion-item-option color="danger" (click)="onDelete()">
          <ion-icon slot="icon-only" name="trash"></ion-icon>
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
  `,
  styles: [`
    .task-card {
      --background: var(--ion-color-light);
      --border-radius: 12px;
      margin-bottom: 8px;
      --padding-start: 12px;
      --padding-end: 12px;
      --min-height: 60px;

      &.completed {
        opacity: 0.6;
      }
    }

    ion-label h3 {
      font-size: 1rem;
      font-weight: 500;
    }

    .strike h3 {
      text-decoration: line-through;
      color: var(--ion-color-medium);
    }

    .date-note {
      font-size: 0.75rem;
    }
  `],
})
export class TaskItemComponent {
  task = input.required<Task>();
  toggled = output<string>();
  deleted = output<string>();

  constructor() {
    addIcons({ trash });
  }

  onCheck(): void {
    this.toggled.emit(this.task().id);
  }

  onDelete(): void {
    this.deleted.emit(this.task().id);
  }
}
