import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LocaleService } from '../../core/locale/locale.service';
import { BrandComponent } from '../../shared/brand.component';
import { BrandLogoComponent } from '../../shared/brand-logo.component';
import { PasswordInputComponent } from '../../shared/password-input.component';
import { extrairProblemDetails } from '../../shared/problem-details';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';
import { LocaleSwitcherComponent } from '../../shared/locale-switcher.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, BrandComponent, BrandLogoComponent, PasswordInputComponent, ThemeToggleComponent, LocaleSwitcherComponent],
  template: `
    <main
      class="min-h-screen flex flex-col bg-bg bg-accent-glow"
      data-testid="login-page"
    >
      <header
        class="sticky top-0 z-30 backdrop-blur-md bg-bg/70 border-b border-border/50"
      >
        <div class="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
          <a
            routerLink="/"
            class="inline-flex items-center gap-2 text-[13px] font-medium text-text-dim hover:text-accent transition-colors"
            data-testid="login-home-link"
            aria-label="Voltar pra página inicial"
          >
            <i class="fa-solid fa-arrow-left text-xs"></i>
            @if (locale.locale() === 'pt') { Início } @else { Home }
          </a>
          <a routerLink="/" class="flex items-center gap-2.5" aria-label="Liriun — home">
            <img src="/liriun-assets/logo/liriun-icon.svg" alt="" class="w-8 h-8 object-contain" aria-hidden="true" />
            <span class="text-[15px] font-semibold tracking-tight"><app-brand /></span>
          </a>
          <div class="flex items-center gap-2">
            <app-locale-switcher />
            <span class="hidden sm:inline-flex"><app-theme-toggle /></span>
          </div>
        </div>
      </header>

      <div class="flex-1 grid place-items-center px-6 py-12">
      <div class="w-full max-w-[380px] flex flex-col gap-8">
        <app-brand-logo />

        <p class="text-center text-text-dim leading-relaxed -mt-3" data-testid="liriun-greeting">
          {{ locale.t('auth.login.greeting') }}
        </p>

        <form class="flex flex-col gap-3.5" data-testid="login-form" (ngSubmit)="enviar()" novalidate>
          <div class="flex flex-col gap-1.5">
            <label class="field-label" for="email">{{ locale.t('auth.login.email') }}</label>
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
            <label class="field-label" for="senha">{{ locale.t('auth.login.password') }}</label>
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
            {{ carregando() ? locale.t('auth.login.submitting') : locale.t('auth.login.submit') }}
          </button>
        </form>

        <div class="flex items-center gap-3 text-text-subtle text-xs">
          <span class="flex-1 h-px bg-border"></span>
          {{ locale.t('auth.login.divider') }}
          <span class="flex-1 h-px bg-border"></span>
        </div>

        <p class="text-center text-[13px] text-text-dim">
          {{ locale.t('auth.login.signup_q') }}
          <a
            routerLink="/cadastro"
            class="text-text font-medium border-b border-border-strong hover:border-accent pb-px"
            data-testid="login-signup-link"
            >{{ locale.t('auth.login.signup_link') }}</a
          >
        </p>
      </div>
      </div>

      <div
        class="text-center pb-6 text-text-subtle text-[11px] tracking-wider"
      >
        LIRIUN • V1
      </div>
    </main>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly locale = inject(LocaleService);

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
