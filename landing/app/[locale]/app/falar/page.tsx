"use client";

export const runtime = "edge";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { Modal } from "@/components/app/modal";
import { TarefaForm } from "@/components/app/tarefa-form";
import { useUsuarioAtual } from "@/components/auth/auth-provider";
import { agenteApi, type Mensagem, type SugestaoTarefa } from "@/lib/api/agente";
import {
  categoriasApi,
  tarefasApi,
  type Categoria,
  type CriarTarefaInput,
  type Prioridade,
  type Tarefa,
  type TarefaCategoria,
} from "@/lib/api/tarefas";

type ChatMessage = {
  id: string;
  papel: "usuario" | "liriun";
  conteudo: string;
  pendente?: boolean;
};

type Modo = "voz" | "texto";

const MAX_DURACAO_MS = 60_000; // 60s — igual V1, backend aceita até 8MB (~60s opus)

export default function FalarPage() {
  const usuario = useUsuarioAtual();
  const primeiroNome = usuario?.nome.split(" ")[0] ?? "";

  const [modo, setModo] = useState<Modo>("voz");
  const [mensagens, setMensagens] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [audioSuportado, setAudioSuportado] = useState<boolean | null>(null);
  const [sugestao, setSugestao] = useState<SugestaoTarefa | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editandoAberto, setEditandoAberto] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detecta suporte a MediaRecorder + getUserMedia
  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined";
    setAudioSuportado(ok);
  }, []);

  // Carrega categorias do usuário (pra mostrar nomes no card de sugestão)
  useEffect(() => {
    categoriasApi
      .listar()
      .then(setCategorias)
      .catch(() => {
        // silencia: card só não mostra nome de categoria
      });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [mensagens, sugestao]);

  async function enviar(textoUsuario: string) {
    const texto = textoUsuario.trim();
    if (!texto || enviando) return;

    const sugestaoAnterior = sugestao;

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
      setSugestao(res.tarefa);
      if (deveAutoSalvar(sugestaoAnterior, res.tarefa, texto)) {
        void salvarSugestao(res.tarefa);
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao falar com o agente");
      setMensagens((m) => m.filter((msg) => msg.id !== agenteMsg.id));
    } finally {
      setEnviando(false);
    }
  }

  async function enviarAudio(blob: Blob) {
    if (enviando) return;

    const sugestaoAnterior = sugestao;

    const userMsg: ChatMessage = {
      id: `${Date.now()}-u`,
      papel: "usuario",
      conteudo: "",
      pendente: true,
    };
    const agenteMsg: ChatMessage = {
      id: `${Date.now()}-a`,
      papel: "liriun",
      conteudo: "…",
      pendente: true,
    };

    setMensagens((m) => [...m, userMsg, agenteMsg]);
    setEnviando(true);
    setErro(null);

    try {
      const historico: Mensagem[] = mensagens.map((m) => ({
        papel: m.papel,
        texto: m.conteudo,
      }));
      const res = await agenteApi.conversarComAudio(blob, historico, "pt");
      const transcricao = (res.transcricaoUsuario ?? "").trim() || "(áudio sem transcrição)";
      setMensagens((m) =>
        m.map((msg) => {
          if (msg.id === userMsg.id) return { ...msg, conteudo: transcricao, pendente: false };
          if (msg.id === agenteMsg.id) return { ...msg, conteudo: res.mensagem, pendente: false };
          return msg;
        }),
      );
      setSugestao(res.tarefa);
      if (deveAutoSalvar(sugestaoAnterior, res.tarefa, transcricao)) {
        void salvarSugestao(res.tarefa);
      }
    } catch (err) {
      console.error("[audio] falha ao processar:", err);
      setErro(err instanceof Error ? err.message : "Falha ao processar áudio");
      // Mantém a bolha do usuário com indicador de erro e remove só a placeholder do agente.
      // Limpar as duas faria a tela voltar pro welcome (mensagens.length === 0) e esconde o feedback.
      setMensagens((m) =>
        m
          .filter((msg) => msg.id !== agenteMsg.id)
          .map((msg) =>
            msg.id === userMsg.id
              ? { ...msg, conteudo: "(áudio com erro)", pendente: false }
              : msg,
          ),
      );
    } finally {
      setEnviando(false);
    }
  }

  function aposSalvar() {
    const proxPrompt = primeiroNome
      ? `Anotado, ${primeiroNome}. Tem mais alguma pra eu registrar?`
      : "Anotado. Tem mais alguma pra eu registrar?";
    setSugestao(null);
    setMensagens([
      {
        id: `${Date.now()}-saved`,
        papel: "liriun",
        conteudo: proxPrompt,
      },
    ]);
  }

  async function handleEditarSubmit(input: CriarTarefaInput) {
    await tarefasApi.criar(input);
    setEditandoAberto(false);
    aposSalvar();
  }

  async function salvarSugestao(s: SugestaoTarefa | null) {
    if (!s || !s.dataPrazo || salvando) return;

    setSalvando(true);
    setErro(null);

    const payload: CriarTarefaInput = {
      nome: s.titulo,
      prioridade: ((s.prioridade ?? 3) as Prioridade),
      dataPrazo: s.dataPrazo,
      categoriaIds: s.categoriaIds,
      horarioFinal: s.horarioFinal ? `${s.horarioFinal}:00` : null,
      observacoes: s.observacoes,
    };

    try {
      await tarefasApi.criar(payload);
      aposSalvar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao salvar a tarefa");
    } finally {
      setSalvando(false);
    }
  }

  async function iniciarGravacao() {
    if (gravando || enviando || audioSuportado === false) return;
    setErro(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setErro(mensagemErroPermissao(e));
      return;
    }

    const mime = detectarMimeGravacao();
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      setErro("Não consegui iniciar a gravação no seu navegador.");
      return;
    }

    streamRef.current = stream;
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const tipo = recorder.mimeType || mime || "audio/webm";
      const chunks = chunksRef.current;
      chunksRef.current = [];
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      recorderRef.current = null;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setGravando(false);

      if (chunks.length > 0) {
        const blob = new Blob(chunks, { type: tipo });
        if (blob.size > 0) void enviarAudio(blob);
      }
    };

    setGravando(true);
    recorder.start();

    timeoutRef.current = setTimeout(() => {
      const r = recorderRef.current;
      if (r && r.state !== "inactive") {
        try {
          r.stop();
        } catch (e) {
          console.error("[audio] stop após timeout falhou:", e);
        }
      }
    }, MAX_DURACAO_MS);
  }

  function pararGravacao() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch (e) {
        console.error("[audio] erro ao parar:", e);
      }
    }
  }

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const r = recorderRef.current;
      if (r && r.state !== "inactive") {
        try {
          r.stop();
        } catch {
          // ignore
        }
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
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
                    onClick={gravando ? pararGravacao : iniciarGravacao}
                    disabled={enviando || audioSuportado === false}
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
                  {gravando
                    ? "Ouvindo… toque pra parar"
                    : enviando
                      ? "Transcrevendo…"
                      : "Toque pra falar"}
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
            setSugestao(null);
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
              <UserBubble key={m.id} text={m.conteudo} pendente={m.pendente} />
            ) : (
              <AgenteBubble key={m.id} text={m.conteudo} pendente={m.pendente} />
            ),
          )}
          {sugestao && (
            <SugestaoCard
              sugestao={sugestao}
              categorias={categorias}
              salvando={salvando}
              onSalvar={() => void salvarSugestao(sugestao)}
              onEditar={() => setEditandoAberto(true)}
            />
          )}
        </div>
      </section>

      <Modal
        open={editandoAberto}
        onClose={() => setEditandoAberto(false)}
        title="Editar tarefa"
        size="md"
      >
        {sugestao && (
          <TarefaForm
            tarefa={sugestaoToTarefa(sugestao, categorias)}
            onSubmit={handleEditarSubmit}
            onCancel={() => setEditandoAberto(false)}
          />
        )}
      </Modal>

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
              onClick={gravando ? pararGravacao : iniciarGravacao}
              disabled={enviando || audioSuportado === false}
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

function detectarMimeGravacao(): string {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") {
    return "";
  }
  // Ordem importa: webm/opus é o mais leve e universal em Chromium;
  // mp4 é o único aceito pelo Safari iOS; ogg é fallback Firefox.
  const candidatos = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  for (const c of candidatos) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return "";
}

function mensagemErroPermissao(e: unknown): string {
  const nome = (e as { name?: string } | null)?.name ?? "";
  if (nome === "NotAllowedError" || nome === "SecurityError") {
    return "Microfone bloqueado. Libera no cadeado ao lado da URL e tenta de novo.";
  }
  if (nome === "NotFoundError" || nome === "OverconstrainedError") {
    return "Não encontrei microfone no seu dispositivo.";
  }
  if (nome === "NotReadableError") {
    return "Microfone ocupado por outro app. Fecha e tenta de novo.";
  }
  return "Não consegui acessar o microfone.";
}

// Auto-save: dispara quando o usuário confirma uma sugestão que já estava na tela.
// Gating em `anterior` evita auto-save no primeiro turno (usuário precisa ter visto o card antes).
function deveAutoSalvar(
  anterior: SugestaoTarefa | null,
  nova: SugestaoTarefa | null,
  textoUsuario: string,
): boolean {
  if (!anterior) return false;
  if (!nova) return false;
  if (!nova.dataPrazo) return false;
  return ehConfirmacao(textoUsuario);
}

const CONFIRMACOES_CURTAS = new Set([
  "sim", "ok", "beleza", "pode", "isso", "isso mesmo", "fechou",
  "salva", "salvar", "salve", "pode salvar", "pode anotar",
  "anota", "anote", "anotar", "confirma", "confirmo", "confirmado",
  "manda", "manda ver", "tudo certo", "tudo ok", "exatamente",
  "pode anotar sim", "pode salvar sim",
]);

function ehConfirmacao(texto: string): boolean {
  if (!texto) return false;
  const norm = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[.!?,;]+$/g, "")
    .trim();
  if (norm.length === 0 || norm.length > 30) return false;
  if (CONFIRMACOES_CURTAS.has(norm)) return true;
  return /^(salv[ae]\b|pode salvar\b|pode anotar\b|confirma\b|anota\b|manda\b)/.test(norm);
}

const PRIORIDADE_LABEL: Record<number, string> = {
  1: "Urgente",
  2: "Importante",
  3: "Normal",
  4: "Baixa",
};

function rotuloPrioridade(p: number | null): string {
  if (p === null) return "Normal";
  return PRIORIDADE_LABEL[p] ?? "Normal";
}

function formatarData(iso: string | null): string {
  if (!iso) return "sem data";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(d);
  alvo.setHours(0, 0, 0, 0);
  const diff = Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
  if (diff === 0) return "hoje";
  if (diff === 1) return "amanhã";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

function categoriasNomes(ids: string[], categorias: Categoria[]): string[] {
  if (!ids?.length || !categorias.length) return [];
  const map = new Map(categorias.map((c) => [c.id, c.nome]));
  return ids.map((i) => map.get(i)).filter((n): n is string => !!n);
}

// Converte SugestaoTarefa (vinda do Gemini) num Tarefa-like pra prefilar o TarefaForm.
// O form usa initial state — quando dataPrazo é null, defaulta pra hoje (já que prazo é obrigatório no form).
function sugestaoToTarefa(s: SugestaoTarefa, categorias: Categoria[]): Tarefa {
  const cats: TarefaCategoria[] = s.categoriaIds
    .map((id) => categorias.find((c) => c.id === id))
    .filter((c): c is Categoria => !!c)
    .map((c) => ({ id: c.id, nome: c.nome }));
  const agora = new Date().toISOString();
  return {
    id: "",
    nome: s.titulo,
    prioridade: (s.prioridade ?? 3) as Prioridade,
    status: 1,
    dataPrazo: s.dataPrazo ?? agora,
    horarioFinal: s.horarioFinal ? `${s.horarioFinal}:00` : null,
    observacoes: s.observacoes,
    recorrencia: 0,
    recorrenciaQuantidade: 1,
    criadaEm: agora,
    concluidaEm: null,
    categorias: cats,
  };
}

function SugestaoCard({
  sugestao,
  categorias,
  salvando,
  onSalvar,
  onEditar,
}: {
  sugestao: SugestaoTarefa;
  categorias: Categoria[];
  salvando: boolean;
  onSalvar: () => void;
  onEditar: () => void;
}) {
  const nomes = categoriasNomes(sugestao.categoriaIds, categorias);
  const podeSalvar = !!sugestao.dataPrazo && !salvando;

  return (
    <div className="flex flex-col gap-2 max-w-[78%]">
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[1.2px] text-faint">
        <span
          className="w-4 h-4 rounded-pill grid place-items-center"
          style={{ background: "var(--liriun-grad-brand)" }}
        >
          <SparkleIcon size={10} />
        </span>
        Tarefa pronta
      </div>
      <div
        className="rounded-[20px_20px_20px_4px] overflow-hidden"
        style={{
          background: "rgba(156,123,255,0.08)",
          border: "1px solid rgba(156,123,255,0.40)",
          boxShadow: "0 8px 24px rgba(91,141,239,0.18)",
        }}
      >
        <div className="px-4 py-3 flex flex-col gap-2">
          <div className="text-base font-semibold leading-snug">{sugestao.titulo}</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-muted">
            <div>
              <span className="text-faint">Data: </span>
              <span className="text-text">{formatarData(sugestao.dataPrazo)}</span>
              {sugestao.horarioFinal && (
                <span className="ml-1 text-text">{sugestao.horarioFinal}</span>
              )}
            </div>
            <div>
              <span className="text-faint">Prioridade: </span>
              <span className="text-text">{rotuloPrioridade(sugestao.prioridade)}</span>
            </div>
          </div>
          {nomes.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {nomes.map((n) => (
                <span
                  key={n}
                  className="text-xs px-2 py-0.5 rounded-pill border border-border-hi text-muted"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  {n}
                </span>
              ))}
            </div>
          )}
          {sugestao.observacoes && (
            <div
              className="text-sm text-muted whitespace-pre-wrap pl-3 mt-1 leading-snug"
              style={{ borderLeft: "2px solid rgba(156,123,255,0.4)" }}
            >
              {sugestao.observacoes}
            </div>
          )}
        </div>
        <div
          className="px-4 py-2.5 flex justify-end items-center gap-2"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.18)",
          }}
        >
          <button
            type="button"
            onClick={onEditar}
            disabled={salvando}
            className="px-4 py-2 rounded-pill text-sm font-medium border border-border-hi text-muted hover:text-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            Editar
          </button>
          <button
            type="button"
            disabled={!podeSalvar}
            onClick={onSalvar}
            className="px-4 py-2 rounded-pill text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: podeSalvar ? "var(--liriun-grad-brand)" : "rgba(255,255,255,0.06)",
              boxShadow: podeSalvar
                ? "0 8px 22px rgba(91,141,239,0.35), inset 0 1px 0 rgba(255,255,255,0.22)"
                : undefined,
            }}
          >
            {salvando ? "Salvando…" : sugestao.dataPrazo ? "Salvar tarefa" : "Faltou data"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserBubble({ text, pendente }: { text: string; pendente?: boolean }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[78%] px-4 py-3 rounded-[20px_20px_4px_20px] text-base text-white"
        style={{
          background: "var(--liriun-grad-brand)",
          boxShadow: "0 8px 24px rgba(91,141,239,0.25), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        {pendente ? <Loader /> : text}
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
