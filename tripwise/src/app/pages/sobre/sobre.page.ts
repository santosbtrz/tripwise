import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, LoadingController } from '@ionic/angular/standalone';

import { auth, db } from '../../firebase-config';
import {
  onAuthStateChanged,
  signOut,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  deleteUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

import { Router, ActivatedRoute } from '@angular/router';
import {
  ToastController,
  ActionSheetController,
  AlertController,
} from '@ionic/angular';


@Component({
  selector: 'app-sobre',
  templateUrl: './sobre.page.html',
  styleUrls: ['./sobre.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SobrePage implements OnInit {
  usuarioId: string | null = null;
  nomeUsuario: string = '';
  userId: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
  ) { }

  ngOnInit() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.userId = user.uid;

        const usuarioRef = doc(db, 'usuarios', this.userId);
        const usuarioSnap = await getDoc(usuarioRef);

        if (usuarioSnap.exists()) {
          const data = usuarioSnap.data();
          this.nomeUsuario = data['nome'] ? data['nome'].split(' ')[0] : 'Usuário';
        }
      }
    });
  }

  async abrirConfiguracoes() {
  const isPerfil = this.router.url.includes('/perfil');

  const actionSheet = await this.actionSheetCtrl.create({
    header: 'Configurações',
    buttons: [
      {
        text: isPerfil ? 'Voltar ao Início' : 'Ver Perfil',
        handler: () => {
          if (isPerfil) {
            this.router.navigate(['/inicio']);
          } else {
            this.router.navigate(['/perfil']);
          }
        }
      },
      {
        text: 'Sair',
        role: 'destructive',
        handler: () => {
          signOut(auth).then(() => {
            this.router.navigate(['/landing']);
          });
        }
      },
      {
        text: 'Sobre o app',
        handler: () => {
          this.router.navigate(['/sobre']);
        }
      },
      {
        text: 'Cancelar',
        role: 'cancel'
      }
    ]
  });

  await actionSheet.present();
}

}
