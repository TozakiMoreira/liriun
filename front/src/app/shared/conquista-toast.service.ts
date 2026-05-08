import { Injectable, signal } from '@angular/core';

export interface ConquistaToast {
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: 'amber' | 'emerald' | 'sky' | 'violet' | 'rose' | 'orange';
}

@Injectable({ providedIn: 'root' })
export class ConquistaToastService {
  readonly atual = signal<ConquistaToast | null>(null);

  mostrar(c: ConquistaToast): void {
    this.atual.set(c);
    setTimeout(() => {
      if (this.atual()?.codigo === c.codigo) this.atual.set(null);
    }, 5000);
  }

  fechar(): void {
    this.atual.set(null);
  }
}
