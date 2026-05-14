// liriun-motion-app.jsx — main canvas mounting all phone screens + the primitives library

const FRAME = { w: 280, h: 600 };

function Phone({ children }) { return <PhoneFrame w={FRAME.w} h={FRAME.h}>{children}</PhoneFrame>; }

// Row: phone + side note
function Row({ phone, note }) {
  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
      <Phone>{phone}</Phone>
      {note}
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      {/* ─── COLD START ──────────────────────────────────────── */}
      <DCSection id="cold-start" title="01 · Início frio" subtitle="Splash, onboarding em 3 telas, pedido de permissão. Tudo animado pra criar primeiro contato premium.">
        <DCArtboard id="splash" label="1.1 · Splash" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenSplash/>} note={
            <MotionNote num="1.1 · Splash" title="Loading premium" lines={[
              ['Duração', '900 ms · troca pra home quando termina'],
              ['Animação', 'Orb pulse · mark waveform · dots loader sequencial'],
              ['Easing', 'cubic-bezier(.4,0,.2,1) · respeita reduced-motion'],
              ['Fallback', 'Sem orb e sem dots se prefersReducedMotion'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="onb1" label="1.2 · Onboarding · voz" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenOnboard1/>} note={
            <MotionNote num="1.2 · Onboarding 1/3" title="Diga, está feito" lines={[
              ['Visual', 'Mic FAB grande · 3 rings ondulam 2.2 s defasados'],
              ['Copy', 'Headline em 2 linhas · curta e direta'],
              ['Swipe', 'Drag horizontal pra trocar de slide'],
              ['Skip', 'Cantos superiores · texto-only · faint'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="onb2" label="1.3 · Onboarding · IA" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenOnboard2/>} note={
            <MotionNote num="1.3 · Onboarding 2/3" title="Liriun te entende" lines={[
              ['Animação', 'Bolha entra · card materializa em shimmer'],
              ['Stagger', 'Linhas de extração aparecem em 0.6/0.75/0.9s'],
              ['Storytelling', 'Mostra exatamente o valor central do produto'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="onb3" label="1.4 · Onboarding · multi" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenOnboard3/>} note={
            <MotionNote num="1.4 · Onboarding 3/3" title="Em qualquer lugar" lines={[
              ['Visual', 'Mark central + 4 devices em órbita'],
              ['Animação', 'Órbita pontilhada gira 24 s · devices flutuam 4 s'],
              ['CTA', 'Mudar de "Continuar" pra "Começar" no último'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="perm" label="1.5 · Permissão · mic" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenPermission/>} note={
            <MotionNote num="1.5 · Permissão" title="Pedido transparente" lines={[
              ['Por quê', 'Sempre pedir DEPOIS de mostrar o valor (UX iOS HIG)'],
              ['Conteúdo', 'Ícone + título + 2 garantias de privacidade'],
              ['Fluxo', 'Permitir → vai pra home · Agora não → modo só-texto'],
              ['Acessibilidade', 'VoiceOver lê título + as 2 garantias'],
            ]}/>
          }/>
        </DCArtboard>
      </DCSection>

      {/* ─── VOICE LOOP ──────────────────────────────────────── */}
      <DCSection id="voice" title="02 · Loop de voz" subtitle="O ciclo principal: idle → ouvindo → processando → salvo. Cada estado tem identidade visual única.">
        <DCArtboard id="idle" label="2.1 · Home idle" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenIdle/>} note={
            <MotionNote num="2.1 · Idle" title="Pronto, calmo" lines={[
              ['Mic', 'Glow ring pulsa 2.4 s · sem barras animadas'],
              ['Sugestões', 'Liriun propõe ações com base no contexto'],
              ['Tab bar', 'Ícones lineares 1.5 px · seleção em surface 6%'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="listen" label="2.2 · Ouvindo" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenListening/>} note={
            <MotionNote num="2.2 · Listening" title="Modo de captura" lines={[
              ['Imersivo', 'Bg fica mais escuro · só o mic importa'],
              ['Rings', '3 rings ondulam 2 s defasados 0.5 s'],
              ['Waveform', '32 barras animadas em real time'],
              ['Cancel', 'Pill embaixo · tap fora também cancela'],
              ['Haptic', 'Light impact ao começar · soft impact ao parar'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="processing" label="2.3 · Processando" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenProcessing/>} note={
            <MotionNote num="2.3 · Processing" title="Entendendo..." lines={[
              ['Shimmer', 'Sparkle + card placeholder com brilho passando'],
              ['Reveal', 'Pessoa → Quando → Prioridade · stagger 0.25 s'],
              ['Latência', 'Mostrar mesmo se < 800 ms (cria sensação de cuidado)'],
              ['Anti-jank', 'Bloquear scroll do conteúdo durante stagger'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="saved" label="2.4 · Salvo" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenSavedMoment/>} note={
            <MotionNote num="2.4 · Saved moment" title="Momento de prazer" lines={[
              ['Check', 'Stroke desenha em 0.55 s ease-out'],
              ['Confetti', '9 partículas espalham · curva expo'],
              ['Haptic', '.notificationSuccess no momento do check'],
              ['CTAs', '"Ver tarefa" · "Mais uma" (atalho pro mic)'],
            ]}/>
          }/>
        </DCArtboard>
      </DCSection>

      {/* ─── LOADING & EMPTY ─────────────────────────────────── */}
      <DCSection id="states" title="03 · Loading & estados vazios" subtitle="O usuário nunca olha pra uma tela parada. Skeletons, illustrations e empty states com personalidade.">
        <DCArtboard id="skel" label="3.1 · Skeleton list" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenSkeleton/>} note={
            <MotionNote num="3.1 · Skeleton" title="Carregando lista" lines={[
              ['Shimmer', 'gradient 0% → 200% · 1.8 s linear'],
              ['Estrutura', 'Espelha exatamente o layout final'],
              ['Fade out', 'Quando dados chegam, fade 220 ms + lista entra'],
              ['Opacity', 'Linhas inferiores em opacidade decrescente'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="empty1" label="3.2 · Empty · hoje" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenEmptyToday/>} note={
            <MotionNote num="3.2 · Empty Today" title="Dia limpo" lines={[
              ['Tom', 'Comemorar · não vazio é positivo'],
              ['Ilustração', 'Orbit verde · dot orbital · check center'],
              ['CTA', 'Mic FAB sempre acessível pra programar adiante'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="empty2" label="3.3 · Empty · inbox" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenEmptyInbox/>} note={
            <MotionNote num="3.3 · Empty Inbox" title="Tudo categorizado" lines={[
              ['Stack', '3 cards empilhados em ângulo · só topo destacado'],
              ['Copy', 'Explica o que é · não só "vazio"'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="search" label="3.4 · Search · vazio" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenSearchIdle/>} note={
            <MotionNote num="3.4 · Search Idle" title="Antes da query" lines={[
              ['Recentes', 'Últimas 4 buscas · clock icon'],
              ['Chips', 'Filtros rápidos por categoria + temporais'],
              ['Foco', 'Field com ring violet 4 px · cursor pisca'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="offline" label="3.5 · Offline" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenOffline/>} note={
            <MotionNote num="3.5 · Offline" title="Tolerante a rede" lines={[
              ['Banner', 'Âmbar suave · não vermelho · não bloqueia uso'],
              ['Estado', 'App fica usável · marca PEND nas tarefas locais'],
              ['Sync', 'Botão retry com spinner · reconecta automático'],
            ]}/>
          }/>
        </DCArtboard>
      </DCSection>

      {/* ─── EXTRAS ──────────────────────────────────────────── */}
      <DCSection id="extras" title="04 · Telas extras" subtitle="Calendário, busca com resultados, conquistas e ajustes. Cada uma usando o mesmo vocabulário visual.">
        <DCArtboard id="achv" label="4.1 · Conquista · streak" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenAchievement/>} note={
            <MotionNote num="4.1 · Achievement" title="Celebrar progresso" lines={[
              ['Badge', 'Rosette gira lento + chama central'],
              ['Confetti', 'Burst de 6 partículas no momento de spawn'],
              ['Stats', '3 números do período · grid grande'],
              ['CTA', 'Compartilhar (gera card pra IG story)'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="cal" label="4.2 · Calendário · semana" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenCalendar/>} note={
            <MotionNote num="4.2 · Calendar" title="Semana em foco" lines={[
              ['Strip', 'Hoje em gradient · outros dias surface'],
              ['Pontos', 'Dot indicators (max 3) abaixo da data'],
              ['Timeline', 'Linha vertical · evento atual com glow verde'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="search-res" label="4.3 · Search · resultados" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenSearchResults/>} note={
            <MotionNote num="4.3 · Search Results" title="Resultados agrupados" lines={[
              ['Highlight', '<mark> em violet 30% · radius 3px'],
              ['Grupos', 'Tarefas · Notas · Pessoas (sem essa última)'],
              ['Counter', 'Pill no input mostrando total'],
            ]}/>
          }/>
        </DCArtboard>
        <DCArtboard id="settings" label="4.4 · Ajustes · perfil" width={FRAME.w + 280} height={FRAME.h}>
          <Row phone={<ScreenSettings/>} note={
            <MotionNote num="4.4 · Settings" title="Controle do agente" lines={[
              ['Profile', 'Card com bg gradient soft · destaca o user'],
              ['Listas', 'Linhas com ícone tinted em surface 168/10%'],
              ['Switches', 'Transition 200 ms · sombra glow quando ON'],
            ]}/>
          }/>
        </DCArtboard>
      </DCSection>

      {/* ─── MOTION PRIMITIVES ─────────────────────────────── */}
      <DCSection id="primitives" title="05 · Biblioteca de animação" subtitle="Cada motion-primitivo isolado. Use o Inspector e copie pro código.">
        <DCArtboard id="lib" label="Motion · todos os primitivos" width={1280} height={1500}>
          <MotionPrimitives/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
