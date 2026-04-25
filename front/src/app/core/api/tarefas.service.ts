import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Prioridade = 1 | 2 | 3 | 4;
export type StatusTarefa = 1 | 2 | 3;

export interface TarefaCategoriaRef {
  id: string;
  nome: string;
}

export interface Tarefa {
  id: string;
  nome: string;
  prioridade: Prioridade;
  status: StatusTarefa;
  prazoId: string | null;
  dataPrazo: string | null;
  horarioFinal: string;
  criadaEm: string;
  concluidaEm: string | null;
  categorias: TarefaCategoriaRef[];
}

export interface CriarTarefaPayload {
  nome: string;
  prioridade: Prioridade;
  categoriaIds?: string[];
  prazoId?: string | null;
  dataPrazoCustom?: string | null;
  horarioFinal?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TarefasService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/tarefas`;

  listarPendentes(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(`${this.api}/pendentes`);
  }

  listarConcluidas(de?: string, ate?: string): Observable<Tarefa[]> {
    let params = new HttpParams();
    if (de) params = params.set('de', de);
    if (ate) params = params.set('ate', ate);
    return this.http.get<Tarefa[]>(`${this.api}/concluidas`, { params });
  }

  criar(payload: CriarTarefaPayload): Observable<Tarefa> {
    return this.http.post<Tarefa>(this.api, payload);
  }

  atualizar(id: string, payload: CriarTarefaPayload): Observable<Tarefa> {
    return this.http.put<Tarefa>(`${this.api}/${id}`, payload);
  }

  concluir(id: string): Observable<Tarefa> {
    return this.http.post<Tarefa>(`${this.api}/${id}/concluir`, {});
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
