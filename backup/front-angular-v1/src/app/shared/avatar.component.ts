import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (fotoUrlValue() && !imagemQuebrou()) {
      <img
        [src]="fotoUrlValue()!"
        [alt]="alt"
        [style.width.px]="size"
        [style.height.px]="size"
        class="rounded-full object-cover shrink-0 border border-border"
        (error)="imagemQuebrou.set(true)"
      />
    } @else {
      <div
        class="rounded-full grid place-items-center text-white font-semibold shrink-0"
        [style.width.px]="size"
        [style.height.px]="size"
        [style.font-size.px]="fontSize()"
        [style.background]="'linear-gradient(135deg, #8b5cf6, #ec4899)'"
        [attr.aria-label]="alt"
        role="img"
      >
        {{ inicial() }}
      </div>
    }
  `,
})
export class AvatarComponent {
  private readonly nomeSignal = signal('');
  private readonly fotoUrlSignal = signal<string | null>(null);
  readonly imagemQuebrou = signal(false);

  @Input() set nome(v: string | null | undefined) {
    this.nomeSignal.set(v ?? '');
  }
  @Input() set fotoUrl(v: string | null | undefined) {
    this.fotoUrlSignal.set(v ?? null);
    this.imagemQuebrou.set(false);
  }
  @Input() size = 32;
  @Input() alt = 'Avatar';

  readonly fotoUrlValue = computed(() => this.fotoUrlSignal());

  readonly inicial = computed(() => {
    const n = this.nomeSignal().trim();
    return n.charAt(0).toUpperCase() || '?';
  });

  readonly fontSize = computed(() => Math.round(this.size * 0.45));
}
