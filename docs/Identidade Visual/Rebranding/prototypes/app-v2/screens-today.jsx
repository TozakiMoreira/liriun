// app-v2/screens-today.jsx — reimagined Today as narrative, not stats cards

// ─── 1. Today · Morning (the new hero) ─────────────────────
function ScreenTodayMorning() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 18px 16px', overflow: 'hidden' }}>
      {/* Greeting */}
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>QUARTA · 09:14 · ENSOLARADO</div>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.6, color: T.text, marginTop: 6, lineHeight: 1.05 }}>
          Bom dia,<br/>
          <span style={{ color: T.violet300 }}>Lucas.</span>
        </div>
      </div>

      {/* Day-shape — horizontal timeline visualization */}
      <div style={{ marginTop: 18, padding: '14px 12px', borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 0.6, textTransform: 'uppercase' }}>O DIA</div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.violet300, letterSpacing: 0.4 }}>4 MOMENTOS</div>
        </div>
        {/* Timeline */}
        <div style={{ position: 'relative', height: 32, marginTop: 4 }}>
          {/* Track */}
          <div style={{ position: 'absolute', top: 14, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }}/>
          {/* "Now" marker */}
          <div style={{ position: 'absolute', top: 9, left: '24%', width: 12, height: 12, borderRadius: 99, background: '#fff', boxShadow: '0 0 0 4px rgba(255,255,255,0.10)' }}/>
          {/* Events */}
          {[
            { x: '12%', c: T.catWork,    h: 14 },
            { x: '36%', c: T.catWork,    h: 18 },
            { x: '58%', c: T.catPerson,  h: 12 },
            { x: '82%', c: T.catHealth,  h: 16 },
          ].map((e, i) => (
            <div key={i} style={{
              position: 'absolute', left: e.x, top: 15 - e.h / 2,
              width: 4, height: e.h, borderRadius: 2, background: e.c,
              boxShadow: `0 0 8px ${e.c}66`,
            }}/>
          ))}
          {/* Hour labels */}
          {[
            { x: '0%', l: '06' },
            { x: '24%', l: '12' },
            { x: '50%', l: '15' },
            { x: '75%', l: '18' },
            { x: '100%', l: '22' },
          ].map((h, i) => (
            <span key={i} style={{
              position: 'absolute', top: 22, left: h.x, transform: 'translateX(-50%)',
              fontFamily: T.mono, fontSize: 8, color: T.faint, letterSpacing: 0.4,
            }}>{h.l}</span>
          ))}
        </div>
      </div>

      {/* Liriun's take — context-aware suggestion */}
      <div style={{
        marginTop: 14, padding: 14, borderRadius: 14,
        background: T.gradSoft, border: '1px solid rgba(168,139,255,0.28)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ width: 16, height: 16, borderRadius: 99, background: T.grad, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{LIcon.sparkle(10, '#fff')}</span>
          <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 600, color: T.violet300, letterSpacing: 1.4, textTransform: 'uppercase' }}>Liriun sugere</span>
        </div>
        <div style={{ fontSize: 13, color: T.text, fontWeight: 500, lineHeight: 1.45, letterSpacing: -0.1 }}>
          Você tem 2 horas livres antes da reunião com Marina.
          Que tal o relatório do trimestre?
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <button style={{
            padding: '6px 11px', borderRadius: 9, border: 0,
            background: T.grad, color: '#fff',
            fontSize: 11, fontWeight: 600, letterSpacing: -0.1,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>{LIcon.check(11, '#fff', 2.4)} Começar agora</button>
          <button style={{
            padding: '6px 11px', borderRadius: 9,
            background: 'rgba(255,255,255,0.06)', color: T.muted, border: `1px solid ${T.border}`,
            fontSize: 11, fontWeight: 500, letterSpacing: -0.1,
          }}>Mais tarde</button>
        </div>
      </div>

      {/* Next up — featured task */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase' }}>A SEGUIR · em 3h 46m</span>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.violet300, letterSpacing: 0.4 }}>VER TUDO</span>
        </div>
        <div style={{
          padding: 12, borderRadius: 12,
          background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.borderHi}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: -0.2 }}>Reunião com Marina</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, fontSize: 10, color: T.muted }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 99, background: T.catWork }}/>Trabalho
                </span>
                <span style={{ fontFamily: T.mono, color: T.faint }}>13:00 · 60MIN</span>
              </div>
            </div>
            <span style={{
              padding: '3px 7px', borderRadius: 6,
              background: 'rgba(240,179,110,0.10)', border: '1px solid rgba(240,179,110,0.28)',
              fontFamily: T.mono, fontSize: 9, color: '#F0B36E', letterSpacing: 0.4,
            }}>ALTA</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}/>

      {/* Mic floating */}
      <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)' }}>
        <div style={{
          width: 60, height: 60, borderRadius: 99,
          background: T.grad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 14px 30px rgba(91,141,239,0.40), inset 0 1px 0 rgba(255,255,255,0.22)',
          animation: 'lm-glow 2.4s ease-out infinite',
        }}>{LIcon.mic(24, '#fff', 1.8)}</div>
      </div>
    </div>
  );
}

// ─── 2. Today · Midday (status check) ──────────────────────
function ScreenTodayMidday() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 18px 16px' }}>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>QUARTA · 14:42</div>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, color: T.text, marginTop: 6, lineHeight: 1.1 }}>
          Metade do dia.<br/>
          <span style={{
            backgroundImage: T.grad, WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent', color: 'transparent',
          }}>3 concluídas, 2 abertas.</span>
        </div>
      </div>

      {/* Progress ring */}
      <div style={{
        marginTop: 22, padding: 18, borderRadius: 16,
        background: 'rgba(255,255,255,0.025)', border: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 18,
      }}>
        <svg width="84" height="84" viewBox="0 0 84 84">
          <defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="84" y2="84">
              <stop offset="0" stopColor="#A88BFF"/>
              <stop offset="1" stopColor="#5B8DEF"/>
            </linearGradient>
          </defs>
          <circle cx="42" cy="42" r="34" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none"/>
          <circle cx="42" cy="42" r="34"
            stroke="url(#ring-grad)" strokeWidth="6" fill="none"
            strokeDasharray="213.6" strokeDashoffset="85.4"
            strokeLinecap="round"
            transform="rotate(-90 42 42)"/>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 600, color: T.text, letterSpacing: -0.8 }}>60</span>
            <span style={{ fontSize: 14, color: T.muted, fontWeight: 500 }}>%</span>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, marginTop: 4, letterSpacing: 0.4, textTransform: 'uppercase' }}>3 DE 5 · NO RITMO</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 6, lineHeight: 1.4 }}>+18% em relação à média de quartas</div>
        </div>
      </div>

      {/* Remaining */}
      <div style={{ marginTop: 18 }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>RESTAM · 2 TAREFAS</div>
        {[
          { title: 'Revisar contrato Acme', cat: T.catWork, time: '15:30', dur: '45 MIN' },
          { title: 'Buscar Lucas Jr na escola', cat: T.catPerson, time: '17:30', dur: '30 MIN' },
        ].map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 0', borderBottom: i < 1 ? `1px solid ${T.border}` : 'none',
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: 99,
              border: `1.5px solid ${T.borderHi}`, flexShrink: 0,
            }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: T.text, fontWeight: 500, letterSpacing: -0.1 }}>{t.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: 99, background: t.cat }}/>
                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 0.3 }}>{t.time} · {t.dur}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Already done */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase' }}>FEITO · 3</span>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: '#7BD7B0', letterSpacing: 0.4 }}>+3 STREAK</span>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {['Daily standup', 'Email triagem', 'Café com Pedro'].map((t, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 9px', borderRadius: 8,
              background: 'rgba(123,215,176,0.06)',
              border: '1px solid rgba(123,215,176,0.18)',
              fontSize: 10, color: 'rgba(123,215,176,0.85)', fontWeight: 500, letterSpacing: -0.1,
            }}>
              {LIcon.check(9, '#7BD7B0', 2.4)}
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 3. Today · Evening (reflection) ───────────────────────
function ScreenTodayEvening() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0E0F18 0%, #0B0D14 100%)', padding: '54px 18px 16px', overflow: 'hidden' }}>
      {/* Sky glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 220,
        background: 'radial-gradient(80% 100% at 80% 0%, rgba(240,179,110,0.14), transparent 70%)',
        pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative' }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>QUARTA · 21:48 · BOA NOITE</div>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, color: T.text, marginTop: 6, lineHeight: 1.15 }}>
          Você fechou 5 de 6.<br/>
          <span style={{ color: '#F0B36E' }}>Não foi mal.</span>
        </div>
      </div>

      {/* Day stamp visualization */}
      <div style={{
        marginTop: 22, padding: 16, borderRadius: 16,
        background: 'rgba(255,255,255,0.025)', border: `1px solid ${T.border}`,
      }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>SUA QUARTA · STAMP</div>
        {/* 6 dots showing the day */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { c: T.catWork, done: true },
            { c: T.catWork, done: true },
            { c: T.catPerson, done: true },
            { c: T.catWork, done: true },
            { c: T.catPerson, done: true },
            { c: T.catHealth, done: false },
          ].map((d, i) => (
            <div key={i} style={{
              flex: 1, height: 36, borderRadius: 6,
              background: d.done ? d.c : 'rgba(255,255,255,0.05)',
              boxShadow: d.done ? `0 0 12px ${d.c}55` : 'none',
              opacity: d.done ? 0.95 : 0.4,
            }}/>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 0.4 }}>
          <span>83% concluído</span>
          <span style={{ color: '#7BD7B0' }}>STREAK +1 · 8 DIAS</span>
        </div>
      </div>

      {/* What didn't happen — soft, not punishing */}
      <div style={{
        marginTop: 16, padding: 14, borderRadius: 14,
        background: 'rgba(240,179,110,0.06)', border: '1px solid rgba(240,179,110,0.18)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: '#F0B36E' }}/>
          <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 600, color: '#F0B36E', letterSpacing: 1.2, textTransform: 'uppercase' }}>FICOU PRA DEPOIS</span>
        </div>
        <div style={{ fontSize: 12, color: T.text, fontWeight: 500, letterSpacing: -0.1 }}>Yoga · 30 min</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: 0, background: 'rgba(255,255,255,0.06)', color: T.text, fontSize: 11, fontWeight: 500, letterSpacing: -0.1, border: `1px solid ${T.border}` }}>Reagendar amanhã</button>
          <button style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: 0, background: 'transparent', color: T.faint, fontSize: 11, fontWeight: 500, letterSpacing: -0.1, border: `1px solid ${T.border}` }}>Arquivar</button>
        </div>
      </div>

      {/* Tomorrow brief */}
      <div style={{ marginTop: 16, padding: '0 4px' }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>AMANHÃ · 3 COMPROMISSOS</div>
        <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
          Quinta começa às <span style={{ color: T.text, fontWeight: 500 }}>09:00</span> com a apresentação.
          Termina com a corrida das <span style={{ color: T.text, fontWeight: 500 }}>19:00</span>. 
          Você tem 4h livres entre 14 e 18.
        </div>
      </div>

      <div style={{ flex: 1 }}/>

      <div style={{ position: 'absolute', bottom: 24, left: 18, right: 18, display: 'flex', gap: 8 }}>
        <button style={{
          flex: 1, height: 42, borderRadius: 12, border: `1px solid ${T.borderHi}`,
          background: 'rgba(255,255,255,0.04)', color: T.text,
          fontFamily: T.font, fontWeight: 500, fontSize: 12, letterSpacing: -0.1,
        }}>Ver semana</button>
        <button style={{
          flex: 1, height: 42, borderRadius: 12, border: 0,
          background: T.grad, color: '#fff',
          fontFamily: T.font, fontWeight: 600, fontSize: 12, letterSpacing: -0.1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: '0 6px 16px rgba(91,141,239,0.32)',
        }}>{LIcon.mic(13, '#fff')} Planejar amanhã</button>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenTodayMorning, ScreenTodayMidday, ScreenTodayEvening });
