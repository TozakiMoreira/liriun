import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { TokenStorage } from '../core/auth/token.storage';
import { BrandComponent } from './brand.component';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink, BrandComponent],
  template: `
    <footer class="border-t border-border/50 mt-8" data-testid="site-footer">
      <div class="max-w-6xl mx-auto px-6 py-12">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
          <div class="col-span-2 sm:col-span-3 lg:col-span-2 flex flex-col gap-4">
            <a
              routerLink="/"
              class="inline-flex items-center gap-2.5 self-start"
              data-testid="footer-logo"
            >
              <img
                src="/logo.png"
                alt=""
                class="w-8 h-8 object-contain"
                aria-hidden="true"
              />
              <span class="text-[16px] font-semibold tracking-tight"><app-brand /></span>
            </a>
            <p class="text-text-dim text-[13px] leading-relaxed max-w-sm">
              Feito pra você, que não tem 25h por dia.
            </p>
            <div class="text-[11px] text-text-subtle tracking-wider mt-1">
              LIRIUN • v0.1 BETA
            </div>
          </div>

          <nav class="flex flex-col gap-2.5" data-testid="footer-nav-empresa">
            <h3 class="text-[13px] font-semibold text-text">Empresa</h3>
            <a
              routerLink="/empresa"
              class="text-[13px] text-text-dim hover:text-accent transition-colors"
              data-testid="footer-link-empresa"
              >Sobre a ToMore</a
            >
            <a
              routerLink="/termos-uso"
              class="text-[13px] text-text-dim hover:text-accent transition-colors"
              data-testid="footer-link-termos"
              >Termos de Uso</a
            >
            <a
              routerLink="/politica-privacidade"
              class="text-[13px] text-text-dim hover:text-accent transition-colors"
              data-testid="footer-link-privacidade"
              >Política de Privacidade</a
            >
          </nav>

          <nav class="flex flex-col gap-2.5" data-testid="footer-nav-recursos">
            @if (autenticado()) {
              <h3 class="text-[13px] font-semibold text-text">Atalhos</h3>
              <a
                routerLink="/app/visao-geral"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-visao-geral"
                >Visão geral</a
              >
              <a
                routerLink="/app/captura"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-nova"
                >Nova tarefa</a
              >
              <a
                routerLink="/app/tarefas"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-tarefas"
                >Tarefas</a
              >
              <a
                routerLink="/app/concluidas"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-concluidas"
                >Concluídas</a
              >
            } @else {
              <h3 class="text-[13px] font-semibold text-text">Produto</h3>
              <a
                routerLink="/sobre"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-sobre-liriun"
                >Sobre o Liriun</a
              >
              <a
                routerLink="/sobre"
                fragment="contato"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-contato"
                >Contato</a
              >
            }
          </nav>

          <nav class="flex flex-col gap-2.5" data-testid="footer-nav-acessar">
            @if (autenticado()) {
              <h3 class="text-[13px] font-semibold text-text">Conta</h3>
              <a
                routerLink="/app/configuracoes"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-conta-config"
                >Perfil</a
              >
              <a
                routerLink="/app/configuracoes/alterar-senha"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-conta-senha"
                >Alterar senha</a
              >
              <button
                type="button"
                class="text-[13px] text-text-dim hover:text-danger transition-colors text-left"
                data-testid="footer-link-sair"
                (click)="sair()"
              >
                Sair
              </button>
            } @else {
              <h3 class="text-[13px] font-semibold text-text">Liriun pra você</h3>
              <a
                routerLink="/cadastro"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-cadastro"
                >Criar conta</a
              >
              <a
                routerLink="/login"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-login"
                >Entrar</a
              >
            }
          </nav>
        </div>

        <div
          class="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-text-subtle text-[12px]"
        >
          <div class="flex flex-col gap-0.5">
            <span data-testid="footer-copyright">© 2026 ToMore. Todos os direitos reservados.</span>
            <span class="text-[11px]">
              Criado por Lucas Moreira e Pedro Tozaki em 2026 — pra simplificar o dia a dia de quem
              tem mil coisas pra lembrar.
            </span>
          </div>
          <div class="flex items-center gap-4 text-[11px]">
            <span class="inline-flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Português (Brasil)
            </span>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class SiteFooterComponent {
  private readonly storage = inject(TokenStorage);
  private readonly auth = inject(AuthService);

  autenticado = computed(() => this.storage.estaAutenticado());

  sair(): void {
    this.auth.logout();
  }
}
