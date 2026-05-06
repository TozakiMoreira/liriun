import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BrandComponent } from './brand.component';
import { SpinnerComponent } from './spinner.component';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BrandComponent, SpinnerComponent],
  template: `
    <div
      class="fixed inset-0 z-[9990] flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-fade-in"
      role="alert"
      aria-busy="true"
      aria-live="polite"
    >
      <div class="flex flex-col items-center gap-4 px-6 py-8">
        <img src="/logo.png" alt="" class="w-12 h-12 object-contain animate-pulse-soft" aria-hidden="true" />
        <div class="text-[18px] font-semibold tracking-tight"><app-brand /></div>
        <div class="flex items-center gap-2 text-text-dim text-sm">
          <app-spinner tamanho="sm" />
          <span>{{ mensagem }}</span>
        </div>
      </div>
    </div>
  `,
})
export class LoadingOverlayComponent {
  @Input() mensagem = 'Aguarde um momento.';
}
