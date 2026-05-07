import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandComponent } from '../../shared/brand.component';
import { SiteFooterComponent } from '../../shared/site-footer.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';
import { UserMenuComponent } from '../../shared/user-menu.component';
import { LocaleSwitcherComponent } from '../../shared/locale-switcher.component';
import { LocaleService } from '../../core/locale/locale.service';

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [RouterLink, BrandComponent, SiteFooterComponent, ThemeToggleComponent, UserMenuComponent, LocaleSwitcherComponent],
  template: `
    <main class="min-h-screen bg-bg text-text" data-testid="empresa-page">
      <header
        class="sticky top-0 z-30 backdrop-blur-md bg-bg/70 border-b border-border/50"
      >
        <div class="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
          <a
            routerLink="/"
            class="inline-flex items-center gap-2 text-[13px] font-medium text-text-dim hover:text-accent transition-colors"
            data-testid="empresa-home-link"
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

      <article class="max-w-3xl mx-auto px-4 sm:px-8 py-12 md:py-16 flex flex-col gap-12">
        <section class="flex flex-col gap-5" data-testid="empresa-hero">
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
            @if (locale.locale() === 'pt') { A empresa por trás do <app-brand /> }
            @else { The company behind <app-brand /> }
          </div>
          <h1 class="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
            @if (locale.locale() === 'pt') {
              Somos a <span class="text-accent">ToMore</span>.
            } @else {
              We are <span class="text-accent">ToMore</span>.
            }
          </h1>
          <p class="text-text-dim text-lg leading-relaxed">
            @if (locale.locale() === 'pt') {
              Em um mundo de notificações infinitas, listas que nunca terminam e mentes esgotadas,
              a ToMore nasceu em 2026 com uma missão: provar que tecnologia bem desenhada pode
              cuidar da mente das pessoas — e não o contrário.
            } @else {
              In a world of endless notifications, never-ending lists and exhausted minds,
              ToMore was born in 2026 with a mission: to prove that well-designed technology can
              take care of people’s minds — instead of the other way around.
            }
          </p>
        </section>

        <section class="flex flex-col gap-4" data-testid="empresa-criadores">
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
            {{ locale.t('empresa.founders.eyebrow') }}
          </div>
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight">{{ locale.t('empresa.founders.title') }}</h2>

          <div class="grid sm:grid-cols-2 gap-3 mt-2">
            <div class="card-elev p-5 flex flex-col gap-3" data-testid="empresa-fundador-1">
              <div class="flex items-center gap-4">
                <img
                  src="/pedro.jpeg"
                  alt="Foto de Pedro Tozaki"
                  class="w-16 h-16 rounded-full object-cover border border-border-strong shrink-0"
                />
                <div class="flex flex-col">
                  <h3 class="text-[15px] font-semibold">
                    Pedro <span class="founder-highlight">To</span><span>zaki</span>
                  </h3>
                  <span class="text-[11px] text-text-subtle">{{ locale.t('empresa.founders.role') }}</span>
                </div>
              </div>
            </div>

            <div class="card-elev p-5 flex flex-col gap-3" data-testid="empresa-fundador-2">
              <div class="flex items-center gap-4">
                <img
                  src="/lucas.jpg"
                  alt="Foto de Lucas Moreira"
                  class="w-16 h-16 rounded-full object-cover border border-border-strong shrink-0"
                />
                <div class="flex flex-col">
                  <h3 class="text-[15px] font-semibold">
                    Lucas <span class="founder-highlight">More</span><span>ira</span>
                  </h3>
                  <span class="text-[11px] text-text-subtle">{{ locale.t('empresa.founders.role') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Animação ToMore: Tozaki + Moreira → ToMore -->
          <div class="tomore-reveal flex flex-col items-center gap-3 mt-6 py-6">
            <div class="tomore-formula flex items-center gap-3 md:gap-4 text-text-dim text-[13px] md:text-[15px]">
              <span class="tomore-piece tomore-piece-1">
                <span class="text-accent font-semibold">To</span><span class="opacity-60">zaki</span>
              </span>
              <span class="text-text-subtle text-[14px]">+</span>
              <span class="tomore-piece tomore-piece-2">
                <span class="text-accent font-semibold">More</span><span class="opacity-60">ira</span>
              </span>
              <span class="text-text-subtle text-[14px]">=</span>
              <span class="tomore-result text-[20px] md:text-[24px] font-bold tracking-tight bg-clip-text text-transparent" style="background-image: linear-gradient(135deg, #5e6ad2 0%, #8b5cf6 100%);">
                ToMore
              </span>
            </div>
            <p class="text-[11px] text-text-subtle italic">
              {{ locale.t('empresa.founders.formula_caption') }}
            </p>
          </div>
        </section>

        <section class="flex flex-col gap-4" data-testid="empresa-missao">
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
            {{ locale.t('empresa.why.eyebrow') }}
          </div>
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight">{{ locale.t('empresa.why.title') }}</h2>
          <p class="text-text-dim text-base leading-relaxed">
            {{ locale.t('empresa.why.p1') }}
          </p>
          <p class="text-text-dim text-base leading-relaxed">
            {{ locale.t('empresa.why.p2') }}
          </p>
        </section>

        <section class="flex flex-col gap-4" data-testid="empresa-produtos">
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
            {{ locale.t('empresa.what.eyebrow') }}
          </div>
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight">
            @if (locale.locale() === 'pt') { Hoje: o <app-brand />. }
            @else { Today: <app-brand />. }
          </h2>
          <p class="text-text-dim text-base leading-relaxed">
            @if (locale.locale() === 'pt') {
              O <app-brand /> é nosso primeiro produto: um organizador pessoal de tarefas com IA
              conversacional. Mais do que um app de produtividade, é uma extensão calma da sua
              mente — e o primeiro passo da nossa missão de devolver tempo às pessoas.
            } @else {
              <app-brand /> is our first product: a personal task organizer with conversational AI.
              More than a productivity app, it’s a calm extension of your mind — and the first step
              of our mission to give people their time back.
            }
          </p>
          <div class="flex flex-wrap gap-3 mt-2">
            <a
              routerLink="/sobre"
              class="btn-secondary text-[13px] px-4 py-2 inline-flex items-center gap-2"
              data-testid="empresa-link-sobre-liriun"
            >
              <i class="fa-solid fa-circle-info text-xs"></i>
              @if (locale.locale() === 'pt') { Conhecer o <app-brand /> } @else { Discover <app-brand /> }
            </a>
            <a
              routerLink="/cadastro"
              class="btn-primary text-[13px] px-4 py-2"
              data-testid="empresa-cta-cadastro"
            >
              {{ locale.t('empresa.what.cta_signup') }}
            </a>
          </div>
        </section>

        <section class="flex flex-col gap-4" data-testid="empresa-valores">
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
            {{ locale.t('empresa.values.eyebrow') }}
          </div>
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight">
            {{ locale.t('empresa.values.title') }}
          </h2>
          <div class="grid sm:grid-cols-2 gap-3 mt-2">
            <div class="card-elev p-4 flex flex-col gap-1.5" data-testid="empresa-valor-1">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-feather text-accent"></i>
                <h3 class="text-[14px] font-semibold">{{ locale.t('empresa.values.v1.title') }}</h3>
              </div>
              <p class="text-text-dim text-[12px] leading-relaxed">
                {{ locale.t('empresa.values.v1.body') }}
              </p>
            </div>
            <div class="card-elev p-4 flex flex-col gap-1.5" data-testid="empresa-valor-2">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-comments text-accent"></i>
                <h3 class="text-[14px] font-semibold">{{ locale.t('empresa.values.v2.title') }}</h3>
              </div>
              <p class="text-text-dim text-[12px] leading-relaxed">
                {{ locale.t('empresa.values.v2.body') }}
              </p>
            </div>
            <div class="card-elev p-4 flex flex-col gap-1.5" data-testid="empresa-valor-3">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-shield-halved text-accent"></i>
                <h3 class="text-[14px] font-semibold">{{ locale.t('empresa.values.v3.title') }}</h3>
              </div>
              <p class="text-text-dim text-[12px] leading-relaxed">
                {{ locale.t('empresa.values.v3.body') }}
              </p>
            </div>
            <div class="card-elev p-4 flex flex-col gap-1.5" data-testid="empresa-valor-4">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-heart text-accent"></i>
                <h3 class="text-[14px] font-semibold">{{ locale.t('empresa.values.v4.title') }}</h3>
              </div>
              <p class="text-text-dim text-[12px] leading-relaxed">
                {{ locale.t('empresa.values.v4.body') }}
              </p>
            </div>
          </div>
        </section>

        <section
          class="card-elev p-7 sm:p-9 flex flex-col gap-4 bg-accent/5 border-accent/30"
          data-testid="empresa-contato"
        >
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">{{ locale.t('empresa.contact.eyebrow') }}</div>
          <h2 class="text-2xl font-bold tracking-tight">{{ locale.t('empresa.contact.title') }}</h2>
          <p class="text-text-dim text-[14px] leading-relaxed">
            @if (locale.locale() === 'pt') {
              Para parcerias, imprensa, sugestões ou apenas para dizer olá — estamos disponíveis em
              <a href="mailto:contato@liriun.com" class="text-accent hover:underline" target="_blank" rel="noopener noreferrer">contato&#64;liriun.com</a>. Lemos cada mensagem.
            } @else {
              For partnerships, press, suggestions or just to say hi — we’re available at
              <a href="mailto:contato@liriun.com" class="text-accent hover:underline" target="_blank" rel="noopener noreferrer">contato&#64;liriun.com</a>. We read every message.
            }
          </p>

          <a
            href="mailto:contato@liriun.com"
            class="btn-primary self-start text-[13px] px-5 py-2.5 inline-flex items-center gap-2 mt-1"
            data-testid="empresa-contato-cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="fa-solid fa-envelope text-[12px]"></i>
            <span class="flex flex-col text-left leading-tight">
              <span class="font-semibold">{{ locale.t('empresa.contact.cta') }}</span>
              <span class="text-[11px] opacity-90 font-normal">contato&#64;liriun.com</span>
            </span>
          </a>

          <p class="text-text-subtle text-[11px] mt-3 pt-3 border-t border-border">
            {{ locale.t('empresa.contact.footer') }}
          </p>
        </section>

      </article>

      <app-site-footer />
    </main>
  `,
  styles: [`
    .founder-highlight {
      color: rgb(var(--c-accent));
      font-weight: 700;
      position: relative;
    }
    .founder-highlight::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -2px;
      height: 2px;
      background: linear-gradient(90deg, rgb(var(--c-accent)), rgb(var(--c-accent-violet)));
      border-radius: 2px;
      opacity: 0;
      transition: opacity 240ms;
    }
    .card-elev:hover .founder-highlight::after {
      opacity: 1;
    }

    /* Animação ToMore — pulsa em loop */
    .tomore-reveal {
      animation: tomore-fade-in 800ms ease-out both;
    }
    @keyframes tomore-fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .tomore-piece {
      display: inline-block;
      animation: tomore-piece-pop 4s ease-in-out infinite;
    }
    .tomore-piece-1 { animation-delay: 0s; }
    .tomore-piece-2 { animation-delay: 0.4s; }

    @keyframes tomore-piece-pop {
      0%, 60%, 100% { transform: scale(1); }
      70%           { transform: scale(1.08); }
    }

    .tomore-result {
      animation: tomore-glow 4s ease-in-out infinite;
      animation-delay: 0.8s;
    }
    @keyframes tomore-glow {
      0%, 60%, 100% {
        transform: scale(1);
        filter: drop-shadow(0 0 0 rgba(139, 92, 246, 0));
      }
      75% {
        transform: scale(1.1);
        filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.6));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .tomore-reveal,
      .tomore-piece,
      .tomore-result {
        animation: none !important;
      }
    }
  `],
})
export class EmpresaComponent {
  readonly locale = inject(LocaleService);
}
