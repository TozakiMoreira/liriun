// app-v2/screens-voice.jsx — premium voice flow: listening + real-time extraction + saved with card

// ─── 4. Voice · Listening (immersive, full-screen) ─────────
function ScreenVoiceListening() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0A0C12', overflow: 'hidden' }}>
      {/* Sky glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(80% 60% at 50% 50%, rgba(168,139,255,0.20), transparent 70%)',
      }}/>
      {/* Live transcription pill on top */}
      <div style={{
        position: 'absolute', top: 54, left: 18, right: 18,
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 11px', borderRadius: 99,
          background: 'rgba(168,139,255,0.10)', border: '1px solid rgba(168,139,255,0.30)',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 99, background: '#ff5b6b',
            animation: 'lm-pulse-scale 1.4s ease-in-out infinite',
          }}/>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.violet300, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 600 }}>OUVINDO · 0:04</span>
        </div>
      </div>

      {/* Transcribed text — appears word by word */}
      <div style={{
        position: 'absolute', top: 110, left: 22, right: 22, textAlign: 'center',
      }}>
        <div style={{ fontSize: 17, color: T.text, fontWeight: 500, lineHeight: 1.4, letterSpacing: -0.2 }}>
          "Marca uma reunião com a <span style={{ color: T.violet300, fontWeight: 600 }}>Marina</span> <span style={{ color: T.violet300, fontWeight: 600 }}>amanhã às 9</span>,
          <span style={{ color: T.faint }}> prioridade...</span>
          <span style={{ display: 'inline-block', width: 2, height: 16, background: T.violet400, marginLeft: 3, verticalAlign: 'middle', animation: 'lm-dot 1s ease-in-out infinite' }}/>"
        </div>
      </div>

      {/* Big mic with rings */}
      <div style={{
        position: 'absolute', top: '52%', left: '50%', transform: 'translate(-50%,-50%)',
      }}>
        {[0, 0.5, 1].map((d, i) => (
          <div key={i} style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 180, height: 180, borderRadius: 99,
            border: '1.5px solid rgba(168,139,255,0.36)',
            animation: `lm-pulse-ring 2s cubic-bezier(0.4,0,0.2,1) infinite ${d}s`,
          }}/>
        ))}
        <div style={{
          width: 132, height: 132, borderRadius: 99,
          background: T.grad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 30px 80px rgba(168,139,255,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
          animation: 'lm-pulse-scale 1.4s ease-in-out infinite',
        }}>{LIcon.mic(54, '#fff', 1.6)}</div>
      </div>

      {/* Waveform */}
      <div style={{
        position: 'absolute', bottom: 134, left: 22, right: 22,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 56,
      }}>
        {Array.from({ length: 32 }).map((_, i) => (
          <span key={i} style={{
            display: 'inline-block', width: 3, height: 28,
            background: T.violet300, borderRadius: 2,
            transformOrigin: 'center', transformBox: 'fill-box',
            animation: `lm-bar-listen ${0.7 + (i % 4) * 0.12}s ease-in-out infinite ${(i * 0.04) % 0.6}s`,
            opacity: 0.85,
          }}/>
        ))}
      </div>

      {/* Helper text */}
      <div style={{
        position: 'absolute', bottom: 92, left: 0, right: 0, textAlign: 'center',
      }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.4, textTransform: 'uppercase' }}>SOLTE PRA PARAR</div>
      </div>

      {/* Cancel */}
      <div style={{
        position: 'absolute', bottom: 36, left: 0, right: 0, display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          padding: '10px 16px', borderRadius: 99,
          background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.borderHi}`,
          color: T.muted, fontSize: 11, fontWeight: 500, letterSpacing: -0.1,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>{LIcon.x(12, T.muted)} Toque pra cancelar</div>
      </div>
    </div>
  );
}

// ─── 5. Voice · Processing (real-time extraction) ──────────
function ScreenVoiceProcessing() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 18px 16px' }}>
      {/* Top with shimmer mark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: T.grad, position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.30) 50%, transparent)',
            backgroundSize: '200% 100%',
            animation: 'lm-shimmer 1.4s linear infinite',
          }}/>
          {LIcon.sparkle(14, '#fff')}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text, letterSpacing: -0.2 }}>
            Entendendo
            <span style={{ display: 'inline-flex', gap: 3, marginLeft: 6 }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 3, height: 3, borderRadius: 99, background: T.violet400, animation: `lm-dot 1.4s ease-in-out infinite ${i * 0.16}s` }}/>)}
            </span>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, marginTop: 2, letterSpacing: 0.4, textTransform: 'uppercase' }}>0.7S DE ÁUDIO</div>
        </div>
      </div>

      {/* Transcript with highlights */}
      <div style={{
        marginTop: 18, padding: 14, borderRadius: 14,
        background: 'rgba(255,255,255,0.025)', border: `1px solid ${T.border}`,
      }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>VOCÊ DISSE</div>
        <div style={{ fontSize: 13, color: T.text, lineHeight: 1.55, letterSpacing: -0.1 }}>
          "<span style={{ color: T.muted }}>Marca uma reunião com a </span>
          <mark style={{ background: 'rgba(122,169,255,0.20)', color: '#7AA9FF', borderRadius: 4, padding: '0 4px', fontWeight: 600 }}>Marina</mark>
          <span style={{ color: T.muted }}> </span>
          <mark style={{ background: 'rgba(168,139,255,0.20)', color: T.violet300, borderRadius: 4, padding: '0 4px', fontWeight: 600 }}>amanhã às 9</mark>
          <span style={{ color: T.muted }}>, prioridade </span>
          <mark style={{ background: 'rgba(240,179,110,0.18)', color: '#F0B36E', borderRadius: 4, padding: '0 4px', fontWeight: 600 }}>alta</mark>"
        </div>
      </div>

      {/* Extracted fields appearing one by one */}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 1.2, textTransform: 'uppercase' }}>EXTRAÍDO</div>
        {[
          { k: 'TÍTULO',     v: 'Reunião com Marina',     c: T.violet400, d: 0 },
          { k: 'PESSOA',     v: 'Marina',                 c: T.catWork,   d: 0.2 },
          { k: 'QUANDO',     v: 'Amanhã · 09:00',         c: T.violet400, d: 0.4 },
          { k: 'CATEGORIA',  v: 'Trabalho',               c: T.catWork,   d: 0.6, type: 'cat' },
          { k: 'PRIORIDADE', v: 'Alta',                   c: '#F0B36E',   d: 0.8 },
        ].map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 12px', borderRadius: 11,
            background: 'rgba(168,139,255,0.06)',
            border: '1px solid rgba(168,139,255,0.18)',
            animation: `lm-rise-soft 0.45s ${f.d}s ease-out both`,
          }}>
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 0.4, fontWeight: 500 }}>{f.k}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.text, fontWeight: 500 }}>
              {f.type === 'cat' && <span style={{ width: 6, height: 6, borderRadius: 99, background: f.c }}/>}
              <span style={{ color: f.c === T.violet400 ? T.text : f.c }}>{f.v}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 36, left: 18, right: 18,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
            background: T.grad, borderRadius: 99,
            animation: 'lm-progress 1.4s cubic-bezier(0.4,0,0.6,1) infinite',
          }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 0.4 }}>
          <span>QUASE LÁ</span>
          <span>Pré-visualização em 0.4s</span>
        </div>
      </div>
    </div>
  );
}

// ─── 6. Voice · Saved + preview card + next action ─────────
function ScreenVoiceSaved() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.surface, padding: '54px 18px 16px', overflow: 'hidden' }}>
      {/* Soft success glow */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 280, height: 280, borderRadius: 99,
        background: 'radial-gradient(circle, rgba(123,215,176,0.20), transparent 70%)',
      }}/>

      {/* Confetti */}
      {[1,2,3,4,5,6].map(i => (
        <span key={i} style={{
          position: 'absolute', top: '17%', left: '50%',
          width: i % 2 === 0 ? 7 : 5, height: i % 3 === 0 ? 9 : 5,
          background: ['#A88BFF','#5B8DEF','#7BD7B0','#F0B36E','#C8A0FF','#7AA9FF'][i % 6],
          borderRadius: i % 4 === 0 ? 99 : 2,
          animation: `lm-confetti-${i} 1.8s 0.2s cubic-bezier(0.2,0.7,0.3,1) both`,
        }}/>
      ))}

      {/* Check */}
      <div style={{
        display: 'flex', justifyContent: 'center', marginTop: 14,
        animation: 'lm-streak 0.5s cubic-bezier(0.2,0.7,0.3,1) both',
        position: 'relative',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 99,
          background: 'rgba(123,215,176,0.12)',
          border: '1.5px solid rgba(123,215,176,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{LIcon.check(34, '#7BD7B0', 2.5)}</div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 14, animation: 'lm-rise 0.5s 0.3s ease-out both', position: 'relative' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: T.text, letterSpacing: -0.3 }}>Pronto.</div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>Salva em 0.8 s</div>
      </div>

      {/* Preview card — exactly what got created */}
      <div style={{
        marginTop: 22, padding: 14, borderRadius: 14,
        background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.borderHi}`,
        animation: 'lm-rise 0.5s 0.5s ease-out both',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle gradient corner */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 120, height: 120, borderRadius: 99,
          background: 'radial-gradient(circle, rgba(168,139,255,0.12), transparent 70%)',
          pointerEvents: 'none',
        }}/>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{ width: 14, height: 14, borderRadius: 99, background: T.grad, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{LIcon.sparkle(9, '#fff')}</span>
          <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 600, color: T.violet300, letterSpacing: 1.4, textTransform: 'uppercase' }}>NOVA TAREFA</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, letterSpacing: -0.2, lineHeight: 1.3 }}>
          Reunião com Marina
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 7, background: 'rgba(122,169,255,0.10)', border: '1px solid rgba(122,169,255,0.24)' }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: T.catWork }}/>
            <span style={{ fontSize: 10, color: '#7AA9FF', fontWeight: 500, letterSpacing: -0.1 }}>Trabalho</span>
          </span>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, letterSpacing: 0.3 }}>AMANHÃ · 09:00</span>
          <span style={{
            padding: '2px 6px', borderRadius: 5,
            background: 'rgba(240,179,110,0.10)', border: '1px solid rgba(240,179,110,0.28)',
            fontFamily: T.mono, fontSize: 8, color: '#F0B36E', letterSpacing: 0.4,
          }}>ALTA</span>
        </div>
      </div>

      {/* Liriun's next nudge */}
      <div style={{
        marginTop: 14, padding: 12, borderRadius: 12,
        background: T.gradSoft, border: '1px solid rgba(168,139,255,0.22)',
        animation: 'lm-rise 0.5s 0.7s ease-out both',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 99, background: T.grad, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{LIcon.sparkle(7, '#fff')}</span>
          <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 600, color: T.violet300, letterSpacing: 1, textTransform: 'uppercase' }}>LIRIUN PERGUNTA</span>
        </div>
        <div style={{ fontSize: 12, color: T.text, fontWeight: 500, lineHeight: 1.45, letterSpacing: -0.1 }}>
          Quer que eu adicione 15 min de preparação antes da reunião?
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button style={{
            padding: '5px 10px', borderRadius: 8, border: 0,
            background: T.grad, color: '#fff',
            fontSize: 11, fontWeight: 600, letterSpacing: -0.1,
          }}>Sim, adicionar</button>
          <button style={{
            padding: '5px 10px', borderRadius: 8,
            background: 'rgba(255,255,255,0.04)', color: T.muted, border: `1px solid ${T.border}`,
            fontSize: 11, fontWeight: 500, letterSpacing: -0.1,
          }}>Não, obrigado</button>
        </div>
      </div>

      {/* Bottom — record again */}
      <div style={{ position: 'absolute', bottom: 30, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <button style={{
          padding: '11px 18px', borderRadius: 99, border: 0,
          background: 'rgba(255,255,255,0.06)',
          color: T.text, fontFamily: T.font, fontWeight: 500, fontSize: 12,
          display: 'flex', alignItems: 'center', gap: 8,
          border: `1px solid ${T.borderHi}`,
        }}>{LIcon.mic(14, T.violet300)} Falar mais uma</button>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenVoiceListening, ScreenVoiceProcessing, ScreenVoiceSaved });
