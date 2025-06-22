import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSelect,
  IonSelectOption,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';

import { Router, ActivatedRoute } from '@angular/router';
import { auth, db } from '../../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, getDocs } from 'firebase/firestore';

interface Pessoa {
  uid?: string;
  nome?: string;
  foto?: string;
  papel?: string;
}

@Component({
  selector: 'app-criar-tarefa',
  templateUrl: './criar-tarefa.page.html',
  styleUrls: ['./criar-tarefa.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSelect,
    IonSelectOption,
    CommonModule,
    FormsModule
  ]
})
export class CriarTarefaPage implements OnInit {
  nomeUsuario: string = '';
  pessoas: any[] = [];
  responsavelSelecionado: string = '';
  viagemId: string = '';
  userId: string = '';
  dataFormatada: string = '';
  tituloTarefa: string = '';
  descricaoTarefa: string = '';
  prioridadeAlta: boolean = false;
  

constructor(
  private router: Router,
  private route: ActivatedRoute,
  private toastCtrl: ToastController,
  private loadingCtrl: LoadingController
) {}




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

        this.route.queryParams.subscribe(async params => {
          this.viagemId = params['viagemId'] || '';
          if (this.viagemId) {
            await this.carregarPessoasDaViagem(this.userId, this.viagemId);
          }
        });
      }
    });
  }

async carregarPessoasDaViagem(userId: string, viagemId: string) {
  try {
    const CRIADOR_UID = 'criador-viagem';

    // Busca o documento da viagem global para pegar o array pessoas (inclui criador)
    const viagemDocRef = doc(db, 'viagens', viagemId);
    const viagemDocSnap = await getDoc(viagemDocRef);

    let pessoasArray: Pessoa[] = [];

    if (viagemDocSnap.exists()) {
      const viagemData = viagemDocSnap.data();

      // Pega array 'pessoas' do documento (criador e outros que tiver)
      const pessoasDoc: Pessoa[] = viagemData?.['pessoas'] || [];

      // Mapeia e atribui uid fixo para criador (caso não tenha uid)
      const pessoasDocMapeadas = pessoasDoc.map((p) => ({
        uid: p.uid || CRIADOR_UID,
        nome: p.nome || 'Convidado',
        foto: p.foto || 'assets/profile-icon.png',
        papel: p.papel || 'pessoa'
      }));

      // Busca a subcoleção 'pessoas' da viagem (convidados)
      const pessoasRef = collection(db, 'viagens', viagemId, 'pessoas');
      const pessoasSnap = await getDocs(pessoasRef);

      const pessoasSubcolecao: Pessoa[] = pessoasSnap.docs.map(doc => {
        const p = doc.data() as Pessoa;
        return {
          uid: p.uid || doc.id,
          nome: p.nome || 'Convidado',
          foto: p.foto || 'assets/profile-icon.png',
          papel: p.papel || 'pessoa'
        };
      });

      // Combina as duas listas removendo duplicados pelo uid
      const mapIds = new Map<string, Pessoa>();

      pessoasDocMapeadas.forEach(p => {
        mapIds.set(p.uid!, p);
      });

      pessoasSubcolecao.forEach(p => {
        if (!mapIds.has(p.uid!)) {
          mapIds.set(p.uid!, p);
        }
      });

      pessoasArray = Array.from(mapIds.values());
    }

    this.pessoas = pessoasArray;
  } catch (error) {
    console.error('Erro ao carregar pessoas da viagem:', error);
    this.pessoas = [];
  }
}





  selecionarResponsavel(uid: string) {
    this.responsavelSelecionado = uid;
  }

  formatarData(event: any) {
    let valor = event.target.value.replace(/\D/g, '');

    if (valor.length > 2 && valor.length <= 4) {
      valor = valor.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    } else if (valor.length > 4) {
      valor = valor.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
    }

    this.dataFormatada = valor;
  }

  getDataParaFirebase(): string | null {
    const partes = this.dataFormatada.split('/');
    if (partes.length === 3) {
      const [dia, mes, ano] = partes.map(Number);
      const data = new Date(ano, mes - 1, dia);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (data.getDate() !== dia || data.getMonth() !== mes - 1 || data.getFullYear() !== ano) {
        return null;
      }

      if (data < hoje) {
        return null;
      }

      return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    }

    return null;
  }

  async salvarTarefa() {
    const dataParaSalvar = this.getDataParaFirebase();
    if (!this.tituloTarefa || !this.responsavelSelecionado || !dataParaSalvar) {
      this.exibirToast('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    try {
      const tarefasRef = collection(
        db,
        'usuarios',
        this.userId,
        'viagens',
        this.viagemId,
        'tarefas'
      );

      await addDoc(tarefasRef, {
        titulo: this.tituloTarefa,
        descricao: this.descricaoTarefa,
        responsavelId: this.responsavelSelecionado,
        dataPrazo: dataParaSalvar,
        prioridadeAlta: this.prioridadeAlta,
        criadaPor: this.userId,
        criadaEm: new Date()
      });

      this.exibirToast('Tarefa criada com sucesso!');
      this.router.navigate(['/inicio']);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      this.exibirToast('Erro ao salvar a tarefa, tente novamente.');
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

async irParaInicio() {
  await this.abrirLoadingENavegar('/inicio', 300);
}


}
