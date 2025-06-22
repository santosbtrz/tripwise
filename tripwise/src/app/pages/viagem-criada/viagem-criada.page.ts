import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

import { auth, db } from '../../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

@Component({
  selector: 'app-viagem-criada',
  templateUrl: './viagem-criada.page.html',
  styleUrls: ['./viagem-criada.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule
  ]
})
export class ViagemCriadaPage implements OnInit {
  viagem: any;
  nomeUsuario: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    if (history.state.viagem) {
      this.viagem = history.state.viagem;
    } else {
      this.router.navigate(['/inicio']);
    }

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          this.nomeUsuario = data['nome'] ? data['nome'].split(' ')[0] : 'Usuário';
        } else {
          this.nomeUsuario = 'Usuário';
        }
      } else {
        this.nomeUsuario = 'Usuário';
      }
    });
  }
}
