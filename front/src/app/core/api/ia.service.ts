import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Prioridade } from './tarefas.service';

export type PapelMensagem = 'usuario' | 'jarvis';

export interface MensagemConversa {
  papel: PapelMensagem;
  texto: string;
}

export interface SugestaoTarefa {
  titulo: string;
  categoriaIds: string[];
  dataPrazo: string | null;
  horarioFinal: string | null;
  prioridade: Prioridade | null;
  observacoes: string | null;
}

export interface RespostaConversa {
  mensagem: string;
  tarefa: SugestaoTarefa | null;
  completo: boolean;
}

@Injectable({ providedIn: 'root' })
export class IaService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/captura`;

  conversar(mensagens: MensagemConversa[]): Observable<RespostaConversa> {
    return this.http.post<RespostaConversa>(`${this.api}/conversar`, { mensagens });
  }
}
