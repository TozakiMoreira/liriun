// styleguide-tokens.jsx — Section 2 displays for color/type/spacing/radii/shadows/icons

function Swatch({ name, hex, alpha, big = false, dark = false, gradient = null }) {
  const style = gradient
    ? { background: gradient }
    : { background: hex };
  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${SG.border}`,
      background: SG.panel,
    }}>
      <div style={{
        height: big ? 96 : 64, ...style,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      }}/>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: SG.text, letterSpacing: -0.1 }}>{name}</div>
        <div style={{ fontFamily: SG.mono, fontSize: 11, color: SG.textFaint, marginTop: 2 }}>
          {hex}{alpha ? ` · ${alpha}` : ''}
        </div>
      </div>
    </div>
  );
}

function ColorRow({ title, swatches, cols = 5 }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <SubHeader>{title}</SubHeader>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
        {swatches.map((s, i) => <Swatch key={i} {...s}/>)}
      </div>
    </div>
  );
}

function Section2Tokens() {
  return (
    <section style={{ marginBottom: 120 }}>
      <SectionHeader index="02" title="Design tokens" subtitle="A base atômica. Mesma paleta, escala e shape tokens em iOS, Android, Flutter e web — não há reinterpretação por plataforma."/>

      {/* COLORS */}
      <SubHeader>Backgrounds & surfaces</SubHeader>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 26 }}>
        <Swatch name="bg/0  page" hex="#07080B"/>
        <Swatch name="bg/1  app" hex="#0E1014"/>
        <Swatch name="bg/2  elev" hex="#11141B"/>
        <Swatch name="surface/low" hex="rgba(255,255,255,0.035)" alpha="3.5%"/>
        <Swatch name="surface/mid" hex="rgba(255,255,255,0.05)" alpha="5%"/>
        <Swatch name="surface/hi"  hex="rgba(255,255,255,0.08)" alpha="8%"/>
      </div>

      <ColorRow title="Texto (4 níveis)" cols={4} swatches={[
        { name: 'text/primary',   hex: 'rgba(244,246,252,0.96)', alpha: '96%' },
        { name: 'text/secondary', hex: 'rgba(244,246,252,0.62)', alpha: '62%' },
        { name: 'text/tertiary',  hex: 'rgba(244,246,252,0.38)', alpha: '38%' },
        { name: 'text/disabled',  hex: 'rgba(244,246,252,0.22)', alpha: '22%' },
      ]}/>

      <SubHeader>Accent</SubHeader>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, marginBottom: 26 }}>
        <Swatch big name="accent/gradient (primary)" hex="135°  #9C7BFF → #5B8DEF" gradient={SG.accentGrad}/>
        <Swatch big name="accent/solid (fallback)" hex="#7B86F4"/>
        <Swatch big name="accent/violet" hex="#9C7BFF"/>
        <Swatch big name="accent/blue" hex="#5B8DEF"/>
      </div>

      <ColorRow title="Semânticas" cols={4} swatches={[
        { name: 'success', hex: '#7BD7B0' },
        { name: 'warning', hex: '#F0B36E' },
        { name: 'error',   hex: '#EE7A8E' },
        { name: 'info',    hex: '#7AA9FF' },
      ]}/>

      <ColorRow title="Categorias de tarefa" cols={6} swatches={[
        { name: 'cat/work',     hex: '#7AA9FF' },
        { name: 'cat/health',   hex: '#7BD7B0' },
        { name: 'cat/home',     hex: '#F0B36E' },
        { name: 'cat/personal', hex: '#C8A0FF' },
        { name: 'cat/finance',  hex: '#E58FB0' },
        { name: 'cat/idea',     hex: '#F2D879' },
      ]}/>

      {/* TYPE */}
      <SubHeader top={20}>Tipografia · Geist (Vercel)</SubHeader>
      <SGCard pad={28} style={{ marginBottom: 26 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 220px 110px', gap: 18, alignItems: 'baseline' }}>
          {[
            ['display', 'Olá, Pedro', '56 / 1.0 / -1.6 · 600', 'mobile 30 / desktop 56'],
            ['h1',      'Tarefas pra hoje', '40 / 1.05 / -1.0 · 600', 'mobile 28 / desktop 40'],
            ['h2',      'Reunião com o time', '30 / 1.1 / -0.6 · 600', 'mobile 22 / desktop 30'],
            ['h3',      'Próximos dias', '22 / 1.2 / -0.4 · 600', 'mobile 18 / desktop 22'],
            ['body',    'Você tem 3 tarefas pendentes hoje.', '17 / 1.45 / -0.1 · 400', 'mobile 15 / desktop 17'],
            ['caption', 'Atualizado há 2 minutos', '14 / 1.45 / 0 · 400', 'mobile 13 / desktop 14'],
            ['label',   'CRIADO POR VOZ', '11 / 1.2 / 1.4 · 500 · MONO', 'all platforms'],
          ].map(([tag, sample, spec, plat], i) => (
            <React.Fragment key={i}>
              <div style={{ fontFamily: SG.mono, fontSize: 11, color: SG.textFaint, letterSpacing: 1.2, textTransform: 'uppercase' }}>{tag}</div>
              <div style={{
                fontFamily: tag === 'label' ? SG.mono : SG.font,
                fontSize: tag === 'display' ? 56 : tag === 'h1' ? 40 : tag === 'h2' ? 30 : tag === 'h3' ? 22 : tag === 'body' ? 17 : tag === 'caption' ? 14 : 11,
                fontWeight: ['display','h1','h2','h3'].includes(tag) ? 600 : tag === 'label' ? 500 : 400,
                letterSpacing: tag === 'display' ? -1.6 : tag === 'h1' ? -1.0 : tag === 'h2' ? -0.6 : tag === 'h3' ? -0.4 : tag === 'label' ? 1.4 : -0.1,
                lineHeight: 1.1,
                color: SG.text,
                textTransform: tag === 'label' ? 'uppercase' : 'none',
              }}>{sample}</div>
              <div style={{ fontFamily: SG.mono, fontSize: 11, color: SG.textFaint }}>{spec}</div>
              <div style={{ fontFamily: SG.mono, fontSize: 11, color: SG.textDim }}>{plat}</div>
            </React.Fragment>
          ))}
        </div>
      </SGCard>

      <TwoCol cols="1.2fr 1fr 1fr">
        {/* Spacing */}
        <SGCard>
          <SubHeader>Spacing · base 4</SubHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[4, 8, 12, 16, 24, 32, 48, 64, 96].map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontFamily: SG.mono, fontSize: 11, width: 38, color: SG.textFaint }}>—{i + 1}</div>
                <div style={{ fontFamily: SG.mono, fontSize: 12, width: 50, color: SG.text }}>{v}px</div>
                <div style={{ height: 8, width: v, background: SG.accentGrad, borderRadius: 99 }}/>
              </div>
            ))}
          </div>
        </SGCard>

        {/* Radius */}
        <SGCard>
          <SubHeader>Border radius</SubHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['chip',   12, '7px·12px Y'],
              ['button', 14, '14px'],
              ['card',   20, '20px'],
              ['sheet',  32, '32px top'],
              ['modal',  24, '24px'],
              ['pill',   999, 'full'],
            ].map(([name, r, note]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 56, height: 40, borderRadius: r,
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${SG.borderHi}`,
                }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: SG.text }}>{name}</div>
                  <div style={{ fontFamily: SG.mono, fontSize: 11, color: SG.textFaint }}>{note}</div>
                </div>
              </div>
            ))}
          </div>
        </SGCard>

        {/* Shadows */}
        <SGCard>
          <SubHeader>Elevation · 3 níveis</SubHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { name: 'elev/1 · sutil', s: '0 4px 12px rgba(0,0,0,0.18)' },
              { name: 'elev/2 · padrão', s: '0 12px 32px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.04) inset' },
              { name: 'elev/3 · destaque', s: '0 18px 40px rgba(91,141,239,0.35), inset 0 1px 0 rgba(255,255,255,0.22)' },
            ].map((sh, i) => (
              <div key={i}>
                <div style={{
                  height: 56, borderRadius: 14,
                  background: i === 2 ? SG.accentGrad : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${SG.border}`,
                  boxShadow: sh.s,
                }}/>
                <div style={{ fontSize: 12, color: SG.text, marginTop: 8, fontWeight: 500 }}>{sh.name}</div>
                <div style={{ fontFamily: SG.mono, fontSize: 10, color: SG.textFaint, marginTop: 2 }}>{sh.s}</div>
              </div>
            ))}
          </div>
        </SGCard>
      </TwoCol>

      {/* Iconography */}
      <SGCard pad={24} style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <SubHeader>Iconografia</SubHeader>
            <div style={{ fontSize: 14, color: SG.text, fontWeight: 500, marginBottom: 4 }}>Phosphor (regular) · stroke 1.5–1.6px</div>
            <div style={{ fontSize: 13, color: SG.textMuted, maxWidth: 460, lineHeight: 1.5 }}>
              Lucide é fallback aceito quando Phosphor não está disponível na plataforma. Tamanhos canônicos: 14, 16, 18, 20, 24. Nunca preencher; sempre stroke.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            {[14, 16, 18, 20, 24].map(s => (
              <div key={s} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${SG.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: SG.text,
                }}>{SgIcons.mic(s, SG.text)}</div>
                <div style={{ fontFamily: SG.mono, fontSize: 11, color: SG.textFaint, marginTop: 6 }}>{s}px</div>
              </div>
            ))}
          </div>
        </div>
      </SGCard>
    </section>
  );
}

Object.assign(window, { Section2Tokens, Swatch });
