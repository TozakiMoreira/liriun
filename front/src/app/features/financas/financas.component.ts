import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ConfirmModalComponent } from '../../shared/confirm-modal.component';
import { PageHeaderService } from '../../core/layout/page-header.service';
import {
  Balanco,
  BalancoCategoria,
  CategoriaLancamento,
  FinancasService,
  ICONES_CATEGORIA,
  Lancamento,
  ROTULOS_CATEGORIA,
  StatusLancamento,
  TipoLancamento,
} from '../../core/api/financas.service';
import { LancamentoFormComponent } from './lancamento-form.component';

type Modo = 'mensal' | 'anual';
type FiltroTipo = 'todos' | 'receita' | 'despesa';
type FiltroStatus = 'todos' | 'pendente' | 'pago';

@Component({
  selector: 'app-financas',
  standalone: true,
  imports: [CommonModule, LancamentoFormComponent, ConfirmModalComponent],
  template: `
    <div class="flex-1 px-4 md:px-8 py-5 md:py-6 overflow-auto w-full max-w-[1400px] mx-auto pb-24 md:pb-6" data-testid="financas-page">

      <!-- ===== Hero ===== -->
      <section class="flex flex-col gap-3 mb-5">
        <div class="flex items-end justify-between gap-3">
          <div class="flex flex-col gap-0.5">
            <span class="text-[10px] uppercase tracking-wider text-text-subtle font-semibold">Balanço</span>
            <h1 class="text-[20px] md:text-[26px] font-semibold tracking-tight leading-tight capitalize">
              {{ rotuloPeriodo() }}
            </h1>
          </div>
          <button
            type="button"
            class="hidden md:inline-flex btn-primary text-[12px] py-1.5 px-3 items-center gap-1.5 shrink-0"
            data-testid="financas-novo-desktop"
            (click)="abrirNovo(2)"
          >
            <i class="fa-solid fa-plus text-[10px]"></i>
            Novo lançamento
          </button>
        </div>

        <!-- Toolbar (modo + periodo) - linha unica em mobile + desktop -->
        <div class="flex items-stretch gap-2 flex-wrap">
          <div class="flex bg-bg-elev border border-border rounded-lg p-0.5 h-9" role="tablist" aria-label="Modo de visualização">
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="modo() === 'mensal'"
              class="px-3 rounded text-[12px] font-medium transition-colors"
              [class]="modo() === 'mensal' ? 'bg-bg-input text-text' : 'text-text-dim'"
              (click)="setModo('mensal')"
            >Mensal</button>
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="modo() === 'anual'"
              class="px-3 rounded text-[12px] font-medium transition-colors"
              [class]="modo() === 'anual' ? 'bg-bg-input text-text' : 'text-text-dim'"
              (click)="setModo('anual')"
            >Anual</button>
          </div>

          <div class="relative flex-1 min-w-[200px]" (click)="$event.stopPropagation()">
            <div class="flex items-stretch h-9 bg-bg-elev border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                class="w-9 grid place-items-center text-text-dim hover:text-text hover:bg-bg-input transition-colors"
                [attr.aria-label]="modo() === 'mensal' ? 'Mês anterior' : 'Ano anterior'"
                (click)="navegar(-1)"
              ><i class="fa-solid fa-chevron-left text-[11px]"></i></button>
              <button
                type="button"
                class="flex-1 px-3 text-[13px] font-medium hover:bg-bg-input transition-colors flex items-center gap-2 justify-center"
                data-testid="financas-periodo"
                [attr.aria-expanded]="periodoAberto()"
                aria-haspopup="true"
                (click)="togglePeriodo()"
              >
                <i class="fa-regular fa-calendar text-text-dim text-[11px]"></i>
                <span class="capitalize">{{ rotuloPeriodo() }}</span>
                <i class="fa-solid fa-chevron-down text-text-subtle text-[9px] transition-transform" [class.rotate-180]="periodoAberto()"></i>
              </button>
              <button
                type="button"
                class="w-9 grid place-items-center text-text-dim hover:text-text hover:bg-bg-input transition-colors"
                [attr.aria-label]="modo() === 'mensal' ? 'Próximo mês' : 'Próximo ano'"
                (click)="navegar(1)"
              ><i class="fa-solid fa-chevron-right text-[11px]"></i></button>
            </div>

            @if (periodoAberto()) {
              <div
                class="absolute top-full left-0 right-0 sm:right-auto mt-1.5 z-30 card-elev p-3 sm:w-[280px] animate-fade-down"
                data-testid="financas-periodo-popover"
                role="dialog"
              >
                <div class="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    class="w-7 h-7 grid place-items-center rounded text-text-dim hover:text-text hover:bg-bg-input"
                    aria-label="Ano anterior"
                    (click)="ano.set(ano() - 1)"
                  ><i class="fa-solid fa-chevron-left text-[10px]"></i></button>
                  <div class="text-[13px] font-semibold tabular-nums">{{ ano() }}</div>
                  <button
                    type="button"
                    class="w-7 h-7 grid place-items-center rounded text-text-dim hover:text-text hover:bg-bg-input"
                    aria-label="Próximo ano"
                    (click)="ano.set(ano() + 1)"
                  ><i class="fa-solid fa-chevron-right text-[10px]"></i></button>
                </div>

                @if (modo() === 'mensal') {
                  <div class="grid grid-cols-3 gap-1">
                    @for (m of [1,2,3,4,5,6,7,8,9,10,11,12]; track m) {
                      <button
                        type="button"
                        class="px-2 py-2 rounded text-[12px] font-medium capitalize transition-colors"
                        [class]="
                          mes() === m && ano() === anoSelecionado()
                            ? 'bg-accent text-white'
                            : (m === mesAtual() && ano() === anoAtual()
                                ? 'bg-bg-input text-accent border border-accent/40'
                                : 'bg-bg-surface text-text hover:bg-bg-input')
                        "
                        (click)="selecionarMes(m)"
                      >
                        {{ NOMES_MES_CURTO[m - 1] }}
                      </button>
                    }
                  </div>
                } @else {
                  <div class="text-[11px] text-text-subtle text-center py-2">
                    Visualizando o ano inteiro de {{ ano() }}.
                  </div>
                }

                <div class="flex justify-between items-center mt-3 pt-2 border-t border-border">
                  <button
                    type="button"
                    class="text-[11px] text-text-dim hover:text-accent"
                    (click)="hoje()"
                  >Hoje</button>
                  <button
                    type="button"
                    class="text-[11px] text-text-subtle hover:text-text"
                    (click)="periodoAberto.set(false)"
                  >Fechar</button>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      @if (carregando() && !balanco()) {
        <p class="text-text-subtle text-sm py-8 text-center">Carregando seu balanço...</p>
      } @else if (erro()) {
        <div class="text-[12px] text-danger px-3 py-2 rounded border border-danger/30 bg-danger/10 mb-4">
          {{ erro() }}
        </div>
      } @else {

      <!-- Stat cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5" data-testid="financas-stats">
        <section class="card-elev p-4 flex flex-col gap-1.5 animate-fade-up">
          <div class="flex items-center gap-2 text-[10px] uppercase tracking-wider text-text-subtle font-medium">
            <i class="fa-solid fa-arrow-up text-emerald-500 text-[10px]"></i>
            Recebido
          </div>
          <div class="text-[22px] font-semibold tabular-nums text-emerald-400" data-testid="stat-receitas">
            {{ formatarMoeda(totalReceitas()) }}
          </div>
          <div class="text-[11px] text-text-subtle">{{ qtdReceitas() }} {{ qtdReceitas() === 1 ? 'recebimento' : 'recebimentos' }}</div>
        </section>

        <section class="card-elev p-4 flex flex-col gap-1.5 animate-fade-up" style="animation-delay: 60ms">
          <div class="flex items-center gap-2 text-[10px] uppercase tracking-wider text-text-subtle font-medium">
            <i class="fa-solid fa-arrow-down text-rose-500 text-[10px]"></i>
            Despesas
          </div>
          <div class="text-[22px] font-semibold tabular-nums text-rose-400" data-testid="stat-despesas">
            {{ formatarMoeda(totalDespesasPagas() + totalDespesasPendentes()) }}
          </div>
          <div class="text-[11px] text-text-subtle flex flex-wrap gap-x-2">
            <span><span class="text-rose-400">{{ formatarMoeda(totalDespesasPagas()) }}</span> pago</span>
            @if (totalDespesasPendentes() > 0) {
              <span>· <span class="text-amber-400">{{ formatarMoeda(totalDespesasPendentes()) }}</span> pendente</span>
            }
          </div>
        </section>

        <section
          class="card-elev p-4 flex flex-col gap-1.5 animate-fade-up relative overflow-hidden"
          style="animation-delay: 120ms"
        >
          <div class="absolute inset-0 pointer-events-none" [style.background]="saldoBg()"></div>
          <div class="relative flex items-center gap-2 text-[10px] uppercase tracking-wider text-text-subtle font-medium">
            <i class="fa-solid fa-piggy-bank text-accent-violet text-[10px]"></i>
            Saldo
          </div>
          <div
            class="relative text-[22px] font-semibold tabular-nums"
            [class]="saldo() >= 0 ? 'text-text' : 'text-rose-400'"
            data-testid="stat-saldo"
          >
            {{ formatarMoeda(saldo()) }}
          </div>
          <div class="relative text-[11px] text-text-subtle">
            @if (saldo() >= 0) {
              {{ percentualEconomia() }}% do que recebeu
            } @else {
              Está no negativo, atenção
            }
          </div>
        </section>
      </div>

      <!-- Grid principal -->
      <div class="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-3">

        <!-- Lista lancamentos -->
        <section class="flex flex-col gap-3 min-w-0">
          <!-- Section header: titulo + count + view tabs -->
          <div class="flex flex-col gap-2.5">
            <div class="flex items-baseline justify-between gap-3">
              <h2 class="text-[15px] font-semibold tracking-tight">Lançamentos</h2>
              <span class="text-[11px] text-text-subtle tabular-nums">
                {{ lancamentosFiltrados().length }} {{ lancamentosFiltrados().length === 1 ? 'item' : 'itens' }}
              </span>
            </div>

            <!-- View tabs: full width mobile, label sempre visivel -->
            <div class="grid grid-cols-3 bg-bg-elev border border-border rounded-lg p-0.5 h-9" role="tablist" aria-label="Modo de visualização">
              @for (v of [
                { v: 'lista', label: 'Lista', icone: 'fa-list-ul' },
                { v: 'calendario', label: 'Calendário', icone: 'fa-calendar-days' },
                { v: 'categoria', label: 'Categoria', icone: 'fa-tags' }
              ]; track v.v) {
                <button
                  type="button"
                  role="tab"
                  [attr.aria-selected]="viewLanc() === v.v"
                  class="rounded text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5"
                  [class]="viewLanc() === v.v ? 'bg-bg-input text-text shadow-sm' : 'text-text-dim hover:text-text'"
                  [attr.data-testid]="'view-lanc-' + v.v"
                  (click)="setViewLanc($any(v.v))"
                >
                  <i [class]="'fa-solid ' + v.icone + ' text-[11px]'"></i>
                  <span>{{ v.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Filtros (só lista e categoria) -->
          @if (viewLanc() !== 'calendario') {
            <div class="flex flex-col gap-2 bg-bg-elev/40 border border-border rounded-lg px-3 py-2.5">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium w-12 shrink-0">Tipo</span>
                <div class="flex bg-bg-elev border border-border rounded p-0.5 flex-1 sm:flex-initial">
                  @for (t of [
                    { v: 'todos', label: 'Tudo' },
                    { v: 'receita', label: 'Receita' },
                    { v: 'despesa', label: 'Despesa' }
                  ]; track t.v) {
                    <button
                      type="button"
                      class="flex-1 sm:flex-initial px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap"
                      [class]="filtroTipo() === t.v ? 'bg-bg-input text-text' : 'text-text-dim hover:text-text'"
                      (click)="setFiltroTipo($any(t.v))"
                    >{{ t.label }}</button>
                  }
                </div>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium w-12 shrink-0">Status</span>
                <div class="flex bg-bg-elev border border-border rounded p-0.5 flex-1 sm:flex-initial">
                  @for (s of [
                    { v: 'todos', label: 'Todos' },
                    { v: 'pendente', label: 'A pagar' },
                    { v: 'pago', label: 'Pagos' }
                  ]; track s.v) {
                    <button
                      type="button"
                      class="flex-1 sm:flex-initial px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap"
                      [class]="filtroStatus() === s.v ? 'bg-bg-input text-text' : 'text-text-dim hover:text-text'"
                      (click)="setFiltroStatus($any(s.v))"
                    >{{ s.label }}</button>
                  }
                </div>
              </div>
            </div>
          }

          <!-- ===== Vista LISTA ===== -->
          @if (viewLanc() === 'lista') {
          <section class="card-elev divide-y divide-border" data-testid="financas-lista">
            @if (lancamentosFiltrados().length === 0) {
              <div class="py-12 px-5 text-center flex flex-col items-center gap-3">
                <div class="w-14 h-14 rounded-full bg-bg-surface grid place-items-center">
                  <i class="fa-solid fa-wallet text-text-subtle text-[20px]"></i>
                </div>
                <div class="text-[14px] font-medium">Sem lançamentos ainda</div>
                <p class="text-text-subtle text-[12px] max-w-[320px]">
                  Lance seu primeiro recebimento ou pagamento — eu cuido do balanço pra você.
                </p>
                <button
                  type="button"
                  class="btn-primary text-[12px] py-1.5 px-4 mt-1"
                  (click)="abrirNovo(2)"
                >Novo lançamento</button>
              </div>
            }
            @for (l of lancamentosFiltrados(); track l.id) {
              <article
                class="px-3 sm:px-4 py-3 flex items-start sm:items-center gap-2.5 sm:gap-3 cursor-pointer hover:bg-bg-elev transition-colors"
                [attr.data-testid]="'lancamento-' + l.id"
                (click)="editar(l)"
              >
                <div
                  class="w-9 h-9 rounded-full grid place-items-center shrink-0"
                  [class]="l.tipo === 1 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'"
                >
                  <i [class]="'fa-solid ' + iconeCategoria(l.categoria) + ' text-[12px]'"></i>
                </div>
                <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[13px] font-medium truncate">{{ l.descricao }}</span>
                    @if (l.recorrencia !== 0) {
                      <i class="fa-solid fa-repeat text-accent text-[9px] shrink-0" title="Recorrente"></i>
                    }
                    @if (l.temAnexo) {
                      <i class="fa-solid fa-paperclip text-text-dim text-[9px] shrink-0" title="Tem anexo"></i>
                    }
                  </div>
                  <div class="text-[11px] text-text-subtle flex items-center gap-1.5 flex-wrap">
                    <span>{{ rotuloCategoria(l.categoria) }}</span>
                    <span class="text-text-subtle/50">·</span>
                    <span class="tabular-nums">{{ formatarData(l.dataReferencia) }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span
                      class="text-[14px] font-semibold tabular-nums"
                      [class]="l.tipo === 1 ? 'text-emerald-400' : 'text-text'"
                    >
                      {{ l.tipo === 1 ? '+' : '−' }} {{ formatarMoeda(l.valor) }}
                    </span>
                    @if (l.tipo === 2) {
                      <span
                        class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        [class]="l.status === 2 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'"
                      >{{ l.status === 2 ? 'pago' : 'pendente' }}</span>
                      @if (l.tipo === 2 && l.status === 1 && rotuloPrazo(l.dataReferencia)) {
                        <span class="text-[10px] text-amber-400 font-medium">{{ rotuloPrazo(l.dataReferencia) }}</span>
                      }
                      @if (l.status === 2 && l.pagoEm) {
                        <span class="text-[10px] text-text-subtle tabular-nums">em {{ formatarData(l.pagoEm) }}</span>
                      }
                    }
                  </div>
                </div>
                <div class="flex items-center gap-1 shrink-0 self-start sm:self-center">
                  @if (l.tipo === 2 && l.status === 1) {
                    <button
                      type="button"
                      class="h-8 px-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-colors flex items-center gap-1.5 text-[11px] font-semibold"
                      [attr.data-testid]="'lancamento-pagar-' + l.id"
                      title="Marcar como pago"
                      (click)="$event.stopPropagation(); marcarPago(l)"
                    >
                      <i class="fa-solid fa-check text-[11px]"></i>
                      <span class="hidden sm:inline">Pagar</span>
                    </button>
                  }
                  <button
                    type="button"
                    class="w-8 h-8 grid place-items-center rounded text-text-subtle hover:text-danger hover:bg-danger/10 transition-colors"
                    title="Remover"
                    (click)="$event.stopPropagation(); pedirRemover(l)"
                  >
                    <i class="fa-solid fa-trash text-[12px]"></i>
                  </button>
                </div>
              </article>
            }
          </section>
          }

          <!-- ===== Vista CALENDÁRIO ===== -->
          @if (viewLanc() === 'calendario') {
            <!-- Desktop: grid 7 cols -->
            <section class="card-elev p-4 hidden md:block" data-testid="financas-calendario-grande">
              <div class="grid grid-cols-7 gap-1 text-[10px] text-text-subtle uppercase tracking-wider mb-2">
                <span class="text-center py-1">Seg</span>
                <span class="text-center py-1">Ter</span>
                <span class="text-center py-1">Qua</span>
                <span class="text-center py-1">Qui</span>
                <span class="text-center py-1">Sex</span>
                <span class="text-center py-1">Sáb</span>
                <span class="text-center py-1">Dom</span>
              </div>
              <div class="grid grid-cols-7 gap-1">
                @for (cell of celulasCalendarioGrande(); track $index) {
                  <div
                    class="min-h-[88px] rounded p-1.5 flex flex-col gap-0.5 border transition-colors"
                    [class.bg-accent]="cell.hoje"
                    [class.text-white]="cell.hoje"
                    [class.border-accent]="cell.hoje"
                    [class.bg-bg-surface]="!cell.hoje && cell.dia !== null"
                    [class.border-border]="!cell.hoje && cell.dia !== null"
                    [class.opacity-30]="cell.dia === null"
                  >
                    @if (cell.dia !== null) {
                      <span class="text-[11px] font-medium tabular-nums">{{ cell.dia }}</span>
                      @for (l of cell.lancamentos.slice(0, 3); track l.id) {
                        <button
                          type="button"
                          class="text-left text-[9px] px-1 py-0.5 rounded truncate transition-opacity hover:opacity-80"
                          [class]="
                            l.tipo === 1
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : (l.status === 1 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300')
                          "
                          [attr.data-testid]="'cal-lanc-' + l.id"
                          [title]="l.descricao + ' — ' + formatarMoeda(l.valor)"
                          (click)="$event.stopPropagation(); editar(l)"
                        >
                          @if (l.tipo === 2 && l.status === 1) {
                            <i class="fa-solid fa-circle text-[5px] mr-0.5" aria-hidden="true"></i>
                          }
                          {{ l.descricao }}
                        </button>
                      }
                      @if (cell.lancamentos.length > 3) {
                        <span class="text-[9px] text-text-dim">+ {{ cell.lancamentos.length - 3 }}</span>
                      }
                    }
                  </div>
                }
              </div>
              <div class="flex flex-wrap items-center gap-3 text-[10px] text-text-dim mt-3 pt-3 border-t border-border">
                <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-sm bg-emerald-500/40"></span>Recebimento</span>
                <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-sm bg-amber-500/40"></span>A pagar</span>
                <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-sm bg-rose-500/40"></span>Pago</span>
              </div>
            </section>

            <!-- Mobile: agenda vertical (1 dia por linha com lançamentos completos) -->
            <section class="md:hidden card-elev divide-y divide-border" data-testid="financas-calendario-agenda">
              @if (diasComLancamentos().length === 0) {
                <div class="py-12 px-5 text-center flex flex-col items-center gap-3">
                  <div class="w-14 h-14 rounded-full bg-bg-surface grid place-items-center">
                    <i class="fa-regular fa-calendar text-text-subtle text-[20px]"></i>
                  </div>
                  <div class="text-[14px] font-medium">Nenhum lançamento esse mês</div>
                </div>
              }
              @for (d of diasComLancamentos(); track d.iso) {
                <div class="px-3 py-3 flex gap-3" [class.bg-accent]="d.hoje" [class.bg-opacity-5]="d.hoje">
                  <div class="flex flex-col items-center w-12 shrink-0 leading-none">
                    <span
                      class="text-[20px] font-semibold tabular-nums"
                      [class]="d.hoje ? 'text-accent' : 'text-text'"
                    >{{ d.dia }}</span>
                    <span
                      class="text-[10px] uppercase tracking-wider mt-0.5"
                      [class]="d.hoje ? 'text-accent' : 'text-text-subtle'"
                    >{{ d.diaSemana }}</span>
                    @if (d.hoje) {
                      <span class="text-[8px] text-accent font-bold uppercase mt-0.5">Hoje</span>
                    }
                  </div>
                  <div class="flex-1 min-w-0 flex flex-col gap-1.5">
                    @for (l of d.lancamentos; track l.id) {
                      <button
                        type="button"
                        class="text-left flex items-center gap-2 px-2 py-1.5 rounded border transition-colors"
                        [class]="
                          l.tipo === 1
                            ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15'
                            : (l.status === 1 ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15' : 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/15')
                        "
                        [attr.data-testid]="'cal-mob-lanc-' + l.id"
                        (click)="editar(l)"
                      >
                        <div
                          class="w-7 h-7 rounded-full grid place-items-center shrink-0"
                          [class]="l.tipo === 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'"
                        >
                          <i [class]="'fa-solid ' + iconeCategoria(l.categoria) + ' text-[10px]'"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-1.5">
                            <span class="text-[12px] font-medium truncate">{{ l.descricao }}</span>
                            @if (l.recorrencia !== 0) {
                              <i class="fa-solid fa-repeat text-accent text-[8px]"></i>
                            }
                          </div>
                          <div class="text-[10px] text-text-subtle">
                            {{ rotuloCategoria(l.categoria) }}
                            @if (l.tipo === 2) {
                              ·
                              <span [class]="l.status === 2 ? 'text-emerald-500' : 'text-amber-400'">
                                {{ l.status === 2 ? 'pago' : 'a pagar' }}
                              </span>
                              @if (l.status === 2 && l.pagoEm) {
                                <span class="text-text-subtle"> · pago em {{ formatarData(l.pagoEm) }}</span>
                              }
                            }
                          </div>
                        </div>
                        <span
                          class="text-[12px] font-semibold tabular-nums shrink-0"
                          [class]="l.tipo === 1 ? 'text-emerald-400' : 'text-text'"
                        >
                          {{ l.tipo === 1 ? '+' : '−' }} {{ formatarMoeda(l.valor) }}
                        </span>
                      </button>
                    }
                  </div>
                </div>
              }
            </section>
          }

          <!-- ===== Vista POR CATEGORIA ===== -->
          @if (viewLanc() === 'categoria') {
            @if (gruposPorCategoria().length === 0) {
              <section class="card-elev py-12 px-5 text-center flex flex-col items-center gap-3">
                <div class="w-14 h-14 rounded-full bg-bg-surface grid place-items-center">
                  <i class="fa-solid fa-tags text-text-subtle text-[20px]"></i>
                </div>
                <div class="text-[14px] font-medium">Nada agrupado por aqui</div>
              </section>
            }
            <div class="flex flex-col gap-3">
              @for (g of gruposPorCategoria(); track g.categoria) {
                <section class="card-elev overflow-hidden" [attr.data-testid]="'grupo-cat-' + g.categoria">
                  <header class="flex items-center gap-3 px-4 py-3 border-b border-border bg-bg-surface/50">
                    <div
                      class="w-9 h-9 rounded-full grid place-items-center shrink-0"
                      [class]="g.tipo === 1 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'"
                    >
                      <i [class]="'fa-solid ' + iconeCategoria(g.categoria) + ' text-[13px]'"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-[13px] font-semibold">{{ rotuloCategoria(g.categoria) }}</div>
                      <div class="text-[11px] text-text-subtle">
                        {{ g.itens.length }} {{ g.itens.length === 1 ? 'lançamento' : 'lançamentos' }}
                        @if (g.tipo === 2 && g.pendente > 0) {
                          · <span class="text-amber-400">{{ formatarMoeda(g.pendente) }} a pagar</span>
                        }
                      </div>
                    </div>
                    <div class="text-right shrink-0">
                      <div
                        class="text-[15px] font-semibold tabular-nums"
                        [class]="g.tipo === 1 ? 'text-emerald-400' : 'text-text'"
                      >
                        {{ g.tipo === 1 ? '+' : '−' }} {{ formatarMoeda(g.total) }}
                      </div>
                    </div>
                  </header>
                  <div class="divide-y divide-border">
                    @for (l of g.itens; track l.id) {
                      <article
                        class="px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-bg-elev transition-colors"
                        (click)="editar(l)"
                      >
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-1.5">
                            <span class="text-[13px] truncate">{{ l.descricao }}</span>
                            @if (l.recorrencia !== 0) {
                              <i class="fa-solid fa-repeat text-accent text-[9px]"></i>
                            }
                          </div>
                          <div class="text-[11px] text-text-subtle flex items-center gap-1.5 flex-wrap">
                            <span>{{ formatarData(l.dataReferencia) }}</span>
                            @if (l.tipo === 2 && l.status === 1) {
                              <span class="text-amber-400">· {{ rotuloPrazo(l.dataReferencia) }}</span>
                            }
                            @if (l.tipo === 2 && l.status === 2 && l.pagoEm) {
                              <span class="text-emerald-500">· pago em {{ formatarData(l.pagoEm) }}</span>
                            }
                          </div>
                        </div>
                        <span class="text-[13px] font-medium tabular-nums shrink-0" [class]="l.tipo === 1 ? 'text-emerald-400' : 'text-text'">
                          {{ formatarMoeda(l.valor) }}
                        </span>
                        @if (l.tipo === 2 && l.status === 1) {
                          <button
                            type="button"
                            class="h-7 px-2 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                            title="Marcar como pago"
                            (click)="$event.stopPropagation(); marcarPago(l)"
                          >
                            <i class="fa-solid fa-check text-[10px]"></i>
                            <span class="hidden sm:inline">Pagar</span>
                          </button>
                        }
                      </article>
                    }
                  </div>
                </section>
              }
            </div>
          }
        </section>

        <!-- Lateral: calendário + categorias (só desktop xl) -->
        <aside class="hidden xl:flex flex-col gap-3 min-w-0">
          @if (modo() === 'mensal') {
            <section class="card-elev p-4" data-testid="financas-calendario">
              <h3 class="text-[12px] font-semibold tracking-tight mb-3">Calendário do mês</h3>
              <div class="grid grid-cols-7 gap-1 text-[10px] text-text-subtle uppercase tracking-wider mb-1">
                <span class="text-center">Seg</span><span class="text-center">Ter</span><span class="text-center">Qua</span><span class="text-center">Qui</span><span class="text-center">Sex</span><span class="text-center">Sáb</span><span class="text-center">Dom</span>
              </div>
              <div class="grid grid-cols-7 gap-1">
                @for (slot of celulasCalendario(); track $index) {
                  <div class="aspect-square relative">
                    @if (slot.dia !== null) {
                      <div
                        class="w-full h-full grid place-items-center text-[11px] rounded relative"
                        [class.bg-accent]="slot.hoje"
                        [class.text-white]="slot.hoje"
                        [class.bg-bg-surface]="!slot.hoje && slot.eventos > 0"
                        [class.text-text]="!slot.hoje && slot.eventos > 0"
                        [class.text-text-dim]="!slot.hoje && slot.eventos === 0"
                        [title]="slot.eventos > 0 ? slot.eventos + ' lançamento(s)' : null"
                      >
                        {{ slot.dia }}
                        @if (slot.eventos > 0 && !slot.hoje) {
                          <span class="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"></span>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </section>
          }

          <section class="card-elev p-4" data-testid="financas-categorias">
            <h3 class="text-[12px] font-semibold tracking-tight mb-3">Por categoria</h3>
            @if (categoriasDespesa().length === 0) {
              <p class="text-text-subtle text-[12px] italic">Nada lançado por aqui ainda.</p>
            } @else {
              <div class="flex flex-col gap-2">
                @for (c of categoriasDespesa(); track c.categoria) {
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center justify-between text-[12px]">
                      <span class="flex items-center gap-1.5">
                        <i [class]="'fa-solid ' + iconeCategoria(c.categoria) + ' text-text-dim text-[10px]'"></i>
                        <span class="text-text">{{ rotuloCategoria(c.categoria) }}</span>
                      </span>
                      <span class="tabular-nums text-text-dim">{{ formatarMoeda(c.total) }}</span>
                    </div>
                    <div class="h-1.5 bg-bg-surface rounded overflow-hidden">
                      <div
                        class="h-full bg-rose-400 rounded transition-all"
                        [style.width.%]="percCategoria(c)"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            }
          </section>

          @if (modo() === 'anual') {
            <section class="card-elev p-4" data-testid="financas-grafico-anual">
              <h3 class="text-[12px] font-semibold tracking-tight mb-3">Mês a mês</h3>
              <div class="flex items-end justify-between gap-1 h-32">
                @for (m of mesesAno(); track m.mes) {
                  <div class="flex-1 flex flex-col items-center gap-1 h-full min-w-0">
                    <div class="flex-1 w-full flex items-end gap-0.5 justify-center">
                      @if (m.receitas > 0) {
                        <div
                          class="w-2 bg-emerald-400 rounded-t"
                          [style.height.%]="alturaBarra(m.receitas)"
                          [title]="'Recebido: ' + formatarMoeda(m.receitas)"
                        ></div>
                      }
                      @if (m.despesas > 0) {
                        <div
                          class="w-2 bg-rose-400 rounded-t"
                          [style.height.%]="alturaBarra(m.despesas)"
                          [title]="'Despesas: ' + formatarMoeda(m.despesas)"
                        ></div>
                      }
                    </div>
                    <span class="text-[9px] text-text-subtle uppercase">{{ NOMES_MES_CURTO[m.mes - 1] }}</span>
                  </div>
                }
              </div>
            </section>
          }
        </aside>
      </div>
      }
    </div>

    <!-- FAB mobile (acima do bottom-nav) -->
    <button
      type="button"
      class="fab-anim md:hidden fixed bottom-20 right-4 z-30 h-14 rounded-full btn-primary shadow-lg flex items-center justify-center text-white overflow-hidden transition-[padding,gap] duration-[600ms] ease-out"
      [class]="fabExpandido() ? 'pl-4 pr-5 gap-2' : 'w-14 px-0'"
      data-testid="financas-fab"
      aria-label="Novo lançamento"
      (click)="abrirNovo(2)"
    >
      <i class="fa-solid fa-plus text-[18px] shrink-0"></i>
      <span
        class="text-[14px] font-semibold whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-[600ms] ease-out"
        [class]="fabExpandido() ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'"
      >Novo lançamento</span>
    </button>

    @if (mostrandoForm()) {
      <app-lancamento-form
        [lancamento]="emEdicao()"
        [tipoInicial]="tipoNovo()"
        (salvo)="aoSalvarForm($event)"
        (cancelado)="fecharForm()"
      />
    }

    @if (confirmacao(); as conf) {
      <app-confirm-modal
        [titulo]="conf.titulo"
        [mensagem]="conf.mensagem"
        [textoConfirmar]="conf.textoConfirmar"
        (confirmado)="conf.acao()"
        (cancelado)="confirmacao.set(null)"
      />
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
export class FinancasComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly api = inject(FinancasService);
  private readonly pageHeader = inject(PageHeaderService);

  readonly NOMES_MES = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  readonly NOMES_MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  readonly modo = signal<Modo>('mensal');
  readonly ano = signal(new Date().getFullYear());
  readonly mes = signal(new Date().getMonth() + 1);
  readonly periodoAberto = signal(false);

  private readonly _hoje = new Date();
  readonly anoAtual = signal(this._hoje.getFullYear());
  readonly mesAtual = signal(this._hoje.getMonth() + 1);

  anoSelecionado(): number {
    return this.ano();
  }

  togglePeriodo(): void {
    this.periodoAberto.update((v) => !v);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.periodoAberto()) this.periodoAberto.set(false);
  }

  selecionarMes(m: number): void {
    this.mes.set(m);
    this.periodoAberto.set(false);
    this.carregar();
  }

  readonly lancamentos = signal<Lancamento[]>([]);
  readonly balanco = signal<Balanco | null>(null);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);

  readonly filtroTipo = signal<FiltroTipo>('todos');
  readonly filtroStatus = signal<FiltroStatus>('todos');
  readonly viewLanc = signal<'lista' | 'calendario' | 'categoria'>('lista');
  readonly fabExpandido = signal(true);

  setViewLanc(v: 'lista' | 'calendario' | 'categoria'): void {
    this.viewLanc.set(v);
  }

  readonly mostrandoForm = signal(false);
  readonly emEdicao = signal<Lancamento | null>(null);
  readonly tipoNovo = signal<TipoLancamento>(2);

  readonly confirmacao = signal<{ titulo: string; mensagem: string; textoConfirmar: string; acao: () => void } | null>(null);

  constructor() {
    this.pageHeader.set({
      titulo: 'Finanças',
      iconeClasse: 'fa-solid fa-wallet text-accent text-[12px]',
    });
  }

  ngOnInit(): void {
    this.carregar();
    setTimeout(() => this.fabExpandido.set(false), 2500);
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.pageHeader.limpar();
  }

  setModo(m: Modo): void {
    this.modo.set(m);
    this.carregar();
  }

  setFiltroTipo(t: FiltroTipo): void {
    this.filtroTipo.set(t);
  }

  setFiltroStatus(s: FiltroStatus): void {
    this.filtroStatus.set(s);
  }

  navegar(delta: number): void {
    if (this.modo() === 'mensal') {
      let m = this.mes() + delta;
      let a = this.ano();
      if (m < 1) {
        m = 12; a -= 1;
      } else if (m > 12) {
        m = 1; a += 1;
      }
      this.mes.set(m);
      this.ano.set(a);
    } else {
      this.ano.set(this.ano() + delta);
    }
    this.carregar();
  }

  hoje(): void {
    const d = new Date();
    this.ano.set(d.getFullYear());
    this.mes.set(d.getMonth() + 1);
    this.carregar();
  }

  rotuloPeriodo(): string {
    if (this.modo() === 'mensal') {
      return `${this.NOMES_MES[this.mes() - 1]} ${this.ano()}`;
    }
    return String(this.ano());
  }

  subtituloHero(): string {
    if (this.modo() === 'mensal') {
      return `Balanço de ${this.NOMES_MES[this.mes() - 1]} de ${this.ano()}`;
    }
    return `Balanço de ${this.ano()}`;
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);
    const ano = this.ano();
    const mes = this.modo() === 'mensal' ? this.mes() : undefined;

    this.api.listar(ano, mes).subscribe({
      next: (lista) => this.lancamentos.set(lista),
      error: () => this.erro.set('Não consegui carregar seus lançamentos.'),
    });

    this.api.obterBalanco(ano, mes).subscribe({
      next: (b) => {
        this.balanco.set(b);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.erro.set('Não consegui calcular o balanço.');
      },
    });
  }

  // ===== Stats =====
  totalReceitas = computed(() => this.balanco()?.totalReceitas ?? 0);
  totalDespesasPagas = computed(() => this.balanco()?.totalDespesasPagas ?? 0);
  totalDespesasPendentes = computed(() => this.balanco()?.totalDespesasPendentes ?? 0);
  saldo = computed(() => this.balanco()?.saldo ?? 0);

  qtdReceitas = computed(() => this.lancamentos().filter((l) => l.tipo === 1).length);

  percentualEconomia(): number {
    const r = this.totalReceitas();
    if (r <= 0) return 0;
    return Math.round((this.saldo() / r) * 100);
  }

  saldoBg(): string {
    const v = this.saldo();
    if (v >= 0) return 'radial-gradient(ellipse 60% 80% at 100% 0%, rgba(94,106,210,0.18), transparent 60%)';
    return 'radial-gradient(ellipse 60% 80% at 100% 0%, rgba(235,87,87,0.20), transparent 60%)';
  }

  // ===== Filtro =====
  lancamentosFiltrados = computed(() => {
    const tipo = this.filtroTipo();
    const status = this.filtroStatus();
    return this.lancamentos().filter((l) => {
      if (tipo === 'receita' && l.tipo !== 1) return false;
      if (tipo === 'despesa' && l.tipo !== 2) return false;
      if (status === 'pendente' && !(l.tipo === 2 && l.status === 1)) return false;
      if (status === 'pago' && !(l.tipo === 2 && l.status === 2)) return false;
      return true;
    });
  });

  // ===== Calendário =====
  celulasCalendario = computed(() => {
    const ano = this.ano();
    const mes = this.mes();
    const primeiroDia = new Date(ano, mes - 1, 1);
    const diasNoMes = new Date(ano, mes, 0).getDate();

    // 0 = dom, 1 = seg... convert para 0=seg .. 6=dom
    const offsetSeg = (primeiroDia.getDay() + 6) % 7;

    const eventos = new Map<number, number>();
    for (const l of this.lancamentos()) {
      const d = new Date(l.dataReferencia);
      if (d.getFullYear() === ano && d.getMonth() === mes - 1) {
        const dia = d.getDate();
        eventos.set(dia, (eventos.get(dia) ?? 0) + 1);
      }
    }

    const hoje = new Date();
    const ehMesAtual = hoje.getFullYear() === ano && hoje.getMonth() === mes - 1;

    const cells: { dia: number | null; eventos: number; hoje: boolean }[] = [];
    for (let i = 0; i < offsetSeg; i++) cells.push({ dia: null, eventos: 0, hoje: false });
    for (let d = 1; d <= diasNoMes; d++) {
      cells.push({ dia: d, eventos: eventos.get(d) ?? 0, hoje: ehMesAtual && hoje.getDate() === d });
    }
    while (cells.length % 7 !== 0) cells.push({ dia: null, eventos: 0, hoje: false });
    return cells;
  });

  // ===== Calendário grande =====
  celulasCalendarioGrande = computed(() => {
    const ano = this.ano();
    const mes = this.mes();
    const primeiroDia = new Date(ano, mes - 1, 1);
    const diasNoMes = new Date(ano, mes, 0).getDate();
    const offsetSeg = (primeiroDia.getDay() + 6) % 7;

    const porDia = new Map<number, Lancamento[]>();
    for (const l of this.lancamentos()) {
      const d = new Date(l.dataReferencia);
      if (d.getFullYear() === ano && d.getMonth() === mes - 1) {
        const dia = d.getDate();
        const arr = porDia.get(dia) ?? [];
        arr.push(l);
        porDia.set(dia, arr);
      }
    }

    const hoje = new Date();
    const ehMesAtual = hoje.getFullYear() === ano && hoje.getMonth() === mes - 1;

    const cells: { dia: number | null; lancamentos: Lancamento[]; hoje: boolean }[] = [];
    for (let i = 0; i < offsetSeg; i++) cells.push({ dia: null, lancamentos: [], hoje: false });
    for (let d = 1; d <= diasNoMes; d++) {
      cells.push({ dia: d, lancamentos: porDia.get(d) ?? [], hoje: ehMesAtual && hoje.getDate() === d });
    }
    while (cells.length % 7 !== 0) cells.push({ dia: null, lancamentos: [], hoje: false });
    return cells;
  });

  // ===== Agenda mobile (vista calendário) — agrupa por dia =====
  diasComLancamentos = computed(() => {
    const ano = this.ano();
    const mes = this.mes();
    const diasSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

    const porDia = new Map<number, Lancamento[]>();
    for (const l of this.lancamentos()) {
      const d = new Date(l.dataReferencia);
      if (d.getFullYear() === ano && d.getMonth() === mes - 1) {
        const dia = d.getDate();
        const arr = porDia.get(dia) ?? [];
        arr.push(l);
        porDia.set(dia, arr);
      }
    }

    const hoje = new Date();
    const ehMesAtual = hoje.getFullYear() === ano && hoje.getMonth() === mes - 1;

    const dias: { iso: string; dia: number; diaSemana: string; hoje: boolean; lancamentos: Lancamento[] }[] = [];
    const diasOrdenados = [...porDia.keys()].sort((a, b) => a - b);
    for (const dia of diasOrdenados) {
      const date = new Date(ano, mes - 1, dia);
      dias.push({
        iso: `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`,
        dia,
        diaSemana: diasSemana[date.getDay()],
        hoje: ehMesAtual && hoje.getDate() === dia,
        lancamentos: porDia.get(dia) ?? [],
      });
    }
    return dias;
  });

  // ===== Agrupamento por categoria =====
  gruposPorCategoria = computed(() => {
    const grupos = new Map<CategoriaLancamento, { categoria: CategoriaLancamento; tipo: TipoLancamento; itens: Lancamento[]; total: number; pendente: number }>();
    for (const l of this.lancamentosFiltrados()) {
      const g = grupos.get(l.categoria) ?? {
        categoria: l.categoria,
        tipo: l.tipo,
        itens: [],
        total: 0,
        pendente: 0,
      };
      g.itens.push(l);
      g.total += l.valor;
      if (l.tipo === 2 && l.status === 1) g.pendente += l.valor;
      grupos.set(l.categoria, g);
    }
    return [...grupos.values()].sort((a, b) => b.total - a.total);
  });

  // ===== Categorias despesa =====
  categoriasDespesa = computed(() => {
    const cats = this.balanco()?.porCategoria ?? [];
    return cats.filter((c) => c.tipo === 2);
  });

  percCategoria(c: BalancoCategoria): number {
    const total = this.categoriasDespesa().reduce((s, x) => s + x.total, 0);
    if (total <= 0) return 0;
    return Math.min(100, (c.total / total) * 100);
  }

  // ===== Anual =====
  mesesAno = computed(() => {
    const dados = this.balanco()?.porMes ?? [];
    const mapa = new Map<number, { receitas: number; despesas: number }>();
    for (const d of dados) mapa.set(d.mes, { receitas: d.receitas, despesas: d.despesas });
    const out: { mes: number; receitas: number; despesas: number }[] = [];
    for (let m = 1; m <= 12; m++) {
      const v = mapa.get(m) ?? { receitas: 0, despesas: 0 };
      out.push({ mes: m, ...v });
    }
    return out;
  });

  alturaBarra(valor: number): number {
    const max = Math.max(
      ...this.mesesAno().flatMap((m) => [m.receitas, m.despesas]),
      1,
    );
    return Math.round((valor / max) * 100);
  }

  // ===== Form =====
  abrirNovo(tipo: TipoLancamento): void {
    this.tipoNovo.set(tipo);
    this.emEdicao.set(null);
    this.mostrandoForm.set(true);
  }

  editar(l: Lancamento): void {
    this.emEdicao.set(l);
    this.mostrandoForm.set(true);
  }

  fecharForm(): void {
    this.mostrandoForm.set(false);
    this.emEdicao.set(null);
  }

  aoSalvarForm(_l: Lancamento): void {
    this.fecharForm();
    this.carregar();
  }

  marcarPago(l: Lancamento): void {
    this.api.marcarPago(l.id).subscribe({
      next: () => this.carregar(),
    });
  }

  pedirRemover(l: Lancamento): void {
    this.confirmacao.set({
      titulo: 'Remover lançamento?',
      mensagem: `"${l.descricao}" será removido. Não dá pra desfazer.`,
      textoConfirmar: 'Remover',
      acao: () => {
        this.confirmacao.set(null);
        this.api.remover(l.id).subscribe({
          next: () => this.carregar(),
        });
      },
    });
  }

  // ===== Helpers =====
  formatarMoeda(v: number): string {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarData(iso: string): string {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  rotuloPrazo(iso: string): string {
    const venc = new Date(iso);
    venc.setHours(0, 0, 0, 0);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diff = Math.round((venc.getTime() - hoje.getTime()) / 86400000);
    if (diff < 0) return `vencida há ${-diff}d`;
    if (diff === 0) return 'vence hoje';
    if (diff === 1) return 'vence amanhã';
    if (diff <= 7) return `vence em ${diff}d`;
    return '';
  }

  rotuloCategoria(c: CategoriaLancamento): string {
    return ROTULOS_CATEGORIA[c];
  }
  iconeCategoria(c: CategoriaLancamento): string {
    return ICONES_CATEGORIA[c];
  }
}
