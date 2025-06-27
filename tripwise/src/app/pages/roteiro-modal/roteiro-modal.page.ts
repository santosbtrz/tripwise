import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { ToastController, AlertController, IonicModule } from '@ionic/angular';

interface Atividade {
  id: string;
  nome: string;
  hora: string;
  data: string;
  criadaEm?: Date;
}

@Component({
  selector: 'app-roteiro-modal',
  templateUrl: './roteiro-modal.page.html',
  styleUrls: ['./roteiro-modal.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class RoteiroModalPage implements OnInit {
  @Input() data: string = '';
  @Input() clima: string = '';
  @Input() atividades: Atividade[] = [];
  @Input() dataRaw: string = '';
  @Input() viagemId: string = '';

  mostrarFormularioAtividade = false;
  nomeAtividade: string = '';
  horaAtividade: string = '';
  userId: string = '';
  modoRemocaoAtivado: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    const user = auth.currentUser;
    if (user) {
      this.userId = user.uid;
      this.carregarAtividades();
    }
  }

  fecharModal() {
    this.modalCtrl.dismiss();
  }

  criarTarefa() {
    this.mostrarFormularioAtividade = true;
  }

  async salvarAtividade() {
    if (!this.nomeAtividade || !this.horaAtividade) {
      this.exibirToast('Preencha nome e hora da atividade.');
      return;
    }

    try {
      const atividadesRef = collection(
        db,
        'usuarios',
        this.userId,
        'viagens',
        this.viagemId,
        'atividades'
      );

      const atividadeData = {
        nome: this.nomeAtividade,
        hora: this.horaAtividade,
        criadaEm: new Date(),
        data: this.dataRaw
      };

      const docRef = await addDoc(atividadesRef, atividadeData);

      this.exibirToast('Atividade salva com sucesso!');

      this.atividades.push({ id: docRef.id, ...atividadeData });
      this.atividades.sort((a, b) => a.hora.localeCompare(b.hora));

      this.nomeAtividade = '';
      this.horaAtividade = '';
      this.mostrarFormularioAtividade = false;

    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      this.exibirToast('Erro ao salvar atividade. Tente novamente.');
    }
  }

  cancelarFormulario() {
    this.mostrarFormularioAtividade = false;
    this.nomeAtividade = '';
    this.horaAtividade = '';
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

  async carregarAtividades() {
    const atividadesRef = collection(
      db,
      'usuarios',
      this.userId,
      'viagens',
      this.viagemId,
      'atividades'
    );

    const snapshot = await getDocs(atividadesRef);

    this.atividades = snapshot.docs
      .map(doc => ({ id: doc.id, ...(doc.data() as Omit<Atividade, 'id'>) }))
      .filter(atividade => atividade.data === this.dataRaw);

    this.atividades.sort((a, b) => a.hora.localeCompare(b.hora));
  }

  alternarModoRemocao() {
    this.modoRemocaoAtivado = !this.modoRemocaoAtivado;
  }

  async removerAtividade(idAtividade: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmação',
      message: 'Tem certeza que deseja remover esta atividade?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          handler: async () => {
            try {
              const atividadeRef = doc(
                db,
                'usuarios',
                this.userId,
                'viagens',
                this.viagemId,
                'atividades',
                idAtividade
              );

              await deleteDoc(atividadeRef);

              this.atividades = this.atividades.filter((a) => a.id !== idAtividade);
              this.exibirToast('Atividade removida com sucesso!');
            } catch (error) {
              console.error('Erro ao remover atividade:', error);
              this.exibirToast('Erro ao remover atividade. Tente novamente.');
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
