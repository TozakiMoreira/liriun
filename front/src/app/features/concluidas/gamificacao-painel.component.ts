import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, computed, inject, signal } from '@angular/core';
import { Tarefa, TarefasService } from '../../core/api/tarefas.service';
import { TokenStorage } from '../../core/auth/token.storage';
import { FEATURE_FLAGS } from '../../core/features/feature-flags';
import { LocaleService } from '../../core/locale/locale.service';
import { AvatarComponent } from '../../shared/avatar.component';
import { ConquistaToastService } from '../../shared/conquista-toast.service';

interface Conquista {
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  desbloqueada: boolean;
  desbloqueadaEm?: string;
  progresso?: { atual: number; alvo: number };
  cor: 'amber' | 'emerald' | 'sky' | 'violet' | 'rose' | 'orange';
}

interface AmigoRanking {
  id: string;
  nome: string;
  fotoUrl: string | null;
  pontos: number;
  ganhoSemana: number;
  posicao: number;
  voce: boolean;
}

const PONTOS_POR_NIVEL = 250;

@Component({
  selector: 'app-gamificacao-painel',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  template: `
    <div class="flex flex-col gap-5" data-testid="gamificacao-painel">
      <section
        class="card-elev p-5 sm:p-6 relative overflow-hidden"
        data-testid="hero-gamificacao"
        style="background-image: radial-gradient(ellipse 80% 60% at 0% 0%, rgba(94, 106, 210, 0.18), transparent 60%), radial-gradient(ellipse 60% 80% at 100% 100%, rgba(245, 158, 11, 0.10), transparent 50%);"
      >
        <div class="flex flex-col sm:flex-row sm:items-center gap-5">
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <div
              class="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/30 grid place-items-center text-accent shrink-0 shadow-glow"
              aria-hidden="true"
            >
              <i class="fa-solid fa-trophy text-[22px]"></i>
            </div>
            <div class="flex flex-col gap-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-2xl font-semibold tabular-nums">{{ pontosTotais() }}</span>
                <span class="text-[12px] text-text-dim font-medium">{{ locale.t('gamif.pontos') }}</span>
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent font-semibold uppercase tracking-wider"
                  data-testid="hero-nivel"
                >
                  {{ locale.t('gamif.nivel', { n: nivel() + '' }) }}
                </span>
              </div>
              <div class="text-[12px] text-text-dim">
                {{ rotuloProximoNivel() }}
              </div>
            </div>
          </div>

          <div
            class="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30"
            data-testid="hero-streak"
          >
            <i class="fa-solid fa-fire text-orange-500 text-[18px]"></i>
            <div class="flex flex-col leading-tight">
              <span class="text-[18px] font-semibold tabular-nums text-orange-500">{{ streak() }}</span>
              <span class="text-[10px] text-text-dim uppercase tracking-wider">
                {{ locale.t('gamif.dias_seguidos') }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <div class="flex items-center justify-between text-[11px] text-text-dim mb-1.5">
            <span>{{ locale.t('gamif.progresso_ate_nivel', { n: (nivel() + 1) + '' }) }}</span>
            <span class="tabular-nums">{{ pontosNoNivel() }}/{{ pontosPorNivel }}</span>
          </div>
          <div class="h-2 rounded-full bg-bg-elev overflow-hidden" role="progressbar"
            [attr.aria-valuenow]="percentualNivel()"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              class="h-full rounded-full bg-gradient-to-r from-accent to-orange-400 transition-[width] duration-500"
              [style.width.%]="percentualNivel()"
            ></div>
          </div>
        </div>
      </section>

      <section
        class="card-elev p-5 flex flex-col gap-3"
        data-testid="parabens-semana"
      >
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-heart text-rose-400 text-[13px]"></i>
          <h3 class="text-sm font-semibold">{{ locale.t('gamif.esta_semana') }}</h3>
        </div>

        <p class="text-[14px] text-text leading-relaxed">
          {{ mensagemSemana() }}
        </p>

        <div class="grid grid-cols-2 gap-3 mt-1">
          <button
            type="button"
            class="bg-bg-surface border border-border rounded-lg p-3 flex flex-col gap-1 text-left hover:border-accent/50 hover:bg-bg-elev transition-colors group"
            data-testid="card-tarefas-fechadas"
            (click)="verAtividade.emit()"
            [title]="locale.t('gamif.ver_tarefas_concluidas')"
          >
            <div class="flex items-center justify-between">
              <span class="text-[11px] uppercase tracking-wider text-text-subtle font-medium">{{ locale.t('gamif.tarefas_fechadas') }}</span>
              <i class="fa-solid fa-arrow-right text-[10px] text-text-subtle group-hover:text-accent group-hover:translate-x-0.5 transition-all"></i>
            </div>
            <div class="flex items-baseline gap-2 flex-wrap">
              <span class="text-2xl font-semibold tabular-nums">{{ tarefasSemana() }}</span>
              @if (deltaSemana() !== 0) {
                <span
                  class="text-[11px] font-medium tabular-nums"
                  [class.text-emerald-400]="deltaSemana() > 0"
                  [class.text-text-subtle]="deltaSemana() <= 0"
                >
                  {{ deltaSemana() > 0 ? '+' : '' }}{{ deltaSemana() }} {{ locale.t('gamif.delta_vs_anterior') }}
                </span>
              }
            </div>
          </button>
          <div class="bg-bg-surface border border-border rounded-lg p-3 flex flex-col gap-1">
            <span class="text-[11px] uppercase tracking-wider text-text-subtle font-medium">{{ locale.t('gamif.dias_ativos') }}</span>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-semibold tabular-nums">{{ diasAtivosSemana() }}</span>
              <span class="text-[11px] text-text-subtle">{{ locale.t('gamif.de_n', { n: '7' }) }}</span>
            </div>
          </div>
        </div>
      </section>

      <section
        class="card-elev p-5 flex flex-col gap-4"
        data-testid="conquistas-secao"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-medal text-accent text-[13px]"></i>
            <h3 class="text-sm font-semibold">{{ locale.t('gamif.conquistas') }}</h3>
            <span
              class="text-[11px] px-1.5 py-0.5 rounded-full bg-bg-elev border border-border text-text-dim tabular-nums"
              >{{ totalDesbloqueadas() }}/{{ conquistas().length }}</span
            >
          </div>
        </div>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5"
          data-testid="conquistas-grid"
        >
          @for (c of conquistas(); track c.codigo) {
            <div
              class="flex items-center gap-3 p-3 rounded-lg border transition-colors"
              [class.bg-bg-surface]="c.desbloqueada"
              [class.border-border-strong]="c.desbloqueada"
              [class.bg-bg-elev]="!c.desbloqueada"
              [class.border-border]="!c.desbloqueada"
              [class.opacity-50]="!c.desbloqueada"
              [attr.data-testid]="'conquista-' + c.codigo"
              [attr.data-unlocked]="c.desbloqueada"
              [title]="c.descricao"
            >
              <div
                class="w-10 h-10 rounded-lg grid place-items-center shrink-0"
                [class]="iconeBg(c)"
              >
                @if (c.desbloqueada) {
                  <i [class]="'fa-solid ' + c.icone + ' text-[15px] ' + iconeCor(c)"></i>
                } @else {
                  <i class="fa-solid fa-lock text-text-subtle text-[12px]"></i>
                }
              </div>
              <div class="flex flex-col leading-tight min-w-0 flex-1">
                <span class="text-[13px] font-semibold">{{ c.nome }}</span>
                <span class="text-[11px] text-text-dim leading-snug">{{ c.descricao }}</span>
                @if (!c.desbloqueada && c.progresso) {
                  <span class="text-[10px] text-text-subtle tabular-nums mt-0.5"
                    >{{ c.progresso.atual }}/{{ c.progresso.alvo }}</span
                  >
                }
              </div>
            </div>
          }
        </div>
      </section>

      <section
        class="card-elev p-5 flex flex-col gap-4"
        data-testid="marcos-pessoais"
      >
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-mountain-sun text-accent text-[13px]"></i>
          <h3 class="text-sm font-semibold">{{ locale.t('gamif.marcos_titulo') }}</h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="bg-bg-surface border border-border rounded-lg p-4 flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-fire text-orange-500 text-[12px]"></i>
              <span class="text-[11px] uppercase tracking-wider text-text-subtle font-medium">{{ locale.t('gamif.maior_streak') }}</span>
            </div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-semibold tabular-nums">{{ recordeStreak() }}</span>
              <span class="text-[12px] text-text-dim">{{ locale.t('gamif.dias') }}</span>
            </div>
          </div>
          <div class="bg-bg-surface border border-border rounded-lg p-4 flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-check-double text-emerald-500 text-[12px]"></i>
              <span class="text-[11px] uppercase tracking-wider text-text-subtle font-medium">{{ locale.t('gamif.total_acumulado') }}</span>
            </div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-semibold tabular-nums">{{ totalAcumulado() }}</span>
              <span class="text-[12px] text-text-dim">{{ locale.t('gamif.tarefas') }}</span>
            </div>
          </div>
          <div class="bg-bg-surface border border-border rounded-lg p-4 flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-star text-amber-400 text-[12px]"></i>
              <span class="text-[11px] uppercase tracking-wider text-text-subtle font-medium">{{ locale.t('gamif.melhor_semana') }}</span>
            </div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-semibold tabular-nums">{{ melhorSemana() }}</span>
              <span class="text-[12px] text-text-dim">{{ locale.t('gamif.tarefas') }}</span>
            </div>
          </div>
        </div>
      </section>

      <section
        class="card-elev p-5 flex flex-col items-center gap-2 text-center"
        data-testid="frase-positiva"
        style="background-image: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(94, 106, 210, 0.10), transparent 70%);"
      >
        <i class="fa-solid fa-quote-left text-accent text-[14px] opacity-50"></i>
        <p class="text-[14px] text-text leading-relaxed max-w-[440px] italic">
          {{ frasePositiva() }}
        </p>
      </section>

      @if (rankingAtivo) {
      <section
        class="card-elev p-5 flex flex-col gap-4"
        data-testid="leaderboard-secao"
      >
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-users text-accent text-[13px]"></i>
            <h3 class="text-sm font-semibold">Ranking de amigos</h3>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-medium uppercase tracking-wider"
              title="Apenas pessoas que você convidou"
            >
              Privado
            </span>
          </div>
          <div class="flex items-center gap-1 bg-bg-elev border border-border rounded p-0.5" data-testid="leaderboard-periodo">
            <button
              type="button"
              class="px-2.5 py-0.5 text-[11px] rounded transition-colors"
              [class]="periodoLb() === 'semana' ? 'bg-bg text-text' : 'text-text-dim hover:text-text'"
              (click)="periodoLb.set('semana')"
            >
              Semana
            </button>
            <button
              type="button"
              class="px-2.5 py-0.5 text-[11px] rounded transition-colors"
              [class]="periodoLb() === 'total' ? 'bg-bg text-text' : 'text-text-dim hover:text-text'"
              (click)="periodoLb.set('total')"
            >
              Geral
            </button>
          </div>
        </div>

        <div class="flex flex-col" data-testid="leaderboard-lista">
          @for (a of leaderboardOrdenado(); track a.id) {
            <div
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
              [class.bg-accent]="a.voce"
              [class.bg-opacity-10]="a.voce"
              [class.border]="a.voce"
              [class.border-accent]="a.voce"
              [class.border-opacity-30]="a.voce"
              [attr.data-testid]="'leaderboard-row-' + a.id"
              [attr.data-you]="a.voce"
            >
              <div
                class="w-7 text-center text-[13px] font-semibold tabular-nums shrink-0"
                [class.text-amber-400]="a.posicao === 1"
                [class.text-text-dim]="a.posicao > 3"
                [class.text-text]="a.posicao === 2 || a.posicao === 3"
              >
                @if (a.posicao === 1) {
                  <i class="fa-solid fa-crown text-amber-400"></i>
                } @else {
                  {{ a.posicao }}
                }
              </div>
              <app-avatar [nome]="a.nome" [fotoUrl]="a.fotoUrl" [size]="32" />
              <div class="flex flex-col leading-tight flex-1 min-w-0">
                <span class="text-[13px] font-medium truncate">
                  {{ a.nome }}
                  @if (a.voce) {
                    <span class="text-text-subtle font-normal">(você)</span>
                  }
                </span>
                <span class="text-[10.5px] text-text-dim tabular-nums">
                  +{{ a.ganhoSemana }} esta semana
                </span>
              </div>
              <div class="text-right shrink-0">
                <div class="text-[14px] font-semibold tabular-nums">{{ pontoExibido(a) }}</div>
                <div class="text-[9.5px] text-text-subtle uppercase tracking-wider">pts</div>
              </div>
            </div>
          }
        </div>

        <button
          type="button"
          class="btn-secondary text-[12.5px] py-2 self-start flex items-center gap-2"
          data-testid="convidar-amigo-btn"
        >
          <i class="fa-solid fa-user-plus text-[11px]"></i>
          Convidar amigo
        </button>

        <p class="text-[11px] text-text-subtle leading-relaxed">
          Ranking visível apenas pra você e pessoas que você convidou. Ninguém vê suas tarefas — só os pontos.
        </p>
      </section>
      }

      <div class="flex flex-col items-center gap-2 pt-2 pb-4">
        <button
          type="button"
          class="text-[11px] text-text-subtle hover:text-accent transition-colors flex items-center gap-1.5"
          data-testid="demo-conquista-btn"
          (click)="simularConquista()"
        >
          <i class="fa-solid fa-bell text-[10px]"></i>
          {{ locale.t('gamif.demo_btn') }}
        </button>
        <p class="text-[11px] text-text-subtle text-center">
          {{ locale.t('gamif.legend') }}
        </p>
      </div>
    </div>
  `,
})
export class GamificacaoPainelComponent implements OnInit {
  private readonly storage = inject(TokenStorage);
  private readonly conquistaToast = inject(ConquistaToastService);
  private readonly tarefasApi = inject(TarefasService);
  readonly locale = inject(LocaleService);

  @Output() readonly verAtividade = new EventEmitter<void>();

  readonly rankingAtivo = FEATURE_FLAGS.rankingAmigos;
  readonly pontosPorNivel = PONTOS_POR_NIVEL;

  readonly historico = signal<Tarefa[]>([]);
  readonly carregando = signal(true);
  readonly erroCarregar = signal(false);
  readonly periodoLb = signal<'semana' | 'total'>('semana');

  ngOnInit(): void {
    this.carregando.set(true);
    const ate = new Date();
    const de = new Date();
    de.setDate(de.getDate() - 90);
    this.tarefasApi.listarConcluidas(de.toISOString(), ate.toISOString()).subscribe({
      next: (lista) => {
        this.historico.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.erroCarregar.set(true);
        this.carregando.set(false);
      },
    });
  }

  private chaveData(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  readonly totalAcumulado = computed(() => this.historico().length);

  readonly tarefasSemana = computed(() => {
    const inicio = this.inicioSemana();
    return this.historico().filter((t) => t.concluidaEm && new Date(t.concluidaEm) >= inicio).length;
  });

  readonly tarefasSemanaPassada = computed(() => {
    const inicioAtual = this.inicioSemana();
    const inicioPassada = new Date(inicioAtual);
    inicioPassada.setDate(inicioPassada.getDate() - 7);
    return this.historico().filter((t) => {
      if (!t.concluidaEm) return false;
      const d = new Date(t.concluidaEm);
      return d >= inicioPassada && d < inicioAtual;
    }).length;
  });

  readonly diasAtivosSemana = computed(() => {
    const inicio = this.inicioSemana();
    const dias = new Set<string>();
    for (const t of this.historico()) {
      if (!t.concluidaEm) continue;
      const d = new Date(t.concluidaEm);
      if (d >= inicio) dias.add(this.chaveData(d));
    }
    return dias.size;
  });

  readonly streak = computed(() => {
    const dias = new Set<string>();
    for (const t of this.historico()) {
      if (!t.concluidaEm) continue;
      dias.add(this.chaveData(new Date(t.concluidaEm)));
    }
    let count = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (dias.has(this.chaveData(cursor))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  });

  readonly recordeStreak = computed(() => {
    const dias = [...new Set(
      this.historico()
        .filter((t) => t.concluidaEm)
        .map((t) => this.chaveData(new Date(t.concluidaEm!))),
    )].sort();
    if (dias.length === 0) return 0;
    let max = 1;
    let atual = 1;
    for (let i = 1; i < dias.length; i++) {
      const a = dias[i - 1].split('-').map(Number);
      const b = dias[i].split('-').map(Number);
      const dA = new Date(a[0], a[1], a[2]);
      const dB = new Date(b[0], b[1], b[2]);
      const diff = Math.round((dB.getTime() - dA.getTime()) / 86400000);
      if (diff === 1) {
        atual++;
        if (atual > max) max = atual;
      } else {
        atual = 1;
      }
    }
    return Math.max(max, this.streak());
  });

  readonly melhorSemana = computed(() => {
    const porSemana = new Map<string, number>();
    for (const t of this.historico()) {
      if (!t.concluidaEm) continue;
      const d = new Date(t.concluidaEm);
      const inicio = new Date(d);
      inicio.setDate(d.getDate() - d.getDay());
      inicio.setHours(0, 0, 0, 0);
      const chave = this.chaveData(inicio);
      porSemana.set(chave, (porSemana.get(chave) ?? 0) + 1);
    }
    return Math.max(0, ...porSemana.values());
  });

  readonly pontosTotais = computed(() => {
    const total = this.totalAcumulado();
    const streakAtual = this.streak();
    return total * 10 + streakAtual * 5;
  });

  private inicioSemana(): Date {
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - hoje.getDay());
    inicio.setHours(0, 0, 0, 0);
    return inicio;
  }

  readonly nivel = computed(() => Math.floor(this.pontosTotais() / PONTOS_POR_NIVEL) + 1);
  readonly pontosNoNivel = computed(() => this.pontosTotais() % PONTOS_POR_NIVEL);
  readonly percentualNivel = computed(() =>
    Math.round((this.pontosNoNivel() / PONTOS_POR_NIVEL) * 100),
  );
  readonly rotuloProximoNivel = computed(() => {
    const faltam = PONTOS_POR_NIVEL - this.pontosNoNivel();
    return this.locale.t('gamif.faltam_pontos', { n: faltam + '', prox: (this.nivel() + 1) + '' });
  });

  readonly deltaSemana = computed(() => this.tarefasSemana() - this.tarefasSemanaPassada());

  readonly mensagemSemana = computed(() => {
    const nome = this.storage.usuario()?.nome?.split(' ')[0] ?? this.locale.t('gamif.voce');
    const t = this.tarefasSemana();
    const d = this.deltaSemana();
    const vars = { nome, t: t + '' };
    if (t === 0) return this.locale.t('gamif.msg_zero', vars);
    if (d > 5) return this.locale.t('gamif.msg_grande', vars);
    if (d > 0) return this.locale.t('gamif.msg_mais', vars);
    if (d === 0) return this.locale.t('gamif.msg_constancia', vars);
    return this.locale.t('gamif.msg_menos', vars);
  });

  readonly frasePositiva = computed(() => {
    const dia = new Date().getDate();
    const idx = (dia % 8) + 1;
    return this.locale.t(`frase.${idx}`);
  });

  private noPrazoCount(): number {
    return this.historico().filter((t) => {
      if (!t.concluidaEm || !t.dataPrazo) return false;
      return new Date(t.concluidaEm) <= new Date(t.dataPrazo);
    }).length;
  }

  readonly conquistas = computed<Conquista[]>(() => {
    const total = this.totalAcumulado();
    const recorde = this.recordeStreak();
    const noPrazo = this.noPrazoCount();
    const _ = this.locale.locale();
    return [
      {
        codigo: 'primeira-tarefa',
        nome: this.locale.t('conquista.primeiros_passos.nome'),
        descricao: this.locale.t('conquista.primeiros_passos.desc'),
        icone: 'fa-seedling',
        desbloqueada: total >= 1,
        cor: 'emerald',
        progresso: total < 1 ? { atual: 0, alvo: 1 } : undefined,
      },
      {
        codigo: '10-tarefas',
        nome: this.locale.t('conquista.10_tarefas.nome'),
        descricao: this.locale.t('conquista.10_tarefas.desc'),
        icone: 'fa-bolt',
        desbloqueada: total >= 10,
        cor: 'sky',
        progresso: total < 10 ? { atual: total, alvo: 10 } : undefined,
      },
      {
        codigo: 'streak-7',
        nome: this.locale.t('conquista.streak_7.nome'),
        descricao: this.locale.t('conquista.streak_7.desc'),
        icone: 'fa-fire',
        desbloqueada: recorde >= 7,
        cor: 'orange',
        progresso: recorde < 7 ? { atual: recorde, alvo: 7 } : undefined,
      },
      {
        codigo: 'no-prazo-10',
        nome: this.locale.t('conquista.no_prazo_10.nome'),
        descricao: this.locale.t('conquista.no_prazo_10.desc'),
        icone: 'fa-clock',
        desbloqueada: noPrazo >= 10,
        cor: 'violet',
        progresso: noPrazo < 10 ? { atual: noPrazo, alvo: 10 } : undefined,
      },
      {
        codigo: '100-tarefas',
        nome: this.locale.t('conquista.centena.nome'),
        descricao: this.locale.t('conquista.centena.desc'),
        icone: 'fa-mountain',
        desbloqueada: total >= 100,
        cor: 'amber',
        progresso: total < 100 ? { atual: total, alvo: 100 } : undefined,
      },
      {
        codigo: 'streak-30',
        nome: this.locale.t('conquista.streak_30.nome'),
        descricao: this.locale.t('conquista.streak_30.desc'),
        icone: 'fa-trophy',
        desbloqueada: recorde >= 30,
        cor: 'rose',
        progresso: recorde < 30 ? { atual: recorde, alvo: 30 } : undefined,
      },
    ];
  });

  readonly totalDesbloqueadas = computed(
    () => this.conquistas().filter((c) => c.desbloqueada).length,
  );

  private readonly amigos: AmigoRanking[] = [
    {
      id: 'pedro',
      nome: 'Pedro Tozaki',
      fotoUrl: null,
      pontos: 1840,
      ganhoSemana: 340,
      posicao: 0,
      voce: false,
    },
    {
      id: 'self',
      nome: this.storage.usuario()?.nome ?? 'Você',
      fotoUrl: this.storage.usuario()?.fotoUrl ?? null,
      pontos: 1240,
      ganhoSemana: 220,
      posicao: 0,
      voce: true,
    },
    {
      id: 'marina',
      nome: 'Marina Alves',
      fotoUrl: null,
      pontos: 980,
      ganhoSemana: 180,
      posicao: 0,
      voce: false,
    },
    {
      id: 'rafael',
      nome: 'Rafael Lima',
      fotoUrl: null,
      pontos: 720,
      ganhoSemana: 95,
      posicao: 0,
      voce: false,
    },
    {
      id: 'carla',
      nome: 'Carla Souza',
      fotoUrl: null,
      pontos: 410,
      ganhoSemana: 30,
      posicao: 0,
      voce: false,
    },
  ];

  readonly leaderboardOrdenado = computed<AmigoRanking[]>(() => {
    const chave = this.periodoLb() === 'semana' ? 'ganhoSemana' : 'pontos';
    const ordenado = [...this.amigos].sort((a, b) => (b[chave] as number) - (a[chave] as number));
    return ordenado.map((a, i) => ({ ...a, posicao: i + 1 }));
  });

  pontoExibido(a: AmigoRanking): number {
    return this.periodoLb() === 'semana' ? a.ganhoSemana : a.pontos;
  }

  iconeBg(c: Conquista): string {
    if (!c.desbloqueada) return 'bg-bg-elev';
    const map: Record<Conquista['cor'], string> = {
      amber: 'bg-amber-500/15 border border-amber-500/30',
      emerald: 'bg-emerald-500/15 border border-emerald-500/30',
      sky: 'bg-sky-500/15 border border-sky-500/30',
      violet: 'bg-violet-500/15 border border-violet-500/30',
      rose: 'bg-rose-500/15 border border-rose-500/30',
      orange: 'bg-orange-500/15 border border-orange-500/30',
    };
    return map[c.cor];
  }

  iconeCor(c: Conquista): string {
    const map: Record<Conquista['cor'], string> = {
      amber: 'text-amber-500',
      emerald: 'text-emerald-500',
      sky: 'text-sky-500',
      violet: 'text-violet-500',
      rose: 'text-rose-500',
      orange: 'text-orange-500',
    };
    return map[c.cor];
  }

  simularConquista(): void {
    const lista = this.conquistas();
    const bloqueadas = lista.filter((c) => !c.desbloqueada);
    const alvo = bloqueadas[0] ?? lista[0];
    this.conquistaToast.mostrar({
      codigo: alvo.codigo,
      nome: alvo.nome,
      descricao: alvo.descricao,
      icone: alvo.icone,
      cor: alvo.cor,
    });
  }
}
