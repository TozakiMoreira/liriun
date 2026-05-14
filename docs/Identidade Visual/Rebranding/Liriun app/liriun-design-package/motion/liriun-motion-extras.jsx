// liriun-motion-extras.jsx — achievement, calendar, search results, settings

// ─── 15. Achievement · Streak ──────────────────────────────
function ScreenAchievement() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, overflow: 'hidden' }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 320, height: 320, borderRadius: 99,
        background: 'radial-gradient(circle, rgba(240,179,110,0.18), transparent 65%)',
        animation: 'lm-orb-pulse 3s ease-in-out infinite',
      }}/>

      {/* Close */}
      <div style={{ position: 'absolute', top: 50, right: 18 }}>
        <span style={{
          width: 32, height: 32, borderRadius: 99,
          background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{LIcon.x(13, T.muted)}</span>
      </div>

      {/* Badge */}
      <div style={{
        position: 'absolute', top: '34%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 130, height: 130,
        animation: 'lm-streak 0.7s cubic-bezier(0.2,0.7,0.3,1) both',
      }}>
        {/* Hex/rosette */}
        <svg viewBox="0 0 130 130" style={{ display: 'block', filter: 'drop-shadow(0 16px 30px rgba(240,179,110,0.4))' }}>
          <defs>
            <linearGradient id="streak-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F0B36E"/>
              <stop offset="1" stopColor="#A88BFF"/>
            </linearGradient>
          </defs>
          {/* Star rosette */}
          <g transform="translate(65,65)">
            <g style={{ animation: 'lm-rotate-slow 24s linear infinite', transformOrigin: 'center' }}>
              <path d="M 0 -55 L 8 -8 L 55 0 L 8 8 L 0 55 L -8 8 L -55 0 L -8 -8 Z" fill="url(#streak-grad)" opacity="0.18"/>
              <path d="M 0 -42 L 6 -6 L 42 0 L 6 6 L 0 42 L -6 6 L -42 0 L -6 -6 Z" fill="url(#streak-grad)" opacity="0.32"/>
            </g>
            <circle r="32" fill="url(#streak-grad)"/>
            <g transform="translate(-12,-13)">
              <path d="M 12 0 C 13 4 17 6 17 11 C 17 14 14 17 12 17 C 10 17 7 14 7 11 C 7 10 8 9 9 8 C 10.5 7 11.5 5 12 0 Z" fill="#fff"/>
            </g>
          </g>
        </svg>

        {/* Confetti */}
        {[1,2,3,4,5,6].map(i => (
          <span key={i} style={{
            position: 'absolute', top: '50%', left: '50%',
            width: i % 2 === 0 ? 6 : 4, height: i % 2 === 0 ? 6 : 4,
            background: ['#A88BFF', '#F0B36E', '#7BD7B0', '#5B8DEF'][i % 4],
            borderRadius: i % 3 === 0 ? 99 : 1,
            animation: `lm-confetti-${i} 1.8s 0.4s cubic-bezier(0.2,0.7,0.3,1) infinite both`,
          }}/>
        ))}
      </div>

      {/* Title block */}
      <div style={{
        position: 'absolute', top: '60%', left: 0, right: 0, textAlign: 'center', padding: '0 32px',
        animation: 'lm-rise 0.6s 0.4s ease-out both',
      }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: '#F0B36E', letterSpacing: 1.6, textTransform: 'uppercase' }}>Conquista desbloqueada</div>
        <div style={{ fontSize: 28, fontWeight: 600, color: T.text, letterSpacing: -0.8, marginTop: 10, lineHeight: 1.1 }}>
          7 dias seguidos.
        </div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 10, lineHeight: 1.5, letterSpacing: -0.1 }}>
          Você organizou sua semana inteira por voz.
          Continua assim.
        </div>
      </div>

      {/* Stats */}
      <div style={{
        position: 'absolute', bottom: 100, left: 22, right: 22,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
        animation: 'lm-rise 0.5s 0.6s ease-out both',
      }}>
        {[['42', 'TAREFAS'], ['18', 'CONCLUÍDAS'], ['7 d', 'STREAK']].map(([n, l], i) => (
          <div key={i} style={{
            padding: 12, borderRadius: 12,
            background: 'rgba(255,255,255,0.035)',
            border: `1px solid ${T.border}`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: T.text, letterSpacing: -0.4 }}>{n}</div>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, marginTop: 4, letterSpacing: 0.5 }}>{l}</div>
          </div>
        ))}
      </div>

      <button style={{
        position: 'absolute', bottom: 26, left: 22, right: 22,
        height: 44, borderRadius: 12, border: 0,
        background: T.grad, color: '#fff',
        fontFamily: T.font, fontWeight: 600, fontSize: 13,
        boxShadow: '0 8px 22px rgba(91,141,239,0.35)',
      }}>Compartilhar</button>
    </div>
  );
}

// ─── 16. Calendar · Week view ──────────────────────────────
function ScreenCalendar() {
  const days = [
    { d: 'SEG', n: 6, items: 2 },
    { d: 'TER', n: 7, items: 3 },
    { d: 'QUA', n: 8, items: 1 },
    { d: 'QUI', n: 9, items: 4, today: true },
    { d: 'SEX', n: 10, items: 2 },
    { d: 'SÁB', n: 11, items: 0 },
    { d: 'DOM', n: 12, items: 0 },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 16px 24px' }}>
      <div style={{ padding: '0 6px' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>Maio 2026</div>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.5, color: T.text, marginTop: 4 }}>Semana</div>
      </div>

      {/* Week strip */}
      <div style={{ display: 'flex', gap: 6, marginTop: 18, justifyContent: 'space-between' }}>
        {days.map((d, i) => (
          <div key={i} style={{
            flex: 1,
            padding: '8px 0', borderRadius: 12,
            background: d.today ? T.grad : 'rgba(255,255,255,0.03)',
            border: `1px solid ${d.today ? 'transparent' : T.border}`,
            textAlign: 'center',
            boxShadow: d.today ? '0 6px 18px rgba(91,141,239,0.30), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none',
          }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, color: d.today ? 'rgba(255,255,255,0.85)' : T.faint, letterSpacing: 0.4 }}>{d.d}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: d.today ? '#fff' : T.text, marginTop: 4 }}>{d.n}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 5, minHeight: 4 }}>
              {Array.from({ length: Math.min(d.items, 3) }).map((_, k) => (
                <span key={k} style={{
                  width: 3, height: 3, borderRadius: 99,
                  background: d.today ? '#fff' : T.violet400,
                  opacity: 0.9,
                }}/>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Today schedule */}
      <div style={{ marginTop: 22, padding: '0 6px' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Quinta · 4 tarefas</div>
        <div style={{ position: 'relative', paddingLeft: 44 }}>
          {/* Timeline line */}
          <div style={{ position: 'absolute', top: 6, bottom: 6, left: 34, width: 1, background: T.border }}/>
          {[
            { time: '09:00', title: 'Reunião com Marina', cat: T.catWork, dur: 60, current: false },
            { time: '11:30', title: 'Yoga · 30 min', cat: T.catHealth, dur: 30, current: true },
            { time: '14:00', title: 'Revisar contrato', cat: T.catWork, dur: 90, current: false },
            { time: '17:00', title: 'Buscar João', cat: T.catPerson, dur: 30, current: false },
          ].map((e, i) => (
            <div key={i} style={{ position: 'relative', paddingBottom: 12, animation: `lm-rise-soft 0.4s ${i * 0.06}s ease-out both` }}>
              {/* Time label */}
              <div style={{ position: 'absolute', left: -42, top: 0, fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 0.3 }}>{e.time}</div>
              {/* Dot */}
              <div style={{
                position: 'absolute', left: -14, top: 4,
                width: 9, height: 9, borderRadius: 99, background: e.cat,
                boxShadow: e.current ? `0 0 0 4px rgba(123,215,176,0.15)` : 'none',
              }}/>
              {/* Card */}
              <div style={{
                padding: '8px 11px', borderRadius: 10,
                background: e.current ? 'rgba(123,215,176,0.08)' : 'rgba(255,255,255,0.035)',
                border: `1px solid ${e.current ? 'rgba(123,215,176,0.30)' : T.border}`,
              }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: T.text, letterSpacing: -0.1 }}>{e.title}</div>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.faint, marginTop: 2, letterSpacing: 0.3 }}>{e.dur} MIN</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 17. Search · Results ──────────────────────────────────
function ScreenSearchResults() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 16px 24px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 14px', borderRadius: 14,
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${T.borderHi}`,
      }}>
        {LIcon.search(15, T.muted)}
        <span style={{ fontSize: 13, color: T.text, fontWeight: 500, flex: 1 }}>marina</span>
        <span style={{
          fontFamily: T.mono, fontSize: 9, padding: '2px 6px', borderRadius: 5,
          background: 'rgba(168,139,255,0.10)', border: '1px solid rgba(168,139,255,0.22)',
          color: T.violet300, letterSpacing: 0.4,
        }}>3</span>
      </div>

      {/* Sections */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, padding: '0 4px' }}>Tarefas · 2</div>
        {[
          { title: 'Reunião com Marina', meta: 'AMANHÃ · 09:00', cat: T.catWork, done: false },
          { title: 'Devolver livro pra Marina', meta: 'SEXTA', cat: T.catPerson, done: true },
        ].map((r, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 4px', borderBottom: `1px solid ${T.border}`,
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: 99,
              background: r.done ? T.grad : 'transparent',
              border: r.done ? 0 : `1.5px solid ${T.borderHi}`,
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{r.done && LIcon.check(11, '#fff', 2.5)}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: r.done ? T.faint : T.text, fontWeight: 500, letterSpacing: -0.1, textDecoration: r.done ? 'line-through' : 'none' }}>
                Reunião com <mark style={{ background: 'rgba(168,139,255,0.30)', color: T.text, borderRadius: 3, padding: '0 2px' }}>Marina</mark>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: 99, background: r.cat }}/>
                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 0.3 }}>{r.meta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, padding: '0 4px' }}>Notas · 1</div>
        <div style={{
          padding: 12, borderRadius: 10,
          background: 'rgba(255,255,255,0.035)',
          border: `1px solid ${T.border}`,
        }}>
          <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5, letterSpacing: -0.1 }}>
            ...combinei com a <mark style={{ background: 'rgba(168,139,255,0.30)', color: T.text, borderRadius: 3, padding: '0 2px' }}>Marina</mark> de revisar o handoff antes da sprint começar.
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, marginTop: 8, letterSpacing: 0.3 }}>HÁ 2 DIAS</div>
        </div>
      </div>
    </div>
  );
}

// ─── 18. Settings / Profile ────────────────────────────────
function ScreenSettings() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 16px 24px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px' }}>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.5, color: T.text }}>Ajustes</div>
        {LIcon.gear(20, T.muted)}
      </div>

      {/* Profile card */}
      <div style={{
        marginTop: 18, padding: 16, borderRadius: 16,
        background: T.gradSoft, border: '1px solid rgba(168,139,255,0.25)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 99,
          background: T.grad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 18, color: '#fff',
          boxShadow: '0 6px 16px rgba(91,141,239,0.32)',
        }}>P</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.text, letterSpacing: -0.2 }}>Pedro Almeida</div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 2, letterSpacing: 0.3 }}>PEDRO@LIRIUN.APP · PRO</div>
        </div>
        {LIcon.chevR(13, T.muted)}
      </div>

      {/* Settings groups */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, padding: '0 6px' }}>Preferências</div>
        <div style={{
          background: 'rgba(255,255,255,0.035)',
          border: `1px solid ${T.border}`,
          borderRadius: 14, overflow: 'hidden',
        }}>
          {[
            { ic: LIcon.mic(15, T.violet300), l: 'Voz', v: 'pt-BR' },
            { ic: LIcon.bell(15, T.violet300), l: 'Notificações', v: 'Inteligentes' },
            { ic: LIcon.cal(15, T.violet300), l: 'Calendários', v: '3 conectados' },
          ].map((r, i, a) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              borderBottom: i < a.length - 1 ? `1px solid ${T.border}` : 'none',
            }}>
              <span style={{
                width: 26, height: 26, borderRadius: 8,
                background: 'rgba(168,139,255,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{r.ic}</span>
              <span style={{ flex: 1, fontSize: 13, color: T.text, fontWeight: 500, letterSpacing: -0.1 }}>{r.l}</span>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 0.3 }}>{r.v}</span>
              {LIcon.chevR(12, T.dim)}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, padding: '0 6px' }}>Privacidade</div>
        <div style={{
          background: 'rgba(255,255,255,0.035)',
          border: `1px solid ${T.border}`,
          borderRadius: 14, overflow: 'hidden',
        }}>
          {[
            { l: 'Transcrição no dispositivo', on: true },
            { l: 'Compartilhar uso anônimo', on: false },
          ].map((r, i, a) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px',
              borderBottom: i < a.length - 1 ? `1px solid ${T.border}` : 'none',
            }}>
              <span style={{ flex: 1, fontSize: 13, color: T.text, fontWeight: 500, letterSpacing: -0.1 }}>{r.l}</span>
              <span style={{
                width: 38, height: 22, borderRadius: 99,
                background: r.on ? T.grad : 'rgba(255,255,255,0.10)',
                padding: 2, position: 'relative',
                boxShadow: r.on ? '0 3px 10px rgba(91,141,239,0.32)' : 'none',
              }}>
                <span style={{
                  display: 'block', width: 18, height: 18, borderRadius: 99,
                  background: '#fff',
                  transform: r.on ? 'translateX(16px)' : 'translateX(0)',
                  transition: 'transform 200ms cubic-bezier(0.4,0,0.2,1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                }}/>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenAchievement, ScreenCalendar, ScreenSearchResults, ScreenSettings });
