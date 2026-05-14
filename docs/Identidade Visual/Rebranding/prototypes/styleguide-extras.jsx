// styleguide-extras.jsx — Sections 1, 4, 6, 7

// ═════════════════════════════════════════════════════════════
// SECTION 1 · Identity
// ═════════════════════════════════════════════════════════════
function Section1Identity() {
  return (
    <section style={{ marginBottom: 120 }}>
      <SectionHeader index="01" title="Identidade" subtitle="Liriun é um companheiro digital de produtividade. A marca fala baixo, organiza com calma, e nunca grita. Um eco do nome: lírico + União."/>

      <TwoCol cols="1.3fr 1fr" gap={24}>
        <SGCard pad={48} style={{
          background: `radial-gradient(120% 100% at 30% 20%, rgba(156,123,255,0.18), transparent 60%), ${SG.panel}`,
          minHeight: 360,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LiriunLogotype size={72}/>
        </SGCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SGCard pad={28}>
            <SubHeader>Tagline · curta</SubHeader>
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.7, lineHeight: 1.15, color: SG.text }}>
              Sua lista de tarefas,<br/>
              <span style={{
                backgroundImage: SG.accentGrad,
                WebkitBackgroundClip: 'text', backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>conduzida por voz.</span>
            </div>
          </SGCard>

          <SGCard pad={28}>
            <SubHeader>Tom de voz visual</SubHeader>
            <div style={{ fontSize: 18, fontWeight: 500, color: SG.text, letterSpacing: -0.2, lineHeight: 1.4 }}>
              Sereno, espaçoso, atento — como um caderno noturno
              que escuta antes de responder.
            </div>
          </SGCard>
        </div>
      </TwoCol>

      {/* Variações do logo */}
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <SGCard pad={28} style={{ display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'space-between', minHeight: 200 }}>
          <StateTag>full · padrão</StateTag>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LiriunLogotype size={32}/>
          </div>
        </SGCard>
        <SGCard pad={28} style={{ display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'space-between', minHeight: 200 }}>
          <StateTag>símbolo</StateTag>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LiriunMark size={64}/>
          </div>
        </SGCard>
        <SGCard pad={28} hi style={{ display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'space-between', minHeight: 200, background: '#F4F4F0' }}>
          <span style={{ fontFamily: SG.mono, fontSize: 10, fontWeight: 500, letterSpacing: 1.2, color: 'rgba(0,0,0,0.45)', textTransform: 'uppercase' }}>mono · light</span>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LiriunLogotype size={32} mono color="#0E1014"/>
          </div>
        </SGCard>
        <SGCard pad={28} style={{ display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'space-between', minHeight: 200 }}>
          <StateTag>mono · dark</StateTag>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LiriunLogotype size={32} mono color="#fff"/>
          </div>
        </SGCard>
      </div>

      {/* Clear space */}
      <SGCard pad={28} style={{ marginTop: 16 }}>
        <SubHeader>Área de respiro mínima</SubHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <div style={{
            position: 'relative', padding: 24,
            border: `1px dashed ${SG.borderHi}`, borderRadius: 12,
          }}>
            <LiriunLogotype size={32}/>
          </div>
          <div style={{ fontSize: 13, color: SG.textMuted, lineHeight: 1.6, maxWidth: 420 }}>
            Reserve sempre <span style={{ color: SG.text, fontFamily: SG.mono }}>1× a altura do mark</span> de
            espaço livre em todos os lados. Nunca colocar texto ou outros logos
            dentro dessa zona — incluindo backgrounds com alto contraste competindo.
          </div>
        </div>
      </SGCard>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION 4 · App mobile (3 iPhone frames)
// ═════════════════════════════════════════════════════════════
function MobilePhoneFrame({ children }) {
  return (
    <div style={{
      width: 402, height: 874, borderRadius: 56,
      position: 'relative', overflow: 'hidden',
      background: '#000',
      boxShadow: '0 50px 100px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.5), inset 0 0 0 8px #1a1a1c',
    }}>
      <div style={{ position: 'absolute', inset: 8, borderRadius: 48, overflow: 'hidden', background: '#0E1014' }}>
        {children}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}><IOSStatusBar dark/></div>
        <div style={{
          position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
          width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 110,
        }}/>
        <div style={{
          position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
          width: 139, height: 5, borderRadius: 99,
          background: 'rgba(255,255,255,0.7)', zIndex: 110,
        }}/>
      </div>
    </div>
  );
}

function Section4Mobile() {
  return (
    <section style={{ marginBottom: 120 }}>
      <SectionHeader index="04" title="App mobile · iPhone 15 Pro" subtitle="Os três fluxos centrais do app: conversa por voz com o agente, lista organizada por dia, detalhe da tarefa em sheet."/>

      <div style={{ display: 'flex', gap: 36, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          ['4.1 · Conversa com Liriun', <ScreenChat key="c"/>, 'Saudação, sugestão sutil, mensagem por voz com waveform, card de revisão glass com Salvar / Editar e mic flutuante.'],
          ['4.2 · Tarefas', <ScreenList key="l"/>, 'Filtros em chips, agrupamento Hoje / Amanhã / Próximos, atrasos em âmbar discreto, tab bar liquid glass com mic shortcut.'],
          ['4.3 · Detalhe da tarefa', <ScreenDetail key="d"/>, 'Sheet vindo de baixo sobre a lista borrada, campos editáveis em card único, ações no rodapé.'],
        ].map(([title, screen, desc], i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <MobilePhoneFrame>{screen}</MobilePhoneFrame>
            <div style={{ width: 402 }}>
              <div style={{
                fontFamily: SG.mono, fontSize: 11, color: SG.textFaint,
                letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8,
              }}>{title}</div>
              <div style={{ fontSize: 14, color: SG.textMuted, lineHeight: 1.5, letterSpacing: -0.1 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION 6 · Microinterações
// ═════════════════════════════════════════════════════════════
function MicroCard({ title, desc, children }) {
  return (
    <SGCard pad={26} style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: SG.text, letterSpacing: -0.2 }}>{title}</div>
      <div style={{
        height: 180, marginTop: 18, borderRadius: 14,
        background: 'rgba(0,0,0,0.25)',
        border: `1px solid ${SG.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>{children}</div>
      <div style={{ fontSize: 13, color: SG.textMuted, marginTop: 16, lineHeight: 1.5 }}>{desc}</div>
    </SGCard>
  );
}

function Section6Micro() {
  return (
    <section style={{ marginBottom: 120 }}>
      <SectionHeader index="06" title="Microinterações" subtitle="Movimento como linguagem. Toda animação é breve (100–400ms) e usa easing 'cubic-bezier(.2,.7,.3,1)' — nunca linear, nunca bouncy."/>

      <style>{`
        @keyframes sg-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.06); opacity: 0.9; } }
        @keyframes sg-halo { 0% { transform: scale(0.9); opacity: 0; } 50% { opacity: 0.6; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes sg-rise { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes sg-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 22 }}>
        <MicroCard
          title="6.1 · Mic em escuta"
          desc="Halo gradiente expande e dissipa em loop (1.6s, ease-out). Botão pulsa sutilmente (scale 1.06, 1.2s). Waveform animado dentro do botão à medida que captura áudio."
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute', width: 110, height: 110, borderRadius: 99,
              background: 'radial-gradient(circle, rgba(156,123,255,0.4), transparent 70%)',
              animation: 'sg-halo 1.6s ease-out infinite',
            }}/>
            <div style={{
              width: 76, height: 76, borderRadius: 99,
              background: SG.accentGrad,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 18px 40px rgba(91,141,239,0.45), inset 0 1px 0 rgba(255,255,255,0.3)',
              animation: 'sg-pulse 1.2s ease-in-out infinite',
            }}>{SgIcons.mic(28, '#fff')}</div>
          </div>
        </MicroCard>

        <MicroCard
          title="6.2 · Card de tarefa entrando"
          desc="Translate Y +40 → 0 com fade-in (300ms). Stagger de 60ms entre cards numa lista. Ao concluir, checkbox preenche com gradiente (180ms) e título recebe strikethrough."
        >
          <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                animation: `sg-rise 600ms ${i * 100}ms cubic-bezier(.2,.7,.3,1) both, sg-rise 600ms ${i * 100 + 1800}ms cubic-bezier(.2,.7,.3,1) both`,
              }}>
                <TaskCard/>
              </div>
            ))}
          </div>
        </MicroCard>

        <MicroCard
          title="6.3 · Bottom sheet subindo"
          desc="Translate Y 100% → 0 com cubic-bezier(.2,.7,.3,1), 380ms. Background dim fade simultâneo (de 0 a 0.55, mesma curva). Drag-handle aparece com 80ms de delay."
        >
          <div style={{
            position: 'absolute', left: 24, right: 24, bottom: 0, height: 130,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            background: 'rgba(22,24,30,0.92)',
            border: `1px solid ${SG.borderHi}`, borderBottom: 'none',
            backdropFilter: 'blur(40px)', padding: '14px 18px',
            animation: 'sg-rise 1.5s cubic-bezier(.2,.7,.3,1) infinite',
          }}>
            <div style={{ width: 36, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.18)', margin: '0 auto 14px' }}/>
            <div style={{ fontSize: 16, fontWeight: 600, color: SG.text }}>Detalhe da tarefa</div>
            <div style={{ fontSize: 12, color: SG.textMuted, marginTop: 4 }}>Trabalho · amanhã 14:00</div>
          </div>
        </MicroCard>

        <MicroCard
          title="6.4 · Hover web · primary"
          desc="Sombra cresce (rgba 0.32 → 0.45) e gradiente desloca 6° de matiz, 150ms. Em pressed, translateY +1px e gradiente escurece 8%. Foco-visível: ring 4px de accentA a 12% opacidade."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <Button>default</Button>
            <Button state="hover">hover</Button>
            <Button state="pressed">pressed</Button>
          </div>
        </MicroCard>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION 7 · Do's & Don'ts
// ═════════════════════════════════════════════════════════════
function DoCard({ kind, title, desc, children }) {
  const isDo = kind === 'do';
  return (
    <SGCard pad={0} style={{ overflow: 'hidden' }}>
      <div style={{
        height: 180, padding: 20,
        background: isDo
          ? 'radial-gradient(80% 100% at 30% 30%, rgba(123,215,176,0.10), transparent 60%), rgba(255,255,255,0.02)'
          : 'radial-gradient(80% 100% at 30% 30%, rgba(238,122,142,0.10), transparent 60%), rgba(255,255,255,0.02)',
        borderBottom: `1px solid ${SG.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 14, left: 14,
          padding: '4px 10px', borderRadius: 99,
          background: isDo ? 'rgba(123,215,176,0.16)' : 'rgba(238,122,142,0.16)',
          border: `1px solid ${isDo ? 'rgba(123,215,176,0.4)' : 'rgba(238,122,142,0.4)'}`,
          fontFamily: SG.mono, fontSize: 10, fontWeight: 600, letterSpacing: 1.2,
          color: isDo ? '#9CE5C2' : '#FFB1BC', textTransform: 'uppercase',
        }}>{isDo ? '✓ Mantém' : '✗ Quebra'}</div>
        {children}
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: SG.text, letterSpacing: -0.2 }}>{title}</div>
        <div style={{ fontSize: 13, color: SG.textMuted, marginTop: 6, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </SGCard>
  );
}

function Section7DoDont() {
  return (
    <section style={{ marginBottom: 120 }}>
      <SectionHeader index="07" title="Do's & Don'ts" subtitle="A identidade existe nos detalhes. Estas escolhas distinguem Liriun de qualquer outro app de produtividade — siga-as religiosamente."/>

      <SubHeader>Mantém identidade</SubHeader>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 36 }}>
        <DoCard kind="do" title="Gradiente roxo→azul, com parcimônia" desc="Use só em mic ativo, CTA primário e accents pontuais. Nunca em backgrounds amplos ou textos longos.">
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: SG.accentGrad,
            boxShadow: '0 12px 32px rgba(91,141,239,0.38)',
          }}/>
        </DoCard>
        <DoCard kind="do" title="Espaços generosos" desc="Liriun respira. 24–48px de padding em cards, gap 14–20px entre elementos. Densidade é violência visual.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '70%' }}>
            <div style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.1)' }}/>
            <div style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.1)', width: '70%' }}/>
            <div style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.1)', width: '40%' }}/>
          </div>
        </DoCard>
        <DoCard kind="do" title="Glass com 1px luminoso" desc="Cards usam blur 18–28px, surface 4–8% e borda rgba(255,255,255,0.13). Sempre inset 0 1px 0 0.05 no topo.">
          <div style={{
            width: 130, height: 80, borderRadius: 16,
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${SG.borderHi}`,
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.3)',
          }}/>
        </DoCard>
      </div>

      <SubHeader>Quebra identidade</SubHeader>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        <DoCard kind="dont" title="Cores saturadas e gritantes" desc="Vermelho puro, verde-limão, magenta neon. Liriun é noturno e calmo — alertas são âmbar suave (#F0B36E), nunca semáforo.">
          <div style={{ display: 'flex', gap: 8 }}>
            {['#FF0033', '#00FF66', '#FF00C8'].map(c => (
              <div key={c} style={{ width: 36, height: 36, borderRadius: 8, background: c }}/>
            ))}
          </div>
        </DoCard>
        <DoCard kind="dont" title="Bordas duras + sombras pretas" desc="Nada de border 2px solid #fff e box-shadow 0 4px 0 #000. Liriun não tem material design ou skeumorfismo.">
          <div style={{
            width: 130, height: 60, borderRadius: 6,
            background: '#1c1c20',
            border: '2px solid #fff',
            boxShadow: '0 6px 0 #000',
          }}/>
        </DoCard>
        <DoCard kind="dont" title="Densidade tipo planilha" desc="Linhas de 24px com 4px de gap, 9 colunas espremidas, fontes tabulares minúsculas. Liriun não é Notion nem Linear.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, width: '80%' }}>
            {[0,1,2,3,4,5,6].map(i => (
              <div key={i} style={{ height: 8, background: 'rgba(255,255,255,0.06)' }}/>
            ))}
          </div>
        </DoCard>
      </div>
    </section>
  );
}

Object.assign(window, { Section1Identity, Section4Mobile, Section6Micro, Section7DoDont });
