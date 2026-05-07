import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { TokenStorage } from '../../core/auth/token.storage';
import { LocaleService } from '../../core/locale/locale.service';
import { PasswordInputComponent } from '../../shared/password-input.component';
import {
  PasswordRequirementsComponent,
  senhaAtendeRequisitos,
} from '../../shared/password-requirements.component';
import { extrairProblemDetails } from '../../shared/problem-details';
import { PageHeaderService } from '../../core/layout/page-header.service';

@Component({
  selector: 'app-alterar-senha',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PasswordInputComponent,
    PasswordRequirementsComponent,
  ],
  template: `
    <ng-template #subtituloTpl>
      <i class="fa-solid fa-chevron-right text-[9px] text-accent"></i>
      <span class="text-text font-medium text-[13px]">{{ locale.t('change_pw.crumb_current') }}</span>
    </ng-template>

    <header
      class="md:hidden flex items-center px-4 py-3.5 border-b border-border gap-3"
      style="background-image: radial-gradient(ellipse 60% 100% at 0% 50%, rgba(94, 106, 210, 0.08), transparent 60%);"
    >
      <a
        routerLink="/app/configuracoes"
        class="group inline-flex items-center justify-center w-8 h-8 rounded-md text-text-dim bg-bg-elev border border-border hover:text-text hover:border-border-strong active:scale-95 transition-all"
        data-testid="alterar-senha-voltar"
        [attr.aria-label]="locale.t('change_pw.back_aria')"
        [attr.title]="locale.t('change_pw.back_aria')"
      >
        <i class="fa-solid fa-arrow-left text-[13px] transition-transform group-hover:-translate-x-0.5"></i>
      </a>
      <nav
        class="flex items-center gap-1.5 text-[13px] text-text-dim"
        aria-label="Breadcrumb"
      >
        <a
          routerLink="/app/configuracoes"
          class="hover:text-text transition-colors"
        >
          {{ locale.t('change_pw.crumb_settings') }}
        </a>
        <i class="fa-solid fa-chevron-right text-[9px] text-accent"></i>
        <span class="text-text font-medium flex items-center gap-1.5">
          <i class="fa-solid fa-key text-accent text-[11px]"></i>
          {{ locale.t('change_pw.crumb_current') }}
        </span>
      </nav>
    </header>

    <div
      class="flex-1 grid place-items-start md:place-items-center px-4 py-8 md:py-12 overflow-auto"
      data-testid="alterar-senha-page"
    >
      <div class="w-full max-w-[440px] flex flex-col gap-5 animate-fade-up">
        <div class="flex flex-col items-center gap-3 text-center">
          <div
            class="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 grid place-items-center text-accent shadow-glow"
            aria-hidden="true"
          >
            <i class="fa-solid fa-key text-[20px]"></i>
          </div>
          <div class="flex flex-col gap-1">
            <h1 class="text-2xl font-semibold tracking-tight">{{ locale.t('change_pw.title') }}</h1>
            <p class="text-text-dim text-[13px] leading-relaxed max-w-[340px]">
              {{ locale.t('change_pw.subtitle') }}
            </p>
          </div>
        </div>

        <div class="card-elev p-6 flex flex-col gap-5">

          <form class="flex flex-col gap-4" (ngSubmit)="trocar()" novalidate>
            <div class="flex flex-col gap-1.5">
              <label class="field-label" for="senha-atual">{{ locale.t('change_pw.current_label') }}</label>
              <app-password-input
                inputId="senha-atual"
                [placeholder]="locale.t('change_pw.current_placeholder')"
                autocomplete="current-password"
                testid="senha-atual-input"
                [value]="senhaAtual()"
                (valueChange)="senhaAtual.set($event)"
              />
              @if (erroSenhaAtual()) {
                <p class="text-danger text-xs" data-testid="senha-atual-erro">
                  {{ erroSenhaAtual() }}
                </p>
              }
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="field-label" for="nova-senha">{{ locale.t('change_pw.new_label') }}</label>
              <app-password-input
                inputId="nova-senha"
                [placeholder]="locale.t('change_pw.new_placeholder')"
                autocomplete="new-password"
                testid="nova-senha-input"
                [value]="novaSenha()"
                (valueChange)="novaSenha.set($event)"
              />
              <app-password-requirements
                class="mt-1"
                [senha]="novaSenha()"
                testid="trocar-senha-requirements"
              />
              @if (erroNovaSenha()) {
                <p class="text-danger text-xs" data-testid="nova-senha-erro">
                  {{ erroNovaSenha() }}
                </p>
              }
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="field-label" for="confirmar-senha">{{ locale.t('change_pw.confirm_label') }}</label>
              <app-password-input
                inputId="confirmar-senha"
                [placeholder]="locale.t('change_pw.confirm_placeholder')"
                autocomplete="new-password"
                testid="confirmar-senha-input"
                [value]="confirmarSenha()"
                (valueChange)="confirmarSenha.set($event)"
              />
              @if (confirmarSenha() && novaSenha()) {
                <p
                  class="flex items-center gap-2 text-[11px] transition-colors"
                  [class.text-emerald-400]="senhasBatem()"
                  [class.text-danger]="!senhasBatem()"
                  data-testid="confirmar-senha-status"
                >
                  @if (senhasBatem()) {
                    <i class="fa-solid fa-check w-3 text-center"></i>
                    {{ locale.t('change_pw.match_ok') }}
                  } @else {
                    <i class="fa-solid fa-xmark w-3 text-center"></i>
                    {{ locale.t('change_pw.match_fail') }}
                  }
                </p>
              }
            </div>

            @if (sucesso()) {
              <p class="text-emerald-400 text-xs" data-testid="senha-sucesso">{{ sucesso() }}</p>
            }
            @if (erroGeral()) {
              <p class="text-danger text-xs" data-testid="senha-erro-geral">{{ erroGeral() }}</p>
            }

            <div class="flex justify-end gap-2 pt-1">
              <a
                routerLink="/app/configuracoes"
                class="btn-secondary text-[13px] px-4 py-2"
                data-testid="alterar-senha-cancelar"
              >
                {{ locale.t('change_pw.cancel') }}
              </a>
              <button
                type="submit"
                class="btn-primary"
                data-testid="trocar-senha-btn"
                [disabled]="trocando() || !podeTrocar()"
              >
                {{ trocando() ? locale.t('change_pw.submitting') : locale.t('change_pw.submit') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class AlterarSenhaComponent implements AfterViewInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly storage = inject(TokenStorage);
  private readonly pageHeader = inject(PageHeaderService);
  readonly locale = inject(LocaleService);
  private readonly subtituloTplRef = viewChild<TemplateRef<unknown>>('subtituloTpl');

  constructor() {
    this.pageHeader.set({
      titulo: this.locale.t('change_pw.crumb_settings'),
      voltar: {
        acao: () => this.router.navigateByUrl('/app/configuracoes'),
        aria: this.locale.t('change_pw.back_aria'),
        testid: 'alterar-senha-voltar-topbar',
      },
    });
  }

  ngAfterViewInit(): void {
    this.pageHeader.set({
      titulo: this.locale.t('change_pw.crumb_settings'),
      subtituloTpl: this.subtituloTplRef() ?? null,
      voltar: {
        acao: () => this.router.navigateByUrl('/app/configuracoes'),
        aria: this.locale.t('change_pw.back_aria'),
        testid: 'alterar-senha-voltar-topbar',
      },
    });
  }

  ngOnDestroy(): void {
    this.pageHeader.limpar();
  }

  readonly senhaAtual = signal('');
  readonly novaSenha = signal('');
  readonly confirmarSenha = signal('');
  readonly trocando = signal(false);
  readonly errosCampo = signal<Record<string, string>>({});
  readonly erroGeral = signal<string | null>(null);
  readonly sucesso = signal<string | null>(null);

  readonly erroSenhaAtual = computed(() => this.errosCampo()['senhaatual'] ?? null);
  readonly erroNovaSenha = computed(() => this.errosCampo()['novasenha'] ?? null);

  readonly senhasBatem = computed(() => {
    const n = this.novaSenha();
    const c = this.confirmarSenha();
    return n.length > 0 && n === c;
  });

  readonly podeTrocar = computed(
    () =>
      this.senhaAtual().length > 0 &&
      senhaAtendeRequisitos(this.novaSenha()) &&
      this.senhasBatem(),
  );

  trocar(): void {
    if (this.trocando()) return;
    this.erroGeral.set(null);
    this.sucesso.set(null);

    const erros: Record<string, string> = {};
    if (!this.senhaAtual()) {
      erros['senhaatual'] = this.locale.t('change_pw.err_current_required');
    }
    if (!this.novaSenha()) {
      erros['novasenha'] = this.locale.t('change_pw.err_new_required');
    } else if (!senhaAtendeRequisitos(this.novaSenha())) {
      erros['novasenha'] = this.locale.t('change_pw.err_new_requirements');
    } else if (this.senhaAtual() === this.novaSenha()) {
      erros['novasenha'] = this.locale.t('change_pw.err_new_same');
    }
    if (!this.senhasBatem()) {
      erros['confirmarsenha'] = this.locale.t('change_pw.err_confirm_mismatch');
    }
    if (Object.keys(erros).length > 0) {
      this.errosCampo.set(erros);
      return;
    }
    this.errosCampo.set({});

    this.trocando.set(true);
    this.auth.alterarSenha(this.senhaAtual(), this.novaSenha()).subscribe({
      next: () => {
        this.trocando.set(false);
        const nome = this.storage.usuario()?.nome;
        this.sucesso.set(
          nome
            ? this.locale.t('change_pw.success_with_name', { name: nome })
            : this.locale.t('change_pw.success'),
        );
        setTimeout(() => this.router.navigateByUrl('/app/configuracoes'), 1200);
      },
      error: (err: HttpErrorResponse) => {
        this.trocando.set(false);
        const fallback = this.locale.t('change_pw.err_fallback');
        const r = extrairProblemDetails(err, fallback);
        if (Object.keys(r.errosCampo).length > 0) {
          this.errosCampo.set(r.errosCampo);
        } else {
          this.erroGeral.set(r.mensagemGeral ?? fallback);
        }
      },
    });
  }
}
