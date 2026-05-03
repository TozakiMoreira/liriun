import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { BrandComponent } from '../../shared/brand.component';
import { BrandLogoComponent } from '../../shared/brand-logo.component';
import { PasswordInputComponent } from '../../shared/password-input.component';
import {
  PasswordRequirementsComponent,
  senhaAtendeRequisitos,
} from '../../shared/password-requirements.component';
import { extrairProblemDetails } from '../../shared/problem-details';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    BrandComponent,
    BrandLogoComponent,
    PasswordInputComponent,
    PasswordRequirementsComponent,
    ThemeToggleComponent,
  ],
  template: `
    <main
      class="min-h-screen flex flex-col bg-bg bg-accent-glow"
      data-testid="cadastro-page"
    >
      <header
        class="sticky top-0 z-30 backdrop-blur-md bg-bg/70 border-b border-border/50"
      >
        <div class="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
          <a
            routerLink="/"
            class="inline-flex items-center gap-2 text-[13px] font-medium text-text-dim hover:text-accent transition-colors"
            data-testid="signup-home-link"
            aria-label="Voltar pra página inicial"
          >
            <i class="fa-solid fa-arrow-left text-xs"></i>
            Início
          </a>
          <a routerLink="/" class="flex items-center gap-2.5" aria-label="Liriun — início">
            <img src="/logo.png" alt="" class="w-8 h-8 object-contain" aria-hidden="true" />
            <span class="text-[15px] font-semibold tracking-tight"><app-brand /></span>
          </a>
          <app-theme-toggle />
        </div>
      </header>

      <div class="flex-1 grid place-items-center px-6 py-12">
      <div class="w-full max-w-[380px] flex flex-col gap-8">
        <app-brand-logo />

        <p class="text-center text-text-dim leading-relaxed -mt-3" data-testid="liriun-greeting">
          Prazer em te conhecer. Me conta seu nome que eu começo a organizar as coisas pra você.
        </p>

        <form class="flex flex-col gap-3.5" data-testid="signup-form" (ngSubmit)="enviar()" novalidate>
          <div class="flex flex-col gap-1.5">
            <label class="field-label" for="nome">Como devo te chamar?</label>
            <input
              id="nome"
              name="nome"
              type="text"
              class="input-base"
              placeholder="Seu primeiro nome"
              autocomplete="given-name"
              data-testid="signup-name-input"
              [(ngModel)]="nome"
            />
            @if (erroNome()) {
              <p class="text-danger text-xs" data-testid="signup-erro-nome">{{ erroNome() }}</p>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="field-label" for="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              class="input-base"
              placeholder="voce@exemplo.com"
              autocomplete="email"
              data-testid="signup-email-input"
              [(ngModel)]="email"
            />
            @if (erroEmail()) {
              <p class="text-danger text-xs" data-testid="signup-erro-email">{{ erroEmail() }}</p>
            } @else {
              <div class="text-[11px] text-text-subtle -mt-0.5">
                Uso só pra identificar sua conta.
              </div>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="field-label" for="senha">Senha</label>
            <app-password-input
              inputId="senha"
              placeholder="Crie uma senha"
              autocomplete="new-password"
              testid="signup-password-input"
              [value]="senha()"
              (valueChange)="senha.set($event)"
            />
            <app-password-requirements
              class="mt-1"
              [senha]="senha()"
              testid="signup-password-requirements"
            />
            @if (erroSenha()) {
              <p class="text-danger text-xs" data-testid="signup-erro-senha">{{ erroSenha() }}</p>
            }
          </div>

          <div class="flex flex-col gap-1.5 mt-1">
            <label class="flex items-start gap-2 text-[13px] text-text-dim cursor-pointer select-none">
              <input
                type="checkbox"
                class="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--accent)]"
                name="aceitouTermos"
                data-testid="signup-aceite-checkbox"
                [(ngModel)]="aceitouTermos"
              />
              <span>
                Li e aceito os
                <a
                  routerLink="/termos-uso"
                  target="_blank"
                  rel="noopener"
                  class="text-text font-medium border-b border-border-strong hover:border-accent pb-px"
                  data-testid="signup-termos-link"
                  >Termos de Uso</a
                >
                e a
                <a
                  routerLink="/politica-privacidade"
                  target="_blank"
                  rel="noopener"
                  class="text-text font-medium border-b border-border-strong hover:border-accent pb-px"
                  data-testid="signup-privacidade-link"
                  >Política de Privacidade</a
                >.
              </span>
            </label>
            @if (erroAceite()) {
              <p class="text-danger text-xs" data-testid="signup-erro-aceite">{{ erroAceite() }}</p>
            }
          </div>

          @if (erroGeral()) {
            <p class="text-danger text-xs" data-testid="signup-erro">{{ erroGeral() }}</p>
          }

          <button
            type="submit"
            class="btn-primary mt-1"
            data-testid="signup-submit-btn"
            [disabled]="carregando()"
          >
            {{ carregando() ? 'Criando...' : 'Criar conta' }}
          </button>
        </form>

        <div class="flex items-center gap-3 text-text-subtle text-xs">
          <span class="flex-1 h-px bg-border"></span>
          ou
          <span class="flex-1 h-px bg-border"></span>
        </div>

        <p class="text-center text-[13px] text-text-dim">
          Já tem conta?
          <a
            routerLink="/login"
            class="text-text font-medium border-b border-border-strong hover:border-accent pb-px"
            data-testid="signup-login-link"
            >Entrar</a
          >
        </p>
      </div>
      </div>

      <div
        class="text-center pb-6 text-text-subtle text-[11px] tracking-wider"
      >
        LIRIUN • v0.1 BETA
      </div>
    </main>
  `,
})
export class CadastroComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  nome = '';
  email = '';
  senha = signal('');
  aceitouTermos = false;
  carregando = signal(false);
  erroGeral = signal<string | null>(null);
  errosCampo = signal<Record<string, string>>({});

  erroNome = computed(() => this.errosCampo()['nome'] ?? null);
  erroEmail = computed(() => this.errosCampo()['email'] ?? null);
  erroSenha = computed(() => this.errosCampo()['senha'] ?? null);
  erroAceite = computed(() => this.errosCampo()['aceitouTermos'] ?? null);

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
    this.auth.cadastrar(this.nome.trim(), this.email.trim(), this.senha(), this.aceitouTermos).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigateByUrl('/onboarding');
      },
      error: (err: HttpErrorResponse) => {
        this.carregando.set(false);
        this.aplicarErroBackend(err);
      },
    });
  }

  private validar(): Record<string, string> {
    const erros: Record<string, string> = {};
    if (!this.nome.trim()) {
      erros['nome'] = 'Preciso de um nome pra te chamar.';
    }
    const email = this.email.trim();
    if (!email) {
      erros['email'] = 'Email é obrigatório.';
    } else if (!email.includes('@') || !email.includes('.')) {
      erros['email'] = 'Esse email não parece válido.';
    }
    const senha = this.senha();
    if (!senha) {
      erros['senha'] = 'Senha é obrigatória.';
    } else if (!senhaAtendeRequisitos(senha)) {
      erros['senha'] = 'A senha não atende todos os requisitos.';
    }
    if (!this.aceitouTermos) {
      erros['aceitouTermos'] = 'Você precisa aceitar os Termos de Uso e a Política de Privacidade.';
    }
    return erros;
  }

  private aplicarErroBackend(err: HttpErrorResponse): void {
    const fallback = 'Não consegui criar sua conta. Tenta de novo.';
    const r = extrairProblemDetails(err, fallback);
    if (Object.keys(r.errosCampo).length > 0) {
      this.errosCampo.set(r.errosCampo);
    } else {
      this.erroGeral.set(r.mensagemGeral ?? fallback);
    }
  }
}
