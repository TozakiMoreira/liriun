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
import { DatePickerComponent } from '../../shared/date-picker.component';
import { extrairProblemDetails } from '../../shared/problem-details';
import {
  CATEGORIAS_DESPESA,
  CATEGORIAS_RECEITA,
  CategoriaLancamento,
  FinancasService,
  ICONES_CATEGORIA,
  Lancamento,
  LancamentoPayload,
  ROTULOS_CATEGORIA,
  TipoLancamento,
  TipoRecorrenciaLanc,
} from '../../core/api/financas.service';

@Component({
  selector: 'app-lancamento-form',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerComponent],
  template: `
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 grid place-items-center px-4 py-8 animate-fade-in"
      data-testid="lancamento-form-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lancamento-form-title"
      (click)="fechar()"
    >
      <div
        class="card-elev w-full max-w-[520px] max-h-[90vh] overflow-y-auto animate-scale-in"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div id="lancamento-form-title" class="text-sm font-semibold flex items-center gap-2">
            <i [class]="'fa-solid ' + (tipo() === 1 ? 'fa-arrow-up text-emerald-500' : 'fa-arrow-down text-rose-500') + ' text-[12px]'"></i>
            {{ lancamento ? 'Editar' : 'Novo' }} {{ tipo() === 1 ? 'recebimento' : 'pagamento' }}
          </div>
          <button
            type="button"
            class="text-text-subtle hover:text-text text-base p-1 leading-none"
            data-testid="lancamento-form-close"
            aria-label="Fechar"
            (click)="fechar()"
          >×</button>
        </div>

        <form class="p-5 flex flex-col gap-4" (ngSubmit)="enviar()" novalidate>
          @if (!lancamento) {
            <div class="flex bg-bg-input border border-border rounded p-0.5" role="tablist" aria-label="Tipo">
              <button
                type="button"
                role="tab"
                [attr.aria-selected]="tipo() === 1"
                class="flex-1 px-3 py-1.5 rounded text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                [class]="tipo() === 1 ? 'bg-emerald-500/15 text-emerald-400' : 'text-text-dim hover:text-text'"
                (click)="trocarTipo(1)"
              >
                <i class="fa-solid fa-arrow-up text-[10px]"></i>
                Recebimento
              </button>
              <button
                type="button"
                role="tab"
                [attr.aria-selected]="tipo() === 2"
                class="flex-1 px-3 py-1.5 rounded text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                [class]="tipo() === 2 ? 'bg-rose-500/15 text-rose-400' : 'text-text-dim hover:text-text'"
                (click)="trocarTipo(2)"
              >
                <i class="fa-solid fa-arrow-down text-[10px]"></i>
                Pagamento
              </button>
            </div>
          }

          <div class="flex flex-col gap-1.5">
            <label class="field-label" for="lanc-descricao">Descrição</label>
            <input
              id="lanc-descricao"
              name="descricao"
              type="text"
              class="input-base"
              [placeholder]="tipo() === 1 ? 'Ex: Salário de novembro' : 'Ex: Aluguel'"
              data-testid="lancamento-form-descricao"
              maxlength="200"
              [(ngModel)]="descricao"
            />
            @if (erroCampo('descricao'); as e) {
              <p class="text-danger text-xs">{{ e }}</p>
            }
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="field-label" for="lanc-valor">Valor (R$)</label>
              <input
                id="lanc-valor"
                name="valor"
                type="number"
                step="0.01"
                min="0"
                class="input-base tabular-nums"
                placeholder="0,00"
                data-testid="lancamento-form-valor"
                [(ngModel)]="valor"
              />
              @if (erroCampo('valor'); as e) {
                <p class="text-danger text-xs">{{ e }}</p>
              }
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="field-label">{{ tipo() === 1 ? 'Recebido em' : 'Vence em' }}</label>
              <app-date-picker
                [valor]="data || null"
                placeholder="Selecionar data"
                ariaLabel="Data"
                (valorChange)="data = $event ?? ''"
              />
              @if (erroCampo('datareferencia'); as e) {
                <p class="text-danger text-xs">{{ e }}</p>
              }
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="field-label">Categoria</label>
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              @for (c of categoriasDoTipo(); track c) {
                <button
                  type="button"
                  class="px-2 py-2 rounded text-[11px] border flex flex-col items-center gap-1 transition-colors"
                  [class]="
                    categoria === c
                      ? 'bg-accent/15 border-accent/40 text-text'
                      : 'bg-bg-surface border-border-strong text-text-dim hover:text-text'
                  "
                  (click)="categoria = c"
                >
                  <i [class]="'fa-solid ' + iconeCategoria(c) + ' text-[14px]'"></i>
                  <span class="leading-tight text-center">{{ rotuloCategoria(c) }}</span>
                </button>
              }
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="field-label">Recorrência</label>
            <div class="flex flex-wrap gap-1.5" role="radiogroup">
              @for (r of opcoesRecorrencia; track r.valor) {
                <button
                  type="button"
                  role="radio"
                  [attr.aria-checked]="recorrencia === r.valor"
                  class="px-2.5 py-1 rounded text-[12px] border transition-colors flex items-center gap-1.5"
                  [class]="
                    recorrencia === r.valor
                      ? 'bg-accent/15 border-accent/40 text-text'
                      : 'bg-bg-surface border-border-strong text-text-dim hover:text-text'
                  "
                  (click)="recorrencia = r.valor"
                >
                  @if (r.valor !== 0) {
                    <i class="fa-solid fa-repeat text-[10px]"></i>
                  }
                  {{ r.rotulo }}
                </button>
              }
            </div>
          </div>

          @if (tipo() === 2) {
            <div class="flex flex-col gap-1.5">
              <label class="field-label">Boleto / Comprovante (opcional)</label>
              @if (anexoPreview()) {
                <div class="flex items-center gap-2 bg-bg-surface border border-border rounded px-3 py-2">
                  <i class="fa-solid fa-paperclip text-accent text-[12px]"></i>
                  <span class="text-[12px] text-text flex-1 truncate">{{ anexoNome() }}</span>
                  <button
                    type="button"
                    class="text-text-subtle hover:text-danger text-[11px]"
                    (click)="removerAnexo()"
                  >Remover</button>
                </div>
              } @else {
                <label
                  class="border border-dashed border-border-strong rounded px-3 py-3 text-center text-[12px] text-text-dim cursor-pointer hover:bg-bg-surface transition-colors flex items-center justify-center gap-2"
                >
                  <i class="fa-solid fa-cloud-arrow-up text-[14px]"></i>
                  <span>Anexar PDF ou imagem (até 1MB)</span>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    class="hidden"
                    (change)="onAnexoSelecionado($event)"
                  />
                </label>
              }
              @if (erroAnexo()) {
                <p class="text-danger text-xs">{{ erroAnexo() }}</p>
              }
            </div>
          }

          <div class="flex flex-col gap-1.5">
            <label class="field-label" for="lanc-obs">Observações (opcional)</label>
            <textarea
              id="lanc-obs"
              name="observacoes"
              rows="2"
              class="input-base resize-none"
              placeholder="Detalhes extras"
              maxlength="2000"
              [(ngModel)]="observacoes"
            ></textarea>
          </div>

          @if (erroGeral()) {
            <p class="text-danger text-xs">{{ erroGeral() }}</p>
          }

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="btn-secondary"
              (click)="fechar()"
              [disabled]="salvando()"
            >Cancelar</button>
            <button
              type="submit"
              class="btn-primary"
              data-testid="lancamento-form-salvar"
              [disabled]="salvando()"
            >
              {{ salvando() ? 'Salvando...' : (lancamento ? 'Salvar' : 'Lançar') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LancamentoFormComponent implements OnInit {
  private readonly api = inject(FinancasService);

  @Input() lancamento: Lancamento | null = null;
  @Input() tipoInicial: TipoLancamento = 2;
  @Output() salvo = new EventEmitter<Lancamento>();
  @Output() cancelado = new EventEmitter<void>();

  readonly opcoesRecorrencia: { valor: TipoRecorrenciaLanc; rotulo: string }[] = [
    { valor: 0, rotulo: 'Sem repetir' },
    { valor: 2, rotulo: 'Todo mês' },
  ];

  readonly tipo = signal<TipoLancamento>(2);
  descricao = '';
  valor: number | null = null;
  data = '';
  categoria: CategoriaLancamento = 100;
  recorrencia: TipoRecorrenciaLanc = 0;
  observacoes = '';

  readonly anexoPreview = signal<string | null>(null);
  readonly anexoNome = signal('');
  readonly erroAnexo = signal<string | null>(null);
  readonly salvando = signal(false);
  readonly erroGeral = signal<string | null>(null);
  readonly errosCampo = signal<Record<string, string>>({});

  readonly categoriasDoTipo = computed(() =>
    this.tipo() === 1 ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA,
  );

  rotuloCategoria(c: CategoriaLancamento): string {
    return ROTULOS_CATEGORIA[c];
  }
  iconeCategoria(c: CategoriaLancamento): string {
    return ICONES_CATEGORIA[c];
  }

  erroCampo(campo: string): string | null {
    return this.errosCampo()[campo] ?? null;
  }

  ngOnInit(): void {
    if (this.lancamento) {
      this.tipo.set(this.lancamento.tipo);
      this.descricao = this.lancamento.descricao;
      this.valor = this.lancamento.valor;
      this.data = this.lancamento.dataReferencia.substring(0, 10);
      this.categoria = this.lancamento.categoria;
      this.recorrencia = this.lancamento.recorrencia;
      this.observacoes = this.lancamento.observacoes ?? '';
    } else {
      this.tipo.set(this.tipoInicial);
      this.categoria = this.tipo() === 1 ? 1 : 100;
      this.data = this.hojeIso();
    }
  }

  trocarTipo(novo: TipoLancamento): void {
    if (this.lancamento) return;
    this.tipo.set(novo);
    this.categoria = novo === 1 ? 1 : 100;
    if (novo === 1) {
      this.anexoPreview.set(null);
      this.anexoNome.set('');
    }
  }

  onAnexoSelecionado(ev: Event): void {
    this.erroAnexo.set(null);
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      this.erroAnexo.set('Anexo passa de 1MB.');
      input.value = '';
      return;
    }
    if (!file.type.startsWith('application/pdf') && !file.type.startsWith('image/')) {
      this.erroAnexo.set('Só PDF ou imagem.');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.anexoPreview.set(reader.result as string);
      this.anexoNome.set(file.name);
    };
    reader.readAsDataURL(file);
  }

  removerAnexo(): void {
    this.anexoPreview.set(null);
    this.anexoNome.set('');
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

    const erros: Record<string, string> = {};
    if (!this.descricao.trim()) erros['descricao'] = 'Coloca uma descrição.';
    if (!this.valor || this.valor <= 0) erros['valor'] = 'Valor precisa ser maior que zero.';
    if (!this.data) erros['datareferencia'] = 'Escolhe a data.';

    if (Object.keys(erros).length > 0) {
      this.errosCampo.set(erros);
      return;
    }
    this.errosCampo.set({});
    this.erroGeral.set(null);

    const payload: LancamentoPayload = {
      tipo: this.tipo(),
      descricao: this.descricao.trim(),
      valor: this.valor!,
      dataReferencia: new Date(this.data + 'T00:00:00').toISOString(),
      categoria: this.categoria,
      recorrencia: this.recorrencia,
      anexoBoleto: this.anexoPreview(),
      observacoes: this.observacoes.trim() ? this.observacoes.trim() : null,
    };

    this.salvando.set(true);

    const req$ = this.lancamento
      ? this.api.atualizar(this.lancamento.id, {
          descricao: payload.descricao,
          valor: payload.valor,
          dataReferencia: payload.dataReferencia,
          categoria: payload.categoria,
          recorrencia: payload.recorrencia,
          anexoBoleto: payload.anexoBoleto,
          observacoes: payload.observacoes,
        })
      : this.api.criar(payload);

    req$.subscribe({
      next: (l) => {
        this.salvando.set(false);
        this.salvo.emit(l);
      },
      error: (err: HttpErrorResponse) => {
        this.salvando.set(false);
        const r = extrairProblemDetails(err, 'Não consegui salvar.');
        if (Object.keys(r.errosCampo).length > 0) {
          this.errosCampo.set(r.errosCampo);
        } else {
          this.erroGeral.set(r.mensagemGeral ?? 'Não consegui salvar.');
        }
      },
    });
  }

  private hojeIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
