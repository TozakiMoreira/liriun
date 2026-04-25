import { Component, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorage } from '../../core/auth/token.storage';
import { TarefaFormComponent } from '../tarefas/tarefa-form.component';

type Modo = 'manual' | 'jarvis' | null;

@Component({
  selector: 'app-captura',
  standalone: true,
  imports: [TarefaFormComponent],
  template: `
    <header class="flex items-center px-8 py-3.5 border-b border-border gap-4">
      <div class="flex items-center gap-2 text-[13px] text-text-dim">
        <i class="fa-solid fa-bolt text-accent text-[11px]"></i>
        <strong class="text-text font-medium">Captura Rápida</strong>
      </div>
    </header>

    <div
      class="flex-1 grid place-items-center px-8 py-12 bg-bg"
      style="background-image: radial-gradient(ellipse 60% 30% at 50% 0%, rgba(94, 106, 210, 0.08), transparent);"
      data-testid="captura-page"
    >
      <div class="w-full max-w-[720px] flex flex-col gap-10 items-center">
        <div class="text-center flex flex-col gap-2.5">
          <h1 class="text-[28px] font-semibold tracking-tight leading-tight" data-testid="jarvis-greeting">
            {{ saudacao() }}{{ nomeUsuario() ? ', ' + nomeUsuario() : '' }}
          </h1>
          <div class="text-lg font-medium text-text-dim tracking-tight" data-testid="jarvis-prompt">
            O que você precisa anotar?
          </div>
          <p class="text-text-dim max-w-[440px] mx-auto leading-relaxed">
            Escolha como quer criar a tarefa. Manual pra quando você já sabe tudo, Jarvis pra
            quando quer que eu organize pra você.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4 w-full" data-testid="mode-picker">
          <button
            type="button"
            class="bg-bg-elev border border-border rounded-lg p-6 cursor-pointer text-left flex flex-col gap-3.5 hover:border-border-strong hover:bg-[#16181c] transition-colors group"
            data-testid="mode-manual-btn"
            (click)="abrirManual()"
          >
            <div class="flex items-center justify-between gap-3">
              <div
                class="w-9 h-9 rounded-lg bg-[#16181c] border border-border-strong grid place-items-center text-text-dim text-[15px]"
              >
                <i class="fa-solid fa-pen-to-square"></i>
              </div>
            </div>
            <div class="text-base font-semibold tracking-tight text-text-dim">Manual</div>
            <div class="text-[13px] text-text-dim leading-relaxed">
              Você preenche os campos na mão: nome, categoria, prazo e prioridade. Rápido e sem
              surpresas.
            </div>
            <div
              class="flex items-center justify-between mt-1.5 pt-3.5 border-t border-border"
            >
              <div class="text-[13px] font-medium text-text group-hover:text-accent flex items-center gap-1.5">
                Criar tarefa
                <i class="fa-solid fa-arrow-right text-[11px]"></i>
              </div>
              <span class="kbd-pill">M</span>
            </div>
          </button>

          <button
            type="button"
            class="relative overflow-hidden bg-bg-elev border border-border rounded-lg p-6 cursor-pointer text-left flex flex-col gap-3.5 hover:border-accent hover:bg-[#16181c] transition-colors group"
            data-testid="mode-jarvis-btn"
            (click)="avisoJarvis()"
            [style.background-image]="'radial-gradient(ellipse 80% 60% at 100% 0%, rgba(94, 106, 210, 0.08), transparent)'"
          >
            <div class="flex items-center justify-between gap-3 relative">
              <div
                class="w-9 h-9 rounded-lg bg-accent/15 border border-accent/30 grid place-items-center text-accent text-[15px]"
              >
                <i class="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <span
                class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent/15 text-accent tracking-wider"
                >EM BREVE</span
              >
            </div>
            <div class="text-base font-semibold tracking-tight text-accent">Jarvis</div>
            <div class="text-[13px] text-text-dim leading-relaxed">
              Me conta em texto livre o que você precisa fazer. Eu categorizo, defino prazo e te
              mando pra revisão.
            </div>
            <div
              class="flex items-center justify-between mt-1.5 pt-3.5 border-t border-border"
            >
              <div class="text-[13px] font-medium text-text-dim flex items-center gap-1.5">
                Disponível em breve
              </div>
              <span class="kbd-pill">J</span>
            </div>
          </button>
        </div>

        <div class="flex items-center gap-2.5 text-text-subtle text-xs" data-testid="keyboard-hint">
          <i class="fa-solid fa-keyboard"></i>
          <span>Use <span class="kbd-pill">M</span> pra abrir o modo manual.</span>
        </div>

        @if (avisoIa()) {
          <div
            class="fixed bottom-6 right-6 bg-bg-elev border border-border rounded px-4 py-3 text-[13px] text-text-dim shadow-lg max-w-xs"
            data-testid="aviso-ia"
          >
            Modo Jarvis (IA) ainda não está disponível. Por enquanto, usa o modo Manual.
          </div>
        }
      </div>
    </div>

    @if (modo() === 'manual') {
      <app-tarefa-form
        (salvo)="aposSalvar()"
        (cancelado)="modo.set(null)"
      ></app-tarefa-form>
    }
  `,
  styles: [
    `
      .kbd-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 5px;
        border: 1px solid #2a2b2f;
        border-radius: 4px;
        background: #16181c;
        font-family: 'SF Mono', ui-monospace, monospace;
        font-size: 11px;
        color: #8a8f98;
      }
    `,
  ],
})
export class CapturaComponent {
  private readonly storage = inject(TokenStorage);
  private readonly router = inject(Router);

  readonly modo = signal<Modo>(null);
  readonly avisoIa = signal(false);
  readonly nomeUsuario = signal(this.storage.usuario()?.nome ?? '');

  saudacao(): string {
    const h = new Date().getHours();
    if (h < 6) return 'Boa madrugada';
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  abrirManual(): void {
    this.modo.set('manual');
  }

  avisoJarvis(): void {
    this.avisoIa.set(true);
    setTimeout(() => this.avisoIa.set(false), 3500);
  }

  aposSalvar(): void {
    this.modo.set(null);
  }

  @HostListener('window:keydown', ['$event'])
  onKey(ev: KeyboardEvent): void {
    if (this.modo() !== null) return;
    const tag = (ev.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (ev.key === 'm' || ev.key === 'M') {
      ev.preventDefault();
      this.abrirManual();
    } else if (ev.key === 'j' || ev.key === 'J') {
      ev.preventDefault();
      this.avisoJarvis();
    }
  }
}
