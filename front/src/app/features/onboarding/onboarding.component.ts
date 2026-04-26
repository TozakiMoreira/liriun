import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { CategoriasService } from '../../core/api/categorias.service';
import { PrazosService } from '../../core/api/prazos.service';
import { TokenStorage } from '../../core/auth/token.storage';

interface PrazoLocal {
  nome: string;
  duracaoDias: number | null;
}

const CATEGORIAS_PADRAO = ['Trabalho', 'Faculdade', 'Casa', 'Compras', 'Pessoal'];

const PRAZOS_PADRAO: PrazoLocal[] = [
  { nome: 'Hoje', duracaoDias: 0 },
  { nome: 'Amanhã', duracaoDias: 1 },
  { nome: 'Essa semana', duracaoDias: 7 },
  { nome: 'Esse mês', duracaoDias: 30 },
  { nome: 'Sem prazo', duracaoDias: null },
];

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [FormsModule],
  template: `
    <main
      class="min-h-screen px-4 sm:px-6 pt-10 sm:pt-16 pb-24 sm:pb-32 bg-bg bg-accent-glow"
      data-testid="onboarding-page"
    >
      <div class="max-w-[560px] mx-auto flex flex-col gap-8">
        <div class="flex items-center gap-2.5">
          <div
            class="w-7 h-7 rounded-[7px] bg-logo-grad grid place-items-center text-sm font-bold"
          >
            J
          </div>
          <div class="text-sm font-semibold tracking-tight">Jarvis</div>
          <div
            class="ml-auto text-[11px] text-text-dim border border-border rounded-full px-2 py-0.5 tracking-wider"
            data-testid="onboarding-step"
          >
            CONFIGURAÇÃO INICIAL
          </div>
        </div>

        <div>
          <h1
            class="text-2xl font-semibold tracking-tight mb-3"
            data-testid="onboarding-title"
          >
            Vamos deixar tudo do seu jeito{{ nomeUsuario() ? ', ' + nomeUsuario() : '' }}.
          </h1>
          <p class="text-text-dim leading-relaxed" data-testid="jarvis-greeting">
            Pra eu organizar suas tarefas sem chutar, preciso que você me diga
            <strong class="text-text font-medium">em quais categorias</strong> encaixa as
            coisas do seu dia e
            <strong class="text-text font-medium">quais prazos</strong> costuma usar. Deixei
            uns modelos prontos aí pra começar rápido — edita o que quiser ou apaga e cria
            do zero.
          </p>
        </div>

        <section class="card-elev p-5 flex flex-col gap-4" data-testid="onboarding-categories-section">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <div class="text-sm font-semibold">Suas categorias</div>
            </div>
            <div class="text-xs text-text-dim">
              Uma tarefa pode ter mais de uma. Vai que é lembrete da faculdade e compra ao
              mesmo tempo.
            </div>
          </div>

          <div class="flex flex-wrap gap-2" data-testid="onboarding-categories-list">
            @for (cat of categorias(); track cat) {
              <div
                class="inline-flex items-center gap-1.5 pl-3 pr-2.5 py-1 bg-[#16181c] border border-border-strong rounded text-[13px]"
              >
                {{ cat }}
                <button
                  type="button"
                  class="text-text-subtle hover:bg-danger/10 hover:text-danger rounded p-0.5 leading-none text-sm"
                  aria-label="Remover"
                  (click)="removerCategoria(cat)"
                >
                  ×
                </button>
              </div>
            }
          </div>

          <div class="flex gap-2">
            <input
              type="text"
              class="flex-1 bg-[#16181c] border border-border text-text rounded px-3 py-2 text-[13px] focus:outline-none focus:border-accent"
              placeholder="Nova categoria (ex: Academia, Projetos, Leitura)"
              data-testid="onboarding-category-input"
              [(ngModel)]="novaCategoria"
              name="novaCat"
              (keydown.enter)="adicionarCategoria()"
            />
            <button
              type="button"
              class="btn-secondary text-[13px] py-2"
              data-testid="onboarding-category-add-btn"
              (click)="adicionarCategoria()"
            >
              Adicionar
            </button>
          </div>
        </section>

        <section class="card-elev p-5 flex flex-col gap-4" data-testid="onboarding-prazos-section">
          <div class="flex flex-col gap-1">
            <div class="text-sm font-semibold">Seus prazos</div>
            <div class="text-xs text-text-dim">
              Durações nomeadas que eu vou usar quando criar tarefas. Horário final padrão é
              23:59.
            </div>
          </div>

          <div class="flex flex-col gap-1.5" data-testid="onboarding-prazos-list">
            @for (p of prazos(); track p.nome) {
              <div
                class="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-2.5 bg-[#16181c] border border-border rounded hover:border-border-strong"
              >
                <span class="text-[13px] font-medium">{{ p.nome }}</span>
                <span class="text-xs text-text-dim">{{ formatarDuracao(p.duracaoDias) }}</span>
                <button
                  type="button"
                  class="text-text-subtle hover:bg-danger/10 hover:text-danger rounded p-1 leading-none"
                  aria-label="Remover"
                  (click)="removerPrazo(p.nome)"
                >
                  ×
                </button>
              </div>
            }
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-2">
            <input
              type="text"
              class="bg-[#16181c] border border-border text-text rounded px-3 py-2 text-[13px] focus:outline-none focus:border-accent"
              placeholder="Nome do prazo (ex: Próxima sprint)"
              data-testid="onboarding-prazo-name-input"
              [(ngModel)]="novoPrazoNome"
              name="novoPrazoNome"
            />
            <select
              class="bg-[#16181c] border border-border text-text rounded px-3 py-2 text-[13px] focus:outline-none focus:border-accent"
              data-testid="onboarding-prazo-duration-select"
              [(ngModel)]="novoPrazoDuracao"
              name="novoPrazoDur"
            >
              <option [ngValue]="undefined" disabled>Duração</option>
              <option [ngValue]="0">Hoje</option>
              <option [ngValue]="1">1 dia</option>
              <option [ngValue]="2">2 dias</option>
              <option [ngValue]="3">3 dias</option>
              <option [ngValue]="7">7 dias</option>
              <option [ngValue]="14">14 dias</option>
              <option [ngValue]="30">30 dias</option>
              <option [ngValue]="null">Sem prazo</option>
            </select>
            <button
              type="button"
              class="btn-secondary text-[13px] py-2"
              data-testid="onboarding-prazo-add-btn"
              (click)="adicionarPrazo()"
            >
              Adicionar
            </button>
          </div>
        </section>

        @if (erro()) {
          <p class="text-danger text-xs text-center" data-testid="onboarding-erro">
            {{ erro() }}
          </p>
        }

        <div class="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            class="text-xs text-text-dim hover:text-text bg-transparent border-none py-1.5"
            data-testid="onboarding-reset-btn"
            (click)="limparTudo()"
          >
            Começar do zero (limpar tudo)
          </button>

          <button
            type="button"
            class="btn-primary text-sm px-5 py-2.5"
            data-testid="onboarding-finish-btn"
            [disabled]="salvando()"
            (click)="finalizar()"
          >
            {{ salvando() ? 'Salvando...' : 'Pronto, pode começar' }}
          </button>
        </div>

        <div class="text-center text-text-subtle text-[11px] tracking-wider">
          Você pode ajustar tudo isso depois em Configurações.
        </div>
      </div>
    </main>
  `,
})
export class OnboardingComponent implements OnInit {
  private readonly categoriasApi = inject(CategoriasService);
  private readonly prazosApi = inject(PrazosService);
  private readonly storage = inject(TokenStorage);
  private readonly router = inject(Router);

  readonly nomeUsuario = signal<string>(this.storage.usuario()?.nome ?? '');
  readonly categorias = signal<string[]>([...CATEGORIAS_PADRAO]);
  readonly prazos = signal<PrazoLocal[]>([...PRAZOS_PADRAO]);
  readonly salvando = signal(false);
  readonly erro = signal<string | null>(null);

  novaCategoria = '';
  novoPrazoNome = '';
  novoPrazoDuracao: number | null | undefined = undefined;

  ngOnInit(): void {
    forkJoin({
      cats: this.categoriasApi.listar(),
      prz: this.prazosApi.listar(),
    }).subscribe({
      next: ({ cats, prz }) => {
        if (cats.length > 0 || prz.length > 0) {
          this.router.navigateByUrl('/captura');
        }
      },
      error: () => of(null),
    });
  }

  adicionarCategoria(): void {
    const nome = this.novaCategoria.trim();
    if (!nome) return;
    if (this.categorias().some((c) => c.toLowerCase() === nome.toLowerCase())) {
      this.novaCategoria = '';
      return;
    }
    this.categorias.update((list) => [...list, nome]);
    this.novaCategoria = '';
  }

  removerCategoria(nome: string): void {
    this.categorias.update((list) => list.filter((c) => c !== nome));
  }

  adicionarPrazo(): void {
    const nome = this.novoPrazoNome.trim();
    if (!nome || this.novoPrazoDuracao === undefined) return;
    if (this.prazos().some((p) => p.nome.toLowerCase() === nome.toLowerCase())) {
      this.novoPrazoNome = '';
      return;
    }
    this.prazos.update((list) => [
      ...list,
      { nome, duracaoDias: this.novoPrazoDuracao as number | null },
    ]);
    this.novoPrazoNome = '';
    this.novoPrazoDuracao = undefined;
  }

  removerPrazo(nome: string): void {
    this.prazos.update((list) => list.filter((p) => p.nome !== nome));
  }

  limparTudo(): void {
    this.categorias.set([]);
    this.prazos.set([]);
  }

  formatarDuracao(d: number | null): string {
    if (d === null) return 'sem data limite';
    if (d === 0) return 'até 23:59 de hoje';
    if (d === 1) return '1 dia';
    return `${d} dias`;
  }

  finalizar(): void {
    if (this.salvando()) return;
    if (this.categorias().length === 0 && this.prazos().length === 0) {
      this.erro.set('Adiciona pelo menos uma categoria ou prazo antes de continuar.');
      return;
    }
    this.salvando.set(true);
    this.erro.set(null);

    const cats$ = this.categorias().map((nome) => this.categoriasApi.criar(nome));
    const prz$ = this.prazos().map((p) => this.prazosApi.criar(p.nome, p.duracaoDias));
    const tudo = [...cats$, ...prz$];

    if (tudo.length === 0) {
      this.router.navigateByUrl('/captura');
      return;
    }

    forkJoin(tudo).subscribe({
      next: () => {
        this.salvando.set(false);
        this.router.navigateByUrl('/captura');
      },
      error: (err) => {
        this.salvando.set(false);
        this.erro.set(err?.error?.mensagem ?? 'Algo falhou ao salvar. Tenta de novo.');
      },
    });
  }
}
