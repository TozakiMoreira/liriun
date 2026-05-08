import { Routes } from '@angular/router';
import { authGuard, guestGuard, onboardingGuard } from './core/auth/auth.guard';
import { featureFlagGuard } from './core/features/feature-flags';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    data: { tituloKey: 'page_title.home' },
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    data: { tituloKey: 'page_title.signin' },
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'cadastro',
    canActivate: [guestGuard],
    data: { tituloKey: 'page_title.signup' },
    loadComponent: () =>
      import('./features/auth/cadastro.component').then((m) => m.CadastroComponent),
  },
  {
    path: 'politica-privacidade',
    data: { tituloKey: 'page_title.privacy' },
    loadComponent: () =>
      import('./features/legal/politica-privacidade.component').then(
        (m) => m.PoliticaPrivacidadeComponent,
      ),
  },
  {
    path: 'termos-uso',
    data: { tituloKey: 'page_title.terms' },
    loadComponent: () =>
      import('./features/legal/termos-uso.component').then((m) => m.TermosUsoComponent),
  },
  {
    path: 'sobre',
    data: { tituloKey: 'page_title.about' },
    loadComponent: () =>
      import('./features/sobre/sobre.component').then((m) => m.SobreComponent),
  },
  {
    path: 'empresa',
    data: { tituloKey: 'page_title.company' },
    loadComponent: () =>
      import('./features/empresa/empresa.component').then((m) => m.EmpresaComponent),
  },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    data: { tituloKey: 'page_title.welcome' },
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
        data: { tituloKey: 'page_title.overview' },
        loadComponent: () =>
          import('./features/visao-geral/visao-geral.component').then(
            (m) => m.VisaoGeralComponent,
          ),
      },
      {
        path: 'captura',
        data: { tituloKey: 'page_title.new_task' },
        loadComponent: () =>
          import('./features/captura/captura.component').then((m) => m.CapturaComponent),
      },
      {
        path: 'tarefas',
        data: { tituloKey: 'page_title.tasks' },
        loadComponent: () =>
          import('./features/tarefas/tarefas.component').then((m) => m.TarefasComponent),
      },
      {
        path: 'concluidas',
        data: { tituloKey: 'page_title.completed' },
        loadComponent: () =>
          import('./features/concluidas/concluidas.component').then((m) => m.ConcluidasComponent),
      },
      {
        path: 'financas',
        canActivate: [featureFlagGuard('financas')],
        data: { tituloKey: 'page_title.finances' },
        loadComponent: () =>
          import('./features/financas/financas.component').then((m) => m.FinancasComponent),
      },
      {
        path: 'configuracoes',
        data: { tituloKey: 'page_title.settings' },
        loadComponent: () =>
          import('./features/configuracoes/configuracoes.component').then(
            (m) => m.ConfiguracoesComponent,
          ),
      },
      {
        path: 'configuracoes/alterar-senha',
        data: { tituloKey: 'page_title.change_password' },
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
