import { Component, Input, computed, inject, signal } from '@angular/core';
import { LocaleService } from '../core/locale/locale.service';

export interface RequisitosSenha {
  tamanho: boolean;
  maiuscula: boolean;
  especial: boolean;
}

export function avaliarSenha(senha: string): RequisitosSenha {
  return {
    tamanho: senha.length >= 8,
    maiuscula: /[A-Z]/.test(senha),
    especial: /[^A-Za-z0-9]/.test(senha),
  };
}

export function senhaAtendeRequisitos(senha: string): boolean {
  const r = avaliarSenha(senha);
  return r.tamanho && r.maiuscula && r.especial;
}

@Component({
  selector: 'app-password-requirements',
  standalone: true,
  template: `
    <ul
      class="flex flex-col gap-1 text-[11px]"
      [attr.data-testid]="testid"
      [attr.aria-label]="locale.t('password_req.aria')"
    >
      <li
        class="flex items-center gap-2 transition-colors"
        [class.text-emerald-400]="reqs().tamanho"
        [class.text-text-subtle]="!reqs().tamanho"
        [attr.data-testid]="testid + '-tamanho'"
        [attr.data-met]="reqs().tamanho"
      >
        @if (reqs().tamanho) {
          <i class="fa-solid fa-check w-3 text-center"></i>
        } @else {
          <i class="fa-solid fa-circle text-[5px] w-3 text-center"></i>
        }
        {{ locale.t('password_req.length') }}
      </li>
      <li
        class="flex items-center gap-2 transition-colors"
        [class.text-emerald-400]="reqs().maiuscula"
        [class.text-text-subtle]="!reqs().maiuscula"
        [attr.data-testid]="testid + '-maiuscula'"
        [attr.data-met]="reqs().maiuscula"
      >
        @if (reqs().maiuscula) {
          <i class="fa-solid fa-check w-3 text-center"></i>
        } @else {
          <i class="fa-solid fa-circle text-[5px] w-3 text-center"></i>
        }
        {{ locale.t('password_req.uppercase') }}
      </li>
      <li
        class="flex items-center gap-2 transition-colors"
        [class.text-emerald-400]="reqs().especial"
        [class.text-text-subtle]="!reqs().especial"
        [attr.data-testid]="testid + '-especial'"
        [attr.data-met]="reqs().especial"
      >
        @if (reqs().especial) {
          <i class="fa-solid fa-check w-3 text-center"></i>
        } @else {
          <i class="fa-solid fa-circle text-[5px] w-3 text-center"></i>
        }
        {{ locale.t('password_req.special') }}
      </li>
    </ul>
  `,
})
export class PasswordRequirementsComponent {
  readonly locale = inject(LocaleService);
  private readonly senhaSignal = signal('');

  @Input() set senha(v: string) {
    this.senhaSignal.set(v ?? '');
  }
  @Input() testid = 'password-requirements';

  readonly reqs = computed(() => avaliarSenha(this.senhaSignal()));
}
