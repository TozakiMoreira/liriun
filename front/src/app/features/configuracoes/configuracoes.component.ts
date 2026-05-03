import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Categoria, CategoriasService } from '../../core/api/categorias.service';
import { AuthService } from '../../core/auth/auth.service';
import { TokenStorage } from '../../core/auth/token.storage';
import { AvatarComponent } from '../../shared/avatar.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal.component';
import { FotoPerfilModalComponent } from '../../shared/foto-perfil-modal.component';
import { extrairProblemDetails } from '../../shared/problem-details';

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
    FotoPerfilModalComponent,
  ],
  template: `
    <header class="flex items-center px-4 md:px-8 py-3.5 border-b border-border gap-4">
      <div class="flex items-center gap-2 text-[15px] text-text-dim">
        <i class="fa-solid fa-gear text-accent text-[12px]"></i>
        <strong class="text-text font-medium">Configurações</strong>
      </div>
    </header>

    <div class="flex-1 px-4 md:px-8 py-6 md:py-8 overflow-auto" data-testid="configuracoes-page">
      <div class="max-w-[760px] mx-auto flex flex-col gap-8">
        <section class="flex flex-col gap-3" data-testid="section-perfil-wrap">
          <h2 class="text-xl font-semibold tracking-tight">Perfil</h2>
        <section class="card-elev p-5 flex flex-col gap-4" data-testid="section-perfil">
          <div class="flex items-start justify-between gap-3">
            <div class="flex flex-col gap-0.5">
              <div class="text-xs text-text-dim">
                Seu nome e email. Mude quando quiser.
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
                Editar perfil
              </button>
            }
          </div>

          @if (editandoPerfil()) {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="field-label" for="perfil-nome">Nome</label>
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
                <label class="field-label" for="perfil-email">Email</label>
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
                Cancelar
              </button>
              <button
                type="button"
                class="btn-primary text-[13px] px-4 py-2"
                data-testid="perfil-salvar"
                (click)="salvarPerfil()"
                [disabled]="salvandoPerfil()"
              >
                {{ salvandoPerfil() ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          } @else {
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <button
                type="button"
                class="relative group rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-elev"
                data-testid="perfil-foto-btn"
                aria-label="Trocar foto de perfil"
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
                    Nome
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
                    Email
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
                Quer trocar sua senha?
              </div>
              <a
                routerLink="/app/configuracoes/alterar-senha"
                class="btn-secondary text-[13px] px-4 py-2 flex items-center gap-1.5"
                data-testid="perfil-alterar-senha-btn"
              >
                <i class="fa-solid fa-key text-[10px]"></i>
                Alterar senha
              </a>
            </div>
          }
        </section>
        </section>

        <section class="flex flex-col gap-3" data-testid="section-categorias-wrap">
          <h2 class="text-xl font-semibold tracking-tight">Categorias</h2>
        <section class="card-elev p-5 flex flex-col gap-3" data-testid="section-categorias">
          <div class="flex flex-col gap-0.5">
            <div class="text-xs text-text-dim">
              Não dá pra excluir uma categoria com tarefas pendentes.
            </div>
          </div>

          <div class="flex flex-col" data-testid="categorias-list">
            @for (c of categorias(); track c.id) {
              <div
                class="grid grid-cols-[1fr_auto] items-center gap-3 py-2.5 px-3 border-b border-border last:border-b-0 hover:bg-bg-surface group focus-within:bg-bg-surface"
                [attr.data-testid]="'cat-' + c.id"
              >
                @if (editandoCat() === c.id) {
                  <input
                    type="text"
                    class="input-base"
                    [(ngModel)]="novoNomeCat"
                    name="renomeio"
                    aria-label="Novo nome da categoria"
                    (keydown.enter)="confirmarRenomearCategoria(c)"
                    (keydown.escape)="cancelarEdicaoCat()"
                  />
                  <div class="flex gap-1">
                    <button
                      type="button"
                      class="btn-secondary text-xs py-1.5 px-3"
                      (click)="confirmarRenomearCategoria(c)"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      class="text-xs px-2 text-text-dim hover:text-text"
                      (click)="cancelarEdicaoCat()"
                    >
                      Cancelar
                    </button>
                  </div>
                } @else {
                  <span class="text-[13px] font-medium">{{ c.nome }}</span>
                  <div class="flex gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      class="w-[26px] h-[26px] rounded grid place-items-center text-text-subtle hover:bg-bg-surface hover:text-text focus:outline-none focus:text-text focus:bg-bg-surface"
                      aria-label="Renomear categoria"
                      title="Renomear"
                      (click)="iniciarRenomearCategoria(c)"
                    >
                      <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button
                      type="button"
                      class="w-[26px] h-[26px] rounded grid place-items-center text-text-subtle hover:bg-danger/15 hover:text-danger focus:outline-none focus:text-danger focus:bg-danger/15"
                      aria-label="Excluir categoria"
                      title="Excluir"
                      (click)="pedirExcluirCategoria(c)"
                    >
                      <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                }
              </div>
            } @empty {
              <p class="text-text-subtle text-[13px] py-2">Nenhuma categoria.</p>
            }
          </div>

          <div class="flex gap-2">
            <input
              type="text"
              class="input-base flex-1"
              placeholder="Nova categoria (ex: Academia, Leitura)"
              data-testid="cat-new-input"
              [(ngModel)]="novaCategoria"
              name="novaCat"
              aria-label="Nome da nova categoria"
              (keydown.enter)="adicionarCategoria()"
            />
            <button
              type="button"
              class="btn-secondary"
              data-testid="cat-new-btn"
              (click)="adicionarCategoria()"
            >
              Adicionar
            </button>
          </div>

          @if (erroCat()) {
            <p class="text-danger text-xs" data-testid="cat-erro">{{ erroCat() }}</p>
          }
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
  `,
})
export class ConfiguracoesComponent implements OnInit {
  private readonly catsApi = inject(CategoriasService);
  private readonly auth = inject(AuthService);
  private readonly storage = inject(TokenStorage);

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
        this.sucessoPerfil.set('Perfil atualizado.');
      },
      error: (err: HttpErrorResponse) => {
        this.salvandoPerfil.set(false);
        const r = extrairProblemDetails(err, 'Não consegui atualizar.');
        if (Object.keys(r.errosCampo).length > 0) {
          this.errosPerfilCampo.set(r.errosCampo);
        } else {
          this.erroPerfilGeral.set(r.mensagemGeral ?? 'Não consegui atualizar.');
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
        const r = extrairProblemDetails(err, 'Não consegui salvar a foto.');
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
        const r = extrairProblemDetails(err, 'Não consegui remover a foto.');
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
      titulo: 'Excluir categoria',
      mensagem: `Excluir "${c.nome}"? Não dá pra desfazer.`,
      textoConfirmar: 'Excluir',
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
    const r = extrairProblemDetails(err, fallback);
    const primeiroErroCampo = Object.values(r.errosCampo)[0];
    this.erroCat.set(primeiroErroCampo ?? r.mensagemGeral ?? fallback);
  }

  executarConfirmacao(): void {
    const c = this.confirmacao();
    if (!c) return;
    this.confirmacao.set(null);
    c.acao();
  }
}
