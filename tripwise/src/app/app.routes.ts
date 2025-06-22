import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup.page').then((m) => m.SignupPage),
  },
  {
    path: 'landing',
    loadComponent: () =>
      import('./pages/landing/landing.page').then((m) => m.LandingPage),
  },  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password.page').then( m => m.ResetPasswordPage)
  },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/inicio/inicio.page').then( m => m.InicioPage)
  },
  {
    path: 'criar-viagem',
    loadComponent: () => import('./pages/criar-viagem/criar-viagem.page').then( m => m.CriarViagemPage)
  },
  {
    path: 'viagem-criada',
    loadComponent: () => import('./pages/viagem-criada/viagem-criada.page').then( m => m.ViagemCriadaPage)
  },
  {
    path: 'entrar-viagem',
    loadComponent: () => import('./pages/entrar-viagem/entrar-viagem.page').then( m => m.EntrarViagemPage)
  },
  {
    path: 'criar-tarefa',
    loadComponent: () => import('./pages/criar-tarefa/criar-tarefa.page').then( m => m.CriarTarefaPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then( m => m.PerfilPage)
  },
  {
    path: 'roteiro-modal',
    loadComponent: () => import('./pages/roteiro-modal/roteiro-modal.page').then( m => m.RoteiroModalPage)
  },

];
