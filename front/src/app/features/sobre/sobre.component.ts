import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TokenStorage } from '../../core/auth/token.storage';
import { BrandComponent } from '../../shared/brand.component';
import { SiteFooterComponent } from '../../shared/site-footer.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';
import { UserMenuComponent } from '../../shared/user-menu.component';
import { LocaleSwitcherComponent } from '../../shared/locale-switcher.component';
import { LocaleService } from '../../core/locale/locale.service';

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [RouterLink, BrandComponent, SiteFooterComponent, ThemeToggleComponent, UserMenuComponent, LocaleSwitcherComponent],
  template: `
    <main class="min-h-screen bg-bg text-text" data-testid="sobre-page">
      <header
        class="sticky top-0 z-30 backdrop-blur-md bg-bg/70 border-b border-border/50"
      >
        <div class="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
          <a
            routerLink="/"
            class="inline-flex items-center gap-2 text-[13px] font-medium text-text-dim hover:text-accent transition-colors"
            data-testid="sobre-home-link"
          >
            <i class="fa-solid fa-arrow-left text-xs"></i>
            Início
          </a>
          <a routerLink="/" class="flex items-center gap-2.5" aria-label="Liriun — início">
            <img src="/logo.png" alt="" class="w-8 h-8 object-contain" aria-hidden="true" />
            <span class="text-[15px] font-semibold tracking-tight"><app-brand /></span>
          </a>
          <div class="flex items-center gap-2">
            <app-locale-switcher />
            <span class="hidden sm:inline-flex"><app-theme-toggle /></span>
            <app-user-menu />
          </div>
        </div>
      </header>

      <article class="max-w-3xl mx-auto px-4 sm:px-8 py-12 md:py-16 flex flex-col gap-14">
        <section class="flex flex-col gap-5 scroll-mt-20" id="o-que-e" data-testid="sobre-secao-o-que-e">
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
            @if (locale.locale() === 'pt') { O que é o <app-brand /> } @else { About <app-brand /> }
          </div>
          <h1 class="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
            {{ locale.t('sobre.about.title') }}
          </h1>
          <p class="text-text-dim text-lg leading-relaxed">
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
          <p class="text-text-dim text-base leading-relaxed">
            @if (locale.locale() === 'pt') {
              Mais do que uma agenda, <app-brand /> é um espaço pra sua mente respirar. Tudo
              que importa, organizado num lugar só — pra você ter foco no que realmente importa.
            } @else {
              More than an agenda, <app-brand /> is a space for your mind to breathe. Everything
              that matters, organized in one place — so you can focus on what truly counts.
            }
          </p>

          <div
            class="relative w-full rounded-xl border border-border-strong bg-bg-elev overflow-hidden shadow-accent mt-4"
            data-testid="sobre-preview-chat"
          >
            <div class="aspect-[16/10] flex text-left bg-bg" aria-hidden="true">
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
                  <div class="text-[12px] font-semibold tracking-tight"><app-brand /></div>
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
                  Tarefas
                </div>
                <div
                  class="flex items-center gap-2 px-2 py-1 rounded bg-accent/10 text-text text-[11px] relative"
                >
                  <span
                    class="absolute -left-3 top-1.5 bottom-1.5 w-0.5 bg-accent rounded-r"
                  ></span>
                  <i class="fa-solid fa-microphone text-accent text-[9px] w-3"></i>
                  <span>Falar</span>
                </div>
                <div
                  class="flex items-center gap-2 px-2 py-1 rounded text-text-dim text-[11px]"
                >
                  <i class="fa-solid fa-house text-[9px] w-3"></i>
                  <span>Hoje</span>
                </div>
                <div
                  class="flex items-center gap-2 px-2 py-1 rounded text-text-dim text-[11px]"
                >
                  <i class="fa-solid fa-list-check text-[9px] w-3"></i>
                  <span>Tarefas</span>
                </div>
                <div
                  class="flex items-center gap-2 px-2 py-1 rounded text-text-dim text-[11px]"
                >
                  <i class="fa-solid fa-circle-check text-[9px] w-3"></i>
                  <span>Histórico</span>
                </div>
              </div>

              <div class="flex-1 flex flex-col overflow-hidden">
                <div class="flex items-center gap-2 px-3 py-2 border-b border-border">
                  <i class="fa-solid fa-microphone text-accent text-[10px]"></i>
                  <strong class="text-text font-medium text-[10px]">Falar</strong>
                </div>
                <div class="flex-1 px-3 py-3 flex flex-col gap-2 overflow-hidden">
                  <div class="flex justify-end">
                    <div
                      class="bg-accent/15 border border-accent/30 rounded-lg rounded-tr-sm px-2.5 py-1.5 text-[11px] max-w-[80%]"
                    >
                      Preciso comprar leite, pão e ovos amanhã antes das 10h
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
                        <div class="text-[11px] font-medium">Compras: leite, pão, ovos</div>
                        <div class="flex items-center gap-2 text-[9px] text-text-dim">
                          <span>Amanhã, 10:00</span>
                          <span class="text-text-subtle">·</span>
                          <span
                            class="text-[8px] px-1 py-px bg-bg border border-border rounded-full"
                            >Compras</span
                          >
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
                  <div class="w-7 h-7 rounded bg-accent grid place-items-center text-white">
                    <i class="fa-solid fa-paper-plane text-[9px]"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p class="text-text-subtle text-[11px] text-center italic">
            @if (locale.locale() === 'pt') {
              Conversa real com o <app-brand />. Você fala como falaria com um amigo.
            } @else {
              A real conversation with <app-brand />. You talk to it like you would with a friend.
            }
          </p>

          <div class="flex flex-col gap-3 mt-6">
            <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
              {{ locale.t('sobre.audience.eyebrow') }}
            </div>
            <h3 class="text-[20px] md:text-[22px] font-semibold tracking-tight">
              @if (locale.locale() === 'pt') { Quem usa o <app-brand /> no dia a dia. }
              @else { Who uses <app-brand /> every day. }
            </h3>
          </div>

          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
            <div class="card-elev p-4 flex flex-col gap-1.5" data-testid="sobre-publico-1">
              <i class="fa-solid fa-briefcase text-accent text-base"></i>
              <h3 class="text-[14px] font-semibold">{{ locale.t('sobre.audience.pro.title') }}</h3>
              <p class="text-text-dim text-[12px] leading-relaxed">
                {{ locale.t('sobre.audience.pro.body') }}
              </p>
            </div>
            <div class="card-elev p-4 flex flex-col gap-1.5" data-testid="sobre-publico-2">
              <i class="fa-solid fa-graduation-cap text-accent text-base"></i>
              <h3 class="text-[14px] font-semibold">{{ locale.t('sobre.audience.student.title') }}</h3>
              <p class="text-text-dim text-[12px] leading-relaxed">
                @if (locale.locale() === 'pt') {
                  Provas, trabalhos, leituras. <app-brand /> guarda os prazos pra você focar em estudar.
                } @else {
                  Exams, papers, readings. <app-brand /> keeps the deadlines so you can focus on studying.
                }
              </p>
            </div>
            <div class="card-elev p-4 flex flex-col gap-1.5" data-testid="sobre-publico-3">
              <i class="fa-solid fa-house text-accent text-base"></i>
              <h3 class="text-[14px] font-semibold">{{ locale.t('sobre.audience.home.title') }}</h3>
              <p class="text-text-dim text-[12px] leading-relaxed">
                {{ locale.t('sobre.audience.home.body') }}
              </p>
            </div>
            <div class="card-elev p-4 flex flex-col gap-1.5" data-testid="sobre-publico-4">
              <i class="fa-solid fa-lightbulb text-accent text-base"></i>
              <h3 class="text-[14px] font-semibold">{{ locale.t('sobre.audience.creative.title') }}</h3>
              <p class="text-text-dim text-[12px] leading-relaxed">
                {{ locale.t('sobre.audience.creative.body') }}
              </p>
            </div>
          </div>
        </section>

        <section class="flex flex-col gap-6 scroll-mt-20" id="como-funciona" data-testid="sobre-secao-como-funciona">
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
            {{ locale.t('sobre.how.eyebrow') }}
          </div>
          <h2 class="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            {{ locale.t('sobre.how.title') }}
          </h2>

          <div class="flex flex-col gap-4 mt-2">
            <div class="card-elev p-5 flex gap-4 items-start" data-testid="sobre-passo-1">
              <div class="w-9 h-9 shrink-0 rounded-full bg-accent/15 text-accent grid place-items-center font-bold">1</div>
              <div class="flex flex-col gap-1.5">
                <h3 class="text-base font-semibold flex items-center gap-2">
                  <i class="fa-solid fa-pencil text-accent text-sm"></i>
                  {{ locale.t('sobre.how.write.title') }}
                </h3>
                <p class="text-text-dim text-[13px] leading-relaxed">
                  @if (locale.locale() === 'pt') {
                    Escreva como se estivesse mandando uma mensagem. <app-brand /> entende o contexto,
                    identifica datas e detalhes, e organiza tudo pra você.
                  } @else {
                    Write as if you were sending a message. <app-brand /> understands the context,
                    identifies dates and details, and organizes everything for you.
                  }
                </p>
              </div>
            </div>

            <div class="card-elev p-5 flex gap-4 items-start" data-testid="sobre-passo-2">
              <div class="w-9 h-9 shrink-0 rounded-full bg-accent/15 text-accent grid place-items-center font-bold">2</div>
              <div class="flex flex-col gap-1.5">
                <h3 class="text-base font-semibold flex items-center gap-2">
                  <i class="fa-solid fa-microphone text-accent text-sm"></i>
                  {{ locale.t('sobre.how.voice.title') }}
                </h3>
                <p class="text-text-dim text-[13px] leading-relaxed">
                  @if (locale.locale() === 'pt') {
                    Sem tempo pra digitar? Mande um áudio. <app-brand /> transcreve, interpreta e
                    devolve sua tarefa pronta — em segundos.
                  } @else {
                    No time to type? Send a voice message. <app-brand /> transcribes, interprets and
                    returns your task ready — in seconds.
                  }
                </p>
              </div>
            </div>

            <div class="card-elev p-5 flex gap-4 items-start" data-testid="sobre-passo-3">
              <div class="w-9 h-9 shrink-0 rounded-full bg-accent/15 text-accent grid place-items-center font-bold">3</div>
              <div class="flex flex-col gap-1.5">
                <h3 class="text-base font-semibold flex items-center gap-2">
                  <i class="fa-solid fa-pen-to-square text-accent text-sm"></i>
                  {{ locale.t('sobre.how.manual.title') }}
                </h3>
                <p class="text-text-dim text-[13px] leading-relaxed">
                  {{ locale.t('sobre.how.manual.body') }}
                </p>
              </div>
            </div>
          </div>

          <p class="text-text-dim text-[13px] italic leading-relaxed mt-2">
            @if (locale.locale() === 'pt') {
              Não importa como você prefere se comunicar. <app-brand /> entrega tudo no mesmo lugar,
              organizado e fácil de encontrar.
            } @else {
              No matter how you prefer to communicate. <app-brand /> delivers everything in the same place,
              organized and easy to find.
            }
          </p>
        </section>

        <section class="flex flex-col gap-5 scroll-mt-20" id="contato" data-testid="sobre-secao-contato">
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
            {{ locale.t('sobre.contact.eyebrow') }}
          </div>
          <h2 class="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            {{ locale.t('sobre.contact.title') }}
          </h2>
          <p class="text-text-dim text-base leading-relaxed">
            @if (locale.locale() === 'pt') {
              Sem formulários extensos, sem fila de atendimento. Mande um e-mail e respondemos
              rápido — somos pessoas que usam o <app-brand /> todos os dias.
            } @else {
              No long forms, no waiting line. Send an email and we reply quickly — we’re people
              who use <app-brand /> every day.
            }
          </p>

          <div class="grid sm:grid-cols-3 gap-3 mt-2">
            <a
              href="mailto:suporte@liriun.com"
              class="card-elev p-5 flex flex-col gap-2 hover:border-accent transition-colors"
              data-testid="contato-card-suporte"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                class="w-9 h-9 rounded-lg bg-accent/15 text-accent grid place-items-center"
              >
                <i class="fa-solid fa-life-ring"></i>
              </div>
              <h3 class="text-[14px] font-semibold">{{ locale.t('sobre.contact.support.title') }}</h3>
              <p class="text-text-dim text-[12px] leading-relaxed">
                {{ locale.t('sobre.contact.support.body') }}
              </p>
              <span class="text-[12px] text-accent font-medium mt-1 break-all">
                suporte&#64;liriun.com
              </span>
            </a>

            <a
              href="mailto:contato@liriun.com"
              class="card-elev p-5 flex flex-col gap-2 hover:border-accent transition-colors"
              data-testid="contato-card-ideias"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                class="w-9 h-9 rounded-lg bg-accent/15 text-accent grid place-items-center"
              >
                <i class="fa-solid fa-lightbulb"></i>
              </div>
              <h3 class="text-[14px] font-semibold">{{ locale.t('sobre.contact.suggestions.title') }}</h3>
              <p class="text-text-dim text-[12px] leading-relaxed">
                {{ locale.t('sobre.contact.suggestions.body') }}
              </p>
              <span class="text-[12px] text-accent font-medium mt-1 break-all">
                contato&#64;liriun.com
              </span>
            </a>

            <a
              href="mailto:contato@liriun.com"
              class="card-elev p-5 flex flex-col gap-2 hover:border-accent transition-colors"
              data-testid="contato-card-empresa"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                class="w-9 h-9 rounded-lg bg-accent/15 text-accent grid place-items-center"
              >
                <i class="fa-solid fa-handshake"></i>
              </div>
              <h3 class="text-[14px] font-semibold">{{ locale.t('sobre.contact.press.title') }}</h3>
              <p class="text-text-dim text-[12px] leading-relaxed">
                {{ locale.t('sobre.contact.press.body') }}
              </p>
              <span class="text-[12px] text-accent font-medium mt-1 break-all">
                contato&#64;liriun.com
              </span>
            </a>
          </div>

        </section>

        <section
          class="card-elev p-7 sm:p-9 flex flex-col gap-5 items-center text-center bg-accent/5 border-accent/30"
          data-testid="sobre-cta"
        >
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight">
            @if (autenticado()) {
              {{ locale.t('sobre.cta.title_logged') }}
            } @else {
              {{ locale.t('sobre.cta.title_anon') }}
            }
          </h2>
          <p class="text-text-dim text-[14px] max-w-xl">
            @if (autenticado()) {
              {{ locale.t('sobre.cta.body_logged') }}
            } @else {
              {{ locale.t('sobre.cta.body_anon') }}
            }
          </p>
          @if (autenticado()) {
            <a
              routerLink="/app/visao-geral"
              class="btn-primary px-6 py-3 text-sm shadow-accent flex items-center gap-2"
              data-testid="sobre-cta-app"
            >
              <i class="fa-solid fa-arrow-right-to-bracket text-xs"></i>
              <span>Ir pro <app-brand /></span>
            </a>
          } @else {
            <div class="flex flex-col sm:flex-row gap-3">
              <a
                routerLink="/cadastro"
                class="btn-primary px-6 py-3 text-sm shadow-accent"
                data-testid="sobre-cta-cadastro"
              >
                Criar minha conta
              </a>
              <a
                routerLink="/login"
                class="btn-secondary px-6 py-3 text-sm"
                data-testid="sobre-cta-login"
              >
                Já tenho conta
              </a>
            </div>
          }
        </section>

      </article>

      <app-site-footer />
    </main>
  `,
})
export class SobreComponent {
  private readonly storage = inject(TokenStorage);
  readonly locale = inject(LocaleService);

  autenticado = computed(() => this.storage.estaAutenticado());
}
