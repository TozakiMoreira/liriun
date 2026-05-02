import { Injectable, signal } from '@angular/core';

const KEY = 'jarvis.token';
const USER_KEY = 'jarvis.user';

export interface UsuarioLocal {
  id: string;
  email: string;
  nome: string;
  fotoUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class TokenStorage {
  private readonly _token = signal<string | null>(this.read());
  private readonly _usuario = signal<UsuarioLocal | null>(this.readUser());

  readonly token = this._token.asReadonly();
  readonly usuario = this._usuario.asReadonly();

  set(token: string, usuario: UsuarioLocal): void {
    localStorage.setItem(KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    this._token.set(token);
    this._usuario.set(usuario);
  }

  atualizarUsuario(parcial: Partial<UsuarioLocal>): void {
    const atual = this._usuario();
    if (!atual) return;
    const novo: UsuarioLocal = { ...atual, ...parcial };
    localStorage.setItem(USER_KEY, JSON.stringify(novo));
    this._usuario.set(novo);
  }

  clear(): void {
    localStorage.removeItem(KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._usuario.set(null);
  }

  estaAutenticado(): boolean {
    return !!this._token();
  }

  private read(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
  }

  private readUser(): UsuarioLocal | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
