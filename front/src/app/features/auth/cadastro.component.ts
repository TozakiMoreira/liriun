import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { BrandLogoComponent } from '../../shared/brand-logo.component';
import { PasswordInputComponent } from '../../shared/password-input.component';
import {
  PasswordRequirementsComponent,
  senhaAtendeRequisitos,
} from '../../shared/password-requirements.component';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    BrandLogoComponent,
    PasswordInputComponent,
    PasswordRequirementsComponent,
  ],
  template: `
    <main
      class="relative min-h-screen grid place-items-center px-6 py-12 bg-bg bg-accent-glow"
      data-testid="cadastro-page"
    >
      <a
        routerLink="/"
        class="absolute top-5 left-5 inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-text bg-bg-elev border border-border-strong rounded-lg hover:border-accent hover:bg-bg-input hover:text-accent transition-colors shadow-sm"
        data-testid="signup-home-link"
        aria-label="Voltar pra página inicial"
      >
        <i class="fa-solid fa-arrow-left text-xs"></i>
        Início
      </a>

      <div class="w-full max-w-[380px] flex flex-col gap-8">
        <app-brand-logo />

        <p class="text-center text-text-dim leading-relaxed -mt-3" data-testid="jarvis-greeting">
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

      <div
        class="fixed bottom-6 left-1/2 -translate-x-1/2 text-text-subtle text-[11px] tracking-wider"
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
  carregando = signal(false);
  erroGeral = signal<string | null>(null);
  errosCampo = signal<Record<string, string>>({});

  erroNome = computed(() => this.errosCampo()['nome'] ?? null);
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
    this.auth.cadastrar(this.nome.trim(), this.email.trim(), this.senha()).subscribe({
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
    return erros;
  }

  private aplicarErroBackend(err: HttpErrorResponse): void {
    const body = err?.error;

    if (body?.errors && typeof body.errors === 'object') {
      const errosNormalizados: Record<string, string> = {};
      for (const [chave, mensagens] of Object.entries(body.errors)) {
        const campo = chave.toLowerCase();
        const msgs = Array.isArray(mensagens) ? mensagens : [String(mensagens)];
        if (msgs[0]) errosNormalizados[campo] = msgs[0];
      }
      if (Object.keys(errosNormalizados).length > 0) {
        this.errosCampo.set(errosNormalizados);
        return;
      }
    }

    if (body?.detail) {
      this.erroGeral.set(body.detail);
      return;
    }

    if (err.status === 0) {
      this.erroGeral.set('Sem conexão com o servidor. Tenta de novo em instantes.');
      return;
    }

    this.erroGeral.set('Não consegui criar sua conta. Tenta de novo.');
  }
}
