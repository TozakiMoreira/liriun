// styleguide-components.jsx — Section 3: shared components in all states

// ─── Buttons ─────────────────────────────────────────────────
function Button({ variant = 'primary', state = 'default', icon = null, children = 'Botão', wide = false }) {
  const base = {
    height: 44, padding: '0 18px', borderRadius: 14,
    fontFamily: SG.font, fontWeight: 600, fontSize: 14,
    letterSpacing: -0.1, border: 0, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    justifyContent: 'center',
    width: wide ? '100%' : undefined,
    transition: 'all .15s',
  };
  let style = {};
  if (variant === 'primary') {
    style = {
      background: state === 'pressed'
        ? 'linear-gradient(135deg,#7C5DE8,#3F71D9)'
        : SG.accentGrad,
      color: '#fff',
      boxShadow: state === 'hover'
        ? '0 10px 28px rgba(91,141,239,0.45), inset 0 1px 0 rgba(255,255,255,0.25)'
        : '0 6px 18px rgba(91,141,239,0.32), inset 0 1px 0 rgba(255,255,255,0.2)',
      transform: state === 'pressed' ? 'translateY(1px)' : 'none',
      opacity: state === 'disabled' ? 0.4 : 1,
    };
  } else if (variant === 'secondary') {
    style = {
      background: state === 'hover' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
      color: SG.text,
      border: `1px solid ${state === 'hover' ? 'rgba(255,255,255,0.20)' : SG.borderHi}`,
      opacity: state === 'disabled' ? 0.4 : 1,
    };
  } else if (variant === 'ghost') {
    style = {
      background: state === 'hover' ? 'rgba(255,255,255,0.05)' : 'transparent',
      color: SG.textMuted,
      border: 0,
      opacity: state === 'disabled' ? 0.4 : 1,
    };
  } else if (variant === 'destructive') {
    style = {
      background: state === 'hover' ? 'rgba(238,122,142,0.16)' : 'rgba(238,122,142,0.10)',
      color: '#FFB1BC',
      border: `1px solid rgba(238,122,142,${state === 'hover' ? 0.42 : 0.28})`,
      opacity: state === 'disabled' ? 0.4 : 1,
    };
  }

  if (state === 'loading') {
    return (
      <button style={{ ...base, ...style, gap: 10 }}>
        <span style={{ display: 'inline-flex', animation: 'sg-spin 1s linear infinite' }}>
          {SgIcons.spinner(15, variant === 'primary' ? '#fff' : SG.text)}
        </span>
        Carregando…
      </button>
    );
  }
  return (
    <button style={{ ...base, ...style }}>
      {icon}
      {children}
    </button>
  );
}

// ─── Inputs ──────────────────────────────────────────────────
function TextInput({ state = 'default', label = 'E-mail', icon = null, value = '', placeholder = 'voce@liriun.app', error = null }) {
  const focus = state === 'focus';
  const err = state === 'error';
  const dis = state === 'disabled';
  return (
    <div style={{ opacity: dis ? 0.45 : 1 }}>
      <div style={{
        fontFamily: SG.mono, fontSize: 11, fontWeight: 500, letterSpacing: 1.2,
        color: SG.textFaint, textTransform: 'uppercase', marginBottom: 8,
      }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        height: 48, padding: '0 14px', borderRadius: 14,
        background: focus ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.035)',
        border: `1.5px solid ${err ? 'rgba(238,122,142,0.6)' : focus ? 'rgba(156,123,255,0.55)' : SG.border}`,
        boxShadow: focus ? '0 0 0 4px rgba(156,123,255,0.12)' : err ? '0 0 0 4px rgba(238,122,142,0.10)' : 'none',
      }}>
        {icon && <span style={{ color: SG.textMuted, display: 'flex' }}>{icon}</span>}
        <span style={{
          color: value ? SG.text : SG.textFaint,
          fontSize: 14, fontWeight: 500, letterSpacing: -0.1, flex: 1,
        }}>{value || placeholder}</span>
        {focus && <span style={{ width: 1.5, height: 16, background: SG.accentA, borderRadius: 1, animation: 'sg-blink 1s steps(2,start) infinite' }}/>}
      </div>
      {err && (
        <div style={{
          marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: '#FFB1BC',
        }}>
          {SgIcons.alert(13, '#FFB1BC')} {error || 'Endereço inválido'}
        </div>
      )}
    </div>
  );
}

// ─── Chips ───────────────────────────────────────────────────
function Chip({ label, color = null, kind = 'filter', state = 'default', icon = null }) {
  const active = state === 'active';
  const hover = state === 'hover';
  const dis = state === 'disabled';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '7px 12px', borderRadius: 12,
      background: active ? 'rgba(255,255,255,0.10)' : hover ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${active ? 'rgba(255,255,255,0.22)' : hover ? 'rgba(255,255,255,0.13)' : SG.border}`,
      fontSize: 13, fontWeight: 500, letterSpacing: -0.1,
      color: active ? SG.text : SG.textMuted,
      opacity: dis ? 0.4 : 1,
    }}>
      {color && <span style={{ width: 7, height: 7, borderRadius: 99, background: color, boxShadow: `0 0 8px ${color}55` }}/>}
      {icon}
      {label}
    </div>
  );
}

// ─── Card / Task card ────────────────────────────────────────
function GenericCard({ title = 'Card genérico', desc = 'Container base. 20px radius, surface/low, 1px borderHi.' }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${SG.borderHi}`,
      borderRadius: 20, padding: 18,
      backdropFilter: 'blur(18px) saturate(140%)',
      WebkitBackdropFilter: 'blur(18px) saturate(140%)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: SG.text, letterSpacing: -0.2 }}>{title}</div>
      <div style={{ fontSize: 13, color: SG.textMuted, marginTop: 6, lineHeight: 1.45 }}>{desc}</div>
    </div>
  );
}

function TaskCard({ done = false }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${SG.borderHi}`,
      borderRadius: 18, padding: 14,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 99,
        background: done ? SG.accentGrad : 'transparent',
        border: done ? 'none' : `1.5px solid ${SG.borderHi}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{done && SgIcons.check(13, '#fff')}</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 14, fontWeight: 500, color: done ? SG.textFaint : SG.text,
          textDecoration: done ? 'line-through' : 'none',
          letterSpacing: -0.2,
        }}>Reunião com a equipe de design</div>
        <div style={{ fontSize: 12, color: SG.textMuted, marginTop: 4, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: '#7AA9FF' }}/> Trabalho
          </span>
          <span>14:00</span>
        </div>
      </div>
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────
function ModalDemo() {
  return (
    <div style={{
      width: '100%', height: 280, borderRadius: 16,
      background: 'rgba(0,0,0,0.45)',
      position: 'relative', overflow: 'hidden',
      border: `1px solid ${SG.border}`,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 30%, rgba(156,123,255,0.12), transparent 60%)',
      }}/>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '76%', borderRadius: 24,
        background: 'rgba(20,22,28,0.92)',
        border: `1px solid ${SG.borderHi}`,
        backdropFilter: 'blur(40px) saturate(150%)',
        WebkitBackdropFilter: 'blur(40px) saturate(150%)',
        padding: 22,
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: SG.text, letterSpacing: -0.3 }}>Excluir tarefa?</div>
        <div style={{ fontSize: 13, color: SG.textMuted, marginTop: 6, lineHeight: 1.45 }}>
          Essa ação não pode ser desfeita.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <Button variant="secondary" wide>Cancelar</Button>
          <Button variant="destructive" wide>Excluir</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Bottom sheet (mini) ─────────────────────────────────────
function SheetDemo() {
  return (
    <div style={{
      width: '100%', height: 280, borderRadius: 16,
      background: 'rgba(0,0,0,0.4)',
      position: 'relative', overflow: 'hidden',
      border: `1px solid ${SG.border}`,
    }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: 200, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        background: 'rgba(22,24,30,0.92)',
        border: `1px solid ${SG.borderHi}`,
        borderBottom: 'none',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        padding: '14px 18px 18px',
      }}>
        <div style={{ width: 36, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.18)', margin: '0 auto 14px' }}/>
        <div style={{ fontSize: 18, fontWeight: 600, color: SG.text, letterSpacing: -0.4 }}>Detalhe da tarefa</div>
        <div style={{ fontSize: 13, color: SG.textMuted, marginTop: 4 }}>Sheet 32px top radius · cubic-bezier(.2,.7,.3,1)</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
          <Chip label="Trabalho" color="#7AA9FF" state="active"/>
          <Chip label="Reunião" color="#7AA9FF"/>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ───────────────────────────────────────────────────
function Toast({ kind = 'success', text = 'Tarefa salva' }) {
  const colors = {
    success: { dot: '#7BD7B0', tint: 'rgba(123,215,176,0.10)', border: 'rgba(123,215,176,0.32)' },
    error:   { dot: '#EE7A8E', tint: 'rgba(238,122,142,0.10)', border: 'rgba(238,122,142,0.32)' },
  }[kind];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 12,
      padding: '12px 16px 12px 14px', borderRadius: 16,
      background: 'rgba(20,22,28,0.86)',
      backdropFilter: 'blur(28px) saturate(150%)',
      WebkitBackdropFilter: 'blur(28px) saturate(150%)',
      border: `1px solid ${SG.borderHi}`,
      boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 99,
        background: colors.tint,
        border: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {kind === 'success' ? SgIcons.check(14, colors.dot) : SgIcons.alert(14, colors.dot)}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: SG.text, letterSpacing: -0.1 }}>{text}</div>
    </div>
  );
}

// ─── Switch / Radio ──────────────────────────────────────────
function Switch({ on = false, disabled = false }) {
  return (
    <div style={{
      width: 46, height: 28, borderRadius: 99,
      background: on ? SG.accentGrad : 'rgba(255,255,255,0.10)',
      border: `1px solid ${SG.border}`,
      padding: 2, position: 'relative',
      opacity: disabled ? 0.4 : 1,
      boxShadow: on ? '0 4px 12px rgba(91,141,239,0.35)' : 'none',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 99,
        background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
        transform: on ? 'translateX(18px)' : 'translateX(0)',
        transition: 'transform .2s',
      }}/>
    </div>
  );
}

function Radio({ checked = false, label = 'Opção', disabled = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: disabled ? 0.4 : 1 }}>
      <div style={{
        width: 20, height: 20, borderRadius: 99,
        border: checked ? '1.5px solid #9C7BFF' : `1.5px solid ${SG.borderHi}`,
        background: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <div style={{ width: 10, height: 10, borderRadius: 99, background: SG.accentGrad }}/>}
      </div>
      <div style={{ fontSize: 14, color: SG.text, fontWeight: 500, letterSpacing: -0.1 }}>{label}</div>
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────
function Avatar({ initials = 'P', size = 40, badge = false }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div style={{
        width: size, height: size, borderRadius: 99,
        background: 'linear-gradient(135deg,#3a3550,#2a3548)',
        border: `1px solid ${SG.borderHi}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: SG.text, fontWeight: 600, fontSize: size * 0.38,
      }}>{initials}</div>
      {badge && <div style={{
        position: 'absolute', right: 0, bottom: 0,
        width: size * 0.3, height: size * 0.3, borderRadius: 99,
        background: '#7BD7B0', border: '2px solid #0E1014',
      }}/>}
    </div>
  );
}

// ─── Message bubbles ─────────────────────────────────────────
function Bubble({ from = 'user', audio = false, text = 'Cria uma tarefa pra amanhã às 14h' }) {
  if (from === 'user') {
    return (
      <div style={{
        maxWidth: 280, padding: '12px 16px',
        background: SG.accentGrad,
        color: '#fff',
        borderRadius: '20px 20px 6px 20px',
        fontSize: 14, fontWeight: 500, letterSpacing: -0.1, lineHeight: 1.4,
        boxShadow: '0 8px 22px rgba(91,141,239,0.28), inset 0 1px 0 rgba(255,255,255,0.18)',
      }}>
        {audio && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, opacity: 0.85 }}>
            {SgIcons.play(11, '#fff')}
            <svg width="80" height="14" viewBox="0 0 80 14">
              {[3,5,8,4,6,9,5,3,7,5,3,6,8,4,5,9,5,3,7,4,3,5].map((h,i)=>(
                <rect key={i} x={i*3.5} y={7-h/2} width="1.6" height={h} rx="0.8" fill="rgba(255,255,255,0.65)"/>
              ))}
            </svg>
            <span style={{ fontFamily: SG.mono, fontSize: 10 }}>0:04</span>
          </div>
        )}
        {text}
      </div>
    );
  }
  return (
    <div style={{ maxWidth: 280 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6,
        fontFamily: SG.mono, fontSize: 10, fontWeight: 500, color: SG.textFaint,
        letterSpacing: 1.0, textTransform: 'uppercase',
      }}>
        <span style={{
          width: 14, height: 14, borderRadius: 99,
          background: SG.accentGrad, display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
        }}>{SgIcons.sparkle(9, '#fff')}</span>
        Liriun
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${SG.border}`,
        color: SG.text,
        padding: '12px 16px', borderRadius: '20px 20px 20px 6px',
        fontSize: 14, fontWeight: 400, letterSpacing: -0.1, lineHeight: 1.4,
      }}>{text}</div>
    </div>
  );
}

// ─── Section assembly ────────────────────────────────────────
function ComponentBlock({ title, children, cols = 4 }) {
  return (
    <SGCard pad={26} style={{ marginBottom: 22 }}>
      <div style={{
        fontFamily: SG.font, fontSize: 18, fontWeight: 600, color: SG.text,
        letterSpacing: -0.3, marginBottom: 22,
      }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 22 }}>
        {children}
      </div>
    </SGCard>
  );
}

function CompCell({ label, children, accent = false }) {
  return (
    <div>
      <StateTag accent={accent}>{label}</StateTag>
      <div style={{ display: 'flex', alignItems: 'center', minHeight: 56 }}>{children}</div>
    </div>
  );
}

function Section3Components() {
  return (
    <section style={{ marginBottom: 120 }}>
      <SectionHeader index="03" title="Componentes" subtitle="Cada componente em todos os estados. Mesma especificação para mobile (Flutter) e web (Next.js 15 + Tailwind + shadcn/ui). Os tokens são a fonte da verdade — não inventar valores fora deles."/>

      {/* Animations CSS for spinner / blink */}
      <style>{`
        @keyframes sg-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes sg-blink { 50% { opacity: 0; } }
      `}</style>

      <ComponentBlock title="Botão · primário" cols={5}>
        <CompCell label="default"><Button>Salvar tarefa</Button></CompCell>
        <CompCell label="hover"><Button state="hover">Salvar tarefa</Button></CompCell>
        <CompCell label="pressed"><Button state="pressed">Salvar tarefa</Button></CompCell>
        <CompCell label="loading"><Button state="loading"/></CompCell>
        <CompCell label="disabled"><Button state="disabled">Salvar tarefa</Button></CompCell>
      </ComponentBlock>

      <ComponentBlock title="Botão · secundário · ghost · destrutivo" cols={4}>
        <CompCell label="secondary default"><Button variant="secondary">Editar</Button></CompCell>
        <CompCell label="secondary hover"><Button variant="secondary" state="hover">Editar</Button></CompCell>
        <CompCell label="ghost default"><Button variant="ghost">Cancelar</Button></CompCell>
        <CompCell label="ghost hover"><Button variant="ghost" state="hover">Cancelar</Button></CompCell>
        <CompCell label="destructive default"><Button variant="destructive" icon={SgIcons.trash(14, '#FFB1BC')}>Excluir</Button></CompCell>
        <CompCell label="destructive hover"><Button variant="destructive" state="hover" icon={SgIcons.trash(14, '#FFB1BC')}>Excluir</Button></CompCell>
        <CompCell label="secondary disabled"><Button variant="secondary" state="disabled">Editar</Button></CompCell>
        <CompCell label="ghost disabled"><Button variant="ghost" state="disabled">Cancelar</Button></CompCell>
      </ComponentBlock>

      <ComponentBlock title="Input · texto" cols={2}>
        <CompCell label="default"><div style={{width:'100%'}}><TextInput icon={SgIcons.mail(16, SG.textMuted)}/></div></CompCell>
        <CompCell label="filled"><div style={{width:'100%'}}><TextInput value="pedro@liriun.app" icon={SgIcons.mail(16, SG.textMuted)}/></div></CompCell>
        <CompCell label="focus"><div style={{width:'100%'}}><TextInput value="pedro@liriun.ap" state="focus" icon={SgIcons.mail(16, SG.textMuted)}/></div></CompCell>
        <CompCell label="error"><div style={{width:'100%'}}><TextInput value="pedro@" state="error" icon={SgIcons.mail(16, SG.textMuted)}/></div></CompCell>
        <CompCell label="disabled"><div style={{width:'100%'}}><TextInput value="pedro@liriun.app" state="disabled" icon={SgIcons.mail(16, SG.textMuted)}/></div></CompCell>
      </ComponentBlock>

      <ComponentBlock title="Chip · filtro · categoria · tag" cols={6}>
        <CompCell label="filter default"><Chip label="Todas"/></CompCell>
        <CompCell label="filter active"><Chip label="Trabalho" state="active"/></CompCell>
        <CompCell label="category"><Chip label="Saúde" color="#7BD7B0"/></CompCell>
        <CompCell label="tag"><Chip label="urgente" icon={<span style={{fontFamily:SG.mono, fontSize:11, color:'#FFB99A'}}>·</span>}/></CompCell>
        <CompCell label="hover"><Chip label="Pessoal" state="hover"/></CompCell>
        <CompCell label="disabled"><Chip label="Arquivado" state="disabled"/></CompCell>
      </ComponentBlock>

      <ComponentBlock title="Card" cols={2}>
        <CompCell label="genérico"><div style={{width:'100%'}}><GenericCard/></div></CompCell>
        <CompCell label="task card · pendente"><div style={{width:'100%'}}><TaskCard/></div></CompCell>
        <CompCell label="task card · concluída"><div style={{width:'100%'}}><TaskCard done/></div></CompCell>
        <CompCell label="bolha audio · usuário"><Bubble from="user" audio/></CompCell>
      </ComponentBlock>

      <ComponentBlock title="Bolha de mensagem" cols={3}>
        <CompCell label="user · text"><Bubble from="user" text="Marca dentista quinta às 9"/></CompCell>
        <CompCell label="user · audio"><Bubble from="user" audio/></CompCell>
        <CompCell label="agente"><Bubble from="agent" text="Pronto. Adicionei lembrete pra 30 min antes."/></CompCell>
      </ComponentBlock>

      <ComponentBlock title="Modal · bottom sheet" cols={2}>
        <CompCell label="modal · destrutivo"><div style={{width:'100%'}}><ModalDemo/></div></CompCell>
        <CompCell label="bottom sheet"><div style={{width:'100%'}}><SheetDemo/></div></CompCell>
      </ComponentBlock>

      <ComponentBlock title="Toast · switch · radio · avatar" cols={4}>
        <CompCell label="toast · success"><Toast kind="success" text="Tarefa salva"/></CompCell>
        <CompCell label="toast · error"><Toast kind="error" text="Falha ao sincronizar"/></CompCell>
        <CompCell label="switch off"><Switch/></CompCell>
        <CompCell label="switch on"><Switch on/></CompCell>
        <CompCell label="radio"><div style={{display:'flex', flexDirection:'column', gap:8}}><Radio checked label="Por voz"/><Radio label="Por texto"/></div></CompCell>
        <CompCell label="avatar"><Avatar initials="P"/></CompCell>
        <CompCell label="avatar · status"><Avatar initials="P" badge/></CompCell>
        <CompCell label="switch disabled"><Switch on disabled/></CompCell>
      </ComponentBlock>
    </section>
  );
}

Object.assign(window, {
  Section3Components, Button, TextInput, Chip, GenericCard, TaskCard,
  ModalDemo, SheetDemo, Toast, Switch, Radio, Avatar, Bubble,
});
