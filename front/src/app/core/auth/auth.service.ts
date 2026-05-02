import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorage } from './token.storage';

export interface AutenticacaoResposta {
  usuarioId: string;
  nome: string;
  email: string;
  fotoUrl: string | null;
  token: string;
  expiraEm: string;
}

export interface PerfilResposta {
  id: string;
  nome: string;
  email: string;
  fotoUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(TokenStorage);
  private readonly api = `${environment.apiUrl}/auth`;

  login(email: string, senha: string): Observable<AutenticacaoResposta> {
    return this.http
      .post<AutenticacaoResposta>(`${this.api}/login`, { email, senha })
      .pipe(tap((res) => this.persistir(res)));
  }

  cadastrar(nome: string, email: string, senha: string): Observable<AutenticacaoResposta> {
    return this.http
      .post<AutenticacaoResposta>(`${this.api}/cadastro`, { nome, email, senha })
      .pipe(tap((res) => this.persistir(res)));
  }

  alterarSenha(senhaAtual: string, novaSenha: string): Observable<void> {
    return this.http.post<void>(`${this.api}/alterar-senha`, { senhaAtual, novaSenha });
  }

  atualizarPerfil(nome: string, email: string): Observable<PerfilResposta> {
    return this.http
      .put<PerfilResposta>(`${this.api}/perfil`, { nome, email })
      .pipe(
        tap((p) =>
          this.storage.atualizarUsuario({ nome: p.nome, email: p.email, fotoUrl: p.fotoUrl }),
        ),
      );
  }

  atualizarFotoPerfil(fotoUrl: string | null): Observable<PerfilResposta> {
    return this.http
      .put<PerfilResposta>(`${this.api}/perfil/foto`, { fotoUrl })
      .pipe(tap((p) => this.storage.atualizarUsuario({ fotoUrl: p.fotoUrl })));
  }

  logout(): void {
    this.storage.clear();
  }

  private persistir(res: AutenticacaoResposta): void {
    this.storage.set(res.token, {
      id: res.usuarioId,
      email: res.email,
      nome: res.nome,
      fotoUrl: res.fotoUrl,
    });
  }
}
