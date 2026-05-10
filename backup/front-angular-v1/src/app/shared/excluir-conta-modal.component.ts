import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasswordInputComponent } from './password-input.component';

@Component({
  selector: 'app-excluir-conta-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, PasswordInputComponent],
  template: `
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 grid place-items-center px-4 py-8 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="excluir-conta-title"
      data-testid="excluir-conta-modal-overlay"
    >
      <div
        class="card-elev w-full max-w-[440px] animate-scale-in"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 id="excluir-conta-title" class="text-sm font-semibold text-danger flex items-center gap-2">
            <i class="fa-solid fa-triangle-exclamation"></i>
            Excluir conta
          </h2>
          <button
            type="button"
            class="text-text-subtle hover:text-text text-base p-1 leading-none"
            data-testid="excluir-conta-close"
            aria-label="Fechar"
            (click)="onCancelar()"
          >
            ×
          </button>
        </div>

        <div class="p-5 flex flex-col gap-4">
          <div class="text-[13px] text-text-dim leading-relaxed">
            <p class="mb-2">
              Essa ação <strong class="text-danger">não pode ser desfeita</strong>. Vou apagar permanentemente:
            </p>
            <ul class="list-disc pl-5 space-y-0.5 text-text-subtle text-xs">
              <li>Sua conta e dados de perfil</li>
              <li>Todas as suas tarefas (pendentes, concluídas, atrasadas)</li>
              <li>Todas as suas categorias</li>
              <li>Histórico de capturas e observações</li>
            </ul>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="field-label" for="excluir-senha">Confirme com sua senha</label>
            <app-password-input
              inputId="excluir-senha"
              placeholder="Sua senha"
              autocomplete="current-password"
              testid="excluir-conta-senha-input"
              [value]="senha()"
              (valueChange)="senha.set($event)"
            />
          </div>

          <label
            class="flex items-start gap-2 text-[13px] text-text-dim cursor-pointer select-none"
          >
            <input
              type="checkbox"
              class="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--accent)]"
              name="confirmaIrreversivel"
              data-testid="excluir-conta-confirma-checkbox"
              [(ngModel)]="confirmaIrreversivel"
            />
            <span>Entendo que essa ação é irreversível.</span>
          </label>

          @if (erro()) {
            <p class="text-danger text-xs" data-testid="excluir-conta-erro">{{ erro() }}</p>
          }
        </div>

        <div class="px-5 py-3 border-t border-border flex justify-end gap-2">
          <button
            type="button"
            class="btn-secondary text-[13px] px-4 py-2"
            data-testid="excluir-conta-cancelar"
            [disabled]="processando()"
            (click)="onCancelar()"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="text-[13px] px-4 py-2 rounded font-medium bg-danger text-white hover:bg-danger/90 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="excluir-conta-confirmar"
            [disabled]="!senha() || !confirmaIrreversivel || processando()"
            (click)="onConfirmar()"
          >
            {{ processando() ? 'Excluindo...' : 'Excluir minha conta' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ExcluirContaModalComponent {
  @Input() set processandoExterno(v: boolean) {
    this.processando.set(v);
  }
  @Input() set erroExterno(v: string | null) {
    this.erro.set(v);
  }
  @Output() confirmar = new EventEmitter<string>();
  @Output() cancelado = new EventEmitter<void>();

  readonly senha = signal('');
  readonly processando = signal(false);
  readonly erro = signal<string | null>(null);

  confirmaIrreversivel = false;

  onConfirmar(): void {
    const s = this.senha();
    if (!s || !this.confirmaIrreversivel || this.processando()) return;
    this.confirmar.emit(s);
  }

  onCancelar(): void {
    if (this.processando()) return;
    this.cancelado.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.onCancelar();
  }
}
