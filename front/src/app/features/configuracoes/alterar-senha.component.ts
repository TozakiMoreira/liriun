import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { TokenStorage } from '../../core/auth/token.storage';
import { PasswordInputComponent } from '../../shared/password-input.component';
import {
  PasswordRequirementsComponent,
  senhaAtendeRequisitos,
} from '../../shared/password-requirements.component';
import { extrairProblemDetails } from '../../shared/problem-details';

@Component({
  selector: 'app-alterar-senha',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PasswordInputComponent,
    PasswordRequirementsComponent,
  ],
  template: `
    <header class="flex items-center px-4 md:px-8 py-3.5 border-b border-border gap-4">
      <a
        routerLink="/app/configuracoes"
        class="text-text-subtle hover:text-text flex items-center gap-1.5 text-[15px]"
        data-testid="alterar-senha-voltar"
        aria-label="Voltar para Configurações"
      >
        <i class="fa-solid fa-arrow-left text-xs"></i>
        Configurações
      </a>
      <span class="text-text-subtle text-[15px]">/</span>
      <strong class="text-text font-medium text-[15px]">Trocar senha</strong>
    </header>

    <div
      class="flex-1 grid place-items-start md:place-items-center px-4 py-8 md:py-16 overflow-auto"
      data-testid="alterar-senha-page"
    >
      <div class="w-full max-w-[420px]">
        <div class="card-elev p-6 flex flex-col gap-5">
          <div class="flex flex-col gap-1">
            <h1 class="text-lg font-semibold tracking-tight">Trocar senha</h1>
            <p class="text-text-dim text-[13px]">
              Confirma a senha de hoje pra eu garantir que é você.
            </p>
          </div>

          <form class="flex flex-col gap-4" (ngSubmit)="trocar()" novalidate>
            <div class="flex flex-col gap-1.5">
              <label class="field-label" for="senha-atual">Senha atual</label>
              <app-password-input
                inputId="senha-atual"
                placeholder="Sua senha de hoje"
                autocomplete="current-password"
                testid="senha-atual-input"
                [value]="senhaAtual()"
                (valueChange)="senhaAtual.set($event)"
              />
              @if (erroSenhaAtual()) {
                <p class="text-danger text-xs" data-testid="senha-atual-erro">
                  {{ erroSenhaAtual() }}
                </p>
              }
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="field-label" for="nova-senha">Nova senha</label>
              <app-password-input
                inputId="nova-senha"
                placeholder="A nova"
                autocomplete="new-password"
                testid="nova-senha-input"
                [value]="novaSenha()"
                (valueChange)="novaSenha.set($event)"
              />
              <app-password-requirements
                class="mt-1"
                [senha]="novaSenha()"
                testid="trocar-senha-requirements"
              />
              @if (erroNovaSenha()) {
                <p class="text-danger text-xs" data-testid="nova-senha-erro">
                  {{ erroNovaSenha() }}
                </p>
              }
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="field-label" for="confirmar-senha">Confirmar nova senha</label>
              <app-password-input
                inputId="confirmar-senha"
                placeholder="Repete a nova"
                autocomplete="new-password"
                testid="confirmar-senha-input"
                [value]="confirmarSenha()"
                (valueChange)="confirmarSenha.set($event)"
              />
              @if (confirmarSenha() && novaSenha()) {
                <p
                  class="flex items-center gap-2 text-[11px] transition-colors"
                  [class.text-emerald-400]="senhasBatem()"
                  [class.text-danger]="!senhasBatem()"
                  data-testid="confirmar-senha-status"
                >
                  @if (senhasBatem()) {
                    <i class="fa-solid fa-check w-3 text-center"></i>
                    As senhas batem
                  } @else {
                    <i class="fa-solid fa-xmark w-3 text-center"></i>
                    As senhas não batem
                  }
                </p>
              }
            </div>

            @if (sucesso()) {
              <p class="text-emerald-400 text-xs" data-testid="senha-sucesso">{{ sucesso() }}</p>
            }
            @if (erroGeral()) {
              <p class="text-danger text-xs" data-testid="senha-erro-geral">{{ erroGeral() }}</p>
            }

            <div class="flex justify-end gap-2 pt-1">
              <a
                routerLink="/app/configuracoes"
                class="btn-secondary text-[13px] px-4 py-2"
                data-testid="alterar-senha-cancelar"
              >
                Cancelar
              </a>
              <button
                type="submit"
                class="btn-primary"
                data-testid="trocar-senha-btn"
                [disabled]="trocando() || !podeTrocar()"
              >
                {{ trocando() ? 'Trocando...' : 'Trocar senha' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class AlterarSenhaComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly storage = inject(TokenStorage);

  readonly senhaAtual = signal('');
  readonly novaSenha = signal('');
  readonly confirmarSenha = signal('');
  readonly trocando = signal(false);
  readonly errosCampo = signal<Record<string, string>>({});
  readonly erroGeral = signal<string | null>(null);
  readonly sucesso = signal<string | null>(null);

  readonly erroSenhaAtual = computed(() => this.errosCampo()['senhaatual'] ?? null);
  readonly erroNovaSenha = computed(() => this.errosCampo()['novasenha'] ?? null);

  readonly senhasBatem = computed(() => {
    const n = this.novaSenha();
    const c = this.confirmarSenha();
    return n.length > 0 && n === c;
  });

  readonly podeTrocar = computed(
    () =>
      this.senhaAtual().length > 0 &&
      senhaAtendeRequisitos(this.novaSenha()) &&
      this.senhasBatem(),
  );

  trocar(): void {
    if (this.trocando()) return;
    this.erroGeral.set(null);
    this.sucesso.set(null);

    const erros: Record<string, string> = {};
    if (!this.senhaAtual()) {
      erros['senhaatual'] = 'Informa sua senha atual.';
    }
    if (!this.novaSenha()) {
      erros['novasenha'] = 'Escolhe uma nova senha.';
    } else if (!senhaAtendeRequisitos(this.novaSenha())) {
      erros['novasenha'] = 'A nova senha não atende todos os requisitos.';
    } else if (this.senhaAtual() === this.novaSenha()) {
      erros['novasenha'] = 'A nova senha precisa ser diferente da atual.';
    }
    if (!this.senhasBatem()) {
      erros['confirmarsenha'] = 'A confirmação não bate com a nova senha.';
    }
    if (Object.keys(erros).length > 0) {
      this.errosCampo.set(erros);
      return;
    }
    this.errosCampo.set({});

    this.trocando.set(true);
    this.auth.alterarSenha(this.senhaAtual(), this.novaSenha()).subscribe({
      next: () => {
        this.trocando.set(false);
        const nome = this.storage.usuario()?.nome;
        this.sucesso.set(nome ? `Senha trocada, ${nome}.` : 'Senha trocada.');
        setTimeout(() => this.router.navigateByUrl('/app/configuracoes'), 1200);
      },
      error: (err: HttpErrorResponse) => {
        this.trocando.set(false);
        const r = extrairProblemDetails(err, 'Não consegui trocar sua senha.');
        if (Object.keys(r.errosCampo).length > 0) {
          this.errosCampo.set(r.errosCampo);
        } else {
          this.erroGeral.set(r.mensagemGeral ?? 'Não consegui trocar sua senha.');
        }
      },
    });
  }
}
