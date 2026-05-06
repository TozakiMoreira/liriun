import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="block rounded bg-[linear-gradient(90deg,rgb(var(--c-bg-elev))_0%,rgb(var(--c-surface))_50%,rgb(var(--c-bg-elev))_100%)] bg-[length:200%_100%] animate-shimmer"
      [style.width]="largura"
      [style.height]="altura"
      [style.borderRadius]="raio"
      aria-hidden="true"
    ></span>
  `,
})
export class SkeletonComponent {
  @Input() largura = '100%';
  @Input() altura = '14px';
  @Input() raio = '6px';
}
