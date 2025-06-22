import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

import { auth, db } from '../../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';

@Component({
  selector: 'app-entrar-viagem',
  templateUrl: './entrar-viagem.page.html',
  styleUrls: ['./entrar-viagem.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, CommonModule, FormsModule]
})
export class EntrarViagemPage implements OnInit {
  nomeUsuario: string = '';
  codigo: string[] = ['', '', '', '', ''];
  userId: string = '';

  constructor(
    private toastCtrl: ToastController, 
    private router: Router,
    private loadingCtrl: LoadingController) {}

  ngOnInit() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.userId = user.uid;
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

  moverFoco(event: any, index: number) {
    const input = event.target;
    const valor = input.value;

    if (valor && index < this.codigo.length - 1) {
      const proximo = input.nextElementSibling;
      if (proximo) {
        proximo.focus();
      }
    } else if (!valor && index > 0) {
      const anterior = input.previousElementSibling;
      if (anterior) {
        anterior.focus();
      }
    }
  }

async entrarNaViagem() {
  const codigoFinal = this.codigo.join('').toUpperCase().trim();
  if (codigoFinal.length < 5 || !this.userId) {
    this.exibirToast('Código inválido');
    return;
  }

  try {
    const viagensRef = collection(db, 'viagens');
    const q = query(viagensRef, where('codigoCompartilhamento', '==', codigoFinal));
    const querySnap = await getDocs(q);

    if (querySnap.empty) {
      this.exibirToast('Código inválido ou viagem não encontrada');
      return;
    }

    const viagemDoc = querySnap.docs[0];
    const viagemId = viagemDoc.id;
    const viagemData = viagemDoc.data();

    const pessoaRef = doc(db, `viagens/${viagemId}/pessoas`, this.userId);
    const pessoaSnap = await getDoc(pessoaRef);

    if (pessoaSnap.exists()) {
      this.exibirToast('Você já está nessa viagem');
      this.router.navigate(['/inicio']);
      return;
    }

    // Salva a viagem na subcoleção do usuário atual (sem campo pessoas)
    const viagemDoUsuarioRef = doc(db, `usuarios/${this.userId}/viagens`, viagemId);
    await setDoc(viagemDoUsuarioRef, {
      viagemId: viagemId,
      nomeViagem: viagemData['nomeViagem'] || '',
      destino: viagemData['destino'] || '',
      dataIda: viagemData['dataIda'] || '',
      dataVolta: viagemData['dataVolta'] || '',
      orcamento: viagemData['orcamento'] || '',
      ocultarOrcamento: viagemData['ocultarOrcamento'] || false,
      codigoCompartilhamento: viagemData['codigoCompartilhamento'] || '',
      dataEntrada: new Date()
    });

    // Salva o usuário na subcoleção de participantes da viagem global
    await setDoc(pessoaRef, {
      nome: this.nomeUsuario,
      uid: this.userId,
      papel: 'pessoa',
      dataEntrada: new Date()
    });

    this.exibirToast('Você entrou na viagem com sucesso!');
    this.router.navigate(['/inicio']);
  } catch (erro) {
    console.error('[ERRO entrarNaViagem]', erro);
    this.exibirToast('Ocorreu um erro. Tente novamente.');
  }
}


  async exibirToast(mensagem: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 3000,
      position: 'top',
      color: 'primary'
    });
    toast.present();
  }

  async cancelar() {
  const loading = await this.loadingCtrl.create({
    message: '',
    spinner: 'crescent',
    cssClass: 'custom-loading'
  });

  await loading.present();

  await this.router.navigate(['/inicio']); 
  await loading.dismiss(); 
}
}
