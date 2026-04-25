import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Categoria {
  id: string;
  nome: string;
  criadaEm: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/categorias`;

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.api);
  }

  criar(nome: string): Observable<Categoria> {
    return this.http.post<Categoria>(this.api, { nome });
  }

  atualizar(id: string, nome: string): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.api}/${id}`, { nome });
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
