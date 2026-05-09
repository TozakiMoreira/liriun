export type RequisitosSenha = {
  tamanho: boolean;
  maiuscula: boolean;
  especial: boolean;
};

export function avaliarSenha(senha: string): RequisitosSenha {
  return {
    tamanho: senha.length >= 8,
    maiuscula: /[A-Z]/.test(senha),
    especial: /[^A-Za-z0-9]/.test(senha),
  };
}

export function senhaAtendeRequisitos(senha: string): boolean {
  const r = avaliarSenha(senha);
  return r.tamanho && r.maiuscula && r.especial;
}
