const MS_DIA = 24 * 60 * 60 * 1000;

/**
 * Formata uma data ISO em string relativa amigável:
 * "Hoje 23:59", "Amanhã 14:00", "em 4 dias", "Ontem 18:00".
 */
export function formatarPrazo(
  dataIso: string | null,
  horarioIso: string | null,
  agora: Date = new Date(),
): string {
  if (!dataIso) return "Sem prazo";

  const data = new Date(dataIso);
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const alvo = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const diff = Math.round((alvo.getTime() - hoje.getTime()) / MS_DIA);

  const horaTxt = horarioIso ? formatarHora(horarioIso) : "";

  if (diff === 0) return horaTxt ? `Hoje ${horaTxt}` : "Hoje";
  if (diff === 1) return horaTxt ? `Amanhã ${horaTxt}` : "Amanhã";
  if (diff === -1) return horaTxt ? `Ontem ${horaTxt}` : "Ontem";
  if (diff > 1 && diff <= 7) return `em ${diff} dias`;
  if (diff < -1 && diff >= -7) return `${Math.abs(diff)} dias atrás`;

  const dd = String(alvo.getDate()).padStart(2, "0");
  const mm = String(alvo.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

export function formatarHora(horarioIso: string): string {
  // backend envia "HH:mm:ss" (TimeSpan)
  const [h, m] = horarioIso.split(":");
  if (!h || !m) return horarioIso;
  return `${h}:${m}`;
}

export function formatarDuracaoDias(d: number | null): string {
  if (d === null) return "sem data limite";
  if (d === 0) return "até 23:59 de hoje";
  if (d === 1) return "1 dia";
  return `${d} dias`;
}

export function formatarData(dataIso: string): string {
  const d = new Date(dataIso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
