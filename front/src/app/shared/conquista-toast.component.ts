import { Component, computed, inject } from '@angular/core';
import { LocaleService } from '../core/locale/locale.service';
import { ConquistaToastService } from './conquista-toast.service';

@Component({
  selector: 'app-conquista-toast',
  standalone: true,
  template: `
    @if (toast.atual(); as c) {
      <div
        class="fixed top-4 right-4 left-4 sm:left-auto sm:w-[360px] z-[100] animate-fade-down"
        data-testid="conquista-toast"
        role="status"
        aria-live="polite"
      >
        <div
          class="card-elev p-4 flex items-start gap-3 relative overflow-hidden"
          [style.background]="bgGradient()"
        >
          <div
            class="w-12 h-12 rounded-xl grid place-items-center shrink-0"
            [class]="iconeBg()"
          >
            <i [class]="'fa-solid ' + c.icone + ' text-[18px] ' + iconeCor()"></i>
          </div>
          <div class="flex flex-col gap-0.5 flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <i class="fa-solid fa-trophy text-amber-400 text-[10px]"></i>
              <span class="text-[10px] uppercase tracking-wider text-text-subtle font-semibold">
                {{ locale.t('toast.conquista_desbloqueada') }}
              </span>
            </div>
            <h4 class="text-[14px] font-semibold leading-tight">{{ c.nome }}</h4>
            <p class="text-[12px] text-text-dim leading-snug">{{ c.descricao }}</p>
          </div>
          <button
            type="button"
            class="text-text-subtle hover:text-text p-1 -mr-1 -mt-1"
            data-testid="conquista-toast-fechar"
            [attr.aria-label]="locale.t('toast.fechar')"
            (click)="toast.fechar()"
          >
            <i class="fa-solid fa-xmark text-[12px]"></i>
          </button>
        </div>
      </div>
    }
  `,
})
export class ConquistaToastComponent {
  readonly toast = inject(ConquistaToastService);
  readonly locale = inject(LocaleService);

  readonly bgGradient = computed(() => {
    const c = this.toast.atual();
    if (!c) return 'transparent';
    const map: Record<ConquistaToastBg, string> = {
      amber: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(245, 158, 11, 0.15), transparent 70%)',
      emerald: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(16, 185, 129, 0.15), transparent 70%)',
      sky: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(14, 165, 233, 0.15), transparent 70%)',
      violet: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(139, 92, 246, 0.15), transparent 70%)',
      rose: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(244, 63, 94, 0.15), transparent 70%)',
      orange: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(249, 115, 22, 0.15), transparent 70%)',
    };
    return map[c.cor];
  });

  readonly iconeBg = computed(() => {
    const c = this.toast.atual();
    if (!c) return '';
    const map: Record<ConquistaToastBg, string> = {
      amber: 'bg-amber-500/20 border border-amber-500/40',
      emerald: 'bg-emerald-500/20 border border-emerald-500/40',
      sky: 'bg-sky-500/20 border border-sky-500/40',
      violet: 'bg-violet-500/20 border border-violet-500/40',
      rose: 'bg-rose-500/20 border border-rose-500/40',
      orange: 'bg-orange-500/20 border border-orange-500/40',
    };
    return map[c.cor];
  });

  readonly iconeCor = computed(() => {
    const c = this.toast.atual();
    if (!c) return '';
    const map: Record<ConquistaToastBg, string> = {
      amber: 'text-amber-400',
      emerald: 'text-emerald-400',
      sky: 'text-sky-400',
      violet: 'text-violet-400',
      rose: 'text-rose-400',
      orange: 'text-orange-400',
    };
    return map[c.cor];
  });
}

type ConquistaToastBg = 'amber' | 'emerald' | 'sky' | 'violet' | 'rose' | 'orange';
