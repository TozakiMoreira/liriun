# Política de Privacidade — Liriun

**Última atualização:** 03 de maio de 2026
**Versão:** 2.1

> ⚠️ **Aviso:** Este documento foi elaborado com base na Lei 13.709/2018 (LGPD), no Marco Civil da Internet (Lei 12.965/2014) e em orientações da Autoridade Nacional de Proteção de Dados (ANPD). Antes da publicação com cadastro aberto ao público, recomenda-se revisão final por advogado especializado em direito digital. Os campos `[PREENCHER]` precisam ser ajustados conforme a operação real.

---

## 1. Quem somos

O Liriun é um organizador pessoal de tarefas e ideias com auxílio de inteligência artificial.

- **Controlador dos dados pessoais:** [PREENCHER — nome ou razão social]
- **CNPJ/CPF:** [PREENCHER]
- **Endereço:** [PREENCHER]
- **Encarregado pelo Tratamento de Dados Pessoais (DPO):** [PREENCHER nome completo]
- **Contato do DPO:** [PREENCHER e-mail, ex: dpo@liriun.app]
- **Canal de privacidade:** [PREENCHER e-mail, ex: privacidade@liriun.app]

Esta política descreve como coletamos, usamos, armazenamos, compartilhamos e protegemos seus dados pessoais quando você utiliza o Liriun, em conformidade com a **Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD)**.

## 2. Dados que coletamos

### 2.1 Dados fornecidos por você

- **Cadastro:** nome, e-mail, senha (armazenada com hash, nunca em texto puro).
- **Perfil:** foto de perfil opcional.
- **Conteúdo do usuário:** tarefas, categorias, observações, datas, prioridades e textos/áudios enviados ao módulo de captura.

### 2.2 Dados coletados automaticamente

- **Logs técnicos:** endereço IP, agente de usuário (navegador), timestamps de requisições — coletados conforme o art. 15 do Marco Civil da Internet.
- **Cookies / armazenamento local:** token de autenticação JWT (`liriun.token`, `liriun.user`); preferências de interface (tema, sidebar). Não usamos cookies de terceiros para rastreamento publicitário.

### 2.3 Dados de terceiros inseridos por você

💡 Caso você insira em suas tarefas, observações ou áudios dados pessoais de terceiros (nomes, contatos, informações de clientes etc.), **você atua como controlador desses dados** perante a LGPD e é responsável por possuir base legal adequada para tratá-los. O Liriun atua apenas como operador nesse cenário.

### 2.4 Dados enviados a operadores

- **Google Gemini API (Google LLC):** o conteúdo enviado ao "Modo Liriun" é processado pela Google para gerar a sugestão de tarefa. [Política do Google](https://policies.google.com/privacy).
- **Supabase Inc.:** banco PostgreSQL gerenciado onde os dados são persistidos. [Política da Supabase](https://supabase.com/privacy).
- **Render (Render Services, Inc.):** hospedagem do backend (API). [Política da Render](https://render.com/privacy).
- **Cloudflare, Inc.:** hospedagem e CDN do site (Cloudflare Pages). [Política da Cloudflare](https://www.cloudflare.com/privacypolicy/).

## 3. Para que usamos seus dados (finalidades e bases legais)

| Finalidade | Base legal LGPD |
|---|---|
| Permitir cadastro, login e acesso à conta | Execução de contrato (art. 7º, V) |
| Armazenar e organizar suas tarefas/categorias | Execução de contrato (art. 7º, V) |
| Processar texto/áudio com IA (Modo Liriun) para criar tarefas | Execução de contrato (art. 7º, V) — funcionalidade central do serviço contratado |
| Personalizar a interface (tom de voz, uso do nome) | Execução de contrato (art. 7º, V) |
| Diagnóstico, segurança e prevenção a fraude | Legítimo interesse (art. 7º, IX) |
| Guarda de logs de aplicação | Cumprimento de obrigação legal (art. 7º, II + Marco Civil, art. 15) |
| Cumprir obrigações legais e regulatórias | Obrigação legal (art. 7º, II) |

💡 **Não usamos seus dados para:** treinamento de modelos de IA próprios ou de terceiros, publicidade comportamental, venda ou compartilhamento comercial.

## 4. Decisões automatizadas e uso de IA (art. 20 da LGPD)

O Modo Liriun usa a API do Google Gemini para **sugerir** tarefas a partir do que você escreve ou fala. Características importantes:

- A IA **apenas sugere** — toda criação ou edição de tarefa exige sua confirmação.
- Não há decisão automatizada que afete seus direitos, perfilamento de comportamento ou pontuação automatizada.
- Você tem direito a solicitar revisão humana de qualquer interpretação feita pela IA.
- Você pode optar por **não usar o Modo Liriun** e continuar utilizando o serviço em modo manual, sem prejuízo das demais funcionalidades.

## 5. Com quem compartilhamos

- **Operadores (processadores) listados na seção 2.4.**
- **Autoridades públicas:** somente mediante ordem judicial ou requisição legal vinculante, conforme art. 26 da LGPD e art. 10, §1º do Marco Civil.

Não há compartilhamento comercial com terceiros.

## 6. Transferência internacional de dados

💡 Algumas operações envolvem transferência internacional (ex: chamadas à API do Google e armazenamento na Supabase, que pode usar regiões fora do Brasil). Essas transferências são realizadas com base no art. 33, II da LGPD (**cláusulas contratuais específicas / cláusulas-padrão contratuais** firmadas com os operadores), assegurando nível de proteção compatível com a legislação brasileira.

A região primária de armazenamento configurada é [PREENCHER — ex: AWS sa-east-1, São Paulo].

## 7. Por quanto tempo guardamos

- **Conta ativa:** enquanto você for usuário do serviço.
- **Após exclusão da conta:** dados pessoais identificáveis são apagados em até **30 dias**. Tarefas, categorias e relacionamentos são apagados imediatamente em cascata.
- **Logs de aplicação:** mantidos por 6 meses, conforme art. 15 do Marco Civil da Internet.
- **Obrigações legais:** dados que precisamos manter por exigência legal (ex: fiscal, judicial) são conservados pelo prazo mínimo aplicável.

## 8. Seus direitos como titular (art. 18 da LGPD)

Você tem direito a, a qualquer momento e gratuitamente:

1. Confirmar a existência de tratamento dos seus dados.
2. Acessar seus dados.
3. Corrigir dados incompletos, inexatos ou desatualizados.
4. Anonimizar, bloquear ou eliminar dados desnecessários, excessivos ou tratados em desconformidade.
5. Portar seus dados a outro fornecedor.
6. Eliminar dados tratados com base em consentimento.
7. Obter informações sobre com quem compartilhamos seus dados.
8. Ser informado sobre a possibilidade de não fornecer consentimento e suas consequências.
9. Revogar consentimento, quando aplicável.
10. **Solicitar revisão de decisões automatizadas** (art. 20).
11. Peticionar à ANPD contra o controlador.

### 8.1 Como exercer seus direitos

- **No próprio app (autoatendimento):** edição de perfil, alteração de senha e **exclusão definitiva da conta** estão disponíveis em `Configurações`, sem necessidade de solicitação por e-mail. A exclusão é executada pelo próprio usuário e produz efeitos imediatos sobre os dados em cascata.
- **Portabilidade:** exportação em formato JSON mediante solicitação ao DPO. Atendimento em até 15 dias.
- **Por e-mail:** [PREENCHER e-mail do DPO]. Resposta em até **15 dias** corridos, conforme orientação da ANPD.
- **Denúncia à ANPD:** [https://www.gov.br/anpd/pt-br/canais_atendimento/cidadao](https://www.gov.br/anpd/pt-br/canais_atendimento/cidadao)

## 9. Segurança

Adotamos medidas técnicas e administrativas para proteger seus dados, incluindo:

- Senhas armazenadas com hash forte (bcrypt ou equivalente).
- Autenticação via JWT com expiração.
- Comunicação criptografada via HTTPS/TLS.
- Controle de acesso baseado em autenticação por usuário.
- Logs de auditoria.
- Acordos de tratamento de dados (DPA) com operadores.

### 9.1 Incidentes de segurança

💡 Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, notificaremos a **ANPD em até 3 (três) dias úteis** a contar da ciência do incidente, conforme orientação vigente da Autoridade, e informaremos os titulares afetados em prazo razoável, nos termos do art. 48 da LGPD.

## 10. Cookies e armazenamento local

Usamos `localStorage` para:

- **Token de autenticação** (`liriun.token`) — necessário para manter sua sessão.
- **Dados básicos do usuário** (`liriun.user`) — para personalização.
- **Preferências de interface** — tema, estado da sidebar.

Não usamos cookies de rastreamento de terceiros nem ferramentas de analytics comportamental nesta versão. Caso isso mude, esta política será atualizada e seu consentimento será solicitado quando necessário.

## 11. Crianças e adolescentes

💡 O Liriun é destinado a maiores de 18 anos. Não coletamos intencionalmente dados de crianças (menores de 12) nem de adolescentes (12 a 18). Caso identifiquemos cadastro de menor, a conta será excluída e os dados eliminados, salvo obrigação legal em contrário (art. 14 da LGPD).

Se você é responsável legal e identificou cadastro indevido de menor sob seus cuidados, contate-nos em [PREENCHER e-mail].

## 12. Alterações nesta política

Podemos atualizar esta política. Mudanças relevantes (ex: novas finalidades, novos operadores, novas bases legais) serão comunicadas por e-mail e/ou aviso destacado no app, com antecedência razoável. A data da última atualização está no topo do documento.

## 13. Lei aplicável e foro

Esta política é regida pelas leis da República Federativa do Brasil. Eventuais disputas serão resolvidas no foro do domicílio do consumidor (CDC, art. 101, I) ou no foro da comarca de [PREENCHER cidade do controlador], conforme a opção do titular.

## 14. Contato

**E-mail do DPO:** [PREENCHER]
**E-mail de privacidade:** [PREENCHER]
**Endereço:** [PREENCHER]

---

**Histórico de versões**

| Versão | Data | Alterações |
|---|---|---|
| 1.0 | 03/05/2026 | Versão inicial |
| 2.0 | 03/05/2026 | Ajustes LGPD: base legal da IA, decisões automatizadas (art. 20), prazo de notificação à ANPD (3 dias úteis), transferência internacional (art. 33), distinção criança/adolescente (art. 14), responsabilidade do usuário sobre dados de terceiros |
| 2.1 | 03/05/2026 | Reforço da exclusão de conta por autoatendimento (cumprimento prático do art. 18) |
