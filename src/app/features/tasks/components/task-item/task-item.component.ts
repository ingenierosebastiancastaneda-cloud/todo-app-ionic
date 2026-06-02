import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import {
  IonItem, IonLabel, IonCheckbox, IonItemSliding,
  IonItemOptions, IonItemOption, IonIcon, IonNote, IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, create } from 'ionicons/icons';
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
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
})
export class TaskItemComponent {
  task = input.required<Task>();
  categoryName = input<string>('');
  categoryColor = input<string>('');

  toggled = output<string>();
  deleted = output<string>();
  edited = output<string>();

  constructor() {
    addIcons({ trash, create });
  }

  onCheck(): void {
    this.toggled.emit(this.task().id);
  }

  onDelete(): void {
    this.deleted.emit(this.task().id);
  }

  onEdit(): void {
    this.edited.emit(this.task().id);
  }
}
