"use client";

export const runtime = "edge";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { useUsuarioAtual } from "@/components/auth/auth-provider";
import { agenteApi, type Mensagem } from "@/lib/api/agente";

type ChatMessage = {
  id: string;
  papel: "usuario" | "liriun";
  conteudo: string;
  pendente?: boolean;
};

type Modo = "voz" | "texto";

export default function FalarPage() {
  const usuario = useUsuarioAtual();
  const primeiroNome = usuario?.nome.split(" ")[0] ?? "";

  const [modo, setModo] = useState<Modo>("voz");
  const [mensagens, setMensagens] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sttSuportado, setSttSuportado] = useState<boolean | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MAX_DURACAO_MS = 20_000; // 20s hard limit

  // Detect Web Speech API support
  useEffect(() => {
    const SR =
      (typeof window !== "undefined" &&
        ((window as unknown as { SpeechRecognition?: typeof SpeechRecognition })
          .SpeechRecognition ||
          (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition })
            .webkitSpeechRecognition)) ||
      null;
    setSttSuportado(SR !== null);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [mensagens]);

  async function enviar(textoUsuario: string) {
    const texto = textoUsuario.trim();
    if (!texto || enviando) return;

    const userMsg: ChatMessage = {
      id: `${Date.now()}-u`,
      papel: "usuario",
      conteudo: texto,
    };
    const agenteMsg: ChatMessage = {
      id: `${Date.now()}-a`,
      papel: "liriun",
      conteudo: "…",
      pendente: true,
    };

    setMensagens((m) => [...m, userMsg, agenteMsg]);
    setInput("");
    setEnviando(true);
    setErro(null);

    try {
      const historico: Mensagem[] = mensagens.map((m) => ({
        papel: m.papel,
        texto: m.conteudo,
      }));
      const res = await agenteApi.conversar({
        mensagens: [...historico, { papel: "usuario", texto }],
        idioma: "pt",
      });
      setMensagens((m) =>
        m.map((msg) =>
          msg.id === agenteMsg.id ? { ...msg, conteudo: res.mensagem, pendente: false } : msg,
        ),
      );
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao falar com o agente");
      setMensagens((m) => m.filter((msg) => msg.id !== agenteMsg.id));
    } finally {
      setEnviando(false);
    }
  }

  async function startRecognition() {
    if (gravando || enviando) return;

    const SR =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition })
        .webkitSpeechRecognition;
    if (!SR) {
      setErro("Reconhecimento de voz não suportado neste navegador. Use o modo texto.");
      setModo("texto");
      return;
    }

    // Pede permissão explícita do mic via getUserMedia.
    // Sem isso o Chrome às vezes bloqueia silenciosamente em localhost.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop()); // só pra obter permissão; SR abre próprio stream
    } catch (err) {
      setErro(
        err instanceof Error
          ? `Permissão de microfone negada (${err.message}). Habilite em Configurações do navegador.`
          : "Permissão de microfone negada.",
      );
      return;
    }

    const recognition = new SR();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("[stt] iniciado");
    };
    recognition.onaudiostart = () => console.log("[stt] capturando áudio");
    recognition.onspeechstart = () => console.log("[stt] fala detectada");
    recognition.onspeechend = () => console.log("[stt] fala terminou");
    recognition.onnomatch = () => {
      console.warn("[stt] nenhum resultado");
      setErro("Não entendi. Tente falar de novo, mais claro.");
    };
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const result = e.results[0]?.[0]?.transcript;
      console.log("[stt] resultado:", result);
      if (result) void enviar(result);
    };
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error("[stt] erro:", e.error, e);
      const msgs: Record<string, string> = {
        "not-allowed": "Permissão de microfone negada. Habilite no navegador.",
        "service-not-allowed": "Serviço de voz indisponível. Tente outro navegador.",
        "no-speech": "Nada foi dito. Tente de novo.",
        "audio-capture": "Microfone não encontrado.",
        network: "Falha de rede. Web Speech API exige internet (envia áudio pro Google).",
        aborted: "Cancelado.",
      };
      setErro(msgs[e.error] ?? `Erro no microfone: ${e.error}`);
      setGravando(false);
    };
    recognition.onend = () => {
      console.log("[stt] encerrado");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setGravando(false);
    };

    recognitionRef.current = recognition;
    setGravando(true);
    setErro(null);

    // Hard timeout — para mesmo se browser não detectar silêncio
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.log("[stt] timeout 20s atingido");
      try {
        recognition.stop();
      } catch (e) {
        console.error("[stt] stop após timeout falhou:", e);
      }
      setGravando(false);
    }, MAX_DURACAO_MS);

    try {
      recognition.start();
    } catch (err) {
      console.error("[stt] start falhou:", err);
      setErro("Falha ao iniciar gravação.");
      setGravando(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }

  function stopRecognition() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    recognitionRef.current?.stop();
    setGravando(false);
  }

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      recognitionRef.current?.stop();
    };
  }, []);

  async function handleSubmitTexto(e: FormEvent) {
    e.preventDefault();
    await enviar(input);
  }

  const semConversa = mensagens.length === 0;

  if (semConversa) {
    return (
      <div className="min-h-[calc(100vh-72px)] md:min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 md:px-12 pt-8 pb-4">
          <div className="font-mono text-xs uppercase tracking-[1.4px] text-faint">Falar</div>
        </div>

        {/* Hero centered: saudação + mic + input */}
        <div
          className="flex-1 flex flex-col items-center justify-center px-6 pt-4 pb-8"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 30%, rgba(156,123,255,0.16) 0%, transparent 60%)",
          }}
        >
          <div className="text-center max-w-[640px] w-full">
            <h1 className="text-[44px] md:text-[72px] font-semibold tracking-[-2px] leading-[1.0]">
              {primeiroNome ? `Bom dia, ${primeiroNome}.` : "Bom dia."}
              <br />
              <span className="bg-grad-brand bg-clip-text text-transparent">
                Como posso ajudar?
              </span>
            </h1>
            <p className="text-base text-muted leading-[1.55] mt-5 max-w-[480px] mx-auto">
              {modo === "voz"
                ? "Toque no microfone e fale. Liriun extrai a tarefa e organiza sua agenda."
                : "Escreva o que você quer fazer. Liriun entende e organiza."}
            </p>

            {erro && (
              <div className="mt-5 text-sm text-danger px-3 py-2 rounded-md border border-danger/30 bg-danger/10 max-w-[480px] mx-auto">
                {erro}
              </div>
            )}

            {/* Mic FAB centro */}
            {modo === "voz" ? (
              <div className="mt-10 flex flex-col items-center gap-4">
                <div className="relative">
                  {gravando && (
                    <span
                      aria-hidden
                      className="absolute inset-0 -m-3 rounded-pill animate-ping"
                      style={{ background: "rgba(156,123,255,0.30)", filter: "blur(4px)" }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={gravando ? stopRecognition : startRecognition}
                    disabled={enviando || sttSuportado === false}
                    aria-label={gravando ? "Parar gravação" : "Falar"}
                    className="relative w-[120px] h-[120px] rounded-pill grid place-items-center transition-transform active:scale-95 disabled:opacity-50"
                    style={{
                      background: "var(--liriun-grad-brand)",
                      boxShadow:
                        "0 24px 50px rgba(91,141,239,0.50), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 8px rgba(255,255,255,0.04)",
                    }}
                  >
                    {gravando ? <RecordingWaveform /> : <MicIcon size={44} />}
                  </button>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[1.2px] text-faint">
                  {gravando ? "Ouvindo… toque pra parar" : "Toque pra falar"}
                </span>
                <button
                  type="button"
                  onClick={() => setModo("texto")}
                  className="mt-2 font-mono text-[11px] uppercase tracking-[1.2px] text-violet-300 hover:text-violet-200 transition-colors"
                >
                  Prefiro escrever →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitTexto} className="mt-10 flex items-center gap-2 max-w-[520px] mx-auto">
                <input
                  type="text"
                  placeholder="Diga o que você quer fazer…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={enviando}
                  autoFocus
                  className="flex-1 bg-white/[0.05] border border-border-hi rounded-pill px-5 py-3.5 text-base text-text placeholder:text-faint focus:outline-none focus:border-violet-500/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setModo("voz")}
                  aria-label="Voltar pra voz"
                  className="w-12 h-12 rounded-pill border border-border-hi grid place-items-center text-muted hover:text-text transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <MicIcon size={18} />
                </button>
                <button
                  type="submit"
                  disabled={enviando || !input.trim()}
                  aria-label="Enviar"
                  className="w-12 h-12 rounded-pill grid place-items-center text-white disabled:opacity-30 transition-all shrink-0"
                  style={{
                    background: input.trim() ? "var(--liriun-grad-brand)" : "rgba(255,255,255,0.06)",
                    boxShadow: input.trim()
                      ? "0 8px 22px rgba(91,141,239,0.35), inset 0 1px 0 rgba(255,255,255,0.22)"
                      : undefined,
                  }}
                >
                  <SendIcon />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Com conversa: chat scroll + input fixo embaixo
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center gap-3 px-6 md:px-12 pt-8 pb-4">
        <button
          type="button"
          onClick={() => {
            setMensagens([]);
            setInput("");
            setErro(null);
          }}
          aria-label="Nova conversa"
          title="Nova conversa"
          className="w-9 h-9 rounded-md grid place-items-center text-muted hover:text-text border border-border-hi transition-colors shrink-0"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <CloseIcon />
        </button>
        <div>
          <div className="font-mono text-xs uppercase tracking-[1.4px] text-faint">Falar</div>
          <div className="text-xl font-semibold tracking-[-0.3px] mt-1">
            {primeiroNome ? `Olá, ${primeiroNome}.` : "Olá."}
          </div>
        </div>
      </div>

      <section ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-12">
        <div className="max-w-[760px] mx-auto py-8 flex flex-col gap-4">
          {mensagens.map((m) =>
            m.papel === "usuario" ? (
              <UserBubble key={m.id} text={m.conteudo} />
            ) : (
              <AgenteBubble key={m.id} text={m.conteudo} pendente={m.pendente} />
            ),
          )}
        </div>
      </section>

      <footer className="px-6 md:px-12 pb-6 md:pb-10 border-t border-border bg-bg/60 backdrop-blur-md">
        <div className="max-w-[760px] mx-auto pt-4">
          {erro && (
            <div className="mb-3 text-sm text-danger px-3 py-2 rounded-md border border-danger/30 bg-danger/10">
              {erro}
            </div>
          )}
          <form onSubmit={handleSubmitTexto} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Continue a conversa…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={enviando}
              className="flex-1 bg-white/[0.05] border border-border-hi rounded-pill px-5 py-3 text-base text-text placeholder:text-faint focus:outline-none focus:border-violet-500/60"
            />
            <button
              type="button"
              onClick={gravando ? stopRecognition : startRecognition}
              disabled={enviando || sttSuportado === false}
              aria-label={gravando ? "Parar gravação" : "Falar"}
              className={`w-12 h-12 rounded-pill grid place-items-center text-white transition-all disabled:opacity-50 ${
                gravando ? "" : "border border-border-hi text-muted hover:text-text"
              }`}
              style={
                gravando
                  ? {
                      background: "var(--liriun-grad-brand)",
                      boxShadow: "0 8px 22px rgba(91,141,239,0.35)",
                    }
                  : { background: "rgba(255,255,255,0.04)" }
              }
            >
              {gravando ? <RecordingWaveform size={18} /> : <MicIcon size={18} />}
            </button>
            <button
              type="submit"
              disabled={enviando || !input.trim()}
              aria-label="Enviar"
              className="w-12 h-12 rounded-pill grid place-items-center text-white disabled:opacity-30"
              style={{
                background: input.trim() ? "var(--liriun-grad-brand)" : "rgba(255,255,255,0.06)",
                boxShadow: input.trim()
                  ? "0 8px 22px rgba(91,141,239,0.35), inset 0 1px 0 rgba(255,255,255,0.22)"
                  : undefined,
              }}
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}

function ModoToggle({
  modo,
  setModo,
  sttSuportado,
}: {
  modo: Modo;
  setModo: (m: Modo) => void;
  sttSuportado: boolean | null;
}) {
  const opts: { id: Modo; label: string; disabled?: boolean }[] = [
    { id: "voz", label: "Voz", disabled: sttSuportado === false },
    { id: "texto", label: "Texto" },
  ];

  return (
    <div
      className="inline-flex p-[3px] rounded-pill border border-border-hi"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      {opts.map((o) => {
        const active = modo === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => !o.disabled && setModo(o.id)}
            disabled={o.disabled}
            className={`px-3 py-1.5 rounded-pill font-mono text-[11px] uppercase tracking-[1px] transition-colors ${
              active ? "text-white" : "text-muted hover:text-text disabled:text-dim"
            }`}
            style={
              active
                ? {
                    background: "var(--liriun-grad-brand)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 12px rgba(91,141,239,0.28)",
                  }
                : undefined
            }
            title={o.disabled ? "Reconhecimento de voz indisponível neste navegador" : undefined}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[78%] px-4 py-3 rounded-[20px_20px_4px_20px] text-base text-white"
        style={{
          background: "var(--liriun-grad-brand)",
          boxShadow: "0 8px 24px rgba(91,141,239,0.25), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function AgenteBubble({ text, pendente }: { text: string; pendente?: boolean }) {
  return (
    <div className="flex flex-col gap-2 max-w-[78%]">
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[1.2px] text-faint">
        <span
          className="w-4 h-4 rounded-pill grid place-items-center"
          style={{ background: "var(--liriun-grad-brand)" }}
        >
          <SparkleIcon size={10} />
        </span>
        Liriun
      </div>
      <div
        className="px-4 py-3 rounded-[20px_20px_20px_4px] text-base text-text leading-[1.45]"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--liriun-border)",
        }}
      >
        {pendente ? <Loader /> : text}
      </div>
    </div>
  );
}

function Loader() {
  return (
    <span className="inline-flex gap-1.5 items-center" aria-label="pensando">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-pill"
          style={{
            background: "var(--liriun-violet-400)",
            animation: `liriun-pulse 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes liriun-pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </span>
  );
}

function MicIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function RecordingWaveform({ size = 56 }: { size?: number }) {
  // 5-bar waveform Liriun glyph com animação de level meter
  // Bars (centro mais alto): 4 · 7 · 12 · 7 · 4 — reproduz o ícone da marca
  const bars = [
    { base: 4, peak: 12, delay: 0 },
    { base: 7, peak: 18, delay: 0.12 },
    { base: 12, peak: 22, delay: 0.06 },
    { base: 7, peak: 18, delay: 0.2 },
    { base: 4, peak: 12, delay: 0.32 },
  ];
  const id = `liriun-rec-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ display: "block" }}
    >
      <style>{`
        @keyframes ${id}-bar {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }
      `}</style>
      {bars.map((b, i) => {
        const w = 2;
        const x = 3 + i * 3.5;
        const cy = 12;
        return (
          <rect
            key={i}
            x={x}
            y={cy - b.peak / 2}
            width={w}
            height={b.peak}
            rx={1}
            fill="#fff"
            style={{
              transformOrigin: `${x + w / 2}px ${cy}px`,
              animation: `${id}-bar 0.85s ease-in-out ${b.delay}s infinite`,
            }}
          />
        );
      })}
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l14-7-7 14-2-5-5-2z" />
    </svg>
  );
}

function SparkleIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
