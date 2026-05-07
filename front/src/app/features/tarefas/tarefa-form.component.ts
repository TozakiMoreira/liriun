import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriasService, Categoria } from '../../core/api/categorias.service';
import { DatePickerComponent } from '../../shared/date-picker.component';
import { TimePickerComponent } from '../../shared/time-picker.component';
import {
  Prioridade,
  Tarefa,
  TarefaPayload,
  TarefasService,
  TipoRecorrencia,
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
  imports: [CommonModule, FormsModule, DatePickerComponent, TimePickerComponent],
  template: `
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 grid place-items-center px-4 py-8 animate-fade-in"
      data-testid="tarefa-form-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tarefa-form-title"
    >
      <div
        class="card-elev w-full max-w-[560px] max-h-[92vh] overflow-y-auto animate-scale-in"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center gap-3 border-b border-border px-5 py-4 sticky top-0 bg-bg-elev z-10">
          <div class="w-9 h-9 rounded-lg bg-accent/15 grid place-items-center shrink-0">
            <i class="fa-solid" [class]="tarefa ? 'fa-pen text-accent text-[14px]' : 'fa-plus text-accent text-[16px]'"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div id="tarefa-form-title" class="text-[15px] font-semibold leading-tight">
              {{ tarefa ? 'Editar tarefa' : 'Nova tarefa' }}
            </div>
            <div class="text-[11px] text-text-subtle">
              {{ tarefa ? 'Ajuste os campos abaixo.' : 'Preencha o que importa. Campos opcionais ficam pra depois.' }}
            </div>
          </div>
          <button
            type="button"
            class="w-8 h-8 grid place-items-center text-text-subtle hover:text-text hover:bg-bg-input rounded transition-colors"
            data-testid="tarefa-form-close"
            aria-label="Fechar"
            (click)="fechar()"
          >
            <i class="fa-solid fa-xmark text-[14px]"></i>
          </button>
        </div>

        <form class="p-5 flex flex-col gap-5" (ngSubmit)="enviar()" novalidate>
          <!-- Nome (input grande hero) -->
          <div class="flex flex-col gap-1.5">
            <input
              id="nome"
              name="nome"
              type="text"
              class="input-base !text-[16px] !py-3 !font-medium"
              placeholder="O que precisa ser feito"
              data-testid="tarefa-form-nome"
              maxlength="200"
              [(ngModel)]="nome"
            />
            @if (erroNome()) {
              <p class="text-danger text-xs" data-testid="tarefa-form-erro-nome">{{ erroNome() }}</p>
            }
          </div>

          <!-- Bloco: Prioridade + Categorias -->
          <section class="flex flex-col gap-3 bg-bg-surface/30 border border-border rounded-lg p-3.5">
            <div class="flex flex-col gap-2">
              <span class="text-[10px] uppercase tracking-wider text-text-subtle font-semibold flex items-center gap-1.5">
                <i class="fa-solid fa-flag text-[9px]"></i>
                Prioridade
              </span>
              <div
                class="flex flex-wrap gap-1.5"
                data-testid="tarefa-form-prioridade"
                role="radiogroup"
                aria-label="Prioridade"
              >
                @for (p of opcoesPrioridade; track p.valor) {
                  <button
                    type="button"
                    role="radio"
                    [attr.aria-checked]="prioridade === p.valor"
                    [attr.data-testid]="'tarefa-form-prioridade-' + p.valor"
                    class="prioridade-chip"
                    [class.prioridade-chip-active]="prioridade === p.valor"
                    [style.--chip-color]="p.cor"
                    (click)="prioridade = p.valor"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      [style.background-color]="p.cor"
                      aria-hidden="true"
                    ></span>
                    {{ p.rotulo }}
                  </button>
                }
              </div>
            </div>

            <div class="flex flex-col gap-2 pt-3 border-t border-border/60">
              <span class="text-[10px] uppercase tracking-wider text-text-subtle font-semibold flex items-center gap-1.5">
                <i class="fa-solid fa-tag text-[9px]"></i>
                Categorias
              </span>
              @if (carregandoCategorias()) {
                <span class="text-xs text-text-subtle" data-testid="tarefa-form-cat-loading">
                  Carregando categorias...
                </span>
              } @else if (erroCarregarCategorias()) {
                <div class="flex items-center justify-between gap-2 text-xs text-danger" data-testid="tarefa-form-cat-erro">
                  <span>Não consegui carregar suas categorias.</span>
                  <button
                    type="button"
                    class="text-text-dim hover:text-text underline underline-offset-2"
                    (click)="carregarCategorias()"
                  >Tentar de novo</button>
                </div>
              } @else {
                <div class="flex flex-wrap gap-1.5" data-testid="tarefa-form-categorias">
                  @for (cat of categorias(); track cat.id) {
                    <button
                      type="button"
                      class="px-2.5 py-1 rounded-full text-[12px] border transition-colors"
                      [class]="
                        categoriaIds().includes(cat.id)
                          ? 'bg-accent/20 border-accent text-text'
                          : 'bg-bg-elev border-border-strong text-text-dim hover:text-text hover:border-border-strong'
                      "
                      [attr.data-testid]="'tarefa-form-cat-' + cat.id"
                      (click)="toggleCategoria(cat.id)"
                    >{{ cat.nome }}</button>
                  } @empty {
                    <span class="text-xs text-text-subtle italic">Nenhuma categoria cadastrada. Crie em Configurações.</span>
                  }
                </div>
              }
            </div>
          </section>

          <!-- Bloco: Quando -->
          <section class="flex flex-col gap-2 bg-bg-surface/30 border border-border rounded-lg p-3.5">
            <span class="text-[10px] uppercase tracking-wider text-text-subtle font-semibold flex items-center gap-1.5">
              <i class="fa-regular fa-calendar text-[9px]"></i>
              Quando
            </span>
            <div class="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-2.5">
              <div class="flex flex-col gap-1">
                <span class="text-[10px] text-text-subtle">Data</span>
                <app-date-picker
                  [valor]="data || null"
                  [min]="dataMinima"
                  placeholder="Selecionar data"
                  ariaLabel="Data da tarefa"
                  (valorChange)="data = $event ?? ''"
                  data-testid="tarefa-form-data-picker"
                />
                @if (erroData()) {
                  <p class="text-danger text-xs" data-testid="tarefa-form-erro-data">{{ erroData() }}</p>
                }
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-[10px] text-text-subtle">Hora <span class="opacity-70">(opcional)</span></span>
                <app-time-picker
                  [valor]="hora || null"
                  [disabled]="!data"
                  placeholder="--:--"
                  ariaLabel="Horário da tarefa"
                  (valorChange)="hora = $event ?? ''"
                  data-testid="tarefa-form-hora-picker"
                />
              </div>
            </div>
          </section>

          <!-- Bloco: Recorrência -->
          <section class="flex flex-col gap-2 bg-bg-surface/30 border border-border rounded-lg p-3.5">
            <span class="text-[10px] uppercase tracking-wider text-text-subtle font-semibold flex items-center gap-1.5">
              <i class="fa-solid fa-repeat text-[9px]"></i>
              Recorrência
            </span>
            <div class="flex flex-wrap gap-1.5" data-testid="tarefa-form-recorrencia" role="radiogroup" aria-label="Recorrência">
              @for (r of opcoesRecorrencia; track r.valor) {
                <button
                  type="button"
                  role="radio"
                  [attr.aria-checked]="recorrencia === r.valor"
                  [attr.data-testid]="'tarefa-form-recorrencia-' + r.valor"
                  class="px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors flex items-center gap-1.5"
                  [class]="
                    recorrencia === r.valor
                      ? 'bg-accent/20 border-accent text-text'
                      : 'bg-bg-elev border-border-strong text-text-dim hover:text-text'
                  "
                  (click)="recorrencia = r.valor"
                >
                  @if (r.valor !== 0) {
                    <i class="fa-solid fa-repeat text-[9px]" aria-hidden="true"></i>
                  }
                  {{ r.rotulo }}
                </button>
              }
            </div>

            @if (recorrencia !== 0) {
              <div class="flex flex-col gap-2 mt-1 pt-3 border-t border-border/60">
                <span class="text-[11px] text-text-dim">
                  Por quantas {{ recorrencia === 1 ? 'semanas' : 'meses' }}?
                </span>
                <div class="flex gap-1.5" role="radiogroup">
                  @for (q of [1, 2, 3, 4]; track q) {
                    <button
                      type="button"
                      role="radio"
                      [attr.aria-checked]="recorrenciaQuantidade === q"
                      [attr.data-testid]="'tarefa-form-recorrencia-qtd-' + q"
                      class="flex-1 px-3 py-2 rounded-md text-[13px] font-semibold border transition-colors"
                      [class]="
                        recorrenciaQuantidade === q
                          ? 'bg-accent text-white border-accent'
                          : 'bg-bg-elev border-border-strong text-text-dim hover:text-text'
                      "
                      (click)="recorrenciaQuantidade = q"
                    >{{ q }}x</button>
                  }
                </div>
                <span class="text-[11px] text-text-subtle italic">
                  Crio {{ recorrenciaQuantidade }} {{ recorrenciaQuantidade === 1 ? 'tarefa' : 'tarefas' }} repetindo a cada {{ recorrencia === 1 ? 'semana' : 'mês' }}.
                </span>
              </div>
            }
          </section>

          <!-- Bloco: Detalhes -->
          <section class="flex flex-col gap-2 bg-bg-surface/30 border border-border rounded-lg p-3.5">
            <div class="flex items-center justify-between">
              <span class="text-[10px] uppercase tracking-wider text-text-subtle font-semibold flex items-center gap-1.5">
                <i class="fa-solid fa-align-left text-[9px]"></i>
                Detalhes
                <span class="text-text-subtle/70 normal-case font-normal">(opcional)</span>
              </span>
              <span
                class="text-[10px] tabular-nums"
                [class.text-text-subtle]="observacoes.length < OBS_LIMITE * 0.85"
                [class.text-text-dim]="observacoes.length >= OBS_LIMITE * 0.85 && observacoes.length < OBS_LIMITE"
                [class.text-danger]="observacoes.length >= OBS_LIMITE"
                data-testid="tarefa-form-obs-counter"
              >{{ observacoes.length }} / {{ OBS_LIMITE }}</span>
            </div>
            <textarea
              id="observacoes"
              name="observacoes"
              rows="3"
              class="input-base resize-none !text-[13px]"
              placeholder="Detalhes, links, lembretes — o que precisar"
              [attr.maxlength]="OBS_LIMITE"
              data-testid="tarefa-form-observacoes"
              [(ngModel)]="observacoes"
            ></textarea>
            @if (erroObservacoes()) {
              <p class="text-danger text-xs" data-testid="tarefa-form-erro-observacoes">{{ erroObservacoes() }}</p>
            }
          </section>

          @if (erroGeral()) {
            <p class="text-danger text-xs" data-testid="tarefa-form-erro">{{ erroGeral() }}</p>
          }

          <!-- Footer sticky -->
          <div class="flex justify-end gap-2 pt-2 border-t border-border -mx-5 px-5 pb-1 sticky bottom-0 bg-bg-elev">
            <button
              type="button"
              class="btn-secondary"
              data-testid="tarefa-form-cancelar"
              (click)="fechar()"
              [disabled]="salvando()"
            >Cancelar</button>
            <button
              type="submit"
              class="btn-primary flex items-center gap-1.5"
              data-testid="tarefa-form-salvar"
              [disabled]="salvando()"
            >
              @if (salvando()) {
                <i class="fa-solid fa-circle-notch fa-spin text-[10px]"></i>
                Salvando...
              } @else {
                <i class="fa-solid fa-check text-[10px]"></i>
                {{ tarefa ? 'Salvar' : 'Criar tarefa' }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .prioridade-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid rgb(var(--c-border-strong));
        background: rgb(var(--c-surface));
        color: rgb(var(--c-text-dim));
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 160ms, border-color 160ms, color 160ms, transform 120ms;
      }
      .prioridade-chip:hover {
        color: rgb(var(--c-text));
        border-color: rgb(var(--c-border-strong));
      }
      .prioridade-chip-active {
        background: color-mix(in srgb, var(--chip-color) 14%, rgb(var(--c-surface)));
        border-color: color-mix(in srgb, var(--chip-color) 50%, transparent);
        color: rgb(var(--c-text));
      }
      .prioridade-chip-active:hover {
        border-color: color-mix(in srgb, var(--chip-color) 70%, transparent);
      }
    `,
  ],
})
export class TarefaFormComponent implements OnInit {
  static readonly OBS_LIMITE_VAL = 4000;
  readonly OBS_LIMITE = TarefaFormComponent.OBS_LIMITE_VAL;
  readonly opcoesPrioridade: { valor: Prioridade; rotulo: string; cor: string }[] = [
    { valor: 1, rotulo: 'Urgente', cor: '#ef4444' },
    { valor: 2, rotulo: 'Importante', cor: '#f59e0b' },
    { valor: 3, rotulo: 'Normal', cor: '#5e6ad2' },
    { valor: 4, rotulo: 'Baixa', cor: '#6b7280' },
  ];
  readonly opcoesRecorrencia: { valor: TipoRecorrencia; rotulo: string }[] = [
    { valor: 0, rotulo: 'Sem repetir' },
    { valor: 1, rotulo: 'Toda semana' },
    { valor: 2, rotulo: 'Todo mês' },
  ];

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
  recorrencia: TipoRecorrencia = 0;
  recorrenciaQuantidade = 4;

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
      this.recorrencia = this.tarefa.recorrencia ?? 0;
      this.recorrenciaQuantidade = this.tarefa.recorrenciaQuantidade ?? 1;
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

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.fechar();
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
    if (this.observacoes.length > TarefaFormComponent.OBS_LIMITE_VAL) {
      erros['observacoes'] = `Observações passam de ${TarefaFormComponent.OBS_LIMITE_VAL} caracteres.`;
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
      recorrencia: this.recorrencia,
      recorrenciaQuantidade: this.recorrencia === 0 ? 1 : this.recorrenciaQuantidade,
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
