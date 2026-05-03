import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TarefasService } from '../core/api/tarefas.service';
import { AuthService } from '../core/auth/auth.service';
import { TokenStorage } from '../core/auth/token.storage';
import { AvatarComponent } from '../shared/avatar.component';
import { BrandComponent } from '../shared/brand.component';
import { ThemeService } from '../core/theme/theme.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AvatarComponent, BrandComponent],
  template: `
    <div
      class="flex flex-col min-h-screen bg-bg text-text md:grid"
      [class.md:grid-cols-[244px_1fr]]="!sidebarCollapsed()"
      [class.md:grid-cols-[56px_1fr]]="sidebarCollapsed()"
    >
      <header
        class="md:hidden flex items-center justify-between h-12 px-4 border-b border-border bg-bg-sidebar"
        data-testid="mobile-topbar"
      >
        <div class="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Liriun"
            class="w-7 h-7 rounded-md object-contain shadow-logo"
            aria-hidden="true"
          />
          <div class="text-[13px] font-semibold tracking-tight"><app-brand /></div>
        </div>
        <button
          type="button"
          class="flex items-center gap-2 text-text-dim hover:text-text text-xs px-2 py-1 transition-colors"
          data-testid="mobile-logout"
          (click)="sair()"
        >
          <app-avatar
            [nome]="storage.usuario()?.nome ?? ''"
            [fotoUrl]="storage.usuario()?.fotoUrl ?? null"
            [size]="22"
          />
          <span>{{ storage.usuario()?.nome }}</span>
          <i class="fa-solid fa-right-from-bracket text-[11px]"></i>
        </button>
      </header>

      <aside
        class="hidden md:flex bg-bg-sidebar border-r border-border flex-col p-3 relative transition-[width] duration-200"
        [class.items-center]="sidebarCollapsed()"
        data-testid="sidebar"
        style="background-image: radial-gradient(ellipse 70% 30% at 50% 0%, rgba(94, 106, 210, 0.08), transparent);"
      >
        @if (!sidebarCollapsed()) {
          <div class="flex items-center mb-3 justify-between">
            <a
              routerLink="/app/visao-geral"
              class="flex items-center gap-2.5 px-1 py-1 rounded-md hover:bg-bg-elev/60 transition-colors flex-1 min-w-0"
              data-testid="sidebar-logo"
              aria-label="Ir pra visão geral"
              title="Visão geral"
            >
              <img
                src="/logo.png"
                alt="Liriun"
                class="w-8 h-8 rounded-lg object-contain shadow-logo shrink-0"
                aria-hidden="true"
              />
              <div class="flex flex-col leading-tight">
                <div class="text-[14px] font-semibold tracking-tight"><app-brand /></div>
              </div>
            </a>
            <button
              type="button"
              class="p-1.5 text-text-subtle hover:text-text hover:bg-bg-elev rounded transition-colors"
              data-testid="sidebar-toggle"
              title="Esconder barra lateral"
              aria-label="Esconder barra lateral"
              (click)="alternarSidebar()"
            >
              <i class="fa-solid fa-angles-left text-[12px]"></i>
            </button>
          </div>
        } @else {
          <button
            type="button"
            class="w-8 h-8 rounded-md grid place-items-center text-text-subtle hover:text-text hover:bg-bg-elev shrink-0 mb-2 transition-colors"
            data-testid="sidebar-toggle"
            title="Expandir barra lateral"
            aria-label="Expandir barra lateral"
            (click)="alternarSidebar()"
          >
            <i class="fa-solid fa-angles-right text-[12px]"></i>
          </button>
          <a
            routerLink="/app/visao-geral"
            class="w-8 h-8 rounded-lg shadow-logo shrink-0 mb-3 transition-transform hover:scale-105 overflow-hidden block"
            data-testid="sidebar-logo"
            aria-label="Ir pra visão geral"
            title="Visão geral"
          >
            <img src="/logo.png" alt="Liriun" class="w-full h-full object-contain" />
          </a>
        }

        @if (!sidebarCollapsed()) {
          <div
            class="text-[10px] text-text-subtle px-2 py-1.5 tracking-wider uppercase font-semibold"
          >
            Início
          </div>
        }
        <nav class="flex flex-col gap-px" [class.items-center]="sidebarCollapsed()">
          <a
            routerLink="/app/visao-geral"
            routerLinkActive="nav-link-active"
            class="nav-link"
            [class.nav-link-collapsed]="sidebarCollapsed()"
            data-testid="nav-visao-geral"
            [title]="sidebarCollapsed() ? 'Visão geral' : null"
          >
            <i class="fa-solid fa-house nav-icon"></i>
            @if (!sidebarCollapsed()) {
              <span class="flex-1">Visão geral</span>
            }
          </a>
        </nav>

        @if (!sidebarCollapsed()) {
          <div
            class="text-[10px] text-text-subtle px-2 py-1.5 tracking-wider uppercase font-semibold mt-4"
          >
            Minhas tarefas
          </div>
        }
        <nav class="flex flex-col gap-px" [class.items-center]="sidebarCollapsed()" [class.mt-4]="sidebarCollapsed()">
          <a
            routerLink="/app/captura"
            routerLinkActive="nav-link-active"
            class="nav-link"
            [class.nav-link-collapsed]="sidebarCollapsed()"
            data-testid="nav-captura"
            [title]="sidebarCollapsed() ? 'Nova tarefa' : null"
          >
            <i class="fa-solid fa-bolt nav-icon"></i>
            @if (!sidebarCollapsed()) {
              <span class="flex-1">Nova tarefa</span>
            }
          </a>
          <a
            routerLink="/app/tarefas"
            routerLinkActive="nav-link-active"
            class="nav-link"
            [class.nav-link-collapsed]="sidebarCollapsed()"
            data-testid="nav-tarefas"
            [title]="sidebarCollapsed() ? 'Tarefas' : null"
          >
            <i class="fa-solid fa-list-check nav-icon"></i>
            @if (!sidebarCollapsed()) {
              <span class="flex-1">Tarefas</span>
              <span class="flex items-center gap-1">
                @if (atrasadasCount() > 0) {
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold tabular-nums min-w-[18px] text-center bg-danger/15 text-danger border border-danger/30"
                    data-testid="nav-tarefas-badge-atrasadas"
                    [title]="atrasadasCount() + ' atrasadas'"
                  >
                    {{ atrasadasCount() }}
                  </span>
                }
                @if (pendentesCount() > 0) {
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold tabular-nums min-w-[18px] text-center bg-bg-elev text-text-dim border border-border"
                    data-testid="nav-tarefas-badge"
                    [title]="pendentesCount() + ' pendentes no total'"
                  >
                    {{ pendentesCount() }}
                  </span>
                }
              </span>
            }
          </a>
          <a
            routerLink="/app/concluidas"
            routerLinkActive="nav-link-active"
            class="nav-link"
            [class.nav-link-collapsed]="sidebarCollapsed()"
            data-testid="nav-concluidas"
            [title]="sidebarCollapsed() ? 'Concluídas' : null"
          >
            <i class="fa-solid fa-circle-check nav-icon"></i>
            @if (!sidebarCollapsed()) {
              <span class="flex-1">Concluídas</span>
            }
          </a>
        </nav>

        @if (!sidebarCollapsed()) {
          <div
            class="text-[10px] text-text-subtle px-2 py-1.5 tracking-wider uppercase font-semibold mt-5"
          >
            Ajustes
          </div>
        }
        <nav class="flex flex-col gap-px" [class.items-center]="sidebarCollapsed()" [class.mt-4]="sidebarCollapsed()">
          <a
            routerLink="/app/configuracoes"
            routerLinkActive="nav-link-active"
            class="nav-link"
            [class.nav-link-collapsed]="sidebarCollapsed()"
            data-testid="nav-configs"
            [title]="sidebarCollapsed() ? 'Configurações' : null"
          >
            <i class="fa-solid fa-gear nav-icon"></i>
            @if (!sidebarCollapsed()) {
              <span class="flex-1">Configurações</span>
            }
          </a>
        </nav>

        <div class="mt-auto pt-3 w-full">
          @if (!sidebarCollapsed()) {
            <button
              type="button"
              class="w-full flex items-center justify-center gap-2 px-3 py-1.5 mb-2 rounded-md text-[12px] text-text-dim hover:text-text border border-border hover:border-border-strong bg-bg-elev/30 hover:bg-bg-elev transition-colors"
              data-testid="theme-toggle"
              [title]="theme.theme() === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
              [attr.aria-label]="theme.theme() === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
              (click)="theme.alternar()"
            >
              <i [class]="theme.theme() === 'dark' ? 'fa-solid fa-sun text-[11px]' : 'fa-solid fa-moon text-[11px]'"></i>
              <span>{{ theme.theme() === 'dark' ? 'Tema claro' : 'Tema escuro' }}</span>
            </button>
            <div
              class="border border-border rounded-lg bg-bg-elev/50 hover:bg-bg-elev transition-colors group overflow-hidden"
              data-testid="user-menu"
            >
              <div class="flex items-center gap-2.5 px-2.5 py-2">
                <app-avatar
                  [nome]="storage.usuario()?.nome ?? ''"
                  [fotoUrl]="storage.usuario()?.fotoUrl ?? null"
                  [size]="32"
                />
                <div class="flex-1 min-w-0 leading-tight">
                  <div
                    class="text-[12.5px] font-medium truncate"
                    [title]="storage.usuario()?.nome"
                  >
                    {{ storage.usuario()?.nome }}
                  </div>
                  <div
                    class="text-[10.5px] text-text-subtle truncate"
                    [title]="storage.usuario()?.email"
                  >
                    {{ storage.usuario()?.email }}
                  </div>
                </div>
                <button
                  type="button"
                  class="p-1.5 text-text-subtle hover:text-danger hover:bg-danger/10 rounded transition-colors"
                  data-testid="user-logout"
                  title="Sair"
                  aria-label="Sair"
                  (click)="sair()"
                >
                  <i class="fa-solid fa-right-from-bracket text-[11px]"></i>
                </button>
              </div>
            </div>
            <div
              class="text-[9.5px] text-text-subtle text-center mt-2 tracking-wider uppercase font-medium"
            >
              v1 · <app-brand />
            </div>
          } @else {
            <div class="flex flex-col items-center gap-2">
              <button
                type="button"
                class="p-1.5 text-text-subtle hover:text-text rounded transition-colors"
                data-testid="theme-toggle"
                [title]="theme.theme() === 'dark' ? 'Tema claro' : 'Tema escuro'"
                [attr.aria-label]="theme.theme() === 'dark' ? 'Tema claro' : 'Tema escuro'"
                (click)="theme.alternar()"
              >
                <i [class]="theme.theme() === 'dark' ? 'fa-solid fa-sun text-[12px]' : 'fa-solid fa-moon text-[12px]'"></i>
              </button>
              <app-avatar
                [nome]="storage.usuario()?.nome ?? ''"
                [fotoUrl]="storage.usuario()?.fotoUrl ?? null"
                [size]="30"
              />
              <button
                type="button"
                class="p-1.5 text-text-subtle hover:text-danger hover:bg-danger/10 rounded transition-colors"
                data-testid="user-logout"
                title="Sair"
                aria-label="Sair"
                (click)="sair()"
              >
                <i class="fa-solid fa-right-from-bracket text-[11px]"></i>
              </button>
            </div>
          }
        </div>
      </aside>

      <main class="flex flex-col min-w-0 flex-1 pb-16 md:pb-0">
        <router-outlet></router-outlet>
      </main>

      <nav
        class="md:hidden fixed bottom-0 inset-x-0 grid grid-cols-5 h-16 bg-bg-sidebar border-t border-border z-40"
        data-testid="mobile-bottom-nav"
      >
        <a
          routerLink="/app/visao-geral"
          routerLinkActive="text-accent [&>i]:text-accent"
          class="flex flex-col items-center justify-center gap-0.5 text-text-dim active:bg-bg-elev"
          data-testid="nav-mobile-visao-geral"
        >
          <i class="fa-solid fa-house text-base"></i>
          <span class="text-[10px] font-medium">Início</span>
        </a>
        <a
          routerLink="/app/captura"
          routerLinkActive="text-accent [&>i]:text-accent"
          class="flex flex-col items-center justify-center gap-0.5 text-text-dim active:bg-bg-elev"
          data-testid="nav-mobile-captura"
        >
          <i class="fa-solid fa-bolt text-base"></i>
          <span class="text-[10px] font-medium">Nova</span>
        </a>
        <a
          routerLink="/app/tarefas"
          routerLinkActive="text-accent [&>i]:text-accent"
          class="flex flex-col items-center justify-center gap-0.5 text-text-dim active:bg-bg-elev relative"
          data-testid="nav-mobile-tarefas"
        >
          <i class="fa-solid fa-list-check text-base"></i>
          <span class="text-[10px] font-medium">Tarefas</span>
          @if (atrasadasCount() > 0) {
            <span
              class="absolute top-1 right-1/2 translate-x-5 text-[9px] px-1 py-0 rounded-full font-bold tabular-nums min-w-[16px] text-center leading-tight bg-danger text-white"
              [title]="atrasadasCount() + ' atrasadas'"
            >
              {{ atrasadasCount() }}
            </span>
          }
          @if (pendentesCount() > 0) {
            <span
              class="absolute top-2 right-1/2 translate-x-3 text-[9px] px-1 py-0 rounded-full font-bold tabular-nums min-w-[16px] text-center leading-tight bg-accent text-white"
            >
              {{ pendentesCount() }}
            </span>
          }
        </a>
        <a
          routerLink="/app/concluidas"
          routerLinkActive="text-accent [&>i]:text-accent"
          class="flex flex-col items-center justify-center gap-0.5 text-text-dim active:bg-bg-elev"
          data-testid="nav-mobile-concluidas"
        >
          <i class="fa-solid fa-circle-check text-base"></i>
          <span class="text-[10px] font-medium">Concluídas</span>
        </a>
        <a
          routerLink="/app/configuracoes"
          routerLinkActive="text-accent [&>i]:text-accent"
          class="flex flex-col items-center justify-center gap-0.5 text-text-dim active:bg-bg-elev"
          data-testid="nav-mobile-configs"
        >
          <i class="fa-solid fa-gear text-base"></i>
          <span class="text-[10px] font-medium">Ajustes</span>
        </a>
      </nav>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .nav-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 10px;
        border-radius: 6px;
        color: rgb(var(--c-text-dim));
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition:
          background-color 220ms cubic-bezier(0.22, 1, 0.36, 1),
          color 220ms cubic-bezier(0.22, 1, 0.36, 1),
          transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
        position: relative;
      }
      :host ::ng-deep .nav-link:hover {
        background: rgb(var(--c-surface));
        color: rgb(var(--c-text));
        transform: translateX(2px);
      }
      :host ::ng-deep .nav-link:hover .nav-icon {
        color: rgb(var(--c-text));
      }
      :host ::ng-deep .nav-icon {
        width: 14px;
        font-size: 12px;
        text-align: center;
        color: rgb(var(--c-text-dim));
        transition: color 220ms cubic-bezier(0.22, 1, 0.36, 1), transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      :host ::ng-deep .nav-link:hover .nav-icon {
        transform: scale(1.08);
      }
      :host ::ng-deep .nav-link-active {
        background: linear-gradient(
          90deg,
          rgba(94, 106, 210, 0.14) 0%,
          rgba(94, 106, 210, 0.04) 100%
        );
        color: rgb(var(--c-text));
      }
      :host ::ng-deep .nav-link-active .nav-icon {
        color: #5e6ad2;
      }
      :host ::ng-deep .nav-link-active::before {
        content: '';
        position: absolute;
        left: -3px;
        top: 6px;
        bottom: 6px;
        width: 2px;
        background: #5e6ad2;
        border-radius: 0 2px 2px 0;
      }
      :host ::ng-deep .nav-link-collapsed {
        width: 36px;
        height: 36px;
        padding: 0;
        justify-content: center;
        gap: 0;
      }
      :host ::ng-deep .nav-link-collapsed:hover {
        transform: none;
      }
      .shadow-logo {
        box-shadow: 0 0 16px rgba(94, 106, 210, 0.35),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
    `,
  ],
})
export class ShellComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly tarefasApi = inject(TarefasService);
  readonly storage = inject(TokenStorage);
  readonly theme = inject(ThemeService);

  readonly pendentesCount = signal(0);
  readonly atrasadasCount = signal(0);
  readonly sidebarCollapsed = signal(this.lerEstadoSidebar());

  private static readonly STORAGE_SIDEBAR = 'jarvis-sidebar-collapsed';

  ngOnInit(): void {
    this.atualizarContagem();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.atualizarContagem());
  }

  sair(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }

  alternarSidebar(): void {
    const novo = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(novo);
    try {
      localStorage.setItem(ShellComponent.STORAGE_SIDEBAR, novo ? '1' : '0');
    } catch {
      /* storage indisponível */
    }
  }

  private lerEstadoSidebar(): boolean {
    try {
      return localStorage.getItem(ShellComponent.STORAGE_SIDEBAR) === '1';
    } catch {
      return false;
    }
  }

  private atualizarContagem(): void {
    if (!this.storage.estaAutenticado()) return;
    this.tarefasApi.listarPendentes().subscribe({
      next: (lista) => {
        this.pendentesCount.set(lista.length);
        this.atrasadasCount.set(lista.filter((t) => t.status === 3).length);
      },
      error: () => {
        /* não-bloqueante */
      },
    });
  }
}
