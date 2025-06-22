import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { IonicModule, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loadingCtrl: LoadingController 
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {}

  async login() {
    this.errorMessage = '';

    const email = this.loginForm.value.email;
    const senha = this.loginForm.value.senha;

    const loading = await this.loadingCtrl.create({
      message: '',
      spinner: 'crescent',
      cssClass: 'custom-loading'
    });

    await loading.present(); 

    try {
      await signInWithEmailAndPassword(auth, email, senha);


      (document.activeElement as HTMLElement)?.blur();

      this.router.navigate(['/inicio']);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        this.errorMessage = 'Email ou senha incorretos.';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Email inválido.';
      } else {
        this.errorMessage = 'Erro ao fazer login. Tente novamente.';
      }
    } finally {
      await loading.dismiss(); 
    }
  }
}
