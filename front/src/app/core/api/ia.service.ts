import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LocaleService } from '../locale/locale.service';
import { Prioridade } from './tarefas.service';

export type PapelMensagem = 'usuario' | 'liriun';

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
  /** Preenchido apenas quando o turno foi de audio: o que o Gemini transcreveu. */
  transcricaoUsuario: string | null;
}

@Injectable({ providedIn: 'root' })
export class IaService {
  private readonly http = inject(HttpClient);
  private readonly locale = inject(LocaleService);
  private readonly api = `${environment.apiUrl}/captura`;

  conversar(mensagens: MensagemConversa[]): Observable<RespostaConversa> {
    return this.http.post<RespostaConversa>(`${this.api}/conversar`, {
      mensagens,
      idioma: this.locale.locale(),
    });
  }

  conversarComAudio(audio: Blob, historico: MensagemConversa[]): Observable<RespostaConversa> {
    const form = new FormData();
    const ext = audio.type.includes('mp4') ? 'm4a' : audio.type.includes('ogg') ? 'ogg' : 'webm';
    form.append('audio', audio, `mensagem.${ext}`);
    form.append('historico', JSON.stringify(historico));
    form.append('idioma', this.locale.locale());
    return this.http.post<RespostaConversa>(`${this.api}/conversar-audio`, form);
  }
}
