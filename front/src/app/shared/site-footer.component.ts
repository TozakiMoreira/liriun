import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { TokenStorage } from '../core/auth/token.storage';
import { LocaleService } from '../core/locale/locale.service';
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
              {{ locale.t('footer.tagline') }}
            </p>
            <div class="text-[11px] text-text-subtle tracking-wider mt-1">
              LIRIUN • V1
            </div>
          </div>

          <nav class="flex flex-col gap-2.5" data-testid="footer-nav-empresa">
            <h3 class="text-[13px] font-semibold text-text">{{ locale.t('footer.company') }}</h3>
            <a
              routerLink="/empresa"
              class="text-[13px] text-text-dim hover:text-accent transition-colors"
              data-testid="footer-link-empresa"
              >{{ locale.t('footer.about_tomore') }}</a
            >
            <a
              routerLink="/termos-uso"
              class="text-[13px] text-text-dim hover:text-accent transition-colors"
              data-testid="footer-link-termos"
              >{{ locale.t('footer.terms') }}</a
            >
            <a
              routerLink="/politica-privacidade"
              class="text-[13px] text-text-dim hover:text-accent transition-colors"
              data-testid="footer-link-privacidade"
              >{{ locale.t('footer.privacy') }}</a
            >
          </nav>

          <nav class="flex flex-col gap-2.5" data-testid="footer-nav-recursos">
            @if (autenticado()) {
              <h3 class="text-[13px] font-semibold text-text">{{ locale.t('footer.shortcuts') }}</h3>
              <a
                routerLink="/app/visao-geral"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-visao-geral"
                >@if (locale.locale() === 'pt') { Visão geral } @else { Overview }</a
              >
              <a
                routerLink="/app/captura"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-nova"
                >@if (locale.locale() === 'pt') { Nova tarefa } @else { New task }</a
              >
              <a
                routerLink="/app/tarefas"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-tarefas"
                >@if (locale.locale() === 'pt') { Tarefas } @else { Tasks }</a
              >
              <a
                routerLink="/app/concluidas"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-concluidas"
                >@if (locale.locale() === 'pt') { Concluídas } @else { Completed }</a
              >
            } @else {
              <h3 class="text-[13px] font-semibold text-text">{{ locale.t('footer.product') }}</h3>
              <a
                routerLink="/sobre"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-sobre-liriun"
                >@if (locale.locale() === 'pt') { Sobre o <app-brand /> } @else { About <app-brand /> }</a
              >
              <a
                routerLink="/sobre"
                fragment="contato"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-contato"
                >{{ locale.t('footer.contact') }}</a
              >
            }
          </nav>

          <nav class="flex flex-col gap-2.5" data-testid="footer-nav-acessar">
            @if (autenticado()) {
              <h3 class="text-[13px] font-semibold text-text">{{ locale.t('footer.account') }}</h3>
              <a
                routerLink="/app/configuracoes"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-conta-config"
                >{{ locale.t('footer.profile') }}</a
              >
              <a
                routerLink="/app/configuracoes/alterar-senha"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-conta-senha"
                >{{ locale.t('footer.change_password') }}</a
              >
              <button
                type="button"
                class="text-[13px] text-text-dim hover:text-danger transition-colors text-left"
                data-testid="footer-link-sair"
                (click)="sair()"
              >
                {{ locale.t('footer.signout') }}
              </button>
            } @else {
              <h3 class="text-[13px] font-semibold text-text">
                @if (locale.locale() === 'pt') { <app-brand /> pra você } @else { <app-brand /> for you }
              </h3>
              <a
                routerLink="/cadastro"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-cadastro"
                >{{ locale.t('footer.create_account') }}</a
              >
              <a
                routerLink="/login"
                class="text-[13px] text-text-dim hover:text-accent transition-colors"
                data-testid="footer-link-login"
                >{{ locale.t('footer.signin') }}</a
              >
            }
          </nav>
        </div>

        <div
          class="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-text-subtle text-[12px]"
        >
          <div class="flex flex-col gap-0.5">
            <span data-testid="footer-copyright">{{ locale.t('footer.copyright') }}</span>
            <span class="text-[11px]">
              {{ locale.t('footer.credits') }}
            </span>
          </div>
          <div class="flex items-center gap-4 text-[11px]">
            <span class="inline-flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {{ locale.t('footer.locale_label') }}
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
  readonly locale = inject(LocaleService);

  autenticado = computed(() => this.storage.estaAutenticado());

  sair(): void {
    this.auth.logout();
  }
}
