import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Tarefa, TarefasService } from '../../core/api/tarefas.service';
import { TarefaFormComponent } from './tarefa-form.component';

interface Grupo {
  chave: string;
  titulo: string;
  atrasada: boolean;
  tarefas: Tarefa[];
}

@Component({
  selector: 'app-tarefas',
  standalone: true,
  imports: [CommonModule, TarefaFormComponent],
  template: `
    <header class="flex items-center px-8 py-3.5 border-b border-border gap-4">
      <div class="flex items-center gap-2 text-[13px] text-text-dim">
        <i class="fa-solid fa-list-check text-accent text-[11px]"></i>
        <strong class="text-text font-medium">Minhas Tarefas</strong>
        <span
          class="ml-1.5 text-[11px] px-2 py-0.5 rounded-full bg-bg-elev border border-border"
          data-testid="task-total-count"
        >
          {{ pendentes().length }} pendente{{ pendentes().length === 1 ? '' : 's' }}
        </span>
      </div>

      <div class="ml-auto">
        <button
          type="button"
          class="btn-primary text-[13px] flex items-center gap-1.5"
          data-testid="new-task-btn"
          (click)="abrirNova()"
        >
          <i class="fa-solid fa-plus text-[10px]"></i>
          Nova tarefa
        </button>
      </div>
    </header>

    <div class="flex-1 px-8 py-6 overflow-auto" data-testid="tarefas-page">
      @if (carregando()) {
        <p class="text-text-subtle text-sm">Carregando...</p>
      } @else if (pendentes().length === 0) {
        <div class="text-center py-16 text-text-subtle text-[13px]" data-testid="tarefas-vazio">
          Tudo em dia. Nada pra fazer agora.
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
                  class="grid grid-cols-[28px_1fr_auto_auto_auto_auto] items-center gap-3.5 px-3 py-2.5 rounded border-b border-border last:border-b-0 hover:bg-bg-elev group transition-colors"
                  [attr.data-testid]="'task-' + t.id"
                >
                  <button
                    type="button"
                    class="w-[18px] h-[18px] border-[1.5px] border-border-strong rounded-full grid place-items-center hover:border-accent hover:bg-accent/15 transition-colors"
                    [attr.data-testid]="'task-' + t.id + '-complete'"
                    (click)="concluir(t)"
                    [disabled]="processando().has(t.id)"
                    title="Concluir"
                  >
                    <i class="fa-solid fa-check text-[10px] text-transparent hover:text-accent"></i>
                  </button>

                  <div class="text-sm font-medium truncate">{{ t.nome }}</div>

                  <div class="flex gap-1 flex-nowrap">
                    @for (c of t.categorias; track c.id) {
                      <span
                        class="text-[11px] px-2 py-0.5 bg-[#16181c] border border-border rounded-full text-text-dim whitespace-nowrap"
                        >{{ c.nome }}</span
                      >
                    }
                  </div>

                  <div
                    class="flex items-center gap-1.5 text-xs text-text-dim font-medium min-w-[90px]"
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
                    class="text-xs text-right min-w-[120px] flex items-center justify-end gap-1.5 tabular-nums"
                    [class.text-danger]="t.status === 3"
                    [class.font-medium]="t.status === 3"
                    [class.text-text-dim]="t.status !== 3"
                  >
                    <i class="fa-solid fa-clock text-[10px]"></i>
                    {{ formatarPrazo(t) }}
                  </div>

                  <div class="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      class="w-[26px] h-[26px] rounded grid place-items-center text-text-subtle hover:bg-[#16181c] hover:text-text"
                      title="Editar"
                      [attr.data-testid]="'task-' + t.id + '-edit'"
                      (click)="editar(t)"
                    >
                      <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button
                      type="button"
                      class="w-[26px] h-[26px] rounded grid place-items-center text-text-subtle hover:bg-danger/15 hover:text-danger"
                      title="Excluir"
                      [attr.data-testid]="'task-' + t.id + '-delete'"
                      (click)="excluir(t)"
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
  `,
})
export class TarefasComponent implements OnInit {
  private readonly tarefasApi = inject(TarefasService);

  readonly pendentes = signal<Tarefa[]>([]);
  readonly carregando = signal(true);
  readonly formAberto = signal(false);
  readonly emEdicao = signal<Tarefa | null>(null);
  readonly processando = signal(new Set<string>());

  readonly grupos = computed<Grupo[]>(() => {
    const lista = this.pendentes();
    const atrasadas = lista.filter((t) => t.status === 3);
    const outras = lista.filter((t) => t.status !== 3);

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

    const grupos: Grupo[] = [];
    if (atrasadas.length > 0) {
      grupos.push({ chave: 'atrasadas', titulo: 'Atrasadas', atrasada: true, tarefas: atrasadas });
    }
    grupos.push(...[...porCategoria.values()].sort((a, b) => a.titulo.localeCompare(b.titulo)));
    return grupos;
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.tarefasApi.listarPendentes().subscribe({
      next: (lista) => {
        this.pendentes.set(lista);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  concluir(t: Tarefa): void {
    if (this.processando().has(t.id)) return;
    this.processando.update((s) => new Set(s).add(t.id));
    this.tarefasApi.concluir(t.id).subscribe({
      next: () => {
        this.pendentes.update((list) => list.filter((x) => x.id !== t.id));
        this.processando.update((s) => {
          const n = new Set(s);
          n.delete(t.id);
          return n;
        });
      },
      error: () => {
        this.processando.update((s) => {
          const n = new Set(s);
          n.delete(t.id);
          return n;
        });
      },
    });
  }

  excluir(t: Tarefa): void {
    if (!confirm(`Excluir "${t.nome}"?`)) return;
    this.tarefasApi.remover(t.id).subscribe(() => {
      this.pendentes.update((list) => list.filter((x) => x.id !== t.id));
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

  fecharForm(): void {
    this.formAberto.set(false);
    this.emEdicao.set(null);
  }

  aposSalvar(): void {
    this.fecharForm();
    this.carregar();
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
    if (!t.dataPrazo) return 'sem prazo';
    const data = new Date(t.dataPrazo);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const alvo = new Date(data);
    alvo.setHours(0, 0, 0, 0);
    const diff = Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
    const hora = t.horarioFinal ? t.horarioFinal.substring(0, 5) : '23:59';

    if (t.status === 3) {
      const dias = Math.abs(diff);
      if (dias === 0) return `Hoje, ${hora}`;
      if (dias === 1) return `Ontem, ${hora}`;
      return `${dias} dias atrás, ${hora}`;
    }
    if (diff === 0) return `Hoje, ${hora}`;
    if (diff === 1) return `Amanhã, ${hora}`;
    if (diff < 0) return `${Math.abs(diff)} dias atrás`;
    return `Em ${diff} dias`;
  }
}
