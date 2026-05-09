import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocaleService } from '../core/locale/locale.service';
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
            {{ locale.t('excluir_conta.titulo') }}
          </h2>
          <button
            type="button"
            class="text-text-subtle hover:text-text text-base p-1 leading-none"
            data-testid="excluir-conta-close"
            [attr.aria-label]="locale.t('excluir_conta.fechar')"
            (click)="onCancelar()"
          >
            ×
          </button>
        </div>

        <div class="p-5 flex flex-col gap-4">
          <div class="text-[13px] text-text-dim leading-relaxed">
            <p class="mb-2">
              {{ locale.t('excluir_conta.aviso_acao') }} <strong class="text-danger">{{ locale.t('excluir_conta.aviso_irreversivel') }}</strong>{{ locale.t('excluir_conta.aviso_apagar') }}
            </p>
            <ul class="list-disc pl-5 space-y-0.5 text-text-subtle text-xs">
              <li>{{ locale.t('excluir_conta.item_perfil') }}</li>
              <li>{{ locale.t('excluir_conta.item_tarefas') }}</li>
              <li>{{ locale.t('excluir_conta.item_categorias') }}</li>
              <li>{{ locale.t('excluir_conta.item_historico') }}</li>
            </ul>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="field-label" for="excluir-senha">{{ locale.t('excluir_conta.confirme_senha') }}</label>
            <app-password-input
              inputId="excluir-senha"
              [placeholder]="locale.t('excluir_conta.placeholder_senha')"
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
            <span>{{ locale.t('excluir_conta.confirma_irreversivel') }}</span>
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
            {{ locale.t('excluir_conta.cancelar') }}
          </button>
          <button
            type="button"
            class="text-[13px] px-4 py-2 rounded font-medium bg-danger text-white hover:bg-danger/90 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="excluir-conta-confirmar"
            [disabled]="!senha() || !confirmaIrreversivel || processando()"
            (click)="onConfirmar()"
          >
            {{ processando() ? locale.t('excluir_conta.excluindo') : locale.t('excluir_conta.btn') }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ExcluirContaModalComponent {
  readonly locale = inject(LocaleService);

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
