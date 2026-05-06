import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { LoadingService } from '../core/loading/loading.service';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visivel()) {
      <div
        class="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
        role="progressbar"
        aria-label="Carregando"
        aria-live="polite"
      >
        <div
          class="h-full bg-gradient-to-r from-accent via-accent-violet to-accent bg-[length:200%_100%] animate-loading-shimmer shadow-[0_0_8px_rgba(139,92,246,0.6)]"
        ></div>
      </div>
    }
  `,
  styles: [`
    @keyframes loading-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .animate-loading-shimmer {
      animation: loading-shimmer 1.4s linear infinite;
    }
  `],
})
export class LoadingBarComponent implements OnDestroy {
  private readonly loading = inject(LoadingService);
  private readonly atrasoMs = 120;
  private readonly minVisivelMs = 320;

  private readonly forcaVisivel = signal(false);
  private timerMostrar: ReturnType<typeof setTimeout> | null = null;
  private timerEsconder: ReturnType<typeof setTimeout> | null = null;
  private mostradoEm = 0;

  readonly visivel = computed(() => this.forcaVisivel());

  constructor() {
    effect(() => {
      const ativo = this.loading.emAndamento();
      if (ativo) {
        this.agendarMostrar();
      } else {
        this.agendarEsconder();
      }
    });
  }

  private agendarMostrar(): void {
    if (this.timerEsconder) {
      clearTimeout(this.timerEsconder);
      this.timerEsconder = null;
    }
    if (this.forcaVisivel() || this.timerMostrar) return;
    this.timerMostrar = setTimeout(() => {
      this.forcaVisivel.set(true);
      this.mostradoEm = performance.now();
      this.timerMostrar = null;
    }, this.atrasoMs);
  }

  private agendarEsconder(): void {
    if (this.timerMostrar) {
      clearTimeout(this.timerMostrar);
      this.timerMostrar = null;
    }
    if (!this.forcaVisivel()) return;
    const decorrido = performance.now() - this.mostradoEm;
    const restante = Math.max(0, this.minVisivelMs - decorrido);
    this.timerEsconder = setTimeout(() => {
      this.forcaVisivel.set(false);
      this.timerEsconder = null;
    }, restante);
  }

  ngOnDestroy(): void {
    if (this.timerMostrar) clearTimeout(this.timerMostrar);
    if (this.timerEsconder) clearTimeout(this.timerEsconder);
  }
}
