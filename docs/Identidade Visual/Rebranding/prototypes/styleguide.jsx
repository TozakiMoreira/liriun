// styleguide.jsx — assembles the full vertical poster

function PosterHeader() {
  return (
    <header style={{
      position: 'relative', overflow: 'hidden',
      borderBottom: `1px solid ${SG.borderHi}`,
      padding: '72px 64px 56px',
      background: `radial-gradient(80% 60% at 25% 0%, rgba(156,123,255,0.18) 0%, transparent 60%), radial-gradient(60% 60% at 90% 80%, rgba(91,141,239,0.14) 0%, transparent 60%)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 56 }}>
        <div style={{ flex: 1 }}>
          <LiriunLogotype size={36}/>
          <div style={{
            fontSize: 88, fontWeight: 600, letterSpacing: -3, lineHeight: 0.98,
            color: SG.text, marginTop: 56,
          }}>
            Visual reference
          </div>
          <div style={{
            fontSize: 22, color: SG.textMuted,
            maxWidth: 720, marginTop: 22, lineHeight: 1.4, letterSpacing: -0.2,
          }}>
            Documento único, autossuficiente. Define a identidade compartilhada
            entre o app mobile (Flutter) e o site web (Next.js 15 + Tailwind +
            Framer Motion + shadcn/ui) — paleta, tipografia, componentes, vibe.
            Mesma cara, qualquer plataforma.
          </div>

          <div style={{
            display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap',
            fontFamily: SG.mono, fontSize: 11, fontWeight: 500, letterSpacing: 0.4,
            color: SG.textMuted, textTransform: 'uppercase',
          }}>
            {['7 seções', 'dark mode default', 'flutter · next.js 15', 'tailwind + shadcn/ui', 'framer motion', 'tokens canônicos', 'maio 2026 · v 1.1'].map(t => (
              <span key={t} style={{
                padding: '6px 12px', borderRadius: 99,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${SG.border}`,
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Index */}
        <div style={{
          width: 360, padding: 28, borderRadius: 22,
          background: 'rgba(255,255,255,0.035)',
          border: `1px solid ${SG.borderHi}`,
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{
            fontFamily: SG.mono, fontSize: 11, fontWeight: 600, letterSpacing: 1.4,
            color: SG.textFaint, textTransform: 'uppercase', marginBottom: 18,
          }}>Índice</div>
          {[
            ['01', 'Identidade'],
            ['02', 'Design tokens'],
            ['03', 'Componentes'],
            ['04', 'App mobile'],
            ['05', 'Site web'],
            ['06', 'Microinterações'],
            ['07', "Do's & Don'ts"],
          ].map(([n, label], i, arr) => (
            <div key={n} style={{
              display: 'flex', alignItems: 'baseline', gap: 14,
              padding: '12px 0',
              borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${SG.border}`,
            }}>
              <span style={{ fontFamily: SG.mono, fontSize: 12, fontWeight: 500, color: SG.textFaint, width: 22 }}>{n}</span>
              <span style={{ fontSize: 15, fontWeight: 500, color: SG.text, letterSpacing: -0.2, flex: 1 }}>{label}</span>
              <span style={{
                fontFamily: SG.mono, fontSize: 11, color: SG.textDim, letterSpacing: 0.4,
              }}>—</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

function PosterFooter() {
  return (
    <footer style={{
      borderTop: `1px solid ${SG.borderHi}`,
      padding: '36px 64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: SG.mono, fontSize: 11, color: SG.textFaint, letterSpacing: 0.4,
    }}>
      <LiriunLogotype size={16}/>
      <span>VISUAL REFERENCE · v 1.1 · MAIO 2026 · FLUTTER + NEXT.JS 15</span>
      <span>liriun.app/brand</span>
    </footer>
  );
}

function App() {
  return (
    <div style={{
      width: 1480, margin: '0 auto', background: SG.pageBg,
      color: SG.text, fontFamily: SG.font,
      WebkitFontSmoothing: 'antialiased',
    }}>
      <PosterHeader/>
      <main style={{ padding: '88px 64px 0' }}>
        <Section1Identity/>
        <Section2Tokens/>
        <Section3Components/>
        <Section4Mobile/>
        <Section5Web/>
        <Section6Micro/>
        <Section7DoDont/>
      </main>
      <PosterFooter/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
