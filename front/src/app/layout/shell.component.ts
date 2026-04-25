import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { TokenStorage } from '../core/auth/token.storage';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="grid grid-cols-[232px_1fr] min-h-screen bg-bg text-text">
      <aside
        class="bg-[#0b0c0e] border-r border-border flex flex-col p-4"
        data-testid="sidebar"
      >
        <div class="flex items-center gap-2.5 px-2 py-1.5 mb-5">
          <div
            class="w-6 h-6 rounded-md bg-logo-grad grid place-items-center text-xs font-bold tracking-tight"
            aria-hidden="true"
          >
            J
          </div>
          <div class="text-[13px] font-semibold tracking-tight">Jarvis</div>
        </div>

        <div
          class="text-[11px] text-text-subtle px-2 py-1.5 tracking-wider uppercase font-medium"
        >
          Principal
        </div>
        <nav class="flex flex-col gap-px">
          <a
            routerLink="/captura"
            routerLinkActive="bg-bg-elev text-text [&>i]:text-accent"
            class="flex items-center gap-2.5 px-2 py-1.5 rounded text-text-dim hover:bg-bg-elev hover:text-text text-[13px] font-medium cursor-pointer"
            data-testid="nav-captura"
          >
            <i class="fa-solid fa-bolt w-3.5 text-xs text-center"></i>
            <span>Captura Rápida</span>
          </a>
          <a
            routerLink="/tarefas"
            routerLinkActive="bg-bg-elev text-text [&>i]:text-accent"
            class="flex items-center gap-2.5 px-2 py-1.5 rounded text-text-dim hover:bg-bg-elev hover:text-text text-[13px] font-medium cursor-pointer"
            data-testid="nav-tarefas"
          >
            <i class="fa-solid fa-list-check w-3.5 text-xs text-center"></i>
            <span>Minhas Tarefas</span>
          </a>
          <a
            routerLink="/concluidas"
            routerLinkActive="bg-bg-elev text-text [&>i]:text-accent"
            class="flex items-center gap-2.5 px-2 py-1.5 rounded text-text-dim hover:bg-bg-elev hover:text-text text-[13px] font-medium cursor-pointer"
            data-testid="nav-concluidas"
          >
            <i class="fa-solid fa-circle-check w-3.5 text-xs text-center"></i>
            <span>Concluídas</span>
          </a>
        </nav>

        <div
          class="text-[11px] text-text-subtle px-2 py-1.5 tracking-wider uppercase font-medium mt-4"
        >
          Ajustes
        </div>
        <nav class="flex flex-col gap-px">
          <a
            routerLink="/configuracoes"
            routerLinkActive="bg-bg-elev text-text [&>i]:text-accent"
            class="flex items-center gap-2.5 px-2 py-1.5 rounded text-text-dim hover:bg-bg-elev hover:text-text text-[13px] font-medium cursor-pointer"
            data-testid="nav-configs"
          >
            <i class="fa-solid fa-gear w-3.5 text-xs text-center"></i>
            <span>Configurações</span>
          </a>
        </nav>

        <div class="mt-auto border-t border-border pt-3">
          <div
            class="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-bg-elev cursor-pointer group"
            data-testid="user-menu"
            (click)="sair()"
          >
            <div
              class="w-6 h-6 rounded-full grid place-items-center text-[11px] font-semibold text-white"
              [style.background]="'linear-gradient(135deg, #8b5cf6, #ec4899)'"
            >
              {{ inicial() }}
            </div>
            <div class="text-[13px] font-medium flex-1">{{ storage.usuario()?.nome }}</div>
            <i
              class="fa-solid fa-right-from-bracket text-text-subtle group-hover:text-text-dim text-xs"
              title="Sair"
            ></i>
          </div>
        </div>
      </aside>

      <main class="flex flex-col min-w-0">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly storage = inject(TokenStorage);

  inicial(): string {
    const nome = this.storage.usuario()?.nome ?? '';
    return nome.charAt(0).toUpperCase() || '?';
  }

  sair(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
