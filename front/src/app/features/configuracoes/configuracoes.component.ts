import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Categoria, CategoriasService } from '../../core/api/categorias.service';
import { AuthService } from '../../core/auth/auth.service';
import { TokenStorage } from '../../core/auth/token.storage';
import { LocaleService } from '../../core/locale/locale.service';
import { ThemeService } from '../../core/theme/theme.service';
import { AvatarComponent } from '../../shared/avatar.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal.component';
import { ExcluirContaModalComponent } from '../../shared/excluir-conta-modal.component';
import { FotoPerfilModalComponent } from '../../shared/foto-perfil-modal.component';
import { extrairProblemDetails } from '../../shared/problem-details';
import { PageHeaderService } from '../../core/layout/page-header.service';

interface Confirmacao {
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  acao: () => void;
}

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AvatarComponent,
    ConfirmModalComponent,
    ExcluirContaModalComponent,
    FotoPerfilModalComponent,
  ],
  template: `
    <header class="md:hidden flex items-center px-4 py-3.5 border-b border-border gap-4">
      <div class="flex items-center gap-2 text-[15px] text-text-dim">
        <i class="fa-solid fa-gear text-accent text-[12px]"></i>
        <strong class="text-text font-medium">{{ locale.t('page_title.settings') }}</strong>
      </div>
    </header>

    <div class="flex-1 px-4 md:px-8 py-6 md:py-8 overflow-auto" data-testid="configuracoes-page">
      <div class="max-w-[760px] mx-auto flex flex-col gap-8">
        <section class="flex flex-col gap-3" data-testid="section-perfil-wrap">
          <h2 class="text-xl font-semibold tracking-tight">{{ locale.t('configs.section_perfil') }}</h2>
        <section class="card-elev p-5 flex flex-col gap-4" data-testid="section-perfil">
          <div class="flex items-start justify-between gap-3">
            <div class="flex flex-col gap-0.5">
              <div class="text-xs text-text-dim">
                {{ locale.t('configs.perfil_descricao') }}
              </div>
            </div>
            @if (!editandoPerfil()) {
              <button
                type="button"
                class="btn-secondary text-[12px] px-3 py-1.5 flex items-center gap-1.5"
                data-testid="perfil-edit-btn"
                (click)="iniciarEdicaoPerfil()"
              >
                <i class="fa-solid fa-pen text-[10px]"></i>
                {{ locale.t('configs.perfil_editar_btn') }}
              </button>
            }
          </div>

          @if (editandoPerfil()) {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="field-label" for="perfil-nome">{{ locale.t('configs.perfil_nome') }}</label>
                <input
                  id="perfil-nome"
                  type="text"
                  class="input-base"
                  data-testid="perfil-nome-input"
                  [ngModel]="perfilNome()"
                  (ngModelChange)="perfilNome.set($event)"
                  name="perfilNome"
                />
                @if (erroPerfilNome()) {
                  <p class="text-danger text-xs" data-testid="perfil-nome-erro">
                    {{ erroPerfilNome() }}
                  </p>
                }
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="field-label" for="perfil-email">{{ locale.t('configs.perfil_email') }}</label>
                <input
                  id="perfil-email"
                  type="email"
                  class="input-base"
                  data-testid="perfil-email-input"
                  [ngModel]="perfilEmail()"
                  (ngModelChange)="perfilEmail.set($event)"
                  name="perfilEmail"
                />
                @if (erroPerfilEmail()) {
                  <p class="text-danger text-xs" data-testid="perfil-email-erro">
                    {{ erroPerfilEmail() }}
                  </p>
                }
              </div>
            </div>

            @if (sucessoPerfil()) {
              <p class="text-emerald-400 text-xs" data-testid="perfil-sucesso">
                {{ sucessoPerfil() }}
              </p>
            }
            @if (erroPerfilGeral()) {
              <p class="text-danger text-xs" data-testid="perfil-erro-geral">
                {{ erroPerfilGeral() }}
              </p>
            }

            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="btn-secondary text-[13px] px-4 py-2"
                data-testid="perfil-cancelar"
                (click)="cancelarEdicaoPerfil()"
                [disabled]="salvandoPerfil()"
              >
                {{ locale.t('configs.cancelar') }}
              </button>
              <button
                type="button"
                class="btn-primary text-[13px] px-4 py-2"
                data-testid="perfil-salvar"
                (click)="salvarPerfil()"
                [disabled]="salvandoPerfil()"
              >
                {{ salvandoPerfil() ? locale.t('configs.salvando') : locale.t('configs.salvar') }}
              </button>
            </div>
          } @else {
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <button
                type="button"
                class="relative group rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-elev"
                data-testid="perfil-foto-btn"
                [attr.aria-label]="locale.t('configs.foto_aria_trocar')"
                (click)="abrirFotoModal()"
              >
                <app-avatar
                  [nome]="usuario()?.nome ?? ''"
                  [fotoUrl]="usuario()?.fotoUrl ?? null"
                  [size]="96"
                  [alt]="(usuario()?.nome ?? 'Avatar') + ' — clique pra trocar foto'"
                />
                <div
                  class="absolute inset-0 rounded-full bg-black/55 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity grid place-items-center"
                >
                  <div class="flex flex-col items-center gap-1 text-white">
                    <i class="fa-solid fa-camera text-base"></i>
                    <span class="text-[10px] font-medium tracking-wider uppercase">
                      Trocar
                    </span>
                  </div>
                </div>
              </button>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full">
                <div class="flex flex-col gap-1">
                  <div class="text-[11px] font-medium text-text-subtle uppercase tracking-wider">
                    {{ locale.t('configs.perfil_nome') }}
                  </div>
                  <div
                    class="text-[13px] px-3 py-2 bg-bg-surface border border-border rounded"
                    data-testid="perfil-nome"
                  >
                    {{ usuario()?.nome }}
                  </div>
                </div>
                <div class="flex flex-col gap-1">
                  <div class="text-[11px] font-medium text-text-subtle uppercase tracking-wider">
                    {{ locale.t('configs.perfil_email') }}
                  </div>
                  <div
                    class="text-[13px] px-3 py-2 bg-bg-surface border border-border rounded"
                    data-testid="perfil-email"
                  >
                    {{ usuario()?.email }}
                  </div>
                </div>
              </div>
            </div>

            @if (sucessoPerfil()) {
              <p class="text-emerald-400 text-xs" data-testid="perfil-sucesso">
                {{ sucessoPerfil() }}
              </p>
            }

            <div class="border-t border-border pt-4 flex items-center justify-between gap-3">
              <div class="text-xs text-text-dim">
                {{ locale.t('configs.perfil_quer_trocar_senha') }}
              </div>
              <a
                routerLink="/app/configuracoes/alterar-senha"
                class="btn-secondary text-[13px] px-4 py-2 flex items-center gap-1.5"
                data-testid="perfil-alterar-senha-btn"
              >
                <i class="fa-solid fa-key text-[10px]"></i>
                {{ locale.t('configs.alterar_senha') }}
              </a>
            </div>
          }
        </section>
        </section>


        <section class="flex flex-col gap-3" data-testid="section-aparencia-wrap">
          <h2 class="text-xl font-semibold tracking-tight">{{ locale.t('configs.section_aparencia') }}</h2>
          <section class="card-elev p-5 flex flex-col gap-4" data-testid="section-aparencia">
            <div class="text-xs text-text-dim">
              {{ locale.t('configs.aparencia_descricao') }}
            </div>
            <div class="rounded-lg border border-border overflow-hidden divide-y divide-border">
              <button
                type="button"
                class="w-full px-4 py-3 flex items-center gap-3 transition-colors text-text-dim hover:text-text text-left"
                [class.bg-accent]="theme.theme() === 'light'"
                [class.bg-opacity-10]="theme.theme() === 'light'"
                [class.!text-text]="theme.theme() === 'light'"
                data-testid="theme-light-btn"
                (click)="theme.definir('light')"
              >
                <i class="fa-solid fa-sun text-amber-400 text-[15px] w-5 text-center shrink-0"></i>
                <span class="text-[13px] font-medium flex-1">{{ locale.t('configs.aparencia_claro') }}</span>
                @if (theme.theme() === 'light') {
                  <i class="fa-solid fa-check text-accent text-[12px]"></i>
                }
              </button>
              <button
                type="button"
                class="w-full px-4 py-3 flex items-center gap-3 transition-colors text-text-dim hover:text-text text-left"
                [class.bg-accent]="theme.theme() === 'dark'"
                [class.bg-opacity-10]="theme.theme() === 'dark'"
                [class.!text-text]="theme.theme() === 'dark'"
                data-testid="theme-dark-btn"
                (click)="theme.definir('dark')"
              >
                <i class="fa-solid fa-moon text-sky-300 text-[15px] w-5 text-center shrink-0"></i>
                <span class="text-[13px] font-medium flex-1">{{ locale.t('configs.aparencia_escuro') }}</span>
                @if (theme.theme() === 'dark') {
                  <i class="fa-solid fa-check text-accent text-[12px]"></i>
                }
              </button>
            </div>
            <label
              class="flex items-center gap-2 text-[12px] text-text-dim cursor-pointer select-none self-start"
              data-testid="theme-seguir-sistema-label"
            >
              <input
                type="checkbox"
                class="h-4 w-4 cursor-pointer accent-[var(--accent)]"
                data-testid="theme-seguir-sistema-check"
                [checked]="theme.seguindoSistema()"
                (change)="theme.alternarSeguirSistema()"
              />
              <span>{{ locale.t('configs.aparencia_seguir_sistema_label') }}</span>
            </label>
          </section>
        </section>

        <section class="flex flex-col gap-3" data-testid="section-idioma-wrap">
          <h2 class="text-xl font-semibold tracking-tight">{{ locale.t('configs.section_idioma') }}</h2>
          <section class="card-elev p-5 flex flex-col gap-4" data-testid="section-idioma">
            <div class="text-xs text-text-dim">
              {{ locale.t('configs.idioma_descricao') }}
            </div>
            <div class="rounded-lg border border-border overflow-hidden divide-y divide-border">
              <button
                type="button"
                class="w-full px-4 py-3 flex items-center gap-3 transition-colors text-text-dim hover:text-text text-left"
                [class.bg-accent]="locale.locale() === 'pt'"
                [class.bg-opacity-10]="locale.locale() === 'pt'"
                [class.!text-text]="locale.locale() === 'pt'"
                data-testid="locale-pt-btn"
                (click)="locale.setLocale('pt')"
              >
                <span class="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">PT-BR</span>
                <span class="text-[13px] font-medium flex-1">{{ locale.t('configs.idioma_pt') }}</span>
                @if (locale.locale() === 'pt') {
                  <i class="fa-solid fa-check text-accent text-[12px]"></i>
                }
              </button>
              <button
                type="button"
                class="w-full px-4 py-3 flex items-center gap-3 transition-colors text-text-dim hover:text-text text-left"
                [class.bg-accent]="locale.locale() === 'en'"
                [class.bg-opacity-10]="locale.locale() === 'en'"
                [class.!text-text]="locale.locale() === 'en'"
                data-testid="locale-en-btn"
                (click)="locale.setLocale('en')"
              >
                <span class="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 shrink-0">US</span>
                <span class="text-[13px] font-medium flex-1">{{ locale.t('configs.idioma_en') }}</span>
                @if (locale.locale() === 'en') {
                  <i class="fa-solid fa-check text-accent text-[12px]"></i>
                }
              </button>
            </div>
          </section>
        </section>

        <section class="flex flex-col gap-3" data-testid="section-legal-wrap">
          <h2 class="text-xl font-semibold tracking-tight">{{ locale.t('configs.section_legal') }}</h2>
          <section class="card-elev p-5 flex flex-col gap-3" data-testid="section-legal">
            <div class="text-xs text-text-dim">
              {{ locale.t('configs.legal_descricao') }}
            </div>
            <div class="rounded-lg border border-border overflow-hidden divide-y divide-border">
              <a
                routerLink="/termos-uso"
                target="_blank"
                rel="noopener"
                class="w-full px-4 py-3 flex items-center gap-3 transition-colors text-text-dim hover:text-text"
                data-testid="legal-termos-link"
              >
                <i class="fa-solid fa-file-contract text-accent text-[14px] w-5 text-center shrink-0"></i>
                <span class="text-[13px] font-medium flex-1">{{ locale.t('configs.legal_termos') }}</span>
                <i class="fa-solid fa-arrow-up-right-from-square text-[10px] text-text-subtle"></i>
              </a>
              <a
                routerLink="/politica-privacidade"
                target="_blank"
                rel="noopener"
                class="w-full px-4 py-3 flex items-center gap-3 transition-colors text-text-dim hover:text-text"
                data-testid="legal-privacidade-link"
              >
                <i class="fa-solid fa-shield-halved text-accent text-[14px] w-5 text-center shrink-0"></i>
                <span class="text-[13px] font-medium flex-1">{{ locale.t('configs.legal_privacidade') }}</span>
                <i class="fa-solid fa-arrow-up-right-from-square text-[10px] text-text-subtle"></i>
              </a>
            </div>
          </section>
        </section>

        <section class="flex flex-col gap-3" data-testid="section-zona-perigosa-wrap">
          <h2 class="text-xl font-semibold tracking-tight text-danger">{{ locale.t('configs.section_zona_perigosa') }}</h2>
          <section
            class="card-elev p-5 flex flex-col gap-4 border-danger/30"
            data-testid="section-zona-perigosa"
          >
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="flex flex-col gap-0.5">
                <div class="text-[13px] font-medium text-text">{{ locale.t('configs.excluir_conta') }}</div>
                <div class="text-xs text-text-dim leading-relaxed">
                  {{ locale.t('configs.excluir_conta_descricao') }}
                </div>
              </div>
              <button
                type="button"
                class="text-[13px] px-4 py-2 rounded font-medium bg-danger/10 text-danger hover:bg-danger/20 border border-danger/30 self-start sm:self-auto"
                data-testid="excluir-conta-btn"
                (click)="abrirExcluirContaModal()"
              >
                {{ locale.t('configs.excluir_conta_btn') }}
              </button>
            </div>
          </section>
        </section>
      </div>
    </div>

    @if (confirmacao(); as c) {
      <app-confirm-modal
        [titulo]="c.titulo"
        [mensagem]="c.mensagem"
        [textoConfirmar]="c.textoConfirmar"
        [perigo]="true"
        (confirmado)="executarConfirmacao()"
        (cancelado)="confirmacao.set(null)"
      ></app-confirm-modal>
    }

    @if (fotoModalAberto()) {
      <app-foto-perfil-modal
        [nome]="usuario()?.nome ?? ''"
        [fotoAtual]="usuario()?.fotoUrl ?? null"
        [processandoExterno]="salvandoFoto()"
        (salvar)="salvarFoto($event)"
        (remover)="removerFoto()"
        (cancelado)="fotoModalAberto.set(false)"
      ></app-foto-perfil-modal>
    }

    @if (excluirContaModalAberto()) {
      <app-excluir-conta-modal
        [processandoExterno]="excluindoConta()"
        [erroExterno]="erroExcluirConta()"
        (confirmar)="confirmarExcluirConta($event)"
        (cancelado)="fecharExcluirContaModal()"
      ></app-excluir-conta-modal>
    }
  `,
})
export class ConfiguracoesComponent implements OnInit, OnDestroy {
  private readonly catsApi = inject(CategoriasService);
  private readonly auth = inject(AuthService);
  private readonly storage = inject(TokenStorage);
  private readonly pageHeader = inject(PageHeaderService);
  private readonly router = inject(Router);
  readonly theme = inject(ThemeService);
  readonly locale = inject(LocaleService);

  constructor() {
    this.pageHeader.set({
      titulo: this.locale.t('page_title.settings'),
      iconeClasse: 'fa-solid fa-gear text-accent text-[12px]',
    });
    effect(() => {
      const _ = this.locale.locale();
      this.erroCat.set(null);
      this.erroPerfilGeral.set(null);
      this.sucessoPerfil.set(null);
      this.erroExcluirConta.set(null);
    });
  }

  ngOnDestroy(): void {
    this.pageHeader.limpar();
  }

  readonly usuario = this.storage.usuario;
  readonly categorias = signal<Categoria[]>([]);
  readonly editandoCat = signal<string | null>(null);
  readonly erroCat = signal<string | null>(null);
  readonly confirmacao = signal<Confirmacao | null>(null);

  novaCategoria = '';
  novoNomeCat = '';

  // Perfil
  readonly editandoPerfil = signal(false);
  readonly perfilNome = signal('');
  readonly perfilEmail = signal('');
  readonly salvandoPerfil = signal(false);
  readonly errosPerfilCampo = signal<Record<string, string>>({});
  readonly erroPerfilGeral = signal<string | null>(null);
  readonly sucessoPerfil = signal<string | null>(null);

  readonly erroPerfilNome = computed(() => this.errosPerfilCampo()['nome'] ?? null);
  readonly erroPerfilEmail = computed(() => this.errosPerfilCampo()['email'] ?? null);

  // Foto de perfil
  readonly fotoModalAberto = signal(false);
  readonly salvandoFoto = signal(false);

  // Excluir conta
  readonly excluirContaModalAberto = signal(false);
  readonly excluindoConta = signal(false);
  readonly erroExcluirConta = signal<string | null>(null);

  ngOnInit(): void {
    this.catsApi.listar().subscribe({
      next: (cats) => this.categorias.set(cats),
      error: (err: HttpErrorResponse) =>
        this.aplicarErroCat(err, 'Não consegui carregar suas categorias.'),
    });
  }

  // ===== Perfil =====
  iniciarEdicaoPerfil(): void {
    const u = this.usuario();
    this.perfilNome.set(u?.nome ?? '');
    this.perfilEmail.set(u?.email ?? '');
    this.errosPerfilCampo.set({});
    this.erroPerfilGeral.set(null);
    this.sucessoPerfil.set(null);
    this.editandoPerfil.set(true);
  }

  cancelarEdicaoPerfil(): void {
    if (this.salvandoPerfil()) return;
    this.editandoPerfil.set(false);
    this.errosPerfilCampo.set({});
    this.erroPerfilGeral.set(null);
  }

  salvarPerfil(): void {
    if (this.salvandoPerfil()) return;
    const nome = this.perfilNome().trim();
    const email = this.perfilEmail().trim();
    const u = this.usuario();

    const erros: Record<string, string> = {};
    if (!nome) erros['nome'] = 'Preciso de um nome.';
    if (!email) {
      erros['email'] = 'Email é obrigatório.';
    } else if (!email.includes('@') || !email.includes('.')) {
      erros['email'] = 'Esse email não parece válido.';
    }
    if (Object.keys(erros).length > 0) {
      this.errosPerfilCampo.set(erros);
      return;
    }

    if (u && nome === u.nome && email === u.email) {
      this.editandoPerfil.set(false);
      return;
    }

    this.errosPerfilCampo.set({});
    this.erroPerfilGeral.set(null);
    this.salvandoPerfil.set(true);

    this.auth.atualizarPerfil(nome, email).subscribe({
      next: () => {
        this.salvandoPerfil.set(false);
        this.editandoPerfil.set(false);
        this.sucessoPerfil.set(this.locale.t('configs.perfil_atualizado'));
      },
      error: (err: HttpErrorResponse) => {
        this.salvandoPerfil.set(false);
        const fallback = this.locale.t('errors.fallback');
        const r = extrairProblemDetails(err, fallback, this.locale.t('errors.sem_conexao'));
        if (Object.keys(r.errosCampo).length > 0) {
          this.errosPerfilCampo.set(r.errosCampo);
        } else {
          this.erroPerfilGeral.set(r.mensagemGeral ?? fallback);
        }
      },
    });
  }

  // ===== Foto de perfil =====
  abrirFotoModal(): void {
    this.sucessoPerfil.set(null);
    this.fotoModalAberto.set(true);
  }

  salvarFoto(fotoUrl: string): void {
    if (this.salvandoFoto()) return;
    this.salvandoFoto.set(true);
    this.auth.atualizarFotoPerfil(fotoUrl).subscribe({
      next: () => {
        this.salvandoFoto.set(false);
        this.fotoModalAberto.set(false);
        this.sucessoPerfil.set('Foto atualizada.');
      },
      error: (err: HttpErrorResponse) => {
        this.salvandoFoto.set(false);
        const r = extrairProblemDetails(err, this.locale.t('errors.fallback'), this.locale.t('errors.sem_conexao'));
        const primeiro = Object.values(r.errosCampo)[0];
        this.erroPerfilGeral.set(primeiro ?? r.mensagemGeral ?? 'Não consegui salvar a foto.');
        this.fotoModalAberto.set(false);
      },
    });
  }

  removerFoto(): void {
    if (this.salvandoFoto()) return;
    this.salvandoFoto.set(true);
    this.auth.atualizarFotoPerfil(null).subscribe({
      next: () => {
        this.salvandoFoto.set(false);
        this.fotoModalAberto.set(false);
        this.sucessoPerfil.set('Foto removida.');
      },
      error: (err: HttpErrorResponse) => {
        this.salvandoFoto.set(false);
        const r = extrairProblemDetails(err, this.locale.t('errors.fallback'), this.locale.t('errors.sem_conexao'));
        this.erroPerfilGeral.set(r.mensagemGeral ?? 'Não consegui remover a foto.');
        this.fotoModalAberto.set(false);
      },
    });
  }

  // ===== Categorias =====
  adicionarCategoria(): void {
    const nome = this.novaCategoria.trim();
    if (!nome) return;
    this.erroCat.set(null);
    this.catsApi.criar(nome).subscribe({
      next: (c) => {
        this.categorias.update((list) => [...list, c].sort((a, b) => a.nome.localeCompare(b.nome)));
        this.novaCategoria = '';
      },
      error: (err: HttpErrorResponse) => this.aplicarErroCat(err, 'Não consegui criar.'),
    });
  }

  iniciarRenomearCategoria(c: Categoria): void {
    this.editandoCat.set(c.id);
    this.novoNomeCat = c.nome;
  }

  cancelarEdicaoCat(): void {
    this.editandoCat.set(null);
    this.novoNomeCat = '';
  }

  confirmarRenomearCategoria(c: Categoria): void {
    const nome = this.novoNomeCat.trim();
    if (!nome || nome === c.nome) {
      this.cancelarEdicaoCat();
      return;
    }
    this.catsApi.atualizar(c.id, nome).subscribe({
      next: (atual) => {
        this.categorias.update((list) =>
          list.map((x) => (x.id === c.id ? atual : x)).sort((a, b) => a.nome.localeCompare(b.nome)),
        );
        this.cancelarEdicaoCat();
      },
      error: (err: HttpErrorResponse) => this.aplicarErroCat(err, 'Não consegui renomear.'),
    });
  }

  pedirExcluirCategoria(c: Categoria): void {
    this.confirmacao.set({
      titulo: this.locale.t('configs.confirma_excluir_categoria_titulo'),
      mensagem: this.locale.t('configs.confirma_excluir_categoria_msg', { nome: c.nome }),
      textoConfirmar: this.locale.t('configs.excluir'),
      acao: () => this.excluirCategoria(c),
    });
  }

  private excluirCategoria(c: Categoria): void {
    this.erroCat.set(null);
    this.catsApi.remover(c.id).subscribe({
      next: () => this.categorias.update((list) => list.filter((x) => x.id !== c.id)),
      error: (err: HttpErrorResponse) => this.aplicarErroCat(err, 'Não consegui excluir.'),
    });
  }

  private aplicarErroCat(err: HttpErrorResponse, fallback: string): void {
    const r = extrairProblemDetails(err, fallback, this.locale.t('errors.sem_conexao'));
    const primeiroErroCampo = Object.values(r.errosCampo)[0];
    this.erroCat.set(primeiroErroCampo ?? r.mensagemGeral ?? fallback);
  }

  executarConfirmacao(): void {
    const c = this.confirmacao();
    if (!c) return;
    this.confirmacao.set(null);
    c.acao();
  }

  // ===== Excluir conta =====
  abrirExcluirContaModal(): void {
    this.erroExcluirConta.set(null);
    this.excluirContaModalAberto.set(true);
  }

  fecharExcluirContaModal(): void {
    if (this.excluindoConta()) return;
    this.excluirContaModalAberto.set(false);
    this.erroExcluirConta.set(null);
  }

  confirmarExcluirConta(senha: string): void {
    if (this.excluindoConta()) return;
    this.erroExcluirConta.set(null);
    this.excluindoConta.set(true);
    this.auth.excluirConta(senha).subscribe({
      next: () => {
        this.excluindoConta.set(false);
        this.excluirContaModalAberto.set(false);
        this.router.navigateByUrl('/');
      },
      error: (err: HttpErrorResponse) => {
        this.excluindoConta.set(false);
        const r = extrairProblemDetails(err, this.locale.t('errors.fallback'), this.locale.t('errors.sem_conexao'));
        const primeiro = Object.values(r.errosCampo)[0];
        this.erroExcluirConta.set(primeiro ?? r.mensagemGeral ?? 'Não consegui excluir sua conta.');
      },
    });
  }
}
