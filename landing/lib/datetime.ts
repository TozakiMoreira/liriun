/**
 * Helpers de data/hora alinhados ao backend .NET (timezone America/Sao_Paulo).
 *
 * Backend persiste DataPrazo como `DateTime` (ISO) e HorarioFinal como `TimeSpan?` ("HH:mm:ss").
 */

export function hojeIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function paraDataLocal(iso: string): Date {
  // ISO date "YYYY-MM-DDTHH:mm:ss" — força local time pra evitar shift de fuso.
  const [datePart, timePart] = iso.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  if (!timePart) return new Date(y, m - 1, d);
  const [h, min, s] = timePart.split(":").map(Number);
  return new Date(y, m - 1, d, h, min ?? 0, s ?? 0);
}

export function formatarDataCurta(iso: string, locale = "pt-BR"): string {
  const d = paraDataLocal(iso);
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" }).format(d);
}

export function formatarHorario(timespan: string | null): string | null {
  if (!timespan) return null;
  // "14:00:00" → "14:00"
  return timespan.slice(0, 5);
}

export function ehMesmoDia(isoA: string, isoB: string): boolean {
  const a = paraDataLocal(isoA);
  const b = paraDataLocal(isoB);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isoLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function ehHoje(iso: string): boolean {
  return ehMesmoDia(iso, isoLocal(new Date()));
}

export function ehAmanha(iso: string): boolean {
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  return ehMesmoDia(iso, isoLocal(amanha));
}

export function ehAtrasada(iso: string, status: number, horario: string | null): boolean {
  if (status === 2) return false; // concluída
  const limite = paraDataLocal(iso);
  if (horario) {
    const [h, min] = horario.split(":").map(Number);
    limite.setHours(h, min, 0, 0);
  } else {
    limite.setHours(23, 59, 59, 999);
  }
  return new Date() > limite;
}

export function diasAteHoje(iso: string): number {
  const d = paraDataLocal(iso);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Descrição relativa do prazo: "Hoje", "Amanhã", "Em N dias", etc.
 * Cobre janela curta; pra prazos longos cai pra data curta ("10 de mai").
 */
export function descricaoRelativa(iso: string, locale = "pt-BR"): string {
  const diff = diasAteHoje(iso);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff === -1) return "Ontem";
  if (diff > 1 && diff <= 14) return `Em ${diff} dias`;
  if (diff < -1 && diff >= -14) return `Há ${Math.abs(diff)} dias`;
  if (diff > 14 && diff <= 60) {
    const semanas = Math.round(diff / 7);
    return `Em ${semanas} semana${semanas > 1 ? "s" : ""}`;
  }
  if (diff > 60) {
    const meses = Math.round(diff / 30);
    return `Em ${meses} ${meses > 1 ? "meses" : "mês"}`;
  }
  return formatarDataCurta(iso, locale);
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}
