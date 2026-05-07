import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type TipoLancamento = 1 | 2; // 1 = Receita, 2 = Despesa
export type StatusLancamento = 1 | 2; // 1 = Pendente, 2 = Pago
export type TipoRecorrenciaLanc = 0 | 1 | 2;

// Categoria: < 100 = receita, >= 100 = despesa
export type CategoriaLancamento =
  | 1 | 2 | 3 | 9         // Receitas: Salario, Freelance, Investimento, OutrosGanhos
  | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107 | 199; // Despesas

export interface Lancamento {
  id: string;
  tipo: TipoLancamento;
  descricao: string;
  valor: number;
  dataReferencia: string;
  categoria: CategoriaLancamento;
  status: StatusLancamento;
  recorrencia: TipoRecorrenciaLanc;
  temAnexo: boolean;
  observacoes: string | null;
  criadoEm: string;
  pagoEm: string | null;
}

export interface LancamentoPayload {
  tipo: TipoLancamento;
  descricao: string;
  valor: number;
  dataReferencia: string;
  categoria: CategoriaLancamento;
  recorrencia?: TipoRecorrenciaLanc;
  anexoBoleto?: string | null;
  observacoes?: string | null;
}

export interface LancamentoUpdatePayload {
  descricao: string;
  valor: number;
  dataReferencia: string;
  categoria: CategoriaLancamento;
  recorrencia?: TipoRecorrenciaLanc;
  anexoBoleto?: string | null;
  observacoes?: string | null;
  dataPagamento?: string | null;
}

export interface BalancoCategoria {
  categoria: CategoriaLancamento;
  tipo: TipoLancamento;
  total: number;
}

export interface BalancoMes {
  mes: number;
  receitas: number;
  despesas: number;
}

export interface Balanco {
  ano: number;
  mes: number | null;
  totalReceitas: number;
  totalDespesasPagas: number;
  totalDespesasPendentes: number;
  saldo: number;
  porCategoria: BalancoCategoria[];
  porMes: BalancoMes[];
}

@Injectable({ providedIn: 'root' })
export class FinancasService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/financas`;

  listar(ano?: number, mes?: number): Observable<Lancamento[]> {
    let params = new HttpParams();
    if (ano !== undefined) params = params.set('ano', String(ano));
    if (mes !== undefined) params = params.set('mes', String(mes));
    return this.http.get<Lancamento[]>(`${this.api}/lancamentos`, { params });
  }

  criar(payload: LancamentoPayload): Observable<Lancamento> {
    return this.http.post<Lancamento>(`${this.api}/lancamentos`, payload);
  }

  atualizar(id: string, payload: LancamentoUpdatePayload): Observable<Lancamento> {
    return this.http.put<Lancamento>(`${this.api}/lancamentos/${id}`, payload);
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/lancamentos/${id}`);
  }

  marcarPago(id: string): Observable<Lancamento> {
    return this.http.post<Lancamento>(`${this.api}/lancamentos/${id}/pagar`, {});
  }

  desfazerPagamento(id: string): Observable<Lancamento> {
    return this.http.post<Lancamento>(`${this.api}/lancamentos/${id}/desfazer-pagamento`, {});
  }

  obterBalanco(ano?: number, mes?: number): Observable<Balanco> {
    let params = new HttpParams();
    if (ano !== undefined) params = params.set('ano', String(ano));
    if (mes !== undefined) params = params.set('mes', String(mes));
    return this.http.get<Balanco>(`${this.api}/balanco`, { params });
  }

  obterAnexo(id: string): Observable<{ anexo: string }> {
    return this.http.get<{ anexo: string }>(`${this.api}/lancamentos/${id}/anexo`);
  }
}

export const ROTULOS_CATEGORIA: Record<CategoriaLancamento, string> = {
  1: 'Salário',
  2: 'Freelance',
  3: 'Investimento',
  9: 'Outros ganhos',
  100: 'Moradia',
  101: 'Alimentação',
  102: 'Transporte',
  103: 'Saúde',
  104: 'Educação',
  105: 'Lazer',
  106: 'Serviços',
  107: 'Compras',
  199: 'Outras despesas',
};

export const ICONES_CATEGORIA: Record<CategoriaLancamento, string> = {
  1: 'fa-briefcase',
  2: 'fa-laptop-code',
  3: 'fa-chart-line',
  9: 'fa-coins',
  100: 'fa-house',
  101: 'fa-utensils',
  102: 'fa-car',
  103: 'fa-heart-pulse',
  104: 'fa-graduation-cap',
  105: 'fa-mug-hot',
  106: 'fa-plug',
  107: 'fa-bag-shopping',
  199: 'fa-receipt',
};

export const CATEGORIAS_RECEITA: CategoriaLancamento[] = [1, 2, 3, 9];
export const CATEGORIAS_DESPESA: CategoriaLancamento[] = [100, 101, 102, 103, 104, 105, 106, 107, 199];
