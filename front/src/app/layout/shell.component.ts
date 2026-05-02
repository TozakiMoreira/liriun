import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TarefasService } from '../core/api/tarefas.service';
import { AuthService } from '../core/auth/auth.service';
import { TokenStorage } from '../core/auth/token.storage';
import { AvatarComponent } from '../shared/avatar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AvatarComponent],
  template: `
    <div class="flex flex-col md:grid md:grid-cols-[244px_1fr] min-h-screen bg-bg text-text">
      <header
        class="md:hidden flex items-center justify-between h-12 px-4 border-b border-border bg-[#0b0c0e]"
        data-testid="mobile-topbar"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-7 h-7 rounded-md bg-logo-grad grid place-items-center text-xs font-bold tracking-tight shadow-logo"
            aria-hidden="true"
          >
            J
          </div>
          <div class="text-[13px] font-semibold tracking-tight">Jarvis</div>
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
        class="hidden md:flex bg-[#0b0c0e] border-r border-border flex-col p-3 relative"
        data-testid="sidebar"
        style="background-image: radial-gradient(ellipse 70% 30% at 50% 0%, rgba(94, 106, 210, 0.08), transparent);"
      >
        <a
          routerLink="/app/visao-geral"
          class="flex items-center gap-2.5 px-2 py-2 mb-3 rounded-md hover:bg-bg-elev/60 transition-colors"
          data-testid="sidebar-logo"
          aria-label="Ir pra visão geral"
          title="Visão geral"
        >
          <div
            class="w-8 h-8 rounded-lg bg-logo-grad grid place-items-center text-sm font-bold tracking-tight shadow-logo"
            aria-hidden="true"
          >
            J
          </div>
          <div class="flex flex-col leading-tight">
            <div class="text-[14px] font-semibold tracking-tight">Jarvis</div>
            <div class="text-[10px] text-text-subtle tracking-wider uppercase font-medium">
              Organizador pessoal
            </div>
          </div>
        </a>

        <div
          class="text-[10px] text-text-subtle px-2 py-1.5 tracking-wider uppercase font-semibold"
        >
          Início
        </div>
        <nav class="flex flex-col gap-px">
          <a
            routerLink="/app/visao-geral"
            routerLinkActive="nav-link-active"
            class="nav-link"
            data-testid="nav-visao-geral"
          >
            <i class="fa-solid fa-house nav-icon"></i>
            <span class="flex-1">Visão geral</span>
          </a>
        </nav>

        <div
          class="text-[10px] text-text-subtle px-2 py-1.5 tracking-wider uppercase font-semibold mt-4"
        >
          Minhas tarefas
        </div>
        <nav class="flex flex-col gap-px">
          <a
            routerLink="/app/captura"
            routerLinkActive="nav-link-active"
            class="nav-link"
            data-testid="nav-captura"
          >
            <i class="fa-solid fa-bolt nav-icon"></i>
            <span class="flex-1">Nova tarefa</span>
          </a>
          <a
            routerLink="/app/tarefas"
            routerLinkActive="nav-link-active"
            class="nav-link"
            data-testid="nav-tarefas"
          >
            <i class="fa-solid fa-list-check nav-icon"></i>
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
          </a>
          <a
            routerLink="/app/concluidas"
            routerLinkActive="nav-link-active"
            class="nav-link"
            data-testid="nav-concluidas"
          >
            <i class="fa-solid fa-circle-check nav-icon"></i>
            <span class="flex-1">Concluídas</span>
          </a>
        </nav>

        <div
          class="text-[10px] text-text-subtle px-2 py-1.5 tracking-wider uppercase font-semibold mt-5"
        >
          Ajustes
        </div>
        <nav class="flex flex-col gap-px">
          <a
            routerLink="/app/configuracoes"
            routerLinkActive="nav-link-active"
            class="nav-link"
            data-testid="nav-configs"
          >
            <i class="fa-solid fa-gear nav-icon"></i>
            <span class="flex-1">Configurações</span>
          </a>
        </nav>

        <div class="mt-auto pt-3">
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
            v1 · Jarvis
          </div>
        </div>
      </aside>

      <main class="flex flex-col min-w-0 flex-1 pb-16 md:pb-0">
        <router-outlet></router-outlet>
      </main>

      <nav
        class="md:hidden fixed bottom-0 inset-x-0 grid grid-cols-5 h-16 bg-[#0b0c0e] border-t border-border z-40"
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
        color: #8a8f98;
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
        background: #16181c;
        color: #e6e6e6;
        transform: translateX(2px);
      }
      :host ::ng-deep .nav-link:hover .nav-icon {
        color: #e6e6e6;
      }
      :host ::ng-deep .nav-icon {
        width: 14px;
        font-size: 12px;
        text-align: center;
        color: #8a8f98;
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
        color: #e6e6e6;
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

  readonly pendentesCount = signal(0);
  readonly atrasadasCount = signal(0);

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
