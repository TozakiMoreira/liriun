import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EmbeddedViewRef,
  HostListener,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

interface Dia {
  iso: string;
  numero: number;
  mesAtual: boolean;
  hoje: boolean;
  selecionado: boolean;
  desabilitado: boolean;
  fimSemana: boolean;
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="date-picker-wrap" data-testid="date-picker">
      <button
        #trigger
        type="button"
        class="date-picker-input"
        [class.disabled]="disabled()"
        [disabled]="disabled()"
        (click)="toggle()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-expanded]="aberto()"
      >
        <i class="fa-solid fa-calendar text-text-dim text-[12px]"></i>
        @if (valor()) {
          <span class="text-text">{{ formatado() }}</span>
        } @else {
          <span class="text-text-subtle">{{ placeholder() }}</span>
        }
        <i class="fa-solid fa-chevron-down text-text-subtle text-[10px] ml-auto"></i>
      </button>

    </div>

    <ng-template #popTpl>
      <div
        #popEl
        class="date-picker-pop"
        role="dialog"
        aria-label="Selecionar data"
        [style.top.px]="popTop()"
        [style.left.px]="popLeft()"
        (click)="$event.stopPropagation()"
      >
        <div class="date-picker-header">
          <button
            type="button"
            class="date-picker-nav"
            (click)="prevMes()"
            aria-label="Mês anterior"
            title="Mês anterior"
          >
            <i class="fa-solid fa-chevron-left text-[10px]"></i>
          </button>
          <div class="date-picker-title">
            {{ mesNomes[mesVisivel()] }} de {{ anoVisivel() }}
          </div>
          <button
            type="button"
            class="date-picker-nav"
            (click)="nextMes()"
            aria-label="Próximo mês"
            title="Próximo mês"
          >
            <i class="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>

        <div class="date-picker-grid">
          @for (s of semanaLabels; track s) {
            <div class="date-picker-weekday">{{ s }}</div>
          }
          @for (d of dias(); track d.iso) {
            <button
              type="button"
              class="date-picker-day"
              [class.outside]="!d.mesAtual"
              [class.today]="d.hoje"
              [class.selected]="d.selecionado"
              [class.weekend]="d.fimSemana && d.mesAtual"
              [disabled]="d.desabilitado"
              [attr.aria-label]="d.iso"
              (click)="selecionar(d)"
            >
              {{ d.numero }}
            </button>
          }
        </div>

        <div class="date-picker-footer">
          <button
            type="button"
            class="date-picker-action"
            (click)="limpar()"
          >
            Limpar
          </button>
          <button
            type="button"
            class="date-picker-action accent"
            (click)="hoje()"
          >
            Hoje
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .date-picker-wrap {
        position: relative;
        width: 100%;
      }
      .date-picker-input {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 10px 12px;
        border: 1px solid rgb(var(--c-border));
        background: rgb(var(--c-bg-elev));
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        transition: border-color 160ms;
      }
      .date-picker-input:hover {
        border-color: rgb(var(--c-border-strong));
      }
      .date-picker-input.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .date-picker-pop {
        position: fixed;
        z-index: 9999;
        background: rgb(var(--c-bg-elev));
        border: 1px solid rgb(var(--c-border-strong));
        border-radius: 10px;
        padding: 12px;
        width: 280px;
        box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(94, 106, 210, 0.05);
        animation: date-picker-pop-in 140ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      @keyframes date-picker-pop-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .date-picker-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .date-picker-title {
        font-size: 13px;
        font-weight: 600;
        color: rgb(var(--c-text));
        text-transform: capitalize;
      }
      .date-picker-nav {
        width: 26px;
        height: 26px;
        display: grid;
        place-items: center;
        border-radius: 6px;
        color: rgb(var(--c-text-dim));
        background: transparent;
        border: 0;
        cursor: pointer;
        transition: background-color 140ms, color 140ms;
      }
      .date-picker-nav:hover {
        background: rgb(var(--c-surface));
        color: rgb(var(--c-text));
      }
      .date-picker-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
      }
      .date-picker-weekday {
        font-size: 10px;
        font-weight: 600;
        color: rgb(var(--c-text-subtle));
        text-align: center;
        padding: 4px 0 6px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .date-picker-day {
        height: 32px;
        display: grid;
        place-items: center;
        border-radius: 6px;
        font-size: 12.5px;
        font-weight: 500;
        color: rgb(var(--c-text));
        background: transparent;
        border: 1px solid transparent;
        cursor: pointer;
        transition: background-color 120ms, color 120ms, border-color 120ms;
      }
      .date-picker-day:hover:not(:disabled) {
        background: rgb(var(--c-surface));
      }
      .date-picker-day.outside {
        color: rgb(var(--c-text-subtle));
        opacity: 0.55;
      }
      .date-picker-day.weekend {
        color: rgb(var(--c-text-dim));
      }
      .date-picker-day.today {
        border-color: rgba(94, 106, 210, 0.45);
      }
      .date-picker-day.selected,
      .date-picker-day.selected:hover {
        background: rgb(var(--c-accent));
        color: #ffffff;
        border-color: rgb(var(--c-accent));
      }
      .date-picker-day:disabled {
        cursor: not-allowed;
        opacity: 0.25;
      }
      .date-picker-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid rgb(var(--c-border));
      }
      .date-picker-action {
        font-size: 12px;
        font-weight: 500;
        color: rgb(var(--c-text-dim));
        background: transparent;
        border: 0;
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 120ms, color 120ms;
      }
      .date-picker-action:hover {
        background: rgb(var(--c-surface));
        color: rgb(var(--c-text));
      }
      .date-picker-action.accent {
        color: rgb(var(--c-accent));
      }
      .date-picker-action.accent:hover {
        background: rgba(94, 106, 210, 0.12);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DatePickerComponent implements OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly popTpl = viewChild.required<TemplateRef<unknown>>('popTpl');
  private viewRef: EmbeddedViewRef<unknown> | null = null;

  readonly valor = input<string | null>(null);
  readonly min = input<string | null>(null);
  readonly placeholder = input('Selecionar data');
  readonly ariaLabel = input('Selecionar data');
  readonly disabled = input(false);
  readonly valorChange = output<string | null>();

  readonly aberto = signal(false);
  readonly mesVisivel = signal(new Date().getMonth());
  readonly anoVisivel = signal(new Date().getFullYear());
  readonly popTop = signal(0);
  readonly popLeft = signal(0);
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private static readonly POP_W = 280;
  private static readonly POP_H = 340;
  private static readonly OFFSET = 6;

  readonly mesNomes = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];
  readonly semanaLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  readonly dias = computed<Dia[]>(() => {
    const ano = this.anoVisivel();
    const mes = this.mesVisivel();
    const primeiro = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const diaSemanaInicio = primeiro.getDay();
    const hojeIso = this.toIso(new Date());
    const minIso = this.min();
    const selIso = this.valor();

    const cells: Dia[] = [];
    // Dias do mês anterior
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const d = new Date(ano, mes, -i);
      cells.push(this.criarDia(d, false, hojeIso, minIso, selIso));
    }
    // Mês atual
    for (let d = 1; d <= ultimoDia; d++) {
      cells.push(this.criarDia(new Date(ano, mes, d), true, hojeIso, minIso, selIso));
    }
    // Completar 42 (6 semanas)
    let proximo = 1;
    while (cells.length < 42) {
      cells.push(this.criarDia(new Date(ano, mes + 1, proximo++), false, hojeIso, minIso, selIso));
    }
    return cells;
  });

  formatado(): string {
    const v = this.valor();
    if (!v) return '';
    const [y, m, d] = v.split('-');
    return `${d}/${m}/${y}`;
  }

  toggle(): void {
    if (this.disabled()) return;
    if (this.aberto()) {
      this.fecharPop();
      return;
    }
    const v = this.valor();
    const ref = v ? new Date(v + 'T00:00:00') : new Date();
    this.mesVisivel.set(ref.getMonth());
    this.anoVisivel.set(ref.getFullYear());
    this.posicionarPop();
    this.aberto.set(true);
    this.mountPop();
  }

  private fecharPop(): void {
    this.aberto.set(false);
    this.unmountPop();
  }

  private mountPop(): void {
    if (this.viewRef) return;
    this.viewRef = this.vcr.createEmbeddedView(this.popTpl());
    this.viewRef.detectChanges();
    for (const node of this.viewRef.rootNodes) {
      if (node instanceof HTMLElement) document.body.appendChild(node);
    }
  }

  private unmountPop(): void {
    if (!this.viewRef) return;
    for (const node of this.viewRef.rootNodes) {
      if (node instanceof HTMLElement) node.remove();
    }
    this.viewRef.destroy();
    this.viewRef = null;
  }

  ngOnDestroy(): void {
    this.unmountPop();
  }

  /**
   * Calcula posicao fixed do pop relativo ao trigger.
   * Tenta abrir pra baixo; se nao couber, abre pra cima.
   * Tenta alinhar a esquerda; se passar viewport, ajusta pra direita.
   */
  private posicionarPop(): void {
    const btn = this.trigger()?.nativeElement;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margem = 8;

    let top = r.bottom + DatePickerComponent.OFFSET;
    if (top + DatePickerComponent.POP_H > vh - margem) {
      const acima = r.top - DatePickerComponent.OFFSET - DatePickerComponent.POP_H;
      top = acima > margem ? acima : Math.max(margem, vh - DatePickerComponent.POP_H - margem);
    }

    let left = r.left;
    if (left + DatePickerComponent.POP_W > vw - margem) {
      left = Math.max(margem, vw - DatePickerComponent.POP_W - margem);
    }

    this.popTop.set(top);
    this.popLeft.set(left);
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onViewportMudou(): void {
    if (this.aberto()) this.posicionarPop();
  }

  selecionar(d: Dia): void {
    if (d.desabilitado) return;
    this.valorChange.emit(d.iso);
    this.fecharPop();
  }

  limpar(): void {
    this.valorChange.emit(null);
    this.fecharPop();
  }

  hoje(): void {
    const iso = this.toIso(new Date());
    const minIso = this.min();
    if (minIso && iso < minIso) return;
    this.valorChange.emit(iso);
    this.fecharPop();
  }

  prevMes(): void {
    const m = this.mesVisivel();
    if (m === 0) {
      this.mesVisivel.set(11);
      this.anoVisivel.update((a) => a - 1);
    } else {
      this.mesVisivel.set(m - 1);
    }
  }

  nextMes(): void {
    const m = this.mesVisivel();
    if (m === 11) {
      this.mesVisivel.set(0);
      this.anoVisivel.update((a) => a + 1);
    } else {
      this.mesVisivel.set(m + 1);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (!this.aberto()) return;
    const alvo = ev.target as Node;
    if (this.host.nativeElement.contains(alvo)) return;
    // Pop vive no body via portal — checar nele tambem
    const popEl = this.viewRef?.rootNodes.find((n) => n instanceof HTMLElement) as
      | HTMLElement
      | undefined;
    if (popEl?.contains(alvo)) return;
    this.fecharPop();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.aberto()) this.fecharPop();
  }

  private criarDia(
    d: Date,
    mesAtual: boolean,
    hojeIso: string,
    minIso: string | null,
    selIso: string | null,
  ): Dia {
    const iso = this.toIso(d);
    const dow = d.getDay();
    return {
      iso,
      numero: d.getDate(),
      mesAtual,
      hoje: iso === hojeIso,
      selecionado: iso === selIso,
      desabilitado: !!minIso && iso < minIso,
      fimSemana: dow === 0 || dow === 6,
    };
  }

  private toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }
}
