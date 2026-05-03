import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { TokenStorage } from '../../core/auth/token.storage';
import { ThemeService } from '../../core/theme/theme.service';
import { AvatarComponent } from '../../shared/avatar.component';
import { FadeInOnViewDirective } from '../../shared/fade-in-on-view.directive';
import { BrandComponent } from '../../shared/brand.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, FadeInOnViewDirective, AvatarComponent, BrandComponent],
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
              class="w-7 h-7 rounded-md object-contain"
              aria-hidden="true"
            />
            <div class="text-[15px] font-semibold tracking-tight"><app-brand /></div>
          </a>

          <div class="flex items-center gap-2">
            <span class="text-[12px] font-medium text-text-dim hidden sm:inline">Tema</span>
            <button
              type="button"
              class="theme-switch"
              role="switch"
              [attr.aria-checked]="temaAtual() === 'light'"
              [attr.aria-label]="
                temaAtual() === 'dark' ? 'Mudar pra tema claro' : 'Mudar pra tema escuro'
              "
              [title]="temaAtual() === 'dark' ? 'Mudar pra claro' : 'Mudar pra escuro'"
              [class.is-light]="temaAtual() === 'light'"
              data-testid="landing-theme-toggle"
              (click)="alternarTema()"
            >
              <span class="theme-switch-track">
                <i class="fa-solid fa-moon theme-switch-icon theme-switch-icon-moon"></i>
                <i class="fa-solid fa-sun theme-switch-icon theme-switch-icon-sun"></i>
                <span class="theme-switch-knob">
                  @if (temaAtual() === 'dark') {
                    <i class="fa-solid fa-moon text-[10px]"></i>
                  } @else {
                    <i class="fa-solid fa-sun text-[10px]"></i>
                  }
                </span>
              </span>
            </button>

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
              Tudo que importa, num só lugar.
            </h2>
            <p class="text-text-dim text-base md:text-lg leading-relaxed max-w-2xl">
              Visão geral com agenda do dia, atividade da semana e distribuição por categoria.
              Bate o olho e sabe o que precisa fazer agora.
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
                <!-- Mockup CSS-art da Visão geral (fallback quando liriun-preview.png não existe) -->
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
                      class="flex items-center gap-2 px-2 py-1 rounded bg-accent/10 text-text text-[11px] relative"
                    >
                      <span
                        class="absolute -left-3 top-1.5 bottom-1.5 w-0.5 bg-accent rounded-r"
                      ></span>
                      <i class="fa-solid fa-house text-accent text-[9px] w-3"></i>
                      <span>Visão geral</span>
                    </div>

                    <div
                      class="text-[9px] text-text-subtle uppercase tracking-wider px-1 py-1 font-semibold mt-1.5"
                    >
                      Minhas tarefas
                    </div>
                    <div
                      class="flex items-center gap-2 px-2 py-1 rounded text-text-dim text-[11px]"
                    >
                      <i class="fa-solid fa-bolt text-[9px] w-3"></i>
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
                      <i class="fa-solid fa-house text-accent text-[10px]"></i>
                      <strong class="text-text font-medium text-[10px]">Visão geral</strong>
                    </div>

                    <div class="flex-1 px-3 py-3 flex flex-col gap-2 overflow-hidden">
                      <div class="flex items-center gap-2 mb-1">
                        <div
                          class="w-7 h-7 rounded-md bg-logo-grad grid place-items-center text-[11px] font-bold text-white shrink-0"
                          style="box-shadow: 0 0 10px rgba(94, 106, 210, 0.35);"
                        >
                          P
                        </div>
                        <div class="flex flex-col leading-tight">
                          <div class="text-[12px] font-semibold tracking-tight">
                            <span class="text-text-dim">Boa tarde,</span>
                            <span
                              class="bg-clip-text text-transparent ml-0.5"
                              style="background-image: linear-gradient(135deg, #5e6ad2 0%, #8b5cf6 50%, #ec4899 100%);"
                            >Pedro.</span>
                          </div>
                          <div class="text-[9px] text-text-dim">1 atrasada esperando você.</div>
                        </div>
                      </div>

                      <div class="grid grid-cols-4 gap-1.5">
                        <div class="border border-border rounded-md p-1.5 bg-bg-elev flex flex-col gap-0.5">
                          <div class="text-[7px] uppercase tracking-wider text-text-subtle font-semibold">Hoje</div>
                          <div class="text-[14px] font-bold tabular-nums leading-none">2</div>
                        </div>
                        <div class="border border-danger/40 rounded-md p-1.5 bg-danger/10 flex flex-col gap-0.5">
                          <div class="text-[7px] uppercase tracking-wider text-danger/80 font-semibold">Atrasadas</div>
                          <div class="text-[14px] font-bold tabular-nums leading-none text-danger">1</div>
                        </div>
                        <div class="border border-border rounded-md p-1.5 bg-bg-elev flex flex-col gap-0.5">
                          <div class="text-[7px] uppercase tracking-wider text-text-subtle font-semibold">Semana</div>
                          <div class="text-[14px] font-bold tabular-nums leading-none">5</div>
                        </div>
                        <div class="border border-accent/40 rounded-md p-1.5 bg-accent/10 flex flex-col gap-0.5">
                          <div class="text-[7px] uppercase tracking-wider text-accent font-semibold">+ Nova</div>
                          <div class="text-[10px] font-medium leading-none mt-1">Liriun</div>
                        </div>
                      </div>

                      <div class="grid grid-cols-[1fr_1.4fr] gap-1.5 flex-1 min-h-0">
                        <div class="border border-border rounded-md bg-bg-elev p-1.5 flex flex-col gap-1 overflow-hidden">
                          <div class="flex items-center gap-1 text-[9px] font-semibold">
                            <i class="fa-solid fa-calendar-day text-accent text-[8px]"></i>
                            Agenda
                          </div>
                          <div class="flex flex-col gap-0.5 text-[8px] text-text-dim relative">
                            <div class="flex justify-between"><span>09h</span><span></span></div>
                            <div class="flex justify-between items-center">
                              <span>10h</span>
                              <span class="bg-accent/25 border border-accent/40 rounded px-1 py-px text-[7px] text-text">Reunião</span>
                            </div>
                            <div class="flex justify-between"><span>11h</span><span></span></div>
                            <div class="flex justify-between"><span>12h</span><span></span></div>
                            <div class="flex justify-between items-center relative">
                              <span>14h</span>
                              <div class="absolute left-0 right-0 h-px bg-danger top-1/2"></div>
                              <span class="bg-danger text-white rounded text-[6px] px-0.5 z-10">14:30</span>
                            </div>
                            <div class="flex justify-between items-center">
                              <span>15h</span>
                              <span class="bg-accent/25 border border-accent/40 rounded px-1 py-px text-[7px] text-text">Estudo</span>
                            </div>
                            <div class="flex justify-between"><span>16h</span><span></span></div>
                          </div>
                        </div>

                        <div class="flex flex-col gap-1.5 min-h-0">
                          <div class="border border-border rounded-md bg-bg-elev p-1.5 flex flex-col gap-1">
                            <div class="text-[9px] font-semibold">Atividade da semana</div>
                            <div class="flex items-end justify-between gap-1 h-10">
                              <div class="flex-1 flex items-end gap-px justify-center">
                                <div class="w-1 bg-accent/70 rounded-t" style="height:30%"></div>
                                <div class="w-1 bg-emerald-500/70 rounded-t" style="height:20%"></div>
                              </div>
                              <div class="flex-1 flex items-end gap-px justify-center">
                                <div class="w-1 bg-accent/70 rounded-t" style="height:60%"></div>
                                <div class="w-1 bg-emerald-500/70 rounded-t" style="height:40%"></div>
                              </div>
                              <div class="flex-1 flex items-end gap-px justify-center">
                                <div class="w-1 bg-accent/70 rounded-t" style="height:45%"></div>
                                <div class="w-1 bg-emerald-500/70 rounded-t" style="height:60%"></div>
                              </div>
                              <div class="flex-1 flex items-end gap-px justify-center">
                                <div class="w-1 bg-accent/70 rounded-t" style="height:80%"></div>
                                <div class="w-1 bg-emerald-500/70 rounded-t" style="height:35%"></div>
                              </div>
                              <div class="flex-1 flex items-end gap-px justify-center">
                                <div class="w-1 bg-accent/70 rounded-t" style="height:50%"></div>
                                <div class="w-1 bg-emerald-500/70 rounded-t" style="height:75%"></div>
                              </div>
                              <div class="flex-1 flex items-end gap-px justify-center">
                                <div class="w-1 bg-accent/70 rounded-t" style="height:25%"></div>
                                <div class="w-1 bg-emerald-500/70 rounded-t" style="height:55%"></div>
                              </div>
                              <div class="flex-1 flex items-end gap-px justify-center">
                                <div class="w-1 bg-accent/70 rounded-t" style="height:15%"></div>
                                <div class="w-1 bg-emerald-500/70 rounded-t" style="height:25%"></div>
                              </div>
                            </div>
                          </div>
                          <div class="border border-border rounded-md bg-bg-elev p-1.5 flex items-center gap-2">
                            <svg viewBox="0 0 36 36" class="w-9 h-9 shrink-0">
                              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1c1d22" stroke-width="3.5" />
                              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#5e6ad2" stroke-width="3.5"
                                stroke-dasharray="40 60" stroke-dashoffset="100" transform="rotate(-90 18 18)" />
                              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" stroke-width="3.5"
                                stroke-dasharray="35 65" stroke-dashoffset="60" transform="rotate(-90 18 18)" />
                              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f59e0b" stroke-width="3.5"
                                stroke-dasharray="25 75" stroke-dashoffset="25" transform="rotate(-90 18 18)" />
                            </svg>
                            <div class="flex flex-col gap-0.5 text-[8px] flex-1">
                              <div class="flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-sm bg-accent"></span>
                                <span class="flex-1 text-text-dim">Trabalho</span>
                                <span class="tabular-nums text-text-dim">2</span>
                              </div>
                              <div class="flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-sm bg-emerald-500"></span>
                                <span class="flex-1 text-text-dim">Faculdade</span>
                                <span class="tabular-nums text-text-dim">1</span>
                              </div>
                              <div class="flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-sm bg-amber-500"></span>
                                <span class="flex-1 text-text-dim">Pessoal</span>
                                <span class="tabular-nums text-text-dim">1</span>
                              </div>
                            </div>
                          </div>
                        </div>
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
            "Boa tarde, Pedro. 1 atrasada esperando você. Bora resolver."
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
              routerLink="/app/captura"
              class="btn-primary px-6 py-3 text-sm shadow-accent mt-2"
              data-testid="landing-fim-cta-app"
            >
              Entrar no app
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

      <footer
        class="border-t border-border/50 py-8 px-6 text-center text-text-subtle text-[11px] tracking-wider"
      >
        LIRIUN • v0.1 BETA
      </footer>
    </div>
  `,
  styles: [
    `
      .theme-switch {
        background: transparent;
        border: 0;
        padding: 0;
        cursor: pointer;
        line-height: 0;
      }
      .theme-switch-track {
        position: relative;
        display: inline-flex;
        align-items: center;
        width: 56px;
        height: 28px;
        border-radius: 9999px;
        background: rgb(var(--c-bg-elev));
        border: 1px solid rgb(var(--c-border));
        transition: background-color 200ms cubic-bezier(0.22, 1, 0.36, 1),
          border-color 200ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      .theme-switch:hover .theme-switch-track {
        border-color: rgb(var(--c-border-strong));
      }
      .theme-switch-icon {
        position: absolute;
        font-size: 10px;
        color: rgb(var(--c-text-subtle));
        pointer-events: none;
        transition: opacity 200ms ease;
      }
      .theme-switch-icon-moon {
        left: 8px;
      }
      .theme-switch-icon-sun {
        right: 8px;
      }
      .theme-switch.is-light .theme-switch-icon-sun {
        opacity: 0;
      }
      .theme-switch:not(.is-light) .theme-switch-icon-moon {
        opacity: 0;
      }
      .theme-switch-knob {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 22px;
        height: 22px;
        border-radius: 9999px;
        background: rgb(var(--c-accent));
        color: #ffffff;
        display: grid;
        place-items: center;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
        transition: transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1),
          background-color 200ms ease;
      }
      .theme-switch.is-light .theme-switch-knob {
        transform: translateX(28px);
        background: #f59e0b;
      }
    `,
  ],
})
export class LandingComponent {
  private readonly storage = inject(TokenStorage);
  private readonly auth = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  readonly temaAtual = this.themeService.theme;

  alternarTema(): void {
    this.themeService.alternar();
  }

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
