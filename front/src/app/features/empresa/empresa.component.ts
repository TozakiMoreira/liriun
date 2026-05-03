import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandComponent } from '../../shared/brand.component';
import { SiteFooterComponent } from '../../shared/site-footer.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [RouterLink, BrandComponent, SiteFooterComponent, ThemeToggleComponent],
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
          <app-theme-toggle />
        </div>
      </header>

      <article class="max-w-3xl mx-auto px-4 sm:px-8 py-12 md:py-16 flex flex-col gap-12">
        <section class="flex flex-col gap-5" data-testid="empresa-hero">
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
            A empresa por trás do Liriun
          </div>
          <h1 class="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
            Somos a <span class="text-accent">ToMore</span>.
          </h1>
          <p class="text-text-dim text-lg leading-relaxed">
            Uma startup brasileira nascida em 2026 com uma ideia simples: tirar peso da cabeça das
            pessoas e devolver tempo pro que importa. Acreditamos que software bom é o que some — não
            o que pede sua atenção a cada cinco minutos.
          </p>
        </section>

        <section class="flex flex-col gap-4" data-testid="empresa-criadores">
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
            Quem fundou
          </div>
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight">Dois caras com a mesma briga.</h2>

          <div class="grid sm:grid-cols-2 gap-3 mt-2">
            <div class="card-elev p-5 flex flex-col gap-2" data-testid="empresa-fundador-1">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-accent/15 text-accent grid place-items-center font-semibold"
                >
                  LM
                </div>
                <div class="flex flex-col">
                  <h3 class="text-[15px] font-semibold">Lucas Moreira</h3>
                  <span class="text-[11px] text-text-subtle">Co-fundador</span>
                </div>
              </div>
            </div>

            <div class="card-elev p-5 flex flex-col gap-2" data-testid="empresa-fundador-2">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-accent/15 text-accent grid place-items-center font-semibold"
                >
                  PT
                </div>
                <div class="flex flex-col">
                  <h3 class="text-[15px] font-semibold">Pedro Tozaki</h3>
                  <span class="text-[11px] text-text-subtle">Co-fundador</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="flex flex-col gap-4" data-testid="empresa-missao">
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
            Por que existimos
          </div>
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight">Ninguém tem 25h por dia.</h2>
          <p class="text-text-dim text-base leading-relaxed">
            A gente começou a ToMore porque cansou de ver gente boa esquecendo coisa importante,
            anotando tarefa em cinco lugares diferentes, ou perdendo o sábado pra organizar o que
            esqueceu de fazer durante a semana. A vida já é cheia. Não precisa de mais um app que
            grita por atenção.
          </p>
          <p class="text-text-dim text-base leading-relaxed">
            Nossa aposta é construir ferramentas que conversam com você do jeito que você fala —
            naturalmente, sem método novo, sem curso, sem manual. Você diz o que precisa. Elas fazem
            o resto.
          </p>
        </section>

        <section class="flex flex-col gap-4" data-testid="empresa-produtos">
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
            O que fazemos
          </div>
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight">Hoje: o Liriun.</h2>
          <p class="text-text-dim text-base leading-relaxed">
            O <app-brand /> é nosso primeiro produto — um organizador pessoal de tarefas com IA
            conversacional. É o jeito que a ToMore escolheu pra começar a entregar a promessa de
            facilitar o dia a dia.
          </p>
          <div class="flex flex-wrap gap-3 mt-2">
            <a
              routerLink="/sobre"
              class="btn-secondary text-[13px] px-4 py-2 inline-flex items-center gap-2"
              data-testid="empresa-link-sobre-liriun"
            >
              <i class="fa-solid fa-circle-info text-xs"></i>
              Conhecer o Liriun
            </a>
            <a
              routerLink="/cadastro"
              class="btn-primary text-[13px] px-4 py-2"
              data-testid="empresa-cta-cadastro"
            >
              Criar conta grátis
            </a>
          </div>
        </section>

        <section class="flex flex-col gap-4" data-testid="empresa-valores">
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
            No que acreditamos
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            <div class="card-elev p-4 flex flex-col gap-1.5" data-testid="empresa-valor-1">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-feather text-accent"></i>
                <h3 class="text-[14px] font-semibold">Software bom é leve</h3>
              </div>
              <p class="text-text-dim text-[12px] leading-relaxed">
                Sem ruído, sem notificação desnecessária, sem celebração exagerada. Você usa quando
                precisa, ele some quando não precisa.
              </p>
            </div>
            <div class="card-elev p-4 flex flex-col gap-1.5" data-testid="empresa-valor-2">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-comments text-accent"></i>
                <h3 class="text-[14px] font-semibold">Conversa &gt; formulário</h3>
              </div>
              <p class="text-text-dim text-[12px] leading-relaxed">
                Falar é mais natural que clicar. Onde der pra trocar formulário por conversa, a gente
                troca.
              </p>
            </div>
            <div class="card-elev p-4 flex flex-col gap-1.5" data-testid="empresa-valor-3">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-shield-halved text-accent"></i>
                <h3 class="text-[14px] font-semibold">Privacidade não é luxo</h3>
              </div>
              <p class="text-text-dim text-[12px] leading-relaxed">
                Seus dados são seus. A gente não vende, não treina IA com isso, não compartilha
                comercialmente. Excluiu a conta? Sumiu tudo.
              </p>
            </div>
            <div class="card-elev p-4 flex flex-col gap-1.5" data-testid="empresa-valor-4">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-heart text-accent"></i>
                <h3 class="text-[14px] font-semibold">Pessoa em primeiro lugar</h3>
              </div>
              <p class="text-text-dim text-[12px] leading-relaxed">
                Antes de feature, vem como você se sente usando. Se cansou, falhamos. Se relaxou,
                acertamos.
              </p>
            </div>
          </div>
        </section>

        <section
          class="card-elev p-7 sm:p-9 flex flex-col gap-3 bg-accent/5 border-accent/30"
          data-testid="empresa-contato"
        >
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">Contato</div>
          <h2 class="text-2xl font-bold tracking-tight">Quer falar com a gente?</h2>
          <p class="text-text-dim text-[14px] leading-relaxed">
            Sugestão, parceria, suporte ou só pra dizer oi: o canal é o e-mail de contato listado na
            <a
              routerLink="/politica-privacidade"
              class="text-accent hover:underline"
              data-testid="empresa-link-politica"
              >Política de Privacidade</a
            >. A gente lê.
          </p>
          <p class="text-text-subtle text-[12px] mt-1">
            ToMore — fundada em 2026 por Lucas Moreira e Pedro Tozaki.
          </p>
        </section>

      </article>

      <app-site-footer />
    </main>
  `,
})
export class EmpresaComponent {}
