import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { BrandLogoComponent } from '../../shared/brand-logo.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, BrandLogoComponent],
  template: `
    <main
      class="min-h-screen grid place-items-center px-6 py-12 bg-bg bg-accent-glow"
      data-testid="login-page"
    >
      <div class="w-full max-w-[380px] flex flex-col gap-8">
        <app-brand-logo />

        <p class="text-center text-text-dim leading-relaxed -mt-3" data-testid="jarvis-greeting">
          Bem-vindo de volta. Entra com suas credenciais que eu cuido do resto.
        </p>

        <form
          class="flex flex-col gap-3.5"
          data-testid="login-form"
          (ngSubmit)="enviar()"
          #f="ngForm"
        >
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
              required
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="field-label" for="senha">Senha</label>
            <input
              id="senha"
              name="senha"
              type="password"
              class="input-base"
              placeholder="••••••••"
              autocomplete="current-password"
              data-testid="login-password-input"
              [(ngModel)]="senha"
              required
            />
          </div>

          @if (erro()) {
            <p class="text-danger text-xs" data-testid="login-erro">{{ erro() }}</p>
          }

          <button
            type="submit"
            class="btn-primary mt-1"
            data-testid="login-submit-btn"
            [disabled]="carregando() || f.invalid"
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
        JARVIS • v0.1 BETA
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
  erro = signal<string | null>(null);

  enviar(): void {
    if (this.carregando()) return;
    this.carregando.set(true);
    this.erro.set(null);

    this.auth.login(this.email, this.senha).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigateByUrl('/captura');
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err?.error?.mensagem ?? 'Não consegui entrar. Confere os dados.');
      },
    });
  }
}
