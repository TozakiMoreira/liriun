import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { TokenStorage } from '../../core/auth/token.storage';
import { AvatarComponent } from '../../shared/avatar.component';

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
                <span class="text-[12px] text-text-dim font-medium">pontos</span>
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent font-semibold uppercase tracking-wider"
                  data-testid="hero-nivel"
                >
                  Nível {{ nivel() }}
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
                dias seguidos
              </span>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <div class="flex items-center justify-between text-[11px] text-text-dim mb-1.5">
            <span>Progresso até Nível {{ nivel() + 1 }}</span>
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
        class="card-elev p-5 flex flex-col gap-4"
        data-testid="meta-semanal"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-col gap-0.5">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-bullseye text-accent text-[13px]"></i>
              <h3 class="text-sm font-semibold">Meta da semana</h3>
            </div>
            <p class="text-[12px] text-text-dim">
              {{ rotuloMeta() }}
            </p>
          </div>
          <button
            type="button"
            class="text-[11px] text-text-subtle hover:text-text px-2 py-1 rounded hover:bg-bg-elev"
            data-testid="meta-editar-btn"
            title="Editar meta"
          >
            <i class="fa-solid fa-pen text-[10px]"></i>
          </button>
        </div>

        <div class="flex items-center gap-5">
          <div class="relative w-[88px] h-[88px] shrink-0">
            <svg viewBox="0 0 88 88" class="w-full h-full -rotate-90">
              <circle cx="44" cy="44" r="38" fill="none" stroke="rgb(var(--c-border))" stroke-width="8" />
              <circle
                cx="44" cy="44" r="38" fill="none"
                stroke="url(#gradMeta)"
                stroke-width="8"
                stroke-linecap="round"
                [attr.stroke-dasharray]="circ"
                [attr.stroke-dashoffset]="metaOffset()"
                class="transition-[stroke-dashoffset] duration-700"
              />
              <defs>
                <linearGradient id="gradMeta" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="rgb(94, 106, 210)" />
                  <stop offset="100%" stop-color="rgb(245, 158, 11)" />
                </linearGradient>
              </defs>
            </svg>
            <div class="absolute inset-0 grid place-items-center flex-col">
              <span class="text-[18px] font-semibold tabular-nums leading-none">{{ metaAtual() }}</span>
              <span class="text-[9.5px] text-text-subtle uppercase tracking-wider">de {{ metaAlvo() }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-2 flex-1 min-w-0">
            <div class="flex items-center gap-2 text-[12.5px]">
              <i class="fa-solid fa-check text-emerald-500 text-[10px]"></i>
              <span class="text-text-dim">{{ metaAtual() }} tarefas concluídas</span>
            </div>
            <div class="flex items-center gap-2 text-[12.5px]">
              <i class="fa-regular fa-clock text-text-subtle text-[10px]"></i>
              <span class="text-text-dim">{{ metaDiasRestantes() }} dias restantes</span>
            </div>
            <div class="flex items-center gap-2 text-[12.5px]">
              <i class="fa-solid fa-arrow-trend-up text-accent text-[10px]"></i>
              <span class="text-text-dim">{{ rotuloRitmo() }}</span>
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
            <h3 class="text-sm font-semibold">Conquistas</h3>
            <span
              class="text-[11px] px-1.5 py-0.5 rounded-full bg-bg-elev border border-border text-text-dim tabular-nums"
              >{{ totalDesbloqueadas() }}/{{ conquistas.length }}</span
            >
          </div>
        </div>

        <div
          class="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
          data-testid="conquistas-grid"
        >
          @for (c of conquistas; track c.codigo) {
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
              <div class="flex flex-col leading-tight min-w-0">
                <span class="text-[12.5px] font-semibold truncate">{{ c.nome }}</span>
                <span class="text-[10.5px] text-text-dim line-clamp-1">{{ c.descricao }}</span>
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

      <p class="text-[11px] text-text-subtle text-center pt-2 pb-4">
        Protótipo · dados ilustrativos · backend em desenvolvimento
      </p>
    </div>
  `,
})
export class GamificacaoPainelComponent {
  private readonly storage = inject(TokenStorage);

  readonly pontosPorNivel = PONTOS_POR_NIVEL;
  readonly circ = 2 * Math.PI * 38;

  readonly pontosTotais = signal(1240);
  readonly streak = signal(12);
  readonly metaAtual = signal(18);
  readonly metaAlvo = signal(25);
  readonly metaDiasRestantes = signal(3);
  readonly periodoLb = signal<'semana' | 'total'>('semana');

  readonly nivel = computed(() => Math.floor(this.pontosTotais() / PONTOS_POR_NIVEL) + 1);
  readonly pontosNoNivel = computed(() => this.pontosTotais() % PONTOS_POR_NIVEL);
  readonly percentualNivel = computed(() =>
    Math.round((this.pontosNoNivel() / PONTOS_POR_NIVEL) * 100),
  );
  readonly rotuloProximoNivel = computed(() => {
    const faltam = PONTOS_POR_NIVEL - this.pontosNoNivel();
    return `Faltam ${faltam} pts pro Nível ${this.nivel() + 1}`;
  });

  readonly metaOffset = computed(() => {
    const pct = Math.min(this.metaAtual() / this.metaAlvo(), 1);
    return this.circ * (1 - pct);
  });

  readonly rotuloMeta = computed(() => {
    const pct = (this.metaAtual() / this.metaAlvo()) * 100;
    if (pct >= 100) return 'Meta concluída — você arrasou esta semana.';
    if (pct >= 70) return 'Quase lá. Falta pouco pra fechar a semana.';
    if (pct >= 40) return 'No ritmo certo, continua assim.';
    return 'Comece pequeno. Uma tarefa de cada vez.';
  });

  readonly rotuloRitmo = computed(() => {
    const ritmo = this.metaAtual() / Math.max(7 - this.metaDiasRestantes(), 1);
    return `Ritmo: ${ritmo.toFixed(1)} tarefas/dia`;
  });

  readonly conquistas: Conquista[] = [
    {
      codigo: 'primeira-tarefa',
      nome: 'Primeiros passos',
      descricao: 'Concluiu sua primeira tarefa',
      icone: 'fa-seedling',
      desbloqueada: true,
      desbloqueadaEm: '2026-04-12',
      cor: 'emerald',
    },
    {
      codigo: '10-tarefas',
      nome: 'Pegando o ritmo',
      descricao: '10 tarefas concluídas',
      icone: 'fa-bolt',
      desbloqueada: true,
      desbloqueadaEm: '2026-04-18',
      cor: 'sky',
    },
    {
      codigo: 'streak-7',
      nome: 'Sete dias forte',
      descricao: '7 dias seguidos com tarefa',
      icone: 'fa-fire',
      desbloqueada: true,
      desbloqueadaEm: '2026-04-25',
      cor: 'orange',
    },
    {
      codigo: 'no-prazo-10',
      nome: 'Sempre no prazo',
      descricao: '10 tarefas concluídas antes do prazo',
      icone: 'fa-clock',
      desbloqueada: true,
      desbloqueadaEm: '2026-05-02',
      cor: 'violet',
    },
    {
      codigo: '100-tarefas',
      nome: 'Centena',
      descricao: '100 tarefas concluídas',
      icone: 'fa-mountain',
      desbloqueada: false,
      progresso: { atual: 67, alvo: 100 },
      cor: 'amber',
    },
    {
      codigo: 'streak-30',
      nome: 'Mês de fogo',
      descricao: '30 dias seguidos',
      icone: 'fa-trophy',
      desbloqueada: false,
      progresso: { atual: 12, alvo: 30 },
      cor: 'rose',
    },
  ];

  readonly totalDesbloqueadas = computed(
    () => this.conquistas.filter((c) => c.desbloqueada).length,
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
}
