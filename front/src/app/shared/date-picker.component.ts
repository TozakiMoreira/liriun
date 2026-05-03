import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  computed,
  inject,
  signal,
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
        type="button"
        class="date-picker-input"
        [class.disabled]="disabled"
        [disabled]="disabled"
        (click)="toggle()"
        [attr.aria-label]="ariaLabel"
        [attr.aria-expanded]="aberto()"
      >
        <i class="fa-solid fa-calendar text-text-dim text-[12px]"></i>
        @if (valor) {
          <span class="text-text">{{ formatado() }}</span>
        } @else {
          <span class="text-text-subtle">{{ placeholder }}</span>
        }
        <i class="fa-solid fa-chevron-down text-text-subtle text-[10px] ml-auto"></i>
      </button>

      @if (aberto()) {
        <div
          class="date-picker-pop"
          role="dialog"
          aria-label="Selecionar data"
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
      }
    </div>
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
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        z-index: 60;
        background: rgb(var(--c-bg-elev));
        border: 1px solid rgb(var(--c-border-strong));
        border-radius: 10px;
        padding: 12px;
        width: 280px;
        box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(94, 106, 210, 0.05);
        animation: pop-in 140ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      @keyframes pop-in {
        from { opacity: 0; transform: translateY(-4px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
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
})
export class DatePickerComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  @Input() valor: string | null = null;
  @Input() min: string | null = null;
  @Input() placeholder = 'Selecionar data';
  @Input() ariaLabel = 'Selecionar data';
  @Input() disabled = false;
  @Output() valorChange = new EventEmitter<string | null>();

  readonly aberto = signal(false);
  readonly mesVisivel = signal(new Date().getMonth());
  readonly anoVisivel = signal(new Date().getFullYear());

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
    const minIso = this.min;
    const selIso = this.valor;

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
    if (!this.valor) return '';
    const [y, m, d] = this.valor.split('-');
    return `${d}/${m}/${y}`;
  }

  toggle(): void {
    if (this.disabled) return;
    if (!this.aberto()) {
      // Sincroniza visível com valor
      const ref = this.valor ? new Date(this.valor + 'T00:00:00') : new Date();
      this.mesVisivel.set(ref.getMonth());
      this.anoVisivel.set(ref.getFullYear());
    }
    this.aberto.update((v) => !v);
  }

  selecionar(d: Dia): void {
    if (d.desabilitado) return;
    this.valor = d.iso;
    this.valorChange.emit(d.iso);
    this.aberto.set(false);
  }

  limpar(): void {
    this.valor = null;
    this.valorChange.emit(null);
    this.aberto.set(false);
  }

  hoje(): void {
    const iso = this.toIso(new Date());
    if (this.min && iso < this.min) return;
    this.valor = iso;
    this.valorChange.emit(iso);
    this.aberto.set(false);
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
    if (!this.host.nativeElement.contains(ev.target as Node)) {
      this.aberto.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.aberto()) this.aberto.set(false);
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
