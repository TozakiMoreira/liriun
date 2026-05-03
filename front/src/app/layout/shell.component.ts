import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TarefasService } from '../core/api/tarefas.service';
import { AuthService } from '../core/auth/auth.service';
import { TokenStorage } from '../core/auth/token.storage';
import { PageHeaderService } from '../core/layout/page-header.service';
import { AvatarComponent } from '../shared/avatar.component';
import { BrandComponent } from '../shared/brand.component';
import { ThemeToggleComponent } from '../shared/theme-toggle.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AvatarComponent, BrandComponent, ThemeToggleComponent],
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
        <a
          routerLink="/"
          class="flex items-center gap-2 hover:opacity-80 transition-opacity"
          data-testid="mobile-logo-home"
          aria-label="Ir pra página inicial"
        >
          <img
            src="/logo.png"
            alt="Liriun"
            class="w-9 h-9 object-contain"
            aria-hidden="true"
          />
          <div class="text-[13px] font-semibold tracking-tight"><app-brand /></div>
        </a>
        <div class="flex items-center gap-2">
          <app-theme-toggle [mostrarLabel]="false" />
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
            <span class="max-w-[80px] truncate">{{ storage.usuario()?.nome }}</span>
            <i class="fa-solid fa-right-from-bracket text-[11px]"></i>
          </button>
        </div>
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
                class="w-10 h-10 object-contain shrink-0"
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
            class="w-10 h-10 shrink-0 mb-3 transition-transform hover:scale-105 block"
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

        <div class="mt-auto pt-3 w-full" [class.flex]="sidebarCollapsed()" [class.flex-col]="sidebarCollapsed()" [class.items-center]="sidebarCollapsed()">
          @if (!sidebarCollapsed()) {
            <div
              class="text-[10px] text-text-subtle px-2 py-1.5 tracking-wider uppercase font-semibold"
            >
              Ajustes
            </div>
          }
          <nav class="flex flex-col gap-px" [class.items-center]="sidebarCollapsed()">
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

          @if (!sidebarCollapsed()) {
            <div
              class="pt-3 text-[9.5px] text-text-subtle text-center tracking-wider uppercase font-medium"
            >
              V1 · <app-brand />
            </div>
          }
        </div>
      </aside>

      <main class="flex flex-col min-w-0 flex-1 pb-16 md:pb-0">
        <header
          class="hidden md:flex items-center gap-3 h-14 px-4 md:px-8 border-b border-border bg-bg-sidebar/60 backdrop-blur-sm sticky top-0 z-30"
          data-testid="shell-topbar"
        >
          <div class="flex items-center gap-2 min-w-0">
            @if (header.voltar(); as v) {
              <button
                type="button"
                class="group inline-flex items-center justify-center w-8 h-8 rounded-md text-text-dim bg-bg-elev border border-border hover:text-text hover:border-border-strong active:scale-95 transition-all mr-1"
                [attr.data-testid]="v.testid ?? 'header-voltar'"
                [attr.aria-label]="v.aria ?? 'Voltar'"
                [attr.title]="v.aria ?? 'Voltar'"
                (click)="v.acao()"
              >
                <i class="fa-solid fa-arrow-left text-[13px] transition-transform group-hover:-translate-x-0.5"></i>
              </button>
            }
            @if (header.iconeClasse(); as ic) {
              <i [class]="ic" [style.color]="header.iconeCor()"></i>
            }
            <strong class="text-[15px] font-semibold text-text truncate">
              {{ header.titulo() }}
            </strong>
            @if (header.subtituloTpl(); as t) {
              <ng-container *ngTemplateOutlet="t"></ng-container>
            }
          </div>

          <div class="flex items-center gap-2 ml-auto min-w-0 flex-wrap justify-end">
            @if (header.acoesTpl(); as t) {
              <ng-container *ngTemplateOutlet="t"></ng-container>
            }
          </div>

          <div class="flex items-center gap-3 pl-3 ml-1 border-l border-border shrink-0">
          <app-theme-toggle />

          <div
            class="relative"
            data-testid="user-menu"
            (click)="$event.stopPropagation()"
          >
            <button
              type="button"
              class="flex items-center gap-2.5 pr-2 pl-1 py-1 rounded-full border border-border hover:border-border-strong hover:bg-bg-elev/60 transition-colors"
              data-testid="user-menu-trigger"
              [attr.aria-expanded]="userMenuAberto()"
              aria-haspopup="true"
              (click)="alternarUserMenu()"
            >
              <app-avatar
                [nome]="storage.usuario()?.nome ?? ''"
                [fotoUrl]="storage.usuario()?.fotoUrl ?? null"
                [size]="28"
              />
              <span class="text-[13px] font-medium text-text max-w-[140px] truncate">
                {{ storage.usuario()?.nome || 'Conta' }}
              </span>
              <i
                class="fa-solid fa-chevron-down text-[9px] text-text-subtle transition-transform"
                [class.rotate-180]="userMenuAberto()"
              ></i>
            </button>

            @if (userMenuAberto()) {
              <div
                class="absolute right-0 top-full mt-2 w-[240px] card-elev p-1.5 z-50 flex flex-col gap-px"
                role="menu"
                data-testid="user-menu-pop"
              >
                <div class="px-2.5 py-2 border-b border-border mb-1 flex flex-col leading-tight">
                  <span class="text-[12.5px] font-medium truncate">{{ storage.usuario()?.nome }}</span>
                  <span class="text-[11px] text-text-subtle truncate">{{ storage.usuario()?.email }}</span>
                </div>
                <a
                  routerLink="/"
                  class="flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] text-text-dim hover:text-text hover:bg-bg-elev"
                  data-testid="user-menu-home"
                  (click)="fecharUserMenu()"
                >
                  <i class="fa-solid fa-house text-[12px] w-4 text-center"></i>
                  Página inicial
                </a>
                <a
                  routerLink="/sobre"
                  class="flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] text-text-dim hover:text-text hover:bg-bg-elev"
                  data-testid="user-menu-sobre"
                  (click)="fecharUserMenu()"
                >
                  <i class="fa-solid fa-circle-info text-[12px] w-4 text-center"></i>
                  Sobre o Liriun
                </a>
                <div class="h-px bg-border my-1"></div>
                <a
                  routerLink="/app/configuracoes"
                  class="flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] text-text-dim hover:text-text hover:bg-bg-elev"
                  data-testid="user-menu-configs"
                  (click)="fecharUserMenu()"
                >
                  <i class="fa-solid fa-gear text-[12px] w-4 text-center"></i>
                  Configurações
                </a>
                <button
                  type="button"
                  class="flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] text-text-dim hover:text-danger hover:bg-danger/10 text-left"
                  data-testid="user-menu-sair"
                  (click)="sair(); fecharUserMenu()"
                >
                  <i class="fa-solid fa-right-from-bracket text-[12px] w-4 text-center"></i>
                  Sair
                </button>
              </div>
            }
          </div>
          </div>
        </header>

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
  readonly header = inject(PageHeaderService);

  readonly pendentesCount = signal(0);
  readonly atrasadasCount = signal(0);
  readonly sidebarCollapsed = signal(this.lerEstadoSidebar());
  readonly userMenuAberto = signal(false);

  alternarUserMenu(): void {
    this.userMenuAberto.update((v) => !v);
  }

  fecharUserMenu(): void {
    this.userMenuAberto.set(false);
  }

  @HostListener('document:click')
  fecharUserMenuPorClique(): void {
    if (this.userMenuAberto()) this.userMenuAberto.set(false);
  }

  @HostListener('document:keydown.escape')
  fecharUserMenuPorEsc(): void {
    if (this.userMenuAberto()) this.userMenuAberto.set(false);
  }

  private static readonly STORAGE_SIDEBAR = 'liriun-sidebar-collapsed';

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
