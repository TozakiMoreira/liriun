import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly contador = signal(0);

  readonly emAndamento = computed(() => this.contador() > 0);

  inicio(): void {
    this.contador.update((n) => n + 1);
  }

  fim(): void {
    this.contador.update((n) => Math.max(0, n - 1));
  }

  reset(): void {
    this.contador.set(0);
  }
}
