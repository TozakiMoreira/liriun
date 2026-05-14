// app-v2/screens-extras.jsx — quick capture, notification, achievement shareable, widget

// ─── 13. Quick capture (floating over any screen) ──────────
function ScreenQuickCapture() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, overflow: 'hidden' }}>
      {/* Background — dimmed "tasks" screen */}
      <div style={{
        position: 'absolute', inset: 0, padding: '54px 18px',
        opacity: 0.4, filter: 'blur(6px)', pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: T.text }}>Tarefas</div>
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 50, background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}/>
          ))}
        </div>
      </div>

      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,8,11,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}/>

      {/* Floating capture sheet */}
      <div style={{
        position: 'absolute', bottom: 24, left: 12, right: 12,
        padding: 14, borderRadius: 22,
        background: 'rgba(20,22,28,0.92)',
        border: `1px solid ${T.borderHi}`,
        backdropFilter: 'blur(40px) saturate(160%)',
        WebkitBackdropFilter: 'blur(40px) saturate(160%)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}>
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.18)', margin: '0 auto 10px' }}/>

        {/* Mode pills */}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 12 }}>
          {[
            { l: 'Voz', icon: LIcon.mic(11, '#fff'), active: true },
            { l: 'Texto', icon: <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>aA</span> },
            { l: 'Foto', icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.6"><rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l2-3h4l2 3"/></svg> },
          ].map((m, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 11px', borderRadius: 99,
              background: m.active ? T.grad : 'rgba(255,255,255,0.05)',
              border: m.active ? 'none' : `1px solid ${T.border}`,
              fontSize: 11, color: m.active ? '#fff' : T.muted, fontWeight: 500, letterSpacing: -0.1,
              boxShadow: m.active ? '0 4px 12px rgba(91,141,239,0.32)' : 'none',
            }}>{m.icon} {m.l}</span>
          ))}
        </div>

        {/* Mic central */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
          {/* Rings */}
          {[0, 0.5].map((d, i) => (
            <div key={i} style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: 78, height: 78, borderRadius: 99,
              border: '1.5px solid rgba(168,139,255,0.36)',
              animation: `lm-pulse-ring 2s cubic-bezier(0.4,0,0.2,1) infinite ${d}s`,
              marginTop: 4,
            }}/>
          ))}
          <div style={{
            width: 70, height: 70, borderRadius: 99,
            background: T.grad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 16px 40px rgba(168,139,255,0.50), inset 0 1px 0 rgba(255,255,255,0.25)',
            animation: 'lm-pulse-scale 1.4s ease-in-out infinite',
          }}>{LIcon.mic(28, '#fff', 1.8)}</div>
        </div>

        {/* Waveform */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2.5, height: 28, marginTop: 8 }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <span key={i} style={{
              width: 2.5, height: 18, background: T.violet300, borderRadius: 2,
              transformOrigin: 'center', transformBox: 'fill-box',
              animation: `lm-bar-listen ${0.7 + (i % 4) * 0.1}s ease-in-out infinite ${(i * 0.04) % 0.5}s`,
              opacity: 0.85,
            }}/>
          ))}
        </div>

        {/* Hint */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 0.4, textTransform: 'uppercase' }}>OUVINDO · MANTENHA PRESSIONADO</div>
        </div>

        {/* Quick chips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Hoje', 'Amanhã', 'Semana', 'Sem prazo'].map((q, i) => (
            <span key={i} style={{
              padding: '5px 9px', borderRadius: 7,
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`,
              fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 0.3, textTransform: 'uppercase',
            }}>{q}</span>
          ))}
        </div>
      </div>

      {/* Hint at top */}
      <div style={{
        position: 'absolute', top: 60, left: 18, right: 18,
        textAlign: 'center',
        fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase',
      }}>
        Captura rápida · acessível de qualquer tela
      </div>
    </div>
  );
}

// ─── 14. Notification (lock screen — contextual & smart) ───
function ScreenNotification() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
      {/* Wallpaper */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(80% 60% at 30% 20%, rgba(168,139,255,0.30), transparent 60%), radial-gradient(60% 70% at 80% 80%, rgba(91,141,239,0.22), transparent 60%), #0A0C12',
      }}/>

      {/* Lock screen time */}
      <div style={{ position: 'relative', textAlign: 'center', paddingTop: 76 }}>
        <div style={{ fontFamily: T.mono, fontSize: 12, color: 'rgba(255,255,255,0.62)', letterSpacing: 1.4, textTransform: 'uppercase' }}>QUARTA, 13 MAI</div>
        <div style={{ fontFamily: '-apple-system, system-ui', fontSize: 78, fontWeight: 300, color: '#fff', marginTop: 6, letterSpacing: -2, lineHeight: 1 }}>9:41</div>
      </div>

      {/* Notification */}
      <div style={{ position: 'relative', padding: '40px 12px 0' }}>
        <div style={{
          padding: '12px 14px', borderRadius: 18,
          background: 'rgba(20,22,28,0.78)', backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.55)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ width: 18, height: 18, borderRadius: 5, background: T.grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{LIcon.sparkle(11, '#fff')}</span>
            <span style={{ fontFamily: '-apple-system, system-ui', fontSize: 12, fontWeight: 600, color: '#fff', letterSpacing: -0.1 }}>LIRIUN</span>
            <span style={{ flex: 1 }}/>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>agora</span>
          </div>
          <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, letterSpacing: -0.2, lineHeight: 1.3 }}>
            Marina te espera em 15 minutos.
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 4, lineHeight: 1.45 }}>
            Quer que eu avise que você está a caminho?
          </div>
          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button style={{
              flex: 1, padding: '7px 0', borderRadius: 9, border: 0,
              background: 'rgba(168,139,255,0.20)', color: '#C8B6FF',
              fontSize: 11, fontWeight: 600, letterSpacing: -0.1,
            }}>Avisar</button>
            <button style={{
              flex: 1, padding: '7px 0', borderRadius: 9, border: 0,
              background: 'rgba(255,255,255,0.10)', color: '#fff',
              fontSize: 11, fontWeight: 500, letterSpacing: -0.1,
            }}>Adiar 10min</button>
            <button style={{
              width: 32, padding: '7px 0', borderRadius: 9, border: 0,
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)',
              fontSize: 14, fontWeight: 500,
            }}>···</button>
          </div>
        </div>

        {/* Second notification — earlier today */}
        <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 14, background: 'rgba(20,22,28,0.52)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', opacity: 0.85 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: T.grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{LIcon.sparkle(9, '#fff')}</span>
            <span style={{ fontFamily: '-apple-system, system-ui', fontSize: 11, fontWeight: 600, color: '#fff', letterSpacing: -0.1 }}>LIRIUN</span>
            <span style={{ flex: 1 }}/>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>2h atrás</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 5, letterSpacing: -0.1 }}>
            3 tarefas concluídas hoje. Você está adiantado.
          </div>
        </div>
      </div>

      {/* Liriun widget at bottom */}
      <div style={{
        position: 'absolute', bottom: 50, left: 12, right: 12,
        padding: 14, borderRadius: 20,
        background: 'rgba(14,16,20,0.72)', backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        border: `1px solid rgba(255,255,255,0.10)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 18, height: 18, borderRadius: 5, background: T.grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{LIcon.sparkle(11, '#fff')}</span>
          <span style={{ fontFamily: '-apple-system, system-ui', fontSize: 11, fontWeight: 600, color: '#fff', letterSpacing: 0.4, textTransform: 'uppercase' }}>SEU DIA · WIDGET</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, letterSpacing: -0.1 }}>
          <span style={{ color: '#fff', fontWeight: 600 }}>Marina · 13:00</span> · <span style={{ color: 'rgba(255,255,255,0.55)' }}>Acme · 15:30</span> · <span style={{ color: 'rgba(255,255,255,0.55)' }}>Lucas Jr · 17:30</span>
        </div>
        <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
          {[1,1,1,0,0,0].map((d, i) => (
            <span key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: d ? T.grad : 'rgba(255,255,255,0.10)' }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 15. Achievement shareable card ────────────────────────
function ScreenShareCard() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.bg, padding: '54px 14px 16px' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ width: 32, height: 32, borderRadius: 99, background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{LIcon.x(12, T.muted)}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Compartilhar</span>
        <span style={{ width: 32, height: 32, borderRadius: 99, background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}` }}/>
      </div>

      {/* The shareable card (9:16 aspect for IG story) */}
      <div style={{
        margin: '0 auto', width: 220, aspectRatio: '9/16',
        borderRadius: 22, overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(160deg, #1a1429 0%, #0E1014 60%, #0a0d18 100%)',
        border: '1px solid rgba(168,139,255,0.22)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
          width: 280, height: 280, borderRadius: 99,
          background: 'radial-gradient(circle, rgba(168,139,255,0.35), transparent 65%)',
        }}/>

        {/* Mark + Liriun label */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, padding: '14px 14px 0' }}>
          <LiriunMark size={20}/>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: -0.2 }}>Liriun</span>
        </div>

        {/* Big number */}
        <div style={{ position: 'relative', textAlign: 'center', marginTop: 38 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.violet300, letterSpacing: 2, textTransform: 'uppercase' }}>STREAK</div>
          <div style={{
            fontSize: 88, fontWeight: 700, letterSpacing: -3, color: T.text, marginTop: 6, lineHeight: 1,
            backgroundImage: T.grad,
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>12</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4, letterSpacing: -0.1 }}>dias seguidos</div>
        </div>

        {/* Mini stats */}
        <div style={{ position: 'relative', display: 'flex', gap: 4, padding: '30px 14px 0' }}>
          {[['184', 'TAREFAS'], ['73%', 'FOCO'], ['4×', 'TER']].map(([n, l], i) => (
            <div key={i} style={{
              flex: 1, padding: '8px 6px', borderRadius: 8,
              background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, letterSpacing: -0.3 }}>{n}</div>
              <div style={{ fontFamily: T.mono, fontSize: 7, color: T.faint, marginTop: 2, letterSpacing: 0.4 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div style={{
          position: 'absolute', bottom: 16, left: 14, right: 14, textAlign: 'center',
          fontFamily: T.mono, fontSize: 8, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase',
        }}>LIRIUN.COM</div>
      </div>

      {/* Share targets */}
      <div style={{ marginTop: 20, display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        {['IG Story', 'WhatsApp', 'X', 'Copiar imagem'].map((s, i) => (
          <span key={i} style={{
            padding: '8px 12px', borderRadius: 99,
            background: i === 0 ? T.grad : 'rgba(255,255,255,0.05)',
            border: i === 0 ? 'none' : `1px solid ${T.border}`,
            color: i === 0 ? '#fff' : T.text, fontSize: 11, fontWeight: 500, letterSpacing: -0.1,
            boxShadow: i === 0 ? '0 6px 16px rgba(91,141,239,0.32)' : 'none',
          }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ScreenQuickCapture, ScreenNotification, ScreenShareCard });
