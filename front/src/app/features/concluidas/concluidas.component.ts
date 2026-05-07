import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { Tarefa, TarefasService } from '../../core/api/tarefas.service';
import { ConfirmModalComponent } from '../../shared/confirm-modal.component';
import { extrairProblemDetails } from '../../shared/problem-details';
import { TarefaDetalheModalComponent } from '../tarefas/tarefa-detalhe-modal.component';
import { PageHeaderService } from '../../core/layout/page-header.service';
import { GamificacaoPainelComponent } from './gamificacao-painel.component';

interface Confirmacao {
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  acao: () => void;
}

type Periodo = 'hoje' | 'semana' | 'mes';

interface GrupoData {
  chave: string;
  titulo: string;
  tarefas: Tarefa[];
}

@Component({
  selector: 'app-concluidas',
  standalone: true,
  imports: [CommonModule, TarefaDetalheModalComponent, ConfirmModalComponent, GamificacaoPainelComponent],
  template: `
    <header class="md:hidden flex flex-col sm:flex-row sm:items-center px-4 py-3.5 border-b border-border gap-3 sm:gap-4">
      <div class="flex items-center gap-2 text-[15px] text-text-dim">
        <i class="fa-solid fa-circle-check text-emerald-500 text-[12px]"></i>
        <strong class="text-text font-medium">Concluídas</strong>
        <span
          class="ml-1.5 text-[11px] px-2 py-0.5 rounded-full bg-bg-elev border border-border"
          data-testid="completed-count"
        >
          {{ totalRotulo() }}
        </span>
      </div>

      <div class="sm:ml-auto self-start sm:self-auto">
        <ng-container *ngTemplateOutlet="acoesTpl"></ng-container>
      </div>
    </header>

    <ng-template #acoesTpl>
      <div class="flex items-center gap-2 flex-wrap">
        <div class="flex items-center gap-1 bg-bg-elev border border-border rounded p-0.5" data-testid="aba-switcher">
          <button
            type="button"
            class="px-3 py-1 text-xs rounded transition-colors flex items-center gap-1.5"
            [class]="aba() === 'resumo' ? 'bg-bg text-text' : 'text-text-dim hover:text-text'"
            data-testid="aba-resumo"
            (click)="aba.set('resumo')"
          >
            <i class="fa-solid fa-trophy text-[10px]"></i>
            Resumo
          </button>
          <button
            type="button"
            class="px-3 py-1 text-xs rounded transition-colors flex items-center gap-1.5"
            [class]="aba() === 'historico' ? 'bg-bg text-text' : 'text-text-dim hover:text-text'"
            data-testid="aba-historico"
            (click)="aba.set('historico')"
          >
            <i class="fa-solid fa-list text-[10px]"></i>
            Histórico
          </button>
        </div>

        @if (aba() === 'historico') {
          <div class="flex items-center gap-1 bg-bg-elev border border-border rounded p-0.5" data-testid="period-switcher">
            <button
              type="button"
              class="px-3 py-1 text-xs rounded transition-colors"
              [class]="periodo() === 'hoje' ? 'bg-bg text-text' : 'text-text-dim hover:text-text'"
              data-testid="period-hoje"
              (click)="setPeriodo('hoje')"
            >
              Hoje
            </button>
            <button
              type="button"
              class="px-3 py-1 text-xs rounded transition-colors"
              [class]="periodo() === 'semana' ? 'bg-bg text-text' : 'text-text-dim hover:text-text'"
              data-testid="period-semana"
              (click)="setPeriodo('semana')"
            >
              Semana
            </button>
            <button
              type="button"
              class="px-3 py-1 text-xs rounded transition-colors"
              [class]="periodo() === 'mes' ? 'bg-bg text-text' : 'text-text-dim hover:text-text'"
              data-testid="period-mes"
              (click)="setPeriodo('mes')"
            >
              Mês
            </button>
          </div>
        }
      </div>
    </ng-template>

    <div class="flex-1 px-4 md:px-8 py-6 overflow-auto" data-testid="concluidas-page">
      @if (aba() === 'resumo') {
        <app-gamificacao-painel />
      } @else {
      @if (erroReabrir()) {
        <div
          class="mb-4 px-3 py-2.5 rounded border border-danger/30 bg-danger/10 text-danger text-xs"
          data-testid="concluidas-erro-reabrir"
        >
          {{ erroReabrir() }}
        </div>
      }

      @if (carregando()) {
        <p class="text-text-subtle text-sm">Carregando...</p>
      } @else if (concluidas().length === 0) {
        <div class="text-center py-16 text-text-subtle text-[13px]" data-testid="concluidas-vazio">
          Nada concluído neste período.
        </div>
      } @else {
        <div
          class="flex items-center gap-4 mb-6 px-5 py-4 card-elev"
          data-testid="stats-strip"
        >
          <div
            class="w-10 h-10 rounded-lg bg-emerald-500/15 grid place-items-center text-emerald-500"
          >
            <i class="fa-solid fa-trophy"></i>
          </div>
          <div class="text-3xl font-semibold tabular-nums">{{ concluidas().length }}</div>
          <div class="flex flex-col gap-0.5">
            <div class="text-sm font-medium">{{ rotuloPeriodo() }}</div>
            <div class="text-xs text-text-dim">Continua nesse ritmo.</div>
          </div>
        </div>

        @for (g of grupos(); track g.chave) {
          <section class="mb-7" [attr.data-testid]="'group-' + g.chave">
            <div class="flex items-center gap-2 px-2 py-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-text-dim">{{
                g.titulo
              }}</span>
              <span
                class="text-[11px] px-1.5 py-0.5 rounded-full bg-bg-elev border border-border text-text-dim"
                >{{ g.tarefas.length }}</span
              >
            </div>
            <div class="flex flex-col">
              @for (t of g.tarefas; track t.id) {
                <div
                  class="flex flex-col gap-2 md:grid md:grid-cols-[28px_1fr_auto_auto] md:items-center md:gap-3.5 px-3 py-2.5 border-b border-border last:border-b-0 hover:bg-bg-elev focus-within:bg-bg-elev group transition-colors cursor-pointer"
                  [class.opacity-50]="reabrindo().has(t.id)"
                  [class.pointer-events-none]="reabrindo().has(t.id)"
                  [attr.data-testid]="'done-' + t.id"
                  role="button"
                  tabindex="0"
                  (click)="abrirDetalhe(t)"
                  (keydown.enter)="abrirDetalhe(t)"
                >
                  <div class="flex items-center gap-3 md:contents">
                    <button
                      type="button"
                      class="shrink-0 w-[18px] h-[18px] rounded-full bg-emerald-500/15 border border-emerald-500/30 grid place-items-center text-emerald-500 hover:bg-emerald-500/30 hover:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors"
                      [attr.data-testid]="'done-' + t.id + '-reabrir'"
                      aria-label="Desmarcar e reabrir como pendente"
                      title="Clique pra desmarcar e voltar pra pendentes"
                      (click)="$event.stopPropagation(); reabrir(t)"
                    >
                      <i class="fa-solid fa-check text-[10px] group-hover:hidden"></i>
                      <i class="fa-solid fa-rotate-left text-[9px] hidden group-hover:inline"></i>
                    </button>
                    <div class="text-sm text-text-dim line-through flex-1 min-w-0 truncate">{{ t.nome }}</div>
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
                    <div class="text-xs text-text-dim flex items-center gap-1.5 tabular-nums">
                      <i class="fa-regular fa-circle-check text-[10px]"></i>
                      {{ formatarHora(t.concluidaEm) }}
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>
        }
      }
      }
    </div>

    @if (tarefaDetalhe(); as t) {
      <app-tarefa-detalhe-modal
        [tarefa]="t"
        (fechado)="tarefaDetalhe.set(null)"
        (reabrir)="reabrirDoDetalhe($event)"
        (excluir)="pedirExcluirDoDetalhe($event)"
      ></app-tarefa-detalhe-modal>
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
  `,
})
export class ConcluidasComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly pageHeader = inject(PageHeaderService);
  private readonly acoesTplRef = viewChild<TemplateRef<unknown>>('acoesTpl');

  constructor() {
    this.pageHeader.set({
      titulo: 'Concluídas',
      iconeClasse: 'fa-solid fa-circle-check text-emerald-500 text-[12px]',
    });
  }

  ngAfterViewInit(): void {
    this.pageHeader.set({
      titulo: 'Concluídas',
      iconeClasse: 'fa-solid fa-circle-check text-emerald-500 text-[12px]',
      acoesTpl: this.acoesTplRef() ?? null,
    });
  }

  ngOnDestroy(): void {
    this.pageHeader.limpar();
  }

  private readonly tarefasApi = inject(TarefasService);

  readonly aba = signal<'resumo' | 'historico'>('resumo');
  readonly periodo = signal<Periodo>('semana');
  readonly concluidas = signal<Tarefa[]>([]);
  readonly carregando = signal(true);
  readonly reabrindo = signal(new Set<string>());
  readonly erroReabrir = signal<string | null>(null);
  readonly tarefaDetalhe = signal<Tarefa | null>(null);
  readonly confirmacao = signal<Confirmacao | null>(null);

  readonly grupos = computed<GrupoData[]>(() => {
    const lista = this.concluidas();
    const porData = new Map<string, GrupoData>();

    for (const t of lista) {
      if (!t.concluidaEm) continue;
      const data = new Date(t.concluidaEm);
      const chave = data.toISOString().substring(0, 10);
      if (!porData.has(chave)) {
        porData.set(chave, { chave, titulo: this.tituloData(data), tarefas: [] });
      }
      porData.get(chave)!.tarefas.push(t);
    }

    return [...porData.values()].sort((a, b) => b.chave.localeCompare(a.chave));
  });

  readonly totalRotulo = computed(
    () => `${this.concluidas().length} ${this.rotuloPeriodo().toLowerCase()}`,
  );

  ngOnInit(): void {
    this.carregar();
  }

  setPeriodo(p: Periodo): void {
    this.periodo.set(p);
    this.carregar();
  }

  reabrir(t: Tarefa): void {
    if (this.reabrindo().has(t.id)) return;
    this.reabrindo.update((s) => new Set(s).add(t.id));
    this.erroReabrir.set(null);

    this.tarefasApi.reabrir(t.id).subscribe({
      next: () => {
        this.concluidas.update((list) => list.filter((x) => x.id !== t.id));
        this.reabrindo.update((s) => {
          const n = new Set(s);
          n.delete(t.id);
          return n;
        });
      },
      error: (err: HttpErrorResponse) => {
        this.reabrindo.update((s) => {
          const n = new Set(s);
          n.delete(t.id);
          return n;
        });
        const r = extrairProblemDetails(err, 'Não consegui reabrir essa tarefa.');
        this.erroReabrir.set(r.mensagemGeral ?? 'Não consegui reabrir essa tarefa.');
      },
    });
  }

  abrirDetalhe(t: Tarefa): void {
    if (this.reabrindo().has(t.id)) return;
    this.tarefaDetalhe.set(t);
  }

  reabrirDoDetalhe(t: Tarefa): void {
    this.tarefaDetalhe.set(null);
    this.reabrir(t);
  }

  pedirExcluirDoDetalhe(t: Tarefa): void {
    this.tarefaDetalhe.set(null);
    this.confirmacao.set({
      titulo: 'Excluir tarefa',
      mensagem: `Excluir "${t.nome}"? Não dá pra desfazer.`,
      textoConfirmar: 'Excluir',
      acao: () => this.excluir(t),
    });
  }

  private excluir(t: Tarefa): void {
    this.erroReabrir.set(null);
    this.tarefasApi.remover(t.id).subscribe({
      next: () => {
        this.concluidas.update((list) => list.filter((x) => x.id !== t.id));
      },
      error: (err: HttpErrorResponse) => {
        const r = extrairProblemDetails(err, 'Não consegui excluir essa tarefa.');
        this.erroReabrir.set(r.mensagemGeral ?? 'Não consegui excluir essa tarefa.');
      },
    });
  }

  executarConfirmacao(): void {
    const c = this.confirmacao();
    if (!c) return;
    this.confirmacao.set(null);
    c.acao();
  }

  carregar(): void {
    this.carregando.set(true);
    const { de, ate } = this.intervalo();
    this.tarefasApi.listarConcluidas(de, ate).subscribe({
      next: (lista) => {
        this.concluidas.set(lista);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  rotuloPeriodo(): string {
    return { hoje: 'hoje', semana: 'nesta semana', mes: 'neste mês' }[this.periodo()];
  }

  private intervalo(): { de: string; ate: string } {
    const agora = new Date();
    const fim = new Date(agora);
    fim.setHours(23, 59, 59, 999);
    const inicio = new Date(agora);
    if (this.periodo() === 'hoje') {
      inicio.setHours(0, 0, 0, 0);
    } else if (this.periodo() === 'semana') {
      inicio.setDate(agora.getDate() - 6);
      inicio.setHours(0, 0, 0, 0);
    } else {
      inicio.setDate(agora.getDate() - 29);
      inicio.setHours(0, 0, 0, 0);
    }
    return { de: inicio.toISOString(), ate: fim.toISOString() };
  }

  tituloData(d: Date): string {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const alvo = new Date(d);
    alvo.setHours(0, 0, 0, 0);
    const diff = Math.round((hoje.getTime() - alvo.getTime()) / 86400000);

    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const meses = [
      'jan',
      'fev',
      'mar',
      'abr',
      'mai',
      'jun',
      'jul',
      'ago',
      'set',
      'out',
      'nov',
      'dez',
    ];
    const dataFmt = `${dias[d.getDay()]}, ${d.getDate()} ${meses[d.getMonth()]}`;

    if (diff === 0) return `Hoje · ${dataFmt}`;
    if (diff === 1) return `Ontem · ${dataFmt}`;
    return dataFmt;
  }

  formatarHora(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toTimeString().substring(0, 5);
  }
}
