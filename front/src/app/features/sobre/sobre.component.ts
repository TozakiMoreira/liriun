import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TokenStorage } from '../../core/auth/token.storage';
import { BrandComponent } from '../../shared/brand.component';
import { SiteFooterComponent } from '../../shared/site-footer.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [RouterLink, BrandComponent, SiteFooterComponent, ThemeToggleComponent],
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
          <app-theme-toggle />
        </div>
      </header>

      <article class="max-w-3xl mx-auto px-4 sm:px-8 py-12 md:py-16 flex flex-col gap-14">
        <section class="flex flex-col gap-5 scroll-mt-20" id="o-que-e" data-testid="sobre-secao-o-que-e">
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
            O que é o Liriun
          </div>
          <h1 class="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
            Seu assistente pessoal pra parar de carregar tudo na cabeça.
          </h1>
          <p class="text-text-dim text-lg leading-relaxed">
            O <app-brand /> é um organizador de tarefas e ideias com inteligência artificial — feito
            pra quem vive correndo entre faculdade, trabalho, contas e a vida que ainda sobra. Em vez
            de te entregar mais um formulário pra preencher, ele
            <strong class="text-text">conversa com você</strong>: você fala como falaria com um
            amigo, e ele anota, organiza e devolve a tarefa pronta.
          </p>
          <p class="text-text-dim text-base leading-relaxed">
            Ele não chega gritando, não te enche de notificação, não pede que você aprenda método
            novo. É só você dizer o que precisa fazer. Ele cuida do resto.
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
                  <i class="fa-solid fa-bolt text-accent text-[9px] w-3"></i>
                  <span>Nova tarefa</span>
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
                  <span>Concluídas</span>
                </div>
              </div>

              <div class="flex-1 flex flex-col overflow-hidden">
                <div class="flex items-center gap-2 px-3 py-2 border-b border-border">
                  <i class="fa-solid fa-bolt text-accent text-[10px]"></i>
                  <strong class="text-text font-medium text-[10px]">Nova tarefa</strong>
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
            Conversa real com o Liriun. Você fala como falaria com um amigo.
          </p>

          <div class="grid sm:grid-cols-3 gap-3 mt-2">
            <div class="card-elev p-4 flex flex-col gap-1.5" data-testid="sobre-publico-1">
              <i class="fa-solid fa-briefcase text-accent text-base"></i>
              <h3 class="text-[14px] font-semibold">Autônomo</h3>
              <p class="text-text-dim text-[12px] leading-relaxed">
                Reuniões, propostas, prazos de cliente. Tudo num lugar só, sem planilha boba.
              </p>
            </div>
            <div class="card-elev p-4 flex flex-col gap-1.5" data-testid="sobre-publico-2">
              <i class="fa-solid fa-graduation-cap text-accent text-base"></i>
              <h3 class="text-[14px] font-semibold">Estudante</h3>
              <p class="text-text-dim text-[12px] leading-relaxed">
                Provas, trabalhos, leitura, monitoria. O Liriun lembra. Você dorme.
              </p>
            </div>
            <div class="card-elev p-4 flex flex-col gap-1.5" data-testid="sobre-publico-3">
              <i class="fa-solid fa-house text-accent text-base"></i>
              <h3 class="text-[14px] font-semibold">Casa e família</h3>
              <p class="text-text-dim text-[12px] leading-relaxed">
                Feira, médico, conta vencendo, aniversário esquecido. Ele puxa orelha por você.
              </p>
            </div>
          </div>
        </section>

        <section class="flex flex-col gap-6 scroll-mt-20" id="como-funciona" data-testid="sobre-secao-como-funciona">
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
            Como funciona
          </div>
          <h2 class="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Três jeitos. O mesmo destino: sua tarefa salva.
          </h2>

          <div class="flex flex-col gap-4 mt-2">
            <div class="card-elev p-5 flex gap-4 items-start" data-testid="sobre-passo-1">
              <div
                class="w-9 h-9 shrink-0 rounded-full bg-accent/15 text-accent grid place-items-center font-bold"
              >
                1
              </div>
              <div class="flex flex-col gap-1.5">
                <h3 class="text-base font-semibold flex items-center gap-2">
                  <i class="fa-solid fa-comments text-accent text-sm"></i>
                  Modo Liriun (texto)
                </h3>
                <p class="text-text-dim text-[13px] leading-relaxed">
                  Você abre o chat e escreve do jeito que falaria. "Reunião amanhã às 14h com o
                  Lucas, online via Teams". Ele lê, entende contexto, e devolve a tarefa pronta com
                  data, hora, categoria e até observações. Você confirma e pronto.
                </p>
              </div>
            </div>

            <div class="card-elev p-5 flex gap-4 items-start" data-testid="sobre-passo-2">
              <div
                class="w-9 h-9 shrink-0 rounded-full bg-accent/15 text-accent grid place-items-center font-bold"
              >
                2
              </div>
              <div class="flex flex-col gap-1.5">
                <h3 class="text-base font-semibold flex items-center gap-2">
                  <i class="fa-solid fa-microphone text-accent text-sm"></i>
                  Modo Liriun (áudio)
                </h3>
                <p class="text-text-dim text-[13px] leading-relaxed">
                  Tá no carro, andando, ou simplesmente cansado de digitar? Aperta o microfone (ou
                  <kbd class="px-1.5 py-0.5 bg-bg-elev border border-border rounded text-[11px]"
                    >Ctrl+Espaço</kbd
                  >) e fala. Ele transcreve, interpreta e propõe a tarefa do mesmo jeito. Tudo num
                  fluxo só.
                </p>
              </div>
            </div>

            <div class="card-elev p-5 flex gap-4 items-start" data-testid="sobre-passo-3">
              <div
                class="w-9 h-9 shrink-0 rounded-full bg-accent/15 text-accent grid place-items-center font-bold"
              >
                3
              </div>
              <div class="flex flex-col gap-1.5">
                <h3 class="text-base font-semibold flex items-center gap-2">
                  <i class="fa-solid fa-pen-to-square text-accent text-sm"></i>
                  Modo Manual
                </h3>
                <p class="text-text-dim text-[13px] leading-relaxed">
                  Prefere o velho formulário? Sem problema. Nome, prazo, hora, prioridade,
                  categoria. Salva. Sem firula. Tá ali pra quando você sabe exatamente o que
                  quer.
                </p>
              </div>
            </div>
          </div>

          <p class="text-text-dim text-[13px] italic leading-relaxed mt-2">
            Em qualquer modo, a tarefa cai na mesma lista, com os mesmos filtros, no mesmo Kanban.
            O Liriun só decide como você prefere falar com ele — o resto ele resolve.
          </p>
        </section>

        <section class="flex flex-col gap-5 scroll-mt-20" id="contato" data-testid="sobre-secao-contato">
          <div class="text-[11px] font-medium tracking-wider uppercase text-accent">
            Fala com a gente
          </div>
          <h2 class="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Travou? Sumiu? Tem ideia maluca? <br />
            A gente lê tudo.
          </h2>
          <p class="text-text-dim text-base leading-relaxed">
            Nada de formulário com 12 campos nem fila de atendimento. Manda e-mail, conta o que tá
            rolando, a gente responde rápido. Promessa de gente que também usa o app todo dia.
          </p>

          <div class="grid sm:grid-cols-3 gap-3 mt-2">
            <a
              href="mailto:oi@liriun.app"
              class="card-elev p-5 flex flex-col gap-2 hover:border-accent transition-colors"
              data-testid="contato-card-suporte"
            >
              <div
                class="w-9 h-9 rounded-lg bg-accent/15 text-accent grid place-items-center"
              >
                <i class="fa-solid fa-life-ring"></i>
              </div>
              <h3 class="text-[14px] font-semibold">Suporte</h3>
              <p class="text-text-dim text-[12px] leading-relaxed">
                Algo quebrou? Conta acidentada? Senha embolou? Manda mensagem.
              </p>
              <span class="text-[12px] text-accent font-medium mt-1 break-all">
                oi&#64;liriun.app
              </span>
            </a>

            <a
              href="mailto:ideias@liriun.app"
              class="card-elev p-5 flex flex-col gap-2 hover:border-accent transition-colors"
              data-testid="contato-card-ideias"
            >
              <div
                class="w-9 h-9 rounded-lg bg-accent/15 text-accent grid place-items-center"
              >
                <i class="fa-solid fa-lightbulb"></i>
              </div>
              <h3 class="text-[14px] font-semibold">Sugestões</h3>
              <p class="text-text-dim text-[12px] leading-relaxed">
                Sentiu falta de algo? Tem ideia que melhoraria seu dia? Conta a real.
              </p>
              <span class="text-[12px] text-accent font-medium mt-1 break-all">
                ideias&#64;liriun.app
              </span>
            </a>

            <a
              href="mailto:tomore@tomore.com.br"
              class="card-elev p-5 flex flex-col gap-2 hover:border-accent transition-colors"
              data-testid="contato-card-empresa"
            >
              <div
                class="w-9 h-9 rounded-lg bg-accent/15 text-accent grid place-items-center"
              >
                <i class="fa-solid fa-handshake"></i>
              </div>
              <h3 class="text-[14px] font-semibold">Imprensa &amp; parcerias</h3>
              <p class="text-text-dim text-[12px] leading-relaxed">
                É da imprensa, quer falar de parceria ou só conhecer a ToMore?
              </p>
              <span class="text-[12px] text-accent font-medium mt-1 break-all">
                tomore&#64;tomore.com.br
              </span>
            </a>
          </div>

          <p class="text-text-subtle text-[12px] italic leading-relaxed mt-1">
            E-mails são fictícios na V1 beta. Em breve estarão pra valer — enquanto isso, qualquer
            coisa, abre uma issue, fala em rede social, ou grita pela janela. A gente improvisa.
          </p>
        </section>

        <section
          class="card-elev p-7 sm:p-9 flex flex-col gap-5 items-center text-center bg-accent/5 border-accent/30"
          data-testid="sobre-cta"
        >
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight">
            @if (autenticado()) {
              Já tá tudo aí. Bora?
            } @else {
              Bora tirar essa lista mental da cabeça?
            }
          </h2>
          <p class="text-text-dim text-[14px] max-w-xl">
            @if (autenticado()) {
              Tua conta tá pronta. Abre a visão geral e começa o dia já organizado.
            } @else {
              Conta criada em menos de um minuto. Grátis na V1. Cancela quando quiser, sem letra
              miúda.
            }
          </p>
          @if (autenticado()) {
            <a
              routerLink="/app/visao-geral"
              class="btn-primary px-6 py-3 text-sm shadow-accent flex items-center gap-2"
              data-testid="sobre-cta-app"
            >
              <i class="fa-solid fa-arrow-right-to-bracket text-xs"></i>
              Ir pro <app-brand />
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

  autenticado = computed(() => this.storage.estaAutenticado());
}
