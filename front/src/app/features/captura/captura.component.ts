import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Categoria, CategoriasService } from '../../core/api/categorias.service';
import {
  IaService,
  MensagemConversa,
  RespostaConversa,
  SugestaoTarefa,
} from '../../core/api/ia.service';
import {
  Prioridade,
  TarefaPayload,
  TarefasService,
} from '../../core/api/tarefas.service';
import { TokenStorage } from '../../core/auth/token.storage';
import { extrairProblemDetails } from '../../shared/problem-details';
import { TarefaFormComponent } from '../tarefas/tarefa-form.component';

type Modo = 'manual' | 'jarvis' | null;

@Component({
  selector: 'app-captura',
  standalone: true,
  imports: [CommonModule, FormsModule, TarefaFormComponent],
  template: `
    <header class="flex items-center px-4 md:px-8 py-3.5 border-b border-border gap-4">
      <div class="flex items-center gap-2 text-[13px] text-text-dim">
        <i class="fa-solid fa-bolt text-accent text-[11px]"></i>
        <strong class="text-text font-medium">Nova tarefa</strong>
      </div>
    </header>

    <div
      class="flex-1 grid place-items-center px-4 md:px-8 py-8 md:py-12 bg-bg relative overflow-hidden"
      style="background-image: radial-gradient(ellipse 60% 30% at 50% 0%, rgba(94, 106, 210, 0.08), transparent);"
      data-testid="captura-page"
    >
      @if (modo() === null) {
        <div class="w-full max-w-[720px] flex flex-col gap-8 md:gap-10 items-center fade-in">
          <div class="text-center flex flex-col gap-2.5">
            <h1
              class="text-2xl md:text-[28px] font-semibold tracking-tight leading-tight"
              data-testid="jarvis-greeting"
            >
              {{ saudacao() }}{{ nomeUsuario() ? ', ' + nomeUsuario() : '' }}
            </h1>
            <div
              class="text-lg font-medium text-text-dim tracking-tight"
              data-testid="jarvis-prompt"
            >
              O que você precisa anotar?
            </div>
            <p class="text-text-dim max-w-[440px] mx-auto leading-relaxed">
              Escolha como quer criar a tarefa. Manual pra quando você já sabe tudo, Jarvis pra
              conversar comigo até a tarefa ficar do jeito certo.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full" data-testid="mode-picker">
            <button
              type="button"
              class="bg-bg-elev border border-border rounded-lg p-6 cursor-pointer text-left flex flex-col gap-3.5 hover:border-border-strong hover:bg-[#16181c] hover:-translate-y-0.5 transition-all duration-200 group"
              data-testid="mode-manual-btn"
              (click)="abrirManual()"
            >
              <div class="flex items-center justify-between gap-3">
                <div
                  class="w-9 h-9 rounded-lg bg-[#16181c] border border-border-strong grid place-items-center text-text-dim text-[15px] group-hover:text-text transition-colors"
                >
                  <i class="fa-solid fa-pen-to-square"></i>
                </div>
              </div>
              <div class="text-base font-semibold tracking-tight text-text-dim">Manual</div>
              <div class="text-[13px] text-text-dim leading-relaxed">
                Você preenche os campos na mão: nome, categoria, prazo e prioridade. Rápido e sem
                surpresas.
              </div>
              <div class="flex items-center justify-between mt-1.5 pt-3.5 border-t border-border">
                <div
                  class="text-[13px] font-medium text-text group-hover:text-accent flex items-center gap-1.5 transition-colors"
                >
                  Criar tarefa
                  <i class="fa-solid fa-arrow-right text-[11px] group-hover:translate-x-0.5 transition-transform"></i>
                </div>
                <span class="kbd-pill">M</span>
              </div>
            </button>

            <button
              type="button"
              class="relative overflow-hidden bg-bg-elev border border-border rounded-lg p-6 cursor-pointer text-left flex flex-col gap-3.5 hover:border-accent hover:bg-[#16181c] hover:-translate-y-0.5 hover:shadow-glow transition-all duration-200 group"
              data-testid="mode-jarvis-btn"
              (click)="abrirJarvis()"
              [style.background-image]="
                'radial-gradient(ellipse 80% 60% at 100% 0%, rgba(94, 106, 210, 0.1), transparent)'
              "
            >
              <div class="flex items-center justify-between gap-3 relative">
                <div
                  class="w-9 h-9 rounded-lg bg-accent/15 border border-accent/30 grid place-items-center text-accent text-[15px] group-hover:bg-accent/25 transition-colors"
                >
                  <i class="fa-solid fa-wand-magic-sparkles"></i>
                </div>
              </div>
              <div class="text-base font-semibold tracking-tight text-accent">Jarvis</div>
              <div class="text-[13px] text-text-dim leading-relaxed">
                Conversa comigo em texto livre. Eu te pergunto o que faltar e fecho a tarefa
                quando estiver pronta.
              </div>
              <div class="flex items-center justify-between mt-1.5 pt-3.5 border-t border-border">
                <div
                  class="text-[13px] font-medium text-text group-hover:text-accent flex items-center gap-1.5 transition-colors"
                >
                  Conversar com Jarvis
                  <i class="fa-solid fa-arrow-right text-[11px] group-hover:translate-x-0.5 transition-transform"></i>
                </div>
                <span class="kbd-pill">J</span>
              </div>
            </button>
          </div>

          <div
            class="flex items-center gap-2.5 text-text-subtle text-xs"
            data-testid="keyboard-hint"
          >
            <i class="fa-solid fa-keyboard"></i>
            <span>
              <span class="kbd-pill">M</span> manual ·
              <span class="kbd-pill">J</span> Jarvis
            </span>
          </div>
        </div>
      }

      @if (modo() === 'jarvis') {
        <div
          class="w-full max-w-[680px] flex flex-col gap-5 fade-in"
          data-testid="jarvis-panel"
        >
          @if (!chatAtivo()) {
            <div class="text-center flex flex-col gap-2 fade-down">
              <div class="flex items-center justify-center gap-2 mb-1">
                <div
                  class="w-9 h-9 rounded-lg bg-logo-grad grid place-items-center text-sm font-bold tracking-tight shadow-glow"
                  aria-hidden="true"
                >
                  J
                </div>
              </div>
              <h1
                class="text-2xl md:text-[26px] font-semibold tracking-tight leading-tight"
                data-testid="jarvis-greeting-jarvis"
              >
                {{ saudacao() }}{{ nomeUsuario() ? ', ' + nomeUsuario() : '' }}
              </h1>
              <div class="text-base text-text-dim tracking-tight">
                Me conta o que você quer registrar.
              </div>
            </div>
          }

          <div
            class="card-elev overflow-hidden flex flex-col transition-all duration-500 ease-out"
            [class.chat-card-expanded]="chatAtivo()"
            [class.chat-card-compact]="!chatAtivo()"
          >
            @if (chatAtivo()) {
              <div
                class="flex items-center justify-between px-4 py-3 border-b border-border slide-down"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-7 rounded-md bg-logo-grad grid place-items-center text-xs font-bold tracking-tight shadow-glow-sm"
                    aria-hidden="true"
                  >
                    J
                  </div>
                  <div class="flex flex-col leading-tight">
                    <strong class="text-text font-medium text-[13px]">Jarvis</strong>
                    <span class="text-text-subtle text-[10px] flex items-center gap-1">
                      @if (analisando()) {
                        <span class="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
                        pensando...
                      } @else {
                        <span class="w-1.5 h-1.5 bg-[#10b981] rounded-full"></span>
                        online
                      }
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  class="text-text-subtle hover:text-text text-base p-1 leading-none transition-colors"
                  data-testid="jarvis-fechar"
                  aria-label="Fechar conversa"
                  (click)="fecharChat()"
                >
                  ×
                </button>
              </div>

              <div
                #scroller
                class="overflow-y-auto px-4 py-4 flex flex-col gap-3 chat-scroll"
                data-testid="chat-mensagens"
              >
                @for (m of mensagens(); track $index) {
                  @if (m.papel === 'jarvis') {
                    <div class="flex items-start gap-2 max-w-[88%] msg-in">
                      <div
                        class="w-7 h-7 rounded-md bg-logo-grad grid place-items-center text-[10px] font-bold shrink-0 mt-0.5 shadow-glow-sm"
                        aria-hidden="true"
                      >
                        J
                      </div>
                      <div
                        class="bg-bg-elev border border-border rounded-lg rounded-tl-sm px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap"
                      >
                        {{ m.texto }}
                      </div>
                    </div>
                  } @else {
                    <div class="flex justify-end msg-in">
                      <div
                        class="bg-accent/15 border border-accent/30 text-text rounded-lg rounded-tr-sm px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap max-w-[88%]"
                      >
                        {{ m.texto }}
                      </div>
                    </div>
                  }
                }

                @if (analisando()) {
                  <div class="flex items-start gap-2 max-w-[85%] msg-in">
                    <div
                      class="w-7 h-7 rounded-md bg-logo-grad grid place-items-center text-[10px] font-bold shrink-0 mt-0.5 shadow-glow-sm"
                      aria-hidden="true"
                    >
                      J
                    </div>
                    <div
                      class="bg-bg-elev border border-border rounded-lg rounded-tl-sm px-3.5 py-3 text-text-subtle text-[13px] flex items-center gap-1"
                    >
                      <span class="dot-pulse"></span>
                      <span class="dot-pulse" style="animation-delay: 0.15s"></span>
                      <span class="dot-pulse" style="animation-delay: 0.3s"></span>
                    </div>
                  </div>
                }

                @if (sugestao(); as s) {
                  <div class="flex items-start gap-2 max-w-[95%] msg-in" data-testid="chat-sugestao">
                    <div
                      class="w-7 h-7 rounded-md bg-logo-grad grid place-items-center text-[10px] font-bold shrink-0 mt-0.5 shadow-glow-sm"
                      aria-hidden="true"
                    >
                      J
                    </div>
                    <div
                      class="flex-1 bg-bg-elev border border-accent/40 rounded-lg overflow-hidden shadow-glow-sm"
                    >
                      <div
                        class="px-3 py-2 border-b border-border bg-accent/5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-accent font-medium"
                      >
                        <i class="fa-solid fa-clipboard-check text-[10px]"></i>
                        Tarefa pronta
                      </div>
                      <div class="p-3 flex flex-col gap-2 text-[13px]">
                        <div class="font-medium">{{ s.titulo }}</div>
                        <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px] text-text-dim">
                          <div>
                            <span class="text-text-subtle">Data:</span>
                            {{ formatarData(s.dataPrazo) }}
                            @if (s.horarioFinal) {
                              <span class="ml-1">{{ s.horarioFinal }}</span>
                            }
                          </div>
                          <div>
                            <span class="text-text-subtle">Prioridade:</span>
                            {{ rotuloPrioridade(s.prioridade) }}
                          </div>
                        </div>
                        @if (categoriasNomes(s.categoriaIds).length > 0) {
                          <div class="flex gap-1 flex-wrap">
                            @for (n of categoriasNomes(s.categoriaIds); track n) {
                              <span
                                class="text-[10px] px-1.5 py-0.5 bg-bg border border-border rounded-full text-text-dim"
                                >{{ n }}</span
                              >
                            }
                          </div>
                        }
                        @if (s.observacoes) {
                          <div
                            class="text-[12px] text-text-dim border-l-2 border-accent/40 pl-2 whitespace-pre-wrap"
                          >
                            {{ s.observacoes }}
                          </div>
                        }
                      </div>
                      <div
                        class="px-3 py-2 border-t border-border flex flex-wrap gap-2 justify-end"
                      >
                        <button
                          type="button"
                          class="btn-secondary text-[12px] px-3 py-1.5"
                          data-testid="sugestao-ajustar"
                          [disabled]="salvando()"
                          (click)="ajustarSugestao()"
                        >
                          Ajustar
                        </button>
                        <button
                          type="button"
                          class="btn-primary text-[12px] px-3 py-1.5 flex items-center gap-1.5"
                          data-testid="sugestao-salvar"
                          [disabled]="salvando() || !s.dataPrazo"
                          (click)="salvarSugestao()"
                        >
                          @if (salvando()) {
                            <i class="fa-solid fa-circle-notch fa-spin text-[10px]"></i>
                            Salvando...
                          } @else {
                            <i class="fa-solid fa-check text-[10px]"></i>
                            Salvar tarefa
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                }

                @if (erroChat()) {
                  <div
                    class="text-[12px] text-danger px-3 py-2 rounded border border-danger/30 bg-danger/10 msg-in"
                    data-testid="chat-erro"
                  >
                    {{ erroChat() }}
                  </div>
                }
              </div>
            }

            <div
              class="border-border px-3 py-3 transition-all"
              [class.border-t]="chatAtivo()"
            >
              <form
                class="flex items-end gap-2"
                (ngSubmit)="enviarMensagem()"
                data-testid="chat-form"
              >
                <textarea
                  #inputChat
                  class="input-base resize-none flex-1 transition-all"
                  [rows]="chatAtivo() ? 1 : 3"
                  [placeholder]="chatAtivo() ? 'Escreve aqui...' : 'Ex: marcar reunião com Pedro amanhã às 18h'"
                  maxlength="2000"
                  data-testid="chat-input"
                  [ngModel]="rascunho()"
                  (ngModelChange)="rascunho.set($event)"
                  name="rascunhoChat"
                  [disabled]="analisando() || salvando()"
                  (keydown)="onKeyChat($event)"
                ></textarea>
                <button
                  type="submit"
                  class="btn-primary px-3.5 py-2 text-[13px] flex items-center gap-1.5 self-stretch"
                  data-testid="chat-enviar"
                  [disabled]="!podeEnviar() || analisando() || salvando()"
                  [attr.aria-label]="chatAtivo() ? 'Enviar mensagem' : 'Iniciar conversa'"
                >
                  <i class="fa-solid fa-paper-plane text-[12px]"></i>
                  @if (!chatAtivo()) {
                    <span>Conversar</span>
                  }
                </button>
              </form>
              @if (!chatAtivo()) {
                <div
                  class="flex items-center justify-between mt-2 text-[11px] text-text-subtle px-1"
                >
                  <span class="flex items-center gap-1.5">
                    <i class="fa-solid fa-circle-info text-[10px]"></i>
                    Manda como se estivesse falando comigo. Eu pergunto o que faltar.
                  </span>
                  <button
                    type="button"
                    class="hover:text-text-dim transition-colors"
                    data-testid="jarvis-voltar"
                    (click)="modo.set(null)"
                  >
                    voltar
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      }

      @if (toast(); as msg) {
        <div
          class="fixed bottom-6 right-6 bg-bg-elev border border-border rounded px-4 py-3 text-[13px] text-text-dim shadow-lg max-w-xs slide-up"
          data-testid="captura-toast"
        >
          {{ msg }}
        </div>
      }
    </div>

    @if (modo() === 'manual') {
      <app-tarefa-form
        (salvo)="aposSalvar()"
        (cancelado)="modo.set(null)"
      ></app-tarefa-form>
    }

    @if (formAjuste(); as s) {
      <app-tarefa-form
        [sugestao]="s"
        (salvo)="aposSalvar()"
        (cancelado)="formAjuste.set(null)"
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
      .dot-pulse {
        width: 6px;
        height: 6px;
        background: #8a8f98;
        border-radius: 50%;
        display: inline-block;
        animation: dot-pulse 1s infinite ease-in-out;
      }
      @keyframes dot-pulse {
        0%,
        80%,
        100% {
          transform: scale(0.6);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
      .shadow-glow {
        box-shadow: 0 0 24px rgba(94, 106, 210, 0.25);
      }
      .shadow-glow-sm {
        box-shadow: 0 0 12px rgba(94, 106, 210, 0.18);
      }
      .chat-card-compact {
        max-height: 200px;
      }
      .chat-card-expanded {
        max-height: min(75vh, 640px);
        height: min(75vh, 640px);
      }
      .chat-card-expanded .chat-scroll {
        flex: 1 1 auto;
        min-height: 0;
      }
      .fade-in {
        animation: fade-in 320ms ease-out;
      }
      .fade-down {
        animation: fade-down 360ms ease-out;
      }
      .slide-down {
        animation: slide-down 380ms ease-out;
      }
      .slide-up {
        animation: slide-up 280ms ease-out;
      }
      .msg-in {
        animation: msg-in 260ms ease-out;
      }
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fade-down {
        from { opacity: 0; transform: translateY(-12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slide-down {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slide-up {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes msg-in {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,
  ],
})
export class CapturaComponent implements AfterViewChecked {
  private readonly storage = inject(TokenStorage);
  private readonly ia = inject(IaService);
  private readonly tarefasApi = inject(TarefasService);
  private readonly categoriasApi = inject(CategoriasService);

  readonly modo = signal<Modo>(null);
  readonly nomeUsuario = signal(this.storage.usuario()?.nome ?? '');

  readonly rascunho = signal('');
  readonly mensagens = signal<MensagemConversa[]>([]);
  readonly analisando = signal(false);
  readonly salvando = signal(false);
  readonly erroChat = signal<string | null>(null);
  readonly toast = signal<string | null>(null);
  readonly sugestao = signal<SugestaoTarefa | null>(null);
  readonly formAjuste = signal<SugestaoTarefa | null>(null);
  readonly categorias = signal<Categoria[]>([]);
  readonly chatAtivo = signal(false);

  readonly podeEnviar = computed(() => this.rascunho().trim().length > 0);

  private readonly scroller = viewChild<ElementRef<HTMLDivElement>>('scroller');
  private readonly inputChat = viewChild<ElementRef<HTMLTextAreaElement>>('inputChat');
  private precisaScrollar = false;

  ngAfterViewChecked(): void {
    if (this.precisaScrollar) {
      this.precisaScrollar = false;
      const el = this.scroller()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }

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

  abrirJarvis(): void {
    this.rascunho.set('');
    this.mensagens.set([]);
    this.sugestao.set(null);
    this.erroChat.set(null);
    this.chatAtivo.set(false);
    this.modo.set('jarvis');

    setTimeout(() => this.inputChat()?.nativeElement.focus(), 60);

    this.categoriasApi.listar().subscribe({
      next: (cats) => this.categorias.set(cats),
      error: () => {
        /* não-bloqueante */
      },
    });
  }

  fecharChat(): void {
    if (this.salvando()) return;
    this.modo.set(null);
    this.mensagens.set([]);
    this.sugestao.set(null);
    this.erroChat.set(null);
    this.rascunho.set('');
    this.chatAtivo.set(false);
  }

  enviarMensagem(): void {
    if (!this.podeEnviar() || this.analisando() || this.salvando()) return;
    const texto = this.rascunho().trim();
    this.rascunho.set('');
    this.erroChat.set(null);

    if (!this.chatAtivo()) {
      this.chatAtivo.set(true);
    }

    const novas: MensagemConversa[] = [...this.mensagens(), { papel: 'usuario', texto }];
    this.mensagens.set(novas);
    this.precisaScrollar = true;

    this.analisando.set(true);
    this.ia.conversar(novas).subscribe({
      next: (resposta: RespostaConversa) => {
        this.analisando.set(false);
        this.mensagens.update((m) => [...m, { papel: 'jarvis', texto: resposta.mensagem }]);
        this.sugestao.set(resposta.tarefa);
        this.precisaScrollar = true;
      },
      error: (err: HttpErrorResponse) => {
        this.analisando.set(false);
        const r = extrairProblemDetails(err, 'Não consegui processar agora.');
        this.erroChat.set(r.mensagemGeral ?? 'Não consegui processar agora.');
        this.precisaScrollar = true;
      },
    });
  }

  ajustarSugestao(): void {
    const s = this.sugestao();
    if (!s) return;
    this.formAjuste.set(s);
  }

  salvarSugestao(): void {
    const s = this.sugestao();
    if (!s || !s.dataPrazo || this.salvando()) return;
    this.salvando.set(true);
    this.erroChat.set(null);

    const payload: TarefaPayload = {
      nome: s.titulo,
      prioridade: s.prioridade ?? 3,
      dataPrazo: s.dataPrazo,
      categoriaIds: s.categoriaIds,
      horarioFinal: s.horarioFinal ? `${s.horarioFinal}:00` : null,
      observacoes: s.observacoes,
    };

    this.tarefasApi.criar(payload).subscribe({
      next: () => {
        this.salvando.set(false);
        this.mostrarToast(`Anotado, ${this.nomeUsuario() || 'feito'}.`);
        this.fecharChat();
      },
      error: (err: HttpErrorResponse) => {
        this.salvando.set(false);
        const r = extrairProblemDetails(err, 'Não consegui salvar.');
        this.erroChat.set(r.mensagemGeral ?? 'Não consegui salvar. Ajusta e tenta de novo.');
      },
    });
  }

  formatarData(iso: string | null): string {
    if (!iso) return 'sem data';
    const d = new Date(iso);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const alvo = new Date(d);
    alvo.setHours(0, 0, 0, 0);
    const diff = Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
    if (diff === 0) return 'hoje';
    if (diff === 1) return 'amanhã';
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getUTCFullYear()}`;
  }

  rotuloPrioridade(p: Prioridade | null): string {
    if (p === null) return 'Normal';
    return ['', 'Urgente', 'Importante', 'Normal', 'Baixa'][p] ?? 'Normal';
  }

  categoriasNomes(ids: string[]): string[] {
    if (!ids?.length || !this.categorias().length) return [];
    const map = new Map(this.categorias().map((c) => [c.id, c.nome]));
    return ids.map((i) => map.get(i)).filter((n): n is string => !!n);
  }

  aposSalvar(): void {
    this.formAjuste.set(null);
    this.fecharChat();
    this.modo.set(null);
  }

  onKeyChat(ev: KeyboardEvent): void {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      this.enviarMensagem();
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      this.fecharChat();
    }
  }

  private mostrarToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3500);
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
      this.abrirJarvis();
    }
  }
}
