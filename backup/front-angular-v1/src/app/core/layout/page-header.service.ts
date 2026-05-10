import { Injectable, TemplateRef, signal } from '@angular/core';

export interface VoltarConfig {
  acao: () => void;
  aria?: string;
  testid?: string;
}

export interface PageHeaderConfig {
  titulo: string;
  iconeClasse?: string | null;
  iconeCor?: string | null;
  subtituloTpl?: TemplateRef<unknown> | null;
  acoesTpl?: TemplateRef<unknown> | null;
  voltar?: VoltarConfig | null;
}

@Injectable({ providedIn: 'root' })
export class PageHeaderService {
  readonly titulo = signal<string>('');
  readonly iconeClasse = signal<string | null>(null);
  readonly iconeCor = signal<string | null>(null);
  readonly subtituloTpl = signal<TemplateRef<unknown> | null>(null);
  readonly acoesTpl = signal<TemplateRef<unknown> | null>(null);
  readonly voltar = signal<VoltarConfig | null>(null);

  set(cfg: PageHeaderConfig): void {
    this.titulo.set(cfg.titulo);
    this.iconeClasse.set(cfg.iconeClasse ?? null);
    this.iconeCor.set(cfg.iconeCor ?? null);
    this.subtituloTpl.set(cfg.subtituloTpl ?? null);
    this.acoesTpl.set(cfg.acoesTpl ?? null);
    this.voltar.set(cfg.voltar ?? null);
  }

  setVoltar(v: VoltarConfig | null): void {
    this.voltar.set(v);
  }

  setSubtitulo(tpl: TemplateRef<unknown> | null): void {
    this.subtituloTpl.set(tpl);
  }

  setIcone(classe: string | null, cor: string | null = null): void {
    this.iconeClasse.set(classe);
    this.iconeCor.set(cor);
  }

  limpar(): void {
    this.titulo.set('');
    this.iconeClasse.set(null);
    this.iconeCor.set(null);
    this.subtituloTpl.set(null);
    this.acoesTpl.set(null);
    this.voltar.set(null);
  }
}
