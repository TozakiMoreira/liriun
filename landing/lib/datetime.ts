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

export function ehHoje(iso: string): boolean {
  return ehMesmoDia(iso, new Date().toISOString());
}

export function ehAmanha(iso: string): boolean {
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  return ehMesmoDia(iso, amanha.toISOString());
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

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}
