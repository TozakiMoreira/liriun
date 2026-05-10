/**
 * Detecta URLs em texto plano e devolve segmentos pra renderizar como
 * texto + <a>. Não usa innerHTML — caller renderiza com confiança.
 *
 * Pattern conservador: http(s)://, sem espaço.
 */
const URL_REGEX = /(https?:\/\/[^\s<>"']+)/g;

export interface SegmentoTexto {
  tipo: 'texto' | 'link';
  conteudo: string;
}

export function quebrarTextoEmSegmentos(texto: string | null | undefined): SegmentoTexto[] {
  if (!texto) return [];
  const segmentos: SegmentoTexto[] = [];
  let ultimoIndex = 0;
  let match: RegExpExecArray | null;

  URL_REGEX.lastIndex = 0;
  while ((match = URL_REGEX.exec(texto)) !== null) {
    if (match.index > ultimoIndex) {
      segmentos.push({ tipo: 'texto', conteudo: texto.substring(ultimoIndex, match.index) });
    }
    segmentos.push({ tipo: 'link', conteudo: match[0] });
    ultimoIndex = match.index + match[0].length;
  }

  if (ultimoIndex < texto.length) {
    segmentos.push({ tipo: 'texto', conteudo: texto.substring(ultimoIndex) });
  }

  return segmentos;
}
