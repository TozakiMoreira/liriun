import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { TokenStorage } from '../../core/auth/token.storage';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';
import { AvatarComponent } from '../../shared/avatar.component';
import { FadeInOnViewDirective } from '../../shared/fade-in-on-view.directive';
import { BrandComponent } from '../../shared/brand.component';
import { SiteFooterComponent } from '../../shared/site-footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, FadeInOnViewDirective, AvatarComponent, BrandComponent, ThemeToggleComponent, SiteFooterComponent],
  template: `
    <div class="relative min-h-screen bg-bg text-text overflow-x-hidden" data-testid="landing-page">
      <div class="absolute inset-0 -z-10 pointer-events-none">
        <div
          class="absolute inset-0 bg-cover bg-center opacity-25"
          style="background-image: url('/landing-hero.jpg')"
          data-testid="landing-hero-bg"
        ></div>
        <div
          class="absolute inset-0"
          style="background: radial-gradient(ellipse 70% 60% at 50% 30%, rgba(94, 106, 210, 0.25), transparent 60%);"
        ></div>
        <div
          class="absolute inset-0"
          style="background: linear-gradient(180deg, rgba(8,9,10,0.4) 0%, rgba(8,9,10,0.85) 60%, rgba(8,9,10,1) 100%);"
        ></div>
      </div>

      <header
        class="fixed top-0 inset-x-0 z-30 backdrop-blur-md bg-bg/40 border-b border-border/50"
        data-testid="landing-header"
      >
        <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-3">
          <a routerLink="/" class="flex items-center gap-2.5" data-testid="landing-logo">
            <img
              src="/logo.png"
              alt="Liriun"
              class="w-9 h-9 object-contain"
              aria-hidden="true"
            />
            <div class="text-[15px] font-semibold tracking-tight"><app-brand /></div>
          </a>

          <div class="flex items-center gap-2">
            <app-theme-toggle />

          @if (autenticado()) {
            <div
              class="relative"
              data-testid="landing-user-menu"
              (click)="$event.stopPropagation()"
            >
              <button
                type="button"
                class="flex items-center gap-2.5 pr-2 pl-1 py-1 rounded-full border border-border hover:border-border-strong hover:bg-bg-elev/60 transition-colors"
                data-testid="landing-user-trigger"
                [attr.aria-expanded]="menuAberto()"
                aria-haspopup="true"
                (click)="alternarMenu()"
              >
                <app-avatar
                  [nome]="usuarioNome()"
                  [fotoUrl]="usuarioFoto()"
                  [size]="28"
                />
                <span class="text-[13px] font-medium text-text max-w-[140px] truncate">
                  {{ usuarioNome() || 'Conta' }}
                </span>
                <i
                  class="fa-solid fa-chevron-down text-[9px] text-text-subtle transition-transform"
                  [class.rotate-180]="menuAberto()"
                ></i>
              </button>

              @if (menuAberto()) {
                <div
                  class="absolute right-0 top-full mt-2 w-[220px] card-elev p-1.5 z-40 flex flex-col gap-px"
                  role="menu"
                  data-testid="landing-user-menu-pop"
                >
                  <a
                    routerLink="/app/visao-geral"
                    class="flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] text-text-dim hover:text-text hover:bg-bg-elev"
                    data-testid="landing-menu-visao-geral"
                    (click)="fecharMenu()"
                  >
                    <i class="fa-solid fa-house text-[12px] w-4 text-center"></i>
                    Visão geral
                  </a>
                  <a
                    routerLink="/app/captura"
                    class="flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] text-text-dim hover:text-text hover:bg-bg-elev"
                    data-testid="landing-menu-nova-tarefa"
                    (click)="fecharMenu()"
                  >
                    <i class="fa-solid fa-bolt text-accent text-[12px] w-4 text-center"></i>
                    Nova tarefa
                  </a>
                  <div class="h-px bg-border my-1"></div>
                  <button
                    type="button"
                    class="flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] text-text-dim hover:text-danger hover:bg-danger/10 text-left"
                    data-testid="landing-menu-sair"
                    (click)="sair(); fecharMenu()"
                  >
                    <i class="fa-solid fa-right-from-bracket text-[12px] w-4 text-center"></i>
                    Sair
                  </button>
                </div>
              }
            </div>
          } @else {
            <nav class="flex items-center gap-2">
              <a
                routerLink="/login"
                class="text-text-dim hover:text-text text-[13px] font-medium px-4 py-2 transition-colors"
                data-testid="landing-cta-login"
              >
                Entrar
              </a>
              <a
                routerLink="/cadastro"
                class="btn-primary text-[13px] px-4 py-2"
                data-testid="landing-cta-cadastro"
              >
                Criar conta
              </a>
            </nav>
          }
          </div>
        </div>
      </header>

      <section
        class="relative min-h-screen grid place-items-center px-6 pt-14"
        data-testid="landing-hero"
      >
        <div
          class="max-w-4xl text-center flex flex-col items-center gap-8 will-change-transform"
          [style.opacity]="heroOpacity()"
          [style.transform]="heroTransform()"
        >
          <div
            class="inline-flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase text-text-dim border border-border-strong rounded-full px-3 py-1"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
            v0.1 Beta
          </div>

          <h1
            class="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]"
            data-testid="landing-hero-title"
          >
            <span class="block text-text">Bem-vindo ao</span>
            <span
              class="block bg-clip-text text-transparent"
              style="background-image: linear-gradient(135deg, #5e6ad2 0%, #8b5cf6 50%, #ec4899 100%);"
            >
              Futuro.
            </span>
            <span class="block text-text mt-2">O <app-brand /> chegou.</span>
          </h1>

          <p class="text-text-dim text-lg md:text-xl max-w-2xl leading-relaxed">
            Seu assistente pessoal de tarefas. Discreto, competente, do seu lado.
          </p>

          <div class="flex flex-col sm:flex-row gap-3 mt-2">
            @if (!autenticado()) {
              <a
                routerLink="/cadastro"
                class="btn-primary px-6 py-3 text-sm shadow-accent"
                data-testid="landing-hero-cta-cadastro"
              >
                Começar agora
              </a>
              <a
                routerLink="/login"
                class="btn-secondary px-6 py-3 text-sm"
                data-testid="landing-hero-cta-login"
              >
                Já tenho conta
              </a>
            } @else {
              <a
                routerLink="/app/visao-geral"
                class="btn-primary px-6 py-3 text-sm shadow-accent flex items-center gap-2"
                data-testid="landing-hero-cta-app"
              >
                <i class="fa-solid fa-arrow-right-to-bracket text-xs"></i>
                Ir pro <app-brand />
              </a>
            }
          </div>

        </div>

        <div
          class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-subtle text-[11px] tracking-wider uppercase"
          [style.opacity]="rolarIndicadorOpacity()"
          aria-hidden="true"
        >
          <span>role pra conhecer</span>
          <i class="fa-solid fa-chevron-down animate-bounce"></i>
        </div>
      </section>

      <div
        class="relative h-px max-w-5xl mx-auto my-4 md:my-8"
        aria-hidden="true"
      >
        <div
          class="absolute inset-x-0 top-0 h-px"
          style="background: linear-gradient(90deg, transparent 0%, rgba(94, 106, 210, 0.4) 50%, transparent 100%);"
        ></div>
        <div
          class="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 rounded-full bg-accent/30 ring-4 ring-bg"
        ></div>
      </div>

      <section
        class="relative min-h-screen px-6 py-24 max-w-5xl mx-auto flex flex-col justify-center"
        data-testid="landing-sobre"
        fadeInOnView
      >
        <div>
          <div
            class="text-[11px] font-medium tracking-wider uppercase text-accent mb-4"
          >
            Sobre
          </div>
          <h2
            class="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6"
            data-testid="landing-sobre-title"
          >
            O que é o <app-brand />?
          </h2>
          <p class="text-text-dim text-lg leading-relaxed max-w-3xl mb-12">
            O <app-brand /> é um organizador pessoal de ideias e tarefas com IA conversacional.
            Você fala como falaria com um assistente — ele entende o contexto, pergunta o
            que falta e devolve a tarefa pronta. Sem formulário robotizado, sem ruído, sem
            celebração exagerada. Só o trabalho feito.
          </p>

          <div class="grid md:grid-cols-2 gap-4">
            <div class="card-elev p-6 flex flex-col gap-3" data-testid="feat-chat">
              <div
                class="w-9 h-9 rounded bg-accent/10 text-accent grid place-items-center"
              >
                <i class="fa-solid fa-comments"></i>
              </div>
              <h3 class="text-base font-semibold">Conversa com o <app-brand /></h3>
              <p class="text-text-dim text-sm leading-relaxed">
                Escreve em texto livre como se estivesse falando com um assistente.
                O chat expande, ele te pergunta o que faltar, e fecha a tarefa quando
                tem o suficiente. Sem formulário rígido.
              </p>
            </div>

            <div class="card-elev p-6 flex flex-col gap-3" data-testid="feat-contexto">
              <div
                class="w-9 h-9 rounded bg-accent/10 text-accent grid place-items-center"
              >
                <i class="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <h3 class="text-base font-semibold">Inteligência de contexto</h3>
              <p class="text-text-dim text-sm leading-relaxed">
                Mencionou viagem? Ele pergunta de passagem e hospedagem. Reunião?
                Lugar e pauta. Prova? Matéria e material. O <app-brand /> sabe o que costuma
                envolver cada tipo de tarefa e te ajuda a não esquecer nada.
              </p>
            </div>

            <div class="card-elev p-6 flex flex-col gap-3" data-testid="feat-foco">
              <div
                class="w-9 h-9 rounded bg-accent/10 text-accent grid place-items-center"
              >
                <i class="fa-solid fa-list-check"></i>
              </div>
              <h3 class="text-base font-semibold">Foco no que importa</h3>
              <p class="text-text-dim text-sm leading-relaxed">
                Atrasadas em destaque no topo, pendentes agrupadas por categoria,
                visualização em lista ou Kanban. Filtros por prioridade, prazo e
                categoria. Concluídas guardadas em histórico.
              </p>
            </div>

            <div class="card-elev p-6 flex flex-col gap-3" data-testid="feat-tom">
              <div
                class="w-9 h-9 rounded bg-accent/10 text-accent grid place-items-center"
              >
                <i class="fa-solid fa-user-tie"></i>
              </div>
              <h3 class="text-base font-semibold">Tom de mordomo</h3>
              <p class="text-text-dim text-sm leading-relaxed">
                O Liriun soa como mordomo digital: primeira pessoa, seco, discreto,
                com humor sutil. Sem emoji, sem grito, sem firula. Ele cuida, você
                executa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div
        class="relative h-px max-w-5xl mx-auto my-4 md:my-8"
        aria-hidden="true"
      >
        <div
          class="absolute inset-x-0 top-0 h-px"
          style="background: linear-gradient(90deg, transparent 0%, rgba(94, 106, 210, 0.4) 50%, transparent 100%);"
        ></div>
        <div
          class="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 rounded-full bg-accent/30 ring-4 ring-bg"
        ></div>
      </div>

      <section
        class="relative min-h-screen px-6 py-24 max-w-5xl mx-auto flex flex-col justify-center items-center"
        data-testid="landing-preview"
        fadeInOnView
      >
        <div class="flex flex-col items-center gap-8 text-center w-full">
          <div class="flex flex-col items-center gap-3">
            <div
              class="text-[11px] font-medium tracking-wider uppercase text-accent"
            >
              Como funciona
            </div>
            <h2
              class="text-3xl md:text-4xl font-bold tracking-tight max-w-2xl"
              data-testid="landing-preview-title"
            >
              Conversa com o <app-brand />. Sai com a tarefa pronta.
            </h2>
            <p class="text-text-dim text-base md:text-lg leading-relaxed max-w-2xl">
              Você escreve ou fala. Ele entende o contexto, extrai o que importa
              e devolve uma tarefa pronta pra confirmar.
            </p>
          </div>

          <div
            class="relative w-full max-w-3xl rounded-xl border border-border-strong bg-bg-elev overflow-hidden shadow-accent"
            data-testid="landing-preview-frame"
          >
              @if (!previewQuebrou()) {
                <img
                  src="/liriun-preview.png"
                  alt="Interface do Liriun em uso"
                  class="w-full block"
                  (error)="previewQuebrou.set(true)"
                />
              } @else {
                <!-- Mockup CSS-art do chat com o Liriun (fallback quando liriun-preview.png não existe) -->
                <div
                  class="aspect-[16/10] flex text-left bg-bg"
                  data-testid="landing-preview-mockup"
                  aria-hidden="true"
                >
                  <div
                    class="hidden sm:flex w-[180px] border-r border-border bg-bg-elev flex-col gap-0.5 p-3"
                  >
                    <div class="flex items-center gap-2 mb-3">
                      <img
                        src="/logo.png"
                        alt="Liriun"
                        class="w-7 h-7 rounded-md object-contain"
                        style="box-shadow: 0 0 12px rgba(94, 106, 210, 0.35);"
                      />
                      <div class="flex flex-col leading-tight">
                        <div class="text-[12px] font-semibold tracking-tight"><app-brand /></div>
                      </div>
                    </div>

                    <div
                      class="text-[9px] text-text-subtle uppercase tracking-wider px-1 py-1 font-semibold"
                    >
                      Início
                    </div>
                    <div
                      class="flex items-center gap-2 px-2 py-1 rounded text-text-dim text-[11px]"
                    >
                      <i class="fa-solid fa-house text-[9px] w-3"></i>
                      <span>Visão geral</span>
                    </div>

                    <div
                      class="text-[9px] text-text-subtle uppercase tracking-wider px-1 py-1 font-semibold mt-1.5"
                    >
                      Minhas tarefas
                    </div>
                    <div
                      class="flex items-center gap-2 px-2 py-1 rounded bg-accent/10 text-text text-[11px] relative"
                    >
                      <span
                        class="absolute -left-3 top-1.5 bottom-1.5 w-0.5 bg-accent rounded-r"
                      ></span>
                      <i class="fa-solid fa-bolt text-accent text-[9px] w-3"></i>
                      <span>Nova tarefa</span>
                    </div>
                    <div
                      class="flex items-center gap-2 px-2 py-1 rounded text-text-dim text-[11px]"
                    >
                      <i class="fa-solid fa-list-check text-[9px] w-3"></i>
                      <span class="flex-1">Tarefas</span>
                      <span
                        class="text-[8px] px-1 py-px rounded-full bg-danger/15 text-danger border border-danger/30 font-semibold"
                        >1</span
                      >
                      <span
                        class="text-[8px] px-1 py-px rounded-full bg-bg-elev border border-border text-text-dim font-semibold"
                        >3</span
                      >
                    </div>
                    <div
                      class="flex items-center gap-2 px-2 py-1 rounded text-text-dim text-[11px]"
                    >
                      <i class="fa-solid fa-circle-check text-[9px] w-3"></i>
                      <span>Concluídas</span>
                    </div>

                    <div
                      class="text-[9px] text-text-subtle uppercase tracking-wider px-1 py-1 font-semibold mt-1.5"
                    >
                      Ajustes
                    </div>
                    <div
                      class="flex items-center gap-2 px-2 py-1 rounded text-text-dim text-[11px]"
                    >
                      <i class="fa-solid fa-gear text-[9px] w-3"></i>
                      <span>Configurações</span>
                    </div>
                  </div>

                  <div class="flex-1 flex flex-col overflow-hidden">
                    <div
                      class="flex items-center gap-2 px-3 py-2 border-b border-border"
                    >
                      <i class="fa-solid fa-bolt text-accent text-[10px]"></i>
                      <strong class="text-text font-medium text-[10px]">Nova tarefa</strong>
                    </div>

                    <div class="flex-1 px-3 py-3 flex flex-col gap-2 overflow-hidden">
                      <div class="flex items-center gap-2 px-2 py-1.5 border-b border-border">
                        <img
                          src="/logo.png"
                          alt="Liriun"
                          class="w-5 h-5 rounded object-contain"
                        />
                        <div class="flex flex-col leading-tight">
                          <strong class="text-text font-medium text-[10px]"><app-brand /></strong>
                          <span class="text-[8px] text-text-subtle flex items-center gap-1">
                            <span class="w-1 h-1 bg-emerald-500 rounded-full"></span>
                            online
                          </span>
                        </div>
                      </div>

                      <div class="flex justify-end">
                        <div
                          class="bg-accent/15 border border-accent/30 rounded-lg rounded-tr-sm px-2.5 py-1.5 text-[11px] max-w-[80%]"
                        >
                          Tenho reunião amanhã às 14h, online via Teams, com o Lucas
                        </div>
                      </div>

                      <div class="flex items-start gap-1.5 max-w-[95%]">
                        <img
                          class="w-5 h-5 rounded object-contain shrink-0 mt-0.5"
                          src="/logo.png"
                          alt="Liriun"
                        />
                        <div
                          class="flex-1 bg-bg-elev border border-accent/40 rounded-lg overflow-hidden"
                        >
                          <div
                            class="px-2 py-1 border-b border-border bg-accent/5 flex items-center gap-1 text-[8px] uppercase tracking-wider text-accent font-semibold"
                          >
                            <i class="fa-solid fa-clipboard-check text-[7px]"></i>
                            Tarefa pronta
                          </div>
                          <div class="p-2 flex flex-col gap-1">
                            <div class="text-[11px] font-medium">
                              Reunião com Lucas sobre projeto
                            </div>
                            <div class="flex items-center gap-2 text-[9px] text-text-dim">
                              <span>Amanhã, 14:00</span>
                              <span class="text-text-subtle">·</span>
                              <span class="text-[8px] px-1 py-px bg-bg border border-border rounded-full">
                                Trabalho
                              </span>
                            </div>
                            <div
                              class="text-[9px] text-text-dim border-l border-accent/40 pl-1.5 leading-snug whitespace-pre-line"
                            >
                              - Online via Teams
                              - Com: Lucas
                            </div>
                          </div>
                          <div
                            class="px-2 py-1 border-t border-border flex gap-1 justify-end"
                          >
                            <div
                              class="text-[8px] px-1.5 py-0.5 rounded border border-border text-text-dim"
                            >
                              Ajustar
                            </div>
                            <div
                              class="text-[8px] px-1.5 py-0.5 rounded bg-accent text-white font-medium flex items-center gap-1"
                            >
                              <i class="fa-solid fa-check text-[6px]"></i>
                              Salvar
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="border-t border-border px-2 py-2 flex items-center gap-1.5">
                      <div
                        class="flex-1 bg-bg-input border border-border rounded px-2 py-1 text-[10px] text-text-subtle"
                      >
                        Escreve aqui...
                      </div>
                      <div
                        class="w-7 h-7 rounded border border-border grid place-items-center text-text-dim"
                      >
                        <i class="fa-solid fa-microphone text-[9px]"></i>
                      </div>
                      <div
                        class="w-7 h-7 rounded bg-accent grid place-items-center text-white"
                      >
                        <i class="fa-solid fa-paper-plane text-[9px]"></i>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>

          <p
            class="text-text-dim italic text-[14px] md:text-[15px] leading-relaxed max-w-xl"
            data-testid="landing-preview-quote"
          >
            "Anotado. Coloquei nas observações o que ainda precisa resolver."
          </p>
        </div>
      </section>

      <div
        class="relative h-px max-w-5xl mx-auto my-4 md:my-8"
        aria-hidden="true"
      >
        <div
          class="absolute inset-x-0 top-0 h-px"
          style="background: linear-gradient(90deg, transparent 0%, rgba(94, 106, 210, 0.4) 50%, transparent 100%);"
        ></div>
        <div
          class="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 rounded-full bg-accent/30 ring-4 ring-bg"
        ></div>
      </div>

      <section
        class="relative min-h-[60vh] px-6 py-24 max-w-5xl mx-auto flex flex-col justify-center items-center"
        data-testid="landing-cta"
        fadeInOnView
      >
        <div class="flex flex-col items-center gap-5 text-center">
          <h2
            class="text-3xl md:text-4xl font-bold tracking-tight max-w-2xl"
            data-testid="landing-cta-title"
          >
            Pronto pra organizar suas ideias?
          </h2>
          <p class="text-text-dim text-base md:text-lg max-w-xl">
            Leva menos de um minuto pra criar sua conta e capturar a primeira tarefa.
          </p>
          @if (autenticado()) {
            <a
              routerLink="/app/visao-geral"
              class="btn-primary px-6 py-3 text-sm shadow-accent mt-2 flex items-center gap-2"
              data-testid="landing-fim-cta-app"
            >
              <i class="fa-solid fa-arrow-right-to-bracket text-xs"></i>
              Ir pro <app-brand />
            </a>
          } @else {
            <a
              routerLink="/cadastro"
              class="btn-primary px-6 py-3 text-sm shadow-accent mt-2"
              data-testid="landing-fim-cta-cadastro"
            >
              Criar minha conta
            </a>
          }
        </div>
      </section>

      <app-site-footer />

    </div>
  `,
})
export class LandingComponent {
  private readonly storage = inject(TokenStorage);
  private readonly auth = inject(AuthService);

  scrollY = signal(0);
  previewQuebrou = signal(false);
  menuAberto = signal(false);

  autenticado = computed(() => this.storage.estaAutenticado());
  usuarioNome = computed(() => this.storage.usuario()?.nome ?? '');
  usuarioFoto = computed(() => this.storage.usuario()?.fotoUrl ?? null);

  alternarMenu(): void {
    this.menuAberto.update((v) => !v);
  }

  fecharMenu(): void {
    this.menuAberto.set(false);
  }

  sair(): void {
    this.auth.logout();
  }

  @HostListener('document:click')
  fecharMenuPorClique(): void {
    if (this.menuAberto()) this.menuAberto.set(false);
  }

  @HostListener('document:keydown.escape')
  fecharMenuPorEsc(): void {
    if (this.menuAberto()) this.menuAberto.set(false);
  }

  heroOpacity = computed(() => {
    const s = this.scrollY();
    return Math.max(0, 1 - s / 400);
  });

  heroTransform = computed(() => {
    const s = this.scrollY();
    return `translateY(${-s * 0.45}px)`;
  });

  rolarIndicadorOpacity = computed(() => {
    const s = this.scrollY();
    return Math.max(0, 1 - s / 150);
  });

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrollY.set(window.scrollY);
  }
}
