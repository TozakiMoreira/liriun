import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Categoria, CategoriasService } from '../core/api/categorias.service';
import { LocaleService } from '../core/locale/locale.service';
import { ConfirmModalComponent } from './confirm-modal.component';
import { extrairProblemDetails } from './problem-details';

interface Confirmacao {
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  acao: () => void;
}

@Component({
  selector: 'app-categorias-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  template: `
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 grid place-items-center px-4 py-8 animate-fade-in"
      role="dialog"
      aria-modal="true"
      data-testid="categorias-modal-overlay"
      (click)="fechar()"
    >
      <div
        class="card-elev w-full max-w-[480px] max-h-[85vh] flex flex-col animate-scale-in"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 class="text-sm font-semibold flex items-center gap-2">
            <i class="fa-solid fa-tag text-accent text-[12px]"></i>
            {{ locale.t('configs.section_categorias') }}
          </h2>
          <button
            type="button"
            class="text-text-subtle hover:text-text text-base p-1 leading-none"
            data-testid="cat-modal-close"
            [attr.aria-label]="locale.t('detalhe.aria_fechar')"
            (click)="fechar()"
          >
            ×
          </button>
        </div>

        <div class="p-5 flex flex-col gap-3 overflow-y-auto">
          <div class="text-xs text-text-dim">
            {{ locale.t('configs.categorias_descricao') }}
          </div>

          <div class="flex flex-col" data-testid="cat-modal-list">
            @for (c of categorias(); track c.id) {
              <div
                class="grid grid-cols-[1fr_auto] items-center gap-3 py-2.5 px-3 border-b border-border last:border-b-0 hover:bg-bg-surface group focus-within:bg-bg-surface"
                [attr.data-testid]="'cat-modal-' + c.id"
              >
                @if (editandoCat() === c.id) {
                  <input
                    type="text"
                    class="input-base"
                    [(ngModel)]="novoNomeCat"
                    name="renomeio"
                    [attr.aria-label]="locale.t('configs.categorias_aria_novo_nome')"
                    (keydown.enter)="confirmarRenomearCategoria(c)"
                    (keydown.escape)="cancelarEdicaoCat()"
                  />
                  <div class="flex gap-1">
                    <button
                      type="button"
                      class="btn-secondary text-xs py-1.5 px-3"
                      (click)="confirmarRenomearCategoria(c)"
                    >
                      {{ locale.t('configs.salvar') }}
                    </button>
                    <button
                      type="button"
                      class="text-xs px-2 text-text-dim hover:text-text"
                      (click)="cancelarEdicaoCat()"
                    >
                      {{ locale.t('configs.cancelar') }}
                    </button>
                  </div>
                } @else {
                  <span class="text-[13px] font-medium">{{ c.nome }}</span>
                  <div class="flex gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      class="w-[26px] h-[26px] rounded grid place-items-center text-text-subtle hover:bg-bg-surface hover:text-text focus:outline-none focus:text-text focus:bg-bg-surface"
                      [attr.aria-label]="locale.t('configs.categorias_aria_renomear')"
                      [attr.title]="locale.t('configs.categorias_title_renomear')"
                      (click)="iniciarRenomearCategoria(c)"
                    >
                      <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button
                      type="button"
                      class="w-[26px] h-[26px] rounded grid place-items-center text-text-subtle hover:bg-danger/15 hover:text-danger focus:outline-none focus:text-danger focus:bg-danger/15"
                      [attr.aria-label]="locale.t('configs.categorias_aria_excluir')"
                      [attr.title]="locale.t('configs.categorias_title_excluir')"
                      (click)="pedirExcluirCategoria(c)"
                    >
                      <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                }
              </div>
            } @empty {
              <p class="text-text-subtle text-[13px] py-2">{{ locale.t('configs.categorias_nenhuma') }}</p>
            }
          </div>

          <div class="flex gap-2 mt-2">
            <input
              type="text"
              class="input-base flex-1"
              [placeholder]="locale.t('configs.categorias_placeholder')"
              data-testid="cat-modal-new-input"
              [(ngModel)]="novaCategoria"
              name="novaCat"
              [attr.aria-label]="locale.t('configs.categorias_aria_nova')"
              (keydown.enter)="adicionarCategoria()"
            />
            <button
              type="button"
              class="btn-secondary"
              data-testid="cat-modal-new-btn"
              (click)="adicionarCategoria()"
            >
              {{ locale.t('configs.categorias_adicionar') }}
            </button>
          </div>

          @if (erroCat()) {
            <p class="text-danger text-xs" data-testid="cat-modal-erro">{{ erroCat() }}</p>
          }
        </div>
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
  `,
})
export class CategoriasModalComponent implements OnInit {
  private readonly api = inject(CategoriasService);
  readonly locale = inject(LocaleService);

  @Output() fechado = new EventEmitter<void>();
  @Output() categoriasAtualizadas = new EventEmitter<Categoria[]>();

  readonly categorias = signal<Categoria[]>([]);
  readonly editandoCat = signal<string | null>(null);
  readonly erroCat = signal<string | null>(null);
  readonly confirmacao = signal<Confirmacao | null>(null);

  novaCategoria = '';
  novoNomeCat = '';

  constructor() {
    effect(() => {
      const _ = this.locale.locale();
      this.erroCat.set(null);
    });
  }

  ngOnInit(): void {
    this.carregar();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.fechar();
  }

  fechar(): void {
    this.fechado.emit();
  }

  carregar(): void {
    this.api.listar().subscribe({
      next: (lista) => {
        this.categorias.set(lista);
        this.categoriasAtualizadas.emit(lista);
      },
      error: () => {},
    });
  }

  adicionarCategoria(): void {
    const nome = this.novaCategoria.trim();
    if (!nome) return;
    this.erroCat.set(null);
    this.api.criar(nome).subscribe({
      next: (c) => {
        this.categorias.update((list) => [...list, c]);
        this.categoriasAtualizadas.emit(this.categorias());
        this.novaCategoria = '';
      },
      error: (err: HttpErrorResponse) => this.aplicarErro(err),
    });
  }

  iniciarRenomearCategoria(c: Categoria): void {
    this.editandoCat.set(c.id);
    this.novoNomeCat = c.nome;
    this.erroCat.set(null);
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
    this.api.atualizar(c.id, nome).subscribe({
      next: (atualizada) => {
        this.categorias.update((list) => list.map((x) => (x.id === c.id ? atualizada : x)));
        this.categoriasAtualizadas.emit(this.categorias());
        this.cancelarEdicaoCat();
      },
      error: (err: HttpErrorResponse) => this.aplicarErro(err),
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
    this.api.remover(c.id).subscribe({
      next: () => {
        this.categorias.update((list) => list.filter((x) => x.id !== c.id));
        this.categoriasAtualizadas.emit(this.categorias());
      },
      error: (err: HttpErrorResponse) => this.aplicarErro(err),
    });
  }

  executarConfirmacao(): void {
    const c = this.confirmacao();
    if (!c) return;
    this.confirmacao.set(null);
    c.acao();
  }

  private aplicarErro(err: HttpErrorResponse): void {
    const fallback = this.locale.t('errors.fallback');
    const r = extrairProblemDetails(err, fallback, this.locale.t('errors.sem_conexao'));
    const primeiroErroCampo = Object.values(r.errosCampo)[0];
    this.erroCat.set(primeiroErroCampo ?? r.mensagemGeral ?? fallback);
  }
}
