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
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="time-picker-wrap" data-testid="time-picker">
      <button
        #trigger
        type="button"
        class="time-picker-input"
        [class.disabled]="disabled()"
        [disabled]="disabled()"
        (click)="toggle()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-expanded]="aberto()"
      >
        <i class="fa-solid fa-clock text-text-dim text-[12px]"></i>
        @if (valor()) {
          <span class="text-text">{{ valor() }}</span>
        } @else {
          <span class="text-text-subtle">{{ placeholder() }}</span>
        }
        <i class="fa-solid fa-chevron-down text-text-subtle text-[10px] ml-auto"></i>
      </button>
    </div>

    <ng-template #popTpl>
      <div
        class="time-picker-pop"
        role="dialog"
        aria-label="Selecionar horário"
        [style.top.px]="popTop()"
        [style.left.px]="popLeft()"
        (click)="$event.stopPropagation()"
      >
        <div class="time-picker-cols">
          <div class="time-picker-col" data-testid="hour-col">
            <div class="time-picker-col-label">Hora</div>
            <div class="time-picker-list" #horaList>
              @for (h of horas; track h) {
                <button
                  type="button"
                  class="time-picker-cell"
                  [class.active]="h === horaSel()"
                  [attr.data-hour]="h"
                  (click)="setHora(h)"
                >
                  {{ h }}
                </button>
              }
            </div>
          </div>
          <div class="time-picker-col" data-testid="min-col">
            <div class="time-picker-col-label">Minuto</div>
            <div class="time-picker-list" #minList>
              @for (m of minutos; track m) {
                <button
                  type="button"
                  class="time-picker-cell"
                  [class.active]="m === minSel()"
                  [attr.data-min]="m"
                  (click)="setMin(m)"
                >
                  {{ m }}
                </button>
              }
            </div>
          </div>
        </div>
        <div class="time-picker-footer">
          <button
            type="button"
            class="time-picker-action"
            (click)="limpar()"
          >
            Limpar
          </button>
          <button
            type="button"
            class="time-picker-action accent"
            (click)="confirmar()"
          >
            OK
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
      .time-picker-wrap {
        position: relative;
        width: 100%;
      }
      .time-picker-input {
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
      .time-picker-input:hover {
        border-color: rgb(var(--c-border-strong));
      }
      .time-picker-input.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .time-picker-pop {
        position: fixed;
        z-index: 9999;
        background: rgb(var(--c-bg-elev));
        border: 1px solid rgb(var(--c-border-strong));
        border-radius: 10px;
        padding: 12px;
        width: 200px;
        box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.55);
        animation: time-picker-pop-in 140ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      @keyframes time-picker-pop-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .time-picker-cols {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .time-picker-col {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .time-picker-col-label {
        font-size: 10px;
        font-weight: 600;
        color: rgb(var(--c-text-subtle));
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .time-picker-list {
        height: 180px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding-right: 2px;
        scroll-behavior: smooth;
      }
      .time-picker-list::-webkit-scrollbar {
        width: 4px;
      }
      .time-picker-list::-webkit-scrollbar-thumb {
        background: rgb(var(--c-border-strong));
        border-radius: 2px;
      }
      .time-picker-cell {
        padding: 6px 0;
        border: 0;
        background: transparent;
        color: rgb(var(--c-text-dim));
        font-size: 12.5px;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 120ms, color 120ms;
      }
      .time-picker-cell:hover {
        background: rgb(var(--c-surface));
        color: rgb(var(--c-text));
      }
      .time-picker-cell.active {
        background: rgb(var(--c-accent));
        color: #ffffff;
      }
      .time-picker-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid rgb(var(--c-border));
      }
      .time-picker-action {
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
      .time-picker-action:hover {
        background: rgb(var(--c-surface));
        color: rgb(var(--c-text));
      }
      .time-picker-action.accent {
        color: rgb(var(--c-accent));
      }
      .time-picker-action.accent:hover {
        background: rgba(94, 106, 210, 0.12);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TimePickerComponent implements OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly popTpl = viewChild.required<TemplateRef<unknown>>('popTpl');
  private viewRef: EmbeddedViewRef<unknown> | null = null;

  readonly valor = input<string | null>(null);
  readonly placeholder = input('--:--');
  readonly ariaLabel = input('Selecionar horário');
  readonly disabled = input(false);
  readonly valorChange = output<string | null>();

  readonly aberto = signal(false);
  readonly horaSel = signal<string>('--');
  readonly minSel = signal<string>('--');
  readonly popTop = signal(0);
  readonly popLeft = signal(0);

  readonly horas = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  readonly minutos = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  private static readonly POP_W = 200;
  private static readonly POP_H = 320;
  private static readonly OFFSET = 6;

  toggle(): void {
    if (this.disabled()) return;
    if (this.aberto()) {
      this.fecharPop();
      return;
    }
    const [h, m] = (this.valor() || '--:--').split(':');
    this.horaSel.set(h);
    this.minSel.set(m);
    this.posicionarPop();
    this.aberto.set(true);
    this.mountPop();
    setTimeout(() => this.scrollToSelected(), 0);
  }

  setHora(h: string): void {
    this.horaSel.set(h);
    if (this.minSel() === '--') this.minSel.set('00');
    this.emitir();
  }

  setMin(m: string): void {
    this.minSel.set(m);
    if (this.horaSel() === '--') this.horaSel.set('00');
    this.emitir();
  }

  confirmar(): void {
    this.fecharPop();
  }

  limpar(): void {
    this.horaSel.set('--');
    this.minSel.set('--');
    this.valorChange.emit(null);
    this.fecharPop();
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

  private posicionarPop(): void {
    const btn = this.trigger()?.nativeElement;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margem = 8;

    let top = r.bottom + TimePickerComponent.OFFSET;
    if (top + TimePickerComponent.POP_H > vh - margem) {
      const acima = r.top - TimePickerComponent.OFFSET - TimePickerComponent.POP_H;
      top = acima > margem ? acima : Math.max(margem, vh - TimePickerComponent.POP_H - margem);
    }

    let left = r.right - TimePickerComponent.POP_W;
    if (left < margem) left = margem;
    if (left + TimePickerComponent.POP_W > vw - margem) {
      left = Math.max(margem, vw - TimePickerComponent.POP_W - margem);
    }

    this.popTop.set(top);
    this.popLeft.set(left);
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onViewportMudou(): void {
    if (this.aberto()) this.posicionarPop();
  }

  ngOnDestroy(): void {
    this.unmountPop();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (!this.aberto()) return;
    const alvo = ev.target as Node;
    if (this.host.nativeElement.contains(alvo)) return;
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

  private emitir(): void {
    if (this.horaSel() === '--' || this.minSel() === '--') return;
    const novo = `${this.horaSel()}:${this.minSel()}`;
    this.valorChange.emit(novo);
  }

  private scrollToSelected(): void {
    const popEl = this.viewRef?.rootNodes.find((n) => n instanceof HTMLElement) as
      | HTMLElement
      | undefined;
    if (!popEl) return;
    const horaActive = popEl.querySelector('.time-picker-cell.active[data-hour]') as HTMLElement | null;
    const minActive = popEl.querySelector('.time-picker-cell.active[data-min]') as HTMLElement | null;
    horaActive?.scrollIntoView({ block: 'center' });
    minActive?.scrollIntoView({ block: 'center' });
  }
}
