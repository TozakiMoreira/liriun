// app-v2/app.jsx — canvas mount: analysis + screens + site improvements

const FRAME = { w: 280, h: 600 };

function Phone({ children }) { return <PhoneFrame w={FRAME.w} h={FRAME.h}>{children}</PhoneFrame>; }

function Row({ phone, note }) {
  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
      <Phone>{phone}</Phone>
      {note}
    </div>
  );
}

// Analysis section showing current vs proposed
function AnalysisOverview() {
  return (
    <div style={{
      padding: 36, borderRadius: 22,
      background: 'linear-gradient(180deg, rgba(168,139,255,0.10), rgba(255,255,255,0.02))',
      border: '1px solid rgba(168,139,255,0.28)',
      maxWidth: 1240,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <LiriunMark size={48}/>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.violet300, letterSpacing: 1.4, textTransform: 'uppercase' }}>App · Versão 2 · Mobile-first</div>
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -1, color: T.text, marginTop: 4, lineHeight: 1 }}>
            O app, 5× mais especial.
          </div>
        </div>
      </div>

      <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.55, maxWidth: 760, marginBottom: 28 }}>
        O que você tem hoje na web é a <strong style={{ color: T.text }}>versão desktop</strong> do app — um dashboard funcional. O <strong style={{ color: T.text }}>app móvel</strong> precisa ser outra coisa: pessoal, narrativo, com ritmo. Essas 15 telas mostram como.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* Current */}
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 600, color: T.faint, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 12 }}>O QUE EXISTE HOJE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Sidebar nav', 'desktop-style: Falar · Hoje · Tarefas · Atividade'],
              ['Cards de stat', '"Pendentes 0 · Atrasadas 1 · Concluídas 0"'],
              ['Lista flat', 'todas tarefas como linhas iguais'],
              ['Sem motion', 'transições básicas, sem identidade'],
              ['Conquistas genéricas', 'cards iguais, sem celebração'],
              ['Chat mic estático', 'sem fluxo de extração em real time'],
            ].map(([h, b], i) => (
              <div key={i} style={{ display: 'flex', gap: 10 }}>
                <span style={{ width: 5, height: 5, borderRadius: 99, background: T.faint, marginTop: 7, flexShrink: 0 }}/>
                <div>
                  <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{h}</span>
                  <span style={{ fontSize: 12, color: T.muted, marginLeft: 6 }}>— {b}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proposed */}
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 600, color: T.violet300, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 12 }}>O QUE PROPOMOS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Tab bar mobile', 'Hoje · Tarefas · Calendário · Insights'],
              ['Today como narrativa', '"3 momentos. Começando às 9." + timeline visual'],
              ['Coleções visuais', 'cada categoria como capa colorida'],
              ['Motion intencional', 'orb pulse, ring, waveform, shimmer · 18 microinterações'],
              ['Streak + heat anual', 'GitHub-style, com conquistas shareáveis'],
              ['Voz como flagship', 'extração token-a-token + preview card no momento'],
              ['Liriun proativa', 'sugere, lembra, pergunta — não só executa'],
              ['Quick capture', 'long-press de qualquer tela'],
              ['Notificações inteligentes', 'contextuais, com smart actions'],
            ].map(([h, b], i) => (
              <div key={i} style={{ display: 'flex', gap: 10 }}>
                <span style={{ width: 5, height: 5, borderRadius: 99, background: T.violet400, marginTop: 7, flexShrink: 0, boxShadow: `0 0 6px ${T.violet400}` }}/>
                <div>
                  <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{h}</span>
                  <span style={{ fontSize: 12, color: T.muted, marginLeft: 6 }}>— {b}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Site improvements card
function SiteImprovements() {
  return (
    <div style={{
      padding: 36, borderRadius: 22,
      background: 'rgba(255,255,255,0.025)',
      border: `1px solid ${T.borderHi}`,
      maxWidth: 1240,
    }}>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.violet300, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 12 }}>Site · próximos passos</div>
      <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -1, color: T.text, lineHeight: 1, marginBottom: 14 }}>
        Como o site melhora com base no app.
      </div>
      <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.55, maxWidth: 720, marginBottom: 28 }}>
        Com o app definido, o site deve mostrar exatamente isso. Trocar genérico por específico, e estático por animado.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        {[
          {
            h: '1 · Hero · mostrar o produto',
            b: 'Hoje o hero tem dois iPhones com chat. Trocar pelas telas Today + Voice + Insights animadas em loop. Mostra o produto inteiro, não só uma feature.',
            tag: 'HERO',
          },
          {
            h: '2 · Seção "O dia"',
            b: 'Nova seção depois do hero: 3 imagens do Today (manhã, meio-dia, noite). Conta a história do dia que o usuário vive com Liriun.',
            tag: 'NOVA',
          },
          {
            h: '3 · "Como Liriun aprende"',
            b: 'Mostra os insights ("você é mais produtivo às terças"). Cria conexão emocional — não é só voz, é entendimento.',
            tag: 'NOVA',
          },
          {
            h: '4 · Voice demo interativa',
            b: 'Botão na home: "Tente falar". Usa Web Speech API + nossa extração mock. Mostra a magia em 5 segundos.',
            tag: 'INTERAÇÃO',
          },
          {
            h: '5 · Streak shareable',
            b: 'Página /streak/[user] gerada via OG image dinâmica (Next.js). Quando usuário compartilha, link gera card lindo automaticamente.',
            tag: 'GROWTH',
          },
          {
            h: '6 · Trust strip mais focado',
            b: 'Os "Acme · NORTH/STAR" hoje parecem fake. Trocar por screenshots reais de reviews da App Store + Trustpilot.',
            tag: 'POLISH',
          },
          {
            h: '7 · Footer com app preview',
            b: 'No footer, embed do widget Today em loop (como GitHub readme contribution graph). Sutil, sempre ali.',
            tag: 'CHARM',
          },
          {
            h: '8 · /comparar pages',
            b: 'Páginas SEO: "Liriun vs Things 3", "vs Todoist", "vs Notion". Tabela limpa, sem brigar com competidores.',
            tag: 'SEO',
          },
          {
            h: '9 · Blog com insights data',
            b: '"Os 5 horários mais produtivos da semana segundo 10k usuários do Liriun". Conteúdo único que só nós temos.',
            tag: 'CONTENT',
          },
        ].map((item, i) => (
          <div key={i} style={{
            padding: 18, borderRadius: 14,
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${T.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{
                fontFamily: T.mono, fontSize: 9, color: T.violet300,
                padding: '3px 7px', borderRadius: 5,
                background: 'rgba(168,139,255,0.10)', border: '1px solid rgba(168,139,255,0.22)',
                letterSpacing: 0.6, fontWeight: 600,
              }}>{item.tag}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text, letterSpacing: -0.2, marginBottom: 6 }}>{item.h}</div>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{item.b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      {/* ─── ANALYSIS ───────────────────────────────────────── */}
      <DCSection id="overview" title="00 · Diagnóstico" subtitle="Onde estamos e pra onde vamos.">
        <DCArtboard id="analysis" label="Análise · atual vs proposto" width={1240} height={620}>
          <AnalysisOverview/>
        </DCArtboard>
      </DCSection>

      {/* ─── TODAY (the new hero of the app) ────────────────── */}
      <DCSection id="today" title="01 · Today · narrativa, não stats" subtitle="A tela principal vira uma história do dia. 3 momentos: manhã, meio-dia, noite. Cada um com personalidade própria.">
        <DCArtboard id="morning" label="1.1 · Manhã" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenTodayMorning/>} note={
            <MotionNote num="1.1 · Today · Morning" title="Story-first home" lines={[
              ['Vs atual', 'Cards de stat genéricos viram day shape · barra horizontal com timeline'],
              ['Liriun proativa', 'Sugere a próxima ação contextual ("você tem 2h livres antes da Marina")'],
              ['Featured', 'Próxima tarefa em destaque · com countdown'],
              ['Mic', 'Sempre visível e pulsante · gateway pro voice flow'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="midday" label="1.2 · Meio-dia" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenTodayMidday/>} note={
            <MotionNote num="1.2 · Today · Midday" title="Status check" lines={[
              ['Ring progresso', 'SVG circle stroke-dashoffset · 60% concluído'],
              ['Comparação', 'Mostra ritmo vs sua média ("+18% em quartas")'],
              ['Done lane', 'Tarefas concluídas como chips verdes · celebra micro-vitórias'],
              ['Foco', 'Decisão fica clara: ainda restam 2 · 3h pra resolver'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="evening" label="1.3 · Noite" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenTodayEvening/>} note={
            <MotionNote num="1.3 · Today · Evening" title="Reflection, not blame" lines={[
              ['Tom', '"Você fechou 5 de 6. Não foi mal." · positivo, não punitivo'],
              ['Day stamp', '6 dots horizontais = tarefas do dia · só quem fez fica iluminado'],
              ['Soft fail', 'Yoga não-feita aparece em âmbar · oferece reagendar'],
              ['Tomorrow brief', 'Já planta a próxima · sem ter que pedir'],
            ]}/>
          }/>
        </DCArtboard>
      </DCSection>

      {/* ─── VOICE FLOW ─────────────────────────────────────── */}
      <DCSection id="voice" title="02 · Voz · feature flagship" subtitle="O momento que vende o app. Listening → Processing → Saved precisa parecer mágica.">
        <DCArtboard id="listen" label="2.1 · Ouvindo" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenVoiceListening/>} note={
            <MotionNote num="2.1 · Listening" title="Imersivo · sem distração" lines={[
              ['Live transcript', 'Aparece word-by-word com words-chave (Marina, amanhã às 9) destacadas'],
              ['Rings', '3 rings concentric pulsam defasados · feedback de captura'],
              ['Mic', 'Scale loop 1.4s · sempre vivo'],
              ['Pill ao topo', 'Mostra duração da gravação · dot vermelho pulsando'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="processing" label="2.2 · Processando" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenVoiceProcessing/>} note={
            <MotionNote num="2.2 · Processing" title="Transparência sobre IA" lines={[
              ['Mark com shimmer', 'Ícone de IA · mostra que está pensando'],
              ['Transcript highlighted', 'O texto que foi falado · cores por entidade extraída'],
              ['Fields aparecem', 'Stagger 0.2s · Título → Pessoa → Quando → Categoria → Prioridade'],
              ['Progress', 'Indeterminada · "Quase lá · Preview em 0.4s"'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="saved" label="2.3 · Salvo · com card preview" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenVoiceSaved/>} note={
            <MotionNote num="2.3 · Saved" title="Mostra o que foi criado" lines={[
              ['Check + confetti', 'Stroke draw 0.55s · 6 particles burst'],
              ['Preview card', 'Mostra EXATAMENTE a tarefa criada · com cat tag colorida'],
              ['Liriun pergunta', 'Sugestão de follow-up ("adicionar 15min prep?")'],
              ['Falar mais', 'CTA pra próxima · loop voz sem fricção'],
            ]}/>
          }/>
        </DCArtboard>
      </DCSection>

      {/* ─── TASKS REIMAGINED ───────────────────────────────── */}
      <DCSection id="tasks" title="03 · Tarefas como coleções" subtitle="Não uma lista flat. Cada categoria vira uma capa visual com personalidade.">
        <DCArtboard id="collections" label="3.1 · Coleções" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenTaskCollections/>} note={
            <MotionNote num="3.1 · Collections" title="Visual, não tabular" lines={[
              ['Cards', 'Grid 2-col · cada categoria com gradient sutil da sua cor'],
              ['Progress', 'Barra mini mostra concluídas/total'],
              ['Smart lists', 'Prioritárias · Agendadas hoje · Sem categoria'],
              ['Filtros', 'Chips com contadores · "Hoje 4", "Atrasadas 1"'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="inside" label="3.2 · Dentro de uma coleção" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenTaskInside/>} note={
            <MotionNote num="3.2 · Inside Collection" title="Foco na cat" lines={[
              ['Header com cor', 'Glow da categoria · identidade clara'],
              ['Tabs', 'Abertas · Concluídas · Arquivadas'],
              ['Agrupamento', 'Hoje · Esta semana · Sem prazo'],
              ['Prep tags', '"+15M PREP" chip mostra que Liriun adicionou tempo de preparação'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="detail" label="3.3 · Detalhe full-screen" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenTaskDetail/>} note={
            <MotionNote num="3.3 · Task Detail" title="Sheet → Full page" lines={[
              ['Hero', 'Bg gradient da cor da categoria · radius 0 (não sheet)'],
              ['Avatar Marina', 'Pessoa fica em destaque · não só texto'],
              ['Liriun lembra', 'Contexto histórico: "Última conversa com Marina foi há 3 dias"'],
              ['CTA grande', 'Concluir + edit · pressível, primary'],
            ]}/>
          }/>
        </DCArtboard>
      </DCSection>

      {/* ─── CALENDAR & INSIGHTS ────────────────────────────── */}
      <DCSection id="calendar" title="04 · Calendário & Insights" subtitle="Densidade visual ao invés de listas. Heat maps que contam histórias.">
        <DCArtboard id="month" label="4.1 · Mês com heat" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenCalendarMonth/>} note={
            <MotionNote num="4.1 · Month View" title="Heat de densidade" lines={[
              ['Grid 7x5', 'Cada dia com intensidade de violet · mais escuro = mais tarefas'],
              ['Hoje', 'Em gradient · pop · com sombra'],
              ['Stats strip', '52 tarefas · 38 done · 73% foco · 12d streak'],
              ['Legenda', 'Mostra escala de heat embaixo'],
              ['Today preview', 'Card com as 3 tarefas do dia ativo'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="day" label="4.2 · Dia (timeline)" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenCalendarDay/>} note={
            <MotionNote num="4.2 · Day View" title="Timeline vertical" lines={[
              ['Slots vazios', 'Aparecem como "LIVRE" · sugerem ação'],
              ['Evento atual', 'Glow da categoria + ring + label "AGORA"'],
              ['Sugestões Liriun', 'Aparecem em horários livres ("Yoga às 19h?")'],
              ['83% livre', 'Pill no topo · vê o "espaço" do dia'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="insights" label="4.3 · Insights · sua jornada" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenInsights/>} note={
            <MotionNote num="4.3 · Insights" title="Narrativa, não números" lines={[
              ['Year heat', '52 semanas · GitHub-style · sua jornada inteira'],
              ['Cards narrativos', '"Você é mais produtivo às terças" · não só "média 4.2"'],
              ['Streak grande', '12 dias · gradient laranja+roxo · recorde de 18'],
              ['Aprendizado', '"Liriun aprendeu" · personaliza sobre você'],
            ]}/>
          }/>
        </DCArtboard>
      </DCSection>

      {/* ─── EXTRAS ─────────────────────────────────────────── */}
      <DCSection id="extras" title="05 · Captura, notificações, viral loops" subtitle="Os detalhes que transformam um app bom em um app que vira hábito.">
        <DCArtboard id="capture" label="5.1 · Quick capture" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenQuickCapture/>} note={
            <MotionNote num="5.1 · Quick Capture" title="Acessível de qualquer tela" lines={[
              ['Trigger', 'Long-press do mic em qualquer tela · ou hot corner'],
              ['Modos', 'Voz · Texto · Foto (escanear papel/whiteboard)'],
              ['Visual', 'Sheet floating com blur · não substitui tela'],
              ['Quick chips', 'Hoje · Amanhã · Semana · Sem prazo · captura instantânea'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="notif" label="5.2 · Notificação inteligente" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenNotification/>} note={
            <MotionNote num="5.2 · Smart Notification" title="Contexto > Lembrete" lines={[
              ['Não: "Tarefa X em 15min"', 'Sim: "Marina te espera em 15min. Avisar que está a caminho?"'],
              ['Quick actions', 'Avisar · Adiar 10min · "···" pra mais opções'],
              ['Notifs anteriores', '"3 tarefas concluídas hoje. Você está adiantado."'],
              ['Widget lock', 'Mostra o dia completo · sem desbloquear'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="share" label="5.3 · Achievement shareable" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenShareCard/>} note={
            <MotionNote num="5.3 · Share Card" title="Viral loop" lines={[
              ['Card 9:16', 'Pronto pra IG story · WhatsApp status'],
              ['Big number', '12 · gradient · não-discreto'],
              ['Mini stats', '184 tarefas · 73% foco · "TER" (mais produtivo às terças)'],
              ['liriun.com', 'Watermark no rodapé · gera crescimento orgânico'],
              ['Targets', 'IG Story como default · 1-tap share'],
            ]}/>
          }/>
        </DCArtboard>
      </DCSection>

      {/* ─── SITE IMPROVEMENTS ──────────────────────────────── */}
      <DCSection id="site" title="06 · Site · próximos passos" subtitle="Como o site melhora a partir do app definido.">
        <DCArtboard id="site-rec" label="9 recomendações pro site" width={1240} height={760}>
          <SiteImprovements/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
