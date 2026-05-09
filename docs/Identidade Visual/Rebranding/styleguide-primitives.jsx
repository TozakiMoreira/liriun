// styleguide-primitives.jsx — shared section chrome + small primitives

const SG = {
  // Page-level (slightly darker than app bg so embedded mobile screens pop)
  pageBg: '#07080B',
  pageBg2: '#0B0D12',
  panel: '#0E1117',
  panelHi: '#11151D',
  border: 'rgba(255,255,255,0.07)',
  borderHi: 'rgba(255,255,255,0.13)',
  text: 'rgba(244,246,252,0.96)',
  textMuted: 'rgba(244,246,252,0.62)',
  textFaint: 'rgba(244,246,252,0.38)',
  textDim: 'rgba(244,246,252,0.22)',
  accentA: '#9C7BFF',
  accentB: '#5B8DEF',
  accentGrad: 'linear-gradient(135deg, #9C7BFF 0%, #5B8DEF 100%)',
  font: '"Geist", system-ui, -apple-system, sans-serif',
  mono: '"Geist Mono", ui-monospace, monospace',
};

function SectionHeader({ index, title, subtitle }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      borderBottom: `1px solid ${SG.borderHi}`,
      paddingBottom: 22, marginBottom: 40,
    }}>
      <div>
        <div style={{
          fontFamily: SG.mono, fontSize: 12, fontWeight: 500, letterSpacing: 1.6,
          color: SG.textFaint, textTransform: 'uppercase', marginBottom: 14,
        }}>
          Seção {index} / 07
        </div>
        <div style={{
          fontFamily: SG.font, fontSize: 56, fontWeight: 600, letterSpacing: -1.6,
          color: SG.text, lineHeight: 1.0,
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{
            marginTop: 14, fontSize: 17, color: SG.textMuted,
            maxWidth: 720, letterSpacing: -0.1, lineHeight: 1.45,
          }}>{subtitle}</div>
        )}
      </div>
      <div style={{
        fontFamily: SG.mono, fontSize: 11, color: SG.textDim, letterSpacing: 0.4,
        textAlign: 'right', textTransform: 'uppercase',
      }}>
        liriun.app/brand<br/>
        v 1.0 · 05.2026
      </div>
    </div>
  );
}

function SubHeader({ children, mono = true, top = 0 }) {
  return (
    <div style={{
      marginTop: top, marginBottom: 18,
      fontFamily: mono ? SG.mono : SG.font,
      fontSize: 11, fontWeight: 600, letterSpacing: 1.4,
      color: SG.textFaint, textTransform: 'uppercase',
    }}>{children}</div>
  );
}

function SGCard({ children, style = {}, pad = 22, hi = false }) {
  return (
    <div style={{
      background: hi ? SG.panelHi : SG.panel,
      border: `1px solid ${SG.border}`,
      borderRadius: 18, padding: pad,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
      ...style,
    }}>{children}</div>
  );
}

// Tiny labeled tag used everywhere (e.g. "default", "hover")
function StateTag({ children, accent = false }) {
  return (
    <div style={{
      fontFamily: SG.mono, fontSize: 10, fontWeight: 500, letterSpacing: 1.2,
      color: accent ? '#C8B6FF' : SG.textFaint,
      textTransform: 'uppercase', marginBottom: 8,
    }}>{children}</div>
  );
}

// Two-column grid
function TwoCol({ children, gap = 24, cols = '1fr 1fr' }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols, gap }}>
      {children}
    </div>
  );
}

// Logo mark (stylized waveform sound icon enclosed in soft squircle)
function LiriunMark({ size = 64, mono = false, monoColor = '#fff' }) {
  const grad = `linear-gradient(135deg, ${SG.accentA}, ${SG.accentB})`;
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: mono ? 'transparent' : grad,
      border: mono ? `${size*0.04}px solid ${monoColor}` : 'none',
      boxShadow: mono ? 'none' : '0 8px 24px rgba(91,141,239,0.25), inset 0 1px 0 rgba(255,255,255,0.22)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 32 32" fill="none">
        {[
          [4, 13], [9, 9], [14, 4], [19, 9], [24, 13],
        ].map(([x, h], i) => (
          <rect key={i} x={x} y={16 - h/2} width="3" height={h} rx="1.5"
            fill={mono ? monoColor : '#fff'}/>
        ))}
        {/* Top dot accent */}
        <circle cx="16" cy="2.6" r="1.4" fill={mono ? monoColor : 'rgba(255,255,255,0.85)'}/>
      </svg>
    </div>
  );
}

function LiriunLogotype({ size = 36, mono = false, color = SG.text }) {
  // wordmark with mark + text
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.35 }}>
      <LiriunMark size={size * 1.05} mono={mono} monoColor={color}/>
      <span style={{
        fontFamily: SG.font, fontWeight: 600,
        fontSize: size, letterSpacing: -size * 0.04,
        color: mono ? color : SG.text,
      }}>Liriun</span>
    </div>
  );
}

// Generic icon set used in components section
const SgIcons = {
  search: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>
    </svg>
  ),
  mail: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7.5l8.5 6 8.5-6"/>
    </svg>
  ),
  alert: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><circle cx="12" cy="16.5" r="0.6" fill={c}/>
    </svg>
  ),
  check: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5"/>
    </svg>
  ),
  close: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18"/>
    </svg>
  ),
  spinner: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M12 3a9 9 0 1 1-9 9" opacity="0.9"/>
      <path d="M3 12a9 9 0 0 1 6-8.5" opacity="0.3"/>
    </svg>
  ),
  mic: (s = 18, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="12" rx="3"/>
      <path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>
    </svg>
  ),
  arrow: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  ),
  trash: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>
    </svg>
  ),
  play: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <path d="M7 5l13 7-13 7V5z"/>
    </svg>
  ),
  sparkle: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z"/>
    </svg>
  ),
};

Object.assign(window, { SG, SectionHeader, SubHeader, SGCard, StateTag, TwoCol, LiriunMark, LiriunLogotype, SgIcons });
