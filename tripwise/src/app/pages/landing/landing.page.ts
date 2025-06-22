import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, LoadingController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LandingPage implements OnInit {

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController) { }

  ngOnInit() {
  }

  async abrirLoadingENavegar(destino: string, duracao: number = 300) {
  const loading = await this.loadingCtrl.create({
    message: '',
    spinner: 'crescent',
    cssClass: 'custom-loading'
  });

  await loading.present();

  setTimeout(() => {
    this.router.navigate([destino]).then(() => loading.dismiss());
  }, duracao);
}

async irParaCadastro() {
  await this.abrirLoadingENavegar('/signup', 200);
}

async irParaLogin() {
  await this.abrirLoadingENavegar('/login', 200);
}

}
