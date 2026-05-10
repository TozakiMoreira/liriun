import { api } from "./client";

export type PapelMensagem = "usuario" | "liriun";

export type Mensagem = {
  papel: PapelMensagem;
  texto: string;
};

export type ConversarInput = {
  mensagens: Mensagem[];
  idioma?: "pt" | "en";
};

export type SugestaoTarefa = {
  titulo: string;
  categoriaIds: string[];
  dataPrazo: string | null;
  horarioFinal: string | null;
  prioridade: number | null;
  observacoes: string | null;
};

export type ConversaResponse = {
  mensagem: string;
  tarefa: SugestaoTarefa | null;
  completo: boolean;
  transcricaoUsuario?: string | null;
};

export const agenteApi = {
  conversar: (input: ConversarInput) =>
    api<ConversaResponse>("/captura/conversar", { method: "POST", body: input }),

  conversarComAudio: (audio: Blob, historico: Mensagem[], idioma: "pt" | "en" = "pt") => {
    const ext = audio.type.includes("mp4")
      ? "m4a"
      : audio.type.includes("ogg")
        ? "ogg"
        : "webm";
    const form = new FormData();
    form.append("audio", audio, `mensagem.${ext}`);
    form.append("historico", JSON.stringify(historico));
    form.append("idioma", idioma);
    return api<ConversaResponse>("/captura/conversar-audio", {
      method: "POST",
      body: form,
    });
  },
};
