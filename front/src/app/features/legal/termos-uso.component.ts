import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TokenStorage } from '../../core/auth/token.storage';
import { BrandComponent } from '../../shared/brand.component';
import { SiteFooterComponent } from '../../shared/site-footer.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';
import { UserMenuComponent } from '../../shared/user-menu.component';

@Component({
  selector: 'app-termos-uso',
  standalone: true,
  imports: [RouterLink, BrandComponent, SiteFooterComponent, ThemeToggleComponent, UserMenuComponent],
  template: `
    <main class="min-h-screen bg-bg text-text" data-testid="termos-page">
      <header
        class="sticky top-0 z-30 backdrop-blur-md bg-bg/70 border-b border-border/50"
      >
        <div class="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
          <a
            routerLink="/"
            class="inline-flex items-center gap-2 text-[13px] font-medium text-text-dim hover:text-accent transition-colors"
            data-testid="termos-home-link"
          >
            <i class="fa-solid fa-arrow-left text-xs"></i>
            Início
          </a>
          <a routerLink="/" class="flex items-center gap-2.5" aria-label="Liriun — início">
            <img src="/liriun-assets/logo/liriun-icon.svg" alt="" class="w-8 h-8 object-contain" aria-hidden="true" />
            <span class="text-[15px] font-semibold tracking-tight"><app-brand /></span>
          </a>
          <div class="flex items-center gap-2">
            @if (!logado()) {
              <span class="hidden sm:inline-flex"><app-theme-toggle /></span>
            }
            <app-user-menu />
          </div>
        </div>
      </header>

      <article class="max-w-3xl mx-auto px-4 sm:px-8 py-10 md:py-14 flex flex-col gap-6 text-[14px] leading-relaxed">
        <div class="flex flex-col gap-1">
          <h1 class="text-3xl font-bold tracking-tight">Termos de Uso</h1>
          <p class="text-text-subtle text-xs">Última atualização: 03 de maio de 2026 — V1</p>
        </div>

        <section class="card-elev p-4 border border-amber-500/30 bg-amber-500/5 text-[13px]">
          <strong class="text-amber-400">⚠️ Aviso:</strong> documento elaborado com base no Marco
          Civil da Internet (Lei 12.965/2014), CDC (Lei 8.078/1990) e LGPD (Lei 13.709/2018). Antes
          do cadastro público, será revisto por advogado especializado em direito digital.
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">1. Aceitação</h2>
          <p class="text-text-dim italic">
            💡 No momento do cadastro é apresentado <strong class="text-text">checkbox de aceite expresso</strong>
            com a frase "Li e aceito os Termos de Uso e a Política de Privacidade", contendo links
            para ambos os documentos. O cadastro só é concluído após marcação ativa do checkbox,
            sendo registrados eletronicamente o aceite, a data, a hora e o IP de origem como prova do
            consentimento informado.
          </p>
          <p>
            Ao marcar o aceite e utilizar o serviço, você declara que
            <strong>leu, compreendeu e concorda integralmente</strong> com estes Termos e com a
            <a
              routerLink="/politica-privacidade"
              class="text-accent hover:underline"
              data-testid="termos-link-politica"
              >Política de Privacidade</a
            >. Se discordar, <strong>não conclua o cadastro nem utilize o serviço</strong>.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">2. Identificação do prestador</h2>
          <ul class="list-disc pl-5 flex flex-col gap-1 text-text-dim">
            <li>
              <strong class="text-text">Serviço:</strong> Liriun — organizador pessoal de tarefas e
              ideias com IA
            </li>
            <li><strong class="text-text">Responsável:</strong> [a definir]</li>
            <li><strong class="text-text">CNPJ/CPF:</strong> [a definir]</li>
            <li><strong class="text-text">Endereço:</strong> [a definir]</li>
            <li><strong class="text-text">Contato de suporte:</strong> [a definir]</li>
            <li><strong class="text-text">Canal de privacidade:</strong> [a definir]</li>
          </ul>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">3. Objeto do contrato</h2>
          <p>
            O Liriun é um <strong>software como serviço (SaaS)</strong> que permite cadastrar tarefas,
            organizá-las por categoria, prioridade e prazo, e usar IA (Google Gemini) para extrair
            tarefas a partir de texto livre ou áudio.
          </p>
          <p>
            A versão V1 é oferecida <strong>gratuitamente</strong>. A gratuidade não afasta a
            aplicação do CDC quando o usuário se enquadrar como consumidor.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">4. Cadastro e conta de usuário</h2>

          <h3 class="font-semibold text-text-dim">4.1 Requisitos</h3>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li>Ser maior de 18 anos.</li>
            <li>Fornecer e-mail válido, nome e senha verídicos.</li>
            <li>Aceitar estes Termos e a Política de Privacidade no cadastro.</li>
          </ul>

          <h3 class="font-semibold text-text-dim">4.2 Responsabilidade do usuário pela conta</h3>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li>Manter senha em segurança e em sigilo.</li>
            <li>Não compartilhar credenciais com terceiros.</li>
            <li>Notificar imediatamente em caso de uso não autorizado.</li>
            <li>Manter dados cadastrais atualizados.</li>
          </ul>

          <h3 class="font-semibold text-text-dim">4.3 Veracidade</h3>
          <p>
            Você é integralmente responsável pelas informações fornecidas. Cadastros com dados falsos
            ou de terceiros sem autorização podem ser bloqueados, observado contraditório quando
            aplicável.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">5. Uso aceitável</h2>
          <p>É vedado:</p>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li>Usar pra finalidade ilegal, fraudulenta ou abusiva.</li>
            <li>
              Inserir conteúdo que viole direitos de terceiros (autorais, marcários, de personalidade,
              dados pessoais sem base legal).
            </li>
            <li>Inserir conteúdo ofensivo, discriminatório ou violento.</li>
            <li>Violar/contornar mecanismos de segurança.</li>
            <li>
              Engenharia reversa, descompilação ou extração de código-fonte, salvo nas hipóteses
              legalmente permitidas.
            </li>
            <li>Acessar áreas restritas ou contas de terceiros sem autorização.</li>
            <li>Bots, scrapers ou automações abusivas.</li>
            <li>Revender ou redistribuir o serviço sem autorização.</li>
            <li>Spam, phishing, comunicação não solicitada.</li>
          </ul>
          <p>
            Violação pode levar à suspensão ou exclusão da conta, observados o contraditório e a
            proporcionalidade.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">6. Conteúdo do usuário</h2>

          <h3 class="font-semibold text-text-dim">6.1 Titularidade</h3>
          <p>
            Tarefas, observações, áudios e imagens <strong>permanecem de sua propriedade</strong>.
          </p>

          <h3 class="font-semibold text-text-dim">6.2 Licença ao Liriun</h3>
          <p>
            Você concede ao Liriun licença
            <strong>gratuita, não exclusiva, limitada e revogável</strong> para armazenar, processar
            e exibir esse conteúdo
            <strong>estritamente para o funcionamento do serviço a você</strong> (incluindo envio à
            API do Google Gemini quando usa Modo Liriun). Conteúdo <strong>não</strong> será usado
            pra treinar modelos de IA, publicidade ou compartilhamento comercial.
          </p>

          <h3 class="font-semibold text-text-dim">6.3 Output da IA</h3>
          <p class="text-text-dim italic">
            💡 As sugestões geradas pelo Modo Liriun, uma vez salvas e/ou editadas pelo usuário, são
            tratadas como <strong class="text-text">conteúdo do usuário</strong> para todos os
            efeitos destes Termos.
          </p>

          <h3 class="font-semibold text-text-dim">6.4 Dados pessoais de terceiros</h3>
          <p class="text-text-dim italic">
            💡 Caso você insira dados pessoais de terceiros, atua como controlador desses dados e
            declara possuir base legal adequada para tratá-los, isentando o Liriun de
            responsabilidade por inserções indevidas.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">7. Inteligência artificial</h2>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li>Modo Liriun usa Google Gemini pra gerar <strong>sugestões</strong>.</li>
            <li>
              IA pode <strong>errar, omitir, inventar ou interpretar mal</strong>. Revise antes de
              salvar.
            </li>
            <li>Liriun não responde por decisões tomadas com base em saídas da IA.</li>
            <li>Você pode optar por não usar o Modo Liriun e continuar em modo manual.</li>
          </ul>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">8. Disponibilidade</h2>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li>Sem garantia de disponibilidade 24/7 ou SLA específico na V1 gratuita.</li>
            <li>
              Manutenções programadas, atualizações ou interrupções de provedores terceiros podem
              impactar o serviço.
            </li>
            <li>
              Reservamos o direito de <strong>alterar, suspender ou descontinuar</strong>
              funcionalidades, com aviso razoável quando possível e respeitando os direitos do
              consumidor.
            </li>
          </ul>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">9. Limitação de responsabilidade</h2>
          <p class="text-text-dim italic">
            💡 Na máxima extensão permitida pela legislação aplicável e
            <strong class="text-text">respeitadas as normas cogentes do CDC</strong>:
          </p>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li>
              Liriun adota medidas técnicas razoáveis pra preservar dados, mas
              <strong>não responde</strong> por perda causada exclusivamente por falhas comprovadas de
              provedores terceiros, ataques cibernéticos não preveníveis com técnica disponível, caso
              fortuito ou força maior.
            </li>
            <li>
              <strong>Não responde</strong> por danos decorrentes de uso indevido pelo usuário,
              descumprimento destes Termos pelo usuário, ou conteúdo inserido pelo próprio usuário.
            </li>
            <li>
              <strong>Limitações acima não se aplicam</strong> em casos de dolo, culpa grave, violação
              à LGPD, vício do serviço ou demais hipóteses em que a legislação consumerista vede
              limitação prévia.
            </li>
            <li>
              Recomendamos manter <strong>cópias próprias</strong> de informações críticas. Exportação
              JSON disponível conforme cláusula 12.3.
            </li>
          </ul>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">10. Propriedade intelectual</h2>
          <p>
            Marca "Liriun", logotipo, interface, código-fonte, documentação e demais elementos são de
            propriedade do controlador e protegidos pela
            <strong>Lei 9.279/1996 (PI)</strong>, <strong>Lei 9.610/1998 (Direitos Autorais)</strong>
            e <strong>Lei 9.609/1998 (Software)</strong>.
          </p>
          <p>
            Estes Termos não concedem direitos sobre esses elementos, exceto licença limitada de uso
            do serviço.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">11. Privacidade e proteção de dados</h2>
          <p>
            Tratamento de dados pessoais segue a
            <a
              routerLink="/politica-privacidade"
              class="text-accent hover:underline"
              data-testid="termos-link-politica-secao"
              >Política de Privacidade</a
            >, parte integrante destes Termos.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">12. Encerramento da conta</h2>

          <h3 class="font-semibold text-text-dim">12.1 Pelo usuário</h3>
          <p class="text-text-dim italic">
            💡 Você pode excluir sua conta a qualquer momento, em
            <strong class="text-text">autoatendimento</strong>, em
            <code class="text-text">Configurações → Excluir conta</code>, sem necessidade de
            solicitação por e-mail ou justificativa. Ação <strong class="text-text">irreversível</strong>:
            remove em cascata tarefas, categorias, observações e demais dados associados. Logs
            técnicos podem ser mantidos pelo prazo descrito na Política de Privacidade.
          </p>

          <h3 class="font-semibold text-text-dim">12.2 Pelo Liriun</h3>
          <p>
            Podemos suspender ou encerrar contas que violem estes Termos, com aviso prévio razoável e
            oportunidade de manifestação, salvo em casos de violação grave (fraude, conteúdo
            manifestamente ilegal, abuso de infraestrutura), em que o encerramento pode ser imediato.
          </p>

          <h3 class="font-semibold text-text-dim">12.3 Exportação de dados</h3>
          <p>
            Você pode solicitar exportação dos seus dados em formato JSON ao e-mail de privacidade,
            com atendimento em até 15 dias.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">13. Moderação de conteúdo (Marco Civil, arts. 19 e 21)</h2>
          <p class="text-text-dim italic">
            💡 O Liriun adota o regime do Marco Civil da Internet:
          </p>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li>
              Conteúdo de usuário é, em regra, removido <strong>mediante ordem judicial específica</strong>
              (art. 19).
            </li>
            <li>
              Conteúdo contendo cenas de
              <strong>nudez ou ato sexual de caráter privado divulgados sem autorização</strong> é
              removido mediante notificação extrajudicial do participante ou seu representante legal
              (art. 21).
            </li>
            <li>
              Denúncias de conteúdo ilegal podem ser enviadas pelo canal de privacidade, com
              identificação do reclamante e indicação precisa do conteúdo.
            </li>
          </ul>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">14. Atendimento ao usuário</h2>
          <p class="text-text-dim italic">
            💡 Empenharemos esforços razoáveis para responder em até <strong class="text-text">5 dias úteis</strong>,
            observados, quando aplicáveis, os prazos previstos na legislação consumerista (Decreto
            11.034/2022 e CDC).
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">15. Alterações nos Termos</h2>
          <p class="text-text-dim italic">
            💡 Podemos atualizar estes Termos.
            <strong class="text-text">Mudanças materiais</strong> (novas obrigações, alterações em
            limitações de responsabilidade, mudança no objeto) exigirão
            <strong class="text-text">novo aceite ativo</strong> no app antes do uso continuado.
            Mudanças não materiais (correções, redação) serão comunicadas por aviso no app.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">16. Disposições gerais</h2>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li>
              <strong>Independência de cláusulas:</strong> se qualquer cláusula for declarada
              inválida, as demais permanecem em vigor.
            </li>
            <li>
              <strong>Não renúncia:</strong> tolerância quanto a um descumprimento não significa
              renúncia ao direito de exigi-lo no futuro.
            </li>
            <li>
              <strong>Cessão:</strong> usuário não pode ceder direitos sem autorização. Liriun pode
              ceder em casos de reorganização societária ou venda do negócio, com prévio aviso e
              preservação dos direitos dos usuários.
            </li>
          </ul>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">17. Resolução de conflitos e foro</h2>
          <p class="text-text-dim italic">
            💡 Regidos pelas leis da República Federativa do Brasil, em especial Marco Civil
            (12.965/2014), CDC (8.078/1990) e LGPD (13.709/2018).
          </p>

          <h3 class="font-semibold text-text-dim">17.1 Tentativa de solução amigável</h3>
          <p>
            Antes de medida judicial, as partes envidarão esforços para solução amigável pelo canal
            de atendimento por prazo mínimo de 30 dias, salvo urgência ou direito indisponível.
          </p>

          <h3 class="font-semibold text-text-dim">17.2 Foro</h3>
          <p>
            Para usuários <strong>consumidores</strong>, fica eleito o foro do domicílio do
            consumidor (CDC, art. 101, I). Para demais hipóteses, o foro da comarca do controlador.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">18. Contato</h2>
          <p>
            <strong>Suporte:</strong> [a definir]<br />
            <strong>Privacidade:</strong> [a definir]<br />
            <strong>Endereço:</strong> [a definir]
          </p>
        </section>

      </article>

      <app-site-footer />
    </main>
  `,
})
export class TermosUsoComponent {
  private readonly storage = inject(TokenStorage);
  readonly logado = () => this.storage.estaAutenticado();
}
