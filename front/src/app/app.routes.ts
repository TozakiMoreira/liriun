import { Routes } from '@angular/router';
import { authGuard, guestGuard, onboardingGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    data: { titulo: 'Início' },
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    data: { titulo: 'Entrar' },
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'cadastro',
    canActivate: [guestGuard],
    data: { titulo: 'Criar conta' },
    loadComponent: () =>
      import('./features/auth/cadastro.component').then((m) => m.CadastroComponent),
  },
  {
    path: 'politica-privacidade',
    data: { titulo: 'Política de Privacidade' },
    loadComponent: () =>
      import('./features/legal/politica-privacidade.component').then(
        (m) => m.PoliticaPrivacidadeComponent,
      ),
  },
  {
    path: 'termos-uso',
    data: { titulo: 'Termos de Uso' },
    loadComponent: () =>
      import('./features/legal/termos-uso.component').then((m) => m.TermosUsoComponent),
  },
  {
    path: 'sobre',
    data: { titulo: 'Sobre o Liriun' },
    loadComponent: () =>
      import('./features/sobre/sobre.component').then((m) => m.SobreComponent),
  },
  {
    path: 'empresa',
    data: { titulo: 'A ToMore' },
    loadComponent: () =>
      import('./features/empresa/empresa.component').then((m) => m.EmpresaComponent),
  },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    data: { titulo: 'Bem-vindo' },
    loadComponent: () =>
      import('./features/onboarding/onboarding.component').then((m) => m.OnboardingComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () =>
      import('./layout/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'visao-geral',
        data: { titulo: 'Visão geral' },
        loadComponent: () =>
          import('./features/visao-geral/visao-geral.component').then(
            (m) => m.VisaoGeralComponent,
          ),
      },
      {
        path: 'captura',
        data: { titulo: 'Nova tarefa' },
        loadComponent: () =>
          import('./features/captura/captura.component').then((m) => m.CapturaComponent),
      },
      {
        path: 'tarefas',
        data: { titulo: 'Tarefas' },
        loadComponent: () =>
          import('./features/tarefas/tarefas.component').then((m) => m.TarefasComponent),
      },
      {
        path: 'concluidas',
        data: { titulo: 'Concluídas' },
        loadComponent: () =>
          import('./features/concluidas/concluidas.component').then((m) => m.ConcluidasComponent),
      },
      {
        path: 'configuracoes',
        data: { titulo: 'Configurações' },
        loadComponent: () =>
          import('./features/configuracoes/configuracoes.component').then(
            (m) => m.ConfiguracoesComponent,
          ),
      },
      {
        path: 'configuracoes/alterar-senha',
        data: { titulo: 'Alterar senha' },
        loadComponent: () =>
          import('./features/configuracoes/alterar-senha.component').then(
            (m) => m.AlterarSenhaComponent,
          ),
      },
      { path: '', redirectTo: 'visao-geral', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
