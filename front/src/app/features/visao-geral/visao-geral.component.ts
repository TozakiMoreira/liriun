import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Tarefa, TarefasService } from '../../core/api/tarefas.service';
import { Balanco, FinancasService } from '../../core/api/financas.service';
import { TokenStorage } from '../../core/auth/token.storage';
import { AvatarComponent } from '../../shared/avatar.component';
import { StaggerInDirective } from '../../shared/stagger-in.directive';
import { BrandComponent } from '../../shared/brand.component';
import { PageHeaderService } from '../../core/layout/page-header.service';
import { ItemAgendaPosicionado, calcularLayoutAgenda } from '../../shared/agenda-layout';
import { TarefaDetalheModalComponent } from '../tarefas/tarefa-detalhe-modal.component';

interface CategoriaResumo {
  nome: string;
  total: number;
  cor: string;
  porcentagem: number;
  inicioAngulo: number;
  fimAngulo: number;
}

interface PrioridadeResumo {
  label: string;
  total: number;
  cor: string;
  porcentagem: number;
}

interface DiaResumo {
  iso: string;
  diaCurto: string;
  pendentes: number;
  concluidas: number;
}

@Component({
  selector: 'app-visao-geral',
  standalone: true,
  imports: [CommonModule, RouterLink, AvatarComponent, StaggerInDirective, BrandComponent, TarefaDetalheModalComponent],
  template: `
    <header class="md:hidden flex items-center px-4 py-3.5 border-b border-border gap-4">
      <div class="flex items-center gap-2 text-[15px] text-text-dim">
        <i class="fa-solid fa-house text-accent text-[12px]"></i>
        <strong class="text-text font-medium">Visão geral</strong>
      </div>
    </header>

    <div
      class="flex-1 px-4 md:px-8 py-6 overflow-auto w-full max-w-[1400px] mx-auto"
      data-testid="visao-geral-page"
    >
      <section
        class="mb-7 flex items-center gap-4 animate-fade-up"
        data-testid="visao-geral-saudacao"
      >
        <div class="shrink-0 rounded-full ring-2 ring-accent/40 shadow-glow p-0.5">
          <app-avatar
            [nome]="nomeUsuario()"
            [fotoUrl]="fotoUsuario()"
            [size]="56"
            [alt]="'Foto de ' + (nomeUsuario() || 'usuário')"
          />
        </div>
        <div class="flex flex-col leading-tight min-w-0">
          <h1
            class="text-2xl md:text-3xl font-semibold tracking-tight"
          >
            <span class="text-text-dim">{{ saudacao() }}{{ nomeUsuario() ? ',' : '.' }}</span>
            @if (nomeUsuario()) {
              <span
                class="bg-clip-text text-transparent ml-1.5"
                style="background-image: linear-gradient(135deg, #5e6ad2 0%, #8b5cf6 50%, #ec4899 100%);"
              >{{ nomeUsuario() }}.</span>
            }
          </h1>
          <p class="text-text-dim text-[13px] md:text-sm mt-1">
            {{ resumoSaudacao() }}
          </p>
        </div>
      </section>

      @if (carregando()) {
        <p class="text-text-subtle text-sm">Carregando...</p>
      } @else if (erro()) {
        <div class="px-3 py-2.5 rounded border border-danger/30 bg-danger/10 text-danger text-xs">
          {{ erro() }}
        </div>
      } @else {
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
          appStaggerIn
          [staggerDelay]="70"
          [staggerStart]="80"
        >
          <a
            routerLink="/app/tarefas"
            [queryParams]="{ periodo: 'hoje' }"
            class="card-elev p-4 flex flex-col gap-1.5 hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300 ease-out"
            data-testid="card-pendentes"
          >
            <div class="flex items-center justify-between">
              <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">Pendentes hoje</span>
              <i class="fa-solid fa-calendar-day text-accent/70 text-[12px]"></i>
            </div>
            <div class="text-3xl font-semibold tabular-nums">{{ pendentesHoje() }}</div>
            <div class="text-[11px] text-text-dim">{{ totalPendentes() }} no total</div>
          </a>

          <a
            routerLink="/app/tarefas"
            [queryParams]="{ status: 'atrasadas' }"
            class="card-elev p-4 flex flex-col gap-1.5 hover:border-danger/40 hover:-translate-y-0.5 transition-all duration-300 ease-out"
            data-testid="card-atrasadas"
          >
            <div class="flex items-center justify-between">
              <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">Atrasadas</span>
              <i class="fa-solid fa-triangle-exclamation text-[12px]"
                [class.text-danger]="atrasadas() > 0"
                [class.text-text-subtle]="atrasadas() === 0"
              ></i>
            </div>
            <div class="text-3xl font-semibold tabular-nums"
              [class.text-danger]="atrasadas() > 0"
            >{{ atrasadas() }}</div>
            <div class="text-[11px] text-text-dim">
              @if (atrasadas() === 0) {
                Tudo no prazo
              } @else {
                Resolve antes que vire bola de neve
              }
            </div>
          </a>

          <a
            routerLink="/app/concluidas"
            class="card-elev p-4 flex flex-col gap-1.5 hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300 ease-out"
            data-testid="card-concluidas-semana"
          >
            <div class="flex items-center justify-between">
              <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">Feitas esta semana</span>
              <i class="fa-solid fa-circle-check text-emerald-400/70 text-[12px]"></i>
            </div>
            <div class="text-3xl font-semibold tabular-nums">{{ concluidasSemana() }}</div>
            <div class="text-[11px] text-text-dim">
              @if (concluidasSemana() > 0) {
                Bom ritmo.
              } @else {
                Ninguém ainda.
              }
            </div>
          </a>

          <a
            routerLink="/app/captura"
            class="relative overflow-hidden border border-accent/40 rounded-lg bg-accent/10 p-4 flex flex-col gap-1.5 hover:border-accent/70 hover:bg-accent/15 hover:-translate-y-0.5 hover:shadow-glow transition-all duration-300 ease-out"
            style="background-image: radial-gradient(ellipse 90% 70% at 100% 0%, rgba(94, 106, 210, 0.18), transparent);"
            data-testid="card-captura"
          >
            <div class="flex items-center justify-between">
              <span class="text-[10px] uppercase tracking-wider text-accent font-semibold">Adicionar tarefa</span>
              <i class="fa-solid fa-bolt text-accent text-[12px]"></i>
            </div>
            <div class="text-base font-semibold mt-1.5 text-text">Conversa com <app-brand /></div>
            <div class="text-[11px] text-text-dim">Texto, voz ou modo manual.</div>
          </a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-3 mb-6 items-start">
        <section class="card-elev overflow-hidden" data-testid="agenda-hoje">
          <div class="flex items-center justify-between px-4 py-3 border-b border-border">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-calendar-day text-accent text-[12px]"></i>
              <h2 class="text-[13px] font-semibold tracking-tight">Agenda de hoje</h2>
              <span class="text-[11px] text-text-subtle">{{ dataHojeFormatada() }}</span>
            </div>
            <a
              routerLink="/app/tarefas"
              [queryParams]="{ view: 'semana' }"
              class="text-[11px] text-accent hover:text-accent-hover"
            >
              Ver semana →
            </a>
          </div>

          @if (tarefasComHoraHoje().length === 0 && tarefasSemHoraHoje().length === 0) {
            <p class="text-text-subtle text-[12.5px] italic px-4 py-8 text-center">
              Nada agendado pra hoje.
            </p>
          } @else {
            @if (tarefasSemHoraHoje().length > 0) {
              <div class="px-4 py-2 border-b border-border bg-bg-elev/40">
                <div class="text-[10px] uppercase tracking-wider text-text-subtle font-medium mb-1.5">
                  Sem hora marcada
                </div>
                <div class="flex flex-wrap gap-1.5">
                  @for (t of tarefasSemHoraHoje(); track t.id) {
                    <span
                      class="text-[11.5px] px-2 py-1 rounded border text-text"
                      [ngClass]="
                        t.status === 3
                          ? 'bg-danger/15 border-danger/30'
                          : 'bg-accent/15 border-accent/30'
                      "
                      [title]="t.nome"
                    >
                      {{ t.nome }}
                    </span>
                  }
                </div>
              </div>
            }

            <div
              #agendaScroll
              class="relative grid grid-cols-[60px_1fr] overflow-y-auto"
              style="max-height: 480px"
            >
              <div class="flex flex-col">
                @for (h of horasAgenda(); track h) {
                  <div
                    class="text-[10px] tabular-nums text-text-subtle border-b border-border/40 grid place-items-center"
                    [style.height.px]="alturaSlotAgenda()"
                  >
                    {{ formatarHora(h) }}
                  </div>
                }
              </div>

              <div class="relative border-l border-border">
                @for (h of horasAgenda(); track h) {
                  <div
                    class="border-b border-border/40"
                    [style.height.px]="alturaSlotAgenda()"
                  ></div>
                }

                @for (p of tarefasLayoutHoje(); track p.item.id) {
                  @let t = p.item.tarefa;
                  <button
                    type="button"
                    class="absolute rounded px-2 py-1.5 text-[12px] text-left border flex items-center gap-2 overflow-hidden cursor-pointer hover:brightness-110 hover:z-10 transition-[filter]"
                    [ngClass]="
                      t.status === 3
                        ? 'bg-danger/20 border-danger/40 text-text'
                        : 'bg-accent/20 border-accent/40 text-text'
                    "
                    [style.top.px]="p.item.top"
                    [style.left]="estiloPosicaoTarefa(p).left"
                    [style.width]="estiloPosicaoTarefa(p).width"
                    [style.minHeight.px]="alturaSlotAgenda() - 4"
                    [attr.data-testid]="'agenda-tarefa-' + t.id"
                    [title]="t.nome + ' — ' + (t.horarioFinal ?? '')"
                    (click)="abrirDetalheTarefa(t)"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full shrink-0"
                      [style.background]="corPrioridade(t.prioridade)"
                    ></span>
                    <span class="font-medium truncate flex-1">{{ t.nome }}</span>
                    @if (t.horarioFinal) {
                      <span class="text-[10px] tabular-nums opacity-80">
                        {{ t.horarioFinal.substring(0, 5) }}
                      </span>
                    }
                  </button>
                }

                @if (topoLinhaAgora() !== null) {
                  <div
                    class="absolute left-0 right-0 pointer-events-none z-10"
                    [style.top.px]="topoLinhaAgora()"
                    aria-hidden="true"
                    data-testid="agenda-linha-agora"
                  >
                    <div class="relative h-px">
                      <div class="absolute inset-x-0 top-0 h-px bg-danger"></div>
                      <span
                        class="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-danger ring-2 ring-bg"
                      ></span>
                      <span
                        class="absolute right-2 -top-2.5 text-[9px] tabular-nums font-semibold text-white bg-danger px-1 py-px rounded"
                      >{{ rotuloAgora() }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </section>

        <div class="flex flex-col gap-3 min-w-0">
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-3">
          <a
            routerLink="/app/financas"
            class="card-elev relative overflow-hidden xl:col-span-2 flex flex-col gap-3 p-5 cursor-pointer hover:border-border-strong transition-colors group"
            data-testid="widget-financas"
          >
            <div
              class="absolute inset-0 pointer-events-none opacity-90"
              [style.background]="financasBg()"
            ></div>
            <div
              class="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-30 blur-3xl pointer-events-none"
              [style.background]="financasGlow()"
            ></div>

            <div class="relative flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-accent-violet/15 grid place-items-center">
                  <i class="fa-solid fa-wallet text-accent-violet text-[12px]"></i>
                </div>
                <h2 class="text-[13px] font-semibold tracking-tight">Finanças do mês</h2>
              </div>
              <span class="text-[10px] text-text-subtle uppercase tracking-wider flex items-center gap-1.5 group-hover:text-text transition-colors">
                {{ rotuloMesAtual() }}
                <i class="fa-solid fa-arrow-right text-[9px]"></i>
              </span>
            </div>

            @if (balancoMes(); as b) {
              <div class="relative flex items-end gap-4 mt-1">
                <div class="flex flex-col gap-0.5">
                  <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">Saldo</span>
                  <span
                    class="text-[28px] font-semibold tabular-nums leading-none"
                    [class]="b.saldo >= 0 ? 'text-text' : 'text-rose-400'"
                  >
                    {{ formatarMoeda(b.saldo) }}
                  </span>
                  @if (b.totalReceitas > 0) {
                    <span class="text-[11px] text-text-dim mt-0.5">
                      {{ percentualEconomiaMes() }}% do que recebeu
                    </span>
                  }
                </div>

                <div class="flex-1 flex flex-col gap-2 min-w-0">
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="flex items-center gap-1.5 text-text-dim">
                      <i class="fa-solid fa-arrow-up text-emerald-500 text-[9px]"></i>
                      Recebido
                    </span>
                    <span class="text-emerald-400 tabular-nums font-medium">{{ formatarMoeda(b.totalReceitas) }}</span>
                  </div>
                  <div class="h-1.5 bg-bg-surface rounded overflow-hidden">
                    <div
                      class="h-full bg-emerald-400 rounded transition-all"
                      [style.width.%]="barraReceita()"
                    ></div>
                  </div>

                  <div class="flex items-center justify-between text-[11px] mt-1">
                    <span class="flex items-center gap-1.5 text-text-dim">
                      <i class="fa-solid fa-arrow-down text-rose-500 text-[9px]"></i>
                      Despesas
                    </span>
                    <span class="text-rose-400 tabular-nums font-medium">{{ formatarMoeda(b.totalDespesasPagas + b.totalDespesasPendentes) }}</span>
                  </div>
                  <div class="h-1.5 bg-bg-surface rounded overflow-hidden flex">
                    <div
                      class="h-full bg-rose-400 transition-all"
                      [style.width.%]="barraDespesaPaga()"
                    ></div>
                    <div
                      class="h-full bg-amber-400/70 transition-all"
                      [style.width.%]="barraDespesaPendente()"
                    ></div>
                  </div>
                  @if (b.totalDespesasPendentes > 0) {
                    <div class="flex items-center gap-1.5 text-[10px] text-amber-400 mt-1">
                      <i class="fa-solid fa-circle-exclamation text-[9px]"></i>
                      <span class="tabular-nums">{{ formatarMoeda(b.totalDespesasPendentes) }} a pagar</span>
                    </div>
                  }
                </div>
              </div>
            } @else {
              <div class="relative flex flex-col items-start gap-2 py-3">
                <span class="text-[20px] font-semibold text-text-dim">Nada lançado por aqui</span>
                <span class="text-[12px] text-text-subtle">Comece registrando seus recebimentos e contas a pagar.</span>
                <span class="text-[11px] text-accent group-hover:underline mt-1 flex items-center gap-1.5">
                  Abrir Finanças <i class="fa-solid fa-arrow-right text-[9px]"></i>
                </span>
              </div>
            }
          </a>

          <section class="card-elev p-4 flex flex-col gap-3" data-testid="grafico-categorias">
            <h2 class="text-[13px] font-semibold tracking-tight">Pendentes por categoria</h2>
            @if (categoriasResumo().length === 0) {
              <p class="text-text-subtle text-[12px] italic">Sem categorias com tarefas pendentes.</p>
            } @else {
              <div class="flex items-center gap-4">
                <svg viewBox="0 0 36 36" class="w-28 h-28" aria-hidden="true">
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1c1d22" stroke-width="3.5" />
                  @for (c of categoriasResumo(); track c.nome) {
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      [attr.stroke]="c.cor"
                      stroke-width="3.5"
                      [attr.stroke-dasharray]="c.porcentagem + ' ' + (100 - c.porcentagem)"
                      [attr.stroke-dashoffset]="100 - c.inicioAngulo"
                      transform="rotate(-90 18 18)"
                    />
                  }
                  <text x="18" y="18" text-anchor="middle" dominant-baseline="middle" font-size="6.5" fill="#e6e6e6" font-weight="600">{{ totalPendentes() }}</text>
                  <text x="18" y="22.5" text-anchor="middle" dominant-baseline="middle" font-size="2.5" fill="#8a8f98">tarefas</text>
                </svg>
                <ul class="flex-1 flex flex-col gap-1.5 text-[12px]">
                  @for (c of categoriasResumo(); track c.nome) {
                    <li class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-sm" [style.background]="c.cor"></span>
                      <span class="flex-1 truncate text-text-dim">{{ c.nome }}</span>
                      <span class="tabular-nums text-text-dim">{{ c.total }}</span>
                    </li>
                  }
                </ul>
              </div>
            }
          </section>
        </div>

        <section class="card-elev p-4 flex flex-col gap-3" data-testid="prioridades-resumo">
          <div class="flex items-center justify-between">
            <h2 class="text-[13px] font-semibold tracking-tight">Pendentes por prioridade</h2>
            <span class="text-[10px] text-text-subtle uppercase tracking-wider">{{ totalPendentes() }} no total</span>
          </div>
          @if (totalPendentes() === 0) {
            <p class="text-text-subtle text-[12px] italic">Sem pendentes.</p>
          } @else {
            <div class="flex h-2 rounded-full overflow-hidden bg-bg-elev/60" role="presentation">
              @for (p of prioridadesResumo(); track p.label) {
                @if (p.total > 0) {
                  <div
                    class="h-full transition-all"
                    [style.width.%]="p.porcentagem"
                    [style.background]="p.cor"
                    [title]="p.label + ': ' + p.total"
                  ></div>
                }
              }
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
              @for (p of prioridadesResumo(); track p.label) {
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-sm" [style.background]="p.cor"></span>
                  <span class="text-text-dim flex-1 truncate">{{ p.label }}</span>
                  <span class="tabular-nums text-text-dim font-medium">{{ p.total }}</span>
                </div>
              }
            </div>
          }
        </section>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <section class="card-elev p-4 flex flex-col gap-2" data-testid="lista-hoje">
            <div class="flex items-center justify-between">
              <h2 class="text-[13px] font-semibold tracking-tight">Pra hoje</h2>
              <a routerLink="/app/tarefas" class="text-[11px] text-accent hover:text-accent-hover">Ver todas →</a>
            </div>
            @if (tarefasHoje().length === 0) {
              <p class="text-text-subtle text-[12px] italic py-3">Nada agendado pra hoje.</p>
            } @else {
              <ul class="flex flex-col" appStaggerIn [staggerDelay]="40">
                @for (t of tarefasHoje(); track t.id) {
                  <li class="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-b-0 text-[12.5px]">
                    <span class="w-1.5 h-1.5 rounded-full" [style.background]="corPrioridade(t.prioridade)"></span>
                    <span class="flex-1 truncate" [class.text-danger]="t.status === 3">{{ t.nome }}</span>
                    @if (t.horarioFinal) {
                      <span class="text-[11px] tabular-nums text-text-subtle">{{ t.horarioFinal.substring(0, 5) }}</span>
                    }
                  </li>
                }
              </ul>
            }
          </section>

          <section class="card-elev p-4 flex flex-col gap-2" data-testid="lista-concluidas-semana">
            <div class="flex items-center justify-between">
              <h2 class="text-[13px] font-semibold tracking-tight">Feitas esta semana</h2>
              <a routerLink="/app/concluidas" class="text-[11px] text-accent hover:text-accent-hover">Ver todas →</a>
            </div>
            @if (concluidasUltimas().length === 0) {
              <p class="text-text-subtle text-[12px] italic py-3">Nada por enquanto.</p>
            } @else {
              <ul class="flex flex-col" appStaggerIn [staggerDelay]="40">
                @for (t of concluidasUltimas(); track t.id) {
                  <li class="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-b-0 text-[12.5px]">
                    <i class="fa-solid fa-check text-emerald-400 text-[10px]"></i>
                    <span class="flex-1 truncate text-text-dim line-through decoration-text-subtle">{{ t.nome }}</span>
                    @if (t.concluidaEm) {
                      <span class="text-[11px] tabular-nums text-text-subtle">{{ formatarDia(t.concluidaEm) }}</span>
                    }
                  </li>
                }
              </ul>
            }
          </section>
        </div>
        </div>
        </div>
      }
    </div>

    @if (tarefaDetalhe(); as t) {
      <app-tarefa-detalhe-modal
        [tarefa]="t"
        (fechado)="fecharDetalhe()"
        (concluir)="concluirDetalhe($event)"
        (reabrir)="reabrirDetalhe($event)"
        (editarTudo)="editarDetalhe($event)"
        (excluir)="excluirDetalhe($event)"
      ></app-tarefa-detalhe-modal>
    }
  `,
})
export class VisaoGeralComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly tarefasApi = inject(TarefasService);
  private readonly financasApi = inject(FinancasService);
  private readonly storage = inject(TokenStorage);
  private readonly pageHeader = inject(PageHeaderService);
  private readonly router = inject(Router);

  readonly balancoMes = signal<Balanco | null>(null);

  readonly tarefaDetalhe = signal<Tarefa | null>(null);
  readonly processandoDetalhe = signal(false);

  abrirDetalheTarefa(t: Tarefa): void {
    this.tarefaDetalhe.set(t);
  }

  // ===== Widget Finanças =====
  formatarMoeda(v: number): string {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  rotuloMesAtual(): string {
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const d = new Date();
    return `${meses[d.getMonth()]} ${d.getFullYear()}`;
  }

  percentualEconomiaMes(): number {
    const b = this.balancoMes();
    if (!b || b.totalReceitas <= 0) return 0;
    return Math.round((b.saldo / b.totalReceitas) * 100);
  }

  private maiorValorFinancas(): number {
    const b = this.balancoMes();
    if (!b) return 1;
    return Math.max(b.totalReceitas, b.totalDespesasPagas + b.totalDespesasPendentes, 1);
  }

  barraReceita(): number {
    const b = this.balancoMes();
    if (!b) return 0;
    return Math.min(100, (b.totalReceitas / this.maiorValorFinancas()) * 100);
  }

  barraDespesaPaga(): number {
    const b = this.balancoMes();
    if (!b) return 0;
    return Math.min(100, (b.totalDespesasPagas / this.maiorValorFinancas()) * 100);
  }

  barraDespesaPendente(): number {
    const b = this.balancoMes();
    if (!b) return 0;
    return Math.min(100, (b.totalDespesasPendentes / this.maiorValorFinancas()) * 100);
  }

  financasBg(): string {
    const b = this.balancoMes();
    if (!b) return 'transparent';
    if (b.saldo >= 0) {
      return 'radial-gradient(ellipse 70% 90% at 100% 0%, rgba(16,185,129,0.10), transparent 65%), radial-gradient(ellipse 50% 70% at 0% 100%, rgba(139,92,246,0.08), transparent 65%)';
    }
    return 'radial-gradient(ellipse 70% 90% at 100% 0%, rgba(235,87,87,0.14), transparent 60%)';
  }

  financasGlow(): string {
    const b = this.balancoMes();
    if (!b) return 'rgba(94,106,210,0.4)';
    return b.saldo >= 0 ? 'rgba(16,185,129,0.5)' : 'rgba(235,87,87,0.5)';
  }

  fecharDetalhe(): void {
    this.tarefaDetalhe.set(null);
  }

  concluirDetalhe(t: Tarefa): void {
    if (this.processandoDetalhe()) return;
    this.processandoDetalhe.set(true);
    this.tarefasApi.concluir(t.id).subscribe({
      next: () => {
        this.processandoDetalhe.set(false);
        this.tarefaDetalhe.set(null);
        this.recarregarPendentes();
      },
      error: () => {
        this.processandoDetalhe.set(false);
      },
    });
  }

  reabrirDetalhe(t: Tarefa): void {
    if (this.processandoDetalhe()) return;
    this.processandoDetalhe.set(true);
    this.tarefasApi.reabrir(t.id).subscribe({
      next: () => {
        this.processandoDetalhe.set(false);
        this.tarefaDetalhe.set(null);
        this.recarregarPendentes();
      },
      error: () => {
        this.processandoDetalhe.set(false);
      },
    });
  }

  editarDetalhe(t: Tarefa): void {
    this.router.navigate(['/app/tarefas'], { queryParams: { detalhe: t.id } });
  }

  excluirDetalhe(t: Tarefa): void {
    this.router.navigate(['/app/tarefas'], { queryParams: { detalhe: t.id } });
  }

  private recarregarPendentes(): void {
    this.tarefasApi.listarPendentes().subscribe({
      next: (lista) => this.pendentes.set(lista),
    });
  }

  constructor() {
    this.pageHeader.set({
      titulo: 'Visão geral',
      iconeClasse: 'fa-solid fa-house text-accent text-[12px]',
    });
  }

  readonly nomeUsuario = signal(this.storage.usuario()?.nome ?? '');
  readonly fotoUsuario = signal<string | null>(this.storage.usuario()?.fotoUrl ?? null);
  readonly agora = signal(new Date());
  readonly alturaSlotAgenda = signal(40);
  private agoraTimer: number | null = null;
  private readonly agendaScroll = viewChild<ElementRef<HTMLDivElement>>('agendaScroll');
  private static readonly HORA_MIN = 0;
  private static readonly HORA_MAX = 23;
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly erroConcluidas = signal<string | null>(null);
  readonly pendentes = signal<Tarefa[]>([]);
  readonly concluidasRecentes = signal<Tarefa[]>([]);

  readonly totalPendentes = computed(() => this.pendentes().length);
  readonly atrasadas = computed(() => this.pendentes().filter((t) => t.status === 3).length);

  readonly pendentesHoje = computed(() => this.tarefasHoje().length);

  readonly tarefasHoje = computed(() => {
    const hoje = this.isoDataLocal(new Date());
    return this.pendentes()
      .filter((t) => t.dataPrazo?.substring(0, 10) === hoje)
      .sort((a, b) => (a.horarioFinal ?? '99:99').localeCompare(b.horarioFinal ?? '99:99'))
      .slice(0, 8);
  });

  readonly concluidasSemana = computed(() => {
    const inicioSemana = this.segundaDaSemana(new Date());
    return this.concluidasRecentes().filter((t) => {
      if (!t.concluidaEm) return false;
      return new Date(t.concluidaEm).getTime() >= inicioSemana.getTime();
    }).length;
  });

  readonly concluidasUltimas = computed(() =>
    this.concluidasRecentes()
      .filter((t) => !!t.concluidaEm)
      .sort((a, b) => (b.concluidaEm ?? '').localeCompare(a.concluidaEm ?? ''))
      .slice(0, 6),
  );

  readonly diasSemana = computed<DiaResumo[]>(() => {
    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const inicio = this.segundaDaSemana(new Date());
    const dias: DiaResumo[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      const iso = this.isoDataLocal(d);
      const pendentes = this.pendentes().filter((t) => t.dataPrazo?.substring(0, 10) === iso).length;
      const concluidas = this.concluidasRecentes().filter((t) => {
        if (!t.concluidaEm) return false;
        return this.isoDataLocal(new Date(t.concluidaEm)) === iso;
      }).length;
      dias.push({ iso, diaCurto: labels[i], pendentes, concluidas });
    }
    return dias;
  });

  readonly prioridadesResumo = computed<PrioridadeResumo[]>(() => {
    const defs: { p: number; label: string; cor: string }[] = [
      { p: 1, label: 'Urgente', cor: '#eb5757' },
      { p: 2, label: 'Importante', cor: '#f59e0b' },
      { p: 3, label: 'Normal', cor: '#5e6ad2' },
      { p: 4, label: 'Baixa', cor: '#62666d' },
    ];
    const total = this.pendentes().length;
    return defs.map((d) => {
      const qtd = this.pendentes().filter((t) => t.prioridade === d.p).length;
      return {
        label: d.label,
        total: qtd,
        cor: d.cor,
        porcentagem: total === 0 ? 0 : (qtd / total) * 100,
      };
    });
  });

  readonly categoriasResumo = computed<CategoriaResumo[]>(() => {
    const cores = ['#5e6ad2', '#10b981', '#f59e0b', '#eb5757', '#06b6d4', '#a855f7', '#ec4899', '#84cc16'];
    const contagem = new Map<string, number>();
    for (const t of this.pendentes()) {
      if (t.categorias.length === 0) {
        contagem.set('Sem categoria', (contagem.get('Sem categoria') ?? 0) + 1);
      } else {
        for (const c of t.categorias) {
          contagem.set(c.nome, (contagem.get(c.nome) ?? 0) + 1);
        }
      }
    }
    const total = [...contagem.values()].reduce((a, b) => a + b, 0);
    if (total === 0) return [];

    const items = [...contagem.entries()].sort((a, b) => b[1] - a[1]);
    const out: CategoriaResumo[] = [];
    let acumulado = 0;
    for (let i = 0; i < items.length; i++) {
      const [nome, qtd] = items[i];
      const porcentagem = (qtd / total) * 100;
      out.push({
        nome,
        total: qtd,
        cor: nome === 'Sem categoria' ? '#62666d' : cores[i % cores.length],
        porcentagem,
        inicioAngulo: acumulado,
        fimAngulo: acumulado + porcentagem,
      });
      acumulado += porcentagem;
    }
    return out;
  });

  ngOnInit(): void {
    const inicioSemana = this.segundaDaSemana(new Date());
    const inicioIso = this.isoDataLocal(inicioSemana);

    this.tarefasApi.listarPendentes().subscribe({
      next: (lista) => {
        this.pendentes.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.erro.set('Não consegui carregar as tarefas pendentes.');
      },
    });

    this.tarefasApi.listarConcluidas(inicioIso).subscribe({
      next: (lista) => {
        this.concluidasRecentes.set(lista);
        this.erroConcluidas.set(null);
      },
      error: () => {
        this.erroConcluidas.set('Não consegui carregar as concluídas da semana.');
      },
    });

    const hoje = new Date();
    this.financasApi.obterBalanco(hoje.getFullYear(), hoje.getMonth() + 1).subscribe({
      next: (b) => this.balancoMes.set(b),
      error: () => {},
    });

    this.agoraTimer = window.setInterval(() => this.agora.set(new Date()), 60000);
  }

  ngAfterViewInit(): void {
    // Scroll agenda pra trazer hora atual ao centro
    setTimeout(() => {
      const el = this.agendaScroll()?.nativeElement;
      const topo = this.topoLinhaAgora();
      if (el && topo !== null) {
        el.scrollTop = Math.max(0, topo - el.clientHeight / 2);
      }
    }, 80);
  }

  ngOnDestroy(): void {
    if (this.agoraTimer !== null) {
      window.clearInterval(this.agoraTimer);
      this.agoraTimer = null;
    }
    this.pageHeader.limpar();
  }

  saudacao(): string {
    const h = new Date().getHours();
    if (h < 6) return 'Boa madrugada';
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  readonly resumoSaudacao = computed(() => {
    if (this.carregando()) return 'Carregando seu painel...';
    const atrasadas = this.atrasadas();
    const hoje = this.pendentesHoje();
    const total = this.totalPendentes();
    if (atrasadas > 0) {
      return `${atrasadas} ${atrasadas === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'} esperando você. Bora resolver.`;
    }
    if (hoje > 0) {
      return `${hoje} ${hoje === 1 ? 'tarefa' : 'tarefas'} pra hoje. Tá no controle.`;
    }
    if (total > 0) {
      return `Nada pra hoje, mas tem ${total} ${total === 1 ? 'tarefa' : 'tarefas'} no radar.`;
    }
    return 'Tudo em dia. Aproveita.';
  });

  alturaBarra(valor: number): number {
    if (valor <= 0) return 0;
    const max = Math.max(
      1,
      ...this.diasSemana().flatMap((d) => [d.pendentes, d.concluidas]),
    );
    return Math.max(12, (valor / max) * 100);
  }

  corPrioridade(p: number): string {
    return ({
      1: '#eb5757',
      2: '#f59e0b',
      3: '#5e6ad2',
      4: '#62666d',
    } as Record<number, string>)[p] ?? '#5e6ad2';
  }

  formatarDia(iso: string): string {
    const d = new Date(iso);
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${dia}/${mes}`;
  }

  // ===== Agenda de hoje =====
  readonly horasAgenda = computed(() => {
    const arr: number[] = [];
    for (let h = VisaoGeralComponent.HORA_MIN; h <= VisaoGeralComponent.HORA_MAX; h++) arr.push(h);
    return arr;
  });

  readonly tarefasComHoraHoje = computed(() => {
    const hoje = this.isoDataLocal(this.agora());
    return this.pendentes()
      .filter((t) => t.dataPrazo?.substring(0, 10) === hoje && !!t.horarioFinal)
      .sort((a, b) => (a.horarioFinal ?? '').localeCompare(b.horarioFinal ?? ''));
  });

  readonly tarefasLayoutHoje = computed(() => {
    const altura = this.alturaSlotAgenda();
    const items = this.tarefasComHoraHoje().map((t) => ({
      id: String(t.id),
      top: this.topoTarefaHoje(t),
      alturaPx: altura - 4,
      tarefa: t,
    }));
    return calcularLayoutAgenda(items);
  });

  estiloPosicaoTarefa(p: ItemAgendaPosicionado<{ id: string; top: number; alturaPx: number }>): { left: string; width: string } {
    const w = 100 / p.totalCols;
    return {
      left: `calc(${p.col * w}% + 2px)`,
      width: `calc(${w}% - 4px)`,
    };
  }

  readonly tarefasSemHoraHoje = computed(() => {
    const hoje = this.isoDataLocal(this.agora());
    return this.pendentes().filter((t) => t.dataPrazo?.substring(0, 10) === hoje && !t.horarioFinal);
  });

  formatarHora(h: number): string {
    return `${String(h).padStart(2, '0')}h`;
  }

  topoTarefaHoje(t: Tarefa): number {
    if (!t.horarioFinal) return 0;
    const [hh, mm] = t.horarioFinal.substring(0, 5).split(':').map((x) => parseInt(x, 10));
    const altura = this.alturaSlotAgenda();
    const offset = Math.max(0, hh - VisaoGeralComponent.HORA_MIN);
    return offset * altura + Math.round((mm / 60) * altura);
  }

  topoLinhaAgora(): number | null {
    const a = this.agora();
    const hh = a.getHours();
    const mm = a.getMinutes();
    if (hh < VisaoGeralComponent.HORA_MIN || hh > VisaoGeralComponent.HORA_MAX) return null;
    const altura = this.alturaSlotAgenda();
    return (hh - VisaoGeralComponent.HORA_MIN) * altura + Math.round((mm / 60) * altura);
  }

  rotuloAgora(): string {
    const a = this.agora();
    return `${String(a.getHours()).padStart(2, '0')}:${String(a.getMinutes()).padStart(2, '0')}`;
  }

  dataHojeFormatada(): string {
    const d = this.agora();
    const dias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${dias[d.getDay()]}, ${d.getDate()} ${meses[d.getMonth()]}`;
  }

  private segundaDaSemana(d: Date): Date {
    const data = new Date(d);
    const dia = data.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    data.setDate(data.getDate() + diff);
    data.setHours(0, 0, 0, 0);
    return data;
  }

  private isoDataLocal(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
