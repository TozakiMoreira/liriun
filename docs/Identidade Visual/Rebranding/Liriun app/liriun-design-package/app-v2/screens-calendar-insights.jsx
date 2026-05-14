// app-v2/screens-calendar-insights.jsx — calendar month + day + year heat + narrative insights

// ─── 10. Calendar · Month with density heat ────────────────
function ScreenCalendarMonth() {
  // Build 5-row month grid with varied density
  const days = [
    // week 1
    [{d:'',e:0},{d:'',e:0},{d:'',e:0},{d:1,e:1},{d:2,e:2},{d:3,e:0},{d:4,e:1}],
    // week 2
    [{d:5,e:3},{d:6,e:4},{d:7,e:2},{d:8,e:1},{d:9,e:3},{d:10,e:0},{d:11,e:2}],
    // week 3 — today is 13
    [{d:12,e:4},{d:13,e:3,today:true},{d:14,e:2},{d:15,e:1},{d:16,e:3},{d:17,e:0},{d:18,e:1}],
    [{d:19,e:2},{d:20,e:4},{d:21,e:3},{d:22,e:1},{d:23,e:0},{d:24,e:0},{d:25,e:1}],
    [{d:26,e:2},{d:27,e:3},{d:28,e:1},{d:29,e:0},{d:30,e:1},{d:'',e:0},{d:'',e:0}],
  ];

  const heat = (e) => {
    if (e === 0) return 'rgba(255,255,255,0.02)';
    if (e === 1) return 'rgba(168,139,255,0.12)';
    if (e === 2) return 'rgba(168,139,255,0.22)';
    if (e === 3) return 'rgba(168,139,255,0.36)';
    return 'rgba(168,139,255,0.52)';
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 16px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>MAIO 2026</div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, color: T.text, marginTop: 4 }}>Mês</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['M','S','A'].map((l, i) => (
            <span key={i} style={{
              width: 28, height: 28, borderRadius: 8,
              background: l === 'M' ? 'rgba(168,139,255,0.14)' : 'rgba(255,255,255,0.04)',
              border: l === 'M' ? '1px solid rgba(168,139,255,0.32)' : `1px solid ${T.border}`,
              color: l === 'M' ? T.violet300 : T.muted,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: 0.4,
            }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{
        marginTop: 14, padding: 12, borderRadius: 12,
        background: 'rgba(255,255,255,0.025)', border: `1px solid ${T.border}`,
        display: 'flex', gap: 0,
      }}>
        {[
          ['52', 'TAREFAS'],
          ['38', 'CONCLUÍDAS'],
          ['73%', 'FOCO'],
          ['12d', 'STREAK'],
        ].map(([n, l], i) => (
          <div key={i} style={{
            flex: 1, paddingLeft: i ? 10 : 0, paddingRight: i < 3 ? 10 : 0,
            borderLeft: i ? `1px solid ${T.border}` : 'none',
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.text, letterSpacing: -0.3, lineHeight: 1 }}>{n}</div>
            <div style={{ fontFamily: T.mono, fontSize: 8, color: T.faint, marginTop: 3, letterSpacing: 0.4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Weekday labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginTop: 18, marginBottom: 6 }}>
        {['D','S','T','Q','Q','S','S'].map((l, i) => (
          <div key={i} style={{
            fontFamily: T.mono, fontSize: 9, color: T.faint,
            textAlign: 'center', letterSpacing: 0.4,
          }}>{l}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {days.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {row.map((d, ci) => (
              <div key={ci} style={{
                aspectRatio: '1', borderRadius: 7,
                background: d.today ? T.grad : heat(d.e),
                border: d.today ? 'none' : `1px solid ${d.e ? 'rgba(168,139,255,0.10)' : T.border}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative',
                boxShadow: d.today ? '0 6px 14px rgba(91,141,239,0.32)' : 'none',
              }}>
                {d.d !== '' && (
                  <>
                    <span style={{
                      fontSize: 11, fontWeight: d.today ? 700 : 500,
                      color: d.today ? '#fff' : (d.e ? T.text : T.faint),
                      letterSpacing: -0.1,
                    }}>{d.d}</span>
                    {d.e > 0 && !d.today && (
                      <span style={{
                        fontFamily: T.mono, fontSize: 7,
                        color: 'rgba(168,139,255,0.85)',
                        marginTop: 1, letterSpacing: 0.2,
                      }}>{d.e}</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Heat legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 0.4 }}>
        <span>DENSIDADE</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>MENOS</span>
          {[1,2,3,4].map(i => (
            <span key={i} style={{ width: 12, height: 12, borderRadius: 3, background: heat(i) }}/>
          ))}
          <span>MAIS</span>
        </div>
      </div>

      {/* Today preview */}
      <div style={{
        marginTop: 14, padding: 12, borderRadius: 12,
        background: T.gradSoft, border: '1px solid rgba(168,139,255,0.22)',
      }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 600, color: T.violet300, letterSpacing: 1.2, textTransform: 'uppercase' }}>QUA 13 · 3 TAREFAS</div>
        <div style={{ fontSize: 12, color: T.text, fontWeight: 500, marginTop: 6, letterSpacing: -0.1 }}>09:00 Marina · 13:00 Acme · 17:30 Buscar Lucas Jr</div>
      </div>
    </div>
  );
}

// ─── 11. Calendar · Day timeline (single day deep) ─────────
function ScreenCalendarDay() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 16px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>QUARTA · 13 MAI · HOJE</div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, color: T.text, marginTop: 4 }}>Seu dia</div>
        </div>
        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.violet300, letterSpacing: 0.4 }}>83% LIVRE</span>
      </div>

      {/* Hour-by-hour timeline */}
      <div style={{ marginTop: 16, position: 'relative', paddingLeft: 36 }}>
        {/* Vertical track */}
        <div style={{ position: 'absolute', top: 8, bottom: 8, left: 28, width: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1 }}/>

        {[
          { time: '08:00', free: true },
          { time: '09:00', event: { title: 'Daily standup', cat: T.catWork, dur: '15 min', done: true } },
          { time: '10:00', free: true, suggest: 'Reportar trimestre' },
          { time: '12:00', event: { title: 'Almoço · Pedro', cat: T.catPerson, dur: '60 min' } },
          { time: '13:00', event: { title: 'Reunião · Marina', cat: T.catWork, dur: '60 min', current: true, prio: 'alta' } },
          { time: '15:00', free: true },
          { time: '17:30', event: { title: 'Buscar Lucas Jr', cat: T.catPerson, dur: '30 min' } },
          { time: '19:00', free: true, suggest: 'Yoga' },
        ].map((slot, i) => (
          <div key={i} style={{ position: 'relative', paddingBottom: 14 }}>
            {/* Time */}
            <div style={{ position: 'absolute', left: -32, top: 0, fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 0.4 }}>{slot.time}</div>
            {/* Dot or event */}
            {slot.event ? (
              <>
                <div style={{
                  position: 'absolute', left: -10, top: 4,
                  width: 10, height: 10, borderRadius: 99, background: slot.event.cat,
                  boxShadow: slot.event.current ? `0 0 0 4px ${slot.event.cat}30, 0 0 12px ${slot.event.cat}` : `0 0 6px ${slot.event.cat}66`,
                }}/>
                <div style={{
                  padding: 10, borderRadius: 11,
                  background: slot.event.current ? `${slot.event.cat}1F` : 'rgba(255,255,255,0.035)',
                  border: `1px solid ${slot.event.current ? `${slot.event.cat}50` : T.border}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      fontSize: 12, color: slot.event.done ? T.faint : T.text, fontWeight: 500,
                      textDecoration: slot.event.done ? 'line-through' : 'none', letterSpacing: -0.1,
                    }}>{slot.event.title}</div>
                    {slot.event.prio === 'alta' && (
                      <span style={{
                        padding: '1px 5px', borderRadius: 4,
                        background: 'rgba(240,179,110,0.10)', border: '1px solid rgba(240,179,110,0.28)',
                        fontFamily: T.mono, fontSize: 8, color: '#F0B36E', letterSpacing: 0.4,
                      }}>ALTA</span>
                    )}
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, marginTop: 4, letterSpacing: 0.3 }}>
                    {slot.event.dur}{slot.event.current ? ' · AGORA' : ''}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{
                  position: 'absolute', left: -7, top: 6,
                  width: 4, height: 4, borderRadius: 99, background: T.dim,
                }}/>
                <div style={{
                  padding: '6px 0', fontSize: 11, color: T.faint, letterSpacing: -0.1,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 0.4, textTransform: 'uppercase' }}>LIVRE</span>
                  {slot.suggest && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 8px', borderRadius: 99,
                      background: 'rgba(168,139,255,0.06)', border: '1px solid rgba(168,139,255,0.20)',
                      fontSize: 10, color: T.violet300, fontWeight: 500,
                    }}>
                      {LIcon.sparkle(9, T.violet300)} {slot.suggest}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 12. Insights · narrative + year heat ──────────────────
function ScreenInsights() {
  // Year heat (12 cols × 7 rows simplified to a single horizontal strip of 52 weeks)
  const weeks = Array.from({ length: 52 }, (_, i) => {
    const cycle = Math.sin(i * 0.4) * 0.5 + 0.5;
    const stretch = i > 30 && i < 45 ? 0.4 : 0;
    return Math.max(0, Math.min(4, Math.round(cycle * 3 + stretch + (i % 7 === 0 ? -1 : 0))));
  });
  const heat = (e) => {
    if (e === 0) return 'rgba(255,255,255,0.04)';
    if (e === 1) return 'rgba(168,139,255,0.18)';
    if (e === 2) return 'rgba(168,139,255,0.32)';
    if (e === 3) return 'rgba(168,139,255,0.50)';
    return 'rgba(168,139,255,0.72)';
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 18px 16px' }}>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>SUA JORNADA · 2026</div>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, color: T.text, marginTop: 4, lineHeight: 1.1 }}>
          Constância,<br/>
          <span style={{ backgroundImage: T.grad, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>não perfeição.</span>
        </div>
      </div>

      {/* Year heat */}
      <div style={{
        marginTop: 18, padding: 14, borderRadius: 14,
        background: 'rgba(255,255,255,0.025)', border: `1px solid ${T.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase' }}>52 SEMANAS</span>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.violet300, letterSpacing: 0.4 }}>184 CONCLUÍDAS</span>
        </div>
        {/* Heat strip */}
        <div style={{ display: 'flex', gap: 2 }}>
          {weeks.map((e, i) => (
            <div key={i} style={{
              flex: 1, height: 22, borderRadius: 2,
              background: heat(e),
              border: '1px solid rgba(168,139,255,0.06)',
            }}/>
          ))}
        </div>
        {/* Month labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: T.mono, fontSize: 8, color: T.faint, letterSpacing: 0.4 }}>
          <span>JAN</span><span>ABR</span><span>JUL</span><span>OUT</span><span>DEZ</span>
        </div>
      </div>

      {/* Narrative insights */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>LIRIUN APRENDEU</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { ic: '◷', l: 'Você é mais produtivo às terças', d: '4× mais conclusões que outros dias.' },
            { ic: '☾', l: 'Costuma planejar domingo à noite', d: 'Maioria das tarefas criadas entre 21h–23h.' },
            { ic: '↗', l: 'Saúde cresceu 40% este mês', d: 'Maior salto. Continua assim.' },
            { ic: '✱', l: 'Voz preferida pra captura', d: '78% das tarefas criadas falando.' },
          ].map((insight, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: 12, borderRadius: 12,
              background: 'rgba(255,255,255,0.025)', border: `1px solid ${T.border}`,
            }}>
              <span style={{
                width: 26, height: 26, borderRadius: 8,
                background: 'rgba(168,139,255,0.10)', color: T.violet300,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: T.mono, fontSize: 14, flexShrink: 0,
              }}>{insight.ic}</span>
              <div>
                <div style={{ fontSize: 12, color: T.text, fontWeight: 500, letterSpacing: -0.1, lineHeight: 1.3 }}>{insight.l}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 3, lineHeight: 1.4 }}>{insight.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak card */}
      <div style={{
        marginTop: 14, padding: 14, borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(240,179,110,0.10), rgba(168,139,255,0.06))',
        border: '1px solid rgba(240,179,110,0.24)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 99,
          background: 'linear-gradient(135deg, #F0B36E, #A88BFF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(240,179,110,0.35)',
        }}>{LIcon.flame(22, '#fff')}</div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 600, color: T.text, letterSpacing: -0.5, lineHeight: 1 }}>12 dias</div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: '#F0B36E', marginTop: 4, letterSpacing: 0.4, textTransform: 'uppercase' }}>STREAK ATUAL · RECORDE 18d</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenCalendarMonth, ScreenCalendarDay, ScreenInsights });
