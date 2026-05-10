import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'liriun.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(this.lerInicial());
  readonly theme = this._theme.asReadonly();

  constructor() {
    this.aplicar(this._theme());
    this.observarSistema();
  }

  alternar(): void {
    this.definir(this._theme() === 'dark' ? 'light' : 'dark');
  }

  definir(t: Theme): void {
    this._theme.set(t);
    this.aplicar(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  }

  /**
   * Volta a seguir o tema do sistema. Remove preferência salva.
   */
  resetar(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    const t = this.lerSistema();
    this._theme.set(t);
    this.aplicar(t);
  }

  private aplicar(t: Theme): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (t === 'light') {
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
    }
  }

  private lerInicial(): Theme {
    const salvo = this.lerSalvo();
    if (salvo) return salvo;
    return this.lerSistema();
  }

  private lerSalvo(): Theme | null {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'light' || v === 'dark') return v;
    } catch {
      /* ignore */
    }
    return null;
  }

  private lerSistema(): Theme {
    if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  /**
   * Acompanha mudança do tema do sistema. Só aplica se usuário ainda não escolheu manualmente.
   */
  private observarSistema(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (ev: MediaQueryListEvent) => {
      if (this.lerSalvo()) return;
      const novo: Theme = ev.matches ? 'light' : 'dark';
      this._theme.set(novo);
      this.aplicar(novo);
    };
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    } else {
      mq.addListener(handler);
    }
  }
}
