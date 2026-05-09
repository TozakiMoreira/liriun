// styleguide-web.jsx — Section 5: three desktop web frames (1440px wide)

function BrowserChrome({ children, url = 'liriun.app', height = 760 }) {
  return (
    <div style={{
      width: 1280, borderRadius: 18, overflow: 'hidden',
      background: '#0E1014',
      border: `1px solid ${SG.borderHi}`,
      boxShadow: '0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.5)',
    }}>
      {/* chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', height: 42,
        background: '#0A0B10', borderBottom: `1px solid ${SG.border}`,
      }}>
        <div style={{ display: 'flex', gap: 7 }}>
          <span style={{ width: 12, height: 12, borderRadius: 99, background: '#3a3a40' }}/>
          <span style={{ width: 12, height: 12, borderRadius: 99, background: '#3a3a40' }}/>
          <span style={{ width: 12, height: 12, borderRadius: 99, background: '#3a3a40' }}/>
        </div>
        <div style={{
          flex: 1, height: 26, borderRadius: 6,
          background: 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: SG.mono, fontSize: 11, color: SG.textFaint, letterSpacing: 0.2,
        }}>{url}</div>
      </div>
      <div style={{ width: '100%', height, overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Hero page ───────────────────────────────────────────────
function WebHero() {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'absolute', inset: 0,
      background: 'radial-gradient(80% 60% at 80% 0%, rgba(156,123,255,0.16) 0%, transparent 60%), radial-gradient(70% 60% at 10% 80%, rgba(91,141,239,0.12) 0%, transparent 60%), #0E1014',
      color: SG.text, fontFamily: SG.font,
    }}>
      {/* nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 56px',
      }}>
        <LiriunLogotype size={20}/>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {['Produto', 'Como funciona', 'Preços', 'Sobre'].map((l, i) => (
            <span key={i} style={{ fontSize: 14, color: SG.textMuted, fontWeight: 500, letterSpacing: -0.1 }}>{l}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: SG.textMuted, fontWeight: 500 }}>Entrar</span>
          <Button>Baixar app</Button>
        </div>
      </div>

      {/* hero content */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40,
        padding: '40px 56px 0', alignItems: 'center',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 99,
            background: 'rgba(156,123,255,0.10)',
            border: '1px solid rgba(156,123,255,0.25)',
            fontSize: 12, fontWeight: 500, color: '#C8B6FF',
            fontFamily: SG.mono, letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
            {SgIcons.sparkle(12, '#C8B6FF')}
            Beta aberto · maio 2026
          </div>
          <div style={{
            fontSize: 68, fontWeight: 600, letterSpacing: -2, lineHeight: 1.02,
            marginTop: 22, color: SG.text,
          }}>
            Sua lista de tarefas,<br/>
            <span style={{
              backgroundImage: SG.accentGrad,
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
              WebkitTextFillColor: 'transparent', color: 'transparent',
            }}>conduzida por voz.</span>
          </div>
          <div style={{
            fontSize: 19, color: SG.textMuted, marginTop: 22,
            lineHeight: 1.5, letterSpacing: -0.1, maxWidth: 480,
          }}>
            Liriun escuta, organiza e lembra. Um companheiro pessoal de
            produtividade — sem comandos, sem fricção, em qualquer dispositivo.
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <Button icon={SgIcons.arrow(16, '#fff')}>Começar grátis</Button>
            <Button variant="secondary" icon={SgIcons.play(13, SG.text)}>Ver demo · 1min</Button>
          </div>
          <div style={{
            display: 'flex', gap: 24, marginTop: 32,
            fontSize: 12, color: SG.textFaint, fontFamily: SG.mono, letterSpacing: 0.4,
          }}>
            <span>★★★★★ &nbsp;4.9 · App Store</span>
            <span>+ de 12.000 usuários</span>
          </div>
        </div>

        {/* hero visual — phone mockup floating against gradient orb */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', height: 540 }}>
          <div style={{
            position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)',
            width: 460, height: 460, borderRadius: 99,
            background: 'radial-gradient(circle, rgba(156,123,255,0.4) 0%, rgba(91,141,239,0.15) 40%, transparent 70%)',
            filter: 'blur(20px)',
          }}/>
          <div style={{
            position: 'absolute', top: 0, transform: 'rotate(-4deg) translateX(-15px)',
            width: 240, height: 504, borderRadius: 36,
            background: '#000',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 0 0 5px #1a1a1c',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 5, borderRadius: 32, overflow: 'hidden', background: '#0E1014' }}>
              <div style={{ transform: 'scale(0.59)', transformOrigin: 'top left', width: 402, height: 874, position: 'relative' }}>
                <ScreenChat/>
              </div>
            </div>
          </div>
          <div style={{
            position: 'absolute', top: 60, right: 30, transform: 'rotate(5deg)',
            width: 240, height: 504, borderRadius: 36,
            background: '#000',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 0 0 5px #1a1a1c',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 5, borderRadius: 32, overflow: 'hidden', background: '#0E1014' }}>
              <div style={{ transform: 'scale(0.59)', transformOrigin: 'top left', width: 402, height: 874, position: 'relative' }}>
                <ScreenList/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Features page ───────────────────────────────────────────
function FeatureCard({ icon, title, desc, accent = false }) {
  return (
    <div style={{
      background: accent ? 'linear-gradient(180deg, rgba(156,123,255,0.10), rgba(91,141,239,0.04))' : 'rgba(255,255,255,0.035)',
      border: `1px solid ${accent ? 'rgba(156,123,255,0.28)' : SG.borderHi}`,
      borderRadius: 22, padding: 28,
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: accent ? SG.accentGrad : 'rgba(255,255,255,0.06)',
        border: `1px solid ${SG.borderHi}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: accent ? '0 8px 20px rgba(91,141,239,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none',
        marginBottom: 24,
      }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: SG.text, letterSpacing: -0.4, lineHeight: 1.2 }}>{title}</div>
      <div style={{ fontSize: 14, color: SG.textMuted, marginTop: 10, lineHeight: 1.55, letterSpacing: -0.1 }}>{desc}</div>
    </div>
  );
}

function WebFeatures() {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'absolute', inset: 0,
      background: '#0E1014', color: SG.text, fontFamily: SG.font,
      padding: '64px 56px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <div style={{
            fontFamily: SG.mono, fontSize: 11, fontWeight: 500, letterSpacing: 1.4,
            color: '#C8B6FF', textTransform: 'uppercase', marginBottom: 14,
          }}>Recursos</div>
          <div style={{ fontSize: 52, fontWeight: 600, letterSpacing: -1.4, lineHeight: 1.05 }}>
            Pensado pra<br/>fluir com você.
          </div>
        </div>
        <div style={{ fontSize: 16, color: SG.textMuted, maxWidth: 380, lineHeight: 1.5 }}>
          Liriun não é só um app de tarefas — é um agente que aprende seu
          ritmo, seu vocabulário e os contextos que importam pra você.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
        <FeatureCard accent
          icon={SgIcons.mic(22, '#fff')}
          title="Organização por voz"
          desc="Fale como você pensa. Liriun extrai título, prazo, prioridade e categoria automaticamente — sem você abrir um teclado."/>
        <FeatureCard
          icon={SgIcons.sparkle(20, '#C8B6FF')}
          title="Agente personalizado"
          desc="O assistente aprende seus hábitos: como você nomeia projetos, em quais horários você atua, e antecipa lembretes no momento certo."/>
        <FeatureCard
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={SG.text} strokeWidth="1.5" strokeLinecap="round">
              <rect x="3.5" y="3" width="11" height="18" rx="2.5"/>
              <rect x="16" y="6" width="5" height="15" rx="1.5"/>
              <path d="M9 7h.01"/>
            </svg>
          }
          title="Multi-plataforma"
          desc="iOS, Android, web. Tudo sincronizado em tempo real, com a mesma experiência cuidada — independente do dispositivo que você abrir."/>
      </div>

      <div style={{
        marginTop: 32, padding: '28px 32px',
        background: 'rgba(255,255,255,0.035)',
        border: `1px solid ${SG.borderHi}`,
        borderRadius: 22,
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 28,
      }}>
        {[
          ['12k+', 'usuários ativos'],
          ['98%', 'precisão de transcrição'],
          ['< 800ms', 'latência média'],
          ['LGPD', 'dados criptografados'],
        ].map(([n, t], i) => (
          <div key={i} style={{ borderLeft: i ? `1px solid ${SG.border}` : 'none', paddingLeft: i ? 20 : 0 }}>
            <div style={{
              fontSize: 36, fontWeight: 600, letterSpacing: -1,
              backgroundImage: SG.accentGrad,
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>{n}</div>
            <div style={{ fontSize: 13, color: SG.textMuted, marginTop: 6, fontFamily: SG.mono, letterSpacing: 0.2, textTransform: 'uppercase' }}>{t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Footer page ─────────────────────────────────────────────
function WebFooter() {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'absolute', inset: 0,
      background: '#0A0B10', color: SG.text, fontFamily: SG.font,
      padding: '64px 56px', display: 'flex', flexDirection: 'column',
    }}>
      {/* CTA strip */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(156,123,255,0.10), rgba(91,141,239,0.04))',
        border: '1px solid rgba(156,123,255,0.28)',
        borderRadius: 28, padding: '40px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 56,
      }}>
        <div>
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -0.8, lineHeight: 1.1 }}>
            Comece a falar com o seu dia.
          </div>
          <div style={{ fontSize: 15, color: SG.textMuted, marginTop: 10, maxWidth: 460, lineHeight: 1.5 }}>
            Sem cartão de crédito. Disponível em iOS, Android e na web.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button icon={SgIcons.arrow(16, '#fff')}>Baixar app</Button>
          <Button variant="secondary">Ver no navegador</Button>
        </div>
      </div>

      {/* Footer columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 32, marginBottom: 48 }}>
        <div>
          <LiriunLogotype size={20}/>
          <div style={{ fontSize: 13, color: SG.textMuted, marginTop: 18, lineHeight: 1.6, maxWidth: 280 }}>
            Companheiro digital de produtividade. Feito com cuidado em São Paulo.
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            {['X', 'IG', 'IN'].map(l => (
              <div key={l} style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${SG.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: SG.mono, fontSize: 12, color: SG.textMuted, fontWeight: 500,
              }}>{l}</div>
            ))}
          </div>
        </div>
        {[
          ['Produto', ['Recursos', 'Mobile', 'Web', 'Roadmap']],
          ['Empresa', ['Sobre', 'Blog', 'Carreiras', 'Imprensa']],
          ['Suporte', ['Ajuda', 'Status', 'Contato', 'Comunidade']],
          ['Legal', ['Termos', 'Privacidade', 'Cookies', 'LGPD']],
        ].map(([title, items], i) => (
          <div key={i}>
            <div style={{
              fontFamily: SG.mono, fontSize: 11, fontWeight: 600, letterSpacing: 1.2,
              color: SG.textFaint, textTransform: 'uppercase', marginBottom: 18,
            }}>{title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(it => (
                <span key={it} style={{ fontSize: 14, color: SG.textMuted, fontWeight: 500 }}>{it}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        borderTop: `1px solid ${SG.border}`, paddingTop: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: SG.mono, fontSize: 11, color: SG.textFaint, letterSpacing: 0.4,
      }}>
        <span>© 2026 LIRIUN TECNOLOGIA LTDA · TODOS OS DIREITOS RESERVADOS</span>
        <span>liriun.app · v 1.0</span>
      </div>
    </div>
  );
}

function Section5Web() {
  return (
    <section style={{ marginBottom: 120 }}>
      <SectionHeader index="05" title="Site web · 1280px" subtitle="Stack: Next.js 15 (App Router) + Tailwind CSS + Framer Motion + shadcn/ui. Mesma identidade visual, layout responsivo desktop. Três frames-chave: hero, recursos, footer institucional."/>

      {/* Stack implementation card — wires our tokens to the Next.js + Tailwind + shadcn/ui pipeline */}
      <div style={{
        marginBottom: 48, padding: 28, borderRadius: 22,
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${SG.borderHi}`,
      }}>
        <div style={{ fontFamily: SG.mono, fontSize: 11, color: SG.textFaint, letterSpacing: 1.4, marginBottom: 14, textTransform: 'uppercase' }}>Mapeamento da stack</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {[
            ['Next.js 15', 'App Router · RSC por padrão · client components apenas onde houver state ou Framer Motion'],
            ['Tailwind config', 'Tokens da §2 viram CSS vars em globals.css; Tailwind os consome via theme.extend.colors / fontSize / borderRadius / boxShadow'],
            ['shadcn/ui', 'Button, Input, Sheet, Dialog, Switch, Toast, Avatar, Badge → re-skinnados com nossos tokens; mantenha o nome do componente, troque só os Variants'],
            ['Framer Motion', 'Microinterações da §6 (mic halo, sheet rise, hover lift) implementadas com motion.div + useReducedMotion; durations 220/360/520ms'],
          ].map(([h, body]) => (
            <div key={h}>
              <div style={{ fontSize: 14, fontWeight: 600, color: SG.text, letterSpacing: -0.2, marginBottom: 6 }}>{h}</div>
              <div style={{ fontSize: 12, color: SG.textMuted, lineHeight: 1.5 }}>{body}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: SG.mono, fontSize: 11, color: SG.textFaint, letterSpacing: 1.4, marginBottom: 12, textTransform: 'uppercase' }}>5.1 · Landing hero</div>
          <BrowserChrome url="liriun.app"><WebHero/></BrowserChrome>
        </div>
        <div>
          <div style={{ fontFamily: SG.mono, fontSize: 11, color: SG.textFaint, letterSpacing: 1.4, marginBottom: 12, textTransform: 'uppercase' }}>5.2 · Recursos</div>
          <BrowserChrome url="liriun.app/recursos" height={680}><WebFeatures/></BrowserChrome>
        </div>
        <div>
          <div style={{ fontFamily: SG.mono, fontSize: 11, color: SG.textFaint, letterSpacing: 1.4, marginBottom: 12, textTransform: 'uppercase' }}>5.3 · Footer institucional</div>
          <BrowserChrome url="liriun.app#footer" height={620}><WebFooter/></BrowserChrome>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Section5Web });
