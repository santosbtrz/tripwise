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

import { Router } from '@angular/router';
import {
  ToastController,
  ActionSheetController,
  AlertController,
} from '@ionic/angular';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class PerfilPage implements OnInit {
  nomeUsuario: string = '';
  usuarioId: string | null = null;
  userData: any = null;
  editarDadosAtivo: boolean = false;
  dadosOriginais: any = null;

  mostrarFormAlterarSenha: boolean = false;
  senhaAtual: string = '';
  novaSenha: string = '';

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.usuarioId = user.uid;

        const usuarioRef = doc(db, 'usuarios', user.uid);
        const usuarioSnap = await getDoc(usuarioRef);

        if (usuarioSnap.exists()) {
          const data = usuarioSnap.data();
          this.userData = { ...data };
          this.dadosOriginais = { ...data };
          this.nomeUsuario = data['nome'] ? data['nome'].split(' ')[0] : 'Usuário';
        } else {
          this.nomeUsuario = 'Usuário';
        }

        const viagensRef = collection(db, 'usuarios', user.uid, 'viagens');
        await getDocs(viagensRef); // carregando para eventual uso
      } else {
        this.usuarioId = null;
        this.nomeUsuario = 'Usuário';
        this.userData = null;
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
          icon: isPerfil ? 'home' : 'person',
          handler: () => {
            this.router.navigate([isPerfil ? '/inicio' : '/perfil']);
          },
        },
        {
          text: 'Sair',
          role: 'destructive',
          icon: 'log-out',
          handler: () => {
            signOut(auth).then(() => {
              this.router.navigate(['/login']);
            });
          },
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  async exibirToast(mensagem: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 3000,
      position: 'top',
      color: 'primary',
    });
    toast.present();
  }

  formatarData(data: string): string {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  ativarEdicao() {
    this.dadosOriginais = { ...this.userData };
    this.editarDadosAtivo = true;
  }

  cancelarEdicao() {
    this.userData = { ...this.dadosOriginais };
    this.editarDadosAtivo = false;
    this.exibirToast('Alterações canceladas.');
  }

  async salvarAlteracoes() {
    if (this.usuarioId && this.userData) {
      const userRef = doc(db, 'usuarios', this.usuarioId);
      try {
        await updateDoc(userRef, {
          cpf: this.userData.cpf,
          telefone: this.userData.telefone,
          email: this.userData.email,
          nascimento: this.userData.nascimento,
        });
        this.editarDadosAtivo = false;
        this.exibirToast('Dados atualizados com sucesso!');
      } catch (error) {
        console.error('Erro ao atualizar:', error);
        this.exibirToast('Erro ao atualizar os dados.');
      }
    }
  }

  formatarCPF() {
    if (!this.userData || !this.userData.cpf) return;
    let value = this.userData.cpf.replace(/\D/g, '').slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.userData.cpf = value;
  }

  formatarTelefone() {
    if (!this.userData || !this.userData.telefone) return;
    let value = this.userData.telefone.replace(/\D/g, '').slice(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    this.userData.telefone = value;
  }

  async alterarSenha() {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('Usuário não autenticado.');
      }

      if (!this.senhaAtual || !this.novaSenha) {
        this.exibirToast('Por favor, preencha ambos os campos de senha.');
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, this.senhaAtual);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, this.novaSenha);

      this.exibirToast('Senha alterada com sucesso!');
      this.mostrarFormAlterarSenha = false;
      this.senhaAtual = '';
      this.novaSenha = '';
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      if (error.code === 'auth/wrong-password') {
        this.exibirToast('Senha atual incorreta.');
      } else if (error.code === 'auth/weak-password') {
        this.exibirToast('Senha nova muito fraca. Use pelo menos 6 caracteres.');
      } else {
        this.exibirToast('Erro ao alterar senha: ' + error.message);
      }
    }
  }

  cancelarAlteracaoSenha() {
    this.mostrarFormAlterarSenha = false;
    this.senhaAtual = '';
    this.novaSenha = '';
  }

async excluirConta() {
  const confirmAlert = await this.alertCtrl.create({
    header: 'Confirmar exclusão',
    message: 'Tem certeza que deseja excluir sua conta? Essa ação é irreversível.',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Continuar',
        role: 'destructive',
        handler: async () => {
          // Segundo alerta pedindo a senha
          const senhaAlert = await this.alertCtrl.create({
            header: 'Confirme com sua senha',
            inputs: [
              {
                name: 'senha',
                type: 'password',
                placeholder: 'Digite sua senha'
              }
            ],
            buttons: [
              {
                text: 'Cancelar',
                role: 'cancel'
              },
              {
                text: 'Excluir',
                role: 'destructive',
                handler: async (data) => {
                  const senha = data.senha;
                  const loading = await this.loadingCtrl.create({
                    message: 'Excluindo conta...',
                    spinner: 'crescent',
                    cssClass: 'custom-loading'
                  });

                  try {
                    await loading.present();

                    const user = auth.currentUser;
                    if (!user || !user.email) throw new Error('Usuário não autenticado.');

                    if (!senha) {
                      this.exibirToast('Senha não informada.');
                      await loading.dismiss();
                      return;
                    }

                    const credential = EmailAuthProvider.credential(user.email, senha);
                    await reauthenticateWithCredential(user, credential);

                    const uid = this.usuarioId;
                    if (!uid) {
                      this.exibirToast('ID do usuário não encontrado.');
                      await loading.dismiss();
                      return;
                    }

                    // 1. Remover o documento do usuário
                    await deleteDoc(doc(db, 'usuarios', uid));

                    // 2. Remover todas as viagens salvas do usuário (subcoleção 'viagens')
                    const viagensUsuarioSnap = await getDocs(collection(db, 'usuarios', uid, 'viagens'));
                    for (const docu of viagensUsuarioSnap.docs) {
                      await deleteDoc(docu.ref);
                    }

                    // 3. Remover o usuário da subcoleção 'pessoas' de todas as viagens globais
                    const viagensSnap = await getDocs(collection(db, 'viagens'));
                    for (const viagemDoc of viagensSnap.docs) {
                      const viagemId = viagemDoc.id;
                      const pessoaRef = doc(db, 'viagens', viagemId, 'pessoas', uid);
                      const pessoaSnap = await getDoc(pessoaRef);
                      if (pessoaSnap.exists()) {
                        await deleteDoc(pessoaRef);
                      }
                    }

                    // 4. Excluir a conta do Firebase Authentication
                    await deleteUser(user);
                    console.log('Usuário deletado do Firebase Authentication');

                    await loading.dismiss();
                    this.exibirToast('Conta excluída com sucesso.');
                    this.router.navigate(['/login']);

                  } catch (error: any) {
                    await loading.dismiss();
                    console.error('Erro ao excluir conta:', error);
                    if (error.code === 'auth/wrong-password') {
                      this.exibirToast('Senha incorreta.');
                    } else if (error.code === 'auth/requires-recent-login') {
                      this.exibirToast('Você precisa fazer login novamente para excluir a conta.');
                    } else {
                      this.exibirToast('Erro ao excluir conta: ' + (error.message || 'Erro desconhecido.'));
                    }
                  }
                }
              }
            ]
          });

          await senhaAlert.present();
        }
      }
    ]
  });

  await confirmAlert.present();
}

}
