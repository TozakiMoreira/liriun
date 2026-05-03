# Liriun - Funcionalidades Futuras

Lista de funcionalidades e melhorias que NAO serao implementadas na V1.
Organizado por prioridade: as ideias mais impactantes (que transformariam o app) primeiro.

---

# TIER 1 - Core / Killer Features

Ideias que mudam completamente a usabilidade do app. Devem vir primeiro nas proximas evolucoes.

## Captura via WhatsApp / Telegram
- Mandar uma mensagem para um numero/bot e ele cria a anotacao automaticamente
- Encaixa perfeitamente no habito atual de "salvar tudo no WhatsApp"
- **Telegram primeiro** (gratis, API simples), **WhatsApp depois** (API Business e mais complexa/paga)
- A mensagem entra no fluxo normal: IA categoriza, salva no banco, aparece no app
- Aceita texto e audio (com transcricao)

## Sistema de notificacoes
- Notificar o usuario sobre tarefas com prazo se aproximando ou vencendo
- Push no celular (app mobile) e no navegador (web)
- Tipos:
  - Tarefas que vencem no mesmo dia (alerta logo cedo)
  - Tarefas vencendo em poucas horas
  - Tarefas urgentes pendentes ha muito tempo
- Configuracoes:
  - Habilitar/desabilitar tipos
  - Horarios preferidos
  - Modo "nao perturbe"

## Recorrencia de tarefas
- Tarefas que se repetem automaticamente
- Exemplos: "pagar aluguel todo dia 5", "academia toda segunda", "reuniao quinzenal"
- Suporta padroes: diario, semanal, mensal, anual, customizado
- Sem isso, o usuario recria as mesmas tarefas o tempo todo

## Aplicativo mobile nativo
- Migrar de web responsivo para app mobile nativo (ou hibrido)
- Distribuicao via Play Store / App Store
- Habilita varias outras features dependentes (push, atalhos, geolocalizacao, etc.)

## Captura por audio com transcricao
- Botao para gravar audio direto na tela de captura
- Sistema transcreve automaticamente em texto
- Texto transcrito segue o fluxo normal (IA categoriza)
- APIs possiveis: Gemini (suporta audio direto), Whisper (OpenAI), Google Speech-to-Text

## Modo "captura instantanea" sem revisao
- Configuracao opcional ativada pelo usuario
- Quando ligada: usuario fala/digita e o sistema **salva direto, sem tela de revisao**
- Aceita automaticamente categoria, tags, urgencia e prazo sugeridos pela IA
- Usuario pode revisar/corrigir depois pelo dashboard se quiser
- Casa muito bem com smartwatch, atalhos rapidos e assistentes de voz

---

# TIER 2 - Alto valor, complementam o core

## Atalhos rapidos do celular
- Abrir o app via comando ou atalho do sistema operacional
- Exemplo: clicar 5 vezes seguidas no botao de travamento
- Uso de gestos, atalhos da tela de bloqueio, widgets, Quick Tiles
- Apos abrir, microfone ja inicia gravando automaticamente
- Objetivo: do impulso ate salvo em poucos segundos
- Restricao: atalho de 5 cliques so funciona bem em Android; iOS e mais limitado

## Lembretes por geolocalizacao
- "Quando eu chegar no mercado, lembrar de comprar X"
- Celular detecta o local e dispara o alerta
- Depende do app mobile nativo
- Sem custo adicional

## Chat conversacional com a IA sobre suas tarefas
- Conversa em linguagem natural sobre o conteudo do app
- Exemplos:
  - "O que tenho pra fazer essa semana?"
  - "Reorganiza minhas prioridades"
  - "Resume o que eu concluI esse mes"
  - "Agrupa minhas ideias por tema"
- A IA tem acesso ao banco do usuario e responde com base nele

## Perguntas faladas pro Liriun sobre tarefas (voice query)
- Extensao do "Chat conversacional" mas via voz no celular
- Usuario aciona um comando rapido (atalho de voz, widget, long-press do app) e fala uma pergunta
- Exemplos:
  - "Liriun, me fala quais tarefas eu tenho da FATEC pra essa semana"
  - "Liriun, o que eu tenho pendente pra hoje?"
  - "Liriun, quantas tarefas urgentes eu tenho?"
- Resposta em duas modalidades (usuario escolhe nas preferencias):
  - **Voz (TTS)**: Liriun fala de volta com a voz escolhida
  - **Tela**: abre uma tela de visualizacao dedicada filtrada pela pergunta
- Dependencias: reconhecimento de voz, LLM pra interpretar a pergunta como filtro, TTS opcional, microfone acessivel (app mobile ou PWA com HTTPS)
- Casa com a visao de longo prazo do Liriun como assistente estilo JARVIS do Homem de Ferro

## API publica para integracao com outros sistemas
- API externa documentada para outros apps se conectarem ao Liriun
- Casos de uso:
  - Google Agenda: sincronizar tarefas com prazo como eventos
  - ClickUp / Trello / Notion: importar tarefas
  - Automacoes (Zapier, n8n, Make): fluxos personalizados
- Cada usuario gera sua chave de API
- Documentacao Swagger/OpenAPI publica
- O Liriun vira a fonte central de tarefas/ideias do usuario

## Webhooks
- Notificar sistemas externos quando algo acontece no Liriun
- Eventos: nova anotacao criada, anotacao concluida, prazo se aproximando
- Permite automacoes complexas com ferramentas externas

## Setor de financas (contas a pagar e notificacao de boletos)

- Nova area dentro do Liriun dedicada a contas e pagamentos — complementa tarefas comuns
- **Contas recorrentes**: usuario cadastra contas que se repetem todo mes (aluguel, luz, internet, assinaturas)
  - Liriun gera tarefa automatica proxima do vencimento
  - Configuravel: dia do mes, valor (opcional), categoria (ex: Casa), prioridade
  - Marca como paga no mes → proxima tarefa gera no mes seguinte
- **Notificacao automatica de boletos gerados no CPF do usuario**:
  - Nubank e Itau ja fazem isso hoje — avisam o usuario quando um boleto novo e emitido no nome dele
  - Provavelmente usa API de consulta ao Registro de Boletos (Febraban) ou servicos similares
  - Investigar: APIs publicas/privadas disponiveis, custo, exigencias de compliance (open finance, dados financeiros sensiveis)
  - Quando boleto e detectado, Liriun cria tarefa automatica: "Pagar boleto de R$X vencendo em Y"
- Dashboard financeiro: soma de contas do mes, pendencias, pagos
- **Plano**: provavelmente nao-free pelo custo de API de boletos e seguranca envolvida — candidato a Plus ou Premium
- Risco alto de compliance: dados financeiros exigem LGPD rigorosa, criptografia, auditoria; nao comecar sem pesquisa juridica primeiro

## Pesquisa semantica
- Buscar por significado, nao palavra exata
- Exemplo: buscar "coisas pra pagar" e encontrar "boleto da luz"
- Implementacao com embeddings de IA (Gemini ou modelos open-source)
- Custo baixo

## Sistema social: amigos + ranking semanal de tarefas concluidas

- Usuarios se adicionam como amigos e veem um **ranking semanal** com quantas tarefas cada um concluiu — gamificacao via competicao saudavel
- **Fluxo de amizade**:
  - Buscar usuario por email (`GET /usuarios/buscar?email=`)
  - Enviar convite (`POST /amigos/convite`) — fica em status Pendente
  - Receber notificacao no app (badge no item "Amigos" do sidebar)
  - Aceitar/Recusar (`POST /amigos/{id}/aceitar` / `recusar`)
  - Remover amigo (`DELETE /amigos/{id}`)
- **Ranking semanal** (`GET /amigos/ranking?periodo=semana`):
  - Retorna lista ordenada desc: `[{ amigoId, nome, fotoUrl, concluidasNaSemana, posicao }]`
  - Inclui o proprio usuario na lista pra ver sua posicao
  - Reset automatico toda segunda-feira 00:00 (timezone do usuario)
- **Privacidade — IMPORTANTE**:
  - Ranking so mostra **CONTAGEM** de tarefas concluidas, NUNCA o conteudo (titulo, categoria, observacoes vazariam dados privados)
  - Avatar e nome ja sao expostos (cadastro ja tem isso)
  - Usuario pode bloquear/sair de ranking individualmente (modo invisivel)
- **Esboco tecnico**:
  - Nova entidade `Amizade` (UsuarioAId, UsuarioBId, Status: Pendente/Aceita, CriadaEm, AceitaEm) — relacao simetrica, criada como linha unica
  - Migration nova com indice composto unique em (UsuarioAId, UsuarioBId)
  - Read repo `IAmizadeReadRepository` com query agregada por semana
  - Frontend: nova rota `/app/amigos` com 3 abas (Ranking, Meus amigos, Convites pendentes)
  - Item no sidebar com badge de convites pendentes
  - Widget pequeno "sua posicao no ranking" na tela de Minhas Tarefas (opcional, configuravel)
- **Por que vale a pena**:
  - Diferencial competitivo (Todoist, TickTick nao tem isso bem feito)
  - Engagement: pessoas usam mais quando sabem que tem amigo competindo
  - Ideal pra grupos pequenos (faculdade, time de trabalho, casal)
- **Evolucoes possiveis** (V1.2+):
  - Ligas/divisoes (bronze, prata, ouro) que sobem/descem por desempenho
  - Conquistas/badges ("100 tarefas concluidas", "30 dias seguidos")
  - Sistema de pontos com peso por prioridade (urgente vale mais que baixa)
  - Grupos privados (criar uma "liga" so com amigos especificos)
  - Mensagens curtas entre amigos no app (cuidado com escopo — pode virar feature gigante)
- **Risco**: feature social adiciona moderacao (perfis falsos, abuso) — limitar adicao por email/aceite manual mitiga inicialmente
- **Estimativa**: 1-2 dias backend + 1 dia frontend = pode entrar como V1.1 ou V1.2 logo apos deploy do PI
- Origem da ideia: Lucas, 2026-05-02

---

# TIER 3 - Inteligencia adicional

## Insights e analise pessoal
- IA analisa historico e mostra padroes:
  - "Voce tem deixado tarefas urgentes acumular"
  - "60% das suas ideias sao sobre faculdade"
  - "Voce e mais produtivo nas tercas"
- Relatorio semanal/mensal automatico
- Custo baixo (uma analise por semana ja resolve)

## Templates de anotacao
- Tipos de anotacao com campos pre-definidos
- Exemplos:
  - "Ideia de projeto" -> nome, problema que resolve, stack
  - "Compra recorrente" -> item, marca preferida, lojas
  - "Reuniao" -> participantes, pauta, decisoes

## Re-categorizacao automatica ao editar
- Quando o usuario edita uma anotacao, a IA pode reanalisar e sugerir nova categoria/tags

## Sugestao de novas tags pela IA
- Quando a IA detecta um padrao recorrente, sugere criar uma nova tag

## Formato de exibicao do prazo configuravel pelo usuario
- Permitir que o usuario escolha como o prazo final de cada tarefa e exibido na tela Minhas Tarefas
- Opcoes possiveis:
  - **Relativo** (padrao da V1): "em 4 dias", "Amanha 23:59", "Em 18 dias", "Ontem 18:00"
  - **Absoluto**: "quinta-feira, 18/05/2026", "18/05/2026 23:59"
  - **Misto**: proximas (<7 dias) em relativo, mais distantes em absoluto
- Preferencia salva por usuario em Configuracoes
- Alguns preferem tempo relativo (mais humano); outros preferem data fixa (mais preciso pra planejar agenda)

## Tooltips explicativos (icone "i") nos formularios
- Adicionar icones "i" com tooltip ao lado de titulos de secoes e campos em todos os formularios do app
- Explicam o que aquele campo faz com 1-2 exemplos praticos
- Motivo: usuario novo (testado com a namorada do Pedro) teve duvida sobre o que eram "categorias" no onboarding
- Aplicar em: onboarding, criacao de tarefa (manual), configuracoes, filtros da tela Minhas Tarefas
- Padrao: tooltip no hover, curto e direto, com exemplos ("Faculdade", "Compras")

---

# TIER 4 - Multiplataforma e expansao

## Lancamento global com 5+ linguas (meta: fim de 2026)

- **Meta ambiciosa**: Liriun publicado globalmente com suporte a pelo menos 5 idiomas ate o final de 2026
- **Idiomas candidatos (por ordem de facilidade + alcance)**:
  1. Portugues BR (pt-BR) — nativo, base da V1
  2. Ingles (en-US) — alcance global, maior base de usuarios potencial
  3. Espanhol (es) — America Latina + Espanha
  4. Frances (fr) — Franca + Canada + Africa
  5. Alemao (de) — Europa central
  6. Italiano (it) — opcional
- **Pre-requisitos tecnicos (fazer ja na V1)**:
  - Nenhuma string hardcoded no codigo — tudo via chave de traducao desde o primeiro commit
  - `@angular/localize` configurado no front desde o inicio
  - `IStringLocalizer` + resource files configurado no back
  - Estrutura de arquivo de traducao escolhida (JSON, XLIFF ou PO)
  - Fallback de idioma definido (ex: se falta chave em fr, cai pra en)
- **Desafios especificos do Liriun**:
  - **Tom de voz em outros idiomas** — o tom "Liriun seco e discreto" precisa ser traduzido com cuidado, nao literal. Pode exigir revisao humana nativa por idioma
  - **Nome do mascote / do produto** — manter "Liriun" globalmente ou localizar?
  - **Prompt da IA Gemini** — enviar prompt no idioma do usuario? Ou sempre em ingles e traduzir resposta? Testar as duas abordagens
  - **Categorias padrao e prazos padrao** — traducao dos templates ("Trabalho" → "Work" / "Trabajo" / "Arbeit")
  - **Formatos de data/hora/moeda** — usar `Intl` API no front e `CultureInfo` no back
- **Fluxo de adicao de idioma novo**:
  1. Copiar pt-BR.xlf como base
  2. Enviar pra traducao (servico profissional ou IA + revisao humana)
  3. Revisar tom do Liriun com nativo daquele idioma
  4. Deploy e smoke test
- **Estrategia de rollout**:
  - V1: so pt-BR, mas com infraestrutura pronta
  - V1.1: adicionar en-US (maior retorno potencial)
  - V1.2+: es, fr, de conforme tracao
- **Detalhes de UX**:
  - Seletor de idioma no canto do app (rodape da sidebar ou nas Configuracoes)
  - Detectar idioma do navegador como padrao inicial
  - Salvar preferencia do usuario no perfil

## Multiplataforma completa
- A solucao em diversos dispositivos:
  - Web desktop (ja contemplado na V1)
  - Mobile Android e iOS (Tier 1)
  - Smartwatches (Apple Watch, Wear OS) - captura ultra-rapida por voz
  - Assistentes de voz (Siri, Google Assistant, Alexa)
  - Desktop nativo (Windows/Mac/Linux via Electron, Tauri, etc.)
- Sincronizacao em tempo real entre dispositivos
- UX otimizada por contexto (smartwatch foca em voz e leitura rapida)

## Notificacao por email
- Resumo diario do que esta pendente
- Alertas de prazos vencendo

## Modo dark
- Alternar entre tema claro e escuro
- Salvar preferencia do usuario

## Tema de cores personalizavel pelo usuario
- Usuario escolhe a paleta do app (accent color, fundo)
- Niveis de implementacao:
  - **Basico**: seletor entre 4-5 accent colors predefinidos ("Liriun Purple", "Mono Cinza", "Ember Laranja", etc)
  - **Intermediario**: temas nomeados completos (cada um com accent + fundo + bordas)
  - **Avancado**: editor de tokens CSS abertos pro usuario mexer a vontade
- V1 e dark-only clonando Linear — essa ideia e pra quando o app tiver base de usuarios com gostos diferentes

---

# TIER 5 - Recursos avancados de conteudo

## Sub-tarefas / checklist
- Cada anotacao pode ter lista de itens marcaveis
- Util para tarefas compostas (ex: "ir ao mercado" com lista de compras)

## Anexos nas anotacoes
- Links
- Imagens
- Arquivos genericos

## Export e portabilidade de dados
- Export em JSON, CSV
- Backup completo do banco
- Import de outras fontes (WhatsApp, Notion, etc.)

## PWA com modo offline
- App instalavel no celular via navegador
- Funciona offline e sincroniza ao voltar a internet
- Service worker para cache

---

# TIER 6 - Autenticacao e usuarios

## Recuperacao de senha funcional
- Envio de codigo/link por email para resetar senha
- Atualmente o email so e armazenado, sem fluxo

## Multi-usuario completo
- Cadastro publico
- Cada usuario com seus proprios dados
- Login com Google (OAuth)

## Two-factor authentication (2FA)
- Camada extra de seguranca

---

# TIER 7 - Planos premium e experiencia estendida do Liriun

Ideias que formam uma camada "premium" / plano pago, transformando o Liriun de ferramenta de produtividade em **companheiro digital personalizavel**. Fazem sentido apenas quando houver base de usuarios — tem custo de design e desenvolvimento altos, mas podem virar diferencial de mercado.

## Mascote do Liriun (forma fisica visual)

- Liriun deixa de ser apenas "voz em texto" e ganha uma **representacao visual** — um mascote em pixel art que aparece nas telas
- O mascote seria a cara/corpo do Liriun: cada usuario ve o Liriun assumir forma fisica
- Interacoes acontecem via balao de fala (speech bubble) vindo do mascote em vez de textos genericos na tela
- Aplicavel em:
  - Confirmacoes ("Anotado, Pedro!" sai do balao do mascote)
  - Estado vazio da tela Minhas Tarefas (mascote fala "Tudo em dia, Pedro")
  - Erros da IA (mascote com expressao de "poxa, nao entendi")
  - Onboarding (mascote guia o usuario)
- **Personalizacao**: usuario pode escolher visual do mascote (cor, acessorios, roupas) — algo tipo "skin" no mundo dos jogos
- Depende de: arte pixel (contratar artista ou fazer in-house), sistema de animacoes leves, estados emocionais do mascote por contexto
- Vinculado a plano pago (assinatura ou compra unica)

## Metodo Pomodoro integrado

- Timer Pomodoro dentro do Liriun pra sessoes de foco
- Configuravel: duracao de foco, duracao de pausa, numero de ciclos
- Durante o foco: tela minimalista, mascote em modo "silencio/foco"
- **No intervalo, o Liriun (via mascote) sugere atividades saudaveis:**
  - "Bebe um copo de agua, Pedro"
  - "Faz um alongamento de pescoco rapido"
  - "Levanta e caminha um pouco"
  - "Olha pra algo distante 20 segundos (regra 20-20-20)"
  - "Vai no banheiro se precisar"
- Dicas variadas com banco interno e rotacao para nao repetir
- Estatistica: quantos pomodoros concluidos por dia/semana
- Pode ser vinculado a tarefas especificas ("fazer 2 pomodoros pra estudar calculo")

## Minigames no intervalo do Pomodoro

- Durante a pausa do Pomodoro, usuario pode jogar minigame curto com o mascote
- Opcoes de minigame (referencias: jogos "cozy" da Steam tipo Stardew Valley, Unpacking, Animal Crossing):
  - **Cultivar plantacao**: plantar semente, regar, colher — ciclo longo que casa com disciplina diaria
  - **Decorar quarto virtual**: ambiente personalizavel onde o mascote vive; itens sao desbloqueados ao completar tarefas/pomodoros
  - **Cuidar do mascote**: alimentar, brincar (tipo tamagotchi leve)
  - **Sistema de moeda virtual** ganha concluindo tarefas/pomodoros, gasta em items de decoracao ou roupas do mascote
- Gamificacao que incentiva consistencia de uso
- Depende de: design de jogo, arte, sistema de progresso, persistencia no banco
- Vinculado ao mesmo plano do mascote

## Liriun como companheiro / amigo para desabafar

- Modo "conversa" onde o usuario digita ou fala coisas do dia dele (nao tarefas — sentimentos, pensamentos, frustracoes)
- Liriun responde com tom de amigo proximo (nao terapeuta, nao psicologo — amigo)
- Escuta, valida, faz perguntas, sugere micro-acoes saudaveis baseadas no contexto:
  - Usuario diz que esta estressado com prova → Liriun sugere pausa, ativacao fisica, respiracao
  - Usuario diz que nao esta conseguindo dormir → Liriun pergunta sobre cafe, tela, horarios, sugere rotina
  - Usuario esta animado com algo bom → Liriun celebra junto
- **IMPORTANTE**: deixar claro que nao substitui profissional de saude mental. Se detectar sinais de crise (ideacao suicida, violencia, etc.), direcionar pra CVV/CAPS imediatamente
- Depende de: LLM com prompt cuidadoso (pode ser Gemini + system prompt especifico), salvaguardas de seguranca, moderation layer
- Plano pago separado ou parte do plano premium com mascote — funcionalidade complexa de desenvolver e operar com responsabilidade
- Alinhado com visao de longo prazo do Liriun ser um "companheiro" digital (nao so organizador)

## Modelo de monetizacao sugerido

- **Free**: V1 completa (captura, categorias, prazos, IA, tarefas, concluidas)
- **Plus** (R$X/mes): Pomodoro, notificacoes avancadas, estatisticas detalhadas, tema personalizado
- **Premium** (R$Y/mes): Mascote personalizavel + minigames + gamificacao completa
- **Companion** (R$Z/mes): Conversa terapeutica / companheiro — requer mais IA e tem custo operacional alto
- Preco a definir com base em benchmark (Todoist Premium, Notion Plus, etc.)

---

# Outros projetos (ideias soltas do brainstorm inicial)

Estas eram ideias do brainstorm inicial que podem virar projetos separados ou serem incorporadas no Liriun a longo prazo.

## Assistente pessoal por voz
- Comando de voz para criar anotacoes, pedir musicas no Spotify, listar tarefas
- Integracao com APIs de musica e produtividade

## App de filtros de musica
- Aplicar efeitos como slowed and reverb, speed up, nightcore
- Comecar como app web/desktop, depois evoluir para mobile

## Sincronizador de saves de emulador de Pokemon
- Compartilhar o mesmo save entre celular e notebook
- Servico de sync de arquivos

## Automacao de preenchimento em sites
- Bot ou extensao que preenche cadastros automaticamente
- Usa base de dados pessoal ou IA para responder com base no contexto da pagina
