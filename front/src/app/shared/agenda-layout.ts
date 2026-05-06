export interface ItemAgenda {
  id: string;
  top: number;
  alturaPx: number;
}

export interface ItemAgendaPosicionado<T extends ItemAgenda> {
  item: T;
  col: number;
  totalCols: number;
}

/**
 * Distribui itens em colunas pra evitar sobreposição visual.
 * Itens que se sobrepõem em tempo ficam lado a lado.
 * Algoritmo greedy estilo Google Calendar.
 */
export function calcularLayoutAgenda<T extends ItemAgenda>(
  items: T[],
): ItemAgendaPosicionado<T>[] {
  if (items.length === 0) return [];

  const ordenados = [...items].sort((a, b) => {
    if (a.top !== b.top) return a.top - b.top;
    return b.alturaPx - a.alturaPx;
  });

  const clusters: T[][] = [];
  let cluster: T[] = [];
  let clusterEnd = -Infinity;

  for (const it of ordenados) {
    const start = it.top;
    const end = it.top + it.alturaPx;
    if (start >= clusterEnd) {
      if (cluster.length) clusters.push(cluster);
      cluster = [it];
      clusterEnd = end;
    } else {
      cluster.push(it);
      clusterEnd = Math.max(clusterEnd, end);
    }
  }
  if (cluster.length) clusters.push(cluster);

  const resultado: ItemAgendaPosicionado<T>[] = [];

  for (const grp of clusters) {
    const colunas: T[][] = [];
    const colDe = new Map<string, number>();
    for (const it of grp) {
      let colocado = false;
      for (let i = 0; i < colunas.length; i++) {
        const last = colunas[i][colunas[i].length - 1];
        if (last.top + last.alturaPx <= it.top) {
          colunas[i].push(it);
          colDe.set(it.id, i);
          colocado = true;
          break;
        }
      }
      if (!colocado) {
        colunas.push([it]);
        colDe.set(it.id, colunas.length - 1);
      }
    }
    const totalCols = colunas.length;
    for (const it of grp) {
      resultado.push({ item: it, col: colDe.get(it.id) ?? 0, totalCols });
    }
  }

  return resultado;
}
