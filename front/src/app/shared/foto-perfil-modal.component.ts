import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { AvatarComponent } from './avatar.component';
import { resizeImageToDataUrl } from './image-resize';

@Component({
  selector: 'app-foto-perfil-modal',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  template: `
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 grid place-items-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="foto-modal-title"
      data-testid="foto-modal-overlay"
      (click)="onCancelar()"
    >
      <div
        class="card-elev w-full max-w-[400px]"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 id="foto-modal-title" class="text-sm font-semibold">Trocar foto</h2>
          <button
            type="button"
            class="text-text-subtle hover:text-text text-base p-1 leading-none"
            data-testid="foto-modal-close"
            aria-label="Fechar"
            (click)="onCancelar()"
          >
            ×
          </button>
        </div>

        <div class="p-5 flex flex-col gap-4 items-center">
          <app-avatar
            [nome]="nome"
            [fotoUrl]="preview() ?? fotoAtual"
            [size]="160"
            alt="Pré-visualização da foto"
          />

          <input
            #fileInput
            type="file"
            accept="image/png,image/jpeg,image/webp"
            class="hidden"
            data-testid="foto-modal-file-input"
            (change)="onArquivoEscolhido($event)"
          />

          <div class="flex flex-col items-center gap-2">
            <button
              type="button"
              class="btn-secondary text-[13px] px-4 py-2 flex items-center gap-2"
              data-testid="foto-modal-escolher"
              (click)="abrirSeletor()"
              [disabled]="processando()"
            >
              <i class="fa-solid fa-image text-xs"></i>
              {{ preview() ? 'Escolher outra' : 'Escolher arquivo' }}
            </button>
            <p class="text-[11px] text-text-subtle">
              PNG, JPG ou WebP. Vou recortar quadrado e redimensionar pra 256×256.
            </p>
          </div>

          @if (erro()) {
            <p class="text-danger text-xs text-center" data-testid="foto-modal-erro">
              {{ erro() }}
            </p>
          }
        </div>

        <div class="px-5 py-3 border-t border-border flex flex-wrap justify-between gap-2">
          @if (fotoAtual && !preview()) {
            <button
              type="button"
              class="text-danger text-[13px] px-3 py-2 hover:bg-danger/10 rounded transition-colors"
              data-testid="foto-modal-remover"
              [disabled]="processando()"
              (click)="onRemover()"
            >
              Remover foto
            </button>
          } @else {
            <span></span>
          }

          <div class="flex gap-2">
            <button
              type="button"
              class="btn-secondary text-[13px] px-4 py-2"
              data-testid="foto-modal-cancelar"
              [disabled]="processando()"
              (click)="onCancelar()"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn-primary text-[13px] px-4 py-2"
              data-testid="foto-modal-salvar"
              [disabled]="!preview() || processando()"
              (click)="onSalvar()"
            >
              {{ processando() ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FotoPerfilModalComponent {
  @Input() nome: string | null = '';
  @Input() fotoAtual: string | null = null;
  @Input() set processandoExterno(v: boolean) {
    this.processando.set(v);
  }
  @Output() salvar = new EventEmitter<string>();
  @Output() remover = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  readonly preview = signal<string | null>(null);
  readonly processando = signal(false);
  readonly erro = signal<string | null>(null);

  private readonly fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  abrirSeletor(): void {
    this.erro.set(null);
    this.fileInputRef()?.nativeElement.click();
  }

  async onArquivoEscolhido(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.erro.set(null);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 256, 0.85);
      this.preview.set(dataUrl);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Não consegui processar essa imagem.';
      this.erro.set(msg);
    }
  }

  onSalvar(): void {
    const p = this.preview();
    if (!p) return;
    this.salvar.emit(p);
  }

  onRemover(): void {
    this.remover.emit();
  }

  onCancelar(): void {
    if (this.processando()) return;
    this.cancelado.emit();
  }
}
