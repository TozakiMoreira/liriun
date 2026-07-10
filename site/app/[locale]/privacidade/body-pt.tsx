export function PrivacidadeBodyPT() {
  return (
    <>
      <h2>1. Quem somos</h2>
      <ul>
        <li><strong>Controlador dos dados:</strong> Pedro Tozaki</li>
        <li><strong>CNPJ:</strong> [a definir — registro em andamento]</li>
        <li><strong>Sede:</strong> São Paulo, SP, Brasil</li>
        <li>
          <strong>Encarregado (DPO):</strong>{" "}
          <a href="mailto:privacidade@liriun.com" target="_blank" rel="noopener noreferrer">privacidade@liriun.com</a>
        </li>
      </ul>
      <p>
        Esta política descreve como coletamos, usamos, armazenamos, compartilhamos e
        protegemos seus dados pessoais quando você utiliza o Liriun, em conformidade com a{" "}
        <strong>LGPD (Lei nº 13.709/2018)</strong>.
      </p>

      <h2>2. Dados que coletamos</h2>
      <h3>2.1 Fornecidos por você</h3>
      <ul>
        <li><strong>Cadastro:</strong> nome, e-mail, senha (sempre em hash, nunca em texto puro).</li>
        <li><strong>Perfil:</strong> foto opcional.</li>
        <li>
          <strong>Conteúdo:</strong> tarefas, categorias, observações, datas, prioridades,
          textos/áudios da captura.
        </li>
      </ul>
      <h3>2.2 Coletados automaticamente</h3>
      <ul>
        <li>
          <strong>Logs técnicos:</strong> IP, agente do navegador, timestamps — conforme art.
          15 do Marco Civil.
        </li>
        <li>
          <strong>Cookies / armazenamento local:</strong> sessão de autenticação e
          preferências de UI. Sem cookies de terceiros para rastreamento publicitário.
        </li>
      </ul>
      <h3>2.3 Operadores que processam dados</h3>
      <ul>
        <li>
          <strong>Google Gemini API (Google LLC):</strong> conteúdo do Modo Liriun é
          processado pela Google.{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Política do Google
          </a>
          .
        </li>
        <li>
          <strong>Supabase Inc.:</strong> banco PostgreSQL gerenciado e autenticação.{" "}
          <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
            Política da Supabase
          </a>
          .
        </li>
        <li>
          <strong>Cloudflare, Inc.:</strong> hospedagem e CDN do site (Cloudflare Pages).{" "}
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">
            Política da Cloudflare
          </a>
          .
        </li>
        <li>
          <strong>Render (Render Services, Inc.):</strong> hospedagem do backend (API).{" "}
          <a href="https://render.com/privacy" target="_blank" rel="noopener noreferrer">
            Política da Render
          </a>
          .
        </li>
      </ul>

      <h2>3. Finalidades e bases legais</h2>
      <ul>
        <li><strong>Cadastro, login e acesso à conta</strong> — execução de contrato (art. 7º, V).</li>
        <li><strong>Armazenar e organizar suas tarefas</strong> — execução de contrato (art. 7º, V).</li>
        <li><strong>Processar texto/áudio com IA (Modo Liriun)</strong> — execução de contrato (art. 7º, V).</li>
        <li><strong>Diagnóstico, segurança, prevenção a fraude</strong> — legítimo interesse (art. 7º, IX).</li>
        <li><strong>Guarda de logs de aplicação</strong> — obrigação legal (art. 7º, II + Marco Civil art. 15).</li>
      </ul>
      <p>
        <strong>Não usamos seus dados para</strong> treinar modelos de IA, publicidade
        comportamental ou compartilhamento comercial.
      </p>

      <h2>4. Decisões automatizadas e IA (art. 20 LGPD)</h2>
      <ul>
        <li>O Modo Liriun apenas <strong>sugere</strong> — toda criação ou edição exige sua confirmação.</li>
        <li>Não há perfilamento de comportamento ou pontuação automatizada.</li>
        <li>Você tem direito a solicitar revisão humana de qualquer interpretação feita pela IA.</li>
        <li>Pode optar por <strong>não usar o Modo Liriun</strong> e continuar em modo manual.</li>
      </ul>

      <h2>5. Com quem compartilhamos</h2>
      <ul>
        <li>Operadores listados na seção 2.3.</li>
        <li>
          Autoridades públicas, somente mediante ordem judicial ou requisição legal
          vinculante (art. 26 LGPD; art. 10, §1º Marco Civil).
        </li>
      </ul>
      <p>Não há compartilhamento comercial com terceiros.</p>

      <h2>6. Transferência internacional</h2>
      <p>
        Algumas operações envolvem transferência internacional (chamadas à API do Google,
        armazenamento na Supabase). Realizadas com base no <strong>art. 33, II da LGPD</strong>{" "}
        (cláusulas contratuais específicas), assegurando nível de proteção compatível com a
        legislação brasileira.
      </p>

      <h2>7. Retenção</h2>
      <ul>
        <li><strong>Conta ativa:</strong> enquanto você for usuário.</li>
        <li>
          <strong>Após exclusão:</strong> dados pessoais identificáveis apagados em até 30
          dias. Tarefas, categorias e relacionamentos: cascata imediata.
        </li>
        <li><strong>Logs de aplicação:</strong> mantidos por 6 meses (art. 15 Marco Civil).</li>
      </ul>

      <h2>8. Direitos do titular (art. 18 LGPD)</h2>
      <ul>
        <li>Confirmação da existência de tratamento.</li>
        <li>Acesso aos dados.</li>
        <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
        <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade.</li>
        <li>Portabilidade dos dados (exportação JSON disponível).</li>
        <li>Eliminação dos dados pessoais tratados com consentimento.</li>
        <li>Informação sobre compartilhamento.</li>
        <li>Revogação do consentimento.</li>
      </ul>
      <p>
        Para exercer qualquer direito, escreva para{" "}
        <a href="mailto:privacidade@liriun.com" target="_blank" rel="noopener noreferrer">privacidade@liriun.com</a>. Resposta em até 15
        dias úteis.
      </p>

      <h2>9. Segurança</h2>
      <ul>
        <li>Senhas armazenadas em hash com algoritmo robusto (bcrypt/argon2).</li>
        <li>Conexões em HTTPS/TLS.</li>
        <li>Acesso restrito por papel ao banco de produção.</li>
        <li>Backups automáticos com criptografia em repouso.</li>
      </ul>

      <h2>10. Crianças e adolescentes</h2>
      <p>
        O Liriun não é destinado a menores de 18 anos e não coleta dados conscientemente
        sobre crianças e adolescentes. Caso identifique tratamento indevido, escreva para o
        DPO.
      </p>

      <h2>11. Alterações</h2>
      <p>
        Atualizações materiais serão comunicadas com pelo menos 30 dias de antecedência por
        e-mail e pela aplicação.
      </p>

      <h2>12. Contato</h2>
      <p>
        Dúvidas, denúncias ou exercício de direitos:{" "}
        <a href="mailto:privacidade@liriun.com" target="_blank" rel="noopener noreferrer">privacidade@liriun.com</a>.
      </p>
      <p>
        Você também pode acionar a{" "}
        <a href="https://www.gov.br/anpd/pt-br" target="_blank" rel="noopener noreferrer">
          Autoridade Nacional de Proteção de Dados (ANPD)
        </a>
        .
      </p>
    </>
  );
}
