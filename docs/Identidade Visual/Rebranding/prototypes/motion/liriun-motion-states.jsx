// liriun-motion-states.jsx — skeleton loading, empty states, error states

// ─── 10. Skeleton list loading ─────────────────────────────
function ScreenSkeleton() {
  const SkelLine = ({ w, h = 12, delay = 0 }) => (
    <div style={{
      width: w, height: h, borderRadius: 6,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.05) 100%)',
      backgroundSize: '200% 100%',
      animation: `lm-shimmer 1.8s linear infinite ${delay}s`,
    }}/>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 22px 24px' }}>
      <div style={{ marginTop: 8 }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>Quinta · 9:41</div>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.6, color: T.text, marginTop: 6, lineHeight: 1.1 }}>
          Tarefas
        </div>
      </div>

      {/* Filter chips skeleton */}
      <div style={{ display: 'flex', gap: 6, marginTop: 20 }}>
        {[58, 78, 70, 64].map((w, i) => (
          <SkelLine key={i} w={w} h={26} delay={i * 0.08}/>
        ))}
      </div>

      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 8 }}>
        <SkelLine w={42} h={9} delay={0}/>
        <div style={{ flex: 1, height: 1, background: T.border }}/>
      </div>

      {/* Task rows skeleton */}
      {[0, 0.12, 0.24, 0.36, 0.48].map((d, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 0', borderBottom: i < 4 ? `1px solid ${T.border}` : 'none',
          opacity: Math.max(0.3, 1 - i * 0.12),
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: 99,
            border: `1.5px solid rgba(255,255,255,0.10)`,
            flexShrink: 0,
          }}/>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <SkelLine w={(150 - i * 12) + 'px'} h={11} delay={d}/>
            <div style={{ display: 'flex', gap: 8 }}>
              <SkelLine w="48px" h={8} delay={d + 0.1}/>
              <SkelLine w="36px" h={8} delay={d + 0.15}/>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 11. Empty · Today (no tasks) ──────────────────────────
function ScreenEmptyToday() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 22px 24px', display: 'flex', flexDirection: 'column' }}>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>Hoje · 9:41</div>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.6, color: T.text, marginTop: 6, lineHeight: 1.1 }}>Tarefas</div>
      </div>

      {/* Empty illustration: orbit with checkmark */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'relative', width: 180, height: 180 }}>
          {/* Soft orb */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 99,
            background: 'radial-gradient(circle, rgba(123,215,176,0.18) 0%, transparent 65%)',
            animation: 'lm-orb-pulse 3s ease-in-out infinite',
          }}/>
          {/* Dashed orbit */}
          <div style={{
            position: 'absolute', inset: 18, borderRadius: 99,
            border: '1px dashed rgba(255,255,255,0.12)',
            animation: 'lm-rotate-slow 30s linear infinite',
          }}/>
          {/* Tiny orbiting dot */}
          <div style={{
            position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
            width: 8, height: 8, borderRadius: 99, background: T.violet400,
            boxShadow: '0 0 12px rgba(168,139,255,0.6)',
            animation: 'lm-rotate-slow 30s linear infinite',
            transformOrigin: '50% 76px',
          }}/>
          {/* Check center */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 64, height: 64, borderRadius: 99,
            background: 'rgba(123,215,176,0.10)',
            border: '1.5px solid rgba(123,215,176,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{LIcon.check(28, '#7BD7B0', 2)}</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: T.text, letterSpacing: -0.5, lineHeight: 1.2 }}>
          Tudo limpo hoje.
        </div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 10, lineHeight: 1.5, letterSpacing: -0.1, maxWidth: 220, margin: '10px auto 0' }}>
          Aproveite. Ou fale com Liriun pra programar algo pra amanhã.
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 99,
          background: T.grad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 14px 30px rgba(91,141,239,0.32)',
        }}>{LIcon.mic(24, '#fff', 1.8)}</div>
      </div>
    </div>
  );
}

// ─── 12. Empty · Inbox ─────────────────────────────────────
function ScreenEmptyInbox() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 22px 24px', display: 'flex', flexDirection: 'column' }}>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>Caixa de entrada</div>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.6, color: T.text, marginTop: 6, lineHeight: 1.1 }}>Inbox</div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 160, height: 140 }}>
          {/* Stacked cards */}
          {[2, 1, 0].map(i => (
            <div key={i} style={{
              position: 'absolute',
              top: 22 - i * 8, left: 18 + i * 8, right: 18 - i * 8,
              height: 70 - i * 6,
              borderRadius: 14,
              background: i === 0 ? 'rgba(168,139,255,0.10)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${i === 0 ? 'rgba(168,139,255,0.28)' : T.border}`,
              transform: `rotate(${(i - 1) * 4}deg)`,
              transformOrigin: 'center',
              animation: `lm-rise-soft 0.6s ${i * 0.1}s ease-out both`,
            }}>
              {i === 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', height: '100%',
                }}>{LIcon.inbox(28, T.violet300)}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: T.text, letterSpacing: -0.4, lineHeight: 1.2 }}>
          Inbox vazia.
        </div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 8, lineHeight: 1.5, letterSpacing: -0.1, maxWidth: 220, margin: '8px auto 0' }}>
          Tudo já foi categorizado. Itens novos que Liriun não classifica aparecem aqui.
        </div>
      </div>
    </div>
  );
}

// ─── 13. Empty · Search (no query yet) ─────────────────────
function ScreenSearchIdle() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 16px 24px' }}>
      {/* Search field */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', borderRadius: 14,
        background: 'rgba(255,255,255,0.05)',
        border: `1.5px solid rgba(168,139,255,0.32)`,
        boxShadow: '0 0 0 4px rgba(168,139,255,0.10)',
      }}>
        {LIcon.search(16, T.violet300)}
        <span style={{ fontSize: 14, color: T.text, fontWeight: 500, flex: 1 }}>
          dent
          <span style={{
            display: 'inline-block', width: 2, height: 14, background: T.violet400,
            marginLeft: 2, verticalAlign: 'middle',
            animation: 'lm-dot 1s ease-in-out infinite',
          }}/>
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 0.4, padding: '3px 7px', border: `1px solid ${T.border}`, borderRadius: 6 }}>esc</span>
      </div>

      {/* Recent searches */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Recentes</div>
        {['marina', 'dentista', 'aniversário João', 'mercado'].map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 4px', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none',
            animation: `lm-rise-soft 0.4s ${i * 0.06}s ease-out both`,
          }}>
            <span style={{ color: T.faint, display: 'flex' }}>{LIcon.clock(14, T.faint)}</span>
            <span style={{ flex: 1, fontSize: 13, color: T.text, letterSpacing: -0.1 }}>{s}</span>
            {LIcon.chevR(11, T.dim)}
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Filtros rápidos</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            ['Trabalho', T.catWork],
            ['Saúde', T.catHealth],
            ['Casa', T.catHome],
            ['Esta semana', null],
            ['Atrasadas', null],
          ].map(([l, c], i) => (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 10px', borderRadius: 99,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${T.border}`,
              fontSize: 11, color: T.muted, fontWeight: 500, letterSpacing: -0.1,
              animation: `lm-rise-soft 0.4s ${0.3 + i * 0.05}s ease-out both`,
            }}>
              {c && <span style={{ width: 5, height: 5, borderRadius: 99, background: c }}/>}
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 14. Error · Offline / sync ────────────────────────────
function ScreenOffline() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 22px 24px', display: 'flex', flexDirection: 'column' }}>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>Hoje</div>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.6, color: T.text, marginTop: 6, lineHeight: 1.1 }}>Tarefas</div>
      </div>

      {/* Offline banner */}
      <div style={{
        marginTop: 18,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 14px', borderRadius: 12,
        background: 'rgba(240,179,110,0.08)',
        border: '1px solid rgba(240,179,110,0.28)',
        animation: 'lm-rise 0.5s ease-out both',
      }}>
        <span style={{
          width: 22, height: 22, borderRadius: 99,
          background: 'rgba(240,179,110,0.16)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{LIcon.cloudOff(13, '#F0B36E')}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#F0B36E', fontWeight: 500, letterSpacing: -0.1 }}>Sem conexão</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Tudo salvo. Sincroniza quando voltar.</div>
        </div>
      </div>

      {/* Tasks (still functional) */}
      <div style={{ marginTop: 18 }}>
        {[
          { title: 'Ligar pra dentista', meta: 'SAÚDE · 14:00', sync: 'PENDENTE' },
          { title: 'Revisar contrato', meta: 'TRABALHO · 16:00', sync: 'SYNCED' },
          { title: 'Comprar café', meta: 'CASA', sync: 'PENDENTE' },
        ].map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 0', borderBottom: i < 2 ? `1px solid ${T.border}` : 'none',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 99,
              border: `1.5px solid ${T.borderHi}`,
              flexShrink: 0,
            }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: T.text, fontWeight: 500, letterSpacing: -0.1 }}>{t.title}</div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, marginTop: 3, letterSpacing: 0.3 }}>{t.meta}</div>
            </div>
            {t.sync === 'PENDENTE' && (
              <span style={{
                fontFamily: T.mono, fontSize: 9, padding: '3px 7px', borderRadius: 99,
                background: 'rgba(240,179,110,0.10)', border: '1px solid rgba(240,179,110,0.28)',
                color: '#F0B36E', letterSpacing: 0.4,
              }}>PEND</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }}/>

      {/* Retry button */}
      <button style={{
        height: 44, borderRadius: 12, border: `1px solid ${T.borderHi}`,
        background: 'rgba(255,255,255,0.04)', color: T.text,
        fontFamily: T.font, fontWeight: 500, fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginBottom: 16,
      }}>
        <span style={{ display: 'inline-flex', animation: 'lm-spin 1.4s linear infinite' }}>{LIcon.refresh(14, T.muted)}</span>
        Tentando reconectar
      </button>
    </div>
  );
}

Object.assign(window, { ScreenSkeleton, ScreenEmptyToday, ScreenEmptyInbox, ScreenSearchIdle, ScreenOffline });
