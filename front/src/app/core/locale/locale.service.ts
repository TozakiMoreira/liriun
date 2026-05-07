import { Injectable, computed, signal } from '@angular/core';
import { TRANSLATIONS } from './translations';

export type Locale = 'pt' | 'en';

const STORAGE_KEY = 'liriun.locale';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly _locale = signal<Locale>(this.lerInicial());

  readonly locale = this._locale.asReadonly();
  readonly dict = computed(() => TRANSLATIONS[this._locale()]);

  setLocale(novo: Locale): void {
    this._locale.set(novo);
    try {
      localStorage.setItem(STORAGE_KEY, novo);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = novo === 'en' ? 'en' : 'pt-BR';
  }

  toggle(): void {
    this.setLocale(this._locale() === 'pt' ? 'en' : 'pt');
  }

  /**
   * Translate by key. Supports {{var}} interpolation.
   * Returns key itself if missing (visible in dev).
   */
  t(key: string, vars?: Record<string, string>): string {
    const raw = this.dict()[key] ?? key;
    if (!vars) return raw;
    return raw.replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] ?? `{{${name}}}`);
  }

  private lerInicial(): Locale {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'pt' || v === 'en') return v;
    } catch {
      /* ignore */
    }
    return 'pt';
  }
}
