import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { cadastrarUsuario } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SignupPage implements OnInit {
  constructor(private router: Router) {}

  nome = '';
  nascimento = '';
  telefone = '';
  email = '';
  cpf = '';
  senha = '';
  confirmaSenha = '';
  mensagem = '';

  ngOnInit() {}

  validarCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;

    return resto === parseInt(cpf[10]);
  }

  formatarCPF() {
    let value = this.cpf.replace(/\D/g, '').slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.cpf = value;
  }

  formatarTelefone() {
    let value = this.telefone.replace(/\D/g, '').slice(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    this.telefone = value;
  }

async cadastrar() {
  console.debug('[DEBUG] Botão "Cadastre-se" clicado.');
  console.debug('[DEBUG] Tentando cadastrar o usuário...');

  if (this.senha !== this.confirmaSenha) {
    alert('As senhas não coincidem.');
    return;
  }

  if (!this.validarCPF(this.cpf)) {
    alert('CPF inválido.');
    return;
  }

  try {
    const usuario = await cadastrarUsuario({
      nome: this.nome,
      nascimento: this.nascimento,
      telefone: this.telefone,
      email: this.email,
      cpf: this.cpf,
      senha: this.senha
    });

    console.debug('[DEBUG] Usuário cadastrado com sucesso:', usuario);
    this.router.navigate(['/login']);

  } catch (erro: any) {
    console.error('[ERRO] Falha ao cadastrar:', erro);
    alert('Erro ao cadastrar: ' + erro.message);
  }
}


}
