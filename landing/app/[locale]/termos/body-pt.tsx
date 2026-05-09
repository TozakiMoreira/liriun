import Link from "next/link";

export function TermosBodyPT() {
  return (
    <>
      <h2>1. Aceitação</h2>
      <p>
        Ao marcar o checkbox de aceite no cadastro e utilizar o Liriun, você declara que{" "}
        <strong>leu, compreendeu e concorda integralmente</strong> com estes Termos e com a{" "}
        <Link href="/privacidade">Política de Privacidade</Link>. O cadastro só é concluído
        após marcação ativa do checkbox, sendo registrados eletronicamente o aceite, a data, a
        hora e o IP de origem como prova do consentimento informado. Se discordar,{" "}
        <strong>não conclua o cadastro nem utilize o serviço</strong>.
      </p>

      <h2>2. Identificação do prestador</h2>
      <ul>
        <li><strong>Serviço:</strong> Liriun — assistente pessoal de tarefas por voz</li>
        <li><strong>Razão social:</strong> ToMore</li>
        <li><strong>CNPJ:</strong> [a definir — registro em andamento]</li>
        <li><strong>Sede:</strong> São Paulo, SP, Brasil</li>
        <li><strong>Suporte:</strong> contato@liriun.com</li>
        <li><strong>Canal de privacidade:</strong> privacidade@liriun.com</li>
      </ul>

      <h2>3. Objeto</h2>
      <p>
        O Liriun é um <strong>software como serviço (SaaS)</strong> que permite cadastrar
        tarefas, organizá-las por categoria, prioridade e prazo, e usar IA (Google Gemini)
        para extrair tarefas a partir de texto livre ou áudio. A versão V1 é oferecida{" "}
        <strong>gratuitamente</strong>. A gratuidade não afasta a aplicação do CDC quando o
        usuário se enquadrar como consumidor.
      </p>

      <h2>4. Cadastro</h2>
      <h3>4.1 Requisitos</h3>
      <ul>
        <li>Ser maior de 18 anos.</li>
        <li>Fornecer e-mail válido, nome e senha verídicos.</li>
        <li>Aceitar estes Termos e a Política de Privacidade.</li>
      </ul>
      <h3>4.2 Responsabilidade pela conta</h3>
      <ul>
        <li>Manter senha em segurança e em sigilo.</li>
        <li>Não compartilhar credenciais com terceiros.</li>
        <li>Notificar imediatamente em caso de uso não autorizado.</li>
        <li>Manter dados cadastrais atualizados.</li>
      </ul>

      <h2>5. Uso aceitável</h2>
      <p>É vedado:</p>
      <ul>
        <li>Usar pra finalidade ilegal, fraudulenta ou abusiva.</li>
        <li>Inserir conteúdo que viole direitos de terceiros.</li>
        <li>Inserir conteúdo ofensivo, discriminatório ou violento.</li>
        <li>Violar/contornar mecanismos de segurança.</li>
        <li>Engenharia reversa, salvo nas hipóteses legalmente permitidas.</li>
        <li>Bots, scrapers ou automações abusivas.</li>
        <li>Revender ou redistribuir o serviço sem autorização.</li>
        <li>Spam, phishing, comunicação não solicitada.</li>
      </ul>
      <p>
        Violação pode levar à suspensão ou exclusão da conta, observados o contraditório e a
        proporcionalidade.
      </p>

      <h2>6. Conteúdo do usuário</h2>
      <h3>6.1 Titularidade</h3>
      <p>Tarefas, observações, áudios e imagens <strong>permanecem de sua propriedade</strong>.</p>
      <h3>6.2 Licença ao Liriun</h3>
      <p>
        Você concede ao Liriun licença{" "}
        <strong>gratuita, não exclusiva, limitada e revogável</strong> para armazenar,
        processar e exibir esse conteúdo{" "}
        <strong>estritamente para o funcionamento do serviço a você</strong> (incluindo envio
        à API do Google Gemini quando usar o Modo Liriun). Conteúdo <strong>não</strong> será
        usado pra treinar modelos de IA, publicidade ou compartilhamento comercial.
      </p>

      <h2>7. Inteligência artificial</h2>
      <ul>
        <li>O Modo Liriun usa Google Gemini para gerar <strong>sugestões</strong>.</li>
        <li>IA pode <strong>errar, omitir, inventar ou interpretar mal</strong>. Revise antes de salvar.</li>
        <li>O Liriun não responde por decisões tomadas com base em saídas da IA.</li>
        <li>Você pode optar por não usar o Modo Liriun e seguir em modo manual.</li>
      </ul>

      <h2>8. Disponibilidade</h2>
      <ul>
        <li>Sem garantia de disponibilidade 24/7 ou SLA específico na V1 gratuita.</li>
        <li>Manutenções programadas e provedores terceiros podem impactar o serviço.</li>
        <li>
          Reservamos o direito de <strong>alterar, suspender ou descontinuar</strong>{" "}
          funcionalidades, com aviso razoável quando possível.
        </li>
      </ul>

      <h2>9. Limitação de responsabilidade</h2>
      <p>
        Na máxima extensão permitida pela legislação aplicável e respeitadas as normas
        cogentes do CDC, o Liriun não responde por perdas causadas exclusivamente por falhas
        de provedores terceiros, ataques cibernéticos não preveníveis com técnica disponível,
        caso fortuito ou força maior. As limitações <strong>não se aplicam</strong> em casos
        de dolo, culpa grave ou violação à LGPD.
      </p>

      <h2>10. Encerramento</h2>
      <p>
        Você pode encerrar sua conta a qualquer momento via Configurações → Excluir conta. O
        Liriun pode encerrar a relação por descumprimento destes Termos, observados o
        contraditório e o aviso prévio quando aplicável.
      </p>

      <h2>11. Alterações</h2>
      <p>
        Atualizações materiais serão comunicadas com pelo menos 30 dias de antecedência por
        e-mail e pela aplicação. O uso continuado após a entrada em vigor implica aceite.
      </p>

      <h2>12. Lei aplicável e foro</h2>
      <p>
        Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o
        foro do domicílio do consumidor para dirimir controvérsias decorrentes destes Termos.
      </p>
    </>
  );
}
