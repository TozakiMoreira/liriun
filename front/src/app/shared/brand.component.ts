import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-brand',
  standalone: true,
  template: `<span class="brand-name">Liriun</span>`,
  styles: [
    `
      .brand-name {
        color: inherit;
        font-weight: inherit;
        letter-spacing: inherit;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandComponent {
  @Input() inverted = false;
}
