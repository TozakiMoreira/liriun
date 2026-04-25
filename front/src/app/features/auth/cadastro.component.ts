import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { BrandLogoComponent } from '../../shared/brand-logo.component';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [FormsModule, RouterLink, BrandLogoComponent],
  template: `
    <main
      class="min-h-screen grid place-items-center px-6 py-12 bg-bg bg-accent-glow"
      data-testid="cadastro-page"
    >
      <div class="w-full max-w-[380px] flex flex-col gap-8">
        <app-brand-logo />

        <p class="text-center text-text-dim leading-relaxed -mt-3" data-testid="jarvis-greeting">
          Prazer em te conhecer. Me conta seu nome que eu começo a organizar as coisas pra você.
        </p>

        <form
          class="flex flex-col gap-3.5"
          data-testid="signup-form"
          (ngSubmit)="enviar()"
          #f="ngForm"
        >
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
              required
            />
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
              required
            />
            <div class="text-[11px] text-text-subtle -mt-0.5">
              Uso só pra identificar sua conta.
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="field-label" for="senha">Senha</label>
            <input
              id="senha"
              name="senha"
              type="password"
              class="input-base"
              placeholder="Mínimo de 8 caracteres"
              autocomplete="new-password"
              minlength="8"
              data-testid="signup-password-input"
              [(ngModel)]="senha"
              required
            />
          </div>

          @if (erro()) {
            <p class="text-danger text-xs" data-testid="signup-erro">{{ erro() }}</p>
          }

          <button
            type="submit"
            class="btn-primary mt-1"
            data-testid="signup-submit-btn"
            [disabled]="carregando() || f.invalid"
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
        JARVIS • v0.1 BETA
      </div>
    </main>
  `,
})
export class CadastroComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  nome = '';
  email = '';
  senha = '';
  carregando = signal(false);
  erro = signal<string | null>(null);

  enviar(): void {
    if (this.carregando()) return;
    this.carregando.set(true);
    this.erro.set(null);

    this.auth.cadastrar(this.nome, this.email, this.senha).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigateByUrl('/onboarding');
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err?.error?.mensagem ?? 'Não consegui criar sua conta. Tenta de novo.');
      },
    });
  }
}
