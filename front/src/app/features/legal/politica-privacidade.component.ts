import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandComponent } from '../../shared/brand.component';
import { SiteFooterComponent } from '../../shared/site-footer.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';
import { UserMenuComponent } from '../../shared/user-menu.component';

@Component({
  selector: 'app-politica-privacidade',
  standalone: true,
  imports: [RouterLink, BrandComponent, SiteFooterComponent, ThemeToggleComponent, UserMenuComponent],
  template: `
    <main class="min-h-screen bg-bg text-text" data-testid="politica-page">
      <header
        class="sticky top-0 z-30 backdrop-blur-md bg-bg/70 border-b border-border/50"
      >
        <div class="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
          <a
            routerLink="/"
            class="inline-flex items-center gap-2 text-[13px] font-medium text-text-dim hover:text-accent transition-colors"
            data-testid="politica-home-link"
          >
            <i class="fa-solid fa-arrow-left text-xs"></i>
            Início
          </a>
          <a routerLink="/" class="flex items-center gap-2.5" aria-label="Liriun — início">
            <img src="/logo.png" alt="" class="w-8 h-8 object-contain" aria-hidden="true" />
            <span class="text-[15px] font-semibold tracking-tight"><app-brand /></span>
          </a>
          <div class="flex items-center gap-2">
            <span class="hidden sm:inline-flex"><app-theme-toggle /></span>
            <app-user-menu />
          </div>
        </div>
      </header>

      <article class="max-w-3xl mx-auto px-4 sm:px-8 py-10 md:py-14 flex flex-col gap-6 text-[14px] leading-relaxed">
        <div class="flex flex-col gap-1">
          <h1 class="text-3xl font-bold tracking-tight">Política de Privacidade</h1>
          <p class="text-text-subtle text-xs">Última atualização: 03 de maio de 2026 — V1</p>
        </div>

        <section class="card-elev p-4 border border-amber-500/30 bg-amber-500/5 text-[13px]">
          <strong class="text-amber-400">⚠️ Aviso:</strong> documento elaborado com base na LGPD (Lei
          13.709/2018), Marco Civil da Internet (Lei 12.965/2014) e orientações da ANPD. Antes do
          cadastro público, será revisto por advogado especializado em direito digital.
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">1. Quem somos</h2>
          <p>
            O Liriun é um organizador pessoal de tarefas e ideias com auxílio de inteligência artificial.
          </p>
          <ul class="list-disc pl-5 flex flex-col gap-1 text-text-dim">
            <li><strong class="text-text">Controlador dos dados pessoais:</strong> [a definir]</li>
            <li><strong class="text-text">CNPJ/CPF:</strong> [a definir]</li>
            <li><strong class="text-text">Endereço:</strong> [a definir]</li>
            <li><strong class="text-text">Encarregado (DPO):</strong> [a definir]</li>
            <li><strong class="text-text">Contato do DPO:</strong> <a href="mailto:contato@liriun.com" class="text-accent hover:underline">contato&#64;liriun.com</a></li>
            <li><strong class="text-text">Canal de privacidade:</strong> <a href="mailto:contato@liriun.com" class="text-accent hover:underline">contato&#64;liriun.com</a></li>
          </ul>
          <p>
            Esta política descreve como coletamos, usamos, armazenamos, compartilhamos e protegemos seus
            dados pessoais quando você utiliza o Liriun, em conformidade com a
            <strong>Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD)</strong>.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">2. Dados que coletamos</h2>

          <h3 class="font-semibold text-text-dim">2.1 Fornecidos por você</h3>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li><strong>Cadastro:</strong> nome, e-mail, senha (hash, nunca em texto puro).</li>
            <li><strong>Perfil:</strong> foto opcional.</li>
            <li>
              <strong>Conteúdo:</strong> tarefas, categorias, observações, datas, prioridades,
              textos/áudios da captura.
            </li>
          </ul>

          <h3 class="font-semibold text-text-dim">2.2 Coletados automaticamente</h3>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li>
              <strong>Logs técnicos:</strong> IP, agente do navegador, timestamps — coletados conforme
              art. 15 do Marco Civil da Internet.
            </li>
            <li>
              <strong>Cookies / armazenamento local:</strong> token JWT
              (<code class="text-text">liriun.token</code>, <code class="text-text">liriun.user</code>);
              preferências de UI. Sem cookies de terceiros pra rastreamento publicitário.
            </li>
          </ul>

          <h3 class="font-semibold text-text-dim">2.3 Dados de terceiros inseridos por você</h3>
          <p class="text-text-dim italic">
            💡 Caso você insira dados pessoais de terceiros (nomes, contatos etc.) em tarefas,
            observações ou áudios, <strong class="text-text">você atua como controlador desses dados</strong>
            perante a LGPD e é responsável por possuir base legal adequada. O Liriun atua apenas como
            operador nesse cenário.
          </p>

          <h3 class="font-semibold text-text-dim">2.4 Dados enviados a operadores</h3>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li>
              <strong>Google Gemini API (Google LLC):</strong> conteúdo do "Modo Liriun" é processado
              pela Google.
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener"
                class="text-accent hover:underline"
                >Política do Google</a
              >.
            </li>
            <li>
              <strong>Supabase Inc.:</strong> banco PostgreSQL gerenciado.
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener"
                class="text-accent hover:underline"
                >Política da Supabase</a
              >.
            </li>
            <li><strong>Provedor de hospedagem:</strong> [a definir].</li>
          </ul>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">3. Para que usamos (finalidades e bases legais)</h2>
          <div class="overflow-x-auto -mx-4 sm:mx-0">
            <table class="w-full text-[13px] min-w-[480px]">
              <thead>
                <tr class="border-b border-border text-left">
                  <th class="px-3 py-2 font-semibold">Finalidade</th>
                  <th class="px-3 py-2 font-semibold">Base legal LGPD</th>
                </tr>
              </thead>
              <tbody class="text-text-dim">
                <tr class="border-b border-border/50">
                  <td class="px-3 py-2">Cadastro, login e acesso à conta</td>
                  <td class="px-3 py-2">Execução de contrato (art. 7º, V)</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="px-3 py-2">Armazenar e organizar suas tarefas/categorias</td>
                  <td class="px-3 py-2">Execução de contrato (art. 7º, V)</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="px-3 py-2">Processar texto/áudio com IA (Modo Liriun)</td>
                  <td class="px-3 py-2">
                    Execução de contrato (art. 7º, V) — funcionalidade central do serviço
                  </td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="px-3 py-2">Personalizar interface (tom, uso do nome)</td>
                  <td class="px-3 py-2">Execução de contrato (art. 7º, V)</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="px-3 py-2">Diagnóstico, segurança, prevenção a fraude</td>
                  <td class="px-3 py-2">Legítimo interesse (art. 7º, IX)</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="px-3 py-2">Guarda de logs de aplicação</td>
                  <td class="px-3 py-2">Obrigação legal (art. 7º, II + Marco Civil art. 15)</td>
                </tr>
                <tr>
                  <td class="px-3 py-2">Cumprir obrigações legais e regulatórias</td>
                  <td class="px-3 py-2">Obrigação legal (art. 7º, II)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-text-dim italic">
            💡 <strong class="text-text">Não usamos seus dados para:</strong> treinar modelos de IA
            próprios ou de terceiros, publicidade comportamental, venda ou compartilhamento comercial.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">4. Decisões automatizadas e uso de IA (art. 20 LGPD)</h2>
          <p>
            O Modo Liriun usa a API do Google Gemini para <strong>sugerir</strong> tarefas a partir do
            que você escreve ou fala. Características importantes:
          </p>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li>A IA <strong>apenas sugere</strong> — toda criação ou edição exige sua confirmação.</li>
            <li>
              Não há decisão automatizada que afete seus direitos, perfilamento de comportamento ou
              pontuação automatizada.
            </li>
            <li>Você tem direito a solicitar revisão humana de qualquer interpretação feita pela IA.</li>
            <li>
              Pode optar por <strong>não usar o Modo Liriun</strong> e continuar utilizando o serviço em
              modo manual, sem prejuízo das demais funcionalidades.
            </li>
          </ul>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">5. Com quem compartilhamos</h2>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li><strong>Operadores (processadores)</strong> listados na seção 2.4.</li>
            <li>
              <strong>Autoridades públicas:</strong> somente mediante ordem judicial ou requisição
              legal vinculante (art. 26 LGPD; art. 10, §1º Marco Civil).
            </li>
          </ul>
          <p>Não há compartilhamento comercial com terceiros.</p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">6. Transferência internacional de dados</h2>
          <p class="text-text-dim italic">
            💡 Algumas operações envolvem transferência internacional (chamadas à API do Google,
            armazenamento na Supabase). Realizadas com base no
            <strong class="text-text">art. 33, II da LGPD</strong> (cláusulas contratuais
            específicas / cláusulas-padrão), assegurando nível de proteção compatível com a legislação
            brasileira.
          </p>
          <p>Região primária de armazenamento configurada: [a definir].</p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">7. Por quanto tempo guardamos</h2>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li><strong>Conta ativa:</strong> enquanto você for usuário.</li>
            <li>
              <strong>Após exclusão:</strong> dados pessoais identificáveis apagados em até 30 dias.
              Tarefas, categorias e relacionamentos: cascata imediata.
            </li>
            <li>
              <strong>Logs de aplicação:</strong> mantidos por 6 meses, conforme art. 15 do Marco
              Civil.
            </li>
            <li>
              <strong>Obrigações legais:</strong> conservados pelo prazo mínimo aplicável (fiscal,
              judicial).
            </li>
          </ul>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">8. Seus direitos como titular (art. 18 LGPD)</h2>
          <p>Você tem direito, a qualquer momento e gratuitamente, de:</p>
          <ol class="list-decimal pl-5 flex flex-col gap-1">
            <li>Confirmar a existência de tratamento dos seus dados.</li>
            <li>Acessar seus dados.</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li>Anonimizar, bloquear ou eliminar dados desnecessários ou em desconformidade.</li>
            <li>Portar seus dados a outro fornecedor.</li>
            <li>Eliminar dados tratados com base em consentimento.</li>
            <li>Saber com quem compartilhamos seus dados.</li>
            <li>Ser informado sobre não fornecer consentimento e suas consequências.</li>
            <li>Revogar consentimento, quando aplicável.</li>
            <li><strong>Solicitar revisão de decisões automatizadas</strong> (art. 20).</li>
            <li>Peticionar à ANPD contra o controlador.</li>
          </ol>

          <h3 class="font-semibold text-text-dim mt-2">8.1 Como exercer seus direitos</h3>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li>
              <strong>No próprio app (autoatendimento):</strong> editar perfil, alterar senha e
              <strong>excluir definitivamente a conta</strong> em
              <code class="text-text">Configurações</code>, sem solicitação por e-mail. Exclusão produz
              efeitos imediatos em cascata.
            </li>
            <li>
              <strong>Portabilidade:</strong> exportação em formato JSON mediante solicitação ao DPO.
              Atendimento em até 15 dias.
            </li>
            <li>
              <strong>Por e-mail:</strong>
              <a href="mailto:contato@liriun.com" class="text-accent hover:underline">contato&#64;liriun.com</a>.
              Resposta em até <strong>15 dias</strong> corridos (orientação ANPD).
            </li>
            <li>
              <strong>Denúncia à ANPD:</strong>
              <a
                href="https://www.gov.br/anpd/pt-br/canais_atendimento/cidadao"
                target="_blank"
                rel="noopener"
                class="text-accent hover:underline break-all"
                >gov.br/anpd/pt-br/canais_atendimento/cidadao</a
              >
            </li>
          </ul>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">9. Segurança</h2>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li>Senhas com hash forte (bcrypt ou equivalente).</li>
            <li>Autenticação via JWT com expiração.</li>
            <li>Comunicação criptografada via HTTPS/TLS.</li>
            <li>Controle de acesso por usuário.</li>
            <li>Logs de auditoria.</li>
            <li>Acordos de tratamento de dados (DPA) com operadores.</li>
          </ul>

          <h3 class="font-semibold text-text-dim mt-2">9.1 Incidentes de segurança</h3>
          <p class="text-text-dim italic">
            💡 Em caso de incidente que possa acarretar risco ou dano relevante, notificaremos a
            <strong class="text-text">ANPD em até 3 (três) dias úteis</strong> a contar da ciência do
            incidente, e os titulares afetados em prazo razoável (art. 48 LGPD).
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">10. Cookies e armazenamento local</h2>
          <p>Usamos <code class="text-text">localStorage</code> para:</p>
          <ul class="list-disc pl-5 flex flex-col gap-1">
            <li>
              <strong>Token de autenticação</strong>
              (<code class="text-text">liriun.token</code>) — necessário pra manter sua sessão.
            </li>
            <li>
              <strong>Dados básicos do usuário</strong>
              (<code class="text-text">liriun.user</code>) — pra personalização.
            </li>
            <li><strong>Preferências de UI</strong> — tema, estado da sidebar.</li>
          </ul>
          <p>
            Não usamos cookies de rastreamento de terceiros nem analytics comportamental nesta versão.
            Caso isso mude, esta política será atualizada e seu consentimento solicitado quando
            necessário.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">11. Crianças e adolescentes</h2>
          <p class="text-text-dim italic">
            💡 O Liriun é destinado a maiores de 18 anos. Não coletamos intencionalmente dados de
            crianças (menores de 12) nem de adolescentes (12 a 18). Cadastros identificados serão
            excluídos e os dados eliminados, salvo obrigação legal em contrário (art. 14 LGPD).
          </p>
          <p>
            Se você é responsável legal e identificou cadastro indevido de menor sob seus cuidados,
            contate-nos.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">12. Alterações nesta política</h2>
          <p>
            Mudanças relevantes (novas finalidades, novos operadores, novas bases legais) serão
            comunicadas por e-mail e/ou aviso destacado no app, com antecedência razoável. Data da
            última atualização no topo do documento.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">13. Lei aplicável e foro</h2>
          <p>
            Regida pelas leis da República Federativa do Brasil. Eventuais disputas no foro do
            domicílio do consumidor (CDC, art. 101, I) ou no foro da comarca do controlador, conforme
            opção do titular.
          </p>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="text-xl font-semibold">14. Contato</h2>
          <p>
            <strong>E-mail do DPO:</strong>
            <a href="mailto:contato@liriun.com" class="text-accent hover:underline">contato&#64;liriun.com</a><br />
            <strong>E-mail de privacidade:</strong>
            <a href="mailto:contato@liriun.com" class="text-accent hover:underline">contato&#64;liriun.com</a><br />
            <strong>Endereço:</strong> [a definir]
          </p>
        </section>

      </article>

      <app-site-footer />
    </main>
  `,
})
export class PoliticaPrivacidadeComponent {}
