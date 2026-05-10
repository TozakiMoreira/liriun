import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { ThemeService } from '../core/theme/theme.service';

/**
 * Toggle de tema deslizante (estilo iOS). Lua = escuro, Sol = claro.
 * Usa ThemeService global; persiste em localStorage.
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      @if (mostrarLabel) {
        <span class="text-[12px] font-medium text-text-dim hidden sm:inline">Tema</span>
      }
      <button
        type="button"
        class="theme-switch"
        role="switch"
        [attr.aria-checked]="tema() === 'light'"
        [attr.aria-label]="
          tema() === 'dark' ? 'Mudar pra tema claro' : 'Mudar pra tema escuro'
        "
        [title]="tema() === 'dark' ? 'Mudar pra claro' : 'Mudar pra escuro'"
        [class.is-light]="tema() === 'light'"
        data-testid="theme-toggle"
        (click)="alternar()"
      >
        <span class="theme-switch-track">
          <i class="fa-solid fa-moon theme-switch-icon theme-switch-icon-moon"></i>
          <i class="fa-solid fa-sun theme-switch-icon theme-switch-icon-sun"></i>
          <span class="theme-switch-knob">
            @if (tema() === 'dark') {
              <i class="fa-solid fa-moon text-[10px]"></i>
            } @else {
              <i class="fa-solid fa-sun text-[10px]"></i>
            }
          </span>
        </span>
      </button>
    </div>
  `,
  styles: [
    `
      .theme-switch {
        background: transparent;
        border: 0;
        padding: 0;
        cursor: pointer;
        line-height: 0;
      }
      .theme-switch-track {
        position: relative;
        display: inline-flex;
        align-items: center;
        width: 56px;
        height: 28px;
        border-radius: 9999px;
        background: rgb(var(--c-bg-elev));
        border: 1px solid rgb(var(--c-border));
        transition: background-color 200ms cubic-bezier(0.22, 1, 0.36, 1),
          border-color 200ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      .theme-switch:hover .theme-switch-track {
        border-color: rgb(var(--c-border-strong));
      }
      .theme-switch-icon {
        position: absolute;
        font-size: 10px;
        color: rgb(var(--c-text-subtle));
        pointer-events: none;
        transition: opacity 200ms ease;
      }
      .theme-switch-icon-moon {
        left: 8px;
      }
      .theme-switch-icon-sun {
        right: 8px;
      }
      .theme-switch.is-light .theme-switch-icon-sun {
        opacity: 0;
      }
      .theme-switch:not(.is-light) .theme-switch-icon-moon {
        opacity: 0;
      }
      .theme-switch-knob {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 22px;
        height: 22px;
        border-radius: 9999px;
        background: rgb(var(--c-accent));
        color: #ffffff;
        display: grid;
        place-items: center;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
        transition: transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1),
          background-color 200ms ease;
      }
      .theme-switch.is-light .theme-switch-knob {
        transform: translateX(28px);
        background: #f59e0b;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);
  readonly tema = this.themeService.theme;

  @Input() mostrarLabel = true;

  alternar(): void {
    this.themeService.alternar();
  }
}
