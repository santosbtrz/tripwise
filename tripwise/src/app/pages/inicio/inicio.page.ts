import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';


import { auth, db } from '../../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Firestore ,doc, getDoc, collection, getDocs, updateDoc, deleteDoc, onSnapshot  } from 'firebase/firestore';

import { eachDayOfInterval, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Router } from '@angular/router';
import {
  ToastController,
  ActionSheetController,
  AlertController,
  ModalController,
  IonicModule,
  LoadingController
} from '@ionic/angular';

import { RoteiroModalPage } from '../roteiro-modal/roteiro-modal.page';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RoteiroModalPage
  ]
})
export class InicioPage implements OnInit {
  nomeUsuario: string = '';
  viagens: any[] = [];
  tarefas: any[] = [];
  usuarioId: string | null = null;
  pessoas: any[] = [];

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController // ✅ Adicionado
  ) {}

ngOnInit() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      this.usuarioId = user.uid;

      // Carrega dados do usuário (nome)
      const usuarioRef = doc(db, 'usuarios', user.uid);
      const usuarioSnap = await getDoc(usuarioRef);

      if (usuarioSnap.exists()) {
        const data = usuarioSnap.data();
        this.nomeUsuario = data['nome'] ? data['nome'].split(' ')[0] : 'Usuário';
        this.pessoas = data['pessoas'] || [];
      }

      // Carrega viagens do usuário com listener em tempo real
      const viagensRef = collection(db, 'usuarios', user.uid, 'viagens');

      onSnapshot(viagensRef, (viagensSnapshot) => {
        this.viagens = viagensSnapshot.docs.map(doc => {
          const viagemData = doc.data();
          return {
            id: doc.id,
            ...viagemData,
            mostrarDetalhes: false,
            pessoas: [] // será preenchido abaixo
          };
        });

        // Para cada viagem, carrega e combina as pessoas do documento + subcoleção
        this.viagens.forEach(async (viagem, index) => {
          try {
            // Documento global da viagem
            const viagemDocRef = doc(db, 'viagens', viagem.id);
            const viagemDocSnap = await getDoc(viagemDocRef);

            let pessoasArray: any[] = [];

            if (viagemDocSnap.exists()) {
              const viagemData = viagemDocSnap.data();

              // Pessoas do array no documento da viagem (inclui criador)
              const pessoasDoc = viagemData?.['pessoas'] || [];

              // Pessoas na subcoleção 'pessoas'
              const pessoasRef = collection(db, 'viagens', viagem.id, 'pessoas');
              const pessoasSnap = await getDocs(pessoasRef);

              const pessoasSubcolecao = pessoasSnap.docs.map(doc => {
                const p = doc.data();
                return {
                  id: p['uid'] || doc.id,
                  nome: p['nome'] || 'Convidado',
                  foto: p['foto'] || 'assets/profile-icon.png'
                };
              });

              // Combina os arrays removendo duplicatas pelo id
              const mapIds = new Map<string, any>();

              pessoasDoc.forEach((p: any) => {
                if (p.uid) {
                  mapIds.set(p.uid, {
                    id: p.uid,
                    nome: p.nome || 'Convidado',
                    foto: p.foto || 'assets/profile-icon.png'
                  });
                }
              });

              pessoasSubcolecao.forEach(p => {
                if (!mapIds.has(p.id)) {
                  mapIds.set(p.id, p);
                }
              });

              pessoasArray = Array.from(mapIds.values());
            }

            // Atualiza pessoas da viagem para atualizar template
            this.viagens[index].pessoas = pessoasArray;
          } catch (err) {
            console.error('Erro ao carregar pessoas da viagem:', err);
            this.viagens[index].pessoas = [];
          }
        });

      });

    } else {
      this.usuarioId = null;
      this.nomeUsuario = 'Usuário';
      this.viagens = [];
      this.tarefas = [];
    }
  });
}



  async apagarViagem(viagemId: string) {
    const confirmacao = await this.alertCtrl.create({
      header: 'Confirmar',
      message: 'Deseja realmente apagar esta viagem? Essa ação não poderá ser desfeita.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Apagar',
          role: 'destructive',
          handler: async () => {
            const user = auth.currentUser;
            if (!user) return;

            try {
              const docUserRef = doc(db, 'usuarios', user.uid, 'viagens', viagemId);
              const docGlobalRef = doc(db, 'viagens', viagemId);
              await deleteDoc(docUserRef);
              await deleteDoc(docGlobalRef);
              this.exibirToast('Viagem apagada com sucesso.');
              this.viagens = this.viagens.filter(v => v.id !== viagemId);
            } catch (error) {
              console.error('Erro ao apagar viagem:', error);
              this.exibirToast('Erro ao apagar a viagem.');
            }
          }
        }
      ]
    });
    await confirmacao.present();
  }

  async carregarTarefas(userId: string, viagemId: string) {
    const tarefasRef = collection(db, 'usuarios', userId, 'viagens', viagemId, 'tarefas');
    const snapshot = await getDocs(tarefasRef);

    const tarefasComNomes = await Promise.all(
      snapshot.docs.map(async (docSnapshot) => {
        const tarefa = docSnapshot.data();
        let nomeResponsavel = 'Desconhecido';

        if (tarefa['responsavelId']) {
          try {
            const responsavelRef = doc(db, 'usuarios', tarefa['responsavelId']);
            const responsavelSnap = await getDoc(responsavelRef);
            if (responsavelSnap.exists()) {
              const responsavelData = responsavelSnap.data();
              const nomeCompleto = responsavelData['nome'] || 'Desconhecido';
              nomeResponsavel = nomeCompleto.split(' ')[0];
            }
          } catch (err) {
            console.warn('Erro ao buscar nome do responsável:', err);
          }
        }

        return {
          ...tarefa,
          nomeResponsavel,
          id: docSnapshot.id,
          mostrarOpcoes: false
        };
      })
    );

    this.tarefas = (tarefasComNomes as any[]).sort((a, b) => {
      const statusA = a.status || 'pendente';
      const statusB = b.status || 'pendente';

      if (statusA === 'concluída' && statusB !== 'concluída') return 1;
      if (statusA !== 'concluída' && statusB === 'concluída') return -1;
      return 0;
    });
  }

  getNomeResponsavel(uid: string): string {
    const pessoa = this.pessoas.find(p => p.uid === uid);
    return pessoa ? pessoa.nome.split(' ')[0] : '';
  }

  toggleDetalhes(viagemId: string) {
    this.viagens = this.viagens.map(v => {
      if (v.id === viagemId) {
        const mostrar = !v.mostrarDetalhes;
        if (mostrar && this.usuarioId) {
          this.carregarTarefas(this.usuarioId, viagemId);
        }
        return { ...v, mostrarDetalhes: mostrar };
      }
      return v;
    });
  }

  formatarDataCompleta(data?: string): string {
    if (!data) return '';
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

    const partes = data.split('-');
    if (partes.length !== 3) return data;

    const ano = partes[0];
    const mesIndex = parseInt(partes[1], 10) - 1;
    const mes = meses[mesIndex] ?? partes[1];
    const dia = partes[2];

    return `${dia} ${mes} ${ano}`;
  }

  gerarRoteiro(viagem: any): { data: string; dia: string; nomeDia: string; exibicao: string }[] {
    if (!viagem?.dataIda || !viagem?.dataVolta) return [];

    const inicio = this.criarDataLocalZeroHora(viagem.dataIda);
    const fim = this.criarDataLocalZeroHora(viagem.dataVolta);
    const dias = eachDayOfInterval({ start: inicio, end: fim });

    return dias.map((data) => {
      const diaNumero = format(data, 'dd', { locale: ptBR });
      const mes = format(data, 'MMM', { locale: ptBR });
      const nomeDia = format(data, 'eeee', { locale: ptBR }).replace('-feira', '').trim();

      return {
        data: format(data, 'yyyy-MM-dd'),
        dia: `${diaNumero} ${mes}`,
        nomeDia,
        exibicao: `${diaNumero} ${mes} - ${nomeDia}`
      };
    });
  }

  criarDataLocalZeroHora(dataStr: string): Date {
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    return new Date(ano, mes - 1, dia, 0, 0, 0, 0);
  }

  CriarTarefa(viagemId: string) {
    this.router.navigate(['/criar-tarefa'], { queryParams: { viagemId } });
  }

  async concluirTarefa(tarefa: any, viagemId: string) {
    const user = auth.currentUser;
    if (!user) return;

    const tarefaRef = doc(db, 'usuarios', user.uid, 'viagens', viagemId, 'tarefas', tarefa.id);
    await updateDoc(tarefaRef, {
      status: 'concluída'
    });

    this.exibirToast('Tarefa concluída!');
    await this.carregarTarefas(user.uid, viagemId);
  }

  async excluirTarefa(tarefa: any, viagemId: string) {
    const user = auth.currentUser;
    if (!user) return;

    const tarefaRef = doc(db, 'usuarios', user.uid, 'viagens', viagemId, 'tarefas', tarefa.id);
    await deleteDoc(tarefaRef);

    this.exibirToast('Tarefa excluída!');
    await this.carregarTarefas(user.uid, viagemId);
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
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async abrirRoteiro(dia: { data: string; dia: string; nomeDia: string }, viagemId: string) {
    const user = auth.currentUser;
    if (!user) return;

    const tarefasRef = collection(db, 'usuarios', user.uid, 'viagens', viagemId, 'tarefas');
    const snapshot = await getDocs(tarefasRef);

    const atividadesDoDia = snapshot.docs
      .map(doc => doc.data())
      .filter(t => t['data'] === dia.data);

    const modal = await this.modalCtrl.create({
      component: RoteiroModalPage,
      cssClass: 'popup-modal',
      componentProps: {
        data: `${dia.dia} - ${dia.nomeDia}`,
        clima: 'Ensolarado, 27°C',
        atividades: atividadesDoDia,
        dataRaw: dia.data,
        viagemId: viagemId
      }
    });

    await modal.present();
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

async irParaCriarViagem() {
  await this.abrirLoadingENavegar('/criar-viagem', 200);
}

async irParaEntrarViagem() {
  await this.abrirLoadingENavegar('/entrar-viagem', 300);
}

async criarTarefaComLoading(idViagem: string) {
  await this.abrirLoadingENavegar(`/criar-tarefa/${idViagem}`, 300);
}




}
