import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { TokenStorage } from '../../core/auth/token.storage';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';
import { LocaleSwitcherComponent } from '../../shared/locale-switcher.component';
import { LocaleService } from '../../core/locale/locale.service';
import { AvatarComponent } from '../../shared/avatar.component';
import { FadeInOnViewDirective } from '../../shared/fade-in-on-view.directive';
import { BrandComponent } from '../../shared/brand.component';
import { SiteFooterComponent } from '../../shared/site-footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, FadeInOnViewDirective, AvatarComponent, BrandComponent, ThemeToggleComponent, LocaleSwitcherComponent, SiteFooterComponent],
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
            <app-locale-switcher />
            <span class="hidden sm:inline-flex"><app-theme-toggle /></span>

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
                    @if (locale.locale() === 'pt') { Visão geral } @else { Overview }
                  </a>
                  <a
                    routerLink="/app/captura"
                    class="flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] text-text-dim hover:text-text hover:bg-bg-elev"
                    data-testid="landing-menu-nova-tarefa"
                    (click)="fecharMenu()"
                  >
                    <i class="fa-solid fa-microphone text-accent text-[12px] w-4 text-center"></i>
                    @if (locale.locale() === 'pt') { Falar } @else { Speak }
                  </a>
                  <div class="h-px bg-border my-1"></div>
                  <button
                    type="button"
                    class="flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] text-text-dim hover:text-danger hover:bg-danger/10 text-left"
                    data-testid="landing-menu-sair"
                    (click)="sair(); fecharMenu()"
                  >
                    <i class="fa-solid fa-right-from-bracket text-[12px] w-4 text-center"></i>
                    {{ locale.t('usermenu.signout') }}
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
                {{ locale.t('header.signin') }}
              </a>
              <a
                routerLink="/cadastro"
                class="btn-primary text-[13px] px-4 py-2"
                data-testid="landing-cta-cadastro"
              >
                {{ locale.t('header.create_account') }}
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
            V1
          </div>

          <h1
            class="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]"
            data-testid="landing-hero-title"
          >
            <span class="block text-text">{{ locale.t('landing.hero.title_line1') }}</span>
            <span
              class="block bg-clip-text text-transparent"
              style="background-image: linear-gradient(135deg, #5e6ad2 0%, #8b5cf6 50%, #ec4899 100%);"
            >
              {{ locale.t('landing.hero.title_highlight') }}
            </span>
            <span class="block text-text mt-2">
              @if (locale.locale() === 'pt') {
                O <app-brand /> chegou.
              } @else {
                <app-brand /> is here.
              }
            </span>
          </h1>

          <p class="text-text-dim text-lg md:text-xl max-w-2xl leading-relaxed">
            {{ locale.t('landing.hero.subtitle') }}
          </p>

          <div class="flex flex-col sm:flex-row gap-3 mt-2">
            @if (!autenticado()) {
              <a
                routerLink="/cadastro"
                class="btn-primary px-6 py-3 text-sm shadow-accent"
                data-testid="landing-hero-cta-cadastro"
              >
                {{ locale.t('landing.hero.cta_signup') }}
              </a>
              <a
                routerLink="/login"
                class="btn-secondary px-6 py-3 text-sm"
                data-testid="landing-hero-cta-login"
              >
                {{ locale.t('landing.hero.cta_signin') }}
              </a>
            } @else {
              <a
                routerLink="/app/visao-geral"
                class="btn-primary px-6 py-3 text-sm shadow-accent flex items-center gap-2"
                data-testid="landing-hero-cta-app"
              >
                <i class="fa-solid fa-arrow-right-to-bracket text-xs"></i>
                <span>
                  @if (locale.locale() === 'pt') { Ir pro <app-brand /> } @else { Open <app-brand /> }
                </span>
              </a>
            }
          </div>

        </div>

        <div
          class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-subtle text-[11px] tracking-wider uppercase"
          [style.opacity]="rolarIndicadorOpacity()"
          aria-hidden="true"
        >
          <span>{{ locale.t('landing.hero.scroll_hint') }}</span>
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
            {{ locale.t('landing.about.eyebrow') }}
          </div>
          <h2
            class="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6"
            data-testid="landing-sobre-title"
          >
            @if (locale.locale() === 'pt') { O que é o <app-brand />? }
            @else { What is <app-brand />? }
          </h2>
          <p class="text-text-dim text-lg leading-relaxed max-w-3xl mb-12">
            @if (locale.locale() === 'pt') {
              <app-brand /> é um organizador pessoal de ideias e tarefas com IA conversacional.
              Você fala ou escreve, ele entende o contexto e cria sua tarefa ou lembrete.
              Sem formulário robotizado, sem ruído, sem esforço. Tudo para facilitar seu dia.
            } @else {
              <app-brand /> is a personal organizer for ideas and tasks powered by conversational AI.
              You speak or write, it understands the context and creates your task or reminder.
              No robotic forms, no noise, no effort. Everything to make your day easier.
            }
          </p>

          <div class="feats-glow-wrap relative">
            <div class="feats-bg-glow" aria-hidden="true"></div>
            <div class="feats-bento relative">
              <div class="feat-card feat-card-1 card-elev p-5 flex flex-col items-center text-center gap-2.5" data-testid="feat-chat" style="--feat-color: 94, 106, 210;">
                <div class="feat-icon">
                  <i class="fa-solid fa-comments text-[18px]"></i>
                </div>
                <h3 class="text-[13px] font-semibold leading-tight">{{ locale.t('landing.feat.chat.title') }}</h3>
                <p class="text-[10.5px] text-text-subtle leading-tight">{{ locale.t('landing.feat.chat.tagline') }}</p>
              </div>

              <div class="feat-card feat-card-2 card-elev p-5 flex flex-col items-center text-center gap-2.5" data-testid="feat-voz" style="--feat-color: 236, 72, 153;">
                <div class="feat-icon">
                  <i class="fa-solid fa-microphone text-[18px]"></i>
                </div>
                <h3 class="text-[13px] font-semibold leading-tight">{{ locale.t('landing.feat.voice.title') }}</h3>
                <p class="text-[10.5px] text-text-subtle leading-tight">{{ locale.t('landing.feat.voice.tagline') }}</p>
              </div>

              <div class="feat-card feat-card-3 card-elev p-5 flex flex-col items-center text-center gap-2.5" data-testid="feat-categorias" style="--feat-color: 245, 158, 11;">
                <div class="feat-icon">
                  <i class="fa-solid fa-tags text-[18px]"></i>
                </div>
                <h3 class="text-[13px] font-semibold leading-tight">{{ locale.t('landing.feat.categories.title') }}</h3>
                <p class="text-[10.5px] text-text-subtle leading-tight">{{ locale.t('landing.feat.categories.tagline') }}</p>
              </div>

              <div class="feat-card feat-card-4 card-elev p-5 flex flex-col items-center text-center gap-2.5" data-testid="feat-metas" style="--feat-color: 16, 185, 129;">
                <div class="feat-icon">
                  <i class="fa-solid fa-bullseye text-[18px]"></i>
                </div>
                <h3 class="text-[13px] font-semibold leading-tight">{{ locale.t('landing.feat.goals.title') }}</h3>
                <p class="text-[10.5px] text-text-subtle leading-tight">{{ locale.t('landing.feat.goals.tagline') }}</p>
              </div>

              <div class="feat-card feat-card-5 card-elev p-5 flex flex-col items-center text-center gap-2.5" data-testid="feat-dia" style="--feat-color: 6, 182, 212;">
                <div class="feat-icon">
                  <i class="fa-solid fa-calendar-day text-[18px]"></i>
                </div>
                <h3 class="text-[13px] font-semibold leading-tight">{{ locale.t('landing.feat.day.title') }}</h3>
                <p class="text-[10.5px] text-text-subtle leading-tight">{{ locale.t('landing.feat.day.tagline') }}</p>
              </div>

              <div class="feat-card feat-card-6 card-elev p-5 flex flex-col items-center text-center gap-2.5" data-testid="feat-concluidas" style="--feat-color: 249, 115, 22;">
                <div class="feat-icon">
                  <i class="fa-solid fa-circle-check text-[18px]"></i>
                </div>
                <h3 class="text-[13px] font-semibold leading-tight">{{ locale.t('landing.feat.done.title') }}</h3>
                <p class="text-[10.5px] text-text-subtle leading-tight">{{ locale.t('landing.feat.done.tagline') }}</p>
              </div>

              <!-- PLUS — full row destaque -->
              <div
                class="feat-card feat-card-7 relative p-6 md:p-8 flex flex-col md:flex-row items-center md:items-stretch text-center md:text-left gap-4 md:gap-6 rounded-xl border border-accent-violet/40 bg-gradient-to-br from-accent/15 via-accent-violet/15 to-rose-500/10 overflow-hidden"
                data-testid="feat-plus"
              >
                <div
                  class="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none"
                  style="background: radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%);"
                  aria-hidden="true"
                ></div>
                <span class="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider text-accent-violet bg-accent-violet/15 border border-accent-violet/40 rounded-full px-2 py-0.5">{{ locale.t('landing.feat.plus.badge') }}</span>
                <div class="w-16 h-16 rounded-xl bg-accent-violet/20 text-accent-violet grid place-items-center shrink-0 shadow-lg shadow-accent-violet/20">
                  <i class="fa-solid fa-spa text-[28px]"></i>
                </div>
                <div class="flex flex-col gap-1 md:gap-1.5 flex-1 min-w-0">
                  <h3 class="text-[18px] md:text-[20px] font-semibold leading-tight">{{ locale.t('landing.feat.plus.title') }}</h3>
                  <p class="text-[13px] text-text-dim leading-relaxed max-w-[480px]">
                    {{ locale.t('landing.feat.plus.body') }}
                  </p>
                </div>
              </div>
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
              @if (locale.locale() === 'pt') { Converse com o <app-brand /> }
              @else { Talk to <app-brand /> }
            </div>
            <h2
              class="text-3xl md:text-4xl font-bold tracking-tight max-w-2xl"
              data-testid="landing-preview-title"
            >
              {{ locale.t('landing.how.title') }}
            </h2>
            <p class="text-text-dim text-base md:text-lg leading-relaxed max-w-2xl">
              @if (locale.locale() === 'pt') {
                Tudo começa com uma conversa. Por texto ou voz, você diz o que
                precisa fazer, e <app-brand /> transforma cada palavra em tarefas,
                lembretes e prazos organizados — do seu jeito.
              } @else {
                It all starts with a conversation. By text or voice, you say what
                needs to be done, and <app-brand /> turns each word into tasks,
                reminders and deadlines — your way.
              }
            </p>
          </div>

          <div
            class="relative w-full max-w-[520px] md:max-w-[600px] rounded-xl border border-border-strong bg-bg-elev overflow-hidden shadow-accent"
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
                <!-- Mockup CSS-art só do card do chat (frame já é o card) -->
                <div
                  class="flex flex-col"
                  data-testid="landing-preview-mockup"
                  aria-hidden="true"
                >
                    <!-- Chat header -->
                    <div class="flex items-center gap-2.5 px-4 md:px-5 py-3 md:py-4 border-b border-border">
                      <img src="/logo.png" alt="Liriun" class="w-7 h-7 md:w-9 md:h-9 rounded object-contain" />
                      <div class="flex flex-col leading-tight flex-1 min-w-0">
                        <strong class="text-text font-semibold text-[13px] md:text-[15px]"><app-brand /></strong>
                        <span class="text-[10px] md:text-[11px] text-text-subtle flex items-center gap-1">
                          <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          online
                        </span>
                      </div>
                      <div class="text-[10px] md:text-[12px] px-2 md:px-2.5 py-1 md:py-1.5 rounded bg-accent/15 text-accent border border-accent/30 font-medium flex items-center gap-1.5">
                        <i class="fa-solid fa-plus text-[8px] md:text-[9px]"></i>
                        @if (locale.locale() === 'pt') { Novo chat } @else { New chat }
                      </div>
                      <div class="text-text-subtle text-[14px] md:text-[18px] leading-none">×</div>
                    </div>

                    <!-- Messages -->
                    <div class="px-4 md:px-5 py-4 md:py-5 flex flex-col gap-3 md:gap-4 min-h-[360px] md:min-h-[440px]">
                      <div class="flex items-start gap-2 md:gap-2.5">
                        <img class="w-6 h-6 md:w-7 md:h-7 rounded object-contain shrink-0 mt-0.5" src="/logo.png" alt="Liriun" />
                        <div class="bg-bg-input border border-border rounded-lg rounded-tl-sm px-3 md:px-4 py-2 md:py-2.5 text-[12px] md:text-[14px] max-w-[85%] text-text-dim">
                          @if (locale.locale() === 'pt') {
                            Olá Lucas, no que posso te ajudar hoje?
                          } @else {
                            Hi Lucas, how can I help you today?
                          }
                        </div>
                      </div>

                      <div class="flex justify-end">
                        <div class="bg-accent/15 border border-accent/30 rounded-lg rounded-tr-sm px-3 md:px-4 py-2 md:py-2.5 text-[12px] md:text-[14px] max-w-[85%]">
                          @if (locale.locale() === 'pt') {
                            Tenho reunião amanhã às 14h, online via Teams, com o Lucas
                          } @else {
                            I have a meeting tomorrow at 2pm, online via Teams, with Lucas
                          }
                        </div>
                      </div>

                      <div class="flex items-start gap-2 md:gap-2.5">
                        <img class="w-6 h-6 md:w-7 md:h-7 rounded object-contain shrink-0 mt-0.5" src="/logo.png" alt="Liriun" />
                        <div class="bg-bg-input border border-border rounded-lg rounded-tl-sm px-3 md:px-4 py-2 md:py-2.5 text-[12px] md:text-[14px] max-w-[85%] text-text-dim">
                          @if (locale.locale() === 'pt') {
                            Anotado. Faltou só o local — ajustes se quiser.
                          } @else {
                            Got it. Only the location is missing — adjust if you’d like.
                          }
                        </div>
                      </div>

                      <div class="flex items-start gap-2 md:gap-2.5">
                        <img class="w-6 h-6 md:w-7 md:h-7 rounded object-contain shrink-0 mt-0.5" src="/logo.png" alt="Liriun" />
                        <div class="flex-1 bg-bg-input border border-accent/40 rounded-lg overflow-hidden">
                          <div class="px-2.5 md:px-3 py-1 md:py-1.5 border-b border-border bg-accent/5 flex items-center gap-1.5 text-[9px] md:text-[10px] uppercase tracking-wider text-accent font-semibold">
                            <i class="fa-solid fa-clipboard-check text-[8px] md:text-[9px]"></i>
                            @if (locale.locale() === 'pt') { Tarefa pronta } @else { Task ready }
                          </div>
                          <div class="p-2.5 md:p-3 flex flex-col gap-1.5">
                            <div class="text-[12px] md:text-[14px] font-medium">
                              @if (locale.locale() === 'pt') { Reunião com Lucas } @else { Meeting with Lucas }
                            </div>
                            <div class="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-[12px] text-text-dim flex-wrap">
                              <span>@if (locale.locale() === 'pt') { Amanhã, 14:00 } @else { Tomorrow, 2:00 PM }</span>
                              <span class="text-text-subtle">·</span>
                              <span class="text-[9px] md:text-[10px] px-1.5 md:px-2 py-px bg-bg border border-border rounded-full">
                                @if (locale.locale() === 'pt') { Trabalho } @else { Work }
                              </span>
                            </div>
                            <div class="text-[10px] md:text-[12px] text-text-dim border-l-2 border-accent/40 pl-2 leading-snug mt-1 whitespace-pre-line">
                              @if (locale.locale() === 'pt') {
Online via Teams
Com: Lucas
                              } @else {
Online via Teams
With: Lucas
                              }
                            </div>
                          </div>
                          <div class="px-2.5 md:px-3 py-1.5 md:py-2 border-t border-border flex gap-1.5 md:gap-2 justify-end">
                            <div class="text-[9px] md:text-[11px] px-2 md:px-2.5 py-0.5 md:py-1 rounded border border-border text-text-dim">
                              @if (locale.locale() === 'pt') { Ajustar } @else { Adjust }
                            </div>
                            <div class="text-[9px] md:text-[11px] px-2 md:px-2.5 py-0.5 md:py-1 rounded bg-accent text-white font-medium flex items-center gap-1">
                              <i class="fa-solid fa-check text-[7px] md:text-[9px]"></i>
                              @if (locale.locale() === 'pt') { Salvar } @else { Save }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Input + hotkeys -->
                    <div class="border-t border-border px-3 md:px-4 py-2.5 md:py-3 flex flex-col gap-1.5 md:gap-2">
                      <div class="flex items-center gap-1.5 md:gap-2">
                        <div class="flex-1 bg-bg-input border border-border rounded px-2.5 md:px-3 py-1.5 md:py-2 text-[11px] md:text-[13px] text-text-subtle">
                          @if (locale.locale() === 'pt') { Escreve aqui... } @else { Write here... }
                        </div>
                        <div class="w-8 h-8 md:w-9 md:h-9 rounded border border-border grid place-items-center text-text-dim">
                          <i class="fa-solid fa-microphone text-[10px] md:text-[12px]"></i>
                        </div>
                        <div class="w-8 h-8 md:w-9 md:h-9 rounded-full bg-accent grid place-items-center text-white">
                          <i class="fa-solid fa-arrow-up text-[10px] md:text-[12px]"></i>
                        </div>
                      </div>
                      <div class="flex items-center justify-end gap-1.5 md:gap-2 text-[9px] md:text-[11px] text-text-subtle">
                        <span class="px-1 md:px-1.5 rounded border border-border bg-bg">Ctrl</span>
                        <span>+</span>
                        <span class="px-1 md:px-1.5 rounded border border-border bg-bg">
                          @if (locale.locale() === 'pt') { Espaço } @else { Space }
                        </span>
                        <span class="text-text-dim">@if (locale.locale() === 'pt') { grava } @else { record }</span>
                        <span>·</span>
                        <span class="px-1 md:px-1.5 rounded border border-border bg-bg">Esc</span>
                        <span class="text-text-dim">@if (locale.locale() === 'pt') { fecha } @else { close }</span>
                      </div>
                    </div>
                </div>
              }
            </div>

          <div class="flex flex-col items-center gap-4 mt-2" data-testid="landing-preview-cta">
            <p class="text-text-dim italic text-[14px] md:text-[16px] leading-relaxed max-w-xl text-center">
              @if (locale.locale() === 'pt') {
                Conversa real com o <app-brand />. Você fala como falaria com um amigo.
              } @else {
                A real conversation with <app-brand />. You talk to it like you would with a friend.
              }
            </p>
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
        class="relative min-h-[60vh] px-6 py-24 max-w-5xl mx-auto flex flex-col justify-center items-center"
        data-testid="landing-cta"
        fadeInOnView
      >
        <div class="flex flex-col items-center gap-5 text-center">
          <h2
            class="text-3xl md:text-4xl font-bold tracking-tight max-w-2xl"
            data-testid="landing-cta-title"
          >
            {{ locale.t('landing.cta.title') }}
          </h2>
          <p class="text-text-dim text-base md:text-lg max-w-xl">
            {{ locale.t('landing.cta.body') }}
          </p>
          @if (autenticado()) {
            <a
              routerLink="/app/visao-geral"
              class="btn-primary px-6 py-3 text-sm shadow-accent mt-2 flex items-center gap-2"
              data-testid="landing-fim-cta-app"
            >
              <i class="fa-solid fa-arrow-right-to-bracket text-xs"></i>
              <span>
                @if (locale.locale() === 'pt') { Ir pro <app-brand /> } @else { Open <app-brand /> }
              </span>
            </a>
          } @else {
            <a
              routerLink="/cadastro"
              class="btn-primary px-6 py-3 text-sm shadow-accent mt-2"
              data-testid="landing-fim-cta-cadastro"
            >
              {{ locale.t('landing.cta.signup') }}
            </a>
          }
        </div>
      </section>

      <app-site-footer />

    </div>
  `,
  styles: [`
    /* Background glow atrás dos cards */
    .feats-glow-wrap { position: relative; }
    .feats-bg-glow {
      position: absolute;
      inset: -2rem;
      background:
        radial-gradient(ellipse 60% 50% at 20% 30%, rgba(94, 106, 210, 0.10), transparent 60%),
        radial-gradient(ellipse 50% 40% at 80% 70%, rgba(139, 92, 246, 0.10), transparent 60%);
      pointer-events: none;
      z-index: 0;
      filter: blur(40px);
    }

    .feats-bento {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(2, 1fr);
    }
    /* Mobile: Plus ocupa linha inteira */
    .feats-bento .feat-card-7 { grid-column: 1 / span 2; }

    @media (min-width: 768px) {
      .feats-bento {
        grid-template-columns: repeat(6, 1fr);
        gap: 1rem;
      }
      .feats-bento .feat-card-1 { grid-column: 1 / span 2; }
      .feats-bento .feat-card-2 { grid-column: 3 / span 2; }
      .feats-bento .feat-card-3 { grid-column: 5 / span 2; }
      .feats-bento .feat-card-4 { grid-column: 1 / span 2; }
      .feats-bento .feat-card-5 { grid-column: 3 / span 2; }
      .feats-bento .feat-card-6 { grid-column: 5 / span 2; }
      .feats-bento .feat-card-7 { grid-column: 1 / span 6; }
    }

    /* Cards animation in */
    .feat-card {
      animation: feat-fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
      transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1), border-color 240ms, box-shadow 280ms;
    }
    .feat-card-1 { animation-delay: 0ms; }
    .feat-card-2 { animation-delay: 80ms; }
    .feat-card-3 { animation-delay: 160ms; }
    .feat-card-4 { animation-delay: 240ms; }
    .feat-card-5 { animation-delay: 320ms; }
    .feat-card-6 { animation-delay: 400ms; }
    .feat-card-7 { animation-delay: 500ms; }

    @keyframes feat-fade-up {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Ícone colorido por card via CSS var */
    .feat-icon {
      width: 3rem;
      height: 3rem;
      border-radius: 0.5rem;
      display: grid;
      place-items: center;
      background: rgba(var(--feat-color), 0.12);
      color: rgb(var(--feat-color));
      transition: transform 240ms, background-color 240ms, box-shadow 240ms;
    }

    .feat-card:hover {
      transform: translateY(-5px);
      border-color: rgba(var(--feat-color), 0.4);
      box-shadow: 0 14px 32px -12px rgba(var(--feat-color), 0.45);
    }
    .feat-card:hover .feat-icon {
      transform: scale(1.1) rotate(-4deg);
      background: rgba(var(--feat-color), 0.2);
      box-shadow: 0 0 24px -4px rgba(var(--feat-color), 0.5);
    }

    /* Plus tem hover próprio mais sutil */
    .feat-card-7:hover {
      transform: translateY(-3px);
      box-shadow: 0 18px 40px -12px rgba(139, 92, 246, 0.4);
    }

    @media (prefers-reduced-motion: reduce) {
      .feat-card,
      .feat-icon { animation: none !important; transition: none !important; }
      .feat-card:hover,
      .feat-card:hover .feat-icon { transform: none !important; }
    }
  `],
})
export class LandingComponent {
  private readonly storage = inject(TokenStorage);
  readonly locale = inject(LocaleService);
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
