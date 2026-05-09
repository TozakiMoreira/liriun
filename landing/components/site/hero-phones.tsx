import * as React from "react";

const L = {
  bg: "#0E1014",
  bgTop: "#11141B",
  surface: "rgba(255,255,255,0.035)",
  surfaceHi: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.07)",
  borderHi: "rgba(255,255,255,0.12)",
  text: "rgba(244,246,252,0.96)",
  textMuted: "rgba(244,246,252,0.62)",
  textFaint: "rgba(244,246,252,0.38)",
  textDim: "rgba(244,246,252,0.24)",
  accentGrad: "linear-gradient(135deg, #9C7BFF 0%, #5B8DEF 100%)",
  accentGlow: "radial-gradient(circle at 50% 50%, rgba(156,123,255,0.28), rgba(91,141,239,0) 70%)",
  cat: {
    work: "#7AA9FF",
    health: "#7BD7B0",
    home: "#F0B36E",
    personal: "#C8A0FF",
  } as const,
  font: '"Geist", system-ui, -apple-system, sans-serif',
  mono: '"Geist Mono", ui-monospace, monospace',
};

type CatColor = keyof typeof L.cat;

const Icon = {
  mic: (s = 18, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  ),
  keyboard: (s = 18, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M6 13.5h.01M16.5 13.5h.01" />
      <path d="M9 13.5h6" />
    </svg>
  ),
  sparkle: (s = 16, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z" />
    </svg>
  ),
  calendar: (s = 14, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  ),
  clock: (s = 12, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  ),
  flame: (s = 13, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c2 4-3 6-1 11a5 5 0 0 0 10 0c0-3-2-4-3-6 0 0-1 3-3 3-1 0-2-1-2-3 0-2 1-3-1-5z" />
    </svg>
  ),
  flag: (s = 13, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 21V4" />
      <path d="M5 4h11l-2 4 2 4H5" />
    </svg>
  ),
  check: (s = 13, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  ),
  edit: (s = 13, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h4l11-11-4-4L4 16v4z" />
    </svg>
  ),
  tag: (s = 14, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9z" />
      <circle cx="7.5" cy="7.5" r="1.2" />
    </svg>
  ),
  list: (s = 18, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  ),
  inbox: (s = 16, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13l3-8h12l3 8" />
      <path d="M3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
      <path d="M3 13h5l1 2h6l1-2h5" />
    </svg>
  ),
  bell: (s = 16, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 17V11a6 6 0 0 1 12 0v6" />
      <path d="M4.5 17h15M10 20.5a2 2 0 0 0 4 0" />
    </svg>
  ),
  search: (s = 16, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </svg>
  ),
  plus: (s = 16, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  waveform: () => (
    <svg width="80" height="22" viewBox="0 0 80 22" fill="none">
      {[3, 7, 12, 5, 9, 14, 8, 4, 11, 6, 3, 8, 12, 5, 9, 14, 8, 4, 11, 6, 3, 7].map((h, i) => (
        <rect key={i} x={i * 3.5} y={11 - h / 2} width="1.6" height={h} rx="0.8" fill="rgba(244,246,252,0.55)" />
      ))}
    </svg>
  ),
};

function PhoneFrame({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: 300,
        height: 620,
        borderRadius: 44,
        background: "linear-gradient(180deg,#1a1c22 0%,#0c0d11 100%)",
        padding: 6,
        boxShadow:
          "0 50px 100px rgba(0,0,0,0.55), inset 0 0 0 6px #1a1a1c, inset 0 1px 0 rgba(255,255,255,0.06)",
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 38,
          overflow: "hidden",
          background: `radial-gradient(120% 60% at 50% -10%, ${L.bgTop} 0%, ${L.bg} 60%)`,
          color: L.text,
          fontFamily: L.font,
          position: "relative",
        }}
      >
        {/* Status bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 28px 0",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: L.text }}>9:41</span>
          <span style={{ fontSize: 14, color: L.text, letterSpacing: 1 }}>•••</span>
        </div>
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: "50%",
            transform: "translateX(-50%)",
            width: 480,
            height: 320,
            background: L.accentGlow,
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />
        {children}
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  color,
  active = false,
}: {
  label: string;
  color?: string;
  active?: boolean;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 9px",
        borderRadius: 10,
        background: active ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)"}`,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: -0.1,
        color: active ? L.text : L.textMuted,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {color && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 99,
            background: color,
            boxShadow: `0 0 6px ${color}55`,
          }}
        />
      )}
      {label}
    </div>
  );
}

function FieldRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 6,
          background: "rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 10,
          color: L.textFaint,
          width: 60,
          flexShrink: 0,
          fontFamily: L.mono,
          letterSpacing: 0.2,
        }}
      >
        {label.toUpperCase()}
      </div>
      <div style={{ flex: 1, fontSize: 12 }}>{children}</div>
    </div>
  );
}

function PhoneChat() {
  return (
    <PhoneFrame className="absolute left-0 top-5 -rotate-[4deg]">
      {/* Greeting */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          padding: "0 22px",
          zIndex: 4,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: L.textFaint,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            fontFamily: L.mono,
          }}
        >
          Quinta · 19:24
        </div>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.6, marginTop: 4, lineHeight: 1.1 }}>
          Bom dia,
          <br />
          <span
            style={{
              background: L.accentGrad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            como posso ajudar?
          </span>
        </div>
      </div>

      {/* Conversation */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 0,
          right: 0,
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* User bubble */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              maxWidth: "82%",
              background: "rgba(255,255,255,0.045)",
              border: `1px solid ${L.border}`,
              padding: "10px 13px",
              borderRadius: "16px 16px 4px 16px",
              fontSize: 12,
              fontWeight: 500,
              color: L.text,
              lineHeight: 1.35,
            }}
          >
            "Lembre-me de ligar pro João depois do almoço"
          </div>
        </div>

        {/* Waveform pill */}
        <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 99,
              background: L.accentGrad,
              boxShadow: "0 8px 22px rgba(91,141,239,0.4), inset 0 1px 0 rgba(255,255,255,0.22)",
            }}
          >
            {Icon.waveform()}
          </div>
        </div>

        {/* Review card */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${L.borderHi}`,
            borderRadius: 16,
            padding: 12,
            backdropFilter: "blur(20px)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: -0.2, lineHeight: 1.3 }}>
            Ligar para o João
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 6,
              fontSize: 10,
              fontFamily: L.mono,
              color: L.textFaint,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            <span>14:00</span>
            <span>·</span>
            <span style={{ color: L.cat.work }}>TRABALHO</span>
            <span>·</span>
            <span>MÉDIA</span>
          </div>
        </div>
      </div>

      {/* Mic FAB */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: -8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 90,
              height: 90,
              borderRadius: 99,
              background: "radial-gradient(circle, rgba(156,123,255,0.32) 0%, rgba(91,141,239,0) 65%)",
              filter: "blur(2px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 99,
              background: L.accentGrad,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 14px 30px rgba(91,141,239,0.45), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 5px rgba(255,255,255,0.04)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 5,
                borderRadius: 99,
                border: "1px solid rgba(255,255,255,0.22)",
              }}
            />
            {Icon.mic(22, "#fff")}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

type Task = {
  id: string;
  title: string;
  cat: string;
  catColor: CatColor;
  time?: string;
  completed?: boolean;
  highlighted?: boolean;
};

const TASKS: Task[] = [
  { id: "t1", title: "Ligar para o João", cat: "TRABALHO", catColor: "work", time: "14:00" },
  { id: "t2", title: "Revisar proposta do site", cat: "LIRIUN", catColor: "personal", time: "16:30" },
  { id: "t3", title: "Café com Marina", cat: "CONCLUÍDO", catColor: "health", time: "10:00", completed: true },
  { id: "t4", title: "Comprar café em grão", cat: "CASA", catColor: "home" },
];

function TaskRow({ task }: { task: Task }) {
  const color = L.cat[task.catColor];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 99,
          flexShrink: 0,
          border: task.completed ? "none" : `1.5px solid ${L.borderHi}`,
          background: task.completed ? color : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: task.completed ? `0 4px 10px ${color}55` : "none",
        }}
      >
        {task.completed && Icon.check(11, "#fff")}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: -0.1,
            color: task.completed ? L.textFaint : L.text,
            textDecoration: task.completed ? "line-through" : "none",
          }}
        >
          {task.title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginTop: 3,
            fontSize: 9,
            fontFamily: L.mono,
            color: L.textFaint,
            letterSpacing: 0.4,
          }}
        >
          {task.time && <span>{task.time}</span>}
          {task.time && <span>·</span>}
          <span style={{ color: task.completed ? L.textDim : color }}>{task.cat}</span>
        </div>
      </div>
    </div>
  );
}

function PhoneList() {
  return (
    <PhoneFrame className="absolute right-0 top-[60px] rotate-[5deg]">
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          padding: "0 22px",
          zIndex: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            fontFamily: L.mono,
            color: L.textFaint,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          <span>HOJE</span>
          <span>·</span>
          <span>4 TAREFAS</span>
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.8, marginTop: 4 }}>
          Quinta
        </div>
      </div>

      {/* Tasks */}
      <div
        style={{
          position: "absolute",
          top: 144,
          left: 0,
          right: 0,
          padding: "0 22px",
        }}
      >
        {TASKS.map((t) => (
          <TaskRow key={t.id} task={t} />
        ))}
      </div>
    </PhoneFrame>
  );
}

export function HeroPhones() {
  return (
    <div className="relative h-[580px] hidden lg:flex items-center justify-center">
      <div
        className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full blur-[20px]"
        style={{
          background:
            "radial-gradient(circle, rgba(156,123,255,0.40) 0%, rgba(91,141,239,0.18) 40%, transparent 70%)",
        }}
      />
      <PhoneChat />
      <PhoneList />
    </div>
  );
}
