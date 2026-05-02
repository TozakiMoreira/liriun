import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'cadastro',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/cadastro.component').then((m) => m.CadastroComponent),
  },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/onboarding/onboarding.component').then((m) => m.OnboardingComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'captura',
        loadComponent: () =>
          import('./features/captura/captura.component').then((m) => m.CapturaComponent),
      },
      {
        path: 'tarefas',
        loadComponent: () =>
          import('./features/tarefas/tarefas.component').then((m) => m.TarefasComponent),
      },
      {
        path: 'concluidas',
        loadComponent: () =>
          import('./features/concluidas/concluidas.component').then((m) => m.ConcluidasComponent),
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import('./features/configuracoes/configuracoes.component').then(
            (m) => m.ConfiguracoesComponent,
          ),
      },
      {
        path: 'configuracoes/alterar-senha',
        loadComponent: () =>
          import('./features/configuracoes/alterar-senha.component').then(
            (m) => m.AlterarSenhaComponent,
          ),
      },
      { path: '', redirectTo: 'captura', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
