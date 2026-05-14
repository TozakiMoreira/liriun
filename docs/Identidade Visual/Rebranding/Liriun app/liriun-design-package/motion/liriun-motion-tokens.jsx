// liriun-motion-tokens.jsx — design tokens, phone frame, icons + animation keyframes

const T = {
  bg: '#07080B',
  surface: '#0E1014',
  surfaceHi: '#14161C',
  border: 'rgba(255,255,255,0.07)',
  borderHi: 'rgba(255,255,255,0.13)',
  text: 'rgba(244,246,252,0.96)',
  muted: 'rgba(244,246,252,0.62)',
  faint: 'rgba(244,246,252,0.40)',
  dim: 'rgba(244,246,252,0.22)',
  violet300: '#C8B6FF',
  violet400: '#A88BFF',
  violet500: '#9C7BFF',
  violet600: '#7C7DF6',
  blue: '#5B8DEF',
  grad: 'linear-gradient(135deg, #A88BFF 0%, #7C7DF6 55%, #5B8DEF 100%)',
  gradSoft: 'linear-gradient(135deg, rgba(168,139,255,0.18), rgba(91,141,239,0.10))',
  font: '"Geist", system-ui, -apple-system, sans-serif',
  mono: '"Geist Mono", ui-monospace, monospace',
  // category colors
  catWork:    '#7AA9FF',
  catHealth:  '#7BD7B0',
  catHome:    '#F0B36E',
  catPerson:  '#C8A0FF',
  catFinance: '#E58FB0',
  catIdea:    '#F2D879',
};

// Inject animation keyframes once
if (typeof document !== 'undefined' && !document.getElementById('lm-anims')) {
  const s = document.createElement('style');
  s.id = 'lm-anims';
  s.textContent = `
    @keyframes lm-pulse-ring { 0% { transform: scale(0.85); opacity: 0; } 30% { opacity: 0.6; } 100% { transform: scale(1.8); opacity: 0; } }
    @keyframes lm-pulse-scale { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
    @keyframes lm-wave { 0%,100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
    @keyframes lm-spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
    @keyframes lm-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes lm-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes lm-rise-soft { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes lm-fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes lm-bounce { 0% { transform: translateY(0); } 40% { transform: translateY(-8px); } 60% { transform: translateY(-4px); } 100% { transform: translateY(0); } }
    @keyframes lm-rotate-slow { from { transform: rotate(0); } to { transform: rotate(360deg); } }
    @keyframes lm-orb { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(8px,-12px) scale(1.05); } }
    @keyframes lm-confetti-1 { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 100% { transform: translate(-40px,-90px) rotate(180deg); opacity: 0; } }
    @keyframes lm-confetti-2 { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 100% { transform: translate(20px,-80px) rotate(220deg); opacity: 0; } }
    @keyframes lm-confetti-3 { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 100% { transform: translate(50px,-100px) rotate(-180deg); opacity: 0; } }
    @keyframes lm-confetti-4 { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 100% { transform: translate(-25px,-110px) rotate(-220deg); opacity: 0; } }
    @keyframes lm-confetti-5 { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 100% { transform: translate(0,-95px) rotate(140deg); opacity: 0; } }
    @keyframes lm-confetti-6 { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 100% { transform: translate(35px,-85px) rotate(-160deg); opacity: 0; } }
    @keyframes lm-progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    @keyframes lm-dot { 0%,80%,100% { opacity: 0.2; transform: scale(0.85); } 40% { opacity: 1; transform: scale(1); } }
    @keyframes lm-mark-stroke { from { stroke-dashoffset: 60; } to { stroke-dashoffset: 0; } }
    @keyframes lm-x-stroke { from { stroke-dashoffset: 50; } to { stroke-dashoffset: 0; } }
    @keyframes lm-orb-rotate { from { transform: rotate(0); } to { transform: rotate(-360deg); } }
    @keyframes lm-typing { from { width: 0; } to { width: 100%; } }
    @keyframes lm-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(168,139,255,0.4); } 70% { box-shadow: 0 0 0 12px rgba(168,139,255,0); } }
    @keyframes lm-pull { 0% { transform: translateY(0); } 50% { transform: translateY(28px); } 100% { transform: translateY(0); } }
    @keyframes lm-bar-listen { 0%,100% { transform: scaleY(0.25); } 25% { transform: scaleY(0.85); } 50% { transform: scaleY(0.45); } 75% { transform: scaleY(1); } }
    @keyframes lm-streak { 0% { transform: scale(0.4); opacity: 0; } 70% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes lm-orb-pulse { 0%,100% { opacity: 0.45; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.08); } }
    @keyframes lm-line-grow { from { stroke-dashoffset: 240; } to { stroke-dashoffset: 0; } }
    @keyframes lm-swipe-in { from { transform: translateX(20%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes lm-swipe-out { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-20%); opacity: 0; } }
    @keyframes lm-page-rise { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes lm-task-complete { 0% { background: transparent; } 50% { background: rgba(123,215,176,0.18); } 100% { background: transparent; } }
  `;
  document.head.appendChild(s);
}

// Icon set
const LIcon = {
  mic: (s=18,c='currentColor',sw=1.6) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>
    </svg>
  ),
  check: (s=14,c='currentColor',sw=2) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5"/>
    </svg>
  ),
  x: (s=14,c='currentColor',sw=2) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18"/>
    </svg>
  ),
  arrow: (s=16,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  ),
  chevR: (s=14,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6"/>
    </svg>
  ),
  bell: (s=16,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 17V11a6 6 0 0 1 12 0v6"/><path d="M4.5 17h15M10 20.5a2 2 0 0 0 4 0"/>
    </svg>
  ),
  list: (s=18,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h10"/>
    </svg>
  ),
  cal: (s=16,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>
    </svg>
  ),
  inbox: (s=18,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13l3-8h12l3 8"/><path d="M3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/><path d="M3 13h5l1 2h6l1-2h5"/>
    </svg>
  ),
  search: (s=18,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>
    </svg>
  ),
  user: (s=18,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="4"/><path d="M5 21c1-4 4-6 7-6s6 2 7 6"/>
    </svg>
  ),
  sparkle: (s=14,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z"/>
      <path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8L16.5 18.5l1.8-.7L19 16z"/>
    </svg>
  ),
  flame: (s=14,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 1 1-8 0c0-1.5.6-2.4 1.5-3.2C10.4 7.5 11.6 6 12 3z"/>
    </svg>
  ),
  clock: (s=13,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>
    </svg>
  ),
  refresh: (s=14,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 15.5-6.3M21 12a9 9 0 0 1-15.5 6.3"/>
      <path d="M21 4v5h-5M3 20v-5h5"/>
    </svg>
  ),
  cloudOff: (s=14,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18"/>
      <path d="M19 16.5c1.5-.5 2-2 2-3.5a4 4 0 0 0-4-4c-.4 0-.7 0-1 .1M16 19H8a5 5 0 0 1-1.5-9.8"/>
    </svg>
  ),
  gear: (s=18,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
    </svg>
  ),
  apple: (s=18,c='currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <path d="M17.6 12.7c0-2 1.6-3 1.7-3.1-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.4 0-2.6.8-3.3 2-1.4 2.5-.4 6.1 1 8.1.7 1 1.4 2.1 2.5 2.1 1 0 1.4-.6 2.6-.6s1.5.6 2.6.6c1.1 0 1.7-1 2.4-2 .7-1.1 1-2.2 1-2.3-.1 0-2-.8-2-3.2zM15.5 5.3c.5-.7.9-1.6.8-2.5-.8 0-1.7.6-2.3 1.3-.5.6-1 1.5-.9 2.4.9 0 1.8-.5 2.4-1.2z"/>
    </svg>
  ),
  google: (s=18) => (
    <svg width={s} height={s} viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-11.3 8 12 12 0 0 1 0-24c3 0 5.7 1.1 7.8 3l5.7-5.7A20 20 0 0 0 24 4a20 20 0 0 0 0 40 20 20 0 0 0 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7A20 20 0 0 0 24 4a20 20 0 0 0-17.7 10.7z"/>
      <path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.4-5.2l-6.2-5.2A12 12 0 0 1 24 36a12 12 0 0 1-11.3-8L6.3 33.2A20 20 0 0 0 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  ),
};

// Liriun mark (squircle + waveform)
function LiriunMark({ size = 28, animated = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024">
      <defs>
        <linearGradient id={`lm-g-${size}`} x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#A88BFF"/>
          <stop offset="0.55" stopColor="#7C7DF6"/>
          <stop offset="1" stopColor="#5B8DEF"/>
        </linearGradient>
      </defs>
      <path d="M 512 0 C 870 0, 1024 154, 1024 512 C 1024 870, 870 1024, 512 1024 C 154 1024, 0 870, 0 512 C 0 154, 154 0, 512 0 Z" fill={`url(#lm-g-${size})`}/>
      <g fill="#FFFFFF" style={animated ? { transformOrigin: '512px 560px' } : {}}>
        <rect x="280" y="410" width="64" height="300" rx="32" style={animated ? { animation: 'lm-bar-listen 1.2s ease-in-out infinite', transformOrigin: 'center', transformBox: 'fill-box' } : {}}/>
        <rect x="378" y="350" width="64" height="420" rx="32" style={animated ? { animation: 'lm-bar-listen 1s ease-in-out infinite 0.15s', transformOrigin: 'center', transformBox: 'fill-box' } : {}}/>
        <rect x="476" y="460" width="64" height="200" rx="32" style={animated ? { animation: 'lm-bar-listen 1.1s ease-in-out infinite 0.05s', transformOrigin: 'center', transformBox: 'fill-box' } : {}}/>
        <rect x="574" y="350" width="64" height="420" rx="32" style={animated ? { animation: 'lm-bar-listen 1s ease-in-out infinite 0.2s', transformOrigin: 'center', transformBox: 'fill-box' } : {}}/>
        <rect x="672" y="410" width="64" height="300" rx="32" style={animated ? { animation: 'lm-bar-listen 1.2s ease-in-out infinite 0.1s', transformOrigin: 'center', transformBox: 'fill-box' } : {}}/>
        <circle cx="512" cy="266" r="22"/>
      </g>
    </svg>
  );
}

// iPhone frame, simplified
function PhoneFrame({ children, w = 280, h = 600 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: 44,
      position: 'relative', overflow: 'hidden',
      background: '#000',
      boxShadow: '0 30px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.18), inset 0 0 0 5px #1a1a1c',
      fontFamily: T.font,
    }}>
      <div style={{ position: 'absolute', inset: 5, borderRadius: 39, overflow: 'hidden', background: T.surface }}>
        {children}
        {/* Status bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 38,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 22px 0', zIndex: 100,
          fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 13, color: T.text,
        }}>
          <span>9:41</span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <svg width="14" height="10" viewBox="0 0 19 12"><rect x="0" y="7.5" width="3" height="4.5" rx="0.5" fill={T.text}/><rect x="4.5" y="5" width="3" height="7" rx="0.5" fill={T.text}/><rect x="9" y="2.5" width="3" height="9.5" rx="0.5" fill={T.text}/><rect x="13.5" y="0" width="3" height="12" rx="0.5" fill={T.text}/></svg>
            <svg width="18" height="9" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3" stroke={T.text} strokeOpacity="0.35" fill="none"/><rect x="2" y="2" width="16" height="9" rx="1.5" fill={T.text}/></svg>
          </div>
        </div>
        {/* Dynamic island */}
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          width: 88, height: 26, borderRadius: 16, background: '#000', zIndex: 110,
        }}/>
        {/* Home indicator */}
        <div style={{
          position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
          width: 96, height: 4, borderRadius: 99,
          background: 'rgba(255,255,255,0.7)', zIndex: 110,
        }}/>
      </div>
    </div>
  );
}

// Annotation card next to each phone
function MotionNote({ num, title, lines }) {
  return (
    <div style={{
      width: 240, padding: 16, alignSelf: 'flex-start',
      background: 'rgba(255,255,255,0.025)',
      border: `1px solid ${T.borderHi}`,
      borderRadius: 14,
    }}>
      <div style={{
        fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: 1.4,
        color: T.violet300, textTransform: 'uppercase', marginBottom: 6,
      }}>{num}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: T.text, letterSpacing: -0.2, marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 8, fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
            <span style={{ fontFamily: T.mono, color: T.violet300, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase' }}>{l[0]}</span>
            <span>{l[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { T, LIcon, LiriunMark, PhoneFrame, MotionNote });
