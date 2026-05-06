import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';

export type SpinnerTamanho = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-block align-middle rounded-full border-current border-t-transparent animate-spin"
      [style.width.px]="px()"
      [style.height.px]="px()"
      [style.borderWidth.px]="espessura()"
      role="status"
      [attr.aria-label]="rotulo"
    ></span>
  `,
})
export class SpinnerComponent {
  private readonly _tamanho = signal<SpinnerTamanho>('md');

  @Input()
  set tamanho(valor: SpinnerTamanho) {
    this._tamanho.set(valor);
  }

  @Input() rotulo = 'Carregando';

  readonly px = computed(() => {
    switch (this._tamanho()) {
      case 'sm': return 14;
      case 'lg': return 28;
      default: return 18;
    }
  });

  readonly espessura = computed(() => (this._tamanho() === 'lg' ? 3 : 2));
}
