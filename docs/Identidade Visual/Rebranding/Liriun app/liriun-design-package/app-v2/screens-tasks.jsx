// app-v2/screens-tasks.jsx — Tasks reimagined: collections, inside, detail

// ─── 7. Tasks · Collections (categories as visual covers) ──
function ScreenTaskCollections() {
  const cats = [
    { name: 'Trabalho',  c: T.catWork,    count: 12, done: 5,  cover: 'work' },
    { name: 'Saúde',     c: T.catHealth,  count: 5,  done: 3,  cover: 'health' },
    { name: 'Casa',      c: T.catHome,    count: 8,  done: 2,  cover: 'home' },
    { name: 'Pessoal',   c: T.catPerson,  count: 6,  done: 1,  cover: 'person' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 18px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>SUAS COLEÇÕES</div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5, color: T.text, marginTop: 4 }}>Tarefas</div>
        </div>
        <span style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{LIcon.search(14, T.muted)}</span>
      </div>

      {/* Search field */}
      <div style={{
        marginTop: 14, padding: '10px 12px', borderRadius: 12,
        background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {LIcon.search(13, T.faint)}
        <span style={{ fontSize: 12, color: T.faint, letterSpacing: -0.1 }}>Buscar por título ou pessoa...</span>
      </div>

      {/* Quick filters */}
      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        {[
          { l: 'Hoje', n: 4, active: true },
          { l: 'Semana', n: 12 },
          { l: 'Atrasadas', n: 1 },
          { l: 'Sem prazo', n: 8 },
        ].map((f, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 10px', borderRadius: 99,
            background: f.active ? 'rgba(168,139,255,0.10)' : 'rgba(255,255,255,0.035)',
            border: `1px solid ${f.active ? 'rgba(168,139,255,0.30)' : T.border}`,
            fontSize: 11, color: f.active ? T.violet300 : T.muted, fontWeight: 500, letterSpacing: -0.1,
          }}>
            {f.l}
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 0.3 }}>{f.n}</span>
          </span>
        ))}
      </div>

      {/* Collections grid */}
      <div style={{ marginTop: 18 }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, padding: '0 2px' }}>COLEÇÕES</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {cats.map((cat, i) => (
            <div key={i} style={{
              padding: 12, borderRadius: 14,
              background: `linear-gradient(160deg, ${cat.c}1A 0%, rgba(255,255,255,0.02) 70%)`,
              border: `1px solid ${cat.c}38`,
              position: 'relative', overflow: 'hidden', minHeight: 90,
            }}>
              {/* Cover shape */}
              <div style={{
                position: 'absolute', top: -16, right: -16,
                width: 60, height: 60, borderRadius: 99,
                background: cat.c, opacity: 0.18, filter: 'blur(4px)',
              }}/>
              {/* Cat dot */}
              <span style={{
                width: 9, height: 9, borderRadius: 99, background: cat.c,
                boxShadow: `0 0 10px ${cat.c}AA`,
                display: 'block', marginBottom: 18,
              }}/>
              {/* Name */}
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, letterSpacing: -0.2 }}>{cat.name}</div>
              {/* Progress */}
              <div style={{ marginTop: 8, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <div style={{ width: `${cat.done / cat.count * 100}%`, height: '100%', background: cat.c, opacity: 0.8 }}/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 0.3 }}>
                <span>{cat.done}/{cat.count}</span>
                <span>{Math.round(cat.done / cat.count * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart lists */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, padding: '0 2px' }}>LISTAS INTELIGENTES</div>
        <div style={{
          background: 'rgba(255,255,255,0.025)', border: `1px solid ${T.border}`,
          borderRadius: 12, overflow: 'hidden',
        }}>
          {[
            { ic: '★', l: 'Prioritárias', n: 3 },
            { ic: '◷', l: 'Agendadas hoje', n: 4 },
            { ic: '⊘', l: 'Sem categoria', n: 2 },
          ].map((r, i, a) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px',
              borderBottom: i < a.length - 1 ? `1px solid ${T.border}` : 'none',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 7,
                background: 'rgba(168,139,255,0.10)', color: T.violet300,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: T.mono, fontSize: 11,
              }}>{r.ic}</span>
              <span style={{ flex: 1, fontSize: 12, color: T.text, fontWeight: 500, letterSpacing: -0.1 }}>{r.l}</span>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 0.3 }}>{r.n}</span>
              {LIcon.chevR(11, T.dim)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 8. Tasks · Inside collection (Work, scrollable) ───────
function ScreenTaskInside() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 0 16px' }}>
      {/* Sticky header */}
      <div style={{ padding: '0 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          {LIcon.chevR(14, T.muted)}{/* used as back rotated */}
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 0.4 }}>VOLTAR</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${T.catWork}28`, border: `1px solid ${T.catWork}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px ${T.catWork}33`,
          }}>
            <span style={{ width: 12, height: 12, borderRadius: 99, background: T.catWork, boxShadow: `0 0 8px ${T.catWork}` }}/>
          </span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: T.text, letterSpacing: -0.5, lineHeight: 1 }}>Trabalho</div>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, marginTop: 4, letterSpacing: 0.4, textTransform: 'uppercase' }}>5 DE 12 · 42%</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 14, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ width: '42%', height: '100%', background: T.catWork, boxShadow: `0 0 12px ${T.catWork}88` }}/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 16, padding: '14px 18px 0', borderBottom: `1px solid ${T.border}`, marginTop: 6 }}>
        {[
          { l: 'Abertas', n: 7, active: true },
          { l: 'Concluídas', n: 5 },
          { l: 'Arquivadas', n: 0 },
        ].map((t, i) => (
          <div key={i} style={{
            padding: '0 0 10px', position: 'relative',
            fontSize: 12, fontWeight: 500, letterSpacing: -0.1,
            color: t.active ? T.text : T.faint,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            {t.l}
            <span style={{
              fontFamily: T.mono, fontSize: 9,
              color: t.active ? T.violet300 : T.faint,
              padding: '1px 5px', borderRadius: 4,
              background: t.active ? 'rgba(168,139,255,0.10)' : 'rgba(255,255,255,0.04)',
            }}>{t.n}</span>
            {t.active && <span style={{ position: 'absolute', bottom: -1, left: 0, right: 16, height: 2, background: T.grad, borderRadius: 99 }}/>}
          </div>
        ))}
      </div>

      {/* Task list grouped */}
      <div style={{ padding: '14px 18px 0', overflow: 'hidden' }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>HOJE · 2</div>
        {[
          { t: 'Reunião com Marina',     time: '13:00', prio: 'alta',  done: false, prep: true },
          { t: 'Revisar contrato Acme',  time: '15:30', prio: 'média', done: false },
        ].map((task, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 0', borderBottom: `1px solid ${T.border}`,
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: 99,
              border: `1.5px solid ${T.borderHi}`, flexShrink: 0, marginTop: 2,
            }}/>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, color: T.text, fontWeight: 500, letterSpacing: -0.1 }}>{task.t}</span>
                {task.prep && (
                  <span style={{
                    fontFamily: T.mono, fontSize: 8, color: T.violet300,
                    padding: '1px 5px', borderRadius: 4,
                    background: 'rgba(168,139,255,0.10)', border: '1px solid rgba(168,139,255,0.22)',
                    letterSpacing: 0.4,
                  }}>+15M PREP</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 0.3 }}>{task.time}</span>
                {task.prio === 'alta' && (
                  <span style={{
                    padding: '1px 5px', borderRadius: 4,
                    background: 'rgba(240,179,110,0.10)', border: '1px solid rgba(240,179,110,0.24)',
                    fontFamily: T.mono, fontSize: 8, color: '#F0B36E', letterSpacing: 0.4,
                  }}>ALTA</span>
                )}
              </div>
            </div>
          </div>
        ))}

        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase', margin: '16px 0 6px' }}>ESTA SEMANA · 5</div>
        {[
          'Apresentação ao board',
          'Onboard Pedro · novo dev',
          'Revisão de OKRs Q3',
          'One-on-one com a Marina',
          'Pipeline de vendas',
        ].map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0', borderBottom: i < 4 ? `1px solid ${T.border}` : 'none',
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: 99,
              border: `1.5px solid ${T.borderHi}`, flexShrink: 0,
            }}/>
            <span style={{ flex: 1, fontSize: 12, color: T.text, fontWeight: 500, letterSpacing: -0.1 }}>{t}</span>
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 0.3 }}>{['QUI', 'QUI', 'SEX', 'SEX', 'SÁB'][i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 9. Task detail (full-screen with hero) ────────────────
function ScreenTaskDetail() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, overflow: 'hidden' }}>
      {/* Hero gradient */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 220,
        background: `linear-gradient(180deg, ${T.catWork}24 0%, transparent 100%)`,
        pointerEvents: 'none',
      }}/>

      {/* Top bar */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '54px 16px 0' }}>
        <span style={{
          width: 36, height: 36, borderRadius: 99,
          background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
        </span>
        <span style={{
          width: 36, height: 36, borderRadius: 99,
          background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontWeight: 700, letterSpacing: 1, fontSize: 18,
        }}>···</span>
      </div>

      {/* Hero content */}
      <div style={{ position: 'relative', padding: '20px 18px 0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 7, background: `${T.catWork}1F`, border: `1px solid ${T.catWork}40` }}>
          <span style={{ width: 5, height: 5, borderRadius: 99, background: T.catWork }}/>
          <span style={{ fontSize: 10, color: T.catWork, fontWeight: 500, letterSpacing: -0.1 }}>Trabalho</span>
        </div>

        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.7, color: T.text, marginTop: 12, lineHeight: 1.1 }}>
          Reunião com Marina
        </div>

        <div style={{ fontSize: 12, color: T.muted, marginTop: 10, lineHeight: 1.55, letterSpacing: -0.1 }}>
          Alinhar entregáveis do Q3 e revisar handoff dos mockups novos. Levar o doc compartilhado.
        </div>
      </div>

      {/* Quick facts */}
      <div style={{ position: 'relative', padding: '16px 18px 0' }}>
        <div style={{
          background: 'rgba(255,255,255,0.025)', border: `1px solid ${T.border}`,
          borderRadius: 14, overflow: 'hidden',
        }}>
          {[
            { k: 'QUANDO', v: 'Amanhã · 09:00', vc: T.text },
            { k: 'DURAÇÃO', v: '60 min', vc: T.text },
            { k: 'COM', v: 'Marina Souza', vc: T.text, av: true },
            { k: 'LEMBRETE', v: '15 min antes', vc: T.muted },
            { k: 'PRIORIDADE', v: 'Alta', vc: '#F0B36E' },
          ].map((r, i, a) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 14px',
              borderBottom: i < a.length - 1 ? `1px solid ${T.border}` : 'none',
            }}>
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 0.5 }}>{r.k}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: r.vc, fontWeight: 500, letterSpacing: -0.1 }}>
                {r.av && (
                  <span style={{
                    width: 20, height: 20, borderRadius: 99,
                    background: 'linear-gradient(135deg, #B79CFF, #5B8DEF)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: T.font, fontSize: 9, color: '#fff', fontWeight: 700,
                  }}>M</span>
                )}
                {r.v}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Liriun's prep tip */}
      <div style={{ position: 'relative', padding: '14px 18px 0' }}>
        <div style={{
          padding: 12, borderRadius: 12,
          background: T.gradSoft, border: '1px solid rgba(168,139,255,0.22)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 99, background: T.grad, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{LIcon.sparkle(7, '#fff')}</span>
            <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 600, color: T.violet300, letterSpacing: 1, textTransform: 'uppercase' }}>LIRIUN LEMBRA</span>
          </div>
          <div style={{ fontSize: 11, color: T.text, fontWeight: 500, lineHeight: 1.45, letterSpacing: -0.1 }}>
            Última conversa com Marina foi há 3 dias, sobre o handoff de design. Quer ver?
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div style={{ position: 'absolute', bottom: 28, left: 18, right: 18, display: 'flex', gap: 8 }}>
        <button style={{
          flex: 2, height: 46, borderRadius: 13, border: 0,
          background: T.grad, color: '#fff',
          fontFamily: T.font, fontWeight: 600, fontSize: 13, letterSpacing: -0.1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          boxShadow: '0 8px 22px rgba(91,141,239,0.35), inset 0 1px 0 rgba(255,255,255,0.22)',
        }}>{LIcon.check(14, '#fff', 2.4)} Concluir</button>
        <button style={{
          width: 46, height: 46, borderRadius: 13,
          background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.borderHi}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T.muted,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4.5l5 5L8 21H3v-5L14.5 4.5z"/><path d="M13 6l5 5"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenTaskCollections, ScreenTaskInside, ScreenTaskDetail });
