import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Prazo {
  id: string;
  nome: string;
  duracaoDias: number | null;
  criadoEm: string;
}

@Injectable({ providedIn: 'root' })
export class PrazosService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/prazos`;

  listar(): Observable<Prazo[]> {
    return this.http.get<Prazo[]>(this.api);
  }

  criar(nome: string, duracaoDias: number | null): Observable<Prazo> {
    return this.http.post<Prazo>(this.api, { nome, duracaoDias });
  }

  atualizar(id: string, nome: string, duracaoDias: number | null): Observable<Prazo> {
    return this.http.put<Prazo>(`${this.api}/${id}`, { nome, duracaoDias });
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
