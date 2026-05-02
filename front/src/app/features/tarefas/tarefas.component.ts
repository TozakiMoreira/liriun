import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Tarefa, TarefasService } from '../../core/api/tarefas.service';
import { ConfirmModalComponent } from '../../shared/confirm-modal.component';
import { extrairProblemDetails } from '../../shared/problem-details';
import { TarefaDetalheModalComponent } from './tarefa-detalhe-modal.component';
import { TarefaFormComponent } from './tarefa-form.component';

interface Grupo {
  chave: string;
  titulo: string;
  atrasada: boolean;
  tarefas: Tarefa[];
}

interface Confirmacao {
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  acao: () => void;
}

interface ColunaKanban {
  chave: string;
  titulo: string;
  prioridade: number;
  cor: string;
  tarefas: Tarefa[];
}

interface FiltrosTarefas {
  categoriaIds: string[];
  prioridades: number[];
  statusAtraso: 'todas' | 'atrasadas' | 'noprazo';
}

type TarefasView = 'lista' | 'kanban';

const STORAGE_FILTROS = 'jarvis.tarefas.filtros';
const STORAGE_VIEW = 'jarvis.tarefas.view';

const FILTROS_PADRAO: FiltrosTarefas = {
  categoriaIds: [],
  prioridades: [],
  statusAtraso: 'todas',
};

@Component({
  selector: 'app-tarefas',
  standalone: true,
  imports: [CommonModule, TarefaFormComponent, TarefaDetalheModalComponent, ConfirmModalComponent],
  template: `
    <header class="flex flex-wrap items-center px-4 md:px-8 py-3.5 border-b border-border gap-3">
      <div class="flex items-center gap-2 text-[13px] text-text-dim">
        <i class="fa-solid fa-list-check text-accent text-[11px]"></i>
        <strong class="text-text font-medium">Minhas Tarefas</strong>
        <span
          class="ml-1.5 text-[11px] px-2 py-0.5 rounded-full bg-bg-elev border border-border"
          data-testid="task-total-count"
        >
          {{ tarefasFiltradas().length }} pendente{{ tarefasFiltradas().length === 1 ? '' : 's' }}
          @if (filtrosAtivos() > 0) {
            <span class="text-text-subtle">·</span>
            <span class="text-accent">{{ filtrosAtivos() }} filtro{{ filtrosAtivos() === 1 ? '' : 's' }}</span>
          }
        </span>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <div
          class="flex items-center bg-bg-elev border border-border rounded p-0.5"
          role="tablist"
          aria-label="Modo de visualização"
        >
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="view() === 'lista'"
            class="px-2.5 py-1 rounded text-[12px] flex items-center gap-1.5 transition-colors"
            [class]="
              view() === 'lista'
                ? 'bg-bg-input text-text'
                : 'text-text-dim hover:text-text'
            "
            data-testid="view-lista-btn"
            (click)="setView('lista')"
            title="Visualizar em lista"
          >
            <i class="fa-solid fa-list text-[10px]"></i>
            <span class="hidden sm:inline">Lista</span>
          </button>
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="view() === 'kanban'"
            class="px-2.5 py-1 rounded text-[12px] flex items-center gap-1.5 transition-colors"
            [class]="
              view() === 'kanban'
                ? 'bg-bg-input text-text'
                : 'text-text-dim hover:text-text'
            "
            data-testid="view-kanban-btn"
            (click)="setView('kanban')"
            title="Visualizar em quadro"
          >
            <i class="fa-solid fa-columns text-[10px]"></i>
            <span class="hidden sm:inline">Quadro</span>
          </button>
        </div>

        <button
          type="button"
          class="text-[12px] flex items-center gap-1.5 px-2.5 py-1.5 rounded border transition-colors"
          [class]="
            filtrosAbertos() || filtrosAtivos() > 0
              ? 'bg-accent/15 border-accent/40 text-text'
              : 'bg-bg-elev border-border text-text-dim hover:text-text'
          "
          data-testid="toggle-filtros-btn"
          [attr.aria-expanded]="filtrosAbertos()"
          (click)="toggleFiltrosPanel()"
        >
          <i class="fa-solid fa-filter text-[10px]"></i>
          Filtros
          @if (filtrosAtivos() > 0) {
            <span class="text-[10px] px-1.5 py-px rounded-full bg-accent text-white font-medium">
              {{ filtrosAtivos() }}
            </span>
          }
        </button>

        <button
          type="button"
          class="btn-primary text-[13px] flex items-center gap-1.5"
          data-testid="new-task-btn"
          (click)="abrirNova()"
        >
          <i class="fa-solid fa-plus text-[10px]"></i>
          <span class="hidden sm:inline">Nova tarefa</span>
          <span class="sm:hidden">Nova</span>
        </button>
      </div>
    </header>

    @if (filtrosAbertos()) {
      <div
        class="px-4 md:px-8 py-4 border-b border-border bg-bg-elev/40 flex flex-col gap-3"
        data-testid="filtros-panel"
      >
        <div class="flex flex-col gap-1.5">
          <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">
            Status
          </span>
          <div class="flex flex-wrap gap-1.5" role="radiogroup">
            @for (opt of [
              { v: 'todas', label: 'Todas' },
              { v: 'noprazo', label: 'No prazo' },
              { v: 'atrasadas', label: 'Atrasadas' }
            ]; track opt.v) {
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="filtros().statusAtraso === opt.v"
                class="px-2.5 py-1 rounded text-[12px] border transition-colors"
                [class]="
                  filtros().statusAtraso === opt.v
                    ? 'bg-accent/15 border-accent/40 text-text'
                    : 'bg-[#16181c] border-border-strong text-text-dim hover:text-text'
                "
                [attr.data-testid]="'filtro-status-' + opt.v"
                (click)="setFiltroStatus(opt.v)"
              >
                {{ opt.label }}
              </button>
            }
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">
            Prioridade
          </span>
          <div class="flex flex-wrap gap-1.5">
            @for (p of [
              { v: 1, label: 'Urgente' },
              { v: 2, label: 'Importante' },
              { v: 3, label: 'Normal' },
              { v: 4, label: 'Baixa' }
            ]; track p.v) {
              <button
                type="button"
                class="px-2.5 py-1 rounded text-[12px] border flex items-center gap-1.5 transition-colors"
                [class]="
                  filtros().prioridades.includes(p.v)
                    ? 'bg-accent/15 border-accent/40 text-text'
                    : 'bg-[#16181c] border-border-strong text-text-dim hover:text-text'
                "
                [attr.aria-pressed]="filtros().prioridades.includes(p.v)"
                [attr.data-testid]="'filtro-prio-' + p.v"
                (click)="toggleFiltroPrioridade(p.v)"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  [style.background]="corPrioridade(p.v)"
                ></span>
                {{ p.label }}
              </button>
            }
          </div>
        </div>

        @if (categoriasDisponiveis().length > 0) {
          <div class="flex flex-col gap-1.5">
            <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">
              Categorias
            </span>
            <div class="flex flex-wrap gap-1.5">
              @for (c of categoriasDisponiveis(); track c.id) {
                <button
                  type="button"
                  class="px-2.5 py-1 rounded text-[12px] border transition-colors"
                  [class]="
                    filtros().categoriaIds.includes(c.id)
                      ? 'bg-accent/15 border-accent/40 text-text'
                      : 'bg-[#16181c] border-border-strong text-text-dim hover:text-text'
                  "
                  [attr.aria-pressed]="filtros().categoriaIds.includes(c.id)"
                  [attr.data-testid]="'filtro-cat-' + c.id"
                  (click)="toggleFiltroCategoria(c.id)"
                >
                  {{ c.nome }}
                </button>
              }
            </div>
          </div>
        }

        @if (filtrosAtivos() > 0) {
          <div class="flex">
            <button
              type="button"
              class="text-[11px] text-text-dim hover:text-text underline underline-offset-2"
              data-testid="filtros-limpar"
              (click)="limparFiltros()"
            >
              Limpar filtros
            </button>
          </div>
        }
      </div>
    }

    <div class="flex-1 px-4 md:px-8 py-6 overflow-auto" data-testid="tarefas-page">
      @if (erroLista()) {
        <div
          class="mb-4 px-3 py-2.5 rounded border border-danger/30 bg-danger/10 text-danger text-xs"
          data-testid="tarefas-erro"
        >
          {{ erroLista() }}
        </div>
      }

      @if (carregando()) {
        <p class="text-text-subtle text-sm">Carregando...</p>
      } @else if (pendentes().length === 0) {
        <div class="text-center py-16 text-text-subtle text-[13px]" data-testid="tarefas-vazio">
          Tudo em dia. Nada pra fazer agora.
        </div>
      } @else if (tarefasFiltradas().length === 0) {
        <div
          class="text-center py-16 text-text-subtle text-[13px] flex flex-col items-center gap-2"
          data-testid="tarefas-vazio-filtros"
        >
          <span>Nenhuma tarefa bate com seus filtros.</span>
          <button
            type="button"
            class="text-text-dim hover:text-text underline underline-offset-2 text-[12px]"
            (click)="limparFiltros()"
          >
            Limpar filtros
          </button>
        </div>
      } @else if (view() === 'kanban') {
        <div
          class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"
          data-testid="kanban-board"
        >
          @for (col of colunasKanban(); track col.chave) {
            <section
              class="flex flex-col bg-bg-elev/40 border border-border rounded-lg p-3 min-h-[200px]"
              [attr.data-testid]="'kanban-col-' + col.chave"
            >
              <div class="flex items-center gap-2 pb-2.5 border-b border-border mb-2.5">
                <span
                  class="w-2 h-2 rounded-full"
                  [style.background]="col.cor"
                  [style.box-shadow]="
                    col.prioridade === 1 ? '0 0 6px rgba(235,87,87,0.5)' : 'none'
                  "
                ></span>
                <span class="text-xs font-semibold uppercase tracking-wider text-text-dim">
                  {{ col.titulo }}
                </span>
                <span
                  class="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-bg border border-border text-text-dim"
                >
                  {{ col.tarefas.length }}
                </span>
              </div>

              @if (col.tarefas.length === 0) {
                <p class="text-text-subtle text-[11px] italic py-3 text-center">
                  Vazio
                </p>
              } @else {
                <div class="flex flex-col gap-2">
                  @for (t of col.tarefas; track t.id) {
                    <article
                      class="relative bg-bg-input border border-border rounded p-2.5 cursor-pointer hover:border-border-strong hover:-translate-y-px hover:shadow-md focus:outline-none focus:border-accent transition-all duration-200"
                      [class.opacity-0]="saindo().has(t.id)"
                      [class.scale-95]="saindo().has(t.id)"
                      [class.pointer-events-none]="processando().has(t.id) || saindo().has(t.id)"
                      [class.border-danger]="t.status === 3"
                      [attr.data-testid]="'kanban-card-' + t.id"
                      role="button"
                      tabindex="0"
                      (click)="abrirDetalhe(t)"
                      (keydown.enter)="abrirDetalhe(t)"
                    >
                      <span
                        class="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r"
                        [style.background]="col.cor"
                        aria-hidden="true"
                      ></span>
                      <div class="pl-1.5 flex flex-col gap-1.5">
                        <div class="text-[13px] font-medium leading-snug break-words">
                          {{ t.nome }}
                        </div>
                        @if (t.categorias.length > 0) {
                          <div class="flex gap-1 flex-wrap">
                            @for (c of t.categorias; track c.id) {
                              <span
                                class="text-[10px] px-1.5 py-px bg-[#16181c] border border-border rounded-full text-text-dim"
                                >{{ c.nome }}</span
                              >
                            }
                          </div>
                        }
                        <div
                          class="flex items-center gap-1.5 text-[11px] tabular-nums"
                          [class.text-danger]="t.status === 3"
                          [class.font-medium]="t.status === 3"
                          [class.text-text-dim]="t.status !== 3"
                        >
                          <i class="fa-solid fa-clock text-[9px]"></i>
                          {{ formatarPrazo(t) }}
                        </div>
                      </div>
                    </article>
                  }
                </div>
              }
            </section>
          }
        </div>
      } @else {
        @for (g of grupos(); track g.chave) {
          <section
            class="mb-7"
            [class]="
              g.atrasada
                ? 'border border-danger/25 rounded-lg p-2 bg-danger/[0.06]'
                : ''
            "
            [attr.data-testid]="'group-' + g.chave"
          >
            <div class="flex items-center gap-2 px-2 py-2">
              @if (g.atrasada) {
                <i class="fa-solid fa-triangle-exclamation text-danger text-xs"></i>
              }
              <span
                class="text-xs font-semibold uppercase tracking-wider"
                [class]="g.atrasada ? 'text-danger' : 'text-text-dim'"
                >{{ g.titulo }}</span
              >
              <span
                class="text-[11px] px-1.5 py-0.5 rounded-full border"
                [class]="
                  g.atrasada
                    ? 'bg-danger/15 border-danger/30 text-danger'
                    : 'bg-bg-elev border-border text-text-dim'
                "
                >{{ g.tarefas.length }}</span
              >
            </div>

            <div class="flex flex-col">
              @for (t of g.tarefas; track t.id) {
                <div
                  class="relative flex flex-col gap-2 md:grid md:grid-cols-[28px_1fr_auto_auto_auto_auto] md:items-center md:gap-3.5 pl-4 pr-3 py-2.5 rounded border-b border-border last:border-b-0 hover:bg-bg-elev hover:-translate-y-px hover:shadow-md focus-within:bg-bg-elev group transition-all duration-300 cursor-pointer"
                  [class.opacity-0]="saindo().has(t.id)"
                  [class.scale-95]="saindo().has(t.id)"
                  [class.pointer-events-none]="processando().has(t.id) || saindo().has(t.id)"
                  [attr.data-testid]="'task-' + t.id"
                  role="button"
                  tabindex="0"
                  (click)="abrirDetalhe(t)"
                  (keydown.enter)="abrirDetalhe(t)"
                >
                  <span
                    class="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r"
                    [style.background]="corPrioridade(t.prioridade)"
                    [style.box-shadow]="
                      t.prioridade === 1 ? '0 0 6px rgba(235,87,87,0.5)' : 'none'
                    "
                    aria-hidden="true"
                  ></span>
                  <div class="flex items-center gap-3 md:contents">
                    <button
                      type="button"
                      class="shrink-0 w-[18px] h-[18px] border-[1.5px] border-border-strong rounded-full grid place-items-center hover:border-accent hover:bg-accent/15 focus:outline-none focus:border-accent focus:bg-accent/15 transition-colors disabled:opacity-50"
                      [attr.data-testid]="'task-' + t.id + '-complete'"
                      (click)="$event.stopPropagation(); concluir(t)"
                      [disabled]="processando().has(t.id)"
                      aria-label="Concluir tarefa"
                      title="Concluir"
                    >
                      @if (processando().has(t.id)) {
                        <i class="fa-solid fa-circle-notch fa-spin text-[10px] text-accent"></i>
                      } @else {
                        <i class="fa-solid fa-check text-[10px] text-transparent group-hover:text-accent"></i>
                      }
                    </button>

                    <div class="text-sm font-medium truncate flex-1 min-w-0">{{ t.nome }}</div>

                    <div class="flex md:hidden gap-0.5 shrink-0">
                      <button
                        type="button"
                        class="w-[28px] h-[28px] rounded grid place-items-center text-text-subtle active:bg-[#16181c] focus:outline-none focus:text-text"
                        aria-label="Editar tarefa"
                        title="Editar"
                        [attr.data-testid]="'task-' + t.id + '-edit-mobile'"
                        (click)="$event.stopPropagation(); editar(t)"
                      >
                        <i class="fa-solid fa-pen text-xs"></i>
                      </button>
                      <button
                        type="button"
                        class="w-[28px] h-[28px] rounded grid place-items-center text-text-subtle active:bg-danger/15 active:text-danger focus:outline-none focus:text-danger"
                        aria-label="Excluir tarefa"
                        title="Excluir"
                        [attr.data-testid]="'task-' + t.id + '-delete-mobile'"
                        (click)="$event.stopPropagation(); pedirExcluir(t)"
                      >
                        <i class="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>

                  <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 pl-[30px] md:p-0 md:contents">
                    <div class="flex gap-1 flex-wrap md:flex-nowrap">
                      @for (c of t.categorias; track c.id) {
                        <span
                          class="text-[11px] px-2 py-0.5 bg-[#16181c] border border-border rounded-full text-text-dim whitespace-nowrap"
                          >{{ c.nome }}</span
                        >
                      }
                    </div>

                    <div
                      class="flex items-center gap-1.5 text-xs text-text-dim font-medium md:min-w-[90px]"
                    >
                      <span
                        class="w-2 h-2 rounded-full"
                        [style.background]="corPrioridade(t.prioridade)"
                        [style.box-shadow]="
                          t.prioridade === 1 ? '0 0 8px rgba(235,87,87,0.4)' : 'none'
                        "
                      ></span>
                      {{ rotuloPrioridade(t.prioridade) }}
                    </div>

                    <div
                      class="text-xs flex items-center gap-1.5 tabular-nums md:text-right md:justify-end md:min-w-[120px]"
                      [class.text-danger]="t.status === 3"
                      [class.font-medium]="t.status === 3"
                      [class.text-text-dim]="t.status !== 3"
                    >
                      <i class="fa-solid fa-clock text-[10px]"></i>
                      {{ formatarPrazo(t) }}
                    </div>
                  </div>

                  <div class="hidden md:flex gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      class="w-[26px] h-[26px] rounded grid place-items-center text-text-subtle hover:bg-[#16181c] hover:text-text focus:outline-none focus:text-text focus:bg-[#16181c]"
                      aria-label="Editar tarefa"
                      title="Editar"
                      [attr.data-testid]="'task-' + t.id + '-edit'"
                      (click)="$event.stopPropagation(); editar(t)"
                    >
                      <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button
                      type="button"
                      class="w-[26px] h-[26px] rounded grid place-items-center text-text-subtle hover:bg-danger/15 hover:text-danger focus:outline-none focus:text-danger focus:bg-danger/15"
                      aria-label="Excluir tarefa"
                      title="Excluir"
                      [attr.data-testid]="'task-' + t.id + '-delete'"
                      (click)="$event.stopPropagation(); pedirExcluir(t)"
                    >
                      <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              }
            </div>
          </section>
        }
      }
    </div>

    @if (formAberto()) {
      <app-tarefa-form
        [tarefa]="emEdicao()"
        (salvo)="aposSalvar()"
        (cancelado)="fecharForm()"
      ></app-tarefa-form>
    }

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

    @if (tarefaDetalhe(); as t) {
      <app-tarefa-detalhe-modal
        [tarefa]="t"
        (fechado)="tarefaDetalhe.set(null)"
        (editarTudo)="editarDoDetalhe($event)"
        (concluir)="concluirDoDetalhe($event)"
        (excluir)="pedirExcluirDoDetalhe($event)"
        (observacoesAtualizadas)="aplicarTarefaAtualizada($event)"
      ></app-tarefa-detalhe-modal>
    }
  `,
})
export class TarefasComponent implements OnInit {
  private readonly tarefasApi = inject(TarefasService);

  readonly pendentes = signal<Tarefa[]>([]);
  readonly carregando = signal(true);
  readonly formAberto = signal(false);
  readonly emEdicao = signal<Tarefa | null>(null);
  readonly tarefaDetalhe = signal<Tarefa | null>(null);
  readonly processando = signal(new Set<string>());
  readonly saindo = signal(new Set<string>());
  readonly erroLista = signal<string | null>(null);
  readonly confirmacao = signal<Confirmacao | null>(null);
  readonly view = signal<TarefasView>(this.lerView());
  readonly filtros = signal<FiltrosTarefas>(this.lerFiltros());
  readonly filtrosAbertos = signal(false);

  readonly categoriasDisponiveis = computed(() => {
    const set = new Map<string, string>();
    for (const t of this.pendentes()) {
      for (const c of t.categorias) {
        if (!set.has(c.id)) set.set(c.id, c.nome);
      }
    }
    return [...set.entries()]
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  });

  readonly filtrosAtivos = computed(() => {
    const f = this.filtros();
    return (
      f.categoriaIds.length +
      f.prioridades.length +
      (f.statusAtraso !== 'todas' ? 1 : 0)
    );
  });

  readonly tarefasFiltradas = computed(() => {
    const f = this.filtros();
    return this.pendentes().filter((t) => {
      if (f.categoriaIds.length > 0) {
        const tem = t.categorias.some((c) => f.categoriaIds.includes(c.id));
        if (!tem) return false;
      }
      if (f.prioridades.length > 0 && !f.prioridades.includes(t.prioridade)) return false;
      if (f.statusAtraso === 'atrasadas' && t.status !== 3) return false;
      if (f.statusAtraso === 'noprazo' && t.status === 3) return false;
      return true;
    });
  });

  readonly colunasKanban = computed<ColunaKanban[]>(() => {
    const ordem = [
      { prioridade: 1, titulo: 'Urgente', cor: '#eb5757' },
      { prioridade: 2, titulo: 'Importante', cor: '#f59e0b' },
      { prioridade: 3, titulo: 'Normal', cor: '#5e6ad2' },
      { prioridade: 4, titulo: 'Baixa', cor: '#62666d' },
    ];
    const lista = this.tarefasFiltradas();
    return ordem.map((o) => {
      const tarefas = lista
        .filter((t) => t.prioridade === o.prioridade)
        .sort((a, b) => new Date(a.dataPrazo).getTime() - new Date(b.dataPrazo).getTime());
      return {
        chave: `prio-${o.prioridade}`,
        titulo: o.titulo,
        prioridade: o.prioridade,
        cor: o.cor,
        tarefas,
      };
    });
  });

  readonly grupos = computed<Grupo[]>(() => {
    const lista = this.tarefasFiltradas();
    const atrasadas = lista.filter((t) => t.status === 3);
    const outras = lista.filter((t) => t.status !== 3);

    const ordenar = (arr: Tarefa[]) =>
      [...arr].sort((a, b) => {
        const da = new Date(a.dataPrazo).getTime();
        const db = new Date(b.dataPrazo).getTime();
        if (da !== db) return da - db;
        return a.prioridade - b.prioridade;
      });

    const porCategoria = new Map<string, Grupo>();
    for (const t of outras) {
      const cat = t.categorias[0];
      const chave = cat?.id ?? 'sem-categoria';
      const titulo = cat?.nome ?? 'Sem categoria';
      if (!porCategoria.has(chave)) {
        porCategoria.set(chave, { chave, titulo, atrasada: false, tarefas: [] });
      }
      porCategoria.get(chave)!.tarefas.push(t);
    }

    for (const g of porCategoria.values()) {
      g.tarefas = ordenar(g.tarefas);
    }

    const grupos: Grupo[] = [];
    if (atrasadas.length > 0) {
      grupos.push({
        chave: 'atrasadas',
        titulo: 'Atrasadas',
        atrasada: true,
        tarefas: ordenar(atrasadas),
      });
    }
    grupos.push(...[...porCategoria.values()].sort((a, b) => a.titulo.localeCompare(b.titulo)));
    return grupos;
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erroLista.set(null);
    this.tarefasApi.listarPendentes().subscribe({
      next: (lista) => {
        this.pendentes.set(lista);
        this.carregando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.carregando.set(false);
        const r = extrairProblemDetails(err, 'Não consegui carregar suas tarefas.');
        this.erroLista.set(r.mensagemGeral ?? 'Não consegui carregar suas tarefas.');
      },
    });
  }

  concluir(t: Tarefa): void {
    if (this.processando().has(t.id)) return;
    this.processando.update((s) => new Set(s).add(t.id));
    this.erroLista.set(null);

    this.tarefasApi.concluir(t.id).subscribe({
      next: () => {
        this.saindo.update((s) => new Set(s).add(t.id));
        setTimeout(() => {
          this.pendentes.update((list) => list.filter((x) => x.id !== t.id));
          this.saindo.update((s) => {
            const n = new Set(s);
            n.delete(t.id);
            return n;
          });
          this.processando.update((s) => {
            const n = new Set(s);
            n.delete(t.id);
            return n;
          });
        }, 280);
      },
      error: (err: HttpErrorResponse) => {
        this.processando.update((s) => {
          const n = new Set(s);
          n.delete(t.id);
          return n;
        });
        const r = extrairProblemDetails(err, 'Não consegui concluir essa tarefa.');
        this.erroLista.set(r.mensagemGeral ?? 'Não consegui concluir essa tarefa.');
      },
    });
  }

  pedirExcluir(t: Tarefa): void {
    this.confirmacao.set({
      titulo: 'Excluir tarefa',
      mensagem: `Excluir "${t.nome}"? Não dá pra desfazer.`,
      textoConfirmar: 'Excluir',
      acao: () => this.excluir(t),
    });
  }

  private excluir(t: Tarefa): void {
    this.erroLista.set(null);
    this.tarefasApi.remover(t.id).subscribe({
      next: () => {
        this.pendentes.update((list) => list.filter((x) => x.id !== t.id));
      },
      error: (err: HttpErrorResponse) => {
        const r = extrairProblemDetails(err, 'Não consegui excluir essa tarefa.');
        this.erroLista.set(r.mensagemGeral ?? 'Não consegui excluir essa tarefa.');
      },
    });
  }

  abrirNova(): void {
    this.emEdicao.set(null);
    this.formAberto.set(true);
  }

  editar(t: Tarefa): void {
    this.emEdicao.set(t);
    this.formAberto.set(true);
  }

  abrirDetalhe(t: Tarefa): void {
    if (this.processando().has(t.id) || this.saindo().has(t.id)) return;
    this.tarefaDetalhe.set(t);
  }

  editarDoDetalhe(t: Tarefa): void {
    this.tarefaDetalhe.set(null);
    this.editar(t);
  }

  concluirDoDetalhe(t: Tarefa): void {
    this.tarefaDetalhe.set(null);
    this.concluir(t);
  }

  pedirExcluirDoDetalhe(t: Tarefa): void {
    this.tarefaDetalhe.set(null);
    this.pedirExcluir(t);
  }

  aplicarTarefaAtualizada(atual: Tarefa): void {
    this.pendentes.update((list) => list.map((x) => (x.id === atual.id ? atual : x)));
    this.tarefaDetalhe.set(atual);
  }

  // ===== View toggle =====
  setView(v: TarefasView): void {
    this.view.set(v);
    try {
      localStorage.setItem(STORAGE_VIEW, v);
    } catch {
      /* ignora */
    }
  }

  // ===== Filtros =====
  toggleFiltrosPanel(): void {
    this.filtrosAbertos.update((v) => !v);
  }

  toggleFiltroCategoria(id: string): void {
    this.atualizarFiltros((f) => ({
      ...f,
      categoriaIds: f.categoriaIds.includes(id)
        ? f.categoriaIds.filter((x) => x !== id)
        : [...f.categoriaIds, id],
    }));
  }

  toggleFiltroPrioridade(p: number): void {
    this.atualizarFiltros((f) => ({
      ...f,
      prioridades: f.prioridades.includes(p)
        ? f.prioridades.filter((x) => x !== p)
        : [...f.prioridades, p],
    }));
  }

  setFiltroStatus(v: string): void {
    const valor: FiltrosTarefas['statusAtraso'] =
      v === 'atrasadas' || v === 'noprazo' ? v : 'todas';
    this.atualizarFiltros((f) => ({ ...f, statusAtraso: valor }));
  }

  limparFiltros(): void {
    this.atualizarFiltros(() => ({ ...FILTROS_PADRAO }));
  }

  private atualizarFiltros(fn: (atual: FiltrosTarefas) => FiltrosTarefas): void {
    this.filtros.update(fn);
    try {
      localStorage.setItem(STORAGE_FILTROS, JSON.stringify(this.filtros()));
    } catch {
      /* ignora */
    }
  }

  private lerFiltros(): FiltrosTarefas {
    if (typeof localStorage === 'undefined') return { ...FILTROS_PADRAO };
    try {
      const raw = localStorage.getItem(STORAGE_FILTROS);
      if (!raw) return { ...FILTROS_PADRAO };
      const parsed = JSON.parse(raw) as Partial<FiltrosTarefas>;
      return {
        categoriaIds: Array.isArray(parsed.categoriaIds) ? parsed.categoriaIds : [],
        prioridades: Array.isArray(parsed.prioridades) ? parsed.prioridades : [],
        statusAtraso:
          parsed.statusAtraso === 'atrasadas' || parsed.statusAtraso === 'noprazo'
            ? parsed.statusAtraso
            : 'todas',
      };
    } catch {
      return { ...FILTROS_PADRAO };
    }
  }

  private lerView(): TarefasView {
    if (typeof localStorage === 'undefined') return 'lista';
    const raw = localStorage.getItem(STORAGE_VIEW);
    return raw === 'kanban' ? 'kanban' : 'lista';
  }

  fecharForm(): void {
    this.formAberto.set(false);
    this.emEdicao.set(null);
  }

  aposSalvar(): void {
    this.fecharForm();
    this.carregar();
  }

  executarConfirmacao(): void {
    const c = this.confirmacao();
    if (!c) return;
    this.confirmacao.set(null);
    c.acao();
  }

  rotuloPrioridade(p: number): string {
    return ['', 'Urgente', 'Importante', 'Normal', 'Baixa'][p] ?? 'Normal';
  }

  corPrioridade(p: number): string {
    return (
      {
        1: '#eb5757',
        2: '#f59e0b',
        3: '#5e6ad2',
        4: '#62666d',
      } as Record<number, string>
    )[p] ?? '#5e6ad2';
  }

  formatarPrazo(t: Tarefa): string {
    const alvo = new Date(t.dataPrazo);
    alvo.setHours(0, 0, 0, 0);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const diasDiff = Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
    const horaSufixo = t.horarioFinal ? `, ${t.horarioFinal.substring(0, 5)}` : '';

    if (diasDiff === 0) return `Hoje${horaSufixo}`;
    if (diasDiff === 1) return `Amanhã${horaSufixo}`;
    if (diasDiff === -1) return `Ontem${horaSufixo}`;

    if (diasDiff > 0) {
      return `Em ${this.frasePeriodo(alvo, hoje)}`;
    }

    // passado (atrasada com mais de 1 dia)
    return `${this.frasePeriodo(hoje, alvo)} atrás`;
  }

  private frasePeriodo(maior: Date, menor: Date): string {
    const diasDiff = Math.round((maior.getTime() - menor.getTime()) / 86400000);

    if (diasDiff < 30) {
      return `${diasDiff} dias`;
    }

    const anosDiff = maior.getFullYear() - menor.getFullYear();
    const mesesDiff = anosDiff * 12 + (maior.getMonth() - menor.getMonth());
    const ajusteMes = maior.getDate() < menor.getDate() ? -1 : 0;
    const meses = mesesDiff + ajusteMes;

    if (meses < 12) {
      return meses === 1 ? '1 mês' : `${meses} meses`;
    }

    const anos = Math.floor(meses / 12);
    return anos === 1 ? '1 ano' : `${anos} anos`;
  }
}
