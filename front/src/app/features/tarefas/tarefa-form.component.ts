import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CategoriasService, Categoria } from '../../core/api/categorias.service';
import { Prazo, PrazosService } from '../../core/api/prazos.service';
import {
  CriarTarefaPayload,
  Prioridade,
  Tarefa,
  TarefasService,
} from '../../core/api/tarefas.service';

@Component({
  selector: 'app-tarefa-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 grid place-items-center px-4 py-8"
      data-testid="tarefa-form-overlay"
      (click)="fechar()"
    >
      <div
        class="card-elev w-full max-w-[520px] max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div class="text-sm font-semibold">
            {{ tarefa ? 'Editar tarefa' : 'Nova tarefa' }}
          </div>
          <button
            type="button"
            class="text-text-subtle hover:text-text text-base p-1 leading-none"
            data-testid="tarefa-form-close"
            (click)="fechar()"
          >
            ×
          </button>
        </div>

        <form class="p-5 flex flex-col gap-4" (ngSubmit)="enviar()" #f="ngForm">
          <div class="flex flex-col gap-1.5">
            <label class="field-label" for="nome">Nome</label>
            <input
              id="nome"
              name="nome"
              type="text"
              class="input-base"
              placeholder="O que precisa ser feito"
              data-testid="tarefa-form-nome"
              maxlength="200"
              [(ngModel)]="nome"
              required
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="field-label">Categorias</label>
            <div class="flex flex-wrap gap-1.5" data-testid="tarefa-form-categorias">
              @for (cat of categorias(); track cat.id) {
                <button
                  type="button"
                  class="px-2.5 py-1 rounded text-[13px] border transition-colors"
                  [class]="
                    categoriaIds().includes(cat.id)
                      ? 'bg-accent/15 border-accent/40 text-text'
                      : 'bg-[#16181c] border-border-strong text-text-dim hover:text-text'
                  "
                  [attr.data-testid]="'tarefa-form-cat-' + cat.id"
                  (click)="toggleCategoria(cat.id)"
                >
                  {{ cat.nome }}
                </button>
              } @empty {
                <span class="text-xs text-text-subtle"
                  >Nenhuma categoria cadastrada. Crie em Configurações.</span
                >
              }
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="field-label" for="prioridade">Prioridade</label>
              <select
                id="prioridade"
                name="prioridade"
                class="input-base"
                data-testid="tarefa-form-prioridade"
                [(ngModel)]="prioridade"
              >
                <option [ngValue]="1">Urgente</option>
                <option [ngValue]="2">Importante</option>
                <option [ngValue]="3">Normal</option>
                <option [ngValue]="4">Baixa</option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="field-label" for="prazo">Prazo</label>
              <select
                id="prazo"
                name="prazo"
                class="input-base"
                data-testid="tarefa-form-prazo"
                [(ngModel)]="prazoEscolha"
                (ngModelChange)="onPrazoChange($event)"
              >
                <option [ngValue]="null">Sem prazo</option>
                @for (p of prazos(); track p.id) {
                  <option [ngValue]="p.id">{{ p.nome }}</option>
                }
                <option ngValue="custom">Data específica…</option>
              </select>
            </div>
          </div>

          @if (prazoEscolha === 'custom') {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="field-label" for="dataCustom">Data</label>
                <input
                  id="dataCustom"
                  name="dataCustom"
                  type="date"
                  class="input-base"
                  data-testid="tarefa-form-data-custom"
                  [(ngModel)]="dataCustom"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="field-label" for="horario">Horário final</label>
                <input
                  id="horario"
                  name="horario"
                  type="time"
                  class="input-base"
                  data-testid="tarefa-form-horario"
                  [(ngModel)]="horario"
                />
              </div>
            </div>
          }

          @if (erro()) {
            <p class="text-danger text-xs" data-testid="tarefa-form-erro">{{ erro() }}</p>
          }

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="btn-secondary"
              data-testid="tarefa-form-cancelar"
              (click)="fechar()"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-primary"
              data-testid="tarefa-form-salvar"
              [disabled]="salvando() || f.invalid"
            >
              {{ salvando() ? 'Salvando...' : tarefa ? 'Salvar' : 'Criar tarefa' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class TarefaFormComponent implements OnInit {
  private readonly categoriasApi = inject(CategoriasService);
  private readonly prazosApi = inject(PrazosService);
  private readonly tarefasApi = inject(TarefasService);

  @Input() tarefa: Tarefa | null = null;
  @Input() nomeInicial = '';
  @Output() salvo = new EventEmitter<Tarefa>();
  @Output() cancelado = new EventEmitter<void>();

  readonly categorias = signal<Categoria[]>([]);
  readonly prazos = signal<Prazo[]>([]);
  readonly categoriaIds = signal<string[]>([]);
  readonly salvando = signal(false);
  readonly erro = signal<string | null>(null);

  nome = '';
  prioridade: Prioridade = 3;
  prazoEscolha: string | null = null;
  dataCustom = '';
  horario = '23:59';

  ngOnInit(): void {
    forkJoin({
      cats: this.categoriasApi.listar(),
      prz: this.prazosApi.listar(),
    }).subscribe(({ cats, prz }) => {
      this.categorias.set(cats);
      this.prazos.set(prz);
    });

    if (this.tarefa) {
      this.nome = this.tarefa.nome;
      this.prioridade = this.tarefa.prioridade;
      this.categoriaIds.set(this.tarefa.categorias.map((c) => c.id));
      if (this.tarefa.prazoId) {
        this.prazoEscolha = this.tarefa.prazoId;
      } else if (this.tarefa.dataPrazo) {
        this.prazoEscolha = 'custom';
        this.dataCustom = this.tarefa.dataPrazo.substring(0, 10);
      }
      if (this.tarefa.horarioFinal) {
        this.horario = this.tarefa.horarioFinal.substring(0, 5);
      }
    } else {
      this.nome = this.nomeInicial;
    }
  }

  toggleCategoria(id: string): void {
    this.categoriaIds.update((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );
  }

  onPrazoChange(_: string | null): void {
    if (this.prazoEscolha !== 'custom') {
      this.dataCustom = '';
    }
  }

  fechar(): void {
    if (this.salvando()) return;
    this.cancelado.emit();
  }

  enviar(): void {
    if (this.salvando()) return;

    const payload: CriarTarefaPayload = {
      nome: this.nome,
      prioridade: this.prioridade,
      categoriaIds: this.categoriaIds(),
      prazoId: null,
      dataPrazoCustom: null,
      horarioFinal: null,
    };

    if (this.prazoEscolha === 'custom') {
      if (!this.dataCustom) {
        this.erro.set('Informa a data ou escolhe outro prazo.');
        return;
      }
      payload.dataPrazoCustom = new Date(this.dataCustom + 'T00:00:00').toISOString();
      if (this.horario) {
        const [h, m] = this.horario.split(':');
        payload.horarioFinal = `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`;
      }
    } else if (this.prazoEscolha) {
      payload.prazoId = this.prazoEscolha;
    }

    this.salvando.set(true);
    this.erro.set(null);

    const req$ = this.tarefa
      ? this.tarefasApi.atualizar(this.tarefa.id, payload)
      : this.tarefasApi.criar(payload);

    req$.subscribe({
      next: (t) => {
        this.salvando.set(false);
        this.salvo.emit(t);
      },
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.mensagem ?? 'Não consegui salvar. Tenta de novo.');
      },
    });
  }
}
