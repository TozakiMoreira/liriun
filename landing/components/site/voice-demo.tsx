"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const G = {
  text: "rgba(244,246,252,0.96)",
  muted: "rgba(244,246,252,0.62)",
  faint: "rgba(244,246,252,0.38)",
  border: "rgba(255,255,255,0.07)",
  borderHi: "rgba(255,255,255,0.12)",
  violet300: "#B79CFF",
  grad: "linear-gradient(135deg, #9C7BFF 0%, #5B8DEF 100%)",
};

type State = "idle" | "listening" | "processing" | "result";

type Extracted = {
  title: string;
  date: string;
  time?: string;
  priority: string;
  category: string;
};

// Heurísticas simples PT-BR pra mock extraction.
function mockExtract(text: string): Extracted {
  const t = text.toLowerCase();

  // Title: pega primeiras 5 palavras significativas ou frase ate "amanha"/"hoje"
  const title = extractTitle(text);

  // Date
  let date = "Hoje";
  if (t.includes("amanhã") || t.includes("amanha")) date = "Amanhã";
  else if (t.includes("sexta")) date = "Sexta";
  else if (t.includes("sábado") || t.includes("sabado")) date = "Sábado";
  else if (t.includes("domingo")) date = "Domingo";
  else if (t.includes("segunda")) date = "Segunda";
  else if (t.includes("terça") || t.includes("terca")) date = "Terça";
  else if (t.includes("quarta")) date = "Quarta";
  else if (t.includes("quinta")) date = "Quinta";
  else if (t.match(/semana que vem/)) date = "Próx. semana";

  // Time
  const timeMatch = t.match(/(\d{1,2})\s*(?:h|:)?\s*(\d{2})?/);
  const time = timeMatch ? `${timeMatch[1].padStart(2, "0")}:${timeMatch[2] ?? "00"}` : undefined;

  // Priority
  let priority = "Normal";
  if (t.match(/urgente|asap|agora|emergencia/)) priority = "Urgente";
  else if (t.match(/importante|prioridade alta|alta/)) priority = "Importante";
  else if (t.match(/sem pressa|quando der|baixa/)) priority = "Baixa";

  // Category
  let category = "Pessoal";
  if (t.match(/reuni[aã]o|cliente|trabalho|projeto|call|meet/)) category = "Trabalho";
  else if (t.match(/comprar|mercado|farmácia|farmacia|supermercado/)) category = "Compras";
  else if (t.match(/dentista|médico|medico|consulta|exame/)) category = "Saúde";
  else if (t.match(/casa|limpar|lavar|cozinhar/)) category = "Casa";

  return { title, date, time, priority, category };
}

function extractTitle(text: string): string {
  const stop = /\b(amanh[aã]|hoje|sexta|s[aá]bado|domingo|segunda|ter[cç]a|quarta|quinta|prioridade|urgente|importante|s[ãa]o|às?)\b/i;
  const idx = text.search(stop);
  let raw = idx > 0 ? text.slice(0, idx).trim() : text;
  raw = raw.replace(/^(lembre.me de|me lembra de|preciso|tenho que|vou|quero)/i, "").trim();
  raw = raw.replace(/[.,!?]+$/, "").trim();
  const words = raw.split(/\s+/).filter(Boolean).slice(0, 6).join(" ");
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "Tarefa nova";
}

const SCRIPTED_TRANSCRIPT = "Reunião com o cliente amanhã às 14h, prioridade alta";

export function VoiceDemo() {
  const [state, setState] = useState<State>("idle");
  const [transcript, setTranscript] = useState("");
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const recogRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    setSupported(SR !== undefined);
  }, []);

  function reset() {
    setState("idle");
    setTranscript("");
    setExtracted(null);
  }

  async function start() {
    if (state !== "idle") return;
    setTranscript("");
    setExtracted(null);

    const SR =
      typeof window !== "undefined"
        ? ((window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
            (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition)
        : undefined;

    if (!SR) {
      // Fallback scripted: simula typing do transcript + extração
      setState("listening");
      const target = SCRIPTED_TRANSCRIPT;
      for (let i = 1; i <= target.length; i++) {
        await new Promise((r) => setTimeout(r, 32));
        setTranscript(target.slice(0, i));
      }
      await new Promise((r) => setTimeout(r, 400));
      setState("processing");
      await new Promise((r) => setTimeout(r, 1100));
      setExtracted(mockExtract(target));
      setState("result");
      return;
    }

    setState("listening");
    const recog = new SR();
    recog.lang = "pt-BR";
    recog.continuous = false;
    recog.interimResults = true;
    let finalText = "";
    recog.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setTranscript(finalText + interim);
    };
    recog.onend = async () => {
      if (!finalText.trim()) {
        reset();
        return;
      }
      setState("processing");
      await new Promise((r) => setTimeout(r, 1100));
      setExtracted(mockExtract(finalText));
      setState("result");
    };
    recog.onerror = () => reset();
    recogRef.current = recog;
    recog.start();
  }

  return (
    <section className="py-20 md:py-28 px-6 md:px-14 max-w-[1280px] mx-auto">
      <div className="text-center mb-10 md:mb-14">
        <div
          className="font-mono text-xs uppercase tracking-[1.4px] mb-3"
          style={{ color: G.violet300 }}
        >
          EXPERIMENTE
        </div>
        <h2
          className="text-[36px] md:text-[52px] font-semibold tracking-[-0.8px] md:tracking-[-1.4px] leading-[1.1]"
          style={{ color: G.text }}
        >
          Fala como você pensa.
        </h2>
        <p
          className="text-base md:text-[17px] mt-4 max-w-[480px] mx-auto leading-[1.5]"
          style={{ color: G.muted }}
        >
          Tente: <em>&ldquo;Reunião com o cliente amanhã às 14h, prioridade alta&rdquo;</em>
        </p>
      </div>

      <div
        className="relative max-w-[640px] mx-auto rounded-[28px] p-8 md:p-12 overflow-hidden min-h-[360px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(28,30,38,0.96) 0%, rgba(18,20,26,0.96) 100%)",
          border: `1px solid ${G.borderHi}`,
          boxShadow: "0 32px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Hairline brand topo */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(156,123,255,0.55) 30%, rgba(91,141,239,0.55) 70%, transparent 100%)",
          }}
        />
        {/* Glow radial centro */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 40%, rgba(156,123,255,0.12), transparent 70%)",
          }}
        />

        <div className="relative">
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <IdleView key="idle" onStart={start} supported={supported} />
            )}
            {state === "listening" && <ListeningView key="listening" transcript={transcript} />}
            {state === "processing" && <ProcessingView key="processing" />}
            {state === "result" && extracted && (
              <ResultView key="result" data={extracted} transcript={transcript} onReset={reset} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ─── States ─────────────────────────────────────────────────

function IdleView({ onStart, supported }: { onStart: () => void; supported: boolean | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32 }}
      className="flex flex-col items-center"
    >
      <button
        type="button"
        onClick={onStart}
        aria-label="Começar gravação"
        className="relative w-20 h-20 rounded-full grid place-items-center transition-transform active:scale-95"
        style={{
          background: G.grad,
          boxShadow:
            "0 14px 36px rgba(91,141,239,0.45), inset 0 1px 0 rgba(255,255,255,0.30), 0 0 0 5px rgba(255,255,255,0.04)",
        }}
      >
        {/* Pulse rings */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: "rgba(156,123,255,0.25)",
            transform: "scale(1.4)",
            filter: "blur(8px)",
          }}
        />
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative"
        >
          <rect x="9" y="3" width="6" height="12" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <path d="M12 18v3" />
        </svg>
      </button>
      <div
        className="font-mono text-[11px] uppercase tracking-[1.8px] mt-5"
        style={{ color: G.faint }}
      >
        {supported === false ? "Demo simulada" : "Aperte e fale"}
      </div>
      {supported === false && (
        <div className="text-xs mt-2" style={{ color: G.faint }}>
          (seu navegador não tem Web Speech API — vamos rodar uma frase de exemplo)
        </div>
      )}
    </motion.div>
  );
}

function ListeningView({ transcript }: { transcript: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32 }}
      className="flex flex-col items-center"
    >
      <div className="relative w-20 h-20 rounded-full grid place-items-center">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ background: G.grad, animation: "liriun-pulse-glow 1.4s ease-in-out infinite" }}
        />
        <span
          aria-hidden
          className="absolute inset-2 rounded-full"
          style={{ background: G.grad }}
        />
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative"
        >
          <rect x="9" y="3" width="6" height="12" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <path d="M12 18v3" />
        </svg>
      </div>
      <div
        className="font-mono text-[11px] uppercase tracking-[1.8px] mt-5"
        style={{ color: G.violet300 }}
      >
        Ouvindo
      </div>
      <div
        className="mt-4 text-center min-h-[2.5em] text-base md:text-lg leading-snug max-w-[480px]"
        style={{ color: G.text }}
      >
        {transcript || <span style={{ color: G.faint }}>&hellip;</span>}
      </div>
    </motion.div>
  );
}

function ProcessingView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32 }}
      className="flex flex-col items-center"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 50 50"
        style={{ animation: "liriun-spin 0.9s linear infinite" }}
      >
        <defs>
          <linearGradient id="vd-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9C7BFF" />
            <stop offset="100%" stopColor="#5B8DEF" />
          </linearGradient>
        </defs>
        <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="url(#vd-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="40 86"
        />
      </svg>
      <div
        className="font-mono text-[11px] uppercase tracking-[1.8px] mt-5"
        style={{ color: G.violet300 }}
      >
        Entendendo
      </div>
    </motion.div>
  );
}

function ResultView({
  data,
  transcript,
  onReset,
}: {
  data: Extracted;
  transcript: string;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32 }}
      className="flex flex-col"
    >
      {transcript && (
        <div className="mb-5">
          <div
            className="font-mono text-[9px] uppercase tracking-[1.6px] mb-1.5"
            style={{ color: G.faint }}
          >
            Você disse
          </div>
          <div className="text-sm" style={{ color: G.muted }}>
            &ldquo;{transcript}&rdquo;
          </div>
        </div>
      )}

      <div
        className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, rgba(156,123,255,0.10), rgba(91,141,239,0.06))",
          border: "1px solid rgba(156,123,255,0.30)",
        }}
      >
        <div
          className="font-mono text-[9px] uppercase tracking-[1.6px] mb-2"
          style={{ color: G.violet300 }}
        >
          Liriun extraiu
        </div>
        <div className="text-[20px] font-semibold tracking-[-0.3px]" style={{ color: G.text }}>
          {data.title}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 mt-4">
          <Field label="Quando" value={data.date + (data.time ? ` · ${data.time}` : "")} />
          <Field label="Prioridade" value={data.priority} />
          <Field label="Categoria" value={data.category} />
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="self-center mt-6 px-5 py-2 rounded-full text-sm font-medium transition-colors hover:bg-white/[0.06]"
        style={{
          color: G.muted,
          border: `1px solid ${G.borderHi}`,
          background: "rgba(255,255,255,0.04)",
        }}
      >
        Tentar de novo
      </button>
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="font-mono text-[9px] uppercase tracking-[1.4px] mb-1"
        style={{ color: G.faint }}
      >
        {label}
      </div>
      <div className="text-sm font-medium" style={{ color: G.text }}>
        {value}
      </div>
    </div>
  );
}
