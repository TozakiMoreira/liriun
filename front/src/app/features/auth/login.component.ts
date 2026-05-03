import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { BrandLogoComponent } from '../../shared/brand-logo.component';
import { PasswordInputComponent } from '../../shared/password-input.component';
import { extrairProblemDetails } from '../../shared/problem-details';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, BrandLogoComponent, PasswordInputComponent, ThemeToggleComponent],
  template: `
    <main
      class="relative min-h-screen grid place-items-center px-6 py-12 bg-bg bg-accent-glow"
      data-testid="login-page"
    >
      <a
        routerLink="/"
        class="absolute top-5 left-5 inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-text bg-bg-elev border border-border-strong rounded-lg hover:border-accent hover:bg-bg-input hover:text-accent transition-colors shadow-sm"
        data-testid="login-home-link"
        aria-label="Voltar pra página inicial"
      >
        <i class="fa-solid fa-arrow-left text-xs"></i>
        Início
      </a>

      <div class="absolute top-5 right-5">
        <app-theme-toggle />
      </div>

      <div class="w-full max-w-[380px] flex flex-col gap-8">
        <app-brand-logo />

        <p class="text-center text-text-dim leading-relaxed -mt-3" data-testid="liriun-greeting">
          Bem-vindo de volta. Entra com suas credenciais que eu cuido do resto.
        </p>

        <form class="flex flex-col gap-3.5" data-testid="login-form" (ngSubmit)="enviar()" novalidate>
          <div class="flex flex-col gap-1.5">
            <label class="field-label" for="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              class="input-base"
              placeholder="voce@exemplo.com"
              autocomplete="email"
              data-testid="login-email-input"
              [(ngModel)]="email"
            />
            @if (erroEmail()) {
              <p class="text-danger text-xs" data-testid="login-erro-email">{{ erroEmail() }}</p>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="field-label" for="senha">Senha</label>
            <app-password-input
              inputId="senha"
              placeholder="••••••••"
              autocomplete="current-password"
              testid="login-password-input"
              [value]="senha"
              (valueChange)="senha = $event"
            />
            @if (erroSenha()) {
              <p class="text-danger text-xs" data-testid="login-erro-senha">{{ erroSenha() }}</p>
            }
          </div>

          @if (erroGeral()) {
            <p class="text-danger text-xs" data-testid="login-erro">{{ erroGeral() }}</p>
          }

          <button
            type="submit"
            class="btn-primary mt-1"
            data-testid="login-submit-btn"
            [disabled]="carregando()"
          >
            {{ carregando() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div class="flex items-center gap-3 text-text-subtle text-xs">
          <span class="flex-1 h-px bg-border"></span>
          ou
          <span class="flex-1 h-px bg-border"></span>
        </div>

        <p class="text-center text-[13px] text-text-dim">
          Primeira vez por aqui?
          <a
            routerLink="/cadastro"
            class="text-text font-medium border-b border-border-strong hover:border-accent pb-px"
            data-testid="login-signup-link"
            >Criar conta</a
          >
        </p>
      </div>

      <div
        class="fixed bottom-6 left-1/2 -translate-x-1/2 text-text-subtle text-[11px] tracking-wider"
      >
        LIRIUN • v0.1 BETA
      </div>
    </main>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  senha = '';
  carregando = signal(false);
  erroGeral = signal<string | null>(null);
  errosCampo = signal<Record<string, string>>({});

  erroEmail = computed(() => this.errosCampo()['email'] ?? null);
  erroSenha = computed(() => this.errosCampo()['senha'] ?? null);

  enviar(): void {
    if (this.carregando()) return;
    this.erroGeral.set(null);

    const erros = this.validar();
    if (Object.keys(erros).length > 0) {
      this.errosCampo.set(erros);
      return;
    }
    this.errosCampo.set({});

    this.carregando.set(true);
    this.auth.login(this.email.trim(), this.senha).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigateByUrl('/app/captura');
      },
      error: (err: HttpErrorResponse) => {
        this.carregando.set(false);
        this.aplicarErroBackend(err);
      },
    });
  }

  private validar(): Record<string, string> {
    const erros: Record<string, string> = {};
    const email = this.email.trim();
    if (!email) {
      erros['email'] = 'Email é obrigatório.';
    } else if (!email.includes('@') || !email.includes('.')) {
      erros['email'] = 'Esse email não parece válido.';
    }
    if (!this.senha) {
      erros['senha'] = 'Senha é obrigatória.';
    }
    return erros;
  }

  private aplicarErroBackend(err: HttpErrorResponse): void {
    const fallback = err.status === 401 || err.status === 400
      ? 'Email ou senha incorretos.'
      : 'Não consegui entrar. Tenta de novo.';
    const r = extrairProblemDetails(err, fallback);
    if (Object.keys(r.errosCampo).length > 0) {
      this.errosCampo.set(r.errosCampo);
    } else {
      this.erroGeral.set(r.mensagemGeral ?? fallback);
    }
  }
}
