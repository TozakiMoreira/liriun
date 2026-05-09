// liriun-screens.jsx — Three screens for the Liriun mockups
// Screen 1: Home / chat with agent
// Screen 2: Task list
// Screen 3: Task detail sheet (overlaid on the list, dimmed)

// ─────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────
const L = {
  bg: '#0E1014',                 // page background — deep blue-gray
  bgTop: '#11141B',              // very subtle gradient top
  surface: 'rgba(255,255,255,0.035)',
  surfaceHi: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.07)',
  borderHi: 'rgba(255,255,255,0.12)',
  text: 'rgba(244,246,252,0.96)',
  textMuted: 'rgba(244,246,252,0.62)',
  textFaint: 'rgba(244,246,252,0.38)',
  textDim: 'rgba(244,246,252,0.24)',
  // accent gradient — purple → blue
  accentA: '#9C7BFF',
  accentB: '#5B8DEF',
  accentGrad: 'linear-gradient(135deg, #9C7BFF 0%, #5B8DEF 100%)',
  accentGlow: 'radial-gradient(circle at 50% 50%, rgba(156,123,255,0.28), rgba(91,141,239,0) 70%)',
  // category colors (Things-3-flavored, but muted for dark mode)
  cat: {
    work:    '#7AA9FF',
    health:  '#7BD7B0',
    home:    '#F0B36E',
    personal:'#C8A0FF',
    finance: '#E58FB0',
  },
  font: '"Geist", system-ui, -apple-system, sans-serif',
  mono: '"Geist Mono", ui-monospace, monospace',
};

// ─────────────────────────────────────────────────────────────
// Icons — thin-stroke linear, Phosphor-flavored
// ─────────────────────────────────────────────────────────────
const Icon = {
  mic: (s = 18, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="12" rx="3"/>
      <path d="M5 11a7 7 0 0 0 14 0"/>
      <path d="M12 18v3"/>
    </svg>
  ),
  keyboard: (s = 18, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="6" width="19" height="12" rx="2.5"/>
      <path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M6 13.5h.01M16.5 13.5h.01"/>
      <path d="M9 13.5h6"/>
    </svg>
  ),
  send: (s = 18, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>
    </svg>
  ),
  sparkle: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z"/>
      <path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8L16.5 18.5l1.8-.7L19 16z"/>
    </svg>
  ),
  calendar: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5"/>
      <path d="M3.5 9.5h17M8 3v4M16 3v4"/>
    </svg>
  ),
  clock: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5"/>
      <path d="M12 7.5V12l3 2"/>
    </svg>
  ),
  flag: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 21V4"/>
      <path d="M5 4h11l-2 4 2 4H5"/>
    </svg>
  ),
  flame: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 1 1-8 0c0-1.5.6-2.4 1.5-3.2C10.4 7.5 11.6 6 12 3z"/>
    </svg>
  ),
  tag: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12V4h8l10 10-8 8-10-10z"/>
      <circle cx="7" cy="8" r="1.2"/>
    </svg>
  ),
  check: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5"/>
    </svg>
  ),
  edit: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4.5l5 5L8 21H3v-5L14.5 4.5z"/>
      <path d="M13 6l5 5"/>
    </svg>
  ),
  trash: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>
    </svg>
  ),
  search: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6.5"/>
      <path d="M16 16l4 4"/>
    </svg>
  ),
  plus: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  chevronDown: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  ),
  bell: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 17V11a6 6 0 0 1 12 0v6"/>
      <path d="M4.5 17h15M10 20.5a2 2 0 0 0 4 0"/>
    </svg>
  ),
  list: (s = 18, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h10"/>
    </svg>
  ),
  inbox: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13l3-8h12l3 8"/>
      <path d="M3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>
      <path d="M3 13h5l1 2h6l1-2h5"/>
    </svg>
  ),
  waveform: () => (
    // animated-feeling voice waveform (static)
    <svg width="80" height="22" viewBox="0 0 80 22" fill="none">
      {[3,7,12,5,9,14,8,4,11,6,3,8,12,5,9,14,8,4,11,6,3,7].map((h,i) => (
        <rect key={i} x={i*3.5} y={11 - h/2} width="1.6" height={h} rx="0.8" fill="rgba(244,246,252,0.55)"/>
      ))}
    </svg>
  ),
  drag: () => (
    <div style={{
      width: 36, height: 5, borderRadius: 99,
      background: 'rgba(255,255,255,0.18)', margin: '8px auto 0',
    }}/>
  ),
};

// ─────────────────────────────────────────────────────────────
// Building blocks
// ─────────────────────────────────────────────────────────────
function ScreenShell({ children, withGlow = true }) {
  // base full-screen dark canvas with optional accent glow halo
  return (
    <div className="liriun-screen" style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: `radial-gradient(120% 60% at 50% -10%, ${L.bgTop} 0%, ${L.bg} 60%)`,
      color: L.text, fontFamily: L.font,
      WebkitFontSmoothing: 'antialiased',
    }}>
      {withGlow && (
        <div style={{
          position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
          width: 520, height: 360,
          background: L.accentGlow, opacity: 0.6, pointerEvents: 'none',
        }}/>
      )}
      {children}
    </div>
  );
}

function GlassCard({ children, style = {}, strong = false }) {
  return (
    <div style={{
      position: 'relative',
      background: strong ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.035)',
      backdropFilter: 'blur(20px) saturate(140%)',
      WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      borderRadius: 20,
      border: `1px solid ${L.borderHi}`,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 6px 24px rgba(0,0,0,0.25)',
      ...style,
    }}>
      {children}
    </div>
  );
}

function CategoryChip({ label, color, active = false, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 12px', borderRadius: 12,
      background: active ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}`,
      fontSize: 13, fontWeight: 500, letterSpacing: -0.1,
      color: active ? L.text : L.textMuted,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {color && (
        <span style={{
          width: 7, height: 7, borderRadius: 99, background: color,
          boxShadow: `0 0 8px ${color}55`,
        }}/>
      )}
      {label}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SCREEN 1 · Home / Chat com agente
// ═════════════════════════════════════════════════════════════
function ScreenChat() {
  return (
    <ScreenShell>
      {/* Top: greeting + suggestion (under status bar/dynamic island) */}
      <div style={{
        position: 'absolute', top: 56, left: 0, right: 0,
        padding: '0 22px', zIndex: 4,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 6,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: L.textFaint, letterSpacing: 0.2, textTransform: 'uppercase', fontFamily: L.mono }}>
              Quinta · 19:24
            </div>
            <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.8, marginTop: 4, color: L.text }}>
              Olá, Pedro
            </div>
            <div style={{ fontSize: 14, color: L.textMuted, marginTop: 4, letterSpacing: -0.1 }}>
              Você tem 3 tarefas pendentes hoje.
            </div>
          </div>
          <div style={{
            width: 38, height: 38, borderRadius: 99,
            background: 'linear-gradient(135deg,#3a3550,#2a3548)',
            border: `1px solid ${L.borderHi}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, fontSize: 14, color: L.text,
          }}>P</div>
        </div>
      </div>

      {/* Conversation area (vertically centered-ish, scrollable feel) */}
      <div style={{
        position: 'absolute', top: 200, bottom: 220, left: 0, right: 0,
        padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 14,
        overflow: 'hidden',
      }}>
        {/* Subtle suggestion pill */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 11px', borderRadius: 99,
            background: 'rgba(156,123,255,0.08)',
            border: '1px solid rgba(156,123,255,0.18)',
            color: 'rgba(200,180,255,0.85)',
            fontSize: 12, fontWeight: 500, letterSpacing: -0.1,
          }}>
            {Icon.sparkle(12, 'rgba(200,180,255,0.85)')}
            Tente: "lembra de pagar a conta de luz sexta"
          </div>
        </div>

        {/* User bubble — right */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            maxWidth: '78%',
            background: L.accentGrad,
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '20px 20px 6px 20px',
            fontSize: 15, fontWeight: 500, letterSpacing: -0.1,
            lineHeight: 1.35,
            boxShadow: '0 8px 24px rgba(91,141,239,0.25), inset 0 1px 0 rgba(255,255,255,0.18)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, opacity: 0.8 }}>
              {Icon.waveform()}
              <span style={{ fontFamily: L.mono, fontSize: 11 }}>0:04</span>
            </div>
            Reunião com a equipe de design amanhã às 14h, prioridade alta
          </div>
        </div>

        {/* Assistant bubble — left */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{ maxWidth: '78%' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6,
              fontSize: 12, fontWeight: 500, color: L.textFaint,
              fontFamily: L.mono, letterSpacing: 0.2,
            }}>
              <span style={{
                width: 16, height: 16, borderRadius: 99,
                background: L.accentGrad,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {Icon.sparkle(10, '#fff')}
              </span>
              LIRIUN
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${L.border}`,
              color: L.text,
              padding: '12px 16px',
              borderRadius: '20px 20px 20px 6px',
              fontSize: 15, fontWeight: 400, letterSpacing: -0.1,
              lineHeight: 1.35,
            }}>
              Anotado. Revisa pra mim?
            </div>
          </div>
        </div>

        {/* Review card */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <GlassCard strong style={{ width: '94%', padding: 16, borderRadius: 22 }}>
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{
                fontSize: 11, fontWeight: 500, color: L.textFaint,
                fontFamily: L.mono, letterSpacing: 0.4, textTransform: 'uppercase',
              }}>Nova tarefa</span>
              <span style={{ flex: 1, height: 1, background: L.border }}/>
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3, color: L.text, lineHeight: 1.25 }}>
              Reunião com a equipe de design
            </div>

            {/* Field rows */}
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <FieldRow icon={Icon.tag(14, L.textMuted)} label="Categoria">
                <CategoryChip label="Trabalho" color={L.cat.work} active />
              </FieldRow>
              <FieldRow icon={Icon.calendar(14, L.textMuted)} label="Prazo">
                <span style={{ color: L.text, fontSize: 14, fontWeight: 500 }}>
                  Amanhã, 14:00
                </span>
              </FieldRow>
              <FieldRow icon={Icon.flag(14, L.textMuted)} label="Prioridade">
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  color: '#FFB99A', fontSize: 13, fontWeight: 500,
                }}>
                  {Icon.flame(13, '#FFB99A')}
                  Alta
                </span>
              </FieldRow>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button style={{
                flex: 1, height: 40, border: 0, borderRadius: 14,
                background: L.accentGrad,
                color: '#fff', fontFamily: L.font, fontWeight: 600, fontSize: 14,
                letterSpacing: -0.1, cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(91,141,239,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                {Icon.check(14, '#fff')} Salvar
              </button>
              <button style={{
                flex: 1, height: 40, borderRadius: 14,
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${L.borderHi}`,
                color: L.text, fontFamily: L.font, fontWeight: 500, fontSize: 14,
                letterSpacing: -0.1, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                {Icon.edit(13, L.text)} Editar
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bottom input bar — floating mic */}
      <div style={{
        position: 'absolute', bottom: 34, left: 0, right: 0,
        padding: '0 18px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      }}>
        {/* Mic button (large floating) */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          {/* glow halo */}
          <div style={{
            position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
            width: 110, height: 110, borderRadius: 99,
            background: 'radial-gradient(circle, rgba(156,123,255,0.32) 0%, rgba(91,141,239,0) 65%)',
            filter: 'blur(2px)', pointerEvents: 'none',
          }}/>
          <div style={{
            width: 76, height: 76, borderRadius: 99,
            background: L.accentGrad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 18px 40px rgba(91,141,239,0.45), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 6px rgba(255,255,255,0.04)',
            position: 'relative',
          }}>
            {/* inner ring */}
            <div style={{
              position: 'absolute', inset: 6, borderRadius: 99,
              border: '1px solid rgba(255,255,255,0.22)',
            }}/>
            {Icon.mic(28, '#fff')}
          </div>
        </div>

        {/* text + keyboard input row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${L.border}`,
          borderRadius: 99, padding: '6px 6px 6px 16px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          <span style={{ color: L.textFaint, fontSize: 14, flex: 1 }}>
            Escreva ou peça pra Liriun…
          </span>
          <button style={{
            width: 36, height: 36, borderRadius: 99, border: 0,
            background: 'rgba(255,255,255,0.06)',
            color: L.textMuted, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {Icon.keyboard(18, L.textMuted)}
          </button>
        </div>
      </div>
    </ScreenShell>
  );
}

function FieldRow({ icon, label, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '4px 0',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 7,
        background: 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>{icon}</div>
      <div style={{ fontSize: 12, color: L.textFaint, width: 78, flexShrink: 0, fontFamily: L.mono, letterSpacing: 0.2 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SCREEN 2 · Lista de tarefas
// ═════════════════════════════════════════════════════════════
const TASKS_TODAY = [
  { id: 't1', title: 'Reunião com a equipe de design', cat: 'Trabalho', catColor: 'work', time: '14:00', priority: 'high' },
  { id: 't2', title: 'Buscar João na escola', cat: 'Pessoal', catColor: 'personal', time: '17:30', priority: 'med' },
  { id: 't3', title: 'Yoga · sessão de 30min', cat: 'Saúde', catColor: 'health', time: null, priority: null },
  { id: 't4', title: 'Pagar conta de luz', cat: 'Casa', catColor: 'home', time: null, priority: 'high', overdue: true },
];
const TASKS_TOMORROW = [
  { id: 't5', title: 'Revisar proposta da Acme', cat: 'Trabalho', catColor: 'work', time: '10:00', priority: 'med' },
  { id: 't6', title: 'Mercado · lista da semana', cat: 'Casa', catColor: 'home', time: null, priority: null },
];
const TASKS_UPCOMING = [
  { id: 't7', title: 'Ligar pra dentista', cat: 'Saúde', catColor: 'health', time: null, priority: null, when: 'Sex' },
  { id: 't8', title: 'Renovar plano de internet', cat: 'Finanças', catColor: 'finance', time: null, priority: 'med', when: 'Sáb' },
];

function PriorityIcon({ priority }) {
  if (!priority) return null;
  if (priority === 'high') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        color: '#FFB99A',
      }}>{Icon.flame(14, '#FFB99A')}</span>
    );
  }
  return (
    <span style={{ color: L.textFaint, display: 'inline-flex' }}>
      {Icon.flag(13, L.textFaint)}
    </span>
  );
}

function TaskRow({ task, completed = false, highlighted = false }) {
  const color = L[`cat`].hasOwnProperty(task.catColor) ? L.cat[task.catColor] : '#fff';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 4px',
      position: 'relative',
    }}>
      {/* Checkbox */}
      <div style={{
        width: 22, height: 22, borderRadius: 99, flexShrink: 0,
        border: completed ? 'none' : `1.5px solid ${task.overdue ? 'rgba(255,185,154,0.65)' : L.borderHi}`,
        background: completed ? L.accentGrad : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: completed ? '0 4px 10px rgba(91,141,239,0.3)' : 'none',
      }}>
        {completed && Icon.check(13, '#fff')}
      </div>
      {/* Title block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 500, letterSpacing: -0.2,
          color: completed ? L.textFaint : L.text,
          textDecoration: completed ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {task.title}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginTop: 4,
          fontSize: 12, color: L.textMuted,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              width: 6, height: 6, borderRadius: 99, background: color,
              boxShadow: `0 0 6px ${color}66`,
            }}/>
            {task.cat}
          </span>
          {(task.time || task.when) && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: task.overdue ? '#FFB99A' : L.textMuted }}>
              {Icon.clock(11, task.overdue ? '#FFB99A' : L.textMuted)}
              {task.overdue ? 'Atrasada · sex' : (task.time || task.when)}
            </span>
          )}
        </div>
      </div>
      {/* Priority */}
      <PriorityIcon priority={task.priority}/>

      {/* Highlighted border (selected/expanded item) */}
      {highlighted && (
        <div style={{
          position: 'absolute', inset: '6px -10px', borderRadius: 14,
          background: 'rgba(156,123,255,0.06)',
          border: '1px solid rgba(156,123,255,0.22)',
          pointerEvents: 'none', zIndex: -1,
        }}/>
      )}
    </div>
  );
}

function SectionHeader({ label, count, accent = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '20px 0 8px',
    }}>
      <span style={{
        fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase',
        fontFamily: L.mono,
        color: accent ? L.text : L.textFaint,
      }}>{label}</span>
      <span style={{
        fontSize: 11, fontWeight: 500, color: L.textDim, fontFamily: L.mono,
      }}>{count}</span>
      <span style={{ flex: 1, height: 1, background: L.border, marginLeft: 4 }}/>
    </div>
  );
}

function ScreenList({ withSheet = false, dimmed = false }) {
  return (
    <ScreenShell withGlow={!dimmed}>
      {/* dim overlay (for the sheet screen) */}
      {dimmed && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'rgba(8,10,14,0.55)',
          backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
        }}/>
      )}

      {/* Header */}
      <div style={{
        position: 'absolute', top: 56, left: 0, right: 0,
        padding: '0 22px', zIndex: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: L.textFaint, letterSpacing: 0.2, textTransform: 'uppercase', fontFamily: L.mono }}>
              Quinta · 9 mai
            </div>
            <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.8, marginTop: 4, color: L.text }}>
              Tarefas
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <CircleIcon>{Icon.search(16, L.textMuted)}</CircleIcon>
            <CircleIcon>{Icon.plus(16, L.text)}</CircleIcon>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{
          display: 'flex', gap: 7, marginTop: 18,
          overflowX: 'auto', WebkitMaskImage: 'linear-gradient(90deg, #000 88%, transparent)',
        }}>
          <CategoryChip label="Todas" active />
          <CategoryChip label="Trabalho" color={L.cat.work} />
          <CategoryChip label="Pessoal" color={L.cat.personal} />
          <CategoryChip label="Saúde" color={L.cat.health} />
          <CategoryChip label="Casa" color={L.cat.home} />
        </div>
      </div>

      {/* Scrollable list area */}
      <div style={{
        position: 'absolute', top: 196, bottom: 90, left: 0, right: 0,
        padding: '0 22px', overflow: 'hidden',
        zIndex: 2,
      }}>
        <SectionHeader label="Hoje" count={TASKS_TODAY.length} accent />
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {TASKS_TODAY.map((t, i) => <TaskRow key={t.id} task={t} highlighted={withSheet && t.id === 't1'}/>)}
        </div>

        <SectionHeader label="Amanhã" count={TASKS_TOMORROW.length}/>
        {TASKS_TOMORROW.map(t => <TaskRow key={t.id} task={t}/>)}

        <SectionHeader label="Próximos dias" count={TASKS_UPCOMING.length}/>
        {TASKS_UPCOMING.map(t => <TaskRow key={t.id} task={t}/>)}
      </div>

      {/* Bottom tab bar (glass) */}
      <div style={{
        position: 'absolute', bottom: 28, left: 22, right: 22,
        height: 60, borderRadius: 28,
        background: 'rgba(20,22,28,0.6)',
        backdropFilter: 'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        border: `1px solid ${L.borderHi}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '0 6px',
        zIndex: 2,
      }}>
        <TabIcon active>{Icon.list(20, L.text)}</TabIcon>
        <TabIcon>{Icon.calendar(20, L.textFaint)}</TabIcon>
        {/* mic shortcut */}
        <div style={{
          width: 48, height: 48, borderRadius: 99,
          background: L.accentGrad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(91,141,239,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
        }}>{Icon.mic(20, '#fff')}</div>
        <TabIcon>{Icon.inbox(20, L.textFaint)}</TabIcon>
        <TabIcon>{Icon.bell(20, L.textFaint)}</TabIcon>
      </div>
    </ScreenShell>
  );
}

function CircleIcon({ children }) {
  return (
    <div style={{
      width: 38, height: 38, borderRadius: 99,
      background: 'rgba(255,255,255,0.05)',
      border: `1px solid ${L.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</div>
  );
}

function TabIcon({ children, active = false }) {
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
    }}>{children}</div>
  );
}

// ═════════════════════════════════════════════════════════════
// SCREEN 3 · Detalhe da tarefa (sheet)
// ═════════════════════════════════════════════════════════════
function ScreenDetail() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Background — same list, dimmed */}
      <ScreenList withSheet dimmed/>

      {/* Sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: '78%', zIndex: 10,
        background: 'rgba(22,24,30,0.86)',
        backdropFilter: 'blur(40px) saturate(150%)',
        WebkitBackdropFilter: 'blur(40px) saturate(150%)',
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        border: `1px solid ${L.borderHi}`,
        borderBottom: 0,
        boxShadow: '0 -20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
        color: L.text, fontFamily: L.font,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* drag handle */}
        {Icon.drag()}

        {/* Top: meta + title */}
        <div style={{ padding: '14px 24px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 500, letterSpacing: 0.4,
            fontFamily: L.mono, color: L.textFaint, textTransform: 'uppercase',
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: 99,
              background: L.accentGrad,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>{Icon.sparkle(10, '#fff')}</span>
            CRIADA POR VOZ · HÁ 2 MIN
          </div>

          <div style={{
            fontSize: 26, fontWeight: 600, letterSpacing: -0.6, lineHeight: 1.2,
            marginTop: 14, color: L.text,
          }}>
            Reunião com a equipe de design
          </div>

          {/* notes (editable feel) */}
          <div style={{
            marginTop: 10, fontSize: 14, color: L.textMuted,
            lineHeight: 1.45, letterSpacing: -0.1,
          }}>
            Alinhar entregáveis da sprint e revisar handoff dos novos mockups.
            <span style={{ color: L.textDim }}> Adicionar notas…</span>
          </div>
        </div>

        {/* Field list (rounded glass card) */}
        <div style={{ padding: '20px 18px 0' }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${L.border}`,
            borderRadius: 18, overflow: 'hidden',
          }}>
            <DetailRow icon={Icon.calendar(16, L.textMuted)} label="Prazo">
              <span style={{ fontSize: 14, color: L.text, fontWeight: 500 }}>Amanhã, 10 mai</span>
            </DetailRow>
            <DetailRow icon={Icon.clock(16, L.textMuted)} label="Horário">
              <span style={{ fontSize: 14, color: L.text, fontWeight: 500 }}>14:00 – 15:00</span>
            </DetailRow>
            <DetailRow icon={Icon.bell(16, L.textMuted)} label="Lembrete">
              <span style={{ fontSize: 14, color: L.textMuted, fontWeight: 500 }}>30 min antes</span>
            </DetailRow>
            <DetailRow icon={Icon.flag(16, L.textMuted)} label="Prioridade" last>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                color: '#FFB99A', fontSize: 14, fontWeight: 500,
              }}>{Icon.flame(13, '#FFB99A')} Alta</span>
            </DetailRow>
          </div>
        </div>

        {/* Categories label + chips */}
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{
            fontSize: 11, fontWeight: 500, letterSpacing: 1.2, textTransform: 'uppercase',
            fontFamily: L.mono, color: L.textFaint, marginBottom: 10,
          }}>Categorias</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            <CategoryChip label="Trabalho" color={L.cat.work} active/>
            <CategoryChip label="Reunião" color={L.cat.work}/>
            <CategoryChip label="Equipe" color={L.cat.work}/>
            <CategoryChip label="Adicionar" />
          </div>
        </div>

        <div style={{ flex: 1 }}/>

        {/* Bottom action bar */}
        <div style={{
          padding: '14px 18px 30px',
          display: 'flex', gap: 10,
          borderTop: `1px solid ${L.border}`,
          background: 'rgba(15,17,21,0.6)',
        }}>
          <button style={{
            flex: 2, height: 50, border: 0, borderRadius: 16,
            background: L.accentGrad, color: '#fff',
            fontFamily: L.font, fontWeight: 600, fontSize: 15,
            letterSpacing: -0.1, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 8px 22px rgba(91,141,239,0.35), inset 0 1px 0 rgba(255,255,255,0.22)',
          }}>
            {Icon.check(16, '#fff')} Concluir
          </button>
          <button style={{
            flex: 1, height: 50, borderRadius: 16,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${L.borderHi}`,
            color: 'rgba(244,200,200,0.85)',
            fontFamily: L.font, fontWeight: 500, fontSize: 14,
            letterSpacing: -0.1, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {Icon.trash(14, 'rgba(244,200,200,0.85)')} Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, children, last = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px',
      borderBottom: last ? 'none' : `1px solid ${L.border}`,
    }}>
      <div style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: 14, color: L.textMuted, flex: 1, fontWeight: 500, letterSpacing: -0.1 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {children}
        {Icon.chevronDown(13, L.textFaint)}
      </div>
    </div>
  );
}

// Export
Object.assign(window, {
  ScreenChat, ScreenList, ScreenDetail, L_TOKENS: L,
});
