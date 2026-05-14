// liriun-motion-cold-start.jsx — splash, 3 onboarding, permission

// ─── 1. Splash ─────────────────────────────────────────────
function ScreenSplash() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, overflow: 'hidden' }}>
      {/* Pulsing orb behind logo */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 280, height: 280, borderRadius: 99,
        background: 'radial-gradient(circle, rgba(168,139,255,0.32) 0%, rgba(91,141,239,0.08) 50%, transparent 75%)',
        animation: 'lm-orb-pulse 2.4s ease-in-out infinite',
        pointerEvents: 'none',
      }}/>
      {/* Centered mark + wordmark */}
      <div style={{
        position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%,-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
      }}>
        <div style={{ animation: 'lm-fade 0.6s ease-out both', filter: 'drop-shadow(0 12px 28px rgba(91,141,239,0.35))' }}>
          <LiriunMark size={96} animated/>
        </div>
        <div style={{
          fontSize: 28, fontWeight: 600, letterSpacing: -0.8, color: T.text,
          animation: 'lm-rise 0.7s 0.3s ease-out both',
        }}>Liriun</div>
      </div>
      {/* Subtle tagline + dots loader */}
      <div style={{
        position: 'absolute', bottom: 70, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        animation: 'lm-fade 0.6s 0.6s ease-out both',
      }}>
        <div style={{
          fontFamily: T.mono, fontSize: 10, fontWeight: 500, letterSpacing: 1.6,
          color: T.faint, textTransform: 'uppercase',
        }}>Carregando seu dia</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              width: 6, height: 6, borderRadius: 99, background: T.violet400,
              animation: `lm-dot 1.2s ease-in-out infinite ${i*0.16}s`,
            }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 2. Onboarding · "Diga, está feito" ────────────────────
function ScreenOnboard1() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '60px 22px 24px', display: 'flex', flexDirection: 'column' }}>
      {/* Page dots */}
      <div style={{ display: 'flex', gap: 6, alignSelf: 'center' }}>
        <span style={{ width: 22, height: 5, borderRadius: 99, background: T.grad }}/>
        <span style={{ width: 5, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.18)' }}/>
        <span style={{ width: 5, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.18)' }}/>
      </div>

      {/* Big animated mic illustration */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {/* Rings */}
        {[0, 0.4, 0.8].map((d, i) => (
          <div key={i} style={{
            position: 'absolute', width: 200, height: 200, borderRadius: 99,
            border: '1px solid rgba(168,139,255,0.30)',
            animation: `lm-pulse-ring 2.2s cubic-bezier(0.4,0,0.2,1) infinite ${d}s`,
          }}/>
        ))}
        <div style={{
          width: 124, height: 124, borderRadius: 99,
          background: T.grad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 24px 60px rgba(91,141,239,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
        }}>{LIcon.mic(48, '#fff', 1.8)}</div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 32, animation: 'lm-rise 0.6s ease-out both' }}>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.8, color: T.text, lineHeight: 1.1 }}>
          Diga.<br/>Está feito.
        </div>
        <div style={{ fontSize: 14, color: T.muted, marginTop: 14, lineHeight: 1.5, letterSpacing: -0.1 }}>
          Aperte uma vez no microfone e fale como você pensa.
          Liriun cria a tarefa no formato certo.
        </div>
      </div>

      <button style={{
        height: 50, width: '100%', borderRadius: 14, border: 0,
        background: T.grad, color: '#fff',
        fontFamily: T.font, fontWeight: 600, fontSize: 15, letterSpacing: -0.1,
        boxShadow: '0 8px 22px rgba(91,141,239,0.35), inset 0 1px 0 rgba(255,255,255,0.20)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        Continuar {LIcon.arrow(16, '#fff')}
      </button>
    </div>
  );
}

// ─── 3. Onboarding · "Liriun te entende" ────────────────────
function ScreenOnboard2() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '60px 22px 24px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 6, alignSelf: 'center' }}>
        <span style={{ width: 5, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.18)' }}/>
        <span style={{ width: 22, height: 5, borderRadius: 99, background: T.grad }}/>
        <span style={{ width: 5, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.18)' }}/>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
        {/* User bubble */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', animation: 'lm-rise 0.6s ease-out both' }}>
          <div style={{
            maxWidth: '82%', padding: '11px 14px',
            background: T.grad, color: '#fff',
            borderRadius: '18px 18px 6px 18px',
            fontSize: 13, fontWeight: 500, letterSpacing: -0.1, lineHeight: 1.4,
            boxShadow: '0 8px 22px rgba(91,141,239,0.28)',
          }}>
            "Reunião com a Marina amanhã às 9, prioridade alta"
          </div>
        </div>

        {/* Card materializing */}
        <div style={{
          marginTop: 6,
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${T.borderHi}`,
          borderRadius: 16, padding: 14,
          animation: 'lm-rise 0.7s 0.3s ease-out both',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Shimmer */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent, rgba(168,139,255,0.10) 50%, transparent)',
            backgroundSize: '200% 100%',
            animation: 'lm-shimmer 2s linear infinite',
          }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ width: 14, height: 14, borderRadius: 99, background: T.grad, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{LIcon.sparkle(9, '#fff')}</span>
            <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 500, letterSpacing: 1.2, color: T.faint, textTransform: 'uppercase' }}>Extraído</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text, letterSpacing: -0.2, lineHeight: 1.3 }}>
            Reunião com a Marina
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {[
              ['Quando',     'Amanhã, 09:00'],
              ['Pessoa',     'Marina'],
              ['Prioridade', 'Alta'],
            ].map(([k, v], i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 11, animation: `lm-rise-soft 0.4s ${0.6 + i*0.15}s ease-out both`,
              }}>
                <span style={{ fontFamily: T.mono, color: T.faint, letterSpacing: 0.4, textTransform: 'uppercase' }}>{k}</span>
                <span style={{ color: T.text, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.6, color: T.text, lineHeight: 1.15 }}>
          Liriun te entende.
        </div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 10, lineHeight: 1.5, letterSpacing: -0.1 }}>
          Datas, pessoas, prioridade — tudo extraído no formato certo.
        </div>
      </div>

      <button style={{
        height: 50, width: '100%', borderRadius: 14, border: 0,
        background: T.grad, color: '#fff',
        fontFamily: T.font, fontWeight: 600, fontSize: 15,
        boxShadow: '0 8px 22px rgba(91,141,239,0.35), inset 0 1px 0 rgba(255,255,255,0.20)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>Continuar {LIcon.arrow(16, '#fff')}</button>
    </div>
  );
}

// ─── 4. Onboarding · "Em qualquer lugar" ───────────────────
function ScreenOnboard3() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '60px 22px 24px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 6, alignSelf: 'center' }}>
        <span style={{ width: 5, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.18)' }}/>
        <span style={{ width: 5, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.18)' }}/>
        <span style={{ width: 22, height: 5, borderRadius: 99, background: T.grad }}/>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {/* Orbit */}
        <div style={{ position: 'relative', width: 200, height: 200 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 99,
            border: '1px dashed rgba(168,139,255,0.20)',
            animation: 'lm-rotate-slow 24s linear infinite',
          }}/>
          {/* Center mark */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            filter: 'drop-shadow(0 12px 28px rgba(91,141,239,0.4))',
          }}>
            <LiriunMark size={56}/>
          </div>
          {/* Devices */}
          {[
            { label: 'iOS',     emoji: '', top: -8,  left: '50%', tx: '-50%', sub: 0 },
            { label: 'Android', top: '50%', right: -8, sub: 1 },
            { label: 'Web',     bottom: -8, left: '50%', tx: '-50%', sub: 2 },
            { label: 'Watch',   top: '50%', left: -8,  sub: 3 },
          ].map((d, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: d.top, left: d.left, right: d.right, bottom: d.bottom,
              transform: d.tx ? `translateX(${d.tx})` : (d.top === '50%' ? 'translateY(-50%)' : 'none'),
              width: 56, height: 56, borderRadius: 14,
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${T.borderHi}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.mono, fontSize: 9, fontWeight: 500, color: T.muted,
              letterSpacing: 0.4, textTransform: 'uppercase',
              animation: `lm-rise-soft 0.5s ${0.2 + i*0.1}s ease-out both, lm-orb 4s ease-in-out infinite ${i*0.5}s`,
            }}>
              {/* dot indicator */}
              <span style={{ width: 6, height: 6, borderRadius: 99, background: T.violet400, marginBottom: 4 }}/>
              {d.label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.7, color: T.text, lineHeight: 1.1 }}>
          Em qualquer lugar.
        </div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 10, lineHeight: 1.5, letterSpacing: -0.1 }}>
          Sincronia em tempo real entre iOS, Android, watch e web.
        </div>
      </div>

      <button style={{
        height: 50, width: '100%', borderRadius: 14, border: 0,
        background: T.grad, color: '#fff',
        fontFamily: T.font, fontWeight: 600, fontSize: 15,
        boxShadow: '0 8px 22px rgba(91,141,239,0.35), inset 0 1px 0 rgba(255,255,255,0.20)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>Começar {LIcon.arrow(16, '#fff')}</button>
    </div>
  );
}

// ─── 5. Permission · Mic access ────────────────────────────
function ScreenPermission() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '60px 22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
        {/* Icon */}
        <div style={{
          width: 88, height: 88, borderRadius: 26,
          background: 'rgba(168,139,255,0.10)',
          border: '1px solid rgba(168,139,255,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'lm-rise 0.6s ease-out both',
        }}>{LIcon.mic(40, T.violet300, 1.6)}</div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, color: T.text, lineHeight: 1.2 }}>
            Permita o microfone
          </div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 10, lineHeight: 1.5, letterSpacing: -0.1, maxWidth: 220 }}>
            Liriun precisa do mic só quando você apertar o botão.
            Áudio nunca é gravado em background.
          </div>
        </div>

        {/* Privacy chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          {[
            ['Transcrito no dispositivo', 'Sem upload de áudio.'],
            ['Você controla cada gravação', 'Aperte pra falar. Solte pra parar.'],
          ].map(([t, d], i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${T.border}`, borderRadius: 12,
              animation: `lm-rise-soft 0.5s ${0.3 + i*0.1}s ease-out both`,
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: 99,
                background: 'rgba(123,215,176,0.18)', border: '1px solid rgba(123,215,176,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
              }}>{LIcon.check(10, '#7BD7B0', 2.4)}</span>
              <div>
                <div style={{ fontSize: 12, color: T.text, fontWeight: 500, letterSpacing: -0.1 }}>{t}</div>
                <div style={{ fontSize: 11, color: T.faint, marginTop: 2, lineHeight: 1.4 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button style={{
          height: 48, width: '100%', borderRadius: 14, border: 0,
          background: T.grad, color: '#fff',
          fontFamily: T.font, fontWeight: 600, fontSize: 14,
          boxShadow: '0 8px 22px rgba(91,141,239,0.35), inset 0 1px 0 rgba(255,255,255,0.20)',
        }}>Permitir acesso ao mic</button>
        <button style={{
          height: 44, width: '100%', borderRadius: 14,
          background: 'transparent', border: 0,
          color: T.faint, fontFamily: T.font, fontWeight: 500, fontSize: 13,
        }}>Agora não</button>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenSplash, ScreenOnboard1, ScreenOnboard2, ScreenOnboard3, ScreenPermission });
