import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, TemplateRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tarefa, TarefasService } from '../../core/api/tarefas.service';
import { ConfirmModalComponent } from '../../shared/confirm-modal.component';
import { extrairProblemDetails } from '../../shared/problem-details';
import { TarefaDetalheModalComponent } from './tarefa-detalhe-modal.component';
import { TarefaFormComponent } from './tarefa-form.component';
import { PageHeaderService } from '../../core/layout/page-header.service';
import { LocaleService } from '../../core/locale/locale.service';
import { CategoriasModalComponent } from '../../shared/categorias-modal.component';
import { ItemAgendaPosicionado, calcularLayoutAgenda } from '../../shared/agenda-layout';

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

type PeriodoFiltro = 'todas' | 'hoje' | 'amanha' | 'semana' | 'mes' | 'proximoMes';

interface FiltrosTarefas {
  categoriaIds: string[];
  prioridades: number[];
  statusAtraso: 'todas' | 'atrasadas' | 'noprazo';
  periodo: PeriodoFiltro;
}

const PERIODOS_VALIDOS: PeriodoFiltro[] = ['todas', 'hoje', 'amanha', 'semana', 'mes', 'proximoMes'];

type TarefasView = 'lista' | 'kanban' | 'semana';

const STORAGE_FILTROS = 'liriun.tarefas.filtros';
const STORAGE_VIEW = 'liriun.tarefas.view';

const FILTROS_PADRAO: FiltrosTarefas = {
  categoriaIds: [],
  prioridades: [],
  statusAtraso: 'todas',
  periodo: 'todas',
};

@Component({
  selector: 'app-tarefas',
  standalone: true,
  imports: [CommonModule, TarefaFormComponent, TarefaDetalheModalComponent, ConfirmModalComponent, CategoriasModalComponent],
  template: `

    <ng-template #subtituloTpl>
      <span
        class="ml-1.5 text-[11px] px-2 py-0.5 rounded-full bg-bg-elev border border-border"
        data-testid="task-total-count"
      >
        {{ tarefasFiltradas().length }} pendente{{ tarefasFiltradas().length === 1 ? '' : 's' }}
        @if (filtrosAtivos() > 0) {
          <span class="text-text-subtle">·</span>
          <span class="text-accent">{{ locale.t(filtrosAtivos() === 1 ? 'tarefas.filtro_n_aplicado_1' : 'tarefas.filtro_n_aplicado', { n: filtrosAtivos() + '' }) }}</span>
        }
      </span>
    </ng-template>

    <ng-template #acoesTpl>
      <div class="flex items-center gap-2">
        <span
          class="text-[10px] uppercase tracking-wider text-text-subtle font-medium sm:hidden"
          aria-hidden="true"
        >{{ locale.t('tarefas.modo') }}</span>
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
            <span class="hidden sm:inline">{{ locale.t('tarefas.lista') }}</span>
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
            <span class="hidden sm:inline">{{ locale.t('tarefas.quadro') }}</span>
          </button>
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="view() === 'semana'"
            class="px-2.5 py-1 rounded text-[12px] flex items-center gap-1.5 transition-colors"
            [class]="
              view() === 'semana'
                ? 'bg-bg-input text-text'
                : 'text-text-dim hover:text-text'
            "
            data-testid="view-semana-btn"
            (click)="setView('semana')"
            title="Visualizar a semana"
          >
            <i class="fa-solid fa-calendar-week text-[10px]"></i>
            <span class="hidden sm:inline">{{ locale.t('tarefas.semana') }}</span>
          </button>
        </div>

        <div class="relative" (click)="$event.stopPropagation()">
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
            aria-haspopup="true"
            (click)="toggleFiltrosPanel()"
          >
            <i class="fa-solid fa-filter text-[10px]"></i>
            {{ locale.t('tarefas.filtros_btn') }}
            @if (filtrosAtivos() > 0) {
              <span class="text-[10px] px-1.5 py-px rounded-full bg-accent text-white font-medium">
                {{ filtrosAtivos() }}
              </span>
            }
            <i class="fa-solid fa-chevron-down text-[8px] transition-transform"
              [class.rotate-180]="filtrosAbertos()"
            ></i>
          </button>

          @if (filtrosAbertos()) {
            <div
              class="fixed inset-x-3 bottom-20 z-30 card-elev p-4 flex flex-col gap-3 dropdown-in md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:top-full md:mt-1.5 md:w-[320px] md:max-w-[calc(100vw-2rem)]"
              data-testid="filtros-panel"
              role="dialog"
              [attr.aria-label]="locale.t('tarefas.filtros_btn')"
            >
        <div class="flex flex-col gap-1.5">
          <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">
            Status
          </span>
          <div class="flex flex-wrap gap-1.5" role="radiogroup">
            @for (opt of [
              { v: 'todas', label: locale.t('tarefas.todas') },
              { v: 'noprazo', label: locale.t('tarefas.no_prazo') },
              { v: 'atrasadas', label: locale.t('tarefas.atrasadas') }
            ]; track opt.v) {
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="filtros().statusAtraso === opt.v"
                class="px-2.5 py-1 rounded text-[12px] border transition-colors"
                [class]="
                  filtros().statusAtraso === opt.v
                    ? 'bg-accent/15 border-accent/40 text-text'
                    : 'bg-bg-surface border-border-strong text-text-dim hover:text-text'
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
              { v: 1, label: locale.t('form.prioridade_urgente') },
              { v: 2, label: locale.t('form.prioridade_importante') },
              { v: 3, label: locale.t('form.prioridade_normal') },
              { v: 4, label: locale.t('form.prioridade_baixa') }
            ]; track p.v) {
              <button
                type="button"
                class="px-2.5 py-1 rounded text-[12px] border flex items-center gap-1.5 transition-colors"
                [class]="
                  filtros().prioridades.includes(p.v)
                    ? 'bg-accent/15 border-accent/40 text-text'
                    : 'bg-bg-surface border-border-strong text-text-dim hover:text-text'
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

        <div class="flex flex-col gap-1.5">
          <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">
            Período
          </span>
          <div class="flex flex-wrap gap-1.5" role="radiogroup">
            @for (opt of [
              { v: 'todas', label: locale.t('tarefas.todas') },
              { v: 'hoje', label: locale.t('tarefas.hoje') },
              { v: 'amanha', label: locale.t('tarefas.amanha') },
              { v: 'semana', label: locale.t('tarefas.esta_semana') },
              { v: 'mes', label: locale.t('tarefas.este_mes_filt') },
              { v: 'proximoMes', label: locale.t('tarefas.proximo_mes') }
            ]; track opt.v) {
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="filtros().periodo === opt.v"
                class="px-2.5 py-1 rounded text-[12px] border transition-colors"
                [class]="
                  filtros().periodo === opt.v
                    ? 'bg-accent/15 border-accent/40 text-text'
                    : 'bg-bg-surface border-border-strong text-text-dim hover:text-text'
                "
                [attr.data-testid]="'filtro-periodo-' + opt.v"
                (click)="setFiltroPeriodo($any(opt.v))"
              >
                {{ opt.label }}
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
                      : 'bg-bg-surface border-border-strong text-text-dim hover:text-text'
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
              {{ locale.t('tarefas.limpar_filtros') }}
            </button>
          </div>
        }
              </div>
            }
          </div>

          <button
            type="button"
            class="text-[12px] flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-accent text-white hover:bg-accent-hover transition-colors font-medium"
            data-testid="new-task-btn"
            (click)="abrirNova()"
          >
            <i class="fa-solid fa-plus text-[10px]"></i>
            <span class="hidden sm:inline">{{ locale.t('tarefas.nova_tarefa') }}</span>
            <span class="sm:hidden">{{ locale.t('tarefas.nova_curto') }}</span>
          </button>
        </div>
    </ng-template>

    <div class="flex-1 px-4 md:px-8 py-5 md:py-6 overflow-auto pb-24 md:pb-6" data-testid="tarefas-page">

      <!-- ===== Hero ===== -->
      <section class="flex flex-col gap-3 mb-5">
        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="hidden md:inline-flex btn-primary text-[12px] py-1.5 px-3 items-center gap-1.5 shrink-0"
            data-testid="tarefas-novo-desktop"
            (click)="abrirNova()"
          >
            <i class="fa-solid fa-plus text-[10px]"></i>
            {{ locale.t('tarefas.nova_tarefa') }}
          </button>
        </div>

        <!-- Stat cards -->
        <div class="grid grid-cols-3 gap-2 md:gap-3" data-testid="tarefas-stats">
          <section class="card-elev p-3 md:p-4 flex flex-col gap-1 animate-fade-up">
            <div class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-text-subtle font-medium">
              <i class="fa-solid fa-list-check text-accent text-[10px]"></i>
              <span>{{ locale.t('tarefas.pendentes') }}</span>
            </div>
            <div class="text-[20px] md:text-[22px] font-semibold tabular-nums">
              {{ pendentes().length }}
            </div>
          </section>
          <section
            class="card-elev p-3 md:p-4 flex flex-col gap-1 animate-fade-up"
            style="animation-delay: 60ms"
            [class.bg-danger]="qtdAtrasadas() > 0"
            [class.bg-opacity-5]="qtdAtrasadas() > 0"
            [class.border-danger]="qtdAtrasadas() > 0"
            [class.border-opacity-30]="qtdAtrasadas() > 0"
          >
            <div class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-text-subtle font-medium">
              <i class="fa-solid fa-triangle-exclamation text-danger text-[10px]"></i>
              {{ locale.t('tarefas.atrasadas') }}
            </div>
            <div
              class="text-[20px] md:text-[22px] font-semibold tabular-nums"
              [class.text-danger]="qtdAtrasadas() > 0"
            >
              {{ qtdAtrasadas() }}
            </div>
          </section>
          <section class="card-elev p-3 md:p-4 flex flex-col gap-1 animate-fade-up" style="animation-delay: 120ms">
            <div class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-text-subtle font-medium">
              <i class="fa-regular fa-calendar text-accent-violet text-[10px]"></i>
              <span class="hidden sm:inline">{{ locale.t('tarefas.hoje') }}</span>
              <span class="sm:hidden">{{ locale.t('tarefas.hoje') }}</span>
            </div>
            <div class="text-[20px] md:text-[22px] font-semibold tabular-nums text-accent-violet">
              {{ qtdHoje() }}
            </div>
          </section>
        </div>

        <!-- Toolbar: view tabs + filtros/selecionar agrupados -->
        <div class="flex flex-col md:flex-row md:items-center gap-2">
          <div class="inline-flex bg-bg-elev border border-border rounded-lg p-0.5 h-9" role="tablist" [attr.aria-label]="locale.t('tarefas.modo')">
            @for (v of [
              { v: 'lista', label: locale.t('tarefas.lista'), icone: 'fa-list' },
              { v: 'kanban', label: locale.t('tarefas.quadro'), icone: 'fa-columns' },
              { v: 'semana', label: locale.t('tarefas.semana'), icone: 'fa-calendar-week' }
            ]; track v.v) {
              <button
                type="button"
                role="tab"
                [attr.aria-selected]="view() === v.v"
                class="rounded px-3 text-[12px] font-medium transition-colors flex items-center gap-1.5"
                [class]="view() === v.v ? 'bg-bg-input text-text shadow-sm' : 'text-text-dim hover:text-text'"
                [attr.data-testid]="'view-' + v.v + '-btn'"
                (click)="setView($any(v.v))"
              >
                <i [class]="'fa-solid ' + v.icone + ' text-[11px]'"></i>
                <span>{{ v.label }}</span>
              </button>
            }
          </div>

          <div class="flex items-center gap-2 md:ml-auto">
          <div class="relative flex-1 md:flex-initial" (click)="$event.stopPropagation()">
            <button
              type="button"
              class="w-full md:w-auto text-[12px] flex items-center justify-center md:justify-start gap-1.5 px-3 h-9 rounded-lg border transition-colors"
              [class]="
                filtrosAbertos() || filtrosAtivos() > 0
                  ? 'bg-accent/15 border-accent/40 text-text'
                  : 'bg-bg-elev border-border text-text-dim hover:text-text'
              "
              data-testid="toggle-filtros-btn-novo"
              [attr.aria-expanded]="filtrosAbertos()"
              aria-haspopup="true"
              (click)="toggleFiltrosPanel()"
            >
              <i class="fa-solid fa-filter text-[10px]"></i>
              {{ locale.t('tarefas.filtros_btn') }}
              @if (filtrosAtivos() > 0) {
                <span class="text-[10px] px-1.5 py-px rounded-full bg-accent text-white font-medium">
                  {{ filtrosAtivos() }}
                </span>
              }
              <i class="fa-solid fa-chevron-down text-[8px] transition-transform"
                [class.rotate-180]="filtrosAbertos()"
              ></i>
            </button>

            @if (filtrosAbertos()) {
              <!-- Mobile: backdrop -->
              <div
                class="md:hidden fixed inset-0 z-30 bg-black/40 animate-fade-in"
                (click)="filtrosAbertos.set(false)"
                aria-hidden="true"
              ></div>
              <div
                class="fixed left-3 right-3 top-auto bottom-20 md:absolute md:top-full md:left-0 md:right-auto md:bottom-auto md:mt-1.5 md:w-[340px] z-40 card-elev p-4 flex flex-col gap-3 max-h-[70vh] overflow-y-auto animate-fade-up md:animate-fade-down"
                data-testid="filtros-panel-novo"
                role="dialog"
                [attr.aria-label]="locale.t('tarefas.filtros_btn')"
              >
                <div class="flex flex-col gap-1.5">
                  <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">{{ locale.t('tarefas.status') }}</span>
                  <div class="flex flex-wrap gap-1.5" role="radiogroup">
                    @for (opt of [
                      { v: 'todas', label: locale.t('tarefas.todas') },
                      { v: 'noprazo', label: locale.t('tarefas.no_prazo') },
                      { v: 'atrasadas', label: locale.t('tarefas.atrasadas') }
                    ]; track opt.v) {
                      <button
                        type="button"
                        role="radio"
                        [attr.aria-checked]="filtros().statusAtraso === opt.v"
                        class="px-2.5 py-1 rounded text-[12px] border transition-colors"
                        [class]="
                          filtros().statusAtraso === opt.v
                            ? 'bg-accent/15 border-accent/40 text-text'
                            : 'bg-bg-surface border-border-strong text-text-dim hover:text-text'
                        "
                        (click)="setFiltroStatus(opt.v)"
                      >{{ opt.label }}</button>
                    }
                  </div>
                </div>

                <div class="flex flex-col gap-1.5">
                  <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">{{ locale.t('tarefas.prioridade') }}</span>
                  <div class="flex flex-wrap gap-1.5">
                    @for (p of [
                      { v: 1, label: locale.t('form.prioridade_urgente') },
                      { v: 2, label: locale.t('form.prioridade_importante') },
                      { v: 3, label: locale.t('form.prioridade_normal') },
                      { v: 4, label: locale.t('form.prioridade_baixa') }
                    ]; track p.v) {
                      <button
                        type="button"
                        class="px-2.5 py-1 rounded text-[12px] border flex items-center gap-1.5 transition-colors"
                        [class]="
                          filtros().prioridades.includes(p.v)
                            ? 'bg-accent/15 border-accent/40 text-text'
                            : 'bg-bg-surface border-border-strong text-text-dim hover:text-text'
                        "
                        [attr.aria-pressed]="filtros().prioridades.includes(p.v)"
                        (click)="toggleFiltroPrioridade(p.v)"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" [style.background]="corPrioridade(p.v)"></span>
                        {{ p.label }}
                      </button>
                    }
                  </div>
                </div>

                <div class="flex flex-col gap-1.5">
                  <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">{{ locale.t('tarefas.periodo') }}</span>
                  <div class="flex flex-wrap gap-1.5" role="radiogroup">
                    @for (opt of [
                      { v: 'todas', label: locale.t('tarefas.todas') },
                      { v: 'hoje', label: locale.t('tarefas.hoje') },
                      { v: 'amanha', label: locale.t('tarefas.amanha') },
                      { v: 'semana', label: locale.t('tarefas.esta_semana') },
                      { v: 'mes', label: locale.t('tarefas.este_mes_filt') },
                      { v: 'proximoMes', label: locale.t('tarefas.proximo_mes') }
                    ]; track opt.v) {
                      <button
                        type="button"
                        role="radio"
                        [attr.aria-checked]="filtros().periodo === opt.v"
                        class="px-2.5 py-1 rounded text-[12px] border transition-colors"
                        [class]="
                          filtros().periodo === opt.v
                            ? 'bg-accent/15 border-accent/40 text-text'
                            : 'bg-bg-surface border-border-strong text-text-dim hover:text-text'
                        "
                        (click)="setFiltroPeriodo($any(opt.v))"
                      >{{ opt.label }}</button>
                    }
                  </div>
                </div>

                @if (categoriasDisponiveis().length > 0) {
                  <div class="flex flex-col gap-1.5">
                    <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">{{ locale.t('tarefas.categorias') }}</span>
                    <div class="flex flex-wrap gap-1.5">
                      @for (c of categoriasDisponiveis(); track c.id) {
                        <button
                          type="button"
                          class="px-2.5 py-1 rounded text-[12px] border transition-colors"
                          [class]="
                            filtros().categoriaIds.includes(c.id)
                              ? 'bg-accent/15 border-accent/40 text-text'
                              : 'bg-bg-surface border-border-strong text-text-dim hover:text-text'
                          "
                          [attr.aria-pressed]="filtros().categoriaIds.includes(c.id)"
                          (click)="toggleFiltroCategoria(c.id)"
                        >{{ c.nome }}</button>
                      }
                    </div>
                  </div>
                }

                @if (filtrosAtivos() > 0) {
                  <div class="flex">
                    <button
                      type="button"
                      class="text-[11px] text-text-dim hover:text-text underline underline-offset-2"
                      (click)="limparFiltros()"
                    >{{ locale.t('tarefas.limpar_filtros') }}</button>
                  </div>
                }
              </div>
            }
          </div>
          <button
            type="button"
            class="h-9 px-3 rounded-lg border text-[12px] font-medium flex items-center gap-1.5 transition-colors shrink-0"
            [class]="
              selecionando()
                ? 'bg-accent border-accent text-white hover:bg-accent-hover'
                : 'bg-bg-elev border-border text-text-dim hover:text-accent hover:border-accent/40'
            "
            data-testid="bulk-mode-btn"
            [attr.title]="selecionando() ? 'Cancelar seleção' : 'Selecionar tarefas'"
            [attr.aria-pressed]="selecionando()"
            (click)="toggleSelecionar()"
          >
            @if (selecionando()) {
              <i class="fa-solid fa-xmark text-[12px]"></i>
              <span>{{ locale.t('tarefas.cancelar') }}</span>
            } @else {
              <i class="fa-regular fa-square-check text-[12px]"></i>
              <span>{{ locale.t('tarefas.selecionar') }}</span>
            }
          </button>
          <button
            type="button"
            class="px-3 h-9 rounded-lg text-[12px] font-medium border bg-bg-elev border-border text-text-dim hover:text-accent hover:border-accent/40 transition-colors flex items-center gap-1.5"
            data-testid="categorias-btn"
            [attr.title]="locale.t('tarefas.gerenciar_categorias')"
            [attr.aria-label]="locale.t('tarefas.gerenciar_categorias')"
            (click)="categoriasModalAberto.set(true)"
          >
            <i class="fa-solid fa-tag text-[12px]"></i>
            <span class="hidden sm:inline">{{ locale.t('tarefas.categorias') }}</span>
          </button>
          </div>
        </div>
      </section>

      @if (erroLista()) {
        <div
          class="mb-4 px-3 py-2.5 rounded border border-danger/30 bg-danger/10 text-danger text-xs"
          data-testid="tarefas-erro"
        >
          {{ erroLista() }}
        </div>
      }

      @if (carregando()) {
        <p class="text-text-subtle text-sm">{{ locale.t('tarefas.carregando') }}</p>
      } @else if (pendentes().length === 0) {
        <div class="text-center py-16 text-text-subtle text-[13px]" data-testid="tarefas-vazio">
          Tudo em dia. Nada pra fazer agora.
        </div>
      } @else if (tarefasFiltradas().length === 0) {
        <div
          class="text-center py-16 text-text-subtle text-[13px] flex flex-col items-center gap-2"
          data-testid="tarefas-vazio-filtros"
        >
          <span>{{ locale.t('tarefas.vazio_filtros') }}</span>
          <button
            type="button"
            class="text-text-dim hover:text-text underline underline-offset-2 text-[12px]"
            (click)="limparFiltros()"
          >
            Limpar filtros
          </button>
        </div>
      } @else if (view() === 'semana') {
        <div class="flex flex-col gap-3" data-testid="semana-view">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="w-8 h-8 rounded grid place-items-center text-text-dim hover:text-text hover:bg-bg-elev border border-border"
              data-testid="semana-prev"
              aria-label="Semana anterior"
              (click)="navegarSemana(-1)"
            >
              <i class="fa-solid fa-chevron-left text-[10px]"></i>
            </button>
            <button
              type="button"
              class="text-[12px] px-3 py-1.5 rounded border transition-colors"
              [class]="semanaAtualExibida() ? 'bg-accent/15 border-accent/40 text-accent' : 'border-border text-text-dim hover:text-text'"
              data-testid="semana-hoje"
              [disabled]="semanaAtualExibida() && diaSelecionadoEhHoje()"
              (click)="irHoje()"
            >
              {{ locale.t('tarefas.hoje') }}
            </button>
            <button
              type="button"
              class="w-8 h-8 rounded grid place-items-center text-text-dim hover:text-text hover:bg-bg-elev border border-border"
              data-testid="semana-next"
              aria-label="Próxima semana"
              (click)="navegarSemana(1)"
            >
              <i class="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
            <span class="text-[13px] font-medium ml-1">{{ rotuloSemana() }}</span>
          </div>

          <!-- Mobile: day view com chips de dia -->
          <div class="md:hidden flex flex-col gap-3" data-testid="semana-mobile-day-view">
            <!-- Chips Seg-Dom da semana exibida -->
            <div class="grid grid-cols-7 gap-1 bg-bg-elev border border-border rounded-lg p-1">
              @for (d of diasSemana(); track d.iso) {
                <button
                  type="button"
                  class="rounded py-1.5 flex flex-col items-center gap-0.5 transition-colors"
                  [class]="
                    diaSelecionadoSemana() === d.iso
                      ? 'bg-accent text-white'
                      : (d.hoje ? 'text-accent hover:bg-bg-input' : 'text-text-dim hover:bg-bg-input hover:text-text')
                  "
                  [attr.aria-pressed]="diaSelecionadoSemana() === d.iso"
                  [attr.data-testid]="'dia-chip-' + d.iso"
                  (click)="setDiaSelecionado(d.iso)"
                >
                  <span class="text-[9px] uppercase tracking-wider font-medium">{{ d.diaCurto }}</span>
                  <span class="text-[15px] font-semibold tabular-nums leading-none">{{ d.diaNum }}</span>
                </button>
              }
            </div>

            <!-- Header do dia selecionado -->
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="w-8 h-8 rounded grid place-items-center text-text-dim hover:text-text hover:bg-bg-elev border border-border"
                aria-label="Dia anterior"
                (click)="navegarDiaSemana(-1)"
              ><i class="fa-solid fa-chevron-left text-[10px]"></i></button>
              <div class="flex-1 text-center">
                <div class="text-[13px] font-semibold capitalize">{{ rotuloDiaSelecionado() }}</div>
                @if (diaSelecionadoEhHoje()) {
                  <div class="text-[10px] text-accent uppercase tracking-wider font-bold">{{ locale.t('tarefas.hoje') }} · {{ rotuloAgora() }}</div>
                }
              </div>
              <button
                type="button"
                class="w-8 h-8 rounded grid place-items-center text-text-dim hover:text-text hover:bg-bg-elev border border-border"
                aria-label="Próximo dia"
                (click)="navegarDiaSemana(1)"
              ><i class="fa-solid fa-chevron-right text-[10px]"></i></button>
            </div>

            <!-- Tarefas sem hora do dia -->
            @if (tarefasSemHoraDiaSelecionado().length > 0) {
              <div class="card-elev p-3 flex flex-col gap-1.5">
                <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">{{ locale.t('tarefas.sem_hora') }}</span>
                @for (t of tarefasSemHoraDiaSelecionado(); track t.id) {
                  <button
                    type="button"
                    class="text-left flex items-center gap-2 px-2 py-2 rounded border border-l-[3px]"
                    [style.background]="corPrioridade(t.prioridade) + '22'"
                    [style.borderColor]="corPrioridade(t.prioridade) + '55'"
                    [style.borderLeftColor]="corPrioridade(t.prioridade)"
                    (click)="abrirDetalhe(t)"
                  >
                    @if (t.status === 3) {
                      <i class="fa-solid fa-triangle-exclamation text-danger text-[10px] shrink-0"></i>
                    }
                    <span class="text-[13px] font-medium truncate flex-1">{{ t.nome }}</span>
                  </button>
                }
              </div>
            }

            <!-- Timeline 1 dia -->
            <div class="card-elev overflow-hidden">
              <div class="overflow-y-auto" style="max-height: 65vh">
                <div class="relative grid grid-cols-[48px_1fr]">
                  <div class="flex flex-col">
                    @for (h of horasSemana(); track h) {
                      <div
                        class="text-[10px] tabular-nums text-text-subtle border-b border-border/40 grid place-items-center"
                        [style.height.px]="alturaSlot()"
                      >{{ formatarHora(h) }}</div>
                    }
                  </div>

                  <div class="relative border-l border-border">
                    @for (h of horasSemana(); track h) {
                      <div
                        class="border-b border-border/40"
                        [style.height.px]="alturaSlot()"
                      ></div>
                    }

                    @if (diaSelecionadoEhHoje() && topoLinhaAgora() !== null) {
                      <div
                        class="absolute left-0 right-0 pointer-events-none z-10"
                        [style.top.px]="topoLinhaAgora()"
                        aria-hidden="true"
                      >
                        <div class="relative h-px">
                          <div class="absolute inset-x-0 top-0 h-px bg-danger"></div>
                          <span
                            class="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-danger ring-2 ring-bg"
                          ></span>
                        </div>
                      </div>
                    }

                    @for (p of tarefasLayoutDiaSelecionado(); track p.item.id) {
                      @let t = p.item.tarefa;
                      <button
                        type="button"
                        class="absolute rounded px-2 py-1.5 text-left border border-l-[3px] text-text overflow-hidden transition-colors"
                        [style.top.px]="p.item.top"
                        [style.left]="estiloPosicaoTarefaSemana(p).left"
                        [style.width]="estiloPosicaoTarefaSemana(p).width"
                        [style.minHeight.px]="alturaSlot() - 4"
                        [style.background]="corPrioridade(t.prioridade) + '22'"
                        [style.borderColor]="corPrioridade(t.prioridade) + '55'"
                        [style.borderLeftColor]="corPrioridade(t.prioridade)"
                        [style.boxShadow]="t.status === 3 ? 'inset 0 0 0 1px rgb(var(--c-danger) / 0.7)' : null"
                        (click)="abrirDetalhe(t)"
                      >
                        <div class="flex items-center gap-1">
                          @if (t.status === 3) {
                            <i class="fa-solid fa-triangle-exclamation text-danger text-[9px] shrink-0"></i>
                          }
                          <div class="text-[12px] font-medium truncate">{{ t.nome }}</div>
                        </div>
                        @if (t.horarioFinal) {
                          <div class="text-[10px] tabular-nums opacity-80">{{ t.horarioFinal.substring(0, 5) }}</div>
                        }
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop: grid 7 cols -->
          <div class="hidden md:block card-elev overflow-hidden">
            <div class="overflow-y-auto" style="max-height: 70vh; scrollbar-gutter: stable">
            <div class="sticky top-0 z-20 bg-bg-elev grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
              <div></div>
              @for (d of diasSemana(); track d.iso) {
                <div
                  class="px-2 py-2 text-center border-l border-border"
                  [ngClass]="{ 'bg-accent/5': d.hoje }"
                >
                  <div class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">
                    {{ d.diaCurto }}
                  </div>
                  <div
                    class="text-[15px] font-semibold tabular-nums"
                    [class.text-accent]="d.hoje"
                    [class.text-text]="!d.hoje"
                  >
                    {{ d.diaNum }}
                  </div>
                </div>
              }
            </div>

            @if (tarefasSemSlotDaSemana().length > 0) {
              <div class="sticky top-[52px] z-10 grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-bg-elev">
                <div class="text-[10px] uppercase tracking-wider text-text-subtle font-medium px-2 py-2">
                  Sem hora
                </div>
                @for (d of diasSemana(); track d.iso) {
                  <div class="border-l border-border p-1 flex flex-col gap-1 min-h-[40px]">
                    @for (t of tarefasSemSlotPorDia(d.iso); track t.id) {
                      <button
                        type="button"
                        class="text-left text-[11px] px-1.5 py-1 rounded border border-l-[3px] text-text truncate transition-colors"
                        [style.background]="corPrioridade(t.prioridade) + '22'"
                        [style.borderColor]="corPrioridade(t.prioridade) + '55'"
                        [style.borderLeftColor]="corPrioridade(t.prioridade)"
                        [style.boxShadow]="t.status === 3 ? 'inset 0 0 0 1px rgb(var(--c-danger) / 0.7)' : null"
                        [attr.data-testid]="'semana-tarefa-sem-hora-' + t.id"
                        [title]="t.nome"
                        (click)="abrirDetalhe(t)"
                      >
                        {{ t.nome }}
                      </button>
                    }
                  </div>
                }
              </div>
            }

            <div class="relative grid grid-cols-[60px_repeat(7,1fr)]">
              <div class="flex flex-col">
                @for (h of horasSemana(); track h) {
                  <div
                    class="text-[10px] tabular-nums text-text-subtle border-b border-border/40 grid place-items-center"
                    [style.height.px]="alturaSlot()"
                  >
                    {{ formatarHora(h) }}
                  </div>
                }
              </div>

              @if (topoLinhaAgora() !== null && indiceDiaHojeSemana() >= 0) {
                <div
                  class="absolute left-0 right-0 pointer-events-none z-10"
                  [style.top.px]="topoLinhaAgora()"
                  data-testid="semana-linha-agora"
                  aria-hidden="true"
                >
                  <div class="grid grid-cols-[60px_repeat(7,1fr)] items-center">
                    <div class="flex justify-end pr-1">
                      <span
                        class="text-[9px] tabular-nums font-semibold text-white bg-danger px-1 py-px rounded"
                      >{{ rotuloAgora() }}</span>
                    </div>
                    <div class="col-span-7 relative h-px">
                      <div class="absolute inset-x-0 top-0 h-px bg-danger/40"></div>
                      <div
                        class="absolute top-0 h-px bg-danger"
                        [style.left.%]="(indiceDiaHojeSemana() / 7) * 100"
                        [style.width.%]="100 / 7"
                      ></div>
                      <div
                        class="absolute -top-[3px] w-1.5 h-1.5 rounded-full bg-danger"
                        [style.left.%]="(indiceDiaHojeSemana() / 7) * 100"
                      ></div>
                    </div>
                  </div>
                </div>
              }

              @for (d of diasSemana(); track d.iso) {
                <div
                  class="relative border-l border-border"
                  [ngClass]="{ 'bg-accent/5': d.hoje }"
                >
                  @for (h of horasSemana(); track h) {
                    <div
                      class="border-b border-border/40"
                      [style.height.px]="alturaSlot()"
                    ></div>
                  }
                  @for (p of tarefasLayoutSemanaPorDia(d.iso); track p.item.id) {
                    @let t = p.item.tarefa;
                    <button
                      type="button"
                      class="absolute rounded px-1.5 py-1 text-[11px] text-left border border-l-[3px] text-text hover:z-10 overflow-hidden transition-colors"
                      [style.top.px]="p.item.top"
                      [style.left]="estiloPosicaoTarefaSemana(p).left"
                      [style.width]="estiloPosicaoTarefaSemana(p).width"
                      [style.minHeight.px]="alturaSlot() - 4"
                      [style.background]="corPrioridade(t.prioridade) + '22'"
                      [style.borderColor]="corPrioridade(t.prioridade) + '55'"
                      [style.borderLeftColor]="corPrioridade(t.prioridade)"
                      [style.boxShadow]="t.status === 3 ? 'inset 0 0 0 1px rgb(var(--c-danger) / 0.7)' : null"
                      [attr.data-testid]="'semana-tarefa-' + t.id"
                      [title]="t.nome + ' — ' + (t.horarioFinal ?? '')"
                      (click)="abrirDetalhe(t)"
                    >
                      <div class="flex items-center gap-1">
                        @if (t.status === 3) {
                          <i class="fa-solid fa-triangle-exclamation text-danger text-[8px] shrink-0" aria-hidden="true"></i>
                        }
                        <div class="font-medium truncate">{{ t.nome }}</div>
                      </div>
                      @if (t.horarioFinal) {
                        <div class="text-[9px] tabular-nums opacity-80">
                          {{ t.horarioFinal.substring(0, 5) }}
                        </div>
                      }
                    </button>
                  }
                </div>
              }
            </div>
            </div>
          </div>
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
                      class="relative bg-bg-input border border-border rounded p-2.5 cursor-pointer hover:border-border-strong hover:-translate-y-px hover:shadow-md focus:outline-none focus-visible:outline-none transition-all duration-200"
                      style="outline: none !important; -webkit-tap-highlight-color: transparent;"
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
                                class="text-[10px] px-1.5 py-px bg-bg-surface border border-border rounded-full text-text-dim"
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
                  class="relative flex flex-col gap-2 md:grid md:grid-cols-[28px_1fr_auto_auto_auto_auto] md:items-center md:gap-3.5 pl-4 pr-3 py-2.5 rounded border-b border-border last:border-b-0 hover:bg-bg-elev hover:-translate-y-px hover:shadow-md focus-within:bg-bg-elev group transition-all duration-300 ease-out cursor-pointer animate-fade-up"
                  [class.opacity-0]="saindo().has(t.id)"
                  [class.scale-95]="saindo().has(t.id)"
                  [class.pointer-events-none]="processando().has(t.id) || saindo().has(t.id)"
                  [class.bg-accent]="selecionando() && estaSelecionada(t.id)"
                  [class.bg-opacity-10]="selecionando() && estaSelecionada(t.id)"
                  [class.border-accent]="selecionando() && estaSelecionada(t.id)"
                  [class.border-opacity-40]="selecionando() && estaSelecionada(t.id)"
                  [attr.data-testid]="'task-' + t.id"
                  role="button"
                  tabindex="0"
                  (click)="cliqueTarefa(t)"
                  (keydown.enter)="cliqueTarefa(t)"
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
                    @if (selecionando()) {
                      <span
                        class="shrink-0 w-[20px] h-[20px] rounded-md border-[1.5px] grid place-items-center transition-colors"
                        [class]="estaSelecionada(t.id) ? 'bg-accent border-accent' : 'border-border-strong bg-bg-elev'"
                        aria-hidden="true"
                      >
                        @if (estaSelecionada(t.id)) {
                          <i class="fa-solid fa-check text-white text-[11px]"></i>
                        }
                      </span>
                    } @else {
                      <button
                        type="button"
                        class="shrink-0 w-[18px] h-[18px] border-[1.5px] border-border-strong rounded-full grid place-items-center hover:border-accent hover:bg-accent/15 focus:outline-none focus:border-accent focus:bg-accent/15 transition-colors disabled:opacity-50"
                        [attr.data-testid]="'task-' + t.id + '-complete'"
                        (click)="$event.stopPropagation(); concluir(t)"
                        [disabled]="processando().has(t.id)"
                        aria-label="Marcar como feita"
                        title="Marcar como feita"
                      >
                        @if (processando().has(t.id)) {
                          <i class="fa-solid fa-circle-notch fa-spin text-[10px] text-accent"></i>
                        } @else {
                          <i class="fa-solid fa-check text-[10px] text-transparent group-hover:text-accent"></i>
                        }
                      </button>
                    }

                    <div class="text-sm font-medium truncate flex-1 min-w-0">{{ t.nome }}</div>

                    <div class="flex md:hidden gap-0.5 shrink-0">
                      <button
                        type="button"
                        class="w-[28px] h-[28px] rounded grid place-items-center text-text-subtle active:bg-bg-surface focus:outline-none focus:text-text"
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
                          class="text-[11px] px-2 py-0.5 bg-bg-surface border border-border rounded-full text-text-dim whitespace-nowrap"
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
                      class="w-[26px] h-[26px] rounded grid place-items-center text-text-subtle hover:bg-bg-surface hover:text-text focus:outline-none focus:text-text focus:bg-bg-surface"
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

    <!-- FAB mobile -->
    @if (!selecionando()) {
      <button
        type="button"
        class="fab-anim md:hidden fixed bottom-20 right-4 z-30 h-14 rounded-full btn-primary shadow-lg flex items-center justify-center text-white overflow-hidden transition-[padding,gap] duration-[600ms] ease-out"
        [class]="fabExpandido() ? 'pl-4 pr-5 gap-2' : 'w-14 px-0'"
        data-testid="tarefas-fab"
        aria-label="Nova tarefa"
        (click)="abrirNova()"
      >
        <i class="fa-solid fa-plus text-[18px] shrink-0"></i>
        <span
          class="text-[14px] font-semibold whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-[600ms] ease-out"
          [class]="fabExpandido() ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0'"
        >{{ locale.t('tarefas.nova_tarefa') }}</span>
      </button>
    }

    <!-- Bulk action bar contextual -->
    @if (selecionando()) {
      <div
        class="fixed bottom-16 md:bottom-4 left-3 right-3 md:left-1/2 md:-translate-x-1/2 md:right-auto md:max-w-[600px] md:w-[90%] z-40 card-elev px-3 py-2.5 flex items-center gap-2 shadow-lg animate-fade-up"
        data-testid="bulk-action-bar"
        role="toolbar"
        aria-label="Ações em massa"
      >
        <button
          type="button"
          class="w-8 h-8 grid place-items-center rounded text-text-dim hover:text-text hover:bg-bg-elev"
          data-testid="bulk-cancel"
          aria-label="Cancelar seleção"
          (click)="sairSelecao()"
        >
          <i class="fa-solid fa-xmark text-[12px]"></i>
        </button>
        <span class="text-[13px] font-medium tabular-nums">
          {{ selecionados().size }} selecionada{{ selecionados().size === 1 ? '' : 's' }}
        </span>
        <button
          type="button"
          class="ml-auto text-[11px] text-text-dim hover:text-accent underline underline-offset-2"
          data-testid="bulk-select-all"
          (click)="selecionarTodas()"
        >
          Selecionar todas
        </button>
        <div class="w-px h-6 bg-border mx-1"></div>
        <button
          type="button"
          class="px-3 py-1.5 rounded text-[12px] font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          data-testid="bulk-concluir"
          [disabled]="selecionados().size === 0"
          (click)="concluirSelecionadas()"
        >
          <i class="fa-solid fa-check text-[10px]"></i>
          <span class="hidden sm:inline">{{ locale.t('tarefas.concluir') }}</span>
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded text-[12px] font-medium bg-danger/15 text-danger hover:bg-danger/25 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          data-testid="bulk-excluir"
          [disabled]="selecionados().size === 0"
          (click)="excluirSelecionadas()"
        >
          <i class="fa-solid fa-trash text-[10px]"></i>
          <span class="hidden sm:inline">{{ locale.t('tarefas.excluir') }}</span>
        </button>
      </div>
    }

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

    @if (toast(); as t) {
      <div
        class="fixed bottom-24 right-4 left-4 md:bottom-6 md:right-6 md:left-auto z-[60] rounded-lg px-4 py-3 text-[13px] shadow-xl md:max-w-sm slide-up flex items-center gap-3 border toast-sucesso"
        data-testid="tarefas-toast"
        role="status"
      >
        <span
          class="w-7 h-7 rounded-full grid place-items-center shrink-0 toast-sucesso-icone"
          aria-hidden="true"
        >
          <i class="fa-solid fa-check text-[13px]"></i>
        </span>
        <span class="flex-1 leading-snug font-medium">{{ t }}</span>
      </div>
    }

    @if (tarefaDetalhe(); as t) {
      <app-tarefa-detalhe-modal
        [tarefa]="t"
        (fechado)="tarefaDetalhe.set(null)"
        (editarTudo)="editarDoDetalhe($event)"
        (concluir)="concluirDoDetalhe($event)"
        (excluir)="pedirExcluirDoDetalhe($event)"
      ></app-tarefa-detalhe-modal>
    }

    @if (categoriasModalAberto()) {
      <app-categorias-modal
        (fechado)="categoriasModalAberto.set(false)"
      ></app-categorias-modal>
    }
  `,
  styles: [`
    @keyframes fab-pop-in {
      0%   { transform: scale(0.5); opacity: 0; }
      55%  { transform: scale(1.12); opacity: 1; }
      80%  { transform: scale(0.96); }
      100% { transform: scale(1); }
    }
    .fab-anim {
      animation: fab-pop-in 700ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
  `],
})
export class TarefasComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly tarefasApi = inject(TarefasService);
  private readonly route = inject(ActivatedRoute);
  private readonly pageHeader = inject(PageHeaderService);
  readonly locale = inject(LocaleService);
  private readonly subtituloTplRef = viewChild<TemplateRef<unknown>>('subtituloTpl');
  private readonly acoesTplRef = viewChild<TemplateRef<unknown>>('acoesTpl');

  constructor() {
    this.pageHeader.set({
      titulo: this.locale.t('tarefas.titulo'),
      iconeClasse: 'fa-solid fa-list-check text-accent text-[12px]',
    });
    effect(() => {
      const _ = this.locale.locale();
      this.aplicarTemplatesPageHeader();
      this.erroLista.set(null);
    });
  }

  private aplicarTemplatesPageHeader(): void {
    this.pageHeader.set({
      titulo: this.locale.t('tarefas.titulo'),
      iconeClasse: 'fa-solid fa-list-check text-accent text-[12px]',
    });
  }

  readonly pendentes = signal<Tarefa[]>([]);
  readonly carregando = signal(true);
  readonly formAberto = signal(false);
  readonly emEdicao = signal<Tarefa | null>(null);
  readonly tarefaDetalhe = signal<Tarefa | null>(null);
  readonly categoriasModalAberto = signal(false);
  readonly processando = signal(new Set<string>());
  readonly saindo = signal(new Set<string>());
  readonly erroLista = signal<string | null>(null);
  readonly toast = signal<string | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  readonly confirmacao = signal<Confirmacao | null>(null);
  readonly view = signal<TarefasView>(this.lerView());
  readonly filtros = signal<FiltrosTarefas>(this.lerFiltros());
  readonly filtrosAbertos = signal(false);
  readonly selecionando = signal(false);
  readonly selecionados = signal<Set<string>>(new Set());
  readonly fabExpandido = signal(true);
  readonly semanaInicio = signal<Date>(this.segundaDaSemana(new Date()));
  readonly diaSelecionadoSemana = signal<string>(this.dateParaIsoLocal(new Date()));
  readonly alturaSlot = signal(40);
  readonly agora = signal(new Date());
  private agoraTimer: number | null = null;
  private static readonly HORA_MIN = 0;
  private static readonly HORA_MAX = 23;

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
      (f.statusAtraso !== 'todas' ? 1 : 0) +
      (f.periodo !== 'todas' ? 1 : 0)
    );
  });

  readonly tarefasFiltradas = computed(() => {
    const f = this.filtros();
    const range = this.rangePeriodo(f.periodo);
    return this.pendentes().filter((t) => {
      if (f.categoriaIds.length > 0) {
        const tem = t.categorias.some((c) => f.categoriaIds.includes(c.id));
        if (!tem) return false;
      }
      if (f.prioridades.length > 0 && !f.prioridades.includes(t.prioridade)) return false;
      if (f.statusAtraso === 'atrasadas' && t.status !== 3) return false;
      if (f.statusAtraso === 'noprazo' && t.status === 3) return false;
      if (range) {
        if (!t.dataPrazo) return false;
        const d = this.parseDataLocal(t.dataPrazo);
        if (!d) return false;
        if (d < range.inicio || d > range.fim) return false;
      }
      return true;
    });
  });

  private rangePeriodo(p: PeriodoFiltro): { inicio: Date; fim: Date } | null {
    if (p === 'todas') return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (p === 'hoje') {
      const fim = new Date(hoje);
      fim.setHours(23, 59, 59, 999);
      return { inicio: hoje, fim };
    }
    if (p === 'amanha') {
      const ini = new Date(hoje);
      ini.setDate(ini.getDate() + 1);
      const fim = new Date(ini);
      fim.setHours(23, 59, 59, 999);
      return { inicio: ini, fim };
    }
    if (p === 'semana') {
      const ini = this.segundaDaSemana(hoje);
      const fim = new Date(ini);
      fim.setDate(fim.getDate() + 6);
      fim.setHours(23, 59, 59, 999);
      return { inicio: ini, fim };
    }
    if (p === 'mes') {
      const ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);
      return { inicio: ini, fim };
    }
    // proximoMes
    const ini = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 0, 23, 59, 59, 999);
    return { inicio: ini, fim };
  }

  private parseDataLocal(iso: string): Date | null {
    // dataPrazo vem como ISO 'YYYY-MM-DD' ou ISO completa. Usa só a parte da data, local.
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  // ===== Stats hero =====
  readonly qtdAtrasadas = computed(() => this.pendentes().filter((t) => t.status === 3).length);
  readonly qtdHoje = computed(() => {
    const hoje = this.isoDataLocalAgora();
    return this.pendentes().filter((t) => t.status !== 3 && t.dataPrazo?.substring(0, 10) === hoje).length;
  });

  subtituloHero(): string {
    const total = this.pendentes().length;
    const atr = this.qtdAtrasadas();
    if (total === 0) return this.locale.t('tarefas.tudo_em_dia');
    const palavraPendentes = total === 1 ? this.locale.t('tarefas.pendente') : this.locale.t('tarefas.pendentes_lc');
    const partes: string[] = [`${total} ${palavraPendentes}`];
    if (atr > 0) {
      const palavraAtrasada = atr === 1 ? this.locale.t('tarefas.atrasada') : this.locale.t('tarefas.atrasadas_lc');
      partes.push(`${atr} ${palavraAtrasada}`);
    }
    return partes.join(' · ');
  }

  private isoDataLocalAgora(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // ===== Bulk selection =====
  toggleSelecao(id: string): void {
    this.selecionados.update((s) => {
      const novo = new Set(s);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  estaSelecionada(id: string): boolean {
    return this.selecionados().has(id);
  }

  entrarSelecao(): void {
    this.selecionando.set(true);
  }

  toggleSelecionar(): void {
    if (this.selecionando()) {
      this.sairSelecao();
    } else {
      this.entrarSelecao();
    }
  }

  sairSelecao(): void {
    this.selecionando.set(false);
    this.selecionados.set(new Set());
  }

  selecionarTodas(): void {
    const ids = this.tarefasFiltradas().map((t) => t.id);
    this.selecionados.set(new Set(ids));
  }

  excluirSelecionadas(): void {
    const ids = [...this.selecionados()];
    if (ids.length === 0) return;
    this.confirmacao.set({
      titulo: `Excluir ${ids.length} tarefa${ids.length === 1 ? '' : 's'}?`,
      mensagem: 'Essa ação não pode ser desfeita.',
      textoConfirmar: 'Excluir',
      acao: () => {
        this.confirmacao.set(null);
        this.executarBulkExcluir(ids);
      },
    });
  }

  private executarBulkExcluir(ids: string[]): void {
    let restantes = ids.length;
    for (const id of ids) {
      this.processando.update((p) => new Set(p).add(id));
      this.tarefasApi.remover(id).subscribe({
        next: () => {
          this.processando.update((p) => { const n = new Set(p); n.delete(id); return n; });
          this.pendentes.update((lst) => lst.filter((t) => t.id !== id));
          restantes--;
          if (restantes === 0) {
            this.sairSelecao();
            this.mostrarToast(`${ids.length} tarefa${ids.length === 1 ? '' : 's'} removida${ids.length === 1 ? '' : 's'}.`);
          }
        },
        error: () => {
          this.processando.update((p) => { const n = new Set(p); n.delete(id); return n; });
          restantes--;
          if (restantes === 0) {
            this.sairSelecao();
            this.erroLista.set('Algumas exclusões falharam.');
          }
        },
      });
    }
  }

  concluirSelecionadas(): void {
    const ids = [...this.selecionados()];
    if (ids.length === 0) return;
    let restantes = ids.length;
    for (const id of ids) {
      this.processando.update((p) => new Set(p).add(id));
      this.tarefasApi.concluir(id).subscribe({
        next: () => {
          this.processando.update((p) => { const n = new Set(p); n.delete(id); return n; });
          this.pendentes.update((lst) => lst.filter((t) => t.id !== id));
          restantes--;
          if (restantes === 0) {
            this.sairSelecao();
            this.mostrarToast(`${ids.length} tarefa${ids.length === 1 ? '' : 's'} concluída${ids.length === 1 ? '' : 's'}.`);
          }
        },
        error: () => {
          this.processando.update((p) => { const n = new Set(p); n.delete(id); return n; });
          restantes--;
          if (restantes === 0) {
            this.sairSelecao();
            this.erroLista.set('Algumas conclusões falharam.');
          }
        },
      });
    }
  }

  readonly colunasKanban = computed<ColunaKanban[]>(() => {
    const _ = this.locale.locale();
    const ordem = [
      { prioridade: 1, titulo: this.locale.t('form.prioridade_urgente'), cor: '#eb5757' },
      { prioridade: 2, titulo: this.locale.t('form.prioridade_importante'), cor: '#f59e0b' },
      { prioridade: 3, titulo: this.locale.t('form.prioridade_normal'), cor: '#5e6ad2' },
      { prioridade: 4, titulo: this.locale.t('form.prioridade_baixa'), cor: '#62666d' },
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

  ngAfterViewInit(): void {
    this.aplicarTemplatesPageHeader();
  }

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    const v = qp.get('view');
    if (v === 'semana' || v === 'kanban' || v === 'lista') {
      this.setView(v);
    }
    const periodo = qp.get('periodo');
    const status = qp.get('status');
    if (periodo || status) {
      this.limparFiltros();
    }
    if (periodo && PERIODOS_VALIDOS.includes(periodo as PeriodoFiltro)) {
      this.setFiltroPeriodo(periodo as PeriodoFiltro);
    }
    if (status === 'atrasadas' || status === 'noprazo' || status === 'todas') {
      this.setFiltroStatus(status);
    }
    const detalheId = qp.get('detalhe');
    this.carregar(detalheId ?? undefined);
    this.agoraTimer = window.setInterval(() => this.agora.set(new Date()), 60000);
    setTimeout(() => this.fabExpandido.set(false), 2500);
  }

  ngOnDestroy(): void {
    if (this.agoraTimer !== null) {
      window.clearInterval(this.agoraTimer);
      this.agoraTimer = null;
    }
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
    this.pageHeader.limpar();
  }

  carregar(abrirDetalheId?: string): void {
    this.carregando.set(true);
    this.erroLista.set(null);
    this.tarefasApi.listarPendentes().subscribe({
      next: (lista) => {
        this.pendentes.set(lista);
        this.carregando.set(false);
        if (abrirDetalheId) {
          const t = lista.find((x) => x.id === abrirDetalheId);
          if (t) this.abrirDetalhe(t);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.carregando.set(false);
        const fallback = this.locale.t('errors.carregar_tarefas');
        const r = extrairProblemDetails(err, fallback, this.locale.t('errors.sem_conexao'));
        this.erroLista.set(r.mensagemGeral ?? fallback);
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
        const fallback = this.locale.t('errors.concluir_tarefa');
        const r = extrairProblemDetails(err, fallback, this.locale.t('errors.sem_conexao'));
        this.erroLista.set(r.mensagemGeral ?? fallback);
      },
    });
  }

  pedirExcluir(t: Tarefa): void {
    this.confirmacao.set({
      titulo: this.locale.t('confirm.excluir_tarefa_titulo'),
      mensagem: this.locale.t('confirm.excluir_tarefa_msg', { nome: t.nome }),
      textoConfirmar: this.locale.t('confirm.excluir'),
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
        const fallback = this.locale.t('errors.excluir_tarefa');
        const r = extrairProblemDetails(err, fallback, this.locale.t('errors.sem_conexao'));
        this.erroLista.set(r.mensagemGeral ?? fallback);
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

  /**
   * Click handler unificado: se modo selecionando ativo, alterna seleção.
   * Senão abre detalhe.
   */
  cliqueTarefa(t: Tarefa): void {
    if (this.selecionando()) {
      this.toggleSelecao(t.id);
    } else {
      this.abrirDetalhe(t);
    }
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

  // ===== View toggle =====
  setView(v: TarefasView): void {
    this.view.set(v);
    try {
      localStorage.setItem(STORAGE_VIEW, v);
    } catch {
      /* ignora */
    }
  }

  // ===== Semana =====
  navegarSemana(delta: number): void {
    const nova = new Date(this.semanaInicio());
    nova.setDate(nova.getDate() + delta * 7);
    this.semanaInicio.set(nova);
    // Sincroniza dia selecionado pro primeiro dia da nova semana
    this.diaSelecionadoSemana.set(this.dateParaIsoLocal(nova));
  }

  navegarDiaSemana(delta: number): void {
    const atual = this.parseDataLocal(this.diaSelecionadoSemana());
    if (!atual) return;
    atual.setDate(atual.getDate() + delta);
    const novoIso = this.dateParaIsoLocal(atual);
    this.diaSelecionadoSemana.set(novoIso);
    // Se saiu da semana exibida, ajusta semanaInicio
    const inicio = this.segundaDaSemana(atual);
    this.semanaInicio.set(inicio);
  }

  setDiaSelecionado(iso: string): void {
    this.diaSelecionadoSemana.set(iso);
  }

  irHoje(): void {
    const hoje = new Date();
    this.semanaInicio.set(this.segundaDaSemana(hoje));
    this.diaSelecionadoSemana.set(this.dateParaIsoLocal(hoje));
  }

  semanaAtualExibida(): boolean {
    const hojeIso = this.dateParaIsoLocal(new Date());
    return this.diasSemana().some((d) => d.iso === hojeIso);
  }

  diaSelecionadoEhHoje(): boolean {
    return this.diaSelecionadoSemana() === this.dateParaIsoLocal(new Date());
  }

  rotuloDiaSelecionado(): string {
    const d = this.parseDataLocal(this.diaSelecionadoSemana());
    if (!d) return '';
    const diasKey = ['dia.domingo', 'dia.segunda', 'dia.terca', 'dia.quarta', 'dia.quinta', 'dia.sexta', 'dia.sabado'];
    const mesesKey = ['mes.jan','mes.fev','mes.mar','mes.abr','mes.mai','mes.jun','mes.jul','mes.ago','mes.set','mes.out','mes.nov','mes.dez'];
    return `${this.locale.t(diasKey[d.getDay()])}, ${d.getDate()} ${this.locale.t(mesesKey[d.getMonth()])}`;
  }

  // Layout do dia selecionado (mobile day view)
  tarefasLayoutDiaSelecionado(): ItemAgendaPosicionado<{ id: string; top: number; alturaPx: number; tarefa: Tarefa }>[] {
    return this.tarefasLayoutSemanaPorDia(this.diaSelecionadoSemana());
  }

  tarefasSemHoraDiaSelecionado(): Tarefa[] {
    return this.tarefasSemSlotPorDia(this.diaSelecionadoSemana());
  }

  readonly diasSemana = computed(() => {
    const inicio = this.semanaInicio();
    const hojeIso = this.dateParaIsoLocal(new Date());
    const dias: { iso: string; diaNum: number; diaCurto: string; hoje: boolean }[] = [];
    const _ = this.locale.locale();
    const labels = [
      this.locale.t('dia.seg'),
      this.locale.t('dia.ter'),
      this.locale.t('dia.qua'),
      this.locale.t('dia.qui'),
      this.locale.t('dia.sex'),
      this.locale.t('dia.sab'),
      this.locale.t('dia.dom'),
    ];
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      const iso = this.dateParaIsoLocal(d);
      dias.push({ iso, diaNum: d.getDate(), diaCurto: labels[i], hoje: iso === hojeIso });
    }
    return dias;
  });

  readonly horasSemana = computed(() => {
    const arr: number[] = [];
    for (let h = TarefasComponent.HORA_MIN; h <= TarefasComponent.HORA_MAX; h++) arr.push(h);
    return arr;
  });

  rotuloSemana(): string {
    const dias = this.diasSemana();
    if (dias.length === 0) return '';
    const inicio = new Date(dias[0].iso);
    const fim = new Date(dias[6].iso);
    const fmt = (d: Date) => `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    return `${fmt(inicio)} – ${fmt(fim)} ${fim.getUTCFullYear()}`;
  }

  formatarHora(h: number): string {
    return `${String(h).padStart(2, '0')}h`;
  }

  private tarefasDaSemanaCache(): Tarefa[] {
    const inicioIso = this.diasSemana()[0]?.iso;
    const fimIso = this.diasSemana()[6]?.iso;
    if (!inicioIso || !fimIso) return [];
    return this.tarefasFiltradas().filter((t) => {
      if (!t.dataPrazo) return false;
      const iso = t.dataPrazo.substring(0, 10);
      return iso >= inicioIso && iso <= fimIso;
    });
  }

  readonly tarefasComSlotDaSemana = computed(() =>
    this.tarefasDaSemanaCache().filter((t) => !!t.horarioFinal),
  );

  readonly tarefasSemSlotDaSemana = computed(() =>
    this.tarefasDaSemanaCache().filter((t) => !t.horarioFinal),
  );

  tarefasComSlotPorDia(iso: string): Tarefa[] {
    return this.tarefasComSlotDaSemana()
      .filter((t) => t.dataPrazo?.substring(0, 10) === iso)
      .sort((a, b) => (a.horarioFinal ?? '').localeCompare(b.horarioFinal ?? ''));
  }

  tarefasLayoutSemanaPorDia(iso: string): ItemAgendaPosicionado<{ id: string; top: number; alturaPx: number; tarefa: Tarefa }>[] {
    const altura = this.alturaSlot();
    const items = this.tarefasComSlotPorDia(iso).map((t) => ({
      id: String(t.id),
      top: this.topoTarefa(t),
      alturaPx: altura - 4,
      tarefa: t,
    }));
    return calcularLayoutAgenda(items);
  }

  estiloPosicaoTarefaSemana(p: ItemAgendaPosicionado<{ id: string; top: number; alturaPx: number }>): { left: string; width: string } {
    const w = 100 / p.totalCols;
    return {
      left: `calc(${p.col * w}% + 2px)`,
      width: `calc(${w}% - 4px)`,
    };
  }

  tarefasSemSlotPorDia(iso: string): Tarefa[] {
    return this.tarefasSemSlotDaSemana().filter((t) => t.dataPrazo?.substring(0, 10) === iso);
  }

  topoTarefa(t: Tarefa): number {
    if (!t.horarioFinal) return 0;
    const [hh, mm] = t.horarioFinal.substring(0, 5).split(':').map((x) => parseInt(x, 10));
    const altura = this.alturaSlot();
    const offsetHoras = Math.max(0, hh - TarefasComponent.HORA_MIN);
    return offsetHoras * altura + Math.round((mm / 60) * altura);
  }

  /** Posicao em px da linha do agora dentro da grade da semana. null se fora do range visivel. */
  topoLinhaAgora(): number | null {
    const a = this.agora();
    const hh = a.getHours();
    const mm = a.getMinutes();
    if (hh < TarefasComponent.HORA_MIN || hh > TarefasComponent.HORA_MAX) return null;
    const altura = this.alturaSlot();
    return (hh - TarefasComponent.HORA_MIN) * altura + Math.round((mm / 60) * altura);
  }

  /** Indice 0-6 (Seg-Dom) do dia de hoje na semana atualmente exibida, ou -1 se hoje nao esta na semana. */
  indiceDiaHojeSemana(): number {
    const hojeIso = this.dateParaIsoLocal(this.agora());
    return this.diasSemana().findIndex((d) => d.iso === hojeIso);
  }

  rotuloAgora(): string {
    const a = this.agora();
    return `${String(a.getHours()).padStart(2, '0')}:${String(a.getMinutes()).padStart(2, '0')}`;
  }

  private segundaDaSemana(d: Date): Date {
    const data = new Date(d);
    const dia = data.getDay(); // 0=dom, 1=seg
    const diff = dia === 0 ? -6 : 1 - dia;
    data.setDate(data.getDate() + diff);
    data.setHours(0, 0, 0, 0);
    return data;
  }

  private dateParaIsoLocal(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // ===== Filtros =====
  toggleFiltrosPanel(): void {
    this.filtrosAbertos.update((v) => !v);
  }

  @HostListener('document:click')
  fecharFiltrosPorClique(): void {
    if (this.filtrosAbertos()) this.filtrosAbertos.set(false);
  }

  @HostListener('document:keydown.escape')
  fecharFiltrosPorEsc(): void {
    if (this.filtrosAbertos()) this.filtrosAbertos.set(false);
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

  setFiltroPeriodo(v: PeriodoFiltro): void {
    this.atualizarFiltros((f) => ({ ...f, periodo: v }));
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
        periodo:
          parsed.periodo && PERIODOS_VALIDOS.includes(parsed.periodo as PeriodoFiltro)
            ? (parsed.periodo as PeriodoFiltro)
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
    const editou = this.emEdicao() !== null;
    this.fecharForm();
    this.carregar();
    this.mostrarToast(editou ? 'Tarefa editada.' : 'Tarefa criada.');
  }

  private mostrarToast(texto: string): void {
    this.toast.set(texto);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 3500);
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

    if (diasDiff === 0) return `${this.locale.t('data.hoje')}${horaSufixo}`;
    if (diasDiff === 1) return `${this.locale.t('data.amanha')}${horaSufixo}`;
    if (diasDiff === -1) return `${this.locale.t('data.ontem')}${horaSufixo}`;

    if (diasDiff > 0) {
      return `${this.locale.t('tarefas.em')} ${this.frasePeriodo(alvo, hoje)}`;
    }

    return `${this.frasePeriodo(hoje, alvo)} ${this.locale.t('tarefas.atras')}`;
  }

  private frasePeriodo(maior: Date, menor: Date): string {
    const diasDiff = Math.round((maior.getTime() - menor.getTime()) / 86400000);

    if (diasDiff < 30) {
      return `${diasDiff} ${this.locale.t('tarefas.dias_lc')}`;
    }

    const anosDiff = maior.getFullYear() - menor.getFullYear();
    const mesesDiff = anosDiff * 12 + (maior.getMonth() - menor.getMonth());
    const ajusteMes = maior.getDate() < menor.getDate() ? -1 : 0;
    const meses = mesesDiff + ajusteMes;

    if (meses < 12) {
      return meses === 1 ? this.locale.t('tarefas.mes_1') : this.locale.t('tarefas.meses_n', { n: meses + '' });
    }

    const anos = Math.floor(meses / 12);
    return anos === 1 ? this.locale.t('tarefas.ano_1') : this.locale.t('tarefas.anos_n', { n: anos + '' });
  }
}
