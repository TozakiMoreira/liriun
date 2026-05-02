import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriasService, Categoria } from '../../core/api/categorias.service';
import {
  Prioridade,
  Tarefa,
  TarefaPayload,
  TarefasService,
} from '../../core/api/tarefas.service';
import { extrairProblemDetails } from '../../shared/problem-details';

export interface SugestaoTarefa {
  titulo: string;
  categoriaIds: string[];
  dataPrazo: string | null;
  horarioFinal: string | null;
  prioridade: Prioridade | null;
  observacoes: string | null;
}

@Component({
  selector: 'app-tarefa-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 grid place-items-center px-4 py-8 animate-fade-in"
      data-testid="tarefa-form-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tarefa-form-title"
    >
      <div
        class="card-elev w-full max-w-[520px] max-h-[90vh] overflow-y-auto animate-scale-in"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div id="tarefa-form-title" class="text-sm font-semibold">
            {{ tarefa ? 'Editar tarefa' : 'Nova tarefa' }}
          </div>
          <button
            type="button"
            class="text-text-subtle hover:text-text text-base p-1 leading-none"
            data-testid="tarefa-form-close"
            aria-label="Fechar"
            (click)="fechar()"
          >
            ×
          </button>
        </div>

        <form class="p-5 flex flex-col gap-4" (ngSubmit)="enviar()" novalidate>
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
            />
            @if (erroNome()) {
              <p class="text-danger text-xs" data-testid="tarefa-form-erro-nome">{{ erroNome() }}</p>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="field-label">Categorias</label>
            @if (carregandoCategorias()) {
              <span class="text-xs text-text-subtle" data-testid="tarefa-form-cat-loading">
                Carregando categorias...
              </span>
            } @else if (erroCarregarCategorias()) {
              <div
                class="flex items-center justify-between gap-2 text-xs text-danger"
                data-testid="tarefa-form-cat-erro"
              >
                <span>Não consegui carregar suas categorias.</span>
                <button
                  type="button"
                  class="text-text-dim hover:text-text underline underline-offset-2"
                  (click)="carregarCategorias()"
                >
                  Tentar de novo
                </button>
              </div>
            } @else {
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
            }
          </div>

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

          <div class="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="field-label" for="data">Data</label>
              <input
                id="data"
                name="data"
                type="date"
                class="input-base"
                data-testid="tarefa-form-data"
                [min]="dataMinima"
                [(ngModel)]="data"
              />
              @if (erroData()) {
                <p class="text-danger text-xs" data-testid="tarefa-form-erro-data">{{ erroData() }}</p>
              }
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="field-label" for="hora">Hora (opcional)</label>
              <input
                id="hora"
                name="hora"
                type="time"
                class="input-base"
                data-testid="tarefa-form-hora"
                [(ngModel)]="hora"
                [disabled]="!data"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="field-label" for="observacoes">Observações (opcional)</label>
            <textarea
              id="observacoes"
              name="observacoes"
              rows="3"
              class="input-base resize-none"
              placeholder="Detalhes, links, lembretes — o que precisar"
              maxlength="4000"
              data-testid="tarefa-form-observacoes"
              [(ngModel)]="observacoes"
            ></textarea>
            @if (erroObservacoes()) {
              <p class="text-danger text-xs" data-testid="tarefa-form-erro-observacoes">
                {{ erroObservacoes() }}
              </p>
            }
          </div>

          @if (erroGeral()) {
            <p class="text-danger text-xs" data-testid="tarefa-form-erro">{{ erroGeral() }}</p>
          }

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="btn-secondary"
              data-testid="tarefa-form-cancelar"
              (click)="fechar()"
              [disabled]="salvando()"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-primary"
              data-testid="tarefa-form-salvar"
              [disabled]="salvando()"
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
  private readonly tarefasApi = inject(TarefasService);

  @Input() tarefa: Tarefa | null = null;
  @Input() nomeInicial = '';
  @Input() sugestao: SugestaoTarefa | null = null;
  @Output() salvo = new EventEmitter<Tarefa>();
  @Output() cancelado = new EventEmitter<void>();

  readonly categorias = signal<Categoria[]>([]);
  readonly categoriaIds = signal<string[]>([]);
  readonly carregandoCategorias = signal(true);
  readonly erroCarregarCategorias = signal(false);
  readonly salvando = signal(false);
  readonly erroGeral = signal<string | null>(null);
  readonly errosCampo = signal<Record<string, string>>({});

  readonly erroNome = computed(() => this.errosCampo()['nome'] ?? null);
  readonly erroData = computed(() => this.errosCampo()['dataprazo'] ?? this.errosCampo()['data'] ?? null);
  readonly erroObservacoes = computed(() => this.errosCampo()['observacoes'] ?? null);

  readonly dataMinima = this.hojeIso();

  nome = '';
  prioridade: Prioridade = 3;
  data = '';
  hora = '';
  observacoes = '';

  ngOnInit(): void {
    this.carregarCategorias();

    if (this.tarefa) {
      this.nome = this.tarefa.nome;
      this.prioridade = this.tarefa.prioridade;
      this.categoriaIds.set(this.tarefa.categorias.map((c) => c.id));
      if (this.tarefa.dataPrazo) {
        this.data = this.tarefa.dataPrazo.substring(0, 10);
      }
      if (this.tarefa.horarioFinal) {
        this.hora = this.tarefa.horarioFinal.substring(0, 5);
      }
      this.observacoes = this.tarefa.observacoes ?? '';
    } else if (this.sugestao) {
      this.nome = this.sugestao.titulo;
      this.categoriaIds.set([...this.sugestao.categoriaIds]);
      if (this.sugestao.dataPrazo) {
        this.data = this.sugestao.dataPrazo.substring(0, 10);
      }
      if (this.sugestao.horarioFinal) {
        this.hora = this.sugestao.horarioFinal.substring(0, 5);
      }
      if (this.sugestao.prioridade) {
        this.prioridade = this.sugestao.prioridade;
      }
      if (this.sugestao.observacoes) {
        this.observacoes = this.sugestao.observacoes;
      }
    } else {
      this.nome = this.nomeInicial;
    }
  }

  private hojeIso(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  carregarCategorias(): void {
    this.carregandoCategorias.set(true);
    this.erroCarregarCategorias.set(false);
    this.categoriasApi.listar().subscribe({
      next: (cats) => {
        this.categorias.set(cats);
        this.carregandoCategorias.set(false);
      },
      error: () => {
        this.carregandoCategorias.set(false);
        this.erroCarregarCategorias.set(true);
      },
    });
  }

  toggleCategoria(id: string): void {
    this.categoriaIds.update((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );
  }

  fechar(): void {
    if (this.salvando()) return;
    this.cancelado.emit();
  }

  enviar(): void {
    if (this.salvando()) return;
    this.erroGeral.set(null);

    const erros: Record<string, string> = {};
    if (!this.nome.trim()) {
      erros['nome'] = 'Dá um nome pra tarefa.';
    }
    if (!this.data) {
      erros['dataprazo'] = 'Escolhe uma data pra essa tarefa.';
    } else if (this.data < this.dataMinima) {
      erros['dataprazo'] = 'A data não pode ser anterior a hoje.';
    }
    if (this.observacoes.length > 4000) {
      erros['observacoes'] = 'Observações passam de 4000 caracteres.';
    }
    if (Object.keys(erros).length > 0) {
      this.errosCampo.set(erros);
      return;
    }
    this.errosCampo.set({});

    const payload: TarefaPayload = {
      nome: this.nome.trim(),
      prioridade: this.prioridade,
      categoriaIds: this.categoriaIds(),
      dataPrazo: new Date(this.data + 'T00:00:00').toISOString(),
      horarioFinal: this.hora ? this.formatarHoraParaApi(this.hora) : null,
      observacoes: this.observacoes.trim() ? this.observacoes.trim() : null,
    };

    this.salvando.set(true);

    const req$ = this.tarefa
      ? this.tarefasApi.atualizar(this.tarefa.id, payload)
      : this.tarefasApi.criar(payload);

    req$.subscribe({
      next: (t) => {
        this.salvando.set(false);
        this.salvo.emit(t);
      },
      error: (err: HttpErrorResponse) => {
        this.salvando.set(false);
        const r = extrairProblemDetails(err, 'Não consegui salvar. Tenta de novo.');
        if (Object.keys(r.errosCampo).length > 0) {
          this.errosCampo.set(r.errosCampo);
        } else {
          this.erroGeral.set(r.mensagemGeral ?? 'Não consegui salvar. Tenta de novo.');
        }
      },
    });
  }

  private formatarHoraParaApi(hora: string): string {
    const [h, m] = hora.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`;
  }
}
