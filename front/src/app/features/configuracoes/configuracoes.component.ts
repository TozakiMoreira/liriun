import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Categoria, CategoriasService } from '../../core/api/categorias.service';
import { Prazo, PrazosService } from '../../core/api/prazos.service';
import { TokenStorage } from '../../core/auth/token.storage';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="flex items-center px-4 md:px-8 py-3.5 border-b border-border gap-4">
      <div class="flex items-center gap-2 text-[13px] text-text-dim">
        <i class="fa-solid fa-gear text-accent text-[11px]"></i>
        <strong class="text-text font-medium">Configurações</strong>
      </div>
    </header>

    <div class="flex-1 px-4 md:px-8 py-6 md:py-8 overflow-auto" data-testid="configuracoes-page">
      <div class="max-w-[760px] flex flex-col gap-7">
        <div class="flex flex-col gap-1">
          <h1 class="text-xl font-semibold tracking-tight">Configurações</h1>
          <p class="text-text-dim text-[13px]">
            Ajuste suas categorias e prazos. Eu uso essas listas quando organizo suas tarefas.
          </p>
        </div>

        <section class="card-elev p-5 flex flex-col gap-3" data-testid="section-conta">
          <div class="flex flex-col gap-0.5">
            <div class="text-sm font-semibold">Sua conta</div>
            <div class="text-xs text-text-dim">
              Só leitura por enquanto. Edição de conta chega em uma próxima versão.
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <div
                class="text-[11px] font-medium text-text-subtle uppercase tracking-wider"
              >
                Nome
              </div>
              <div
                class="text-[13px] px-3 py-2 bg-[#16181c] border border-border rounded"
                data-testid="account-name"
              >
                {{ usuario()?.nome }}
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <div
                class="text-[11px] font-medium text-text-subtle uppercase tracking-wider"
              >
                Email
              </div>
              <div
                class="text-[13px] px-3 py-2 bg-[#16181c] border border-border rounded"
                data-testid="account-email"
              >
                {{ usuario()?.email }}
              </div>
            </div>
          </div>
        </section>

        <section class="card-elev p-5 flex flex-col gap-3" data-testid="section-categorias">
          <div class="flex flex-col gap-0.5">
            <div class="text-sm font-semibold">Categorias</div>
            <div class="text-xs text-text-dim">
              Não dá pra excluir uma categoria com tarefas pendentes.
            </div>
          </div>

          <div class="flex flex-col" data-testid="categorias-list">
            @for (c of categorias(); track c.id) {
              <div
                class="grid grid-cols-[1fr_auto] items-center gap-3 py-2.5 px-3 border-b border-border last:border-b-0 hover:bg-[#16181c] group"
                [attr.data-testid]="'cat-' + c.id"
              >
                @if (editandoCat() === c.id) {
                  <input
                    type="text"
                    class="input-base"
                    [(ngModel)]="novoNomeCat"
                    name="renomeio"
                    (keydown.enter)="confirmarRenomearCategoria(c)"
                    (keydown.escape)="cancelarEdicao()"
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
                      (click)="cancelarEdicao()"
                    >
                      Cancelar
                    </button>
                  </div>
                } @else {
                  <span class="text-[13px] font-medium">{{ c.nome }}</span>
                  <div class="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      class="w-[26px] h-[26px] rounded grid place-items-center text-text-subtle hover:bg-[#16181c] hover:text-text"
                      title="Renomear"
                      (click)="iniciarRenomearCategoria(c)"
                    >
                      <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button
                      type="button"
                      class="w-[26px] h-[26px] rounded grid place-items-center text-text-subtle hover:bg-danger/15 hover:text-danger"
                      title="Excluir"
                      (click)="excluirCategoria(c)"
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
            <p class="text-danger text-xs">{{ erroCat() }}</p>
          }
        </section>

        <section class="card-elev p-5 flex flex-col gap-3" data-testid="section-prazos">
          <div class="flex flex-col gap-0.5">
            <div class="text-sm font-semibold">Prazos</div>
            <div class="text-xs text-text-dim">
              Durações nomeadas. Não dá pra excluir um prazo com tarefas pendentes.
            </div>
          </div>

          <div class="flex flex-col" data-testid="prazos-list">
            @for (p of prazos(); track p.id) {
              <div
                class="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2.5 px-3 border-b border-border last:border-b-0 hover:bg-[#16181c] group"
                [attr.data-testid]="'prazo-' + p.id"
              >
                <span class="text-[13px] font-medium">{{ p.nome }}</span>
                <span class="text-xs text-text-dim">{{ formatarDuracao(p.duracaoDias) }}</span>
                <div class="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    class="w-[26px] h-[26px] rounded grid place-items-center text-text-subtle hover:bg-danger/15 hover:text-danger"
                    title="Excluir"
                    (click)="excluirPrazo(p)"
                  >
                    <i class="fa-solid fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
            } @empty {
              <p class="text-text-subtle text-[13px] py-2">Nenhum prazo.</p>
            }
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-[1fr_160px_auto] gap-2">
            <input
              type="text"
              class="input-base"
              placeholder="Nome (ex: Próxima sprint)"
              [(ngModel)]="novoPrazoNome"
              name="novoPrazoNome"
            />
            <select
              class="input-base"
              [(ngModel)]="novoPrazoDuracao"
              name="novoPrazoDur"
            >
              <option [ngValue]="undefined" disabled>Duração</option>
              <option [ngValue]="0">Hoje (0 dias)</option>
              <option [ngValue]="1">1 dia</option>
              <option [ngValue]="2">2 dias</option>
              <option [ngValue]="3">3 dias</option>
              <option [ngValue]="7">7 dias</option>
              <option [ngValue]="14">14 dias</option>
              <option [ngValue]="30">30 dias</option>
              <option [ngValue]="null">Sem prazo</option>
            </select>
            <button
              type="button"
              class="btn-secondary"
              (click)="adicionarPrazo()"
            >
              Adicionar
            </button>
          </div>

          @if (erroPrazo()) {
            <p class="text-danger text-xs">{{ erroPrazo() }}</p>
          }
        </section>
      </div>
    </div>
  `,
})
export class ConfiguracoesComponent implements OnInit {
  private readonly catsApi = inject(CategoriasService);
  private readonly prazosApi = inject(PrazosService);
  private readonly storage = inject(TokenStorage);

  readonly usuario = this.storage.usuario;
  readonly categorias = signal<Categoria[]>([]);
  readonly prazos = signal<Prazo[]>([]);
  readonly editandoCat = signal<string | null>(null);
  readonly erroCat = signal<string | null>(null);
  readonly erroPrazo = signal<string | null>(null);

  novaCategoria = '';
  novoNomeCat = '';
  novoPrazoNome = '';
  novoPrazoDuracao: number | null | undefined = undefined;

  ngOnInit(): void {
    forkJoin({
      cats: this.catsApi.listar(),
      prz: this.prazosApi.listar(),
    }).subscribe(({ cats, prz }) => {
      this.categorias.set(cats);
      this.prazos.set(prz);
    });
  }

  adicionarCategoria(): void {
    const nome = this.novaCategoria.trim();
    if (!nome) return;
    this.erroCat.set(null);
    this.catsApi.criar(nome).subscribe({
      next: (c) => {
        this.categorias.update((list) => [...list, c].sort((a, b) => a.nome.localeCompare(b.nome)));
        this.novaCategoria = '';
      },
      error: (err) => this.erroCat.set(err?.error?.mensagem ?? 'Não consegui criar.'),
    });
  }

  iniciarRenomearCategoria(c: Categoria): void {
    this.editandoCat.set(c.id);
    this.novoNomeCat = c.nome;
  }

  cancelarEdicao(): void {
    this.editandoCat.set(null);
    this.novoNomeCat = '';
  }

  confirmarRenomearCategoria(c: Categoria): void {
    const nome = this.novoNomeCat.trim();
    if (!nome || nome === c.nome) {
      this.cancelarEdicao();
      return;
    }
    this.catsApi.atualizar(c.id, nome).subscribe({
      next: (atual) => {
        this.categorias.update((list) =>
          list
            .map((x) => (x.id === c.id ? atual : x))
            .sort((a, b) => a.nome.localeCompare(b.nome)),
        );
        this.cancelarEdicao();
      },
      error: (err) => this.erroCat.set(err?.error?.mensagem ?? 'Não consegui renomear.'),
    });
  }

  excluirCategoria(c: Categoria): void {
    if (!confirm(`Excluir categoria "${c.nome}"?`)) return;
    this.erroCat.set(null);
    this.catsApi.remover(c.id).subscribe({
      next: () => this.categorias.update((list) => list.filter((x) => x.id !== c.id)),
      error: (err) => this.erroCat.set(err?.error?.mensagem ?? 'Não consegui excluir.'),
    });
  }

  adicionarPrazo(): void {
    const nome = this.novoPrazoNome.trim();
    if (!nome || this.novoPrazoDuracao === undefined) return;
    this.erroPrazo.set(null);
    this.prazosApi.criar(nome, this.novoPrazoDuracao as number | null).subscribe({
      next: (p) => {
        this.prazos.update((list) => [...list, p]);
        this.novoPrazoNome = '';
        this.novoPrazoDuracao = undefined;
      },
      error: (err) => this.erroPrazo.set(err?.error?.mensagem ?? 'Não consegui criar.'),
    });
  }

  excluirPrazo(p: Prazo): void {
    if (!confirm(`Excluir prazo "${p.nome}"?`)) return;
    this.erroPrazo.set(null);
    this.prazosApi.remover(p.id).subscribe({
      next: () => this.prazos.update((list) => list.filter((x) => x.id !== p.id)),
      error: (err) => this.erroPrazo.set(err?.error?.mensagem ?? 'Não consegui excluir.'),
    });
  }

  formatarDuracao(d: number | null): string {
    if (d === null) return 'sem data limite';
    if (d === 0) return 'hoje (23:59)';
    if (d === 1) return '1 dia';
    return `${d} dias`;
  }
}
