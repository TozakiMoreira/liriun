import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TokenStorage } from '../core/auth/token.storage';
import { LocaleService } from '../core/locale/locale.service';
import { AvatarComponent } from './avatar.component';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [RouterLink, AvatarComponent],
  template: `
    @if (!storage.usuario()) {
      <div class="flex items-center gap-1 sm:gap-1.5">
        <a
          routerLink="/login"
          class="hidden sm:inline-flex text-[12px] font-medium px-3 h-8 rounded border border-border bg-bg-elev text-text-dim hover:text-text hover:border-border-strong items-center transition-colors whitespace-nowrap"
          data-testid="header-entrar"
        >{{ locale.t('header.signin') }}</a>
        <a
          routerLink="/cadastro"
          class="text-[12px] font-semibold h-8 w-8 sm:w-auto sm:px-3 rounded-full sm:rounded bg-accent text-white hover:bg-accent-hover flex items-center justify-center sm:gap-1.5 transition-colors whitespace-nowrap leading-none"
          data-testid="header-cadastrar"
          [attr.aria-label]="locale.t('header.create_account')"
          [title]="locale.t('header.create_account')"
        >
          <i class="fa-solid fa-arrow-right text-[11px] sm:hidden"></i>
          <span class="hidden sm:inline">{{ locale.t('header.signup_short') }}</span>
        </a>
      </div>
    }
    @if (storage.usuario(); as usuario) {
      <div
        class="relative"
        data-testid="user-menu-shared"
        (click)="$event.stopPropagation()"
      >
        <button
          type="button"
          class="flex items-center gap-2 pr-2 pl-1 py-1 rounded-full border border-border hover:border-border-strong hover:bg-bg-elev/60 transition-colors"
          [attr.aria-expanded]="aberto()"
          aria-haspopup="true"
          (click)="toggle()"
        >
          <app-avatar
            [nome]="usuario.nome"
            [fotoUrl]="usuario.fotoUrl ?? null"
            [size]="26"
          />
          <span class="hidden sm:inline text-[12px] font-medium text-text max-w-[120px] truncate">
            {{ usuario.nome }}
          </span>
          <i
            class="fa-solid fa-chevron-down text-[8px] text-text-subtle transition-transform"
            [class.rotate-180]="aberto()"
          ></i>
        </button>

        @if (aberto()) {
          <div
            class="absolute right-0 top-full mt-2 w-[240px] card-elev p-1.5 z-50 flex flex-col gap-px"
            role="menu"
          >
            <div class="px-2.5 py-2 border-b border-border mb-1 flex flex-col leading-tight">
              <span class="text-[12.5px] font-medium truncate">{{ usuario.nome }}</span>
              <span class="text-[11px] text-text-subtle truncate">{{ usuario.email }}</span>
            </div>
            <a
              routerLink="/app/visao-geral"
              class="flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] text-text-dim hover:text-text hover:bg-bg-elev"
              (click)="fechar()"
            >
              <i class="fa-solid fa-house text-[12px] w-4 text-center"></i>
              {{ locale.t('usermenu.back_to_app') }}
            </a>
            <a
              routerLink="/app/configuracoes"
              class="flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] text-text-dim hover:text-text hover:bg-bg-elev"
              (click)="fechar()"
            >
              <i class="fa-solid fa-gear text-[12px] w-4 text-center"></i>
              {{ locale.t('usermenu.settings') }}
            </a>
            <button
              type="button"
              class="flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] text-text-dim hover:text-danger hover:bg-danger/10 text-left"
              (click)="sair()"
            >
              <i class="fa-solid fa-right-from-bracket text-[12px] w-4 text-center"></i>
              {{ locale.t('usermenu.signout') }}
            </button>
          </div>
        }
      </div>
    }
  `,
})
export class UserMenuComponent {
  readonly storage = inject(TokenStorage);
  readonly locale = inject(LocaleService);
  private readonly router = inject(Router);

  readonly aberto = signal(false);

  toggle(): void {
    this.aberto.update((v) => !v);
  }

  fechar(): void {
    this.aberto.set(false);
  }

  sair(): void {
    this.fechar();
    this.storage.clear();
    this.router.navigateByUrl('/');
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.aberto()) this.fechar();
  }
}
