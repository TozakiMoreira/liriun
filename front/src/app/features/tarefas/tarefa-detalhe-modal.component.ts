import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tarefa, TarefaPayload, TarefasService } from '../../core/api/tarefas.service';
import { quebrarTextoEmSegmentos } from '../../shared/auto-link';
import { extrairProblemDetails } from '../../shared/problem-details';

@Component({
  selector: 'app-tarefa-detalhe-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 grid place-items-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalhe-titulo"
      data-testid="tarefa-detalhe-overlay"
      (click)="fechar()"
    >
      <div
        class="card-elev w-full max-w-[560px] max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <span
              class="w-1 self-stretch rounded-r mt-0.5"
              [style.background]="corPrioridade(tarefa.prioridade)"
              aria-hidden="true"
            ></span>
            <h2
              id="detalhe-titulo"
              class="text-base font-semibold leading-tight break-words flex-1"
              data-testid="detalhe-nome"
            >
              {{ tarefa.nome }}
            </h2>
          </div>
          <button
            type="button"
            class="text-text-subtle hover:text-text text-base p-1 leading-none shrink-0"
            data-testid="detalhe-close"
            aria-label="Fechar"
            (click)="fechar()"
          >
            ×
          </button>
        </div>

        <div class="px-5 py-4 flex flex-col gap-4">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[12px]">
            <div class="flex flex-col gap-1">
              <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">
                Prioridade
              </span>
              <div class="flex items-center gap-1.5 text-text">
                <span
                  class="w-2 h-2 rounded-full"
                  [style.background]="corPrioridade(tarefa.prioridade)"
                ></span>
                {{ rotuloPrioridade(tarefa.prioridade) }}
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">
                Prazo
              </span>
              <div
                class="text-text tabular-nums"
                [class.text-danger]="tarefa.status === 3"
                [class.font-medium]="tarefa.status === 3"
              >
                {{ formatarPrazo() }}
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">
                Status
              </span>
              <div class="text-text capitalize">{{ rotuloStatus(tarefa.status) }}</div>
            </div>
          </div>

          @if (tarefa.categorias.length > 0) {
            <div class="flex flex-col gap-1.5">
              <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">
                Categorias
              </span>
              <div class="flex flex-wrap gap-1.5">
                @for (c of tarefa.categorias; track c.id) {
                  <span
                    class="text-[11px] px-2 py-0.5 bg-[#16181c] border border-border rounded-full text-text-dim whitespace-nowrap"
                    >{{ c.nome }}</span
                  >
                }
              </div>
            </div>
          }

          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <span class="text-[10px] uppercase tracking-wider text-text-subtle font-medium">
                Observações
              </span>
              @if (!editandoObs() && tarefa.status !== 2) {
                <button
                  type="button"
                  class="text-[12px] text-text-dim hover:text-text flex items-center gap-1.5"
                  data-testid="detalhe-editar-obs"
                  (click)="iniciarEdicaoObs()"
                >
                  <i class="fa-solid fa-pen text-[10px]"></i>
                  {{ tarefa.observacoes ? 'Editar' : 'Adicionar' }}
                </button>
              }
            </div>

            @if (editandoObs()) {
              <textarea
                class="input-base resize-none"
                rows="5"
                placeholder="Detalhes, links, lembretes..."
                maxlength="4000"
                data-testid="detalhe-obs-textarea"
                [(ngModel)]="rascunhoObs"
                name="observacoes-detalhe"
                autofocus
              ></textarea>
              @if (erroObs()) {
                <p class="text-danger text-xs" data-testid="detalhe-obs-erro">{{ erroObs() }}</p>
              }
              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  class="btn-secondary text-[12px] px-3 py-1.5"
                  data-testid="detalhe-obs-cancelar"
                  (click)="cancelarEdicaoObs()"
                  [disabled]="salvandoObs()"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  class="btn-primary text-[12px] px-3 py-1.5"
                  data-testid="detalhe-obs-salvar"
                  (click)="salvarObs()"
                  [disabled]="salvandoObs()"
                >
                  {{ salvandoObs() ? 'Salvando...' : 'Salvar' }}
                </button>
              </div>
            } @else if (tarefa.observacoes) {
              <div
                class="text-[13px] text-text leading-relaxed whitespace-pre-wrap break-words bg-[#16181c] border border-border rounded p-3"
                data-testid="detalhe-obs-conteudo"
              >
                @for (seg of segmentosObs(); track $index) {
                  @if (seg.tipo === 'link') {
                    <a
                      [href]="seg.conteudo"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-accent hover:text-accent-hover underline underline-offset-2 break-all"
                      >{{ seg.conteudo }}</a
                    >
                  } @else {
                    <span>{{ seg.conteudo }}</span>
                  }
                }
              </div>
            } @else {
              <p class="text-text-subtle text-[12px] italic">
                Nada anotado por aqui ainda.
              </p>
            }
          </div>
        </div>

        <div class="px-5 py-3 border-t border-border flex flex-wrap justify-between gap-2">
          <button
            type="button"
            class="text-danger text-[13px] px-3 py-2 hover:bg-danger/10 rounded transition-colors"
            data-testid="detalhe-excluir"
            (click)="onExcluir()"
          >
            Excluir
          </button>
          <div class="flex flex-wrap gap-2 justify-end">
            @if (tarefa.status !== 2) {
              <button
                type="button"
                class="btn-secondary text-[13px] px-4 py-2 flex items-center gap-1.5"
                data-testid="detalhe-editar-tudo"
                (click)="onEditarTudo()"
              >
                <i class="fa-solid fa-pen text-[10px]"></i>
                Editar tarefa
              </button>
              <button
                type="button"
                class="btn-primary text-[13px] px-4 py-2 flex items-center gap-1.5"
                data-testid="detalhe-concluir"
                (click)="onConcluir()"
              >
                <i class="fa-solid fa-check text-[10px]"></i>
                Concluir
              </button>
            } @else {
              <button
                type="button"
                class="btn-primary text-[13px] px-4 py-2 flex items-center gap-1.5"
                data-testid="detalhe-reabrir"
                (click)="onReabrir()"
              >
                <i class="fa-solid fa-rotate-left text-[10px]"></i>
                Reabrir como pendente
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TarefaDetalheModalComponent {
  private readonly tarefasApi = inject(TarefasService);

  @Input({ required: true }) tarefa!: Tarefa;
  @Output() fechado = new EventEmitter<void>();
  @Output() editarTudo = new EventEmitter<Tarefa>();
  @Output() concluir = new EventEmitter<Tarefa>();
  @Output() reabrir = new EventEmitter<Tarefa>();
  @Output() excluir = new EventEmitter<Tarefa>();
  @Output() observacoesAtualizadas = new EventEmitter<Tarefa>();

  readonly editandoObs = signal(false);
  readonly salvandoObs = signal(false);
  readonly erroObs = signal<string | null>(null);

  rascunhoObs = '';

  readonly segmentosObs = computed(() => quebrarTextoEmSegmentos(this.tarefa.observacoes));

  iniciarEdicaoObs(): void {
    this.rascunhoObs = this.tarefa.observacoes ?? '';
    this.erroObs.set(null);
    this.editandoObs.set(true);
  }

  cancelarEdicaoObs(): void {
    if (this.salvandoObs()) return;
    this.editandoObs.set(false);
    this.erroObs.set(null);
  }

  salvarObs(): void {
    if (this.salvandoObs()) return;
    const novo = this.rascunhoObs.trim();
    if (novo.length > 4000) {
      this.erroObs.set('Observações passam de 4000 caracteres.');
      return;
    }

    const payload: TarefaPayload = {
      nome: this.tarefa.nome,
      prioridade: this.tarefa.prioridade,
      dataPrazo: this.tarefa.dataPrazo,
      categoriaIds: this.tarefa.categorias.map((c) => c.id),
      horarioFinal: this.tarefa.horarioFinal,
      observacoes: novo.length > 0 ? novo : null,
    };

    this.salvandoObs.set(true);
    this.erroObs.set(null);
    this.tarefasApi.atualizar(this.tarefa.id, payload).subscribe({
      next: (atual) => {
        this.salvandoObs.set(false);
        this.editandoObs.set(false);
        this.observacoesAtualizadas.emit(atual);
      },
      error: (err: HttpErrorResponse) => {
        this.salvandoObs.set(false);
        const r = extrairProblemDetails(err, 'Não consegui salvar.');
        const primeiroErro = Object.values(r.errosCampo)[0];
        this.erroObs.set(primeiroErro ?? r.mensagemGeral ?? 'Não consegui salvar.');
      },
    });
  }

  fechar(): void {
    if (this.salvandoObs()) return;
    this.fechado.emit();
  }

  onEditarTudo(): void {
    this.editarTudo.emit(this.tarefa);
  }

  onConcluir(): void {
    this.concluir.emit(this.tarefa);
  }

  onReabrir(): void {
    this.reabrir.emit(this.tarefa);
  }

  onExcluir(): void {
    this.excluir.emit(this.tarefa);
  }

  rotuloPrioridade(p: number): string {
    return ['', 'Urgente', 'Importante', 'Normal', 'Baixa'][p] ?? 'Normal';
  }

  rotuloStatus(s: number): string {
    if (s === 2) return 'Concluída';
    if (s === 3) return 'Atrasada';
    return 'Pendente';
  }

  corPrioridade(p: number): string {
    return (
      ({
        1: '#eb5757',
        2: '#f59e0b',
        3: '#5e6ad2',
        4: '#62666d',
      } as Record<number, string>)[p] ?? '#5e6ad2'
    );
  }

  formatarPrazo(): string {
    const t = this.tarefa;
    const alvo = new Date(t.dataPrazo);
    alvo.setHours(0, 0, 0, 0);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const diasDiff = Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
    const horaSufixo = t.horarioFinal ? `, ${t.horarioFinal.substring(0, 5)}` : '';

    if (diasDiff === 0) return `Hoje${horaSufixo}`;
    if (diasDiff === 1) return `Amanhã${horaSufixo}`;
    if (diasDiff === -1) return `Ontem${horaSufixo}`;

    const data = `${pad(alvo.getDate())}/${pad(alvo.getMonth() + 1)}/${alvo.getFullYear()}`;
    return `${data}${horaSufixo}`;
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
