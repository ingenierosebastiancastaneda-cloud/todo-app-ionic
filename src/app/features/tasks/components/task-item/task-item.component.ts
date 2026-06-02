import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import {
  IonItem, IonLabel, IonCheckbox, IonItemSliding,
  IonItemOptions, IonItemOption, IonIcon, IonNote, IonBadge,
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
    IonItemOptions, IonItemOption, IonIcon, IonNote, IonBadge,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('taskAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' })),
      ]),
    ]),
  ],
  host: { '[@taskAnimation]': '' },
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
          @if (categoryName()) {
            <ion-badge [style.--background]="categoryColor()" class="category-badge">
              {{ categoryName() }}
            </ion-badge>
          }
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
    :host {
      display: block;
    }
    .task-card {
      --background: var(--ion-color-light);
      --border-radius: 12px;
      margin-bottom: 8px;
      --padding-start: 12px;
      --padding-end: 12px;
      --min-height: 60px;
      transition: opacity 200ms ease;
      &.completed { opacity: 0.6; }
    }
    ion-label h3 { font-size: 1rem; font-weight: 500; }
    .strike h3 { text-decoration: line-through; color: var(--ion-color-medium); }
    .category-badge {
      font-size: 0.7rem; padding: 2px 8px; border-radius: 8px;
      margin-top: 4px; color: #fff;
    }
    .date-note { font-size: 0.75rem; }
  `],
})
export class TaskItemComponent {
  task = input.required<Task>();
  categoryName = input<string>('');
  categoryColor = input<string>('');

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
