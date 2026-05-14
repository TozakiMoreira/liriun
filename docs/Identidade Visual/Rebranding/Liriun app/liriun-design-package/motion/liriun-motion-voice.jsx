// liriun-motion-voice.jsx — voice loop: idle, listening, processing, success moment

// ─── 6. Idle home (ready, calm) ─────────────────────────────
function ScreenIdle() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 22px 24px', display: 'flex', flexDirection: 'column' }}>
      {/* Greeting */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>Quinta · 9:41</div>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.6, color: T.text, marginTop: 6, lineHeight: 1.1 }}>
          Bom dia,<br/>
          <span style={{ color: T.violet300 }}>Pedro.</span>
        </div>
      </div>

      {/* Quick suggestions */}
      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase' }}>Sugestões</div>
        {[
          { label: 'Pagar conta do cartão', meta: 'até sexta' },
          { label: 'Yoga · sessão de 30min', meta: 'hoje à noite' },
        ].map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 13px', borderRadius: 12,
            background: 'rgba(255,255,255,0.035)',
            border: `1px solid ${T.border}`,
          }}>
            <div>
              <div style={{ fontSize: 12, color: T.text, fontWeight: 500, letterSpacing: -0.1 }}>{s.label}</div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, marginTop: 2, letterSpacing: 0.3 }}>{s.meta.toUpperCase()}</div>
            </div>
            {LIcon.chevR(11, T.faint)}
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }}/>

      {/* Listening hint */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
        marginBottom: 14, fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 1, textTransform: 'uppercase',
      }}>
        <span>Aperte e fale</span>
      </div>

      {/* Mic FAB (idle — calm, no halo) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 99,
          background: T.grad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 14px 30px rgba(91,141,239,0.32), inset 0 1px 0 rgba(255,255,255,0.20)',
          animation: 'lm-glow 2.4s ease-out infinite',
        }}>{LIcon.mic(28, '#fff', 1.8)}</div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '8px 0', borderTop: `1px solid ${T.border}`,
      }}>
        {[LIcon.list(20, T.text), LIcon.cal(18, T.faint), LIcon.inbox(18, T.faint), LIcon.user(18, T.faint)].map((i, k) => (
          <div key={k} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i}</div>
        ))}
      </div>
    </div>
  );
}

// ─── 7. Listening (giant pulsing mic + waveform) ───────────
function ScreenListening() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0A0C12', overflow: 'hidden' }}>
      {/* Dark gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(80% 60% at 50% 50%, rgba(168,139,255,0.20), transparent 70%)',
      }}/>

      {/* Top label */}
      <div style={{
        position: 'absolute', top: 54, left: 0, right: 0, textAlign: 'center',
        animation: 'lm-fade 0.5s ease-out both',
      }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.violet300, letterSpacing: 1.6, textTransform: 'uppercase' }}>Ouvindo</div>
        <div style={{ fontSize: 18, color: T.text, fontWeight: 500, marginTop: 8, letterSpacing: -0.2 }}>
          "Reunião com a Marina<br/>amanhã às 9..."
        </div>
      </div>

      {/* Center: pulsing rings + mic */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {[0, 0.5, 1].map((d, i) => (
          <div key={i} style={{
            position: 'absolute', width: 180, height: 180, borderRadius: 99,
            border: '1.5px solid rgba(168,139,255,0.4)',
            animation: `lm-pulse-ring 2s cubic-bezier(0.4,0,0.2,1) infinite ${d}s`,
          }}/>
        ))}
        <div style={{
          width: 120, height: 120, borderRadius: 99,
          background: T.grad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 30px 80px rgba(168,139,255,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
          animation: 'lm-pulse-scale 1.4s ease-in-out infinite',
        }}>{LIcon.mic(48, '#fff', 1.8)}</div>
      </div>

      {/* Waveform bar */}
      <div style={{
        position: 'absolute', bottom: 110, left: 22, right: 22,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 56,
      }}>
        {Array.from({ length: 32 }).map((_, i) => (
          <span key={i} style={{
            display: 'inline-block', width: 3, height: 28,
            background: T.violet300, borderRadius: 2,
            transformOrigin: 'center',
            animation: `lm-bar-listen ${0.7 + (i % 4) * 0.12}s ease-in-out infinite ${(i * 0.04) % 0.6}s`,
            opacity: 0.85,
          }}/>
        ))}
      </div>

      {/* Cancel */}
      <div style={{
        position: 'absolute', bottom: 38, left: 0, right: 0, display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          padding: '10px 18px', borderRadius: 99,
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${T.borderHi}`,
          color: T.muted, fontSize: 12, fontWeight: 500, letterSpacing: -0.1,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {LIcon.x(13, T.muted)} Toque pra cancelar
        </div>
      </div>
    </div>
  );
}

// ─── 8. Processing (entendendo...) ─────────────────────────
function ScreenProcessing() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '60px 22px 24px' }}>
      {/* Shimmer mark */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: T.grad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.30) 50%, transparent)',
            backgroundSize: '200% 100%',
            animation: 'lm-shimmer 1.4s linear infinite',
          }}/>
          {LIcon.sparkle(24, '#fff')}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: T.text, letterSpacing: -0.5 }}>
          Entendendo
          <span style={{ display: 'inline-flex', gap: 3, marginLeft: 6, verticalAlign: 'baseline' }}>
            {[0,1,2].map(i => <span key={i} style={{
              width: 4, height: 4, borderRadius: 99, background: T.violet400,
              animation: `lm-dot 1.4s ease-in-out infinite ${i * 0.16}s`,
            }}/>)}
          </span>
        </div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 8, letterSpacing: -0.1 }}>
          Liriun está extraindo o que importa
        </div>
      </div>

      {/* Skeleton card hint */}
      <div style={{
        marginTop: 32, padding: 16, borderRadius: 16,
        background: 'rgba(255,255,255,0.035)',
        border: `1px solid ${T.border}`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg, transparent, rgba(168,139,255,0.10) 50%, transparent)',
          backgroundSize: '200% 100%',
          animation: 'lm-shimmer 1.6s linear infinite',
        }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <span style={{ width: 12, height: 12, borderRadius: 99, background: T.grad }}/>
          <span style={{ height: 9, width: 60, borderRadius: 99, background: 'rgba(255,255,255,0.08)' }}/>
        </div>
        <div style={{ height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.08)', marginBottom: 8 }}/>
        <div style={{ height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.06)', width: '60%' }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <span style={{ height: 9, width: 50, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}/>
          <span style={{ height: 9, width: 70, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}/>
        </div>
      </div>

      {/* Voice transcript pills emerging */}
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase' }}>Identificando</div>
        {[
          ['Pessoa', 'Marina', 0],
          ['Quando', 'Amanhã 09:00', 0.25],
          ['Prioridade', 'Alta', 0.5],
        ].map(([k, v, d], i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '9px 12px', borderRadius: 10,
            background: 'rgba(168,139,255,0.06)',
            border: '1px solid rgba(168,139,255,0.16)',
            animation: `lm-rise-soft 0.4s ${d}s ease-out both`,
            fontSize: 11,
          }}>
            <span style={{ fontFamily: T.mono, color: T.faint, letterSpacing: 0.3, textTransform: 'uppercase' }}>{k}</span>
            <span style={{ color: T.text, fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 9. Saved moment (confetti + checkmark draw) ───────────
function ScreenSavedMoment() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, overflow: 'hidden' }}>
      {/* Soft glow */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 280, height: 280, borderRadius: 99,
        background: 'radial-gradient(circle, rgba(123,215,176,0.20), transparent 70%)',
      }}/>

      {/* Confetti */}
      <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', width: 0, height: 0 }}>
        {[
          { c: '#A88BFF', a: 1 }, { c: '#5B8DEF', a: 2 }, { c: '#7BD7B0', a: 3 },
          { c: '#F0B36E', a: 4 }, { c: '#C8A0FF', a: 5 }, { c: '#7AA9FF', a: 6 },
          { c: '#A88BFF', a: 1 }, { c: '#7BD7B0', a: 2 }, { c: '#F0B36E', a: 3 },
        ].map((p, i) => (
          <span key={i} style={{
            position: 'absolute',
            width: i % 2 === 0 ? 8 : 6,
            height: i % 3 === 0 ? 10 : 6,
            background: p.c, borderRadius: i % 4 === 0 ? 99 : 2,
            animation: `lm-confetti-${p.a} 1.6s cubic-bezier(0.2,0.7,0.3,1) ${i * 0.04}s infinite both`,
            transform: 'translate(-50%,-50%)',
          }}/>
        ))}
      </div>

      {/* Checkmark circle */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 88, height: 88, borderRadius: 99,
        background: 'rgba(123,215,176,0.12)',
        border: '1.5px solid rgba(123,215,176,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'lm-streak 0.5s cubic-bezier(0.2,0.7,0.3,1) both',
      }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#7BD7B0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5 l4.5 4.5 L19 7.5" strokeDasharray="60" style={{ animation: 'lm-mark-stroke 0.55s 0.25s ease-out both' }}/>
        </svg>
      </div>

      <div style={{
        position: 'absolute', top: '60%', left: 0, right: 0, textAlign: 'center', padding: '0 32px',
        animation: 'lm-rise 0.5s 0.4s ease-out both',
      }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: T.text, letterSpacing: -0.5 }}>Pronto.</div>
        <div style={{ fontSize: 14, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
          Reunião com a Marina<br/>salva pra amanhã às 9.
        </div>
      </div>

      {/* Bottom actions */}
      <div style={{ position: 'absolute', bottom: 28, left: 22, right: 22, display: 'flex', gap: 8 }}>
        <button style={{
          flex: 1, height: 44, borderRadius: 12, border: 0,
          background: 'rgba(255,255,255,0.06)', color: T.text,
          fontFamily: T.font, fontWeight: 500, fontSize: 13,
          border: `1px solid ${T.borderHi}`,
        }}>Ver tarefa</button>
        <button style={{
          flex: 1, height: 44, borderRadius: 12, border: 0,
          background: T.grad, color: '#fff',
          fontFamily: T.font, fontWeight: 600, fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: '0 6px 16px rgba(91,141,239,0.32)',
        }}>{LIcon.mic(14, '#fff')} Mais uma</button>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenIdle, ScreenListening, ScreenProcessing, ScreenSavedMoment });
