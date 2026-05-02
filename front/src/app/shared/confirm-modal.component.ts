import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 grid place-items-center px-4 py-8"
      data-testid="confirm-modal-overlay"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="'confirm-modal-title'"
      (click)="onCancelar()"
    >
      <div
        class="card-elev w-full max-w-[420px]"
        (click)="$event.stopPropagation()"
      >
        <div class="px-5 py-4 border-b border-border">
          <h2 id="confirm-modal-title" class="text-sm font-semibold" data-testid="confirm-modal-title">
            {{ titulo }}
          </h2>
        </div>
        <div class="px-5 py-4 text-text-dim text-[13px] leading-relaxed" data-testid="confirm-modal-message">
          {{ mensagem }}
        </div>
        <div class="px-5 py-3 border-t border-border flex justify-end gap-2">
          <button
            type="button"
            class="btn-secondary text-[13px] px-4 py-2"
            data-testid="confirm-modal-cancel"
            (click)="onCancelar()"
            [disabled]="processando"
          >
            {{ textoCancelar }}
          </button>
          <button
            type="button"
            [class]="
              perigo
                ? 'btn-danger text-[13px] px-4 py-2'
                : 'btn-primary text-[13px] px-4 py-2'
            "
            data-testid="confirm-modal-confirm"
            (click)="onConfirmar()"
            [disabled]="processando"
          >
            {{ processando ? 'Processando...' : textoConfirmar }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmModalComponent {
  @Input() titulo = 'Confirmar';
  @Input() mensagem = 'Tem certeza?';
  @Input() textoConfirmar = 'Confirmar';
  @Input() textoCancelar = 'Cancelar';
  @Input() perigo = false;
  @Input() processando = false;
  @Output() confirmado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  onConfirmar(): void {
    if (this.processando) return;
    this.confirmado.emit();
  }

  onCancelar(): void {
    if (this.processando) return;
    this.cancelado.emit();
  }
}
