import { Component, HostListener, inject, signal } from '@angular/core';
import { LocaleService } from '../core/locale/locale.service';

@Component({
  selector: 'app-locale-switcher',
  standalone: true,
  template: `
    <div class="relative" (click)="$event.stopPropagation()">
      <button
        type="button"
        class="flex items-center gap-1 sm:gap-1.5 h-8 px-2 sm:px-2.5 rounded text-text-dim hover:text-text hover:bg-bg-elev/60 transition-colors text-[12px] font-medium"
        [attr.aria-label]="'Mudar idioma. Atual: ' + (locale.locale() === 'pt' ? 'Português' : 'English')"
        [attr.aria-expanded]="aberto()"
        aria-haspopup="listbox"
        data-testid="locale-switcher"
        (click)="toggle()"
      >
        <i class="fa-solid fa-globe text-[13px]" aria-hidden="true"></i>
        <span class="uppercase tracking-wider">{{ locale.locale() === 'pt' ? 'PT-BR' : 'US' }}</span>
        <i class="fa-solid fa-chevron-down text-[8px] transition-transform" [class.rotate-180]="aberto()" aria-hidden="true"></i>
      </button>

      @if (aberto()) {
        <div
          class="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 z-50 card-elev p-1 w-[180px] flex flex-col gap-px animate-fade-down"
          role="listbox"
        >
          @for (l of opcoes; track l.code) {
            <button
              type="button"
              role="option"
              [attr.aria-selected]="locale.locale() === l.code"
              class="flex items-center justify-between gap-2 px-2.5 py-2 rounded text-[13px] text-text-dim hover:text-text hover:bg-bg-elev"
              [class.bg-accent]="locale.locale() === l.code"
              [class.bg-opacity-10]="locale.locale() === l.code"
              [class.!text-text]="locale.locale() === l.code"
              [attr.data-testid]="'locale-opt-' + l.code"
              (click)="selecionar(l.code)"
            >
              <span class="flex flex-col items-start leading-tight">
                <span class="font-medium">{{ l.label }}</span>
                <span class="text-[10px] text-text-subtle uppercase tracking-wider">{{ l.tag }}</span>
              </span>
              @if (locale.locale() === l.code) {
                <i class="fa-solid fa-check text-accent text-[10px]"></i>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class LocaleSwitcherComponent {
  readonly locale = inject(LocaleService);
  readonly aberto = signal(false);

  readonly opcoes: { code: 'pt' | 'en'; label: string; tag: string }[] = [
    { code: 'pt', label: 'Português', tag: 'PT-BR' },
    { code: 'en', label: 'English', tag: 'US' },
  ];

  toggle(): void {
    this.aberto.update((v) => !v);
  }

  selecionar(code: 'pt' | 'en'): void {
    this.locale.setLocale(code);
    this.aberto.set(false);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.aberto()) this.aberto.set(false);
  }
}
