import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Todo App</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h2>Bienvenido a Todo App</h2>
      <p>Aplicación de lista de tareas - Prueba Técnica</p>
    </ion-content>
  `,
})
export class HomePage {}
