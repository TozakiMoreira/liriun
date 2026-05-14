// liriun-motion-primitives.jsx — Animation primitives library
// Shown as cards (not phone frames). Spinners, waveforms, progress, buttons, transitions, toasts.

function PrimitiveCard({ title, tag, code, children, w = 200, h = 140, accent = false }) {
  return (
    <div style={{
      width: w, padding: 0,
      background: accent ? T.gradSoft : 'rgba(255,255,255,0.025)',
      border: `1px solid ${accent ? 'rgba(168,139,255,0.28)' : T.borderHi}`,
      borderRadius: 16, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        height: h, background: T.surface,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>{children}</div>
      <div style={{ padding: '12px 14px 14px', borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontSize: 12, color: T.text, fontWeight: 600, letterSpacing: -0.1 }}>{title}</div>
          {tag && (
            <span style={{
              fontFamily: T.mono, fontSize: 9, padding: '2px 6px', borderRadius: 5,
              background: 'rgba(168,139,255,0.10)', border: '1px solid rgba(168,139,255,0.22)',
              color: T.violet300, letterSpacing: 0.4, textTransform: 'uppercase',
            }}>{tag}</span>
          )}
        </div>
        {code && (
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, marginTop: 6, letterSpacing: 0.2 }}>{code}</div>
        )}
      </div>
    </div>
  );
}

// === SPINNERS ===
function SpinRing() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ animation: 'lm-spin 1s linear infinite' }}>
      <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.10)" strokeWidth="3" fill="none"/>
      <path d="M 20 4 a 16 16 0 0 1 16 16" stroke={T.violet400} strokeWidth="3" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
function SpinDots() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 10, height: 10, borderRadius: 99, background: T.violet400,
          animation: `lm-dot 1.2s ease-in-out infinite ${i * 0.18}s`,
        }}/>
      ))}
    </div>
  );
}
function SpinOrb() {
  return (
    <div style={{ position: 'relative', width: 60, height: 60 }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 99,
        background: T.grad,
        animation: 'lm-pulse-scale 1.4s ease-in-out infinite',
        opacity: 0.85,
        filter: 'blur(2px)',
      }}/>
      <div style={{
        position: 'absolute', inset: 12, borderRadius: 99,
        background: T.grad,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
        animation: 'lm-pulse-scale 1.4s ease-in-out infinite 0.2s',
      }}/>
    </div>
  );
}
function SpinShimmer() {
  return (
    <div style={{
      width: 130, height: 14, borderRadius: 7,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(168,139,255,0.30) 50%, rgba(255,255,255,0.05) 100%)',
      backgroundSize: '200% 100%',
      animation: 'lm-shimmer 1.6s linear infinite',
    }}/>
  );
}

// === WAVEFORM ===
function WaveListening() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 40 }}>
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} style={{
          width: 3, height: 24, background: T.violet400, borderRadius: 2,
          transformOrigin: 'center', transformBox: 'fill-box',
          animation: `lm-bar-listen ${0.7 + (i % 4) * 0.1}s ease-in-out infinite ${(i * 0.05) % 0.5}s`,
        }}/>
      ))}
    </div>
  );
}
function WaveStatic() {
  return (
    <svg width="160" height="32" viewBox="0 0 160 32" style={{ opacity: 0.85 }}>
      {[10,16,22,12,18,26,14,8,20,12,8,15,22,11,17,25,15,9,18,11,7,14,20,10,16,24,14,8,17,10,6,13].map((h,i)=>(
        <rect key={i} x={i*5} y={16-h/2} width="2.5" height={h} rx="1.2" fill={T.muted}/>
      ))}
    </svg>
  );
}

// === PROGRESS ===
function ProgressDeterminate({ pct = 64 }) {
  return (
    <div style={{ width: 150 }}>
      <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: T.grad, borderRadius: 99, boxShadow: '0 0 12px rgba(168,139,255,0.4)' }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: T.mono, fontSize: 10 }}>
        <span style={{ color: T.faint, letterSpacing: 0.3 }}>SINCRONIZANDO</span>
        <span style={{ color: T.violet300 }}>{pct}%</span>
      </div>
    </div>
  );
}
function ProgressIndeterminate() {
  return (
    <div style={{ width: 150, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
        background: T.grad, borderRadius: 99,
        animation: 'lm-progress 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
      }}/>
    </div>
  );
}

// === BUTTONS ===
function BtnStates() {
  const base = {
    height: 38, padding: '0 16px', borderRadius: 11,
    fontFamily: T.font, fontWeight: 600, fontSize: 13, letterSpacing: -0.1,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    border: 0, color: '#fff', cursor: 'pointer',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button style={{ ...base, background: T.grad, boxShadow: '0 6px 18px rgba(91,141,239,0.32), inset 0 1px 0 rgba(255,255,255,0.2)' }}>Padrão</button>
      <button style={{ ...base, background: T.grad, boxShadow: '0 10px 28px rgba(91,141,239,0.45), inset 0 1px 0 rgba(255,255,255,0.25)', transform: 'translateY(-1px)' }}>Hover</button>
      <button style={{ ...base, background: 'linear-gradient(135deg,#7C5DE8,#3F71D9)', transform: 'translateY(1px)', boxShadow: '0 4px 12px rgba(91,141,239,0.28), inset 0 1px 0 rgba(255,255,255,0.18)' }}>Pressed</button>
      <button style={{ ...base, background: T.grad, opacity: 1 }}>
        <span style={{ display: 'inline-flex', animation: 'lm-spin 1s linear infinite' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><path d="M12 3a9 9 0 1 1-9 9" opacity="0.95"/><path d="M3 12a9 9 0 0 1 6-8.5" opacity="0.3"/></svg>
        </span>Carregando
      </button>
      <button style={{ ...base, background: T.grad, opacity: 0.35, pointerEvents: 'none' }}>Disabled</button>
    </div>
  );
}

// === TOAST ===
function ToastSuccess() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '10px 14px 10px 12px', borderRadius: 14,
      background: 'rgba(20,22,28,0.92)',
      backdropFilter: 'blur(24px) saturate(160%)',
      border: `1px solid rgba(123,215,176,0.36)`,
      boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
      animation: 'lm-rise 0.5s ease-out both',
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 99,
        background: 'rgba(123,215,176,0.18)', border: '1px solid rgba(123,215,176,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{LIcon.check(13, '#7BD7B0', 2.4)}</span>
      <span style={{ fontSize: 12, color: T.text, fontWeight: 500, letterSpacing: -0.1 }}>Tarefa salva</span>
    </div>
  );
}
function ToastUndo() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '10px 6px 10px 14px', borderRadius: 14,
      background: 'rgba(20,22,28,0.92)',
      backdropFilter: 'blur(24px) saturate(160%)',
      border: `1px solid ${T.borderHi}`,
      boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
    }}>
      <span style={{ fontSize: 12, color: T.text, fontWeight: 500, letterSpacing: -0.1 }}>Concluída · "Comprar café"</span>
      <button style={{
        padding: '5px 11px', borderRadius: 8, border: 0,
        background: 'rgba(168,139,255,0.15)', color: T.violet300,
        fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
      }}>Desfazer</button>
    </div>
  );
}
function ToastError() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '10px 14px 10px 12px', borderRadius: 14,
      background: 'rgba(20,22,28,0.92)',
      backdropFilter: 'blur(24px) saturate(160%)',
      border: '1px solid rgba(238,122,142,0.36)',
      boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 99,
        background: 'rgba(238,122,142,0.16)', border: '1px solid rgba(238,122,142,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{LIcon.x(12, '#EE7A8E', 2.4)}</span>
      <span style={{ fontSize: 12, color: T.text, fontWeight: 500, letterSpacing: -0.1 }}>Falha ao sincronizar</span>
    </div>
  );
}

// === PAGE TRANSITION ===
function PageTransition() {
  return (
    <div style={{ position: 'relative', width: 140, height: 100 }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 12,
        background: T.gradSoft, border: '1px solid rgba(168,139,255,0.22)',
        animation: 'lm-swipe-out 1.6s cubic-bezier(0.16,1,0.3,1) infinite',
      }}/>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 12,
        background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.borderHi}`,
        animation: 'lm-swipe-in 1.6s cubic-bezier(0.16,1,0.3,1) infinite',
      }}/>
    </div>
  );
}
function SheetRise() {
  return (
    <div style={{ position: 'relative', width: 140, height: 120, borderRadius: 12, background: 'rgba(0,0,0,0.30)', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
        background: 'rgba(20,22,28,0.95)',
        borderTopLeftRadius: 16, borderTopRightRadius: 16,
        border: `1px solid ${T.borderHi}`, borderBottom: 0,
        animation: 'lm-page-rise 1.6s cubic-bezier(0.16,1,0.3,1) infinite',
        padding: '10px 14px',
      }}>
        <div style={{ width: 28, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.20)', margin: '0 auto 10px' }}/>
        <div style={{ width: '60%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.12)' }}/>
        <div style={{ width: '40%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', marginTop: 6 }}/>
      </div>
    </div>
  );
}

// === MIC PULSE ===
function MicPulse() {
  return (
    <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {[0, 0.5, 1].map((d, i) => (
        <div key={i} style={{
          position: 'absolute', width: 70, height: 70, borderRadius: 99,
          border: '1.5px solid rgba(168,139,255,0.40)',
          animation: `lm-pulse-ring 1.8s cubic-bezier(0.4,0,0.2,1) infinite ${d}s`,
        }}/>
      ))}
      <div style={{
        width: 50, height: 50, borderRadius: 99, background: T.grad,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 12px 28px rgba(91,141,239,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
        animation: 'lm-pulse-scale 1.2s ease-in-out infinite',
      }}>{LIcon.mic(20, '#fff', 1.8)}</div>
    </div>
  );
}

// === PULL TO REFRESH ===
function PullToRefresh() {
  return (
    <div style={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        animation: 'lm-pull 2s ease-in-out infinite',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
        <div style={{ display: 'inline-flex', animation: 'lm-spin 1.4s linear infinite' }}>{LIcon.refresh(20, T.violet300)}</div>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 0.4, textTransform: 'uppercase' }}>Solte</div>
      </div>
    </div>
  );
}

// === CONFETTI BURST ===
function ConfettiBurst() {
  return (
    <div style={{ position: 'relative', width: 100, height: 100 }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 36, height: 36, borderRadius: 99,
        background: 'rgba(123,215,176,0.18)',
        border: '1.5px solid rgba(123,215,176,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{LIcon.check(18, '#7BD7B0', 2.5)}</div>
      {[1,2,3,4,5,6].map(i => (
        <span key={i} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: i % 2 === 0 ? 6 : 4, height: i % 3 === 0 ? 8 : 4,
          background: ['#A88BFF','#5B8DEF','#7BD7B0','#F0B36E','#C8A0FF'][i % 5],
          borderRadius: i % 4 === 0 ? 99 : 1,
          animation: `lm-confetti-${i} 1.8s cubic-bezier(0.2,0.7,0.3,1) infinite both ${i * 0.05}s`,
        }}/>
      ))}
    </div>
  );
}

// === CHIP / BADGE ===
function ChipDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', padding: 16 }}>
      {[
        { l: 'Hoje', active: true },
        { l: 'Trabalho', c: T.catWork },
        { l: 'Saúde', c: T.catHealth },
        { l: 'Casa', c: T.catHome },
      ].map((c, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '6px 10px', borderRadius: 11,
          background: c.active ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${c.active ? 'rgba(255,255,255,0.22)' : T.border}`,
          fontSize: 11, color: c.active ? T.text : T.muted, fontWeight: 500, letterSpacing: -0.1,
        }}>
          {c.c && <span style={{ width: 5, height: 5, borderRadius: 99, background: c.c }}/>}
          {c.l}
        </span>
      ))}
    </div>
  );
}

// === GRADIENT BUTTON HALO (mic glow ring) ===
function GlowFAB() {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        width: 60, height: 60, borderRadius: 99, background: T.grad,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 12px 28px rgba(91,141,239,0.40), inset 0 1px 0 rgba(255,255,255,0.20)',
        animation: 'lm-glow 2.4s ease-out infinite',
      }}>{LIcon.mic(22, '#fff', 1.8)}</div>
    </div>
  );
}

// === ASSEMBLY ===
function MotionPrimitives() {
  return (
    <div style={{ padding: 32, background: T.bg, color: T.text }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.violet300, letterSpacing: 1.6, textTransform: 'uppercase' }}>Animação · Biblioteca</div>
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1.2, color: T.text, marginTop: 10, lineHeight: 1.05 }}>
            Primitivos de motion
          </div>
          <div style={{ fontSize: 14, color: T.muted, marginTop: 12, maxWidth: 560, lineHeight: 1.5 }}>
            Cada peça reutilizável que o app e o site usam. Tudo já calibrado com os tokens de duration e easing do brand kit.
          </div>
        </div>

        {/* Loaders */}
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase', margin: '12px 0' }}>Loaders</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 32 }}>
          <PrimitiveCard title="Ring spinner" tag="spin" code="animation: lm-spin 1s linear infinite"><SpinRing/></PrimitiveCard>
          <PrimitiveCard title="Dots" tag="dot" code="3 dots · stagger 0.18s"><SpinDots/></PrimitiveCard>
          <PrimitiveCard title="Orb pulsante" tag="pulse" code="scale 1 → 1.06 · 1.4s"><SpinOrb/></PrimitiveCard>
          <PrimitiveCard title="Shimmer linha" tag="skeleton" code="bg-pos -200% → 200% · 1.6s"><SpinShimmer/></PrimitiveCard>
          <PrimitiveCard title="Progress determinado" tag="task" code="width % · ease-out 220ms"><ProgressDeterminate/></PrimitiveCard>
          <PrimitiveCard title="Progress indeterminado" tag="busy" code="translateX -100 → 100 · 1.6s"><ProgressIndeterminate/></PrimitiveCard>
        </div>

        {/* Voice */}
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase', margin: '12px 0' }}>Voz</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 32 }}>
          <PrimitiveCard title="Mic FAB · ouvindo" tag="primary" code="rings · scale loop 1.2s" accent><MicPulse/></PrimitiveCard>
          <PrimitiveCard title="Mic FAB · idle (glow)" tag="ready" code="box-shadow 0→12px · 2.4s"><GlowFAB/></PrimitiveCard>
          <PrimitiveCard title="Waveform ao vivo" tag="listening" code="18 barras · stagger 0.05s"><WaveListening/></PrimitiveCard>
          <PrimitiveCard title="Waveform gravado" tag="audio" code="static · pode reproduzir"><WaveStatic/></PrimitiveCard>
        </div>

        {/* Feedback */}
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase', margin: '12px 0' }}>Feedback</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 32 }}>
          <PrimitiveCard title="Toast · sucesso" tag="success" code="rise 16→0 · ease-out 500ms"><ToastSuccess/></PrimitiveCard>
          <PrimitiveCard title="Toast · undo" tag="action" code="auto-dismiss 5s · clearable"><ToastUndo/></PrimitiveCard>
          <PrimitiveCard title="Toast · erro" tag="error" code="haptic .notificationError"><ToastError/></PrimitiveCard>
          <PrimitiveCard title="Confetti burst" tag="celebrate" code="6 partículas · 1.8s ease-out"><ConfettiBurst/></PrimitiveCard>
        </div>

        {/* Navigation */}
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase', margin: '12px 0' }}>Navegação</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 32 }}>
          <PrimitiveCard title="Page transition" tag="route" code="swipe out + in · expo 520ms"><PageTransition/></PrimitiveCard>
          <PrimitiveCard title="Bottom sheet" tag="modal" code="translateY 100% → 0 · decel 360ms"><SheetRise/></PrimitiveCard>
          <PrimitiveCard title="Pull to refresh" tag="gesture" code="translateY interpolate · spring"><PullToRefresh/></PrimitiveCard>
          <PrimitiveCard title="Chips · filtro" tag="surface" code="hover bg 4% → 6% · 220ms"><ChipDemo/></PrimitiveCard>
        </div>

        {/* Buttons */}
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase', margin: '12px 0' }}>Botões · todos os estados</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 32 }}>
          <PrimitiveCard title="Botão primário · 5 estados" tag="primary" w={260} h={240} code="default · hover · pressed · loading · disabled"><BtnStates/></PrimitiveCard>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MotionPrimitives });
