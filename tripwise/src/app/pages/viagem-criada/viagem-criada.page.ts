import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-viagem-criada',
  templateUrl: './viagem-criada.page.html',
  styleUrls: ['./viagem-criada.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ViagemCriadaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
