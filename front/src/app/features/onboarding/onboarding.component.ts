import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { CategoriasService } from '../../core/api/categorias.service';
import { TokenStorage } from '../../core/auth/token.storage';
import { LocaleService } from '../../core/locale/locale.service';
import { extrairProblemDetails } from '../../shared/problem-details';
import { BrandComponent } from '../../shared/brand.component';
import { LocaleSwitcherComponent } from '../../shared/locale-switcher.component';

const CATEGORIAS_PADRAO = ['Trabalho', 'Faculdade', 'Casa', 'Compras', 'Pessoal'];

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [FormsModule, BrandComponent, LocaleSwitcherComponent],
  template: `
    <main
      class="min-h-screen px-4 sm:px-6 pt-10 sm:pt-16 pb-24 sm:pb-32 bg-bg bg-accent-glow"
      data-testid="onboarding-page"
    >
      <div class="max-w-[560px] mx-auto flex flex-col gap-8">
        <div class="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Liriun"
            class="w-7 h-7 rounded-[7px] object-contain"
          />
          <div class="text-sm font-semibold tracking-tight"><app-brand /></div>
          <div class="ml-auto flex items-center gap-2">
            <app-locale-switcher />
            <div
              class="text-[11px] text-text-dim border border-border rounded-full px-2 py-0.5 tracking-wider uppercase"
              data-testid="onboarding-step"
            >
              {{ locale.t('onboarding.step_label') }}
            </div>
          </div>
        </div>

        <div>
          <h1
            class="text-2xl font-semibold tracking-tight mb-3"
            data-testid="onboarding-title"
          >
            {{ tituloOnboarding() }}
          </h1>
          <p class="text-text-dim leading-relaxed" data-testid="liriun-greeting">
            {{ locale.t('onboarding.body') }}
          </p>
        </div>

        <section class="card-elev p-5 flex flex-col gap-4" data-testid="onboarding-categories-section">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <div class="text-sm font-semibold">{{ locale.t('onboarding.your_categories') }}</div>
            </div>
            <div class="text-xs text-text-dim">
              {{ locale.t('onboarding.your_categories_hint') }}
            </div>
          </div>

          <div class="flex flex-wrap gap-2" data-testid="onboarding-categories-list">
            @for (cat of categorias(); track cat) {
              <div
                class="inline-flex items-center gap-1.5 pl-3 pr-2.5 py-1 bg-bg-surface border border-border-strong rounded text-[13px]"
              >
                {{ cat }}
                <button
                  type="button"
                  class="text-text-subtle hover:bg-danger/10 hover:text-danger rounded p-0.5 leading-none text-sm"
                  [attr.aria-label]="locale.t('onboarding.category_remove_aria')"
                  (click)="removerCategoria(cat)"
                >
                  ×
                </button>
              </div>
            }
          </div>

          <div class="flex gap-2">
            <input
              type="text"
              class="flex-1 bg-bg-surface border border-border text-text rounded px-3 py-2 text-[13px] focus:outline-none focus:border-accent"
              [placeholder]="locale.t('onboarding.category_placeholder')"
              data-testid="onboarding-category-input"
              [(ngModel)]="novaCategoria"
              name="novaCat"
              [attr.aria-label]="locale.t('onboarding.category_input_aria')"
              (keydown.enter)="adicionarCategoria()"
            />
            <button
              type="button"
              class="btn-secondary text-[13px] py-2"
              data-testid="onboarding-category-add-btn"
              (click)="adicionarCategoria()"
            >
              {{ locale.t('onboarding.category_add') }}
            </button>
          </div>
        </section>

        @if (erro()) {
          <p class="text-danger text-xs text-center" data-testid="onboarding-erro">
            {{ erro() }}
          </p>
        }

        <div class="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            class="text-xs text-text-dim hover:text-text bg-transparent border-none py-1.5"
            data-testid="onboarding-reset-btn"
            (click)="limparTudo()"
          >
            {{ locale.t('onboarding.reset') }}
          </button>

          <button
            type="button"
            class="btn-primary text-sm px-5 py-2.5"
            data-testid="onboarding-finish-btn"
            [disabled]="salvando()"
            (click)="finalizar()"
          >
            {{ salvando() ? locale.t('onboarding.saving') : locale.t('onboarding.finish') }}
          </button>
        </div>

        <div class="text-center text-text-subtle text-[11px] tracking-wider">
          {{ locale.t('onboarding.footer_note') }}
        </div>
      </div>
    </main>
  `,
})
export class OnboardingComponent implements OnInit {
  private readonly categoriasApi = inject(CategoriasService);
  private readonly storage = inject(TokenStorage);
  private readonly router = inject(Router);
  readonly locale = inject(LocaleService);

  readonly nomeUsuario = signal<string>(this.storage.usuario()?.nome ?? '');
  readonly categorias = signal<string[]>([...CATEGORIAS_PADRAO]);
  readonly salvando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly tituloOnboarding = computed(() => {
    const nome = this.nomeUsuario();
    return nome
      ? this.locale.t('onboarding.title_with_name', { name: nome })
      : this.locale.t('onboarding.title');
  });

  novaCategoria = '';

  ngOnInit(): void {
    this.categoriasApi.listar().subscribe({
      next: (cats) => {
        if (cats.length > 0) {
          this.router.navigateByUrl('/app/captura');
        }
      },
      error: () => of(null),
    });
  }

  adicionarCategoria(): void {
    const nome = this.novaCategoria.trim();
    if (!nome) return;
    if (this.categorias().some((c) => c.toLowerCase() === nome.toLowerCase())) {
      this.novaCategoria = '';
      return;
    }
    this.categorias.update((list) => [...list, nome]);
    this.novaCategoria = '';
  }

  removerCategoria(nome: string): void {
    this.categorias.update((list) => list.filter((c) => c !== nome));
  }

  limparTudo(): void {
    this.categorias.set([]);
  }

  finalizar(): void {
    if (this.salvando()) return;
    if (this.categorias().length === 0) {
      this.erro.set(this.locale.t('onboarding.err_no_categories'));
      return;
    }
    this.salvando.set(true);
    this.erro.set(null);

    const cats$ = this.categorias().map((nome) => this.categoriasApi.criar(nome));

    forkJoin(cats$).subscribe({
      next: () => {
        this.salvando.set(false);
        this.router.navigateByUrl('/app/visao-geral');
      },
      error: (err: HttpErrorResponse) => {
        this.salvando.set(false);
        const fallback = this.locale.t('onboarding.err_save_fallback');
        const r = extrairProblemDetails(err, fallback);
        const primeiroErroCampo = Object.values(r.errosCampo)[0];
        this.erro.set(primeiroErroCampo ?? r.mensagemGeral ?? fallback);
      },
    });
  }
}
